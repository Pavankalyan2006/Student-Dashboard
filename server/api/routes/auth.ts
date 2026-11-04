import { Router } from 'express';
import { db } from '../../db/database';
import { Security } from '../../core/security';
import { AuthenticationError, ValidationError } from '../../core/exceptions';
import { requireAuth } from '../../middleware/auth';
import { OnboardingService } from '../../services/onboardingService';

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

authRouter.post('/auth/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      degree,
      branch,
      semester,
      admission_year,
      institution,
      roll_number,
      target_role,
      learning_goal,
    } = req.body;

    if (!name || !email || !password) {
      throw new ValidationError('Name, academic email, and password are required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      throw new ValidationError('Please enter a valid email address');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existingStudent = await db.getStudentByEmail(trimmedEmail);
    if (existingStudent) {
      throw new ValidationError('An account with this email address already exists. Please sign in instead.');
    }

    const passwordHash = await Security.hashPassword(password);
    const sem = Number(semester) || 1;
    const brn = branch || 'Computer Science & Engineering';
    const deg = degree || 'B.Tech';

    const newStudent = await db.createStudent({
      name: name.trim(),
      display_name: req.body.display_name ? req.body.display_name.trim() : name.trim().split(' ')[0],
      avatar_url: req.body.avatar_url || undefined,
      email: trimmedEmail,
      password_hash: passwordHash,
      branch: brn,
      semester: sem,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
      onboarding_completed: false,
    } as any);

    // Initialize their education profile in OnboardingService
    try {
      await OnboardingService.saveEducationProfile(newStudent.id, {
        degree: deg,
        branch: brn,
        institution: institution || 'B.Tech Engineering College',
        current_year: Math.ceil(sem / 2),
        current_semester: sem,
        admission_year: admission_year || new Date().getFullYear() - Math.floor((sem - 1) / 2),
        expected_graduation_year: (admission_year || new Date().getFullYear()) + 4,
        study_mode: 'FULL_TIME',
      });

      if (target_role) {
        await OnboardingService.saveCareerGoals(newStudent.id, {
          target_job_role: target_role,
          career_directions: [target_role.includes('AI') ? 'AI_ML' : target_role.includes('Data') ? 'DATA_SCIENCE' : 'SOFTWARE_DEVELOPMENT'],
        });
        await OnboardingService.updateOnboardingStep(newStudent.id, 'CAREER_GOALS', true, false);
      }

      if (learning_goal) {
        await OnboardingService.saveAcademicHistory(newStudent.id, {
          previous_goals: [learning_goal],
        });
      }

      await OnboardingService.updateOnboardingStep(newStudent.id, 'BASIC_PROFILE', true, false);
      await OnboardingService.updateOnboardingStep(newStudent.id, 'EDUCATION', true, false);
    } catch (e) {
      // Non-blocking
    }

    const tokenPayload = {
      userId: newStudent.id,
      email: newStudent.email,
      role: newStudent.role,
      name: newStudent.name,
    };

    const accessToken = Security.generateAccessToken(tokenPayload);
    const refreshToken = Security.generateRefreshToken(tokenPayload);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        student: newStudent,
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

authRouter.post('/auth/change-password', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { oldPassword, currentPassword, newPassword } = req.body;
    const oldPass = oldPassword || currentPassword;

    if (!oldPass || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters');
    }

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

