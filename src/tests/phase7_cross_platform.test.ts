import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { queryTokens, scoreText, snippet } from '../../server/services/globalSearchService';
import { reminderCandidates, categoryEnabled, leadDays, cleanCategories, type ReminderInput } from '../../server/services/notificationCategories';
import { fromBriefingItem, MAX_RECOMMENDATIONS } from '../../server/services/recommendationService';

describe('Search matching', () => {
  it('needs every word, ranks title hits higher, and shows the passage around the match', () => {
    expect(queryTokens('  Paging, TLB! a ')).toEqual(['paging', 'tlb']);
    expect(scoreText(['paging', 'tlb'], 'Paging notes', 'virtual memory only', 'paging tlb')).toBe(0);
    const title = scoreText(['paging'], 'Paging and TLB', '', 'paging');
    const body = scoreText(['paging'], 'OS notes', 'paging maps pages', 'paging');
    expect(title).toBeGreaterThan(body);
    expect(body).toBeGreaterThan(0);
    const long = `${'x '.repeat(200)}the translation lookaside buffer caches page table entries ${'y '.repeat(200)}`;
    const s = snippet(long, ['lookaside']);
    expect(s).toMatch(/^….*lookaside.*…$/);
    expect(s.length).toBeLessThan(170);
  });
});

describe('Search word matching', () => {
  it('matches at the start of words, keeps short words whole and hyphenated terms together', () => {
    expect(queryTokens('METR-LA dataset')).toEqual(['metr-la', 'dataset']);
    expect(scoreText(queryTokens('METR-LA'), 'Fluid Mechanics', 'symmetric flow in large labs', 'metr-la')).toBe(0);
    expect(scoreText(queryTokens('METR-LA'), 'GNN paper', 'trained on the METR-LA dataset', 'metr-la')).toBeGreaterThan(0);
    expect(scoreText(queryTokens('metr la'), 'GNN paper', 'trained on the METR-LA dataset', 'metr la')).toBeGreaterThan(0);
    expect(scoreText(['os'], 'Cosine similarity', 'oscillators', 'os')).toBe(0);
    expect(scoreText(['os'], 'OS notes', '', 'os')).toBeGreaterThan(0);
    expect(scoreText(['pag'], 'Paging and TLB', '', 'pag')).toBeGreaterThan(0);
    expect(scoreText(['c++'], 'Intro to C++ templates', '', 'c++')).toBeGreaterThan(0);
    expect(snippet(`${'z '.repeat(120)}symmetric matrices, then metro lines`, ['metr'])).toMatch(/^…[^…]*metro lines$/);
  });
});

