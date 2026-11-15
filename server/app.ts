// Builds the Express application. Used by server.ts (long-running Node/Docker) and by
// api/index.ts (Vercel serverless function). Keep both entry points thin.
import { requestContextMiddleware } from './core/requestContext';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './core/config';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/logger';
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { globalRateLimiter, aiGenerationRateLimiter } from './middleware/rateLimiter';
import { maintenanceMiddleware } from './middleware/maintenance';
import { apiV1Router } from './api/router';
import { onboardingStores } from './services/onboardingService';
import { studentProfileStores } from './services/studentProfile/profileCache';
import { CareerService } from './services/careerService';
import { MlLabService } from './services/mlLabService';
import { SqlLabSandboxService } from './services/sqlLabSandboxService';
import { GitLabService } from './services/gitLabService';
import { VectorStore } from './rag/vectorStore';
import { semesterStateStore } from './services/semesterCommandCenterService';
import { academicStores } from './services/academicRecordsService';
import { aiMemoryStores } from './services/aiMemoryService';
import { showcaseStores } from './services/showcaseService';
import { agentActivityStores } from './services/agentActivityService';
import { briefingStores } from './services/briefingService';
import { paperStores } from './services/previousPapersService';
import { codeReviewStores } from './services/codeReviewService';
import { healthRouter } from './api/routes/health';
import { logger } from './core/logging';
import { db } from './db/database';
import { LearningModulesService } from './services/learningModulesService';
import { ExternalIntegrationService } from './services/externalIntegrationService';
import { pilotFeedbackStores } from './services/pilotFeedbackService';
import { StorageService } from './storage/storage';
import { corsDecision, CORS_BASE_OPTIONS } from './core/corsPolicy';
import {
  registerPersistentSource,
  restoreSnapshot,
  scheduleSnapshotSave,
  flushSnapshot,
  getSnapshotPath,
} from './db/persistence';
import { PgStatePersistence } from './db/pgStatePersistence';
import { runMigrations } from './db/migrations';

export interface CreateAppOptions {
  /** Serverless (Vercel): no process signal handlers; state store defaults to Postgres. */
  serverless?: boolean;
}

export type StateBackend = 'file' | 'postgres';

/** Postgres URL for the app state store: STATE_DB_URL, else the Supabase connection string. */
export function stateDbUrl(): string | undefined {
  return process.env.STATE_DB_URL || process.env.SUPABASE_DB_URL || undefined;
}

export function resolveStateBackend(options: CreateAppOptions = {}): StateBackend {
  const explicit = (process.env.STATE_STORE || '').toLowerCase();
  if (explicit === 'postgres' || explicit === 'file') return explicit;
  if (explicit) throw new Error(`STATE_STORE must be 'postgres' or 'file' (got '${explicit}').`);
  return options.serverless || process.env.VERCEL ? 'postgres' : 'file';
}

let pgState: PgStatePersistence | null = null;
export function getPgState(): PgStatePersistence | null {
  return pgState;
}

function registerSources(backend: StateBackend) {
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
  // Grades, CGPA and attendance the student enters (Grades & CGPA, Attendance pages).
  registerPersistentSource('academicRecords', academicStores as unknown as Record<string, any>, ['records']);
  registerPersistentSource('aiMemory', aiMemoryStores as unknown as Record<string, any>, ['settings']);
  registerPersistentSource('showcase', showcaseStores as unknown as Record<string, any>, ['settings']);
  // AI Agent Control Center: each student's tool-call log and agent switches. Daily briefing item actions.
  registerPersistentSource('agentActivity', agentActivityStores as unknown as Record<string, any>, ['log', 'prefs']);
  registerPersistentSource('briefing', briefingStores as unknown as Record<string, any>, ['actions']);
  registerPersistentSource('previousPapers', paperStores as unknown as Record<string, any>, ['papers']);
  registerPersistentSource('codeReview', codeReviewStores as unknown as Record<string, any>, ['reviews']);
  if (backend === 'postgres') {
    // No writable disk on serverless: uploaded file bytes live in the state store instead of data/vault.
    registerPersistentSource('storageBlobs', StorageService as unknown as Record<string, any>, ['fileBlobs']);
  }
}

