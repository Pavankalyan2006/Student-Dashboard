import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { DSAService } from '../../server/services/dsa';
import { TOP150_TOPICS, TOP150_PROBLEMS } from '../../server/db/dsa150Catalog';

describe('Top 150 DSA Practice Master Engine Test Suite', () => {
  const studentId = 'std_test_dsa_master_150';

  beforeAll(async () => {
    await db.initialize();
  });

  describe('Master Catalog Quantity & Structural Rigor', () => {
    it('contains exactly 150 unique questions', async () => {
      const problems = await DSAService.getProblems();
      expect(problems.length).toBe(150);

      const ids = new Set(problems.map((p) => p.id));
      expect(ids.size).toBe(150);

      const slugs = new Set(problems.map((p) => p.slug));
      expect(slugs.size).toBe(150);
    });

    it('conforms to the exact difficulty distribution: 45 Easy, 75 Medium, 30 Hard', async () => {
      const problems = await DSAService.getProblems();
      const diffCounts = { EASY: 0, MEDIUM: 0, HARD: 0 };
      problems.forEach((p) => {
        diffCounts[p.difficulty as keyof typeof diffCounts]++;
      });

      expect(diffCounts.EASY).toBe(45);
      expect(diffCounts.MEDIUM).toBe(75);
      expect(diffCounts.HARD).toBe(30);
      expect(diffCounts.EASY + diffCounts.MEDIUM + diffCounts.HARD).toBe(150);
    });

    it('matches the exact distribution across all 16 canonical topics', async () => {
      const topics = await DSAService.getTopics();
      expect(topics.length).toBe(16);

      const problems = await DSAService.getProblems();
      const topicCounts: Record<string, number> = {};
      problems.forEach((p) => {
        topicCounts[p.topic_id] = (topicCounts[p.topic_id] || 0) + 1;
      });

      const expectedCounts: Record<string, number> = {
        topic_arrays_hashing: 16,
        topic_strings: 11,
        topic_two_pointers: 8,
        topic_sliding_window: 8,
        topic_binary_search: 8,
        topic_sorting_searching: 7,
        topic_linked_lists: 10,
        topic_stacks_queues: 8,
        topic_recursion_backtracking: 10,
        topic_trees_bst: 14,
        topic_heaps: 6,
        topic_graphs: 13,
        topic_greedy: 7,
        topic_dynamic_programming: 16,
        topic_tries_advanced: 4,
        topic_bit_manipulation: 4,
      };

      for (const [topicId, target] of Object.entries(expectedCounts)) {
        expect(topicCounts[topicId]).toBe(target);
      }
    });

    it('validates that every single problem has complete specification metadata', async () => {
      const problems = await DSAService.getProblems();

      problems.forEach((p, idx) => {
        expect(p.title, `Problem ${idx + 1} (${p.id}) has empty title`).toBeTruthy();
        expect(p.description, `Problem ${idx + 1} (${p.id}) has empty description`).toBeTruthy();
        expect(p.examples.length, `Problem ${idx + 1} (${p.id}) must have >= 1 example`).toBeGreaterThanOrEqual(1);
        expect(p.constraints.length, `Problem ${idx + 1} (${p.id}) must have >= 1 constraint`).toBeGreaterThanOrEqual(1);
        expect(p.hints.length, `Problem ${idx + 1} (${p.id}) must have exactly 3 progressive hints`).toBe(3);
        expect(p.starter_code.python, `Problem ${idx + 1} (${p.id}) missing python starter`).toBeTruthy();
        expect(p.starter_code.javascript, `Problem ${idx + 1} (${p.id}) missing javascript starter`).toBeTruthy();
        expect(p.starter_code.java, `Problem ${idx + 1} (${p.id}) missing java starter`).toBeTruthy();
        expect(p.starter_code.cpp, `Problem ${idx + 1} (${p.id}) missing cpp starter`).toBeTruthy();
        expect(p.public_test_cases?.length, `Problem ${idx + 1} (${p.id}) missing public test cases`).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Real Code Execution: Run Code vs Submit Solution', () => {
    it('executes Run Code on sample test cases without altering student solved record', async () => {
      const problemId = 'dsa_prob_binary_search';
      const initialProgress = await DSAService.getProgress(studentId);
      const wasSolved = initialProgress.problems_solved.includes(problemId);

      // Run code with valid solution
      const correctPython = `import sys

def binarySearch(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        elif nums[m] < target:
            l = m + 1
        else:
            r = m - 1
    return -1

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split())) if lines[0].strip() else []
        target = int(lines[1].strip())
        print(binarySearch(nums, target))
`;

      const runResult = await DSAService.runCode(problemId, {
        language: 'python',
        source_code: correctPython,
      });

      expect(runResult.status).toBe('ACCEPTED');
      expect(runResult.passed_count).toBeGreaterThanOrEqual(2);
      expect(runResult.test_results.length).toBeGreaterThanOrEqual(2);
      expect(runResult.test_results[0].passed).toBe(true);
      expect(runResult.execution_time_ms).toBeGreaterThanOrEqual(0);

      // Verify that Run Code DID NOT mark problem solved!
      const afterRunProgress = await DSAService.getProgress(studentId);
      expect(afterRunProgress.problems_solved.includes(problemId)).toBe(wasSolved);
    });

    it('returns WRONG_ANSWER when run code produces incorrect outputs', async () => {
      const problemId = 'dsa_prob_binary_search';

      const faultyPython = `import sys

if __name__ == '__main__':
    print(999999) # Intentionally wrong index
`;

      const runResult = await DSAService.runCode(problemId, {
        language: 'python',
        source_code: faultyPython,
      });

      expect(runResult.status).toBe('WRONG_ANSWER');
      expect(runResult.passed_count).toBe(0);
      expect(runResult.test_results[0].passed).toBe(false);
    });

    it('submits solution, tests public + hidden cases, and records solved in progress', async () => {
      const problemId = 'dsa_prob_binary_search';

      const validPython = `import sys

def binarySearch(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        elif nums[m] < target:
            l = m + 1
        else:
            r = m - 1
    return -1

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split())) if lines[0].strip() else []
        target = int(lines[1].strip())
        print(binarySearch(nums, target))
`;

      const submission = await DSAService.submitSolution(studentId, problemId, {
        language: 'python',
        source_code: validPython,
      });

      expect(submission.status).toBe('ACCEPTED');
      expect(submission.passed_tests).toBe(submission.total_tests);
      expect(submission.total_tests).toBeGreaterThanOrEqual(3);

      // Verify hidden test privacy: input/expected_output undefined for hidden cases
      const hiddenTest = submission.test_results?.find((tr) => tr.is_hidden);
      if (hiddenTest) {
        expect(hiddenTest.input).toBeUndefined();
        expect(hiddenTest.expected_output).toBeUndefined();
      }

      // Verify that Submit marked problem solved in DSAProgress
      const progress = await DSAService.getProgress(studentId);
      expect(progress.problems_solved).toContain(problemId);
      expect(progress.problems_attempted).toContain(problemId);
    });
  });

  describe('Roadmap, Daily Challenge, Analytics & Personalization', () => {
    it('generates 4-stage learning roadmap with accurate topic counts', async () => {
      const roadmap = await DSAService.getRoadmap(studentId);
      expect(roadmap.length).toBe(4);

      const stages = roadmap.map((s) => s.stage);
      expect(stages).toContain('Beginner Foundations');
      expect(stages).toContain('Core Patterns');
      expect(stages).toContain('Advanced Mastery');
      expect(stages).toContain('Placement Revision');

      const totalAcrossStages = roadmap.reduce((acc, s) => acc + s.total_problems, 0);
      expect(totalAcrossStages).toBe(150);
    });

    it('returns deterministic daily challenge with problem metadata', async () => {
      const challenge = await DSAService.getDailyChallenge(studentId);
      expect(challenge.date).toBeDefined();
      expect(challenge.problem).toBeDefined();
      expect(challenge.problem.title).toBeDefined();
      expect(challenge.problem.hints.length).toBe(3);
    });

    it('tracks analytics across difficulty tiers and canonical topics', async () => {
      const analytics = await DSAService.getAnalytics(studentId);
      expect(analytics.total_problems).toBe(150);
      expect(analytics.by_difficulty.easy.total).toBe(45);
      expect(analytics.by_difficulty.medium.total).toBe(75);
      expect(analytics.by_difficulty.hard.total).toBe(30);
      expect(analytics.by_topic.length).toBe(16);
      expect(analytics.daily_streak).toBeGreaterThanOrEqual(1);
    });

    it('handles student bookmarks and code draft cloud persistence', async () => {
      const problemId = 'dsa_top150_001';

      // Toggle bookmark
      const toggle1 = await DSAService.toggleBookmark(studentId, problemId);
      expect(toggle1.bookmarked).toBe(true);
      expect(toggle1.bookmarks).toContain(problemId);

      const bookmarks = await DSAService.getBookmarks(studentId);
      expect(bookmarks).toContain(problemId);

      // Save code draft
      await DSAService.saveDraft(studentId, problemId, {
        code: 'def twoSum(nums, target): return [0, 1]',
        language: 'python',
      });

      const draft = await DSAService.getDraft(studentId, problemId);
      expect(draft).toBeDefined();
      expect(draft?.code).toContain('twoSum');
      expect(draft?.language).toBe('python');
    });
  });
});
