export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LessonType = 'TEXT' | 'VIDEO' | 'READING' | 'CODE' | 'QUIZ';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED';
export type LessonProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Course {
  id: string;
  title: string;
  slug: string;
  code: string;
  description: string;
  short_description: string;
  branch: string;
  semester: number;
  difficulty: CourseDifficulty;
  thumbnail: string;
  estimated_minutes: number;
  is_published: boolean;
  prerequisites: string[];
  skills: string[];
  academic_year?: string;
  instructor?: string;
  category?: string;
  syllabus_overview?: string;
  learning_objectives?: string[];
  is_custom?: boolean;
  student_id?: string;
  linked_subject_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  chapter_id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  lesson_type: LessonType;
  order_index: number;
  estimated_minutes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseChapter {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at?: string;
  is_archived?: boolean;
  archived_at?: string;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  course_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  progress_percentage: number;
  started_at: string;
  completed_at?: string;
  last_accessed_at: string;
}

export interface CourseBookmark {
  id: string;
  student_id: string;
  course_id: string;
  created_at: string;
}

export interface CourseResource {
  id: string;
  course_id: string;
  chapter_id?: string;
  title: string;
  type: 'PDF' | 'NOTES' | 'CODE' | 'LINK' | 'DOCUMENT';
  url: string;
  size_bytes?: number;
  document_id?: string;
  note_id?: string;
  processing_status?: 'READY' | 'PROCESSING' | 'NOT_INDEXED';
}

export interface LessonWithNavigation extends CourseLesson {
  course_title: string;
  course_code: string;
  chapter_title: string;
  prev_lesson?: { id: string; title: string } | null;
  next_lesson?: { id: string; title: string } | null;
  is_completed: boolean;
  progress_percentage: number;
}

export interface CourseChapterWithLessons extends CourseChapter {
  lessons: (CourseLesson & {
    is_completed?: boolean;
    is_current?: boolean;
    progress_percentage?: number;
  })[];
}

export interface CourseCardData extends Course {
  total_lessons: number;
  completed_lessons?: number;
  progress_percentage?: number;
  is_enrolled?: boolean;
  is_bookmarked?: boolean;
  is_archived?: boolean;
  last_studied_at?: string;
  next_recommended_lesson?: { id: string; title: string };
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  total_chapters?: number;
}

export interface CourseWithDetails extends Course {
  chapters: CourseChapterWithLessons[];
  enrollment?: CourseEnrollment | null;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  is_bookmarked: boolean;
  is_archived?: boolean;
  last_studied_at?: string;
  next_recommended_lesson?: { id: string; title: string };
  resources: CourseResource[];
  related_courses?: CourseCardData[];
}

export interface CreateCourseInput {
  title: string;
  code?: string;
  description?: string;
  branch?: string;
  semester?: number;
  academic_year?: string;
  difficulty?: CourseDifficulty;
  category?: string;
  syllabus_overview?: string;
  learning_objectives?: string[];
  estimated_hours?: number;
  instructor?: string;
  linked_subject_id?: string;
  linked_document_ids?: string[];
  linked_note_ids?: string[];
}

export interface UpdateCourseInput {
  title?: string;
  code?: string;
  description?: string;
  branch?: string;
  semester?: number;
  academic_year?: string;
  difficulty?: CourseDifficulty;
  category?: string;
  syllabus_overview?: string;
  learning_objectives?: string[];
  instructor?: string;
}

export interface AcademicSubjectOption {
  id: string;
  name: string;
  code: string;
  credits: number;
  subject_type: string;
  difficulty: string;
  units_count: number;
  topics_count: number;
  is_enrolled: boolean;
}

export interface CourseAIAssistantRequest {
  action:
    | 'explain_simple'
    | 'practical_example'
    | 'step_by_step'
    | 'summarize_chapter'
    | 'revision_notes'
    | 'practice_questions'
    | 'flashcards'
    | 'explain_terms'
    | 'compare_concepts'
    | 'study_next'
    | 'revision_checklist';
  topic?: string;
  chapterId?: string;
  lessonId?: string;
  userQuery?: string;
}

export interface CourseAIAssistantResponse {
  action: string;
  result: string;
  key_points?: string[];
  practice_questions?: Array<{ question: string; answer: string; explanation?: string }>;
  flashcards?: Array<{ front: string; back: string }>;
  suggested_next_topic?: string;
  grounded_sources?: string[];
  is_fallback?: boolean;
}
