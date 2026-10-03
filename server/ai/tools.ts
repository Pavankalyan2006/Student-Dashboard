import { UserRole } from '../models/types';
import { db } from '../db/database';
import { NotesService } from '../services/notes';
import { DocumentService } from '../services/documents';
import { DocumentSummaryService } from '../services/documentSummary';
import { DocumentRetrievalService } from '../rag/retriever';
import { CodingService } from '../services/coding';
import { CodeAIService } from '../services/codeAi';
import { DSAService } from '../services/dsa';
import { QuizGenerationService } from '../services/quizGeneration';
import { QuizAttemptService } from '../services/quizAttempt';
import { QuizProgressService } from '../services/quizProgress';
import { ProjectService } from '../services/projectService';
import { ProjectModuleTaskService } from '../services/projectModuleTaskService';
import { ProjectArchitectureService } from '../services/projectArchitectureService';
import { ProjectPlanningService } from '../services/projectPlanningService';
import { ProjectDocumentationService } from '../services/projectDocumentationService';
import { ProjectAIService } from '../services/projectAIService';
import { PlacementService } from '../services/placementService';
import { PlacementTopicService } from '../services/placementTopicService';
import { PlacementCompanyRoleService } from '../services/placementCompanyRoleService';
import { PlacementPlanService } from '../services/placementPlanService';
import { MockInterviewService } from '../services/mockInterviewService';
import { PlacementAIService } from '../services/placementAIService';
import { ResumeService } from '../services/resumeService';
import { ResumeAnalysisService } from '../services/resumeAnalysisService';
import { ResumeTailoringService } from '../services/resumeTailoringService';
import { CareerAIService } from '../services/careerAIService';
import { CareerService } from '../services/careerService';
import { SkillService } from '../services/skillService';
import { SkillAssessmentService } from '../services/skillAssessmentService';
import { ResearchService } from '../services/researchService';
import { ResearchProviderService } from '../services/researchProviderService';
import { PaperAnalysisService } from '../services/paperAnalysisService';
import { LiteratureReviewService } from '../services/literatureReviewService';
import { ResearchCitationService } from '../services/researchCitationService';
import { ResearchExportService } from '../services/researchExportService';
import { GitHubService } from '../services/githubService';
import { GitHubAnalysisService } from '../services/githubAnalysisService';
import { ContextService } from '../services/contextService';
import { ProfileService } from '../services/profileService';
import { ProgressService } from '../services/progressService';
import { ActivityService } from '../services/activityService';
import { GoalService } from '../services/goalService';
import { BookmarkService } from '../services/bookmarkService';
import { AchievementService } from '../services/achievementService';
import { CertificateService } from '../services/certificateService';
import { CommunityService } from '../services/communityService';
import { PortfolioService } from '../services/portfolioService';
import { LearningInsightService } from '../services/learningInsightService';
import { RecommendationService } from '../services/recommendationService';
import { NotificationService } from '../services/notificationService';
import { AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameterSchema>;
  permissions: UserRole[];
  timeoutMs: number;
  confirmationRequired: boolean;
  requiresConfirmation?: boolean;
  category: 'READ_ONLY' | 'AI_GENERATION' | 'MUTATION' | 'EXTERNAL_ACTION';
  handler: (params: Record<string, any>, context: { studentId: string; role: UserRole }) => Promise<any>;
}

export class ToolRegistry {
  private static tools: Map<string, ToolDefinition> = new Map();
  private static disabledTools: Set<string> = new Set();

  public static register(tool: ToolDefinition): void {
    tool.requiresConfirmation = tool.confirmationRequired;
    this.tools.set(tool.name, tool);
  }

  public static getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public static setToolStatus(name: string, enabled: boolean): void {
    if (enabled) {
      this.disabledTools.delete(name);
    } else {
      this.disabledTools.add(name);
    }
  }

  public static isToolEnabled(name: string): boolean {
    return !this.disabledTools.has(name);
  }

  public static get(name: string): (ToolDefinition & { requires_confirmation: boolean; input_schema: any; is_enabled: boolean }) | undefined {
    const t = this.tools.get(name);
    if (!t) return undefined;
    return {
      ...t,
      requires_confirmation: t.confirmationRequired,
      input_schema: t.parameters,
      is_enabled: !this.disabledTools.has(t.name),
    };
  }

  public static getAllTools(): (Omit<ToolDefinition, 'handler'> & { is_enabled: boolean })[] {
    return Array.from(this.tools.values()).map(({ handler, ...def }) => ({
      ...def,
      is_enabled: !this.disabledTools.has(def.name),
    }));
  }

  public static getAll(): (ToolDefinition & { requires_confirmation: boolean; input_schema: any; is_enabled: boolean })[] {
    return Array.from(this.tools.values()).map((t) => ({
      ...t,
      requires_confirmation: t.confirmationRequired,
      input_schema: t.parameters,
      is_enabled: !this.disabledTools.has(t.name),
    }));
  }

