/**
 * Phase 7: notification categories from the brief, and the reminders each one produces.
 *
 * Reminders are built only from the student's own dated records: semester calendar events and slip
 * tests, project milestones, study plans, due flashcards, saved applications (deadline, interview and
 * assessment dates), Competition Hub events they added, and team tasks assigned to them. Nothing is
 * scheduled that the student did not record. Each reminder carries a key, so it is sent once.
 */
import type { Deadline } from './deadlineMath';
import type { HubDeadline, Team } from './competitionHubService';

export const NOTIFICATION_CATEGORIES = [
  { key: 'assignments', label: 'Upcoming assignments', desc: 'Assignments, labs, seminars and project reviews in your semester calendar' },
  { key: 'exams', label: 'Examination dates', desc: 'Slip tests, minors, lab exams, end-semester exams and GATE' },
  { key: 'study_reminders', label: 'Study reminders', desc: 'Tasks planned for today in your study planner' },
  { key: 'project_deadlines', label: 'Project deadlines', desc: 'Milestones in your projects' },
  { key: 'revision', label: 'Revision activities', desc: 'Flashcards that are due for review' },
  { key: 'opportunity_deadlines', label: 'Saved opportunity deadlines', desc: 'Application deadlines and Competition Hub registration dates you saved' },
  { key: 'team_updates', label: 'Team updates', desc: 'Competition team tasks assigned to you that are due soon' },
  { key: 'interview_sessions', label: 'Interview sessions', desc: 'Interview and assessment dates on your saved applications' },
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]['key'];
export const CATEGORY_KEYS = NOTIFICATION_CATEGORIES.map((c) => c.key) as NotificationCategory[];

export const LEAD_DAYS = { min: 1, max: 14, default: 3 };

/** Older switches still count, so a student who turned one off is not suddenly notified. */
const LEGACY: Partial<Record<NotificationCategory, string[]>> = {
  exams: ['exam_reminders', 'learning'],
  study_reminders: ['study_reminders', 'learning'],
  revision: ['revision_reminders', 'learning'],
  project_deadlines: ['goal_deadlines', 'projects'],
  assignments: ['learning'],
  opportunity_deadlines: ['career'],
  interview_sessions: ['career'],
  team_updates: ['projects'],
};

export function categoryEnabled(prefs: Record<string, any> | null | undefined, key: NotificationCategory): boolean {
  if (!prefs) return true;
  if (prefs.in_app === false) return false;
  if (prefs.categories && prefs.categories[key] === false) return false;
  return !(LEGACY[key] || []).some((k) => prefs[k] === false);
}

export function leadDays(prefs: Record<string, any> | null | undefined): number {
  const n = Number(prefs?.reminder_lead_days);
  return Number.isInteger(n) && n >= LEAD_DAYS.min && n <= LEAD_DAYS.max ? n : LEAD_DAYS.default;
}

/** Keeps only known category switches, as booleans. */
export function cleanCategories(input: unknown): Record<NotificationCategory, boolean> | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const out = {} as Record<NotificationCategory, boolean>;
  for (const k of CATEGORY_KEYS) if (typeof (input as any)[k] === 'boolean') out[k] = (input as any)[k];
  return out;
}

export interface ReminderCandidate {
  category: NotificationCategory;
  /** Unique per record and date, stored as the notification's entity id so it is sent once. */
  key: string;
  type: 'DEADLINE_REMINDER' | 'EXAM_REMINDER' | 'STUDY_PLAN_REMINDER' | 'REVISION_REMINDER' | 'TEAM_UPDATE' | 'INTERVIEW_REMINDER';
  title: string;
  message: string;
  link: string;
}

export interface ReminderInput {
  today: string; // YYYY-MM-DD
  deadlines: Deadline[];
  applications: { id: string; role: string; company_name: string; status: string; interview_date?: string; assessment_date?: string }[];
  hub_deadlines: HubDeadline[];
  teams: Team[];
  studentId: string;
  today_tasks: number;
  due_flashcards: number;
}

