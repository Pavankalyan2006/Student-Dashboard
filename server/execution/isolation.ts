// server/execution/isolation.ts
// Decides how student code is isolated from the backend host, and builds the wrapper command.
//
// Levels:
//  - 'namespace': Linux `unshare` gives the program its own network namespace (no network at all),
//    PID namespace (cannot see or signal host processes; the whole tree dies with it), and mount
//    namespace in which /tmp, the application directory and home directories are replaced by empty
//    tmpfs mounts, so source code, .env files, snapshots and other students' runs are not visible.
//    When the server runs as real root the program is also dropped to uid/gid 65534 (nobody) with no
//    capabilities. Resource limits are applied with `ulimit` inside the namespace.
//  - 'rlimit-only': POSIX host without usable namespaces. Only ulimit resource limits and a stripped
//    environment apply; the program can still read host files and reach the network.
//  - 'none': no wrapper available (for example Windows).
//
// In production (NODE_ENV=production) code only runs at 'namespace' level unless the operator sets
// CODE_SANDBOX_ALLOW_UNISOLATED=true. In development the weaker level is allowed and is reported to
// the student with every result, so nobody mistakes it for a secure sandbox.

import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type IsolationLevel = 'namespace' | 'rlimit-only' | 'none';

export interface IsolationInfo {
  level: IsolationLevel;
  dropToNobody: boolean;
  /** Free directory used as a temporary bind point while /tmp is replaced. */
  bindPoint: string | null;
  allowed: boolean;
  reason: string;
}

export const SANDBOX_NOBODY_UID = 65534;

let cached: IsolationInfo | null = null;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function unisolatedAllowed(): boolean {
  if (process.env.CODE_SANDBOX_ALLOW_UNISOLATED === 'true') return true;
  if (process.env.CODE_SANDBOX_ALLOW_UNISOLATED === 'false') return false;
  return !isProduction();
}

/** Directories hidden from student programs (replaced by empty tmpfs mounts). */
export function hiddenPaths(): string[] {
  const candidates = [
    process.cwd(),
    os.homedir(),
    '/root',
    '/home',
    '/srv',
    '/var/lib',
    ...(process.env.CODE_SANDBOX_HIDE_PATHS || '').split(':'),
  ];
  const out: string[] = [];
  const tmp = path.resolve(os.tmpdir());
  for (const c of candidates) {
    if (!c) continue;
    const p = path.resolve(c);
    if (p === '/' || p === tmp || tmp.startsWith(p + path.sep)) continue; // never hide / or the dir holding the workdir
    try {
      if (!fs.statSync(p).isDirectory()) continue;
    } catch {
      continue;
    }
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

const isRoot = () => typeof process.getuid === 'function' && process.getuid() === 0;

function unshareArgs(dropToNobody: boolean): string[] {
  // Real root can create namespaces directly; everyone else needs a user namespace (-r).
  const base = ['-n', '-p', '-f', '-m', '--kill-child', '--mount-proc'];
  return dropToNobody ? base : ['-r', ...base];
}

export function detectIsolation(force = false): IsolationInfo {
  if (cached && !force) return cached;

  if (process.env.CODE_SANDBOX_ISOLATION === 'none') {
    cached = { level: 'none', dropToNobody: false, bindPoint: null, allowed: unisolatedAllowed(), reason: 'Isolation disabled by CODE_SANDBOX_ISOLATION=none.' };
    return cached;
  }

  if (process.platform === 'linux') {
    const bindPoint = ['/mnt', '/media', '/opt'].find((d) => {
      try {
        return fs.statSync(d).isDirectory();
      } catch {
        return false;
      }
    }) || null;
    const dropToNobody = isRoot();
    const hasSetpriv = !dropToNobody || spawnSync('setpriv', ['--version'], { timeout: 3000 }).status === 0;
    if (bindPoint && hasSetpriv) {
      const probe = spawnSync('unshare', [...unshareArgs(dropToNobody), '/bin/sh', '-c', `mount -t tmpfs tmpfs /tmp && ip link show 2>/dev/null | grep -c UP; true`], {
        timeout: 5000,
        encoding: 'utf8',
      });
      if (probe.status === 0) {
        cached = {
          level: 'namespace',
          dropToNobody,
          bindPoint,
          allowed: true,
          reason: 'Linux namespaces: no network, private PID and mount namespaces, host directories hidden.',
        };
        return cached;
      }
    }
  }

  const hasSh = process.platform !== 'win32' && fs.existsSync('/bin/sh');
  const level: IsolationLevel = hasSh ? 'rlimit-only' : 'none';
  cached = {
    level,
    dropToNobody: false,
    bindPoint: null,
    allowed: unisolatedAllowed(),
    reason:
      level === 'rlimit-only'
        ? 'Linux namespaces are unavailable here; only CPU, memory, file-size and process limits apply. Programs can read host files and use the network.'
        : 'No isolation wrapper is available on this platform; only a timeout and output cap apply.',
  };
  return cached;
}

export interface ResourceLimits {
  cpuSeconds: number;
  /** Address-space limit in MB, or null when the runtime manages its own heap (JVM, V8). */
  addressSpaceMb: number | null;
  fileSizeKb: number;
  maxProcesses: number;
  openFiles: number;
}

/** Shell-quote one argument for /bin/sh. */
function q(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

/**
 * Returns the binary and args that run `argv` inside the chosen isolation level, with `workDir`
 * as the only writable, visible scratch directory.
 */
export function wrapCommand(argv: string[], workDir: string, limits: ResourceLimits, info = detectIsolation()): { bin: string; args: string[] } {
  if (info.level === 'none') return { bin: argv[0], args: argv.slice(1) };

  const ulimits = [
    `ulimit -t ${limits.cpuSeconds}`,
    `ulimit -f ${limits.fileSizeKb}`,
    `ulimit -n ${limits.openFiles}`,
    `ulimit -u ${limits.maxProcesses} 2>/dev/null`,
    limits.addressSpaceMb ? `ulimit -v ${limits.addressSpaceMb * 1024}` : '',
  ]
    .filter(Boolean)
    .join('; ');

  if (info.level === 'rlimit-only') {
    return { bin: '/bin/sh', args: ['-c', `${ulimits}; exec "$@"`, 'sandbox', ...argv] };
  }

  const bp = info.bindPoint!;
  const hide = hiddenPaths()
    .map((p) => `mount -t tmpfs -o size=4k,mode=0555 tmpfs ${q(p)}`)
    .join(' && ');
  const steps = [
    'set -e',
    // Keep the work dir reachable at the same path while /tmp is replaced.
    `mount --bind ${q(workDir)} ${q(bp)}`,
    `mount -t tmpfs -o size=64m,mode=1777 tmpfs /tmp`,
    `mkdir -p ${q(workDir)}`,
    `mount --bind ${q(bp)} ${q(workDir)}`,
    `umount -l ${q(bp)}`,
    hide || 'true',
    `cd ${q(workDir)}`,
    'set +e',
    ulimits,
  ];
  const drop = info.dropToNobody
    ? `exec setpriv --reuid=${SANDBOX_NOBODY_UID} --regid=${SANDBOX_NOBODY_UID} --clear-groups --no-new-privs --inh-caps=-all --bounding-set=-all "$@"`
    : 'exec "$@"';
  return {
    bin: 'unshare',
    args: [...unshareArgs(info.dropToNobody), '/bin/sh', '-c', `${steps.join('\n')}\n${drop}`, 'sandbox', ...argv],
  };
}

/** Test hook. */
export function resetIsolationCache(): void {
  cached = null;
}
