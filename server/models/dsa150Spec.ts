// Schema and definition for canonical DSA 150 questions

export interface CanonicalQuestionSpec {
  id: string;
  number: number;
  title: string;
  slug: string;
  topic_id: string;
  topic_name: string;
  subtopic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  roadmap_stage: 'Beginner Foundations' | 'Core Patterns' | 'Intermediate Problem Solving' | 'Advanced Algorithms' | 'Placement Revision';
  companies: string[];
  description: string;
  input_format: string;
  output_format: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  public_test_cases: { input: string; output: string }[];
  hidden_test_cases: { input: string; output: string }[];
  hints: [string, string, string]; // Hint 1, 2, 3
  time_complexity: string;
  space_complexity: string;
  solution_explanation: string;
  starter_code: {
    python: string;
    javascript: string;
    java: string;
    cpp: string;
  };
  reference_solution: {
    python: string;
    javascript?: string;
  };
}
