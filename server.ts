import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { config } from './server/core/config';
import { requestIdMiddleware } from './server/middleware/requestId';
import { requestLogger } from './server/middleware/logger';
import { authenticate } from './server/middleware/auth';
import { errorHandler } from './server/middleware/errorHandler';
import { globalRateLimiter } from './server/middleware/rateLimiter';
import { maintenanceMiddleware } from './server/middleware/maintenance';
import { apiV1Router } from './server/api/router';
import { onboardingStores } from './server/services/onboardingService';
import { studentProfileStores } from './server/services/studentProfile/profileCache';
import { CareerService } from './server/services/careerService';
import { MlLabService } from './server/services/mlLabService';
import { SqlLabSandboxService } from './server/services/sqlLabSandboxService';
import { GitLabService } from './server/services/gitLabService';
import { VectorStore } from './server/rag/vectorStore';
import { semesterStateStore } from './server/services/semesterCommandCenterService';
import { healthRouter } from './server/api/routes/health';
import { logger } from './server/core/logging';
import { db } from './server/db/database';
import { LearningModulesService } from './server/services/learningModulesService';
import { ExternalIntegrationService } from './server/services/externalIntegrationService';
import { pilotFeedbackStores } from './server/services/pilotFeedbackService';
import { corsDecision, CORS_BASE_OPTIONS } from './server/core/corsPolicy';
import {
  registerPersistentSource,
  restoreSnapshot,
  scheduleSnapshotSave,
  flushSnapshot,
  getSnapshotPath,
} from './server/db/persistence';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupPersistence() {
  await db.initialize();
  // Everything below lives only in memory; persist it so restarts do not wipe student data.
  registerPersistentSource(
    'db',
    db as unknown as Record<string, any>,
    Object.keys(db).filter((k) => {
      const v = (db as any)[k];
      return (v instanceof Map || v instanceof Set || Array.isArray(v)) && k !== 'structuredLogs';
    })
  );
  registerPersistentSource('learningModules', LearningModulesService as unknown as Record<string, any>, [
    'studyPlans',
    'exams',
    'doubts',
    'flashcardDecks',
    'labs',
    'mlExperiments',
    'systemDesigns',
    'knowledgeItems',
    'knowledgeCollections',
    'applications',
  ]);
  registerPersistentSource('externalIntegrations', ExternalIntegrationService as unknown as Record<string, any>, [
    'connections',
    'activities',
    'profiles',
    'jobs',
  ]);
  registerPersistentSource('onboarding', onboardingStores as unknown as Record<string, any>);
  registerPersistentSource('studentProfile', studentProfileStores as unknown as Record<string, any>);
  registerPersistentSource('career', CareerService as unknown as Record<string, any>, ['careerProfiles']);
  registerPersistentSource('mlLab', MlLabService as unknown as Record<string, any>, ['workspaces', 'customDatasets', 'experiments', 'fittedModels', 'predictions']);
  // Search vectors for uploaded documents; without this, search and Q&A found nothing after a restart.
  registerPersistentSource('vectorStore', VectorStore as unknown as Record<string, any>, ['store']);
  registerPersistentSource('pilotFeedback', pilotFeedbackStores as unknown as Record<string, any>);
  registerPersistentSource('gitLab', GitLabService as unknown as Record<string, any>, ['progress']);
  registerPersistentSource('sqlLab', SqlLabSandboxService as unknown as Record<string, any>, ['studentDbImages', 'queryHistories', 'savedQueries']);
  registerPersistentSource('semesterCommandCenter', semesterStateStore as unknown as Record<string, any>, ['states']);
  restoreSnapshot();
  const retiredDemo = db.retireFabricatedDemoData();
  if (retiredDemo) logger.info(`Removed ${retiredDemo} demo record(s) with invented connections or scores left by an earlier version`);
  const retiredJobs = db.retireFabricatedJobData();
  if (retiredJobs) logger.info(`Removed ${retiredJobs} hand-written job listing(s) left by an earlier version`);
  const retiredApps = LearningModulesService.retireSeededApplications();
  if (retiredApps) logger.info(`Removed ${retiredApps} sample application(s) left by an earlier version`);
  const file = getSnapshotPath();
  logger.info(file ? `Data persistence enabled: ${file}` : 'Data persistence disabled (DATA_PERSISTENCE=off)');

  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}; flushing data snapshot`);
    flushSnapshot();
    process.exit(0);
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

async function startServer() {
  await setupPersistence();
  const app = express();

  // Explicit CORS allowlist for production security
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
      ];

  // Same-origin requests are always allowed (see server/core/corsPolicy.ts, P6-003).
  app.use(
    cors((req, callback) => {
      const refused = corsDecision(req.header('Origin'), req.header('Host'), allowedOrigins, process.env.NODE_ENV === 'production');
      if (refused) return callback(refused);
      return callback(null, { ...CORS_BASE_OPTIONS, origin: true });
    })
  );

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(authenticate);

  // Persist the store after any request that may have changed data.
  app.use('/api', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      res.on('finish', () => {
        if (res.statusCode < 400) scheduleSnapshotSave();
      });
    }
    next();
  });

  // Security response headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: ws: wss:; frame-src 'self' https://*.firebaseapp.com; frame-ancestors 'self';"
    );
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  // Root-level liveness and readiness probes (for Kubernetes, Docker, and Load Balancers)
  app.use('/', healthRouter);

  // Maintenance mode and global rate limiting for API routes
  app.use('/api', maintenanceMiddleware);
  app.use('/api', globalRateLimiter);

  // Mount API V1 routes
  app.use('/api/v1', apiV1Router);

  // API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  // Error handling middleware for API routes
  app.use('/api', errorHandler);

  // Dev server or Production static serving
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Global fallback error handler
  app.use(errorHandler);

  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info(`B.Tech AI Learning Platform server listening on port ${config.port}`);
  });

  return server;
}

startServer().catch((err) => {
  logger.error('Fatal startup error in server.ts', err);
  process.exit(1);
});
