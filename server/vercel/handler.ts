// Vercel request handler. Bundled by scripts/build-vercel-api.mjs into api/_lib/handler.mjs;
// api/index.js re-exports it. The built frontend (dist/) is served by Vercel's CDN.
//
// The app is imported lazily so that a configuration error thrown while modules load (for example
// a missing JWT_SECRET or FIREBASE_PROJECT_ID) becomes a clear 503 instead of Vercel's opaque
// FUNCTION_INVOCATION_FAILED. Error messages name variables only, never their values.
import type { IncomingMessage, ServerResponse } from 'http';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
let appPromise: Promise<Handler> | null = null;

function getApp(): Promise<Handler> {
  if (!appPromise) {
    appPromise = (async () => {
      const [{ createApp }, { errorHandler }] = await Promise.all([
        import('../app'),
        import('../middleware/errorHandler'),
      ]);
      const app = await createApp({ serverless: true });
      app.use(errorHandler);
      return app as unknown as Handler;
    })().catch((err) => {
      // Allow the next request to retry a failed cold start (e.g. database briefly unreachable).
      appPromise = null;
      const detail = `${(err as any)?.code || ''} ${(err as any)?.message || 'unknown error'}`.trim();
      console.error(`Serverless startup failed: ${detail}`);
      throw err;
    });
  }
  return appPromise;
}

function safeStartupMessage(err: unknown): string {
  const message = String((err as any)?.message || 'unknown error');
  // Never echo anything that looks like a connection string or key.
  return message.replace(/[a-z]+:\/\/[^\s]+/gi, '<url>').slice(0, 300);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: {
          code: 'STARTUP_FAILED',
          message: 'The service could not start. Check the Vercel function logs and environment variables.',
          detail: safeStartupMessage(err),
        },
      })
    );
  }
}
