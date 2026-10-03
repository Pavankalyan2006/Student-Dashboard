import { Router } from 'express';
import { db } from '../../db/database';
import { requireAuth, requireRole } from '../../middleware/auth';
import { NotFoundError, ValidationError } from '../../core/exceptions';

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
