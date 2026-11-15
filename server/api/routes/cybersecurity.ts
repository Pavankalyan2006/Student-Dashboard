// Cybersecurity Lab. Every route needs sign-in and works on the signed-in student's own progress only.
// No route reaches another machine: the practice targets run in the student's browser.
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { CyberLabService } from '../../services/cyberLabService';

export const cybersecurityRouter = Router();
cybersecurityRouter.use(requireAuth);

const handle = (fn: (req: Request) => unknown, fallback: string) => async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 500;
    res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
  }
};
const me = (req: Request) => req.user!.userId;

// GET /api/v1/cybersecurity/me: tracks, exercises (without answers), progress and demonstrated skills.
cybersecurityRouter.get('/me', handle((req) => CyberLabService.overview(me(req)), 'The lab could not be loaded.'));
// POST /api/v1/cybersecurity/me/agree: accept the lab rules.
cybersecurityRouter.post('/me/agree', handle((req) => CyberLabService.agree(me(req)), 'Could not save.'));
// POST /api/v1/cybersecurity/exercises/:id/attempt { answer }
cybersecurityRouter.post('/exercises/:id/attempt', handle((req) => CyberLabService.attempt(me(req), String(req.params.id), req.body?.answer), 'The answer could not be checked.'));
