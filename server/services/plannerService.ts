// The student's weekly class timetable and personal task board.
//
// Both are entered by the student and kept per student. Like the academic record, they are persisted with the
// rest of the platform's state (see registerSources in server/app.ts), so they survive restarts and deploys.
import { ValidationError } from '../core/exceptions';

// ---------- Types (shared with the pages) ----------

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type ClassKind = 'lecture' | 'lab' | 'tutorial' | 'other';
export const CLASS_COLORS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'sky', 'slate'] as const;
export type ClassColor = (typeof CLASS_COLORS)[number];

export interface TimetableSlot {
  id: string;
  subject: string;
  /** 0 = Monday … 6 = Sunday */
  day: number;
  /** "HH:MM", 24-hour */
  start: string;
  end: string;
  room: string;
  teacher: string;
  kind: ClassKind;
  color: ClassColor;
}

export interface Timetable {
  student_id: string;
  slots: TimetableSlot[];
  updated_at: string | null;
}

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export const TASK_STATUSES: TaskStatus[] = ['todo', 'doing', 'done'];

export interface BoardTask {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** "YYYY-MM-DD" or null */
  due: string | null;
  tag: string;
  created_at: string;
  completed_at: string | null;
}

export interface TaskBoard {
  student_id: string;
  tasks: BoardTask[];
  updated_at: string | null;
}

// ---------- Pure helpers (used by the server and the pages) ----------

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Monday-based day index (0–6) for a Date. */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

/** Pairs of slots on the same day whose times overlap. */
export function findClashes(slots: TimetableSlot[]): [TimetableSlot, TimetableSlot][] {
  const out: [TimetableSlot, TimetableSlot][] = [];
  for (let i = 0; i < slots.length; i++)
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      if (a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)) out.push([a, b]);
    }
  return out;
}

/** The class happening now and the next one to come (looking up to a week ahead). */
export function currentAndNext(slots: TimetableSlot[], now: Date) {
  const today = weekdayIndex(now);
  const mins = now.getHours() * 60 + now.getMinutes();
  const current = slots.find((s) => s.day === today && toMinutes(s.start) <= mins && mins < toMinutes(s.end)) || null;
  let next: { slot: TimetableSlot; minutesAway: number } | null = null;
  for (const s of slots) {
    let dayOffset = (s.day - today + 7) % 7;
    if (dayOffset === 0 && toMinutes(s.start) <= mins) dayOffset = 7;
    const away = dayOffset * 1440 + toMinutes(s.start) - mins;
    if (!next || away < next.minutesAway) next = { slot: s, minutesAway: away };
  }
  return { current, next };
}

export function weeklyHours(slots: TimetableSlot[]) {
  return slots.reduce((a, s) => a + Math.max(0, toMinutes(s.end) - toMinutes(s.start)), 0) / 60;
}

export function boardSummary(tasks: BoardTask[], today = new Date().toISOString().slice(0, 10)) {
  const done = tasks.filter((t) => t.status === 'done').length;
  const open = tasks.filter((t) => t.status !== 'done');
  return {
    total: tasks.length,
    done,
    open: open.length,
    overdue: open.filter((t) => t.due && t.due < today).length,
    dueToday: open.filter((t) => t.due === today).length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

// ---------- Validation ----------

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const idOf = (v: unknown, i: number) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : `p${Date.now().toString(36)}${i}`);
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function sanitiseTimetable(studentId: string, input: any): Timetable {
  if (!input || typeof input !== 'object') throw new ValidationError('Send your timetable as an object.');
  const used = new Set<string>();
  const slots: TimetableSlot[] = (Array.isArray(input.slots) ? input.slots : []).slice(0, 120).map((x: any, i: number) => {
    const subject = str(x?.subject, 80);
    if (!subject) throw new ValidationError('Every class needs a subject name.');
    const start = str(x?.start, 5);
    const end = str(x?.end, 5);
    if (!TIME.test(start) || !TIME.test(end)) throw new ValidationError(`"${subject}" needs a start and end time like 09:00.`);
    if (toMinutes(end) <= toMinutes(start)) throw new ValidationError(`"${subject}" must end after it starts.`);
    const day = Number(x?.day);
    if (!Number.isInteger(day) || day < 0 || day > 6) throw new ValidationError(`"${subject}" needs a day of the week.`);
    let id = idOf(x?.id, i);
    if (used.has(id)) id = `${id}_${i}`.slice(0, 40);
    used.add(id);
    return {
      id,
      subject,
      day,
      start,
      end,
      room: str(x?.room, 40),
      teacher: str(x?.teacher, 60),
      kind: (['lecture', 'lab', 'tutorial', 'other'] as const).includes(x?.kind) ? x.kind : 'lecture',
      color: (CLASS_COLORS as readonly string[]).includes(x?.color) ? x.color : 'blue',
    };
  });
  return { student_id: studentId, slots, updated_at: new Date().toISOString() };
}

export function sanitiseBoard(studentId: string, input: any): TaskBoard {
  if (!input || typeof input !== 'object') throw new ValidationError('Send your task board as an object.');
  const used = new Set<string>();
  const now = new Date().toISOString();
  const tasks: BoardTask[] = (Array.isArray(input.tasks) ? input.tasks : []).slice(0, 300).map((x: any, i: number) => {
    const title = str(x?.title, 140);
    if (!title) throw new ValidationError('Every task needs a title.');
    const status: TaskStatus = TASK_STATUSES.includes(x?.status) ? x.status : 'todo';
    const due = x?.due && DATE.test(String(x.due)) ? String(x.due) : null;
    let id = idOf(x?.id, i);
    if (used.has(id)) id = `${id}_${i}`.slice(0, 40);
    used.add(id);
    const created = typeof x?.created_at === 'string' && !Number.isNaN(Date.parse(x.created_at)) ? x.created_at : now;
    const completed =
      status === 'done' ? (typeof x?.completed_at === 'string' && !Number.isNaN(Date.parse(x.completed_at)) ? x.completed_at : now) : null;
    return {
      id,
      title,
      notes: str(x?.notes, 1000),
      status,
      priority: (['low', 'medium', 'high'] as const).includes(x?.priority) ? x.priority : 'medium',
      due,
      tag: str(x?.tag, 40),
      created_at: created,
      completed_at: completed,
    };
  });
  return { student_id: studentId, tasks, updated_at: now };
}

// ---------- Service ----------

export const plannerStores: { timetables: Map<string, Timetable>; boards: Map<string, TaskBoard> } = {
  timetables: new Map(),
  boards: new Map(),
};

export class PlannerService {
  static timetable(studentId: string): Timetable {
    return plannerStores.timetables.get(studentId) || { student_id: studentId, slots: [], updated_at: null };
  }

  static saveTimetable(studentId: string, input: unknown): Timetable {
    const t = sanitiseTimetable(studentId, input);
    plannerStores.timetables.set(studentId, t);
    return t;
  }

  static board(studentId: string): TaskBoard {
    return plannerStores.boards.get(studentId) || { student_id: studentId, tasks: [], updated_at: null };
  }

  static saveBoard(studentId: string, input: unknown): TaskBoard {
    const b = sanitiseBoard(studentId, input);
    plannerStores.boards.set(studentId, b);
    return b;
  }
}
