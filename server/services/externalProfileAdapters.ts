// server/services/externalProfileAdapters.ts
// Platform adapters. Only GitHub (imported repositories) and Codeforces (official public API) import data.

import {
  ExternalPlatformId,
  StudentExternalProfile,
} from '../models/externalProfileTypes';
import { GitHubService } from './githubService';
import { logger } from '../core/logging';
import { fetchOfficialJson, githubVerification, safeFetchText } from './platformVerification';

export interface AdapterSyncResult {
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'SKIPPED';
  fields: string[];
  data: Record<string, any>;
  recordsUpdated: number;
  error?: string;
}

export interface AdapterVerifyResult {
  verified: boolean;
  message: string;
}

export interface PlatformAdapter {
  getPlatformId(): ExternalPlatformId;
  canSync(): boolean;
  sync(studentId: string, profile: StudentExternalProfile): Promise<AdapterSyncResult>;
  verifyChallenge(profile: StudentExternalProfile, token: string): Promise<AdapterVerifyResult>;
}

/**
 * GitHub: data comes from the repositories the student imported through the GitHub module. Ownership is verified by
 * GitHub OAuth / access token, or by a challenge code in the public GitHub bio (checked live through the GitHub API).
 */
export class GitHubAdapter implements PlatformAdapter {
  getPlatformId(): ExternalPlatformId {
    return 'github';
  }

  canSync(): boolean {
    return true;
  }

  async sync(studentId: string, profile: StudentExternalProfile): Promise<AdapterSyncResult> {
    try {
      const gh = await githubVerification(studentId);
      if (gh.username && profile.username && gh.username.toLowerCase() !== profile.username.toLowerCase()) {
        return { status: 'FAILED', fields: [], data: {}, recordsUpdated: 0, error: `Your GitHub module is connected as @${gh.username}, not @${profile.username}, so its repositories are not shown for this profile.` };
      }
      const repos = await GitHubService.listRepositories(studentId, {});
      const languages = Array.from(new Set(repos.map((r) => r.language).filter(Boolean)));
      return {
        status: 'SUCCESS',
        fields: ['imported_repositories', 'primary_languages', 'total_stars', 'top_repositories'],
        data: {
          username: gh.username || profile.username,
          ownership_verified: gh.verified,
          // Counts cover only repositories imported in the GitHub module, not everything on the GitHub account.
          imported_repositories: repos.length,
          primary_languages: languages.slice(0, 5),
          total_stars: repos.reduce((acc, r) => acc + (r.stars || 0), 0),
          total_forks: repos.reduce((acc, r) => acc + (r.forks || 0), 0),
          top_repositories: repos.slice(0, 5).map((r) => ({ name: r.name, language: r.language, stars: r.stars, description: r.description, url: r.url })),
          source: 'Repositories imported in the GitHub module',
          last_synced: new Date().toISOString(),
        },
        recordsUpdated: repos.length,
      };
    } catch (err: any) {
      logger.warn(`GitHubAdapter sync failed for student ${studentId}: ${err.message}`);
      return { status: 'FAILED', fields: [], data: {}, recordsUpdated: 0, error: err.message || 'GitHub sync failed' };
    }
  }

  async verifyChallenge(profile: StudentExternalProfile, token: string): Promise<AdapterVerifyResult> {
    const gh = await githubVerification(profile.student_id, profile.username);
    if (gh.verified) return { verified: true, message: gh.message };
    if (!token || !profile.username) return { verified: false, message: 'No challenge code to look for.' };
    try {
      const user = await fetchOfficialJson(`https://api.github.com/users/${encodeURIComponent(profile.username)}`);
      const text = [user?.bio, user?.name, user?.blog, user?.company].filter(Boolean).join(' ');
      return text.includes(token)
        ? { verified: true, message: `Found the code in the public GitHub profile of @${profile.username}.` }
        : { verified: false, message: `The code was not found in the bio of @${profile.username}. Save it in your GitHub bio and check again.` };
    } catch (err: any) {
      return { verified: false, message: `GitHub could not be reached (${err.message}), so the profile was not verified.` };
    }
  }
}

/**
 * Codeforces: official public API (https://codeforces.com/apiHelp). Sync reads user.info and user.rating; the challenge
 * code must be placed in the first name, last name or organisation field of the Codeforces profile.
 */
export class CodeforcesAdapter implements PlatformAdapter {
  getPlatformId(): ExternalPlatformId {
    return 'codeforces';
  }

  canSync(): boolean {
    return true;
  }

