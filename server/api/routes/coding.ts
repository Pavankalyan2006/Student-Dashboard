import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { CodingService } from '../../services/coding';
import { CodeAIService } from '../../services/codeAi';
import { LanguageRegistry } from '../../execution/languages';
import { ValidationError } from '../../core/exceptions';

export const codingRouter = Router();

// ================= LANGUAGES =================
codingRouter.get('/coding/languages', (req, res) => {
  const configs = LanguageRegistry.getAll();
  res.json({
    success: true,
    data: configs,
  });
});

// ================= RUN CODE =================
codingRouter.post('/coding/run', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { language, source_code, stdin, problem_id, session_id } = req.body;

    if (!language) throw new ValidationError('Language is required.');
    if (!source_code) throw new ValidationError('Source code is required.');

    const result = await CodingService.runCode(studentId, {
      language,
      source_code,
      stdin: stdin || '',
      problem_id,
      session_id,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// ================= EXECUTIONS HISTORY =================
codingRouter.get('/coding/executions', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const executions = await CodingService.getStudentExecutions(studentId, limit);

    res.json({
      success: true,
      data: executions,
    });
  } catch (err) {
    next(err);
  }
});

// ================= CODING SESSIONS =================
codingRouter.get('/coding/sessions', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const sessions = await CodingService.getStudentSessions(studentId);

    res.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/sessions', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { language, source_code, stdin, problem_id } = req.body;

    const session = await CodingService.createSession(studentId, {
      language,
      source_code,
      stdin,
      problem_id,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.get('/coding/sessions/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const session = await CodingService.getSession(req.params.id, studentId);

    res.json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.patch('/coding/sessions/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const session = await CodingService.updateSession(req.params.id, studentId, req.body);

    res.json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.delete('/coding/sessions/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    await CodingService.deleteSession(req.params.id, studentId);

    res.json({
      success: true,
      message: 'Coding session deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// ================= SAVED CODE =================
codingRouter.get('/coding/saved', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const saved = await CodingService.getStudentSavedCode(studentId);

    res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/saved', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { title, language, source_code, description, tags } = req.body;

    const saved = await CodingService.saveCode(studentId, {
      title,
      language,
      source_code,
      description,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.get('/coding/saved/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const saved = await CodingService.getSavedCode(req.params.id, studentId);

    res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.patch('/coding/saved/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const saved = await CodingService.updateSavedCode(req.params.id, studentId, req.body);

    res.json({
      success: true,
      data: saved,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.delete('/coding/saved/:id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    await CodingService.deleteSavedCode(req.params.id, studentId);

    res.json({
      success: true,
      message: 'Saved code deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

// ================= PROBLEMS =================
codingRouter.get('/coding/problems', async (req, res, next) => {
  try {
    const { difficulty, topic, search } = req.query;
    const problems = await CodingService.getProblems({
      difficulty: difficulty as string,
      topic: topic as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: problems,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.get('/coding/problems/:id', async (req, res, next) => {
  try {
    const problem = await CodingService.getProblemById(req.params.id);
    const publicTestCases = await CodingService.getPublicTestCases(req.params.id);

    res.json({
      success: true,
      data: {
        ...problem,
        public_test_cases: publicTestCases,
      },
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/problems/:id/submit', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { language, source_code } = req.body;

    if (!language) throw new ValidationError('Language is required.');
    if (!source_code) throw new ValidationError('Source code is required.');

    const submission = await CodingService.submitSolution(studentId, req.params.id, {
      language,
      source_code,
    });

    res.json({
      success: true,
      data: submission,
    });
  } catch (err) {
    next(err);
  }
});

codingRouter.get('/coding/problems/:id/hints', async (req, res, next) => {
  try {
    const level = req.query.level ? Number(req.query.level) : 1;
    const hint = await CodingService.getProblemHints(req.params.id, level);

    res.json({
      success: true,
      data: hint,
    });
  } catch (err) {
    next(err);
  }
});

// ================= PROGRESS =================
codingRouter.get('/coding/progress', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const progress = await CodingService.getStudentProgress(studentId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    next(err);
  }
});

// ================= AI CODE INTELLIGENCE =================
codingRouter.post('/coding/ai/explain', requireAuth, async (req, res, next) => {
  try {
    const { language, source_code, level } = req.body;
    const explanation = await CodeAIService.explainCode({ language, source_code, level });
    res.json({ success: true, data: explanation });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/ai/debug', requireAuth, async (req, res, next) => {
  try {
    const { language, source_code, error, stdout, stdin, problem_statement } = req.body;
    const debug = await CodeAIService.debugCode({
      language,
      source_code,
      error,
      stdout,
      stdin,
      problem_statement,
    });
    res.json({ success: true, data: debug });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/ai/generate', requireAuth, async (req, res, next) => {
  try {
    const { prompt, language } = req.body;
    if (!prompt) throw new ValidationError('Prompt is required.');
    const generated = await CodeAIService.generateCode({ prompt, language: language || 'python' });
    res.json({ success: true, data: generated });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/ai/refactor', requireAuth, async (req, res, next) => {
  try {
    const { language, source_code, instruction } = req.body;
    const refactored = await CodeAIService.refactorCode({ language, source_code, instruction });
    res.json({ success: true, data: refactored });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/ai/test-cases', requireAuth, async (req, res, next) => {
  try {
    const { language, source_code, problem_statement } = req.body;
    const testCases = await CodeAIService.generateTestCases({ language, source_code, problem_statement });
    res.json({ success: true, data: testCases });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/ai/review', requireAuth, async (req, res, next) => {
  try {
    const { language, source_code } = req.body;
    const review = await CodeAIService.reviewCode({ language, source_code });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

codingRouter.post('/coding/ai/hints', requireAuth, async (req, res, next) => {
  try {
    const { problem_id, level, current_code } = req.body;
    const hint = await CodeAIService.generateHint({
      problem_id,
      level: level ? Number(level) : 1,
      current_code,
    });
    res.json({ success: true, data: hint });
  } catch (err) {
    next(err);
  }
});
