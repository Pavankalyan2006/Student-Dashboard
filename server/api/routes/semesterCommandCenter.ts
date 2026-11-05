// server/api/routes/semesterCommandCenter.ts
// Express routes for the Academic Semester Command Center

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { semesterCommandCenterService } from '../../services/semesterCommandCenterService';

export const semesterCommandCenterRouter = Router();

// Every semester resource belongs to the signed-in student.
semesterCommandCenterRouter.use('/semester', requireAuth);
const sid = (req: Request) => req.user!.userId;

// 1. Semester Overview & Dashboard Data
semesterCommandCenterRouter.get('/semester/overview', async (req: Request, res: Response) => {
  try {
    const studentId = sid(req);
    const data = semesterCommandCenterService.getOverview(studentId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 2. Semester Config
semesterCommandCenterRouter.get('/semester/config', async (req: Request, res: Response) => {
  try {
    const studentId = sid(req);
    const overview = semesterCommandCenterService.getOverview(studentId);
    res.json({ success: true, data: overview.config });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.patch('/semester/config', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = semesterCommandCenterService.updateConfig(sid(req), req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 3. Subjects & Syllabus
semesterCommandCenterRouter.get('/semester/subjects', async (req: Request, res: Response) => {
  try {
    const studentId = sid(req);
    const subjects = semesterCommandCenterService.getSubjects(studentId);
    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/subjects', requireAuth, async (req: Request, res: Response) => {
  try {
    const subject = semesterCommandCenterService.addSubject(sid(req), req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.get('/semester/subjects/:subjectId', async (req: Request, res: Response) => {
  try {
    const subject = semesterCommandCenterService.getSubjectById(sid(req), req.params.subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.put('/semester/subjects/:subjectId/units', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = semesterCommandCenterService.updateSubjectUnits(sid(req), req.params.subjectId, req.body.units);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 4. Academic Events & Calendar
semesterCommandCenterRouter.get('/semester/events', async (req: Request, res: Response) => {
  try {
    const events = semesterCommandCenterService.getEvents(sid(req));
    res.json({ success: true, data: events });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const event = semesterCommandCenterService.addEvent(sid(req), req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 5. Semester Study Stream
semesterCommandCenterRouter.get('/semester/stream', async (req: Request, res: Response) => {
  try {
    const subjectId = req.query.subject_id as string | undefined;
    const nodes = semesterCommandCenterService.getStudyStream(sid(req), subjectId);
    res.json({ success: true, data: nodes });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.patch('/semester/stream/:nodeId/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const updated = semesterCommandCenterService.updateStreamNodeStatus(sid(req), req.params.nodeId, req.body.status);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 6. Slip Tests
semesterCommandCenterRouter.get('/semester/slip-tests', async (req: Request, res: Response) => {
  try {
    const tests = semesterCommandCenterService.getSlipTests(sid(req));
    res.json({ success: true, data: tests });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/slip-tests', requireAuth, async (req: Request, res: Response) => {
  try {
    const test = semesterCommandCenterService.addSlipTest(sid(req), req.body);
    res.status(201).json({ success: true, data: test });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/slip-tests/:testId/score', requireAuth, async (req: Request, res: Response) => {
  try {
    const { score, weak_topics } = req.body;
    const test = semesterCommandCenterService.recordSlipTestScore(sid(req), req.params.testId, score, weak_topics || []);
    res.json({ success: true, data: test });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 7. Minor Examinations & End-Sem Readiness
semesterCommandCenterRouter.get('/semester/minors', async (req: Request, res: Response) => {
  try {
    const minors = semesterCommandCenterService.getMinorExams(sid(req));
    res.json({ success: true, data: minors });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.get('/semester/end-sem-readiness', async (req: Request, res: Response) => {
  try {
    const readiness = semesterCommandCenterService.getEndSemReadiness(sid(req));
    res.json({ success: true, data: readiness });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 8. Academic Recovery Engine
semesterCommandCenterRouter.get('/semester/recovery', async (req: Request, res: Response) => {
  try {
    const plans = semesterCommandCenterService.getRecoveryPlans(sid(req));
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.post('/semester/recovery/:planId/resolve', requireAuth, async (req: Request, res: Response) => {
  try {
    semesterCommandCenterService.resolveRecoveryPlan(sid(req), req.params.planId);
    res.json({ success: true, message: 'Recovery plan resolved' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 9. Daily Guidance & Weekly Review
semesterCommandCenterRouter.get('/semester/today-guidance', async (req: Request, res: Response) => {
  try {
    const guidance = semesterCommandCenterService.getGuidanceFor(sid(req));
    res.json({ success: true, data: guidance });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

semesterCommandCenterRouter.get('/semester/weekly-review', async (req: Request, res: Response) => {
  try {
    const review = semesterCommandCenterService.getWeeklyReviewFor(sid(req));
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
