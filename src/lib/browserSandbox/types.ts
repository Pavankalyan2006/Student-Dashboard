/**
 * In-browser code sandbox: shared message types.
 *
 * Student code runs in a dedicated Web Worker created for one run and terminated afterwards. A worker has
 * no access to the page, its DOM, localStorage (where the sign-in token is kept) or cookies. Before the
 * student's code starts, the worker also removes its own network and storage APIs (see lockdown.ts), and
 * the page stops it at the time limit. Nothing runs on the server.
 */
export type BrowserLanguage = 'python' | 'javascript';

export interface SandboxFile {
  /** File name relative to the working directory, e.g. "dataset.csv". */
  name: string;
  content: string;
}

export interface SandboxJob {
  language: BrowserLanguage;
  source: string;
  stdin?: string;
  /** Files placed in the working directory before the run (Python only). */
  files?: SandboxFile[];
  /** Absolute origin the vendored runtimes are served from (window.location.origin). */
  origin: string;
}

export type WorkerMessage =
  | { type: 'status'; text: string }
  | { type: 'ready' }
  | { type: 'stdout' | 'stderr'; text: string }
  | { type: 'done'; exit_code: number; outputs?: SandboxFile[] };

export type SandboxStatus = 'SUCCESS' | 'RUNTIME_ERROR' | 'TIMEOUT' | 'OUTPUT_LIMIT_EXCEEDED' | 'SYSTEM_ERROR';

export interface SandboxResult {
  status: SandboxStatus;
  stdout: string;
  stderr: string;
  exit_code: number;
  /** Time spent running the student's code, not loading the runtime. */
  execution_time_ms: number;
  isolation: 'browser';
  /** Small text files the program wrote (.json, .txt, .csv), Python only. */
  outputs: SandboxFile[];
}

export const OUTPUT_LIMIT_CHARS = 200_000;
