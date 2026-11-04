// server/api/routes/externalIntegrations.ts
// Express routes for Social Media, Career, Coding & External Platform Integrations

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ExternalIntegrationRegistry } from '../../services/externalIntegrationRegistry';
import { ExternalIntegrationService } from '../../services/externalIntegrationService';
import { ExternalProviderId } from '../../models/externalIntegrationTypes';

export const externalIntegrationsRouter = Router();

// 1. List supported external providers and capabilities
externalIntegrationsRouter.get('/integrations/providers', async (_req: Request, res: Response) => {
  try {
    const providers = ExternalIntegrationRegistry.getAllProviders();
    res.json({ success: true, data: providers });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 2. List student connected accounts
externalIntegrationsRouter.get('/integrations/connections', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const connections = await ExternalIntegrationService.listConnections(studentId);
    res.json({ success: true, data: connections });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 3. Initiate OAuth for supported provider
externalIntegrationsRouter.post('/integrations/connections/:provider/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const provider = ExternalIntegrationRegistry.get(req.params.provider as ExternalProviderId);
    if (!provider) {
      return res.status(404).json({ success: false, message: `Provider '${req.params.provider}' not found` });
    }
    const authData = await provider.initiateAuth(studentId, req.body.redirect_uri);
    res.json({ success: true, data: authData });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 4. Complete connection (OAuth callback or public profile URL linking)
externalIntegrationsRouter.post('/integrations/connections/:provider/connect', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const connection = await ExternalIntegrationService.connectPlatform(
      studentId,
      req.params.provider as ExternalProviderId,
      req.body
    );
    res.status(201).json({ success: true, data: connection });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 5. Trigger manual sync for connection
externalIntegrationsRouter.post('/integrations/connections/:connectionId/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ExternalIntegrationService.syncConnection(studentId, req.params.connectionId);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 6. Disconnect external platform
externalIntegrationsRouter.delete('/integrations/connections/:connectionId', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await ExternalIntegrationService.disconnectPlatform(studentId, req.params.connectionId);
    res.json({ success: true, message: 'Platform disconnected successfully' });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 7. Get aggregated recent external activities
externalIntegrationsRouter.get('/integrations/activity', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const activities = await ExternalIntegrationService.listActivities(studentId);
    res.json({ success: true, data: activities });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 8. Get unified skill evidence
externalIntegrationsRouter.get('/integrations/skills', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const skills = await ExternalIntegrationService.getAggregatedSkillEvidence(studentId);
    res.json({ success: true, data: skills });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 9. Check Career Profile Consistency (Resume vs GitHub vs LinkedIn vs LeetCode)
externalIntegrationsRouter.get('/integrations/consistency', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const report = await ExternalIntegrationService.checkProfileConsistency(studentId);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 10. Search external job opportunities
externalIntegrationsRouter.get('/integrations/jobs', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const location = req.query.location as string;
    const jobs = await ExternalIntegrationService.searchJobs(query, location);
    res.json({ success: true, data: jobs });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// 11. Import / paste job description
externalIntegrationsRouter.post('/integrations/jobs/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const job = await ExternalIntegrationService.importJob(studentId, req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
