import {
  CodingLanguage,
  ExecutionResult,
  CodingSession,
  SavedCode,
  CodeExecution,
  CodingProblem,
  PublicTestCase,
  CodeSubmission,
  CodingProgressSummary,
  SubmissionStatus,
} from '../models/types';
import { db } from '../db/database';
import { SandboxService } from '../execution/sandbox';
import { LanguageRegistry } from '../execution/languages';
import { ValidationError, NotFoundError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class CodingService {
  /**
   * Runs student code in the isolated sandbox and records history.
   */
  public static async runCode(
    studentId: string,
    params: {
      language: CodingLanguage;
      source_code: string;
      stdin?: string;
      problem_id?: string;
      session_id?: string;
    }
  ): Promise<ExecutionResult> {
    if (!params.source_code || params.source_code.trim().length === 0) {
      throw new ValidationError('Source code cannot be empty.');
    }

    if (!LanguageRegistry.isSupported(params.language)) {
      throw new ValidationError(`Unsupported programming language: ${params.language}`);
    }

    const execResult = await SandboxService.execute({
      language: params.language,
      sourceCode: params.source_code,
      stdin: params.stdin || '',
    });

    // Record execution history
    const recorded = await db.recordExecution(studentId, {
      session_id: params.session_id,
      problem_id: params.problem_id,
      language: params.language,
      source_code_snapshot: params.source_code,
      stdin: params.stdin || '',
      status: execResult.status,
      stdout: execResult.stdout,
      stderr: execResult.stderr,
      exit_code: execResult.exit_code,
      execution_time_ms: execResult.execution_time_ms,
      memory_kb: execResult.memory_kb,
    });

    // If session exists, link last execution
    if (params.session_id) {
      await db.updateCodingSession(params.session_id, studentId, {
        last_execution_id: recorded.id,
      });
    }

    return {
      ...execResult,
      execution_id: recorded.id,
    };
  }

  /**
   * Evaluates student code against official public and hidden test cases.
   * Hidden inputs and expected outputs are strictly masked in the response.
   */
  public static async submitSolution(
    studentId: string,
    problemId: string,
    params: {
      language: CodingLanguage;
      source_code: string;
    }
  ): Promise<CodeSubmission> {
    const problem = await db.getCodingProblemById(problemId);
    if (!problem) {
      throw new NotFoundError(`Problem not found: ${problemId}`);
    }

    if (!LanguageRegistry.isSupported(params.language)) {
      throw new ValidationError(`Unsupported programming language: ${params.language}`);
    }

    const testCases = await db.getAllTestCases(problemId);
    if (testCases.length === 0) {
      throw new ValidationError('No test cases configured for this problem.');
    }

    let passedCount = 0;
    let totalTimeMs = 0;
    let finalStatus: SubmissionStatus = 'ACCEPTED';
    const testResults: CodeSubmission['test_results'] = [];

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
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
        break; // Stop on compilation error
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

      // Output comparison with whitespace trimming
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
        actual_output: tc.is_hidden ? (isPassed ? undefined : '[Hidden Test Case]') : exec.stdout,
        execution_time_ms: exec.execution_time_ms,
      });
    }

    const submission = await db.recordSubmission(studentId, {
      problem_id: problemId,
      language: params.language,
      source_code: params.source_code,
      status: finalStatus,
      passed_tests: passedCount,
      total_tests: testCases.length,
      execution_time_ms: totalTimeMs,
      test_results: testResults,
    });

    return submission;
  }

  // --- Problems ---

  public static async getProblems(filter?: { difficulty?: string; topic?: string; search?: string }): Promise<CodingProblem[]> {
    return db.getCodingProblems(filter);
  }

  public static async getProblemById(id: string): Promise<CodingProblem> {
    const prob = await db.getCodingProblemById(id);
    if (!prob) {
      throw new NotFoundError(`Problem not found: ${id}`);
    }
    return prob;
  }

  public static async getPublicTestCases(problemId: string): Promise<PublicTestCase[]> {
    return db.getPublicTestCases(problemId);
  }

  public static async getProblemHints(problemId: string, level = 1) {
    return db.getCodingProblemHints(problemId, level);
  }

  // --- Sessions ---

  public static async createSession(studentId: string, data: Partial<CodingSession>): Promise<CodingSession> {
    return db.createCodingSession(studentId, data);
  }

  public static async getSession(id: string, studentId: string): Promise<CodingSession> {
    const session = await db.getCodingSession(id, studentId);
    if (!session) {
      throw new NotFoundError(`Coding session not found: ${id}`);
    }
    return session;
  }

  public static async updateSession(id: string, studentId: string, data: Partial<CodingSession>): Promise<CodingSession> {
    const session = await db.updateCodingSession(id, studentId, data);
    if (!session) {
      throw new NotFoundError(`Coding session not found: ${id}`);
    }
    return session;
  }

  public static async deleteSession(id: string, studentId: string): Promise<boolean> {
    return db.deleteCodingSession(id, studentId);
  }

  public static async getStudentSessions(studentId: string): Promise<CodingSession[]> {
    return db.getStudentCodingSessions(studentId);
  }

  // --- Saved Code ---

  public static async saveCode(
    studentId: string,
    data: { title: string; language: CodingLanguage; source_code: string; description?: string; tags?: string[] }
  ): Promise<SavedCode> {
    if (!data.source_code || data.source_code.trim().length === 0) {
      throw new ValidationError('Source code cannot be empty.');
    }
    return db.createSavedCode(studentId, data);
  }

  public static async getSavedCode(id: string, studentId: string): Promise<SavedCode> {
    const code = await db.getSavedCode(id, studentId);
    if (!code) {
      throw new NotFoundError(`Saved code not found: ${id}`);
    }
    return code;
  }

  public static async updateSavedCode(id: string, studentId: string, data: Partial<SavedCode>): Promise<SavedCode> {
    const code = await db.updateSavedCode(id, studentId, data);
    if (!code) {
      throw new NotFoundError(`Saved code not found: ${id}`);
    }
    return code;
  }

  public static async deleteSavedCode(id: string, studentId: string): Promise<boolean> {
    return db.deleteSavedCode(id, studentId);
  }

  public static async getStudentSavedCode(studentId: string): Promise<SavedCode[]> {
    return db.getStudentSavedCode(studentId);
  }

  // --- Executions History ---

  public static async getStudentExecutions(studentId: string, limit = 50): Promise<CodeExecution[]> {
    return db.getStudentExecutions(studentId, limit);
  }

  // --- Submissions History ---

  public static async getStudentSubmissions(studentId: string, problemId?: string): Promise<CodeSubmission[]> {
    return db.getStudentSubmissions(studentId, problemId);
  }

  // --- Progress Summary ---

  public static async getStudentProgress(studentId: string): Promise<CodingProgressSummary> {
    return db.getStudentCodingProgress(studentId);
  }
}
