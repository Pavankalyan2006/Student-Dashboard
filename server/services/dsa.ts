import { db } from '../db/database';
import {
  DSATopic,
  Algorithm,
  DSAProblem,
  DSAProgress,
  VisualizationSession,
  VisualizationStep,
  AlgorithmComparisonDimension,
} from '../models/dsaTypes';
import { DSAStepGenerators } from './dsaStepGenerators';
import { DSALeetCodeVisualizers } from './dsaLeetCodeVisualizers';
import { SandboxService } from '../execution/sandbox';
import { LanguageRegistry } from '../execution/languages';
import { CodingLanguage, SubmissionStatus, CodeSubmission } from '../models/types';
import { eventBus } from '../events/eventBus';
import { NotFoundError, ValidationError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class DSAService {
  /**
   * Topics
   */
  public static async getTopics(): Promise<DSATopic[]> {
    return db.getDSATopics();
  }

  public static async getTopic(idOrSlug: string): Promise<DSATopic> {
    const topic = await db.getDSATopic(idOrSlug);
    if (!topic) {
      throw new NotFoundError(`DSA Topic '${idOrSlug}' not found`);
    }
    return topic;
  }

  /**
   * Algorithms
   */
  public static async getAlgorithms(topicId?: string): Promise<Algorithm[]> {
    return db.getDSAAlgorithms(topicId);
  }

  public static async getAlgorithm(idOrSlug: string): Promise<Algorithm> {
    let algo = await db.getDSAAlgorithm(idOrSlug);
    if (!algo) {
      // Check if this is a DSA Problem (e.g. any of the 150 LeetCode problems)!
      const prob = await db.getDSAProblem(idOrSlug);
      if (prob) {
        algo = DSALeetCodeVisualizers.mapProblemToAlgorithm(prob);
      }
    }
    if (!algo) {
      throw new NotFoundError(`Algorithm or Problem '${idOrSlug}' not found`);
    }
    return algo;
  }

  /**
   * Generate Deterministic Visualization Session
   */
  public static async visualizeAlgorithm(
    algorithmId: string,
    customInput?: any
  ): Promise<VisualizationSession> {
    // If it's a LeetCode problem, generate its dedicated LeetCode visualization session!
    const prob = await db.getDSAProblem(algorithmId);
    if (prob) {
      return DSALeetCodeVisualizers.generateProblemSession(prob, customInput);
    }

    const algo = await this.getAlgorithm(algorithmId);
    let steps: VisualizationStep[] = [];
    const input = customInput || algo.default_input || {};

    switch (algo.slug) {
      case 'binary-search': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
        if (arr.length > 50) throw new ValidationError('Array size cannot exceed 50 elements for visualization.');
        const target = input.target !== undefined ? Number(input.target) : 23;
        steps = DSAStepGenerators.generateBinarySearch(arr, target);
        break;
      }
      case 'linear-search': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [14, 33, 27, 10, 35, 19, 42, 44];
        if (arr.length > 50) throw new ValidationError('Array size cannot exceed 50 elements for visualization.');
        const target = input.target !== undefined ? Number(input.target) : 35;
        steps = DSAStepGenerators.generateLinearSearch(arr, target);
        break;
      }
      case 'bubble-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [64, 34, 25, 12, 22, 11, 90];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateBubbleSort(arr);
        break;
      }
      case 'selection-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [29, 10, 14, 37, 13];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateSelectionSort(arr);
        break;
      }
      case 'insertion-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [12, 11, 13, 5, 6];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateInsertionSort(arr);
        break;
      }
      case 'quick-sort': {
        const arr = Array.isArray(input.array) ? input.array.map(Number) : [10, 80, 30, 90, 40, 50, 70];
        if (arr.length > 30) throw new ValidationError('Sorting array size cannot exceed 30 elements.');
        steps = DSAStepGenerators.generateQuickSort(arr);
        break;
      }
      case 'stack-operations': {
        const ops = Array.isArray(input.operations)
          ? input.operations
          : [{ type: 'push', value: 10 }, { type: 'push', value: 20 }, { type: 'push', value: 30 }, { type: 'peek' }, { type: 'pop' }];
        steps = DSAStepGenerators.generateStack(ops);
        break;
      }
      case 'queue-operations': {
        const ops = Array.isArray(input.operations)
          ? input.operations
          : [{ type: 'enqueue', value: 10 }, { type: 'enqueue', value: 20 }, { type: 'dequeue' }];
        steps = DSAStepGenerators.generateQueue(ops);
        break;
      }
      case 'linked-list-traversal': {
        const vals = Array.isArray(input.values) ? input.values.map(Number) : [10, 20, 30, 40, 50];
        const insertVal = input.insertVal !== undefined ? Number(input.insertVal) : 25;
        steps = DSAStepGenerators.generateLinkedList(vals, insertVal);
        break;
      }
      case 'bst-search': {
        const nodes = Array.isArray(input.nodes) ? input.nodes.map(Number) : [8, 3, 10, 1, 6, 14, 4, 7, 13];
        const target = input.searchVal !== undefined ? Number(input.searchVal) : 7;
        steps = DSAStepGenerators.generateBST(nodes, target);
        break;
      }
      case 'breadth-first-search': {
        const start = input.startNode || 'A';
        steps = DSAStepGenerators.generateBFS(undefined, undefined, start);
        break;
      }
      case 'depth-first-search': {
        const start = input.startNode || 'A';
        steps = DSAStepGenerators.generateDFS(undefined, undefined, start);
        break;
      }
      case 'fibonacci-dp': {
        const n = input.n !== undefined ? Number(input.n) : 6;
        steps = DSAStepGenerators.generateDPFibonacci(n);
        break;
      }
      case 'heap-operations': {
        const vals = Array.isArray(input.values) ? input.values.map(Number) : [4, 10, 3, 5, 1];
        const type = input.type === 'max' ? 'max' : 'min';
        steps = DSAStepGenerators.generateHeap(vals, type);
        break;
      }
      default:
        // Default to bubble sort or linear search if generic
        steps = DSAStepGenerators.generateBubbleSort([5, 1, 4, 2, 8]);
        break;
    }

    return {
      algorithm_id: algo.id,
      algorithm_name: algo.name,
      visualization_type: algo.visualization_type,
      input_data: input,
      steps,
      pseudocode: algo.pseudocode,
      total_steps: steps.length,
      complexity: {
        time: algo.time_complexity,
        space: algo.space_complexity,
        best_case: algo.best_case,
        average_case: algo.average_case,
        worst_case: algo.worst_case,
        in_place: algo.in_place,
        stable: algo.stable,
      },
    };
  }

  /**
   * Problems
   */
  public static async getProblems(filters?: {
    topic_id?: string;
    difficulty?: string;
    search?: string;
    subtopic?: string;
    company?: string;
    roadmap_stage?: string;
    status?: string;
    student_id?: string;
  }): Promise<DSAProblem[]> {
    return db.getDSAProblems(filters);
  }

  public static async getProblem(idOrSlug: string): Promise<DSAProblem> {
    const prob = await db.getDSAProblem(idOrSlug);
    if (!prob) {
      throw new NotFoundError(`DSA Problem '${idOrSlug}' not found`);
    }
    return prob;
  }

  public static async getHints(problemId: string, level: number = 1): Promise<{
    problem_id: string;
    level: number;
    hint: string;
    total_hints: number;
  }> {
    const prob = await this.getProblem(problemId);
    const lvl = Math.max(1, Math.min(level, prob.hints.length));
    return {
      problem_id: prob.id,
      level: lvl,
      hint: prob.hints[lvl - 1] || 'Break the problem down into smaller base cases.',
      total_hints: prob.hints.length,
    };
  }

  /**
   * Run Code: Real execution against sample/public test cases only.
   * Does NOT alter problem solved progress in student record.
   */
  public static async runCode(
    problemId: string,
    params: { language: CodingLanguage; source_code: string }
  ): Promise<{
    status: SubmissionStatus;
    passed_count: number;
    total_tests: number;
    execution_time_ms: number;
    test_results: Array<{
      test_index: number;
      passed: boolean;
      input: string;
      expected_output: string;
      actual_output: string;
      error?: string;
      execution_time_ms: number;
    }>;
  }> {
    const prob = await this.getProblem(problemId);
    if (!LanguageRegistry.isSupported(params.language)) {
      throw new ValidationError(`Unsupported programming language: ${params.language}`);
    }

    const sampleCases = prob.public_test_cases && prob.public_test_cases.length > 0
      ? prob.public_test_cases
      : (prob.examples || []);

    if (sampleCases.length === 0) {
      throw new ValidationError('No sample test cases configured for this problem.');
    }

    let passedCount = 0;
    let totalTime = 0;
    let finalStatus: SubmissionStatus = 'ACCEPTED';
    const testResults: any[] = [];

    for (let i = 0; i < sampleCases.length; i++) {
      const tc = sampleCases[i];
      const exec = await SandboxService.execute({
        language: params.language,
        sourceCode: params.source_code,
        stdin: tc.input,
      });

      totalTime += exec.execution_time_ms;

      if (exec.status === 'COMPILATION_ERROR') {
        finalStatus = 'COMPILATION_ERROR';
        testResults.push({
          test_index: i + 1,
          passed: false,
          input: tc.input,
          expected_output: tc.output,
          actual_output: '',
          error: exec.stderr || 'Compilation error.',
          execution_time_ms: exec.execution_time_ms,
        });
        break;
      }

      if (exec.status === 'TIMEOUT') {
        finalStatus = 'TIME_LIMIT';
        testResults.push({
          test_index: i + 1,
          passed: false,
          input: tc.input,
          expected_output: tc.output,
          actual_output: '',
          error: 'Time Limit Exceeded.',
          execution_time_ms: exec.execution_time_ms,
        });
        break;
      }

      if (exec.status !== 'SUCCESS') {
        finalStatus = 'RUNTIME_ERROR';
        testResults.push({
          test_index: i + 1,
          passed: false,
          input: tc.input,
          expected_output: tc.output,
          actual_output: exec.stdout,
          error: exec.stderr || `Runtime Error (exit code ${exec.exit_code})`,
          execution_time_ms: exec.execution_time_ms,
        });
        break;
      }

      const normalizedActual = exec.stdout.trim().replace(/\r\n/g, '\n');
      const normalizedExpected = tc.output.trim().replace(/\r\n/g, '\n');
      const isPassed = normalizedActual === normalizedExpected;

      if (isPassed) {
        passedCount++;
      } else if (finalStatus === 'ACCEPTED') {
        finalStatus = 'WRONG_ANSWER';
      }

      testResults.push({
        test_index: i + 1,
        passed: isPassed,
        input: tc.input,
        expected_output: tc.output,
        actual_output: exec.stdout.trim(),
        execution_time_ms: exec.execution_time_ms,
      });
    }

    return {
      status: finalStatus,
      passed_count: passedCount,
      total_tests: sampleCases.length,
      execution_time_ms: totalTime,
      test_results: testResults,
    };
  }

  /**
   * Submit Solution: Real evaluation against complete test suite (both public and hidden).
   * Marks problem solved on ACCEPTED and triggers DSA_PROBLEM_COMPLETED event.
   */
  public static async submitSolution(
    studentId: string,
    problemId: string,
    params: { language: CodingLanguage; source_code: string }
  ): Promise<CodeSubmission> {
    const prob = await this.getProblem(problemId);
    if (!LanguageRegistry.isSupported(params.language)) {
      throw new ValidationError(`Unsupported programming language: ${params.language}`);
    }

    await db.recordDSAProblemAttempted(studentId, prob.id);

    let allCases = await db.getAllTestCases(prob.id);
    if (allCases.length === 0) {
      // Fallback: construct from problem public and hidden test cases
      const pub = (prob.public_test_cases || prob.examples || []).map((tc, idx) => ({
        id: `${prob.id}_pub_${idx + 1}`,
        problem_id: prob.id,
        input: tc.input,
        expected_output: tc.output,
        is_hidden: false,
        created_at: new Date().toISOString(),
      }));
      const hid = (prob.hidden_test_cases || []).map((tc, idx) => ({
        id: `${prob.id}_hid_${idx + 1}`,
        problem_id: prob.id,
        input: tc.input,
        expected_output: tc.output,
        is_hidden: true,
        created_at: new Date().toISOString(),
      }));
      allCases = [...pub, ...hid];
    }

    if (allCases.length === 0) {
      throw new ValidationError('No test cases configured for this problem.');
    }

    let passedCount = 0;
    let totalTimeMs = 0;
    let finalStatus: SubmissionStatus = 'ACCEPTED';
    const testResults: CodeSubmission['test_results'] = [];

    for (let i = 0; i < allCases.length; i++) {
      const tc = allCases[i];
      const exec = await SandboxService.execute({
        language: params.language,
        sourceCode: params.source_code,
        stdin: tc.input,
      });

      totalTimeMs += exec.execution_time_ms;

      if (exec.status === 'COMPILATION_ERROR') {
        finalStatus = 'COMPILATION_ERROR';
        testResults.push({
          test_index: i + 1,
          passed: false,
          is_hidden: tc.is_hidden,
          error: exec.stderr || 'Compilation error.',
          execution_time_ms: exec.execution_time_ms,
        });
        break;
      }

      if (exec.status === 'TIMEOUT') {
        finalStatus = 'TIME_LIMIT';
        testResults.push({
          test_index: i + 1,
          passed: false,
          is_hidden: tc.is_hidden,
          error: 'Time Limit Exceeded.',
          execution_time_ms: exec.execution_time_ms,
        });
        break;
      }

      if (exec.status !== 'SUCCESS') {
        finalStatus = 'RUNTIME_ERROR';
        testResults.push({
          test_index: i + 1,
          passed: false,
          is_hidden: tc.is_hidden,
          error: exec.stderr || `Runtime Error (exit code ${exec.exit_code})`,
          execution_time_ms: exec.execution_time_ms,
        });
        break;
      }

      const normalizedActual = exec.stdout.trim().replace(/\r\n/g, '\n');
      const normalizedExpected = tc.expected_output.trim().replace(/\r\n/g, '\n');
      const isPassed = normalizedActual === normalizedExpected;

      if (isPassed) {
        passedCount++;
      } else if (finalStatus === 'ACCEPTED') {
        finalStatus = 'WRONG_ANSWER';
      }

      // Security check: NEVER reveal hidden test input or expected output!
      testResults.push({
        test_index: i + 1,
        passed: isPassed,
        is_hidden: tc.is_hidden,
        input: tc.is_hidden ? undefined : tc.input,
        expected_output: tc.is_hidden ? undefined : tc.expected_output,
        actual_output: tc.is_hidden ? (isPassed ? undefined : '[Hidden Test Case]') : exec.stdout.trim(),
        execution_time_ms: exec.execution_time_ms,
      });
    }

    const submission = await db.recordSubmission(studentId, {
      problem_id: prob.id,
      language: params.language,
      source_code: params.source_code,
      status: finalStatus,
      passed_tests: passedCount,
      total_tests: allCases.length,
      execution_time_ms: totalTimeMs,
      test_results: testResults,
    });

    if (finalStatus === 'ACCEPTED') {
      await db.recordDSAProblemSolved(studentId, prob.id);
      await eventBus.publish(
        'DSA_PROBLEM_COMPLETED',
        {
          problem_id: prob.id,
          problem_title: prob.title,
          difficulty: prob.difficulty,
          language: params.language,
        },
        {
          student_id: studentId,
          resource_type: 'DSAProblem',
          resource_id: prob.id,
          source: 'DSAService',
        }
      );
    }

    return submission;
  }

  /**
   * Deterministic Daily Challenge
   */
  public static async getDailyChallenge(studentId?: string): Promise<{
    date: string;
    problem: DSAProblem;
    is_completed: boolean;
  }> {
    const problems = await db.getDSAProblems();
    if (problems.length === 0) {
      throw new NotFoundError('No DSA problems available');
    }
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const index = Math.abs(dayOfYear) % problems.length;
    const problem = problems[index];

    let is_completed = false;
    if (studentId) {
      const prog = await db.getDSAProgress(studentId);
      is_completed = prog.problems_solved.includes(problem.id);
    }

    return {
      date: today.toISOString().split('T')[0],
      problem,
      is_completed,
    };
  }

  /**
   * 4-Stage Learning Roadmap
   */
  public static async getRoadmap(studentId: string): Promise<Array<{
    stage: string;
    description: string;
    total_problems: number;
    solved_problems: number;
    topics: Array<{
      topic_id: string;
      topic_name: string;
      total: number;
      solved: number;
    }>;
  }>> {
    const problems = await db.getDSAProblems();
    const topics = await db.getDSATopics();
    const progress = await db.getDSAProgress(studentId);
    const solvedSet = new Set(progress.problems_solved);

    const stagesConfig = [
      {
        stage: 'Beginner Foundations',
        description: 'Master time/space complexity analysis, array pointers, recursion basics, and elementary data structures.',
      },
      {
        stage: 'Core Patterns',
        description: 'Crucial interview patterns: sliding windows, binary search, tree traversals, monotonic queues, and greedy intervals.',
      },
      {
        stage: 'Advanced Mastery',
        description: 'Complex topological sorting, multi-dimensional dynamic programming, tries, and priority queue optimizations.',
      },
      {
        stage: 'Placement Revision',
        description: 'Hard-tier FAANG interview challenges, median streaming, edit distance, and high-frequency problem consolidations.',
      },
    ];

    const topicMap = new Map(topics.map((t) => [t.id, t.name]));

    return stagesConfig.map((sc) => {
      const stageProblems = problems.filter((p) => p.roadmap_stage === sc.stage);
      const stageSolved = stageProblems.filter((p) => solvedSet.has(p.id)).length;

      const topicStats = new Map<string, { total: number; solved: number }>();
      stageProblems.forEach((p) => {
        const curr = topicStats.get(p.topic_id) || { total: 0, solved: 0 };
        curr.total++;
        if (solvedSet.has(p.id)) curr.solved++;
        topicStats.set(p.topic_id, curr);
      });

      const topicList = Array.from(topicStats.entries()).map(([tid, stat]) => ({
        topic_id: tid,
        topic_name: topicMap.get(tid) || tid,
        total: stat.total,
        solved: stat.solved,
      }));

      return {
        stage: sc.stage,
        description: sc.description,
        total_problems: stageProblems.length,
        solved_problems: stageSolved,
        topics: topicList,
      };
    });
  }

  /**
   * 150-Question Comprehensive Analytics
   */
  public static async getAnalytics(studentId: string): Promise<{
    total_problems: number;
    total_solved: number;
    total_attempted: number;
    total_unsolved: number;
    completion_percentage: number;
    acceptance_rate: number;
    daily_streak: number;
    by_difficulty: {
      easy: { solved: number; total: number; percentage: number };
      medium: { solved: number; total: number; percentage: number };
      hard: { solved: number; total: number; percentage: number };
    };
    by_topic: Array<{
      topic_id: string;
      topic_name: string;
      solved: number;
      total: number;
      percentage: number;
    }>;
    weak_topics: string[];
    bookmarked_count: number;
  }> {
    const problems = await db.getDSAProblems();
    const topics = await db.getDSATopics();
    const prog = await db.getDSAProgress(studentId);

    const solvedSet = new Set(prog.problems_solved);
    const attemptedSet = new Set(prog.problems_attempted);

    const total = problems.length;
    const totalSolved = solvedSet.size;
    const totalAttempted = attemptedSet.size;
    const totalUnsolved = Math.max(0, total - totalSolved);

    let easyTotal = 0, easySolved = 0;
    let medTotal = 0, medSolved = 0;
    let hardTotal = 0, hardSolved = 0;

    const topicStats = new Map<string, { solved: number; total: number }>();
    topics.forEach((t) => topicStats.set(t.id, { solved: 0, total: 0 }));

    problems.forEach((p) => {
      const isSolved = solvedSet.has(p.id);
      if (p.difficulty === 'EASY') {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (p.difficulty === 'MEDIUM') {
        medTotal++;
        if (isSolved) medSolved++;
      } else if (p.difficulty === 'HARD') {
        hardTotal++;
        if (isSolved) hardSolved++;
      }

      const ts = topicStats.get(p.topic_id);
      if (ts) {
        ts.total++;
        if (isSolved) ts.solved++;
      }
    });

    const by_topic = topics.map((t) => {
      const stat = topicStats.get(t.id) || { solved: 0, total: 0 };
      return {
        topic_id: t.id,
        topic_name: t.name,
        solved: stat.solved,
        total: stat.total,
        percentage: stat.total > 0 ? Math.round((stat.solved / stat.total) * 100) : 0,
      };
    });

    return {
      total_problems: total,
      total_solved: totalSolved,
      total_attempted: totalAttempted,
      total_unsolved: totalUnsolved,
      completion_percentage: total > 0 ? Math.round((totalSolved / total) * 100) : 0,
      acceptance_rate: totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0,
      daily_streak: prog.daily_streak || 1,
      by_difficulty: {
        easy: { solved: easySolved, total: easyTotal, percentage: easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0 },
        medium: { solved: medSolved, total: medTotal, percentage: medTotal > 0 ? Math.round((medSolved / medTotal) * 100) : 0 },
        hard: { solved: hardSolved, total: hardTotal, percentage: hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0 },
      },
      by_topic,
      weak_topics: prog.weak_topics,
      bookmarked_count: (prog.bookmarked_problems || []).length,
    };
  }

  /**
   * Bookmarks & Drafts
   */
  public static async toggleBookmark(studentId: string, problemId: string): Promise<{ bookmarked: boolean; bookmarks: string[] }> {
    return db.toggleDSABookmark(studentId, problemId);
  }

  public static async getBookmarks(studentId: string): Promise<string[]> {
    return db.getDSABookmarks(studentId);
  }

  public static async saveDraft(
    studentId: string,
    problemId: string,
    draft: { code: string; language: string }
  ): Promise<void> {
    return db.saveDSADraft(studentId, problemId, draft);
  }

  public static async getDraft(
    studentId: string,
    problemId: string
  ): Promise<{ code: string; language: string; updated_at: string } | null> {
    return db.getDSADraft(studentId, problemId);
  }

  /**
   * Progress Tracking
   */
  public static async getProgress(studentId: string): Promise<DSAProgress> {
    return db.getDSAProgress(studentId);
  }

  public static async recordVisualization(studentId: string, algorithmId: string): Promise<DSAProgress> {
    return db.recordDSAVisualization(studentId, algorithmId);
  }

  public static async recordProblemSolved(studentId: string, problemId: string): Promise<DSAProgress> {
    return db.recordDSAProblemSolved(studentId, problemId);
  }

  /**
   * Algorithm Comparison
   */
  public static async compareAlgorithms(algoIds: string[]): Promise<AlgorithmComparisonDimension[]> {
    const algorithms = await db.getDSAAlgorithms();
    const selected = algorithms.filter((a) => algoIds.includes(a.id) || algoIds.includes(a.slug));

    return selected.map((a) => ({
      id: a.id,
      name: a.name,
      best_case: a.best_case,
      average_case: a.average_case,
      worst_case: a.worst_case,
      space_complexity: a.space_complexity,
      stable: a.stable,
      in_place: a.in_place,
      use_cases: a.comparison_tags || ['General algorithmic problem solving'],
    }));
  }
}
