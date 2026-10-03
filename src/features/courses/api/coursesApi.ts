import { apiClient } from '../../../api/client';
import {
  CourseCardData,
  CourseWithDetails,
  LessonWithNavigation,
  CourseEnrollment,
  LessonProgress,
} from '../types/courses';

export interface CourseFilterParams {
  branch?: string;
  semester?: number;
  difficulty?: string;
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
};
