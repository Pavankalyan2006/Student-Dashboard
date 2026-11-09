// server/services/externalProfilesService.ts
// Comprehensive business logic for External Profiles: validation, adapters, challenge verification, sync, privacy, and cross-module export

import { githubVerification } from './platformVerification';
import crypto from 'crypto';
import {
  ExternalPlatformId,
  ExternalPlatformCategory,
  StudentExternalProfile,
  ExternalProfileSnapshot,
  ExternalProfileSyncRun,
  ExternalProfilesDashboardStats,
  CreateExternalProfilePayload,
  UpdateExternalProfilePayload,
  ExternalPlatformMeta,
} from '../models/externalProfileTypes';
import {
  SUPPORTED_EXTERNAL_PLATFORMS,
  ExternalProfileValidator,
} from './externalProfilesCatalog';
import {
  ExternalProfileAdapterRegistry,
} from './externalProfileAdapters';
import { db } from '../db/database';
import { ValidationError, NotFoundError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class ExternalProfilesService {
  /**
   * List all supported external platforms in catalog
   */
  public static listSupportedPlatforms(
    category?: ExternalPlatformCategory,
    query?: string
  ): ExternalPlatformMeta[] {
    let list = SUPPORTED_EXTERNAL_PLATFORMS.filter((p) => p.enabled);

    if (category) {
      list = list.filter(
        (p) => p.category === category || (p.secondary_categories && p.secondary_categories.includes(category))
      );
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Get all external profiles connected for a student
   */
  public static async getStudentProfiles(studentId: string): Promise<StudentExternalProfile[]> {
    if (!studentId) throw new AuthorizationError('Authentication required');
    return await db.getExternalProfiles(studentId);
  }

  /**
   * Get a single profile by ID ensuring student ownership
   */
  public static async getProfileById(studentId: string, profileId: string): Promise<StudentExternalProfile> {
    if (!studentId) throw new AuthorizationError('Authentication required');
    const profile = await db.getExternalProfileById(studentId, profileId);
    if (!profile) {
      throw new NotFoundError(`External profile '${profileId}' not found.`);
    }
    if (profile.student_id !== studentId) {
      throw new AuthorizationError('Unauthorized access to external profile.');
    }
    return profile;
  }

  /**
   * Validate a profile URL or handle before adding
   */
  public static validateProfileUrl(platformId: ExternalPlatformId, urlOrHandle: string) {
    return ExternalProfileValidator.validateProfile(platformId, urlOrHandle);
  }

  /**
   * Add a new external profile (manual entry, handle, or public URL)
   */
  public static async addProfile(
    studentId: string,
    payload: CreateExternalProfilePayload
  ): Promise<StudentExternalProfile> {
    if (!studentId) throw new AuthorizationError('Authentication required');
    const { platform_id, profile_url, display_name, sharing_settings } = payload;

    const platformMeta = SUPPORTED_EXTERNAL_PLATFORMS.find((p) => p.id === platform_id);
    if (!platformMeta) {
      throw new ValidationError(`Unsupported external platform '${platform_id}'.`);
    }

    // Validate syntax and normalize URL with SSRF protection
    const validation = ExternalProfileValidator.validateProfile(platform_id, profile_url);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid profile URL or handle.');
    }

    // Check for duplicate profile on this platform for this student
    const existingProfiles = await db.getExternalProfiles(studentId);
    const isDuplicate = existingProfiles.some(
      (p) =>
        p.platform_id === platform_id &&
        (p.normalized_profile_url === validation.normalized_url ||
          (p.username && validation.username && p.username.toLowerCase() === validation.username.toLowerCase()))
    );

    if (isDuplicate) {
      throw new ValidationError(`A profile for ${platformMeta.name} with this URL or username already exists in your workspace.`);
    }

    const profileId = `prof_${platform_id}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    // A client cannot just claim OAuth: GitHub counts only when GitHub verified this student's account (OAuth or token).
    const gh = platform_id === 'github' ? await githubVerification(studentId, validation.username || payload.username) : null;
    const isOAuth = !!gh?.verified;

    const newProfile: StudentExternalProfile = {
      id: profileId,
      student_id: studentId,
      platform_id,
      platform_name: platformMeta.name,
      username: payload.username || validation.username,
      display_name: display_name || validation.username || platformMeta.name,
      original_profile_url: profile_url,
      normalized_profile_url: validation.normalized_url,
      connection_method: isOAuth ? 'OAUTH2' : 'PUBLIC_PROFILE_URL',
      verification_status: isOAuth ? (gh!.method === 'GITHUB_OAUTH' ? 'CONNECTED_OAUTH' : 'VERIFIED') : 'MANUALLY_ADDED',
      // CONNECTED only after verification; a saved link is LINKED.
      connection_status: isOAuth ? 'CONNECTED' : 'LINKED',
      sharing_settings: {
        use_for_resume: sharing_settings?.use_for_resume ?? true,
        use_for_career: sharing_settings?.use_for_career ?? true,
        use_for_job_matching: sharing_settings?.use_for_job_matching ?? true,
        use_for_skill_gap: sharing_settings?.use_for_skill_gap ?? true,
        include_in_resume_links: sharing_settings?.include_in_resume_links ?? true,
        include_in_public_portfolio: sharing_settings?.include_in_public_portfolio ?? false,
      },
      categories: [platformMeta.category, ...(platformMeta.secondary_categories || [])],
      data_categories: platformMeta.available_data_fields,
      created_at: now,
      updated_at: now,
    };

    await db.saveExternalProfile(newProfile);
    logger.info(`External profile added: ${newProfile.platform_id} (${newProfile.username}) for student ${studentId}`);

    // If platform supports synchronization, perform initial sync
    if (platformMeta.sync_supported) {
      try {
        await this.syncProfile(studentId, newProfile.id);
      } catch (err: any) {
        logger.warn(`Initial sync for ${newProfile.id} encountered an issue: ${err.message}`);
      }
    }

    return (await db.getExternalProfileById(studentId, newProfile.id)) || newProfile;
  }

  /**
   * Update profile metadata or privacy sharing settings
   */
  public static async updateProfile(
    studentId: string,
    profileId: string,
    payload: UpdateExternalProfilePayload
  ): Promise<StudentExternalProfile> {
    const profile = await this.getProfileById(studentId, profileId);

    const wasVerified = profile.verification_status === 'VERIFIED' || profile.verification_status === 'CONNECTED_OAUTH';
    const unverify = () => {
      // A different account is no longer the one that was verified.
      if (wasVerified) {
        profile.verification_status = 'MANUALLY_ADDED';
        profile.connection_method = 'PUBLIC_PROFILE_URL';
        profile.connection_status = 'LINKED';
      }
    };
    if (payload.display_name !== undefined) {
      if (typeof payload.display_name !== 'string' || payload.display_name.length > 120) throw new ValidationError('display_name must be text up to 120 characters');
      profile.display_name = payload.display_name;
    }
    if (payload.username !== undefined && payload.username !== profile.username) {
      if (typeof payload.username !== 'string' || payload.username.length > 100) throw new ValidationError('username must be text up to 100 characters');
      profile.username = payload.username;
      unverify();
    }
    if (payload.profile_url !== undefined && payload.profile_url !== profile.original_profile_url) {
      const validation = ExternalProfileValidator.validateProfile(profile.platform_id, payload.profile_url);
      if (!validation.valid) {
        throw new ValidationError(validation.error || 'Invalid profile URL');
      }
      profile.original_profile_url = payload.profile_url;
      profile.normalized_profile_url = validation.normalized_url;
      unverify();
    }

    if (payload.sharing_settings) {
      profile.sharing_settings = {
        ...profile.sharing_settings,
        ...payload.sharing_settings,
      };
    }

    profile.updated_at = new Date().toISOString();
    await db.saveExternalProfile(profile);
    return profile;
  }

  /**
   * Disconnect or remove external profile
   */
  public static async disconnectProfile(studentId: string, profileId: string): Promise<boolean> {
    const profile = await this.getProfileById(studentId, profileId);
    profile.connection_status = 'DISCONNECTED';
    profile.verification_status = 'DISCONNECTED';
    profile.updated_at = new Date().toISOString();
    await db.saveExternalProfile(profile);
    return true;
  }

  /**
   * Permanently delete external profile
   */
  public static async deleteProfile(studentId: string, profileId: string): Promise<boolean> {
    await this.getProfileById(studentId, profileId);
    return await db.deleteExternalProfile(studentId, profileId);
  }

  /**
   * Generate an expiring challenge token for public bio/profile verification
   */
  public static async startChallengeVerification(
    studentId: string,
    profileId: string
  ): Promise<{ token: string; expires_at: string; instructions: string }> {
    const profile = await this.getProfileById(studentId, profileId);
    const platformMeta = SUPPORTED_EXTERNAL_PLATFORMS.find((p) => p.id === profile.platform_id);

    if (!platformMeta || !platformMeta.challenge_verification_supported) {
      throw new ValidationError(`Challenge verification is not supported for ${profile.platform_name}.`);
    }

    const token = `btech-verify-${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    profile.verification_challenge_token = token;
    profile.verification_challenge_expires = expiresAt;
    profile.verification_status = 'PENDING_VERIFICATION';
    profile.updated_at = new Date().toISOString();

    await db.saveExternalProfile(profile);

    let instructions = `Place the verification code '${token}' in your public ${profile.platform_name} bio or profile description.`;
    if (profile.platform_id === 'portfolio_website' || profile.platform_id === 'github_pages') {
      instructions = `Add the following meta tag to your website's <head>: <meta name="btech-verification" content="${token}" /> or include '${token}' anywhere on your homepage text.`;
    }

    return {
      token,
      expires_at: expiresAt,
      instructions,
    };
  }

  /**
   * Check challenge token and mark verified
   */
  public static async checkChallengeVerification(
    studentId: string,
    profileId: string
  ): Promise<{ verified: boolean; message: string; profile: StudentExternalProfile }> {
    const profile = await this.getProfileById(studentId, profileId);

    if (!profile.verification_challenge_token) {
      throw new ValidationError('No active verification challenge. Please start verification first.');
    }

    if (
      profile.verification_challenge_expires &&
      new Date(profile.verification_challenge_expires).getTime() < Date.now()
    ) {
      profile.verification_status = 'CONNECTION_EXPIRED';
      await db.saveExternalProfile(profile);
      throw new ValidationError('Verification token has expired. Please generate a new one.');
    }

    const adapter = ExternalProfileAdapterRegistry.get(profile.platform_id);
    const result = await adapter.verifyChallenge(profile, profile.verification_challenge_token);

    if (result.verified) {
      profile.verification_status = 'VERIFIED';
      profile.connection_status = 'CONNECTED';
      profile.verification_challenge_token = undefined;
      profile.verification_challenge_expires = undefined;
      profile.updated_at = new Date().toISOString();
      await db.saveExternalProfile(profile);
      logger.info(`Profile ${profile.id} successfully verified for student ${studentId}`);
    }

    return {
      verified: result.verified,
      message: result.message,
      profile,
    };
  }

  /**
   * Synchronize data for a single profile using its platform adapter
   */
  public static async syncProfile(
    studentId: string,
    profileId: string
  ): Promise<{ profile: StudentExternalProfile; syncRun: ExternalProfileSyncRun }> {
    const profile = await this.getProfileById(studentId, profileId);
    const adapter = ExternalProfileAdapterRegistry.get(profile.platform_id);

    const startedAt = new Date().toISOString();
    profile.connection_status = 'SYNCING';
    profile.last_attempted_sync = startedAt;
    await db.saveExternalProfile(profile);

    const syncResult = await adapter.sync(studentId, profile);
    const completedAt = new Date().toISOString();

    const runId = `run_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const syncRun: ExternalProfileSyncRun = {
      id: runId,
      profile_id: profile.id,
      student_id: studentId,
      platform_id: profile.platform_id,
      started_at: startedAt,
      completed_at: completedAt,
      status: syncResult.status,
      records_updated: syncResult.recordsUpdated,
      fields_updated: syncResult.fields,
      error_message: syncResult.error,
    };

    await db.recordProfileSyncRun(syncRun);

    const verified = profile.verification_status === 'VERIFIED' || profile.verification_status === 'CONNECTED_OAUTH';
    if (syncResult.status === 'SUCCESS' || syncResult.status === 'PARTIAL') {
      // Public data was read, but the account is only "connected" once ownership is verified.
      profile.connection_status = verified ? 'SYNCED' : 'LINKED';
      profile.last_successful_sync = completedAt;
      profile.last_error_summary = undefined;

      // Extract metrics summary if available
      if (syncResult.data) {
        const metrics: Record<string, string | number> = {};
        for (const [key, val] of Object.entries(syncResult.data)) {
          if (typeof val === 'string' || typeof val === 'number') {
            metrics[key] = val;
          }
        }
        profile.metrics_summary = metrics;
      }

      // Save snapshot
      const snapshot: ExternalProfileSnapshot = {
        id: `snap_${Date.now()}`,
        profile_id: profile.id,
        student_id: studentId,
        platform_id: profile.platform_id,
        retrieved_at: completedAt,
        normalized_data: syncResult.data,
        data_provenance: profile.connection_method === 'OAUTH2' ? 'OAUTH' : 'API',
        schema_version: '1.0.0',
      };
      await db.saveProfileSnapshot(snapshot);
    } else if (syncResult.status === 'SKIPPED') {
      // Honest reporting: manual link saved without claiming sync succeeded
      profile.connection_status = verified ? 'CONNECTED' : 'LINKED';
      profile.last_error_summary = syncResult.error;
    } else {
      // A failed import does not change whether the account was verified.
      profile.connection_status = 'FAILED';
      profile.last_error_summary = syncResult.error;
    }

    profile.updated_at = completedAt;
    await db.saveExternalProfile(profile);

    return { profile, syncRun };
  }

  /**
   * Synchronize all eligible profiles for the student sequentially
   */
  public static async syncAllEligibleProfiles(
    studentId: string
  ): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
    results: ExternalProfileSyncRun[];
  }> {
    const profiles = await this.getStudentProfiles(studentId);
    const activeProfiles = profiles.filter((p) => p.connection_status !== 'DISCONNECTED');

    let succeeded = 0;
    let failed = 0;
    let skipped = 0;
    const results: ExternalProfileSyncRun[] = [];

    for (const p of activeProfiles) {
      try {
        const { syncRun } = await this.syncProfile(studentId, p.id);
        results.push(syncRun);
        if (syncRun.status === 'SUCCESS') succeeded++;
        else if (syncRun.status === 'SKIPPED') skipped++;
        else failed++;
      } catch (err: any) {
        failed++;
        logger.error(`Error syncing profile ${p.id}: ${err.message}`);
      }
    }

    return {
      total: activeProfiles.length,
      succeeded,
      failed,
      skipped,
      results,
    };
  }

  /**
   * Get dashboard metrics summary
   */
  public static async getDashboardStats(studentId: string): Promise<ExternalProfilesDashboardStats> {
    return await db.getExternalProfilesStats(studentId);
  }

  /**
   * Get sync run history for a profile
   */
  public static async getProfileHistory(studentId: string, profileId: string): Promise<ExternalProfileSyncRun[]> {
    await this.getProfileById(studentId, profileId);
    return await db.getProfileSyncRuns(profileId);
  }

  /**
   * Get consented profile links and skill evidence for cross-module integration
   * (Used by Resume, Career Recommendations, and Jobs Discovery)
   */
  public static async getConsentedProfileSummary(
    studentId: string,
    context: 'resume' | 'career' | 'jobs'
  ): Promise<{
    verified_links: Array<{ name: string; url: string; platform: string; username: string }>;
    skills_evidence: string[];
  }> {
    const profiles = await db.getExternalProfiles(studentId);
    const active = profiles.filter(
      (p) =>
        p.connection_status !== 'DISCONNECTED' &&
        (p.verification_status === 'VERIFIED' ||
          p.verification_status === 'CONNECTED_OAUTH' ||
          p.verification_status === 'MANUALLY_ADDED')
    );

    const verifiedLinks: Array<{ name: string; url: string; platform: string; username: string }> = [];
    const skillsEvidence: string[] = [];

    for (const p of active) {
      let allowed = false;
      if (context === 'resume' && p.sharing_settings.use_for_resume) allowed = true;
      if (context === 'career' && p.sharing_settings.use_for_career) allowed = true;
      if (context === 'jobs' && p.sharing_settings.use_for_job_matching) allowed = true;

      if (allowed) {
        verifiedLinks.push({
          name: p.platform_name,
          url: p.normalized_profile_url,
          platform: p.platform_id,
          username: p.username,
        });

        if (p.data_categories && p.data_categories.length > 0) {
          skillsEvidence.push(`${p.platform_name}: ${p.data_categories.join(', ')}`);
        }
      }
    }

    return {
      verified_links: verifiedLinks,
      skills_evidence: skillsEvidence,
    };
  }
}
