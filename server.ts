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
import { healthRouter } from './server/api/routes/health';
import { logger } from './server/core/logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
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

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('CORS origin rejected by security policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    })
  );

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(authenticate);

  // Security response headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: ws: wss:; frame-ancestors 'self';"
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
