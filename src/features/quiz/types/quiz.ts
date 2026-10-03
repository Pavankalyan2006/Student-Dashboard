export type QuestionType =
  | 'MCQ'
  | 'MULTI_SELECT'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'CODE_OUTPUT';

export type QuizDifficulty = 'BEGINNER' | 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';
export type DifficultyLevel = QuizDifficulty;

export type QuizSourceType =
  | 'TOPIC'
  | 'COURSE'
  | 'LESSON'
  | 'NOTES'
  | 'DOCUMENT'
  | 'DSA'
  | 'MIXED';

export type QuizStatus =
  | 'DRAFT'
  | 'READY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED';

export type AttemptStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'EXPIRED';

export type QuizMode = 'PRACTICE' | 'ASSESSMENT';

export interface QuestionMetadata {
  code_snippet?: string;
  language?: string;
  expected_output?: string;
  document_citation?: {
    document_id: string;
    document_name: string;
    page?: number;
    chunk_id?: string;
  };
  citation?: string;
  topic_name?: string;
  is_retry?: boolean;
  note_id?: string;
  note_title?: string;
  course_id?: string;
  course_title?: string;
  lesson_id?: string;
  lesson_title?: string;
  dsa_topic_id?: string;
  criteria?: string[];
  [key: string]: any;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  difficulty: QuizDifficulty;
  topic_id: string;
  topic_name?: string;
  source_type: QuizSourceType;
  source_id?: string;
  metadata?: QuestionMetadata;
  created_at: string;
}

// Delivery schema: Sent to frontend while student takes quiz (answers stripped for anti-cheating)
export interface QuizDeliveryQuestion {
  id: string;
  quiz_id: string;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  options?: string[];
  difficulty: QuizDifficulty;
  topic_id: string;
  topic_name?: string;
  source_type: QuizSourceType;
  metadata?: QuestionMetadata;
}

export function toDeliveryQuestion(q: QuizQuestion): QuizDeliveryQuestion {
  return {
    id: q.id,
    quiz_id: q.quiz_id,
    question_number: q.question_number,
    question_type: q.question_type,
    question_text: q.question_text,
    options: q.options,
    difficulty: q.difficulty,
    topic_id: q.topic_id,
    topic_name: q.topic_name,
    source_type: q.source_type,
    metadata: q.metadata,
  };
}

export interface Quiz {
  id: string;
  student_id: string;
  title: string;
  description: string;
  source_type: QuizSourceType;
  source_id?: string;
  topic_id?: string;
  difficulty: QuizDifficulty;
  question_count: number;
  time_limit_seconds?: number;
  adaptive_mode: boolean;
  mode?: QuizMode;
  status: QuizStatus;
  metadata?: Record<string, any>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface QuestionAttempt {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: string | string[] | null;
  is_correct: boolean | null;
  time_taken_seconds: number;
  attempt_number: number;
  feedback?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AdaptiveState {
  current_difficulty: QuizDifficulty;
  correct_streak: number;
  incorrect_streak: number;
  recent_accuracy: number;
  history: {
    question_id: string;
    difficulty: QuizDifficulty;
    is_correct: boolean;
  }[];
  adjustment_reason?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  completed_at?: string;
  score: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  time_limit_seconds?: number;
  status: AttemptStatus;
  question_order?: string[];
  current_question_index?: number;
  flagged_questions?: string[];
  adaptive_state?: AdaptiveState;
  answers?: Record<string, string | string[]>;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface TopicPerformance {
  topic_id: string;
  topic_name: string;
  questions_answered?: number;
  total_questions?: number;
  correct_count?: number;
  correct_answers?: number;
  accuracy: number;
  status: 'WEAK' | 'NEUTRAL' | 'STRONG' | 'NEEDS_PRACTICE' | 'PROFICIENT' | 'MASTERED';
  last_practiced_at: string;
}

export interface DifficultyProgression {
  difficulty: QuizDifficulty;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface RecentScore {
  quiz_id: string;
  quiz_title: string;
  score: number;
  completed_at: string;
  difficulty: QuizDifficulty;
}

export interface RevisionRecommendation {
  topic_id: string;
  topic_name: string;
  reason: string;
  recommended_difficulty: QuizDifficulty;
  suggested_question_count: number;
}

export interface QuizProgress {
  student_id: string;
  total_quizzes_taken?: number;
  total_quizzes?: number;
  total_quizzes_completed?: number;
  completed_quizzes?: number;
  total_questions_answered?: number;
  questions_answered?: number;
  average_score: number;
  accuracy_rate?: number;
  overall_accuracy?: number;
  topic_performances: Record<string, TopicPerformance> | TopicPerformance[];
  weak_topics?: any[];
  weak_areas?: (TopicPerformance | string)[];
  strong_topics?: any[];
  strong_areas?: (TopicPerformance | string)[];
  recent_attempts?: QuizAttempt[];
  recent_scores?: RecentScore[];
  difficulty_progression?: DifficultyProgression[];
  recommended_revisions?: RevisionRecommendation[];
  revision_recommendations?: RevisionRecommendation[];
  streak_days?: number;
  last_quiz_at?: string;
  last_activity_at?: string;
  updated_at?: string;
}

export interface GenerateQuizRequest {
  source_type?: QuizSourceType;
  source_id?: string;
  title?: string;
  topic?: string;
  topic_id?: string;
  course_id?: string;
  lesson_id?: string;
  note_id?: string;
  document_id?: string;
  dsa_topic?: string;
  dsa_topic_id?: string;
  difficulty?: QuizDifficulty;
  question_type?: QuestionType | 'MIXED';
  question_count?: number;
  time_limit_seconds?: number;
  adaptive_mode?: boolean;
  mode?: QuizMode;
}

export interface ReviewQuestionItem {
  question_id: string;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  options?: string[];
  student_answer: string | string[] | null;
  correct_answer: string | string[];
  is_correct: boolean;
  explanation: string;
  difficulty?: QuizDifficulty;
  topic_id?: string;
  source_type?: QuizSourceType;
  source_id?: string;
  citation?: string;
  evaluation_details?: string;
  question?: QuizQuestion;
  attempt?: QuestionAttempt;
}

export interface QuizReviewResult {
  attempt?: QuizAttempt;
  attempt_id?: string;
  quiz?: Quiz;
  quiz_id?: string;
  quiz_title?: string;
  score?: number;
  correct_count?: number;
  incorrect_count?: number;
  unanswered_count?: number;
  time_taken_seconds?: number;
  completed_at?: string;
  items?: ReviewQuestionItem[];
  questions?: ReviewQuestionItem[];
  review_items?: ReviewQuestionItem[];
  topic_breakdown?: Record<string, { total: number; correct: number; accuracy: number }> | { topic: string; total: number; correct: number; accuracy: number }[];
  recommended_actions?: string[];
}

export interface QuizResult {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  completed_at?: string;
  topic_breakdown: { topic: string; total: number; correct: number; accuracy: number }[];
  passed: boolean;
  recommended_actions: string[];
}
