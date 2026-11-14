// Learning analytics built only from what the student actually did.
//
// Every event comes from a record the platform already stores for this student (activity log, quiz attempts,
// code submissions, mock interviews, GATE attempts, notes, AI tutor conversations). Nothing is estimated or
// filled in: a day with no records is a day with zero activity.
import { db } from '../db/database';
import type { ActivityEventType } from '../models/communityProfileProgressTypes';

export type AnalyticsModule =
  | 'courses'
  | 'quiz'
  | 'coding'
  | 'interview'
  | 'gate'
  | 'notes'
  | 'ai_tutor'
  | 'projects'
  | 'research'
  | 'git'
  | 'skills'
  | 'career'
  | 'other';

export const MODULE_LABELS: Record<AnalyticsModule, string> = {
  courses: 'Courses',
  quiz: 'Quizzes',
  coding: 'Coding & DSA',
  interview: 'Mock interviews',
  gate: 'GATE practice',
  notes: 'Notes',
  ai_tutor: 'AI Tutor',
  projects: 'Projects',
  research: 'Research',
  git: 'Git Lab',
  skills: 'Skill assessments',
  career: 'Career',
  other: 'Other',
};

export interface LearningEvent {
  at: string;
  module: AnalyticsModule;
}

/** Activity-log types that are counted from their own store instead, so nothing is counted twice. */
const COUNTED_ELSEWHERE = new Set<string>(['QUIZ_ATTEMPTED', 'QUIZ_COMPLETED', 'MOCK_INTERVIEW_COMPLETED', 'NOTE_CREATED', 'CODING_PROBLEM_SOLVED']);

export function moduleForActivity(type: ActivityEventType | string): AnalyticsModule {
  const t = String(type || '').toUpperCase();
  if (t.startsWith('COURSE')) return 'courses';
  if (t.startsWith('QUIZ') || t.startsWith('MISTAKE')) return 'quiz';
  if (t.startsWith('CODING') || t.startsWith('DSA')) return 'coding';
  if (t.startsWith('MOCK_INTERVIEW')) return 'interview';
  if (t.startsWith('NOTE') || t.startsWith('DOCUMENT')) return 'notes';
  if (t.startsWith('PROJECT') || t.startsWith('ARCHITECTURE') || t.startsWith('DOCUMENTATION') || t.startsWith('TASK')) return 'projects';
  if (t.startsWith('RESEARCH') || t.startsWith('PAPER')) return 'research';
  if (t.startsWith('GIT_') || t.startsWith('GITHUB')) return 'git';
  if (t.startsWith('SKILL')) return 'skills';
  if (t.startsWith('RESUME') || t.startsWith('CERTIFICATE')) return 'career';
  return 'other';
}

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

const valid = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/** Reads every store that records something the student did. Each store is optional. */
export async function collectLearningEvents(studentId: string): Promise<LearningEvent[]> {
  const anyDb = db as any;
  const [activities, quizAttempts, submissions, interviews, gate, notes, conversations] = await Promise.all([
    safe(db.getStudentActivities(studentId), [] as any[]),
    safe(db.getQuizAttempts(studentId) as Promise<any[]>, [] as any[]),
    safe(anyDb.getStudentSubmissions(studentId) as Promise<any[]>, [] as any[]),
    safe(db.getMockInterviewSessions(studentId) as Promise<any[]>, [] as any[]),
    safe(anyDb.getGateQuestionAttempts(studentId) as Promise<any[]>, [] as any[]),
    safe(db.getNotes(studentId) as Promise<any[]>, [] as any[]),
    safe(anyDb.getConversationsByStudentId(studentId) as Promise<any[]>, [] as any[]),
  ]);

  const events: LearningEvent[] = [];
  for (const a of activities) {
    if (COUNTED_ELSEWHERE.has(a.activity_type) || !valid(a.created_at)) continue;
    if (a.activity_type === ('PROFILE_SYNC' as any)) continue; // a sync is not learning
    events.push({ at: a.created_at, module: moduleForActivity(a.activity_type) });
  }
  for (const q of quizAttempts) {
    const at = q.completed_at || q.started_at;
    if (valid(at)) events.push({ at, module: 'quiz' });
  }
  for (const s of submissions) if (valid(s.created_at)) events.push({ at: s.created_at, module: 'coding' });
  for (const m of interviews) {
    const at = m.completed_at || m.started_at || m.created_at;
    if (valid(at)) events.push({ at, module: 'interview' });
  }
  for (const g of gate) if (valid(g.attempted_at)) events.push({ at: g.attempted_at, module: 'gate' });
  for (const n of notes) if (valid(n.created_at)) events.push({ at: n.created_at, module: 'notes' });
  for (const c of conversations) if (valid(c.created_at)) events.push({ at: c.created_at, module: 'ai_tutor' });
  return events;
}

