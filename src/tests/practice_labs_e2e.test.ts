import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { CodingService } from '../../server/services/coding';
import { SandboxService } from '../../server/execution/sandbox';
import { LanguageRegistry } from '../../server/execution/languages';
import { CodeAIService } from '../../server/services/codeAi';
import { DSAService } from '../../server/services/dsa';
import { DSAStepGenerators } from '../../server/services/dsaStepGenerators';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { LabAssistantService } from '../../server/services/labAssistantService';
import { AgentRegistry } from '../../server/ai/orchestration/registry';
import { AgentRouter } from '../../server/ai/orchestration/router';
import { AgentContext } from '../../server/ai/orchestration/types';

describe('Complete 6 Practice Labs Modules & Multi-Intelligence Agent System E2E Suite', () => {
  const studentId = 'std_01j8k9x2p4';

  const mockAgentContext: AgentContext = {
    student_id: studentId,
    role: 'STUDENT',
    conversation_id: 'conv_practice_labs_test',
    request_id: 'req_pl_01',
    current_course: { id: 'c_dbms_01', name: 'Database Management Systems', code: 'CS301', progress: 80 },
    current_lesson: { id: 'l_indexing_01', title: 'B-Tree & Indexing', topic: 'Indexing' },
  };

  beforeEach(async () => {
    await db.initialize();
  });

  // -------------------------------------------------------------
  // 1. Coding Lab Module
  // -------------------------------------------------------------
  describe('1. Coding Lab Module', () => {
    it('supports isolated multi-language code execution in sandbox', async () => {
      const languages = LanguageRegistry.getAll();
      expect(languages.length).toBeGreaterThanOrEqual(4);
      const languageIds = languages.map((l) => l.id);
      expect(languageIds).toContain('python');
      expect(languageIds).toContain('javascript');

      // Execute Python program in sandbox
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: 'def add(a, b):\n    return a + b\nprint(add(15, 27))',
        timeoutMs: 3000,
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.stdout.trim()).toBe('42');
      expect(result.exit_code).toBe(0);
    });

    it('manages coding problems, submissions, and test case verification', async () => {
      const problems = await CodingService.getProblems();
      expect(problems.length).toBeGreaterThanOrEqual(1);

      const twoSumProb = problems.find((p) => p.id === 'prob_two_sum') || problems[0];
      expect(twoSumProb).toBeDefined();

      // Submit valid competitive programming solution that reads stdin
      const solutionCode = `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        return
    n = int(lines[0])
    nums = [int(x) for x in lines[1:n+1]]
    target = int(lines[n+1])
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

solve()
`;
      const evalResult = await CodingService.submitSolution(
        studentId,
        twoSumProb.id,
        {
          language: 'python',
          source_code: solutionCode,
        }
      );

      expect(evalResult).toBeDefined();
      expect(evalResult.status).toBe('ACCEPTED');
      expect(evalResult.passed_tests).toBe(evalResult.total_tests);
    });

    it('Code AI diagnostics report 503 instead of template text when no model is configured', async () => {
      // With a model this returns the model's explanation (covered with a stub in coding.test.ts).
      const { AIService } = await import('../../server/ai/service');
      const { vi } = await import('vitest');
      const spy = vi.spyOn(AIService, 'generate').mockResolvedValue({ text: '**AI unavailable.** No AI provider is configured.' } as any);
      await expect(
        CodeAIService.explainCode({
          language: 'python',
          source_code: 'def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)',
        })
      ).rejects.toMatchObject({ statusCode: 503, code: 'AI_UNAVAILABLE' });
      spy.mockRestore();
    });
  });

  // -------------------------------------------------------------
  // 2. DSA Lab Module
  // -------------------------------------------------------------
  describe('2. DSA Lab Module', () => {
    it('generates deterministic visualizer steps with pointers and complexity bounds', () => {
      const arr = [3, 9, 14, 21, 35, 48, 62, 77, 89];
      const target = 35;
      const steps = DSAStepGenerators.generateBinarySearch(arr, target);

      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps[0].title).toBe('Initialize Range');
      expect(steps[0].pointers?.low).toBe(0);
      expect(steps[0].pointers?.high).toBe(arr.length - 1);

      const foundStep = steps.find((s) => s.title.includes('Target Found'));
      expect(foundStep).toBeDefined();
      expect(foundStep?.pointers?.mid).toBe(4); // arr[4] === 35
    });

    it('lists algorithm catalog, topics, and complexity references', async () => {
      const topics = await DSAService.getTopics();
      expect(topics.length).toBeGreaterThanOrEqual(1);

      const algorithms = await DSAService.getAlgorithms();
      expect(algorithms.length).toBeGreaterThanOrEqual(1);

      const bsAlgo = algorithms.find((a) => a.slug === 'binary-search') || algorithms[0];
      expect(bsAlgo.worst_case).toBeDefined();
      expect(bsAlgo.space_complexity).toBeDefined();
    });

    it('compares algorithmic paradigms and trade-offs side by side', async () => {
      const algorithms = await DSAService.getAlgorithms();
      const ids = algorithms.slice(0, 2).map((a) => a.id);
      const comparisons = await DSAService.compareAlgorithms(ids);

      expect(comparisons.length).toBe(ids.length);
      expect(comparisons[0].best_case).toBeDefined();
      expect(comparisons[0].worst_case).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 3. SQL Lab (Sandbox) Module
  // -------------------------------------------------------------
  describe('3. SQL Lab (Sandbox) Module', () => {
    it('provides sandboxed university database schemas and challenges', async () => {
      const schemas = await LearningModulesService.getSqlSchemas();
      expect(schemas['university_db']).toBeDefined();
      expect(schemas['university_db'].length).toBeGreaterThanOrEqual(3);

      const tableNames = schemas['university_db'].map((t) => t.name);
      expect(tableNames).toContain('students');
      expect(tableNames).toContain('courses');
      expect(tableNames).toContain('enrollments');

      const challenges = await LearningModulesService.getSqlChallenges();
      expect(challenges.length).toBeGreaterThanOrEqual(1);
      expect(challenges[0].starter_query).toBeDefined();
    });

    it('executes safe relational queries against student tables and returns query metrics', async () => {
      const query = 'SELECT branch, COUNT(student_id) AS total FROM students GROUP BY branch;';
      const result = await LearningModulesService.executeSandboxedSql(studentId, query);

      expect(result.success).toBe(true);
      expect(result.columns.length).toBeGreaterThanOrEqual(2);
      expect(result.rows.length).toBeGreaterThanOrEqual(1);
      expect(result.execution_time_ms).toBeGreaterThanOrEqual(1);
    });

    it('security filter prevents destructive administration statements in sandbox', async () => {
      const maliciousQuery = 'DROP DATABASE university_db;';
      const result = await LearningModulesService.executeSandboxedSql(studentId, maliciousQuery);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not SQLite syntax|disabled/);
    });
  });

  // -------------------------------------------------------------
  // 4. AI/ML Lab (ML) Module
  // -------------------------------------------------------------
  describe('4. AI/ML Lab (ML) Module', () => {
    it('loads curated machine learning benchmark datasets', async () => {
      const datasets = await LearningModulesService.getMlDatasets();
      expect(datasets.length).toBeGreaterThanOrEqual(1);

      const iris = datasets.find((d) => d.name.includes('Iris')) || datasets[0];
      expect(iris.features.length).toBeGreaterThanOrEqual(2);
      expect(iris.target_column).toBeDefined();
      expect(iris.preview.length).toBeGreaterThanOrEqual(1);
    });

    it('trains ML model, calculates performance metrics, and extracts feature importances', async () => {
      const exp = await LearningModulesService.createAndRunMlExperiment(studentId, {
        name: 'Random Forest Multi-Class Validation on Iris',
        dataset_name: 'Iris Flower Classification',
        model_type: 'Random Forest',
        train_split: 0.8,
        hyperparameters: {
          n_estimators: 100,
          max_depth: 4,
        },
      });

      expect(exp.id).toBeDefined();
      expect(exp.status).toBe('COMPLETED');
      expect(exp.metrics.accuracy).toBeGreaterThanOrEqual(0.9);
      expect(exp.metrics.confusion_matrix?.length).toBe(3);
      expect(exp.insights.feature_importance?.length).toBeGreaterThanOrEqual(2);
    });
  });

  // -------------------------------------------------------------
  // 5. System Design Lab Module
  // -------------------------------------------------------------
  describe('5. System Design Lab Module', () => {
    it('retrieves system design problems with scale estimation benchmarks', async () => {
      const problems = await LearningModulesService.getSystemDesignProblems();
      expect(problems.length).toBeGreaterThanOrEqual(1);

      const urlProblem = problems.find((p) => p.id === 'sd_url_shortener') || problems[0];
      expect(urlProblem.title).toBeDefined();
      expect(urlProblem.scale_estimation.daily_active_users).toBeDefined();
      expect(urlProblem.scale_estimation.read_write_ratio).toBeDefined();
      expect(urlProblem.sample_architecture.components.length).toBeGreaterThanOrEqual(3);
    });

    it('analyzes distributed system architectures for bottlenecks and single points of failure', async () => {
      const designs = await LearningModulesService.getSystemDesigns(studentId);
      expect(designs.length).toBeGreaterThanOrEqual(1);

      const design = designs[0];
      expect(design.components.length).toBeGreaterThanOrEqual(3);
      expect(design.ai_analysis?.score).toBeGreaterThan(80);
      expect(design.ai_analysis?.strengths?.length).toBeGreaterThanOrEqual(1);
      expect(design.ai_analysis?.bottlenecks?.length).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------
  // 6. Lab Assistant (Viva Voce) Module
  // -------------------------------------------------------------
  describe('6. Lab Assistant (Viva Voce) Module', () => {
    it('lists only the signed-in student\'s own labs (no shared demo labs)', async () => {
      const fresh = `std_p2_nolabs_${Date.now()}`;
      expect(await LearningModulesService.getLabs(fresh)).toEqual([]);
      const lab = await LabAssistantService.createLab(fresh, { name: 'DBMS Lab', subject: 'DBMS', semester: 5 } as any);
      const labs = await LearningModulesService.getLabs(fresh);
      expect(labs.map((l: any) => l.id)).toEqual([lab.id]);
      expect(labs[0].title).toBe('DBMS Lab');
      expect(await LearningModulesService.getLabs(`std_p2_other_${Date.now()}`)).toEqual([]);
    });

    it('viva feedback without an AI model is a labelled keyword check', async () => {
      const fresh = `std_p2_viva_${Date.now()}`;
      const lab = await LabAssistantService.createLab(fresh, { name: 'DBMS Lab', subject: 'DBMS', semester: 5 } as any);
      const exp = await db.saveLabExperiment({
        id: `exp_p2_${fresh}`, lab_id: lab.id, student_id: fresh, experiment_number: 1, title: 'DDL vs DML',
        aim: 'Compare TRUNCATE and DELETE', theory: '', requirements: [], procedure_steps: [], procedure: [],
        viva_questions: [{ id: 'vq1', question: 'TRUNCATE vs DELETE?', expected_concept: 'TRUNCATE is DDL and cannot be rolled back; DELETE is DML, logged, supports WHERE.' }],
        status: 'NOT_STARTED', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      } as any);
      const evaluation: any = await LearningModulesService.evaluateVivaAnswer(fresh, lab.id, exp.id, 'vq1',
        'TRUNCATE is a DDL command that deallocates extents, while DELETE is a DML logged operation with WHERE filter support.');
      expect(evaluation.ai_evaluation.method).toBe('KEYWORD_MATCH');
      expect(evaluation.ai_evaluation.correctness).toMatch(/Keyword check/);
      // Another student cannot evaluate against this experiment.
      await expect(LearningModulesService.evaluateVivaAnswer('std_p2_intruder', lab.id, exp.id, 'vq1', 'x')).rejects.toThrow(/not found/i);
    });
  });

  // -------------------------------------------------------------
  // 7. Multi-Intelligence Agent System Coordination for Labs
  // -------------------------------------------------------------
  describe('7. Multi-Intelligence Orchestration for Practice Labs', () => {
    it('verifies all lab specialized domain agents are registered and active', () => {
      const labAgents = [
        'CodingAgent',
        'DSAAgent',
        'DatabaseAgent',
        'SQLDatabaseAgent',
        'MLExperimentAgent',
        'SystemDesignAgent',
        'LabAssistantAgent',
        'VivaAgent',
      ];

      for (const agent of labAgents) {
        expect(AgentRegistry.isEnabled(agent as any)).toBe(true);
      }
    });

    it('routes practice lab questions to target specialized agents accurately', () => {
      // Coding / Runtime
      const codeIntent = AgentRouter.route('Debug my recursion stack overflow error in Python', mockAgentContext);
      expect(codeIntent.targetAgents).toContain('CodingAgent');

      // Algorithm visualization
      const dsaIntent = AgentRouter.route('Visualize Merge Sort step by step with time complexity', mockAgentContext);
      expect(dsaIntent.targetAgents).toContain('DSAAgent');

      // System design
      const sysIntent = AgentRouter.route('Design a distributed cache with Redis and consistent hashing', mockAgentContext);
      expect(sysIntent.targetAgents).toContain('SystemDesignAgent');

      // SQL Lab query
      const sqlIntent = AgentRouter.route('Optimize this SQL database query with composite indexing and explain plan', mockAgentContext);
      expect(sqlIntent.targetAgents.includes('SQLDatabaseAgent') || sqlIntent.targetAgents.includes('DatabaseAgent')).toBe(true);

      // AI/ML Lab experiment
      const mlIntent = AgentRouter.route('Train a Random Forest machine learning classification model on dataset', mockAgentContext);
      expect(mlIntent.targetAgents).toContain('MLExperimentAgent');

      // Lab Viva
      const vivaIntent = AgentRouter.route('Prepare me for oral viva voce on operating systems semaphore locks', mockAgentContext);
      expect(vivaIntent.targetAgents.includes('VivaAgent') || vivaIntent.targetAgents.includes('LabAssistantAgent')).toBe(true);
    });
  });
});
