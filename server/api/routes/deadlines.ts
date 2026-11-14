import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { collectDeadlines, summariseDeadlines, todayFor, upcomingContests } from '../../services/deadlineService';

export const deadlinesRouter = Router();
deadlinesRouter.use('/deadlines', requireAuth);

// GET /api/v1/deadlines/me?tz=330 — every dated item the student has, grouped around their own today.
// `tz` is the student's UTC offset in minutes so "today" and "this week" are theirs, not the server's.
deadlinesRouter.get('/deadlines/me', async (req: Request, res: Response) => {
  try {
    const tz = Number(req.query.tz);
    const offset = Number.isFinite(tz) && Math.abs(tz) <= 14 * 60 ? tz : 0;
    const items = await collectDeadlines(req.user!.userId);
    res.json({ success: true, data: summariseDeadlines(items, todayFor(Date.now(), offset)) });
  } catch {
    res.status(500).json({ success: false, message: 'Your deadlines could not be loaded.' });
  }
});

// GET /api/v1/deadlines/contests — upcoming rated programming contests from the official Codeforces API.
deadlinesRouter.get('/deadlines/contests', async (_req: Request, res: Response) => {
  res.json({ success: true, data: await upcomingContests() });
});