const day = (iso: string) => String(iso || '').slice(0, 10);
export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(`${day(date)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}
const when = (d: number) => (d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`);

export function reminderCandidates(input: ReminderInput, lead: number): ReminderCandidate[] {
  const out: ReminderCandidate[] = [];
  const soon = (date?: string) => {
    if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return null;
    const d = daysUntil(date, input.today);
    return d >= 0 && d <= lead ? d : null;
  };

  for (const dl of input.deadlines) {
    const d = soon(dl.date);
    if (d === null) continue;
    const category: NotificationCategory | null =
      dl.source === 'exam' ? 'exams'
      : dl.source === 'assignment' ? 'assignments'
      : dl.source === 'project' ? 'project_deadlines' // goals have their own reminder
      : dl.source === 'application' ? 'opportunity_deadlines'
      : null; // study plans and general semester events are covered by study reminders and the Deadlines page
    if (!category) continue;
    out.push({
      category,
      key: `${category}:${dl.source}:${dl.id}:${day(dl.date)}`,
      type: category === 'exams' ? 'EXAM_REMINDER' : 'DEADLINE_REMINDER',
      title: `${dl.kind} ${when(d)}: ${dl.title}`,
      message: `${dl.kind} on ${day(dl.date)} (${when(d)}). From ${dl.source === 'application' ? 'your application tracker' : dl.source === 'project' ? 'your project milestones' : 'your semester calendar'}.`,
      link: dl.route || '/deadlines',
    });
  }

  for (const a of input.applications) {
    if (a.status === 'CLOSED' || a.status === 'REJECTED' || a.status === 'WITHDRAWN') continue;
    for (const [field, label] of [['interview_date', 'Interview'], ['assessment_date', 'Assessment']] as const) {
      const d = soon(a[field]);
      if (d === null) continue;
      out.push({
        category: 'interview_sessions',
        key: `interview_sessions:${a.id}:${field}:${day(a[field]!)}`,
        type: 'INTERVIEW_REMINDER',
        title: `${label} ${when(d)}: ${a.role} at ${a.company_name}`,
        message: `${label} date ${day(a[field]!)} from your application tracker.`,
        link: '/applications',
      });
    }
  }

  for (const h of input.hub_deadlines) {
    if (h.what !== 'Registration closes') continue;
    const d = soon(h.date);
    if (d === null) continue;
    out.push({
      category: 'opportunity_deadlines',
      key: `opportunity_deadlines:${h.ref}:${day(h.date)}`,
      type: 'DEADLINE_REMINDER',
      title: `Registration closes ${when(d)}: ${h.title}`,
      message: `${h.source}. Check the date on the source page.`,
      link: '/competitions',
    });
  }

  for (const t of input.teams) {
    if (!t.members.some((m) => m.student_id === input.studentId)) continue;
    for (const task of t.tasks) {
      if (task.assignee_id !== input.studentId || task.status === 'DONE') continue;
      const d = soon(task.due_date);
      if (d === null) continue;
      out.push({
        category: 'team_updates',
        key: `team_updates:${t.id}:${task.id}:${day(task.due_date!)}`,
        type: 'TEAM_UPDATE',
        title: `Team task due ${when(d)}: ${task.title}`,
        message: `Assigned to you in team "${t.name}".`,
        link: '/competitions',
      });
    }
  }

  if (input.today_tasks > 0) {
    out.push({
      category: 'study_reminders',
      key: `study_reminders:${input.today}`,
      type: 'STUDY_PLAN_REMINDER',
      title: `${input.today_tasks} study task${input.today_tasks === 1 ? '' : 's'} planned for today`,
      message: 'From your study planner.',
      link: '/study-planner',
    });
  }
  if (input.due_flashcards > 0) {
    out.push({
      category: 'revision',
      key: `revision:${input.today}`,
      type: 'REVISION_REMINDER',
      title: `${input.due_flashcards} flashcard${input.due_flashcards === 1 ? '' : 's'} due for revision`,
      message: 'Cards whose review date has come, from your flashcard decks.',
      link: '/flashcards',
    });
  }
  return out;
}
