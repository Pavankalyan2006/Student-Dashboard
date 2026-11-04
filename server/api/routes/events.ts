import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { eventBus } from '../../events/eventBus';

export const eventsRouter = Router();

/**
 * Retrieve recent platform events for the current student (or all if SUPER_ADMIN)
 */
eventsRouter.get('/events/recent', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user?.role === 'SUPER_ADMIN' ? undefined : req.user?.userId;
    const limit = Math.min(100, parseInt(req.query.limit as string, 10) || 30);
    const events = eventBus.getRecentEvents(studentId, limit);

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (err) {
    next(err);
  }
});
