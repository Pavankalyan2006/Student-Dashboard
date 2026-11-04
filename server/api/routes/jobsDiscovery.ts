// server/api/routes/jobsDiscovery.ts
// Express REST API router for Multi-Source Jobs Discovery Platform

import { Router, Request, Response } from 'express';
import { db } from '../../db/database';
import { requireAuth } from '../../middleware/auth';
import { JobAggregationService } from '../../services/jobAggregationService';
import { JobAiService } from '../../services/jobAiService';
import { LearningModulesService } from '../../services/learningModulesService';
import {
  GOVERNMENT_SUBCATEGORIES,
  PRIVATE_SUBCATEGORIES,
} from '../../db/jobsCatalog';
import { logger } from '../../core/logging';

export const jobsDiscoveryRouter = Router();

// ============================================================================
// 1. Job Listings Search & Filtering
// ============================================================================
jobsDiscoveryRouter.get('/jobs', async (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      subcategory,
      source_id,
      location,
      remote_only,
      freshers_only,
      status,
      sort_by,
      limit,
      offset,
    } = req.query;

    const result = await db.getJobListings({
      query: q as string,
      category: category as any,
      subcategory: subcategory as string,
      source_id: source_id as string,
      location: location as string,
      remote_only: remote_only === 'true',
      freshers_only: freshers_only === 'true',
      status: status as string,
      sort_by: sort_by as any,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    res.json({
      success: true,
      data: result.jobs,
      total: result.total,
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });
  } catch (err: any) {
    logger.error('Failed to get job listings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 2. Dashboard Statistics & Counts
// ============================================================================
jobsDiscoveryRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.userId;
    const stats = await db.getJobsDashboardStats(studentId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    logger.error('Failed to get job stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 3. Category & Subcategory Catalog
// ============================================================================
jobsDiscoveryRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        government: {
          category: 'GOVERNMENT',
          label: 'Government Jobs & Public Sector',
          subcategories: GOVERNMENT_SUBCATEGORIES,
        },
        private: {
          category: 'PRIVATE',
          label: 'Private Tech & Engineering Opportunities',
          subcategories: PRIVATE_SUBCATEGORIES,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 4. Source Status & Health Tracking
// ============================================================================
jobsDiscoveryRouter.get('/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await db.getJobSources();
    const runs = await db.getJobSyncRuns(10);
    res.json({
      success: true,
      data: {
        sources,
        recent_sync_runs: runs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 5. Manual Sync Trigger (Authenticated)
// ============================================================================
jobsDiscoveryRouter.post('/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const syncSummary = await JobAggregationService.syncSources(studentId);
    res.json({
      success: true,
      message: 'Source synchronization completed successfully',
      data: syncSummary,
    });
  } catch (err: any) {
    logger.error('Manual job sync failed:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 6. Student Saved Jobs
// ============================================================================
jobsDiscoveryRouter.get('/saved', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const saved = await db.getStudentSavedJobs(studentId);
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

jobsDiscoveryRouter.post('/jobs/:id/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const jobId = req.params.id;
    const { notes, is_interested, application_status } = req.body;

    const saved = await db.saveStudentJob(studentId, jobId, notes, is_interested !== false, application_status);
    res.json({ success: true, data: saved, message: 'Job saved to your bookmarks' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

jobsDiscoveryRouter.delete('/jobs/:id/save', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const jobId = req.params.id;
    await db.deleteStudentSavedJob(studentId, jobId);
    res.json({ success: true, message: 'Job removed from saved bookmarks' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 7. Student Job Alerts Management
// ============================================================================
jobsDiscoveryRouter.get('/alerts', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const alerts = await db.getStudentJobAlerts(studentId);
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

jobsDiscoveryRouter.post('/alerts', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { id, title, category, subcategories, keywords, locations, remote_only, freshers_only, is_active } = req.body;

    const alert = await db.saveStudentJobAlert({
      id: id || `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      student_id: studentId,
      title: title || 'Custom Job Alert',
      category: category || 'ALL',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      keywords: Array.isArray(keywords) ? keywords : [],
      locations: Array.isArray(locations) ? locations : [],
      remote_only: Boolean(remote_only),
      freshers_only: freshers_only !== false,
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
    });

    res.json({ success: true, data: alert, message: 'Job alert saved successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

jobsDiscoveryRouter.delete('/alerts/:alertId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const alertId = req.params.alertId;
    await db.deleteStudentJobAlert(studentId, alertId);
    res.json({ success: true, message: 'Job alert removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 8. Single Job Details
// ============================================================================
jobsDiscoveryRouter.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await db.getJobListingById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }
    res.json({ success: true, data: job });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 9. Transparent Student Profile Match Explanation
// ============================================================================
jobsDiscoveryRouter.get('/jobs/:id/match', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const job = await db.getJobListingById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Retrieve student context
    const student = await db.getStudentById(studentId);
    const resumes = await db.getResumes(studentId);

    let extractedSkills: string[] = [];
    if (resumes.length > 0) {
      const resumeSkills = await db.getResumeSkills(resumes[0].id);
      extractedSkills = resumeSkills.map((s) => s.skill);
    }
    if (extractedSkills.length === 0) {
      extractedSkills = ['Data Structures & Algorithms', 'C++', 'Java', 'Python', 'SQL', 'Computer Networks', 'Operating Systems', 'Git'];
    }

    const matchExplanation = await JobAiService.explainMatch(job, {
      student_id: studentId,
      branch: student?.branch || 'Computer Science & Engineering',
      semester: student?.semester || 6,
      skills: extractedSkills,
    });

    res.json({ success: true, data: matchExplanation });
  } catch (err: any) {
    logger.error('Failed to compute job match explanation:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 10. Track Job into Applications Tracker
// ============================================================================
jobsDiscoveryRouter.post('/jobs/:id/track', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const job = await db.getJobListingById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    const { status, notes } = req.body;
    const appStatus = status || 'APPLIED';

    // Create tracked application via LearningModulesService
    const app = await LearningModulesService.createApplication(studentId, {
      company_name: job.organization,
      role: job.title,
      location: job.location,
      application_url: job.application_url,
      deadline: job.application_deadline,
      status: appStatus,
      salary_range: job.salary_text,
      notes: notes || `Imported from Jobs Discovery (${job.category} category). Official Source: ${job.source_name}`,
    });

    // Also update saved job status
    await db.saveStudentJob(studentId, job.id, notes, true, appStatus);

    res.status(201).json({
      success: true,
      message: 'Opportunity successfully added to your Applications Tracker',
      data: app,
    });
  } catch (err: any) {
    logger.error('Failed to track job application:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 11. External Job Description Analysis & Gap Breakdown
// ============================================================================
jobsDiscoveryRouter.post('/analyze-jd', async (req: Request, res: Response) => {
  try {
    const { title, organization, description, category } = req.body;
    if (!description || description.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Please provide a valid job description with at least 20 characters.' });
    }

    const analysis = await JobAiService.analyzeJobDescription({
      title: title || 'Engineering Position',
      organization: organization || 'Employer',
      raw_text: description,
      category,
    });

    res.json({ success: true, data: analysis });
  } catch (err: any) {
    logger.error('Failed to analyze job description:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
