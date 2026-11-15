import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { sortEvents, upcomingDeadlines, newJoinCode, webUrl, type StudentEvent } from '../../server/services/competitionHubService';
import * as deadlineService from '../../server/services/deadlineService';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const ev = (id: string, o: Partial<StudentEvent>): StudentEvent => ({
  id, student_id: 's', title: id, kind: 'HACKATHON', organiser: '', source_url: 'https://example.org/e', notes: '', checked_at: '', created_at: '', updated_at: '', ...o,
});

describe('Competition Hub: pure helpers', () => {
  it('lists upcoming events first, then undated, then past', () => {
    const out = sortEvents([ev('past', { end_date: '2026-01-01' }), ev('none', {}), ev('later', { start_date: '2026-12-20' }), ev('soon', { registration_deadline: '2026-11-20' })], '2026-11-15');
    expect(out.map((e) => e.id)).toEqual(['soon', 'later', 'none', 'past']);
  });

  it('builds deadlines only from entered dates and tracked verified contests', () => {
    const d = upcomingDeadlines(
      [ev('a', { title: 'Hack A', registration_deadline: '2026-11-20', start_date: '2026-11-25' }), ev('b', { title: 'Old', start_date: '2026-01-01' })],
      [
        { id: 1, name: 'Round 1', start: '2026-11-18T14:35:00.000Z', duration_minutes: 120, url: 'https://codeforces.com/contests/1' },
        { id: 2, name: 'Round 2', start: '2026-11-19T14:35:00.000Z', duration_minutes: 120, url: 'https://codeforces.com/contests/2' },
      ],
      [{ ref: 'cf:1', status: 'REGISTERED' } as any, { ref: 'cf:2', status: 'WITHDRAWN' } as any],
      '2026-11-15T00:00:00.000Z'
    );
    expect(d.map((x) => [x.title, x.what])).toEqual([
      ['Round 1', 'Starts'],
      ['Hack A', 'Registration closes'],
      ['Hack A', 'Starts'],
    ]);
    expect(d[1].source).toBe('Added by you from example.org');
  });

  it('makes readable join codes and accepts only web links', () => {
    const c = newJoinCode();
    expect(c).toMatch(/^[A-HJKMNP-Z2-9]{8}$/);
    expect(webUrl('https://devpost.com/x', 'x')).toBe('https://devpost.com/x');
    expect(() => webUrl('javascript:alert(1)', 'x')).toThrow(/http/);
    expect(() => webUrl('', 'Source link', true)).toThrow(/required/);
  });

  it('is in the navigation', () => {
    expect(ALL_NAV_ITEMS.map((i) => i.href)).toContain('/competitions');
  });
});

