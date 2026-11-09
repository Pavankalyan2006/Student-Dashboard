import { Request, Response, NextFunction } from 'express';
import { Security, TokenPayload } from '../core/security';
import { AuthenticationError, AuthorizationError } from '../core/exceptions';
import { db } from '../db/database';
import { UserRole } from '../models/types';
import { config } from '../core/config';
import {
  isFirebaseAuthEnabled,
  looksLikeFirebaseIdToken,
  verifyFirebaseIdToken,
  VerifiedFirebaseUser,
  FirebaseUnavailableError,
} from '../auth/firebaseAdmin';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      /** Phase 5: set when the request carries a valid Firebase ID token (even before the student record exists). */
      firebaseUser?: VerifiedFirebaseUser;
    }
  }
}

const PUBLIC_AUTH_PATHS = new Set(['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh', '/api/v1/auth/config']);

/**
 * Phase 5: Firebase ID token path. The token is verified with the Firebase Admin SDK; the student is
 * resolved from the verified uid, never from anything the client sends.
 */
async function authenticateFirebase(req: Request, res: Response, next: NextFunction, token: string, fromHeader: boolean) {
  let user: VerifiedFirebaseUser;
  try {
    user = await verifyFirebaseIdToken(token);
  } catch (err) {
    if (req.cookies?.access_token && !(err instanceof FirebaseUnavailableError)) res.clearCookie('access_token');
    if (!req.path.startsWith('/api')) return next();
    if (err instanceof FirebaseUnavailableError) return next(err);
    if (PUBLIC_AUTH_PATHS.has(req.path)) return next();
    return fromHeader ? next(err) : next();
  }
  req.firebaseUser = user;
  const { findStudentByFirebaseUid } = await import('../services/studentProfile/identityService');
  const student = await findStudentByFirebaseUid(user.uid);
  if (!student) return next(); // not provisioned yet: only POST /auth/firebase/session will accept this
  if (!student.is_active || student.status === 'SUSPENDED' || student.status === 'DISABLED' || student.status === 'PENDING') {
    if (req.path.startsWith('/api')) return next(new AuthenticationError('Student account is suspended, pending approval, or inactive'));
    return next();
  }
  if (user.email_verified && !student.email_verified) student.email_verified = true;
  req.user = { userId: student.id, email: student.email, role: student.role, name: student.name };
  return next();
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

    if (isFirebaseAuthEnabled() && looksLikeFirebaseIdToken(token)) {
      return authenticateFirebase(req, res, next, token, Boolean(authHeader));
    }
    if (config.authProvider === 'firebase') {
      // One authoritative provider: once Firebase is configured, tokens from the old provider are not accepted.
      if (req.cookies?.access_token) res.clearCookie('access_token');
      if (!req.path.startsWith('/api') || PUBLIC_AUTH_PATHS.has(req.path) || !authHeader) return next();
      return next(new AuthenticationError('Please sign in again.'));
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
