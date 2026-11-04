import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ProgressService } from '../../services/progressService';

export const progressRouter = Router();

// GET /api/v1/progress
progressRouter.get('/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { timeRange, subject } = req.query;
    const progress = await ProgressService.getUnifiedProgress(studentId, {
      timeRange: timeRange as string,
      subject: subject as string,
    });
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/export
progressRouter.get('/progress/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exported = await ProgressService.exportProgress(studentId);
    res.json({ success: true, data: exported });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});


// GET /api/v1/progress/courses
progressRouter.get('/progress/courses', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getCoursesProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/skills
progressRouter.get('/progress/skills', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getSkillsProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/quiz
progressRouter.get('/progress/quiz', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getQuizProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/coding
progressRouter.get('/progress/coding', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getCodingProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/dsa
progressRouter.get('/progress/dsa', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getDsaProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/projects
progressRouter.get('/progress/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getProjectsProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/placement
progressRouter.get('/progress/placement', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getPlacementProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/progress/research
progressRouter.get('/progress/research', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProgressService.getResearchProgress(studentId);
    res.json({ success: true, data: progress });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
