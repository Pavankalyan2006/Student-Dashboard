import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

// The sample-test runner is checked against a stand-in for the worker, so it runs under Node.
const fakeRuns: any[] = [];
vi.mock('../lib/browserSandbox/runInBrowser', () => ({
  DEFAULT_TIME_LIMIT_MS: 10_000,
  browserSandboxSupported: () => true,
  runInBrowser: vi.fn(async () => fakeRuns.shift()),
}));

import { lockDown, BLOCKED_APIS } from '../lib/browserSandbox/lockdown';
import { normaliseOutput, runSampleTestsInBrowser } from '../lib/browserSandbox/sampleTests';
import { rowsToCsv } from '../features/ml-lab/components/PythonRunPanel';
import { runsInBrowser } from '../features/coding/hooks/useLanguageAvailability';

const ok = (stdout: string, ms = 5) => ({ status: 'SUCCESS', stdout, stderr: '', exit_code: 0, execution_time_ms: ms, isolation: 'browser', outputs: [] });

describe('Browser sandbox: lock-down of a worker scope', () => {
  it('removes network, storage and worker APIs from the scope and from every prototype in its chain', () => {
    const proto: any = { fetch: () => 'net', WebSocket: class {}, importScripts: () => 0 };
    const scope: any = Object.create(proto);
    scope.indexedDB = {};
    scope.XMLHttpRequest = class {};
    scope.navigator = { storage: {}, sendBeacon: () => true, userAgent: 'x' };
    scope.postMessage = () => 0;

    const removed = lockDown(scope);
    for (const name of ['fetch', 'WebSocket', 'importScripts', 'indexedDB', 'XMLHttpRequest']) {
      expect(removed).toContain(name);
      expect(scope[name]).toBeUndefined();
    }
    expect(Object.getPrototypeOf(scope).fetch).toBeUndefined();
    expect(scope.navigator.storage).toBeUndefined();
    expect(scope.navigator.sendBeacon).toBeUndefined();
    // What student code needs is left alone.
    expect(typeof scope.postMessage).toBe('function');
    expect(scope.navigator.userAgent).toBe('x');
    // The removed names cannot be put back.
    expect(() => {
      scope.fetch = () => 'again';
    }).toThrow(TypeError);
    expect(scope.fetch).toBeUndefined();
  });

  it('covers the APIs that could reach the network or stored data', () => {
    for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches', 'BroadcastChannel', 'Worker']) {
      expect(BLOCKED_APIS as readonly string[]).toContain(name);
    }
  });
});

describe('Browser sandbox: sample tests', () => {
  it('compares output the way the server does (trimmed, Windows line endings normalised)', () => {
    expect(normaliseOutput('3\r\n4\r\n  ')).toBe('3\n4');
    expect(normaliseOutput(undefined as any)).toBe('');
  });

  it('counts passes, marks a wrong answer, and stops at the first runtime error', async () => {
    fakeRuns.push(ok('5\n'), ok('7\r\n'), { ...ok(''), status: 'RUNTIME_ERROR', stderr: 'ZeroDivisionError', exit_code: 1 }, ok('never run'));
    const cases = [
      { input: '2 3', output: '5' },
      { input: '3 3', output: '6' },
      { input: '0 0', output: '0' },
      { input: '1 1', output: '2' },
    ];
    const r = await runSampleTestsInBrowser('python', 'print(sum(map(int, input().split())))', cases);
    expect(r.passed_count).toBe(1);
    expect(r.total_tests).toBe(4);
    expect(r.status).toBe('RUNTIME_ERROR');
    expect(r.test_results).toHaveLength(3);
    expect(r.test_results[1]).toMatchObject({ passed: false, actual_output: '7' });
    expect(r.test_results[2].error).toBe('ZeroDivisionError');
    expect(r.isolation).toBe('browser');
    expect(fakeRuns).toHaveLength(1);
    fakeRuns.length = 0;
  });

  it('reports a time-out as TIME_LIMIT', async () => {
    fakeRuns.push({ ...ok(''), status: 'TIMEOUT', stderr: 'Stopped', exit_code: -1 });
    const r = await runSampleTestsInBrowser('javascript', 'while(true){}', [{ input: '', output: '1' }]);
    expect(r.status).toBe('TIME_LIMIT');
    expect(r.passed_count).toBe(0);
  });
});

