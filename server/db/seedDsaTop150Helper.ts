import { DSAProblem, DSADifficulty } from '../models/dsaTypes';

export function createProblem(params: {
  id: string;
  title: string;
  slug?: string;
  topic_id: string;
  difficulty: DSADifficulty;
  editorial_url: string;
  description: string;
  constraints?: string[];
  input_format?: string;
  output_format?: string;
  examples: { input: string; output: string; explanation?: string }[];
  hints: string[];
  solution_explanation?: string;
  optimal_complexity?: { time: string; space: string };
  python_starter?: string;
  js_starter?: string;
  cpp_starter?: string;
  java_starter?: string;
}): DSAProblem {
  const slug = params.slug || params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const constraints = params.constraints || [
    '1 <= nums.length <= 10^5',
    '-10^4 <= nums[i] <= 10^4',
  ];

  const defaultPython = params.python_starter || `# Solution for ${params.title}
import sys

def solve():
    """
    LeetCode Top Interview 150: ${params.title}
    Difficulty: ${params.difficulty}
    Editorial: ${params.editorial_url}
    """
    pass

if __name__ == '__main__':
    solve()
`;

  const defaultJs = params.js_starter || `/**
 * LeetCode Top Interview 150: ${params.title}
 * Difficulty: ${params.difficulty}
 * Editorial: ${params.editorial_url}
 */
function solve() {
    // Write your code here
}
`;

  const defaultCpp = params.cpp_starter || `// LeetCode Top Interview 150: ${params.title}
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write solution logic here
    return 0;
}
`;

  const defaultJava = params.java_starter || `// LeetCode Top Interview 150: ${params.title}
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Solution implementation
    }
}
`;

  const defaultC = `// LeetCode Top Interview 150: ${params.title}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Implement standard C logic
    return 0;
}
`;

  const explanation = params.solution_explanation || `### Official Solution & Editorial
[View LeetCode Editorial](${params.editorial_url})

#### Approach Overview
This challenge tests optimal memory patterns, invariant tracking, and corner-case resolution.

- **Time Complexity:** ${params.optimal_complexity?.time || 'Optimal asymptotic bounds'}
- **Space Complexity:** ${params.optimal_complexity?.space || 'Auxiliary memory bounds'}
`;

  return {
    id: params.id,
    title: params.title,
    slug,
    topic_id: params.topic_id,
    difficulty: params.difficulty,
    description: params.description,
    constraints,
    input_format: params.input_format || 'Standard input streams matching problem constraints.',
    output_format: params.output_format || 'Computed return values or updated reference structure.',
    examples: params.examples,
    starter_code: {
      python: defaultPython,
      javascript: defaultJs,
      cpp: defaultCpp,
      java: defaultJava,
      c: defaultC,
    },
    hints: params.hints,
    solution_explanation: explanation,
    editorial_url: params.editorial_url,
    supported_languages: ['python', 'javascript', 'cpp', 'java', 'c'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  };
}
