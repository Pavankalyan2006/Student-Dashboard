import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { db } from '../../db/database';
import { ProjectService } from '../../services/projectService';
import { ProjectModuleTaskService } from '../../services/projectModuleTaskService';
import { ProjectArchitectureService } from '../../services/projectArchitectureService';
import { ProjectPlanningService } from '../../services/projectPlanningService';
import { ProjectDocumentationService } from '../../services/projectDocumentationService';
import { ProjectAIService } from '../../services/projectAIService';
import { logger } from '../../core/logging';

const router = Router();

// Apply authentication middleware to all project endpoints
router.use(requireAuth);

/**
 * GET /api/v1/projects
 * List all projects for authenticated student
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { domain, status, project_type, search } = req.query;

    const projects = await ProjectService.listProjects(studentId, {
      domain: domain as string,
      status: status as string,
      project_type: project_type as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    logger.error('Error listing projects', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/projects
 * Create a new project
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await ProjectService.createProject(studentId, req.body);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    logger.error('Error creating project', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/projects/generate-ideas
 * Generate AI project ideas
 */
router.post('/generate-ideas', async (req: Request, res: Response) => {
  try {
    const ideas = await ProjectPlanningService.generateProjectIdeas(req.body);
    res.json({
      success: true,
      data: ideas,
    });
  } catch (error: any) {
    logger.error('Error generating project ideas', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/projects/:projectId
 * Get project details
 */
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await ProjectService.getProject(req.params.projectId, studentId);
    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 404;
    res.status(status).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/v1/projects/:projectId
 * Update project details
 */
router.patch('/:projectId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await ProjectService.updateProject(req.params.projectId, studentId, req.body);
    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/v1/projects/:projectId
 * Delete project
 */
router.delete('/:projectId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectService.deleteProject(req.params.projectId, studentId);
    res.json({
      success: true,
      message: 'Project successfully deleted',
    });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/projects/:projectId/progress
 * Get authoritative calculated project progress
 */
router.get('/:projectId/progress', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const progress = await ProjectService.calculateProgress(req.params.projectId, studentId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    const status = error.message.includes('Forbidden') ? 403 : 404;
    res.status(status).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/projects/:projectId/activity
 * Get project activity history
 */
router.get('/:projectId/activity', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectService.getProject(req.params.projectId, studentId);
    const activities = await db.getProjectActivities(req.params.projectId);
    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

/**
 * MODULES ENDPOINTS
 */
router.get('/:projectId/modules', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const modules = await ProjectModuleTaskService.getModules(req.params.projectId, studentId);
    res.json({ success: true, data: modules });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/modules', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const module = await ProjectModuleTaskService.createModule(req.params.projectId, studentId, req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/:projectId/modules/:moduleId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const module = await ProjectModuleTaskService.updateModule(
      req.params.projectId,
      studentId,
      req.params.moduleId,
      req.body
    );
    res.json({ success: true, data: module });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:projectId/modules/:moduleId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectModuleTaskService.deleteModule(req.params.projectId, studentId, req.params.moduleId);
    res.json({ success: true, message: 'Module deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * TASKS ENDPOINTS
 */
router.get('/:projectId/tasks', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const moduleId = req.query.module_id as string | undefined;
    const tasks = await ProjectModuleTaskService.getTasks(req.params.projectId, studentId, moduleId);
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/tasks', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const task = await ProjectModuleTaskService.createTask(req.params.projectId, studentId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/:projectId/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const task = await ProjectModuleTaskService.updateTask(
      req.params.projectId,
      studentId,
      req.params.taskId,
      req.body
    );
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:projectId/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectModuleTaskService.deleteTask(req.params.projectId, studentId, req.params.taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * MILESTONES ENDPOINTS
 */
router.get('/:projectId/milestones', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const milestones = await ProjectModuleTaskService.getMilestones(req.params.projectId, studentId);
    res.json({ success: true, data: milestones });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/milestones', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const milestone = await ProjectModuleTaskService.createMilestone(req.params.projectId, studentId, req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/:projectId/milestones/:milestoneId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const milestone = await ProjectModuleTaskService.updateMilestone(
      req.params.projectId,
      studentId,
      req.params.milestoneId,
      req.body
    );
    res.json({ success: true, data: milestone });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:projectId/milestones/:milestoneId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectModuleTaskService.deleteMilestone(req.params.projectId, studentId, req.params.milestoneId);
    res.json({ success: true, message: 'Milestone deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * ARCHITECTURE ENDPOINTS
 */
router.get('/:projectId/architecture', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const architecture = await ProjectArchitectureService.getArchitecture(req.params.projectId, studentId);
    res.json({ success: true, data: architecture });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.put('/:projectId/architecture', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const architecture = await ProjectArchitectureService.saveArchitecture(
      req.params.projectId,
      studentId,
      req.body
    );
    res.json({ success: true, data: architecture });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * TECHNOLOGIES ENDPOINTS
 */
router.get('/:projectId/technologies', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const tech = await ProjectService.getTechnologies(req.params.projectId, studentId);
    res.json({ success: true, data: tech });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/technologies', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const tech = await ProjectService.addTechnology(req.params.projectId, studentId, req.body);
    res.status(201).json({ success: true, data: tech });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:projectId/technologies/:techId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectService.removeTechnology(req.params.projectId, studentId, req.params.techId);
    res.json({ success: true, message: 'Technology removed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * DOCUMENTATION ENDPOINTS
 */
router.get('/:projectId/documentation', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const docs = await ProjectDocumentationService.getDocuments(req.params.projectId, studentId);
    res.json({ success: true, data: docs });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.get('/:projectId/documentation/:docId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doc = await ProjectDocumentationService.getDocument(
      req.params.projectId,
      studentId,
      req.params.docId
    );
    res.json({ success: true, data: doc });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/documentation', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doc = await ProjectDocumentationService.saveDocument(
      req.params.projectId,
      studentId,
      req.body
    );
    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:projectId/documentation/:docId', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ProjectDocumentationService.deleteDocument(
      req.params.projectId,
      studentId,
      req.params.docId
    );
    res.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/documentation/generate', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doc = await ProjectDocumentationService.generateDocument(
      req.params.projectId,
      studentId,
      req.body
    );
    res.json({ success: true, data: doc });
  } catch (error: any) {
    logger.error('Error generating project documentation', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * REQUIREMENTS & RISKS ENDPOINTS
 */
router.get('/:projectId/requirements', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const reqs = await ProjectService.getRequirements(req.params.projectId, studentId);
    res.json({ success: true, data: reqs });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/requirements', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const newReq = await ProjectService.addRequirement(req.params.projectId, studentId, req.body);
    res.status(201).json({ success: true, data: newReq });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:projectId/risks', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const risks = await ProjectService.getRisks(req.params.projectId, studentId);
    res.json({ success: true, data: risks });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/risks', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const newRisk = await ProjectService.addRisk(req.params.projectId, studentId, req.body);
    res.status(201).json({ success: true, data: newRisk });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * AI PLANNING & ANALYSIS ENDPOINTS
 */
router.post('/:projectId/generate-plan', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plan = await ProjectPlanningService.generateProjectPlan(
      req.params.projectId,
      studentId,
      req.body
    );
    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/apply-plan', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await ProjectPlanningService.applyGeneratedPlan(
      req.params.projectId,
      studentId,
      req.body
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/generate-architecture', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const arch = await ProjectPlanningService.generateArchitecture(req.params.projectId, studentId);
    res.json({ success: true, data: arch });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/analyze-scope', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const scope = await ProjectPlanningService.analyzeProjectScope(req.params.projectId, studentId);
    res.json({ success: true, data: scope });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/analyze-risks', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const risks = await ProjectPlanningService.analyzeProjectRisks(req.params.projectId, studentId);
    res.json({ success: true, data: risks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/suggest-technologies', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const suggestions = await ProjectPlanningService.suggestTechStack(req.params.projectId, studentId);
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/ask-ai', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { question, history } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }
    const answer = await ProjectAIService.askProjectAI(
      req.params.projectId,
      studentId,
      question,
      history
    );
    res.json({ success: true, data: answer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:projectId/generate-notes', async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const note = await ProjectAIService.generateProjectNotes(
      req.params.projectId,
      studentId,
      req.body.note_type || 'ARCHITECTURE'
    );
    res.json({ success: true, data: note });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
