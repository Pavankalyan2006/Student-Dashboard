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

export interface CourseResource {
  id: string;
  course_id: string;
  title: string;
  type: 'PDF' | 'NOTES' | 'CODE' | 'LINK';
  url: string;
  size_bytes?: number;
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
}

export interface CourseWithDetails extends Course {
  chapters: CourseChapterWithLessons[];
  enrollment?: CourseEnrollment | null;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  is_bookmarked: boolean;
  resources: CourseResource[];
  related_courses?: CourseCardData[];
}
