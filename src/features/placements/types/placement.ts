export type PlacementCategory =
  | 'APTITUDE'
  | 'LOGICAL_REASONING'
  | 'VERBAL'
  | 'PROGRAMMING'
  | 'DSA'
  | 'DBMS'
  | 'SQL'
  | 'OPERATING_SYSTEMS'
  | 'COMPUTER_NETWORKS'
  | 'OOP'
  | 'SOFTWARE_ENGINEERING'
  | 'AI_ML'
  | 'DATA_SCIENCE'
  | 'WEB_DEVELOPMENT'
  | 'CLOUD'
  | 'CYBER_SECURITY'
  | 'PROJECT_INTERVIEW'
  | 'HR'
  | 'BEHAVIORAL'
  | 'COMMUNICATION';

export type PlacementDifficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';

export interface TopicConcept {
  id: string;
  title: string;
  summary: string;
  formula?: string;
  example?: string;
  key_takeaway?: string;
}

export interface CommonInterviewQuestion {
  id: string;
  question: string;
  answer_outline: string;
  frequency?: 'COMMON' | 'FREQUENT' | 'VERY_HIGH';
}

export interface TopicRecommendedResource {
  title: string;
  url?: string;
  type: 'COURSE' | 'NOTE' | 'DOC' | 'EXTERNAL' | 'QUIZ';
  reference_id?: string;
}

export interface PlacementTopic {
  id: string;
  name: string;
  slug: string;
  category: PlacementCategory;
  description: string;
  difficulty: PlacementDifficulty;
  order_index: number;
  prerequisites: string[];
  is_active: boolean;
  concepts: TopicConcept[];
  common_questions: CommonInterviewQuestion[];
  recommended_resources: TopicRecommendedResource[];
  created_at: string;
  updated_at: string;
}

