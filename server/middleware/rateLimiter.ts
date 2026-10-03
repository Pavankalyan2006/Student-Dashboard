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
    // Whitelist non-API routes, health checks, Vite internals, and static assets
    if (
      !req.path.startsWith('/api') ||
      req.path.startsWith('/health') ||
      req.path.startsWith('/assets') ||
      req.path.startsWith('/src') ||
      req.path.startsWith('/@') ||
      req.path.startsWith('/node_modules') ||
      req.path.endsWith('.ico')
    ) {
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
  maxRequests: 300,
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
