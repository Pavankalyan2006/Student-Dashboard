import { db } from '../db/database';
import {
  NotificationItem,
  NotificationPreference,
  NotificationType,
} from '../models/communityProfileProgressTypes';
import { ValidationError } from '../core/exceptions';
import { collectDeadlines } from './deadlineService';
import { LearningModulesService } from './learningModulesService';
import { competitionStores, upcomingDeadlines } from './competitionHubService';
import { categoryEnabled, cleanCategories, leadDays, LEAD_DAYS, reminderCandidates } from './notificationCategories';

export class NotificationService {
  public static async getNotifications(studentId: string, unreadOnly?: boolean): Promise<NotificationItem[] & {
    items: NotificationItem[];
    unreadCount: number;
    total: number;
  }> {
    const raw = await db.getNotifications(studentId);
    let items: NotificationItem[] = raw.map((r) => ({
      id: r.id,
      student_id: r.student_id,
      type: (r.type === 'ai' ? 'SYSTEM' : r.type === 'success' ? 'ACHIEVEMENT_EARNED' : 'SYSTEM') as NotificationType,
      title: r.title,
      message: r.message,
      link: r.link,
      is_read: r.is_read,
      created_at: r.created_at,
    }));

    const unreadCount = items.filter((i) => !i.is_read).length;
    if (unreadOnly) {
      items = items.filter((i) => !i.is_read);
    }
    const result = Object.assign([...items], {
      items,
      unreadCount,
      total: items.length,
    });
    return result as any;
  }

  public static async markRead(arg1: string, arg2?: string): Promise<boolean> {
    const studentId = arg1.startsWith('std_') ? arg1 : arg2 || '';
    const notifId = arg1.startsWith('std_') ? (arg2 || '') : arg1;
    return db.markNotificationRead(notifId, studentId);
  }

  public static async markAsRead(arg1: string, arg2?: string): Promise<{ is_read: boolean }> {
    await this.markRead(arg1, arg2);
    return { is_read: true };
  }

  public static async markAllRead(studentId: string): Promise<number> {
    return db.markAllNotificationsRead(studentId);
  }

  public static async markAllAsRead(studentId: string): Promise<number> {
    return db.markAllNotificationsRead(studentId);
  }

  public static async getPreferences(studentId: string): Promise<NotificationPreference> {
    return db.getNotificationPreferences(studentId);
  }

  public static async getNotificationPreferences(studentId: string): Promise<NotificationPreference> {
    return this.getPreferences(studentId);
  }

  public static async updatePreferences(
    studentId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    const u: any = { ...(updates || {}) };
    // Phase 7: the brief's categories are merged with the saved ones; unknown keys are kept for older screens.
    if (u.categories && typeof u.categories === 'object') {
      const current: any = (await db.getNotificationPreferences(studentId)).categories || {};
      u.categories = { ...current, ...u.categories, ...(cleanCategories(u.categories) || {}) };
    }
    if (u.reminder_lead_days !== undefined) {
      const n = Number(u.reminder_lead_days);
      if (!Number.isInteger(n) || n < LEAD_DAYS.min || n > LEAD_DAYS.max) throw new ValidationError(`reminder_lead_days must be ${LEAD_DAYS.min} to ${LEAD_DAYS.max}`);
      u.reminder_lead_days = n;
    }
    return db.updateNotificationPreferences(studentId, u);
  }

  public static async updateNotificationPreferences(
    studentId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    return this.updatePreferences(studentId, updates);
  }

  public static async createNotification(
    studentIdOrPayload: string | {
      student_id: string;
      type: NotificationType;
      title: string;
      message: string;
      entity_type?: string;
      entity_id?: string;
      link?: string;
    },
    data?: {
      type: NotificationType;
      title: string;
      message: string;
      entity_type?: string;
      entity_id?: string;
      link?: string;
    }
  ): Promise<NotificationItem> {
    const studentId = typeof studentIdOrPayload === 'string' ? studentIdOrPayload : studentIdOrPayload.student_id;
    const payload = typeof studentIdOrPayload === 'string' ? data! : studentIdOrPayload;
    // Phase 5: honour the student's notification preferences (one record, edited in profile and settings).
    const prefs = await db.getNotificationPreferences(studentId);
    const kind = String(payload.type || '').toUpperCase();
    const isReminder = /REMINDER|DEADLINE|REVISION|STUDY_PLAN/.test(kind);
    const muted =
      prefs.in_app === false ||
      (isReminder && /REVISION/.test(kind) && prefs.revision_reminders === false) ||
      (isReminder && /DEADLINE/.test(kind) && prefs.goal_deadlines === false) ||
      (isReminder && /STUDY/.test(kind) && prefs.study_reminders === false);
    if (muted) {
      return { id: '', student_id: studentId, ...payload, is_read: true, suppressed: true, created_at: new Date().toISOString() } as any;
    }
    return db.createNotificationItem(studentId, payload as any);
  }

