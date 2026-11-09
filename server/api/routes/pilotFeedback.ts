// Phase 6: private pilot feedback for the signed-in student. There is no admin route: the owner
// reads an anonymised export (scripts/pilot/export-feedback.cjs). Every route takes the student
// only from the verified session.
import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { PilotFeedbackService } from '../../services/pilotFeedbackService';

export const pilotFeedbackRouter = Router();

pilotFeedbackRouter.get('/pilot-feedback/config', requireAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: PilotFeedbackService.config() });
});

pilotFeedbackRouter.get('/pilot-feedback/mine', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: PilotFeedbackService.listMine(req.user!.userId) });
});

pilotFeedbackRouter.post('/pilot-feedback', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ success: true, data: PilotFeedbackService.submit(req.user!.userId, req.body || {}) });
  } catch (err) {
    next(err);
  }
});

pilotFeedbackRouter.delete('/pilot-feedback/mine/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    PilotFeedbackService.withdraw(req.user!.userId, req.params.id);
    res.json({ success: true, data: { withdrawn: req.params.id } });
  } catch (err) {
    next(err);
  }
});

pilotFeedbackRouter.delete('/pilot-feedback/mine', requireAuth, (req: Request, res: Response) => {
  res.json({ success: true, data: { withdrawn_count: PilotFeedbackService.withdrawAll(req.user!.userId) } });
});