describe('Competition Hub over HTTP', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b' | 'c', string> = { a: '', b: '', c: '' };
  const call = async (who: 'a' | 'b' | 'c' | null, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', ...(who ? { authorization: `Bearer ${tokens[who]}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data, json };
  };
  beforeAll(async () => {
    // The verified feed: one upcoming Codeforces round, served by a stubbed fetch.
    deadlineService.resetContestCache();
    const start = Math.floor(Date.now() / 1000) + 3 * 86400;
    const realFetch = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation(((url: any, init?: any) => {
      if (String(url).startsWith('https://codeforces.com/api/contest.list')) {
        return Promise.resolve(new Response(JSON.stringify({ status: 'OK', result: [{ id: 2001, name: 'Codeforces Round 2001', phase: 'BEFORE', startTimeSeconds: start, durationSeconds: 7200 }] }), { status: 200 }));
      }
      return realFetch(url, init);
    }) as typeof fetch);
    const { createApp } = await import('../../server/app');
    const app = await createApp();
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b', 'c'] as const) {
      const r = await call(null, 'POST', '/auth/register', { full_name: `Hub ${who}`, email: `hub-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
  }, 30_000);
  afterAll(() => {
    vi.restoreAllMocks();
    return new Promise<void>((done) => (server ? server.close(() => done()) : done()));
  });

  it('needs a session', async () => {
    expect((await call(null, 'GET', '/competitions/feed')).status).toBe(401);
  });

  it('shows verified contests with their source, and student events only to their owner', async () => {
    const feed = await call('a', 'GET', '/competitions/feed');
    expect(feed.status).toBe(200);
    expect(feed.data.verified).toMatchObject({ available: true, source: { name: 'Codeforces API' } });
    expect(feed.data.verified.contests[0]).toMatchObject({ id: 2001, url: 'https://codeforces.com/contests/2001' });
    expect(feed.data.verified.fetched_at).toBeTruthy();

    expect((await call('a', 'POST', '/competitions/events', { title: 'No source', kind: 'HACKATHON' })).status).toBe(400);
    expect((await call('a', 'POST', '/competitions/events', { title: 'Bad link', kind: 'HACKATHON', source_url: 'javascript:alert(1)' })).status).toBe(400);
    expect((await call('a', 'POST', '/competitions/events', { title: 'Bad kind', kind: 'PARTY', source_url: 'https://x.org' })).status).toBe(400);
    expect((await call('a', 'POST', '/competitions/events', { title: 'Backwards', kind: 'HACKATHON', source_url: 'https://x.org', start_date: '2026-12-02', end_date: '2026-12-01' })).status).toBe(400);
    const made = await call('a', 'POST', '/competitions/events', { title: 'Campus Hack', kind: 'HACKATHON', source_url: 'https://campus.example.org/hack', registration_deadline: '2099-01-10', start_date: '2099-01-20' });
    expect(made.status).toBe(201);
    expect(made.data.checked_at).toBeTruthy();
    const mine = await call('a', 'GET', '/competitions/feed');
    expect(mine.data.my_events.map((e: any) => e.title)).toEqual(['Campus Hack']);
    expect(mine.data.my_events[0].source_host).toBe('campus.example.org');
    expect((await call('b', 'GET', '/competitions/feed')).data.my_events).toEqual([]);
    expect((await call('b', 'PATCH', `/competitions/events/${made.data.id}`, { title: 'x' })).status).toBe(404);
    expect((await call('b', 'PUT', `/competitions/participation/${encodeURIComponent(`ev:${made.data.id}`)}`, { status: 'INTERESTED' })).status).toBe(404);
  });

  it('tracks participation, submissions and self-reported results', async () => {
    const ref = encodeURIComponent('cf:2001');
    expect((await call('a', 'PUT', `/competitions/participation/${encodeURIComponent('cf:999')}`, { status: 'INTERESTED' })).status).toBe(404);
    const t = await call('a', 'PUT', `/competitions/participation/${ref}`, { status: 'REGISTERED' });
    expect(t.status).toBe(200);
    expect(t.data.event).toMatchObject({ title: 'Codeforces Round 2001', kind: 'CODING_CONTEST' });
    expect(t.data.event.source).toMatch(/^Codeforces API, fetched /);
    expect((await call('a', 'GET', '/competitions/feed')).data.deadlines.map((d: any) => d.title)).toContain('Codeforces Round 2001');

    expect((await call('a', 'PUT', `/competitions/participation/${ref}/submission`, { title: '' })).status).toBe(400);
    const s = await call('a', 'PUT', `/competitions/participation/${ref}/submission`, { title: 'My solutions', repo_url: 'https://github.com/x/y' });
    expect(s.data.status).toBe('PARTICIPATED');
    expect((await call('a', 'PUT', `/competitions/participation/${ref}/result`, { outcome: 'GOLD' })).status).toBe(400);
    expect((await call('a', 'PUT', `/competitions/participation/${ref}/result`, { outcome: 'RANKED', rank: -3 })).status).toBe(400);
    const r = await call('a', 'PUT', `/competitions/participation/${ref}/result`, { outcome: 'RANKED', rank: 412, proof_url: 'https://codeforces.com/contest/2001/standings' });
    expect(r.data.result).toMatchObject({ outcome: 'RANKED', rank: 412 });
    const list = await call('a', 'GET', '/competitions/participation');
    expect(list.data.summary).toMatchObject({ tracked: 1, participated: 1, submissions: 1, results_recorded: 1 });
    expect((await call('b', 'GET', '/competitions/participation')).data.items).toEqual([]);
    expect((await call('b', 'PUT', `/competitions/participation/${ref}/result`, { outcome: 'WINNER' })).status).toBe(404);
  });

  it('forms teams by join code, shows only chosen display names, and keeps tasks within the team', async () => {
    expect((await call('a', 'POST', '/competitions/teams', { name: 'Null Pointers' })).status).toBe(400); // display name required
    const team = await call('a', 'POST', '/competitions/teams', { name: 'Null Pointers', display_name: 'Asha', event_ref: 'cf:2001' });
    expect(team.status).toBe(201);
    expect(team.data.join_code).toMatch(/^[A-Z2-9]{8}$/);
    expect(team.data.event.title).toBe('Codeforces Round 2001');
    const id = team.data.id;

    expect((await call('b', 'GET', `/competitions/teams/${id}`)).status).toBe(404);
    expect((await call('b', 'POST', '/competitions/teams/join', { code: 'WRONG123', display_name: 'Ravi' })).status).toBe(404);
    const joined = await call('b', 'POST', '/competitions/teams/join', { code: team.data.join_code.toLowerCase(), display_name: 'Ravi' });
    expect(joined.status).toBe(200);
    expect(joined.data.join_code).toBeNull(); // only the owner sees the code
    expect(joined.data.members.map((m: any) => m.display_name)).toEqual(['Asha', 'Ravi']);
    expect(JSON.stringify(joined.data)).not.toMatch(/Hub a|hub-a-|@example\.com/);

    const withTask = await call('b', 'POST', `/competitions/teams/${id}/tasks`, { title: 'Build the API', assignee: 'm1', due_date: '2099-01-15' });
    expect(withTask.status).toBe(201);
    const task = withTask.data.tasks[0];
    expect(task.assignee).toBe('m1');
    expect((await call('a', 'PATCH', `/competitions/teams/${id}/tasks/${task.id}`, { status: 'DONE' })).data.tasks[0].status).toBe('DONE');
    expect((await call('a', 'POST', `/competitions/teams/${id}/tasks`, { title: 'x', assignee: 'm9' })).status).toBe(400);
    expect((await call('c', 'PATCH', `/competitions/teams/${id}/tasks/${task.id}`, { status: 'TODO' })).status).toBe(404);

    expect((await call('b', 'PATCH', `/competitions/teams/${id}`, { name: 'Takeover' })).status).toBe(403);
    expect((await call('b', 'PATCH', `/competitions/teams/${id}`, { project: { title: 'Campus app', repo_url: 'https://github.com/t/app' } })).data.project.title).toBe('Campus app');
    expect((await call('b', 'POST', `/competitions/teams/${id}/code`)).status).toBe(403);

    // The owner removes Ravi: the code changes, so the old code no longer works.
    const removed = await call('a', 'DELETE', `/competitions/teams/${id}/members/m2`);
    expect(removed.data.members).toHaveLength(1);
    expect(removed.data.join_code).not.toBe(team.data.join_code);
    expect((await call('b', 'POST', '/competitions/teams/join', { code: team.data.join_code, display_name: 'Ravi' })).status).toBe(404);
    expect((await call('b', 'GET', '/competitions/teams')).data).toEqual([]);

    // The owner leaving an otherwise empty team deletes it.
    expect((await call('a', 'POST', `/competitions/teams/${id}/leave`)).status).toBe(200);
    expect((await call('a', 'GET', `/competitions/teams/${id}`)).status).toBe(404);
  });

  it('hands ownership on when the owner leaves', async () => {
    const t = await call('a', 'POST', '/competitions/teams', { name: 'Handover', display_name: 'A' });
    await call('c', 'POST', '/competitions/teams/join', { code: t.data.join_code, display_name: 'C' });
    await call('a', 'POST', `/competitions/teams/${t.data.id}/leave`);
    const seen = await call('c', 'GET', `/competitions/teams/${t.data.id}`);
    expect(seen.data.is_owner).toBe(true);
    expect(seen.data.join_code).not.toBe(t.data.join_code);
    expect(seen.data.members.map((m: any) => [m.display_name, m.role])).toEqual([['C', 'OWNER']]);
  });
});
