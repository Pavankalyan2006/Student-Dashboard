// server/api/routes/externalProfiles.ts
// REST API endpoints for External Profiles management, URL validation, verification, synchronization, and privacy controls

import { Router, Request, Response } from 'express';
import { ExternalProfilesService } from '../../services/externalProfilesService';
import { requireAuth } from '../../middleware/auth';
import { ValidationError, NotFoundError } from '../../core/exceptions';
import { logger } from '../../core/logging';

export const externalProfilesRouter = Router();

/**
 * GET /api/v1/external-profiles/platforms
 * List supported platform catalog with category filtering and search
 */
externalProfilesRouter.get('/platforms', async (req: Request, res: Response) => {
  try {
    const { category, q } = req.query;
    const platforms = ExternalProfilesService.listSupportedPlatforms(
      category as any,
      q as string
    );
    return res.json({ success: true, platforms });
  } catch (err: any) {
    logger.error('Failed to list supported external platforms', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve platforms' });
  }
});

/**
 * POST /api/v1/external-profiles/validate-url
 * Validate a profile URL or handle before submission
 */
externalProfilesRouter.post('/validate-url', async (req: Request, res: Response) => {
  try {
    const { platform_id, url } = req.body;
    if (!platform_id || !url) {
      return res.status(400).json({ success: false, error: 'Platform ID and URL/handle are required' });
    }
    const result = ExternalProfilesService.validateProfileUrl(platform_id, url);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/external-profiles/stats
 * Get connection summary metrics for dashboard KPIs
 */
externalProfilesRouter.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const stats = await ExternalProfilesService.getDashboardStats(studentId);
    return res.json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/external-profiles/consented-summary
 * Cross-module profile data export for Resume, Career, and Job Matching
 */
externalProfilesRouter.get('/consented-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const context = (req.query.context as 'resume' | 'career' | 'jobs') || 'resume';
    const summary = await ExternalProfilesService.getConsentedProfileSummary(studentId, context);
    return res.json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/external-profiles
 * List all connected external profiles for student
 */
externalProfilesRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const profiles = await ExternalProfilesService.getStudentProfiles(studentId);
    return res.json({ success: true, profiles });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/external-profiles
 * Add a new external profile
 */
externalProfilesRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const profile = await ExternalProfilesService.addProfile(studentId, req.body);
    return res.status(201).json({ success: true, profile });
  } catch (err: any) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ success: false, error: err.message });
    }
    logger.error('Failed to add external profile', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to add profile' });
  }
});

/**
 * POST /api/v1/external-profiles/sync-all
 * Synchronize all eligible profiles sequentially
 */
externalProfilesRouter.post('/sync-all', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const result = await ExternalProfilesService.syncAllEligibleProfiles(studentId);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/external-profiles/:id
 * Get single profile
 */
externalProfilesRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const profile = await ExternalProfilesService.getProfileById(studentId, req.params.id);
    return res.json({ success: true, profile });
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/external-profiles/:id
 * Update profile metadata or privacy sharing settings
 */
externalProfilesRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const profile = await ExternalProfilesService.updateProfile(studentId, req.params.id, req.body);
    return res.json({ success: true, profile });
  } catch (err: any) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/external-profiles/:id
 * Delete or permanently remove profile
 */
externalProfilesRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    await ExternalProfilesService.deleteProfile(studentId, req.params.id);
    return res.json({ success: true, message: 'External profile removed' });
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/external-profiles/:id/disconnect
 * Disconnect profile without deleting historical records
 */
externalProfilesRouter.post('/:id/disconnect', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    await ExternalProfilesService.disconnectProfile(studentId, req.params.id);
    return res.json({ success: true, message: 'External profile disconnected' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/external-profiles/:id/sync
 * Synchronize single external profile
 */
externalProfilesRouter.post('/:id/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const result = await ExternalProfilesService.syncProfile(studentId, req.params.id);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/external-profiles/:id/verify-challenge/start
 * Generate challenge token for public bio verification
 */
externalProfilesRouter.post('/:id/verify-challenge/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const challenge = await ExternalProfilesService.startChallengeVerification(studentId, req.params.id);
    return res.json({ success: true, challenge });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/external-profiles/:id/verify-challenge/check
 * Verify challenge token on public profile
 */
externalProfilesRouter.post('/:id/verify-challenge/check', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const result = await ExternalProfilesService.checkChallengeVerification(studentId, req.params.id);
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/external-profiles/:id/history
 * Get synchronization run history
 */
externalProfilesRouter.get('/:id/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id || (req as any).studentId || 'std_demo_1';
    const history = await ExternalProfilesService.getProfileHistory(studentId, req.params.id);
    return res.json({ success: true, history });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
