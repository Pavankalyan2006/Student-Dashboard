import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ProfileService } from '../../services/profileService';
import { ActivityService } from '../../services/activityService';
import { AchievementService } from '../../services/achievementService';
import { CertificateService } from '../../services/certificateService';
import { BookmarkService } from '../../services/bookmarkService';
import { PortfolioService } from '../../services/portfolioService';

export const profileRouter = Router();

// GET /api/v1/profile
profileRouter.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const profile = await ProfileService.getProfile(studentId);
    const breakdown = await ProfileService.getCompletionBreakdown(studentId);
    res.json({
      success: true,
      data: {
        ...profile,
        breakdown,
      },
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/profile
profileRouter.patch('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ProfileService.updateProfile(studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/profile/activity
profileRouter.get('/profile/activity', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { type, startDate, endDate } = req.query;
    const activities = await ActivityService.getActivities(studentId, {
      type: type as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    const streak = await ActivityService.getStreak(studentId);
    res.json({ success: true, data: { activities, streak } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/profile/achievements
profileRouter.get('/profile/achievements', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const all = await AchievementService.getAllAchievements();
    const earned = await AchievementService.getStudentAchievements(studentId);
    res.json({
      success: true,
      data: {
        all,
        earned,
        total_earned: earned.length,
      },
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/profile/certificates
profileRouter.get('/profile/certificates', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const certs = await CertificateService.getCertificates(studentId);
    res.json({ success: true, data: certs });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/profile/bookmarks
profileRouter.get('/profile/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const category = req.query.category as string;
    const bookmarks = await BookmarkService.getBookmarks(studentId, category);
    res.json({ success: true, data: bookmarks });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/profile/settings
profileRouter.get('/profile/settings', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const [preferences, privacy, notificationPreferences] = await Promise.all([
      ProfileService.getPreferences(studentId),
      ProfileService.getPrivacy(studentId),
      ProfileService.getNotificationPreferences(studentId),
    ]);
    res.json({
      success: true,
      data: {
        preferences,
        privacy,
        notifications: notificationPreferences,
      },
    });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/profile/settings/privacy
profileRouter.patch('/profile/settings/privacy', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ProfileService.updatePrivacy(studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/profile/settings/notifications
profileRouter.patch('/profile/settings/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ProfileService.updateNotificationPreferences(studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/portfolio
profileRouter.get('/portfolio', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const portfolio = await ProfileService.getPortfolio(studentId);
    res.json({ success: true, data: portfolio });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// PATCH /api/v1/portfolio/items/:id
profileRouter.patch('/portfolio/items/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await PortfolioService.updatePortfolioItem(req.params.id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
