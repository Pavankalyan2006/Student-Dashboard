import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { CourseService } from '../../server/services/courses';
import {
  SEED_100_COURSES,
  SEED_100_CHAPTERS,
  SEED_100_LESSONS,
  TOTAL_SEED_COURSES_COUNT,
  TOTAL_SEED_CHAPTERS_COUNT,
  TOTAL_SEED_LESSONS_COUNT,
} from '../../server/db/seedCourses';

describe('100+ Complete Engineering Courses Catalog Suite', () => {
  const TEST_STUDENT_ID = 'std_test_catalog_100';

  beforeEach(async () => {
    await db.initialize();
  });

  describe('1. Catalog Scale & Global Counts', () => {
    it('has at least 100 distinct courses in the persistent catalog', async () => {
      const allCourses = await db.getAllCourses();
      const published = allCourses.filter((c) => c.is_published && !c.is_custom);
      expect(published.length).toBeGreaterThanOrEqual(100);
      expect(TOTAL_SEED_COURSES_COUNT).toBe(100);
    });

    it('has at least 400 total modules and 1,200 total lessons in the seed catalog', () => {
      expect(TOTAL_SEED_CHAPTERS_COUNT).toBeGreaterThanOrEqual(400);
      expect(TOTAL_SEED_LESSONS_COUNT).toBeGreaterThanOrEqual(1200);
    });

    it('guarantees unique IDs, unique slugs, and unique course codes across all 100 courses', () => {
      const ids = new Set<string>();
      const codes = new Set<string>();
      const slugs = new Set<string>();

      for (const course of SEED_100_COURSES) {
        expect(ids.has(course.id)).toBe(false);
        ids.add(course.id);

        expect(codes.has(course.code)).toBe(false);
        codes.add(course.code);

        expect(slugs.has(course.slug)).toBe(false);
        slugs.add(course.slug);
      }

      expect(ids.size).toBe(100);
      expect(codes.size).toBe(100);
      expect(slugs.size).toBe(100);
    });
  });

  describe('2. Exact Category Distribution', () => {
    it('contains all 10 mandated categories with exact course counts', async () => {
      const allCourses = await db.getAllCourses();
      const catalog = allCourses.filter((c) => !c.is_custom);

      const categoryCounts: Record<string, number> = {};
      for (const c of catalog) {
        if (c.category) {
          categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        }
      }

      // Check the 10 mandated categories
      expect(categoryCounts['Programming Fundamentals']).toBe(10);
      expect(categoryCounts['Web Development']).toBe(10);
      expect(categoryCounts['Computer Science Core']).toBe(15);
      expect(categoryCounts['Artificial Intelligence and Machine Learning']).toBe(15);
      expect(categoryCounts['Data Science and Analytics']).toBe(10);
      expect(categoryCounts['Cloud, DevOps, and Software Tools']).toBe(10);
      expect(categoryCounts['Electronics and Communication Engineering']).toBe(10);
      expect(categoryCounts['Electrical Engineering']).toBe(5);
      expect(categoryCounts['Mechanical and Civil Engineering']).toBe(5);
      expect(categoryCounts['Mathematics, Aptitude, and Career Skills']).toBe(10);
    });
  });

  describe('3. Curriculum Structure & Content Quality', () => {
    it('every course has at least 4 modules and every module has at least 3 lessons', async () => {
      for (const course of SEED_100_COURSES) {
        const details = await db.getCourseById(course.id);
        expect(details).not.toBeNull();
        expect(details!.chapters.length).toBeGreaterThanOrEqual(4);

        for (const chapter of details!.chapters) {
          expect(chapter.lessons.length).toBeGreaterThanOrEqual(3);
          for (const lesson of chapter.lessons) {
            expect(lesson.title.trim().length).toBeGreaterThan(3);
            expect(lesson.description.trim().length).toBeGreaterThan(5);
            expect(lesson.content.trim().length).toBeGreaterThan(100);
            // Verify markdown structure contains key sections
            expect(lesson.content).toContain('## 1. Executive Summary & Foundational Concepts');
            expect(lesson.content).toContain('## 2. Technical Architecture & Invariant Formulation');
            expect(lesson.content).toContain('## 3. Real-World Engineering Application & Case Study');
            expect(lesson.content).toContain('## 4. Key Takeaways & Exam Revision Points');
            expect(lesson.content).toContain('## 5. Knowledge-Check & Practice Assessment');
          }
        }
      }
    });

    it('every course contains learning objectives, skills, and prerequisites metadata', () => {
      for (const course of SEED_100_COURSES) {
        expect(course.learning_objectives).toBeDefined();
        expect(course.learning_objectives!.length).toBeGreaterThanOrEqual(2);
        expect(course.skills.length).toBeGreaterThanOrEqual(2);
        expect(course.prerequisites).toBeDefined();
        expect(course.estimated_minutes).toBeGreaterThan(0);
        expect(course.short_description.length).toBeGreaterThan(10);
        expect(course.description.length).toBeGreaterThan(20);
      }
    });
  });

  describe('4. Search, Filtering, Pagination & Catalog Stats API', () => {
    it('searches courses by title, topic skills, code, and keywords', async () => {
      // Search by code
      const codeRes = await db.getCourses({ search: 'PRG101' });
      expect(codeRes.items.length).toBeGreaterThanOrEqual(1);
      expect(codeRes.items[0].code).toBe('PRG101');

      // Search by topic
      const pyRes = await db.getCourses({ search: 'Python' });
      expect(pyRes.items.length).toBeGreaterThanOrEqual(2);

      // Search by algorithm / DAA
      const daaRes = await db.getCourses({ search: 'Algorithms' });
      expect(daaRes.items.length).toBeGreaterThanOrEqual(1);
    });

    it('filters courses by category accurately', async () => {
      const aiRes = await db.getCourses({ category: 'Artificial Intelligence and Machine Learning' });
      expect(aiRes.items.length).toBe(12); // First page (limit 12)
      expect(aiRes.total).toBe(15);
      expect(aiRes.items.every((c) => c.category === 'Artificial Intelligence and Machine Learning')).toBe(true);
    });

    it('filters courses by difficulty and branch', async () => {
      const advRes = await db.getCourses({ difficulty: 'Advanced' });
      expect(advRes.total).toBeGreaterThan(0);
      expect(advRes.items.every((c) => c.difficulty === 'Advanced')).toBe(true);

      const eceRes = await db.getCourses({ branch: 'ECE' });
      expect(eceRes.total).toBeGreaterThanOrEqual(10);
      expect(eceRes.items.every((c) => c.branch === 'ECE')).toBe(true);
    });

    it('paginates 100+ courses across multiple pages', async () => {
      const page1 = await db.getCourses({ page: 1, limit: 12 });
      expect(page1.items.length).toBe(12);
      expect(page1.totalPages).toBeGreaterThanOrEqual(9);

      const page2 = await db.getCourses({ page: 2, limit: 12 });
      expect(page2.items.length).toBe(12);
      expect(page2.items[0].id).not.toBe(page1.items[0].id);
    });

    it('returns catalog stats with accurate category and level breakdowns', async () => {
      const stats = await CourseService.getCatalogStats();
      expect(stats.totalCourses).toBeGreaterThanOrEqual(100);
      expect(stats.totalModules).toBeGreaterThanOrEqual(400);
      expect(stats.totalLessons).toBeGreaterThanOrEqual(1200);
      expect(stats.categoryCounts['Programming Fundamentals']).toBe(10);
      expect(stats.categoryCounts['Web Development']).toBe(10);
    });
  });

  describe('5. Enrollment, Unenrollment & Progress Lifecycle', () => {
    it('enrolls and unenrolls student idempotently without altering catalog', async () => {
      const courseId = 'crs_cat_006'; // Python Programming Fundamentals

      // Enroll
      const enrollment = await CourseService.enroll(TEST_STUDENT_ID, courseId);
      expect(enrollment.course_id).toBe(courseId);
      expect(enrollment.status).toBe('ACTIVE');

      // Verify course detail reflects enrolled state
      const details = await CourseService.getCourse(courseId, TEST_STUDENT_ID);
      expect(details.enrollment).not.toBeNull();
      expect(details.is_enrolled).toBe(true);

      // Verify in enrolled list
      const enrolledRes = await db.getCourses({ status: 'ENROLLED' }, TEST_STUDENT_ID);
      expect(enrolledRes.items.some((c) => c.id === courseId)).toBe(true);

      // Unenroll
      const unenrollRes = await CourseService.unenroll(TEST_STUDENT_ID, courseId);
      expect(unenrollRes.success).toBe(true);

      // Verify no longer enrolled
      const postUnenroll = await CourseService.getCourse(courseId, TEST_STUDENT_ID);
      expect(postUnenroll.enrollment).toBeNull();
    });

    it('persists lesson progress and calculates overall course completion', async () => {
      const courseId = 'crs_cat_011'; // HTML and Semantic Web
      await CourseService.enroll(TEST_STUDENT_ID, courseId);

      const details = await CourseService.getCourse(courseId, TEST_STUDENT_ID);
      const firstLesson = details.chapters[0].lessons[0];

      // Complete first lesson
      const compRes = await CourseService.completeLesson(TEST_STUDENT_ID, firstLesson.id);
      expect(compRes.progress.status).toBe('COMPLETED');
      expect(compRes.progress.progress_percentage).toBe(100);

      // Check course progress updated
      const updatedDetails = await CourseService.getCourse(courseId, TEST_STUDENT_ID);
      expect(updatedDetails.completed_lessons).toBe(1);
      expect(updatedDetails.progress_percentage).toBeGreaterThan(0);
    });
  });

  describe('6. Idempotency & Database Stability', () => {
    it('rerunning database initialize does not create duplicate courses', async () => {
      const beforeCount = (await db.getAllCourses()).length;

      // Reinitialize database
      await db.initialize();

      const afterCount = (await db.getAllCourses()).length;
      expect(afterCount).toBe(beforeCount);
    });

    it('preserves student custom courses and custom chapters during reseed', async () => {
      const custom = await db.createCustomCourse(TEST_STUDENT_ID, {
        title: 'Custom Advanced Robotics Capstone',
        code: 'ROB499',
        branch: 'Mechanical',
        semester: 8,
        description: 'Student customized research project course',
      });

      expect(custom.is_custom).toBe(true);
      expect(custom.student_id).toBe(TEST_STUDENT_ID);

      // Reseed
      await db.initialize();

      const retrieved = await db.getCourseById(custom.id, TEST_STUDENT_ID);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.title).toBe('Custom Advanced Robotics Capstone');
      expect(retrieved!.is_custom).toBe(true);
    });
  });
});
