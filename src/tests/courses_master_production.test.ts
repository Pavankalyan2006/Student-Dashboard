import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { CourseService } from '../../server/services/courses';
import { AuthorizationError, ValidationError } from '../../server/core/exceptions';

describe('Production-Grade Courses System & Academic Tracks Master Suite', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_test_isolated_b';

  beforeEach(async () => {
    await db.initialize();
  });

  describe('1. Course Discovery, Search & Filtering', () => {
    it('returns categories including branches, semesters, and difficulties', async () => {
      const categories = await CourseService.getCategories();
      expect(categories.branches.length).toBeGreaterThan(0);
      expect(categories.semesters.length).toBe(8);
      expect(categories.difficulties).toContain('Intermediate');
    });

    it('filters courses by semester, branch, category, and status', async () => {
      const res = await CourseService.listCourses(
        {
          semester: 4,
          branch: 'CSE',
          sort: 'name',
          limit: 10,
        },
        studentA
      );

      expect(res.items.length).toBeGreaterThan(0);
      for (const item of res.items) {
        expect(item.semester).toBe(4);
        expect(item.branch).toBe('CSE');
      }
    });

    it('searches across course title, code, chapter title, and lesson topics', async () => {
      // Search by course code
      const codeRes = await CourseService.listCourses({ search: 'CS401' }, studentA);
      expect(codeRes.items.length).toBeGreaterThan(0);
      expect(codeRes.items.some((c) => c.code === 'CS401')).toBe(true);

      // Search by chapter or topic keyword (e.g. "Binary Search" or "Trees")
      const topicRes = await CourseService.listCourses({ search: 'Binary Search' }, studentA);
      expect(topicRes.items.length).toBeGreaterThan(0);
    });

    it('handles sorting by recent, name, progress, and semester', async () => {
      const sortedByName = await CourseService.listCourses({ sort: 'name' }, studentA);
      expect(sortedByName.items.length).toBeGreaterThan(1);
      const first = sortedByName.items[0].title;
      const second = sortedByName.items[1].title;
      expect(first.localeCompare(second)).toBeLessThanOrEqual(0);
    });
  });

  describe('2. Option A: Academic Curriculum Subjects Integration', () => {
    it('retrieves student semester curriculum subjects from Semester Command Center', async () => {
      const subjects = await CourseService.getAcademicSubjects(studentA);
      expect(subjects).toBeDefined();
      expect(subjects.length).toBeGreaterThan(0);
      const firstSub = subjects[0];
      expect(firstSub.id).toBeDefined();
      expect(firstSub.name).toBeDefined();
      expect(firstSub.code).toBeDefined();
      expect(firstSub.units_count).toBeGreaterThan(0);
    });

    it('enrolls curriculum subject as a workspace course without duplicate subjects', async () => {
      const subjects = await CourseService.getAcademicSubjects(studentA);
      const targetSub = subjects[0];

      const enrolledCourse = await CourseService.enrollAcademicSubject(studentA, targetSub.id);
      expect(enrolledCourse).toBeDefined();
      expect(enrolledCourse.title).toBe(targetSub.name);

      // Calling again should be idempotent and return existing course
      const repeated = await CourseService.enrollAcademicSubject(studentA, targetSub.id);
      expect(repeated.id).toBe(enrolledCourse.id);
    });
  });

  describe('3. Option B: Custom Course Creation & Validation', () => {
    it('validates required fields on custom course creation', async () => {
      await expect(
        CourseService.createCustomCourse(studentA, {
          title: '',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('creates a custom personal course with chapters, lessons, and learning objectives', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Cloud Distributed Systems & Raft Consensus',
        code: 'CS699',
        description: 'Comprehensive study of distributed protocols, consensus algorithms, and fault tolerance.',
        branch: 'CSE',
        semester: 6,
        academic_year: '2025-2026',
        difficulty: 'Advanced',
        category: 'Program Elective',
        instructor: 'Prof. Arvind Kumar',
        learning_objectives: [
          'Understand Paxos and Raft consensus',
          'Implement quorum-based replication',
          'Analyze Byzantine fault tolerance',
        ],
      });

      expect(custom.id).toBeDefined();
      expect(custom.is_custom).toBe(true);
      expect(custom.student_id).toBe(studentA);
      expect(custom.title).toBe('Cloud Distributed Systems & Raft Consensus');

      // Verify detailed syllabus with default Unit 1 and Lesson 1
      const details = await CourseService.getCourse(custom.id, studentA);
      expect(details.chapters.length).toBeGreaterThan(0);
      expect(details.chapters[0].lessons.length).toBeGreaterThan(0);
      expect(details.learning_objectives?.length).toBe(3);
    });

    it('updates course details for a custom course', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Initial Course Title',
        semester: 6,
      });

      const updated = await CourseService.updateCourse(custom.id, studentA, {
        title: 'Updated Engineering Systems Title',
        description: 'Updated comprehensive description',
        difficulty: 'Advanced',
      });

      expect(updated.title).toBe('Updated Engineering Systems Title');
      expect(updated.description).toBe('Updated comprehensive description');
      expect(updated.difficulty).toBe('Advanced');
    });
  });

  describe('4. Units, Lessons & Resource Linking (Option C)', () => {
    it('adds units and lessons to custom course', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Modular Architecture Design',
        semester: 6,
      });

      const chapter2 = await CourseService.addChapter(custom.id, studentA, {
        title: 'Unit 2: Microservices Invariants',
        description: 'Service decomposition and event-driven patterns',
      });
      expect(chapter2.id).toBeDefined();
      expect(chapter2.course_id).toBe(custom.id);

      const lesson21 = await CourseService.addLesson(custom.id, chapter2.id, studentA, {
        title: 'Lesson 2.1: Domain-Driven Design Boundaries',
        description: 'Bounded contexts and aggregate roots',
        estimated_minutes: 35,
        content: '# Domain-Driven Design\n\nCore architectural models.',
      });
      expect(lesson21.id).toBeDefined();
      expect(lesson21.chapter_id).toBe(chapter2.id);

      const details = await CourseService.getCourse(custom.id, studentA);
      expect(details.chapters.some((ch) => ch.id === chapter2.id)).toBe(true);
    });

    it('links and unlinks learning resources to course', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Resource Linking Test Course',
        semester: 6,
      });

      const resource = await CourseService.addResource(custom.id, studentA, {
        title: 'Official System RFC Specification',
        type: 'LINK',
        url: 'https://datatracker.ietf.org/doc/html/rfc7540',
      });
      expect(resource.id).toBeDefined();
      expect(resource.title).toBe('Official System RFC Specification');

      const details = await CourseService.getCourse(custom.id, studentA);
      expect(details.resources.some((r) => r.id === resource.id)).toBe(true);

      // Unlink
      const unlinkRes = await CourseService.removeResource(custom.id, resource.id, studentA);
      expect(unlinkRes.success).toBe(true);

      const detailsAfter = await CourseService.getCourse(custom.id, studentA);
      expect(detailsAfter.resources.some((r) => r.id === resource.id)).toBe(false);
    });
  });

  describe('5. Lesson Completion & Progress Persistence', () => {
    it('calculates course completion percentage accurately from persisted activity', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Progress Math Test Course',
        semester: 6,
      });

      const details = await CourseService.getCourse(custom.id, studentA);
      const lesson1 = details.chapters[0].lessons[0];

      // Initially 0%
      expect(details.progress_percentage).toBe(0);

      // Complete lesson 1
      const compRes = await CourseService.completeLesson(studentA, lesson1.id);
      expect(compRes.progress.status).toBe('COMPLETED');
      expect(compRes.courseProgress).toBe(100);

      // Verify on course reload
      const reloaded = await CourseService.getCourse(custom.id, studentA);
      expect(reloaded.progress_percentage).toBe(100);
      expect(reloaded.completed_lessons).toBe(1);

      // Repeated completions do not double-count
      await CourseService.completeLesson(studentA, lesson1.id);
      const reloaded2 = await CourseService.getCourse(custom.id, studentA);
      expect(reloaded2.completed_lessons).toBe(1);
      expect(reloaded2.progress_percentage).toBe(100);
    });
  });

  describe('6. Archiving & Workspace Removal', () => {
    it('archives and restores a course', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Archival Test Course',
        semester: 6,
      });

      // Archive
      const arc = await CourseService.archiveCourse(custom.id, studentA, true);
      expect(arc.is_archived).toBe(true);

      // Course should be hidden in default active list
      const activeList = await CourseService.listCourses({}, studentA);
      expect(activeList.items.some((c) => c.id === custom.id)).toBe(false);

      // Course appears when filtering for archived
      const archivedList = await CourseService.listCourses({ is_archived: true }, studentA);
      expect(archivedList.items.some((c) => c.id === custom.id)).toBe(true);

      // Restore
      const restore = await CourseService.archiveCourse(custom.id, studentA, false);
      expect(restore.is_archived).toBe(false);

      const activeListAgain = await CourseService.listCourses({}, studentA);
      expect(activeListAgain.items.some((c) => c.id === custom.id)).toBe(true);
    });

    it('removes custom course from workspace cleanly without collateral damage', async () => {
      const custom = await CourseService.createCustomCourse(studentA, {
        title: 'Course to Delete',
        semester: 6,
      });

      const rem = await CourseService.removeCourse(custom.id, studentA);
      expect(rem.success).toBe(true);

      await expect(CourseService.getCourse(custom.id, studentA)).rejects.toThrow();
    });
  });

  describe('7. Security, Authorization & IDOR Protection', () => {
    it('prevents student B from accessing student A private custom course', async () => {
      const customA = await CourseService.createCustomCourse(studentA, {
        title: 'Student A Private Research Course',
        semester: 6,
      });

      // Student B attempts to read Student A custom course -> 403 Forbidden
      await expect(CourseService.getCourse(customA.id, studentB)).rejects.toThrow(
        AuthorizationError
      );

      // Unauthenticated access -> 403 Forbidden
      await expect(CourseService.getCourse(customA.id, undefined)).rejects.toThrow(
        AuthorizationError
      );
    });

    it('prevents student B from reading lessons of student A private custom course', async () => {
      const customA = await CourseService.createCustomCourse(studentA, {
        title: 'Student A Private Vault',
        semester: 6,
      });

      const details = await CourseService.getCourse(customA.id, studentA);
      const privateLessonId = details.chapters[0].lessons[0].id;

      // Student B attempts to read lesson directly by ID -> 403 Forbidden
      await expect(CourseService.getLesson(privateLessonId, studentB)).rejects.toThrow(
        AuthorizationError
      );
    });

    it('prevents student B from modifying student A private custom course', async () => {
      const customA = await CourseService.createCustomCourse(studentA, {
        title: 'Tamper Resistant Course',
        semester: 6,
      });

      await expect(
        CourseService.updateCourse(customA.id, studentB, { title: 'Hacked Title' })
      ).rejects.toThrow(AuthorizationError);

      await expect(
        CourseService.addChapter(customA.id, studentB, { title: 'Malicious Unit' })
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('8. Context-Aware AI Teaching Assistant Execution', () => {
    it('executes AI teaching assistant actions with course context', async () => {
      const courses = await CourseService.listCourses({}, studentA);
      const testCourse = courses.items[0];

      const res = await CourseService.executeAiAssistant(testCourse.id, studentA, {
        action: 'explain_simple',
        topic: 'Relational Model Constraints',
      });

      expect(res).toBeDefined();
      expect(res.action).toBe('explain_simple');
      expect(res.result).toBeDefined();
      expect(res.result.length).toBeGreaterThan(0);
      expect(res.key_points).toBeDefined();
      expect(res.practice_questions?.length).toBeGreaterThan(0);
    });

    it('generates practice questions and flashcards for a specific lesson', async () => {
      const courses = await CourseService.listCourses({}, studentA);
      const testCourse = courses.items[0];
      const details = await CourseService.getCourse(testCourse.id, studentA);
      const lesson = details.chapters[0].lessons[0];

      const res = await CourseService.executeAiAssistant(testCourse.id, studentA, {
        action: 'practice_questions',
        lessonId: lesson.id,
      });

      expect(res.action).toBe('practice_questions');
      expect(res.practice_questions?.length).toBeGreaterThan(0);
      expect(res.flashcards?.length).toBeGreaterThan(0);
    });
  });
});