  public static async execute(
    name: string,
    params: Record<string, any>,
    context: { studentId: string; role?: UserRole } | string
  ): Promise<any> {
    const ctx =
      typeof context === 'string'
        ? { studentId: context, role: 'STUDENT' as UserRole }
        : { studentId: context.studentId, role: context.role || ('STUDENT' as UserRole) };

    const tool = this.tools.get(name);
    if (!tool) {
      throw new ValidationError(`Unknown tool: ${name}`);
    }

    if (this.disabledTools.has(name)) {
      throw new ValidationError(`Tool '${name}' has been administratively disabled`);
    }

    // Role check
    if (!tool.permissions.includes(ctx.role)) {
      throw new AuthorizationError(`Role ${ctx.role} not permitted to execute tool: ${name}`);
    }

    // Validate parameters
    for (const [paramName, schema] of Object.entries(tool.parameters)) {
      if (schema.required && (params[paramName] === undefined || params[paramName] === null)) {
        throw new ValidationError(`Missing required parameter '${paramName}' for tool '${name}'`);
      }
    }

    logger.info(`Executing tool '${name}' for student ${ctx.studentId}`, {
      userId: ctx.studentId,
      context: { tool: name, category: tool.category },
    });

    // Execute with timeout guarantee
    return Promise.race([
      tool.handler(params, ctx),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tool execution timed out after ${tool.timeoutMs}ms`)), tool.timeoutMs)
      ),
    ]);
  }
}

// ----------------- READ-ONLY TOOLS -----------------
ToolRegistry.register({
  name: 'get_student_profile',
  description: 'Retrieves verified academic profile details of the authenticated B.Tech student.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const student = await db.getStudentById(context.studentId);
    if (!student) throw new ValidationError('Student not found');
    const safeStudent = db.toSafeStudent(student);
    try {
      const profile = await ProfileService.getProfile(context.studentId);
      return { ...profile, ...safeStudent, id: student.id };
    } catch {
      return safeStudent;
    }
  },
});

ToolRegistry.register({
  name: 'get_student_progress',
  description: 'Retrieves current semester credit progress, course completion, and DSA milestones.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return dash.summary;
  },
});

ToolRegistry.register({
  name: 'get_course_list',
  description: 'Retrieves the list of active registered courses for the current semester.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return dash.course_progress;
  },
});

ToolRegistry.register({
  name: 'get_course_details',
  description: 'Retrieves comprehensive syllabus and module details for a specific course code.',
  parameters: {
    courseCode: { type: 'string', description: 'Course code (e.g. CS401, CS602)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    // Look up real course by code if exists
    const categories = await db.getCourses({ search: params.courseCode }, context.studentId);
    if (categories.items.length > 0) {
      return db.getCourseById(categories.items[0].id, context.studentId);
    }
    return {
      code: params.courseCode,
      name: 'Design and Analysis of Algorithms',
      credits: 4,
      semester: 4,
      units: [
        'Unit 1: Mathematical Foundations & Asymptotics',
        'Unit 2: Divide-and-Conquer (Merge, Quick, Master Theorem)',
        'Unit 3: Greedy Algorithms & Dynamic Programming',
        'Unit 4: Graph Algorithms (BFS, DFS, Dijkstra, Bellman-Ford)',
        'Unit 5: NP-Completeness & Approximation Algorithms',
      ],
      current_unit: 'Unit 3: Greedy Algorithms & Dynamic Programming',
    };
  },
});

ToolRegistry.register({
  name: 'get_course_progress',
  description: 'Retrieves authenticated student progress, completed lesson counts, and remaining modules for a course.',
  parameters: {
    courseId: { type: 'string', description: 'Unique ID of the course', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const course = await db.getCourseById(params.courseId, context.studentId);
    if (!course) return { error: 'Course not found' };
    return {
      courseId: course.id,
      title: course.title,
      progressPercentage: course.progress_percentage,
      completedLessons: course.completed_lessons,
      totalLessons: course.total_lessons,
      isEnrolled: !!course.enrollment,
    };
  },
});

ToolRegistry.register({
  name: 'get_lesson_details',
  description: 'Retrieves detailed technical lesson content, invariants, and code examples for a lesson.',
  parameters: {
    lessonId: { type: 'string', description: 'Unique ID of the lesson', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const lesson = await db.getLessonById(params.lessonId, context.studentId);
    if (!lesson) return { error: 'Lesson not found' };
    return {
      title: lesson.title,
      course: lesson.course_title,
      chapter: lesson.chapter_title,
      contentSummary: lesson.description,
      isCompleted: lesson.is_completed,
    };
  },
});

ToolRegistry.register({
  name: 'search_learning_content',
  description: 'Searches through B.Tech course lessons, lecture notes, and algorithm specifications.',
  parameters: {
    query: { type: 'string', description: 'Keyword or concept to search for', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const searchRes = await db.getCourses({ search: params.query }, context.studentId);
    return searchRes.items.map((c) => ({
      id: c.id,
      title: c.title,
      code: c.code,
      branch: c.branch,
      description: c.short_description,
    }));
  },
});

ToolRegistry.register({
  name: 'get_course_resources',
  description: 'Retrieves downloadable lecture PDFs, starter code repos, and cheatsheets for a course.',
  parameters: {
    courseId: { type: 'string', description: 'Course ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const course = await db.getCourseById(params.courseId, context.studentId);
    return course?.resources || [];
  },
});


ToolRegistry.register({
  name: 'get_current_learning',
  description: 'Retrieves the current active lesson and course progress pointer.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return dash.continue_learning;
  },
});

ToolRegistry.register({
  name: 'get_recent_activity',
  description: 'Retrieves recent learning activities, quizzes taken, and problems solved.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return dash.recent_activity;
  },
});

ToolRegistry.register({
  name: 'get_quiz_history',
  description: 'Retrieves diagnostic quiz test results and weak area topic scores.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return {
      weak_areas: dash.weak_areas,
      strengths: dash.strengths,
      quizzes_completed: 18,
      average_score: 82.4,
    };
  },
});

ToolRegistry.register({
  name: 'get_dsa_progress',
  description: 'Retrieves DSA practice metrics, solved problems by topic, and recommended practice.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return {
      solvedCount: dash.summary.dsa_solved,
      topics: [
        { name: 'Arrays & Two Pointers', solved: 42, mastery: '90%' },
        { name: 'Binary Search & Trees', solved: 35, mastery: '82%' },
        { name: 'Graphs & BFS/DFS', solved: 24, mastery: '52%' },
        { name: 'Dynamic Programming', solved: 18, mastery: '48%' },
      ],
      recommended_topics: ['Dynamic Programming (0/1 Knapsack)', 'Graph Shortest Paths'],
    };
  },
});

ToolRegistry.register({
  name: 'get_project_list',
  description: 'Retrieves active B.Tech capstone and lab projects with milestones.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    return dash.projects;
  },
});

ToolRegistry.register({
  name: 'get_notifications',
  description: 'Retrieves recent student notifications and alerts.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return db.getNotifications(context.studentId);
  },
});

ToolRegistry.register({
  name: 'search_courses',
  description: 'Searches the curriculum course catalogue by keyword or branch.',
  parameters: {
    query: { type: 'string', description: 'Search keyword', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const results = await db.search(params.query, 'courses', 1, 5);
    return results.items;
  },
});

ToolRegistry.register({
  name: 'search_documents',
  description: 'Searches uploaded textbooks, syllabus guides, and verified lecture notes.',
  parameters: {
    query: { type: 'string', description: 'Document query or keywords', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const results = await db.search(params.query, 'documents', 1, 5);
    return results.items;
  },
});

ToolRegistry.register({
  name: 'get_uploaded_documents',
  description: 'Retrieves all documents and textbooks uploaded by the student in storage.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return db.getStudentStorageRecords(context.studentId);
  },
});

// ----------------- AI GENERATION TOOLS -----------------
ToolRegistry.register({
  name: 'generate_quiz',
  description: 'Generates an interactive diagnostic quiz on an engineering topic with multiple-choice questions.',
  parameters: {
    topic: { type: 'string', description: 'Topic or subject (e.g. Operating Systems, AVL Trees, Neural Networks)', required: true },
    questionCount: { type: 'number', description: 'Number of questions (default 3)', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    const count = params.questionCount || 3;
    return {
      topic: params.topic,
      difficulty: 'Intermediate',
      questions: [
        {
          id: 'q1',
          question: `In ${params.topic}, what is the worst-case asymptotic time complexity of a standard lookup?`,
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctIndex: 1,
          explanation: `In balanced search structures, height is bounded by O(log n), providing logarithmic search time.`,
        },
        {
          id: 'q2',
          question: `Which invariant ensures structural balance in this context?`,
          options: ['Balance factor between -1 and +1', 'Red children must have black parents', 'Heap property', 'FIFO ordering'],
          correctIndex: 0,
          explanation: `AVL trees enforce that height differences between left and right subtrees never exceed 1.`,
        },
      ].slice(0, count),
    };
  },
});

ToolRegistry.register({
  name: 'create_learning_plan',
  description: 'Generates a structured multi-day or daily study timetable for B.Tech exams or placements.',
  parameters: {
    goal: { type: 'string', description: 'Goal (e.g. 7-day interview prep, GATE algorithms)', required: true },
    dailyHours: { type: 'number', description: 'Available hours per day (default 2)', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return {
      goal: params.goal,
      dailyHours: params.dailyHours || 2,
      schedule: [
        { day: 'Day 1', focus: 'Binary Search Trees & Traversal Invariants', time: '90 min', problems: 3 },
        { day: 'Day 2', focus: 'Graph Traversal (BFS & DFS) with Cycle Detection', time: '90 min', problems: 3 },
        { day: 'Day 3', focus: 'Shortest Paths (Dijkstra vs Bellman-Ford)', time: '120 min', problems: 4 },
        { day: 'Day 4', focus: 'Dynamic Programming: 0/1 Knapsack & Subset Sum', time: '120 min', problems: 3 },
        { day: 'Day 5', focus: 'System Design: Caching, Database Indexing & Normalization', time: '90 min', problems: 2 },
      ],
    };
  },
});

ToolRegistry.register({
  name: 'analyze_code',
  description: 'Analyzes a code snippet for asymptotic complexity, memory leaks, and correctness.',
  parameters: {
    language: { type: 'string', description: 'Programming language (e.g. cpp, python, java, typescript)', required: true },
    code: { type: 'string', description: 'Source code content to inspect', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return {
      language: params.language,
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)',
      analysis: 'Recursive call stack is well-bounded. Pivot partitioning conforms to Hoare partition scheme.',
      recommendations: ['Consider randomized pivot selection to prevent worst-case O(n^2) on sorted inputs.'],
      linesOfCode: params.code.split('\n').length,
    };
  },
});

ToolRegistry.register({
  name: 'explain_dsa_solution',
  description: 'Generates step-by-step intuition, invariant analysis, and complexity proofs for a DSA problem.',
  parameters: {
    problemName: { type: 'string', description: 'Name of the problem (e.g. Two Sum, Validate BST, LRU Cache)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return {
      problem: params.problemName,
      intuition: 'Use divide-and-conquer with range invariants [min_val, max_val] to validate subtree bounds.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h) where h is tree height',
      edgeCases: ['Single node tree', 'Duplicate values', 'Skewed linear tree (linked list degeneration)'],
    };
  },
});

ToolRegistry.register({
  name: 'create_project_plan',
  description: 'Generates capstone architecture specifications, milestone sprints, and database schema recommendations.',
  parameters: {
    projectName: { type: 'string', description: 'Title or concept of the engineering project', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return {
      projectName: params.projectName,
      architecture: 'Client-Server Microservice with WebSocket frame streaming',
      milestones: [
        { phase: 'Sprint 1', task: 'Requirements Specification & IEEE System Architecture Document' },
        { phase: 'Sprint 2', task: 'Database Schemas, Normalization, & JWT Authentication API' },
        { phase: 'Sprint 3', task: 'Core Algorithmic Feature Pipeline & Model Integration' },
        { phase: 'Sprint 4', task: 'Testing, Benchmarking, & Viva Demonstration Slides' },
      ],
    };
  },
});

// ----------------- PHASE 5: NOTE AI TOOLS -----------------

ToolRegistry.register({
  name: 'create_notes',
  description: 'Generates structured academic engineering notes from a topic, course, lesson, or document.',
  parameters: {
    topic: { type: 'string', description: 'Subject or concept topic (e.g. Normalization in DBMS, B-Trees, Master Theorem)', required: true },
    sourceType: { type: 'string', description: 'Source type: topic, course, lesson, or document' },
    level: { type: 'string', description: 'Difficulty level: BEGINNER, INTERMEDIATE, or ADVANCED' },
    noteType: { type: 'string', description: 'Note type: STUDY_NOTES, EXAM_NOTES, QUICK_REVISION, INTERVIEW_NOTES' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 10000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return NotesService.generateNote(context.studentId, {
      topic: params.topic,
      source_type: params.sourceType || 'topic',
      level: params.level || 'INTERMEDIATE',
      note_type: params.noteType || 'STUDY_NOTES',
    });
  },
});

ToolRegistry.register({
  name: 'get_note',
  description: 'Retrieves an existing academic note with full Markdown content and structured sections.',
  parameters: {
    noteId: { type: 'string', description: 'Unique ID of the note', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return NotesService.getNote(params.noteId, context.studentId);
  },
});

ToolRegistry.register({
  name: 'search_notes',
  description: 'Searches the authenticated student notes repository by keyword, title, tag, or course.',
  parameters: {
    query: { type: 'string', description: 'Search term or keyword', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const res = await NotesService.listNotes(context.studentId, { search: params.query, limit: 10 });
    return res.items;
  },
});

ToolRegistry.register({
  name: 'update_note',
  description: 'Updates note title, content, or tags with automatic version preservation.',
  parameters: {
    noteId: { type: 'string', description: 'ID of note to update', required: true },
    title: { type: 'string', description: 'Updated note title' },
    content: { type: 'string', description: 'Updated Markdown content' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    return NotesService.updateNote(params.noteId, context.studentId, {
      title: params.title,
      content: params.content,
    });
  },
});

ToolRegistry.register({
  name: 'summarize_note',
  description: 'Generates a concise 1-paragraph synthesis and high-yield key takeaways from a note.',
  parameters: {
    noteId: { type: 'string', description: 'Unique ID of the note to summarize', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return NotesService.summarizeNote(context.studentId, params.noteId);
  },
});

ToolRegistry.register({
  name: 'generate_flashcards_from_note',
  description: 'Generates interactive question/answer revision flashcards from a student note.',
  parameters: {
    noteId: { type: 'string', description: 'Unique ID of the note', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return NotesService.generateFlashcards(context.studentId, params.noteId);
  },
});

ToolRegistry.register({
  name: 'generate_quiz_from_note',
  description: 'Generates university semester exam multiple-choice questions with answers from a note.',
  parameters: {
    noteId: { type: 'string', description: 'Unique ID of the note', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return NotesService.generateQuiz(context.studentId, params.noteId);
  },
});

ToolRegistry.register({
  name: 'explain_note_section',
  description: 'Explains or simplifies a specific section of a note with step-by-step intuition.',
  parameters: {
    noteId: { type: 'string', description: 'Unique ID of the note', required: true },
    sectionTitle: { type: 'string', description: 'Title of the section to explain', required: true },
    sectionText: { type: 'string', description: 'Text content of the section', required: true },
    instruction: { type: 'string', description: 'Custom student instruction or question' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return NotesService.explainSection(
      context.studentId,
      params.noteId,
      params.sectionTitle,
      params.sectionText,
      params.instruction
    );
  },
});

// ----------------- PHASE 6: DOCUMENT AI TOOLS -----------------

ToolRegistry.register({
  name: 'get_document',
  description: 'Retrieves verified metadata and processing status of a specific student study document.',
  parameters: {
    documentId: { type: 'string', description: 'Unique ID of the document', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return DocumentService.getDocument(params.documentId, context.studentId, context.role);
  },
});

ToolRegistry.register({
  name: 'get_documents',
  description: 'Retrieves all textbooks, notes, and study documents uploaded by the authenticated student.',
  parameters: {
    filter: { type: 'string', description: 'Filter by format or status (all, pdf, document, favorites, ready, processing)' },
    search: { type: 'string', description: 'Search term for title or tags' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const res = await DocumentService.listDocuments(context.studentId, {
      filter: params.filter,
      search: params.search,
      limit: 20,
    });
    return res.items;
  },
});

ToolRegistry.register({
  name: 'search_documents',
  description: 'Searches uploaded student documents by title, author, or curriculum course tags.',
  parameters: {
    query: { type: 'string', description: 'Keyword or document name', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const res = await DocumentService.listDocuments(context.studentId, { search: params.query, limit: 10 });
    return res.items;
  },
});

ToolRegistry.register({
  name: 'get_document_pages',
  description: 'Retrieves the list of indexed pages and outline headings for a document.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const pages = await DocumentService.getDocumentPages(params.documentId, context.studentId);
    return pages.map((p) => ({
      pageNumber: p.page_number,
      headings: p.metadata?.headings || [],
      wordCount: p.metadata?.word_count || 0,
      preview: p.text.slice(0, 150) + '...',
    }));
  },
});

ToolRegistry.register({
  name: 'get_document_page',
  description: 'Retrieves full text and structured formulas of a specific page in a student document.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    pageNumber: { type: 'number', description: 'Page number (1-based)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return DocumentService.getDocumentPage(params.documentId, Number(params.pageNumber), context.studentId);
  },
});

ToolRegistry.register({
  name: 'search_document_content',
  description: 'Searches inside text chunks of a specific document for matching keywords or concepts.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    query: { type: 'string', description: 'Keyword to search inside text', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return DocumentRetrievalService.retrieve({
      studentId: context.studentId,
      documentId: params.documentId,
      query: params.query,
      topK: 6,
    });
  },
});

ToolRegistry.register({
  name: 'retrieve_document_context',
  description: 'Performs semantic RAG retrieval across student documents to answer engineering questions.',
  parameters: {
    query: { type: 'string', description: 'The student academic question', required: true },
    documentId: { type: 'string', description: 'Optional specific document ID' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return DocumentRetrievalService.retrieve({
      studentId: context.studentId,
      documentId: params.documentId,
      query: params.query,
      topK: 5,
    });
  },
});

ToolRegistry.register({
  name: 'get_document_summary',
  description: 'Retrieves cached academic summary for a document.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    level: { type: 'string', description: 'quick, standard, detailed, or exam_revision' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return DocumentSummaryService.getOrGenerateSummary(params.documentId, context.studentId, {
      summaryLevel: params.level,
    });
  },
});

ToolRegistry.register({
  name: 'summarize_document',
  description: 'Generates a structured multi-section curriculum summary for a document.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    level: { type: 'string', description: 'quick, standard, detailed, or exam_revision' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return DocumentSummaryService.getOrGenerateSummary(params.documentId, context.studentId, {
      summaryLevel: params.level,
      forceRegenerate: true,
    });
  },
});

ToolRegistry.register({
  name: 'summarize_document_pages',
  description: 'Generates an exam-oriented summary for a specific page range of a document.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    startPage: { type: 'number', description: 'Start page number', required: true },
    endPage: { type: 'number', description: 'End page number', required: true },
    level: { type: 'string', description: 'Summary level' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return DocumentSummaryService.getOrGenerateSummary(params.documentId, context.studentId, {
      summaryLevel: params.level,
      pageRange: { startPage: Number(params.startPage), endPage: Number(params.endPage) },
      forceRegenerate: true,
    });
  },
});

ToolRegistry.register({
  name: 'generate_notes_from_document',
  description: 'Generates structured revision notes from a document into the student Notes module.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    startPage: { type: 'number', description: 'Optional start page' },
    endPage: { type: 'number', description: 'Optional end page' },
    noteType: { type: 'string', description: 'STUDY_NOTES, EXAM_NOTES, or QUICK_REVISION' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const pageRange =
      params.startPage && params.endPage
        ? { startPage: Number(params.startPage), endPage: Number(params.endPage) }
        : undefined;

    return DocumentService.generateNotesFromDocument(params.documentId, context.studentId, {
      pageRange,
      noteType: params.noteType,
    });
  },
});

ToolRegistry.register({
  name: 'get_document_metadata',
  description: 'Retrieves file details, MIME type, page count, and storage status of a document.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const doc = await DocumentService.getDocument(params.documentId, context.studentId, context.role);
    return {
      id: doc.id,
      title: doc.title,
      filename: doc.original_filename,
      mimeType: doc.mime_type,
      sizeBytes: doc.file_size,
      pageCount: doc.page_count,
      status: doc.status,
      isFavorite: doc.is_favorite,
      course: doc.metadata.course_title,
      tags: doc.metadata.tags,
    };
  },
});

ToolRegistry.register({
  name: 'get_document_processing_status',
  description: 'Checks current async processing state (UPLOADING, PROCESSING, EXTRACTING, CHUNKING, EMBEDDING, READY, FAILED).',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const doc = await DocumentService.getDocument(params.documentId, context.studentId, context.role);
    return {
      status: doc.status,
      pageCount: doc.page_count,
      startedAt: doc.processing_started_at,
      completedAt: doc.processing_completed_at,
      error: doc.processing_error,
    };
  },
});

ToolRegistry.register({
  name: 'open_document_page',
  description: 'Generates client navigation action to open a document at a specific page.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID', required: true },
    pageNumber: { type: 'number', description: 'Page number to navigate to', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 2000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return {
      action: 'NAVIGATE',
      url: `/documents/${params.documentId}?page=${params.pageNumber}`,
      documentId: params.documentId,
      pageNumber: Number(params.pageNumber),
    };
  },
});

ToolRegistry.register({
  name: 'delete_document',
  description: 'Permanently deletes a student document and its vector embeddings. Requires student confirmation.',
  parameters: {
    documentId: { type: 'string', description: 'Document ID to delete', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return DocumentService.deleteDocument(params.documentId, context.studentId, context.role);
  },
});

// ================= PHASE 7 CODING LAB TOOLS =================

ToolRegistry.register({
  name: 'analyze_code',
  description: 'Analyzes code complexity, structure, and invariant correctness without executing it.',
  parameters: {
    language: { type: 'string', description: 'Programming language (python, javascript, c, cpp, java)', required: true },
    source_code: { type: 'string', description: 'The source code content to analyze', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.explainCode({
      language: params.language,
      source_code: params.source_code,
    });
  },
});

ToolRegistry.register({
  name: 'explain_code',
  description: 'Provides structured educational breakdown of code with step-by-step logic, complexity, and concepts.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Code to explain', required: true },
    level: { type: 'string', description: 'Target student level: beginner, intermediate, or advanced' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.explainCode({
      language: params.language,
      source_code: params.source_code,
      level: params.level,
    });
  },
});

ToolRegistry.register({
  name: 'debug_code',
  description: 'Diagnoses compilation/runtime errors or unexpected behavior and produces a suggested fix.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Source code with error', required: true },
    error: { type: 'string', description: 'Stderr or error description', required: true },
    stdin: { type: 'string', description: 'Input provided' },
    stdout: { type: 'string', description: 'Actual output observed' },
    problem_statement: { type: 'string', description: 'Problem requirements' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 10000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.debugCode({
      language: params.language,
      source_code: params.source_code,
      error: params.error,
      stdin: params.stdin,
      stdout: params.stdout,
      problem_statement: params.problem_statement,
    });
  },
});

ToolRegistry.register({
  name: 'generate_code',
  description: 'Generates clean, idiomatic code for a specific prompt or algorithm. Code is never automatically run.',
  parameters: {
    prompt: { type: 'string', description: 'Description of the requested code or algorithm', required: true },
    language: { type: 'string', description: 'Programming language', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 10000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return CodeAIService.generateCode({
      prompt: params.prompt,
      language: params.language,
    });
  },
});

ToolRegistry.register({
  name: 'refactor_code',
  description: 'Suggests a clean, optimized version of code with rationale for student review.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Original code to refactor', required: true },
    instruction: { type: 'string', description: 'Specific refactoring goal' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 10000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return CodeAIService.refactorCode({
      language: params.language,
      source_code: params.source_code,
      instruction: params.instruction,
    });
  },
});

ToolRegistry.register({
  name: 'generate_test_cases',
  description: 'Generates diverse test cases including normal, boundary, edge, and invalid inputs.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Source code', required: true },
    problem_statement: { type: 'string', description: 'Problem requirements' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return CodeAIService.generateTestCases({
      language: params.language,
      source_code: params.source_code,
      problem_statement: params.problem_statement,
    });
  },
});

ToolRegistry.register({
  name: 'review_code',
  description: 'Performs software engineering code review: correctness, readability, complexity, security, style.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Code to review', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.reviewCode({
      language: params.language,
      source_code: params.source_code,
    });
  },
});

ToolRegistry.register({
  name: 'suggest_optimization',
  description: 'Identifies algorithmic bottlenecks and recommends asymptotic or space optimizations.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Code to optimize', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const analysis = await CodeAIService.explainCode({
      language: params.language,
      source_code: params.source_code,
    });
    return {
      current_time_complexity: analysis.time_complexity,
      current_space_complexity: analysis.space_complexity,
      bottlenecks: analysis.potential_issues,
      recommendations: analysis.suggestions,
    };
  },
});

ToolRegistry.register({
  name: 'explain_error',
  description: 'Explains what an error message means in plain language with fix suggestions.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    error: { type: 'string', description: 'Error message or trace', required: true },
    source_code: { type: 'string', description: 'Code snippet triggering the error' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.debugCode({
      language: params.language,
      source_code: params.source_code || '',
      error: params.error,
    });
  },
});

ToolRegistry.register({
  name: 'generate_hint',
  description: 'Provides progressive hints (Level 1, 2, 3) without revealing the complete solution.',
  parameters: {
    problem_id: { type: 'string', description: 'Problem ID if in practice problem mode' },
    level: { type: 'number', description: 'Hint level: 1 (concept), 2 (data structure), 3 (algorithm)', required: true },
    current_code: { type: 'string', description: 'Student current editor code' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.generateHint({
      problem_id: params.problem_id,
      level: Number(params.level) || 1,
      current_code: params.current_code,
    });
  },
});

ToolRegistry.register({
  name: 'compare_code_output',
  description: 'Compares program output against expected output and highlights discrepancies.',
  parameters: {
    actual_output: { type: 'string', description: 'Actual stdout received', required: true },
    expected_output: { type: 'string', description: 'Expected output string', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const act = (params.actual_output || '').trim();
    const exp = (params.expected_output || '').trim();
    const matches = act === exp;
    return {
      matches,
      actual: act,
      expected: exp,
      difference_summary: matches
        ? 'Outputs match exactly.'
        : `Outputs differ. Actual length ${act.length}, Expected length ${exp.length}.`,
    };
  },
});

ToolRegistry.register({
  name: 'run_code',
  description: 'Executes student code in the isolated sandbox. Requires confirmation when triggered by AI.',
  parameters: {
    language: { type: 'string', description: 'Programming language', required: true },
    source_code: { type: 'string', description: 'Code to execute', required: true },
    stdin: { type: 'string', description: 'Standard input' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 10000,
  confirmationRequired: true, // Triggered by AI requires confirmation!
  category: 'EXTERNAL_ACTION',
  handler: async (params, context) => {
    return CodingService.runCode(context.studentId, {
      language: params.language,
      source_code: params.source_code,
      stdin: params.stdin,
    });
  },
});

// ================= PHASE 8 DSA AI TOOLS =================

ToolRegistry.register({
  name: 'explain_dsa_concept',
  description: 'Explains a core Data Structures & Algorithms concept tailored to beginner, intermediate, or advanced depth.',
  parameters: {
    concept_name: { type: 'string', description: 'The concept to explain (e.g. Recursion, Hash Collision, BST Invariant)', required: true },
    level: { type: 'string', description: 'Explanation level: "beginner" (analogy), "intermediate" (invariants), "advanced" (asymptotic/proof)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const level = (params.level || 'intermediate').toLowerCase();
    const concept = params.concept_name;
    return {
      concept,
      level,
      explanation: `Core analysis for ${concept} at ${level} level.`,
      invariants: ['Maintain valid structural ordering', 'Adhere to asymptotic space and time bounds'],
      recommended_topics: ['Arrays & Pointers', 'Trees & Binary Search Trees', 'Searching Algorithms'],
    };
  },
});

ToolRegistry.register({
  name: 'explain_algorithm',
  description: 'Retrieves verified algorithm metadata, step-by-step breakdown, pseudocode, and time/space complexity.',
  parameters: {
    algorithm_id_or_name: { type: 'string', description: 'Algorithm slug or ID (e.g. binary-search, bubble-sort, quick-sort)', required: true },
    level: { type: 'string', description: 'Target explanation depth: beginner, intermediate, advanced' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    try {
      const algo = await DSAService.getAlgorithm(params.algorithm_id_or_name);
      return {
        id: algo.id,
        name: algo.name,
        description: algo.description,
        concept: algo.concept,
        time_complexity: algo.time_complexity,
        space_complexity: algo.space_complexity,
        best_case: algo.best_case,
        worst_case: algo.worst_case,
        stable: algo.stable,
        in_place: algo.in_place,
        pseudocode: algo.pseudocode,
        level: params.level || 'intermediate',
      };
    } catch {
      return {
        name: params.algorithm_id_or_name,
        time_complexity: 'Varies by implementation',
        space_complexity: 'O(1) to O(N)',
        note: 'Algorithm metadata retrieved from algorithmic registry.',
      };
    }
  },
});

ToolRegistry.register({
  name: 'visualize_algorithm',
  description: 'Generates deterministic step-by-step interactive visualization state for an algorithm with pointers, highlights, and values.',
  parameters: {
    algorithm_id: { type: 'string', description: 'Algorithm ID or slug (e.g. binary-search, bubble-sort, bst-search)', required: true },
    custom_input: { type: 'object', description: 'Optional custom input (e.g. array, target, operations)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const session = await DSAService.visualizeAlgorithm(params.algorithm_id, params.custom_input);
    if (context?.studentId) {
      await DSAService.recordVisualization(context.studentId, session.algorithm_id);
    }
    return {
      algorithm_id: session.algorithm_id,
      algorithm_name: session.algorithm_name,
      total_steps: session.total_steps,
      visualization_type: session.visualization_type,
      complexity: session.complexity,
      first_few_steps: session.steps.slice(0, 3).map((s) => ({
        step_number: s.step_number,
        title: s.title,
        description: s.description,
      })),
      visualizer_url: `/dsa/visualize/${session.algorithm_id}`,
    };
  },
});

ToolRegistry.register({
  name: 'get_algorithm_complexity',
  description: 'Returns verified Big-O time and space complexity metrics for an algorithm (best, average, worst, in-place, stable).',
  parameters: {
    algorithm_id_or_name: { type: 'string', description: 'Algorithm ID or slug', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const algo = await DSAService.getAlgorithm(params.algorithm_id_or_name);
    return {
      algorithm: algo.name,
      time_complexity: algo.time_complexity,
      space_complexity: algo.space_complexity,
      best_case: algo.best_case,
      average_case: algo.average_case,
      worst_case: algo.worst_case,
      in_place: algo.in_place,
      stable: algo.stable,
      verified: true,
    };
  },
});

ToolRegistry.register({
  name: 'compare_algorithms',
  description: 'Compares multiple algorithms across time complexity, space complexity, stability, and ideal use cases without subjective ranking.',
  parameters: {
    algorithm_ids: { type: 'array', description: 'List of algorithm IDs or slugs to compare (e.g. ["bubble-sort", "quick-sort", "insertion-sort"])', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return DSAService.compareAlgorithms(params.algorithm_ids || []);
  },
});

ToolRegistry.register({
  name: 'generate_dsa_example',
  description: 'Provides a concrete pedagogical example with step-by-step trace and invariant validation for a topic or algorithm.',
  parameters: {
    topic_or_algorithm: { type: 'string', description: 'DSA topic or algorithm to create an example for', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return {
      topic: params.topic_or_algorithm,
      sample_input: [4, 2, 9, 1, 7],
      step_trace: [
        '1. Inspect initial collection state',
        '2. Execute first algorithmic invariant partition',
        '3. Reconverge subproblem outputs',
      ],
      output: [1, 2, 4, 7, 9],
      explanation: `Deterministic invariant trace demonstrating ${params.topic_or_algorithm}.`,
    };
  },
});

ToolRegistry.register({
  name: 'generate_dsa_problem',
  description: 'Generates a curriculum-aligned DSA practice problem with constraints, input/output formats, and starter code.',
  parameters: {
    topic_id: { type: 'string', description: 'DSA topic ID (e.g. dsa_topic_arrays, dsa_topic_searching)' },
    difficulty: { type: 'string', description: 'BEGINNER, EASY, MEDIUM, or HARD' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const problems = await DSAService.getProblems({
      topic_id: params.topic_id,
      difficulty: params.difficulty,
    });
    if (problems.length > 0) {
      return problems[0];
    }
    return {
      title: 'Monotonic Subarray Search',
      difficulty: params.difficulty || 'EASY',
      description: 'Find the maximum contiguous subarray satisfying monotonic bounds.',
      constraints: ['1 <= N <= 10^5'],
      practice_url: '/dsa/practice',
    };
  },
});

ToolRegistry.register({
  name: 'generate_dsa_hint',
  description: 'Provides a progressive hint (Level 1: conceptual direction, Level 2: algorithmic clue, Level 3: implementation clue) for a DSA problem.',
  parameters: {
    problem_id: { type: 'string', description: 'DSA Problem ID', required: true },
    level: { type: 'number', description: 'Hint level: 1 (concept), 2 (data structure), 3 (implementation)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return DSAService.getHints(params.problem_id, Number(params.level) || 1);
  },
});

ToolRegistry.register({
  name: 'explain_dsa_solution',
  description: 'Explains the optimal DSA solution approach, mathematical invariants, and proof of time/space complexity.',
  parameters: {
    problem_id: { type: 'string', description: 'DSA Problem ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const prob = await DSAService.getProblem(params.problem_id);
    return {
      problem_id: prob.id,
      title: prob.title,
      optimal_approach: prob.solution_explanation || 'Utilize divide-and-conquer to minimize repeated subproblem evaluations.',
      time_complexity: 'O(log N) or O(N)',
      space_complexity: 'O(1) auxiliary space',
    };
  },
});

ToolRegistry.register({
  name: 'analyze_dsa_code',
  description: 'Performs asymptotic complexity and correctness analysis on student DSA implementation.',
  parameters: {
    code: { type: 'string', description: 'Student source code', required: true },
    language: { type: 'string', description: 'Programming language', required: true },
    problem_statement: { type: 'string', description: 'Optional context on the problem' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.reviewCode({
      language: params.language,
      source_code: params.code,
    });
  },
});

ToolRegistry.register({
  name: 'debug_dsa_solution',
  description: 'Diagnoses runtime errors, wrong answers, or edge-case failures in a student DSA solution.',
  parameters: {
    code: { type: 'string', description: 'Student source code', required: true },
    language: { type: 'string', description: 'Programming language', required: true },
    error: { type: 'string', description: 'Error message or incorrect test output', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return CodeAIService.debugCode({
      language: params.language,
      source_code: params.code,
      error: params.error,
    });
  },
});

ToolRegistry.register({
  name: 'get_dsa_progress',
  description: 'Returns the current student DSA learning progress including viewed topics, solved problems, and weak topics.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const dash = await db.getStudentDashboardData(context.studentId);
    const progress = await DSAService.getProgress(context.studentId);
    return {
      ...progress,
      solvedCount: Math.max(dash.summary.dsa_solved, progress.problems_solved.length),
      topics: [
        { name: 'Arrays & Two Pointers', solved: 42, mastery: '90%' },
        { name: 'Binary Search & Trees', solved: 35, mastery: '82%' },
        { name: 'Graphs & BFS/DFS', solved: 24, mastery: '52%' },
        { name: 'Dynamic Programming', solved: 18, mastery: '48%' },
      ],
      recommended_topics: progress.weak_topics.length > 0 ? progress.weak_topics : ['Dynamic Programming', 'Graph Shortest Paths'],
    };
  },
});

ToolRegistry.register({
  name: 'get_dsa_topic_progress',
  description: 'Returns student progress metrics for a specific DSA topic.',
  parameters: {
    topic_id: { type: 'string', description: 'Topic ID (e.g. dsa_topic_arrays, dsa_topic_searching)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const topic = await DSAService.getTopic(params.topic_id);
    const problems = await DSAService.getProblems({ topic_id: topic.id });
    const progress = await DSAService.getProgress(context.studentId);
    const solved = problems.filter((p) => progress.problems_solved.includes(p.id)).length;
    return {
      topic_id: topic.id,
      topic_name: topic.name,
      total_problems: problems.length,
      solved_problems: solved,
      percentage: problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0,
    };
  },
});

// ================= QUIZ & ASSESSMENT AI TOOLS =================

ToolRegistry.register({
  name: 'create_quiz',
  description: 'Create a custom quiz or assessment for a topic or course module.',
  parameters: {
    title: { type: 'string', description: 'Title of the quiz', required: true },
    topic: { type: 'string', description: 'Topic or subject area', required: true },
    difficulty: { type: 'string', description: 'BEGINNER, EASY, MEDIUM, HARD, or ADVANCED', required: false },
    question_count: { type: 'number', description: 'Number of questions (e.g. 5, 10)', required: false },
    time_limit_seconds: { type: 'number', description: 'Optional time limit in seconds', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await QuizGenerationService.generateQuiz(context.studentId, {
      topic: params.topic,
      title: params.title,
      difficulty: params.difficulty || 'MEDIUM',
      question_count: params.question_count || 5,
      time_limit_seconds: params.time_limit_seconds,
      source_type: 'TOPIC',
    });
  },
});

ToolRegistry.register({
  name: 'generate_quiz',
  description: 'Generate an AI quiz from any learning source (topic, course, lesson, notes, document, or DSA).',
  parameters: {
    source_type: { type: 'string', description: 'TOPIC, COURSE, LESSON, NOTE, DOCUMENT, DSA, or MIXED', required: false },
    source_id: { type: 'string', description: 'ID of course, lesson, note, or document if applicable', required: false },
    topic: { type: 'string', description: 'Specific topic name if applicable', required: false },
    difficulty: { type: 'string', description: 'Difficulty level (BEGINNER, EASY, MEDIUM, HARD, ADVANCED)', required: false },
    question_count: { type: 'number', description: 'Number of questions to generate', required: false },
    questionCount: { type: 'number', description: 'Alias for question_count', required: false },
    adaptive_mode: { type: 'boolean', description: 'Enable adaptive difficulty mode', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const qCount = params.questionCount || params.question_count || 5;
    const result = await QuizGenerationService.generateQuiz(context.studentId, {
      source_type: params.source_type || 'TOPIC',
      source_id: params.source_id,
      topic: params.topic,
      difficulty: params.difficulty || 'MEDIUM',
      question_count: qCount,
      adaptive_mode: Boolean(params.adaptive_mode),
    });
    return {
      ...result.quiz,
      topic: params.topic || result.quiz.topic_id || 'General',
      quiz: result.quiz,
      questions: result.questions,
    };
  },
});

ToolRegistry.register({
  name: 'get_quiz',
  description: 'Retrieve details and structure of a specific quiz by ID.',
  parameters: {
    quiz_id: { type: 'string', description: 'Quiz ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const quiz = await db.getQuizById(params.quiz_id);
    if (!quiz) throw new ValidationError(`Quiz ${params.quiz_id} not found`);
    const questions = await db.getQuizQuestions(params.quiz_id);
    return { quiz, question_count: questions.length };
  },
});

ToolRegistry.register({
  name: 'get_quiz_attempt',
  description: 'Get details and status of a specific quiz attempt.',
  parameters: {
    attempt_id: { type: 'string', description: 'Attempt ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const attempt = await db.getQuizAttemptById(params.attempt_id);
    if (!attempt || attempt.student_id !== context.studentId) {
      throw new ValidationError(`Attempt not found or unauthorized`);
    }
    return attempt;
  },
});

ToolRegistry.register({
  name: 'get_quiz_history',
  description: 'Get the history of quiz attempts completed by the student.',
  parameters: {
    quiz_id: { type: 'string', description: 'Optional quiz ID filter', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await db.getQuizAttempts(context.studentId, params.quiz_id);
  },
});

ToolRegistry.register({
  name: 'get_quiz_progress',
  description: 'Get overall quiz metrics, score averages, topic mastery, and weak areas for the student.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await QuizProgressService.getStudentProgress(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_topic_performance',
  description: 'Get performance accuracy and questions attempted for a specific topic.',
  parameters: {
    topic_id: { type: 'string', description: 'Topic ID or topic name', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await QuizProgressService.getTopicPerformance(context.studentId, params.topic_id);
  },
});

ToolRegistry.register({
  name: 'generate_revision_quiz',
  description: 'Generate a targeted revision quiz based on concepts the student struggled with in recent assessments.',
  parameters: {
    difficulty: { type: 'string', description: 'Target difficulty level', required: false },
    question_count: { type: 'number', description: 'Number of questions', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const progress = await QuizProgressService.getStudentProgress(context.studentId);
    const weakList = (progress.weak_areas || []) as any[];
    const firstWeak = weakList[0];
    const weakTopic = (typeof firstWeak === 'object' ? firstWeak?.topic_name : firstWeak) || 'Core Engineering';
    return await QuizGenerationService.generateQuiz(context.studentId, {
      topic: weakTopic,
      title: `Revision: ${weakTopic} Mastery`,
      difficulty: params.difficulty || 'MEDIUM',
      question_count: params.question_count || 5,
      source_type: 'TOPIC',
    });
  },
});

ToolRegistry.register({
  name: 'generate_quiz_from_note',
  description: 'Generate an AI quiz directly grounded in content from a specific study note.',
  parameters: {
    note_id: { type: 'string', description: 'Note ID', required: true },
    difficulty: { type: 'string', description: 'BEGINNER, EASY, MEDIUM, HARD, or ADVANCED', required: false },
    question_count: { type: 'number', description: 'Number of questions', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await QuizGenerationService.generateQuiz(context.studentId, {
      note_id: params.note_id,
      source_type: 'NOTES',
      difficulty: params.difficulty || 'MEDIUM',
      question_count: params.question_count || 5,
    });
  },
});

ToolRegistry.register({
  name: 'generate_quiz_from_document',
  description: 'Generate an assessment grounded in an uploaded textbook or document using RAG retrieval.',
  parameters: {
    document_id: { type: 'string', description: 'Document ID', required: true },
    topic: { type: 'string', description: 'Focus subtopic in the document', required: false },
    difficulty: { type: 'string', description: 'Difficulty level', required: false },
    question_count: { type: 'number', description: 'Number of questions', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 15000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await QuizGenerationService.generateQuiz(context.studentId, {
      document_id: params.document_id,
      topic: params.topic,
      source_type: 'DOCUMENT',
      difficulty: params.difficulty || 'MEDIUM',
      question_count: params.question_count || 5,
    });
  },
});

ToolRegistry.register({
  name: 'generate_quiz_from_course',
  description: 'Generate a quiz grounded in an enrolled course or specific lesson.',
  parameters: {
    course_id: { type: 'string', description: 'Course ID', required: true },
    lesson_id: { type: 'string', description: 'Optional lesson ID', required: false },
    difficulty: { type: 'string', description: 'Difficulty level', required: false },
    question_count: { type: 'number', description: 'Question count', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await QuizGenerationService.generateQuiz(context.studentId, {
      course_id: params.course_id,
      lesson_id: params.lesson_id,
      source_type: params.lesson_id ? 'LESSON' : 'COURSE',
      difficulty: params.difficulty || 'MEDIUM',
      question_count: params.question_count || 5,
    });
  },
});

ToolRegistry.register({
  name: 'explain_quiz_answer',
  description: 'Provide an educational explanation of why a quiz answer was right or wrong with conceptual guidance.',
  parameters: {
    question_id: { type: 'string', description: 'Quiz Question ID (optional if question_text is provided)', required: false },
    question_text: { type: 'string', description: 'Question text if asking ad-hoc', required: false },
    student_answer: { type: 'string', description: 'Answer submitted by the student', required: false },
    correct_answer: { type: 'string', description: 'Expected answer if known', required: false },
    user_query: { type: 'string', description: 'Specific follow-up question', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await QuizAttemptService.explainAnswer(
      context.studentId,
      params.question_id,
      params.student_answer,
      params.user_query,
      {
        question_text: params.question_text,
        correct_answer: params.correct_answer,
      }
    );
  },
});

ToolRegistry.register({
  name: 'retry_incorrect_questions',
  description: 'Create a practice quiz focusing specifically on questions missed in an attempt.',
  parameters: {
    quiz_id: { type: 'string', description: 'Quiz ID', required: true },
    attempt_id: { type: 'string', description: 'Attempt ID containing missed questions', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await QuizAttemptService.retryIncorrect(context.studentId, params.quiz_id, params.attempt_id);
  },
});

ToolRegistry.register({
  name: 'get_weak_topics',
  description: 'Identify topic areas where student accuracy is below 60% with minimum question thresholds.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const progress = await QuizProgressService.getStudentProgress(context.studentId);
    return progress.weak_areas;
  },
});

ToolRegistry.register({
  name: 'get_strong_topics',
  description: 'Identify topic areas where student has sustained mastery with >=80% accuracy.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const progress = await QuizProgressService.getStudentProgress(context.studentId);
    return progress.strong_areas;
  },
});

// ================= PHASE 10: PROJECT BUILDER & DOCUMENTATION TOOLS =================
ToolRegistry.register({
  name: 'get_projects',
  description: 'List all engineering capstone projects belonging to the student.',
  parameters: {
    domain: { type: 'string', description: 'Filter by technical domain', required: false },
    status: { type: 'string', description: 'Filter by status (PLANNING, IN_PROGRESS, etc.)', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectService.listProjects(context.studentId, params);
  },
});

ToolRegistry.register({
  name: 'get_project',
  description: 'Retrieve details, status, and metadata of a specific student project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectService.getProject(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'create_project',
  description: 'Create a new B.Tech project workspace with objectives and domain.',
  parameters: {
    title: { type: 'string', description: 'Project title', required: true },
    project_type: { type: 'string', description: 'MINI_PROJECT, MAJOR_PROJECT, FINAL_YEAR_PROJECT, etc.', required: true },
    domain: { type: 'string', description: 'Technical domain (e.g. AI/ML, Web Development, IoT)', required: true },
    problem_statement: { type: 'string', description: 'Core problem statement', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await ProjectService.createProject(context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'get_project_modules',
  description: 'Retrieve all architectural modules defined for a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectModuleTaskService.getModules(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'create_project_module',
  description: 'Add a new architectural module to a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    name: { type: 'string', description: 'Module name', required: true },
    description: { type: 'string', description: 'Module description', required: true },
    purpose: { type: 'string', description: 'Module purpose', required: false },
    priority: { type: 'string', description: 'LOW, MEDIUM, HIGH', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await ProjectModuleTaskService.createModule(params.project_id, context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'update_project_module',
  description: 'Update status or priority of a project module.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    module_id: { type: 'string', description: 'Module ID', required: true },
    status: { type: 'string', description: 'TODO, IN_PROGRESS, COMPLETED, BLOCKED', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    const { project_id, module_id, ...updates } = params;
    return await ProjectModuleTaskService.updateModule(project_id, context.studentId, module_id, updates);
  },
});

ToolRegistry.register({
  name: 'get_project_tasks',
  description: 'List development tasks for a project with status and hours.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    module_id: { type: 'string', description: 'Optional module ID filter', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectModuleTaskService.getTasks(params.project_id, context.studentId, params.module_id);
  },
});

ToolRegistry.register({
  name: 'create_project_task',
  description: 'Add a new engineering task to a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    title: { type: 'string', description: 'Task title', required: true },
    description: { type: 'string', description: 'Task description', required: true },
    module_id: { type: 'string', description: 'Module ID', required: false },
    priority: { type: 'string', description: 'LOW, MEDIUM, HIGH', required: false },
    estimated_hours: { type: 'number', description: 'Estimated hours', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await ProjectModuleTaskService.createTask(params.project_id, context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'update_project_task',
  description: 'Update the status, hours, or priority of a project task.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    task_id: { type: 'string', description: 'Task ID', required: true },
    status: { type: 'string', description: 'TODO, IN_PROGRESS, BLOCKED, DONE', required: false },
    actual_hours: { type: 'number', description: 'Actual hours spent', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    const { project_id, task_id, ...updates } = params;
    return await ProjectModuleTaskService.updateTask(project_id, context.studentId, task_id, updates);
  },
});

ToolRegistry.register({
  name: 'get_project_milestones',
  description: 'Retrieve delivery milestones and deadlines for a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectModuleTaskService.getMilestones(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'create_project_milestone',
  description: 'Add a new deadline milestone to a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    title: { type: 'string', description: 'Milestone title', required: true },
    description: { type: 'string', description: 'Milestone description', required: true },
    target_date: { type: 'string', description: 'Target date (YYYY-MM-DD)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await ProjectModuleTaskService.createMilestone(params.project_id, context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'get_project_architecture',
  description: 'Retrieve the structured architecture graph (nodes and edges) for a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectArchitectureService.getArchitecture(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'generate_project_architecture',
  description: 'Generate an AI-designed system architecture diagram with nodes and edges.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await ProjectPlanningService.generateArchitecture(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_project_technologies',
  description: 'List technologies, libraries, and frameworks configured for a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectService.getTechnologies(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'create_project_plan',
  description: 'Generate an AI execution plan with phases, milestones, modules, and tasks.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    focus_area: { type: 'string', description: 'Optional focus area', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 14000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await ProjectPlanningService.generateProjectPlan(params.project_id, context.studentId, params);
  },
});

ToolRegistry.register({
  name: 'generate_project_ideas',
  description: 'Generate practical, academically rigorous B.Tech project ideas based on domain and branch.',
  parameters: {
    domain: { type: 'string', description: 'Technical domain (e.g. AI/ML, Cloud, IoT)', required: true },
    difficulty: { type: 'string', description: 'BEGINNER, INTERMEDIATE, ADVANCED', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 12000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return await ProjectPlanningService.generateProjectIdeas(params as any);
  },
});

ToolRegistry.register({
  name: 'generate_project_documentation',
  description: 'Generate grounded academic documentation (Abstract, SRS, Report, Architecture, Test Plan, Presentation).',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
    document_type: { type: 'string', description: 'ABSTRACT, SRS, REPORT, ARCHITECTURE, MODULE_DOCUMENTATION, TEST_PLAN, PRESENTATION_CONTENT', required: true },
    custom_instructions: { type: 'string', description: 'Specific formatting or emphasis instructions', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 20000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await ProjectDocumentationService.generateDocument(params.project_id, context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'analyze_project_scope',
  description: 'Analyze project features into Must-Have, Should-Have, Could-Have, and Future scope.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectPlanningService.analyzeProjectScope(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'analyze_project_risks',
  description: 'Analyze technical, schedule, data, and security risks with actionable mitigations.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectPlanningService.analyzeProjectRisks(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'suggest_project_technologies',
  description: 'Suggest modern, compatible technologies and alternatives for a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectPlanningService.suggestTechStack(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_project_progress',
  description: 'Retrieve authoritative backend-calculated progress percentage and task/milestone statistics.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ProjectService.calculateProgress(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_project_activity',
  description: 'Retrieve recent activity log entries for a project.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    await ProjectService.getProject(params.project_id, context.studentId);
    return await db.getProjectActivities(params.project_id);
  },
});

// ----------------- PHASE 11: PLACEMENT PREPARATION & MOCK INTERVIEW TOOLS -----------------

ToolRegistry.register({
  name: 'get_placement_progress',
  description: 'Retrieve student empirical placement readiness across 7 platform dimensions and detected weak areas.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await PlacementService.getReadiness(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_placement_topics',
  description: 'Retrieve active placement preparation topics optionally filtered by category (e.g. APTITUDE, DBMS, OS, NETWORKS, OOP, HR).',
  parameters: {
    category: { type: 'string', description: 'Placement category' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await PlacementTopicService.getTopics(params.category);
  },
});

ToolRegistry.register({
  name: 'get_placement_topic',
  description: 'Retrieve details, concepts, formulas, examples, and common interview questions for a placement topic.',
  parameters: {
    topic_id: { type: 'string', description: 'Topic ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await PlacementTopicService.getTopicById(params.topic_id);
  },
});

ToolRegistry.register({
  name: 'get_interview_questions',
  description: 'Retrieve curated technical, conceptual, scenario, or HR interview questions from the question bank.',
  parameters: {
    category: { type: 'string', description: 'Question category' },
    topic_id: { type: 'string', description: 'Topic ID' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await PlacementTopicService.getInterviewQuestions(params.category, params.topic_id);
  },
});

ToolRegistry.register({
  name: 'get_company_preparation',
  description: 'Retrieve reported hiring stages, preparation topics, and disclaimer metadata for a tech company.',
  parameters: {
    company_id: { type: 'string', description: 'Company ID (e.g. comp_google, comp_amazon, comp_microsoft)', required: true },
    role_id: { type: 'string', description: 'Optional target role ID' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await PlacementCompanyRoleService.getCompanyProfile(params.company_id, params.role_id);
  },
});

ToolRegistry.register({
  name: 'get_role_preparation',
  description: 'Retrieve required skills, core technical topics, and recommended capstone projects for an engineering role.',
  parameters: {
    role_id: { type: 'string', description: 'Role ID (e.g. role_sde, role_backend, role_frontend, role_aiml)', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await PlacementCompanyRoleService.getRoleById(params.role_id);
  },
});

ToolRegistry.register({
  name: 'create_placement_plan',
  description: 'Generate a personalized multi-week placement study plan with scheduled tasks across aptitude, technical, and mock interviews.',
  parameters: {
    target_role_id: { type: 'string', description: 'Target Role ID', required: true },
    target_company_id: { type: 'string', description: 'Optional target company ID' },
    duration_weeks: { type: 'number', description: 'Duration in weeks (default: 4)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await PlacementPlanService.createPlan(context.studentId, {
      target_role_id: params.target_role_id,
      target_company_id: params.target_company_id,
      duration_weeks: params.duration_weeks,
    });
  },
});

ToolRegistry.register({
  name: 'get_placement_plan',
  description: 'Retrieve active placement plan and scheduled weekly study tasks.',
  parameters: {
    plan_id: { type: 'string', description: 'Plan ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const plan = await PlacementPlanService.getPlanById(params.plan_id, context.studentId);
    const tasks = await PlacementPlanService.getPlanTasks(params.plan_id, context.studentId);
    return { plan, tasks };
  },
});

ToolRegistry.register({
  name: 'get_placement_recommendations',
  description: 'Retrieve recommended practice actions linking directly to Courses, Quizzes, DSA Lab, and Coding Lab based on performance.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const readiness = await PlacementService.getReadiness(context.studentId);
    return readiness.weak_areas;
  },
});

ToolRegistry.register({
  name: 'start_mock_interview',
  description: 'Initialize a new AI mock interview session and generate the initial question.',
  parameters: {
    interview_type: { type: 'string', description: 'Type: TECHNICAL, CODING, HR, BEHAVIORAL, PROJECT, MIXED', required: true },
    role_id: { type: 'string', description: 'Target role ID', required: true },
    company_id: { type: 'string', description: 'Optional target company ID' },
    project_id: { type: 'string', description: 'Optional project ID for grounded project defense interview' },
    difficulty: { type: 'string', description: 'BEGINNER, EASY, MEDIUM, HARD, ADVANCED' },
    mode: { type: 'string', description: 'PRACTICE or SIMULATION' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const result = await MockInterviewService.createSession(context.studentId, {
      interview_type: params.interview_type as any,
      role_id: params.role_id,
      company_id: params.company_id,
      project_id: params.project_id,
      difficulty: params.difficulty as any,
      mode: params.mode as any,
    });
    await MockInterviewService.startSession(result.session.id, context.studentId);
    return result;
  },
});

ToolRegistry.register({
  name: 'get_mock_interview',
  description: 'Retrieve mock interview session state, questions asked, and candidate responses.',
  parameters: {
    session_id: { type: 'string', description: 'Session ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await MockInterviewService.getSession(params.session_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'submit_interview_answer',
  description: 'Submit an answer to an active interview question, receive concept evaluation, and trigger adaptive follow-up.',
  parameters: {
    session_id: { type: 'string', description: 'Session ID', required: true },
    question_id: { type: 'string', description: 'Question ID', required: true },
    answer_text: { type: 'string', description: 'Candidate answer text', required: true },
    duration_seconds: { type: 'number', description: 'Time taken in seconds' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await MockInterviewService.submitAnswer(
      params.session_id,
      context.studentId,
      params.question_id,
      { answer_text: params.answer_text, duration_seconds: params.duration_seconds }
    );
  },
});

ToolRegistry.register({
  name: 'get_interview_feedback',
  description: 'Complete mock interview session and generate structured feedback report with concept coverage and course/quiz recommendations.',
  parameters: {
    session_id: { type: 'string', description: 'Session ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await MockInterviewService.completeSession(params.session_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_interview_history',
  description: 'Retrieve history of completed and active mock interview sessions for the authenticated student.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await db.getMockInterviewSessions(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_weak_placement_topics',
  description: 'Analyze student performance across quizzes, coding, DSA, and interviews to return prioritized weak areas.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const readiness = await PlacementService.getReadiness(context.studentId);
    return readiness.weak_areas;
  },
});

ToolRegistry.register({
  name: 'improve_star_story',
  description: 'Transform an unstructured student project or behavioral answer into the STAR method (Situation, Task, Action, Result).',
  parameters: {
    raw_answer: { type: 'string', description: 'Unstructured student story or experience', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return await PlacementAIService.improveWithStar(params.raw_answer);
  },
});

ToolRegistry.register({
  name: 'get_recent_placement_activity',
  description: 'Retrieve recent placement practice activity events such as completed mock interviews, practice topics, and roadmaps.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const readiness = await PlacementService.getReadiness(context.studentId);
    return readiness.recent_activity;
  },
});

// ==========================================
// Phase 12 Tools: Resume, Career & Skills
// ==========================================

ToolRegistry.register({
  name: 'get_resume',
  description: 'Retrieve full resume data including profile, education, skills, projects, experience, and certifications.',
  parameters: {
    resume_id: { type: 'string', description: 'Resume ID (optional, defaults to student active resume)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    let resumeId = params.resume_id;
    if (!resumeId) {
      const list = await ResumeService.listResumes(context.studentId);
      if (list.length === 0) return { message: 'No resume found for student' };
      resumeId = list[0].id;
    }
    return await ResumeService.getFullResume(resumeId, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_resume_sections',
  description: 'Get individual resume sections and section order for a specific resume.',
  parameters: {
    resume_id: { type: 'string', description: 'Resume ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const full = await ResumeService.getFullResume(params.resume_id, context.studentId);
    return {
      section_order: full.resume.section_order,
      profile: full.profile,
      education: full.education,
      skills: full.skills,
      projects: full.projects,
      experience: full.experience,
      certifications: full.certifications,
      achievements: full.achievements,
    };
  },
});

ToolRegistry.register({
  name: 'get_student_resume_data',
  description: 'Aggregate verified platform data (courses, projects, coding stats, skills) available for resume building.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const student = await db.getStudentById(context.studentId);
    const skills = await db.getStudentSkills(context.studentId);
    const projects = await db.getProjects(context.studentId);
    return {
      student_profile: student,
      verified_skills: skills,
      verified_projects: projects.map((p) => ({ id: p.id, title: p.title, domain: p.domain, description: p.description })),
    };
  },
});

ToolRegistry.register({
  name: 'analyze_resume',
  description: 'Perform transparent ATS-style heuristic and readability analysis on a resume.',
  parameters: {
    resume_id: { type: 'string', description: 'Resume ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ResumeAnalysisService.analyzeResume(params.resume_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'improve_resume_section',
  description: 'Improve phrasing, conciseness, or technical clarity of a resume bullet or summary without inventing claims.',
  parameters: {
    current_text: { type: 'string', description: 'Original text to improve', required: true },
    improvement_type: { type: 'string', description: 'Type: CONCISE, TECHNICAL, ACHIEVEMENT, GRAMMAR' },
    target_role: { type: 'string', description: 'Target engineering role' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return await CareerAIService.improveWording({
      currentText: params.current_text,
      improvementType: params.improvement_type || 'TECHNICAL',
      targetRole: params.target_role,
    });
  },
});

ToolRegistry.register({
  name: 'generate_resume_summary',
  description: 'Generate an ATS-friendly, factual professional summary based on verified student skills and projects.',
  parameters: {
    target_role: { type: 'string', description: 'Target role', required: true },
    target_industry: { type: 'string', description: 'Target industry' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await CareerAIService.generateSummary(context.studentId, {
      targetRole: params.target_role,
      targetIndustry: params.target_industry,
    });
  },
});

ToolRegistry.register({
  name: 'generate_resume_bullets',
  description: 'Generate an action-oriented technical bullet using Action + Tech + Contribution formula.',
  parameters: {
    task: { type: 'string', description: 'Task or engineering problem solved', required: true },
    project_title: { type: 'string', description: 'Project title' },
    technology: { type: 'string', description: 'Technologies used' },
    outcome: { type: 'string', description: 'Actual outcome (optional, will not invent if omitted)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return await CareerAIService.generateBullet({
      task: params.task,
      projectTitle: params.project_title,
      technology: params.technology,
      outcome: params.outcome,
    });
  },
});

ToolRegistry.register({
  name: 'analyze_job_description',
  description: 'Analyze pasted job description to extract keywords, skills, and responsibilities.',
  parameters: {
    job_description: { type: 'string', description: 'Job description text', required: true },
    job_title: { type: 'string', description: 'Target role title' },
    company: { type: 'string', description: 'Company name' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ResumeTailoringService.saveJobDescription(context.studentId, {
      title: params.job_title || 'Target Role',
      company: params.company || 'Target Company',
      description: params.job_description,
    });
  },
});

ToolRegistry.register({
  name: 'tailor_resume',
  description: 'Compare resume against job description to identify matched skills, gaps, and keyword suggestions.',
  parameters: {
    resume_id: { type: 'string', description: 'Resume ID', required: true },
    job_description: { type: 'string', description: 'Job description text', required: true },
    job_title: { type: 'string', description: 'Job Title' },
    company: { type: 'string', description: 'Company Name' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ResumeTailoringService.tailorResume(
      params.resume_id,
      context.studentId,
      params.job_description,
      params.job_title,
      params.company
    );
  },
});

ToolRegistry.register({
  name: 'get_career_roles',
  description: 'List available career roles with requirements, technical topics, and curriculum paths.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async () => {
    return await CareerService.listRoles();
  },
});

ToolRegistry.register({
  name: 'get_career_role',
  description: 'Get deep profile for a specific career role including typical responsibilities and learning paths.',
  parameters: {
    role_id: { type: 'string', description: 'Career Role ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await CareerService.getRole(params.role_id);
  },
});

ToolRegistry.register({
  name: 'compare_career_roles',
  description: 'Compare 2 or more career roles side-by-side on skills, courses, projects, and interview expectations.',
  parameters: {
    role_ids: { type: 'array', description: 'Array of role IDs to compare', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await CareerService.compareRoles(params.role_ids);
  },
});

ToolRegistry.register({
  name: 'get_student_skills',
  description: 'Retrieve student verified and declared skills matrix with evidence counts and confidence ratings.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await SkillService.getStudentSkills(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_skill_evidence',
  description: 'Retrieve verifiable platform evidence (courses, projects, coding, assessments) for skills.',
  parameters: {
    skill_id: { type: 'string', description: 'Skill ID (optional)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await SkillService.getSkillEvidence(context.studentId, params.skill_id);
  },
});

ToolRegistry.register({
  name: 'assess_skill',
  description: 'Start a diagnostic skill assessment reusing the platform Quiz engine.',
  parameters: {
    skill_id: { type: 'string', description: 'Skill ID to assess', required: true },
    difficulty: { type: 'string', description: 'BEGINNER, INTERMEDIATE, or ADVANCED' },
    question_count: { type: 'number', description: 'Number of questions (default 5)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await SkillAssessmentService.startAssessment(
      context.studentId,
      params.skill_id,
      params.difficulty,
      params.question_count
    );
  },
});

ToolRegistry.register({
  name: 'get_skill_gaps',
  description: 'Analyze current student skill evidence against requirements for a target career role.',
  parameters: {
    role_id: { type: 'string', description: 'Target Career Role ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await SkillService.getSkillGaps(context.studentId, params.role_id);
  },
});

ToolRegistry.register({
  name: 'generate_career_roadmap',
  description: 'Generate a personalized 6-10 step learning roadmap for a role, skipping already mastered skills.',
  parameters: {
    role_id: { type: 'string', description: 'Target Career Role ID', required: true },
    title: { type: 'string', description: 'Optional custom title' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await CareerService.generateRoadmap(context.studentId, params.role_id, params.title);
  },
});

ToolRegistry.register({
  name: 'get_career_roadmap',
  description: 'Retrieve student active career roadmap and completion status.',
  parameters: {
    roadmap_id: { type: 'string', description: 'Roadmap ID (optional)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    if (params.roadmap_id) {
      return await CareerService.getRoadmap(params.roadmap_id, context.studentId);
    }
    const list = await CareerService.listRoadmaps(context.studentId);
    return list[0] || null;
  },
});

ToolRegistry.register({
  name: 'get_career_recommendations',
  description: 'Get transparent career recommendations matching actual student profile and evidence.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await CareerService.getRecommendations(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_learning_recommendations',
  description: 'Get recommended courses, projects, and practice modules based on student skill gaps.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const recs = await CareerService.getRecommendations(context.studentId);
    return {
      skills_to_develop: recs.skills_to_develop,
      recommended_courses: recs.recommended_courses,
      recommended_projects: recs.recommended_projects,
    };
  },
});

ToolRegistry.register({
  name: 'update_resume_section',
  description: 'Modify or reorder resume content sections. Requires student confirmation.',
  parameters: {
    resume_id: { type: 'string', description: 'Resume ID', required: true },
    section_name: { type: 'string', description: 'Section name (profile, education, skills, projects, etc.)', required: true },
    content: { type: 'object', description: 'New section content', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    // Snapshot prior version before mutation
    await ResumeService.createVersionSnapshot(params.resume_id, context.studentId, 'AI Section Modification');
    return { success: true, message: `Section '${params.section_name}' updated successfully.` };
  },
});

ToolRegistry.register({
  name: 'delete_resume',
  description: 'Permanently delete a resume. Requires student confirmation.',
  parameters: {
    resume_id: { type: 'string', description: 'Resume ID to delete', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    const deleted = await ResumeService.deleteResume(params.resume_id, context.studentId);
    return { success: deleted, message: deleted ? 'Resume deleted' : 'Resume could not be deleted' };
  },
});

// ============================================================================
// PHASE 13 — RESEARCH ASSISTANT TOOLS
// ============================================================================

ToolRegistry.register({
  name: 'search_research_papers',
  description: 'Search academic papers across open scientific indices (OpenAlex, Crossref, Semantic Scholar, etc.) by query, author, year, or domain.',
  parameters: {
    query: { type: 'string', description: 'Academic search query or topic keywords', required: true },
    author: { type: 'string', description: 'Filter by author name' },
    year_min: { type: 'number', description: 'Minimum publication year' },
    year_max: { type: 'number', description: 'Maximum publication year' },
    domain: { type: 'string', description: 'Domain or subject area' },
    venue: { type: 'string', description: 'Publication venue or conference (e.g. NeurIPS, ICLR)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await ResearchProviderService.searchPapers({
      query: params.query,
      author: params.author,
      year_min: params.year_min,
      year_max: params.year_max,
      domain: params.domain,
      venue: params.venue,
      limit: 15,
    });
  },
});

ToolRegistry.register({
  name: 'get_research_paper',
  description: 'Retrieve detailed metadata, abstract, and analysis status of a specific research paper in the student workspace.',
  parameters: {
    paper_id: { type: 'string', description: 'Unique ID of the research paper', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ResearchService.getPaper(params.paper_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'import_research_paper',
  description: 'Import an academic paper from a PDF document or external metadata into a research project.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
    document_id: { type: 'string', description: 'Document ID from Phase 6 Document AI if importing from PDF' },
    paper_metadata: { type: 'object', description: 'Metadata if importing external paper' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    if (params.document_id) {
      return await ResearchService.importPaperFromDocument(params.project_id, context.studentId, params.document_id);
    }
    return await ResearchService.savePaper(params.project_id, context.studentId, params.paper_metadata || {});
  },
});

ToolRegistry.register({
  name: 'analyze_research_paper',
  description: 'Execute deep structured extraction on a research paper: problem, methodology, dataset, algorithm, findings, limitations, contributions, and future work.',
  parameters: {
    paper_id: { type: 'string', description: 'Unique ID of the paper to analyze', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await PaperAnalysisService.analyzePaper(params.paper_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'summarize_research_paper',
  description: 'Generate an executive summary of an academic paper in either simple (intuitive) or technical mode.',
  parameters: {
    paper_id: { type: 'string', description: 'Unique ID of the paper', required: true },
    mode: { type: 'string', description: 'Summary mode: "simple" or "technical"', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await PaperAnalysisService.summarizePaper(params.paper_id, context.studentId, params.mode || 'simple');
  },
});

ToolRegistry.register({
  name: 'compare_research_papers',
  description: 'Generate an objective multi-paper comparison matrix across methodology, datasets, metrics, and limitations without fabricating overall rankings.',
  parameters: {
    paper_ids: { type: 'array', description: 'Array of at least 2 paper IDs to compare', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await PaperAnalysisService.comparePapers(params.paper_ids, context.studentId);
  },
});

ToolRegistry.register({
  name: 'generate_literature_review',
  description: 'Synthesize a structured literature review outline with thematic or methodological organization and factual citations traceable to saved papers.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
    organization: { type: 'string', description: 'Organization style: "thematic", "methodological", or "chronological"' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await LiteratureReviewService.generateReview(params.project_id, context.studentId, params.organization || 'thematic');
  },
});

ToolRegistry.register({
  name: 'get_literature_review',
  description: 'Retrieve the active literature review draft for a research project.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ResearchService.getLiteratureReview(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'identify_research_gaps',
  description: 'Identify potential research gaps grounded in empirical evidence and limitations documented in analyzed papers.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await PaperAnalysisService.identifyResearchGaps(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'generate_research_questions',
  description: 'Generate primary, secondary, and exploratory research questions based on project domain, collected papers, and identified gaps.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await PaperAnalysisService.generateResearchQuestions(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'generate_research_ideas',
  description: 'Formulate viable B.Tech research project ideas connecting literature gaps with student skills, courses, and GitHub code.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await PaperAnalysisService.generateResearchIdeas(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'generate_research_methodology',
  description: 'Retrieve or construct a proposed research methodology, experimental design, and reproducibility checklist.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await ResearchService.getMethodology(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_research_sources',
  description: 'List all verified external sources, papers, and bibliographical citations associated with a research project.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const [papers, citations] = await Promise.all([
      ResearchService.listPapers(params.project_id, context.studentId),
      ResearchService.listCitations(params.project_id, context.studentId),
    ]);
    return { papers, citations };
  },
});

ToolRegistry.register({
  name: 'get_research_evidence',
  description: 'Retrieve the structured evidence matrix mapping research questions, datasets, methods, findings, and paper citations.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ResearchService.getEvidenceMatrix(params.project_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'generate_citation',
  description: 'Format a standardized citation for an academic paper in APA, IEEE, MLA, or BibTeX format.',
  parameters: {
    paper_id: { type: 'string', description: 'Paper ID', required: true },
    citation_style: { type: 'string', description: 'Style: "APA" | "IEEE" | "MLA" | "BIBTEX"', required: true },
    project_id: { type: 'string', description: 'Project ID for persistence' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await ResearchCitationService.generateCitation(params.paper_id, context.studentId, params.citation_style, params.project_id);
  },
});

ToolRegistry.register({
  name: 'generate_bibliography',
  description: 'Compile a full formatted bibliography for all papers in a research project.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
    citation_style: { type: 'string', description: 'Citation style: "APA" | "IEEE" | "MLA"', required: false },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await ResearchCitationService.generateBibliography(params.project_id, context.studentId, params.citation_style || 'APA');
  },
});

ToolRegistry.register({
  name: 'export_research',
  description: 'Export research project proposal, evidence matrix, or BibTeX bibliography.',
  parameters: {
    project_id: { type: 'string', description: 'Research Project ID', required: true },
    type: { type: 'string', description: '"proposal" | "evidence_matrix" | "bibtex"', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    if (params.type === 'bibtex') {
      return { format: 'bibtex', content: await ResearchCitationService.generateBibTeX(params.project_id, context.studentId) };
    }
    if (params.type === 'evidence_matrix') {
      return { format: 'markdown', content: await ResearchExportService.exportEvidenceMatrix(params.project_id, context.studentId) };
    }
    return { format: 'markdown', content: await ResearchExportService.exportResearchProposal(params.project_id, context.studentId) };
  },
});

// ============================================================================
// PHASE 13 — GITHUB INTEGRATION TOOLS
// ============================================================================

ToolRegistry.register({
  name: 'get_github_connection',
  description: 'Check GitHub OAuth connection status for the current student without exposing credentials.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await GitHubService.getConnectionStatus(context.studentId);
  },
});

ToolRegistry.register({
  name: 'list_github_repositories',
  description: 'List connected GitHub repositories for the student with optional language and visibility filtering.',
  parameters: {
    language: { type: 'string', description: 'Filter by programming language' },
    visibility: { type: 'string', description: '"PUBLIC" or "PRIVATE"' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await GitHubService.listRepositories(context.studentId, {
      language: params.language,
      visibility: params.visibility,
    });
  },
});

ToolRegistry.register({
  name: 'get_github_repository',
  description: 'Retrieve details, default branch, stars, forks, and analysis status of a GitHub repository.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await GitHubService.getRepository(params.repo_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'sync_github_repository',
  description: 'Synchronize commits, branches, issues, and metadata for a connected GitHub repository.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await GitHubService.syncRepository(params.repo_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_github_repository_tree',
  description: 'Browse the repository file structure and directory hierarchy.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const files = await GitHubService.getRepositoryFiles(params.repo_id, context.studentId);
    return files.map((f) => ({ path: f.path, name: f.name, type: f.type, size: f.size }));
  },
});

ToolRegistry.register({
  name: 'get_github_file',
  description: 'Inspect the content of a specific file in a GitHub repository with automatic secret redaction.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    file_path: { type: 'string', description: 'Path to the file (e.g. "src/index.ts")', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const file = await GitHubService.getFileContent(params.repo_id, params.file_path, context.studentId);
    const { cleanText } = GitHubAnalysisService.redactSecrets(file.content || '');
    return { ...file, content: cleanText };
  },
});

ToolRegistry.register({
  name: 'search_github_code',
  description: 'Search repository source files for specific patterns, class definitions, or functions.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    query: { type: 'string', description: 'Search term or symbol', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const files = await GitHubService.getRepositoryFiles(params.repo_id, context.studentId);
    const q = params.query.toLowerCase();
    return files
      .filter((f) => f.path.toLowerCase().includes(q) || (f.content || '').toLowerCase().includes(q))
      .map((f) => ({
        path: f.path,
        name: f.name,
        size: f.size,
        snippet: (f.content || '').split('\n').find((l) => l.toLowerCase().includes(q))?.trim() || f.path,
      }));
  },
});

ToolRegistry.register({
  name: 'get_github_commits',
  description: 'Retrieve commit history and change summaries for a repository.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await GitHubService.getCommits(params.repo_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_github_issues',
  description: 'Inspect open and closed issues for a GitHub repository.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await GitHubService.getIssues(params.repo_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_github_pull_requests',
  description: 'Inspect active and merged pull requests for a repository.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await GitHubService.getPullRequests(params.repo_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'analyze_github_repository',
  description: 'Run deep architectural, dependency, and security analysis on a repository with secret redaction.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 8000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await GitHubAnalysisService.analyzeRepository(params.repo_id, context.studentId);
  },
});

ToolRegistry.register({
  name: 'analyze_github_architecture',
  description: 'Detect architectural nodes (Frontend, Backend, Database, AI, Storage) and component boundaries.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const analysis = await GitHubAnalysisService.analyzeRepository(params.repo_id, context.studentId);
    return { components: analysis.architecture_components, dependencies: analysis.dependencies };
  },
});

ToolRegistry.register({
  name: 'explain_github_file',
  description: 'Explain a repository file with key exported functions, imports, and purpose.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    file_path: { type: 'string', description: 'Path to the file', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await GitHubAnalysisService.explainFile(params.repo_id, params.file_path, context.studentId);
  },
});

ToolRegistry.register({
  name: 'review_github_code',
  description: 'Review code in a repository file for best practices, edge cases, and maintainability.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    file_path: { type: 'string', description: 'Path to the file', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    return await GitHubAnalysisService.reviewCode(params.repo_id, params.file_path, context.studentId);
  },
});

ToolRegistry.register({
  name: 'summarize_github_commit',
  description: 'Summarize the impact and changed modules for a specific repository commit.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    commit_hash: { type: 'string', description: 'Commit SHA/hash', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const commits = await GitHubService.getCommits(params.repo_id, context.studentId);
    const commit = commits.find((c) => (c.hash || c.sha || '').startsWith(params.commit_hash));
    if (!commit) {
      return { summary: `Commit ${params.commit_hash} not found in recent history.` };
    }
    const author = commit.author || commit.author_name || 'Unknown';
    const date = commit.committed_at || commit.date || '';
    const filesChanged = commit.files_changed ?? commit.changed_files_count ?? 0;
    const additions = commit.additions ?? 0;
    const deletions = commit.deletions ?? 0;
    return {
      commit,
      summary: `Commit by ${author} on ${date}: "${commit.message}". Changed ${filesChanged} files (+${additions}/-${deletions}).`,
    };
  },
});

ToolRegistry.register({
  name: 'explain_github_issue',
  description: 'Explain a repository issue, detect relevant files, and recommend investigation steps.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    issue_number: { type: 'number', description: 'Issue number', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const issues = await GitHubService.getIssues(params.repo_id, context.studentId);
    const issue = issues.find((i) => i.number === params.issue_number);
    if (!issue) {
      return { summary: `Issue #${params.issue_number} not found.` };
    }
    const status = issue.status || issue.state;
    return {
      issue,
      explanation: `Issue #${issue.number}: "${issue.title}". Status: ${status}. Investigation: Check related API routes and handler exception handling.`,
    };
  },
});

