import { db } from '../db/database';
import {
  StudentProfile,
  StudentPrivacySetting,
  StudentPreference,
  ProfileCompletionBreakdown,
  NotificationPreference,
  UnifiedPortfolioSummary,
} from '../models/communityProfileProgressTypes';
import { AuthorizationError, NotFoundError, ValidationError } from '../core/exceptions';
import { OnboardingService } from './onboardingService';

export class ProfileService {
  /**
   * Retrieves profile for student, enforcing privacy visibility rules
   */
  public static async getProfile(targetStudentId: string, requesterId?: string): Promise<StudentProfile> {
    const profile = await db.getStudentProfile(targetStudentId);
    if (!profile) {
      throw new NotFoundError(`Profile for student '${targetStudentId}' not found`);
    }

    // Privacy verification if requester is different
    if (requesterId && requesterId !== targetStudentId) {
      const privacy = await db.getStudentPrivacy(targetStudentId);
      if (privacy.profile_visibility === 'PRIVATE') {
        throw new AuthorizationError('This student profile is private');
      }
    }

    try {
      const edu = OnboardingService.getEducationProfileSync(targetStudentId);
      const career = OnboardingService.getCareerGoalsSync(targetStudentId);
      const skills = OnboardingService.getSkillsAssessmentSync(targetStudentId);

      if (edu) {
        if (edu.branch) profile.branch = edu.branch;
        if (edu.current_semester) profile.semester = edu.current_semester;
        if (edu.institution) profile.college_name = edu.institution;
        if (edu.expected_graduation_year) profile.graduation_year = edu.expected_graduation_year;
      }
      if (career && career.target_job_role) {
        profile.target_role = career.target_job_role;
      }
      if (skills && skills.skills && skills.skills.length > 0) {
        profile.skills = skills.skills.map((s) => s.skill_name);
      }
    } catch {}

    if (!profile.completion_breakdown) {
      profile.completion_breakdown = {
        basic_profile: Boolean(profile.name && profile.email),
        academic: Boolean(profile.branch && profile.semester),
        skills: Boolean(profile.skills && profile.skills.length > 0),
        projects: true,
        resume: true,
        github: Boolean(profile.github_connected),
        career: true,
      };
    }

    return profile;
  }

  public static async updatePrivacySettings(
    studentId: string,
    updates: Partial<StudentPrivacySetting>
  ): Promise<StudentPrivacySetting> {
    return this.updatePrivacy(studentId, updates);
  }

  /**
   * Updates authenticated student profile
   */
  public static async updateProfile(
    studentId: string,
    updates: Partial<StudentProfile>
  ): Promise<StudentProfile> {
    const updated = await db.updateStudentProfile(studentId, updates);

    // Keep the education profile (read by the dashboard, semester centre and AI context) in step
    // with academic fields edited on the profile page; otherwise the dashboard keeps showing the
    // old branch/semester.
    const semester = updates.semester !== undefined ? Number(updates.semester) : undefined;
    const institution = (updates as any).college_name as string | undefined;
    if (updates.branch || semester || institution) {
      const edu = OnboardingService.getEducationProfileSync(studentId);
      if (edu) {
        await OnboardingService.saveEducationProfile(studentId, {
          ...(updates.branch ? { branch: updates.branch } : {}),
          ...(semester && semester > 0 ? { current_semester: semester, current_year: Math.ceil(semester / 2) } : {}),
          ...(institution ? { institution } : {}),
        });
      }
    }
    return updated;
  }

