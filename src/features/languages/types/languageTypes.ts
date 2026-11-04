// src/features/languages/types/languageTypes.ts
// Frontend TypeScript definitions for the Language Learning Module (150+ Languages)

export type LanguageRegion =
  | 'European'
  | 'Asian'
  | 'Indian'
  | 'Middle Eastern'
  | 'African'
  | 'Americas'
  | 'Other';

export type CapabilityStatus = 'SUPPORTED' | 'LIMITED' | 'UNAVAILABLE';

export interface LanguageCapabilities {
  text_lessons: CapabilityStatus;
  vocabulary: CapabilityStatus;
  grammar: CapabilityStatus;
  translation: CapabilityStatus;
  tts_audio: CapabilityStatus;
  speech_recognition: CapabilityStatus;
  pronunciation_eval: CapabilityStatus;
  listening: CapabilityStatus;
  reading: CapabilityStatus;
  writing_feedback: CapabilityStatus;
  ai_conversation: CapabilityStatus;
  quizzes: CapabilityStatus;
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type StudentProficiencyLevel =
  | 'COMPLETE_BEGINNER'
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED';

export type LearningPurpose =
  | 'TRAVEL'
  | 'CAREER'
  | 'EDUCATION'
  | 'STUDY_ABROAD'
  | 'COMMUNICATION'
  | 'EXAMS'
  | 'CULTURE'
  | 'PERSONAL';

export interface LanguageEntry {
  code: string;
  name: string;
  native_name: string;
  family: string;
  region: LanguageRegion;
  scripts: string[];
  direction: 'ltr' | 'rtl';
  flag_emoji: string;
  sample_phrase: string;
  sample_translation: string;
  pronunciation_guide?: string;
  popular?: boolean;
  capabilities: LanguageCapabilities;
  available_levels: CEFRLevel[];
  total_lessons_count: number;
  total_vocabulary_count: number;
  description: string;
  writing_system_overview: string;
  is_enrolled?: boolean;
  current_level?: string;
}

export interface StudentLanguageEnrollment {
  id: string;
  student_id: string;
  language_code: string;
  purpose: LearningPurpose;
  current_level: StudentProficiencyLevel;
  cefr_level: CEFRLevel;
  target_level: string;
  explanation_language: string;
  daily_goal_minutes: number;
  preferred_methods: string[];
  enrolled_at: string;
  last_studied_at: string;
  current_streak_days: number;
  total_minutes_studied: number;
  completed_lessons_count: number;
  mastered_vocab_count: number;
  weak_topics: string[];
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  language?: LanguageEntry;
}

export interface LanguageLessonSummary {
  id: string;
  path_id: string;
  order: number;
  title: string;
  level: CEFRLevel;
  estimated_duration_min: number;
  is_completed?: boolean;
}

export interface LanguageLearningPath {
  id: string;
  language_code: string;
  level: CEFRLevel;
  title: string;
  description: string;
  estimated_hours: number;
  lessons: LanguageLessonSummary[];
}

export interface NativeScriptExample {
  target: string;
  script?: string;
  transliteration?: string;
  translation: string;
  breakdown?: string;
  audio_text?: string;
}

export interface GrammarNote {
  concept: string;
  rule: string;
  pattern: string;
  positive_examples: string[];
  negative_examples: string[];
  common_mistakes: string[];
  exceptions?: string[];
}

export interface LanguageVocabItem {
  id: string;
  language_code: string;
  word: string;
  native_script: string;
  transliteration?: string;
  translation: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation: string;
  pronunciation_guide?: string;
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  provenance: string;
}

export interface LanguageExerciseItem {
  id: string;
  type: 'MCQ' | 'FILL_IN_BLANK' | 'MATCH' | 'SENTENCE_ORDER' | 'TRANSLATION';
  prompt: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  pairs?: Array<{ source: string; target: string }>;
  scrambled_words?: string[];
}

export interface LanguageQuizQuestion {
  id: string;
  type: 'MCQ' | 'FILL_IN_BLANK' | 'TRANSLATION' | 'LISTENING';
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  audio_phrase?: string;
}

export interface LanguageLessonDetail {
  id: string;
  language_code: string;
  path_id: string;
  order: number;
  level: CEFRLevel;
  title: string;
  objectives: string[];
  estimated_duration_min: number;
  explanation: string;
  native_script_examples: NativeScriptExample[];
  grammar_notes: GrammarNote[];
  vocabulary: LanguageVocabItem[];
  interactive_exercises: LanguageExerciseItem[];
  quiz_questions: LanguageQuizQuestion[];
  is_completed?: boolean;
  student_notes?: string;
}

export type ReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface SpacedRepetitionCard {
  id: string;
  student_id: string;
  language_code: string;
  vocab_id: string;
  word: string;
  native_script: string;
  transliteration?: string;
  translation: string;
  example_sentence?: string;
  example_translation?: string;
  part_of_speech?: string;
  repetition_count: number;
  interval_days: number;
  ease_factor: number;
  next_review_date: string;
  last_reviewed_at: string;
  difficulty_rating: ReviewRating;
  is_bookmarked: boolean;
  is_mastered: boolean;
}

export interface WritingSubmission {
  id: string;
  student_id: string;
  language_code: string;
  prompt_type: string;
  prompt_text: string;
  student_text: string;
  created_at: string;
  ai_feedback?: {
    corrected_text: string;
    grammar_score: number;
    vocabulary_score: number;
    clarity_score: number;
    overall_score: number;
    spelling_corrections: Array<{ original: string; corrected: string; explanation: string }>;
    grammar_points: string[];
    tone_analysis: string;
    positive_reinforcement: string;
  };
}

export interface ConversationMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  translation?: string;
  correction?: string;
  timestamp: string;
}

export interface ConversationSession {
  id: string;
  student_id: string;
  language_code: string;
  scenario: string;
  mode: 'PRACTICE' | 'CORRECTION';
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
  session_summary?: {
    vocabulary_acquired: string[];
    grammar_tips: string[];
    corrections_made: number;
  };
}

export interface ContextualTranslationResult {
  source_lang: string;
  target_lang: string;
  input_text: string;
  primary_translation: string;
  transliteration?: string;
  alternative_translations: string[];
  formal_variant?: string;
  informal_variant?: string;
  word_breakdown: Array<{ word: string; meaning: string; pos?: string }>;
  grammar_explanation: string;
  contextual_warning?: string;
  example_sentences: Array<{ target: string; source: string }>;
}

export interface QuizSubmissionResult {
  quiz_id: string;
  language_code: string;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  passed: boolean;
  question_results: Array<{
    question_id: string;
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
  }>;
  submitted_at: string;
}

export interface StudentLanguageAnalytics {
  enrolled_languages_count: number;
  active_languages: Array<{
    code: string;
    name: string;
    flag: string;
    level: string;
    streak_days: number;
    completed_lessons: number;
    total_lessons: number;
    mastered_vocab: number;
  }>;
  total_vocabulary_mastered: number;
  total_lessons_completed: number;
  total_study_minutes: number;
  total_quizzes_taken: number;
  average_quiz_score: number;
  vocabulary_due_today: number;
  is_onboarding: boolean;
}
