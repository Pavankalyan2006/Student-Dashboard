import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { buildKnowledgeMap, topicState, mentions } from '../../server/services/knowledgeMapMath';
import { buildBriefing, candidateItems, isHidden, pruneActions, type BriefingInput } from '../../server/services/briefingMath';
import { buildBrainPrompt } from '../../server/services/aiBrainService';
import { ToolRegistry } from '../../server/ai/tools';
import { AgentActivityService, agentActivityStores } from '../../server/services/agentActivityService';
import { applyStudentPrefs, studentAgentView, STUDENT_AGENTS } from '../../server/ai/orchestration/studentAgents';
import { AgentRegistry } from '../../server/ai/orchestration/registry';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

// ---------- Knowledge Graph ----------

describe('Knowledge Graph states', () => {
  it('never calls a topic demonstrated without enough right answers', () => {
    expect(topicState({ completed: true, revision_count: 0 }, 0, 0, 0, true).state).toBe('learning');
    expect(topicState({ completed: false, revision_count: 2 }, 0, 0, 0, false).state).toBe('practiced');
    expect(topicState({ completed: true, revision_count: 0 }, 2, 2, 0, false).state).toBe('practiced');
    expect(topicState({ completed: false, revision_count: 0 }, 4, 3, 0, false).state).toBe('demonstrated');
    expect(topicState({ completed: false, revision_count: 0 }, 5, 3, 0, false).state).toBe('practiced'); // 60%
    expect(topicState({ completed: true, revision_count: 3 }, 10, 10, 1, true).state).toBe('needs_revision');
    expect(topicState({ completed: false, revision_count: 0 }, 0, 0, 0, false).state).toBe('not_started');
  });

  it('matches labels to topics by name or most of their keywords', () => {
    expect(mentions('Process Scheduling in OS', 'Process Scheduling')).toBe(true);
    expect(mentions('CPU scheduling of processes', 'Process Scheduling')).toBe(false);
    expect(mentions('Deadlock prevention and avoidance', 'Deadlock avoidance prevention')).toBe(true);
    expect(mentions('Trees', 'Graphs')).toBe(false);
  });

  it('links evidence, orders dependencies and flags skipped foundations', () => {
    const map = buildKnowledgeMap(
      [
        {
          id: 's1',
          name: 'Operating Systems',
          topics: [
            { id: 't1', name: 'Processes', unit: 'U1', completed: false, revision_count: 0 },
            { id: 't2', name: 'Process Scheduling', unit: 'U1', completed: true, revision_count: 0 },
            { id: 't3', name: 'Deadlocks', unit: 'U2', completed: false, revision_count: 0 },
          ],
        },
      ],
      [
        { topic: 'Process Scheduling', answered: 5, correct: 4 },
        { topic: 'Compiler Design', answered: 3, correct: 1 },
      ],
      [{ topic: 'Process Scheduling', open: 1, fixed: 0 }],
      [{ id: 'n1', title: 'Deadlocks summary' }],
      []
    );
    const [p, s, d] = map.subjects[0].topics;
    expect(p.state).toBe('not_started');
    expect(s.state).toBe('needs_revision');
    expect(s.depends_on).toEqual(['t1']);
    expect(d.depends_on).toEqual([]); // different unit
    expect(d.state).toBe('learning');
    expect(d.notes).toEqual([{ id: 'n1', title: 'Deadlocks summary' }]);
    expect(map.missing_foundations).toEqual([{ subject: 'Operating Systems', topic: 'Process Scheduling', topic_id: 't2', before: 'Processes', before_id: 't1' }]);
    expect(map.next_topics[0].topic_id).toBe('t1');
    expect(map.unmatched_practice.map((u) => u.topic)).toEqual(['Compiler Design']);
    expect(map.totals).toMatchObject({ topics: 3, needs_revision: 1, learning: 1, not_started: 1 });
  });
});

// ---------- Daily Briefing ----------

const baseInput = (over: Partial<BriefingInput> = {}): BriefingInput => ({
  today: '2026-11-15',
  deadlines: [],
  tasks: [],
  due_flashcards: 0,
  open_mistakes: { total: 0, top_topics: [] },
  needs_revision: [],
  missing_foundations: [],
  next_topics: [],
  attendance: [],
  contests: [],
  ...over,
});

