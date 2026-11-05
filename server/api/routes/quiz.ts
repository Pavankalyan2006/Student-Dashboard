import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { db } from '../../db/database';
import { QuizGenerationService } from '../../services/quizGeneration';
import { QuizAttemptService } from '../../services/quizAttempt';
import { QuizProgressService } from '../../services/quizProgress';
import { toDeliveryQuestion, GenerateQuizRequest } from '../../models/quizTypes';
import { ValidationError, NotFoundError, AuthorizationError } from '../../core/exceptions';
import { eventBus } from '../../events/eventBus';

export const quizRouter = Router();

// ================= QUIZ DISCOVERY & MANAGEMENT =================

/**
 * GET /quiz
 * List quizzes available to student (their own, plus system / public courses / topics)
 */
quizRouter.get('/quiz', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { topic, course_id, difficulty, source_type, status } = req.query;

    let quizzes = await db.getQuizzes(studentId);

    if (topic) {
      quizzes = quizzes.filter((q) =>
        q.title.toLowerCase().includes((topic as string).toLowerCase()) ||
        q.description?.toLowerCase().includes((topic as string).toLowerCase())
      );
    }
    if (course_id) {
      quizzes = quizzes.filter((q) => q.source_id === course_id);
    }
    if (difficulty) {
      quizzes = quizzes.filter((q) => q.difficulty === difficulty);
    }
    if (source_type) {
      quizzes = quizzes.filter((q) => q.source_type === source_type);
    }
    if (status) {
      quizzes = quizzes.filter((q) => q.status === status);
    }

    res.json({
      success: true,
      data: quizzes,
    });
  } catch (err) {
    next(err);
  }
});

