import { describe, it, expect, beforeAll, afterAll, vi, afterEach } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { staticReview, detectLanguage, stripSource, functionMetrics, sanitiseAiFindings, hasTests } from '../../server/services/codeReviewMath';
import { AIService } from '../../server/ai/service';
import { isAIGenerationRequest } from '../../server/middleware/rateLimiter';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const review = (name: string, content: string) => staticReview({ name, content, language: detectLanguage(name, content) });
const rules = (r: ReturnType<typeof review>) => r.findings.map((f) => `${f.line ?? '-'}:${f.rule}`);

describe('Code review: static checks', () => {
  it('finds Python problems on the right lines', () => {
    const src = [
      'def findMax(items=[]):', //            1 mutable default, naming
      '    password = "hunter2secret"', //     2 secret
      '    for i in range(len(items)):', //    3
      '        if items[i] == None:', //       4 None compare
      '            continue',
      '    try:',
      '        x = eval(input())', //          7 eval
      '    except:', //                        8 bare except
      '        pass', //                         swallowed (8-9)
      '    q = "SELECT * FROM t WHERE n = \'" + name + "\'"', // 10 SQL concat
      '    return items',
    ].join('\n');
    expect(rules(review('a.py', src))).toEqual(['1:mutable-default', '1:py-camel-def', '2:hardcoded-secret', '4:none-compare', '7:eval', '8:bare-except', '10:sql-concat', '8:swallowed-exception']);
  });

  it('finds C buffer problems and an assignment in a condition', () => {
    const src = ['#include <stdio.h>', 'int main() {', '  char s[10];', '  int x = 0;', '  gets(s);', '  strcpy(s, "abc");', '  scanf("%s", s);', '  if (x = 1) return 1;', '  return 0;', '}'].join('\n');
    expect(rules(review('a.c', src))).toEqual(['5:c-gets', '6:c-unsafe-copy', '7:c-scanf-s', '8:assign-in-condition']);
    expect(review('a.c', src).findings[0].severity).toBe('critical');
  });

  it('ignores code-like text inside strings and comments', () => {
    const src = ['const msg = "if (a = b) eval(x)"; // eval(y) and var z', '/* innerHTML = x', '   console.log(1) */', 'let ok = a === b;'].join('\n');
    expect(rules(review('a.js', src))).toEqual([]);
    const s = stripSource('x = "a # b"  # comment', 'python');
    expect(s.code[0]).toBe('x = ""  ');
  });

  it('measures functions: complexity, loop nesting and recursion', () => {
    const js = ['function pairs(a) {', '  let n = 0;', '  for (let i = 0; i < a.length; i++) {', '    for (let j = 0; j < a.length; j++) {', '      if (a[i] > a[j] && i < j) n++;', '    }', '  }', '  return n;', '}', 'function fact(n) {', '  return n <= 1 ? 1 : n * fact(n - 1);', '}'].join('\n');
    const m = functionMetrics(stripSource(js, 'javascript').code, 'javascript');
    expect(m.map((f) => [f.name, f.line, f.complexity, f.max_loop_depth, f.recursive])).toEqual([
      ['pairs', 1, 5, 2, false], // 2 loops + if + && = 4 decisions
      ['fact', 10, 2, 0, true], // ternary
    ]);
    expect(m[0].estimate).toMatch(/O\(n\^2\)/);
    // Two sibling loops are not nested.
    const sib = functionMetrics(stripSource('void f(int n) {\n  for (int i=0;i<n;i++) { x(); }\n  for (int j=0;j<n;j++) { y(); }\n}', 'c').code, 'c');
    expect(sib[0].max_loop_depth).toBe(1);
    const py = functionMetrics(stripSource('def f(a):\n    for x in a:\n        for y in a:\n            pass\n    for z in a:\n        pass\n', 'python').code, 'python');
    expect(py[0].max_loop_depth).toBe(2);
  });

  it('flags very complex functions and detects tests', () => {
    const branches = Array.from({ length: 12 }, (_, i) => `  if (x == ${i}) return ${i};`).join('\n');
    const r = review('b.java', `public class B {\n  static int pick(int x) {\n${branches}\n    return -1;\n  }\n}`);
    const c = r.findings.find((f) => f.rule === 'complexity')!;
    expect(c).toMatchObject({ line: 2, severity: 'medium' });
    expect(c.title).toContain('13');
    expect(hasTests([{ name: 'test_util.py', content: 'x', language: 'python' }])).toBe(true);
    expect(hasTests([{ name: 'util.py', content: 'def f(): return 1', language: 'python' }])).toBe(false);
  });

  it('detects the language from the name or the code', () => {
    expect(detectLanguage('x.tsx', '')).toBe('typescript');
    expect(detectLanguage('main', '#include <iostream>\nint main(){ std::cout << 1; }')).toBe('cpp');
    expect(detectLanguage('main', 'def f(x):\n    return x')).toBe('python');
    expect(detectLanguage('Main', 'public class Main { }')).toBe('java');
  });
});

