// ============================================================================
// PHASE 14 — COMMUNITY, STUDENT PROFILE, PROGRESS & STUDENT UTILITIES
// TypeScript Domain Models and Types
// ============================================================================

import { UserRole } from './types';

// ----------------------------------------------------------------------------
// 1. STUDENT PROFILE & SETTINGS
// ----------------------------------------------------------------------------

export interface StudentProfile {
  id: string;
  student_id: string;
  username: string;
  name: string;
  email: string;
  avatar_url?: string;
  branch: string;
  semester: number;
  graduation_year: number;
  college_name?: string;
  target_role?: string;
  display_name?: string;
  github_url?: string;
  linkedin_url?: string;
  bio: string;
  skills: string[];
  interests: string[];
  learning_goals: string[];
  github_username?: string;
  github_connected: boolean;
  portfolio_links: {
    title: string;
    url: string;
  }[];
  is_public: boolean;
  completion_percentage: number;
  completion_breakdown?: {
    basic_profile?: boolean;
    academic?: boolean;
    skills?: boolean;
    projects?: boolean;
    resume?: boolean;
    github?: boolean;
    career?: boolean;
  };
  stats?: any;
  links?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export type StudentProfileData = StudentProfile;
export type CertificateVerification = CertificateVerificationResult;

export interface StudentPrivacySetting {
  id: string;
  student_id: string;
  profile_visibility: 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';
  project_visibility: 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';
  github_visibility: 'PRIVATE' | 'PUBLIC';
  research_visibility: 'PRIVATE' | 'COMMUNITY' | 'PUBLIC';
  resume_visibility: 'PRIVATE';
  show_activity_in_community: boolean;
  updated_at: string;
}

export interface StudentPreference {
  id: string;
  student_id: string;
  explanation_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  response_style: 'CONCISE' | 'DETAILED';
  preferred_language: 'English' | 'Telugu' | 'Hindi';
  code_explanation_preference: 'STEP_BY_STEP' | 'CONCEPTUAL' | 'EXHAUSTIVE';
  math_explanation_preference: 'INTUITIVE' | 'FORMAL_RIGOR';
  theme: 'light' | 'dark' | 'system';
  updated_at: string;
}

export interface ProfileCompletionBreakdown {
  total_percentage: number;
  categories: {
    name: string;
    completed: boolean;
    weight: number;
    type: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';
    description: string;
  }[];
}

// ----------------------------------------------------------------------------
// 2. ACTIVITY EVENT SYSTEM & LEARNING STREAK
// ----------------------------------------------------------------------------

export type ActivityEventType =
  | 'COURSE_STARTED'
  | 'COURSE_LESSON_COMPLETED'
  | 'QUIZ_ATTEMPTED'
  | 'QUIZ_COMPLETED'
  | 'CODING_PROBLEM_SOLVED'
  | 'DSA_PROBLEM_SOLVED'
  | 'NOTE_CREATED'
  | 'DOCUMENT_VIEWED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'RESEARCH_CREATED'
  | 'PAPER_ANALYZED'
  | 'GITHUB_CONNECTED'
  | 'GITHUB_REPOSITORY_ANALYZED'
  | 'MOCK_INTERVIEW_COMPLETED'
  | 'RESUME_UPDATED'
  | 'SKILL_ASSESSMENT_COMPLETED'
  | 'CERTIFICATE_EARNED'
  | 'GIT_LESSON_COMPLETED'
  | 'GIT_EXERCISE_COMPLETED'
  | 'MISTAKE_REVIEWED';

export interface StudentActivity {
  id: string;
  student_id: string;
  activity_type: ActivityEventType;
  entity_type: string;
  entity_id: string;
  title: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface LearningStreakData {
  current_streak: number;
  longest_streak: number;
  current_streak_days?: number;
  longest_streak_days?: number;
  active_days_this_week: number;
  active_days_this_month: number;
  last_activity_date: string;
  qualifying_history: {
    date: string;
    count: number;
  }[];
}

// ----------------------------------------------------------------------------
// 3. LEARNING GOALS
// ----------------------------------------------------------------------------

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
export type GoalCategory = 'COURSES' | 'DSA' | 'CODING' | 'PROJECTS' | 'RESEARCH' | 'CAREER' | 'GENERAL';

export interface LearningGoalMilestone {
  id?: string;
  title: string;
  is_completed?: boolean;
  completed?: boolean;
  target_value?: number;
  completed_at?: string;
}

export interface LearningGoal {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: GoalCategory;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: GoalStatus;
  milestones: LearningGoalMilestone[];
  related_resource_ids?: string[];
  progress_percentage?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  notes?: string;
  measurement_method?: string;
  completion_criteria?: string;
  reminder_preference?: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 4. UNIFIED BOOKMARKS
// ----------------------------------------------------------------------------

export type BookmarkCategory =
  | 'ALL'
  | 'COURSES'
  | 'NOTES'
  | 'DOCUMENTS'
  | 'RESEARCH'
  | 'CODING'
  | 'DSA'
  | 'PROJECTS'
  | 'COMMUNITY';

export interface UnifiedBookmark {
  id: string;
  student_id: string;
  category: BookmarkCategory;
  entity_type: string;
  entity_id: string;
  resource_id?: string;
  title: string;
  url: string;
  personal_label?: string;
  personal_note?: string;
  tags: string[];
  created_at: string;
  resource_type?: string;
  label?: string;
  notes?: string;
}

// ----------------------------------------------------------------------------
// 5. ACHIEVEMENTS & CERTIFICATES
// ----------------------------------------------------------------------------

export type AchievementCategory = 'LEARNING' | 'CODING' | 'RESEARCH' | 'PROJECTS' | 'COMMUNITY';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    event_type: ActivityEventType;
    threshold: number;
  };
  category: AchievementCategory;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  achievement?: Achievement;
  earned_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  student_name: string;
  course_or_program_id: string;
  program_title: string;
  program_name?: string;
  issue_date: string;
  completion_date?: string;
  issuer: string;
  digital_signature: string;
  digital_signature_hash?: string;
  verification_url: string;
  criteria_summary: string;
  status: 'VALID' | 'REVOKED';
}

export interface CertificateVerificationResult {
  is_valid: boolean;
  certificate_id: string;
  student_name: string;
  program_title: string;
  course_name?: string;
  issue_date: string;
  issuer: string;
  status: 'VALID' | 'REVOKED' | 'NOT_FOUND';
  verification_hash?: string;
}

// ----------------------------------------------------------------------------
// 6. COMMUNITY (QUESTIONS, ANSWERS, DISCUSSIONS, PROJECTS, RESOURCES, TOPICS)
// ----------------------------------------------------------------------------

export interface CommunityTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  followers_count: number;
  posts_count: number;
}

