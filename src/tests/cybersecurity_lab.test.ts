import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { VirtualShell } from '../features/cyber-lab/lib/shell';
import { caesarShift, xorWithByte, hexToBytes, decodeBase64, signJwtHS256, verifyJwt, b64url, sha256Hex } from '../features/cyber-lab/lib/tools';
import { EXERCISES, TRACKS, checkAnswer, publicExercise, practiceAuthLog } from '../../server/services/cyberLabCatalog';
import { isUnlocked } from '../../server/services/cyberLabService';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const ex = (id: string) => EXERCISES.find((e) => e.id === id)!;

describe('Cybersecurity Lab: practice shell', () => {
  const shell = new VirtualShell(
    [
      { path: '/home/student/notes.txt', content: 'a\nb\n' },
      { path: '/home/student/.secret', content: 'hidden\n' },
      { path: '/var/log/auth.log', content: practiceAuthLog() },
      { path: '/etc/app/x.conf', content: 'x\n', mode: '-rw-rw-rw-' },
    ],
    '/home/student'
  );
  it('hides dotfiles unless -a, and shows permissions with -l', () => {
    expect(shell.run('ls')).toBe('notes.txt\n');
    expect(shell.run('ls -a')).toContain('.secret');
    expect(shell.run('ls -l /etc/app')).toContain('-rw-rw-rw-');
  });
  it('moves around, reads, searches, counts and decodes', () => {
    expect(shell.run('cd /var/log')).toBe('');
    expect(shell.run('pwd')).toBe('/var/log\n');
    expect(shell.run('grep "Failed password" auth.log | grep 203.0.113.45 | wc -l')).toBe('24\n');
    expect(shell.run('grep -c Accepted auth.log')).toBe('3\n');
    expect(shell.run('find / -name "*.conf"')).toBe('/etc/app/x.conf\n');
    expect(shell.run('echo aGVsbG8= | base64 -d')).toBe('hello');
    expect(shell.run('head -n 1 /home/student/notes.txt')).toBe('a\n');
    expect(shell.run('cat ../../home/student/.secret')).toBe('hidden\n');
  });
  it('reports errors like a shell and knows nothing outside its file system', () => {
    expect(() => shell.run('cat /etc/passwd')).toThrow(/No such file/);
    expect(() => shell.run('curl https://example.org')).toThrow(/command not found/);
    expect(() => shell.run('nmap 192.0.2.1')).toThrow(/command not found/);
  });
});

describe('Cybersecurity Lab: tools', () => {
  it('decodes the crypto exercises with the tools the page offers', () => {
    expect(checkAnswer(ex('cry-base64'), decodeBase64(String(ex('cry-base64').data!.ciphertext)))).toBe(true);
    expect(checkAnswer(ex('cry-caesar'), caesarShift(String(ex('cry-caesar').data!.ciphertext), 15))).toBe(true);
    const bytes = hexToBytes(String(ex('cry-xor').data!.ciphertext));
    expect(checkAnswer(ex('cry-xor'), xorWithByte(bytes, bytes[0] ^ 0x46))).toBe(true);
  });
  it('finds the leaked password with the wordlist', async () => {
    const { hash, wordlist } = ex('auth-hash').data as any;
    let found = '';
    for (const w of wordlist) if ((await sha256Hex(w)) === hash) found = w;
    expect(checkAnswer(ex('auth-hash'), found)).toBe(true);
  });
  it('the vulnerable JWT check accepts alg none; the fixed one only accepts a valid HS256 token', async () => {
    const good = await signJwtHS256({ sub: '7', role: 'student' }, 'k');
    expect((await verifyJwt(good, 'k', true)).ok).toBe(true);
    expect((await verifyJwt(good, 'wrong', true)).ok).toBe(false);
    const forged = `${b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${b64url(JSON.stringify({ sub: '7', role: 'admin' }))}.`;
    expect(await verifyJwt(forged, 'k', false)).toMatchObject({ ok: true, payload: { role: 'admin' } });
    expect((await verifyJwt(forged, 'k', true)).ok).toBe(false);
  });
});

