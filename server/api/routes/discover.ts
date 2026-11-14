import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { DiscoverService } from '../../services/discoverService';

export const discoverRouter = Router();

// POST /api/v1/discover/answer  { question }
// A sourced answer from Wikipedia, OpenAlex and the student's own notes. See server/services/discoverService.ts.
discoverRouter.post('/discover/answer', requireAuth, async (req: Request, res: Response) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (question.length < 3 || question.length > 300) {
    return res.status(400).json({ success: false, message: 'Ask a question between 3 and 300 characters.' });
  }
  try {
    const data = await DiscoverService.answer(req.user!.userId, question);
    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: 'Discover could not answer right now.' });
  }
});
