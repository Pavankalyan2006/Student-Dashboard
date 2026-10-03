import { db } from '../db/database';
import {
  NotificationItem,
  NotificationPreference,
  NotificationType,
} from '../models/communityProfileProgressTypes';

export class NotificationService {
  public static async getNotifications(studentId: string): Promise<NotificationItem[] & {
    items: NotificationItem[];
    unreadCount: number;
    total: number;
  }> {
    const raw = await db.getNotifications(studentId);
    const items: NotificationItem[] = raw.map((r) => ({
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

  public static async updatePreferences(
    studentId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    return db.updateNotificationPreferences(studentId, updates);
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
}
