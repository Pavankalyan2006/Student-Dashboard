// Collects every dated item the student has across the platform into one list for the Deadlines page.
//
// Sources: semester calendar events and slip tests (their own and the dates in their syllabus), learning goals,
// study plans, project milestones, saved internship applications and their GATE exam date. Each store is read
// only for this student and is optional: a store that fails is skipped, never guessed.
import { db } from '../db/database';
import { semesterCommandCenterService } from './semesterCommandCenterService';
import { LearningModulesService } from './learningModulesService';
import { type Deadline, prepDaysFor, isValidDate } from './deadlineMath';

export * from './deadlineMath';

const EXAM_TYPES = new Set(['SLIP_TEST', 'QUIZ', 'LAB_EXAM', 'MINOR_1', 'MINOR_2', 'MINOR_3', 'END_SEMESTER']);
const WORK_TYPES = new Set(['ASSIGNMENT', 'PROJECT_REVIEW', 'SEMINAR', 'LAB']);
const SKIP_TYPES = new Set(['CLASS', 'HOLIDAY', 'SEMESTER_START', 'STUDY_DAY']);

const EVENT_LABELS: Record<string, string> = {
  SLIP_TEST: 'Slip test',
  QUIZ: 'Quiz',
  LAB_EXAM: 'Lab exam',
  MINOR_1: 'Minor exam',
  MINOR_2: 'Minor exam',
  MINOR_3: 'Minor exam',
  END_SEMESTER: 'End-semester exam',
  ASSIGNMENT: 'Assignment',
  PROJECT_REVIEW: 'Project review',
  SEMINAR: 'Seminar',
  LAB: 'Lab',
  SEMESTER_END: 'Semester ends',
  REVISION: 'Revision',
  OTHER: 'Event',
};

