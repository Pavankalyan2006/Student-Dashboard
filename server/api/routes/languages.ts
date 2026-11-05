// server/api/routes/languages.ts
// Express REST Router for the Language Learning Platform (Up to 150 Languages)

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { LanguageLearningService } from '../../services/languageLearningService';
import { logger } from '../../core/logging';

export const languageLearningRouter = Router();

// ==========================================
// 1. Language Catalog & Capabilities (Public/Auth)
// ==========================================

languageLearningRouter.get('/', async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.userId;
    const { query, region, script, capability } = req.query;

    const result = await LanguageLearningService.getCatalog({
      query: query ? String(query) : undefined,
      region: region ? String(region) : undefined,
      script: script ? String(script) : undefined,
      capability: capability ? String(capability) : undefined,
      studentId,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error in GET /languages', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Student Overall Analytics
languageLearningRouter.get('/analytics/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analytics = await LanguageLearningService.getStudentAnalytics(studentId);
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    logger.error('Error in GET /languages/analytics/my', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Student All Enrolled Languages
languageLearningRouter.get('/enrollments/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const enrollments = await LanguageLearningService.getStudentEnrollments(studentId);
    res.json({ success: true, data: enrollments });
  } catch (err: any) {
    logger.error('Error in GET /languages/enrollments/my', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Contextual Translation Helper
languageLearningRouter.post('/translate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { source_lang, target_lang, text } = req.body;
    if (!source_lang || !target_lang || !text) {
      return res.status(400).json({ success: false, message: 'source_lang, target_lang, and text are required.' });
    }

    const result = await LanguageLearningService.contextualTranslate(source_lang, target_lang, text);
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error in POST /languages/translate', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Language Details
languageLearningRouter.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const lang = await LanguageLearningService.getLanguageByCode(code);
    res.json({ success: true, data: lang });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 404).json({ success: false, message: err.message });
  }
});

// Language Capabilities
languageLearningRouter.get('/:code/capabilities', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const lang = await LanguageLearningService.getLanguageByCode(code);
    res.json({ success: true, data: lang.capabilities });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 404).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Student Enrollment & Goals
// ==========================================

languageLearningRouter.post('/:code/enroll', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const enrollment = await LanguageLearningService.enrollStudent(studentId, {
      ...req.body,
      language_code: code,
    });
    res.status(201).json({ success: true, data: enrollment });
  } catch (err: any) {
    logger.error('Error in POST /languages/:code/enroll', err);
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.delete('/:code/enroll', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    await LanguageLearningService.deleteStudentLanguageData(studentId, code);
    res.json({ success: true, message: `Unenrolled from language '${code}'.` });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. Personalized Dashboard & Curricula
// ==========================================

languageLearningRouter.get('/:code/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const dashboard = await LanguageLearningService.getStudentDashboard(studentId, code);
    res.json({ success: true, data: dashboard });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.get('/:code/paths', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const paths = await LanguageLearningService.getLearningPaths(code);
    res.json({ success: true, data: paths });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 404).json({ success: false, message: err.message });
  }
});

// Lesson Detail
languageLearningRouter.get('/:code/lessons/:lessonId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, lessonId } = req.params;
    const lesson = await LanguageLearningService.getLesson(studentId, code, lessonId);
    res.json({ success: true, data: lesson });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 404).json({ success: false, message: err.message });
  }
});

// Complete Lesson Progress
languageLearningRouter.post('/:code/lessons/:lessonId/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, lessonId } = req.params;
    const { notes } = req.body;
    const result = await LanguageLearningService.saveLessonProgress(studentId, code, lessonId, true, notes);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Vocabulary & Spaced Repetition
// ==========================================

languageLearningRouter.get('/:code/vocabulary', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const { topic } = req.query;
    const cards = await LanguageLearningService.getVocabularyCards(studentId, code, topic ? String(topic) : undefined);
    res.json({ success: true, data: cards });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.post('/:code/vocabulary/:cardId/bookmark', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, cardId } = req.params;
    const { bookmarked } = req.body;
    const card = await LanguageLearningService.bookmarkVocab(studentId, code, cardId, !!bookmarked);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.post('/:code/vocabulary/:cardId/review', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, cardId } = req.params;
    const { rating } = req.body; // AGAIN, HARD, GOOD, EASY
    if (!rating) {
      return res.status(400).json({ success: false, message: 'Review rating is required.' });
    }
    const card = await LanguageLearningService.reviewSpacedVocab(studentId, code, cardId, rating);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.get('/:code/revisions/due', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const due = await LanguageLearningService.getDueRevisions(studentId, code);
    res.json({ success: true, data: due });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. Writing Practice & AI Feedback
// ==========================================

languageLearningRouter.get('/:code/writing', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const submissions = await LanguageLearningService.getWritingSubmissions(studentId, code);
    res.json({ success: true, data: submissions });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.post('/:code/writing', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const { prompt_type, prompt_text, student_text } = req.body;
    const submission = await LanguageLearningService.submitWritingPractice(studentId, code, {
      prompt_type: prompt_type || 'FREE_WRITING',
      prompt_text: prompt_text || 'Introduce yourself and your goals',
      student_text,
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. AI Conversation Partner
// ==========================================

languageLearningRouter.get('/:code/conversations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const sessions = await LanguageLearningService.getConversationSessions(studentId, code);
    res.json({ success: true, data: sessions });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.post('/:code/conversations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code } = req.params;
    const { scenario, mode } = req.body;
    const session = await LanguageLearningService.startConversation(studentId, code, scenario, mode);
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

languageLearningRouter.post('/:code/conversations/:sessionId/message', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { sessionId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }
    const session = await LanguageLearningService.sendConversationMessage(studentId, sessionId, text);
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. Quizzes & Assessments
// ==========================================

languageLearningRouter.post('/:code/quizzes/:quizId/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, quizId } = req.params;
    const { answers } = req.body;
    const result = await LanguageLearningService.submitQuiz(studentId, code, quizId, answers || []);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 400).json({ success: false, message: err.message });
  }
});