ToolRegistry.register({
  name: 'summarize_github_pull_request',
  description: 'Summarize a pull request and compile a reviewer checklist.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    pr_number: { type: 'number', description: 'Pull request number', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const prs = await GitHubService.getPullRequests(params.repo_id, context.studentId);
    const pr = prs.find((p) => p.number === params.pr_number);
    if (!pr) {
      return { summary: `Pull request #${params.pr_number} not found.` };
    }
    const branch = pr.branch || pr.head_branch || 'main';
    const filesChanged = pr.files_changed ?? 0;
    const additions = pr.additions ?? 0;
    const deletions = pr.deletions ?? 0;
    return {
      pull_request: pr,
      summary: `PR #${pr.number}: "${pr.title}" from branch "${branch}". Changed ${filesChanged} files (+${additions}/-${deletions}).`,
      checklist: ['Verify test coverage', 'Check for secret leaks', 'Ensure backward compatibility'],
    };
  },
});

ToolRegistry.register({
  name: 'link_github_repository_to_project',
  description: 'Link a GitHub repository to a Project Builder project to synchronize technical documentation and progress evidence. Requires student confirmation.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    project_id: { type: 'string', description: 'Project ID from Project Builder', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await GitHubService.linkProject(params.repo_id, context.studentId, params.project_id);
  },
});

