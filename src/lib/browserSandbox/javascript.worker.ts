/// <reference lib="webworker" />
/**
 * Single-use worker that runs one JavaScript program. console.* goes to the output panel; input() and
 * readline() read the next line of stdin (null at the end). Network, storage and worker APIs are removed
 * before the program starts.
 */
import { lockDown } from './lockdown';
import { OUTPUT_LIMIT_CHARS, type SandboxJob, type WorkerMessage } from './types';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const post = (m: WorkerMessage) => scope.postMessage(m);
let written = 0;

function fmt(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v instanceof Error) return v.stack || `${v.name}: ${v.message}`;
  try {
    return JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? `${x}n` : x)) ?? String(v);
  } catch {
    return String(v);
  }
}
function out(type: 'stdout' | 'stderr', args: unknown[]) {
  if (written > OUTPUT_LIMIT_CHARS) return;
  const text = `${args.map(fmt).join(' ')}\n`;
  written += text.length;
  post({ type, text });
}
/**
 * Rewrites a stack trace to point at the student's own lines ("at f (your code, line 3)") and drops the
 * worker's internal frames. The function wrapper adds 2 lines before the student's code.
 */
export function cleanStack(err: any): string {
  const s = String(err?.stack || err);
  const lines = s.split('\n');
  const out: string[] = [];
  for (const l of lines) {
    const m = /^\s*at (?:(\S+) )?\(?eval at .*<anonymous>:(\d+):(\d+)\)?$/.exec(l);
    if (m) {
      const where = `your code, line ${Number(m[2]) - 2}`;
      out.push(m[1] && m[1] !== 'eval' ? `    at ${m[1]} (${where})` : `    at ${where}`);
    } else if (!/^\s*at /.test(l)) out.push(l);
  }
  return out.join('\n');
}

scope.onmessage = async (e: MessageEvent<SandboxJob>) => {
  const job = e.data;
  const lines = (job.stdin || '').split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  let i = 0;
  const input = () => (i < lines.length ? lines[i++] : null);
  const consoleShim = {
    log: (...a: unknown[]) => out('stdout', a),
    info: (...a: unknown[]) => out('stdout', a),
    debug: (...a: unknown[]) => out('stdout', a),
    warn: (...a: unknown[]) => out('stderr', a),
    error: (...a: unknown[]) => out('stderr', a),
    table: (...a: unknown[]) => out('stdout', a),
  };
  (scope as any).console = consoleShim;
  scope.addEventListener('unhandledrejection', (ev) => {
    out('stderr', [`Uncaught (in promise) ${cleanStack(ev.reason)}`]);
  });

  lockDown(scope);
  post({ type: 'ready' });
  let exitCode = 0;
  try {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const fn = new AsyncFunction('console', 'input', 'readline', 'prompt', job.source);
    await fn(consoleShim, input, input, input);
  } catch (err) {
    exitCode = 1;
    out('stderr', [cleanStack(err)]);
  }
  // Let timers the program queued with a 0 ms delay finish.
  await new Promise((r) => setTimeout(r, 0));
  post({ type: 'done', exit_code: exitCode });
};
