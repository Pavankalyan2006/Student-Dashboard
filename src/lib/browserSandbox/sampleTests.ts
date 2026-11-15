import { runInBrowser, type RunOptions } from './runInBrowser';
import type { BrowserLanguage } from './types';

export interface SampleCase {
  input: string;
  output: string;
}

/** Same comparison the server uses: trimmed stdout, Windows line endings normalised. */
export const normaliseOutput = (s: string) => String(s ?? '').trim().replace(/\r\n/g, '\n');

/**
 * Runs a program once per sample case in the browser sandbox and compares stdout with the expected output,
 * in the shape the DSA Run panel already shows. Stops at the first error or time-out, like the server.
 */
export async function runSampleTestsInBrowser(language: BrowserLanguage, source: string, cases: SampleCase[], opts: RunOptions = {}) {
  let status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT' | 'RUNTIME_ERROR' = 'ACCEPTED';
  let passed = 0;
  let total = 0;
  const test_results: any[] = [];
  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    opts.onStatus?.(`Sample test ${i + 1} of ${cases.length}…`);
    const r = await runInBrowser({ language, source, stdin: tc.input }, { ...opts, onStatus: undefined });
    total += r.execution_time_ms;
    if (r.status === 'TIMEOUT' || r.status !== 'SUCCESS') {
      status = r.status === 'TIMEOUT' ? 'TIME_LIMIT' : 'RUNTIME_ERROR';
      test_results.push({ test_index: i + 1, passed: false, input: tc.input, expected_output: tc.output, actual_output: r.stdout, error: r.stderr.trim() || `Exit code ${r.exit_code}`, execution_time_ms: r.execution_time_ms });
      break;
    }
    const ok = normaliseOutput(r.stdout) === normaliseOutput(tc.output);
    if (ok) passed++;
    else if (status === 'ACCEPTED') status = 'WRONG_ANSWER';
    test_results.push({ test_index: i + 1, passed: ok, input: tc.input, expected_output: tc.output, actual_output: r.stdout.trim(), execution_time_ms: r.execution_time_ms });
  }
  return { status, passed_count: passed, total_tests: cases.length, execution_time_ms: total, test_results, isolation: 'browser' as const };
}
