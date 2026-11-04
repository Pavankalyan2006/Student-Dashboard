import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { SkillService } from '../../services/skillService';
import { SkillAssessmentService } from '../../services/skillAssessmentService';
import { logger } from '../../core/logging';

export const skillsRouter = Router();

// 1. Skill Profile & Catalog
skillsRouter.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const skills = await SkillService.getStudentSkills(studentId);
    res.json({ success: true, data: skills });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.post('/declare', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { skill_id, proficiency } = req.body;
    if (!skill_id) {
      return res.status(400).json({ success: false, message: 'skill_id is required' });
    }
    const skill = await SkillService.declareStudentSkill(studentId, skill_id, proficiency);
    res.status(201).json({ success: true, data: skill });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.get('/evidence', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const skillId = req.query.skill_id as string | undefined;
    const evidence = await SkillService.getSkillEvidence(studentId, skillId);
    res.json({ success: true, data: evidence });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.get('/gaps', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const roleId = (req.query.role_id as string) || 'role_sde';
    const gaps = await SkillService.getSkillGaps(studentId, roleId);
    res.json({ success: true, data: gaps });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 2. Assessments
skillsRouter.get('/assessments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const list = await SkillAssessmentService.listAssessments(studentId);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.post('/assessments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { skill_id, difficulty, question_count } = req.body;
    if (!skill_id) {
      return res.status(400).json({ success: false, message: 'skill_id is required' });
    }
    const result = await SkillAssessmentService.startAssessment(
      studentId,
      skill_id,
      difficulty || 'INTERMEDIATE',
      question_count || 5
    );
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.get('/assessments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const assessment = await SkillAssessmentService.getAssessment(req.params.id, studentId);
    res.json({ success: true, data: assessment });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.post('/assessments/:id/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { question_id, selected_option, answer_text, code } = req.body;
    const result = await SkillAssessmentService.submitAnswer(req.params.id, studentId, question_id, {
      selected_option,
      answer_text,
      code,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.post('/assessments/:id/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await SkillAssessmentService.completeAssessment(req.params.id, studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 3. Catalog listing
skillsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const skills = await SkillService.listSkills(category);
    res.json({ success: true, data: skills });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

skillsRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const skill = await SkillService.getSkill(req.params.id);
    res.json({ success: true, data: skill });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
