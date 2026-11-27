// Phase 2 (labs and assessment pages) regression tests. Synthetic students only.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestApi, TestApi } from './helpers/httpApp';
import { SandboxService } from '../../server/execution/sandbox';
import { detectIsolation, resetIsolationCache, wrapCommand } from '../../server/execution/isolation';

let api: TestApi;
beforeAll(async () => {
  api = await startTestApi();
});
afterAll(async () => {
  await api.close();
});

describe('Phase 2 › Batch 1 › code execution sandbox', () => {
  const iso = detectIsolation();
  const nsIt = iso.level === 'namespace' ? it : it.skip;

  nsIt('student code cannot see the app directory, other runs in /tmp, or the network', async () => {
    const fsRun = await SandboxService.execute({ language: 'python', sourceCode: `import os\nprint(os.path.exists(${JSON.stringify(process.cwd() + '/package.json')}))\nprint(len(os.listdir('/tmp')))` });
    expect(fsRun.status).toBe('SUCCESS');
    expect(fsRun.stdout).toBe('False\n1\n'); // only its own scratch directory
    const net = await SandboxService.execute({ language: 'python', sourceCode: 'import socket\ns=socket.socket()\ns.settimeout(2)\ns.connect(("127.0.0.1", 80))' });
    expect(net.status).toBe('RUNTIME_ERROR');
    expect(net.stderr).toMatch(/unreachable|refused|Network/i);
  }, 20000);

  nsIt('memory, infinite loops and output floods are stopped', async () => {
    const mem = await SandboxService.execute({ language: 'python', sourceCode: 'x = bytearray(1024*1024*1024)' });
    expect(mem.status).toBe('MEMORY_LIMIT');
    const loop = await SandboxService.execute({ language: 'python', sourceCode: 'while True: pass', timeoutMs: 1500 });
    expect(loop.status).toBe('TIMEOUT');
    expect(loop.execution_time_ms).toBeLessThan(4000);
    const out = await SandboxService.execute({ language: 'python', sourceCode: 'while True: print("x"*1000)' });
    expect(out.status).toBe('OUTPUT_LIMIT_EXCEEDED');
  }, 20000);

  it('results carry the isolation level and no invented memory figure', async () => {
    const r = await SandboxService.execute({ language: 'python', sourceCode: 'print(6*7)' });
    // Windows prints CRLF line endings; the value is what matters.
    expect(r.stdout.replace(/\r\n/g, '\n')).toBe('42\n');
    expect(r.isolation).toBe(iso.level);
    expect(r.memory_kb).toBeUndefined();
  });

  it('refuses to run unisolated code in production unless explicitly allowed', async () => {
    const prev = { env: process.env.NODE_ENV, iso: process.env.CODE_SANDBOX_ISOLATION, allow: process.env.CODE_SANDBOX_ALLOW_UNISOLATED };
    try {
      process.env.NODE_ENV = 'production';
      process.env.CODE_SANDBOX_ISOLATION = 'none';
      delete process.env.CODE_SANDBOX_ALLOW_UNISOLATED;
      resetIsolationCache();
      const r = await SandboxService.execute({ language: 'python', sourceCode: 'print(1)' });
      expect(r.status).toBe('SYSTEM_ERROR');
      expect(r.stderr).toMatch(/secure sandbox is not available/);
    } finally {
      process.env.NODE_ENV = prev.env;
      if (prev.iso === undefined) delete process.env.CODE_SANDBOX_ISOLATION; else process.env.CODE_SANDBOX_ISOLATION = prev.iso;
      if (prev.allow !== undefined) process.env.CODE_SANDBOX_ALLOW_UNISOLATED = prev.allow;
      resetIsolationCache();
    }
  });

  it('namespace wrapper hides /tmp and drops privileges when running as root', () => {
    const w = wrapCommand(['python3', 'x.py'], '/tmp/btech-coding-sandbox-abc', { cpuSeconds: 2, addressSpaceMb: 128, fileSizeKb: 10, maxProcesses: 8, openFiles: 16 }, {
      level: 'namespace', dropToNobody: true, bindPoint: '/mnt', allowed: true, reason: '',
    });
    expect(w.bin).toBe('unshare');
    expect(w.args).toEqual(expect.arrayContaining(['-n', '-p', '-m', '--kill-child']));
    const script = w.args.find((a) => a.includes('mount -t tmpfs'))!;
    expect(script).toContain('tmpfs /tmp');
    expect(script).toContain('ulimit -v 131072');
    expect(script).toContain('setpriv --reuid=65534');
  });
});

