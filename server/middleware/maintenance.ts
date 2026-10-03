import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database';

/**
 * Maintenance mode middleware.
 * If 'maintenance_mode' feature flag is active:
 * - Allows SUPER_ADMIN users
 * - Allows /health/* endpoints
 * - Allows /api/v1/auth/login and /api/v1/auth/me so admins can log in
 * - Allows /api/v1/admin/*
 * - Returns 503 Service Unavailable for student operations
 */
export async function maintenanceMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const flag = await db.getFeatureFlagByKey('maintenance_mode');
    if (!flag || !flag.is_enabled) {
      return next();
    }

    // Only apply maintenance mode restrictions to API endpoints
    if (!req.path.startsWith('/api')) {
      return next();
    }

    // Always allow health checks
    if (req.path.startsWith('/health') || req.path === '/api/v1/health') {
      return next();
    }

    // Always allow admin routes
    if (req.path.startsWith('/api/v1/admin')) {
      return next();
    }

    // Allow auth endpoints so admins can authenticate
    if (req.path === '/api/v1/auth/login' || req.path === '/api/v1/auth/me') {
      return next();
    }

    // If user is already authenticated as SUPER_ADMIN, allow access
    if (req.user?.role === 'SUPER_ADMIN') {
      return next();
    }

    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_MAINTENANCE',
        message: 'The B.Tech AI Learning Platform is undergoing scheduled maintenance. Please check back shortly.',
        request_id: req.id,
      },
    });
  } catch (err) {
    // If DB check fails, proceed safely
    next();
  }
}
