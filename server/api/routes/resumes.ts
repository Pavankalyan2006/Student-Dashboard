import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ResumeService } from '../../services/resumeService';
import { ResumeAnalysisService } from '../../services/resumeAnalysisService';
import { ResumeTailoringService } from '../../services/resumeTailoringService';
import { CareerAIService } from '../../services/careerAIService';
import { logger } from '../../core/logging';

export const resumesRouter = Router();

// 1. Resume CRUD
resumesRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const list = await ResumeService.listResumes(studentId);
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const resume = await ResumeService.createResume(studentId, req.body);
    res.status(201).json({ success: true, data: resume });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const fullData = await ResumeService.getFullResume(req.params.id, studentId);
    res.json({ success: true, data: fullData });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ResumeService.updateResume(req.params.id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await ResumeService.deleteResume(req.params.id, studentId);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

// 2. Sections
resumesRouter.put('/:id/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const profile = await ResumeService.updateProfile(req.params.id, studentId, req.body);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/education', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const education = await ResumeService.updateEducations(req.params.id, studentId, req.body.education || req.body);
    res.json({ success: true, data: education });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/skills', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const skills = await ResumeService.updateSkills(req.params.id, studentId, req.body.skills || req.body);
    res.json({ success: true, data: skills });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const projects = await ResumeService.updateProjects(req.params.id, studentId, req.body.projects || req.body);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/:id/projects/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { project_id } = req.body;
    const imported = await ResumeService.importProject(req.params.id, studentId, project_id);
    res.json({ success: true, data: imported });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/experience', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const experience = await ResumeService.updateExperiences(req.params.id, studentId, req.body.experience || req.body);
    res.json({ success: true, data: experience });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/certifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const certs = await ResumeService.updateCertifications(req.params.id, studentId, req.body.certifications || req.body);
    res.json({ success: true, data: certs });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/achievements', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const achievements = await ResumeService.updateAchievements(req.params.id, studentId, req.body.achievements || req.body);
    res.json({ success: true, data: achievements });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.put('/:id/sections', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const order = await ResumeService.updateSectionOrder(req.params.id, studentId, req.body.section_order || req.body);
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

// 3. Versions
resumesRouter.get('/:id/versions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const versions = await ResumeService.listVersions(req.params.id, studentId);
    res.json({ success: true, data: versions });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/:id/versions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const version = await ResumeService.createVersionSnapshot(req.params.id, studentId, req.body.created_by || 'Student');
    res.status(201).json({ success: true, data: version });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/:id/versions/:versionNumber/restore', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const restored = await ResumeService.restoreVersion(req.params.id, studentId, parseInt(req.params.versionNumber, 10));
    res.json({ success: true, data: restored });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

// 4. Analysis & Tailoring
resumesRouter.get('/:id/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analysis = await ResumeAnalysisService.analyzeResume(req.params.id, studentId);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/:id/tailor', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { job_description, job_title, company } = req.body;
    if (!job_description) {
      return res.status(400).json({ success: false, message: 'job_description text is required' });
    }

    // Save job description for persistence
    await ResumeTailoringService.saveJobDescription(studentId, {
      title: job_title || 'Target Role',
      company: company || 'Company',
      description: job_description,
    });

    const tailoring = await ResumeTailoringService.tailorResume(
      req.params.id,
      studentId,
      job_description,
      job_title,
      company
    );
    res.json({ success: true, data: tailoring });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

// 4b. Template Upload & Section Extraction
resumesRouter.post('/:id/upload-template', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { filename, mimeType, contentBase64, rawText } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'PDF template filename is required' });
    }

    const result = await ResumeService.uploadAndApplyTemplate(req.params.id, studentId, {
      filename,
      mimeType,
      contentBase64,
      rawText,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

// 5. AI Actions
resumesRouter.post('/:id/ai/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const resume = await ResumeService.getResume(req.params.id, studentId);
    const result = await CareerAIService.generateSummary(studentId, {
      targetRole: req.body.target_role || resume.target_role,
      targetIndustry: req.body.target_industry || resume.target_industry,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/:id/ai/bullet', requireAuth, async (req: Request, res: Response) => {
  try {
    await ResumeService.getResume(req.params.id, req.user!.userId); // owner check
    const { project_title, task, technology, outcome } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, message: 'task description is required' });
    }
    const result = await CareerAIService.generateBullet({
      projectTitle: project_title,
      task,
      technology,
      outcome,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});

resumesRouter.post('/:id/ai/improve', requireAuth, async (req: Request, res: Response) => {
  try {
    await ResumeService.getResume(req.params.id, req.user!.userId); // owner check
    const { current_text, improvement_type, target_role } = req.body;
    if (!current_text) {
      return res.status(400).json({ success: false, message: 'current_text is required' });
    }
    const result = await CareerAIService.improveWording({
      currentText: current_text,
      improvementType: improvement_type || 'TECHNICAL',
      targetRole: target_role,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.status || 500).json({ success: false, message: err.message, code: err.code });
  }
});
