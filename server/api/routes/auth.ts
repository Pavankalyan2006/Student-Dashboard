import { Router } from 'express';
import { db } from '../../db/database';
import { Security } from '../../core/security';
import { AuthenticationError, ValidationError } from '../../core/exceptions';
import { requireAuth } from '../../middleware/auth';

export const authRouter = Router();

authRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const student = await db.getStudentByEmail(email);
    if (!student) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!student.is_active) {
      throw new AuthenticationError('Your account has been deactivated. Please contact administrator.');
    }

    const isMatch = await Security.comparePassword(password, student.password_hash);
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
