// Pure date logic for the Deadlines page, shared by the server and the page. No imports, no I/O.
//
// Every deadline comes from a record the student created or a date their syllabus lists. The only
// derived values are day counts, week grouping, clashes and a suggested preparation start, and each of
// those is plain arithmetic on those dates.

export type DeadlineSource = 'exam' | 'assignment' | 'semester' | 'goal' | 'study_plan' | 'project' | 'application' | 'contest';

export interface Deadline {
  id: string;
  source: DeadlineSource;
  /** Short label such as "Minor exam" or "Goal". */
  kind: string;
  title: string;
  /** YYYY-MM-DD in the student's calendar. */
  date: string;
  time?: string;
  subject?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Page in the platform where the item lives. */
  route: string;
  /** Days of preparation the suggested start is based on (exams only). */
  prep_days?: number;
  /** Optional external link (contests). */
  url?: string;
}

export interface DeadlineWithDays extends Deadline {
  days_left: number;
  /** Exams only: date - prep_days, never before today. */
  suggested_start?: string;
}

export interface CrunchWeek {
  week_start: string; // Monday, YYYY-MM-DD
  count: number;
  exams: number;
  titles: string[];
}

export interface Clash {
  a: string;
  b: string;
  days_apart: number;
  date: string;
}

export interface DeadlineSummary {
  today: string;
  overdue: DeadlineWithDays[];
  this_week: DeadlineWithDays[];
  next_two_weeks: DeadlineWithDays[];
  later: DeadlineWithDays[];
  crunch_weeks: CrunchWeek[];
  clashes: Clash[];
  counts: { total: number; overdue: number; this_week: number; exams_30_days: number };
}

const DAY = 86_400_000;
const dayMs = (d: string) => Date.parse(`${d.slice(0, 10)}T00:00:00Z`);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Today's date for a UTC offset in minutes (IST = 330). */
export function todayFor(nowMs: number, offsetMinutes: number): string {
  return iso(nowMs + offsetMinutes * 60_000);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((dayMs(to) - dayMs(from)) / DAY);
}

/** Monday of the week that contains `d`. */
export function weekStart(d: string): string {
  const ms = dayMs(d);
  const dow = (new Date(ms).getUTCDay() + 6) % 7; // Monday = 0
  return iso(ms - dow * DAY);
}

/** Days of preparation a typical student plans for each kind of exam; used only for the suggested start. */
export function prepDaysFor(eventType: string): number | undefined {
  const t = eventType.toUpperCase();
  if (t === 'END_SEMESTER') return 14;
  if (t.startsWith('MINOR')) return 7;
  if (t === 'LAB_EXAM') return 4;
  if (t === 'QUIZ' || t === 'SLIP_TEST') return 2;
  if (t === 'GATE') return 90;
  return undefined;
}

export function isValidDate(d: unknown): d is string {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) && !Number.isNaN(dayMs(d));
}

/**
 * Groups deadlines around `today`. Items more than `pastDays` overdue and items further than `aheadDays`
 * away are dropped.
 */
export function summariseDeadlines(items: Deadline[], today: string, pastDays = 30, aheadDays = 180): DeadlineSummary {
  const seen = new Set<string>();
  const rows: DeadlineWithDays[] = [];
  for (const d of items) {
    if (!isValidDate(d.date)) continue;
    const date = d.date.slice(0, 10);
    const key = `${d.source}|${d.title.trim().toLowerCase()}|${date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const days_left = daysBetween(today, date);
    if (days_left < -pastDays || days_left > aheadDays) continue;
    const row: DeadlineWithDays = { ...d, date, days_left };
    if (d.prep_days && days_left >= 0) {
      const start = iso(dayMs(date) - d.prep_days * DAY);
      row.suggested_start = start < today ? today : start;
    }
    rows.push(row);
  }
  rows.sort((a, b) => a.days_left - b.days_left || (a.time || '').localeCompare(b.time || '') || a.title.localeCompare(b.title));

  const upcoming = rows.filter((r) => r.days_left >= 0);
  const byWeek = new Map<string, DeadlineWithDays[]>();
  for (const r of upcoming) {
    const w = weekStart(r.date);
    byWeek.set(w, [...(byWeek.get(w) || []), r]);
  }
  const crunch_weeks: CrunchWeek[] = [...byWeek.entries()]
    .map(([week_start, xs]) => ({ week_start, count: xs.length, exams: xs.filter((x) => x.source === 'exam').length, titles: xs.map((x) => x.title) }))
    .filter((w) => w.count >= 3)
    .sort((a, b) => a.week_start.localeCompare(b.week_start));

  const exams = upcoming.filter((r) => r.source === 'exam');
  const clashes: Clash[] = [];
  for (let i = 1; i < exams.length; i++) {
    const gap = daysBetween(exams[i - 1].date, exams[i].date);
    if (gap <= 1) clashes.push({ a: exams[i - 1].title, b: exams[i].title, days_apart: gap, date: exams[i - 1].date });
  }

  return {
    today,
    overdue: rows.filter((r) => r.days_left < 0),
    this_week: upcoming.filter((r) => r.days_left <= 7),
    next_two_weeks: upcoming.filter((r) => r.days_left > 7 && r.days_left <= 21),
    later: upcoming.filter((r) => r.days_left > 21),
    crunch_weeks,
    clashes,
    counts: {
      total: rows.length,
      overdue: rows.filter((r) => r.days_left < 0).length,
      this_week: upcoming.filter((r) => r.days_left <= 7).length,
      exams_30_days: exams.filter((r) => r.days_left <= 30).length,
    },
  };
}

const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** An iCalendar file with one all-day event per deadline, for Google Calendar, Outlook or Apple Calendar. */
export function toICS(items: Deadline[], stampMs: number): string {
  const stamp = new Date(stampMs).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BTech Learning Platform//Deadlines//EN', 'CALSCALE:GREGORIAN'];
  for (const d of items) {
    if (!isValidDate(d.date)) continue;
    const start = d.date.slice(0, 10).replace(/-/g, '');
    const end = iso(dayMs(d.date) + DAY).replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsEscape(`${d.source}-${d.id}`)}@btech-learning`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${icsEscape(`${d.kind}: ${d.title}`)}`,
      ...(d.url ? [`URL:${icsEscape(d.url)}`] : []),
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
