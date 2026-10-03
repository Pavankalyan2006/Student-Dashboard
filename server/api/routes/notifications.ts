import { Router } from 'express';
import { db } from '../../db/database';
import { requireAuth } from '../../middleware/auth';
import { NotFoundError } from '../../core/exceptions';

export const notificationsRouter = Router();

// GET /api/v1/notifications
notificationsRouter.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const notifications = await db.getNotifications(studentId);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

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

