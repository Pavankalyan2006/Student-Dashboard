// server/models/semesterCommandCenterTypes.ts
// Data structures for Academic Semester Command Center

export type BranchCode = 'CSE' | 'AIML' | 'ECE' | 'EEE' | 'MECHANICAL' | 'CIVIL' | 'IT' | 'OTHER';

export type SubjectType = 'CORE' | 'ELECTIVE' | 'OPEN_ELECTIVE' | 'LAB' | 'PROJECT' | 'SEMINAR' | 'OTHER';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AcademicEventType =
  | 'SEMESTER_START'
  | 'SEMESTER_END'
  | 'CLASS'
  | 'HOLIDAY'
  | 'SLIP_TEST'
  | 'QUIZ'
  | 'ASSIGNMENT'
  | 'LAB'
  | 'LAB_EXAM'
  | 'MINOR_1'
  | 'MINOR_2'
  | 'MINOR_3'
  | 'PROJECT_REVIEW'
  | 'SEMINAR'
  | 'REVISION'
  | 'STUDY_DAY'
  | 'END_SEMESTER'
  | 'OTHER';

export type FocusMode =
  | 'LEARNING'
  | 'CONSOLIDATION'
  | 'EXAM_PREPARATION'
  | 'FINAL_REVISION'
  | 'EXAM_MODE'
  | 'POST_EXAM_ANALYSIS';

export type StreamNodeType =
  | 'SYLLABUS_OVERVIEW'
  | 'UNIT_STUDY'
  | 'PRACTICE'
  | 'QUIZ'
  | 'REVISION'
  | 'SLIP_TEST'
  | 'PERFORMANCE_ANALYSIS'
  | 'WEAK_TOPIC_RECOVERY'
  | 'MINOR_EXAM'
  | 'FULL_REVISION'
  | 'MOCK_TEST'
  | 'END_SEMESTER';

export type NodeStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'NEEDS_RECOVERY';

export interface SemesterTopic {
  id: string;
  name: string;
  estimated_hours: number;
  conceptual_difficulty: DifficultyLevel;
  practical_difficulty: DifficultyLevel;
  prerequisites?: string[];
  completed: boolean;
  revision_count: number;
  notes?: string;
}

export interface SemesterUnit {
  id: string;
  unit_number: number;
  name: string;
  weightage_percent?: number;
  topics: SemesterTopic[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVISED';
  notes?: string;
}

export interface SemesterSubject {
  id: string;
  semester_id: string;
  name: string;
  code: string;
  credits: number;
  subject_type: SubjectType;
  difficulty: DifficultyLevel;
  priority: PriorityLevel;
  progress_percent: number;
  syllabus_remaining_percent: number;
  units: SemesterUnit[];
  exam_proximity_days?: number;
  target_grade?: string;
}

export interface AcademicEvent {
  id: string;
  student_id: string;
  subject_id?: string;
  event_type: AcademicEventType;
  title: string;
  date: string; // YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  priority: PriorityLevel;
  syllabus_scope?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  notes?: string;
}

export interface AcademicPhase {
  id: string;
  phase_number: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  focus_mode: FocusMode;
}

export interface SemesterStudyStreamNode {
  id: string;
  title: string;
  type: StreamNodeType;
  subject_id: string;
  subject_name: string;
  unit_id?: string;
  unit_number?: number;
  status: NodeStatus;
  deadline: string;
  estimated_time_minutes: number;
  actual_time_minutes?: number;
  score?: number;
  priority: PriorityLevel;
  dependencies?: string[];
  action_route?: string;
}

export interface SlipTest {
  id: string;
  subject_id: string;
  subject_name: string;
  title: string;
  date: string;
  units: number[];
  topics: string[];
  marks: number;
  duration_minutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  score?: number;
  weak_topics?: string[];
  preparation_plan?: {
    revision_list: string[];
    practice_questions_count: number;
    flashcards_deck_id?: string;
    quiz_id?: string;
  };
}

export interface MinorExam {
  id: string;
  minor_type: 'MINOR_1' | 'MINOR_2' | 'MINOR_3';
  title: string;
  start_date: string;
  end_date: string;
  subjects: {
    subject_id: string;
    subject_name: string;
    exam_date: string;
    units_covered: number[];
    syllabus_remaining_percent: number;
    mock_test_done: boolean;
  }[];
  preparation_days_left: number;
  focus_mode: FocusMode;
}

export interface EndSemReadiness {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  exam_date: string;
  days_remaining: number;
  total_units: number;
  completed_units: number;
  revised_units: number;
  mock_tests_completed: number;
  mock_tests_target: number;
  readiness_percent: number;
  weak_topics: string[];
  strong_topics: string[];
  end_sem_prep_stream: string[];
}

export interface AcademicRecoveryPlan {
  id: string;
  missed_item_title: string;
  missed_item_type: string;
  missed_date: string;
  urgency: PriorityLevel;
  schedule_adjustments: {
    day: string;
    duration_minutes: number;
    task: string;
    type: 'STUDY' | 'PRACTICE' | 'REVISION' | 'QUIZ';
  }[];
  recommendations: string[];
  is_resolved: boolean;
}

export interface DailyAcademicGuidance {
  date: string;
  primary_focus: {
    subject_name: string;
    unit_name: string;
    target_topics: string[];
    estimated_minutes: number;
  };
  secondary_focus: {
    subject_name: string;
    task_description: string;
    estimated_minutes: number;
  };
  quick_practice: {
    title: string;
    action_url: string;
    count: number;
  };
  upcoming_slip_tests: {
    subject_name: string;
    days_left: number;
    date: string;
  }[];
  revision_due: {
    subject_name: string;
    unit_name: string;
    reason: string;
  }[];
  completed_items: string[];
}

export interface WeeklyAcademicReview {
  week_number: number;
  start_date: string;
  end_date: string;
  subject_deltas: {
    subject_name: string;
    progress_delta_percent: number;
    status: 'ON_TRACK' | 'AHEAD' | 'BEHIND';
  }[];
  strong_topics: string[];
  needs_attention: string[];
  next_week_priorities: string[];
  study_hours_completed: number;
  study_hours_target: number;
}

export interface AcademicSemesterConfig {
  id: string;
  student_id: string;
  semester_number: number;
  academic_year: string;
  branch: BranchCode;
  section?: string;
  start_date: string;
  end_date: string;
  total_teaching_weeks: number;
  current_week: number;
  current_phase_number: number;
  target_gpa?: number;
  daily_study_hours_budget: number;
  academic_goals: string[];
  created_at: string;
  updated_at: string;
}

export interface SemesterOverviewDashboardData {
  config: AcademicSemesterConfig;
  overall_progress_percent: number;
  syllabus_progress_percent: number;
  revision_progress_percent: number;
  assessment_progress_percent: number;
  lab_progress_percent: number;
  assignment_progress_percent: number;
  exam_prep_progress_percent: number;
  current_phase: AcademicPhase;
  all_phases: AcademicPhase[];
  subjects: SemesterSubject[];
  upcoming_events: AcademicEvent[];
  today_guidance: DailyAcademicGuidance;
  active_recovery_plans: AcademicRecoveryPlan[];
  latest_weekly_review: WeeklyAcademicReview;
}
