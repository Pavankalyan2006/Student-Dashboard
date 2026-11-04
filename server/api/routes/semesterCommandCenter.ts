// server/api/routes/semesterCommandCenter.ts
// Express routes for the Academic Semester Command Center

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { semesterCommandCenterService } from '../../services/semesterCommandCenterService';

export const semesterCommandCenterRouter = Router();

// 1. Semester Overview & Dashboard Data
semesterCommandCenterRouter.get('/semester/overview', async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.userId;
    const data = semesterCommandCenterService.getOverview(studentId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 2. Semester Config
semesterCommandCenterRouter.get('/semester/config', async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.userId;
    const overview = semesterCommandCenterService.getOverview(studentId);
    res.json({ success: true, data: overview.config });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.patch('/semester/config', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = semesterCommandCenterService.updateConfig(req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 3. Subjects & Syllabus
semesterCommandCenterRouter.get('/semester/subjects', async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.userId;
    const subjects = semesterCommandCenterService.getSubjects(studentId);
    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/subjects', requireAuth, async (req: Request, res: Response) => {
  try {
    const subject = semesterCommandCenterService.addSubject(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.get('/semester/subjects/:subjectId', async (req: Request, res: Response) => {
  try {
    const subject = semesterCommandCenterService.getSubjectById(req.params.subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.put('/semester/subjects/:subjectId/units', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = semesterCommandCenterService.updateSubjectUnits(req.params.subjectId, req.body.units);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 4. Academic Events & Calendar
semesterCommandCenterRouter.get('/semester/events', async (_req: Request, res: Response) => {
  try {
    const events = semesterCommandCenterService.getEvents();
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const event = semesterCommandCenterService.addEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 5. Semester Study Stream
semesterCommandCenterRouter.get('/semester/stream', async (req: Request, res: Response) => {
  try {
    const subjectId = req.query.subject_id as string | undefined;
    const nodes = semesterCommandCenterService.getStudyStream(subjectId);
    res.json({ success: true, data: nodes });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.patch('/semester/stream/:nodeId/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = semesterCommandCenterService.updateStreamNodeStatus(req.params.nodeId, req.body.status);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 6. Slip Tests
semesterCommandCenterRouter.get('/semester/slip-tests', async (_req: Request, res: Response) => {
  try {
    const tests = semesterCommandCenterService.getSlipTests();
    res.json({ success: true, data: tests });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/slip-tests', requireAuth, async (req: Request, res: Response) => {
  try {
    const test = semesterCommandCenterService.addSlipTest(req.body);
    res.status(201).json({ success: true, data: test });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/slip-tests/:testId/score', requireAuth, async (req: Request, res: Response) => {
  try {
    const { score, weak_topics } = req.body;
    const test = semesterCommandCenterService.recordSlipTestScore(req.params.testId, score, weak_topics || []);
    res.json({ success: true, data: test });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 7. Minor Examinations & End-Sem Readiness
semesterCommandCenterRouter.get('/semester/minors', async (_req: Request, res: Response) => {
  try {
    const minors = semesterCommandCenterService.getMinorExams();
    res.json({ success: true, data: minors });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.get('/semester/end-sem-readiness', async (_req: Request, res: Response) => {
  try {
    const readiness = semesterCommandCenterService.getEndSemReadiness();
    res.json({ success: true, data: readiness });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 8. Academic Recovery Engine
semesterCommandCenterRouter.get('/semester/recovery', async (_req: Request, res: Response) => {
  try {
    const plans = semesterCommandCenterService.getRecoveryPlans();
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/recovery/:planId/resolve', requireAuth, async (req: Request, res: Response) => {
  try {
    semesterCommandCenterService.resolveRecoveryPlan(req.params.planId);
    res.json({ success: true, message: 'Recovery plan resolved' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 9. Daily Guidance & Weekly Review
semesterCommandCenterRouter.get('/semester/today-guidance', async (_req: Request, res: Response) => {
  try {
    const guidance = semesterCommandCenterService.getTodayGuidance();
    res.json({ success: true, data: guidance });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.get('/semester/weekly-review', async (_req: Request, res: Response) => {
  try {
    const review = semesterCommandCenterService.getLatestWeeklyReview();
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
