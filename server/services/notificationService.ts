import { db } from '../db/database';
import {
  NotificationItem,
  NotificationPreference,
  NotificationType,
} from '../models/communityProfileProgressTypes';

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
    return db.updateNotificationPreferences(studentId, updates);
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
    if (typeof studentIdOrPayload === 'string') {
      return db.createNotificationItem(studentIdOrPayload, data!);
    }
    return db.createNotificationItem(studentIdOrPayload.student_id, studentIdOrPayload);
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

    // 2. Study task reminder
    if (prefs.learning) {
      try {
        const todayTasks = await db.getTodayTasks(studentId);
        const pendingTasks = todayTasks.filter((t) => !(t as any).is_completed && !(t as any).completed);
        if (pendingTasks.length > 0) {
          const alreadyNotified = existing.some(
            (n) => (n.title.includes('Study Plan') || n.title.includes('Study Tasks')) && new Date(n.created_at).getTime() > oneDayAgo
          );
          if (!alreadyNotified) {
            const notif = await this.createNotification(studentId, {
              type: 'SYSTEM',
              title: `Today's Study Plan: ${pendingTasks.length} Pending Tasks`,
              message: `You have ${pendingTasks.length} study tasks scheduled for today. Complete them to maintain your streak!`,
              link: '/study-planner',
              entity_type: 'STUDY_TASK',
              entity_id: 'today_tasks',
            });
            created.push(notif);
          }
        }
      } catch (err) {
        // gracefully continue
      }
    }

    const result = Object.assign([...created], {
      generated: created.length,
      message: created.length > 0 ? `Generated ${created.length} reminders` : 'No new reminders needed',
    });
    return result;
  }
}