describe('Daily Briefing', () => {
  it('is empty when the student has no records, so nothing is invented', () => {
    const b = buildBriefing(baseInput(), {});
    expect(b.items).toEqual([]);
    expect(b.counts.total).toBe(0);
  });

  it('builds items from real records, most urgent first', () => {
    const items = candidateItems(
      baseInput({
        deadlines: [
          { id: 'e1', source: 'exam', kind: 'Minor exam', title: 'DBMS minor', date: '2026-11-16', days_left: 1, route: '/x' },
          { id: 'e2', source: 'assignment', kind: 'Assignment', title: 'OS lab record', date: '2026-11-12', days_left: -3, route: '/x' },
          { id: 'e3', source: 'exam', kind: 'End-semester exam', title: 'CN end-sem', date: '2026-11-25', days_left: 10, route: '/x', suggested_start: '2026-11-11' },
        ],
        due_flashcards: 12,
        open_mistakes: { total: 4, top_topics: ['Joins'] },
        attendance: [
          { id: 'a1', name: 'Maths', percent: 70, must_attend: 4, required: 75 },
          { id: 'a2', name: 'Physics', percent: 90, must_attend: 0, required: 75 },
        ],
        contests: [
          { id: '9', name: 'Codeforces Round 9', start: '', url: 'https://codeforces.com/contests/9', hours_away: 20 },
          { id: '10', name: 'Codeforces Round 10', start: '', url: 'https://codeforces.com/contests/10', hours_away: 100 },
        ],
      })
    );
    const ids = items.map((i) => i.id);
    expect(ids).toContain('deadline:exam:e1');
    expect(ids).toContain('deadline:assignment:e2');
    expect(ids).toContain('prep:exam:e3');
    expect(ids).toContain('attendance:a1');
    expect(ids).not.toContain('attendance:a2');
    expect(ids).toContain('flashcards:2026-11-15');
    expect(ids).toContain('contest:9');
    expect(ids).not.toContain('contest:10');
    const b = buildBriefing(baseInput({ deadlines: [{ id: 'e1', source: 'exam', kind: 'Quiz', title: 'Quiz', date: '2026-11-16', days_left: 1, route: '/x' }], due_flashcards: 3 }), {});
    expect(b.items[0].priority).toBe(1);
    expect(b.items[b.items.length - 1].kind).toBe('flashcards');
  });

  it('hides done and dismissed items, and postponed ones until their day', () => {
    const input = baseInput({ due_flashcards: 5, open_mistakes: { total: 2, top_topics: [] } });
    const at = new Date().toISOString();
    const b = buildBriefing(input, { 'flashcards:2026-11-15': { action: 'done', at }, 'mistakes:2026-11-15': { action: 'postponed', at, until: '2026-11-16' } });
    expect(b.items).toEqual([]);
    expect(b.counts).toMatchObject({ done: 1, postponed: 1 });
    expect(isHidden({ action: 'postponed', at, until: '2026-11-16' }, '2026-11-16')).toBe(false);
    // A daily nudge dismissed yesterday comes back today, because its id carries the date.
    expect(buildBriefing(input, { 'flashcards:2026-11-14': { action: 'dismissed', at } }).items.map((i) => i.kind)).toContain('flashcards');
  });

  it('keeps the action log small', () => {
    const now = Date.parse('2026-11-15T00:00:00Z');
    const old = new Date(now - 90 * 86_400_000).toISOString();
    const pruned = pruneActions({ a: { action: 'done', at: old }, b: { action: 'done', at: new Date(now).toISOString() } }, now);
    expect(Object.keys(pruned)).toEqual(['b']);
  });
});

// ---------- AI Brain prompt ----------

describe('My AI Brain', () => {
  it('tells the AI to answer only from the numbered records and mark suggestions', () => {
    const p = buildBrainPrompt('what about joins?', [{ n: 1, kind: 'note', title: 'Joins', snippet: 'Inner join keeps matching rows', route: '/notes/1' }]);
    expect(p).toContain('[1] NOTE: Joins');
    expect(p).toContain('Use ONLY what the records above say');
    expect(p).toContain('Suggestion:');
  });
});

// ---------- Agent approval and per-student agent switches ----------

