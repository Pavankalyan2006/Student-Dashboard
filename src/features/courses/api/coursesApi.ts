import { apiClient } from '../../../api/client';
import {
  CourseCardData,
  CourseWithDetails,
  LessonWithNavigation,
  CourseEnrollment,
  LessonProgress,
  Course,
  CourseChapter,
  CourseLesson,
  CourseResource,
  CreateCourseInput,
  UpdateCourseInput,
  AcademicSubjectOption,
  CourseAIAssistantRequest,
  CourseAIAssistantResponse,
} from '../types/courses';

export interface CourseFilterParams {
  branch?: string;
  semester?: number;
  difficulty?: string;
  category?: string;
  status?: string;
  is_archived?: boolean;
  academic_year?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const coursesApi = {
  getCategories: async (): Promise<{ branches: string[]; semesters: number[]; difficulties: string[] }> => {
    return apiClient.get('/courses/categories');
  },

  getCourses: async (
    params: CourseFilterParams = {}
  ): Promise<{ items: CourseCardData[]; total: number; page: number; limit: number; totalPages: number }> => {
    const query = new URLSearchParams();
    if (params.branch && params.branch !== 'All') query.set('branch', params.branch);
    if (params.semester) query.set('semester', String(params.semester));
    if (params.difficulty && params.difficulty !== 'All') query.set('difficulty', params.difficulty);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.is_archived !== undefined) query.set('is_archived', String(params.is_archived));
    if (params.academic_year) query.set('academic_year', params.academic_year);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return apiClient.get(`/courses${qs ? `?${qs}` : ''}`);
  },

  getCourse: async (courseId: string): Promise<CourseWithDetails> => {
    return apiClient.get<CourseWithDetails>(`/courses/${courseId}`);
  },

  enroll: async (courseId: string): Promise<CourseEnrollment> => {
    return apiClient.post<CourseEnrollment>(`/courses/${courseId}/enroll`);
  },

  unenroll: async (courseId: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/courses/${courseId}/unenroll`);
  },

  getCatalogStats: async (): Promise<{
    totalCourses: number;
    totalModules: number;
    totalLessons: number;
    categoryCounts: Record<string, number>;
    difficultyCounts: Record<string, number>;
    branchCounts: Record<string, number>;
    enrolledCount: number;
    completedCount: number;
  }> => {
    return apiClient.get('/courses/stats');
  },

  toggleBookmark: async (courseId: string): Promise<{ bookmarked: boolean }> => {
    return apiClient.post<{ bookmarked: boolean }>(`/courses/${courseId}/bookmark`);
  },

  getLesson: async (lessonId: string): Promise<LessonWithNavigation> => {
    return apiClient.get<LessonWithNavigation>(`/lessons/${lessonId}`);
  },

  updateLessonProgress: async (lessonId: string, progressPercentage: number): Promise<LessonProgress> => {
    return apiClient.post<LessonProgress>(`/lessons/${lessonId}/progress`, {
      progressPercentage,
    });
  },

  completeLesson: async (
    lessonId: string
  ): Promise<{ progress: LessonProgress; nextLessonId: string | null; courseProgress: number; isCourseCompleted: boolean }> => {
    return apiClient.post(`/lessons/${lessonId}/complete`);
  },

  // Academic Subjects from Curriculum
  getAcademicSubjects: async (): Promise<AcademicSubjectOption[]> => {
    return apiClient.get<AcademicSubjectOption[]>('/courses/academic-subjects');
  },

  enrollAcademicSubject: async (subjectId: string): Promise<Course> => {
    return apiClient.post<Course>(`/courses/academic-subjects/${subjectId}/enroll`);
  },

  // Custom Course Management
  createCourse: async (payload: CreateCourseInput): Promise<Course> => {
    return apiClient.post<Course>('/courses', payload);
  },

  updateCourse: async (courseId: string, payload: UpdateCourseInput): Promise<Course> => {
    return apiClient.patch<Course>(`/courses/${courseId}`, payload);
  },

  archiveCourse: async (courseId: string): Promise<{ success: boolean; is_archived: boolean }> => {
    return apiClient.post<{ success: boolean; is_archived: boolean }>(`/courses/${courseId}/archive`);
  },

  restoreCourse: async (courseId: string): Promise<{ success: boolean; is_archived: boolean }> => {
    return apiClient.post<{ success: boolean; is_archived: boolean }>(`/courses/${courseId}/restore`);
  },

  removeCourse: async (courseId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/courses/${courseId}`);
  },

  // Chapters & Lessons
  addChapter: async (courseId: string, payload: { title: string; description?: string }): Promise<CourseChapter> => {
    return apiClient.post<CourseChapter>(`/courses/${courseId}/chapters`, payload);
  },

  addLesson: async (
    courseId: string,
    chapterId: string,
    payload: { title: string; description?: string; content?: string; estimated_minutes?: number }
  ): Promise<CourseLesson> => {
    return apiClient.post<CourseLesson>(`/courses/${courseId}/chapters/${chapterId}/lessons`, payload);
  },

  // Resources Linking
  addResource: async (
    courseId: string,
    payload: {
      title: string;
      type: 'PDF' | 'NOTES' | 'CODE' | 'LINK' | 'DOCUMENT';
      url: string;
      chapter_id?: string;
      document_id?: string;
      note_id?: string;
      size_bytes?: number;
    }
  ): Promise<CourseResource> => {
    return apiClient.post<CourseResource>(`/courses/${courseId}/resources`, payload);
  },

  removeResource: async (courseId: string, resourceId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/courses/${courseId}/resources/${resourceId}`);
  },

  // Assessments
  getAssessments: async (courseId: string): Promise<{ quizzes: any[]; flashcards: any[] }> => {
    return apiClient.get<{ quizzes: any[]; flashcards: any[] }>(`/courses/${courseId}/assessments`);
  },

  // AI Assistant
  executeAiAssistant: async (
    courseId: string,
    payload: CourseAIAssistantRequest
  ): Promise<CourseAIAssistantResponse> => {
    return apiClient.post<CourseAIAssistantResponse>(`/courses/${courseId}/ai-assistant`, payload);
  },
};
