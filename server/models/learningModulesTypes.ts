// server/models/learningModulesTypes.ts
// Comprehensive types for the 10 New AI-Powered Learning Modules

// ==========================================
// 1. AI Study Planner Models
// ==========================================
export type StudyPlanType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'EXAM' | 'PLACEMENT' | 'PROJECT' | 'RESEARCH' | 'REVISION';
export type StudyTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type StudyTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED';

export interface StudyPlanTask {
  id: string;
  plan_id: string;
  student_id: string;
  title: string;
  subject: string;
  topic: string;
  start_time?: string;
  duration_minutes: number;
  priority: StudyTaskPriority;
  status: StudyTaskStatus;
  date?: string; // YYYY-MM-DD
  course_id?: string;
  lesson_id?: string;
  resource_url?: string;
  notes?: string;
  ai_recommendation?: string;
  is_ai_recommended?: boolean;
  completed_at?: string;
  created_at?: string;
}

export interface StudyPlan {
  id: string;
  student_id: string;
  title: string;
  type: StudyPlanType;
  description: string;
  target_date: string;
  total_hours_target: number;
  completed_hours: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  tasks: StudyPlanTask[];
  created_at: string;
  updated_at: string;
}

// ==========================================
// 2. Exam Preparation Center Models
// ==========================================
export type ExamCategory = 'UNIVERSITY' | 'SEMESTER' | 'INTERNAL' | 'LAB' | 'VIVA' | 'COMPETITIVE' | 'PLACEMENT' | 'CUSTOM';
export type ExamDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGING';

export interface ExamTopic {
  id: string;
  exam_id: string;
  name: string;
  unit: string;
  weightage_percent: number;
  confidence: 'WEAK' | 'DEVELOPING' | 'STRONG';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'REVISED' | 'MASTERED';
  revision_due_date?: string;
  subtopics: string[];
}

export interface ExamMockQuestion {
  id: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  marks: number;
  topic: string;
}

