import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp, config } from './server/app';
import { errorHandler } from './server/middleware/errorHandler';
import { logger } from './server/core/logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = await createApp();

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
