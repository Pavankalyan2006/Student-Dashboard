import { Router } from 'express';
import { CourseService } from '../../services/courses';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { ValidationError } from '../../core/exceptions';

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

// GET /api/v1/courses - Course catalog with filters and pagination
coursesRouter.get('/courses', optionalAuth, async (req, res, next) => {
  try {
    const { branch, semester, difficulty, search, sort, page, limit } = req.query;
    const studentId = req.user?.userId;

    const result = await CourseService.listCourses(
      {
        branch: branch ? String(branch) : undefined,
        semester: semester ? Number(semester) : undefined,
        difficulty: difficulty ? String(difficulty) : undefined,
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

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