describe('AI agent safety', () => {
  const sid = 'std_agent_safety';
  it('stops a data-changing tool until the student approves it, and logs both', async () => {
    agentActivityStores.log.delete(sid);
    ToolRegistry.register({
      name: 'test_change_record',
      description: 'Test tool that changes data',
      parameters: {},
      permissions: ['STUDENT'],
      timeoutMs: 1000,
      confirmationRequired: true,
      category: 'MUTATION',
      handler: async () => ({ changed: true }),
    } as any);
    await expect(ToolRegistry.execute('test_change_record', {}, { studentId: sid, role: 'STUDENT', agent: 'ProjectAgent' })).rejects.toMatchObject({ statusCode: 409, code: 'APPROVAL_REQUIRED' });
    expect(await ToolRegistry.execute('test_change_record', {}, { studentId: sid, role: 'STUDENT', confirmed: true })).toEqual({ changed: true });
    const log = AgentActivityService.list(sid);
    expect(log.map((l) => l.status)).toEqual(['ok', 'blocked']);
    expect(log[1]).toMatchObject({ agent: 'ProjectAgent', needs_approval: true, approved: false });
    expect(log[0]).toMatchObject({ approved: true, category: 'MUTATION' });
    // Nothing about parameters or results is stored.
    expect(JSON.stringify(log)).not.toContain('changed');
  });

  it('marks every tool that changes data, runs code or acts outside as needing approval in the tool list', () => {
    const asksFirst = ToolRegistry.getAll().filter((t: any) => t.confirmationRequired).map((t: any) => t.name);
    for (const name of ['delete_document', 'run_code', 'create_project', 'delete_resume']) expect(asksFirst).toContain(name);
  });

  it('leaves switched-off agents out of one student’s requests only', () => {
    agentActivityStores.prefs.delete(sid);
    agentActivityStores.prefs.delete('std_other');
    AgentActivityService.setEnabled(sid, 'coding', false);
    expect(applyStudentPrefs(sid, ['CodingAgent', 'DSAAgent', 'LearningAgent'])).toEqual({ agents: ['LearningAgent'], skipped: ['CodingAgent', 'DSAAgent'] });
    expect(applyStudentPrefs(sid, ['CodingAgent'])).toEqual({ agents: ['LearningAgent'], skipped: ['CodingAgent'] });
    expect(applyStudentPrefs('std_other', ['CodingAgent']).agents).toEqual(['CodingAgent']);
    expect(studentAgentView(sid).find((a) => a.id === 'coding')!.enabled).toBe(false);
    AgentActivityService.setEnabled(sid, 'coding', true);
    expect(AgentActivityService.prefs(sid).disabled).toEqual([]);
  });

  it('maps every specialist onto real registry agents, each in one group only', () => {
    const seen = new Set<string>();
    for (const a of STUDENT_AGENTS) {
      for (const m of a.members) {
        expect(AgentRegistry.get(m), m).toBeTruthy();
        expect(seen.has(m), m).toBe(false);
        seen.add(m);
      }
    }
    expect(STUDENT_AGENTS.map((a) => a.id)).toEqual(['academic', 'coding', 'research', 'career', 'project', 'exam', 'productivity']);
  });

  it('puts the new pages in a Personal Intelligence section', () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    for (const h of ['/briefing', '/ai-brain', '/knowledge-graph', '/agents', '/ai-memory']) expect(hrefs).toContain(h);
  });
});

// ---------- Two real accounts over HTTP ----------

