import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

/**
 * Phase 8 QA: cross-student checks that the per-module tests did not already make.
 * Student B tries to change or remove records that belong to student A, through the HTTP API,
 * and A's records must be unchanged afterwards. (Reads across students are covered in each
 * module's own tests: code review, previous papers, competition hub, research, personal
 * intelligence, search.)
 */
describe('Phase 8: one student cannot change another student’s records', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const ids: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b', method: string, path: string, body?: unknown) => {
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
    for (const who of ['a', 'b'] as const) {
      const r = await fetch(`${base}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ full_name: `P8 ${who}`, email: `p8-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' }),
      }).then((x) => x.json() as Promise<any>);
      tokens[who] = r.data.token;
      ids[who] = r.data.student.id;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('competition events: another student cannot delete or recheck them', async () => {
    const made = await call('a', 'POST', '/competitions/events', { title: 'City Hack Night', kind: 'HACKATHON', source_url: 'https://example.org/hack' });
    expect(made.status).toBe(201);
    const id = made.data.id;
    expect((await call('b', 'DELETE', `/competitions/events/${id}`)).status).toBeGreaterThanOrEqual(403);
    expect((await call('b', 'POST', `/competitions/events/${id}/recheck`)).status).toBeGreaterThanOrEqual(403);
    const feed = await call('a', 'GET', '/competitions/feed');
    expect(JSON.stringify(feed.data)).toContain('City Hack Night');
  });

  it('research: another student cannot delete the project or change its linked experiments', async () => {
    const { MlLabService } = await import('../../server/services/mlLabService');
    const proj = await call('a', 'POST', '/research', { title: 'P8 isolation', topic: 'Traffic', domain: 'AI', branch: 'CSE', research_type: 'EXPERIMENTAL', objective: 'check' });
    const pid = proj.data.id;
    const spec = { dataset_id: 'ds_iris', dataset_name: 'Iris', target_column: 'species', feature_columns: ['petal_length', 'petal_width'], task_type: 'CLASSIFICATION', model_type: 'decision_tree', train_split: 0.8 };
    const mine = await MlLabService.runExperiment(ids.a, { name: 'a run', ...spec } as any);
    const theirs = await MlLabService.runExperiment(ids.b, { name: 'b run', ...spec } as any);
    expect((await call('a', 'POST', `/research/${pid}/experiments`, { experiment_id: mine.id })).status).toBe(200);

    expect((await call('b', 'POST', `/research/${pid}/experiments`, { experiment_id: theirs.id })).status).toBeGreaterThanOrEqual(403);
    expect((await call('b', 'DELETE', `/research/${pid}/experiments/${mine.id}`)).status).toBeGreaterThanOrEqual(403);
    expect((await call('b', 'DELETE', `/research/${pid}`)).status).toBeGreaterThanOrEqual(403);

    const after = await call('a', 'GET', `/research/${pid}/experiments`);
    expect(after.data.linked.map((x: any) => x.id)).toEqual([mine.id]);
  });

  it('documents: another student cannot open or delete them', async () => {
    const up = await call('a', 'POST', '/documents', {
      title: 'P8 private notes',
      originalName: 'p8.txt',
      mimeType: 'text/plain',
      sizeBytes: 40,
      contentBase64: Buffer.from('Private revision notes on deadlock.').toString('base64'),
    });
    expect(up.status).toBeLessThan(300);
    const id = up.data.id;
    expect((await call('b', 'GET', `/documents/${id}`)).status).toBeGreaterThanOrEqual(403);
    expect((await call('b', 'DELETE', `/documents/${id}`)).status).toBeGreaterThanOrEqual(403);
    expect((await call('a', 'GET', `/documents/${id}`)).status).toBe(200);
  });
});