function retireLegacyRecords() {
  const retiredDemo = db.retireFabricatedDemoData();
  if (retiredDemo) logger.info(`Removed ${retiredDemo} demo record(s) with invented connections or scores left by an earlier version`);
  const retiredJobs = db.retireFabricatedJobData();
  if (retiredJobs) logger.info(`Removed ${retiredJobs} hand-written job listing(s) left by an earlier version`);
  const retiredApps = LearningModulesService.retireSeededApplications();
  if (retiredApps) logger.info(`Removed ${retiredApps} sample application(s) left by an earlier version`);
}

async function setupPersistence(options: CreateAppOptions): Promise<StateBackend> {
  const backend = resolveStateBackend(options);
  await db.initialize();
  registerSources(backend);

  if (backend === 'postgres') {
    const url = stateDbUrl();
    if (!url) throw new Error('STATE_STORE=postgres needs STATE_DB_URL or SUPABASE_DB_URL (server-only Postgres connection string).');
    let target = 'database';
    try {
      const u = new URL(url);
      target = `${u.hostname}:${u.port || '5432'}`; // host only: never the user name or password
    } catch {
      /* unparsable URL: pg reports it below */
    }
    try {
      if (process.env.RUN_DB_MIGRATIONS !== 'false') {
        await runMigrations(url);
      }
      pgState = new PgStatePersistence(url);
      await pgState.ensureSchema();
      await pgState.load();
    } catch (err) {
      const e = new Error(`Could not use the database at ${target}: ${(err as any)?.code || ''} ${(err as any)?.message || err}`.replace(/\s+/g, ' '));
      (e as any).code = (err as any)?.code;
      throw e;
    }
    retireLegacyRecords();
    // Write seed data on the very first start and any retirements; later saves are diffs.
    await pgState.save();
    logger.info('Data persistence: Postgres state store');
    return backend;
  }

  restoreSnapshot();
  retireLegacyRecords();
  const file = getSnapshotPath();
  logger.info(file ? `Data persistence enabled: ${file}` : 'Data persistence disabled (DATA_PERSISTENCE=off)');

  if (!options.serverless) {
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}; flushing data snapshot`);
      flushSnapshot();
      process.exit(0);
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  }
  return backend;
}

const MUTATING = (method: string) => method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';

export async function createApp(options: CreateAppOptions = {}): Promise<express.Express> {
  const backend = await setupPersistence(options);
  const app = express();
  app.disable('x-powered-by');
  if (options.serverless || process.env.TRUST_PROXY === 'true') app.set('trust proxy', true);

  // Explicit CORS allowlist for production security
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
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

  if (backend === 'postgres') {
    // Pick up changes other instances made, then make sure a successful change is stored
    // before the student is told it succeeded.
    app.use('/api', async (req, res, next) => {
      try {
        await pgState!.sync();
      } catch (err) {
        logger.error(`State store sync failed: ${(err as any)?.code || 'unknown'}`);
      }
      if (MUTATING(req.method)) {
        const originalEnd = res.end.bind(res) as (...args: any[]) => any;
        let ending = false;
        (res as any).end = (...args: any[]) => {
          if (ending) return res;
          ending = true;
          if (res.statusCode >= 400) return originalEnd(...args);
          pgState!
            .save()
            .then(() => originalEnd(...args))
            .catch(() => {
              if (res.headersSent) return originalEnd(...args);
              res.status(503).setHeader('Content-Type', 'application/json');
              originalEnd(
                JSON.stringify({
                  success: false,
                  error: { code: 'STORE_UNAVAILABLE', message: 'Your change could not be saved. Please try again.' },
                })
              );
            });
          return res;
        };
      }
      next();
    });
  }

  app.use(authenticate);
  // Which student this request serves, for the AI personalisation layer (see server/ai/personalization.ts).
  app.use(requestContextMiddleware);

  if (backend === 'file') {
    // Persist the store after any request that may have changed data.
    app.use('/api', (req, res, next) => {
      if (MUTATING(req.method)) {
        res.on('finish', () => {
          if (res.statusCode < 400) scheduleSnapshotSave();
        });
      }
      next();
    });
  }

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
  app.use('/api', aiGenerationRateLimiter);

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

  return app;
}

export { config };
