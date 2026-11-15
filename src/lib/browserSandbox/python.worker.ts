/// <reference lib="webworker" />
/**
 * Single-use worker that runs one Python program with Pyodide (CPython compiled to WebAssembly).
 * The runtime is served from this site (/vendor/pyodide/). Packages the program imports (numpy, pandas,
 * scikit-learn, ...) are downloaded from the official Pyodide CDN, checked against the lock file's
 * sha256, before the network is switched off.
 */
import { lockDown } from './lockdown';
import { OUTPUT_LIMIT_CHARS, type SandboxJob, type WorkerMessage, type SandboxFile } from './types';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const post = (m: WorkerMessage) => scope.postMessage(m);
const WORKDIR = '/home/pyodide/run';
const OUTPUT_EXT = /\.(json|txt|csv|md)$/i;
const MAX_OUTPUT_FILE = 200_000;

let written = 0;
function emitter(type: 'stdout' | 'stderr') {
  const decoder = new TextDecoder();
  return {
    write(buf: Uint8Array) {
      if (written <= OUTPUT_LIMIT_CHARS) {
        const text = decoder.decode(buf, { stream: true });
        written += text.length;
        post({ type, text });
      }
      return buf.length;
    },
  };
}

/** Keeps the student's frames of a traceback and drops Pyodide's own. */
export function cleanTraceback(msg: string): string {
  const lines = msg.split('\n');
  const start = lines.findIndex((l) => l.includes('File "<exec>"'));
  if (start < 0) return msg;
  return ['Traceback (most recent call last):', ...lines.slice(start)].join('\n');
}

scope.onmessage = async (e: MessageEvent<SandboxJob>) => {
  const job = e.data;
  let py: any;
  try {
    post({ type: 'status', text: 'Starting Python in your browser…' });
    const base = `${job.origin}/vendor/pyodide/`;
    const mod = await import(/* @vite-ignore */ `${base}pyodide.mjs`);
    py = await mod.loadPyodide({ indexURL: base });
    py.setStdout(emitter('stdout'));
    py.setStderr(emitter('stderr'));
    let stdinUsed = false;
    py.setStdin({ stdin: () => (stdinUsed ? undefined : ((stdinUsed = true), job.stdin || '')) });

    const failed: string[] = [];
    await py.loadPackagesFromImports(job.source, {
      messageCallback: (m: string) => {
        const name = /^Loading (.+)$/.exec(m)?.[1];
        if (name) post({ type: 'status', text: `Downloading ${name}…` });
      },
      errorCallback: (m: string) => failed.push(m),
    });
    if (failed.length) {
      post({ type: 'stderr', text: `Some packages could not be downloaded from the Pyodide CDN, so imports of them will fail:\n${failed.join('\n')}\n` });
    }

    py.FS.mkdirTree(WORKDIR);
    py.FS.chdir(WORKDIR);
    for (const f of job.files || []) py.FS.writeFile(`${WORKDIR}/${f.name.replace(/[^\w.\-]/g, '_')}`, f.content);
    const before = new Set<string>(py.FS.readdir(WORKDIR));

    lockDown(scope);
    post({ type: 'ready' });

    let exitCode = 0;
    try {
      const globals = py.globals.get('dict')();
      globals.set('__name__', '__main__');
      await py.runPythonAsync(job.source, { globals, filename: '<exec>' });
    } catch (err: any) {
      const msg = String(err?.message || err);
      const exit = /SystemExit: ?(\d+)?/.exec(msg);
      if (exit) exitCode = Number(exit[1] || 0);
      else {
        exitCode = 1;
        post({ type: 'stderr', text: `${cleanTraceback(msg).trimEnd()}\n` });
      }
    }

    const outputs: SandboxFile[] = [];
    for (const name of py.FS.readdir(WORKDIR) as string[]) {
      if (name === '.' || name === '..' || !OUTPUT_EXT.test(name)) continue;
      const stat = py.FS.stat(`${WORKDIR}/${name}`);
      if (stat.size > MAX_OUTPUT_FILE) continue;
      const changed = !before.has(name) || (job.files || []).every((f) => f.name !== name);
      if (changed) outputs.push({ name, content: py.FS.readFile(`${WORKDIR}/${name}`, { encoding: 'utf8' }) });
    }
    post({ type: 'done', exit_code: exitCode, outputs });
  } catch (err: any) {
    post({ type: 'stderr', text: `Python could not start in this browser: ${String(err?.message || err)}\n` });
    post({ type: 'done', exit_code: -1 });
  }
};
