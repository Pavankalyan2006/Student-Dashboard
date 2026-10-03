import { Router } from 'express';
import { db } from '../../db/database';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'btech-ai-learning-platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe: checks purely if process is alive (never depends on external services)
healthRouter.get('/health/live', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'btech-ai-learning-platform',
    liveness: true,
    uptime_seconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe: verifies core internal dependencies (e.g. database store) are ready
healthRouter.get('/health/ready', async (_req, res, next) => {
  try {
    const dbHealth = await db.checkHealth();
    const isReady = dbHealth.status === 'HEALTHY' || dbHealth.status === 'ok' || dbHealth.status === 'connected';
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? 'ok' : 'degraded',
      service: 'btech-ai-learning-platform',
      readiness: isReady,
      components: [
        {
          name: 'Database',
          status: dbHealth.status,
          latency_ms: dbHealth.latencyMs,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

