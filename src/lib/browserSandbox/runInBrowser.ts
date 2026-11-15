import { OUTPUT_LIMIT_CHARS, type SandboxJob, type SandboxResult, type WorkerMessage } from './types';

export const DEFAULT_TIME_LIMIT_MS = 10_000;
/** Loading Python and downloading packages the first time can take a while on a slow connection. */
const LOAD_LIMIT_MS = 120_000;

export interface RunOptions {
  /** Limit for the student's code itself, counted after the runtime is ready. */
  timeLimitMs?: number;
  onStatus?: (text: string) => void;
}

function createWorker(language: SandboxJob['language']): Worker {
  return language === 'python'
    ? new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' })
    : new Worker(new URL('./javascript.worker.ts', import.meta.url), { type: 'module' });
}

/** True when this browser can run the sandbox at all (workers and WebAssembly). */
export function browserSandboxSupported(): boolean {
  return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined';
}

/**
 * Runs one program in a fresh worker and resolves when it finishes, fails or reaches the time limit.
 * The worker is always terminated afterwards.
 */
export function runInBrowser(job: Omit<SandboxJob, 'origin'>, opts: RunOptions = {}): Promise<SandboxResult> {
  const limit = opts.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS;
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let startedAt = 0;
    let finished = false;
    const worker = createWorker(job.language);
    const finish = (status: SandboxResult['status'], exit_code: number, outputs: SandboxResult['outputs'] = []) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker.terminate();
      const truncated = stdout.length + stderr.length > OUTPUT_LIMIT_CHARS;
      resolve({
        status: truncated && status === 'SUCCESS' ? 'OUTPUT_LIMIT_EXCEEDED' : status,
        stdout: stdout.slice(0, OUTPUT_LIMIT_CHARS),
        stderr: stderr.slice(0, OUTPUT_LIMIT_CHARS),
        exit_code,
        execution_time_ms: startedAt ? Math.round(performance.now() - startedAt) : 0,
        isolation: 'browser',
        outputs,
      });
    };
    let timer = setTimeout(() => {
      stderr += `\nThe ${job.language === 'python' ? 'Python' : 'JavaScript'} runtime did not start within ${LOAD_LIMIT_MS / 1000} s.`;
      finish('SYSTEM_ERROR', -1);
    }, LOAD_LIMIT_MS);

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data;
      if (m.type === 'status') opts.onStatus?.(m.text);
      else if (m.type === 'ready') {
        clearTimeout(timer);
        startedAt = performance.now();
        opts.onStatus?.('Running…');
        timer = setTimeout(() => {
          stderr += `\nStopped: the program ran longer than the ${limit / 1000} s limit.`;
          finish('TIMEOUT', -1);
        }, limit);
      } else if (m.type === 'stdout') stdout += m.text;
      else if (m.type === 'stderr') stderr += m.text;
      else if (m.type === 'done') finish(m.exit_code === 0 ? 'SUCCESS' : m.exit_code === -1 && !startedAt ? 'SYSTEM_ERROR' : 'RUNTIME_ERROR', m.exit_code, m.outputs);
    };
    worker.onerror = (e) => {
      e.preventDefault();
      stderr += `\n${e.message || 'The sandbox worker failed.'}`;
      finish(startedAt ? 'RUNTIME_ERROR' : 'SYSTEM_ERROR', 1);
    };
    worker.postMessage({ ...job, origin: window.location.origin } satisfies SandboxJob);
  });
}
