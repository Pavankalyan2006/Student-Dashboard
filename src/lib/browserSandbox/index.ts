export { runInBrowser, browserSandboxSupported, DEFAULT_TIME_LIMIT_MS } from './runInBrowser';
export { runSampleTestsInBrowser, normaliseOutput, type SampleCase } from './sampleTests';
export type { SandboxResult, SandboxFile, BrowserLanguage } from './types';
export const BROWSER_LANGUAGES = ['python', 'javascript'] as const;
export const SANDBOX_NOTE =
  'Runs in a separate worker in your browser. It cannot see this page, your sign-in or your stored data, has no network access, and is stopped at the time limit. Nothing runs on our server.';