async function safe<T>(fn: () => T | Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function collectDeadlines(studentId: string): Promise<Deadline[]> {
  const anyDb = db as any;
  const [events, slipTests, goals, plans, projects, applications] = await Promise.all([
    safe(() => semesterCommandCenterService.getEvents(studentId), [] as any[]),
    safe(() => semesterCommandCenterService.getSlipTests(studentId), [] as any[]),
    safe(() => db.getStudentGoals(studentId), [] as any[]),
    safe(() => LearningModulesService.getStudyPlans(studentId), [] as any[]),
    safe(() => db.getProjects(studentId), [] as any[]),
    safe(() => LearningModulesService.getApplications(studentId), [] as any[]),
  ]);
  const out: Deadline[] = [];

  for (const e of events) {
    const type = String(e.event_type || 'OTHER');
    if (SKIP_TYPES.has(type) || e.status === 'COMPLETED' || e.status === 'CANCELLED' || e.status === 'MISSED') continue;
    if (e.student_id && e.student_id !== studentId) continue;
    const exam = EXAM_TYPES.has(type);
    out.push({
      id: String(e.id),
      source: exam ? 'exam' : WORK_TYPES.has(type) ? 'assignment' : 'semester',
      kind: EVENT_LABELS[type] || 'Event',
      title: String(e.title),
      date: e.date,
      time: e.start_time,
      priority: e.priority,
      route: exam ? '/semester-command-center/exams' : '/semester-command-center/calendar',
      prep_days: exam ? prepDaysFor(type) : undefined,
    });
  }
  for (const t of slipTests) {
    if (t.status !== 'SCHEDULED' || (t.student_id && t.student_id !== studentId)) continue;
    out.push({
      id: String(t.id),
      source: 'exam',
      kind: 'Slip test',
      title: t.title || `${t.subject_name} slip test`,
      subject: t.subject_name,
      date: t.date,
      route: '/semester-command-center/slip-tests',
      prep_days: prepDaysFor('SLIP_TEST'),
    });
  }
  for (const g of goals) {
    if (g.student_id !== studentId || g.status !== 'ACTIVE' || !isValidDate(g.target_date)) continue;
    out.push({ id: String(g.id), source: 'goal', kind: 'Goal', title: g.title, date: g.target_date, priority: g.priority, route: '/goals' });
  }
  for (const p of plans) {
    if (p.student_id !== studentId || p.status !== 'ACTIVE' || !isValidDate(p.target_date)) continue;
    out.push({ id: String(p.id), source: 'study_plan', kind: 'Study plan', title: p.title, date: p.target_date, route: '/study-planner' });
  }
  for (const proj of projects) {
    if (proj.student_id !== studentId) continue;
    const milestones: any[] = await safe(() => db.getProjectMilestones(proj.id), []);
    for (const m of milestones) {
      if (m.status === 'COMPLETED' || !isValidDate(m.target_date)) continue;
      out.push({
        id: String(m.id),
        source: 'project',
        kind: 'Project milestone',
        title: `${m.title} (${proj.title})`,
        date: m.target_date,
        route: `/projects/${proj.id}`,
      });
    }
  }
  for (const a of applications) {
    if (a.student_id !== studentId || a.status !== 'SAVED' || !isValidDate(a.deadline)) continue;
    out.push({
      id: String(a.id),
      source: 'application',
      kind: 'Application closes',
      title: `${a.role} at ${a.company_name}`,
      date: a.deadline,
      route: '/applications',
    });
  }
  // Read without creating: opening the deadlines page must not start a GATE workspace.
  const gate = anyDb.gateStudentProfiles?.get?.(studentId);
  if (gate && isValidDate(gate.target_date)) {
    out.push({
      id: `gate-${studentId}`,
      source: 'exam',
      kind: 'GATE exam',
      title: gate.exam_cycle || `GATE ${gate.target_paper}`,
      date: gate.target_date,
      route: '/assessment/gate-preparation',
      prep_days: prepDaysFor('GATE'),
    });
  }
  return out;
}

// ---------- Programming contests (Codeforces public API) ----------

export interface Contest {
  id: number;
  name: string;
  start: string; // ISO time
  duration_minutes: number;
  url: string;
}

export interface ContestFeed {
  available: boolean;
  source: { name: string; url: string };
  contests: Contest[];
  fetched_at: string | null;
  message?: string;
}

const CF_SOURCE = { name: 'Codeforces API', url: 'https://codeforces.com/apiHelp' };
const CONTEST_TTL_MS = 30 * 60_000;
let contestCache: { at: number; feed: ContestFeed } | null = null;

/** Turns Codeforces' contest.list result into upcoming contests, soonest first. Pure, for tests. */
export function parseCodeforcesContests(body: any, nowMs: number, limit = 15): Contest[] {
  if (!body || body.status !== 'OK' || !Array.isArray(body.result)) throw new Error('Unexpected Codeforces response');
  return body.result
    .filter((c: any) => c && c.phase === 'BEFORE' && Number.isFinite(c.startTimeSeconds) && c.startTimeSeconds * 1000 > nowMs)
    .sort((a: any, b: any) => a.startTimeSeconds - b.startTimeSeconds)
    .slice(0, limit)
    .map((c: any) => ({
      id: Number(c.id),
      name: String(c.name),
      start: new Date(c.startTimeSeconds * 1000).toISOString(),
      duration_minutes: Math.round(Number(c.durationSeconds || 0) / 60),
      url: `https://codeforces.com/contests/${Number(c.id)}`,
    }));
}

export async function upcomingContests(fetchImpl: typeof fetch = fetch, nowMs = Date.now()): Promise<ContestFeed> {
  if (contestCache && nowMs - contestCache.at < CONTEST_TTL_MS) return contestCache.feed;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetchImpl('https://codeforces.com/api/contest.list?gym=false', { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const feed: ContestFeed = { available: true, source: CF_SOURCE, contests: parseCodeforcesContests(await res.json(), nowMs), fetched_at: new Date(nowMs).toISOString() };
    contestCache = { at: nowMs, feed };
    return feed;
  } catch {
    // Serve the last good list if there is one; otherwise say plainly that it could not be reached.
    if (contestCache) return contestCache.feed;
    return { available: false, source: CF_SOURCE, contests: [], fetched_at: null, message: 'Codeforces could not be reached right now. Try again in a few minutes.' };
  } finally {
    clearTimeout(timer);
  }
}

/** For tests. */
export function resetContestCache() {
  contestCache = null;
}
