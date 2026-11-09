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
import { StudentProfileService } from './studentProfile/studentProfileService';
import { readCanonicalProfile } from './studentProfile/profileCache';
import { computeCompletion } from './studentProfile/completion';

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

    // Phase 5: completion comes from the central profile, never from fixed values.
    const canonical = readCanonicalProfile(targetStudentId);
    if (canonical) {
      const c = computeCompletion(canonical);
      const done = (k: string) => Boolean(c.sections.find((x) => x.key === k)?.complete && (c.sections.find((x) => x.key === k)?.percentage ?? 0) > 0);
      profile.completion_percentage = c.overall_percentage;
      profile.completion_breakdown = {
        basic_profile: Boolean(canonical.identity.full_name && canonical.identity.email),
        academic: done('academic'),
        skills: canonical.skills.skills.length > 0,
        projects: canonical.experience.projects.length > 0 || canonical.experience.experience.length > 0,
        resume: Boolean(profile.completion_breakdown?.resume),
        github: Boolean(profile.github_connected),
        career: canonical.career.target_roles.length > 0 || canonical.career.career_interests.length > 0,
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
    // Phase 5: identity and academic fields edited from the older profile form go through the
    // central profile service (validated, persisted, versioned) so every module sees the change.
    const identity: Record<string, unknown> = {};
    if (updates.name !== undefined) identity.full_name = updates.name;
    if (updates.avatar_url !== undefined) identity.avatar_url = updates.avatar_url;
    if ((updates as any).display_name !== undefined) identity.display_name = (updates as any).display_name;
    if (Object.keys(identity).length) await StudentProfileService.updateSection(studentId, 'identity', identity);

    const academic: Record<string, unknown> = {};
    if (updates.branch !== undefined) academic.branch = updates.branch;
    if (updates.semester !== undefined) {
      const sem = Number(updates.semester);
      academic.current_semester = sem;
      if (Number.isInteger(sem) && sem > 0) academic.academic_year = Math.ceil(sem / 2);
    }
    if ((updates as any).college_name !== undefined) academic.college = (updates as any).college_name;
    if (updates.graduation_year !== undefined) academic.expected_graduation_year = Number(updates.graduation_year);
    if (Object.keys(academic).length) await StudentProfileService.updateSection(studentId, 'academic', academic);

    const rest: Partial<StudentProfile> = { ...updates };
    for (const k of ['name', 'avatar_url', 'branch', 'semester', 'college_name', 'graduation_year', 'student_id', 'id', 'email', 'completion_percentage']) {
      delete (rest as any)[k];
    }
    const card = await db.updateStudentProfile(studentId, rest);
    const canonical = readCanonicalProfile(studentId);
    return canonical ? { ...card, completion_percentage: computeCompletion(canonical).overall_percentage } : card;
  }

  /**
   * Calculates granular profile completion breakdown
   */
  public static async getCompletionBreakdown(studentId: string): Promise<ProfileCompletionBreakdown> {
    // Phase 5: same calculation as GET /profile/me/completion, in the shape the older pages read.
    const canonical = readCanonicalProfile(studentId);
    if (!canonical) throw new NotFoundError('Profile not found');
    const report = computeCompletion(canonical);
    return {
      total_percentage: report.overall_percentage,
      categories: report.sections.map((sec) => ({
        name: sec.label,
        completed: sec.percentage === 100,
        weight: Math.round(100 / report.sections.length),
        type: sec.items.some((i) => i.required) ? ('REQUIRED' as const) : ('RECOMMENDED' as const),
        description: sec.missing_recommended.length ? `Missing: ${sec.missing_recommended.join(', ')}` : 'Complete',
      })),
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
    // Phase 5: the preferred language lives in the central learning preferences; keep one value.
    if (updates.preferred_language) {
      const current = readCanonicalProfile(studentId);
      const others = (current?.learning.preferred_languages || []).filter((l) => l !== updates.preferred_language);
      await StudentProfileService.updateSection(studentId, 'learning', { preferred_languages: [updates.preferred_language, ...others] });
    }
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
      courses_completed_count: Array.from(((db as any).enrollments as Map<string, any>).values()).filter((e) => e.student_id === studentId && e.status === 'COMPLETED').length,
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
