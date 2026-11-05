import { AIService } from '../ai/service';
import { parseModelJson, rethrowAi } from '../ai/modelOutput';
import {
  CodingLanguage,
  CodeExplanationResult,
  CodeDebugResult,
  CodeGenerationResult,
  CodeRefactorResult,
  GeneratedTestCase,
  CodeReviewResult,
  CodeHintResult,
} from '../models/types';
import { db } from '../db/database';
import { ValidationError, NotFoundError } from '../core/exceptions';
import { logger } from '../core/logging';

export class CodeAIService {
  /**
   * Explains student code with step-by-step breakdown, complexity, and concepts.
   */
  public static async explainCode(params: {
    language: CodingLanguage;
    source_code: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<CodeExplanationResult> {
    if (!params.source_code || params.source_code.trim().length === 0) {
      throw new ValidationError('Source code cannot be empty.');
    }

    const level = params.level || 'intermediate';
    const prompt = `You are an expert Computer Science Professor and AI Coding Mentor for B.Tech engineering students.
Analyze the following ${params.language} code for a student at the ${level} level.

\`\`\`${params.language}
${params.source_code}
\`\`\`

Return a valid JSON object matching this schema EXACTLY (do not wrap in markdown or backticks):
{
  "overview": "Clear high-level summary of what the code does",
  "step_by_step": ["Step 1 explanation", "Step 2 explanation"],
  "important_concepts": ["Concept 1 (e.g. Invariant, Two Pointers)", "Concept 2"],
  "time_complexity": "O(N) with derivation",
  "space_complexity": "O(1) with explanation",
  "potential_issues": ["Edge case or limitation 1"],
  "suggestions": ["Idiomatic optimization or cleanup suggestion"]
}`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<CodeExplanationResult>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to explain code via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }

  /**
   * Diagnoses compilation or runtime errors and suggests a targeted fix.
   * Student must explicitly choose to apply the fix.
   */
  public static async debugCode(params: {
    language: CodingLanguage;
    source_code: string;
    error: string;
    stdout?: string;
    stdin?: string;
    problem_statement?: string;
  }): Promise<CodeDebugResult> {
    const prompt = `You are an AI Debugging Mentor for B.Tech engineering students.
A student encountered an error in their ${params.language} program.

Source Code:
\`\`\`${params.language}
${params.source_code}
\`\`\`

Error / Stderr:
${params.error}

${params.stdin ? `Standard Input:\n${params.stdin}\n` : ''}
${params.stdout ? `Standard Output:\n${params.stdout}\n` : ''}
${params.problem_statement ? `Problem Statement:\n${params.problem_statement}\n` : ''}

Diagnose the root cause. Return a valid JSON object matching this schema EXACTLY (do not wrap in markdown or backticks):
{
  "problem": "One-line title of the issue",
  "cause": "Detailed explanation of what triggered the error",
  "location": "Line number or code section responsible",
  "explanation": "Clear educational explanation for a computer science student",
  "suggested_fix": "How to resolve the issue step-by-step",
  "corrected_code": "The full complete corrected source code"
}`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<CodeDebugResult>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to debug code via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }

  /**
   * Generates code based on a student prompt.
   * Generated code is presented for review; NEVER automatically executed.
   */
  public static async generateCode(params: {
    prompt: string;
    language: CodingLanguage;
  }): Promise<CodeGenerationResult> {
    const prompt = `You are an AI Code Intelligence Assistant for B.Tech students.
Generate a high quality, production-grade ${params.language} implementation for this request:
"${params.prompt}"

Return a valid JSON object matching this schema EXACTLY:
{
  "explanation": "Educational walkthrough of the algorithm and data structures used",
  "code": "The clean, idiomatic source code complete with standard I/O handling",
  "language": "${params.language}",
  "example_input": "Sample standard input",
  "example_output": "Expected output",
  "complexity": "Time: O(...), Space: O(...)"
}`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<CodeGenerationResult>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to generate code via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }

  /**
   * Refactors code to improve readability, complexity, and adherence to clean code standards.
   */
  public static async refactorCode(params: {
    language: CodingLanguage;
    source_code: string;
    instruction?: string;
  }): Promise<CodeRefactorResult> {
    const prompt = `You are a Senior Software Engineer reviewing B.Tech student code.
Refactor the following ${params.language} code for better performance, maintainability, and clean software engineering practices.
${params.instruction ? `Specific Goal: ${params.instruction}` : ''}

Original Code:
\`\`\`${params.language}
${params.source_code}
\`\`\`

Return a valid JSON object matching this schema EXACTLY:
{
  "current_code": "${params.source_code.replace(/"/g, '\\"')}",
  "suggested_code": "The refactored clean code",
  "changes": ["List of key architectural or syntax changes"],
  "reason": "Detailed rationale explaining why the new code is superior"
}`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<CodeRefactorResult>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to refactor code via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }

  /**
   * Generates comprehensive test cases: normal, boundary, edge, and invalid inputs.
   */
  public static async generateTestCases(params: {
    language: CodingLanguage;
    source_code: string;
    problem_statement?: string;
  }): Promise<GeneratedTestCase[]> {
    const prompt = `You are an AI Quality Assurance Engineer and Competitive Programming setter.
Generate 4 diverse test cases for this code / problem:
${params.problem_statement ? `Problem: ${params.problem_statement}\n` : ''}
Code:
\`\`\`${params.language}
${params.source_code}
\`\`\`

Return a valid JSON array of test cases matching this schema:
[
  {
    "type": "normal",
    "input": "...",
    "expected": "...",
    "explanation": "Standard typical input"
  },
  {
    "type": "boundary",
    "input": "...",
    "expected": "...",
    "explanation": "Testing min/max limits"
  },
  {
    "type": "edge",
    "input": "...",
    "expected": "...",
    "explanation": "Empty, single element, or extreme case"
  },
  {
    "type": "invalid",
    "input": "...",
    "expected": "...",
    "explanation": "Graceful handling of non-conforming inputs"
  }
]`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<GeneratedTestCase[]>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to generate test cases via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }

  /**
   * Performs a comprehensive code review covering correctness, readability, complexity, and security.
   */
  public static async reviewCode(params: {
    language: CodingLanguage;
    source_code: string;
  }): Promise<CodeReviewResult> {
    const prompt = `Perform a comprehensive technical review of this ${params.language} code for an engineering student.

Code:
\`\`\`${params.language}
${params.source_code}
\`\`\`

Return a valid JSON object matching this schema EXACTLY:
{
  "correctness": "Assessment of functional correctness and logic",
  "readability": "Assessment of naming, comments, structure",
  "maintainability": "Modularity and extensibility assessment",
  "complexity": "Asymptotic analysis of current implementation",
  "edge_cases": ["Edge case 1 to watch out for", "Edge case 2"],
  "possible_bugs": ["Potential vulnerability or subtle off-by-one bug"],
  "security_issues": ["Buffer limits, sanitization, or none identified"],
  "style_improvements": ["PEP 8 / Standard styling advice"]
}`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<CodeReviewResult>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to review code via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }

  /**
   * Generates progressive hints without spoiling the full solution.
   */
  public static async generateHint(params: {
    problem_id?: string;
    level: number;
    current_code?: string;
  }): Promise<CodeHintResult> {
    if (params.problem_id) {
      const prob = await db.getCodingProblemById(params.problem_id);
      if (prob) {
        return db.getCodingProblemHints(params.problem_id, params.level);
      }
    }

    const prompt = `The student is asking for a Hint (Level ${params.level}) for their code:
\`\`\`
${params.current_code || 'Working on algorithm problem'}
\`\`\`

DO NOT reveal the full solution or write complete code. Provide a conceptual nudge to guide their thinking.
Level 1: General intuition.
Level 2: Data structure or invariant suggestion.
Level 3: Specific algorithm hint.

Return a valid JSON object:
{
  "level": ${params.level},
  "hint": "Your conceptual hint text",
  "has_more": ${params.level < 3},
  "total_hints": 3
}`;

    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent');
      return parseModelJson<CodeHintResult>(response, 'AI coding assistant');
    } catch (err: any) {
      logger.error('Failed to generate hint via AI', { error: err.message });
      rethrowAi(err, 'AI coding assistant');
    }
  }
}