describe('Personal Intelligence: per-student isolation over HTTP', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b' | null, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(who ? { authorization: `Bearer ${tokens[who]}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
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
      const r = await call(null, 'POST', '/auth/register', { full_name: `PI ${who.toUpperCase()}`, email: `pi-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      expect(r.status).toBe(201);
      tokens[who] = r.data.token;
    }
  }, 30_000);

  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('rejects every new route without a session', async () => {
    for (const [m, p] of [['GET', '/knowledge-graph/me'], ['GET', '/briefing/me'], ['GET', '/ai-brain/me'], ['POST', '/ai-brain/me/ask'], ['GET', '/ai-brain/me/export'], ['GET', '/agents/me'], ['PATCH', '/agents/me/coding'], ['GET', '/agents/me/activity']]) {
      expect((await call(null, m, p, m === 'GET' ? undefined : {})).status, `${m} ${p}`).toBe(401);
    }
  });

  it('keeps briefings, their actions and agent switches separate', async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    expect((await call('a', 'POST', '/semester/events', { title: 'A private quiz', date: tomorrow, event_type: 'QUIZ' })).status).toBe(201);
    await call('a', 'PUT', '/academics/me', { scale: 'O_10', semesters: [], attendance: { required_percent: 75, subjects: [{ name: 'A maths', attended: 6, total: 10 }] } });

    const a = await call('a', 'GET', '/briefing/me?tz=0');
    expect(a.status).toBe(200);
    const titles = a.data.items.map((i: any) => i.title);
    expect(titles).toContain('A private quiz');
    expect(titles.join(' ')).toContain('A maths attendance is 60%');
    const b = await call('b', 'GET', '/briefing/me?tz=0');
    expect(JSON.stringify(b.data)).not.toMatch(/A private quiz|A maths/);

    const quiz = a.data.items.find((i: any) => i.title === 'A private quiz');
    // B cannot act on A's item: it is not in B's briefing.
    expect((await call('b', 'POST', `/briefing/me/items/${encodeURIComponent(quiz.id)}`, { action: 'done', tz: 0 })).status).toBe(404);
    expect((await call('a', 'POST', `/briefing/me/items/${encodeURIComponent(quiz.id)}`, { action: 'later', tz: 0 })).status).toBe(400);
    expect((await call('a', 'POST', `/briefing/me/items/${encodeURIComponent(quiz.id)}`, { action: 'postponed', until: '2099-01-01', tz: 0 })).status).toBe(400);
    const planned = await call('a', 'POST', `/briefing/me/items/${encodeURIComponent(quiz.id)}/plan`, { title: 'Revise for the quiz', minutes: 40, tz: 0 });
    expect(planned.status).toBe(200);
    expect(planned.data.task).toMatchObject({ title: 'Revise for the quiz', duration_minutes: 40 });
    const after = await call('a', 'GET', '/briefing/me?tz=0');
    expect(after.data.items.map((i: any) => i.id)).not.toContain(quiz.id);
    expect(after.data.handled.map((h: any) => h.id)).toContain(quiz.id);
    expect(after.data.items.map((i: any) => i.title)).toContain('Revise for the quiz'); // now a planned task
    expect((await call('a', 'DELETE', `/briefing/me/items/${encodeURIComponent(quiz.id)}`)).status).toBe(200);

    expect((await call('a', 'PATCH', '/agents/me/coding', { enabled: false })).status).toBe(200);
    expect((await call('a', 'PATCH', '/agents/me/nope', { enabled: false })).status).toBe(404);
    expect((await call('a', 'PATCH', '/agents/me/coding', { enabled: 'no' })).status).toBe(400);
    const aAgents = await call('a', 'GET', '/agents/me');
    const bAgents = await call('b', 'GET', '/agents/me');
    expect(aAgents.data.agents.find((x: any) => x.id === 'coding').enabled).toBe(false);
    expect(bAgents.data.agents.find((x: any) => x.id === 'coding').enabled).toBe(true);
    expect(aAgents.data.tools.filter((t: any) => t.asks_first).length).toBeGreaterThan(5);
  });

  it('serves each student only their own graph, AI Brain and export', async () => {
    const graph = await call('b', 'GET', '/knowledge-graph/me');
    expect(graph.status).toBe(200);
    expect(graph.data).toHaveProperty('totals');

    const overview = await call('b', 'GET', '/ai-brain/me');
    expect(overview.data).toMatchObject({ personalize: true });
    expect((await call('b', 'POST', '/ai-brain/me/ask', { question: 'x' })).status).toBe(400);

    // With personalisation off, nothing is looked up or sent to the AI.
    await call('b', 'PATCH', '/ai-memory/me', { personalize: false });
    const refused = await call('b', 'POST', '/ai-brain/me/ask', { question: 'what are my weak topics?' });
    expect(refused.status).toBe(200);
    expect(refused.data.refused).toBeTruthy();
    expect(refused.data.sources).toEqual([]);
    await call('b', 'PATCH', '/ai-memory/me', { personalize: true });

    const exp = await fetch(`${base}/api/v1/ai-brain/me/export`, { headers: { authorization: `Bearer ${tokens.a}` } });
    expect(exp.headers.get('content-disposition')).toContain('my-ai-data.json');
    const data: any = await exp.json();
    expect(data.agent_switches.disabled).toEqual(['coding']);
    expect(JSON.stringify(data)).not.toMatch(/@example\.com|Str0ng/);
    const expB: any = await (await fetch(`${base}/api/v1/ai-brain/me/export`, { headers: { authorization: `Bearer ${tokens.b}` } })).json();
    expect(expB.agent_switches.disabled).toEqual([]);
    expect(JSON.stringify(expB)).not.toContain('A private quiz');
  });
});
