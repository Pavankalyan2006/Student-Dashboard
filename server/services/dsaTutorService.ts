import { AIService } from '../ai/service';
import { db } from '../db/database';
import { requireModelText, rethrowAi } from '../ai/modelOutput';
import { AppError } from '../core/exceptions';
import { DSAProblem, Algorithm } from '../models/dsaTypes';

export interface DSATutorRequest {
  problem_id?: string;
  algorithm_id?: string;
  question: string;
  code?: string;
  language?: string;
  step_number?: number;
}

export interface DSATutorResponse {
  message: string;
  suggestions: string[];
  problem_title?: string;
  topic?: string;
  optimal_complexity?: {
    time: string;
    space: string;
  };
}

export class DSATutorService {
  /**
   * Interactive AI DSA Tutor conversation engine
   */
  public static async chatWithTutor(params: DSATutorRequest): Promise<DSATutorResponse> {
    const targetId = params.problem_id || params.algorithm_id;
    let problem: DSAProblem | null = null;
    let algorithm: Algorithm | null = null;

    if (targetId) {
      problem = (await db.getDSAProblem(targetId)) || null;
      if (!problem) {
        algorithm = (await db.getDSAAlgorithm(targetId)) || null;
      }
    }

    const title = problem?.title || algorithm?.name || 'Algorithmic Problem Solving';
    const topic = problem?.topic_id || algorithm?.topic_id || 'Data Structures & Algorithms';
    const timeComp = problem?.optimal_complexity?.time || algorithm?.time_complexity || 'O(N)';
    const spaceComp = problem?.optimal_complexity?.space || algorithm?.space_complexity || 'O(1)';

    const userQuestion = params.question?.trim() || 'How should I approach this problem?';

    // Build rich context for LLM
    const contextLines: string[] = [
      `Problem / Subject: ${title}`,
      `Topic Domain: ${topic}`,
      `Optimal Time Complexity: ${timeComp}`,
      `Optimal Space Complexity: ${spaceComp}`,
    ];

    if (problem) {
      contextLines.push(`Difficulty: ${problem.difficulty}`);
      contextLines.push(`Problem Statement: ${problem.description}`);
      if (problem.constraints && problem.constraints.length > 0) {
        contextLines.push(`Constraints: ${problem.constraints.join(', ')}`);
      }
      if (problem.hints && problem.hints.length > 0) {
        contextLines.push(`Curriculum Hints: ${problem.hints.join(' | ')}`);
      }
      if (problem.examples && problem.examples.length > 0) {
        contextLines.push(`Examples: ${JSON.stringify(problem.examples.slice(0, 2))}`);
      }
    }

    if (params.step_number !== undefined) {
      contextLines.push(`Current Step in Visualizer: Step #${params.step_number}`);
    }

    if (params.code && params.code.trim().length > 0) {
      contextLines.push(`Student Code (${params.language || 'code'}):\n\`\`\`\n${params.code}\n\`\`\``);
    }

    const prompt = `You are the AI DSA Tutor, an elite algorithms mentor and competitive programming coach for B.Tech engineering students preparing for top-tier software engineering interviews (LeetCode Top 150).

Context Information:
${contextLines.join('\n')}

Student's Question:
"${userQuestion}"

Instructions:
1. Provide a clear, encouraging, and deeply pedagogical explanation.
2. If the student asks for intuition or approach, explain the core invariant, why the naive approach falls short, and how the optimal pattern (${timeComp}, ${spaceComp}) solves it.
3. If the student provides code, constructively review their code, point out any logical bugs or off-by-one errors, and suggest idiomatic improvements.
4. Keep the explanation formatted in crisp Markdown with bold key terms, clean bullet points, and code snippets where relevant.
5. End with a thought-provoking guiding question to test their understanding.`;

    // Phase 2: no template reply dressed up as tutoring. Without a model the student gets 503 AI_UNAVAILABLE;
    // the problem's own hints remain available in the hints panel.
    let result;
    try {
      result = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.5);
    } catch (err: any) {
      rethrowAi(err, 'The DSA tutor');
    }
    const message = requireModelText(result!, 'The DSA tutor').trim();
    if (!message) throw new AppError('The DSA tutor returned an empty answer. Please try again.', 502, 'AI_BAD_OUTPUT');
    return {
      message,
      suggestions: this.generateSuggestions(problem, userQuestion),
      problem_title: title,
      topic,
      optimal_complexity: { time: timeComp, space: spaceComp },
    };
  }

  /**
   * Context-sensitive follow-up suggestions
   */
  private static generateSuggestions(problem: DSAProblem | null, lastQuestion: string): string[] {
    const qLower = lastQuestion.toLowerCase();

    if (qLower.includes('complexity')) {
      return [
        'How can we optimize space complexity?',
        'Give me a progressive hint for implementation',
        'What are the key edge cases?',
      ];
    }

    if (qLower.includes('hint')) {
      return [
        'Explain the Big-O time and space complexity',
        'Walk through Example 1 step-by-step',
        'Show me the edge cases to test',
      ];
    }

    return [
      'Explain the optimal approach intuition',
      'Derive the time and space complexity',
      'Give me a progressive hint',
      'What are the critical edge cases?',
    ];
  }
}
