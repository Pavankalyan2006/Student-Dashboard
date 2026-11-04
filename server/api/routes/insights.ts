import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { LearningInsightService } from '../../services/learningInsightService';
import { RecommendationService } from '../../services/recommendationService';

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
