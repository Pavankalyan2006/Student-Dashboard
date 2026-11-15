import { Router } from 'express';
import { db } from '../../db/database';
import { requireAuth } from '../../middleware/auth';
import { NotFoundError } from '../../core/exceptions';
import { NotificationService } from '../../services/notificationService';
import { NOTIFICATION_CATEGORIES, LEAD_DAYS } from '../../services/notificationCategories';

export const notificationsRouter = Router();

const lastReminderScan = new Map<string, number>();

// GET /api/v1/notifications
notificationsRouter.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { unreadOnly, category, limit } = req.query;
    // Phase 7: reminders are checked at most once an hour per student, when the list is opened.
    // Each reminder has a key, so a check never repeats one that was already sent.
    const last = lastReminderScan.get(studentId) || 0;
    if (Date.now() - last > 60 * 60 * 1000) {
      lastReminderScan.set(studentId, Date.now());
      await NotificationService.generateReminders(studentId).catch(() => undefined);
    }
    let notifications = await db.getNotifications(studentId);

    if (String(unreadOnly) === 'true') {
      notifications = notifications.filter((n) => !n.is_read);
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      const catUpper = category.toUpperCase();
      notifications = notifications.filter(
        (n) => n.type.toUpperCase().includes(catUpper) || (n as any).category?.toUpperCase() === catUpper
      );
    }

    const unreadCount = (await db.getNotifications(studentId)).filter((n) => !n.is_read).length;

    if (limit && !isNaN(Number(limit))) {
      notifications = notifications.slice(0, Number(limit));
    }

    res.json({
      success: true,
      data: {
        items: notifications,
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notifications/categories (Phase 7): the reminder categories a student can switch on or off.
notificationsRouter.get('/notifications/categories', requireAuth, (_req, res) => {
  res.json({
    success: true,
    data: {
      categories: NOTIFICATION_CATEGORIES,
      lead_days: LEAD_DAYS,
      delivery: { in_app: true, email: false, email_note: 'Email delivery is not connected on this deployment, so reminders appear in the app only.' },
    },
  });
});

// GET /api/v1/notifications/preferences
notificationsRouter.get('/notifications/preferences', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const prefs = await NotificationService.getPreferences(studentId);
    res.json({
      success: true,
      data: prefs,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/preferences
notificationsRouter.patch('/notifications/preferences', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const updated = await NotificationService.updatePreferences(studentId, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notifications/generate-reminders
notificationsRouter.post('/notifications/generate-reminders', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const reminders = await NotificationService.generateReminders(studentId);
    res.json({
      success: true,
      data: {
        generated_count: reminders.length,
        items: reminders,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/read-all
notificationsRouter.patch('/notifications/read-all', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const updatedCount = await db.markAllNotificationsRead(studentId);
    res.json({
      success: true,
      data: {
        updatedCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notifications/read-all
notificationsRouter.post('/notifications/read-all', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const updatedCount = await db.markAllNotificationsRead(studentId);
    res.json({
      success: true,
      data: {
        updatedCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notifications/:id/read
notificationsRouter.patch('/notifications/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;

    const marked = await db.markNotificationRead(id, studentId);
    if (!marked) {
      throw new NotFoundError('Notification not found or access denied');
    }

    res.json({
      success: true,
      data: { id, is_read: true },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notifications/:id/read
notificationsRouter.post('/notifications/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;

    const marked = await db.markNotificationRead(id, studentId);
    if (!marked) {
      throw new NotFoundError('Notification not found or access denied');
    }

    res.json({
      success: true,
      data: { id, is_read: true },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/notifications/:id
notificationsRouter.delete('/notifications/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.userId;

    const deleted = await db.deleteNotification(id, studentId);
    if (!deleted) {
      throw new NotFoundError('Notification not found or access denied');
    }

    res.json({
      success: true,
      message: 'Notification dismissed',
    });
  } catch (err) {
    next(err);
  }
});


