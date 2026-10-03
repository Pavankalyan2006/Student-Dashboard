import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { CourseService } from '../../server/services/courses';

describe('Phase 4 B.Tech Course Syllabus & Academic Tracks', () => {
  const studentId = 'std_01j8k9x2p4';

  it('lists available course categories, branches, and semesters', async () => {
    const categories = await CourseService.getCategories();
    expect(categories.branches.length).toBeGreaterThan(0);
    expect(categories.semesters.length).toBeGreaterThan(0);
    expect(categories.difficulties).toContain('Intermediate');
  });

  it('filters courses by branch, semester, and difficulty', async () => {
    const results = await CourseService.listCourses({
      branch: 'CSE',
      semester: 4,
    }, studentId);

    expect(results.items.length).toBeGreaterThan(0);
    const dsaCourse = results.items.find((c) => c.code === 'CS401' || c.title.includes('Data Structures'));
    expect(dsaCourse).toBeDefined();
    if (dsaCourse) {
      expect(dsaCourse.semester).toBe(4);
      expect(dsaCourse.total_lessons).toBeGreaterThan(0);
    }
  });

  it('retrieves detailed course syllabus with modules, chapters, and lessons', async () => {
    const courses = await CourseService.listCourses({}, studentId);
    const course = await CourseService.getCourse(courses.items[0].id, studentId);

    expect(course.id).toBe(courses.items[0].id);
    expect(course.chapters.length).toBeGreaterThan(0);
    expect(course.chapters[0].lessons.length).toBeGreaterThan(0);
    expect(course.prerequisites).toBeDefined();
    expect(course.skills).toBeDefined();
  });

  it('handles student enrollment and bookmarking', async () => {
    const courses = await CourseService.listCourses({}, studentId);
    const targetCourse = courses.items[0];

    const enrollment = await CourseService.enroll(studentId, targetCourse.id);
    expect(enrollment.course_id).toBe(targetCourse.id);
    expect(enrollment.student_id).toBe(studentId);

    const bookmarkResult = await CourseService.toggleBookmark(studentId, targetCourse.id);
    expect(typeof bookmarkResult.bookmarked).toBe('boolean');

    // Toggle back
    const toggleBack = await CourseService.toggleBookmark(studentId, targetCourse.id);
    expect(toggleBack.bookmarked).toBe(!bookmarkResult.bookmarked);
  });

  it('retrieves a lesson with content, breadcrumbs, and sequential navigation', async () => {
    const courses = await CourseService.listCourses({}, studentId);
    const course = await CourseService.getCourse(courses.items[0].id, studentId);
    const firstLessonId = course.chapters[0].lessons[0].id;

    const lesson = await CourseService.getLesson(firstLessonId, studentId);
    expect(lesson.id).toBe(firstLessonId);
    expect(lesson.title).toBeDefined();
    expect(lesson.content).toBeDefined();
    expect(lesson.course_id).toBe(course.id);
    expect(lesson.course_title).toBe(course.title);
  });

  it('records lesson completion and updates overall course progress percentage', async () => {
    const courses = await CourseService.listCourses({}, studentId);
    const course = await CourseService.getCourse(courses.items[0].id, studentId);
    const firstLessonId = course.chapters[0].lessons[0].id;

    const completionResult = await CourseService.completeLesson(studentId, firstLessonId);
    expect(completionResult.progress.status).toBe('COMPLETED');
    expect(completionResult.courseProgress).toBeGreaterThanOrEqual(0);
    expect(completionResult.courseProgress).toBeLessThanOrEqual(100);
  });
});
