/**
 * Focus sessions the student completed with the Focus Timer. Kept in this browser under the student's id
 * (never shared between students on one machine). Every number shown on the page is computed from these
 * records; nothing is estimated or seeded.
 */
export interface FocusSession {
  id: string;
  /** ISO time the session finished. */
  ended_at: string;
  minutes: number;
  label: string;
  /** Study planner task this session was for, when one was chosen. */
  task_id?: string;
}

export interface FocusPreset {
  id: string;
  label: string;
  focus: number;
  rest: number;
}

export const FOCUS_PRESETS: FocusPreset[] = [
  { id: 'classic', label: '25 / 5', focus: 25, rest: 5 },
  { id: 'deep', label: '50 / 10', focus: 50, rest: 10 },
  { id: 'sprint', label: '15 / 3', focus: 15, rest: 3 },
];

export const MAX_STORED_SESSIONS = 500;
export const focusKey = (studentId: string) => `btech.focus.${studentId}`;

export function parseSessions(raw: string | null): FocusSession[] {
  try {
    const list = JSON.parse(raw || '[]');
    if (!Array.isArray(list)) return [];
    return list.filter(
      (s): s is FocusSession =>
        s && typeof s.id === 'string' && typeof s.ended_at === 'string' && !Number.isNaN(Date.parse(s.ended_at)) &&
        typeof s.minutes === 'number' && s.minutes > 0 && s.minutes <= 600 && typeof s.label === 'string'
    );
  } catch {
    return [];
  }
}

export function loadSessions(studentId: string): FocusSession[] {
  try {
    return parseSessions(window.localStorage.getItem(focusKey(studentId)));
  } catch {
    return [];
  }
}

export function saveSessions(studentId: string, sessions: FocusSession[]) {
  try {
    window.localStorage.setItem(focusKey(studentId), JSON.stringify(sessions.slice(-MAX_STORED_SESSIONS)));
  } catch {
    /* storage unavailable: the session still counts for this visit */
  }
}

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Focus minutes for each of the last `days` days, oldest first, ending today. */
export function minutesByDay(sessions: FocusSession[], now: Date, days = 7): { day: string; label: string; minutes: number }[] {
  const totals = new Map<string, number>();
  for (const s of sessions) {
    const k = dayKey(new Date(s.ended_at));
    totals.set(k, (totals.get(k) || 0) + s.minutes);
  }
  const out: { day: string; label: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const k = dayKey(d);
    out.push({ day: k, label: d.toLocaleDateString(undefined, { weekday: 'short' }), minutes: totals.get(k) || 0 });
  }
  return out;
}

/** Consecutive days, ending today or yesterday, with at least one finished session. */
export function focusStreak(sessions: FocusSession[], now: Date): number {
  const days = new Set(sessions.map((s) => dayKey(new Date(s.ended_at))));
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return n;
}

export function summarize(sessions: FocusSession[], now: Date) {
  const today = dayKey(now);
  const todays = sessions.filter((s) => dayKey(new Date(s.ended_at)) === today);
  const week = minutesByDay(sessions, now, 7);
  return {
    todayMinutes: todays.reduce((n, s) => n + s.minutes, 0),
    todaySessions: todays.length,
    weekMinutes: week.reduce((n, d) => n + d.minutes, 0),
    streak: focusStreak(sessions, now),
    week,
  };
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function formatMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