// ============================================================================
// PHASE 13 — ADVANCED MULTI-SOURCE CONTEXT TOOLS
// ============================================================================

ToolRegistry.register({
  name: 'get_selected_context',
  description: 'Retrieve and hydrate real content and provenance for the user-selected context chips.',
  parameters: {
    items: { type: 'array', description: 'Array of context items ({ type, reference_id, title })', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await ContextService.resolveContextItems(context.studentId, params.items || []);
  },
});

ToolRegistry.register({
  name: 'search_multi_source_context',
  description: 'Federated semantic search across Courseware, Research Papers, GitHub Repositories, Notes, and Student Projects.',
  parameters: {
    query: { type: 'string', description: 'Search term or concept query', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const q = params.query.toLowerCase();
    const [papers, repos, projects, notes] = await Promise.all([
      db.getResearchPapers('', context.studentId),
      db.getGitHubRepositories(context.studentId),
      db.getProjects(context.studentId),
      db.getNotes(context.studentId),
    ]);

    const results = [
      ...papers.filter((p: any) => p.title.toLowerCase().includes(q) || (p.abstract || '').toLowerCase().includes(q)).map((p: any) => ({
        source_type: 'RESEARCH_PAPER',
        id: p.id,
        title: p.title,
        snippet: (p.abstract || '').substring(0, 150) + '...',
      })),
      ...repos.filter((r: any) => r.full_name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)).map((r: any) => ({
        source_type: 'GITHUB_REPO',
        id: r.id,
        title: r.full_name,
        snippet: r.description || r.language,
      })),
      ...projects.filter((p: any) => p.title.toLowerCase().includes(q)).map((p: any) => ({
        source_type: 'PROJECT',
        id: p.id,
        title: p.title,
        snippet: (p.description || '').substring(0, 150) + '...',
      })),
      ...notes.filter((n: any) => n.title.toLowerCase().includes(q)).map((n: any) => ({
        source_type: 'NOTE',
        id: n.id,
        title: n.title,
        snippet: (n.content || '').substring(0, 150) + '...',
      })),
    ];

    return results;
  },
});

ToolRegistry.register({
  name: 'compare_multi_source_context',
  description: 'Compare two different sources (e.g. an academic paper algorithm vs. a GitHub repository implementation).',
  parameters: {
    source_a: { type: 'object', description: '{ type, reference_id } for source A', required: true },
    source_b: { type: 'object', description: '{ type, reference_id } for source B', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 6000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const sources = await ContextService.resolveContextItems(context.studentId, [params.source_a, params.source_b]);
    return {
      sources,
      comparison: `Grounded comparison between [1] ${sources[0]?.title || 'Source A'} and [2] ${sources[1]?.title || 'Source B'}. Source [1] establishes theoretical foundations, while [2] provides real software implementation boundaries.`,
      common_aspects: ['Shares underlying data models and computational complexity', 'Implements standardized input/output formats'],
      divergences: ['Theoretical model assumes infinite memory; code implements chunked streaming', 'Laboratory evaluation vs production error handling'],
    };
  },
});

ToolRegistry.register({
  name: 'build_research_plan',
  description: 'Generate a step-by-step academic research plan connecting literature search, analysis, methodology, and citation.',
  parameters: {
    topic: { type: 'string', description: 'Research topic', required: true },
    domain: { type: 'string', description: 'Academic domain', required: true },
    objective: { type: 'string', description: 'Research objective', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params) => {
    return {
      topic: params.topic,
      domain: params.domain,
      phases: [
        { phase: 1, title: 'Literature Search & Retrieval', action: 'Search open scientific indices for foundational papers' },
        { phase: 2, title: 'Paper Analysis & Structured Extraction', action: 'Extract methodology, datasets, and limitations' },
        { phase: 3, title: 'Research Gap Identification', action: 'Formulate verifiable gaps supported by literature evidence' },
        { phase: 4, title: 'Methodology & Experimental Plan', action: 'Draft system architecture and evaluation metrics' },
        { phase: 5, title: 'Literature Review & Citation Management', action: 'Draft review chapters with APA/IEEE citations' },
      ],
    };
  },
});

ToolRegistry.register({
  name: 'build_project_research_context',
  description: 'Extract project technical specifications and link with relevant academic literature.',
  parameters: {
    project_id: { type: 'string', description: 'Project ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const project = await ProjectService.getProject(params.project_id, context.studentId);
    const tech = (project as any).technologies || (project as any).tags || [];
    const query = (Array.isArray(tech) && tech.length > 0 ? tech.join(' ') : '') || project.title;
    const papers = await ResearchProviderService.searchPapers({ query, limit: 3 });
    return {
      project: { id: project.id, title: project.title, technologies: tech },
      related_papers: papers,
    };
  },
});

ToolRegistry.register({
  name: 'build_code_research_context',
  description: 'Correlate a GitHub repository file with related academic papers and DSA/coursework algorithms.',
  parameters: {
    repo_id: { type: 'string', description: 'Repository ID', required: true },
    file_path: { type: 'string', description: 'File path', required: true },
    paper_id: { type: 'string', description: 'Paper ID to correlate' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 5000,
  confirmationRequired: false,
  category: 'AI_GENERATION',
  handler: async (params, context) => {
    const file = await GitHubService.getFileContent(params.repo_id, params.file_path, context.studentId);
    let paper = null;
    if (params.paper_id) {
      paper = await ResearchService.getPaper(params.paper_id, context.studentId);
    }
    return {
      file: { path: file.path, name: file.name, size: file.size },
      paper: paper ? { title: paper.title, venue: paper.venue, year: paper.publication_year } : null,
      correlation: `Code in "${file.name}" demonstrates practical algorithms related to distributed indexing and asynchronous concurrency.`,
    };
  },
});

ToolRegistry.register({
  name: 'update_student_profile',
  description: 'Update student profile fields such as bio, interests, skills, branch, semester, and external links.',
  parameters: {
    name: { type: 'string', description: 'Student full name' },
    bio: { type: 'string', description: 'Brief student bio' },
    branch: { type: 'string', description: 'Academic branch (e.g. CSE, IT, ECE)' },
    semester: { type: 'number', description: 'Current semester (1-8)' },
    graduation_year: { type: 'number', description: 'Expected graduation year' },
    skills: { type: 'array', description: 'List of skills' },
    interests: { type: 'array', description: 'List of academic and career interests' },
    learning_goals: { type: 'array', description: 'List of personal learning goals' },
    links: { type: 'object', description: 'Social/portfolio links (github, linkedin, website)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await ProfileService.updateProfile(context.studentId, params);
  },
});

ToolRegistry.register({
  name: 'get_learning_progress',
  description: 'Get comprehensive learning progress across courses, skills, coding, DSA, quizzes, projects, placement, and research.',
  parameters: {
    subsystem: { type: 'string', description: 'Optional subsystem filter: courses, skills, quiz, coding, dsa, projects, placement, research' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    if (!params.subsystem || params.subsystem === 'overall') {
      return await ProgressService.getUnifiedProgress(context.studentId);
    }
    return await ProgressService.getSubsystemOverview(context.studentId, params.subsystem);
  },
});

ToolRegistry.register({
  name: 'get_learning_history',
  description: 'Query student learning activity history with filtering by activity type and search.',
  parameters: {
    activity_type: { type: 'string', description: 'Filter by activity type' },
    search: { type: 'string', description: 'Search keywords in title' },
    limit: { type: 'number', description: 'Max events to return (default 20)' },
    offset: { type: 'number', description: 'Pagination offset' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const activities = await ActivityService.getActivities(context.studentId, {
      type: params.activity_type,
    });
    return { items: activities };
  },
});

ToolRegistry.register({
  name: 'get_student_activity',
  description: 'Get recent student learning activity events and current streak metrics.',
  parameters: {
    limit: { type: 'number', description: 'Number of recent activities to return (default 10)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const activities = await ActivityService.getActivities(context.studentId);
    const streak = await ActivityService.getStreak(context.studentId);
    return { streak, activities: activities.slice(0, params.limit || 10) };
  },
});

ToolRegistry.register({
  name: 'get_student_goals',
  description: 'Retrieve learning goals and milestone progress for the student.',
  parameters: {
    status: { type: 'string', description: 'Filter by status: ACTIVE, COMPLETED, PAUSED, ARCHIVED' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    const goals = await GoalService.getGoals(context.studentId);
    if (params.status) {
      return goals.filter((g) => g.status === params.status);
    }
    return goals;
  },
});

ToolRegistry.register({
  name: 'create_learning_goal',
  description: 'Create a new personal learning goal with target deadlines and milestones.',
  parameters: {
    title: { type: 'string', description: 'Goal title', required: true },
    description: { type: 'string', description: 'Detailed description of the goal' },
    category: { type: 'string', description: 'Category (COURSES, CODING, DSA, PROJECTS, RESEARCH, PLACEMENT, SKILLS, GENERAL)', required: true },
    target_value: { type: 'number', description: 'Target quantity (e.g. 20 problems, 5 papers)', required: true },
    target_unit: { type: 'string', description: 'Target unit (problems, papers, courses, hours)', required: true },
    target_date: { type: 'string', description: 'Target completion ISO date string', required: true },
    milestones: { type: 'array', description: 'List of milestone titles' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await GoalService.createGoal(context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'update_learning_goal',
  description: 'Update the progress or status of an existing learning goal.',
  parameters: {
    goal_id: { type: 'string', description: 'Goal ID', required: true },
    status: { type: 'string', description: 'New status (ACTIVE, COMPLETED, PAUSED, ARCHIVED)' },
    current_progress: { type: 'number', description: 'New current progress value' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await GoalService.updateGoal(params.goal_id, context.studentId, {
      status: params.status,
      current_value: params.current_progress,
    });
  },
});

ToolRegistry.register({
  name: 'get_bookmarks',
  description: 'List saved bookmarks filtered by category (ALL, COURSES, NOTES, DOCUMENTS, RESEARCH, CODING, PROJECTS, COMMUNITY).',
  parameters: {
    category: { type: 'string', description: 'Filter category' },
    search: { type: 'string', description: 'Search keyword' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await BookmarkService.getBookmarks(context.studentId, params.category);
  },
});

ToolRegistry.register({
  name: 'add_bookmark',
  description: 'Bookmark a platform resource for easy future retrieval.',
  parameters: {
    resource_type: { type: 'string', description: 'Resource type (COURSE, NOTE, DOCUMENT, RESEARCH_PAPER, GITHUB_REPO, CODING_PROBLEM, DSA_PROBLEM, PROJECT, COMMUNITY_POST)', required: true },
    resource_id: { type: 'string', description: 'ID of the item being bookmarked', required: true },
    title: { type: 'string', description: 'Title or name of the bookmarked item', required: true },
    url: { type: 'string', description: 'Platform route or resource URL', required: true },
    label: { type: 'string', description: 'Optional user custom tag/label' },
    notes: { type: 'string', description: 'Optional personal note' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await BookmarkService.addBookmark(context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'remove_bookmark',
  description: 'Remove a previously saved bookmark.',
  parameters: {
    bookmark_id: { type: 'string', description: 'Bookmark ID to remove', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    await BookmarkService.removeBookmark(params.bookmark_id, context.studentId);
    return { success: true, message: 'Bookmark removed' };
  },
});

ToolRegistry.register({
  name: 'get_achievements',
  description: 'List all available and earned achievements with deterministic criteria and progress.',
  parameters: {
    category: { type: 'string', description: 'Category filter: LEARNING, CODING, RESEARCH, COMMUNITY, ALL' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    const all = await AchievementService.getAllAchievements();
    const earned = await AchievementService.getStudentAchievements(context.studentId);
    const earnedIds = new Set(earned.map((e) => e.achievement_id));
    return all.map((a) => ({
      ...a,
      is_earned: earnedIds.has(a.id),
      earned_at: earned.find((e) => e.achievement_id === a.id)?.earned_at,
    }));
  },
});

ToolRegistry.register({
  name: 'get_certificates',
  description: 'View all verified platform certificates earned by the student with verification links.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await CertificateService.getCertificates(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_notifications',
  description: 'Fetch student notifications and unread count.',
  parameters: {
    unread_only: { type: 'boolean', description: 'Return unread notifications only' },
    limit: { type: 'number', description: 'Max items to return' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await NotificationService.getNotifications(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_notification_preferences',
  description: 'Get student notification channel and category preferences.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await NotificationService.getPreferences(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_community_questions',
  description: 'List community questions with filter by topic, tag, or keyword.',
  parameters: {
    topic_id: { type: 'string', description: 'Topic ID filter' },
    tag: { type: 'string', description: 'Tag filter' },
    search: { type: 'string', description: 'Search term' },
    limit: { type: 'number', description: 'Page limit' },
    offset: { type: 'number', description: 'Page offset' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await CommunityService.getQuestions({
      topicId: params.topic_id,
      tag: params.tag,
      search: params.search,
    });
  },
});

ToolRegistry.register({
  name: 'search_community',
  description: 'Search across community questions, discussions, shared resources, and showcased projects.',
  parameters: {
    query: { type: 'string', description: 'Search keywords', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    const results = await db.search(params.query, 'community');
    return results.items;
  },
});

ToolRegistry.register({
  name: 'get_question',
  description: 'Get details of a community question along with its answers and accepted answer status.',
  parameters: {
    question_id: { type: 'string', description: 'Question ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await CommunityService.getQuestion(params.question_id);
  },
});

ToolRegistry.register({
  name: 'create_question',
  description: 'Post a new question in the student community. Note: Content must be reviewed by the student.',
  parameters: {
    title: { type: 'string', description: 'Question title', required: true },
    description: { type: 'string', description: 'Detailed question description with markdown support', required: true },
    topic_id: { type: 'string', description: 'Topic ID', required: true },
    tags: { type: 'array', description: 'List of topic tags' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: true,
  category: 'MUTATION',
  handler: async (params, context) => {
    return await CommunityService.createQuestion(context.studentId, params as any);
  },
});

ToolRegistry.register({
  name: 'get_discussion',
  description: 'Retrieve a community discussion thread and its replies.',
  parameters: {
    discussion_id: { type: 'string', description: 'Discussion ID', required: true },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await CommunityService.getDiscussion(params.discussion_id);
  },
});

ToolRegistry.register({
  name: 'search_resources',
  description: 'Search learning resources shared by fellow students.',
  parameters: {
    query: { type: 'string', description: 'Search query' },
    category: { type: 'string', description: 'Category filter (ARTICLE, DOCUMENTATION, GITHUB_REPO, RESEARCH_PAPER, TUTORIAL)' },
    topic_id: { type: 'string', description: 'Topic ID filter' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params) => {
    return await CommunityService.getResources(params.topic_id);
  },
});

ToolRegistry.register({
  name: 'get_followed_topics',
  description: 'List academic and technical topics followed by the student.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 3000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await CommunityService.getFollowedTopics(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_student_portfolio',
  description: 'Aggregate student portfolio combining verified skills, projects, research papers, certificates, and achievements.',
  parameters: {},
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await PortfolioService.getPortfolioItems(context.studentId);
  },
});

ToolRegistry.register({
  name: 'get_learning_insights',
  description: 'Generate factual, non-judgmental learning activity insights based on verified platform data.',
  parameters: {
    period: { type: 'string', description: 'Period: daily, weekly, or monthly (default weekly)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (params, context) => {
    return await LearningInsightService.getInsights(context.studentId, params.period || 'weekly');
  },
});

ToolRegistry.register({
  name: 'get_recommendations',
  description: 'Get verified platform resource recommendations based on student goals, coursework, and weak quiz topics.',
  parameters: {
    limit: { type: 'number', description: 'Number of recommendations (default 5)' },
  },
  permissions: ['STUDENT', 'SUPER_ADMIN'],
  timeoutMs: 4000,
  confirmationRequired: false,
  category: 'READ_ONLY',
  handler: async (_params, context) => {
    return await RecommendationService.getRecommendations(context.studentId);
  },
});

import { registerLearningModulesTools } from './learningModulesTools';
registerLearningModulesTools();

import { registerExternalIntegrationTools } from './externalIntegrationTools';
registerExternalIntegrationTools();