describe('Reminder categories', () => {
  const base: ReminderInput = {
    today: '2026-11-15', studentId: 'me', today_tasks: 0, due_flashcards: 0, deadlines: [], applications: [], hub_deadlines: [], teams: [],
  };
  it('builds reminders only from dated records inside the lead time', () => {
    const c = reminderCandidates({
      ...base,
      deadlines: [
        { id: 'e1', source: 'exam', kind: 'Minor exam', title: 'DBMS', date: '2026-11-17', route: '/semester' } as any,
        { id: 'a1', source: 'assignment', kind: 'Assignment', title: 'OS lab 3', date: '2026-11-15', route: '/semester' } as any,
        { id: 'p1', source: 'project', kind: 'Project milestone', title: 'MVP (Bus app)', date: '2026-11-16', route: '/projects/x' } as any,
        { id: 'g1', source: 'goal', kind: 'Goal', title: 'Goal', date: '2026-11-16', route: '/goals' } as any, // goals have their own reminder
        { id: 'e2', source: 'exam', kind: 'End-semester exam', title: 'Maths', date: '2026-12-20', route: '/semester' } as any, // too far
        { id: 'e3', source: 'exam', kind: 'Quiz', title: 'Old', date: '2026-11-10', route: '/semester' } as any, // past
      ],
      applications: [
        { id: 'ap1', role: 'SDE Intern', company_name: 'Acme', status: 'INTERVIEW', interview_date: '2026-11-16' },
        { id: 'ap2', role: 'Analyst', company_name: 'Beta', status: 'REJECTED', interview_date: '2026-11-16' },
      ],
      hub_deadlines: [{ ref: 'ev:1', title: 'Hack Night', what: 'Registration closes', date: '2026-11-18', source: 'Added by you from example.org' } as any],
      teams: [{ id: 't1', name: 'Null Pointers', members: [{ student_id: 'me' }], tasks: [{ id: 'k1', title: 'Pitch deck', status: 'TODO', assignee_id: 'me', due_date: '2026-11-16' }, { id: 'k2', title: 'Done thing', status: 'DONE', assignee_id: 'me', due_date: '2026-11-16' }] } as any],
      today_tasks: 2,
      due_flashcards: 5,
    }, 3);
    const cats = c.map((x) => x.category).sort();
    expect(cats).toEqual(['assignments', 'exams', 'interview_sessions', 'opportunity_deadlines', 'project_deadlines', 'revision', 'study_reminders', 'team_updates']);
    expect(c.find((x) => x.category === 'exams')!.title).toBe('Minor exam in 2 days: DBMS');
    expect(c.find((x) => x.category === 'assignments')!.title).toMatch(/^Assignment today/);
    expect(new Set(c.map((x) => x.key)).size).toBe(c.length);
  });
  it('honours category switches, older switches and the lead time setting', () => {
    expect(categoryEnabled({ categories: { exams: false } }, 'exams')).toBe(false);
    expect(categoryEnabled({ exam_reminders: false }, 'exams')).toBe(false);
    expect(categoryEnabled({ in_app: false }, 'revision')).toBe(false);
    expect(categoryEnabled({}, 'team_updates')).toBe(true);
    expect(leadDays({ reminder_lead_days: 7 })).toBe(7);
    expect(leadDays({ reminder_lead_days: 99 })).toBe(3);
    expect(cleanCategories({ exams: false, hacker: true, revision: 'no' })).toEqual({ exams: false });
  });
});

describe('Next activities', () => {
  it('carry the briefing reason and source and stay at three or fewer', () => {
    const r = fromBriefingItem({ id: 'b1', kind: 'flashcards', priority: 1, title: 'Review 5 flashcards', detail: '5 cards are due today', source: 'Flashcards', route: '/flashcards', minutes: 10 });
    expect(r.reason).toBe('5 cards are due today');
    expect(r.source).toBe('Flashcards');
    expect(r.briefing_item_id).toBe('b1');
    expect(MAX_RECOMMENDATIONS).toBe(3);
  });
});

