import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { CareerService } from '../../services/careerService';
import { logger } from '../../core/logging';

export const careerRouter = Router();

// 0. Career Dashboard Summary
careerRouter.get('/dashboard-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const summary = await CareerService.getCareerDashboardSummary(studentId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 0.1 Career Profile
careerRouter.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const profile = await CareerService.getCareerProfile(studentId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

careerRouter.patch('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await CareerService.updateCareerProfile(studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 1. Career Roles
careerRouter.get('/roles', requireAuth, async (_req: Request, res: Response) => {
  try {
    const roles = await CareerService.listRoles();
    res.json({ success: true, data: roles });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

careerRouter.get('/roles/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const role = await CareerService.getRole(req.params.id);
    res.json({ success: true, data: role });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 2. Role Comparison
careerRouter.post('/compare', requireAuth, async (req: Request, res: Response) => {
  try {
    const { role_ids } = req.body;
    if (!Array.isArray(role_ids) || role_ids.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide at least 2 role_ids for comparison' });
    }
    const comparison = await CareerService.compareRoles(role_ids);
    res.json({ success: true, data: comparison });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 3. Transparent Recommendations
careerRouter.get('/recommendations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const recommendations = await CareerService.getRecommendations(studentId);
    res.json({ success: true, data: recommendations });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 4. Career Roadmaps
careerRouter.get('/roadmaps', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const roadmaps = await CareerService.listRoadmaps(studentId);
    res.json({ success: true, data: roadmaps });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

careerRouter.post('/roadmaps', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { role_id, title } = req.body;
    if (!role_id) {
      return res.status(400).json({ success: false, message: 'role_id is required to generate a roadmap' });
    }
    const roadmap = await CareerService.generateRoadmap(studentId, role_id, title);
    res.status(201).json({ success: true, data: roadmap });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

careerRouter.get('/roadmaps/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const roadmap = await CareerService.getRoadmap(req.params.id, studentId);
    res.json({ success: true, data: roadmap });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

careerRouter.patch('/roadmaps/:id/steps/:stepId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { status } = req.body;
    const roadmap = await CareerService.updateStepStatus(req.params.id, studentId, req.params.stepId, status);
    res.json({ success: true, data: roadmap });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

careerRouter.delete('/roadmaps/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await CareerService.deleteRoadmap(req.params.id, studentId);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
