import { AIService } from '../ai/service';
import { db } from '../db/database';
import { logger } from '../core/logging';
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

    try {
      const result = await AIService.generate(
        [{ role: 'user', content: prompt }],
        'student_learning_agent',
        0.5
      );

      if (result && result.text && result.text.trim().length > 0) {
        return {
          message: result.text.trim(),
          suggestions: this.generateSuggestions(problem, userQuestion),
          problem_title: title,
          topic,
          optimal_complexity: { time: timeComp, space: spaceComp },
        };
      }
    } catch (err: any) {
      logger.warn('AI provider generation failed, falling back to deterministic tutor engine', {
        error: err.message,
      });
    }

    // High-fidelity deterministic pedagogical response
    const fallbackResponse = this.generateDeterministicResponse(problem, algorithm, params);

    return {
      message: fallbackResponse,
      suggestions: this.generateSuggestions(problem, userQuestion),
      problem_title: title,
      topic,
      optimal_complexity: { time: timeComp, space: spaceComp },
    };
  }

  /**
   * Deterministic pedagogical response tailored to the problem and question type
   */
  private static generateDeterministicResponse(
    problem: DSAProblem | null,
    algorithm: Algorithm | null,
    params: DSATutorRequest
  ): string {
    const title = problem?.title || algorithm?.name || 'this problem';
    const qLower = (params.question || '').toLowerCase();
    const timeComp = problem?.optimal_complexity?.time || algorithm?.time_complexity || 'O(N)';
    const spaceComp = problem?.optimal_complexity?.space || algorithm?.space_complexity || 'O(1)';

    // 1. Time / Space Complexity Inquiry
    if (qLower.includes('complexity') || qLower.includes('big-o') || qLower.includes('time') || qLower.includes('space')) {
      return `### Complexity Analysis for **${title}**

- **Time Complexity:** \`${timeComp}\`
  - In the optimal solution, each element or state is visited a constant number of times. By avoiding redundant recalculations or nested scans, we achieve optimal linear or logarithmic performance.
- **Auxiliary Space Complexity:** \`${spaceComp}\`
  - ${
    spaceComp.includes('1')
      ? 'The algorithm operates in-place or only allocates a handful of scalar pointer variables without extra buffers.'
      : 'Extra memory is utilized for state tracking (e.g. hash table, recursion stack, or DP tabulation array).'
  }

**Interview Tip:** Always state both the time and space complexity upfront in interviews before writing code, and explain whether memory can be optimized in-place!`;
    }

    // 2. Hint Inquiry
    if (qLower.includes('hint') || qLower.includes('clue') || qLower.includes('stuck')) {
      const hints = problem?.hints || [];
      if (hints.length > 0) {
        return `### Progressive Hint for **${title}**

💡 **Key Insight:** ${hints[0]}

${hints.length > 1 ? `🔍 **Next Level Hint:** ${hints[1]}` : ''}

*Try applying this observation to the sample test cases before jumping directly to implementation!*`;
      }
      return `### Progressive Hint for **${title}**

💡 **Key Insight:** Look at the constraints and sample inputs. Can you maintain state using two pointers, a hash table, or a monotonic structure to avoid a nested $O(N^2)$ brute-force loop?
Try tracing Example 1 with pen and paper: observe what changes at each step.`;
    }

    // 3. Edge Cases Inquiry
    if (qLower.includes('edge') || qLower.includes('corner') || qLower.includes('fail') || qLower.includes('test')) {
      return `### Critical Edge Cases to Verify for **${title}**

When submitting this problem on LeetCode or in an engineering interview, be sure to test:
1. **Empty or Minimal Input:** Array/string with 0 or 1 element.
2. **All Duplicate Values:** Array where every single element is identical (e.g. \`[1, 1, 1, 1]\`).
3. **Negative Numbers & Zero:** If the problem involves integers, test negative values, zeroes, and overflow boundaries.
4. **Already Sorted / Reverse Sorted:** Verify that already sorted inputs don't trigger worst-case behaviors.
5. **Boundary Indexing:** Watch out for off-by-one errors when advancing pointer indices.`;
    }

    // 4. Code Review Inquiry (if code was provided)
    if (params.code && params.code.trim().length > 10) {
      return `### Code Evaluation for **${title}**

I reviewed your **${params.language || 'solution'}** snippet:
\`\`\`${params.language || 'text'}
${params.code}
\`\`\`

**Key Observations:**
1. **Structure:** Your control flow demonstrates the core logic for **${title}**.
2. **Complexity Target:** The optimal solution runs in **${timeComp}** time and **${spaceComp}** space. Verify your loops don't inadvertently perform repeated scans inside the main iteration.
3. **Safety Checks:** Ensure you handle potential boundary conditions (like empty inputs or single-element inputs) before accessing collection indices.

*Would you like to step through this logic using the interactive Step Visualizer?*`;
    }

    // 5. General Approach / Intuition Inquiry
    const desc = problem?.description ? `> ${problem.description.slice(0, 220)}...` : '';
    const explanation = problem?.solution_explanation || algorithm?.concept || '';

    return `### Algorithmic Intuition for **${title}**

${desc}

#### 🧠 Optimal Strategy Overview
To solve this question optimally in **${timeComp}** time and **${spaceComp}** auxiliary space:
- **Core Invariant:** Identify what property remains true at every step of execution.
- **Pattern Match:** This problem is categorized under **${problem?.topic_id || 'DSA'}**. Look for standard patterns like two pointers, sliding window, prefix sums, or dynamic programming.

${explanation ? `#### Editorial Insight\n${explanation.slice(0, 300)}...` : ''}

Would you like me to walk through a specific sample test case or give you a hint for the first step?`;
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
