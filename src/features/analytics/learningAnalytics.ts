/** Shape of GET /learning/analytics (see server/services/learningAnalyticsService.ts). */
export interface LearningAnalytics {
  range: { from: string; to: string; days: number };
  total_events: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
  calendar: { date: string; count: number }[];
  by_module: { module: string; label: string; count: number }[];
  by_weekday: number[];
  by_hour: number[];
  last_30_days: number;
  previous_30_days: number;
  busiest_weekday: number | null;
  busiest_hour: number | null;
  has_data: boolean;
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Where each module's bar leads. */
export const MODULE_ROUTES: Record<string, string> = {
  courses: '/courses',
  quiz: '/quiz',
  coding: '/coding',
  interview: '/mock-interviews',
  gate: '/assessment/gate-preparation',
  notes: '/notes',
  ai_tutor: '/ai-agent',
  projects: '/projects',
  research: '/research',
  git: '/git',
  skills: '/skills',
  career: '/career',
};

/** 0 for no activity, then 1–4 by fixed thresholds so a colour always means the same amount. */
export function heatLevel(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Lays the days out as calendar columns (Sunday on top), like a contribution graph. Cells before the first
 * day are null so the first column starts on the right weekday.
 */
export function buildWeeks(calendar: { date: string; count: number }[]): ({ date: string; count: number } | null)[][] {
  if (!calendar.length) return [];
  const weeks: ({ date: string; count: number } | null)[][] = [];
  const firstDow = new Date(`${calendar[0].date}T00:00:00Z`).getUTCDay();
  let week: ({ date: string; count: number } | null)[] = new Array(firstDow).fill(null);
  for (const day of calendar) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);
  return weeks;
}

export function hourLabel(h: number): string {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr} ${suffix}`;
}
