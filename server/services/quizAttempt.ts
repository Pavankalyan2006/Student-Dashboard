import { db } from '../db/database';
import {
  Quiz,
  QuizQuestion,
  QuizDeliveryQuestion,
  QuizAttempt,
  QuestionAttempt,
  QuizResult,
  QuizReviewResult,
  ReviewQuestionItem,
  toDeliveryQuestion,
} from '../models/quizTypes';
import { QuestionEvaluationService } from './questionEvaluation';
import { QuizProgressService } from './quizProgress';
import { AdaptiveQuizService } from './adaptiveQuiz';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class QuizAttemptService {
  /**
   * Start a new quiz attempt or resume an existing active attempt
   */
  public static async startAttempt(
    studentId: string,
    quizId: string
  ): Promise<{
    attempt: QuizAttempt;
    quiz: Quiz;
    questions: QuizDeliveryQuestion[];
    resumed: boolean;
  }> {
    const quiz = await db.getQuizById(quizId);
    if (!quiz) {
      throw new NotFoundError(`Quiz with id ${quizId} not found`);
    }

    if (quiz.student_id && quiz.student_id !== studentId) {
      throw new AuthorizationError('You are not authorized to attempt this quiz');
    }

    // Check if there is already an in-progress attempt for this quiz by this student
    const existingAttempts = await db.getQuizAttempts(studentId, quizId);
    const activeAttempt = existingAttempts.find((a) => a.status === 'IN_PROGRESS');

    const allQuestions = await db.getQuizQuestions(quizId);
    const deliveryQuestions = allQuestions.map(toDeliveryQuestion);

    if (activeAttempt) {
      // Check if timed out
      if (quiz.time_limit_seconds) {
        const elapsed = Math.floor((Date.now() - new Date(activeAttempt.started_at).getTime()) / 1000);
        if (elapsed > quiz.time_limit_seconds + 30) {
          // Expired, mark expired and create new
          activeAttempt.status = 'EXPIRED';
          activeAttempt.completed_at = new Date().toISOString();
          await db.updateQuizAttempt(activeAttempt.id, activeAttempt);
        } else {
          // Resume active attempt
          return {
            attempt: activeAttempt,
            quiz,
            questions: deliveryQuestions,
            resumed: true,
          };
        }
      } else {
        // Resume active untimed attempt
        return {
          attempt: activeAttempt,
          quiz,
          questions: deliveryQuestions,
          resumed: true,
        };
      }
    }

    // Update quiz status if draft or ready
    if (quiz.status === 'DRAFT' || quiz.status === 'READY') {
      await db.updateQuiz(quiz.id, {
        status: 'IN_PROGRESS',
        started_at: quiz.started_at || new Date().toISOString(),
      });
    }

    // Create new attempt
    const newAttempt = await db.createQuizAttempt({
      quiz_id: quizId,
      student_id: studentId,
      score: 0,
      correct_count: 0,
      incorrect_count: 0,
      unanswered_count: quiz.question_count || allQuestions.length,
      time_taken_seconds: 0,
      status: 'IN_PROGRESS',
      metadata: {
        current_answers: {},
        flagged_questions: [],
        current_index: 0,
        adaptive_state: quiz.adaptive_mode
          ? AdaptiveQuizService.initializeAdaptiveState(quiz.difficulty)
          : undefined,
      },
    });

    return {
      attempt: newAttempt,
      quiz,
      questions: deliveryQuestions,
      resumed: false,
    };
  }

  /**
   * Debounced answer persistence for autosave
   */
  public static async saveAnswers(
    studentId: string,
    attemptId: string,
    answers: Record<string, string | string[]>,
    flaggedQuestions?: string[],
    currentIndex?: number
  ): Promise<{ success: boolean; saved_at: string; time_remaining_seconds?: number }> {
    const attempt = await db.getQuizAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError(`Quiz attempt ${attemptId} not found`);
    }

    if (attempt.student_id !== studentId) {
      throw new AuthorizationError('You are not authorized to update this attempt');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Cannot save answers for an attempt with status ${attempt.status}`);
    }

    const quiz = await db.getQuizById(attempt.quiz_id);
    let timeRemaining: number | undefined;

    if (quiz?.time_limit_seconds) {
      const elapsed = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
      timeRemaining = Math.max(0, quiz.time_limit_seconds - elapsed);

      // If time has genuinely expired with grace period
      if (elapsed > quiz.time_limit_seconds + 10) {
        attempt.status = 'EXPIRED';
        attempt.completed_at = new Date().toISOString();
        await db.updateQuizAttempt(attempt.id, attempt);
        throw new ValidationError('Assessment time limit has expired');
      }
    }

    // Merge answers into attempt metadata
    const existingAnswers = attempt.metadata?.current_answers || {};
    const updatedAnswers = { ...existingAnswers, ...answers };

    attempt.metadata = {
      ...attempt.metadata,
      current_answers: updatedAnswers,
      flagged_questions: flaggedQuestions !== undefined ? flaggedQuestions : attempt.metadata?.flagged_questions || [],
      current_index: currentIndex !== undefined ? currentIndex : attempt.metadata?.current_index || 0,
    };

    attempt.time_taken_seconds = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
    await db.updateQuizAttempt(attempt.id, attempt);

    return {
      success: true,
      saved_at: new Date().toISOString(),
      time_remaining_seconds: timeRemaining,
    };
  }

  /**
   * Submit a quiz attempt with authoritative server-side grading and scoring
   */
  public static async submitAttempt(
    studentId: string,
    attemptId: string,
    finalAnswers?: Record<string, string | string[]>
  ): Promise<QuizResult> {
    const attempt = await db.getQuizAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError(`Quiz attempt ${attemptId} not found`);
    }

    if (attempt.student_id !== studentId) {
      throw new AuthorizationError('You are not authorized to submit this attempt');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      throw new ValidationError(`Cannot submit an attempt that is already ${attempt.status}`);
    }

    const quiz = await db.getQuizById(attempt.quiz_id);
    if (!quiz) {
      throw new NotFoundError(`Associated quiz ${attempt.quiz_id} not found`);
    }

    // Merge final answers if provided
    const answers = {
      ...(attempt.metadata?.current_answers || {}),
      ...(finalAnswers || {}),
    };

    // Calculate time taken safely
    const startedAtMs = new Date(attempt.started_at).getTime();
    const nowMs = Date.now();
    const elapsedSeconds = Math.max(1, Math.floor((nowMs - startedAtMs) / 1000));
    const effectiveTimeTaken = quiz.time_limit_seconds
      ? Math.min(quiz.time_limit_seconds, elapsedSeconds)
      : elapsedSeconds;

    // Load answer keys
    const questions = await db.getQuizQuestions(quiz.id);

    const questionAttempts: QuestionAttempt[] = [];
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const topicStats: Record<string, { total: number; correct: number }> = {};

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const studentAns = answers[q.id];
      const hasAnswer = studentAns !== undefined && studentAns !== null && studentAns !== '' && (Array.isArray(studentAns) ? studentAns.length > 0 : true);

      const topicKey = q.topic_id || 'General';
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = { total: 0, correct: 0 };
      }
      topicStats[topicKey].total += 1;

      let isCorrect = false;
      let evalDetails = 'No answer submitted';

      if (!hasAnswer) {
        unansweredCount++;
      } else {
        const evaluation = QuestionEvaluationService.evaluateAnswer(q, studentAns);
        isCorrect = evaluation.is_correct;
        evalDetails = evaluation.feedback || 'Evaluated';

        if (isCorrect) {
          correctCount++;
          topicStats[topicKey].correct += 1;
        } else {
          incorrectCount++;
        }
      }

      questionAttempts.push({
        id: `qa_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        attempt_id: attempt.id,
        question_id: q.id,
        selected_answer: hasAnswer ? studentAns : null,
        is_correct: isCorrect,
        time_taken_seconds: Math.round(effectiveTimeTaken / questions.length),
        attempt_number: 1,
        created_at: new Date().toISOString(),
        metadata: {
          evaluation_details: evalDetails,
          topic_id: q.topic_id,
        },
      });
    }

    // Authoritative score calculation
    const score = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

    // Update attempt
    const isExpired = Boolean(quiz.time_limit_seconds && elapsedSeconds > quiz.time_limit_seconds + 5);
    attempt.status = isExpired ? 'EXPIRED' : 'COMPLETED';
    attempt.completed_at = new Date().toISOString();
    attempt.score = score;
    attempt.correct_count = correctCount;
    attempt.incorrect_count = incorrectCount;
    attempt.unanswered_count = unansweredCount;
    attempt.time_taken_seconds = effectiveTimeTaken;
    attempt.metadata = {
      ...attempt.metadata,
      current_answers: answers,
      evaluation_summary: {
        score,
        correctCount,
        incorrectCount,
        unansweredCount,
        isExpired,
      },
    };

    await db.updateQuizAttempt(attempt.id, attempt);
    await db.saveQuestionAttempts(attempt.id, questionAttempts);

    // Update quiz status if completed
    await db.updateQuiz(quiz.id, {
      status: isExpired ? 'EXPIRED' : 'COMPLETED',
      completed_at: new Date().toISOString(),
    });

    // Update student overall quiz progress
    await QuizProgressService.recordAttemptProgress(studentId, attempt, questions, questionAttempts);

    // Format topic breakdown
    const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }));

    // Recommendations based on score and topics
    const recommendedActions: string[] = [];
    if (score < 60) {
      recommendedActions.push('Review foundational concepts for missed questions');
      recommendedActions.push('Retry incorrect questions to reinforce understanding');
      recommendedActions.push('Generate a revision quiz at a foundational difficulty');
    } else if (score < 85) {
      recommendedActions.push('Solidify weak topics before taking advanced assessments');
      recommendedActions.push('Practice targeted questions on challenging topics');
    } else {
      recommendedActions.push('Excellent mastery! Ready for advanced and mixed assessments');
      recommendedActions.push('Explore timed coding and DSA challenge quizzes');
    }

    return {
      attempt_id: attempt.id,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      score,
      percentage: score,
      status: attempt.status,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      time_taken_seconds: effectiveTimeTaken,
      completed_at: attempt.completed_at,
      topic_breakdown: topicBreakdown,
      passed: score >= 60,
      recommended_actions: recommendedActions,
    };
  }

  /**
   * Abandon an active quiz attempt
   */
  public static async abandonAttempt(studentId: string, attemptId: string): Promise<QuizAttempt> {
    const attempt = await db.getQuizAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError(`Quiz attempt ${attemptId} not found`);
    }

    if (attempt.student_id !== studentId) {
      throw new AuthorizationError('You are not authorized to abandon this attempt');
    }

    attempt.status = 'ABANDONED';
    attempt.completed_at = new Date().toISOString();
    await db.updateQuizAttempt(attempt.id, attempt);
    return attempt;
  }

  /**
   * Get comprehensive review of a completed quiz attempt with explanations and citations
   */
  public static async getAttemptReview(studentId: string, attemptId: string): Promise<QuizReviewResult> {
    const attempt = await db.getQuizAttemptById(attemptId);
    if (!attempt) {
      throw new NotFoundError(`Quiz attempt ${attemptId} not found`);
    }

    if (attempt.student_id !== studentId) {
      throw new AuthorizationError('You are not authorized to review this attempt');
    }

    const quiz = await db.getQuizById(attempt.quiz_id);
    if (!quiz) {
      throw new NotFoundError(`Associated quiz ${attempt.quiz_id} not found`);
    }

    const questions = await db.getQuizQuestions(quiz.id);
    const questionAttempts = await db.getQuestionAttempts(attempt.id);
    const qaMap = new Map<string, QuestionAttempt>();
    for (const qa of questionAttempts) {
      qaMap.set(qa.question_id, qa);
    }

    const reviewItems: ReviewQuestionItem[] = questions.map((q) => {
      const qa = qaMap.get(q.id);
      const studentAns = qa ? qa.selected_answer : attempt.metadata?.current_answers?.[q.id] || null;
      const isCorrect = Boolean(qa ? qa.is_correct : false);

      // Extract citation or source metadata
      let citation = q.metadata?.citation;
      if (!citation) {
        if (q.source_type === 'DOCUMENT') {
          citation = `Source: Document (${q.source_id || 'Uploaded PDF'})`;
        } else if (q.source_type === 'NOTES') {
          citation = `Source: Study Note (${q.source_id || 'Revision Note'})`;
        } else if (q.source_type === 'COURSE' || q.source_type === 'LESSON') {
          citation = `Source: Course Module (${q.source_id || 'Academic Syllabus'})`;
        } else if (q.source_type === 'DSA') {
          citation = `Source: Data Structures & Algorithms Lab (${q.metadata?.topic_name || 'DSA Topic'})`;
        }
      }

      return {
        question_id: q.id,
        question_number: q.question_number,
        question_type: q.question_type,
        question_text: q.question_text,
        options: q.options,
        student_answer: studentAns,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic_id: q.topic_id,
        source_type: q.source_type,
        source_id: q.source_id,
        citation,
        evaluation_details: qa?.metadata?.evaluation_details,
      };
    });

    return {
      attempt_id: attempt.id,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      score: attempt.score,
      correct_count: attempt.correct_count,
      incorrect_count: attempt.incorrect_count,
      unanswered_count: attempt.unanswered_count,
      time_taken_seconds: attempt.time_taken_seconds,
      completed_at: attempt.completed_at || attempt.started_at,
      questions: reviewItems,
      review_items: reviewItems,
      items: reviewItems,
    };
  }

  /**
   * Create a new practice quiz from incorrect or missed questions
   */
  public static async retryIncorrect(
    studentId: string,
    quizId: string,
    attemptId: string
  ): Promise<{ quiz: Quiz; questions: QuizDeliveryQuestion[] }> {
    const originalQuiz = await db.getQuizById(quizId);
    if (!originalQuiz) {
      throw new NotFoundError(`Quiz ${quizId} not found`);
    }

    const questionAttempts = await db.getQuestionAttempts(attemptId);
    const originalQuestions = await db.getQuizQuestions(quizId);

    // Filter incorrect or unanswered
    const incorrectQIds = new Set(
      questionAttempts.filter((qa) => !qa.is_correct).map((qa) => qa.question_id)
    );

    let retryQuestions = originalQuestions.filter((q) => incorrectQIds.has(q.id));

    // If student got 100% correct, pick up to 5 questions to practice at higher confidence
    if (retryQuestions.length === 0) {
      retryQuestions = originalQuestions.slice(0, Math.min(5, originalQuestions.length));
    }

    // Create new retry practice quiz
    const newQuiz = await db.createQuiz({
      student_id: studentId,
      title: `${originalQuiz.title} - Retry Practice`,
      description: `Targeted revision session focusing on missed concepts from previous attempt.`,
      source_type: originalQuiz.source_type,
      source_id: originalQuiz.source_id,
      difficulty: originalQuiz.difficulty,
      question_count: retryQuestions.length,
      time_limit_seconds: originalQuiz.time_limit_seconds,
      adaptive_mode: false,
      status: 'READY',
      metadata: {
        parent_quiz_id: originalQuiz.id,
        retry_from_attempt_id: attemptId,
      },
    });

    // Create question copies for the new quiz
    const newQuestionsData = retryQuestions.map((q, idx) => ({
      quiz_id: newQuiz.id,
      question_number: idx + 1,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options ? [...q.options] : undefined,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      topic_id: q.topic_id,
      source_type: q.source_type,
      source_id: q.source_id,
      metadata: { ...q.metadata, is_retry: true },
    }));

    const createdQuestions = await db.createQuizQuestions(newQuestionsData);
    const deliveryQuestions = createdQuestions.map(toDeliveryQuestion);

    return {
      quiz: newQuiz,
      questions: deliveryQuestions,
    };
  }

  /**
   * Explain a question answer using AI / educational context
   */
  public static async explainAnswer(
    studentId: string,
    questionId?: string,
    studentAnswer?: any,
    userQuery?: string,
    fallbackContext?: { question_text?: string; correct_answer?: any }
  ): Promise<{
    explanation: string;
    concept_summary: string;
    why_correct: string;
    why_wrong: string;
    key_concept?: string;
    similar_example?: string;
  }> {
    let question: QuizQuestion | null | undefined;
    if (questionId) {
      question = await db.getQuizQuestionById(questionId);
    }

    if (!question && fallbackContext?.question_text) {
      question = {
        id: questionId || 'q_adhoc',
        quiz_id: 'adhoc',
        question_number: 1,
        question_type: 'MCQ',
        question_text: fallbackContext.question_text,
        options: [],
        correct_answer: fallbackContext.correct_answer || 'Expected Concept',
        explanation: 'Review the underlying system and algorithmic invariants for this principle.',
        difficulty: 'MEDIUM',
        topic_id: 'Computer Science',
        source_type: 'TOPIC',
        created_at: new Date().toISOString(),
      };
    }

    if (!question) {
      throw new NotFoundError(`Question ${questionId || 'specified'} not found`);
    }

    const isCorrect = QuestionEvaluationService.evaluateAnswer(question, studentAnswer).is_correct;
    const formattedCorrect = Array.isArray(question.correct_answer)
      ? question.correct_answer.join(', ')
      : String(question.correct_answer);
    const formattedStudent = Array.isArray(studentAnswer)
      ? studentAnswer.join(', ')
      : studentAnswer ? String(studentAnswer) : '(No answer)';

    return {
      explanation: question.explanation,
      concept_summary: `Topic: ${question.topic_id || 'Core Engineering'}. ${question.metadata?.topic_name ? 'Focus: ' + question.metadata.topic_name : ''}`,
      key_concept: question.topic_id || 'Core Engineering',
      why_correct: `The authoritative correct answer is "${formattedCorrect}". ${question.explanation}`,
      why_wrong: isCorrect
        ? `Your answer "${formattedStudent}" was actually correct!`
        : `Your answer was "${formattedStudent}". In this context, it is incorrect because it does not satisfy the underlying theoretical criteria or operational properties required.`,
      similar_example: question.options && question.options.length > 2
        ? `Review the distinction between "${formattedCorrect}" and other distractors such as "${question.options.find(o => o !== formattedCorrect) || 'other choices'}".`
        : undefined,
    };
  }
}

export const QuizService = QuizAttemptService;

