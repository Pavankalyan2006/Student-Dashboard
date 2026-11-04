// src/tests/external_profiles_master.test.ts
// Comprehensive Test Suite for External Profiles & Platforms Management

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SUPPORTED_EXTERNAL_PLATFORMS,
  ExternalProfileValidator,
} from '../../server/services/externalProfilesCatalog';
import { ExternalProfilesService } from '../../server/services/externalProfilesService';
import { db } from '../../server/db/database';
import {
  ExternalPlatformId,
  CreateExternalProfilePayload,
} from '../../server/models/externalProfileTypes';

describe('External Profiles & Platforms - Comprehensive Test Suite', () => {
  const testStudentId = `test_student_${Date.now()}`;

  describe('1. Platform Catalog & Metadata', () => {
    it('contains all 24 supported external platforms with complete metadata', () => {
      expect(SUPPORTED_EXTERNAL_PLATFORMS.length).toBe(24);

      const expectedIds: ExternalPlatformId[] = [
        'github',
        'gitlab',
        'bitbucket',
        'leetcode',
        'hackerrank',
        'codechef',
        'codeforces',
        'atcoder',
        'geeksforgeeks',
        'hackerearth',
        'exercism',
        'linkedin',
        'portfolio_website',
        'github_pages',
        'behance',
        'dribbble',
        'topcoder',
        'google_scholar',
        'orcid',
        'researchgate',
        'kaggle',
        'huggingface',
        'figma',
        'custom_link',
      ];

      for (const id of expectedIds) {
        const platform = SUPPORTED_EXTERNAL_PLATFORMS.find((p) => p.id === id);
        expect(platform).toBeDefined();
        expect(platform?.name).toBeTruthy();
        expect(platform?.category).toBeTruthy();
        expect(platform?.official_url).toBeTruthy();
        expect(platform?.privacy_notes).toBeTruthy();
        expect(platform?.available_data_fields.length).toBeGreaterThan(0);
      }
    });

    it('covers all 7 primary platform categories', () => {
      const categories = new Set(SUPPORTED_EXTERNAL_PLATFORMS.map((p) => p.category));
      expect(categories.has('DEVELOPER_CODE_HOSTING')).toBe(true);
      expect(categories.has('CODING_PRACTICE')).toBe(true);
      expect(categories.has('PROFESSIONAL_NETWORKING')).toBe(true);
      expect(categories.has('PORTFOLIO_PROJECT')).toBe(true);
      expect(categories.has('COMPETITIVE_PROGRAMMING')).toBe(true);
      expect(categories.has('ACADEMIC_RESEARCH')).toBe(true);
      expect(categories.has('DESIGN_DATA_SPECIALIZED')).toBe(true);
    });

    it('filters catalog by category and search query correctly', () => {
      const codingPlatforms = ExternalProfilesService.listSupportedPlatforms('CODING_PRACTICE');
      expect(codingPlatforms.length).toBeGreaterThan(0);
      expect(codingPlatforms.some((p) => p.id === 'leetcode')).toBe(true);

      const searched = ExternalProfilesService.listSupportedPlatforms(undefined, 'github');
      expect(searched.length).toBeGreaterThanOrEqual(1);
      expect(searched.some((p) => p.id === 'github')).toBe(true);
    });
  });

  describe('2. URL & Handle Validation with SSRF Protection', () => {
    it('validates and normalizes GitHub URLs and usernames', () => {
      const res1 = ExternalProfileValidator.validateProfile('github', 'https://github.com/torvalds');
      expect(res1.valid).toBe(true);
      expect(res1.username).toBe('torvalds');
      expect(res1.normalized_url).toBe('https://github.com/torvalds');

      const res2 = ExternalProfileValidator.validateProfile('github', 'torvalds');
      expect(res2.valid).toBe(true);
      expect(res2.username).toBe('torvalds');
      expect(res2.normalized_url).toBe('https://github.com/torvalds');
    });

    it('validates and normalizes LeetCode URLs and handles', () => {
      const res = ExternalProfileValidator.validateProfile('leetcode', 'https://leetcode.com/u/neal_wu');
      expect(res.valid).toBe(true);
      expect(res.username).toBe('neal_wu');
      expect(res.normalized_url).toBe('https://leetcode.com/u/neal_wu');
    });

    it('validates and normalizes Codeforces handles and profile links', () => {
      const res1 = ExternalProfileValidator.validateProfile('codeforces', 'tourist');
      expect(res1.valid).toBe(true);
      expect(res1.username).toBe('tourist');
      expect(res1.normalized_url).toBe('https://codeforces.com/profile/tourist');

      const res2 = ExternalProfileValidator.validateProfile('codeforces', 'https://codeforces.com/profile/tourist');
      expect(res2.valid).toBe(true);
      expect(res2.username).toBe('tourist');
    });

    it('validates and normalizes ORCID iDs', () => {
      const res = ExternalProfileValidator.validateProfile('orcid', '0000-0002-1825-0097');
      expect(res.valid).toBe(true);
      expect(res.username).toBe('0000-0002-1825-0097');
      expect(res.normalized_url).toBe('https://orcid.org/0000-0002-1825-0097');
    });

    it('blocks dangerous URL schemes and SSRF attempts', () => {
      // JavaScript scheme
      const resJs = ExternalProfileValidator.validateProfile('portfolio_website', 'javascript:alert(1)');
      expect(resJs.valid).toBe(false);

      // File scheme
      const resFile = ExternalProfileValidator.validateProfile('portfolio_website', 'file:///etc/passwd');
      expect(resFile.valid).toBe(false);

      // Localhost SSRF
      const resLocal = ExternalProfileValidator.validateProfile('portfolio_website', 'http://localhost:3000/admin');
      expect(resLocal.valid).toBe(false);

      // Private IP loopback
      const resIp = ExternalProfileValidator.validateProfile('portfolio_website', 'http://127.0.0.1:8080');
      expect(resIp.valid).toBe(false);

      // Private RFC 1918 range
      const resPrivate = ExternalProfileValidator.validateProfile('portfolio_website', 'http://192.168.1.100');
      expect(resPrivate.valid).toBe(false);

      // Domain mismatch for platform
      const resMismatch = ExternalProfileValidator.validateProfile('github', 'https://gitlab.com/username');
      expect(resMismatch.valid).toBe(false);
      expect(resMismatch.error).toContain('github.com');
    });
  });

  describe('3. Profile CRUD, Deduplication & Verification Lifecycle', () => {
    let createdProfileId: string;

    it('adds a new external profile with valid payload', async () => {
      const payload: CreateExternalProfilePayload = {
        platform_id: 'github',
        profile_url: 'https://github.com/octocat',
        display_name: 'Octocat Core',
        sharing_settings: {
          use_for_resume: true,
          use_for_career: true,
          use_for_job_matching: true,
          use_for_skill_gap: true,
          include_in_resume_links: true,
          include_in_public_portfolio: false,
        },
      };

      const profile = await ExternalProfilesService.addProfile(testStudentId, payload);
      expect(profile).toBeDefined();
      expect(profile.id).toBeTruthy();
      expect(profile.student_id).toBe(testStudentId);
      expect(profile.platform_id).toBe('github');
      expect(profile.username).toBe('octocat');
      expect(profile.verification_status).toBe('MANUALLY_ADDED');
      expect(['CONNECTED', 'SYNCED']).toContain(profile.connection_status);

      createdProfileId = profile.id;
    });

    it('prevents adding duplicate profiles for the same platform and user', async () => {
      const duplicatePayload: CreateExternalProfilePayload = {
        platform_id: 'github',
        profile_url: 'octocat',
      };

      await expect(
        ExternalProfilesService.addProfile(testStudentId, duplicatePayload)
      ).rejects.toThrow(/already exists/i);
    });

    it('updates profile display name and privacy settings', async () => {
      const updated = await ExternalProfilesService.updateProfile(testStudentId, createdProfileId, {
        display_name: 'Octocat Main Repositories',
        sharing_settings: {
          include_in_public_portfolio: true,
        },
      });

      expect(updated.display_name).toBe('Octocat Main Repositories');
      expect(updated.sharing_settings.include_in_public_portfolio).toBe(true);
      expect(updated.sharing_settings.use_for_resume).toBe(true); // preserved
    });

    it('starts challenge verification with 24h expiration token', async () => {
      const challenge = await ExternalProfilesService.startChallengeVerification(
        testStudentId,
        createdProfileId
      );

      expect(challenge.token).toMatch(/^btech-verify-[a-f0-9]{8}$/);
      expect(new Date(challenge.expires_at).getTime()).toBeGreaterThan(Date.now());
      expect(challenge.instructions).toContain(challenge.token);

      const profile = await ExternalProfilesService.getProfileById(testStudentId, createdProfileId);
      expect(profile.verification_status).toBe('PENDING_VERIFICATION');
      expect(profile.verification_challenge_token).toBe(challenge.token);
    });

    it('checks challenge verification and marks profile VERIFIED when token matches', async () => {
      const result = await ExternalProfilesService.checkChallengeVerification(
        testStudentId,
        createdProfileId
      );

      expect(result.verified).toBe(true);
      expect(result.profile.verification_status).toBe('VERIFIED');
    });

    it('records sync run and snapshot during profile synchronization', async () => {
      const { profile, syncRun } = await ExternalProfilesService.syncProfile(
        testStudentId,
        createdProfileId
      );

      expect(profile).toBeDefined();
      expect(syncRun).toBeDefined();
      expect(syncRun.profile_id).toBe(createdProfileId);
      expect(syncRun.student_id).toBe(testStudentId);
      expect(syncRun.records_updated).toBeGreaterThanOrEqual(0);

      const history = await ExternalProfilesService.getProfileHistory(
        testStudentId,
        createdProfileId
      );
      expect(history.length).toBeGreaterThanOrEqual(1);
    });

    it('calculates real dashboard statistics without fabrication', async () => {
      const stats = await ExternalProfilesService.getDashboardStats(testStudentId);
      expect(stats.total_connected).toBe(1);
      expect(stats.verified_profiles).toBe(1);
      expect(stats.reconnection_required).toBe(0);
      expect(stats.never_synced).toBe(0);
      expect(stats.last_successful_sync).toBeDefined();
    });

    it('generates consented summary for Resume and Job Discovery based on privacy toggles', async () => {
      const resumeSummary = await ExternalProfilesService.getConsentedProfileSummary(
        testStudentId,
        'resume'
      );
      expect(resumeSummary.verified_links.length).toBe(1);
      expect(resumeSummary.verified_links[0].platform).toBe('github');

      // Now disable use_for_resume and verify it drops out cleanly
      await ExternalProfilesService.updateProfile(testStudentId, createdProfileId, {
        sharing_settings: { use_for_resume: false },
      });

      const updatedResumeSummary = await ExternalProfilesService.getConsentedProfileSummary(
        testStudentId,
        'resume'
      );
      expect(updatedResumeSummary.verified_links.length).toBe(0);
    });

    it('deletes external profile cleanly', async () => {
      const deleted = await ExternalProfilesService.deleteProfile(testStudentId, createdProfileId);
      expect(deleted).toBe(true);

      const remaining = await ExternalProfilesService.getStudentProfiles(testStudentId);
      expect(remaining.length).toBe(0);
    });
  });
});
