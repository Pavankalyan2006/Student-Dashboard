import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { stepEvidence, EVIDENCE_TARGETS, type RoadmapActivity } from '../../server/services/careerService';
import { deliveryMetrics, deliverySummary } from '../../server/services/interviewDelivery';
import { PHASE5_CAREER_TRACKS } from '../../server/db/seedCareerTracks';
import { SEED_CAREER_ROLES } from '../../server/db/seedCareerResume';
import { MOCK_INTERVIEW_CATEGORIES, MOCK_INTERVIEW_QUESTION_CATALOG } from '../../server/db/mockInterviewCatalog';

const none: RoadmapActivity = { courses: {}, dsa_solved: 0, projects: 0, interviews_completed: 0, evidenced_skills: [] };

describe('Career tracks', () => {
  it('covers every track the brief lists', () => {
    const names = SEED_CAREER_ROLES.map((r) => r.name).join(' | ');
    for (const t of ['Applied AI Engineer', 'Machine Learning', 'Data Scientist', 'Data Analyst', 'Full Stack', 'Frontend', 'Backend', 'Software Development Engineer', 'Cloud Engineer', 'DevOps', 'Cyber Security', 'Data Engineer', 'Research Scientist', 'Product Manager', 'Higher Studies', 'Competitive Examinations', 'Entrepreneurship']) {
      expect(names).toContain(t);
    }
    expect(new Set(SEED_CAREER_ROLES.map((r) => r.id)).size).toBe(SEED_CAREER_ROLES.length);
  });

  it('new tracks link only to catalogue courses and do not claim an outside standard', async () => {
    const { db } = await import('../../server/db/database');
    for (const t of PHASE5_CAREER_TRACKS) {
      for (const c of t.recommended_courses) expect(await db.getCourseById(c), `${t.id}: ${c}`).toBeTruthy();
      expect(t.source_metadata.source_name).toMatch(/Platform curriculum guidance/);
      expect(t.typical_learning_path.length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('Career roadmaps: progress comes from activity', () => {
  const role = { id: 'role_x', skills: ['Python', 'SQL'] };
  it('verifies each kind of step only from real records', () => {
    expect(stepEvidence({ source_type: 'COURSE', source_id: 'c1' }, role, none)).toEqual({ verified: false, detail: 'Not started' });
    expect(stepEvidence({ source_type: 'COURSE', source_id: 'c1' }, role, { ...none, courses: { c1: { lessons_total: 4, lessons_completed: 3 } } }).verified).toBe(false);
    expect(stepEvidence({ source_type: 'COURSE', source_id: 'c1' }, role, { ...none, courses: { c1: { lessons_total: 4, lessons_completed: 4 } } })).toEqual({ verified: true, detail: '4 of 4 lessons completed' });
    expect(stepEvidence({ source_type: 'DSA', source_id: 'x' }, role, { ...none, dsa_solved: EVIDENCE_TARGETS.dsa_solved - 1 }).verified).toBe(false);
    expect(stepEvidence({ source_type: 'DSA', source_id: 'x' }, role, { ...none, dsa_solved: EVIDENCE_TARGETS.dsa_solved }).verified).toBe(true);
    expect(stepEvidence({ source_type: 'PROJECT', source_id: 'x' }, role, { ...none, projects: 1 }).verified).toBe(true);
    expect(stepEvidence({ source_type: 'PLACEMENT', source_id: 'x' }, role, none).detail).toBe('No mock interview completed yet');
    expect(stepEvidence({ source_type: 'NOTES', source_id: 'role_x_path_2' }, role, { ...none, evidenced_skills: ['SQL'] })).toEqual({ verified: true, detail: 'Evidence recorded for SQL' });
    expect(stepEvidence({ source_type: 'NOTES', source_id: 'role_x_path_1' }, role, { ...none, evidenced_skills: ['SQL'] }).verified).toBe(false);
  });
});

describe('Interview delivery measures', () => {
  it('counts fillers, structure and pace from the text', () => {
    const m = deliveryMetrics('Um, basically I built a cache. First, I measured the slow query. Then I added Redis because reads dominated. As a result, we reduced latency.', 30);
    expect(m.words).toBe(25);
    expect(m.sentences).toBe(4);
    expect(m.filler_words).toBe(2);
    expect(m.fillers_found).toEqual(['um', 'basically']);
    expect(m.structure_markers).toBeGreaterThanOrEqual(3);
    expect(m.star_parts).toEqual(expect.arrayContaining(['Action', 'Result']));
    expect(m.words_per_minute).toBe(50);
    expect(deliveryMetrics('I like Python. It is actually nice.').filler_words).toBe(0); // "like" and "actually" are not counted
    expect(deliveryMetrics('Yes.').notes[0]).toMatch(/Short answer/);
  });

  it('summarises a session and compares time used with time planned', () => {
    const s = deliverySummary([deliveryMetrics('first a then b', 20), deliveryMetrics('um ok')], 10, 15 * 60);
    expect(s).toMatchObject({ answers_measured: 2, total_filler_words: 1, answers_with_structure: 1, time_used_minutes: 15, time_planned_minutes: 10 });
    expect(s.time_note).toMatch(/shorter answers/);
    expect(s.disclaimer).toMatch(/not a measure of confidence/);
  });

  it('offers project-based and communication interviews', () => {
    const ids = MOCK_INTERVIEW_CATEGORIES.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['PROJECT', 'COMMUNICATION', 'HR', 'TECHNICAL', 'CODING', 'SQL', 'SYSTEM_DESIGN', 'AI_ML', 'RESUME', 'BEHAVIORAL']));
    expect(MOCK_INTERVIEW_QUESTION_CATALOG.filter((q) => q.category === 'COMMUNICATION').length).toBeGreaterThanOrEqual(4);
  });
});

describe('Phase 5 career features over HTTP', () => {
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
      const r = await call(null, 'POST', '/auth/register', { full_name: `P5 ${who}`, email: `p5-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('lets a student hold several goals, and a self-marked tick does not count as progress', async () => {
    expect((await call('a', 'GET', '/career/roadmaps')).data).toEqual([]); // nothing is picked for a new student
    const de = await call('a', 'POST', '/career/roadmaps', { role_id: 'role_data_engineer' });
    const pm = await call('a', 'POST', '/career/roadmaps', { role_id: 'role_product_manager' });
    expect([de.status, pm.status]).toEqual([201, 201]);
    expect(de.data.verified_progress).toMatchObject({ done: 0, percent: 0 });
    expect(de.data.steps.every((s: any) => s.evidence && s.evidence.verified === false)).toBe(true);
    expect((await call('a', 'GET', '/career/roadmaps')).data).toHaveLength(2);

    const step = de.data.steps[0];
    expect((await call('a', 'PATCH', `/career/roadmaps/${de.data.id}/steps/${step.id}`, { status: 'HACKED' })).status).toBe(400);
    const ticked = await call('a', 'PATCH', `/career/roadmaps/${de.data.id}/steps/${step.id}`, { status: 'COMPLETED' });
    expect(ticked.data.self_marked_done).toBeGreaterThanOrEqual(1);
    expect(ticked.data.verified_progress.done).toBe(0);
    expect(ticked.data.status).toBe('IN_PROGRESS');

    expect([403, 404]).toContain((await call('b', 'GET', `/career/roadmaps/${de.data.id}`)).status);
    expect((await call('a', 'DELETE', `/career/roadmaps/${pm.data.id}`)).status).toBe(200);
    expect((await call('a', 'GET', '/career/roadmaps')).data).toHaveLength(1);
  });

  it('counts a created project as evidence for the project step', async () => {
    const rm = await call('b', 'POST', '/career/roadmaps', { role_id: 'role_entrepreneur' });
    const projStep = () => (rm.data.steps as any[]).find((s) => s.source_type === 'PROJECT');
    expect(projStep().evidence.verified).toBe(false);
    const p = await call('b', 'POST', '/projects', { title: 'Canteen pre-order MVP', description: 'Students order food ahead of time.', technologies: ['React', 'Node.js'] });
    expect(p.status).toBe(201);
    const again = await call('b', 'GET', `/career/roadmaps/${rm.data.id}`);
    expect(again.data.steps.find((s: any) => s.source_type === 'PROJECT').evidence).toMatchObject({ verified: true });
    expect(again.data.verified_progress.done).toBeGreaterThanOrEqual(1);
  });

  it('runs a project-based interview only from the student’s own projects, and measures delivery', async () => {
    const refused = await call('a', 'POST', '/mock-interviews/sessions', { category: 'PROJECT', target_role: 'Software Development Engineer', max_questions: 2 });
    expect(refused.status).toBe(400);
    expect(refused.json.message).toMatch(/at least one project/);

    const s = await call('b', 'POST', '/mock-interviews/sessions', { category: 'PROJECT', target_role: 'Software Development Engineer', max_questions: 2 });
    expect(s.status).toBe(201);
    const q = s.data.initial_question;
    expect(q.question).toContain('Canteen pre-order MVP');
    expect(JSON.stringify(s.data)).not.toMatch(/P5 b|p5-b-/);

    const ans = await call('b', 'POST', `/mock-interviews/sessions/${s.data.session.id}/answers`, {
      question_id: q.id,
      answer_text: 'First, the React app sends orders to a Node API because it keeps the client simple. Then the API stores them in a database. As a result, students skip the queue.',
      duration_seconds: 40,
    });
    expect(ans.status).toBe(200);
    expect(ans.data.answer.delivery).toMatchObject({ words: 31, filler_words: 0 });
    expect(ans.data.answer.delivery.structure_markers).toBeGreaterThanOrEqual(3);
  });

  it('offers communication practice from the catalogue', async () => {
    const s = await call('a', 'POST', '/mock-interviews/sessions', { category: 'COMMUNICATION', target_role: 'Software Development Engineer', max_questions: 2 });
    expect(s.status).toBe(201);
    expect(s.data.initial_question.rubric.map((r: any) => r.dimension)).toContain('Clarity');
  });

  it('keeps new portfolio sections private until the student turns them on', async () => {
    const me = await call('a', 'GET', '/showcase/me');
    expect(me.status).toBe(200);
    expect(me.data.settings.sections).toMatchObject({ education: true, research: false, competitions: false, skills: true });
    const on = await call('a', 'PUT', '/showcase/me', { sections: { research: true, education: false } });
    expect(on.data.sections).toMatchObject({ research: true, education: false, competitions: false, projects: true });
  });

  it('tracks any kind of opportunity with the new statuses', async () => {
    const bad = await call('a', 'POST', '/applications', { company_name: 'X', role: 'Y', opportunity_type: 'LOTTERY' });
    expect(bad.status).toBe(400);
    const made = await call('a', 'POST', '/applications', { company_name: 'A Foundation', role: 'Merit scholarship', opportunity_type: 'SCHOLARSHIP', status: 'INTERESTED', application_url: 'https://example.org/scholarship' });
    expect(made.status).toBe(201);
    expect(made.data).toMatchObject({ opportunity_type: 'SCHOLARSHIP', status: 'INTERESTED' });
    for (const st of ['PREPARING', 'APPLIED', 'CLOSED']) {
      const r = await call('a', 'PATCH', `/applications/${made.data.id}/status`, { status: st });
      expect([r.status, r.data?.status]).toEqual([200, st]);
    }
    expect((await call('b', 'PATCH', `/applications/${made.data.id}/status`, { status: 'APPLIED' })).status).toBe(404);
  });
});
