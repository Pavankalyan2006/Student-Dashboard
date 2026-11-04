// server/api/routes/mockInterviews.ts
// Express REST Router for AI Mock Interviews Module

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { MockInterviewEngineService } from '../../services/mockInterviewEngineService';
import { logger } from '../../core/logging';

export const mockInterviewsRouter = Router();

// ==========================================
// 1. Metadata & Question Catalog
// ==========================================
mockInterviewsRouter.get('/types', (req: Request, res: Response) => {
  try {
    const types = MockInterviewEngineService.getCategories();
    res.json({ success: true, data: types });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/roles', (req: Request, res: Response) => {
  try {
    const roles = MockInterviewEngineService.getTargetRoles();
    res.json({ success: true, data: roles });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/questions', (req: Request, res: Response) => {
  try {
    const questions = MockInterviewEngineService.getQuestions({
      category: req.query.category as any,
      difficulty: req.query.difficulty as any,
      targetRole: req.query.role as any,
      search: req.query.search as string,
    });
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/questions/:id', (req: Request, res: Response) => {
  try {
    const question = MockInterviewEngineService.getQuestionById(req.params.id);
    res.json({ success: true, data: question });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Session Lifecycle
// ==========================================
mockInterviewsRouter.post('/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.createSession(studentId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analytics = await MockInterviewEngineService.getAnalytics(studentId);
    res.json({ success: true, data: analytics.recent_sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/sessions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.getSession(req.params.id, studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await MockInterviewEngineService.startSession(req.params.id, studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/pause', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await MockInterviewEngineService.pauseSession(req.params.id, studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/resume', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await MockInterviewEngineService.resumeSession(req.params.id, studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/skip', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.skipQuestion(
      req.params.id,
      studentId,
      req.body.question_id
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/hint', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.requestHint(
      req.params.id,
      studentId,
      req.body.question_id
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/code/run', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.runCodeInSandbox(req.params.id, studentId, {
      question_id: req.body.question_id,
      language: req.body.language,
      source_code: req.body.source_code,
      stdin: req.body.stdin,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/sql/run', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.runSqlInSandbox(req.params.id, studentId, {
      question_id: req.body.question_id,
      query: req.body.query,
      db_name: req.body.db_name,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/artifacts', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.saveSystemDesignArtifact(req.params.id, studentId, {
      question_id: req.body.question_id,
      topology: req.body.topology,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/scratchpad', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.updateScratchpadNotes(
      req.params.id,
      studentId,
      req.body.notes
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/answers', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.submitAnswer(
      req.params.id,
      studentId,
      req.body.question_id,
      {
        answer_text: req.body.answer_text,
        duration_seconds: req.body.duration_seconds,
        input_mode: req.body.input_mode,
        code_used: req.body.code_used,
        sql_query_used: req.body.sql_query_used,
        architecture_used: req.body.architecture_used,
      }
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/finish', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await MockInterviewEngineService.completeSession(req.params.id, studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/sessions/:id/abandon', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const session = await MockInterviewEngineService.abandonSession(req.params.id, studentId);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/sessions/:id/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const report = await MockInterviewEngineService.getReport(req.params.id, studentId);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. Saved Questions
// ==========================================
mockInterviewsRouter.get('/saved-questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const saved = await MockInterviewEngineService.getSavedQuestions(studentId);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/saved-questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const item = await MockInterviewEngineService.saveQuestion(studentId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.delete('/saved-questions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await MockInterviewEngineService.deleteSavedQuestion(studentId, req.params.id);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Scheduling & Analytics
// ==========================================
mockInterviewsRouter.get('/scheduled', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const list = await MockInterviewEngineService.getScheduled(studentId);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.post('/schedule', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const item = await MockInterviewEngineService.scheduleInterview(studentId, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.delete('/scheduled/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await MockInterviewEngineService.deleteScheduled(studentId, req.params.id);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

mockInterviewsRouter.get('/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analytics = await MockInterviewEngineService.getAnalytics(studentId);
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
