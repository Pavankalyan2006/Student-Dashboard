import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { QuizService } from '../../server/services/quizAttempt';
import { QuizGenerationService } from '../../server/services/quizGeneration';
import { QuestionEvaluationService } from '../../server/services/questionEvaluation';
import { AdaptiveQuizService } from '../../server/services/adaptiveQuiz';
import { QuizProgressService } from '../../server/services/quizProgress';
import { ToolRegistry } from '../../server/ai/tools';
import { NotesService } from '../../server/services/notes';
import { toDeliveryQuestion, QuizQuestion } from '../../server/models/quizTypes';

import { useMockQuizModel } from './helpers/mockAIModel';

useMockQuizModel();

describe('Phase 9: AI Quiz & Adaptive Assessment System', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_test_isolated_student';

  describe('1. Quiz Generation & Multi-Source Support', () => {
    it('generates a topic quiz with structured questions and validation', async () => {
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        topic: 'Graph Algorithms BFS and DFS',
        source_type: 'TOPIC',
        difficulty: 'MEDIUM',
        question_count: 5,
        question_type: 'MIXED',
        adaptive_mode: true,
      });

      expect(quiz).toBeDefined();
      expect(quiz.id).toMatch(/^quiz_/);
      expect(quiz.student_id).toBe(studentA);
      expect(quiz.title).toContain('Graph Algorithms');
      expect(quiz.question_count).toBe(5);
      expect(quiz.adaptive_mode).toBe(true);

      const questions = await db.getQuizQuestions(quiz.id);
      expect(questions.length).toBe(5);
      for (const q of questions) {
        expect(q.quiz_id).toBe(quiz.id);
        expect(q.question_text).toBeDefined();
        expect(q.correct_answer).toBeDefined();
        expect(q.explanation).toBeDefined();
        expect(q.source_type).toBe('TOPIC');
      }
    });

    it('generates a quiz grounded in an uploaded document source', async () => {
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        source_type: 'DOCUMENT',
        source_id: 'doc_seed_os_01',
        topic: 'Operating Systems Principles',
        difficulty: 'HARD',
        question_count: 3,
      });

      expect(quiz.source_type).toBe('DOCUMENT');
      expect(quiz.source_id).toBe('doc_seed_os_01');

      const questions = await db.getQuizQuestions(quiz.id);
      expect(questions.length).toBe(3);
      for (const q of questions) {
        expect(q.metadata?.source_name).toBeDefined();
        expect(q.metadata?.citation).toBeDefined();
      }
    });

    it('generates a quiz grounded in student notes source', async () => {
      const notesList = await NotesService.listNotes(studentA, { limit: 1 });
      const targetNote = notesList.items[0];

      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        source_type: 'NOTES',
        source_id: targetNote.id,
        topic: 'Database Normalization',
        difficulty: 'MEDIUM',
        question_count: 3,
      });

      expect(quiz.source_type).toBe('NOTES');
      const questions = await db.getQuizQuestions(quiz.id);
      expect(questions.length).toBe(3);
      expect(questions[0].metadata?.source_note_id || questions[0].metadata?.note_id).toBe(targetNote.id);
    });

    it('generates a quiz grounded in a curriculum course / lesson', async () => {
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        source_type: 'LESSON',
        source_id: 'lsn_daa_01',
        topic: 'Asymptotic Notations',
        difficulty: 'EASY',
        question_count: 2,
      });

      expect(quiz.source_type).toBe('LESSON');
      const questions = await db.getQuizQuestions(quiz.id);
      expect(questions.length).toBe(2);
    });

    it('generates a quiz grounded in DSA Lab topics', async () => {
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        source_type: 'DSA',
        source_id: 'dsa_binary_search',
        topic: 'Binary Search Trees',
        difficulty: 'MEDIUM',
        question_count: 4,
      });

      expect(quiz.source_type).toBe('DSA');
      const questions = await db.getQuizQuestions(quiz.id);
      expect(questions.length).toBe(4);
    });
  });

  describe('2. Delivery Masking & Security Constraints', () => {
    it('masks correct answers and explanations in QuizDeliveryQuestion', () => {
      const sensitiveQuestion: QuizQuestion = {
        id: 'q_test_masked',
        quiz_id: 'quiz_123',
        question_number: 1,
        question_type: 'MCQ',
        question_text: 'Which data structure follows LIFO?',
        options: ['Queue', 'Stack', 'Tree', 'Graph'],
        correct_answer: 'Stack',
        explanation: 'Stack follows Last In First Out.',
        difficulty: 'EASY',
        topic_id: 'DSA',
        source_type: 'TOPIC',
        metadata: { citation: 'Page 12' },
        created_at: new Date().toISOString(),
      };

      const delivery = toDeliveryQuestion(sensitiveQuestion);

      expect((delivery as any).correct_answer).toBeUndefined();
      expect((delivery as any).explanation).toBeUndefined();
      expect(delivery.id).toBe('q_test_masked');
      expect(delivery.options).toEqual(['Queue', 'Stack', 'Tree', 'Graph']);
      expect(delivery.question_text).toBe('Which data structure follows LIFO?');
    });

    it('blocks unauthorized students from accessing or starting another student quiz attempt', async () => {
      // Quiz belonging to student A
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        topic: 'Operating System Kernels',
        question_count: 2,
      });

      // Student B attempts to start quiz belonging to student A
      await expect(QuizService.startAttempt(studentB, quiz.id)).rejects.toThrow(
        /authorized/i
      );
    });
  });

  describe('3. Deterministic Question Evaluation Across All 5 Types', () => {
    it('evaluates MCQ correctly (exact matching)', () => {
      const q: QuizQuestion = {
        id: 'q1',
        quiz_id: 'qz',
        question_number: 1,
        question_type: 'MCQ',
        question_text: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
        correct_answer: 'O(log n)',
        explanation: 'Binary search halves the search space each step.',
        difficulty: 'EASY',
        topic_id: 'DSA',
        source_type: 'TOPIC',
        created_at: '',
      };

      expect(QuestionEvaluationService.evaluate(q, 'O(log n)').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, 'O(n)').is_correct).toBe(false);
    });

    it('evaluates MULTI_SELECT correctly (exact set matching)', () => {
      const q: QuizQuestion = {
        id: 'q2',
        quiz_id: 'qz',
        question_number: 2,
        question_type: 'MULTI_SELECT',
        question_text: 'Which of the following are linear data structures?',
        options: ['Array', 'Stack', 'Tree', 'Queue'],
        correct_answer: ['Array', 'Stack', 'Queue'],
        explanation: 'Trees are hierarchical nonlinear data structures.',
        difficulty: 'MEDIUM',
        topic_id: 'DSA',
        source_type: 'TOPIC',
        created_at: '',
      };

      expect(QuestionEvaluationService.evaluate(q, ['Queue', 'Stack', 'Array']).is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, ['Array', 'Stack']).is_correct).toBe(false);
      expect(QuestionEvaluationService.evaluate(q, ['Array', 'Stack', 'Tree']).is_correct).toBe(false);
    });

    it('evaluates TRUE_FALSE correctly (boolean and text normalization)', () => {
      const q: QuizQuestion = {
        id: 'q3',
        quiz_id: 'qz',
        question_number: 3,
        question_type: 'TRUE_FALSE',
        question_text: 'Binary search requires the input array to be sorted.',
        correct_answer: 'True',
        explanation: 'Binary search relies on ordering to discard half the elements.',
        difficulty: 'EASY',
        topic_id: 'DSA',
        source_type: 'TOPIC',
        created_at: '',
      };

      expect(QuestionEvaluationService.evaluate(q, 'True').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, 'true').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, 'False').is_correct).toBe(false);
      expect(QuestionEvaluationService.evaluate(q, 'false').is_correct).toBe(false);
    });

    it('evaluates SHORT_ANSWER with Big-O notation normalization and keyword matching', () => {
      const q: QuizQuestion = {
        id: 'q4',
        quiz_id: 'qz',
        question_number: 4,
        question_type: 'SHORT_ANSWER',
        question_text: 'What is the average time complexity of quicksort?',
        correct_answer: 'O(n log n)',
        explanation: 'Quicksort divides in n parts across log n recursion levels on average.',
        difficulty: 'MEDIUM',
        topic_id: 'DSA',
        source_type: 'TOPIC',
        created_at: '',
      };

      expect(QuestionEvaluationService.evaluate(q, 'O(n log n)').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, 'n log n').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, 'o(nlogn)').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, 'O(n^2)').is_correct).toBe(false);
    });

    it('evaluates CODE_OUTPUT correctly with whitespace normalization', () => {
      const q: QuizQuestion = {
        id: 'q5',
        quiz_id: 'qz',
        question_number: 5,
        question_type: 'CODE_OUTPUT',
        question_text: 'What does this print: print(2 ** 3)?',
        correct_answer: '8',
        explanation: '2 to the power 3 is 8.',
        difficulty: 'EASY',
        topic_id: 'Python',
        source_type: 'TOPIC',
        created_at: '',
      };

      expect(QuestionEvaluationService.evaluate(q, '8').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, ' 8 \n').is_correct).toBe(true);
      expect(QuestionEvaluationService.evaluate(q, '6').is_correct).toBe(false);
    });
  });

  describe('4. Attempt Lifecycle, Autosave & Authoritative Submission', () => {
    it('executes full quiz attempt workflow with autosave and server-side scoring', async () => {
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        topic: 'Computer Networks Protocols',
        question_count: 2,
        time_limit_seconds: 300,
      });

      // 1. Start Attempt
      const { attempt, questions } = await QuizService.startAttempt(studentA, quiz.id);
      expect(attempt.status).toBe('IN_PROGRESS');
      expect(questions.length).toBe(2);

      // Verify answers are masked in delivery
      expect((questions[0] as any).correct_answer).toBeUndefined();

      // Get actual questions from DB to simulate correct answers
      const actualQuestions = await db.getQuizQuestions(quiz.id);

      // 2. Autosave partial answers
      const saveRes = await QuizService.saveAnswers(studentA, attempt.id, {
        [actualQuestions[0].id]: actualQuestions[0].correct_answer,
      });
      expect(saveRes.success).toBe(true);

      // 3. Submit Attempt
      const result = await QuizService.submitAttempt(studentA, attempt.id, {
        [actualQuestions[0].id]: actualQuestions[0].correct_answer,
        [actualQuestions[1].id]: 'Wrong Answer Simulation',
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.correct_count).toBe(1);
      expect(result.incorrect_count).toBe(1);
      expect(result.score).toBe(50);
      expect(result.percentage).toBe(50);
      expect(result.passed).toBe(false); // < 60% threshold

      // 4. Retrieve Review with full explanations and citations
      const review = await QuizService.getAttemptReview(studentA, attempt.id);
      const items = review.review_items || review.questions || [];
      expect(items.length).toBe(2);
      expect(items[0].explanation).toBeDefined();
      expect(items[0].correct_answer).toBeDefined();
    });

    it('enforces backend expiration when time limit is exceeded', async () => {
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        topic: 'Real-Time Embedded Systems',
        question_count: 2,
        time_limit_seconds: 1, // 1 second limit
      });

      const { attempt } = await QuizService.startAttempt(studentA, quiz.id);

      // Simulate expired timestamp in database
      const expiredTime = new Date(Date.now() - 50000).toISOString();
      await db.updateQuizAttempt(attempt.id, { started_at: expiredTime });

      // Attempting to autosave or submit after expiry
      const result = await QuizService.submitAttempt(studentA, attempt.id, {});
      expect(result.status).toBe('EXPIRED');
    });
  });

  describe('5. Rule-Based Adaptive Difficulty Engine', () => {
    it('increases difficulty after 2 consecutive correct answers', () => {
      const state = AdaptiveQuizService.initAdaptiveState('EASY');

      const s1 = AdaptiveQuizService.evaluateAdaptiveStep(state, true, 'EASY');
      expect(s1.correct_streak).toBe(1);
      expect(s1.current_difficulty).toBe('EASY');

      const s2 = AdaptiveQuizService.evaluateAdaptiveStep(s1, true, 'EASY');
      expect(s2.correct_streak).toBe(2);
      expect(s2.current_difficulty).toBe('MEDIUM');
      expect(s2.adjustment_reason).toContain('streak');
    });

    it('decreases difficulty after 2 consecutive incorrect answers', () => {
      const state = AdaptiveQuizService.initAdaptiveState('HARD');

      const s1 = AdaptiveQuizService.evaluateAdaptiveStep(state, false, 'HARD');
      expect(s1.incorrect_streak).toBe(1);
      expect(s1.current_difficulty).toBe('HARD');

      const s2 = AdaptiveQuizService.evaluateAdaptiveStep(s1, false, 'HARD');
      expect(s2.incorrect_streak).toBe(2);
      expect(s2.current_difficulty).toBe('MEDIUM');
      expect(s2.adjustment_reason).toContain('Lowered difficulty');
    });
  });

  describe('6. Student Progress & Weak Area Remediation', () => {
    it('aggregates student accuracy and classifies weak areas (<60%) and strong areas (>=80%)', async () => {
      const progress = await QuizProgressService.getStudentProgress(studentA);

      expect(progress.student_id).toBe(studentA);
      expect(progress.completed_quizzes ?? progress.total_quizzes_completed).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(progress.weak_areas || progress.weak_topics)).toBe(true);
      expect(Array.isArray(progress.strong_areas || progress.strong_topics)).toBe(true);

      // Verify weak areas have < 60% accuracy
      for (const weak of progress.weak_areas || []) {
        const acc = typeof weak === 'object' ? (weak.accuracy_rate ?? weak.accuracy) : 0;
        expect(acc).toBeLessThan(60);
      }

      // Verify strong areas have >= 80% accuracy
      for (const strong of progress.strong_areas || []) {
        const acc = typeof strong === 'object' ? (strong.accuracy_rate ?? strong.accuracy) : 100;
        expect(acc).toBeGreaterThanOrEqual(80);
      }
    });

    it('creates a revision retry quiz containing missed concepts', async () => {
      // Create quiz with a failed attempt
      const { quiz } = await QuizGenerationService.generateQuiz(studentA, {
        topic: 'Compilers and Lexical Analysis',
        question_count: 2,
      });
      const { attempt } = await QuizService.startAttempt(studentA, quiz.id);
      const questions = await db.getQuizQuestions(quiz.id);

      // Submit all incorrect
      await QuizService.submitAttempt(studentA, attempt.id, {
        [questions[0].id]: 'Wrong Answer 1',
        [questions[1].id]: 'Wrong Answer 2',
      });

      // Retry incorrect questions
      const retryResult = await QuizService.retryIncorrect(studentA, quiz.id, attempt.id);
      expect(retryResult.quiz).toBeDefined();
      expect(retryResult.quiz.title).toContain('Retry');
      expect(retryResult.quiz.question_count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('7. AI Agent Quiz Tool Registry Integration', () => {
    it('executes generate_quiz, get_quiz_progress, get_weak_topics and explain_quiz_answer via ToolRegistry', async () => {
      // 1. generate_quiz tool
      const genResult = await ToolRegistry.execute(
        'generate_quiz',
        {
          topic: 'Object Oriented Programming in Java',
          question_count: 3,
          difficulty: 'MEDIUM',
        },
        studentA
      );
      expect(genResult.quiz || genResult).toBeDefined();

      // 2. get_quiz_progress tool
      const progResult = await ToolRegistry.execute('get_quiz_progress', {}, studentA);
      expect(progResult.completed_quizzes ?? progResult.total_quizzes_completed).toBeDefined();

      // 3. get_weak_topics tool
      const weakResult = await ToolRegistry.execute('get_weak_topics', {}, studentA);
      expect(Array.isArray(weakResult)).toBe(true);

      // 4. explain_quiz_answer tool
      const explainResult = await ToolRegistry.execute(
        'explain_quiz_answer',
        {
          question_text: 'Which scheduling algorithm is non-preemptive?',
          student_answer: 'Round Robin',
          correct_answer: 'First-Come First-Served',
        },
        studentA
      );
      expect(explainResult.explanation).toBeDefined();
      expect(explainResult.key_concept).toBeDefined();
    });
  });
});