describe('Browser sandbox: where a language runs', () => {
  it('uses the browser only for Python and JavaScript, and only when the server has no sandbox', () => {
    expect(runsInBrowser({ id: 'python', available: false, availability_detail: 'sandbox_unavailable' })).toBe(true);
    expect(runsInBrowser({ id: 'javascript', available: false, availability_detail: 'sandbox_unavailable' })).toBe(true);
    expect(runsInBrowser({ id: 'cpp', available: false, availability_detail: 'sandbox_unavailable' })).toBe(false);
    expect(runsInBrowser({ id: 'python', available: true })).toBe(false);
    expect(runsInBrowser({ id: 'python', available: false, availability_detail: 'runtime_missing' })).toBe(false);
  });
});

describe('ML Lab: dataset.csv for a browser run', () => {
  it('writes a header from the first row and quotes values that need it', () => {
    const csv = rowsToCsv([
      { a: 1, b: 'x, y', c: null },
      { a: 2, b: 'say "hi"', c: 'line\nbreak' },
    ]);
    expect(csv).toBe('a,b,c\n1,"x, y",\n2,"say ""hi""","line\nbreak"\n');
    expect(rowsToCsv([])).toBe('');
  });
});

describe('Lab records: saving a run made in the browser', () => {
  let server: Server;
  let base = '';
  const tokens: string[] = [];
  const call = async (who: number, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${tokens[who]}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data };
  };

  beforeAll(async () => {
    const { createApp } = await import('../../server/app');
    server = (await createApp()).listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b']) {
      const r: any = await fetch(`${base}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ full_name: `Sandbox ${who}`, email: `sb-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' }),
      }).then((x) => x.json());
      tokens.push(r.data.token);
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('stores the output and marks the experiment as run in the browser', async () => {
    const lab = await call(0, 'POST', '/labs', { name: 'Python Lab', subject: 'Programming in Python', semester: 2 });
    expect(lab.status).toBe(201);
    const exp = await call(0, 'POST', `/labs/${lab.data.id}/experiments`, { title: 'Sum of two numbers', aim: 'Read two numbers and print the sum' });
    expect(exp.status).toBeLessThan(300);
    const expId = exp.data.id;

    const saved = await call(0, 'POST', `/labs/${lab.data.id}/experiments/${expId}/code/save`, {
      code: 'print(2+3)',
      language: 'python',
      browser_result: { stdout: '5\n', stderr: '', execution_time_ms: 12.6, status: 'SUCCESS' },
    });
    expect(saved.status).toBe(200);
    expect(saved.data).toMatchObject({ last_output: '5\n', execution_duration_ms: 13 });

    const detail = await call(0, 'GET', `/labs/${lab.data.id}/experiments/${expId}`);
    const e = detail.data.experiment || detail.data;
    expect(e.execution_status).toBe('SUCCESS');
    expect(e.execution_place).toBe('browser');

    // A failed run is recorded as an error, and the time is clamped.
    const failed = await call(0, 'POST', `/labs/${lab.data.id}/experiments/${expId}/code/save`, {
      code: 'print(1/0)',
      language: 'python',
      browser_result: { stdout: '', stderr: 'ZeroDivisionError: division by zero', execution_time_ms: 9e12, status: 'RUNTIME_ERROR' },
    });
    expect(failed.data).toMatchObject({ last_error: 'ZeroDivisionError: division by zero', execution_duration_ms: 600_000 });
    const after = await call(0, 'GET', `/labs/${lab.data.id}/experiments/${expId}`);
    expect((after.data.experiment || after.data).execution_status).toBe('ERROR');
  });

  it('does not let another student change the experiment through a browser result', async () => {
    const lab = await call(0, 'POST', '/labs', { name: 'C Lab', subject: 'Programming in C', semester: 1 });
    const exp = await call(0, 'POST', `/labs/${lab.data.id}/experiments`, { title: 'Hello', aim: 'Print hello' });
    await call(1, 'POST', `/labs/${lab.data.id}/experiments/${exp.data.id}/code/save`, {
      code: 'x',
      browser_result: { stdout: 'forged', stderr: '', execution_time_ms: 1, status: 'SUCCESS' },
    });
    const mine = await call(0, 'GET', `/labs/${lab.data.id}/experiments/${exp.data.id}`);
    const e = mine.data.experiment || mine.data;
    expect(e.execution_place).toBeUndefined();
    expect(e.execution_status).not.toBe('SUCCESS');
  });
});
