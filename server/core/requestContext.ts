import { AsyncLocalStorage } from 'async_hooks';
import type { Request, Response, NextFunction } from 'express';

/**
 * Per-request context that follows the request through every await, so deep code (the AI service
 * in particular) knows which signed-in student it is working for without every caller passing it.
 */
export interface RequestContext {
  studentId?: string;
  role?: string;
  /** API path without query, e.g. /api/v1/notes/generate */
  path: string;
  /** Set by code that must not get the student's context (for example admin or public tools). */
  personalize?: boolean;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/** Runs `fn` with a given context; used by tests and background work started for a student. */
export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

/** Must run after authentication so `req.user` is known. */
export function requestContextMiddleware(req: Request, _res: Response, next: NextFunction) {
  const user = (req as any).user as { userId?: string; role?: string } | undefined;
  storage.run(
    {
      studentId: user?.role === 'STUDENT' || !user?.role ? user?.userId : undefined,
      role: user?.role,
      path: (req.originalUrl || req.url || '').split('?')[0],
    },
    next
  );
}