  private static async userInfo(handle: string): Promise<any> {
    const r = await fetchOfficialJson(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
    if (r?.status !== 'OK' || !Array.isArray(r.result) || !r.result[0]) throw new Error(r?.comment || 'Handle not found');
    return r.result[0];
  }

  async sync(studentId: string, profile: StudentExternalProfile): Promise<AdapterSyncResult> {
    if (!profile.username) return { status: 'FAILED', fields: [], data: {}, recordsUpdated: 0, error: 'No Codeforces handle saved.' };
    try {
      const u = await CodeforcesAdapter.userInfo(profile.username);
      const ratingHistory = await fetchOfficialJson(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(profile.username)}`).catch(() => null);
      const contests = ratingHistory?.status === 'OK' && Array.isArray(ratingHistory.result) ? ratingHistory.result.length : null;
      const data: Record<string, any> = {
        handle: u.handle,
        rating: u.rating ?? null,
        max_rating: u.maxRating ?? null,
        rank: u.rank ?? null,
        max_rank: u.maxRank ?? null,
        contests_participated: contests,
        source: 'Codeforces public API',
        last_synced: new Date().toISOString(),
      };
      return { status: 'SUCCESS', fields: Object.keys(data).filter((k) => data[k] !== null), data, recordsUpdated: 1 };
    } catch (err: any) {
      return { status: 'FAILED', fields: [], data: {}, recordsUpdated: 0, error: `Codeforces could not be read (${err.message}). Nothing was imported.` };
    }
  }

  async verifyChallenge(profile: StudentExternalProfile, token: string): Promise<AdapterVerifyResult> {
    if (!token || !profile.username) return { verified: false, message: 'No challenge code to look for.' };
    try {
      const u = await CodeforcesAdapter.userInfo(profile.username);
      const text = [u.firstName, u.lastName, u.organization].filter(Boolean).join(' ');
      return text.includes(token)
        ? { verified: true, message: `Found the code on Codeforces profile ${u.handle}.` }
        : { verified: false, message: 'The code was not found in your Codeforces first name, last name or organisation. Save it there and check again.' };
    } catch (err: any) {
      return { verified: false, message: `Codeforces could not be reached (${err.message}), so the profile was not verified.` };
    }
  }
}

/**
 * Every other platform (LeetCode, Kaggle, LinkedIn, HackerRank, ...): there is no official API or OAuth client here, so the
 * link is saved and nothing is imported. Personal websites and GitHub Pages can be verified with a code on the page.
 * Earlier versions returned the same invented statistics for every username (184 LeetCode problems, Codeforces rating
 * 1420, Kaggle Expert) and reported every challenge as verified.
 */
export class GenericManualLinkAdapter implements PlatformAdapter {
  constructor(private platformId: ExternalPlatformId) {}

  getPlatformId(): ExternalPlatformId {
    return this.platformId;
  }

  canSync(): boolean {
    return false;
  }

  async sync(studentId: string, profile: StudentExternalProfile): Promise<AdapterSyncResult> {
    return {
      status: 'SKIPPED',
      fields: [],
      data: { url: profile.normalized_profile_url, username: profile.username },
      recordsUpdated: 0,
      error: 'This platform has no supported data import here. Your profile link is saved; nothing was imported.',
    };
  }

  async verifyChallenge(profile: StudentExternalProfile, token: string): Promise<AdapterVerifyResult> {
    if (this.platformId !== 'portfolio_website' && this.platformId !== 'github_pages') {
      return { verified: false, message: 'Verification is not available for this platform. The link stays marked as added by you.' };
    }
    if (!token) return { verified: false, message: 'No challenge code to look for.' };
    try {
      const html = await safeFetchText(profile.normalized_profile_url);
      return html.includes(token)
        ? { verified: true, message: `Found the code on ${profile.normalized_profile_url}.` }
        : { verified: false, message: 'The code was not found on the page. Add it (for example in a meta tag) and check again.' };
    } catch (err: any) {
      return { verified: false, message: `The page could not be checked (${err.message}), so it was not verified.` };
    }
  }
}

/**
 * Adapter Registry
 */
export class ExternalProfileAdapterRegistry {
  private static adapters: Map<ExternalPlatformId, PlatformAdapter> = new Map();

  static {
    this.register(new GitHubAdapter());
    this.register(new CodeforcesAdapter());
  }

  public static register(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.getPlatformId(), adapter);
  }

  public static get(platformId: ExternalPlatformId): PlatformAdapter {
    const existing = this.adapters.get(platformId);
    if (existing) return existing;
    // Default to honest manual link adapter
    const generic = new GenericManualLinkAdapter(platformId);
    this.adapters.set(platformId, generic);
    return generic;
  }
}