// Alias for /quizzes
quizRouter.get('/quizzes', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const quizzes = await db.getQuizzes(studentId);
    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz
 * Manually create a quiz
 */
quizRouter.post('/quiz', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const {
      title,
      description,
      source_type,
      source_id,
      difficulty,
      question_count,
      time_limit_seconds,
      adaptive_mode,
      questions,
    } = req.body;

    if (!title || !source_type) {
      throw new ValidationError('Title and source_type are required');
    }

    const quiz = await db.createQuiz({
      student_id: studentId,
      title,
      description: description || '',
      source_type: source_type || 'TOPIC',
      source_id,
      difficulty: difficulty || 'MEDIUM',
      question_count: (questions && questions.length) || question_count || 5,
      time_limit_seconds: time_limit_seconds || undefined,
      adaptive_mode: Boolean(adaptive_mode),
      status: 'READY',
    });

    if (questions && Array.isArray(questions) && questions.length > 0) {
      const formattedQuestions = questions.map((q: any, idx: number) => ({
        quiz_id: quiz.id,
        question_number: idx + 1,
        question_type: q.question_type || 'MCQ',
        question_text: q.question_text || q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || 'No explanation provided.',
        difficulty: q.difficulty || quiz.difficulty,
        topic_id: q.topic_id || 'General',
        source_type: quiz.source_type,
        source_id: quiz.source_id,
      }));
      await db.createQuizQuestions(formattedQuestions);
    }

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/generate
 * AI-powered multi-source quiz generation
 */
quizRouter.post('/quiz/generate', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const request: GenerateQuizRequest = {
      topic: req.body.topic,
      course_id: req.body.course_id,
      lesson_id: req.body.lesson_id,
      note_id: req.body.note_id,
      document_id: req.body.document_id,
      dsa_topic: req.body.dsa_topic,
      source_type: req.body.source_type || 'TOPIC',
      difficulty: req.body.difficulty || 'MEDIUM',
      question_type: req.body.question_type || 'MIXED',
      question_count: req.body.question_count ? Number(req.body.question_count) : 5,
      time_limit_seconds: req.body.time_limit_seconds ? Number(req.body.time_limit_seconds) : undefined,
      adaptive_mode: Boolean(req.body.adaptive_mode),
      title: req.body.title,
    };

    const result = await QuizGenerationService.generateQuiz(studentId, request);

    res.status(201).json({
      success: true,
      data: {
        quiz: result.quiz,
        // Delivered without correct answers or explanations; they are revealed after submission.
        questions: result.questions.map(toDeliveryQuestion),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/progress
 * Get student's overall quiz analytics, weak areas, and revision recommendations
 */
quizRouter.get('/quiz/progress', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const progress = await QuizProgressService.getStudentProgress(studentId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/topics/:topic_id/performance
 * Topic-specific performance analytics
 */
quizRouter.get('/quiz/topics/:topic_id/performance', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const topicPerformance = await QuizProgressService.getTopicPerformance(studentId, req.params.topic_id);
    if (!topicPerformance) {
      return res.json({
        success: true,
        data: {
          topic_id: req.params.topic_id,
          topic_name: req.params.topic_id,
          accuracy: 0,
          total_questions: 0,
          correct_answers: 0,
          status: 'NEEDS_PRACTICE',
          last_practiced_at: new Date().toISOString(),
        },
      });
    }
    res.json({
      success: true,
      data: topicPerformance,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/attempts
 * List attempts for student
 */
quizRouter.get('/quiz/attempts', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const quizId = req.query.quiz_id as string | undefined;
    const attempts = await db.getQuizAttempts(studentId, quizId);

    // Enrich with quiz title
    const enriched = await Promise.all(
      attempts.map(async (att) => {
        const q = await db.getQuizById(att.quiz_id);
        return {
          ...att,
          quiz_title: q?.title || 'Academic Quiz',
          quiz_difficulty: q?.difficulty || 'MEDIUM',
          source_type: q?.source_type || 'TOPIC',
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/attempts
 * Start a new attempt via body { quiz_id }
 */
quizRouter.post('/quiz/attempts', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { quiz_id } = req.body;
    if (!quiz_id) {
      throw new ValidationError('quiz_id is required');
    }
    const result = await QuizAttemptService.startAttempt(studentId, quiz_id);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/:quiz_id
 * Get single quiz metadata
 */
// A quiz belongs to the student who created it; quizzes without an owner are shared practice sets.
// Another student's quiz answers 404, the same as a quiz that does not exist.
async function getVisibleQuiz(quizId: string, studentId: string) {
  const quiz = await db.getQuizById(quizId);
  if (!quiz || (quiz.student_id && quiz.student_id !== studentId)) {
    throw new NotFoundError(`Quiz ${quizId} not found`);
  }
  return quiz;
}

quizRouter.get('/quiz/:quiz_id', requireAuth, async (req, res, next) => {
  try {
    const quiz = await getVisibleQuiz(req.params.quiz_id, req.user!.userId);
    res.json({
      success: true,
      data: quiz,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /quiz/:quiz_id
 * Delete a custom quiz
 */
quizRouter.delete('/quiz/:quiz_id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await db.deleteQuiz(req.params.quiz_id, studentId);
    if (!deleted) {
      throw new NotFoundError(`Quiz ${req.params.quiz_id} not found`);
    }
    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/:quiz_id/start
 * Start or resume a quiz attempt
 */
quizRouter.post('/quiz/:quiz_id/start', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const result = await QuizAttemptService.startAttempt(studentId, req.params.quiz_id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/:quiz_id/questions
 * Get quiz delivery questions (NO correct answers or explanations)
 */
quizRouter.get('/quiz/:quiz_id/questions', requireAuth, async (req, res, next) => {
  try {
    await getVisibleQuiz(req.params.quiz_id, req.user!.userId);
    const questions = await db.getQuizQuestions(req.params.quiz_id);
    const delivery = questions.map(toDeliveryQuestion);
    res.json({
      success: true,
      data: delivery,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/attempts/:attempt_id
 * Get attempt details
 */
quizRouter.get('/quiz/attempts/:attempt_id', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const attempt = await db.getQuizAttemptById(req.params.attempt_id);
    if (!attempt) {
      throw new NotFoundError(`Attempt ${req.params.attempt_id} not found`);
    }
    if (attempt.student_id !== studentId) {
      throw new AuthorizationError('You do not have access to this attempt');
    }
    const quiz = await db.getQuizById(attempt.quiz_id);
    res.json({
      success: true,
      data: {
        ...attempt,
        quiz,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /quiz/attempts/:attempt_id/answers
 * Auto-save answers debounced
 */
quizRouter.patch('/quiz/attempts/:attempt_id/answers', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { answers, flagged_questions, current_index } = req.body;
    if (!answers || typeof answers !== 'object') {
      throw new ValidationError('answers dictionary is required');
    }
    const result = await QuizAttemptService.saveAnswers(
      studentId,
      req.params.attempt_id,
      answers,
      flagged_questions,
      current_index
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/attempts/:attempt_id/submit
 * Authoritative submission and evaluation
 */
quizRouter.post('/quiz/attempts/:attempt_id/submit', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { answers } = req.body;
    const result = await QuizAttemptService.submitAttempt(studentId, req.params.attempt_id, answers);

    await eventBus.publish(
      'QUIZ_RESULT_UPDATED',
      {
        attempt_id: req.params.attempt_id,
        quiz_id: result.quiz_id,
        quiz_title: result.quiz_title,
        score: result.score,
        total_questions: result.correct_count + result.incorrect_count + result.unanswered_count,
        percentage: result.percentage,
      },
      {
        student_id: studentId,
        resource_type: 'QuizAttempt',
        resource_id: req.params.attempt_id,
        source: 'QuizRouter',
      }
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/attempts/:attempt_id/abandon
 * Abandon in-progress attempt
 */
quizRouter.post('/quiz/attempts/:attempt_id/abandon', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const attempt = await QuizAttemptService.abandonAttempt(studentId, req.params.attempt_id);
    res.json({
      success: true,
      data: attempt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /quiz/attempts/:attempt_id/review
 * Detailed question review with explanations and citations
 */
quizRouter.get('/quiz/attempts/:attempt_id/review', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const review = await QuizAttemptService.getAttemptReview(studentId, req.params.attempt_id);
    res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/:quiz_id/retry
 * Create revision quiz targeting missed questions
 */
quizRouter.post('/quiz/:quiz_id/retry', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { attempt_id } = req.body;
    if (!attempt_id) {
      throw new ValidationError('attempt_id is required for retry');
    }
    const result = await QuizAttemptService.retryIncorrect(studentId, req.params.quiz_id, attempt_id);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /quiz/explain-answer
 * AI / Educational tutor explanation for a specific question answer
 */
quizRouter.post('/quiz/explain-answer', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { question_id, student_answer, user_query } = req.body;
    if (!question_id) {
      throw new ValidationError('question_id is required');
    }
    const explanation = await QuizAttemptService.explainAnswer(
      studentId,
      question_id,
      student_answer,
      user_query
    );
    res.json({
      success: true,
      data: explanation,
    });
  } catch (err) {
    next(err);
  }
});