export interface TopicFollow {
  id: string;
  student_id: string;
  topic_id: string;
  created_at: string;
}

export interface CommunityQuestion {
  id: string;
  student_id: string;
  author_id?: string;
  author_name: string;
  author_branch: string;
  title: string;
  description: string;
  topic_id: string;
  topic_name: string;
  tags: string[];
  views: number;
  upvotes: number;
  answers_count: number;
  answer_count?: number;
  accepted_answer_id?: string;
  is_accepted_answer?: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityAnswer {
  id: string;
  question_id: string;
  student_id: string;
  author_id?: string;
  author_name: string;
  author_branch: string;
  content: string;
  code_snippet?: string;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityDiscussion {
  id: string;
  student_id: string;
  author_id?: string;
  author_name: string;
  author_branch: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  replies_count: number;
  reply_count?: number;
  replies?: CommunityPostReply[];
  views: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityPostReply {
  id: string;
  discussion_id: string;
  student_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface CommunityResource {
  id: string;
  student_id: string;
  author_name: string;
  title: string;
  description: string;
  resource_type: 'ARTICLE' | 'DOCUMENTATION' | 'GITHUB_REPO' | 'RESEARCH_PAPER' | 'LEARNING_TOOL';
  category?: string;
  url: string;
  topic_id?: string;
  tags: string[];
  upvotes: number;
  created_at: string;
}

export interface CommunityProjectShowcase {
  id: string;
  project_id: string;
  student_id: string;
  author_name: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  research_url?: string;
  screenshots: string[];
  upvotes: number;
  created_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id: string;
  target_type: 'QUESTION' | 'ANSWER' | 'DISCUSSION' | 'RESOURCE' | 'PROJECT_SHOWCASE';
  target_id: string;
  reason: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISLEADING' | 'COPYRIGHT' | 'DANGEROUS' | 'OTHER';
  description: string;
  status: 'PENDING' | 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  resolved_by?: string;
  resolved_at?: string;
  moderation_notes?: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 7. NOTIFICATIONS & PREFERENCES
// ----------------------------------------------------------------------------

export type NotificationType =
  | 'QUESTION_ANSWERED'
  | 'ANSWER_ACCEPTED'
  | 'DISCUSSION_REPLY'
  | 'MENTION'
  | 'TOPIC_ACTIVITY'
  | 'GOAL_MILESTONE'
  | 'CERTIFICATE_EARNED'
  | 'ACHIEVEMENT_EARNED'
  | 'COURSE_COMPLETED'
  | 'QUIZ_COMPLETED'
  | 'RESEARCH_PROCESSED'
  | 'GITHUB_ANALYSIS_COMPLETE'
  | 'PROJECT_UPDATE'
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  student_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  student_id: string;
  learning: boolean;
  learning_updates?: boolean;
  community: boolean;
  community_updates?: boolean;
  projects: boolean;
  project_updates?: boolean;
  research: boolean;
  github: boolean;
  career: boolean;
  system: boolean;
  in_app: boolean;
  in_app_enabled?: boolean;
  categories?: Record<string, boolean>;
  study_reminders?: boolean;
  revision_reminders?: boolean;
  goal_deadlines?: boolean;
  exam_reminders?: boolean;
  email_digest: 'NONE' | 'DAILY' | 'WEEKLY';
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 8. UNIFIED STUDENT PORTFOLIO
// ----------------------------------------------------------------------------

export type PortfolioItemVisibility = 'PRIVATE' | 'PLATFORM_ONLY' | 'COMMUNITY' | 'PUBLIC';

export interface PortfolioItem {
  id: string;
  student_id: string;
  item_type?: 'COURSE' | 'PROJECT' | 'RESEARCH' | 'SKILL' | 'CERTIFICATE' | 'ACHIEVEMENT' | 'GITHUB_REPO';
  category?: string;
  reference_id?: string;
  entity_id?: string;
  title: string;
  subtitle?: string;
  description: string;
  tags?: string[];
  external_url?: string;
  evidence_summary?: string;
  visibility: PortfolioItemVisibility;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UnifiedPortfolioSummary {
  student_name: string;
  branch: string;
  semester: number;
  bio: string;
  completion_percentage: number;
  skills_count: number;
  courses_completed_count: number;
  projects_count: number;
  research_papers_count: number;
  certificates_count: number;
  achievements_count: number;
  items: PortfolioItem[];
}

// ----------------------------------------------------------------------------
// 9. UNIFIED LEARNING PROGRESS & ANALYTICS
// ----------------------------------------------------------------------------

export interface UnifiedLearningProgress {
  student_id?: string;
  courses_completed?: number;
  skills_count?: number;
  coding_problems_solved?: number;
  dsa_problems_solved?: number;
  projects_count?: number;
  research_papers_analyzed?: number;
  metrics_explanation?: Record<string, string>;
  overall_indicators: {
    courses_completion_rate: number;
    quiz_average_accuracy: number;
    coding_problems_solved: number;
    dsa_problems_solved: number;
    projects_completed: number;
    placement_modules_practiced: number;
    research_papers_analyzed: number;
    verified_skills_count: number;
  };
  subsystems?: any;
  streak: LearningStreakData;
  activity_chart_weekly: {
    day: string;
    lessons: number;
    coding: number;
    quizzes: number;
    research: number;
    total: number;
  }[];
  weekly_activity?: any;
  category_breakdown: {
    category: string;
    completed: number;
    in_progress: number;
    total: number;
  }[];
  recent_activity_count: number;
  has_sufficient_data: boolean;
}

export interface SubsystemProgressOverview {
  category: string;
  title: string;
  summary_metrics: Record<string, string | number>;
  detailed_items: any[];
  activity_trend: { label: string; value: number }[];
  status_distribution: { name: string; count: number; color?: string }[];
}

// ----------------------------------------------------------------------------
// 10. AI INSIGHTS & RECOMMENDATIONS
// ----------------------------------------------------------------------------

export interface LearningInsight {
  id: string;
  student_id: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  factual_summary: string;
  descriptive_observations: string[];
  title?: string;
  observation?: string;
  strong_areas: string[];
  unassessed_or_weak_areas: string[];
  generated_at: string;
}

export interface ResourceRecommendation {
  id: string;
  title: string;
  resource_type: 'COURSE_LESSON' | 'NOTE' | 'QUIZ' | 'CODING_PROBLEM' | 'DSA_PROBLEM' | 'RESEARCH_PAPER' | 'PROJECT_TASK';
  resource_id: string;
  link: string;
  reason: string;
  estimated_time_minutes: number;
  relevance_score: number;
}
