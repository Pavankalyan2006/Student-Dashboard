import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { PlacementService } from '../../services/placementService';
import { PlacementTopicService } from '../../services/placementTopicService';
import { PlacementCompanyRoleService } from '../../services/placementCompanyRoleService';
import { PlacementPlanService } from '../../services/placementPlanService';
import { MockInterviewService } from '../../services/mockInterviewService';
import { PlacementAIService } from '../../services/placementAIService';
import { db } from '../../db/database';
import { logger } from '../../core/logging';

export const placementsRouter = Router();

// 1. Placement Readiness, Stats & Progress
placementsRouter.get('/dashboard-stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const stats = await PlacementService.getDashboardStats(studentId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    logger.error('Failed to get placement dashboard stats', { error: err.message });
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/readiness', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const readiness = await PlacementService.getReadiness(studentId);
    res.json({ success: true, data: readiness });
  } catch (err: any) {
    logger.error('Failed to get placement readiness', { error: err.message });
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const readiness = await PlacementService.getReadiness(studentId);
    res.json({ success: true, data: readiness });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/recommendations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const recommendations = await PlacementService.getRecommendations(studentId);
    res.json({ success: true, data: recommendations });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Group Discussion Topics
placementsRouter.get('/gd-topics', requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const topics = await db.getGroupDiscussionTopics(category);
    res.json({ success: true, data: topics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/gd-topics/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const topic = await db.getGroupDiscussionTopicById(req.params.id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Group discussion topic not found' });
    }
    res.json({ success: true, data: topic });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Real Resume & Project Defense Audit
placementsRouter.get('/resume-audit', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const audit = await PlacementService.getResumeAudit(studentId);
    res.json({ success: true, data: audit });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Timed Assessments
placementsRouter.post('/assessments/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await PlacementService.submitAssessment(studentId, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Failed to submit placement assessment', { error: err.message });
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/assessments/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const history = await PlacementService.getAssessmentHistory(studentId);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// 2. Placement Topics
placementsRouter.get('/topics', requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const topics = await PlacementTopicService.getTopics(category as any);
    res.json({ success: true, data: topics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/topics/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const topic = await PlacementTopicService.getTopicById(req.params.id);
    res.json({ success: true, data: topic });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 3. Placement Questions & Interview Questions
placementsRouter.get('/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const topicId = req.query.topic_id as string | undefined;
    const category = req.query.category as string | undefined;
    const questions = await PlacementTopicService.getQuestions(topicId, category as any);
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/questions/:id/practice', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await PlacementTopicService.evaluateQuestionAnswer(
      studentId,
      req.params.id,
      req.body.answer
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/interview-questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const topicId = req.query.topic_id as string | undefined;
    const questions = await PlacementTopicService.getInterviewQuestions(category as any, topicId);
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Companies & Roles
placementsRouter.get('/companies', requireAuth, async (req: Request, res: Response) => {
  try {
    const companies = await PlacementCompanyRoleService.getCompanies();
    res.json({ success: true, data: companies });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/companies/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const company = await PlacementCompanyRoleService.getCompanyById(req.params.id);
    res.json({ success: true, data: company });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/companies/:id/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const roleId = req.query.role_id as string | undefined;
    const profile = await PlacementCompanyRoleService.getCompanyProfile(req.params.id, roleId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/roles', requireAuth, async (req: Request, res: Response) => {
  try {
    const roles = await PlacementCompanyRoleService.getRoles();
    res.json({ success: true, data: roles });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/roles/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const role = await PlacementCompanyRoleService.getRoleById(req.params.id);
    res.json({ success: true, data: role });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 5. Placement Plans & Tasks
placementsRouter.get('/plans', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plans = await PlacementPlanService.getPlans(studentId);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/plans', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await PlacementPlanService.createPlan(studentId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/plans/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plan = await PlacementPlanService.getPlanById(req.params.id, studentId);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/plans/:id/tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const tasks = await PlacementPlanService.getPlanTasks(req.params.id, studentId);
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.patch('/plans/:id/tasks/:taskId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await PlacementPlanService.updatePlanTask(
      req.params.id,
      studentId,
      req.params.taskId,
      req.body
    );
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.patch('/plans/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await PlacementPlanService.updatePlan(
      req.params.id,
      studentId,
      req.body
    );
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.delete('/plans/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await PlacementPlanService.deletePlan(req.params.id, studentId);
    res.json({ success: true, message: 'Placement plan deleted successfully' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 6. Mock Interviews
placementsRouter.get('/interviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const sessions = await db.getMockInterviewSessions(studentId);
    res.json({ success: true, data: sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/interviews', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewService.createSession(studentId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/interviews/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewService.getSession(req.params.id, studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/interviews/:id/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await MockInterviewService.startSession(req.params.id, studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/interviews/:id/answers', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewService.submitAnswer(
      req.params.id,
      studentId,
      req.body.question_id,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/interviews/:id/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewService.completeSession(req.params.id, studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/interviews/:id/abandon', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await MockInterviewService.abandonSession(req.params.id, studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

placementsRouter.get('/interviews/:id/feedback', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const feedback = await MockInterviewService.getFeedback(req.params.id, studentId);
    res.json({ success: true, data: feedback });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 7. AI Placement Coach & Notes
placementsRouter.post('/coach/ask', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await PlacementAIService.askPlacementCoach(
      studentId,
      req.body.question,
      req.body.context
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/star/improve', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await PlacementAIService.improveWithStar(req.body.raw_answer);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

placementsRouter.post('/notes/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const note = await PlacementAIService.generatePlacementNotes(
      studentId,
      req.body.title,
      req.body.content,
      req.body.category
    );
    res.json({ success: true, data: note });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default placementsRouter;
