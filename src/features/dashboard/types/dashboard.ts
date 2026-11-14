export interface DashboardStudent {
  id: string;
  name: string;
  email: string;
  branch: string;
  semester: number;
  role: 'STUDENT' | 'SUPER_ADMIN';
  avatar_url?: string;
  learning_streak: number;
  focus_topic: string;
}

export interface DashboardSummary {
  overall_progress: number;
  streak_days: number;
  longest_streak: number;
  courses_active: number;
  projects_active: number;
  dsa_solved: number;
  study_hours_this_week: number;
  credits_completed: number;
  total_credits: number;
}

export interface ContinueLearningItem {
  course_id: string;
  course_name: string;
  lesson_id: string;
  lesson_title: string;
  progress: number;
  next_topic: string;
  category: string;
  total_lessons: number;
  completed_lessons: number;
}

export interface TodayPlanTask {
  id: string;
  title: string;
  type: 'dsa' | 'course' | 'notes' | 'quiz' | 'project';
  estimated_time: string;
  is_completed: boolean;
  action_url: string;
}

export interface CourseProgressItem {
  id: string;
  name: string;
  code: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed: string;
  category: string;
  color?: string;
}

export interface LearningRecommendation {
  id: string;
  title: string;
  type: 'course' | 'dsa' | 'project' | 'quiz' | 'notes';
  reason: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_time: string;
  action_url: string;
}

export interface SkillArea {
  topic: string;
  score: number;
  subject: string;
  recommendation?: string;
  action_url?: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  type: 'lesson' | 'dsa' | 'quiz' | 'note' | 'document' | 'project';
  timestamp: string;
  formatted_time: string;
  link: string;
  status: 'completed' | 'submitted' | 'active';
}

export interface ActiveProjectItem {
  id: string;
  title: string;
  progress: number;
  current_milestone: string;
  next_step: string;
  tech_stack: string[];
  link: string;
}

export interface UpcomingCalendarItem {
  id: string;
  title: string;
  type: 'quiz' | 'exam' | 'assignment' | 'milestone' | 'interview';
  date: string;
  time: string;
  status: string;
  link: string;
}

export interface RecentBookmarkItem {
  id: string;
  title: string;
  type: string;
  link: string;
  created_at: string;
}

export interface DashboardAnalytics {
  weekly_study_minutes: { day: string; minutes: number; problems_solved: number }[];
  category_distribution: { category: string; progress: number }[];
}

import { DocumentCardData } from '../../documents/types/document';

export interface DashboardData {
  student: DashboardStudent;
  summary: DashboardSummary;
  continue_learning: ContinueLearningItem | null;
  today_plan: TodayPlanTask[];
  course_progress: CourseProgressItem[];
  recommendations: LearningRecommendation[];
  weak_areas: SkillArea[];
  strengths: SkillArea[];
  recent_activity: RecentActivityItem[];
  projects: ActiveProjectItem[];
  upcoming_items: UpcomingCalendarItem[];
  bookmarks: RecentBookmarkItem[];
  recent_documents?: DocumentCardData[];
  analytics: DashboardAnalytics;
  is_new_student: boolean;
  /** Phase 5: academic and career context from the central student profile. */
  student_profile?: DashboardProfileContext;
}

export interface DashboardProfileContext {
  name?: string | null;
  university?: string | null;
  college?: string | null;
  degree?: string | null;
  branch?: string | null;
  specialization?: string | null;
  academic_year?: number | null;
  semester?: number | null;
  subjects?: string[];
  expected_graduation_year?: number | null;
  target_roles?: string[];
  /** Free text from the profile's career section (older data may hold a list). */
  short_term_goals?: string | string[] | null;
  weekly_study_hours?: number | null;
  completion_percentage: number;
  incomplete_sections: string[];
  onboarding_completed: boolean;
}