  public static async deleteNotification(arg1: string, arg2?: string): Promise<{ success: boolean }> {
    const studentId = arg1.startsWith('std_') ? arg1 : arg2 || '';
    const notifId = arg1.startsWith('std_') ? (arg2 || '') : arg1;
    const deleted = await db.deleteNotification(notifId, studentId);
    return { success: deleted };
  }

  public static async generateReminders(
    studentId: string
  ): Promise<NotificationItem[] & { generated: number; message: string }> {
    const prefs = await this.getPreferences(studentId);
    if (prefs && prefs.in_app === false) {
      return Object.assign([] as NotificationItem[], { generated: 0, message: 'In-app notifications are disabled' });
    }

    const created: NotificationItem[] = [];
    const existing = await db.getNotifications(studentId);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // 1. Goal reminders
    if (prefs.learning) {
      const goals = await db.getStudentGoals(studentId);
      for (const goal of goals) {
        if (goal.status === 'ACTIVE' || (goal.status as string) === 'IN_PROGRESS') {
          const targetTime = new Date(goal.target_date).getTime();
          const isApproaching = targetTime - Date.now() <= 5 * 24 * 60 * 60 * 1000;
          if (isApproaching) {
            const alreadyNotified = existing.some(
              (n) =>
                n.title.includes(goal.title) &&
                new Date(n.created_at).getTime() > oneDayAgo
            );
            if (!alreadyNotified) {
              const notif = await this.createNotification(studentId, {
                type: 'GOAL_MILESTONE',
                title: `Goal Deadline Approaching: ${goal.title}`,
                message: `Target date is ${goal.target_date}. Progress: ${goal.current_value || 0}/${goal.target_value} ${goal.unit}.`,
                link: `/goals/${goal.id}`,
                entity_type: 'LEARNING_GOAL',
                entity_id: goal.id,
              });
              created.push(notif);
            }
          }
        }
      }
    }

    // 2. Phase 7: the brief's categories, built from the student's own dated records.
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [deadlines, applications, todayTasks, due] = await Promise.all([
        collectDeadlines(studentId).catch(() => []),
        LearningModulesService.getApplications(studentId).catch(() => [] as any[]),
        db.getTodayTasks(studentId).catch(() => [] as any[]),
        db.getDueFlashcards(studentId, { limit: 500 }).catch(() => [] as any[]),
      ]);
      const hub = upcomingDeadlines(competitionStores.events.get(studentId) || [], [], competitionStores.participations.get(studentId) || [], new Date().toISOString());
      const teams = Array.from(competitionStores.teams.values()).filter((t) => t.members.some((m) => m.student_id === studentId));
      const candidates = reminderCandidates(
        {
          today, deadlines, applications: applications as any[], hub_deadlines: hub, teams, studentId,
          today_tasks: todayTasks.filter((t: any) => !t.is_completed && !t.completed).length,
          due_flashcards: due.length,
        },
        leadDays(prefs)
      );
      const sent = new Set(existing.map((n: any) => n.entity_id).filter(Boolean));
      for (const c of candidates) {
        if (!categoryEnabled(prefs, c.category) || sent.has(c.key)) continue;
        const notif = await this.createNotification(studentId, {
          type: c.type as any,
          title: c.title,
          message: c.message,
          link: c.link,
          entity_type: `REMINDER_${c.category.toUpperCase()}`,
          entity_id: c.key,
        });
        if (notif.id) {
          created.push(notif);
          sent.add(c.key);
        }
      }
    } catch (err) {
      // a failing source adds no reminders; nothing is guessed
    }

    const result = Object.assign([...created], {
      generated: created.length,
      message: created.length > 0 ? `Generated ${created.length} reminders` : 'No new reminders needed',
    });
    return result;
  }
}
