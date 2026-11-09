import { Router } from 'express';
import { DashboardService } from '../../services/dashboard';
import { requireAuth } from '../../middleware/auth';
import { StudentProfileService } from '../../services/studentProfile/studentProfileService';
import { ValidationError } from '../../core/exceptions';

export const dashboardRouter = Router();

// GET /api/v1/dashboard - Primary aggregation endpoint
dashboardRouter.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    // Phase 5: academic details, goals and completion from the central profile.
    const { profile, completion } = await StudentProfileService.getProfile(studentId);
    const student_profile = {
      ...(await StudentProfileService.getModuleContext(studentId, 'dashboard')),
      completion_percentage: completion.overall_percentage,
      incomplete_sections: completion.incomplete_sections,
      onboarding_completed: profile.account.onboarding.completed,
    };

    res.json({
      success: true,
      data: { ...data, student_profile },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/dashboard/today/:taskId - Toggle task completion state
dashboardRouter.patch('/dashboard/today/:taskId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { taskId } = req.params;

    if (!taskId) {
      throw new ValidationError("Parameter 'taskId' is required");
    }

    const updatedTask = await DashboardService.toggleTodayTask(studentId, taskId);

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/progress - Sub-endpoint
dashboardRouter.get('/dashboard/progress', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    res.json({
      success: true,
      data: {
        summary: data.summary,
        course_progress: data.course_progress,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/today - Sub-endpoint
dashboardRouter.get('/dashboard/today', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    res.json({
      success: true,
      data: data.today_plan,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/recommendations - Sub-endpoint
dashboardRouter.get('/dashboard/recommendations', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    res.json({
      success: true,
      data: data.recommendations,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/activity - Sub-endpoint
dashboardRouter.get('/dashboard/activity', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    res.json({
      success: true,
      data: data.recent_activity,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/projects - Sub-endpoint
dashboardRouter.get('/dashboard/projects', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    res.json({
      success: true,
      data: data.projects,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/dashboard/bookmarks - Sub-endpoint
dashboardRouter.get('/dashboard/bookmarks', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const data = await DashboardService.getStudentDashboard(studentId);
    res.json({
      success: true,
      data: data.bookmarks,
    });
  } catch (err) {
    next(err);
  }
});
