// server/api/routes/gate.ts
// Express router for GATE Exam Preparation System

import { Router, Request, Response } from 'express';
import { GateService } from '../../services/gateService';
import { logger } from '../../core/logging';
import { requireAuth } from '../../middleware/auth';

export const gateRouter = Router();

// Every /gate endpoint reads or writes per-student data, so a signed-in student is required.
// (Previously unauthenticated requests fell back to the demo student and could change their data.)
gateRouter.use('/gate', requireAuth);

const resolveStudentId = (req: Request): string => {
  return req.user!.userId;
};

// Questions are delivered without the answer key; the answer and explanation are returned by the
// attempt endpoint after the student answers, and in the mock test review after submission.
const deliverQuestion = (q: any) => {
  if (!q) return q;
  const { correct_answer, explanation, tolerance_range, ...rest } = q;
  return rest;
};

// =========================================================================
// 1. Papers & Syllabus
// =========================================================================

gateRouter.get('/gate/papers', async (_req: Request, res: Response) => {
  try {
    const papers = await GateService.getPapers();
    res.json({ success: true, data: papers });
  } catch (err: any) {
    logger.error('Error fetching GATE papers', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/papers/:code', async (req: Request, res: Response) => {
  try {
    const paper = await GateService.getPaperByCode(req.params.code);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'GATE paper not found' });
    }
    res.json({ success: true, data: paper });
  } catch (err: any) {
    logger.error('Error fetching GATE paper', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/syllabus', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const paperCode = (req.query.paper_code as string) || 'CS';
    const sections = await GateService.getSyllabus(paperCode, studentId);
    res.json({ success: true, data: sections });
  } catch (err: any) {
    logger.error('Error fetching GATE syllabus', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/syllabus/topic-status', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { topic_id, status, confidence, revision_flag, student_notes } = req.body;
    if (!topic_id) {
      return res.status(400).json({ success: false, message: 'topic_id is required' });
    }
    const result = await GateService.updateTopicStatus(studentId, topic_id, {
      status,
      confidence,
      revision_flag,
      student_notes,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error updating GATE topic status', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 2. Student Profile & Preferences
// =========================================================================

gateRouter.get('/gate/profile', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const profile = await GateService.getProfile(studentId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    logger.error('Error fetching GATE student profile', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/profile', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const profile = await GateService.updateProfile(studentId, req.body);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    logger.error('Error saving GATE student profile', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 3. Question Bank & Interactive Practice
// =========================================================================

gateRouter.get('/gate/questions', async (req: Request, res: Response) => {
  try {
    const filters = {
      paper_code: req.query.paper_code as string,
      subject: req.query.subject as string,
      topic_id: req.query.topic_id as string,
      difficulty: req.query.difficulty as string,
      question_type: req.query.question_type as string,
      is_pyq: req.query.is_pyq ? req.query.is_pyq === 'true' : undefined,
      search: req.query.search as string,
    };
    const questions = await GateService.getQuestions(filters);
    res.json({ success: true, data: questions.map(deliverQuestion), count: questions.length });
  } catch (err: any) {
    logger.error('Error fetching GATE questions', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/questions/:id', async (req: Request, res: Response) => {
  try {
    const question = await GateService.getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: deliverQuestion(question) });
  } catch (err: any) {
    logger.error('Error fetching GATE question', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/questions/:id/attempt', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { selected_answer, time_spent_seconds } = req.body;
    const result = await GateService.attemptQuestion(
      studentId,
      req.params.id,
      selected_answer,
      time_spent_seconds
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error recording GATE question attempt', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/questions/:id/bookmark', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { notes } = req.body;
    const result = await GateService.toggleBookmark(studentId, req.params.id, notes);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error toggling GATE bookmark', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/bookmarks', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const bookmarks = await GateService.getBookmarks(studentId);
    // A bookmark can be made before answering, so the key is stripped here too.
    res.json({ success: true, data: bookmarks.map((b: any) => ({ ...b, question: deliverQuestion(b.question) })) });
  } catch (err: any) {
    logger.error('Error fetching GATE bookmarks', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 4. Mock Tests
// =========================================================================

gateRouter.get('/gate/tests', async (req: Request, res: Response) => {
  try {
    const paperCode = req.query.paper_code as string;
    const type = req.query.type as string;
    const tests = await GateService.getMockTests(paperCode, type);
    res.json({ success: true, data: tests });
  } catch (err: any) {
    logger.error('Error fetching GATE mock tests', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/tests/:id', async (req: Request, res: Response) => {
  try {
    const test = await GateService.getMockTestById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Mock test not found' });
    }
    res.json({ success: true, data: test });
  } catch (err: any) {
    logger.error('Error fetching GATE mock test', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/tests/:id/start', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const session = await GateService.startMockTest(studentId, req.params.id);
    res.json({ success: true, data: session });
  } catch (err: any) {
    logger.error('Error starting GATE mock test session', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.put('/gate/sessions/:sessionId/answers', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { answers, remaining_seconds } = req.body;
    const session = await GateService.saveMockTestAnswers(
      req.params.sessionId,
      studentId,
      answers,
      remaining_seconds
    );
    res.json({ success: true, data: session });
  } catch (err: any) {
    logger.error('Error updating GATE test session answers', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/sessions/:sessionId/submit', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const result = await GateService.submitMockTest(req.params.sessionId, studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error submitting GATE test session', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const session = await GateService.getMockTestSession(req.params.sessionId, studentId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (err: any) {
    logger.error('Error fetching GATE test session', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/results', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const results = await GateService.getTestResults(studentId);
    res.json({ success: true, data: results });
  } catch (err: any) {
    logger.error('Error fetching GATE test results', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 5. Study Planner & Dashboard
// =========================================================================

gateRouter.get('/gate/study-plan', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const paperCode = req.query.paper_code as string;
    const tasks = await GateService.getStudyPlan(studentId, paperCode);
    res.json({ success: true, data: tasks });
  } catch (err: any) {
    logger.error('Error fetching GATE study plan', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/study-plan/tasks', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const task = await GateService.addStudyTask(studentId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    logger.error('Error adding GATE study task', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.post('/gate/study-plan/tasks/:taskId/toggle', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const task = await GateService.toggleStudyTask(studentId, req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (err: any) {
    logger.error('Error toggling GATE study task', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

gateRouter.get('/gate/dashboard', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const dashboard = await GateService.getDashboard(studentId);
    res.json({ success: true, data: dashboard });
  } catch (err: any) {
    logger.error('Error fetching GATE dashboard data', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// =========================================================================
// 6. AI GATE Study Assistant
// =========================================================================

gateRouter.post('/gate/ai-tutor', async (req: Request, res: Response) => {
  try {
    const studentId = resolveStudentId(req);
    const { prompt, mode, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const response = await GateService.queryAiTutor(studentId, prompt, mode, context);
    res.json({ success: true, data: response });
  } catch (err: any) {
    logger.error('Error querying GATE AI tutor', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
