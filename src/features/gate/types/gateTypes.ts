// src/features/gate/types/gateTypes.ts
// Domain types for GATE Exam Preparation System

export type GatePaperCode = 'CS' | 'DA' | 'EC' | 'EE' | 'ME' | 'CE' | 'MA' | 'PH' | string;

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type StudentConfidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type QuestionPaletteStatus = 'NOT_VISITED' | 'UNANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface GatePaper {
  code: GatePaperCode;
  name: string;
  department: string;
  description: string;
  official_cycle: string;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  sections_count: number;
  topics_count: number;
  is_active: boolean;
}

export interface GateStudentProfile {
  student_id: string;
  target_paper: GatePaperCode;
  exam_cycle: string;
  target_date?: string;
  target_score?: number;
  air_goal?: string;
  weekly_study_hours: number;
  study_days: string[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GateSyllabusTopic {
  id: string;
  section_id: string;
  paper_code: GatePaperCode;
  name: string;
  description: string;
  key_concepts: string[];
  importance: 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  pyq_frequency: string;
  estimated_study_hours: number;
  status?: TopicStatus;
  confidence?: StudentConfidence;
  revision_flag?: boolean;
  student_notes?: string;
  last_practiced_at?: string;
  mastery_percentage?: number;
}

export interface GateSyllabusSection {
  id: string;
  paper_code: GatePaperCode;
  name: string;
  description: string;
  order_index: number;
  weightage_approx_percent: number;
  topics: GateSyllabusTopic[];
}

export interface GateQuestionOption {
  id: string;
  text: string;
}

export interface GateQuestion {
  id: string;
  paper_code: GatePaperCode;
  subject: string;
  section_id: string;
  topic_id: string;
  year?: number;
  exam_session?: string;
  is_pyq: boolean;
  is_ai_generated: boolean;
  question_type: QuestionType;
  marks: 1 | 2;
  negative_marks: number;
  question_statement: string;
  diagram_url?: string;
  options?: GateQuestionOption[];
  correct_answer?: any; // hidden during active mock test
  tolerance_range?: [number, number];
  explanation?: string;
  hint?: string;
  difficulty: QuestionDifficulty;
  source_attribution: string;
}

export interface GateQuestionAttempt {
  id: string;
  student_id: string;
  question_id: string;
  paper_code: GatePaperCode;
  selected_answer: any;
  is_correct: boolean;
  marks_awarded: number;
  negative_deducted: number;
  time_spent_seconds: number;
  attempted_at: string;
}

export interface GateBookmark {
  id: string;
  student_id: string;
  question_id: string;
  notes?: string;
  created_at: string;
}

export interface GateMockTest {
  id: string;
  paper_code: GatePaperCode;
  title: string;
  type: 'FULL_LENGTH' | 'SUBJECT_WISE' | 'TOPIC_WISE' | 'CUSTOM';
  subject?: string;
  duration_minutes: number;
  total_marks: number;
  total_questions: number;
  question_ids: string[];
  instructions: string[];
  negative_marking: boolean;
  is_official_pyq_paper?: boolean;
  year?: number;
}

export interface GateTestSessionAnswer {
  question_id: string;
  selected_answer?: any;
  status: QuestionPaletteStatus;
  time_spent_seconds: number;
  visited: boolean;
}

export interface GateTestResult {
  id: string;
  session_id: string;
  student_id: string;
  test_id: string;
  test_title: string;
  paper_code: GatePaperCode;
  total_marks_obtained: number;
  total_score?: number;
  max_marks: number;
  max_score?: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  negative_marks_lost: number;
  accuracy_percentage: number;
  time_taken_seconds: number;
  estimated_gate_score?: number;
  gate_score_estimate?: number;
  subject_breakdown: Record<string, { total: number; scored: number; correct: number; incorrect: number }>;
  topic_breakdown: Record<string, { correct: number; incorrect: number }>;
  question_reviews: {
    question_id: string;
    statement: string;
    question_type: QuestionType;
    marks: number;
    user_answer: any;
    correct_answer: any;
    is_correct: boolean;
    marks_awarded: number;
    explanation: string;
    topic_id: string;
    subject: string;
  }[];
  completed_at: string;
}

export interface GateTestSession {
  id: string;
  student_id: string;
  test_id: string;
  paper_code: GatePaperCode;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
  start_time: string;
  end_time?: string;
  duration_minutes: number;
  remaining_seconds: number;
  answers: Record<string, GateTestSessionAnswer>;
  result?: GateTestResult;
}

export interface GateStudyTask {
  id: string;
  student_id: string;
  paper_code: GatePaperCode;
  date: string;
  title: string;
  type: 'CONCEPT' | 'PRACTICE' | 'REVISION' | 'MOCK_TEST';
  topic_id?: string;
  subject?: string;
  duration_minutes: number;
  is_completed: boolean;
  notes?: string;
}

export interface GateDashboardData {
  profile: GateStudentProfile;
  paper_info: GatePaper;
  metrics: {
    syllabus_completion_percentage: number;
    total_topics: number;
    completed_topics: number;
    in_progress_topics: number;
    total_questions_practiced: number;
    total_correct: number;
    overall_accuracy_percentage: number;
    total_mock_tests_taken: number;
    avg_mock_test_score: number;
    highest_mock_test_score: number;
    estimated_gate_score?: number;
    saved_questions_count: number;
  };
  weak_topics: {
    topic_id: string;
    topic_name: string;
    subject: string;
    accuracy: number | null;
    attempts_count: number;
    recommendation: string;
  }[];
  upcoming_tasks: GateStudyTask[];
  recent_attempts: (GateQuestionAttempt & { statement: string; subject: string })[];
  recent_tests: (GateTestResult & { title: string })[];
}
