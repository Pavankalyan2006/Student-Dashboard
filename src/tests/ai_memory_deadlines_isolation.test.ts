import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { AiMemoryService, cleanNote, aiMemoryStores, MAX_MEMORY_NOTES } from '../../server/services/aiMemoryService';
import { formatStudentContext, studentContextForCurrentRequest } from '../../server/ai/personalization';
import { runWithRequestContext } from '../../server/core/requestContext';
import { summariseDeadlines, toICS, weekStart, prepDaysFor, type Deadline } from '../../server/services/deadlineMath';
import { parseCodeforcesContests, upcomingContests, resetContestCache } from '../../server/services/deadlineService';
import { StudentContextEngine } from '../../server/ai/studentContextEngine';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

// ---------- AI Memory ----------

describe('AI Memory', () => {
  it('removes contact details and links from notes and keeps them short', () => {
    expect(cleanNote('mail me at a.b@x.com or +91 98765 43210, see https://x.dev/p')).toBe('mail me at [email removed] or [number removed], see [link removed]');
    expect(cleanNote('line one\nline two')).toBe('line one line two');
    expect(cleanNote('x'.repeat(500))).toHaveLength(200);
  });

  it('adds, de-duplicates, limits and removes notes for one student only', () => {
    const a = 'std_mem_a';
    const b = 'std_mem_b';
    aiMemoryStores.settings.delete(a);
    aiMemoryStores.settings.delete(b);
    const s = AiMemoryService.addNote(a, 'I learn best with diagrams');
    expect(s.notes).toHaveLength(1);
    expect(() => AiMemoryService.addNote(a, 'i learn best with DIAGRAMS')).toThrow(/already/);
    expect(() => AiMemoryService.addNote(a, 'hi')).toThrow();
    expect(AiMemoryService.get(b).notes).toEqual([]);
    expect(() => AiMemoryService.removeNote(b, s.notes[0].id)).toThrow(/not in your AI memory/);
    for (let i = 1; i < MAX_MEMORY_NOTES; i++) AiMemoryService.addNote(a, `note number ${i}`);
    expect(() => AiMemoryService.addNote(a, 'one too many')).toThrow(/up to 20/);
    expect(AiMemoryService.removeNote(a, s.notes[0].id).notes).toHaveLength(MAX_MEMORY_NOTES - 1);
    expect(AiMemoryService.clearNotes(a).notes).toEqual([]);
  });

  it('only accepts boolean switches', () => {
    const id = 'std_mem_switch';
    expect(AiMemoryService.updateSettings(id, { personalize: 'no', use_activity: false })).toMatchObject({ personalize: true, use_activity: false });
  });

  it('puts remembered notes into the AI context block', () => {
    const profile: any = {
      academic: { degree: 'B.Tech', branch: 'CSE', subjects: [] },
      skills: { skills: [] },
      learning: { preferred_languages: [], learning_interests: [], preferred_study_days: [] },
      career: { target_roles: [], competitive_exams: [], preferred_industries: [] },
      experience: { projects: [], experience: [] },
    };
    const block = formatStudentContext(profile, 'tutor', undefined, ['I learn best with diagrams']);
    expect(block).toContain('Asked you to remember: I learn best with diagrams');
  });

  it('sends nothing about the student when personalisation is switched off', async () => {
    const { db } = await import('../../server/db/database');
    await db.initialize();
    const student = [...((db as any).students as Map<string, any>).values()].find((s) => s.role === 'STUDENT');
    expect(student).toBeTruthy();
    AiMemoryService.updateSettings(student.id, { personalize: true });
    const on = await runWithRequestContext({ studentId: student.id, path: '/api/v1/ai/chat' }, () => studentContextForCurrentRequest());
    AiMemoryService.updateSettings(student.id, { personalize: false });
    const off = await runWithRequestContext({ studentId: student.id, path: '/api/v1/ai/chat' }, () => studentContextForCurrentRequest());
    AiMemoryService.updateSettings(student.id, { personalize: true });
    expect(off).toBe('');
    expect(on).not.toContain(student.name);
    expect(on).not.toContain(student.email);
  });

  it('strips identity, school marks and persona text before the context reaches a model', () => {
    const safe: any = StudentContextEngine.forModel({
      student: { id: 'std_x', name: 'Real Name', branch: 'CSE', semester: 5, role: 'STUDENT', created_at: '' },
      aiPersona: { pedagogical_tone: 'PATIENT_FOUNDATIONAL', system_prompt_blueprint: 'for Real Name', primary_focus_directives: ['Real Name'] } as any,
      education: { institution: 'Some College', degree: 'B.Tech', branch: 'CSE', currentYear: 3, currentSemester: 5, expectedGraduationYear: 2027, tenthPercentage: 91, financialUrgency: 'HIGH' },
    });
    const json = JSON.stringify(safe);
    for (const leak of ['Real Name', 'std_x', 'Some College', '91', 'HIGH']) expect(json).not.toContain(leak);
    expect(safe.tutorTone).toBe('PATIENT_FOUNDATIONAL');
    expect(safe.education.degree).toBe('B.Tech');
  });
});

