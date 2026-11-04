import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { GoalService } from '../../services/goalService';

export const goalsRouter = Router();

// GET /api/v1/goals
goalsRouter.get('/goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { status, category, priority, search } = req.query;
    const goals = await GoalService.getGoals(studentId, {
      status: status as string,
      category: category as string,
      priority: priority as string,
      search: search as string,
    });
    res.json({ success: true, data: goals });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/goals
goalsRouter.post('/goals', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const goal = await GoalService.createGoal(studentId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/goals/:id
goalsRouter.get('/goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const goal = await GoalService.getGoal(req.params.id, studentId);
    res.json({ success: true, data: goal });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/goals/:id
goalsRouter.patch('/goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await GoalService.updateGoal(req.params.id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/goals/:id/milestones/:milestoneId/toggle
goalsRouter.post('/goals/:id/milestones/:milestoneId/toggle', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await GoalService.toggleMilestone(studentId, req.params.id, req.params.milestoneId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/goals/:id
goalsRouter.delete('/goals/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await GoalService.deleteGoal(req.params.id, studentId);
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/goals/:id/recommendations
goalsRouter.get('/goals/:id/recommendations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const recs = await GoalService.getGoalRecommendations(req.params.id, studentId);
    res.json({ success: true, data: recs });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

