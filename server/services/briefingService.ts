// Daily Briefing: gathers the student's own deadlines, planned tasks, due flashcards, open mistakes, Knowledge
// Graph gaps, attendance and upcoming contests, and keeps what the student did with each item.
//
// Each store is read for this student only and is optional: a store that fails adds no items, it is never
// guessed. The student's actions (done, dismissed, postponed, added to plan) are stored per student.
import { db } from '../db/database';
import { NotFoundError, ValidationError } from '../core/exceptions';
import { LearningModulesService } from './learningModulesService';
import { MistakeNotebookService } from './mistakeNotebookService';
import { AcademicRecordsService } from './academicRecordsService';
import { attendanceStatus } from './academicMath';
import { collectDeadlines, summariseDeadlines, upcomingContests, daysBetween } from './deadlineService';
import { knowledgeMapFor } from './knowledgeMapService';
import { buildBriefing, candidateItems, pruneActions, type ActionRecord, type Briefing, type BriefingAction, type BriefingInput, type BriefingItem } from './briefingMath';

export * from './briefingMath';

export const briefingStores: { actions: Map<string, Record<string, ActionRecord>> } = { actions: new Map() };

export const BRIEFING_PLAN_TITLE = 'From my daily briefing';

async function safe<T>(fn: () => T | Promise<T>, fallback: T, ms = 0): Promise<T> {
  try {
    if (!ms) return await fn();
    return await Promise.race([Promise.resolve().then(fn), new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
  } catch {
    return fallback;
  }
}

// When Codeforces cannot be reached, do not try again for five minutes, so the briefing stays fast.
let contestsDownUntil = 0;
async function contestsForBriefing(nowMs: number): Promise<any[]> {
  if (nowMs < contestsDownUntil) return [];
  const feed: any = await safe<any>(() => upcomingContests(), { available: false, contests: [] }, 3000);
  if (!feed.available || !Array.isArray(feed.contests)) {
    contestsDownUntil = nowMs + 5 * 60_000;
    return [];
  }
  return feed.contests;
}

export async function briefingInput(studentId: string, today: string, opts: { contests?: boolean; nowMs?: number } = {}): Promise<BriefingInput> {
  const nowMs = opts.nowMs ?? Date.now();
  const [deadlines, plans, due, notebook, map, contests] = await Promise.all([
    safe(() => collectDeadlines(studentId), []),
    safe(() => LearningModulesService.getStudyPlans(studentId), [] as any[]),
    safe(() => db.getDueFlashcards(studentId, { limit: 500 }), [] as any[]),
    safe(() => MistakeNotebookService.forStudent(studentId), { open: 0, by_topic: [] } as any),
    safe(() => knowledgeMapFor(studentId), null as any),
    // The contest list is a nice-to-have: never hold the briefing up for it.
    opts.contests === false ? Promise.resolve([] as any[]) : contestsForBriefing(nowMs),
  ]);
  const summary = summariseDeadlines(deadlines, today, 14, 60);
  const record = AcademicRecordsService.get(studentId);
  const required = record.attendance.required_percent;

  return {
    today,
    deadlines: [...summary.overdue, ...summary.this_week, ...summary.next_two_weeks, ...summary.later],
    tasks: plans
      .filter((p: any) => p.student_id === studentId && p.status !== 'ARCHIVED')
      .flatMap((p: any) => (p.tasks || []).map((t: any) => ({ ...t, plan_id: p.id })))
      .filter((t: any) => t.date === today || (t.date && t.date < today && daysBetween(t.date, today) <= 7)),
    due_flashcards: due.length,
    open_mistakes: {
      total: Number(notebook.open) || 0,
      top_topics: [...(notebook.by_topic || [])].filter((t: any) => t.open > 0).sort((a: any, b: any) => b.open - a.open).map((t: any) => String(t.topic)),
    },
    needs_revision: map?.needs_revision || [],
    missing_foundations: map?.missing_foundations || [],
    next_topics: map?.next_topics || [],
    attendance: record.attendance.subjects.map((s) => {
      const st = attendanceStatus(s.attended, s.total, required);
      return { id: s.id, name: s.name, percent: st.percent, must_attend: st.must_attend, required };
    }),
    contests: contests.map((c: any) => ({ id: String(c.id), name: c.name, start: c.start, url: c.url, hours_away: (Date.parse(c.start) - nowMs) / 3_600_000 })),
  };
}

const ACTIONS: BriefingAction[] = ['done', 'dismissed', 'postponed'];

export class BriefingService {
  static actions(studentId: string): Record<string, ActionRecord> {
    return briefingStores.actions.get(studentId) || {};
  }

  static async forStudent(studentId: string, today: string): Promise<Briefing> {
    return buildBriefing(await briefingInput(studentId, today), this.actions(studentId));
  }

  private static async findItem(studentId: string, itemId: string, today: string): Promise<BriefingItem> {
    const item = candidateItems(await briefingInput(studentId, today, { contests: itemId.startsWith('contest:') })).find((i) => i.id === itemId);
    if (!item) throw new NotFoundError('That briefing item is no longer in your briefing.');
    return item;
  }

  private static save(studentId: string, itemId: string, rec: ActionRecord) {
    // A new object each time, so the state store sees the change and persists it.
    briefingStores.actions.set(studentId, pruneActions({ ...this.actions(studentId), [itemId]: rec }, Date.now()));
  }

  /** done, dismissed or postponed (until a date within 14 days; tomorrow by default). */
  static async act(studentId: string, itemId: string, action: string, today: string, until?: string): Promise<ActionRecord> {
    if (!ACTIONS.includes(action as BriefingAction)) throw new ValidationError('Action must be done, dismissed or postponed.');
    const item = await this.findItem(studentId, itemId, today);
    const rec: ActionRecord = { action: action as BriefingAction, at: new Date().toISOString() };
    if (action === 'postponed') {
      const tomorrow = new Date(Date.parse(`${today}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
      const date = until || tomorrow;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new ValidationError('Postpone date must be YYYY-MM-DD.');
      const gap = daysBetween(today, date);
      if (gap < 1 || gap > 14) throw new ValidationError('You can postpone an item by 1 to 14 days.');
      rec.until = date;
    }
    // Ticking a planned study task done here also marks it done in the Study Planner.
    if (action === 'done' && item.kind === 'study_task') {
      const [, planId, taskId] = item.id.split(':');
      await LearningModulesService.updateTaskStatus(studentId, planId, taskId, 'COMPLETED');
    }
    this.save(studentId, itemId, rec);
    return rec;
  }

  /** Adds the item to today's (or a chosen day's) plan, with the title and minutes the student set. */
  static async addToPlan(studentId: string, itemId: string, today: string, edits: { title?: unknown; minutes?: unknown; date?: unknown }) {
    const item = await this.findItem(studentId, itemId, today);
    if (item.kind === 'study_task') throw new ValidationError('This item is already in your study plan.');
    const title = String(edits.title ?? item.title).trim().slice(0, 200);
    const minutes = edits.minutes === undefined ? item.minutes || 30 : Number(edits.minutes);
    const date = String(edits.date ?? today);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || daysBetween(today, date) < 0 || daysBetween(today, date) > 30) {
      throw new ValidationError('Pick a day between today and 30 days from now.');
    }
    const plans = await LearningModulesService.getStudyPlans(studentId);
    let plan = plans.find((p: any) => p.title === BRIEFING_PLAN_TITLE && p.status === 'ACTIVE');
    if (!plan) {
      plan = await LearningModulesService.createStudyPlan(studentId, {
        title: BRIEFING_PLAN_TITLE,
        type: 'DAILY',
        description: 'Tasks you added from your daily briefing.',
        target_date: date,
        total_hours_target: 10,
      } as any);
    }
    const task = await LearningModulesService.addStudyPlanTask(studentId, plan.id, {
      title,
      subject: item.subject,
      topic: item.topic,
      date,
      duration_minutes: Math.round(minutes),
      priority: item.priority === 1 ? 'HIGH' : 'MEDIUM',
      notes: `Added from your daily briefing (${item.source}).`,
    });
    this.save(studentId, itemId, { action: 'accepted', at: new Date().toISOString() });
    return { plan_id: plan.id, task };
  }

  /** Brings a handled item back. */
  static undo(studentId: string, itemId: string) {
    const next = { ...this.actions(studentId) };
    delete next[itemId];
    briefingStores.actions.set(studentId, next);
  }
}