export interface ExamEntity {
  id: string;
  student_id: string;
  title: string;
  subject: string;
  category: ExamCategory;
  exam_date: string;
  difficulty: ExamDifficulty;
  available_prep_hours: number;
  syllabus: string;
  readiness_score: number; // 0 - 100
  topics: ExamTopic[];
  mock_tests_count: number;
  last_mock_score?: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

// ==========================================
// 3. AI Doubt Solver Models
// ==========================================
export type DoubtStatus = 'OPEN' | 'RESOLVED' | 'NEEDS_REVIEW';

export interface DoubtResolution {
  direct_answer: string;
  simple_explanation: string;
  detailed_explanation: string;
  example: string;
  common_mistake: string;
  related_concepts: string[];
  suggested_practice: string;
  quiz_question?: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export interface StudentDoubt {
  id: string;
  student_id: string;
  title: string;
  question_text: string;
  code_snippet?: string;
  topic: string;
  course_id?: string;
  course_name?: string;
  status: DoubtStatus;
  resolution?: DoubtResolution;
  tags: string[];
  created_at: string;
  resolved_at?: string;
}

// ==========================================
// 4. Flashcards + Spaced Revision Models
// ==========================================
export type FlashcardType = 'DEFINITION' | 'CONCEPT' | 'FORMULA' | 'CODE' | 'SYNTAX' | 'COMPARISON' | 'QA' | 'SCENARIO';
export type FlashcardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';
export type ReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY' | number;

export interface Flashcard {
  id: string;
  deck_id: string;
  student_id: string;
  front: string;
  back: string;
  type: FlashcardType;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  source?: string;
  state: FlashcardState;
  confidence: number; // 1 - 5
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed?: string;
  next_review: string;
  /** Aliases of next_review / last_reviewed returned for API clients. */
  next_review_at?: string;
  last_reviewed_at?: string;
  created_at: string;
  interval_days?: number;
  ease_factor?: number;
  repetition_count?: number;
  is_bookmarked?: boolean;
  explanation?: string;
  example?: string;
  tags?: string[];
  source_type?: 'MANUAL' | 'AI_GENERATED' | 'NOTES' | 'DOCUMENT' | 'COURSE' | 'AI_TUTOR';
  source_id?: string;
  source_title?: string;
}

export interface FlashcardDeck {
  id: string;
  student_id: string;
  title: string;
  subject: string;
  description: string;
  total_cards: number;
  due_count: number;
  mastered_count: number;
  cards: Flashcard[];
  created_at: string;
  updated_at?: string;
  last_reviewed_at?: string;
  course_id?: string;
  course_code?: string;
  tags?: string[];
  is_archived?: boolean;
  is_bookmarked?: boolean;
  source_type?: 'MANUAL' | 'AI_GENERATED' | 'NOTES' | 'DOCUMENT' | 'COURSE' | 'AI_TUTOR';
  source_id?: string;
  source_title?: string;
}

export interface FlashcardStats {
  total_decks: number;
  total_cards: number;
  due_today: number;
  reviewed_today: number;
  mastered_cards: number;
  learning_cards: number;
  new_cards: number;
  streak_days: number;
  overall_coverage_pct: number;
  mastery_pct: number;
  rating_distribution: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  recent_activity: Array<{ date: string; count: number }>;
  coverage_percentage?: number;
  mastery_percentage?: number;
  recent_activity_7d?: Array<{ date: string; count: number }>;
}

export interface FlashcardAIGenerateRequest {
  topic: string;
  subject?: string;
  course_id?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  count?: number;
  style?: 'DEFINITION' | 'CONCEPT' | 'COMPARISON' | 'EXAMPLE' | 'FORMULA' | 'MIXED';
  context_text?: string;
}

// ==========================================
// 5. Lab Assistant + Viva Preparation Models
// ==========================================
export interface VivaQuestionItem {
  id: string;
  question: string;
  expected_concept: string;
  student_answer?: string;
  ai_evaluation?: {
    score: number; // 0 - 10
    correctness: string;
    missing_concepts: string[];
    clarity: string;
    improvement: string;
  };
}

export interface LabExperiment {
  id: string;
  lab_id: string;
  title: string;
  experiment_number: number;
  objective: string;
  theory: string;
  requirements: string[];
  procedure: string[];
  implementation_code?: string;
  expected_output: string;
  observations_table?: { headers: string[]; rows: string[][] };
  conclusion: string;
  viva_questions: VivaQuestionItem[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface LabEntity {
  id: string;
  student_id: string;
  title: string;
  course_code: string;
  branch: string;
  semester: number;
  experiments: LabExperiment[];
  created_at: string;
}

// ==========================================
// 6. SQL / Database Lab Models
// ==========================================
export type SQLDataType =
  | 'INTEGER'
  | 'BIGINT'
  | 'DECIMAL'
  | 'FLOAT'
  | 'VARCHAR'
  | 'CHAR'
  | 'TEXT'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIME'
  | 'TIMESTAMP'
  | 'JSON';

export interface SQLForeignKeyConstraint {
  id?: string;
  constraint_name?: string;
  source_column: string;
  referenced_table: string;
  referenced_column: string;
  on_update?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'NO ACTION';
  on_delete?: 'CASCADE' | 'RESTRICT' | 'SET NULL' | 'NO ACTION';
}

export interface SQLIndexDefinition {
  name: string;
  columns: string[];
  is_unique?: boolean;
}

export interface SQLTableColumn {
  name: string;
  type: string;
  length_precision?: string;
  is_nullable?: boolean;
  is_primary_key?: boolean;
  is_unique?: boolean;
  is_auto_increment?: boolean;
  default_value?: string;
  check_constraint?: string;
  is_foreign_key?: boolean;
  references?: string;
  foreign_key?: SQLForeignKeyConstraint;
}

export interface SQLTableDefinition {
  name: string;
  schema_name?: string;
  description?: string;
  columns: SQLTableColumn[];
  foreign_keys?: SQLForeignKeyConstraint[];
  indexes?: SQLIndexDefinition[];
  sample_rows: Record<string, any>[];
  created_at?: string;
  updated_at?: string;
}

export interface SQLWorkspaceSummary {
  id: string;
  name: string;
  description?: string;
  tables_count: number;
  created_at: string;
}

export interface SQLQueryHistoryItem {
  id: string;
  student_id: string;
  schema_name: string;
  query: string;
  success: boolean;
  duration_ms: number;
  row_count?: number;
  error?: string;
  executed_at: string;
}

export interface SQLChallenge {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string; // 'JOIN' | 'AGGREGATION' | 'WINDOW' | 'SUBQUERY' etc.
  description: string;
  schema_name: string;
  expected_query: string;
  starter_query: string;
  hints: string[];
}

export interface SQLExecutionResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  affected_rows?: number;
  execution_time_ms: number;
  error?: string;
  explanation?: string;
  optimization_tips?: string[];
  query_plan?: {
    operation: string;
    cost_estimate: string;
    details: string;
  }[];
  /** True when more rows matched than the sandbox returns. */
  truncated?: boolean;
  engine?: string;
}

export interface TableDataFilter {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
  search?: string;
}

export interface TableDataResponse {
  table_name: string;
  columns: SQLTableColumn[];
  rows: Record<string, any>[];
  total_rows: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ==========================================
// 7. AI/ML Experiment Lab Models
// ==========================================
export interface MLWorkspaceFile {
  id: string;
  workspace_id: string;
  name: string;
  extension: string;
  size_bytes: number;
  content: string;
  updated_at: string;
}

export interface MLWorkspace {
  id: string;
  student_id: string;
  name: string;
  description: string;
  task_type: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING';
  files: MLWorkspaceFile[];
  created_at: string;
  updated_at: string;
}

export interface MLDatasetColumnInfo {
  name: string;
  data_type: 'NUMERICAL' | 'CATEGORICAL';
  missing_count: number;
  unique_count: number;
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
  sample_values: any[];
}

export interface MLDataset {
  id: string;
  name: string;
  description?: string;
  workspace_id?: string;
  source: 'BUILT_IN' | 'UPLOADED';
  file_size_bytes?: number;
  features: string[];
  target_column: string;
  total_samples: number;
  columns_metadata?: MLDatasetColumnInfo[];
  preview: Record<string, any>[];
  raw_data?: Record<string, any>[];
  task_type: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING';
  created_at?: string;
}

export interface MLTrainingConfig {
  workspace_id?: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  target_column?: string;
  feature_columns: string[];
  task_type: 'CLASSIFICATION' | 'REGRESSION' | 'CLUSTERING';
  model_type: string;
  custom_code_file_id?: string;
  train_split: number;
  random_seed?: number;
  preprocessing?: {
    missing_value_strategy: 'DROP' | 'MEAN' | 'MEDIAN' | 'MODE';
    categorical_encoding: 'ONE_HOT' | 'ORDINAL' | 'NONE';
    scaling: 'STANDARD' | 'MINMAX' | 'NONE';
  };
  hyperparameters: Record<string, any>;
}

export interface MLExperimentMetric {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  confusion_matrix?: number[][];
  class_labels?: string[];
  classification_report?: Record<string, { precision: number; recall: number; f1: number; support: number }>;
  mse?: number;
  rmse?: number;
  mae?: number;
  r2_score?: number;
  residuals?: Array<{ actual: number; predicted: number; residual: number }>;
  inertia?: number;
  silhouette_score?: number;
  cluster_centers?: number[][];
  cluster_distribution?: Record<string, number>;
}

export interface MLExperimentLog {
  timestamp: string;
  stage: string;
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR';
}

export interface MLExperimentEntity {
  id: string;
  student_id: string;
  workspace_id?: string;
  name: string;
  dataset_name: string;
  target_column?: string;
  feature_columns?: string[];
  model_type: string;
  /** The model family that was actually fitted (e.g. "Random Forest (bagged CART trees)"). */
  algorithm?: string;
  preprocessing_applied?: { missing_value_strategy: string; scaling: string; categorical_encoding: string; encoded_columns: number };
  hyperparameters: Record<string, any>;
  train_split: number;
  status: 'DRAFT' | 'QUEUED' | 'PREPARING_DATA' | 'TRAINING' | 'EVALUATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  logs?: MLExperimentLog[];
  metrics: MLExperimentMetric;
  insights: {
    underfitting_or_overfitting: string;
    feature_importance?: { feature: string; importance: number }[];
    loss_curve?: { iteration: number; loss: number; val_loss?: number }[];
    recommendations: string[];
  };
  feature_schema?: Array<{ name: string; type: 'NUMERICAL' | 'CATEGORICAL'; default_val: any; options?: string[]; min?: number; max?: number }>;
  duration_ms?: number;
  created_at: string;
}

export interface MLPredictionRequest {
  inputs: Record<string, any>;
}

export interface MLPredictionResult {
  predicted_value: any;
  predicted_label?: string;
  class_probabilities?: Record<string, number>;
  confidence?: number;
  explanation: string;
}

// ==========================================
// 8. System Design Lab Models
// ==========================================
export interface SystemDesignComponent {
  id: string;
  name: string;
  type: 'CLIENT' | 'LOAD_BALANCER' | 'API_GATEWAY' | 'SERVICE' | 'DATABASE' | 'CACHE' | 'MESSAGE_QUEUE' | 'STORAGE' | 'CDN';
  description: string;
  tech_choice: string;
}

export interface SystemDesignConnection {
  from: string;
  to: string;
  protocol: 'HTTP/REST' | 'gRPC' | 'WebSocket' | 'Kafka' | 'TCP';
  description: string;
}

export interface SystemDesignProblem {
  id: string;
  title: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  functional_requirements: string[];
  non_functional_requirements: string[];
  scale_estimation: {
    daily_active_users: string;
    read_write_ratio: string;
    storage_per_year: string;
    bandwidth: string;
  };
  sample_architecture: {
    components: SystemDesignComponent[];
    connections: SystemDesignConnection[];
    tradeoffs: string[];
    bottlenecks: string[];
  };
}

export interface SystemDesignEntity {
  id: string;
  student_id: string;
  problem_id: string;
  title: string;
  components: SystemDesignComponent[];
  connections: SystemDesignConnection[];
  notes: string;
  ai_analysis?: {
    score: number; // 0 - 100
    strengths: string[];
    bottlenecks: string[];
    tradeoffs: string[];
    suggested_improvements: string[];
  };
  created_at: string;
  updated_at: string;
}

// ==========================================
// 9. Personal Knowledge Base Models
// ==========================================
export type KnowledgeItemType = 'NOTE' | 'DOCUMENT' | 'DOUBT' | 'FLASHCARD' | 'CODE_SNIPPET' | 'PROJECT_DOC' | 'RESEARCH_PAPER';

export interface KnowledgeItem {
  id: string;
  student_id: string;
  title: string;
  content: string;
  type: KnowledgeItemType;
  topic: string;
  collection_id?: string;
  collection_name?: string;
  tags: string[];
  source_reference?: {
    entity_type: string;
    entity_id: string;
    url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface KnowledgeCollection {
  id: string;
  student_id: string;
  name: string;
  description: string;
  item_count: number;
  icon?: string;
  created_at: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'COURSE' | 'TOPIC' | 'NOTE' | 'DOCUMENT' | 'FLASHCARD' | 'QUIZ' | 'DOUBT' | 'PROJECT';
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  relationship: 'CONTAINS' | 'EXPLORING' | 'REINFORCES' | 'TESTS' | 'SOLVED_BY' | 'APPLIES';
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// ==========================================
// 10. Internship / Application Tracker Models
// ==========================================
export type ApplicationStatus =
  | 'SAVED'
  | 'INTERESTED'
  | 'PREPARING'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'TECHNICAL_ROUND'
  | 'HR_ROUND'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED';

/** The kinds of opportunity the tracker can hold (Opportunity Intelligence, Module 17). */
export const OPPORTUNITY_TYPES = [
  'INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'FELLOWSHIP', 'RESEARCH_INTERNSHIP', 'GRADUATE_PROGRAM',
  'OPEN_SOURCE_PROGRAM', 'STARTUP_PROGRAM', 'ENTREPRENEURSHIP', 'INTERNATIONAL',
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export interface ApplicationTimelineEvent {
  id: string;
  title: string;
  date: string;
  status: ApplicationStatus;
  notes?: string;
}

export interface JobDescriptionSkillAnalysis {
  required_skills: {
    name: string;
    evidence_status: 'EVIDENCE_AVAILABLE' | 'DEVELOPING' | 'NOT_YET_ASSESSED';
    evidence_source?: string;
  }[];
  readiness_percent: number;
  recommended_preparation: string[];
}

export interface InternshipApplication {
  id: string;
  student_id: string;
  company_name: string;
  role: string;
  location: string;
  application_date: string;
  deadline?: string;
  application_url?: string;
  status: ApplicationStatus;
  salary_range?: string;
  interview_date?: string;
  assessment_date?: string;
  contact_person?: string;
  notes: string;
  timeline: ApplicationTimelineEvent[];
  /** What kind of opportunity this is. Older records have none and are internships or jobs. */
  opportunity_type?: OpportunityType;
  /** The job description the student pasted, kept so the skill comparison can be re-run. */
  job_description?: string;
  jd_analysis?: JobDescriptionSkillAnalysis;
  resume_version_name?: string;
  created_at: string;
  updated_at: string;
}