describe('Cross-platform API', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const ids: Record<'a' | 'b', string> = { a: '', b: '' };
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
      const r = await call(null, 'POST', '/auth/register', { full_name: `P7 ${who}`, email: `p7-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
      ids[who] = r.data.student?.id;
    }
  }, 30_000);
  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('searches the student’s own notes and document pages, and never another student’s', async () => {
    const { db } = await import('../../server/db/database');
    await db.createNote({ student_id: ids.a, title: 'Quokkasort revision', description: 'my notes', content: 'Quokkasort is stable.', source_type: 'MANUAL', note_type: 'SUMMARY', level: 'BEGINNER', length: 'SHORT', tags: [] } as any);
    const doc = await db.createDocument({ student_id: ids.a, title: 'Algorithms handout', original_filename: 'algo.pdf', mime_type: 'application/pdf', file_extension: 'pdf', file_size: 10, storage_key: 'k', status: 'READY' } as any);
    await db.createDocumentPages(doc.id, ids.a, [{ page_number: 1, text: 'Sorting overview' }, { page_number: 2, text: 'The zebrafold partition step runs in linear time.' }]);

    const n = await call('a', 'GET', '/search?q=quokkasort');
    expect(n.status).toBe(200);
    const note = n.data.items.find((i: any) => i.type === 'notes');
    expect(note.source).toBe('Your notes');
    expect(note.private).toBe(true);

    const d = await call('a', 'GET', '/search?q=zebrafold%20partition&type=documents');
    expect(d.data.items).toHaveLength(1);
    expect(d.data.items[0].url).toBe(`/documents/${doc.id}/page/2`);
    expect(d.data.items[0].matched_in).toBe('page 2');
    expect(d.data.items[0].description).toMatch(/zebrafold partition/);

    expect((await call('b', 'GET', '/search?q=quokkasort')).data.items).toEqual([]);
    expect((await call('b', 'GET', '/search?q=zebrafold')).data.items).toEqual([]);
    expect((await call(null, 'GET', '/search?q=quokkasort')).status).toBe(401);
  });

  it('finds courses from the live catalogue with their own page', async () => {
    const { db } = await import('../../server/db/database');
    const course = (await db.getCourses({ limit: 1 })).items[0];
    const r = await call('b', 'GET', `/search?q=${encodeURIComponent(course.title)}&type=courses`);
    expect(r.data.items.some((i: any) => i.url === `/courses/${course.id}`)).toBe(true);
    expect(r.data.counts.courses).toBeGreaterThan(0);
  });

  it('gives a new student no made-up recommendations', async () => {
    const r = await call('b', 'GET', '/learning/recommendations');
    expect(r.status).toBe(200);
    expect(r.data.length).toBeLessThanOrEqual(3);
    expect(JSON.stringify(r.data)).not.toMatch(/Attention Is All You Need|Distributed Storage Node|AVL Tree/);
  });

  it('saves reminder categories and lead time, and rejects a bad lead time', async () => {
    const cats = await call('a', 'GET', '/notifications/categories');
    expect(cats.data.categories.map((c: any) => c.key)).toEqual(['assignments', 'exams', 'study_reminders', 'project_deadlines', 'revision', 'opportunity_deadlines', 'team_updates', 'interview_sessions']);
    expect(cats.data.delivery.email).toBe(false);
    const u = await call('a', 'PATCH', '/notifications/preferences', { categories: { exams: false }, reminder_lead_days: 5 });
    expect(u.data.categories.exams).toBe(false);
    expect(u.data.reminder_lead_days).toBe(5);
    const u2 = await call('a', 'PATCH', '/notifications/preferences', { categories: { revision: false } });
    expect(u2.data.categories).toMatchObject({ exams: false, revision: false });
    expect((await call('a', 'PATCH', '/notifications/preferences', { reminder_lead_days: 40 })).status).toBe(400);
  });

  it('sends a project milestone reminder once, and not when the category is off', async () => {
    const { NotificationService } = await import('../../server/services/notificationService');
    const { db } = await import('../../server/db/database');
    const soon = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const proj = await call('b', 'POST', '/projects', { title: 'Bus tracker', description: 'GPS bus arrival app', project_type: 'MINI_PROJECT', domain: 'Web' });
    const pid = proj.data?.id;
    expect(pid).toBeTruthy();
    await db.saveProjectMilestone({ id: `ms_${Date.now()}`, project_id: pid, title: 'Demo build', description: '', target_date: soon, status: 'PENDING', order_index: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any);
    // Turned off: nothing is sent.
    await NotificationService.updatePreferences(ids.b, { categories: { project_deadlines: false } } as any);
    expect((await NotificationService.generateReminders(ids.b)).some((n: any) => /Demo build/.test(n.title))).toBe(false);
    await NotificationService.updatePreferences(ids.b, { categories: { project_deadlines: true } } as any);
    const first = await NotificationService.generateReminders(ids.b);
    expect(first.some((n: any) => /Demo build/.test(n.title))).toBe(true);
    const again = await NotificationService.generateReminders(ids.b);
    expect(again.some((n: any) => /Demo build/.test(n.title))).toBe(false);
  });
});