export interface PlacementQuestion {
  id: string;
  topic_id: string;
  category: PlacementCategory;
  question_type: 'MULTIPLE_CHOICE' | 'NUMERICAL' | 'TEXT' | 'CODE' | 'SQL';
  question_text: string;
  options?: string[];
  correct_answer: string | number;
  explanation: string;
  difficulty: PlacementDifficulty;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  id: string;
  category: PlacementCategory;
  topic_id?: string;
  question: string;
  answer: string;
  difficulty: PlacementDifficulty;
  question_type: 'CONCEPTUAL' | 'SCENARIO' | 'CODING' | 'SQL' | 'PROJECT' | 'HR' | 'BEHAVIORAL';
  expected_concepts: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlacementCompany {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo_url: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyHiringRound {
  round_number: number;
  round_name?: string;
  name?: string;
  description: string;
  duration_minutes?: number;
}

export interface CompanyPreparationProfile {
  id: string;
  company_id: string;
  role_id?: string;
  overview: string;
  reported_rounds: CompanyHiringRound[];
  topics: string[];
  coding_topics: string[];
  technical_topics: string[];
  hr_topics: string[];
  source_metadata: {
    source_name: string;
    source_url?: string;
    last_verified_at: string;
    disclaimer: string;
  };
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface PlacementRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  skill_requirements: string[];
  technical_topics: string[];
  recommended_projects: string[];
  created_at: string;
  updated_at: string;
}

export interface PlacementPlanTask {
  id: string;
  plan_id: string;
  student_id: string;
  title: string;
  description: string;
  category: PlacementCategory;
  scheduled_week: number;
  scheduled_date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  source_type: 'TOPIC' | 'QUIZ' | 'CODING' | 'DSA' | 'MOCK_INTERVIEW' | 'PROJECT' | 'COURSE' | string;
  source_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface PlacementPlan {
  id: string;
  student_id: string;
  title: string;
  target_role_id: string;
  target_company_id?: string;
  duration_weeks: number;
  start_date: string;
  target_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  role?: PlacementRole;
  company?: PlacementCompany;
  tasks?: PlacementPlanTask[];
  created_at: string;
  updated_at: string;
}

export type MockInterviewType = 'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'PROJECT' | 'MIXED';
export type MockInterviewMode = 'PRACTICE' | 'SIMULATION';
export type MockInterviewStatus = 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface AnswerEvaluation {
  covered_concepts: string[];
  missing_concepts: string[];
  strengths: string[];
  improvements: string[];
  score: number; // 0 to 100 based on coverage and clarity
  clarity_feedback?: string;
  follow_up_needed: boolean;
  suggested_follow_up?: string;
}

export interface MockInterviewAnswer {
  id: string;
  session_id: string;
  question_id: string;
  student_id: string;
  answer_text: string;
  duration_seconds: number;
  evaluation: AnswerEvaluation;
  created_at: string;
}

export interface MockInterviewFeedback {
  overall_score?: number;
  summary: string;
  topics_covered: string[];
  concepts_explained_well: string[];
  concepts_to_review: string[];
  communication_observations: string[];
  technical_gaps: string[];
  concept_coverage_stat: {
    covered: number;
    total: number;
    percentage: number;
  };
  recommended_practice: {
    quizzes: { id: string; title: string; topic: string }[];
    dsa_problems: { id: string; title: string; difficulty: string }[];
    coding_challenges: { id: string; title: string }[];
    courses: { id: string; title: string; lesson_id?: string; lesson_title?: string }[];
  };
}

export interface MockInterviewQuestion {
  id: string;
  session_id: string;
  question_number: number;
  question: string;
  question_type: 'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'PROJECT' | 'CONCEPTUAL';
  topic: string;
  difficulty: PlacementDifficulty;
  expected_concepts: string[];
  follow_up_to?: string;
  created_at: string;
}

export interface MockInterviewSession {
  id: string;
  student_id: string;
  interview_type: MockInterviewType;
  role_id: string;
  company_id?: string;
  project_id?: string;
  difficulty: PlacementDifficulty;
  mode: MockInterviewMode;
  duration_minutes: number;
  status: MockInterviewStatus;
  current_question_index: number;
  max_questions: number;
  overall_score?: number;
  role?: PlacementRole;
  company?: PlacementCompany;
  questions?: MockInterviewQuestion[];
  answers?: MockInterviewAnswer[];
  feedback?: MockInterviewFeedback;
  feedback_summary?: MockInterviewFeedback;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface PlacementReadinessDimension {
  score: number; // 0 - 100
  metric_value: number;
  metric_label: string;
  label: string;
}

export interface WeakAreaItem {
  topic: string;
  category: PlacementCategory;
  reason: string;
  severity: 'HIGH' | 'MEDIUM';
  recommended_action: string;
}

export type WeakPlacementTopic = WeakAreaItem;

export interface PlacementReadiness {
  overall_percentage: number;
  dimensions: {
    aptitude: PlacementReadinessDimension;
    technical: PlacementReadinessDimension;
    coding: PlacementReadinessDimension;
    dsa: PlacementReadinessDimension;
    communication: PlacementReadinessDimension;
    interview_practice: PlacementReadinessDimension;
    projects: PlacementReadinessDimension;
  };
  weak_areas: WeakAreaItem[];
  recent_activity: {
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }[];
}

export interface CreateMockInterviewRequest {
  interview_type: MockInterviewType;
  role_id: string;
  company_id?: string;
  project_id?: string;
  difficulty?: PlacementDifficulty;
  mode?: MockInterviewMode;
  duration_minutes?: number;
  max_questions?: number;
  focus_areas?: string[];
}

export interface SubmitInterviewAnswerRequest {
  answer_text: string;
  duration_seconds?: number;
}

export interface CreatePlacementPlanRequest {
  target_role_id: string;
  target_company_id?: string;
  duration_weeks?: number;
  hours_per_day?: number;
  daily_hours?: number;
  custom_focus_areas?: string[];
}

export interface StarFormatResponse {
  situation: string;
  task: string;
  action: string;
  result: string;
  improved_answer: string;
  critique: string;
}

export interface PlacementPracticeAttempt {
  id: string;
  student_id: string;
  question_id: string;
  topic_id?: string;
  category: string;
  submitted_answer: string | number;
  is_correct: boolean;
  explanation: string;
  correct_answer: string | number;
  created_at: string;
}

export interface PlacementAssessmentSubmission {
  assessment_id?: string;
  title: string;
  category: string;
  difficulty: string;
  time_spent_seconds: number;
  answers: Record<string, string | number>;
}

export interface PlacementAssessmentResult {
  id: string;
  student_id: string;
  title: string;
  category: string;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_seconds: number;
  detailed_results: Array<{
    question_id: string;
    question_text: string;
    submitted_answer?: string | number;
    correct_answer: string | number;
    is_correct: boolean;
    explanation: string;
    topic_id?: string;
  }>;
  weak_topics: string[];
  submitted_at: string;
}

export interface GroupDiscussionTopic {
  id: string;
  title: string;
  category: 'TECH' | 'SOCIO_ECONOMIC' | 'BUSINESS' | 'ETHICS' | 'POLICY';
  description: string;
  background_context: string;
  pros_arguments: string[];
  cons_arguments: string[];
  suggested_structure: Array<{
    phase: string;
    description: string;
    duration_seconds: number;
  }>;
  evaluation_criteria: string[];
  created_at: string;
}

export interface CategoryProgressItem {
  category_id: string;
  name: string;
  icon: string;
  total_available: number;
  completed_count: number;
  accuracy_percentage: number | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'MASTERED';
  route: string;
  description: string;
}

export interface PlacementDashboardStats {
  tasks_completed: number;
  practice_questions_attempted: number;
  accuracy_percentage: number | null;
  coding_problems_solved: number;
  mock_interviews_completed: number;
  topics_needing_revision: number;
  upcoming_tasks_count: number;
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    details?: string;
  }>;
  categories_progress: CategoryProgressItem[];
  is_onboarding: boolean;
}

