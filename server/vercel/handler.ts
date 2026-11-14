// Vercel request handler. Bundled by scripts/build-vercel-api.mjs into api/_lib/handler.mjs;
// api/index.js re-exports it. The built frontend (dist/) is served by Vercel's CDN.
import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../app';
import { errorHandler } from '../middleware/errorHandler';
import { logger } from '../core/logging';

let appPromise: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = createApp({ serverless: true })
      .then((app) => {
        app.use(errorHandler);
        return app;
      })
      .catch((err) => {
        // Allow the next request to retry a failed cold start (e.g. database briefly unreachable).
        appPromise = null;
        logger.error(`Serverless startup failed: ${(err as any)?.code || ''} ${(err as any)?.message || 'unknown error'}`);
        throw err;
      });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    return (app as unknown as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: { code: 'STARTING_UP', message: 'The service is starting or unavailable. Please try again shortly.' } }));
  }
}

