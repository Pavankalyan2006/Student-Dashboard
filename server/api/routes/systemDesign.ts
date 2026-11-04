// server/api/routes/systemDesign.ts
// Express router for all System Design Lab endpoints

import { Router, Request, Response } from 'express';
import { SystemDesignService } from '../../services/systemDesignService';
import { db } from '../../db/database';
import { logger } from '../../core/logging';

export const systemDesignRouter = Router();

const resolveStudentId = (req: Request): string => {
  return req.user?.userId || 'std_01j8k9x2p4';
};

// =========================================================================
// 1. Learning Roadmap & Lessons
// =========================================================================

systemDesignRouter.get('/system-design/roadmap', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const roadmap = await SystemDesignService.getRoadmap(studentId);
    res.json({ success: true, data: roadmap });
  } catch (err: any) {
    logger.error('Error fetching system design roadmap', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/lessons', async (req: Request, res: Response) => {
  try {
    const level = req.query.level ? Number(req.query.level) : undefined;
    const lessons = await SystemDesignService.getLessons(level);
    res.json({ success: true, data: lessons, count: lessons.length });
  } catch (err: any) {
    logger.error('Error fetching system design lessons', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/lessons/:lesson_id', async (req: Request, res: Response) => {
  try {
    const lesson = await SystemDesignService.getLessonById(req.params.lesson_id);
    res.json({ success: true, data: lesson });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/lessons/:lesson_id/complete', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { quiz_score } = req.body;
    const result = await SystemDesignService.completeLesson(studentId, req.params.lesson_id, quiz_score);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 2. Design Projects CRUD, Versions & Imports
// =========================================================================

systemDesignRouter.get('/system-design/projects', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const projects = await SystemDesignService.getProjects(studentId);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/projects', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const project = await SystemDesignService.createProject(studentId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/projects/:project_id', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const project = await SystemDesignService.getProjectById(req.params.project_id, studentId);
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.patch('/system-design/projects/:project_id', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const updated = await SystemDesignService.updateProject(req.params.project_id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.delete('/system-design/projects/:project_id', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    await SystemDesignService.deleteProject(req.params.project_id, studentId);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/projects/:project_id/versions', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { note } = req.body;
    const version = await SystemDesignService.createProjectVersion(req.params.project_id, studentId, note);
    res.status(201).json({ success: true, data: version });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/projects/:project_id/duplicate', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { title } = req.body;
    const cloned = await SystemDesignService.duplicateProject(req.params.project_id, studentId, title);
    res.status(201).json({ success: true, data: cloned });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/projects/import', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const imported = await SystemDesignService.importProject(studentId, req.body);
    res.status(201).json({ success: true, data: imported });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 3. Design Challenges & Submissions
// =========================================================================

systemDesignRouter.get('/system-design/challenges', async (req: Request, res: Response) => {
  try {
    const difficulty = req.query.difficulty as string | undefined;
    const category = req.query.category as string | undefined;
    const challenges = await SystemDesignService.getChallenges(difficulty, category);
    res.json({ success: true, data: challenges, count: challenges.length });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/challenges/:challenge_id', async (req: Request, res: Response) => {
  try {
    const challenge = await SystemDesignService.getChallengeById(req.params.challenge_id);
    res.json({ success: true, data: challenge });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/challenges/:challenge_id/start', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const project = await SystemDesignService.startProjectFromChallenge(studentId, req.params.challenge_id);
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/challenges/:challenge_id/submissions', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { project_id } = req.body;
    if (!project_id) {
      res.status(400).json({ success: false, message: 'project_id is required' });
      return;
    }
    const submission = await SystemDesignService.submitChallengeSolution(studentId, req.params.challenge_id, project_id);
    res.status(201).json({ success: true, data: submission });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/challenges/:challenge_id/submissions', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const submissions = await SystemDesignService.getChallengeSubmissions(studentId, req.params.challenge_id);
    res.json({ success: true, data: submissions });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 4. Evaluation, Simulation, DDL, OpenAPI & Capacity
// =========================================================================

systemDesignRouter.post('/system-design/projects/:project_id/evaluate', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const project = await SystemDesignService.getProjectById(req.params.project_id, studentId);
    let challenge;
    if (project.challenge_id) {
      try {
        challenge = await SystemDesignService.getChallengeById(project.challenge_id);
      } catch {
        // custom design without catalog challenge
      }
    }
    const evaluation = SystemDesignService.evaluateArchitecture(project, challenge);
    res.json({ success: true, data: evaluation });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/simulate', async (req: Request, res: Response) => {
  try {
    const { simulation_type, params } = req.body;
    let result;
    switch (simulation_type) {
      case 'LOAD_BALANCING':
        result = SystemDesignService.simulateLoadBalancing(params || {});
        break;
      case 'CACHING':
        result = SystemDesignService.simulateCaching(params || {});
        break;
      case 'READ_REPLICAS':
        result = SystemDesignService.simulateReadReplicas(params || {});
        break;
      case 'HORIZONTAL_SCALING':
        result = SystemDesignService.simulateHorizontalScaling(params || {});
        break;
      case 'QUEUE_PROCESSING':
        result = SystemDesignService.simulateQueueProcessing(params || {});
        break;
      case 'AVAILABILITY_ANALYSIS':
        result = SystemDesignService.simulateAvailability(params || {});
        break;
      case 'COST_ESTIMATION':
        result = SystemDesignService.estimateCloudCost(params || {});
        break;
      default:
        res.status(400).json({ success: false, message: `Unsupported simulation type: ${simulation_type}` });
        return;
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/capacity-estimate', (req: Request, res: Response) => {
  try {
    const result = SystemDesignService.calculateCapacity(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/generate-sql', (req: Request, res: Response) => {
  try {
    const { database_design, dialect } = req.body;
    const sql = SystemDesignService.generateSqlDdl(database_design, dialect || 'POSTGRESQL');
    res.json({ success: true, data: { sql, dialect: dialect || 'POSTGRESQL' } });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/generate-openapi', (req: Request, res: Response) => {
  try {
    const { api_specification } = req.body;
    const spec = SystemDesignService.generateOpenApiSpec(api_specification || { title: 'API', version: '1.0.0', base_url: '', endpoints: [] });
    res.json({ success: true, data: spec });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 5. System Design Interview Practice
// =========================================================================

systemDesignRouter.post('/system-design/interviews', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { challenge_id, target_role, duration_minutes } = req.body;
    if (!challenge_id) {
      res.status(400).json({ success: false, message: 'challenge_id is required' });
      return;
    }
    const session = await SystemDesignService.startInterview(studentId, challenge_id, target_role, duration_minutes);
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/interviews', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const sessions = await db.getSystemDesignInterviews(studentId);
    res.json({ success: true, data: sessions });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/interviews/:session_id', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const session = await db.getSystemDesignInterview(req.params.session_id, studentId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.post('/system-design/interviews/:session_id/responses', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { step, notes, diagram_snapshot } = req.body;
    if (!step) {
      res.status(400).json({ success: false, message: 'step is required' });
      return;
    }
    const updated = await SystemDesignService.submitInterviewStep(req.params.session_id, studentId, step, notes, diagram_snapshot);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 6. AI Assistant & Analytics
// =========================================================================

systemDesignRouter.post('/system-design/ai-tutor', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { prompt, mode, context } = req.body;
    const result = await SystemDesignService.queryAiAssistant(studentId, prompt, mode || 'CONCEPT', context);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

systemDesignRouter.get('/system-design/analytics', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const progress = await db.getStudentSystemDesignProgress(studentId);
    const roadmap = await SystemDesignService.getRoadmap(studentId);
    const projects = await SystemDesignService.getProjects(studentId);
    const submissions = await SystemDesignService.getChallengeSubmissions(studentId);
    const interviews = await db.getSystemDesignInterviews(studentId);

    res.json({
      success: true,
      data: {
        progress,
        roadmap_summary: {
          overall_percentage: roadmap.overall_progress_percentage,
          completed_lessons: roadmap.completed_lessons_count,
          total_lessons: roadmap.total_lessons_count
        },
        projects_count: projects.length,
        submissions_count: submissions.length,
        completed_interviews_count: interviews.filter(i => i.status === 'COMPLETED').length,
        recent_activity: progress.last_activity_at
      }
    });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
