// src/types/learningModules.ts
// Frontend TypeScript definitions for the 10 New AI Learning Modules

export type StudyPlanType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTER' | 'EXAM' | 'PLACEMENT' | 'PROJECT' | 'RESEARCH';
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
  date: string;
  course_id?: string;
  lesson_id?: string;
  resource_url?: string;
  notes?: string;
  ai_recommendation?: string;
  completed_at?: string;
  created_at: string;
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
  readiness_score: number;
  topics: ExamTopic[];
  mock_tests_count: number;
  last_mock_score?: number;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

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

export type FlashcardType = 'DEFINITION' | 'CONCEPT' | 'FORMULA' | 'CODE' | 'SYNTAX' | 'COMPARISON' | 'QA' | 'SCENARIO';
export type FlashcardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

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
  confidence: number;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed?: string;
  next_review: string;
  created_at: string;
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
}

export interface VivaQuestionItem {
  id: string;
  question: string;
  expected_concept: string;
  student_answer?: string;
  ai_evaluation?: {
    score: number;
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

export interface SQLTableColumn {
  name: string;
  type: string;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  references?: string;
}

export interface SQLTableDefinition {
  name: string;
  columns: SQLTableColumn[];
  sample_rows: Record<string, any>[];
}

export interface SQLChallenge {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
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
  execution_time_ms: number;
  error?: string;
  explanation?: string;
  optimization_tips?: string[];
}

export interface MLExperimentMetric {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  confusion_matrix?: number[][];
  mse?: number;
  rmse?: number;
  mae?: number;
  r2_score?: number;
  silhouette_score?: number;
}

export interface MLExperimentEntity {
  id: string;
  student_id: string;
  name: string;
  dataset_name: string;
  model_type: string;
  hyperparameters: Record<string, any>;
  train_split: number;
  status: 'IDLE' | 'TRAINING' | 'COMPLETED' | 'FAILED';
  metrics: MLExperimentMetric;
  insights: {
    underfitting_or_overfitting: string;
    feature_importance?: { feature: string; importance: number }[];
    recommendations: string[];
  };
  created_at: string;
}

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
    score: number;
    strengths: string[];
    bottlenecks: string[];
    tradeoffs: string[];
    suggested_improvements: string[];
  };
  created_at: string;
  updated_at: string;
}

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

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'TECHNICAL_ROUND'
  | 'HR_ROUND'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

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
  jd_analysis?: JobDescriptionSkillAnalysis;
  resume_version_name?: string;
  created_at: string;
  updated_at: string;
}
