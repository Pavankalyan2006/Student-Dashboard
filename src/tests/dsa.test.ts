import { describe, it, expect, vi, afterEach } from 'vitest';
import { DSAStepGenerators } from '../../server/services/dsaStepGenerators';
import { DSAService } from '../../server/services/dsa';
import { ToolRegistry } from '../../server/ai/tools';

describe('Phase 8 DSA Lab & Algorithm Visualization Engine', () => {
  const studentId = 'std_01j8k9x2p4';

  describe('Deterministic Step Generators (Zero Hallucination)', () => {
    it('generates valid binary search simulation steps with pointers and log(N) complexity', () => {
      const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
      const target = 23;
      const steps = DSAStepGenerators.generateBinarySearch(arr, target);

      expect(steps.length).toBeGreaterThan(3);
      expect(steps[0].title).toBe('Initialize Range');
      expect(steps[0].pointers?.low).toBe(0);
      expect(steps[0].pointers?.high).toBe(arr.length - 1);
      expect(steps[0].complexity_info?.time).toBe('O(log N)');

      // Verify that target is eventually found
      const matchStep = steps.find((s) => s.title.includes('Target Found'));
      expect(matchStep).toBeDefined();
      expect(matchStep?.pointers?.mid).toBe(5); // arr[5] is 23
    });

    it('generates bubble sort simulation steps with comparisons and element swaps', () => {
      const arr = [64, 34, 25, 12];
      const steps = DSAStepGenerators.generateBubbleSort(arr);

      expect(steps.length).toBeGreaterThan(5);
      const swapSteps = steps.filter((s) => s.swaps !== undefined);
      expect(swapSteps.length).toBeGreaterThan(0);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.title).toBe('Array Sorted');
      expect(finalStep.state).toEqual([12, 25, 34, 64]);
    });

    it('generates stack LIFO simulation steps handling push, pop, and peek', () => {
      const steps = DSAStepGenerators.generateStack([
        { type: 'push', value: 10 },
        { type: 'push', value: 20 },
        { type: 'peek' },
        { type: 'pop' },
      ]);

      expect(steps.length).toBe(5);
      expect(steps[1].title).toBe('Push 10');
      expect(steps[1].pointers?.top).toBe(0);

      expect(steps[2].title).toBe('Push 20');
      expect(steps[2].pointers?.top).toBe(1);

      expect(steps[3].title).toBe('Peek Top Element');
      expect(steps[3].variables?.peekValue).toBe(20);

      expect(steps[4].title).toBe('Pop Element');
      expect(steps[4].variables?.poppedValue).toBe(20);
    });

    it('generates queue FIFO simulation steps preserving insertion order', () => {
      const steps = DSAStepGenerators.generateQueue([
        { type: 'enqueue', value: 100 },
        { type: 'enqueue', value: 200 },
        { type: 'dequeue' },
      ]);

      expect(steps.length).toBe(4);
      expect(steps[1].title).toBe('Enqueue 100');
      expect(steps[2].title).toBe('Enqueue 200');
      expect(steps[3].title).toBe('Dequeue Front Element');
      expect(steps[3].state).toEqual([200]);
    });

    it('generates linked list traversal and insertion steps', () => {
      const steps = DSAStepGenerators.generateLinkedList([10, 20, 30], 25);
      expect(steps.length).toBeGreaterThan(4);
      const insertStep = steps.find((s) => s.title.includes('Insert Node 25'));
      expect(insertStep).toBeDefined();
      expect(insertStep?.state).toEqual([10, 20, 25, 30]);
    });

    it('generates BST search steps validating left and right subtree invariants', () => {
      const nodes = [8, 3, 10, 1, 6, 14];
      const steps = DSAStepGenerators.generateBST(nodes, 6);

      expect(steps.length).toBeGreaterThan(3);
      const branchLeft = steps.find((s) => s.title.includes('Branch Left'));
      expect(branchLeft).toBeDefined();

      const branchRight = steps.find((s) => s.title.includes('Branch Right'));
      expect(branchRight).toBeDefined();

      const match = steps.find((s) => s.title === 'Target Node Found');
      expect(match).toBeDefined();
    });

    it('generates BFS graph traversal steps maintaining queue discovery layer', () => {
      const steps = DSAStepGenerators.generateBFS();
      expect(steps.length).toBeGreaterThan(6);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.title).toBe('BFS Traversal Completed');
      expect(finalStep.variables?.completedOrder).toContain('A');
      expect(finalStep.variables?.completedOrder).toContain('B');
    });

    it('generates DFS graph traversal steps tracking recursive call stack depth', () => {
      const steps = DSAStepGenerators.generateDFS();
      expect(steps.length).toBeGreaterThan(6);

      const enterStep = steps.find((s) => s.title.includes('Enter DFS'));
      expect(enterStep).toBeDefined();

      const backtrackStep = steps.find((s) => s.title.includes('Backtrack'));
      expect(backtrackStep).toBeDefined();
    });

    it('generates DP Fibonacci tabulation steps with subproblem dependency tracking', () => {
      const steps = DSAStepGenerators.generateDPFibonacci(5);
      expect(steps.length).toBeGreaterThan(5);

      const computeStep = steps.find((s) => s.title.includes('Compute dp[2]'));
      expect(computeStep).toBeDefined();
      expect(computeStep?.comparisons).toEqual([1, 0]);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.state?.finalResult).toBe(5); // F(5) = 5
    });

    it('generates Min Heap operations maintaining parent <= children invariant', () => {
      const steps = DSAStepGenerators.generateHeap([4, 10, 3, 5, 1], 'min');
      expect(steps.length).toBeGreaterThan(5);

      const finalStep = steps[steps.length - 1];
      expect(finalStep.title).toBe('MIN Heap Ready');
      expect(finalStep.state?.heap[0]).toBe(1); // Min element at root
    });
  });

  describe('DSAService & Database Query Engine', () => {
    it('retrieves all DSA curriculum topics with categories and concepts', async () => {
      const topics = await DSAService.getTopics();
      expect(topics.length).toBeGreaterThanOrEqual(9);

      const arrays = topics.find((t) => t.slug === 'arrays');
      expect(arrays).toBeDefined();
      expect(arrays?.category).toBe('DATA_STRUCTURE');
      expect(arrays?.concepts?.length).toBeGreaterThan(0);
    });

    it('retrieves algorithms and verifies Big-O complexity metadata', async () => {
      const algo = await DSAService.getAlgorithm('binary-search');
      expect(algo).toBeDefined();
      expect(algo.time_complexity).toBe('O(log N)');
      expect(algo.space_complexity).toBe('O(1)');
      expect(algo.best_case).toBe('O(1)');
      expect(algo.worst_case).toBe('O(log N)');
      expect(algo.in_place).toBe(true);
      expect(algo.visualization_type).toBe('ARRAY');
    });

    it('generates a full visualization session for an algorithm with default data', async () => {
      const session = await DSAService.visualizeAlgorithm('binary-search');
      expect(session.algorithm_name).toBe('Binary Search');
      expect(session.steps.length).toBeGreaterThan(3);
      expect(session.pseudocode.length).toBeGreaterThan(0);
      expect(session.complexity.time).toBe('O(log N)');
    });

    it('generates visualization session with custom student input', async () => {
      const customArray = [1, 3, 5, 7, 9, 11];
      const session = await DSAService.visualizeAlgorithm('binary-search', {
        array: customArray,
        target: 7,
      });

      expect(session.total_steps).toBeGreaterThan(2);
      expect(session.input_data.array).toEqual(customArray);
    });

    it('compares multiple algorithms returning verified complexity dimensions', async () => {
      const comparisons = await DSAService.compareAlgorithms(['algo_bubble_sort', 'algo_quick_sort']);
      expect(comparisons.length).toBe(2);

      const bubble = comparisons.find((c) => c.name === 'Bubble Sort');
      const quick = comparisons.find((c) => c.name === 'Quick Sort');

      expect(bubble?.worst_case).toBe('O(N^2)');
      expect(quick?.average_case).toBe('O(N log N)');
    });

    it('provides progressive 3-tier hints for DSA practice problems', async () => {
      const hint1 = await DSAService.getHints('dsa_prob_binary_search', 1);
      expect(hint1.level).toBe(1);
      expect(hint1.hint).toBeDefined();
      expect(hint1.total_hints).toBe(3);

      const hint2 = await DSAService.getHints('dsa_prob_binary_search', 2);
      expect(hint2.level).toBe(2);
      expect(hint2.hint).not.toEqual(hint1.hint);
    });

    it('tracks student progress, completed visualizations, and weak topics', async () => {
      const initialProgress = await DSAService.getProgress(studentId);
      expect(initialProgress).toBeDefined();

      const updated = await DSAService.recordVisualization(studentId, 'algo_binary_search');
      expect(updated.visualizations_completed).toContain('algo_binary_search');

      const afterSolve = await DSAService.recordProblemSolved(studentId, 'dsa_prob_binary_search');
      expect(afterSolve.problems_solved).toContain('dsa_prob_binary_search');
    });
  });

  describe('AI Tool Registry: DSA Tools Orchestration', () => {
    it('executes visualize_algorithm tool returning step count and complexity', async () => {
      const res = await ToolRegistry.execute(
        'visualize_algorithm',
        { algorithm_id: 'binary-search' },
        { studentId, role: 'STUDENT' }
      );

      expect(res.algorithm_name).toBe('Binary Search');
      expect(res.total_steps).toBeGreaterThan(0);
      expect(res.complexity.time).toBe('O(log N)');
    });

    it('executes get_algorithm_complexity tool returning verified metrics', async () => {
      const res = await ToolRegistry.execute(
        'get_algorithm_complexity',
        { algorithm_id_or_name: 'bubble-sort' },
        { studentId, role: 'STUDENT' }
      );

      expect(res.algorithm).toBe('Bubble Sort');
      expect(res.worst_case).toBe('O(N^2)');
      expect(res.stable).toBe(true);
      expect(res.in_place).toBe(true);
    });

    it('executes compare_algorithms tool returning comparative dimensions', async () => {
      const res = await ToolRegistry.execute(
        'compare_algorithms',
        { algorithm_ids: ['algo_linear_search', 'algo_binary_search'] },
        { studentId, role: 'STUDENT' }
      );

      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(2);
    });

    it('executes generate_dsa_hint tool returning educational clues', async () => {
      const res = await ToolRegistry.execute(
        'generate_dsa_hint',
        { problem_id: 'dsa_prob_binary_search', level: 1 },
        { studentId, role: 'STUDENT' }
      );

      expect(res.level).toBe(1);
      expect(res.hint).toBeDefined();
    });

    it('executes get_dsa_progress tool maintaining backward compatibility and depth', async () => {
      const res = await ToolRegistry.execute(
        'get_dsa_progress',
        {},
        { studentId, role: 'STUDENT' }
      );

      // Real counts only: solvedCount matches the DSA module and topics list only topics with work.
      expect(res.solvedCount).toBe(res.problems_solved.length);
      expect(Array.isArray(res.topics)).toBe(true);
      res.topics.forEach((t: any) => expect(t.attempted).toBeGreaterThan(0));
      expect(res.visualizations_completed).toBeDefined();
    });
  });

  describe('LeetCode Top 150 Dedicated Visualizer Engine', () => {
    it('synthesizes full Algorithm visualization for LeetCode problems', async () => {
      const algo = await DSAService.getAlgorithm('dsa_top150_merge_sorted_array');
      expect(algo).toBeDefined();
      expect(algo.name).toContain('Merge Sorted Array');
      expect(algo.visualization_type).toBe('ARRAY');
      expect(algo.pseudocode.length).toBeGreaterThan(3);
      expect(algo.time_complexity).toBe('O(N)');
    });

    it('generates specialized backward pointers simulation for Merge Sorted Array', async () => {
      const session = await DSAService.visualizeAlgorithm('dsa_top150_merge_sorted_array');
      expect(session.steps.length).toBe(10);
      expect(session.steps[0].title).toBe('Initialize Backward Pointers');
      expect(session.steps[0].pointers?.p1).toBeDefined();
      expect(session.steps[0].pointers?.p2).toBeDefined();
      expect(session.steps[0].pointers?.p).toBeDefined();
    });

    it('generates two-pointer boundary simulation for Trapping Rain Water', async () => {
      const session = await DSAService.visualizeAlgorithm('dsa_top150_trapping_rain_water');
      expect(session.steps.length).toBe(10);
      expect(session.steps[0].pointers?.left).toBe(0);
      expect(session.steps[0].variables?.totalWater).toBe(0);
    });

    it('generates Kadanes algorithm steps for Maximum Subarray', async () => {
      const session = await DSAService.visualizeAlgorithm('lc_150_maximum_subarray');
      expect(session.steps.length).toBe(9);
      expect(session.steps[0].title).toContain("Kadane's Algorithm");
      expect(session.steps[0].variables?.curMax).toBeDefined();
      expect(session.steps[0].variables?.globalMax).toBeDefined();
    });
  });

  describe('AI DSA Tutor Service', () => {
    afterEach(() => vi.restoreAllMocks());

    it('answers with the model output and problem-aware Big-O metadata when a model is configured', async () => {
      const { DSATutorService } = await import('../../server/services/dsaTutorService');
      const { AIService } = await import('../../server/ai/service');
      const spy = vi.spyOn(AIService, 'generate').mockResolvedValue({ text: 'Use two pointers from the end of both arrays.' } as any);
      const response = await DSATutorService.chatWithTutor({
        problem_id: 'dsa_top150_merge_sorted_array',
        question: 'Explain the Big-O time and space complexity derivation',
      });

      expect(spy).toHaveBeenCalledOnce();
      expect(response.message).toBe('Use two pointers from the end of both arrays.');
      expect(response.problem_title).toBe('Merge Sorted Array');
      expect(response.suggestions.length).toBeGreaterThan(0);
      expect(response.optimal_complexity?.time).toBe('O(N)');
      expect(response.optimal_complexity?.space).toBe('O(1)');
    });

    it('returns 503 AI_UNAVAILABLE instead of a template answer when no model is configured', async () => {
      const { DSATutorService } = await import('../../server/services/dsaTutorService');
      const { AIService } = await import('../../server/ai/service');
      vi.spyOn(AIService, 'generate').mockResolvedValue({ text: '**AI unavailable.** No model configured.' } as any);
      await expect(
        DSATutorService.chatWithTutor({ problem_id: 'dsa_top150_trapping_rain_water', question: 'Give me a hint for solving this problem' })
      ).rejects.toMatchObject({ statusCode: 503, code: 'AI_UNAVAILABLE' });
    });
  });
});

