import { db } from '../db/database';
import {
  CourseWithDetails,
  CourseCardData,
  LessonWithNavigation,
  CourseEnrollment,
  LessonProgress,
} from '../models/types';
import { NotFoundError, AuthenticationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class CourseService {
  public static async getCategories(): Promise<{ branches: string[]; semesters: number[]; difficulties: string[] }> {
    return db.getCourseCategories();
  }

  public static async listCourses(
    filters: {
      branch?: string;
      semester?: number;
      difficulty?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    },
    studentId?: string
  ): Promise<{ items: CourseCardData[]; total: number; page: number; limit: number; totalPages: number }> {
    return db.getCourses(filters, studentId);
  }

  public static async getCourse(courseId: string, studentId?: string): Promise<CourseWithDetails> {
    const course = await db.getCourseById(courseId, studentId);
    if (!course) {
      throw new NotFoundError(`Course '${courseId}' not found`);
    }
    return course;
  }

  public static async enroll(studentId: string, courseId: string): Promise<CourseEnrollment> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required to enroll');
    }
    return db.enrollStudentInCourse(studentId, courseId);
  }

  public static async toggleBookmark(studentId: string, courseId: string): Promise<{ bookmarked: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required to bookmark');
    }
    return db.toggleCourseBookmark(studentId, courseId);
  }

  public static async getLesson(lessonId: string, studentId?: string): Promise<LessonWithNavigation> {
    const lesson = await db.getLessonById(lessonId, studentId);
    if (!lesson) {
      throw new NotFoundError(`Lesson '${lessonId}' not found`);
    }
    return lesson;
  }

  public static async updateProgress(
    studentId: string,
    lessonId: string,
    progressPercentage: number
  ): Promise<LessonProgress> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.updateLessonProgress(studentId, lessonId, progressPercentage);
  }

  public static async completeLesson(
    studentId: string,
    lessonId: string
  ): Promise<{ progress: LessonProgress; nextLessonId: string | null; courseProgress: number; isCourseCompleted: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    logger.info(`Student ${studentId} completing lesson ${lessonId}`);
    return db.completeLesson(studentId, lessonId);
  }
}
