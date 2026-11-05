// server/api/routes/labAssistant.ts
// Express REST router for the complete Lab Assistant & Experiment Workspace module

import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth';
import { LabAssistantService } from '../../services/labAssistantService';
import { logger } from '../../core/logging';
import { db } from '../../db/database';

export const labAssistantRouter = Router();

// ==========================================
// 1. Analytics & Onboarding
// ==========================================
labAssistantRouter.get('/analytics/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analytics = await LabAssistantService.getAnalytics(studentId);
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    logger.error('Error fetching lab analytics', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Laboratory Courses CRUD
// ==========================================
labAssistantRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const labs = await LabAssistantService.getLabs(studentId);
    res.json({ success: true, data: labs });
  } catch (err: any) {
    logger.error('Error fetching student labs', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const lab = await LabAssistantService.createLab(studentId, req.body);
    res.status(201).json({ success: true, data: lab });
  } catch (err: any) {
    logger.error('Error creating lab course', err);
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

labAssistantRouter.get('/:labId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const lab = await LabAssistantService.getLabById(studentId, req.params.labId);
    res.json({ success: true, data: lab });
  } catch (err: any) {
    logger.error(`Error fetching lab ${req.params.labId}`, err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.put('/:labId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await LabAssistantService.updateLab(studentId, req.params.labId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error(`Error updating lab ${req.params.labId}`, err);
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

labAssistantRouter.delete('/:labId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await LabAssistantService.deleteLab(studentId, req.params.labId);
    res.json({ success: true, deleted });
  } catch (err: any) {
    logger.error(`Error deleting lab ${req.params.labId}`, err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. Manual Entry & Document Upload
// ==========================================
labAssistantRouter.post('/:labId/manual', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { manual, experiments } = req.body;
    if (!manual) {
      return res.status(400).json({ success: false, message: 'Manual metadata is required' });
    }
    const result = await LabAssistantService.saveManualDetails(
      studentId,
      req.params.labId,
      manual,
      Array.isArray(experiments) ? experiments : []
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error(`Error saving manual for lab ${req.params.labId}`, err);
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/upload', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { file_data, filename, mimetype } = req.body;
    if (!file_data || !filename) {
      return res.status(400).json({ success: false, message: 'file_data and filename are required' });
    }
    const result = await LabAssistantService.uploadAndExtractManual(
      studentId,
      req.params.labId,
      file_data,
      mimetype || 'application/pdf',
      filename
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error(`Error uploading manual for lab ${req.params.labId}`, err);
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/extract-ai', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { raw_text, instructions } = req.body;
    if (!raw_text) {
      return res.status(400).json({ success: false, message: 'raw_text is required' });
    }
    const experiments = await LabAssistantService.processManualWithAi(
      studentId,
      req.params.labId,
      raw_text,
      instructions
    );
    res.json({ success: true, data: experiments });
  } catch (err: any) {
    logger.error(`Error running AI manual extraction for lab ${req.params.labId}`, err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Experiments CRUD & Reordering
// ==========================================
labAssistantRouter.get('/:labId/experiments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exps = await db.getLabExperiments(req.params.labId, studentId);
    res.json({ success: true, data: exps });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const lab = await db.getLabCourseById(req.params.labId, studentId);
    if (!lab) return res.status(404).json({ success: false, message: 'Laboratory course not found' });

    const expData = req.body;
    const expId = LabAssistantService.safeExperimentId(expData.id, studentId, req.params.labId, `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
    const now = new Date().toISOString();

    const existingExps = await db.getLabExperiments(req.params.labId, studentId);
    const expNumber = expData.experiment_number || existingExps.length + 1;

    let procedureSteps = expData.procedure_steps;
    if (!procedureSteps && Array.isArray(expData.procedure)) {
      procedureSteps = expData.procedure.map((txt: string, idx: number) => ({
        id: `step_${expId}_${idx + 1}`,
        step_number: idx + 1,
        text: txt,
        is_completed: false,
      }));
    }

    const newExp = await db.saveLabExperiment({
      id: expId,
      lab_id: req.params.labId,
      student_id: studentId,
      experiment_number: expNumber,
      title: (expData.title || `Experiment ${expNumber}`).trim(),
      aim: (expData.aim || expData.objective || '').trim(),
      objective: (expData.aim || expData.objective || '').trim(),
      problem_statement: (expData.problem_statement || '').trim(),
      theory: (expData.theory || '').trim(),
      prerequisites: expData.prerequisites || [],
      requirements: expData.requirements || ['Standard Lab Computer'],
      required_software: expData.required_software || [],
      required_hardware: expData.required_hardware || [],
      required_libraries: expData.required_libraries || [],
      procedure_steps: procedureSteps || [],
      procedure: Array.isArray(expData.procedure) ? expData.procedure : (procedureSteps || []).map((s: any) => s.text),
      algorithm: (expData.algorithm || '').trim(),
      implementation_code: (expData.implementation_code || expData.source_code || '').trim(),
      source_code: (expData.implementation_code || expData.source_code || '').trim(),
      code_language: (expData.code_language || 'python').toLowerCase(),
      expected_output: (expData.expected_output || '').trim(),
      sample_input: (expData.sample_input || '').trim(),
      sample_output: (expData.sample_output || '').trim(),
      actual_output: expData.actual_output || '',
      execution_status: expData.execution_status || 'UNTESTED',
      result_conclusion: (expData.result_conclusion || expData.conclusion || '').trim(),
      conclusion: (expData.result_conclusion || expData.conclusion || '').trim(),
      viva_questions: expData.viva_questions || [],
      references: expData.references || [],
      faculty_notes: expData.faculty_notes || '',
      student_notes: expData.student_notes || '',
      observation_table: expData.observation_table || { headers: [], rows: [] },
      status: expData.status || 'NOT_STARTED',
      created_at: now,
      updated_at: now,
    });

    res.status(201).json({ success: true, data: newExp });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/reorder', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { experiment_ids } = req.body;
    if (!Array.isArray(experiment_ids)) {
      return res.status(400).json({ success: false, message: 'experiment_ids array is required' });
    }
    await db.reorderLabExperiments(studentId, req.params.labId, experiment_ids);
    const updated = await db.getLabExperiments(req.params.labId, studentId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.get('/:labId/experiments/:expId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exp = await LabAssistantService.getExperimentDetails(studentId, req.params.expId);
    res.json({ success: true, data: exp });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.put('/:labId/experiments/:expId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const existing = await db.getLabExperimentById(req.params.expId, studentId);
    if (!existing) return res.status(404).json({ success: false, message: 'Experiment not found' });

    const updated = await db.saveLabExperiment({
      ...existing,
      ...req.body,
      id: existing.id,
      lab_id: existing.lab_id,
      student_id: existing.student_id,
      updated_at: new Date().toISOString(),
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

labAssistantRouter.delete('/:labId/experiments/:expId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await db.deleteLabExperiment(req.params.expId, studentId);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. Interactive Checklist & Notes
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/checklist', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { step_id, is_completed } = req.body;
    if (!step_id) return res.status(400).json({ success: false, message: 'step_id is required' });

    const result = await LabAssistantService.toggleChecklistStep(
      studentId,
      req.params.expId,
      step_id,
      is_completed !== false
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/:expId/checklist/reset', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await LabAssistantService.resetChecklist(studentId, req.params.expId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/:expId/notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { student_notes } = req.body;
    const exp = await db.getLabExperimentById(req.params.expId, studentId);
    if (!exp) return res.status(404).json({ success: false, message: 'Experiment not found' });

    exp.student_notes = student_notes || '';
    exp.updated_at = new Date().toISOString();
    const saved = await db.saveLabExperiment(exp);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. Code Execution & SQL Sandbox
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/code/run', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, language, stdin } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'code is required' });

    const result = await LabAssistantService.executeCode(
      studentId,
      req.params.expId,
      code,
      language || 'python',
      stdin || ''
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error executing code in lab experiment', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/:expId/code/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { code, language, stdin } = req.body;
    const draft = await db.saveLabCodeDraft({
      student_id: studentId,
      experiment_id: req.params.expId,
      code: code || '',
      language: language || 'python',
      stdin,
      updated_at: new Date().toISOString(),
    });
    res.json({ success: true, data: draft });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/:expId/sql/run', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { query, db_name } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'SQL query is required' });

    const result = await LabAssistantService.executeSql(
      studentId,
      req.params.expId,
      query,
      db_name || 'university_db'
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    logger.error('Error executing SQL in lab experiment', err);
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. Observation Tables
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/observations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { observation_table } = req.body;
    if (!observation_table) {
      return res.status(400).json({ success: false, message: 'observation_table payload is required' });
    }
    const updated = await LabAssistantService.saveObservationTable(
      studentId,
      req.params.expId,
      observation_table
    );
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. Viva Voce Practice (Supports both legacy and new routes)
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/viva/:qId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  // '/viva/generate' is declared further down; without this it was swallowed here as a question id (404).
  if (req.params.qId === 'generate') return next();
  try {
    const studentId = req.user!.userId;
    const { student_answer } = req.body;
    const evaluated = await LabAssistantService.evaluateVivaAnswer(
      studentId,
      req.params.expId,
      req.params.qId,
      student_answer || ''
    );
    res.json({ success: true, data: evaluated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/:expId/viva/:qId/evaluate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { student_answer } = req.body;
    const evaluated = await LabAssistantService.evaluateVivaAnswer(
      studentId,
      req.params.expId,
      req.params.qId,
      student_answer || ''
    );
    res.json({ success: true, data: evaluated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.post('/:labId/experiments/:expId/viva/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { count, difficulty } = req.body;
    const generated = await LabAssistantService.generateVivaQuestions(
      studentId,
      req.params.expId,
      count || 3,
      difficulty || 'INTERMEDIATE'
    );
    res.json({ success: true, data: generated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 9. Doubt Solving Assistant
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/doubt', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { doubt, code_snippet } = req.body;
    if (!doubt) return res.status(400).json({ success: false, message: 'doubt text is required' });

    const answer = await LabAssistantService.askDoubt(
      studentId,
      req.params.expId,
      doubt,
      code_snippet
    );
    res.json({ success: true, data: { answer } });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.get('/:labId/experiments/:expId/doubt', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const history = await db.getLabDoubtHistory(studentId, req.params.expId);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.delete('/:labId/experiments/:expId/doubt', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await db.clearLabDoubtHistory(studentId, req.params.expId);
    res.json({ success: true, cleared: true });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 10. Laboratory Reports
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { date_performed } = req.body;
    const report = await LabAssistantService.generateReport(
      studentId,
      req.params.expId,
      date_performed
    );
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

labAssistantRouter.get('/:labId/experiments/:expId/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const reports = await db.getLabReports(studentId, req.params.labId);
    // Only this experiment's report (it used to fall back to another experiment's report).
    const report = reports.find((r) => r.experiment_id === req.params.expId);
    if (!report) {
      // Auto generate fresh report from experiment
      const generated = await LabAssistantService.generateReport(studentId, req.params.expId);
      return res.json({ success: true, data: generated });
    }
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 11. Mark Experiment Complete
// ==========================================
labAssistantRouter.post('/:labId/experiments/:expId/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const exp = await db.getLabExperimentById(req.params.expId, studentId);
    if (!exp) return res.status(404).json({ success: false, message: 'Experiment not found' });

    exp.status = 'COMPLETED';
    exp.completed_at = new Date().toISOString();
    exp.updated_at = new Date().toISOString();
    const saved = await db.saveLabExperiment(exp);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
