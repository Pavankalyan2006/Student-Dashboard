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

export async function authenticate(req: Request, res: Response, next: NextFunction) {
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

    try {
      const payload = Security.verifyAccessToken(token);

      // Verify account is active and not suspended or pending in database
      const student = await db.getStudentById(payload.userId);
      if (!student || !student.is_active || student.status === 'SUSPENDED' || student.status === 'DISABLED' || student.status === 'PENDING') {
        const reason = student?.status_reason ? `: ${student.status_reason}` : '';
        if (req.cookies && req.cookies.access_token) {
          res.clearCookie('access_token');
        }
        if (req.path.startsWith('/api')) {
          return next(new AuthenticationError(`Student account is suspended, pending approval, or inactive${reason}`));
        }
        return next();
      }

      req.user = payload;
      return next();
    } catch (tokenErr) {
      // Clear expired or invalid cookie so subsequent requests are clean
      if (req.cookies && req.cookies.access_token) {
        res.clearCookie('access_token');
      }

      // If this is a page navigation or static asset request (non-API), do NOT return a JSON error!
      // Proceed to the SPA/Vite handler so the browser loads the UI and redirects to /login.
      if (!req.path.startsWith('/api')) {
        return next();
      }

      // If this is a public auth endpoint (e.g. login, register), allow the request through so user can authenticate.
      if (
        req.path === '/api/v1/auth/login' ||
        req.path === '/api/v1/auth/register' ||
        req.path === '/api/v1/auth/refresh'
      ) {
        return next();
      }

      // If an explicit Authorization header was provided to an API endpoint, forward the token error.
      if (authHeader) {
        return next(tokenErr);
      }
      return next();
    }
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