export interface LearningAnalytics {
  range: { from: string; to: string; days: number };
  total_events: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
  calendar: { date: string; count: number }[];
  by_module: { module: AnalyticsModule; label: string; count: number }[];
  by_weekday: number[];
  by_hour: number[];
  last_30_days: number;
  previous_30_days: number;
  busiest_weekday: number | null;
  busiest_hour: number | null;
  has_data: boolean;
}

const DAY = 86400000;

/** Local calendar date (YYYY-MM-DD) of an instant, for a UTC offset in minutes east of UTC. */
export function localDate(ms: number, offsetMinutes: number): string {
  return new Date(ms + offsetMinutes * 60000).toISOString().slice(0, 10);
}

/**
 * Pure summary of events. `offsetMinutes` is the student's UTC offset (IST = 330), so days, weekdays and
 * hours are the student's own.
 */
export function summariseLearning(
  events: LearningEvent[],
  opts: { days?: number; now?: Date; offsetMinutes?: number } = {}
): LearningAnalytics {
  const days = Math.max(7, Math.min(366, Math.floor(opts.days || 365)));
  const offset = Math.max(-840, Math.min(840, Math.round(opts.offsetMinutes || 0)));
  const nowMs = (opts.now || new Date()).getTime();
  const today = localDate(nowMs, offset);
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const fromMs = todayMs - (days - 1) * DAY;
  const from = new Date(fromMs).toISOString().slice(0, 10);

  const perDay = new Map<string, number>();
  const perModule = new Map<AnalyticsModule, number>();
  const byWeekday = new Array(7).fill(0);
  const byHour = new Array(24).fill(0);
  let last30 = 0;
  let prev30 = 0;
  let total = 0;
  const allActiveDays = new Set<string>();

  for (const e of events) {
    const ms = Date.parse(e.at);
    if (Number.isNaN(ms) || ms > nowMs + 60000) continue;
    const date = localDate(ms, offset);
    allActiveDays.add(date);
    const dayMs = Date.parse(`${date}T00:00:00Z`);
    const age = Math.round((todayMs - dayMs) / DAY);
    if (age < 30) last30++;
    else if (age < 60) prev30++;
    if (date < from) continue;
    total++;
    perDay.set(date, (perDay.get(date) || 0) + 1);
    perModule.set(e.module, (perModule.get(e.module) || 0) + 1);
    const local = new Date(ms + offset * 60000);
    byWeekday[local.getUTCDay()]++;
    byHour[local.getUTCHours()]++;
  }

  const calendar: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(fromMs + i * DAY).toISOString().slice(0, 10);
    calendar.push({ date, count: perDay.get(date) || 0 });
  }

  // Streaks use the whole history, not only the visible window.
  const sorted = [...allActiveDays].sort();
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    const ms = Date.parse(`${d}T00:00:00Z`);
    run = prev !== null && ms - prev === DAY ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = ms;
  }
  let current = 0;
  // A streak is still alive if the student was active today or yesterday.
  let cursor = allActiveDays.has(today) ? todayMs : todayMs - DAY;
  while (allActiveDays.has(new Date(cursor).toISOString().slice(0, 10))) {
    current++;
    cursor -= DAY;
  }

  const argmax = (xs: number[]) => (xs.some((x) => x > 0) ? xs.indexOf(Math.max(...xs)) : null);

  return {
    range: { from, to: today, days },
    total_events: total,
    active_days: perDay.size,
    current_streak: current,
    longest_streak: longest,
    calendar,
    by_module: [...perModule.entries()]
      .map(([module, count]) => ({ module, label: MODULE_LABELS[module], count }))
      .sort((a, b) => b.count - a.count),
    by_weekday: byWeekday,
    by_hour: byHour,
    last_30_days: last30,
    previous_30_days: prev30,
    busiest_weekday: argmax(byWeekday),
    busiest_hour: argmax(byHour),
    has_data: total > 0,
  };
}

export class LearningAnalyticsService {
  static async forStudent(studentId: string, opts: { days?: number; offsetMinutes?: number } = {}): Promise<LearningAnalytics> {
    const events = await collectLearningEvents(studentId);
    return summariseLearning(events, opts);
  }
}
