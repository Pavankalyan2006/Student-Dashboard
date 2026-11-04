import { Router } from 'express';
import { CourseService } from '../../services/courses';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { ValidationError } from '../../core/exceptions';
import { eventBus } from '../../events/eventBus';

export const coursesRouter = Router();

// GET /api/v1/courses/categories - Available branches, semesters, difficulties
coursesRouter.get('/courses/categories', async (_req, res, next) => {
  try {
    const categories = await CourseService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/courses/stats - Global catalog counts & category metrics
coursesRouter.get('/courses/stats', optionalAuth, async (req, res, next) => {
  try {
    const studentId = req.user?.userId;
    const stats = await CourseService.getCatalogStats(studentId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/courses/academic-subjects - Available subjects from semester curriculum
coursesRouter.get('/courses/academic-subjects', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const subjects = await CourseService.getAcademicSubjects(studentId);
    res.json({
      success: true,
      data: subjects,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/academic-subjects/:subjectId/enroll - Convert/enroll curriculum subject
coursesRouter.post('/courses/academic-subjects/:subjectId/enroll', requireAuth, async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user!.userId;
    const course = await CourseService.enrollAcademicSubject(studentId, subjectId);
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/courses/search - Course search
coursesRouter.get('/courses/search', optionalAuth, async (req, res, next) => {
  try {
    const search = String(req.query.q || '');
    const studentId = req.user?.userId;
    const result = await CourseService.listCourses({ search, limit: 10 }, studentId);
    res.json({
      success: true,
      data: result.items,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/courses - Course catalog with filters, categories, status, and pagination
coursesRouter.get('/courses', optionalAuth, async (req, res, next) => {
  try {
    const { branch, semester, difficulty, category, status, is_archived, academic_year, search, sort, page, limit } =
      req.query;
    const studentId = req.user?.userId;

    const result = await CourseService.listCourses(
      {
        branch: branch ? String(branch) : undefined,
        semester: semester ? Number(semester) : undefined,
        difficulty: difficulty ? String(difficulty) : undefined,
        category: category ? String(category) : undefined,
        status: status ? String(status) : undefined,
        is_archived: is_archived === 'true' ? true : is_archived === 'false' ? false : undefined,
        academic_year: academic_year ? String(academic_year) : undefined,
        search: search ? String(search) : undefined,
        sort: sort ? String(sort) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      },
      studentId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses - Create custom course or import syllabus
coursesRouter.post('/courses', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const body = req.body;

    if (!body.title || !body.title.trim()) {
      throw new ValidationError("Parameter 'title' is required");
    }

    const course = await CourseService.createCustomCourse(studentId, body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/courses/:courseId - Course details with chapters, lessons & progress
coursesRouter.get('/courses/:courseId', optionalAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.userId;

    const course = await CourseService.getCourse(courseId, studentId);

    res.json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/courses/:courseId - Update course metadata
coursesRouter.patch('/courses/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;
    const updates = req.body;

    const updated = await CourseService.updateCourse(courseId, studentId, updates);

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/courses/:courseId - Remove course from student workspace
coursesRouter.delete('/courses/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.removeCourse(courseId, studentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/archive - Archive course
coursesRouter.post('/courses/:courseId/archive', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.archiveCourse(courseId, studentId, true);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/restore - Restore archived course
coursesRouter.post('/courses/:courseId/restore', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.archiveCourse(courseId, studentId, false);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/enroll - Enroll authenticated student
coursesRouter.post('/courses/:courseId/enroll', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const enrollment = await CourseService.enroll(studentId, courseId);

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/unenroll - Unenroll authenticated student
coursesRouter.post('/courses/:courseId/unenroll', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.unenroll(studentId, courseId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/courses/:courseId/enroll - Alternative unenroll endpoint
coursesRouter.delete('/courses/:courseId/enroll', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.unenroll(studentId, courseId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/bookmark - Toggle bookmark
coursesRouter.post('/courses/:courseId/bookmark', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.toggleBookmark(studentId, courseId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/courses/:courseId/bookmark - Remove bookmark
coursesRouter.delete('/courses/:courseId/bookmark', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.toggleBookmark(studentId, courseId);

    res.json({
      success: true,
      data: { bookmarked: false },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/chapters - Add unit/chapter
coursesRouter.post('/courses/:courseId/chapters', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      throw new ValidationError("Parameter 'title' is required");
    }

    const chapter = await CourseService.addChapter(courseId, studentId, { title, description });

    res.status(201).json({
      success: true,
      data: chapter,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/chapters/:chapterId/lessons - Add lesson
coursesRouter.post('/courses/:courseId/chapters/:chapterId/lessons', requireAuth, async (req, res, next) => {
  try {
    const { courseId, chapterId } = req.params;
    const studentId = req.user!.userId;
    const { title, description, content, estimated_minutes } = req.body;

    if (!title || !title.trim()) {
      throw new ValidationError("Parameter 'title' is required");
    }

    const lesson = await CourseService.addLesson(courseId, chapterId, studentId, {
      title,
      description,
      content,
      estimated_minutes,
    });

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/resources - Link Document, Note or resource
coursesRouter.post('/courses/:courseId/resources', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;
    const body = req.body;

    if (!body.title || !body.type || !body.url) {
      throw new ValidationError("Fields 'title', 'type', and 'url' are required");
    }

    const resource = await CourseService.addResource(courseId, studentId, body);

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/courses/:courseId/resources/:resourceId - Remove resource
coursesRouter.delete('/courses/:courseId/resources/:resourceId', requireAuth, async (req, res, next) => {
  try {
    const { courseId, resourceId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.removeResource(courseId, resourceId, studentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/courses/:courseId/assessments - Quizzes and flashcards
coursesRouter.get('/courses/:courseId/assessments', optionalAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?.userId;

    const result = await CourseService.getAssessments(courseId, studentId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/courses/:courseId/ai-assistant - Context-aware AI Teaching Assistant
coursesRouter.post('/courses/:courseId/ai-assistant', requireAuth, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user!.userId;
    const body = req.body;

    if (!body.action) {
      throw new ValidationError("Parameter 'action' is required");
    }

    const result = await CourseService.executeAiAssistant(courseId, studentId, body);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/lessons/:lessonId - Retrieve single lesson content with prev/next navigation
coursesRouter.get('/lessons/:lessonId', optionalAuth, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user?.userId;

    const lesson = await CourseService.getLesson(lessonId, studentId);

    res.json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/lessons/:lessonId/progress - Update lesson progress percentage
coursesRouter.post('/lessons/:lessonId/progress', requireAuth, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user!.userId;
    const { progressPercentage } = req.body;

    if (typeof progressPercentage !== 'number') {
      throw new ValidationError("Parameter 'progressPercentage' must be a number");
    }

    const prog = await CourseService.updateProgress(studentId, lessonId, progressPercentage);

    res.json({
      success: true,
      data: prog,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/lessons/:lessonId/complete - Mark lesson completed
coursesRouter.post('/lessons/:lessonId/complete', requireAuth, async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user!.userId;

    const result = await CourseService.completeLesson(studentId, lessonId);

    await eventBus.publish(
      'LESSON_COMPLETED',
      {
        lesson_id: lessonId,
        course_id: result.progress?.course_id,
        progress_percentage: result.courseProgress,
      },
      {
        student_id: studentId,
        resource_type: 'Lesson',
        resource_id: lessonId,
        source: 'CoursesRouter',
      }
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
