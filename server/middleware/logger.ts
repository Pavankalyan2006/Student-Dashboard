import { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logging';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    // Exclude static assets or vite ping from verbose logs
    if (req.path.startsWith('/@') || req.path.startsWith('/node_modules') || req.path.startsWith('/src')) {
      return;
    }

    const userId = (req as any).user?.userId;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`, {
      requestId: req.id,
      userId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
    });
  });

  next();
}
