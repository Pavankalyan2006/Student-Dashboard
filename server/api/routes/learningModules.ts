// server/api/routes/learningModules.ts
// Express routes for the 10 New AI-Powered Learning Modules

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { LearningModulesService } from '../../services/learningModulesService';

export const learningModulesRouter = Router();

// ==========================================
// 1. AI Study Planner Routes
// ==========================================
learningModulesRouter.get('/study-planner/plans', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plans = await LearningModulesService.getStudyPlans(studentId);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/study-planner/plans/:planId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plan = await LearningModulesService.getStudyPlanById(studentId, req.params.planId);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/study-planner/plans', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plan = await LearningModulesService.createStudyPlan(studentId, req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.patch('/study-planner/plans/:planId/tasks/:taskId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { status } = req.body;
    const updated = await LearningModulesService.updateTaskStatus(studentId, req.params.planId, req.params.taskId, status);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/study-planner/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const tasks = await LearningModulesService.getTodayTasks(studentId);
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Exam Preparation Center Routes
// ==========================================
learningModulesRouter.get('/exams', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exams = await LearningModulesService.getExams(studentId);
    res.json({ success: true, data: exams });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/exams/:examId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exam = await LearningModulesService.getExamById(studentId, req.params.examId);
    res.json({ success: true, data: exam });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/exams', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exam = await LearningModulesService.createExam(studentId, req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. AI Doubt Solver Routes
// ==========================================
learningModulesRouter.get('/doubts', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doubts = await LearningModulesService.getDoubts(studentId);
    res.json({ success: true, data: doubts });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/doubts/:doubtId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doubt = await LearningModulesService.getDoubtById(studentId, req.params.doubtId);
    res.json({ success: true, data: doubt });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/doubts', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doubt = await LearningModulesService.createDoubt(studentId, req.body);
    res.status(201).json({ success: true, data: doubt });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Flashcards + Spaced Revision Routes
// ==========================================
learningModulesRouter.get('/flashcards/decks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const decks = await LearningModulesService.getFlashcardDecks(studentId);
    res.json({ success: true, data: decks });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/flashcards/decks/:deckId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await LearningModulesService.getFlashcardDeckById(studentId, req.params.deckId);
    res.json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await LearningModulesService.createFlashcardDeck(studentId, req.body);
    res.status(201).json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/cards/:cardId/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { confidence } = req.body;
    const card = await LearningModulesService.reviewFlashcard(studentId, req.params.deckId, req.params.cardId, Number(confidence) || 3);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. Lab Assistant + Viva Routes
// ==========================================
learningModulesRouter.get('/labs', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const labs = await LearningModulesService.getLabs(studentId);
    res.json({ success: true, data: labs });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/labs/:labId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const lab = await LearningModulesService.getLabById(studentId, req.params.labId);
    res.json({ success: true, data: lab });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/labs/:labId/experiments/:expId/viva/:qId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { student_answer } = req.body;
    const evaluated = await LearningModulesService.evaluateVivaAnswer(studentId, req.params.labId, req.params.expId, req.params.qId, student_answer || '');
    res.json({ success: true, data: evaluated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. SQL / Database Lab Routes
// ==========================================
learningModulesRouter.get('/sql-lab/schemas', async (_req: Request, res: Response) => {
  try {
    const schemas = await LearningModulesService.getSqlSchemas();
    res.json({ success: true, data: schemas });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/sql-lab/challenges', async (_req: Request, res: Response) => {
  try {
    const challenges = await LearningModulesService.getSqlChallenges();
    res.json({ success: true, data: challenges });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { query } = req.body;
    const result = await LearningModulesService.executeSandboxedSql(studentId, query || '');
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. AI/ML Experiment Lab Routes
// ==========================================
learningModulesRouter.get('/ml-lab/datasets', async (_req: Request, res: Response) => {
  try {
    const datasets = await LearningModulesService.getMlDatasets();
    res.json({ success: true, data: datasets });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/ml-lab/experiments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const experiments = await LearningModulesService.getMlExperiments(studentId);
    res.json({ success: true, data: experiments });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/ml-lab/experiments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const experiment = await LearningModulesService.createAndRunMlExperiment(studentId, req.body);
    res.status(201).json({ success: true, data: experiment });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. System Design Lab Routes
// ==========================================
learningModulesRouter.get('/system-design/problems', async (_req: Request, res: Response) => {
  try {
    const problems = await LearningModulesService.getSystemDesignProblems();
    res.json({ success: true, data: problems });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/system-design/designs', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const designs = await LearningModulesService.getSystemDesigns(studentId);
    res.json({ success: true, data: designs });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/system-design/designs', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const design = await LearningModulesService.createSystemDesign(studentId, req.body);
    res.status(201).json({ success: true, data: design });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 9. Personal Knowledge Base Routes
// ==========================================
learningModulesRouter.get('/knowledge/collections', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const collections = await LearningModulesService.getKnowledgeCollections(studentId);
    res.json({ success: true, data: collections });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/knowledge/items', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const search = req.query.search as string;
    const items = await LearningModulesService.getKnowledgeItems(studentId, search);
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/knowledge/items', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const item = await LearningModulesService.createKnowledgeItem(studentId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/knowledge/graph', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const graphData = await LearningModulesService.getKnowledgeGraphData(studentId);
    res.json({ success: true, data: graphData });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 10. Internship / Application Tracker Routes
// ==========================================
learningModulesRouter.get('/applications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const apps = await LearningModulesService.getApplications(studentId);
    res.json({ success: true, data: apps });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/applications/:appId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const app = await LearningModulesService.getApplicationById(studentId, req.params.appId);
    res.json({ success: true, data: app });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/applications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const app = await LearningModulesService.createApplication(studentId, req.body);
    res.status(201).json({ success: true, data: app });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.patch('/applications/:appId/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { status } = req.body;
    const updated = await LearningModulesService.updateApplicationStatus(studentId, req.params.appId, status);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
