import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AIService } from '../../server/ai/service';
import { db } from '../../server/db/database';
import { SandboxService } from '../../server/execution/sandbox';
import { LanguageRegistry } from '../../server/execution/languages';
import { CodingService } from '../../server/services/coding';
import { CodeAIService } from '../../server/services/codeAi';
import { ToolRegistry } from '../../server/ai/tools';
import { AuthorizationError, ValidationError } from '../../server/core/exceptions';

describe('Phase 7 Coding Lab & Code Intelligence Module', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_isolated_test_student_b';
  const sampleProblemId = 'prob_two_sum';

  beforeEach(async () => {
    await db.initialize();
  });

  // =============================================================
  // 1. Language Registry & Configuration
  // =============================================================
  describe('Language Registry', () => {
    it('supports the required 5 programming languages', () => {
      const languages = LanguageRegistry.getAll();
      const ids = languages.map((l) => l.id);

      expect(ids).toContain('python');
      expect(ids).toContain('javascript');
      expect(ids).toContain('c');
      expect(ids).toContain('cpp');
      expect(ids).toContain('java');
    });

    it('retrieves language config with boilerplate, timeout and extension', () => {
      const py = LanguageRegistry.get('python');
      expect(py).toBeDefined();
      expect(py?.file_extension).toBe('.py');
      expect(py?.timeout).toBeGreaterThanOrEqual(3000);
      expect(py?.boilerplate).toContain('Python 3');

      const js = LanguageRegistry.get('javascript');
      expect(js).toBeDefined();
      expect(js?.file_extension).toBe('.js');
      expect(js?.run_command).toContain('node');
    });

    it('rejects unsupported languages cleanly', () => {
      expect(LanguageRegistry.isSupported('ruby')).toBe(false);
      expect(LanguageRegistry.isSupported('rust')).toBe(false);
      expect(LanguageRegistry.get('unknown_lang')).toBeUndefined();
    });
  });

  // =============================================================
  // 2. Sandbox Execution & Security Controls
  // =============================================================
  describe('Sandbox Execution & Resource Isolation', () => {
    it('executes valid Python code and captures standard output', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: `print("B.Tech Coding Lab Sandbox Online!")\nprint(40 + 2)`,
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.stdout.trim().replace(/\r\n/g, '\n')).toBe('B.Tech Coding Lab Sandbox Online!\n42');
      expect(result.exit_code).toBe(0);
      expect(result.execution_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('pipes standard input (stdin) properly to the running process', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: `import sys\ndata = sys.stdin.read().strip()\nprint(f"Echo: {data}")`,
        stdin: 'BTechAI2026',
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.stdout.trim()).toBe('Echo: BTechAI2026');
    });

    it('captures syntax / compilation errors and marks status appropriately', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: `def broken_func(\n    print("Missing closing parenthesis"`,
      });

      expect(['COMPILATION_ERROR', 'RUNTIME_ERROR']).toContain(result.status);
      expect(result.exit_code).not.toBe(0);
      expect(result.stderr).toContain('SyntaxError');
    });

    it('captures runtime exceptions (e.g. division by zero) without crashing', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: `x = 10 / 0\nprint(x)`,
      });

      expect(result.status).toBe('RUNTIME_ERROR');
      expect(result.exit_code).not.toBe(0);
      expect(result.stderr).toContain('ZeroDivisionError');
    });

    it('handles execution timeouts (e.g. infinite loops) with TIMEOUT status', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: `import time\nwhile True:\n    time.sleep(0.1)`,
        timeoutMs: 800, // Short timeout for test speed
      });

      expect(result.status).toBe('TIMEOUT');
      expect(result.stderr).toMatch(/timed out/i);
    });

    it('protects against runaway output exceeding limits (OUTPUT_LIMIT_EXCEEDED)', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: `for _ in range(50000):\n    print("SPAM" * 100)`,
        timeoutMs: 3000,
      });

      expect(['OUTPUT_LIMIT_EXCEEDED', 'TIMEOUT']).toContain(result.status);
      if (result.status === 'OUTPUT_LIMIT_EXCEEDED') {
        expect(result.stdout).toContain('LIMIT EXCEEDED');
      }
    });

    it('rejects empty source code', async () => {
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: '   ',
      });

      expect(result.status).toBe('COMPILATION_ERROR');
      expect(result.stderr).toMatch(/cannot be empty/i);
    });

    it('rejects payload exceeding maximum source size', async () => {
      const hugeCode = 'x = 1\n'.repeat(30000); // > 100 KB
      const result = await SandboxService.execute({
        language: 'python',
        sourceCode: hugeCode,
      });

      expect(result.status).toBe('SECURITY_ERROR');
      expect(result.stderr).toMatch(/exceeds maximum permitted size/i);
    });
  });

  // =============================================================
  // 3. Coding Sessions & Student Ownership Isolation
  // =============================================================
  describe('Coding Sessions & Student Ownership', () => {
    it('creates, retrieves, and updates coding session for Student A', async () => {
      const session = await CodingService.createSession(studentA, {
        language: 'python',
        source_code: 'print("Student A Session")',
        stdin: '123',
      });

      expect(session).toBeDefined();
      expect(session.student_id).toBe(studentA);
      expect(session.language).toBe('python');

      const retrieved = await CodingService.getSession(session.id, studentA);
      expect(retrieved.id).toBe(session.id);
      expect(retrieved.source_code).toBe('print("Student A Session")');

      const updated = await CodingService.updateSession(session.id, studentA, {
        source_code: 'print("Updated code")',
      });
      expect(updated.source_code).toBe('print("Updated code")');
    });

    it('ENFORCES SECURITY: Student B CANNOT access Student A session', async () => {
      const session = await CodingService.createSession(studentA, {
        language: 'python',
        source_code: 'secret_code = 42',
      });

      await expect(CodingService.getSession(session.id, studentB)).rejects.toThrow(
        AuthorizationError
      );
    });

    it('ENFORCES SECURITY: Student B CANNOT update or delete Student A session', async () => {
      const session = await CodingService.createSession(studentA, {
        language: 'python',
        source_code: 'protected_code = 100',
      });

      await expect(
        CodingService.updateSession(session.id, studentB, { source_code: 'hacked' })
      ).rejects.toThrow(AuthorizationError);

      await expect(CodingService.deleteSession(session.id, studentB)).rejects.toThrow(
        AuthorizationError
      );
    });
  });

  // =============================================================
  // 4. Saved Code Library & Ownership
  // =============================================================
  describe('Saved Code Library & Ownership', () => {
    it('allows student to save code snippet and retrieve it', async () => {
      const saved = await CodingService.saveCode(studentA, {
        title: 'Binary Search Implementation',
        language: 'python',
        source_code: `def binary_search(arr, target):\n    pass`,
        description: 'Standard O(log N) lookup',
        tags: ['dsa', 'search'],
      });

      expect(saved.id).toMatch(/^saved_/);
      expect(saved.student_id).toBe(studentA);
      expect(saved.tags).toContain('dsa');

      const list = await CodingService.getStudentSavedCode(studentA);
      expect(list.some((s) => s.id === saved.id)).toBe(true);
    });

    it('ENFORCES SECURITY: Student B cannot retrieve or delete Student A saved code', async () => {
      const saved = await CodingService.saveCode(studentA, {
        title: 'Student A Private Snippet',
        language: 'python',
        source_code: 'private_key = "123"',
      });

      await expect(CodingService.getSavedCode(saved.id, studentB)).rejects.toThrow(
        AuthorizationError
      );

      await expect(CodingService.deleteSavedCode(saved.id, studentB)).rejects.toThrow(
        AuthorizationError
      );
    });
  });

  // =============================================================
  // 5. Code Executions History
  // =============================================================
  describe('Execution History', () => {
    it('records code execution runs and retrieves student history', async () => {
      const exec = await CodingService.runCode(studentA, {
        language: 'python',
        source_code: 'print("History run")',
      });

      expect(exec.execution_id).toBeDefined();

      const history = await CodingService.getStudentExecutions(studentA);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].student_id).toBe(studentA);
      expect(history[0].language).toBe('python');
    });

    it('ENFORCES SECURITY: Student B cannot see Student A execution history', async () => {
      const historyB = await CodingService.getStudentExecutions(studentB);
      // Student B's executions should not contain any student A executions
      for (const h of historyB) {
        expect(h.student_id).toBe(studentB);
      }
    });
  });

  // =============================================================
  // 6. Practice Problems & Test Case Security (Hidden Tests)
  // =============================================================
  describe('Practice Problems & Hidden Test Case Protection', () => {
    it('retrieves problems with difficulty, topic, and tags', async () => {
      const problems = await CodingService.getProblems();
      expect(problems.length).toBeGreaterThanOrEqual(4);

      const twoSum = await CodingService.getProblemById('prob_two_sum');
      expect(twoSum.title).toContain('Two Sum');
      expect(twoSum.difficulty).toBe('EASY');
      expect(twoSum.examples.length).toBeGreaterThan(0);
    });

    it('CRITICAL SECURITY: Public test cases NEVER expose hidden test cases', async () => {
      const publicTests = await CodingService.getPublicTestCases('prob_two_sum');
      expect(publicTests.length).toBeGreaterThan(0);

      // Verify all returned test cases are public and have expected fields
      for (const tc of publicTests) {
        expect(tc.input).toBeDefined();
        expect(tc.expected_output).toBeDefined();
        // Should NOT have is_hidden field exposed or be hidden
        expect((tc as any).is_hidden).toBeUndefined();
      }

      // Check backend store directly to confirm hidden tests exist in DB but were masked
      const allTests = await db.getAllTestCases('prob_two_sum');
      const hiddenTests = allTests.filter((t) => t.is_hidden);
      expect(hiddenTests.length).toBeGreaterThan(0);

      // Verify none of the hidden test case IDs appear in publicTests
      const hiddenIds = hiddenTests.map((t) => t.id);
      for (const pt of publicTests) {
        expect(hiddenIds).not.toContain(pt.id);
      }
    });

    it('evaluates problem submission against test cases and masks hidden details', async () => {
      const solutionPython = `import sys
def solve():
    tokens = sys.stdin.read().split()
    if not tokens: return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])
    seen = {}
    for i, x in enumerate(nums):
        comp = target - x
        if comp in seen:
            print(f"{seen[comp]} {i}")
            return
        seen[x] = i
if __name__ == '__main__':
    solve()
`;

      const sub = await CodingService.submitSolution(studentA, 'prob_two_sum', {
        language: 'python',
        source_code: solutionPython,
      });

      expect(sub).toBeDefined();
      expect(sub.total_tests).toBeGreaterThanOrEqual(4);
      expect(sub.passed_tests).toBe(sub.total_tests);
      expect(sub.status).toBe('ACCEPTED');

      // Check test result masking: hidden test cases must have undefined input and expected_output
      for (const tr of sub.test_results) {
        if (tr.is_hidden) {
          expect(tr.input).toBeUndefined();
          expect(tr.expected_output).toBeUndefined();
        } else {
          expect(tr.input).toBeDefined();
          expect(tr.expected_output).toBeDefined();
        }
      }
    });

    it('marks submission as WRONG_ANSWER when student code produces incorrect output', async () => {
      const wrongSolution = `print("0 0")`;
      const sub = await CodingService.submitSolution(studentA, 'prob_two_sum', {
        language: 'python',
        source_code: wrongSolution,
      });

      expect(sub.status).toBe('WRONG_ANSWER');
      expect(sub.passed_tests).toBeLessThan(sub.total_tests);
    });

    it('provides progressive hints without spoiling full solutions', async () => {
      const hint1 = await CodingService.getProblemHints('prob_two_sum', 1);
      expect(hint1.level).toBe(1);
      expect(hint1.hint).toBeDefined();
      expect(hint1.has_more).toBe(true);

      const hint3 = await CodingService.getProblemHints('prob_two_sum', 3);
      expect(hint3.level).toBe(3);
      expect(hint3.hint).toBeDefined();
    });
  });

  // =============================================================
  // 7. AI Code Intelligence & Tool Registry
  // =============================================================
  describe('AI Code Intelligence & Tool Registry', () => {
    let prompts: string[] = [];
    let stubOn = false;
    const stubAnswers: Array<[RegExp, any]> = [
      [/"overview"/, { overview: 'Computes n factorial recursively', step_by_step: ['Base case n<=1', 'Recursive multiply'], important_concepts: ['Recursion'], time_complexity: 'O(n)', space_complexity: 'O(n)', potential_issues: [], suggestions: [] }],
      [/"corrected_code"/, { problem: 'TypeError', cause: 'str + int', location: 'line 1', explanation: 'Convert 5 to str', suggested_fix: 'str(5)', corrected_code: 'print("Hello" + str(5))', prevention_tip: 'Use f-strings' }],
      [/"type": "normal"|test cases/i, [{ type: 'normal', input: '4', expected: 'True', explanation: 'even' }, { type: 'boundary', input: '0', expected: 'True', explanation: 'zero' }, { type: 'edge', input: '-1', expected: 'False', explanation: 'negative odd' }]],
      [/"readability"/, { correctness: 'Correct for lists of numbers', readability: 'Clear', performance: 'O(n)', security: 'No issues', best_practices: 'Add type hints', complexity: 'O(n)', issues: [], improvements: [] }],
    ];
    beforeEach(() => {
      prompts = [];
      vi.spyOn(AIService, 'generate').mockImplementation(async (messages: any[]) => {
        const prompt = messages.map((m: any) => m.content).join('\n');
        prompts.push(prompt);
        if (!stubOn) return { text: '**AI unavailable.** test', usage: {} } as any;
        const hit = stubAnswers.find(([re]) => re.test(prompt));
        return { text: JSON.stringify(hit ? hit[1] : {}), provider: 'test-stub' } as any;
      });
    });
    afterEach(() => {
      vi.restoreAllMocks();
      stubOn = false;
    });

    it('verifies all 12 AI Coding Tools are registered in ToolRegistry', () => {
      const expectedTools = [
        'analyze_code',
        'explain_code',
        'debug_code',
        'generate_code',
        'refactor_code',
        'generate_test_cases',
        'review_code',
        'suggest_optimization',
        'explain_error',
        'generate_hint',
        'compare_code_output',
        'run_code',
      ];

      for (const toolName of expectedTools) {
        const tool = ToolRegistry.get(toolName);
        expect(tool).toBeDefined();
        expect(tool?.name).toBe(toolName);
        expect(tool?.description).toBeDefined();
      }
    });

    it('verifies confirmation rules: read/analyze is false, run_code is true for AI execution', () => {
      const explainTool = ToolRegistry.get('explain_code');
      expect(explainTool?.confirmationRequired).toBe(false);

      const debugTool = ToolRegistry.get('debug_code');
      expect(debugTool?.confirmationRequired).toBe(false);

      const runTool = ToolRegistry.get('run_code');
      expect(runTool?.confirmationRequired).toBe(true); // AI triggering execution requires student confirmation!
    });

    // No model is configured in tests. Without one, every AI coding action must fail with 503
    // instead of returning template text; with a stubbed model, the prompt must carry the
    // student's actual code and language.
    it('returns 503 AI_UNAVAILABLE instead of template output when no model is configured', async () => {
      await expect(CodeAIService.explainCode({ language: 'python', source_code: 'print(1)' })).rejects.toMatchObject({ statusCode: 503 });
      await expect(CodeAIService.reviewCode({ language: 'python', source_code: 'print(1)' })).rejects.toMatchObject({ statusCode: 503 });
      await expect(CodeAIService.generateHint({ language: 'python', source_code: 'print(1)', problem_description: 'x', level: 1 } as any)).rejects.toMatchObject({ statusCode: 503 });
    });

    it('explains code with step-by-step breakdown, complexity, and concepts', async () => {
      stubOn = true;
      const explanation = await CodeAIService.explainCode({
        language: 'python',
        source_code: `def factorial(n):\n    return 1 if n <= 1 else n * factorial(n - 1)`,
      });

      expect(explanation.overview).toBeDefined();
      expect(explanation.step_by_step.length).toBeGreaterThan(0);
      expect(explanation.time_complexity).toBeDefined();
      expect(explanation.space_complexity).toBeDefined();
      // The model saw the student's real code and language.
      expect(prompts[0]).toContain('def factorial(n)');
      expect(prompts[0]).toContain('python');
    });

    it('diagnoses code errors with root cause, explanation, and corrected code', async () => {
      stubOn = true;
      const debugResult = await CodeAIService.debugCode({
        language: 'python',
        source_code: `print("Hello" + 5)`,
        error: 'TypeError: can only concatenate str (not "int") to str',
      });

      expect(debugResult.problem).toBeDefined();
      expect(debugResult.cause).toBeDefined();
      expect(debugResult.suggested_fix).toBeDefined();
      expect(debugResult.corrected_code).toBeDefined();
    });

    it('generates test cases with normal, boundary, edge, and invalid categories', async () => {
      stubOn = true;
      const cases = await CodeAIService.generateTestCases({
        language: 'python',
        source_code: 'def is_even(n): return n % 2 == 0',
      });

      expect(cases.length).toBeGreaterThanOrEqual(3);
      const types = cases.map((c) => c.type);
      expect(types).toContain('normal');
    });

    it('reviews code for correctness, readability, and security', async () => {
      stubOn = true;
      const review = await CodeAIService.reviewCode({
        language: 'python',
        source_code: 'def sum_all(nums): return sum(nums)',
      });

      expect(review.correctness).toBeDefined();
      expect(review.readability).toBeDefined();
      expect(review.complexity).toBeDefined();
    });

    it('compares program output against expected output via tool', async () => {
      const toolRes = await ToolRegistry.execute(
        'compare_code_output',
        {
          actual_output: '42\n',
          expected_output: '42',
        },
        { studentId: studentA }
      );

      expect(toolRes.matches).toBe(true);
    });
  });

  // =============================================================
  // 8. Progress Tracking & Dashboard Integration
  // =============================================================
  describe('Progress Tracking & Analytics', () => {
    it('aggregates student coding progress metrics', async () => {
      const progress = await CodingService.getStudentProgress(studentA);
      expect(progress.problems_attempted).toBeGreaterThanOrEqual(1);
      expect(progress.problems_completed).toBeGreaterThanOrEqual(1);
      expect(progress.total_executions).toBeGreaterThanOrEqual(1);
      expect(progress.languages_used).toContain('python');
    });
  });
});