// ---------- Deadlines ----------

const d = (id: string, source: Deadline['source'], date: string, extra: Partial<Deadline> = {}): Deadline => ({ id, source, kind: source, title: id, date, route: '/x', ...extra });

describe('Deadlines', () => {
  it('groups by days left, flags clashes and busy weeks, and suggests when to start', () => {
    const today = '2026-11-14'; // Saturday
    const s = summariseDeadlines(
      [
        d('Goal late', 'goal', '2026-11-10'),
        d('DBMS minor', 'exam', '2026-11-18', { prep_days: prepDaysFor('MINOR_1') }),
        d('OS minor', 'exam', '2026-11-19', { prep_days: 7 }),
        d('Assignment', 'assignment', '2026-11-20'),
        d('End sem', 'exam', '2026-12-20', { prep_days: prepDaysFor('END_SEMESTER') }),
        d('Ancient', 'goal', '2025-01-01'),
        d('Bad date', 'goal', 'soon'),
        d('DBMS minor', 'exam', '2026-11-18'), // duplicate
      ],
      today
    );
    expect(s.overdue.map((x) => x.title)).toEqual(['Goal late']);
    expect(s.overdue[0].days_left).toBe(-4);
    expect(s.this_week.map((x) => x.title)).toEqual(['DBMS minor', 'OS minor', 'Assignment']);
    expect(s.later.map((x) => x.title)).toEqual(['End sem']);
    expect(s.this_week[0].suggested_start).toBe(today); // 7 days of prep, only 4 left
    expect(s.later[0].suggested_start).toBe('2026-12-06');
    expect(s.clashes).toEqual([{ a: 'DBMS minor', b: 'OS minor', days_apart: 1, date: '2026-11-18' }]);
    expect(s.crunch_weeks).toEqual([{ week_start: '2026-11-16', count: 3, exams: 2, titles: ['DBMS minor', 'OS minor', 'Assignment'] }]);
    expect(s.counts).toEqual({ total: 5, overdue: 1, this_week: 3, exams_30_days: 2 });
  });

  it('weeks start on Monday', () => {
    expect(weekStart('2026-11-16')).toBe('2026-11-16');
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
  });

  it('exports an iCalendar file with all-day events', () => {
    const ics = toICS([d('Lab, exam; 1', 'exam', '2026-11-30')], Date.UTC(2026, 10, 14));
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261130');
    expect(ics).toContain('DTEND;VALUE=DATE:20261201');
    expect(ics).toContain('SUMMARY:exam: Lab\\, exam\\; 1');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});

describe('Coding contests (Codeforces API)', () => {
  const now = Date.UTC(2026, 10, 14);
  const body = {
    status: 'OK',
    result: [
      { id: 3, name: 'Later Round', phase: 'BEFORE', startTimeSeconds: now / 1000 + 7200, durationSeconds: 7200 },
      { id: 2, name: 'Soon Round', phase: 'BEFORE', startTimeSeconds: now / 1000 + 3600, durationSeconds: 5400 },
      { id: 1, name: 'Finished', phase: 'FINISHED', startTimeSeconds: now / 1000 - 9999, durationSeconds: 7200 },
    ],
  };

  it('keeps only upcoming contests, soonest first, with links to the contest', () => {
    const cs = parseCodeforcesContests(body, now);
    expect(cs.map((c) => c.name)).toEqual(['Soon Round', 'Later Round']);
    expect(cs[0]).toMatchObject({ id: 2, duration_minutes: 90, url: 'https://codeforces.com/contests/2' });
    expect(() => parseCodeforcesContests({ status: 'FAILED' }, now)).toThrow();
  });

  it('says plainly when Codeforces cannot be reached instead of inventing contests', async () => {
    resetContestCache();
    const down = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
    const feed = await upcomingContests(down, now);
    expect(feed).toMatchObject({ available: false, contests: [] });
    const ok = (async () => ({ ok: true, json: async () => body })) as unknown as typeof fetch;
    const live = await upcomingContests(ok, now);
    expect(live.available).toBe(true);
    expect(live.source.name).toBe('Codeforces API');
    resetContestCache();
  });
});

describe('Navigation', () => {
  it('lists the new pages', () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    expect(hrefs).toContain('/deadlines');
    expect(hrefs).toContain('/ai-memory');
    expect(hrefs).toContain('/portfolio');
  });
});

// ---------- Two accounts over HTTP ----------

describe('Two student accounts cannot see each other’s data', () => {
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
      const r = await call(null, 'POST', '/auth/register', { full_name: `Isolation ${who.toUpperCase()}`, email: `iso-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      expect(r.status).toBe(201);
      tokens[who] = r.data.token;
    }
  }, 30_000);

  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('rejects requests without a session', async () => {
    for (const path of ['/ai-memory/me', '/deadlines/me', '/academics/me', '/semester/events', '/search?q=a']) {
      expect((await call(null, 'GET', path)).status).toBe(401);
    }
  });

  it('keeps AI memory, deadlines, semester events and grades separate', async () => {
    const note = await call('a', 'POST', '/ai-memory/me/notes', { text: 'Private note of student A' });
    expect(note.status).toBe(200);
    await call('a', 'PATCH', '/ai-memory/me', { use_activity: false });
    const soon = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
    const ev = await call('a', 'POST', '/semester/events', { title: 'A private exam', date: soon, event_type: 'MINOR_1', student_id: 'someone-else', injected: 'x' });
    expect(ev.status).toBe(201);
    expect(ev.data.injected).toBeUndefined();
    await call('a', 'PUT', '/academics/me', { scale: 'O_10', semesters: [{ semester: 1, subjects: [{ name: 'Maths', credits: 4, grade: 'O' }] }], attendance: { subjects: [] } });

    const bMemory = await call('b', 'GET', '/ai-memory/me');
    expect(bMemory.data).toMatchObject({ notes: [], use_activity: true });
    expect((await call('b', 'DELETE', `/ai-memory/me/notes/${note.data.notes[0].id}`)).status).toBe(404);
    expect((await call('a', 'GET', '/ai-memory/me')).data.notes).toHaveLength(1);

    const bEvents = await call('b', 'GET', '/semester/events');
    expect(JSON.stringify(bEvents.data)).not.toContain('A private exam');
    const aDeadlines = await call('a', 'GET', '/deadlines/me?tz=330');
    expect(JSON.stringify(aDeadlines.data)).toContain('A private exam');
    const bDeadlines = await call('b', 'GET', '/deadlines/me?tz=330');
    expect(JSON.stringify(bDeadlines.data)).not.toContain('A private exam');

    expect((await call('b', 'GET', '/academics/me')).data.record.semesters).toEqual([]);
    expect((await call('a', 'GET', '/academics/me')).data.grades.cgpa).toBe(10);
  });

  it('shows the AI context of the signed-in student only', async () => {
    const a = await call('a', 'GET', '/profile/me/ai-context?page=/ai-agent');
    const b = await call('b', 'GET', '/profile/me/ai-context?page=/ai-agent');
    expect(a.data.lines.join(' ')).toContain('Private note of student A');
    expect(b.data.lines.join(' ')).not.toContain('Private note of student A');
    expect(a.data.use_activity).toBe(false);
  });

  it('shares a portfolio only by opt-in link, only the chosen sections, and never contact details', async () => {
    const off = await call('a', 'GET', '/showcase/me');
    expect(off.data.settings).toMatchObject({ enabled: false, slug: null });
    const on = await call('a', 'PUT', '/showcase/me', { enabled: true, show_name: false, headline: 'Backend builder', sections: { skills: false } });
    const slug = on.data.slug;
    expect(slug).toMatch(/^[\w-]{12}$/);
    const pub = await call(null, 'GET', `/showcase/public/${slug}`);
    expect(pub.status).toBe(200);
    expect(pub.data).toMatchObject({ name: null, headline: 'Backend builder', skills: [] });
    expect(JSON.stringify(pub.data)).not.toMatch(/@example\.com|std_/);

    // B's settings are separate, and B cannot change A's link.
    expect((await call('b', 'GET', '/showcase/me')).data.settings.enabled).toBe(false);
    await call('b', 'POST', '/showcase/me/new-link');
    expect((await call(null, 'GET', `/showcase/public/${slug}`)).status).toBe(200);

    const rotated = await call('a', 'POST', '/showcase/me/new-link');
    expect((await call(null, 'GET', `/showcase/public/${slug}`)).status).toBe(404);
    expect((await call(null, 'GET', `/showcase/public/${rotated.data.slug}`)).status).toBe(200);
    await call('a', 'PUT', '/showcase/me', { enabled: false });
    expect((await call(null, 'GET', `/showcase/public/${rotated.data.slug}`)).status).toBe(404);
    expect((await call(null, 'GET', '/showcase/public/not-a-real-link')).status).toBe(404);
  });

  it('search does not return another student’s documents or projects', async () => {
    const r = await call('b', 'GET', '/search?q=a&limit=50');
    expect(r.status).toBe(200);
    expect(r.data.items.filter((i: any) => i.type === 'documents' || i.type === 'projects')).toEqual([]);
  });
});
