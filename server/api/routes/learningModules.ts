// server/api/routes/learningModules.ts
// Express routes for the 10 New AI-Powered Learning Modules

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ValidationError } from '../../core/exceptions';
import { LearningModulesService } from '../../services/learningModulesService';
import { SqlLabSandboxService } from '../../services/sqlLabSandboxService';
import { MlLabService } from '../../services/mlLabService';

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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/study-planner/plans/:planId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plan = await LearningModulesService.getStudyPlanById(studentId, req.params.planId);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/study-planner/plans', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const plan = await LearningModulesService.createStudyPlan(studentId, req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.patch('/study-planner/plans/:planId/tasks/:taskId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { status } = req.body;
    const updated = await LearningModulesService.updateTaskStatus(studentId, req.params.planId, req.params.taskId, status);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/study-planner/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const tasks = await LearningModulesService.getTodayTasks(studentId);
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/exams/:examId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exam = await LearningModulesService.getExamById(studentId, req.params.examId);
    res.json({ success: true, data: exam });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/exams', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exam = await LearningModulesService.createExam(studentId, req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/doubts/:doubtId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doubt = await LearningModulesService.getDoubtById(studentId, req.params.doubtId);
    res.json({ success: true, data: doubt });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/doubts', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doubt = await LearningModulesService.createDoubt(studentId, req.body);
    res.status(201).json({ success: true, data: doubt });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Flashcards + Spaced Revision Routes
