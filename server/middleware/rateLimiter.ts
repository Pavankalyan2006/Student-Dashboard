import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { logger } from '../core/logging';

interface RequestBucket {
  count: number;
  resetAt: number;
}

const buckets: Map<string, RequestBucket> = new Map();

// Periodic cleanup of expired buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}, 300000);

export interface RateLimitOptions {
  windowSeconds?: number;
  maxRequests?: number;
  keyPrefix?: string;
  skipFailedRequests?: boolean;
}

/**
 * Creates an endpoint-specific or global rate limiter middleware.
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowSeconds = options.windowSeconds || 60;
  const maxRequests = options.maxRequests || 120;
  const keyPrefix = options.keyPrefix || 'global';

  return async (req: Request, res: Response, next: NextFunction) => {
    // Use the full URL: when this middleware is mounted with app.use('/api', ...), req.path no longer starts
    // with /api, and an earlier version therefore skipped every request (the limit was never applied).
    const fullPath = (req.originalUrl || req.url || '').split('?')[0];
    // Whitelist non-API routes, health checks, Vite internals, and static assets
    if (
      !fullPath.startsWith('/api') ||
      fullPath.startsWith('/api/health') ||
      fullPath.startsWith('/api/v1/health') ||
      fullPath.endsWith('.ico')
    ) {
      return next();
    }
    // Test suites make hundreds of calls per second as one user; they opt in when testing the limiter itself.
    if ((process.env.VITEST || process.env.NODE_ENV === 'test') && process.env.API_RATE_LIMIT_IN_TESTS !== '1') {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userId = req.user?.userId || 'anonymous';
    const bucketKey = `${keyPrefix}:${ip}:${userId}`;
    const now = Date.now();

    let bucket = buckets.get(bucketKey);
    if (!bucket || now > bucket.resetAt) {
      bucket = {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      };
      buckets.set(bucketKey, bucket);
    } else {
      bucket.count += 1;
    }

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, maxRequests - bucket.count).toString()
    );
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(bucket.resetAt / 1000).toString()
    );

    if (bucket.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds.toString());

      logger.warn(`Rate limit exceeded for ${bucketKey} on ${req.method} ${req.originalUrl}`);

      // Record security event asynchronously
      db.recordSecurityEvent({
        event_type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        ip_address: ip,
        user_id: req.user?.userId,
        path: req.originalUrl,
        details: `Exceeded ${maxRequests} requests within ${windowSeconds}s window (count: ${bucket.count})`,
      }).catch((err) => logger.error('Failed to record security event', err));

      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Limit is ${maxRequests} requests per ${windowSeconds} seconds. Please wait ${retryAfterSeconds}s before retrying.`,
          request_id: req.id,
        },
      });
    }

    next();
  };
}

// Global default rate limiter
export const globalRateLimiter = createRateLimiter({
  windowSeconds: 60,
  // Per student (or per IP when signed out). A busy dashboard load makes ~20 calls, so this leaves headroom.
  maxRequests: Number(process.env.API_RATE_LIMIT_PER_MINUTE) || 600,
  keyPrefix: 'global',
});

// Stricter rate limiter for sensitive authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 25,
  keyPrefix: 'auth',
});

// AI generation rate limiter
export const aiRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 40,
  keyPrefix: 'ai',
});

// File upload rate limiter
export const uploadRateLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 20,
  keyPrefix: 'upload',
});

/** POST endpoints that call the AI model. Each one costs model quota, so they get the stricter AI limit. */
export function isAIGenerationRequest(method: string, url: string): boolean {
  if (method !== 'POST') return false;
  const p = (url || '').split('?')[0].toLowerCase();
  if (!p.startsWith('/api/')) return false;
  return /^\/api\/v1\/(ai|discover)\//.test(p) || /\/(generate|explain|chat|ask|tutor|summari[sz]e|analy[sz]e|evaluate|feedback|hint|hints)(\/|$)/.test(p);
}

/** Applies the AI limiter only to AI generation calls; everything else passes straight through. */
export function aiGenerationRateLimiter(req: Request, res: Response, next: NextFunction) {
  if (!isAIGenerationRequest(req.method, req.originalUrl || req.url)) return next();
  return aiRateLimiter(req, res, next);
}
