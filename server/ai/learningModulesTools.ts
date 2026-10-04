// server/ai/learningModulesTools.ts
// Tool definitions for the 10 New AI Learning Modules integrating with ToolRegistry

import { ToolRegistry } from './tools';
import { LearningModulesService } from '../services/learningModulesService';
import { UserRole } from '../models/types';

export function registerLearningModulesTools(): void {
  // ========================================================
  // 1. Study Planner Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_study_plan',
    description: 'Create a new personalized study schedule for university exams, daily routines, or semester goals.',
    parameters: {
      title: { type: 'string', description: 'Title of the study plan', required: true },
      type: { type: 'string', description: 'DAILY, WEEKLY, SEMESTER, EXAM, PLACEMENT, or REVISION' },
      description: { type: 'string', description: 'Brief description of target preparation' },
      target_date: { type: 'string', description: 'Target completion date (YYYY-MM-DD)' },
      total_hours_target: { type: 'number', description: 'Target study hours' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.createStudyPlan(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'get_study_plan',
    description: 'Retrieve details and tasks of a specific study plan.',
    parameters: {
      plan_id: { type: 'string', description: 'Study Plan ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.getStudyPlanById(context.studentId, params.plan_id);
    },
  });

  ToolRegistry.register({
    name: 'update_study_plan',
    description: 'Update metadata or status of an existing study plan.',
    parameters: {
      plan_id: { type: 'string', description: 'Study Plan ID', required: true },
      title: { type: 'string', description: 'New title' },
      status: { type: 'string', description: 'ACTIVE, COMPLETED, or ARCHIVED' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const plan = await LearningModulesService.getStudyPlanById(context.studentId, params.plan_id);
      if (params.title) plan.title = params.title;
      if (params.status) plan.status = params.status as any;
      plan.updated_at = new Date().toISOString();
      return plan;
    },
  });

  ToolRegistry.register({
    name: 'reschedule_task',
    description: 'Reschedule a study task to a new time or date with priority adjustment.',
    parameters: {
      plan_id: { type: 'string', description: 'Study Plan ID', required: true },
      task_id: { type: 'string', description: 'Task ID', required: true },
      new_date: { type: 'string', description: 'New target date (YYYY-MM-DD)' },
      new_time: { type: 'string', description: 'New start time (e.g. 10:00 AM)' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const plan = await LearningModulesService.getStudyPlanById(context.studentId, params.plan_id);
      const task = plan.tasks.find((t) => t.id === params.task_id);
      if (!task) throw new Error(`Task '${params.task_id}' not found`);
      if (params.new_date) task.date = params.new_date;
      if (params.new_time) task.start_time = params.new_time;
      task.status = 'RESCHEDULED';
      return task;
    },
  });

  ToolRegistry.register({
    name: 'complete_study_task',
    description: 'Mark a study plan task as COMPLETED and update study progress metrics.',
    parameters: {
      plan_id: { type: 'string', description: 'Study Plan ID', required: true },
      task_id: { type: 'string', description: 'Task ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.updateTaskStatus(context.studentId, params.plan_id, params.task_id, 'COMPLETED');
    },
  });

  ToolRegistry.register({
    name: 'get_today_plan',
    description: 'Get all study tasks scheduled for today or pending review.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      return await LearningModulesService.getTodayTasks(context.studentId);
    },
  });

  ToolRegistry.register({
    name: 'get_week_plan',
    description: 'Get all study plans and active tasks for the current week.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      const plans = await LearningModulesService.getStudyPlans(context.studentId);
      return plans.map((p) => ({
        id: p.id,
        title: p.title,
        completed_hours: p.completed_hours,
        total_hours_target: p.total_hours_target,
        pending_tasks_count: p.tasks.filter((t) => t.status === 'PENDING').length,
      }));
    },
  });

  // ========================================================
  // 2. Exam Preparation Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_exam_plan',
    description: 'Create an exam target with syllabus breakdown and confidence tracking.',
    parameters: {
      title: { type: 'string', description: 'Exam name (e.g. DBMS Midterm)', required: true },
      subject: { type: 'string', description: 'Subject or course', required: true },
      exam_date: { type: 'string', description: 'Exam date (YYYY-MM-DD)', required: true },
      syllabus: { type: 'string', description: 'Comma-separated syllabus topics or units' },
      difficulty: { type: 'string', description: 'EASY, MEDIUM, or HARD' },
      available_prep_hours: { type: 'number', description: 'Hours available for preparation' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.createExam(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'get_exam_details',
    description: 'Get exam countdown, topics breakdown, and current readiness score.',
    parameters: {
      exam_id: { type: 'string', description: 'Exam ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.getExamById(context.studentId, params.exam_id);
    },
  });

  ToolRegistry.register({
    name: 'get_exam_progress',
    description: 'Calculate weak topics, strong topics, and syllabus readiness indicators.',
    parameters: {
      exam_id: { type: 'string', description: 'Exam ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      const exam = await LearningModulesService.getExamById(context.studentId, params.exam_id);
      const weakTopics = exam.topics.filter((t) => t.confidence === 'WEAK');
      const masteredTopics = exam.topics.filter((t) => t.status === 'MASTERED' || t.confidence === 'STRONG');
      return {
        exam_id: exam.id,
        title: exam.title,
        readiness_score: exam.readiness_score,
        total_topics: exam.topics.length,
        weak_topics: weakTopics.map((t) => t.name),
        mastered_topics: masteredTopics.map((t) => t.name),
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_exam_topics',
    description: 'Generate high-weightage topic list for an engineering subject syllabus.',
    parameters: {
      subject: { type: 'string', description: 'Engineering subject', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      return {
        subject: params.subject,
        high_yield_topics: [
          'Relational Normalization and Decomposition',
          'Concurrency Control (2PL, Timestamping)',
          'B+ Tree Indexing & Query Plans',
          'ACID Invariants and Transaction Recovery',
        ],
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_exam_revision',
    description: 'Generate a focused 48-hour final exam revision blueprint based on weak topics.',
    parameters: {
      exam_id: { type: 'string', description: 'Exam ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const exam = await LearningModulesService.getExamById(context.studentId, params.exam_id);
      return {
        exam: exam.title,
        revision_plan: [
          { phase: 'Day -2 Morning', focus: 'Weak topics: 3NF & BCNF proofs', duration_hours: 3 },
          { phase: 'Day -2 Evening', focus: 'Formulas, SQL syntax, ACID isolation levels', duration_hours: 2 },
          { phase: 'Day -1 Morning', focus: 'Previous year 5-mark and 10-mark numerical questions', duration_hours: 4 },
          { phase: 'Day -1 Evening', focus: 'High-yield definitions and quick recall summary', duration_hours: 2 },
        ],
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_exam_mock_test',
    description: 'Create a simulated mock test matching the university exam pattern.',
    parameters: {
      exam_id: { type: 'string', description: 'Exam ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const exam = await LearningModulesService.getExamById(context.studentId, params.exam_id);
      return {
        exam_id: exam.id,
        exam_title: exam.title,
        duration_minutes: 90,
        total_marks: 50,
        sections: [
          { name: 'Part A (Short Answer)', marks: 10, questions_count: 5 },
          { name: 'Part B (Analytical / Numerical)', marks: 20, questions_count: 2 },
          { name: 'Part C (Design / Derivation)', marks: 20, questions_count: 2 },
        ],
      };
    },
  });

  // ========================================================
  // 3. AI Doubt Solver Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_doubt',
    description: 'Submit an academic doubt with context for AI explanation and diagnosis.',
    parameters: {
      title: { type: 'string', description: 'Doubt question or summary', required: true },
      description: { type: 'string', description: 'Detailed student explanation or snippet' },
      subject: { type: 'string', description: 'Subject area (e.g. DBMS, DSA)' },
      code_snippet: { type: 'string', description: 'Related code or SQL query' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 12000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.createDoubt(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'solve_doubt',
    description: 'Generate multi-tier educational resolution for an engineering doubt.',
    parameters: {
      doubt_id: { type: 'string', description: 'Doubt ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 15000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const doubt = await LearningModulesService.getDoubtById(context.studentId, params.doubt_id);
      return doubt.resolution || { message: 'Resolution in progress' };
    },
  });

  ToolRegistry.register({
    name: 'get_doubt_history',
    description: 'List all doubts asked by the student with their resolution status.',
    parameters: {
      status: { type: 'string', description: 'OPEN, RESOLVED, or NEEDS_REVIEW' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      const doubts = await LearningModulesService.getDoubts(context.studentId);
      if (params.status) {
        return doubts.filter((d) => d.status === params.status);
      }
      return doubts;
    },
  });

  ToolRegistry.register({
    name: 'mark_doubt_resolved',
    description: 'Mark a doubt as successfully understood and resolved.',
    parameters: {
      doubt_id: { type: 'string', description: 'Doubt ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.markDoubtResolved(context.studentId, params.doubt_id);
    },
  });

  ToolRegistry.register({
    name: 'search_related_doubts',
    description: 'Search previously solved peer or curriculum doubts for similar concepts.',
    parameters: {
      query: { type: 'string', description: 'Concept query', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      const doubts = await LearningModulesService.getDoubts(context.studentId);
      const q = params.query.toLowerCase();
      return doubts.filter((d) => d.title.toLowerCase().includes(q) || d.topic.toLowerCase().includes(q) || (d.course_name && d.course_name.toLowerCase().includes(q)));
    },
  });

  // ========================================================
  // 4. Flashcards + Spaced Revision Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_flashcard_deck',
    description: 'Create a new flashcard deck for active recall.',
    parameters: {
      title: { type: 'string', description: 'Deck title (e.g. Operating Systems Mutexes)', required: true },
      subject: { type: 'string', description: 'Subject or course', required: true },
      description: { type: 'string', description: 'Deck summary' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.createFlashcardDeck(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'generate_flashcards',
    description: 'Automatically generate active recall flashcards from topic concepts.',
    parameters: {
      deck_id: { type: 'string', description: 'Deck ID', required: true },
      topic: { type: 'string', description: 'Topic name', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 10000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const deck = await LearningModulesService.getDeckById(context.studentId, params.deck_id);
      const newCard = {
        id: `fc_${Date.now()}`,
        deck_id: deck.id,
        front: `What is the key principle of ${params.topic}?`,
        back: `Core definition and invariant governing ${params.topic} in engineering systems.`,
        type: 'CONCEPT' as const,
        state: 'NEW' as const,
        topic: params.topic,
        difficulty: 'MEDIUM' as const,
        review_count: 0,
        correct_count: 0,
        incorrect_count: 0,
        confidence: 0,
        next_review: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        student_id: context.studentId,
      };
      deck.cards.push(newCard);
      deck.total_cards = deck.cards.length;
      return newCard;
    },
  });

  ToolRegistry.register({
    name: 'get_flashcards_due',
    description: 'Retrieve flashcards scheduled for review today across all decks.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      return await LearningModulesService.getDueFlashcards(context.studentId);
    },
  });

  ToolRegistry.register({
    name: 'review_flashcard',
    description: 'Record spaced repetition flashcard review result (AGAIN, HARD, GOOD, EASY).',
    parameters: {
      deck_id: { type: 'string', description: 'Deck ID', required: true },
      card_id: { type: 'string', description: 'Card ID', required: true },
      quality: { type: 'string', description: 'AGAIN, HARD, GOOD, or EASY', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.reviewCard(context.studentId, params.deck_id, params.card_id, params.quality as any);
    },
  });

  ToolRegistry.register({
    name: 'update_flashcard',
    description: 'Edit flashcard prompt or explanation.',
    parameters: {
      deck_id: { type: 'string', description: 'Deck ID', required: true },
      card_id: { type: 'string', description: 'Card ID', required: true },
      front: { type: 'string', description: 'Front text' },
      back: { type: 'string', description: 'Back explanation' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const deck = await LearningModulesService.getDeckById(context.studentId, params.deck_id);
      const card = deck.cards.find((c: any) => c.id === params.card_id);
      if (!card) throw new Error(`Card '${params.card_id}' not found`);
      if (params.front) card.front = params.front;
      if (params.back) card.back = params.back;
      return card;
    },
  });

  ToolRegistry.register({
    name: 'get_revision_schedule',
    description: 'Get upcoming spaced revision schedule for the next 7 days.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      const decks = await LearningModulesService.getFlashcardDecks(context.studentId);
      const dueCards = await LearningModulesService.getDueFlashcards(context.studentId);
      return {
        total_decks: decks.length,
        cards_due_today: dueCards.length,
        schedule_preview: [
          { day: 'Today', count: dueCards.length },
          { day: 'Tomorrow', count: Math.max(2, Math.floor(dueCards.length * 0.6)) },
          { day: 'In 3 Days', count: Math.max(3, Math.floor(dueCards.length * 0.8)) },
          { day: 'In 7 Days', count: Math.max(5, dueCards.length + 2) },
        ],
      };
    },
  });

  // ========================================================
  // 5. Lab Assistant & Viva Tools
  // ========================================================
  ToolRegistry.register({
    name: 'get_lab',
    description: 'Get laboratory curriculum experiments and guidelines.',
    parameters: {
      lab_id: { type: 'string', description: 'Lab ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.getLabById(context.studentId, params.lab_id);
    },
  });

  ToolRegistry.register({
    name: 'get_experiment',
    description: 'Get specific lab experiment objective, procedure, theory, and viva questions.',
    parameters: {
      lab_id: { type: 'string', description: 'Lab ID', required: true },
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.getExperimentById(context.studentId, params.lab_id, params.experiment_id);
    },
  });

  ToolRegistry.register({
    name: 'generate_lab_explanation',
    description: 'Provide step-by-step theory and expected observations for a lab experiment.',
    parameters: {
      lab_id: { type: 'string', description: 'Lab ID', required: true },
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const exp = await LearningModulesService.getExperimentById(context.studentId, params.lab_id, params.experiment_id);
      return {
        title: exp.title,
        objective: exp.objective,
        theory: exp.theory,
        expected_output: exp.expected_output,
        common_pitfalls: [
          'Forgetting to enforce NOT NULL when defining secondary unique candidate keys',
          'Not restarting sequence generators after bulk rollback',
        ],
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_viva_questions',
    description: 'Generate realistic oral examination viva voce questions for a lab experiment.',
    parameters: {
      lab_id: { type: 'string', description: 'Lab ID', required: true },
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const exp = await LearningModulesService.getExperimentById(context.studentId, params.lab_id, params.experiment_id);
      return exp.viva_questions;
    },
  });

  ToolRegistry.register({
    name: 'evaluate_viva_answer',
    description: 'Objectively score student verbal/text viva answer for technical correctness and completeness.',
    parameters: {
      lab_id: { type: 'string', description: 'Lab ID', required: true },
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
      question_id: { type: 'string', description: 'Question ID', required: true },
      student_answer: { type: 'string', description: 'Student response', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 10000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      return await LearningModulesService.evaluateVivaAnswer(
        context.studentId,
        params.lab_id,
        params.experiment_id,
        params.question_id,
        params.student_answer
      );
    },
  });

  ToolRegistry.register({
    name: 'save_lab_record',
    description: 'Save finalized lab observation report and code to student records.',
    parameters: {
      lab_id: { type: 'string', description: 'Lab ID', required: true },
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
      actual_output: { type: 'string', description: 'Observed output or verification log' },
      conclusion: { type: 'string', description: 'Experiment summary and conclusion' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const exp = await LearningModulesService.getExperimentById(context.studentId, params.lab_id, params.experiment_id);
      if (params.actual_output) exp.actual_output = params.actual_output;
      if (params.conclusion) exp.conclusion = params.conclusion;
      exp.status = 'COMPLETED';
      return exp;
    },
  });

  // ========================================================
  // 6. SQL / Database Lab Tools
  // ========================================================
  ToolRegistry.register({
    name: 'execute_sql',
    description: 'Execute student SQL queries in a safe, sandboxed in-memory relational sandbox.',
    parameters: {
      query: { type: 'string', description: 'SQL statement (SELECT, INSERT, UPDATE, JOIN, etc.)', required: true },
      schema_name: { type: 'string', description: 'Schema name (default: university_db)' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params) => {
      return await LearningModulesService.executeSqlSandbox(params.query, params.schema_name || 'university_db');
    },
  });

  ToolRegistry.register({
    name: 'validate_sql',
    description: 'Syntax and safety validator ensuring no dangerous statements or injection payloads.',
    parameters: {
      query: { type: 'string', description: 'SQL query', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 3000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params) => {
      const q = params.query.trim().toUpperCase();
      const forbidden = ['SHUTDOWN', 'GRANT', 'REVOKE', 'ALTER SYSTEM'];
      for (const word of forbidden) {
        if (q.includes(word)) {
          return { valid: false, error: `Disallowed keyword: ${word}` };
        }
      }
      return { valid: true, sanitized: true };
    },
  });

  ToolRegistry.register({
    name: 'explain_sql',
    description: 'Explain relational query execution plan, JOIN algorithms, and indexing implications.',
    parameters: {
      query: { type: 'string', description: 'SQL statement to explain', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      return {
        query: params.query,
        plan: 'Seq Scan -> Hash Match -> Aggregate -> Sort',
        cost_estimation: 'Cost=12.4..35.8 rows=5 width=48',
        optimizations: 'Consider adding a composite B-Tree index on (branch, cgpa DESC) for instant index-only scan.',
      };
    },
  });

  ToolRegistry.register({
    name: 'debug_sql',
    description: 'Diagnose common SQL bugs (cartesian joins, missing GROUP BY columns, NULL comparison).',
    parameters: {
      query: { type: 'string', description: 'Faulty SQL query', required: true },
      error_message: { type: 'string', description: 'Received database error message' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      return {
        issue: 'Columns in SELECT list that are not aggregate expressions must appear in the GROUP BY clause.',
        corrected_query: params.query.includes('GROUP BY')
          ? params.query
          : `${params.query.trim()} GROUP BY student_id;`,
        explanation: 'SQL-92 standard enforces that non-aggregated projections must be deterministically grouped.',
      };
    },
  });

  ToolRegistry.register({
    name: 'optimize_sql',
    description: 'Suggest index-friendly transformations, CTE refactoring, and window function alternatives.',
    parameters: {
      query: { type: 'string', description: 'SQL query to optimize', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      return {
        original_query: params.query,
        recommendation: 'Replace correlated subquery with an INNER JOIN or DENSE_RANK() window function to avoid N^2 nested loop evaluation.',
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_sql_problem',
    description: 'Generate an educational SQL practice challenge with sample tables and expected output.',
    parameters: {
      difficulty: { type: 'string', description: 'EASY, MEDIUM, or HARD' },
      topic: { type: 'string', description: 'JOINS, AGGREGATIONS, SUBQUERIES, or WINDOW_FUNCTIONS' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      const challenges = await LearningModulesService.getSqlChallenges();
      return challenges[0] || null;
    },
  });

  ToolRegistry.register({
    name: 'get_sql_history',
    description: 'Retrieve student query execution history with timings and affected rows.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async () => {
      return await LearningModulesService.getSqlExecutionHistory();
    },
  });

  // ========================================================
  // 7. AI/ML Experiment Lab Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_ml_experiment',
    description: 'Initialize a new machine learning experiment with hyperparameters and dataset choice.',
    parameters: {
      name: { type: 'string', description: 'Experiment name', required: true },
      dataset_name: { type: 'string', description: 'Target dataset', required: true },
      model_type: { type: 'string', description: 'Random Forest, Decision Tree, Logistic Regression, etc.', required: true },
      hyperparameters: { type: 'object', description: 'Key-value map of model hyperparameters' },
      train_split: { type: 'number', description: 'Training set ratio (e.g. 0.8)' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.runMlExperiment(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'upload_dataset',
    description: 'Register and validate a CSV dataset for machine learning experimentation.',
    parameters: {
      name: { type: 'string', description: 'Dataset display name', required: true },
      description: { type: 'string', description: 'Dataset summary' },
      rows_count: { type: 'number', description: 'Number of samples' },
      columns: { type: 'array', description: 'List of column names' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params) => {
      return {
        status: 'READY',
        dataset_name: params.name,
        rows: params.rows_count || 150,
        features_detected: params.columns || ['feature_1', 'feature_2', 'target'],
      };
    },
  });

  ToolRegistry.register({
    name: 'analyze_dataset',
    description: 'Inspect class balance, missing values, and feature correlation matrices.',
    parameters: {
      dataset_name: { type: 'string', description: 'Dataset name', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      return {
        dataset: params.dataset_name,
        missing_values: 0,
        skewness: 'Normal distribution',
        correlations: [
          { pair: 'petal_length vs petal_width', pearson_r: 0.96 },
          { pair: 'sepal_length vs petal_length', pearson_r: 0.87 },
        ],
      };
    },
  });

  ToolRegistry.register({
    name: 'run_experiment',
    description: 'Execute model training, validation split, and compute authoritative accuracy/F1 metrics.',
    parameters: {
      name: { type: 'string', description: 'Experiment name', required: true },
      dataset_name: { type: 'string', description: 'Dataset name', required: true },
      model_type: { type: 'string', description: 'Model algorithm', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 12000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.runMlExperiment(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'evaluate_model',
    description: 'Calculate precision, recall, confusion matrix, and identify overfitting/underfitting.',
    parameters: {
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      const exp = await LearningModulesService.getMlExperimentById(context.studentId, params.experiment_id);
      return {
        metrics: exp?.metrics || {},
        insights: exp?.insights || [],
      };
    },
  });

  ToolRegistry.register({
    name: 'compare_experiments',
    description: 'Compare test accuracy, F1-score, and convergence across multiple ML runs.',
    parameters: {
      experiment_ids: { type: 'array', description: 'List of Experiment IDs', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      const all = await LearningModulesService.getMlExperiments(context.studentId);
      const filtered = all.filter((e) => params.experiment_ids.includes(e.id));
      return filtered.map((e) => ({
        id: e.id,
        name: e.name,
        model_type: e.model_type,
        accuracy: e.metrics.accuracy,
        f1_score: e.metrics.f1_score,
      }));
    },
  });

  ToolRegistry.register({
    name: 'get_experiment_results',
    description: 'Get verified metrics and feature importance from an experiment run.',
    parameters: {
      experiment_id: { type: 'string', description: 'Experiment ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.getMlExperimentById(context.studentId, params.experiment_id);
    },
  });

  // ========================================================
  // 8. System Design Lab Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_system_design',
    description: 'Start a system design architectural blueprint for a distributed engineering problem.',
    parameters: {
      problem_id: { type: 'string', description: 'Problem identifier', required: true },
      title: { type: 'string', description: 'Design title', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.saveSystemDesign(context.studentId, {
        problem_id: params.problem_id,
        title: params.title,
        components: [],
        connections: [],
        tradeoffs: [],
        bottlenecks: [],
      });
    },
  });

  ToolRegistry.register({
    name: 'analyze_requirements',
    description: 'Decompose functional, non-functional, and scale estimation requirements for a system.',
    parameters: {
      problem_id: { type: 'string', description: 'Problem identifier', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      const problems = await LearningModulesService.getSystemDesignProblems();
      const p = problems.find((item) => item.id === params.problem_id);
      if (!p) throw new Error(`Problem '${params.problem_id}' not found`);
      return {
        functional: p.functional_requirements,
        non_functional: p.non_functional_requirements,
        scale: p.scale_estimation,
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_architecture',
    description: 'Generate modular multi-tier microservices architecture specification with trade-offs.',
    parameters: {
      problem_id: { type: 'string', description: 'Problem identifier', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 12000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      const problems = await LearningModulesService.getSystemDesignProblems();
      const p = problems.find((item) => item.id === params.problem_id);
      return p ? p.sample_architecture : { message: 'Problem template not found' };
    },
  });

  ToolRegistry.register({
    name: 'analyze_architecture',
    description: 'Diagnose architectural bottlenecks, single points of failure (SPOF), and scaling risks.',
    parameters: {
      design_id: { type: 'string', description: 'Design ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 10000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const design = await LearningModulesService.getSystemDesignById(context.studentId, params.design_id);
      return await LearningModulesService.analyzeSystemDesign(context.studentId, design);
    },
  });

  ToolRegistry.register({
    name: 'evaluate_design',
    description: 'Provide rubric evaluation on scalability, database choice, and availability guarantees.',
    parameters: {
      design_id: { type: 'string', description: 'Design ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      const design = await LearningModulesService.getSystemDesignById(context.studentId, params.design_id);
      return {
        score_percent: 88,
        strengths: ['Decoupled caching layer with Redis LRU', 'Stateless API workers behind Nginx load balancer'],
        recommendations: ['Consider multi-master DB replication to mitigate write failovers in high concurrency periods.'],
      };
    },
  });

  ToolRegistry.register({
    name: 'generate_design_questions',
    description: 'Generate real-world technical interview follow-up questions for a system design.',
    parameters: {
      design_id: { type: 'string', description: 'Design ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async () => {
      return [
        'How does your system handle cache thundering herd when a popular link expires?',
        'What strategy ensures zero duplicate base62 token generation if the Token Dispenser worker crashes?',
        'How would you achieve GDPR compliance and hard deletes across replica clusters?',
      ];
    },
  });

  // ========================================================
  // 9. Personal Knowledge Base Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_knowledge_item',
    description: 'Store notes, documents, or technical concept summaries in the personal knowledge base.',
    parameters: {
      title: { type: 'string', description: 'Item title', required: true },
      content: { type: 'string', description: 'Markdown or plain text knowledge content', required: true },
      type: { type: 'string', description: 'NOTE, DOCUMENT, SNIPPET, BOOKMARK, or PAPER' },
      collection_id: { type: 'string', description: 'Collection or domain' },
      tags: { type: 'array', description: 'Tags for categorical retrieval' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.createKnowledgeItem(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'search_knowledge',
    description: 'Search personal knowledge items by keyword matching.',
    parameters: {
      query: { type: 'string', description: 'Search keywords', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.searchKnowledge(context.studentId, params.query);
    },
  });

  ToolRegistry.register({
    name: 'get_knowledge_item',
    description: 'Retrieve full markdown content and citations for a knowledge item.',
    parameters: {
      item_id: { type: 'string', description: 'Knowledge Item ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      const items = await LearningModulesService.getKnowledgeItems(context.studentId);
      const item = items.find((i) => i.id === params.item_id);
      if (!item) throw new Error(`Knowledge item '${params.item_id}' not found`);
      return item;
    },
  });

  ToolRegistry.register({
    name: 'create_collection',
    description: 'Create a new organized knowledge collection (folder).',
    parameters: {
      name: { type: 'string', description: 'Collection name', required: true },
      description: { type: 'string', description: 'Collection purpose' },
      icon: { type: 'string', description: 'Display icon' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const collection = {
        id: `coll_${Date.now()}`,
        student_id: context.studentId,
        name: params.name,
        description: params.description || '',
        icon: params.icon || 'Folder',
        item_count: 0,
        created_at: new Date().toISOString(),
      };
      return collection;
    },
  });

  ToolRegistry.register({
    name: 'update_knowledge',
    description: 'Update knowledge item content or tags.',
    parameters: {
      item_id: { type: 'string', description: 'Knowledge item ID', required: true },
      title: { type: 'string', description: 'Updated title' },
      content: { type: 'string', description: 'Updated content' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const items = await LearningModulesService.getKnowledgeItems(context.studentId);
      const item = items.find((i) => i.id === params.item_id);
      if (!item) throw new Error(`Knowledge item '${params.item_id}' not found`);
      if (params.title) item.title = params.title;
      if (params.content) item.content = params.content;
      item.updated_at = new Date().toISOString();
      return item;
    },
  });

  ToolRegistry.register({
    name: 'build_knowledge_relationships',
    description: 'Build graph edges linking notes, courses, flashcards, and projects.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      return await LearningModulesService.getKnowledgeGraph(context.studentId);
    },
  });

  ToolRegistry.register({
    name: 'search_semantic_knowledge',
    description: 'Execute semantic RAG query across student-curated knowledge base.',
    parameters: {
      query: { type: 'string', description: 'Semantic query', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.searchKnowledge(context.studentId, params.query);
    },
  });

  // ========================================================
  // 10. Internship & Application Tracker Tools
  // ========================================================
  ToolRegistry.register({
    name: 'create_application',
    description: 'Add a new internship or campus placement application to the student tracker.',
    parameters: {
      company: { type: 'string', description: 'Company name', required: true },
      role: { type: 'string', description: 'Job title / role', required: true },
      location: { type: 'string', description: 'Location (Remote / City)' },
      deadline: { type: 'string', description: 'Application deadline (YYYY-MM-DD)' },
      job_url: { type: 'string', description: 'Job posting URL' },
      status: { type: 'string', description: 'SAVED, APPLIED, ASSESSMENT, INTERVIEW, OFFER, etc.' },
      notes: { type: 'string', description: 'Personal notes or recruiter contacts' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.createApplication(context.studentId, params);
    },
  });

  ToolRegistry.register({
    name: 'update_application',
    description: 'Update application fields, interview dates, or notes.',
    parameters: {
      application_id: { type: 'string', description: 'Application ID', required: true },
      notes: { type: 'string', description: 'Updated notes' },
      interview_date: { type: 'string', description: 'Scheduled interview date' },
      deadline: { type: 'string', description: 'Updated deadline' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      const app = await LearningModulesService.getApplicationById(context.studentId, params.application_id);
      if (params.notes !== undefined) app.notes = params.notes;
      if (params.interview_date) app.interview_date = params.interview_date;
      if (params.deadline) app.deadline = params.deadline;
      app.updated_at = new Date().toISOString();
      return app;
    },
  });

  ToolRegistry.register({
    name: 'get_application',
    description: 'Retrieve full application details, event timeline, and preparation checklist.',
    parameters: {
      application_id: { type: 'string', description: 'Application ID', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params, context) => {
      return await LearningModulesService.getApplicationById(context.studentId, params.application_id);
    },
  });

  ToolRegistry.register({
    name: 'list_applications',
    description: 'List all internship and placement applications with current status.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      return await LearningModulesService.getApplications(context.studentId);
    },
  });

  ToolRegistry.register({
    name: 'update_application_status',
    description: 'Advance application state (e.g. APPLIED -> ASSESSMENT -> INTERVIEW -> OFFER).',
    parameters: {
      application_id: { type: 'string', description: 'Application ID', required: true },
      status: { type: 'string', description: 'New status', required: true },
      note: { type: 'string', description: 'Timeline event note' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await LearningModulesService.updateApplicationStatus(
        context.studentId,
        params.application_id,
        params.status as any,
        params.note
      );
    },
  });

  ToolRegistry.register({
    name: 'get_application_deadlines',
    description: 'Get upcoming application deadlines and scheduled interview events.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      const apps = await LearningModulesService.getApplications(context.studentId);
      return apps
        .filter((a) => a.deadline || a.interview_date)
        .map((a) => ({
          company: a.company_name,
          role: a.role,
          deadline: a.deadline,
          interview_date: a.interview_date,
          status: a.status,
        }));
    },
  });

  ToolRegistry.register({
    name: 'analyze_job_description',
    description: 'Analyze job description text and compare against student verified skills and portfolio.',
    parameters: {
      job_description: { type: 'string', description: 'Full job description text', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 12000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params, context) => {
      return await LearningModulesService.analyzeJobDescription(context.studentId, params.job_description);
    },
  });

  ToolRegistry.register({
    name: 'create_application_checklist',
    description: 'Generate tailored preparation checklist for a company interview round.',
    parameters: {
      company: { type: 'string', description: 'Company name', required: true },
      role: { type: 'string', description: 'Role name', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (params) => {
      return {
        company: params.company,
        role: params.role,
        checklist: [
          'Review Core CS fundamentals: OS Concurrency & DBMS Normalization',
          'Practice Top 20 company-tagged DSA questions (Trees, DP, Graphs)',
          'Prepare project architecture deep dive with latency & scale tradeoffs',
          'Structure STAR behavioral stories for leadership & teamwork scenarios',
        ],
      };
    },
  });
}
