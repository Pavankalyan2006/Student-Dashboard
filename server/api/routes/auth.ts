import { Router } from 'express';
import { db } from '../../db/database';
import { Security } from '../../core/security';
import { AuthenticationError, ValidationError } from '../../core/exceptions';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../core/exceptions';
import { config } from '../../core/config';
import { IdentityService, checkPasswordStrength } from '../../services/studentProfile/identityService';
import { StudentProfileService, requireVerifiedEmail } from '../../services/studentProfile/studentProfileService';
import type { Request, Response, NextFunction } from 'express';

export const authRouter = Router();

// Phase 5: small fixed-window limiter for credential endpoints (per IP + route, and per email for login).
const attemptBuckets = new Map<string, { count: number; resetAt: number }>();
export function authAttemptLimiter(name: string, max: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (process.env.VITEST && !process.env.AUTH_RATE_LIMIT_IN_TESTS) return next();
    const now = Date.now();
    const keys = [`${name}:ip:${req.ip}`];
    if (typeof req.body?.email === 'string') keys.push(`${name}:email:${req.body.email.trim().toLowerCase()}`);
    for (const key of keys) {
      const b = attemptBuckets.get(key);
      if (!b || b.resetAt < now) attemptBuckets.set(key, { count: 1, resetAt: now + windowMs });
      else if (++b.count > max) {
        return next(new AppError('Too many attempts. Please wait a few minutes and try again.', 429, 'RATE_LIMITED'));
      }
    }
    next();
  };
}
export function resetAuthAttemptLimiter() {
  attemptBuckets.clear();
}

function legacyPasswordAuthDisabled() {
  return new AppError('Password sign-in is handled by Firebase on this server.', 409, 'PASSWORD_AUTH_DISABLED');
}

authRouter.post('/auth/login', authAttemptLimiter('login', 10, 15 * 60 * 1000), async (req, res, next) => {
  try {
    if (config.authProvider === 'firebase') throw legacyPasswordAuthDisabled();
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const student = await db.getStudentByEmail(email);
    if (!student) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check all account status states (most specific first)
    const accountStatus = student.status || (student.is_active ? 'ACTIVE' : 'SUSPENDED');
    if (accountStatus === 'SUSPENDED') {
      const reason = student.status_reason ? `: ${student.status_reason}` : '';
      throw new AuthenticationError(`Your account has been suspended${reason}. Please contact your administrator.`);
    }
    if (accountStatus === 'DISABLED') {
      throw new AuthenticationError('This account has been permanently disabled. Please contact your administrator.');
    }
    if (accountStatus === 'PENDING') {
      throw new AuthenticationError('Your account is pending approval. Please contact your administrator.');
    }
    if (!student.is_active) {
      throw new AuthenticationError('Your account is inactive. Please contact your administrator.');
    }

    // Accounts linked to Firebase have no local password.
    const isMatch = student.password_hash ? await Security.comparePassword(String(password), student.password_hash) : false;
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokenPayload = {
      userId: student.id,
      email: student.email,
      role: student.role,
      name: student.name,
    };

    const accessToken = Security.generateAccessToken(tokenPayload);
    const refreshToken = Security.generateRefreshToken(tokenPayload);

    // Set secure HTTP-only cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        student: db.toSafeStudent(student),
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/auth/register', authAttemptLimiter('register', 20, 60 * 60 * 1000), async (req, res, next) => {
  try {
    if (config.authProvider === 'firebase') {
      throw new AppError(
        'Accounts are created with Firebase sign-up on this server. Use the registration form, which signs you up with Firebase.',
        409,
        'PASSWORD_AUTH_DISABLED'
      );
    }
    const student = await IdentityService.registerLegacy(req.body || {});
    const tokenPayload = { userId: student.id, email: student.email, role: student.role, name: student.name };
    const accessToken = Security.generateAccessToken(tokenPayload);
    const refreshToken = Security.generateRefreshToken(tokenPayload);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.status(201).json({ success: true, data: { token: accessToken, refreshToken, student } });
  } catch (err) {
    next(err);
  }
});

// Phase 5: tells the browser which provider owns credentials on this server.
authRouter.get('/auth/config', (_req, res) => {
  res.json({
    success: true,
    data: {
      provider: config.authProvider,
      email_verification_required: requireVerifiedEmail(),
      profile_store: config.profileStore,
    },
  });
});

/**
 * Phase 5: Firebase session bootstrap. Called by the browser after every Firebase sign-up/sign-in
 * with the Firebase ID token as the bearer token. Verifies the token (middleware), then finds or
 * creates the student (idempotent; safe to retry after a failure) and returns the profile.
 */
authRouter.post('/auth/firebase/session', authAttemptLimiter('firebase-session', 60, 15 * 60 * 1000), async (req, res, next) => {
  try {
    if (!req.firebaseUser) throw new AuthenticationError('A valid Firebase ID token is required');
    const body = req.body || {};
    const result = await IdentityService.bootstrapFirebaseStudent(req.firebaseUser, {
      full_name: body.full_name,
      accept_terms: body.accept_terms,
      accept_privacy: body.accept_privacy,
      phone: body.phone,
    });
    const header = req.headers.authorization;
    const idToken = header && header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.access_token;
    if (idToken) {
      // Same Firebase token as an httpOnly cookie for plain links (downloads, previews). No second session.
      res.cookie('access_token', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });
    }
    const { profile, completion } = await StudentProfileService.getProfile(result.student.id);
    res.status(result.created ? 201 : 200).json({
      success: true,
      data: { student: result.student, created: result.created, linked: result.linked, profile, completion },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/auth/logout', (_req, res) => {
  res.clearCookie('access_token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

authRouter.get('/auth/me', requireAuth, async (req, res, next) => {
  try {
    const student = await db.getStudentById(req.user!.userId);
    if (!student) {
      throw new AuthenticationError('Student account not found');
    }

    res.json({
      success: true,
      data: {
        student: db.toSafeStudent(student),
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/auth/refresh', async (req, res, next) => {
  try {
    if (config.authProvider === 'firebase') throw legacyPasswordAuthDisabled();
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError('Refresh token required');
    }

    const payload = Security.verifyRefreshToken(refreshToken);
    const student = await db.getStudentById(payload.userId);
    if (!student || !student.is_active) {
      throw new AuthenticationError('Inactive or invalid student account');
    }

    const newAccessToken = Security.generateAccessToken({
      userId: student.id,
      email: student.email,
      role: student.role,
      name: student.name,
    });

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/auth/change-password', requireAuth, async (req, res, next) => {
  try {
    if (config.authProvider === 'firebase') throw legacyPasswordAuthDisabled();
    const studentId = req.user!.userId;
    const { oldPassword, currentPassword, newPassword } = req.body;
    const oldPass = oldPassword || currentPassword;

    if (!oldPass || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    checkPasswordStrength(newPassword, req.user!.email);

    const student = await db.getStudentById(studentId);
    if (!student) {
      throw new AuthenticationError('Student account not found');
    }

    const isMatch = await Security.comparePassword(oldPass, student.password_hash);
    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const newHash = await Security.hashPassword(newPassword);
    await db.updateStudentPassword(studentId, newHash);

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
});

