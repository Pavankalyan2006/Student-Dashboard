import { Request, Response, NextFunction } from 'express';
import { Security, TokenPayload } from '../core/security';
import { AuthenticationError, AuthorizationError } from '../core/exceptions';
import { db } from '../db/database';
import { UserRole } from '../models/types';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // Check Bearer authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return next(); // Unauthenticated, proceeding; routes needing auth will call requireAuth
    }

    const payload = Security.verifyAccessToken(token);

    // Verify account is active and not suspended in database
    const student = await db.getStudentById(payload.userId);
    if (!student || !student.is_active || student.status === 'SUSPENDED' || student.status === 'DISABLED') {
      const reason = student?.status_reason ? `: ${student.status_reason}` : '';
      return next(new AuthenticationError(`Student account is suspended or inactive${reason}`));
    }

    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AuthenticationError('Authentication token required to access this resource'));
  }
  next();
}

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AuthorizationError(`Access denied: Required role '${roles.join(' or ')}', got '${req.user.role}'`)
      );
    }

    next();
  };
}

export const optionalAuth = authenticate;
