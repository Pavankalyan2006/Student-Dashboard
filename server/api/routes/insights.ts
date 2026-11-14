import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { LearningInsightService } from '../../services/learningInsightService';
import { RecommendationService } from '../../services/recommendationService';
import { LearningAnalyticsService } from '../../services/learningAnalyticsService';
import { MistakeNotebookService } from '../../services/mistakeNotebookService';

export const insightsRouter = Router();

// GET /api/v1/learning/insights
insightsRouter.get('/learning/insights', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const period = (req.query.period as 'DAILY' | 'WEEKLY' | 'MONTHLY') || 'WEEKLY';
    const insights = await LearningInsightService.getInsights(studentId, period);
    res.json({ success: true, data: insights });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/learning/recommendations
insightsRouter.get('/learning/recommendations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const recs = await RecommendationService.getRecommendations(studentId);
    res.json({ success: true, data: recs });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/learning/analytics?days=365&tz=330
// Activity calendar, streaks and patterns from the student's own records. `tz` is the student's UTC offset
// in minutes east of UTC, so days and hours are local to them.
insightsRouter.get('/learning/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const days = Number(req.query.days) || 365;
    const tz = Number(req.query.tz);
    const data = await LearningAnalyticsService.forStudent(studentId, {
      days,
      offsetMinutes: Number.isFinite(tz) ? tz : 0,
    });
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: 'Learning analytics could not be loaded.' });
  }
});

// GET /api/v1/learning/mistakes — every question the student got wrong, until they get it right.
insightsRouter.get('/learning/mistakes', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await MistakeNotebookService.forStudent(req.user!.userId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: 'Your mistake notebook could not be loaded.' });
  }
});

// POST /api/v1/learning/mistakes/retry  { source: 'quiz' | 'gate', question_id, answer }
insightsRouter.post('/learning/mistakes/retry', requireAuth, async (req: Request, res: Response) => {
  try {
    const { source, question_id, answer } = req.body || {};
    if (typeof question_id !== 'string' || !question_id) {
      return res.status(400).json({ success: false, message: 'question_id is required.' });
    }
    const data = await MistakeNotebookService.retry(req.user!.userId, source, question_id, answer);
    res.json({ success: true, data });
  } catch (err: any) {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({ success: false, message: status < 500 ? err.message : 'The answer could not be checked.' });
  }
});
