// src/features/mock-interviews/types/mockInterviewTypes.ts
// Frontend TypeScript definitions for AI Mock Interviews

export type MockInterviewCategory =
  | 'HR'
  | 'BEHAVIORAL'
  | 'TECHNICAL'
  | 'CODING'
  | 'DSA'
  | 'SQL'
  | 'SYSTEM_DESIGN'
  | 'AI_ML'
  | 'RESUME'
  | 'INTERNSHIP'
  | 'GRADUATE_JOB'
  | 'CUSTOM';

export type TargetRole =
  | 'SDE'
  | 'JAVA_DEV'
  | 'PYTHON_DEV'
  | 'FRONTEND_DEV'
  | 'BACKEND_DEV'
  | 'FULLSTACK_DEV'
  | 'DATA_ANALYST'
  | 'DATA_SCIENTIST'
  | 'ML_ENGINEER'
  | 'AI_ENGINEER'
  | 'QA_ENGINEER'
  | 'CLOUD_ENGINEER'
  | 'CUSTOM';

export type InterviewDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ExperienceLevel = 'STUDENT' | 'FRESHER' | 'INTERNSHIP_CANDIDATE' | 'EXPERIENCED';

export type InterviewStyle = 'FRIENDLY' | 'RIGOROUS' | 'ACADEMIC' | 'FAST_PACED';

export type FeedbackMode = 'COMPREHENSIVE' | 'INSTANT' | 'HINTS_ENABLED';

export type SessionStatus = 'READY' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

export interface RubricDimension {
  dimension: string;
  weight: number;
  description: string;
}

export interface RubricScoreItem {
  dimension: string;
  score: number;
  weight: number;
  weightedScore: number;
  feedback: string;
}

export interface CategoryMetadata {
  id: MockInterviewCategory;
  title: string;
  shortDesc: string;
  badge: string;
  iconName: string;
  defaultQuestions: number;
  defaultDuration: number;
  rubricTemplate: RubricDimension[];
}

export interface TargetRoleMetadata {
  id: string;
  title: string;
  department: string;
  keySkills: string[];
  suggestedCategories: MockInterviewCategory[];
}

export interface MockInterviewQuestionCatalogItem {
  id: string;
  category: MockInterviewCategory;
  topic: string;
  difficulty: InterviewDifficulty;
  target_roles: string[];
  question: string;
  context?: string;
  question_type: 'CONCEPTUAL' | 'CODING' | 'SQL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'STAR' | 'RESUME';
  expected_concepts: string[];
  hints?: string[];
  starter_code?: string;
  starter_language?: string;
  sample_inputs?: string;
  sql_schema_table?: string;
  reference_answer?: string;
  follow_up_patterns?: string[];
  rubric: RubricDimension[];
}

export interface MockInterviewSessionEntity {
  id: string;
  student_id: string;
  category: MockInterviewCategory;
  interview_type?: string;
  target_role: string;
  difficulty: InterviewDifficulty;
  experience_level: ExperienceLevel;
  duration_minutes: number;
  max_questions: number;
  current_question_index: number;
  status: SessionStatus;
  programming_language?: string;
  target_company?: string;
  job_description?: string;
  resume_id?: string;
  interview_style: InterviewStyle;
  feedback_mode: FeedbackMode;
  scratchpad_notes?: string;
  is_paused?: boolean;
  elapsed_seconds: number;
  code_snapshots?: Record<string, string>;
  sql_snapshots?: Record<string, string>;
  system_design_artifacts?: Record<string, any>;
  overall_score?: number;
  rubric_version?: string;
  feedback_summary?: MockInterviewReport;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
}

export interface MockInterviewSessionQuestion {
  id: string;
  session_id: string;
  question_number: number;
  catalog_question_id?: string;
  question: string;
  context?: string;
  question_type: 'CONCEPTUAL' | 'CODING' | 'SQL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'STAR' | 'RESUME';
  topic: string;
  difficulty: InterviewDifficulty;
  expected_concepts: string[];
  hints?: string[];
  starter_code?: string;
  starter_language?: string;
  sample_inputs?: string;
  sql_schema_table?: string;
  reference_answer?: string;
  follow_up_to?: string;
  rubric: RubricDimension[];
  created_at: string;
}

export interface MockInterviewAnswerEntity {
  id: string;
  session_id: string;
  question_id: string;
  student_id: string;
  answer_text: string;
  code_used?: string;
  sql_query_used?: string;
  architecture_used?: any;
  duration_seconds: number;
  input_mode?: 'TEXT' | 'VOICE';
  voice_transcript_verified?: boolean;
  evaluation: {
    score: number;
    rubric_scores: RubricScoreItem[];
    covered_concepts: string[];
    missing_concepts: string[];
    strengths: string[];
    improvements: string[];
    clarity_feedback: string;
    model_answer_snippet?: string;
    follow_up_needed: boolean;
    suggested_follow_up?: string;
  };
  created_at: string;
}

export interface MockInterviewReport {
  overall_score: number;
  scoring_definition: string;
  summary: string;
  category: MockInterviewCategory;
  target_role: string;
  duration_minutes: number;
  questions_answered: number;
  questions_skipped: number;
  rubric_breakdown: RubricScoreItem[];
  topics_covered: string[];
  strongest_areas: string[];
  improvement_areas: string[];
  communication_observations: string[];
  technical_gaps: string[];
  per_question_feedback: Array<{
    question_id: string;
    question_number: number;
    question_text: string;
    student_answer: string;
    score: number;
    strengths: string[];
    missing_concepts: string[];
    improvement_advice: string;
    model_answer: string;
    code_execution_summary?: string;
    sql_execution_summary?: string;
  }>;
  recommended_learning_modules: Array<{
    id: string;
    module_name: string;
    title: string;
    description: string;
    route_path: string;
    action_label: string;
    recommended_topic: string;
  }>;
}

export interface SavedMockQuestionEntity {
  id: string;
  student_id: string;
  question_id: string;
  category: MockInterviewCategory;
  topic: string;
  question: string;
  expected_concepts: string[];
  reference_answer?: string;
  student_notes?: string;
  created_at: string;
}

export interface ScheduledMockInterviewEntity {
  id: string;
  student_id: string;
  category: MockInterviewCategory;
  target_role: string;
  scheduled_date: string;
  scheduled_time: string;
  reminder_minutes_before: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface MockInterviewAnalytics {
  total_completed: number;
  total_practice_minutes: number;
  average_score: number;
  scoring_definition: string;
  is_onboarding: boolean;
  score_trajectory: Array<{ date: string; score: number; category: string }>;
  category_breakdown: Array<{ category: string; count: number; average_score: number }>;
  strongest_topics: string[];
  topics_requiring_improvement: string[];
  recent_sessions: Array<{
    id: string;
    category: MockInterviewCategory;
    target_role: string;
    score: number;
    created_at: string;
    status: SessionStatus;
  }>;
  upcoming_scheduled: ScheduledMockInterviewEntity[];
  recommended_next_interview: {
    category: MockInterviewCategory;
    target_role: string;
    difficulty: InterviewDifficulty;
    reason: string;
  };
}

export interface CreateMockInterviewSessionRequest {
  category: MockInterviewCategory;
  target_role: string;
  difficulty?: InterviewDifficulty;
  experience_level?: ExperienceLevel;
  duration_minutes?: number;
  max_questions?: number;
  programming_language?: string;
  target_company?: string;
  job_description?: string;
  resume_id?: string;
  interview_style?: InterviewStyle;
  feedback_mode?: FeedbackMode;
}
