// server/models/gateTypes.ts
// Comprehensive domain models for GATE Exam Preparation System

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
  exam_cycle: string; // e.g. "GATE 2026"
  target_date?: string; // e.g. "2026-02-07"
  target_score?: number; // out of 100
  air_goal?: string; // e.g. "< 500", "< 100", "Top 1000"
  weekly_study_hours: number;
  study_days: string[]; // ['Monday', 'Tuesday', ...]
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
  pyq_frequency: string; // e.g. "1-2 questions every year"
  estimated_study_hours: number;
  // Student specific progress (hydrated per student)
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
  id: string; // 'A', 'B', 'C', 'D'
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
  question_type: QuestionType; // 'MCQ' | 'MSQ' | 'NAT'
  marks: 1 | 2;
  negative_marks: number; // 0.33 for 1-mark MCQ, 0.66 for 2-mark MCQ, 0 for MSQ and NAT
  question_statement: string;
  diagram_url?: string;
  options?: GateQuestionOption[];
  // For server evaluation:
  // For MCQ: 'A'
  // For MSQ: ['A', 'C']
  // For NAT: { min: 24.5, max: 25.5, exact: 25 }
  correct_answer: string | string[] | { min: number; max: number; exact?: number };
  tolerance_range?: [number, number];
  explanation: string;
  hint?: string;
  difficulty: QuestionDifficulty;
  source_attribution: string; // e.g. "GATE 2024 CS Set-1 Q.14 (Verified Official PYQ)"
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
  estimated_gate_score?: number; // standard normalized 0-1000 scale
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
  date: string; // YYYY-MM-DD
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
    estimated_gate_score: number; // e.g. 642 / 1000
    saved_questions_count: number;
  };
  weak_topics: {
    topic_id: string;
    topic_name: string;
    subject: string;
    accuracy: number;
    attempts_count: number;
    recommendation: string;
  }[];
  upcoming_tasks: GateStudyTask[];
  recent_attempts: (GateQuestionAttempt & { statement: string; subject: string })[];
  recent_tests: (GateTestResult & { title: string })[];
}
