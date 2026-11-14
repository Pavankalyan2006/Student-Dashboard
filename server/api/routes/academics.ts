import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AcademicRecordsService } from '../../services/academicRecordsService';

export const academicsRouter = Router();

const fail = (res: Response, err: any, fallback: string) => {
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
};

// GET /api/v1/academics/me — the student's grades, CGPA summary and attendance.
academicsRouter.get('/academics/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: AcademicRecordsService.view(req.user!.userId) });
  } catch (err) {
    fail(res, err, 'Your academic record could not be loaded.');
  }
});

// PUT /api/v1/academics/me — replaces the record with the validated version of what the page sends.
academicsRouter.put('/academics/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: AcademicRecordsService.save(req.user!.userId, req.body) });
  } catch (err) {
    fail(res, err, 'Your academic record could not be saved.');
  }
});

// POST /api/v1/academics/me/attendance/:subjectId/mark  { present: boolean }
academicsRouter.post('/academics/me/attendance/:subjectId/mark', requireAuth, (req: Request, res: Response) => {
  try {
    if (typeof req.body?.present !== 'boolean') return res.status(400).json({ success: false, message: 'Say whether you were present.' });
    res.json({ success: true, data: AcademicRecordsService.mark(req.user!.userId, req.params.subjectId, req.body.present) });
  } catch (err) {
    fail(res, err, 'Attendance could not be updated.');
  }
});
