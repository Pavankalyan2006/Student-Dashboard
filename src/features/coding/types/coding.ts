export type CodingLanguage = 'python' | 'javascript' | 'c' | 'cpp' | 'java';

export type ExecutionStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCESS'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'MEMORY_LIMIT'
  | 'OUTPUT_LIMIT_EXCEEDED'
  | 'SECURITY_ERROR'
  | 'SYSTEM_ERROR';

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT'
  | 'MEMORY_LIMIT';

export type ProblemDifficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';

export interface LanguageConfig {
  id: CodingLanguage;
  display_name: string;
  file_extension: string;
  compiler_command?: string;
  run_command: string;
  version_command: string;
  timeout: number;
  memory_limit_mb: number;
  enabled: boolean;
  boilerplate: string;
}

export interface ExecutionResult {
  execution_id?: string;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_kb?: number;
  error_message?: string;
}

export interface CodingSession {
  id: string;
  student_id: string;
  language: CodingLanguage;
  source_code: string;
  stdin: string;
  problem_id?: string;
  status: 'active' | 'archived';
  last_execution_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedCode {
  id: string;
  student_id: string;
  title: string;
  language: CodingLanguage;
  source_code: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

export interface CodeExecution {
  id: string;
  student_id: string;
  session_id?: string;
  problem_id?: string;
  language: CodingLanguage;
  source_code_snapshot: string;
  stdin: string;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_kb?: number;
  created_at: string;
}

export interface PublicTestCase {
  id: string;
  input: string;
  expected_output: string;
  explanation?: string;
}

export interface CodingProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  topic: string;
  constraints: string[];
  input_format: string;
  output_format: string;
  examples: CodingProblemExample[];
  starter_code: Record<CodingLanguage, string>;
  supported_languages: CodingLanguage[];
  tags: string[];
  hints: string[];
  created_at: string;
  updated_at: string;
  public_test_cases?: PublicTestCase[];
}

export interface CodeSubmission {
  id: string;
  student_id: string;
  problem_id: string;
  language: CodingLanguage;
  source_code: string;
  status: SubmissionStatus;
  passed_tests: number;
  total_tests: number;
  execution_time_ms: number;
  test_results: {
    test_index: number;
    passed: boolean;
    is_hidden: boolean;
    input?: string;
    expected_output?: string;
    actual_output?: string;
    error?: string;
    execution_time_ms: number;
  }[];
  created_at: string;
}

export interface CodingProgressSummary {
  problems_attempted: number;
  problems_completed: number;
  languages_used: string[];
  topics_practiced: string[];
  total_executions: number;
  recent_sessions: {
    id: string;
    language: CodingLanguage;
    updated_at: string;
    problem_title?: string;
  }[];
}

export interface CodeExplanationResult {
  overview: string;
  step_by_step: string[];
  important_concepts: string[];
  time_complexity: string;
  space_complexity: string;
  potential_issues: string[];
  suggestions: string[];
}

export interface CodeDebugResult {
  problem: string;
  cause: string;
  location?: string;
  explanation: string;
  suggested_fix: string;
  corrected_code: string;
}

export interface CodeGenerationResult {
  explanation: string;
  code: string;
  language: string;
  example_input: string;
  example_output: string;
  complexity: string;
}

export interface CodeRefactorResult {
  current_code: string;
  suggested_code: string;
  changes: string[];
  reason: string;
}

export interface GeneratedTestCase {
  type: 'normal' | 'boundary' | 'edge' | 'invalid';
  input: string;
  expected: string;
  explanation: string;
}

export interface CodeReviewResult {
  correctness: string;
  readability: string;
  maintainability: string;
  complexity: string;
  edge_cases: string[];
  possible_bugs: string[];
  security_issues: string[];
  style_improvements: string[];
}

export interface CodeHintResult {
  level: number;
  hint: string;
  has_more: boolean;
  total_hints: number;
}

export interface EditorSettings {
  theme: 'vs-dark' | 'light';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
}
