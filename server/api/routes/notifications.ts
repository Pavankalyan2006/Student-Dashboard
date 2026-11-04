import { Router } from 'express';
import { db } from '../../db/database';
import { requireAuth } from '../../middleware/auth';
import { NotFoundError } from '../../core/exceptions';
import { NotificationService } from '../../services/notificationService';

export const notificationsRouter = Router();

// GET /api/v1/notifications
notificationsRouter.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { unreadOnly, category, limit } = req.query;
    let notifications = await db.getNotifications(studentId);

    if (unreadOnly === 'true' || unreadOnly === true) {
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


