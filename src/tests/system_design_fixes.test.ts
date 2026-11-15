import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { systemDesignReadiness } from '../../server/db/database';

describe('System Design Lab: readiness comes from real activity', () => {
  it('is 0 for a new student and grows with lessons, challenges, interviews and designs', () => {
    expect(systemDesignReadiness({}, 69)).toBe(0);
    expect(systemDesignReadiness({ completed_lessons: Array(69).fill('l') }, 69)).toBe(40);
    expect(systemDesignReadiness({ completed_challenges: ['a', 'b', 'c', 'd', 'e', 'f'] }, 69)).toBe(30);
    expect(systemDesignReadiness({ interview_sessions_completed: 1, total_projects_created: 3 }, 69)).toBe(17);
    expect(systemDesignReadiness({ completed_lessons: ['x'] }, 0)).toBe(0);
  });
});

describe('System Design Lab over HTTP', () => {
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
      const r = await call(null, 'POST', '/auth/register', { full_name: `SD ${who}`, email: `sdfix-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('shows a new student 0% readiness, not a made-up starting score', async () => {
    const r = await call('a', 'GET', '/system-design/analytics');
    expect(r.status).toBe(200);
    expect(r.data.progress.readiness_score).toBe(0);
  });

  it('saves a first design with its canvas in one request (the draft flow)', async () => {
    const comps = [{ id: 'c1', name: 'Web', category: 'APPLICATION', type: 'WEB_CLIENT', description: '', position: { x: 0, y: 0 } }];
    const r = await call('a', 'POST', '/system-design/projects', { title: 'My first design', components: comps, connections: [], diagrams: [{ kind: 'flowchart', title: 'F', source: 'a --> b' }] });
    expect(r.status).toBe(201);
    expect(r.data.components).toHaveLength(1);
    expect(r.data.diagrams[0]).toMatchObject({ kind: 'flowchart', source: 'a --> b' });
    expect((await call('a', 'POST', '/system-design/projects', { title: 'Bad', diagrams: [{ kind: 'gantt', source: '' }] })).status).toBe(400);
  });

  it('never lets a client choose a project id, so one student cannot overwrite another’s design', async () => {
    const a = await call('a', 'POST', '/system-design/projects', { title: 'A design' });
    const b = await call('b', 'POST', '/system-design/projects', { id: a.data.id, title: 'B takeover' });
    expect(b.status).toBe(201);
    expect(b.data.id).not.toBe(a.data.id);
    const still = await call('a', 'GET', `/system-design/projects/${a.data.id}`);
    expect(still.data.title).toBe('A design');
  });
});