describe('Cybersecurity Lab: catalogue', () => {
  it('covers every area in the brief, with three levels', () => {
    expect(TRACKS.map((t) => t.id)).toEqual(['networking', 'linux', 'web', 'auth', 'crypto', 'secure-coding', 'analysis', 'ctf']);
    for (const t of TRACKS) expect(EXERCISES.some((e) => e.track === t.id)).toBe(true);
    expect(new Set(EXERCISES.map((e) => e.level))).toEqual(new Set([1, 2, 3]));
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
  });
  it('never sends answers or lessons to the browser', () => {
    for (const e of EXERCISES) {
      const pub = JSON.stringify(publicExercise(e));
      expect(pub).not.toContain('"answers"');
      expect(pub).not.toContain('"lesson"');
      if (e.kind === 'answer' || e.kind === 'mcq') for (const a of e.answers) if (a.length > 3) expect(pub).not.toContain(a);
    }
  });
  it('uses only documentation IP ranges (RFC 5737) and private ranges in practice data', () => {
    const ips = JSON.stringify(EXERCISES).match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) || [];
    expect(ips.length).toBeGreaterThan(0);
    for (const ip of ips) expect(ip).toMatch(/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|10\.|192\.168\.|255\.)/); // 255.x is a subnet mask
  });
  it('compares answers ignoring case and spacing', () => {
    expect(checkAnswer(ex('net-hosts'), ' 62 ')).toBe(true);
    expect(checkAnswer(ex('lnx-hidden'), 'flag{HIDDEN_files_start_with_a_dot}')).toBe(true);
    expect(checkAnswer(ex('net-hosts'), '64')).toBe(false);
    expect(checkAnswer(ex('net-hosts'), '')).toBe(false);
  });
  it('unlocks harder levels after an easier one in the same track', () => {
    expect(isUnlocked(ex('net-network'), {})).toBe(false);
    expect(isUnlocked(ex('net-network'), { 'net-hosts': 1 })).toBe(true);
    expect(isUnlocked(ex('lnx-perms'), { 'lnx-hidden': 1 })).toBe(false);
    expect(isUnlocked(ex('lnx-perms'), { 'lnx-grep': 1 })).toBe(true);
    expect(isUnlocked(ex('auth-hash'), {})).toBe(true); // the lowest level in its track
  });
  it('links each track to courses that exist', async () => {
    const { db } = await import('../../server/db/database');
    await db.initialize();
    const ids = new Set((await db.getAllCourses()).map((c: any) => c.id));
    for (const t of TRACKS) for (const c of t.courses) expect(ids.has(c.id)).toBe(true);
  });
  it('is in the sidebar', () => {
    expect(ALL_NAV_ITEMS.map((i) => i.href)).toContain('/cybersecurity-lab');
  });
});

describe('Cybersecurity Lab over HTTP', () => {
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
    server = (await createApp()).listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b'] as const) {
      const r = await call(null, 'POST', '/auth/register', { full_name: `Cy ${who}`, email: `cy-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('needs a session', async () => {
    expect((await call(null, 'GET', '/cybersecurity/me')).status).toBe(401);
    expect((await call(null, 'POST', '/cybersecurity/exercises/net-hosts/attempt', { answer: '62' })).status).toBe(401);
  });

  it('records only correct answers, in order, after the rules are accepted', async () => {
    const first = await call('a', 'GET', '/cybersecurity/me');
    expect(first.data.agreed_at).toBeUndefined();
    expect(first.data.total).toBe(EXERCISES.length);
    expect(JSON.stringify(first.data)).not.toContain('"answers"');

    expect((await call('a', 'POST', '/cybersecurity/exercises/net-hosts/attempt', { answer: '62' })).status).toBe(400); // rules first
    expect((await call('a', 'POST', '/cybersecurity/me/agree')).status).toBe(200);

    expect((await call('a', 'POST', '/cybersecurity/exercises/net-network/attempt', { answer: '10.4.64.0' })).status).toBe(400); // locked
    const wrong = await call('a', 'POST', '/cybersecurity/exercises/net-hosts/attempt', { answer: '64' });
    expect(wrong.data).toEqual({ correct: false, attempts: 1 });
    const right = await call('a', 'POST', '/cybersecurity/exercises/net-hosts/attempt', { answer: '62' });
    expect(right.data).toMatchObject({ correct: true, attempts: 2, skills: ['Subnetting'] });
    expect(right.data.lesson).toMatch(/usable hosts/);
    expect((await call('a', 'POST', '/cybersecurity/exercises/net-network/attempt', { answer: '10.4.64.0' })).data.correct).toBe(true);

    const after = await call('a', 'GET', '/cybersecurity/me');
    expect(after.data.completed).toBe(2);
    expect(after.data.skills).toEqual([expect.objectContaining({ skill: 'Subnetting', exercises: 2 })]);
    const hosts = after.data.exercises.find((e: any) => e.id === 'net-hosts');
    expect(hosts).toMatchObject({ attempts: 2, unlocked: true });
    expect(hosts.completed_at).toBeTruthy();
    expect(hosts.lesson).toBeTruthy();
    expect(after.data.tracks.find((t: any) => t.id === 'networking')).toMatchObject({ completed: 2, total: 3 });
  });

  it('refuses bad input and unknown exercises, and keeps students apart', async () => {
    expect((await call('a', 'POST', '/cybersecurity/exercises/nope/attempt', { answer: 'x' })).status).toBe(404);
    expect((await call('a', 'POST', '/cybersecurity/exercises/net-capture/attempt', { answer: '' })).status).toBe(400);
    expect((await call('a', 'POST', '/cybersecurity/exercises/net-capture/attempt', { answer: { $ne: 1 } })).status).toBe(400);
    const b = await call('b', 'GET', '/cybersecurity/me');
    expect(b.data.completed).toBe(0);
    expect(b.data.agreed_at).toBeUndefined();
  });
});
