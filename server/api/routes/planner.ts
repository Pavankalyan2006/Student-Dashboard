import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { PlannerService } from '../../services/plannerService';

export const plannerRouter = Router();

const fail = (res: Response, err: any, fallback: string) => {
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
};

// GET /api/v1/timetable/me — the student's weekly class timetable.
plannerRouter.get('/timetable/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: PlannerService.timetable(req.user!.userId) });
  } catch (err) {
    fail(res, err, 'Your timetable could not be loaded.');
  }
});

// PUT /api/v1/timetable/me — replaces the timetable with the validated version of what the page sends.
plannerRouter.put('/timetable/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: PlannerService.saveTimetable(req.user!.userId, req.body) });
  } catch (err) {
    fail(res, err, 'Your timetable could not be saved.');
  }
});

// GET /api/v1/tasks/me — the student's task board.
plannerRouter.get('/tasks/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: PlannerService.board(req.user!.userId) });
  } catch (err) {
    fail(res, err, 'Your task board could not be loaded.');
  }
});

// PUT /api/v1/tasks/me — replaces the board with the validated version of what the page sends.
plannerRouter.put('/tasks/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: PlannerService.saveBoard(req.user!.userId, req.body) });
  } catch (err) {
    fail(res, err, 'Your task board could not be saved.');
  }
});
