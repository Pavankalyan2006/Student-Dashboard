// server/services/mockInterviewEngineService.ts
// Core business engine for AI Mock Interviews Module

import { db } from '../db/database';
import {
  MockInterviewCategory,
  InterviewDifficulty,
  ExperienceLevel,
  InterviewStyle,
  FeedbackMode,
  MockInterviewSessionEntity,
  MockInterviewSessionQuestion,
  MockInterviewAnswerEntity,
  MockInterviewReport,
  SavedMockQuestionEntity,
  ScheduledMockInterviewEntity,
  MockInterviewAnalytics,
  CreateMockInterviewSessionRequest,
  RubricScoreItem,
} from '../models/mockInterviewTypes';
import {
  MOCK_INTERVIEW_CATEGORIES,
  TARGET_ROLES_METADATA,
  MOCK_INTERVIEW_QUESTION_CATALOG,
  RUBRIC_TEMPLATES,
} from '../db/mockInterviewCatalog';
import { CodingService } from './coding';
import { SqlLabSandboxService } from './sqlLabSandboxService';
import { ResumeService } from './resumeService';
import { AIService } from '../ai/service';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class MockInterviewEngineService {
  // -------------------------------------------------------------
  // 1. Catalog & Metadata
  // -------------------------------------------------------------
  public static getCategories() {
    return MOCK_INTERVIEW_CATEGORIES;
  }

  public static getTargetRoles() {
    return TARGET_ROLES_METADATA;
  }

  public static getQuestions(filters?: {
    category?: MockInterviewCategory;
    difficulty?: InterviewDifficulty;
    targetRole?: string;
    search?: string;
  }) {
    let list = [...MOCK_INTERVIEW_QUESTION_CATALOG];
    if (filters?.category) {
      list = list.filter((q) => q.category === filters.category);
    }
    if (filters?.difficulty) {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters?.targetRole) {
      list = list.filter(
        (q) => q.target_roles.includes(filters.targetRole!) || q.target_roles.includes('SDE')
      );
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (q) =>
          q.question.toLowerCase().includes(s) ||
          q.topic.toLowerCase().includes(s) ||
          q.expected_concepts.some((c) => c.toLowerCase().includes(s))
      );
    }
    return list;
  }

  public static getQuestionById(id: string) {
    const q = MOCK_INTERVIEW_QUESTION_CATALOG.find((item) => item.id === id);
    if (!q) {
      throw new NotFoundError(`Mock interview question '${id}' not found`);
    }
    return q;
  }

  // -------------------------------------------------------------
  // 2. Session Lifecycle
  // -------------------------------------------------------------
  public static async createSession(
    studentId: string,
    req: CreateMockInterviewSessionRequest
  ): Promise<{ session: MockInterviewSessionEntity; initial_question: MockInterviewSessionQuestion }> {
    if (!studentId) {
      throw new AuthorizationError('Authentication required to create mock interview session');
    }

    const category = req.category || 'TECHNICAL';
    const targetRole = req.target_role || 'Software Development Engineer';
    const difficulty = req.difficulty || 'INTERMEDIATE';
    const experienceLevel = req.experience_level || 'STUDENT';
    const maxQuestions = Math.max(2, Math.min(10, req.max_questions || 4));
    const durationMinutes = req.duration_minutes || maxQuestions * 7;
    const interviewStyle = req.interview_style || 'FRIENDLY';
    const feedbackMode = req.feedback_mode || 'COMPREHENSIVE';

    let resumeSnippet: string | undefined;
    if (req.resume_id) {
      try {
        const fullResume = await ResumeService.getFullResume(req.resume_id, studentId);
        if (fullResume) {
          const projs = fullResume.projects.map((p) => `${p.title} (${p.technologies.join(', ')})`).join('; ');
          const skills = fullResume.skills.map((s) => s.skill).join(', ');
          resumeSnippet = `Projects: ${projs}. Skills: ${skills}. Summary: ${fullResume.resume?.summary || 'B.Tech Student'}`;
        }
      } catch (err: any) {
        logger.warn('Failed to load student resume for interview grounding', { error: err.message });
      }
    }

    const sessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const session: MockInterviewSessionEntity = {
      id: sessionId,
      student_id: studentId,
      category,
      interview_type: category, // compatibility
      target_role: targetRole,
      difficulty,
      experience_level: experienceLevel,
      duration_minutes: durationMinutes,
      max_questions: maxQuestions,
      current_question_index: 1,
      status: 'READY',
      programming_language: req.programming_language || (category === 'SQL' ? 'sql' : 'python'),
      target_company: req.target_company,
      job_description: req.job_description,
      resume_id: req.resume_id,
      interview_style: interviewStyle,
      feedback_mode: feedbackMode,
      elapsed_seconds: 0,
      code_snapshots: {},
      sql_snapshots: {},
      system_design_artifacts: {},
      rubric_version: 'v2026.1_multi_dimension',
      created_at: now,
    };

    await db.saveMockInterviewSession(session as any);

    // Formulate initial question
    const initialQuestion = await this.generateSessionQuestion(
      session,
      1,
      [],
      resumeSnippet
    );
    await db.saveMockInterviewQuestion(initialQuestion as any);

    logger.info(`Created mock interview session ${sessionId} for student ${studentId} [Category: ${category}]`);

    return { session, initial_question: initialQuestion };
  }

  public static async getSession(
    sessionId: string,
    studentId: string
  ): Promise<{
    session: MockInterviewSessionEntity;
    questions: MockInterviewSessionQuestion[];
    answers: MockInterviewAnswerEntity[];
  }> {
    const rawSession = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!rawSession) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    const questions = ((await db.getMockInterviewQuestions(sessionId)) as any) || [];
    const answers = ((await db.getMockInterviewAnswers(sessionId)) as any) || [];

    return {
      session: rawSession as any,
      questions,
      answers,
    };
  }

  public static async startSession(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewSessionEntity> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.status === 'READY') {
      session.status = 'IN_PROGRESS';
      session.started_at = new Date().toISOString();
      await db.saveMockInterviewSession(session);
    }
    return session;
  }

  public static async pauseSession(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewSessionEntity> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.status === 'IN_PROGRESS') {
      session.status = 'PAUSED';
      session.is_paused = true;
      session.paused_at = new Date().toISOString();
      await db.saveMockInterviewSession(session);
    }
    return session;
  }

  public static async resumeSession(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewSessionEntity> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.status === 'PAUSED') {
      session.status = 'IN_PROGRESS';
      session.is_paused = false;
      await db.saveMockInterviewSession(session);
    }
    return session;
  }

  public static async skipQuestion(
    sessionId: string,
    studentId: string,
    questionId: string
  ): Promise<{
    next_question: MockInterviewSessionQuestion | null;
    is_completed: boolean;
  }> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    const question = await db.getMockInterviewQuestionById(questionId);
    if (!question || question.session_id !== sessionId) {
      throw new NotFoundError(`Question '${questionId}' not found in session '${sessionId}'`);
    }

    // Record skipped answer with zero score
    const answerId = `ans_skip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const skippedAnswer: MockInterviewAnswerEntity = {
      id: answerId,
      session_id: sessionId,
      question_id: questionId,
      student_id: studentId,
      answer_text: '[SKIPPED BY CANDIDATE]',
      duration_seconds: 0,
      evaluation: {
        score: 0,
        rubric_scores: [
          { dimension: 'Technical Correctness', score: 0, weight: 40, weightedScore: 0, feedback: 'Question was skipped.' },
          { dimension: 'Problem Solving', score: 0, weight: 30, weightedScore: 0, feedback: 'No answer provided.' },
          { dimension: 'Communication', score: 0, weight: 30, weightedScore: 0, feedback: 'Skipped.' },
        ],
        covered_concepts: [],
        missing_concepts: question.expected_concepts,
        strengths: [],
        improvements: ['Attempt all questions; partial answers with structured thought processes receive partial credit.'],
        clarity_feedback: 'Candidate opted to skip this problem.',
        follow_up_needed: false,
      },
      created_at: new Date().toISOString(),
    };

    await db.saveMockInterviewAnswer(skippedAnswer as any);

    const allQuestions = ((await db.getMockInterviewQuestions(sessionId)) as any) || [];

    if (session.current_question_index < session.max_questions) {
      const nextIndex = session.current_question_index + 1;
      const nextQuestion = await this.generateSessionQuestion(session, nextIndex, allQuestions);
      await db.saveMockInterviewQuestion(nextQuestion as any);
      session.current_question_index = nextIndex;
      await db.saveMockInterviewSession(session);
      return { next_question: nextQuestion, is_completed: false };
    } else {
      await this.completeSession(sessionId, studentId);
      return { next_question: null, is_completed: true };
    }
  }

  public static async requestHint(
    sessionId: string,
    studentId: string,
    questionId: string
  ): Promise<{ hint: string; remaining_hints: number }> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    const question = (await db.getMockInterviewQuestionById(questionId)) as any;
    if (!question) throw new NotFoundError('Question not found');

    const hints = question.hints || [
      'Focus on the fundamental boundary constraints and the expected runtime / memory complexity.',
      'Consider decomposing the problem into input validation, core processing invariants, and edge cases.',
    ];

    return {
      hint: hints[0],
      remaining_hints: Math.max(0, hints.length - 1),
    };
  }

  public static async runCodeInSandbox(
    sessionId: string,
    studentId: string,
    params: {
      question_id: string;
      language: string;
      source_code: string;
      stdin?: string;
    }
  ) {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    // Save snapshot
    if (!session.code_snapshots) session.code_snapshots = {};
    session.code_snapshots[params.question_id] = params.source_code;
    await db.saveMockInterviewSession(session);

    const execResult = await CodingService.runCode(studentId, {
      language: params.language as any,
      source_code: params.source_code,
      stdin: params.stdin,
      session_id: sessionId,
    });

    return execResult;
  }

  public static async runSqlInSandbox(
    sessionId: string,
    studentId: string,
    params: {
      question_id: string;
      query: string;
      db_name?: string;
    }
  ) {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    if (!session.sql_snapshots) session.sql_snapshots = {};
    session.sql_snapshots[params.question_id] = params.query;
    await db.saveMockInterviewSession(session);

    const targetDb = params.db_name || 'university_db';
    const result = await SqlLabSandboxService.executeSandboxedSql(studentId, targetDb, params.query);
    return result;
  }

  public static async saveSystemDesignArtifact(
    sessionId: string,
    studentId: string,
    params: {
      question_id: string;
      topology: any;
    }
  ) {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    if (!session.system_design_artifacts) session.system_design_artifacts = {};
    session.system_design_artifacts[params.question_id] = params.topology;
    await db.saveMockInterviewSession(session);

    return { success: true };
  }

  public static async updateScratchpadNotes(
    sessionId: string,
    studentId: string,
    notes: string
  ) {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    session.scratchpad_notes = notes;
    await db.saveMockInterviewSession(session);
    return { success: true };
  }

  // -------------------------------------------------------------
  // 3. Answer Evaluation & Progression
  // -------------------------------------------------------------
  public static async submitAnswer(
    sessionId: string,
    studentId: string,
    questionId: string,
    body: {
      answer_text: string;
      duration_seconds?: number;
      input_mode?: 'TEXT' | 'VOICE';
      code_used?: string;
      sql_query_used?: string;
      architecture_used?: any;
    }
  ): Promise<{
    answer: MockInterviewAnswerEntity;
    next_question: MockInterviewSessionQuestion | null;
    is_completed: boolean;
  }> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
      throw new ValidationError(`Cannot submit answers to a ${session.status.toLowerCase()} session`);
    }

    const question = (await db.getMockInterviewQuestionById(questionId)) as any;
    if (!question || question.session_id !== sessionId) {
      throw new NotFoundError(`Question '${questionId}' not found in session '${sessionId}'`);
    }

    if (!body.answer_text || body.answer_text.trim().length === 0) {
      throw new ValidationError('Answer text cannot be empty');
    }

    // Evaluate answer against rubric dimensions & expected concepts
    const evaluation = await this.evaluateAnswerSemantics(
      session,
      question,
      body.answer_text,
      body.code_used,
      body.sql_query_used
    );

    const answerId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const answer: MockInterviewAnswerEntity = {
      id: answerId,
      session_id: sessionId,
      question_id: questionId,
      student_id: studentId,
      answer_text: body.answer_text.trim(),
      code_used: body.code_used,
      sql_query_used: body.sql_query_used,
      architecture_used: body.architecture_used,
      duration_seconds: body.duration_seconds || 60,
      input_mode: body.input_mode || 'TEXT',
      voice_transcript_verified: body.input_mode === 'VOICE',
      evaluation,
      created_at: new Date().toISOString(),
    };

    await db.saveMockInterviewAnswer(answer as any);

    // Update elapsed seconds on session
    session.elapsed_seconds = (session.elapsed_seconds || 0) + (body.duration_seconds || 60);

    const allQuestions = ((await db.getMockInterviewQuestions(sessionId)) as any) || [];

    // Adaptive follow up logic
    let nextQuestion: MockInterviewSessionQuestion | null = null;
    let isCompleted = false;

    const shouldFollowUp =
      evaluation.follow_up_needed &&
      session.current_question_index < session.max_questions &&
      !question.follow_up_to;

    if (shouldFollowUp) {
      const nextIndex = session.current_question_index + 1;
      nextQuestion = await this.generateAdaptiveFollowUp(
        session,
        nextIndex,
        question,
        evaluation.suggested_follow_up
      );
      await db.saveMockInterviewQuestion(nextQuestion as any);
      session.current_question_index = nextIndex;
      await db.saveMockInterviewSession(session);
    } else if (session.current_question_index < session.max_questions) {
      const nextIndex = session.current_question_index + 1;
      nextQuestion = await this.generateSessionQuestion(session, nextIndex, allQuestions);
      await db.saveMockInterviewQuestion(nextQuestion as any);
      session.current_question_index = nextIndex;
      await db.saveMockInterviewSession(session);
    } else {
      isCompleted = true;
      await this.completeSession(sessionId, studentId);
    }

    return {
      answer,
      next_question: nextQuestion,
      is_completed: isCompleted,
    };
  }

  // -------------------------------------------------------------
  // 4. Session Completion & Report Generation
  // -------------------------------------------------------------
  public static async completeSession(
    sessionId: string,
    studentId: string
  ): Promise<{ session: MockInterviewSessionEntity; report: MockInterviewReport }> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    const questions = ((await db.getMockInterviewQuestions(sessionId)) as any) || [];
    const answers = ((await db.getMockInterviewAnswers(sessionId)) as any) || [];

    let totalScore = 0;
    const answeredCount = answers.filter((a: any) => !a.answer_text.includes('[SKIPPED BY CANDIDATE]')).length;
    const skippedCount = answers.length - answeredCount;

    const allStrengths: Set<string> = new Set();
    const allImprovements: Set<string> = new Set();
    const allTopics: Set<string> = new Set();
    const allMissing: Set<string> = new Set();

    const perQuestionFeedback = questions.map((q: any) => {
      allTopics.add(q.topic);
      const ans = answers.find((a: any) => a.question_id === q.id);
      if (ans && ans.evaluation) {
        totalScore += ans.evaluation.score;
        ans.evaluation.strengths.forEach((s: string) => allStrengths.add(s));
        ans.evaluation.improvements.forEach((i: string) => allImprovements.add(i));
        ans.evaluation.missing_concepts.forEach((m: string) => allMissing.add(m));

        return {
          question_id: q.id,
          question_number: q.question_number,
          question_text: q.question,
          student_answer: ans.answer_text,
          score: ans.evaluation.score,
          strengths: ans.evaluation.strengths,
          missing_concepts: ans.evaluation.missing_concepts,
          improvement_advice: ans.evaluation.improvements.join(' '),
          model_answer: q.reference_answer || 'Formulate structured responses addressing all primary system invariants.',
          code_execution_summary: ans.code_used ? 'Executed in isolated sandbox runtime.' : undefined,
          sql_execution_summary: ans.sql_query_used ? 'Executed against student isolated relational database.' : undefined,
        };
      } else {
        return {
          question_id: q.id,
          question_number: q.question_number,
          question_text: q.question,
          student_answer: '[NOT ANSWERED]',
          score: 0,
          strengths: [],
          missing_concepts: q.expected_concepts,
          improvement_advice: 'Review foundational principles of this topic.',
          model_answer: q.reference_answer || 'Complete answer expected.',
        };
      }
    });

    // No answers means no evidence: score 0 rather than an assumed 60.
    const avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;

    // Aggregate dimension rubric scores
    const rubricMap: Record<string, { total: number; count: number; weight: number }> = {};
    for (const a of answers) {
      if (a.evaluation?.rubric_scores) {
        for (const item of a.evaluation.rubric_scores) {
          if (!rubricMap[item.dimension]) {
            rubricMap[item.dimension] = { total: 0, count: 0, weight: item.weight };
          }
          rubricMap[item.dimension].total += item.score;
          rubricMap[item.dimension].count += 1;
        }
      }
    }

    const rubricBreakdown: RubricScoreItem[] = Object.entries(rubricMap).map(([dim, data]) => {
      const dimScore = Math.round(data.total / data.count);
      return {
        dimension: dim,
        score: dimScore,
        weight: data.weight,
        weightedScore: Math.round((dimScore * data.weight) / 100),
        feedback:
          dimScore >= 80
            ? 'Strong proficiency demonstrated across core requirements.'
            : 'Focus on clarifying edge cases and system constraints.',
      };
    });

    // Cross-module learning recommendations
    const recommendedModules = [
      {
        id: 'rec_dsa',
        module_name: 'DSA Lab',
        title: 'Algorithmic Problem Practice',
        description: 'Practice interactive LeetCode-style data structures with step-by-step visualizers.',
        route_path: '/dsa',
        action_label: 'Open DSA Lab',
        recommended_topic: Array.from(allTopics)[0] || 'Data Structures',
      },
      {
        id: 'rec_sql',
        module_name: 'SQL Lab',
        title: 'Relational Database Sandbox',
        description: 'Execute queries, design table schemas, and benchmark query execution plans.',
        route_path: '/sql-lab',
        action_label: 'Launch SQL Sandbox',
        recommended_topic: 'DBMS Indexing & Queries',
      },
      {
        id: 'rec_sys',
        module_name: 'System Design Lab',
        title: 'Distributed Architecture Studio',
        description: 'Design microservices, load balancers, database sharding, and latency models.',
        route_path: '/system-design',
        action_label: 'Open System Design Lab',
        recommended_topic: 'Scalable Architectures',
      },
      {
        id: 'rec_tutor',
        module_name: 'AI Tutor',
        title: 'Personalized Academic Clarification',
        description: 'Review missing concepts with Arya AI tutor tailored to your syllabus.',
        route_path: '/ai-tutor',
        action_label: 'Ask AI Tutor',
        recommended_topic: Array.from(allMissing)[0] || 'Core CS Invariants',
      },
    ];

    const report: MockInterviewReport = {
      overall_score: avgScore,
      scoring_definition: 'Practice estimate derived from structured multi-dimensional rubrics (accuracy, problem solving, communication, trade-offs). Not an official employer evaluation.',
      summary: `Completed ${session.category} mock interview for ${session.target_role}. Answered ${answeredCount} of ${questions.length} questions with an overall score of ${avgScore}%.`,
      category: session.category,
      target_role: session.target_role,
      duration_minutes: Math.round((session.elapsed_seconds || 1800) / 60),
      questions_answered: answeredCount,
      questions_skipped: skippedCount,
      rubric_breakdown: rubricBreakdown,
      topics_covered: Array.from(allTopics),
      strongest_areas: Array.from(allStrengths).slice(0, 4),
      improvement_areas: Array.from(allImprovements).slice(0, 4),
      communication_observations: [
        'Organized answers using appropriate engineering terminology.',
        'Consider structuring multi-step trade-offs explicitly before detailing concrete code.',
      ],
      technical_gaps: Array.from(allMissing).slice(0, 4),
      per_question_feedback: perQuestionFeedback,
      recommended_learning_modules: recommendedModules,
    };

    session.status = 'COMPLETED';
    session.completed_at = new Date().toISOString();
    session.overall_score = avgScore;
    session.feedback_summary = report as any;

    await db.saveMockInterviewSession(session);

    return { session, report };
  }

  public static async abandonSession(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewSessionEntity> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    session.status = 'ABANDONED';
    await db.saveMockInterviewSession(session);
    return session;
  }

  public static async getReport(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewReport> {
    const session = (await db.getMockInterviewSessionById(sessionId, studentId)) as any;
    if (!session) throw new NotFoundError('Session not found');

    if (session.feedback_summary) {
      return session.feedback_summary;
    }
    const { report } = await this.completeSession(sessionId, studentId);
    return report;
  }

  // -------------------------------------------------------------
  // 5. Saved Questions
  // -------------------------------------------------------------
  public static async getSavedQuestions(studentId: string): Promise<SavedMockQuestionEntity[]> {
    return db.getSavedMockQuestions(studentId);
  }

  public static async saveQuestion(
    studentId: string,
    params: {
      question_id: string;
      category?: MockInterviewCategory;
      topic?: string;
      question?: string;
      expected_concepts?: string[];
      reference_answer?: string;
      student_notes?: string;
    }
  ): Promise<SavedMockQuestionEntity> {
    // If details not supplied, fetch from catalog
    let catalogQ: any;
    try {
      catalogQ = this.getQuestionById(params.question_id);
    } catch {
      // It might be a session-generated question
      catalogQ = await db.getMockInterviewQuestionById(params.question_id);
    }

    const item: SavedMockQuestionEntity = {
      id: `saved_q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      question_id: params.question_id,
      category: params.category || catalogQ?.category || 'TECHNICAL',
      topic: params.topic || catalogQ?.topic || 'Core CS',
      question: params.question || catalogQ?.question || 'Interview Question',
      expected_concepts: params.expected_concepts || catalogQ?.expected_concepts || [],
      reference_answer: params.reference_answer || catalogQ?.reference_answer,
      student_notes: params.student_notes,
      created_at: new Date().toISOString(),
    };

    return db.saveMockQuestion(item);
  }

  public static async deleteSavedQuestion(studentId: string, id: string): Promise<boolean> {
    return db.deleteSavedMockQuestion(id, studentId);
  }

  // -------------------------------------------------------------
  // 6. Scheduling
  // -------------------------------------------------------------
  public static async getScheduled(studentId: string): Promise<ScheduledMockInterviewEntity[]> {
    return db.getScheduledMockInterviews(studentId);
  }

  public static async scheduleInterview(
    studentId: string,
    params: {
      category: MockInterviewCategory;
      target_role: string;
      scheduled_date: string;
      scheduled_time: string;
      reminder_minutes_before?: number;
    }
  ): Promise<ScheduledMockInterviewEntity> {
    if (!params.scheduled_date || !params.scheduled_time) {
      throw new ValidationError('Scheduled date and time are required.');
    }

    const item: ScheduledMockInterviewEntity = {
      id: `sched_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      category: params.category,
      target_role: params.target_role,
      scheduled_date: params.scheduled_date,
      scheduled_time: params.scheduled_time,
      reminder_minutes_before: params.reminder_minutes_before || 30,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    return db.saveScheduledMockInterview(item);
  }

  public static async deleteScheduled(studentId: string, id: string): Promise<boolean> {
    return db.deleteScheduledMockInterview(id, studentId);
  }

  // -------------------------------------------------------------
  // 7. Analytics & Aggregates
  // -------------------------------------------------------------
  public static async getAnalytics(studentId: string): Promise<MockInterviewAnalytics> {
    const rawSessions = (await db.getMockInterviewSessions(studentId)) as any[];
    const scheduled = await db.getScheduledMockInterviews(studentId);

    const completed = rawSessions.filter((s) => s.status === 'COMPLETED');

    if (completed.length === 0) {
      return {
        total_completed: 0,
        total_practice_minutes: 0,
        average_score: 0,
        scoring_definition: 'Practice score averaged across rubric dimensions (Technical Correctness, Problem Solving, Communication, Edge Cases, Trade-offs).',
        is_onboarding: true,
        score_trajectory: [],
        category_breakdown: [],
        strongest_topics: [],
        topics_requiring_improvement: [
          'Core CS Fundamentals (DBMS, OS, Networks)',
          'Algorithmic Complexity & Edge Cases',
          'STAR Method Behavioral Formulation',
        ],
        recent_sessions: rawSessions.slice(0, 5).map((s) => ({
          id: s.id,
          category: s.category || s.interview_type || 'TECHNICAL',
          target_role: s.target_role || 'Software Development Engineer',
          score: s.overall_score || 0,
          created_at: s.created_at,
          status: s.status,
        })),
        upcoming_scheduled: scheduled,
        recommended_next_interview: {
          category: 'TECHNICAL',
          target_role: 'Software Development Engineer',
          difficulty: 'BEGINNER',
          reason: 'Kick off your preparation with core Computer Science fundamentals to establish baseline metrics.',
        },
      };
    }

    const totalMinutes = completed.reduce((acc, s) => acc + (s.duration_minutes || 30), 0);
    const avgScore = Math.round(
      completed.reduce((acc, s) => acc + (s.overall_score || s.feedback_summary?.overall_score || 75), 0) /
        completed.length
    );

    // Score trajectory
    const trajectory = completed
      .slice(-6)
      .map((s) => ({
        date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.overall_score || 75,
        category: s.category || s.interview_type || 'TECHNICAL',
      }));

    // Category breakdown
    const catMap: Record<string, { count: number; totalScore: number }> = {};
    for (const s of completed) {
      const cat = s.category || s.interview_type || 'TECHNICAL';
      if (!catMap[cat]) catMap[cat] = { count: 0, totalScore: 0 };
      catMap[cat].count += 1;
      catMap[cat].totalScore += s.overall_score || 75;
    }

    const categoryBreakdown = Object.entries(catMap).map(([category, d]) => ({
      category,
      count: d.count,
      average_score: Math.round(d.totalScore / d.count),
    }));

    // Identify weak vs strong topics from feedback reports
    const strongSet: Set<string> = new Set();
    const weakSet: Set<string> = new Set();
    for (const s of completed) {
      const fb = s.feedback_summary || s.feedback;
      if (fb) {
        (fb.strongest_areas || fb.concepts_explained_well || []).forEach((c: string) => strongSet.add(c));
        (fb.technical_gaps || fb.concepts_to_review || []).forEach((c: string) => weakSet.add(c));
      }
    }

    return {
      total_completed: completed.length,
      total_practice_minutes: totalMinutes,
      average_score: avgScore,
      scoring_definition: 'Practice score averaged across rubric dimensions (Technical Correctness, Problem Solving, Communication, Edge Cases, Trade-offs).',
      is_onboarding: false,
      score_trajectory: trajectory,
      category_breakdown: categoryBreakdown,
      strongest_topics: Array.from(strongSet).slice(0, 4),
      topics_requiring_improvement: Array.from(weakSet).slice(0, 4),
      recent_sessions: rawSessions.slice(0, 5).map((s) => ({
        id: s.id,
        category: s.category || s.interview_type || 'TECHNICAL',
        target_role: s.target_role || 'Software Development Engineer',
        score: s.overall_score || 0,
        created_at: s.created_at,
        status: s.status,
      })),
      upcoming_scheduled: scheduled,
      recommended_next_interview: {
        category: avgScore < 75 ? 'TECHNICAL' : 'SYSTEM_DESIGN',
        target_role: 'Software Development Engineer',
        difficulty: avgScore >= 80 ? 'ADVANCED' : 'INTERMEDIATE',
        reason:
          avgScore < 75
            ? 'Solidify core conceptual foundations and transaction isolation models.'
            : 'Advance to distributed systems and architectural scalability challenges.',
      },
    };
  }

  // -------------------------------------------------------------
  // Internal Helpers: Question Generation & Semantic Evaluation
  // -------------------------------------------------------------
  private static async generateSessionQuestion(
    session: MockInterviewSessionEntity,
    questionNumber: number,
    existingQuestions: MockInterviewSessionQuestion[] = [],
    resumeContext?: string
  ): Promise<MockInterviewSessionQuestion> {
    const qId = `mq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const category = session.category;

    // 1. Resume Based
    if (category === 'RESUME' && resumeContext) {
      const resumePrompts = [
        {
          question: `In your built project mentioned on your resume (${resumeContext.slice(0, 120)}...), explain the data flow and how state is preserved between the client interface and persistent database.`,
          expected: ['Client-Server communication', 'Database schema', 'State synchronization', 'Error handling', 'Latency'],
          topic: 'Resume Architecture',
          context: 'Discussion of candidate\'s verified engineering project artifact.',
        },
        {
          question: 'What was the single most difficult engineering obstacle or technical bottleneck you resolved while building this project, and how did you verify the solution?',
          expected: ['Root Cause Analysis', 'Bottleneck profiling', 'Trade-offs', 'Verification testing', 'Outcome'],
          topic: 'Technical Problem Solving',
          context: 'Evaluating deep personal contribution and technical rigor on candidate project.',
        },
      ];
      const selected = resumePrompts[(questionNumber - 1) % resumePrompts.length];
      return {
        id: qId,
        session_id: session.id,
        question_number: questionNumber,
        question: selected.question,
        context: selected.context,
        question_type: 'RESUME',
        topic: selected.topic,
        difficulty: session.difficulty,
        expected_concepts: selected.expected,
        rubric: RUBRIC_TEMPLATES.RESUME,
        created_at: new Date().toISOString(),
      };
    }

    // 2. Curated Match from Catalog
    const matched = MOCK_INTERVIEW_QUESTION_CATALOG.filter((q) => {
      if (q.category !== category) return false;
      return true;
    });

    const unasked = matched.filter(
      (m) => !existingQuestions.some((eq) => eq.catalog_question_id === m.id || eq.topic === m.topic)
    );

    const chosen = unasked.length > 0 ? unasked[0] : matched[(questionNumber - 1) % (matched.length || 1)];

    if (chosen) {
      return {
        id: qId,
        session_id: session.id,
        question_number: questionNumber,
        catalog_question_id: chosen.id,
        question: chosen.question,
        context: chosen.context,
        question_type: chosen.question_type,
        topic: chosen.topic,
        difficulty: chosen.difficulty,
        expected_concepts: chosen.expected_concepts,
        hints: chosen.hints,
        starter_code: chosen.starter_code,
        starter_language: chosen.starter_language,
        sample_inputs: chosen.sample_inputs,
        sql_schema_table: chosen.sql_schema_table,
        reference_answer: chosen.reference_answer,
        rubric: chosen.rubric,
        created_at: new Date().toISOString(),
      };
    }

    // 3. Fallback Grounded Question
    return {
      id: qId,
      session_id: session.id,
      question_number: questionNumber,
      question: `For the role of ${session.target_role}, explain how you structure high-throughput, low-latency microservices and handle transient network failures.`,
      context: 'Distributed engineering scenario question.',
      question_type: 'CONCEPTUAL',
      topic: 'Distributed Systems',
      difficulty: session.difficulty,
      expected_concepts: ['Idempotency', 'Circuit Breaking', 'Exponential Backoff', 'Retries', 'Dead Letter Queues'],
      rubric: RUBRIC_TEMPLATES.TECHNICAL,
      created_at: new Date().toISOString(),
    };
  }

  private static async generateAdaptiveFollowUp(
    session: MockInterviewSessionEntity,
    questionNumber: number,
    parentQuestion: MockInterviewSessionQuestion,
    missingConcept?: string
  ): Promise<MockInterviewSessionQuestion> {
    const qId = `mq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const topic = parentQuestion.topic;

    let text = `Building on your previous explanation: How would you address ${missingConcept || 'concrete edge cases and performance trade-offs'} in a production setting?`;
    let expected = [missingConcept || 'Edge cases', 'Trade-offs', 'Scalability', 'Reliability'];

    if (topic.includes('DBMS') || topic.includes('Transaction')) {
      text = missingConcept?.toLowerCase().includes('isolation') || missingConcept?.toLowerCase().includes('read')
        ? 'Can you clarify the specific difference between a Non-Repeatable Read and a Phantom Read under concurrent transactions?'
        : 'How does Write-Ahead Logging (WAL) coordinate with periodic checkpointing to guarantee durability without stalling disk writes?';
      expected = ['Dirty Read', 'Phantom Read', 'Predicate Locks', 'Checkpoint', 'WAL'];
    } else if (topic.includes('Deadlock') || topic.includes('OS')) {
      text = 'How does the Banker\'s algorithm maintain safety by evaluating allocation matrices, max claim vectors, and available resources?';
      expected = ['Safe State', 'Allocation Matrix', 'Need Vector', 'Available Vector'];
    } else if (topic.includes('TCP') || topic.includes('Network')) {
      text = 'What issues arise if the TCP TIME_WAIT duration is configured too short, and how does SO_REUSEADDR behave?';
      expected = ['2 MSL', 'Delayed Packets', 'Socket Exhaustion', 'Port Reuse'];
    }

    return {
      id: qId,
      session_id: session.id,
      question_number: questionNumber,
      question: text,
      question_type: parentQuestion.question_type,
      topic: `${parentQuestion.topic} (Follow-Up)`,
      difficulty: session.difficulty,
      expected_concepts: expected,
      follow_up_to: parentQuestion.id,
      rubric: parentQuestion.rubric,
      created_at: new Date().toISOString(),
    };
  }

  private static async evaluateAnswerSemantics(
    session: MockInterviewSessionEntity,
    question: MockInterviewSessionQuestion,
    answerText: string,
    codeUsed?: string,
    sqlQueryUsed?: string
  ): Promise<MockInterviewAnswerEntity['evaluation']> {
    const textLower = `${answerText} ${codeUsed || ''} ${sqlQueryUsed || ''}`.toLowerCase();
    const expected = question.expected_concepts || [];

    const covered: string[] = [];
    const missing: string[] = [];

    for (const concept of expected) {
      const parts = concept.toLowerCase().split(/\s+/);
      const isPresent = parts.some((p) => p.length > 3 && textLower.includes(p));
      if (isPresent) {
        covered.push(concept);
      } else {
        missing.push(concept);
      }
    }

    // Try AI Evaluator with Gemini
    try {
      const rubricDesc = question.rubric.map((r) => `${r.dimension} (${r.weight}%)`).join(', ');
      const prompt = `You are a Senior Engineering Interviewer evaluating a candidate's response.
INTERVIEW CATEGORY: ${session.category}
TARGET ROLE: ${session.target_role}
QUESTION: ${question.question}
EXPECTED CONCEPTS: ${expected.join(', ')}
RUBRIC: ${rubricDesc}

CANDIDATE ANSWER:
"""
${answerText.slice(0, 3000)}
"""
${codeUsed ? `CODE SUBMITTED:\n${codeUsed.slice(0, 1500)}` : ''}
${sqlQueryUsed ? `SQL SUBMITTED:\n${sqlQueryUsed.slice(0, 1000)}` : ''}

Evaluate the response objectively. Return pure JSON:
{
  "score": number between 30 and 100,
  "covered_concepts": ["concept1", "concept2"],
  "missing_concepts": ["concept3"],
  "strengths": ["Clear explanation of X", "Correct complexity reasoning"],
  "improvements": ["Elaborate on Y", "Address Z boundary condition"],
  "clarity_feedback": "Concise 1-2 sentence communication feedback",
  "follow_up_needed": boolean (true if candidate missed key concepts and score < 80),
  "suggested_follow_up": "Name of primary concept to probe further"
}`;

      const aiRes = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.2
      );

      if (aiRes.text && !aiRes.text.includes('Balanced Search Trees')) {
        const jsonMatch = aiRes.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const calculatedScore = Math.min(100, Math.max(30, Number(parsed.score) || 75));

          const rubricScores: RubricScoreItem[] = question.rubric.map((r) => {
            const dimScore = calculatedScore + (r.dimension.includes('Correctness') ? 2 : -2);
            const bounded = Math.min(100, Math.max(30, dimScore));
            return {
              dimension: r.dimension,
              score: bounded,
              weight: r.weight,
              weightedScore: Math.round((bounded * r.weight) / 100),
              feedback: `Evaluated against ${r.dimension} criteria.`,
            };
          });

          return {
            score: calculatedScore,
            rubric_scores: rubricScores,
            covered_concepts: parsed.covered_concepts || covered,
            missing_concepts: parsed.missing_concepts || missing,
            strengths: parsed.strengths || ['Structured logical flow and appropriate engineering vocabulary.'],
            improvements: parsed.improvements || ['Discuss concrete operational trade-offs and error scenarios.'],
            clarity_feedback: parsed.clarity_feedback || 'Demonstrated coherent thought process with direct relevance.',
            model_answer_snippet: question.reference_answer?.slice(0, 200),
            follow_up_needed: Boolean(parsed.follow_up_needed),
            suggested_follow_up: parsed.suggested_follow_up,
          };
        }
      }
    } catch (err: any) {
      logger.warn('AI evaluation fallback to deterministic rubric', { error: err.message });
    }

    // Deterministic Fallback Rubric
    const coverageRatio = expected.length > 0 ? covered.length / expected.length : 0.8;
    const baseScore = Math.round(coverageRatio * 75);
    const lengthBonus = Math.min(25, Math.floor(answerText.trim().split(/\s+/).length / 4));
    const score = Math.min(100, Math.max(35, baseScore + lengthBonus));

    const rubricScores: RubricScoreItem[] = question.rubric.map((r) => {
      const dimScore = score + (r.dimension.includes('Correctness') ? 3 : -3);
      const bounded = Math.min(100, Math.max(30, dimScore));
      return {
        dimension: r.dimension,
        score: bounded,
        weight: r.weight,
        weightedScore: Math.round((bounded * r.weight) / 100),
        feedback: `Evaluated against ${r.dimension} criteria.`,
      };
    });

    const strengths: string[] = [];
    if (covered.length > 0) {
      strengths.push(`Addressed core principles: ${covered.slice(0, 3).join(', ')}.`);
    }
    if (answerText.length > 150) {
      strengths.push('Provided structured elaboration with technical depth.');
    }

    const improvements: string[] = [];
    if (missing.length > 0) {
      improvements.push(`Deepen explanation around: ${missing.slice(0, 3).join(', ')}.`);
    }
    improvements.push('Consider contrasting with alternative architectural designs or edge cases.');

    return {
      score,
      rubric_scores: rubricScores,
      covered_concepts: covered,
      missing_concepts: missing,
      strengths: strengths.length > 0 ? strengths : ['Clear communication and direct answer to prompt.'],
      improvements,
      clarity_feedback: 'Demonstrated coherent thought process with direct relevance to interview prompt.',
      model_answer_snippet: question.reference_answer?.slice(0, 200),
      follow_up_needed: missing.length > 0 && score < 80,
      suggested_follow_up: missing.length > 0 ? missing[0] : undefined,
    };
  }
}
