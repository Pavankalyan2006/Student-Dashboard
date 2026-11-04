import { Router } from 'express';
import { db } from '../../db/database';
import { requireAuth, requireRole } from '../../middleware/auth';
import { NotFoundError, ValidationError } from '../../core/exceptions';
import { ProfileService } from '../../services/profileService';
import { OnboardingService } from '../../services/onboardingService';
import { StudentContextEngine } from '../../ai/studentContextEngine';

export const studentsRouter = Router();

// Current student profile
studentsRouter.get('/students/me', requireAuth, async (req, res, next) => {
  try {
    const student = await db.getStudentById(req.user!.userId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    res.json({
      success: true,
      data: db.toSafeStudent(student),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/student/profile
studentsRouter.get('/student/profile', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const profile = await ProfileService.getProfile(studentId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/student/profile
studentsRouter.patch('/student/profile', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ProfileService.updateProfile(studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/student/academics
studentsRouter.get('/student/academics', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const [education, semester] = await Promise.all([
      OnboardingService.getEducationProfile(studentId),
      OnboardingService.getSemesterSyllabus(studentId),
    ]);
    res.json({ success: true, data: { education, semester } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/student/academics
studentsRouter.put('/student/academics', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    if (req.body.education) {
      await OnboardingService.saveEducationProfile(studentId, req.body.education);
    }
    if (req.body.semester) {
      await OnboardingService.saveSemesterSyllabus(studentId, req.body.semester);
    }
    res.json({ success: true, message: 'Academic profile updated' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/student/skills
studentsRouter.get('/student/skills', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const skills = await OnboardingService.getSkillsAssessment(studentId);
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/student/skills
studentsRouter.put('/student/skills', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const skills = await OnboardingService.saveSkillsAssessment(studentId, req.body);
    res.json({ success: true, data: skills });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/student/preferences
studentsRouter.get('/student/preferences', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const prefs = await OnboardingService.getLearningPreferences(studentId);
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/student/preferences
studentsRouter.put('/student/preferences', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const prefs = await OnboardingService.saveLearningPreferences(studentId, req.body);
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/student/onboarding
studentsRouter.get('/student/onboarding', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const status = await OnboardingService.getOnboardingStatus(studentId);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/student/onboarding
studentsRouter.patch('/student/onboarding', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { step_id, completed, skipped } = req.body;
    if (!step_id) throw new ValidationError('step_id is required');
    const status = await OnboardingService.updateOnboardingStep(studentId, step_id, completed ?? false, skipped ?? false);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/student/onboarding/complete
studentsRouter.post('/student/onboarding/complete', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const status = await OnboardingService.completeOnboarding(studentId);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/student/context (Authoritative Centralized Student Context Endpoint)
studentsRouter.get('/student/context', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const context = await StudentContextEngine.buildStudentContext(studentId, req.query as any);
    res.json({ success: true, data: context });
  } catch (err) {
    next(err);
  }
});

// Admin only: list all students
studentsRouter.get('/students', requireAuth, requireRole('SUPER_ADMIN'), async (_req, res, next) => {
  try {
    const students = await db.getAllStudents();
    res.json({
      success: true,
      data: students,
    });
  } catch (err) {
    next(err);
  }
});

// Admin only: toggle student activation status
studentsRouter.patch('/students/:id/status', requireAuth, requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      throw new ValidationError("Parameter 'is_active' must be a boolean");
    }

    const updated = await db.updateStudentStatus(id, is_active);
    if (!updated) {
      throw new NotFoundError(`Student with ID '${id}' not found`);
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});