// ==========================================
learningModulesRouter.get('/flashcards/decks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { search, subject, course_id, status, sortBy } = req.query;
    const decks = await LearningModulesService.getFlashcardDecks(studentId, {
      search: search as string,
      subject: subject as string,
      course_id: course_id as string,
      status: status as string,
      sortBy: sortBy as string,
    });
    res.json({ success: true, data: decks });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/flashcards/decks/:deckId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await LearningModulesService.getFlashcardDeckById(studentId, req.params.deckId);
    res.json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await LearningModulesService.createFlashcardDeck(studentId, req.body);
    res.status(201).json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.put('/flashcards/decks/:deckId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await LearningModulesService.updateFlashcardDeck(studentId, req.params.deckId, req.body);
    res.json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/duplicate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await LearningModulesService.duplicateFlashcardDeck(studentId, req.params.deckId);
    res.status(201).json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/archive', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const isArchived = req.body.is_archived !== undefined ? Boolean(req.body.is_archived) : true;
    const deck = await LearningModulesService.archiveFlashcardDeck(studentId, req.params.deckId, isArchived);
    res.json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/bookmark', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const isBookmarked = req.body.is_bookmarked !== undefined ? Boolean(req.body.is_bookmarked) : true;
    const deck = await LearningModulesService.bookmarkFlashcardDeck(studentId, req.params.deckId, isBookmarked);
    res.json({ success: true, data: deck });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/flashcards/decks/:deckId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await LearningModulesService.deleteFlashcardDeck(studentId, req.params.deckId);
    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/cards', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const card = await LearningModulesService.addCardToDeck(studentId, req.params.deckId, req.body);
    res.status(201).json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.put('/flashcards/decks/:deckId/cards/:cardId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const resetSchedule = Boolean(req.body.reset_schedule);
    const card = await LearningModulesService.updateCard(studentId, req.params.deckId, req.params.cardId, req.body, resetSchedule);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/flashcards/decks/:deckId/cards/:cardId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await LearningModulesService.deleteCard(studentId, req.params.deckId, req.params.cardId);
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/cards/:cardId/bookmark', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const isBookmarked = req.body.is_bookmarked !== undefined ? Boolean(req.body.is_bookmarked) : true;
    const card = await LearningModulesService.bookmarkCard(studentId, req.params.deckId, req.params.cardId, isBookmarked);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/cards/:cardId/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { confidence, rating } = req.body;
    // A review must say how it went; a missing rating is not silently recorded as GOOD.
    const ratingParam = rating ?? confidence;
    if (ratingParam === undefined || ratingParam === null || ratingParam === '') {
      return res.status(400).json({ success: false, message: 'Rating is required (AGAIN, HARD, GOOD or EASY)' });
    }
    const card = await LearningModulesService.reviewFlashcard(studentId, req.params.deckId, req.params.cardId, ratingParam);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/flashcards/due', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { deck_id, course_id, limit } = req.query;
    const cards = await LearningModulesService.getDueFlashcards(studentId, {
      deck_id: deck_id as string,
      course_id: course_id as string,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ success: true, data: cards });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/flashcards/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const stats = await LearningModulesService.getFlashcardStats(studentId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/generate/ai', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const generated = await LearningModulesService.generateAIFlashcards(studentId, req.body);
    res.json({ success: true, data: generated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/generate/from-note', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { note_id } = req.body;
    if (!note_id) throw new ValidationError('note_id is required');
    const result = await LearningModulesService.generateFromNote(studentId, note_id);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/generate/from-document', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { document_id, count } = req.body;
    if (!document_id) throw new ValidationError('document_id is required');
    const result = await LearningModulesService.generateFromDocument(studentId, document_id, count ? Number(count) : 8);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/generate/from-course', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { course_id, chapter_id, count } = req.body;
    if (!course_id) throw new ValidationError('course_id is required');
    const result = await LearningModulesService.generateFromCourse(studentId, course_id, chapter_id, count ? Number(count) : 8);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/flashcards/decks/:deckId/schedule-task', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const task = await LearningModulesService.scheduleReviewTask(studentId, req.params.deckId);
    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/labs/:labId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const lab = await LearningModulesService.getLabById(studentId, req.params.labId);
    res.json({ success: true, data: lab });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/labs/:labId/experiments/:expId/viva/:qId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { student_answer } = req.body;
    const evaluated = await LearningModulesService.evaluateVivaAnswer(studentId, req.params.labId, req.params.expId, req.params.qId, student_answer || '');
    res.json({ success: true, data: evaluated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. SQL / Database Lab Routes
// ==========================================
learningModulesRouter.get('/sql-lab/workspaces', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const workspaces = SqlLabSandboxService.getWorkspaces(studentId);
    res.json({ success: true, data: workspaces });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/workspaces', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { name } = req.body;
    const result = SqlLabSandboxService.createSchema(studentId, name || '');
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/sql-lab/schemas', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const schemas = SqlLabSandboxService.getSchemas(studentId);
    res.json({ success: true, data: schemas });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/sql-lab/schemas/:dbName/tables', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const tables = SqlLabSandboxService.getSchemaTables(studentId, req.params.dbName);
    res.json({ success: true, data: tables });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/schemas/:dbName/tables', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = SqlLabSandboxService.createTable(studentId, req.params.dbName, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/sql-lab/schemas/:dbName/tables/:tableName', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = SqlLabSandboxService.dropTable(studentId, req.params.dbName, req.params.tableName);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/sql-lab/schemas/:dbName/tables/:tableName/data', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { page, limit, sort_by, sort_dir, search } = req.query;
    const result = SqlLabSandboxService.getTableData(studentId, req.params.dbName, req.params.tableName, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sort_by: sort_by as string,
      sort_dir: (sort_dir as any) || 'ASC',
      search: search as string,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/schemas/:dbName/tables/:tableName/rows', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = SqlLabSandboxService.insertRow(studentId, req.params.dbName, req.params.tableName, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.put('/sql-lab/schemas/:dbName/tables/:tableName/rows/:pkValue', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = SqlLabSandboxService.updateRow(studentId, req.params.dbName, req.params.tableName, req.params.pkValue, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/sql-lab/schemas/:dbName/tables/:tableName/rows/:pkValue', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = SqlLabSandboxService.deleteRow(studentId, req.params.dbName, req.params.tableName, req.params.pkValue);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/schemas/:dbName/tables/:tableName/sample-data', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const count = Number(req.body.count) || 3;
    const result = SqlLabSandboxService.generateSampleRows(studentId, req.params.dbName, req.params.tableName, count);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/preview-sql', (_req: Request, res: Response) => {
  try {
    const sql = SqlLabSandboxService.generateCreateTableSql(_req.body);
    res.json({ success: true, data: { sql } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/sql-lab/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const history = SqlLabSandboxService.getQueryHistory(studentId, req.query.schema_name as string);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/sql-lab/challenges', async (_req: Request, res: Response) => {
  try {
    const challenges = await LearningModulesService.getSqlChallenges();
    res.json({ success: true, data: challenges });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/sql-lab/execute', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { query, db_name } = req.body;
    const result = await SqlLabSandboxService.executeSandboxedSql(studentId, db_name || 'university_db', query || '');
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. AI/ML Experiment Lab Routes
// ==========================================
learningModulesRouter.get('/ml-lab/workspaces', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const workspaces = MlLabService.getWorkspaces(studentId);
    res.json({ success: true, data: workspaces });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/ml-lab/workspaces', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const ws = MlLabService.createWorkspace(studentId, req.body);
    res.status(201).json({ success: true, data: ws });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/ml-lab/workspaces/:workspaceId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const ws = MlLabService.getWorkspace(studentId, req.params.workspaceId);
    res.json({ success: true, data: ws });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/ml-lab/workspaces/:workspaceId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = MlLabService.deleteWorkspace(studentId, req.params.workspaceId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/ml-lab/workspaces/:workspaceId/files', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const file = MlLabService.addFile(studentId, req.params.workspaceId, req.body);
    res.status(201).json({ success: true, data: file });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.put('/ml-lab/workspaces/:workspaceId/files/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const file = MlLabService.updateFile(studentId, req.params.workspaceId, req.params.fileId, req.body.content || '');
    res.json({ success: true, data: file });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/ml-lab/workspaces/:workspaceId/files/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = MlLabService.deleteFile(studentId, req.params.workspaceId, req.params.fileId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/ml-lab/datasets', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const datasets = MlLabService.getDatasets(studentId);
    res.json({ success: true, data: datasets });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/ml-lab/datasets/:datasetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const dataset = MlLabService.getDatasetById(studentId, req.params.datasetId);
    res.json({ success: true, data: dataset });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/ml-lab/datasets/upload', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const dataset = MlLabService.uploadCustomDataset(studentId, req.body);
    res.status(201).json({ success: true, data: dataset });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/ml-lab/experiments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const experiments = MlLabService.getExperiments(studentId, req.query.workspace_id as string);
    res.json({ success: true, data: experiments });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/ml-lab/experiments/:experimentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const experiment = MlLabService.getExperimentById(studentId, req.params.experimentId);
    res.json({ success: true, data: experiment });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/ml-lab/experiments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const experiment = await MlLabService.runExperiment(studentId, req.body);
    res.status(201).json({ success: true, data: experiment });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/ml-lab/experiments/:experimentId/predict', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = MlLabService.predict(studentId, req.params.experimentId, req.body.inputs || {});
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/system-design/designs', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const designs = await LearningModulesService.getSystemDesigns(studentId);
    res.json({ success: true, data: designs });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/system-design/designs', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const design = await LearningModulesService.createSystemDesign(studentId, req.body);
    res.status(201).json({ success: true, data: design });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/knowledge/items', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const search = req.query.search as string;
    const items = await LearningModulesService.getKnowledgeItems(studentId, search);
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/knowledge/items', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const item = await LearningModulesService.createKnowledgeItem(studentId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/knowledge/graph', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const graphData = await LearningModulesService.getKnowledgeGraphData(studentId);
    res.json({ success: true, data: graphData });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
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
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.get('/applications/:appId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const app = await LearningModulesService.getApplicationById(studentId, req.params.appId);
    res.json({ success: true, data: app });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/applications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const app = await LearningModulesService.createApplication(studentId, req.body);
    res.status(201).json({ success: true, data: app });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.patch('/applications/:appId/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { status, note } = req.body;
    const updated = await LearningModulesService.updateApplicationStatus(studentId, req.params.appId, status, note);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.patch('/applications/:appId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await LearningModulesService.updateApplication(studentId, req.params.appId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.delete('/applications/:appId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await LearningModulesService.deleteApplication(studentId, req.params.appId);
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/applications/:appId/timeline', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await LearningModulesService.addTimelineEvent(studentId, req.params.appId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Alias routes for /internships
learningModulesRouter.get('/internships', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const apps = await LearningModulesService.getApplications(studentId);
    res.json({ success: true, data: apps });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

learningModulesRouter.post('/internships', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const app = await LearningModulesService.createApplication(studentId, req.body);
    res.status(201).json({ success: true, data: app });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

