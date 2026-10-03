export type NoteSourceType = 'topic' | 'course' | 'lesson' | 'selected_content' | 'document';
export type NoteType = 'STUDY_NOTES' | 'EXAM_NOTES' | 'QUICK_REVISION' | 'INTERVIEW_NOTES' | 'DETAILED_NOTES';
export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type NoteLength = 'SHORT' | 'MEDIUM' | 'DETAILED';

export interface NoteSectionItem {
  id: string;
  title: string;
  content: string;
  order_index: number;
  section_type?: 'overview' | 'concept' | 'definition' | 'example' | 'formula' | 'code' | 'key_points' | 'common_mistakes' | 'exam_tips' | 'interview_qa' | 'summary' | 'practice';
}

export interface StructuredNoteContent {
  title: string;
  overview: string;
  learning_objectives: string[];
  sections: NoteSectionItem[];
  examples: { title: string; explanation: string; code?: string; language?: string }[];
  key_points: string[];
  common_mistakes: string[];
  exam_points: string[];
  interview_questions?: { question: string; answer: string; difficulty?: string }[];
  summary: string;
  practice_questions?: string[];
  formulas?: { name: string; latex: string; explanation: string }[];
}

export interface NoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  content: string;
  title: string;
  created_at: string;
  created_by: string;
  summary_of_change?: string;
}

export interface Note {
  id: string;
  student_id: string;
  title: string;
  description: string;
  source_type: NoteSourceType;
  source_id?: string;
  source_title?: string;
  chapter_id?: string;
  lesson_id?: string;
  note_type: NoteType;
  level: StudentLevel;
  length: NoteLength;
  content: string;
  structured_data?: StructuredNoteContent;
  tags: string[];
  is_favorite: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface NoteCardData {
  id: string;
  student_id: string;
  title: string;
  description: string;
  source_type: NoteSourceType;
  source_id?: string;
  source_title?: string;
  note_type: NoteType;
  level: StudentLevel;
  tags: string[];
  is_favorite: boolean;
  content_preview: string;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  concept: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  topic?: string;
}

export interface GenerateNotesRequest {
  source_type: NoteSourceType;
  topic?: string;
  course_id?: string;
  chapter_id?: string;
  lesson_id?: string;
  document_id?: string;
  selected_content?: string;
  level?: StudentLevel | 'beginner' | 'intermediate' | 'advanced';
  note_type?: NoteType | 'study' | 'exam' | 'quick_revision' | 'interview' | 'detailed';
  length?: NoteLength | 'short' | 'medium' | 'detailed';
  tags?: string[];
}