describe('Code review: AI output is validated', () => {
  const files = [{ name: 'a.py', content: 'x = 1\ny = 2\n', language: 'python' as const }];
  it('keeps real lines and files, and drops invented ones', () => {
    const out = sanitiseAiFindings(
      [
        { file: 'a.py', line: 2, severity: 'high', category: 'security', title: 'T', explanation: 'E' },
        { file: 'a.py', line: 99, severity: 'nonsense', category: 'made-up', title: 'T2', explanation: 'E2' },
        { file: 'other.py', line: 1, title: 'T3', explanation: 'E3' },
        { file: 'a.py', title: '', explanation: 'no title' },
        'junk',
      ],
      [...files, { name: 'b.py', content: 'z', language: 'python' }]
    );
    expect(out.map((f) => [f.file, f.line, f.severity, f.category, f.source])).toEqual([
      ['a.py', 2, 'high', 'security', 'ai'],
      ['a.py', undefined, 'low', 'best_practice', 'ai'], // line 99 does not exist
    ]);
  });
});

describe('Code review over HTTP', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b' | null, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', ...(who ? { authorization: `Bearer ${tokens[who]}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data, json };
  };

  beforeAll(async () => {
    const { createApp } = await import('../../server/app');
    const app = await createApp();
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b'] as const) {
      const r = await call(null, 'POST', '/auth/register', { full_name: `CR ${who}`, email: `cr-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));
  afterEach(() => vi.restoreAllMocks());

  const CODE = 'API_KEY = "sk-live-1234567890abcdef"\ndef add(a, b):\n    return a + b\n';

  it('needs a session and counts as an AI request for rate limiting', async () => {
    expect((await call(null, 'GET', '/code-review/me')).status).toBe(401);
    expect((await call(null, 'POST', '/code-review/me', {})).status).toBe(401);
    expect(isAIGenerationRequest('POST', '/api/v1/code-review/me')).toBe(true);
    expect(isAIGenerationRequest('PATCH', '/api/v1/code-review/me/x/findings/y')).toBe(false);
  });

  it('runs the automated checks and says so when the AI is unavailable', async () => {
    vi.spyOn(AIService, 'generate').mockResolvedValue({ text: '', provider: 'unavailable', unavailable: true } as any);
    vi.spyOn(AIService, 'isUnavailableResult').mockReturnValue(true);
    const r = await call('a', 'POST', '/code-review/me', { files: [{ name: 'calc.py', content: CODE }] });
    expect(r.status).toBe(200);
    expect(r.data.ai).toBe('unavailable');
    expect(r.data.ai_error).toMatch(/not available/);
    expect(r.data.findings.map((f: any) => f.rule)).toEqual(['hardcoded-secret', 'no-tests']);
    expect(r.data.disclaimer).toMatch(/does not prove/);
  });

  it('sends redacted code to the AI and keeps only valid AI findings', async () => {
    let sent = '';
    vi.spyOn(AIService, 'generate').mockImplementation(async (messages: any) => {
      sent = messages.map((m: any) => m.content).join('\n');
      return {
        text: JSON.stringify({
          summary: 'Small and readable.',
          overall: { correctness: 'add works for numbers.', invented_key: 'dropped' },
          findings: [
            { file: 'calc.py', line: 2, severity: 'low', category: 'documentation', title: 'No docstring', explanation: 'Say what add returns.' },
            { file: 'calc.py', line: 500, severity: 'high', category: 'security', title: 'Bad line', explanation: 'Line does not exist.' },
          ],
          complexity: [{ file: 'calc.py', function: 'add', time: 'O(1)', space: 'O(1)', reasoning: 'One addition.' }],
          test_suggestions: [{ title: 'Adds negatives', input: 'add(-1, -2)', expected: '-3' }],
        }),
        provider: 'test',
      } as any;
    });
    const r = await call('a', 'POST', '/code-review/me', { title: 'Calc', files: [{ name: 'calc.py', content: CODE }] });
    expect(r.status).toBe(200);
    expect(sent).not.toContain('sk-live-1234567890abcdef');
    expect(sent).toContain('   2| def add(a, b):');
    expect(r.data.secrets_redacted).toBe(1);
    expect(r.data.ai).toBe('done');
    expect(r.data.overall).toEqual({ correctness: 'add works for numbers.' });
    const ai = r.data.findings.filter((f: any) => f.source === 'ai');
    expect(ai.map((f: any) => f.line)).toEqual([2, undefined]);
    expect(r.data.complexity[0].time).toBe('O(1)');

    // Decide on findings; "modified" needs a note.
    const fid = ai[0].id;
    expect((await call('a', 'PATCH', `/code-review/me/${r.data.id}/findings/${fid}`, { status: 'modified' })).status).toBe(400);
    const m = await call('a', 'PATCH', `/code-review/me/${r.data.id}/findings/${fid}`, { status: 'modified', note: 'Added a one-line docstring.' });
    expect(m.data).toMatchObject({ status: 'modified', student_note: 'Added a one-line docstring.' });
    expect((await call('a', 'PATCH', `/code-review/me/${r.data.id}/findings/${fid}`, { status: 'approved' })).status).toBe(400);

    const list = await call('a', 'GET', '/code-review/me');
    expect(list.data[0]).toMatchObject({ id: r.data.id, title: 'Calc', decided: 1 });
    expect(list.data[0].files[0].content).toBeUndefined(); // history list stays light

    // B cannot read, change or delete A's review.
    expect((await call('b', 'GET', `/code-review/me/${r.data.id}`)).status).toBe(404);
    expect((await call('b', 'PATCH', `/code-review/me/${r.data.id}/findings/${fid}`, { status: 'accepted' })).status).toBe(404);
    expect((await call('b', 'DELETE', `/code-review/me/${r.data.id}`)).status).toBe(404);
    expect((await call('b', 'GET', '/code-review/me')).data).toEqual([]);

    expect((await call('a', 'DELETE', `/code-review/me/${r.data.id}`)).status).toBe(200);
  });

  it('reviews saved Coding Lab code only for its owner, and validates input', async () => {
    vi.spyOn(AIService, 'generate').mockResolvedValue({ text: '', unavailable: true } as any);
    vi.spyOn(AIService, 'isUnavailableResult').mockReturnValue(true);
    const saved = await call('a', 'POST', '/coding/saved', { title: 'Two sum', language: 'python', source_code: 'def two_sum(a, t):\n    return None\n' });
    expect(saved.status).toBe(201);
    const r = await call('a', 'POST', '/code-review/me', { saved_code_id: saved.data.id });
    expect(r.status).toBe(200);
    expect(r.data).toMatchObject({ title: 'Two sum', source: { kind: 'saved' } });
    expect(r.data.files[0].name).toBe('Two_sum.py');
    expect([403, 404]).toContain((await call('b', 'POST', '/code-review/me', { saved_code_id: saved.data.id })).status);

    expect((await call('a', 'POST', '/code-review/me', { files: [] })).status).toBe(400);
    expect((await call('a', 'POST', '/code-review/me', { files: [{ name: 'x.py', content: '   ' }] })).status).toBe(400);
    expect((await call('a', 'POST', '/code-review/me', { files: [{ name: 'x.py', content: 'a'.repeat(20_001) }] })).status).toBe(400);
    expect((await call('a', 'POST', '/code-review/me', { files: Array.from({ length: 6 }, (_, i) => ({ name: `f${i}.py`, content: 'x = 1' })) })).status).toBe(400);
    expect((await call('a', 'POST', '/code-review/me', { files: [{ name: 'x.py', content: 'x = 1' }, { name: 'x.py', content: 'y = 2' }] })).status).toBe(400);
  });

  it('respects the Coding agent switch', async () => {
    const spy = vi.spyOn(AIService, 'generate');
    expect((await call('a', 'PATCH', '/agents/me/coding', { enabled: false })).status).toBe(200);
    const r = await call('a', 'POST', '/code-review/me', { files: [{ name: 'x.js', content: 'var x = 1;' }] });
    expect(r.data.ai).toBe('off');
    expect(spy).not.toHaveBeenCalled();
    expect(r.data.findings.map((f: any) => f.rule)).toEqual(['var', 'no-tests']);
    await call('a', 'PATCH', '/agents/me/coding', { enabled: true });
  });

  it('lists Code Review in the sidebar', () => {
    expect(ALL_NAV_ITEMS.map((i) => i.href)).toContain('/code-review');
  });
});