describe('Phase 2 › Batch 1 › DSA and coding APIs', () => {
  it('problem detail and list never include hidden test cases', async () => {
    const s = await api.register('dsa');
    const one = await api.call('GET', '/dsa/problems/dsa_top150_001', s.token);
    expect(one.status).toBe(200);
    expect(one.body.data.hidden_test_cases).toBeUndefined();
    expect(one.body.data.hidden_test_case_count).toBeGreaterThan(0);
    const list = await api.call('GET', '/dsa/problems', s.token);
    expect(list.body.data.length).toBe(150);
    expect(list.body.data.some((p: any) => 'hidden_test_cases' in p)).toBe(false);
    const counts = list.body.data.reduce((a: any, p: any) => ((a[p.difficulty] = (a[p.difficulty] || 0) + 1), a), {});
    expect(counts).toEqual({ EASY: 45, MEDIUM: 75, HARD: 30 });
    expect(new Set(list.body.data.map((p: any) => p.title.toLowerCase())).size).toBe(150);
  });

  it('running code and the DSA tutor require sign-in', async () => {
    expect((await api.call('POST', '/dsa/problems/dsa_top150_001/run', undefined, { language: 'python', source_code: 'print(1)' })).status).toBe(401);
    expect((await api.call('POST', '/dsa/tutor/chat', undefined, { question: 'hi' })).status).toBe(401);
    expect((await api.call('POST', '/coding/run', undefined, { language: 'python', source_code: 'print(1)' })).status).toBe(401);
  });

  it('languages report whether the server can actually run them', async () => {
    const r = await api.call('GET', '/coding/languages');
    for (const l of r.body.data) expect(typeof l.available).toBe('boolean');
  });

  it('a correct DSA submission is accepted, saved and counted only for that student', async () => {
    const a = await api.register('dsaA');
    const b = await api.register('dsaB');
    const sol = 'import sys\nd=sys.stdin.read().split("\\n")\nnums=list(map(int,d[0].split()))\nt=int(d[1])\nseen={}\nfor i,x in enumerate(nums):\n  if t-x in seen:\n    print(seen[t-x],i);break\n  seen[x]=i';
    const sub = await api.call('POST', '/dsa/problems/dsa_top150_001/submit', a.token, { language: 'python', source_code: sol });
    expect(sub.body.data.status).toBe('ACCEPTED');
    expect(sub.body.data.test_results.filter((t: any) => t.is_hidden).every((t: any) => t.input === undefined && t.expected_output === undefined)).toBe(true);
    expect((await api.call('GET', '/dsa/progress', a.token)).body.data.problems_solved).toContain('dsa_top150_001');
    expect((await api.call('GET', '/dsa/progress', b.token)).body.data.problems_solved).not.toContain('dsa_top150_001');
  }, 30000);
});

describe('Phase 2 › Batch 1 › SQL Lab over HTTP', () => {
  it('create table, insert, select, save query; another student sees none of it', async () => {
    const a = await api.register('sqlA');
    const b = await api.register('sqlB');
    const ct = await api.call('POST', '/sql-lab/schemas/university_db/tables', a.token, {
      name: 'p2_labs',
      columns: [
        { name: 'id', type: 'INTEGER', is_primary_key: true, is_auto_increment: true },
        { name: 'title', type: 'VARCHAR', length_precision: '40', is_nullable: false },
      ],
      sample_rows: [],
    });
    expect(ct.status).toBe(201);
    const q = await api.call('POST', '/sql-lab/execute', a.token, { db_name: 'university_db', query: "INSERT INTO p2_labs (title) VALUES ('DBMS'); SELECT title FROM p2_labs" });
    expect(q.body.data.rows).toEqual([{ title: 'DBMS' }]);
    const sq = await api.call('POST', '/sql-lab/saved-queries', a.token, { name: 'labs', query: 'SELECT * FROM p2_labs' });
    expect(sq.status).toBe(201);
    expect((await api.call('GET', '/sql-lab/saved-queries', b.token)).body.data).toEqual([]);
    const bq = await api.call('POST', '/sql-lab/execute', b.token, { db_name: 'university_db', query: 'SELECT * FROM p2_labs' });
    expect(bq.body.data.success).toBe(false);
    expect((await api.call('DELETE', `/sql-lab/saved-queries/${sq.body.data.id}`, b.token)).status).toBe(404);
  });

  it('SQL challenges are listed without their reference answer query', async () => {
    const res = await api.call('GET', '/sql-lab/challenges');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(JSON.stringify(res.body.data)).not.toContain('expected_query');
  });
});