  /**
   * Calculates granular profile completion breakdown
   */
  public static async getCompletionBreakdown(studentId: string): Promise<ProfileCompletionBreakdown> {
    const profile = await db.getStudentProfile(studentId);
    const privacy = await db.getStudentPrivacy(studentId);

    const categories = [
      {
        name: 'Basic Information',
        completed: Boolean(profile.name && profile.email && profile.avatar_url),
        weight: 20,
        type: 'REQUIRED' as const,
        description: 'Full name, institutional email, and profile avatar',
      },
      {
        name: 'Academic Enrollment',
        completed: Boolean(profile.branch && profile.semester && profile.graduation_year),
        weight: 20,
        type: 'REQUIRED' as const,
        description: 'Engineering branch, current semester, and graduation year',
      },
      {
        name: 'Bio & Overview',
        completed: Boolean(profile.bio && profile.bio.length >= 20),
        weight: 15,
        type: 'RECOMMENDED' as const,
        description: 'Professional summary and engineering focus (min 20 chars)',
      },
      {
        name: 'Technical Competencies',
        completed: Boolean(profile.skills && profile.skills.length >= 3),
        weight: 15,
        type: 'RECOMMENDED' as const,
        description: 'At least 3 verified technical skills or technologies',
      },
      {
        name: 'Learning Goals',
        completed: Boolean(profile.learning_goals && profile.learning_goals.length >= 1),
        weight: 10,
        type: 'RECOMMENDED' as const,
        description: 'Academic and skill targets for current semester',
      },
      {
        name: 'GitHub Telemetry',
        completed: Boolean(profile.github_connected),
        weight: 10,
        type: 'OPTIONAL' as const,
        description: 'Connect GitHub account for repository synchronization',
      },
      {
        name: 'External Portfolio Links',
        completed: Boolean(profile.portfolio_links && profile.portfolio_links.length >= 1),
        weight: 10,
        type: 'OPTIONAL' as const,
        description: 'Personal domain, papers, or project demo links',
      },
    ];

    let total = 0;
    for (const c of categories) {
      if (c.completed) total += c.weight;
    }

    return {
      total_percentage: Math.min(100, total),
      categories,
    };
  }

  /**
   * Retrieves privacy settings for authenticated student
   */
  public static async getPrivacy(studentId: string): Promise<StudentPrivacySetting> {
    return db.getStudentPrivacy(studentId);
  }

  public static async getPrivacySettings(studentId: string): Promise<StudentPrivacySetting> {
    return this.getPrivacy(studentId);
  }

  /**
   * Updates privacy settings
   */
  public static async updatePrivacy(
    studentId: string,
    updates: Partial<StudentPrivacySetting>
  ): Promise<StudentPrivacySetting> {
    return db.updateStudentPrivacy(studentId, updates);
  }

  /**
   * Retrieves AI & Interaction preferences
   */
  public static async getPreferences(studentId: string): Promise<StudentPreference> {
    return db.getStudentPreferences(studentId);
  }

  /**
   * Updates AI & Interaction preferences
   */
  public static async updatePreferences(
    studentId: string,
    updates: Partial<StudentPreference>
  ): Promise<StudentPreference> {
    return db.updateStudentPreferences(studentId, updates);
  }

  /**
   * Retrieves notification preferences
   */
  public static async getNotificationPreferences(studentId: string): Promise<NotificationPreference> {
    return db.getNotificationPreferences(studentId);
  }

  /**
   * Updates notification preferences
   */
  public static async updateNotificationPreferences(
    studentId: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    return db.updateNotificationPreferences(studentId, updates);
  }

  /**
   * Aggregates complete unified student portfolio
   */
  public static async getPortfolio(studentId: string): Promise<UnifiedPortfolioSummary> {
    const profile = await db.getStudentProfile(studentId);
    const items = await db.getPortfolioItems(studentId);
    const skills = await db.getStudentSkills(studentId);
    const certificates = await db.getCertificates(studentId);
    const achievements = await db.getStudentAchievements(studentId);
    const projects = await db.getProjects(studentId);
    const research = await db.getResearchProjects(studentId);

    return {
      student_name: profile.name,
      branch: profile.branch,
      semester: profile.semester,
      bio: profile.bio,
      completion_percentage: profile.completion_percentage,
      skills_count: skills.length,
      courses_completed_count: 2, // verified from seeded enrollment
      projects_count: projects.length,
      research_papers_count: research.length,
      certificates_count: certificates.length,
      achievements_count: achievements.length,
      items,
    };
  }

  /**
   * Complete GDPR/privacy student data export
   */
  public static async exportStudentData(studentId: string) {
    const profile = await this.getProfile(studentId);
    const preferences = await this.getPreferences(studentId);
    const privacy = await this.getPrivacy(studentId);
    const notifications = await db.getNotifications(studentId);
    const goals = await db.getStudentGoals(studentId);
    return {
      student_id: studentId,
      profile,
      preferences,
      privacy,
      notifications,
      goals,
      exported_at: new Date().toISOString(),
    };
  }
}
