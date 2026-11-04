// src/features/profile/api/externalProfilesApi.ts
// Frontend API Client for External Profiles Management

import { apiClient } from '../../../api/client';
import {
  ExternalPlatformMeta,
  StudentExternalProfile,
  ExternalProfilesDashboardStats,
  CreateExternalProfilePayload,
  UpdateExternalProfilePayload,
  ProfileValidationResult,
  ExternalProfileSyncRun,
} from '../types/externalProfileTypes';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const externalProfilesApi = {
  /**
   * Get supported platform catalog with optional category and search query
   */
  getSupportedPlatforms: async (category?: string, query?: string): Promise<ExternalPlatformMeta[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.append('category', category);
    if (query) params.append('q', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.get(`/external-profiles/platforms${queryString}`);
    const data = unpack(res);
    return data.platforms || [];
  },

  /**
   * Validate a profile URL or handle before submission
   */
  validateProfileUrl: async (platform_id: string, url: string): Promise<ProfileValidationResult> => {
    const res = await apiClient.post('/external-profiles/validate-url', { platform_id, url });
    return unpack(res);
  },

  /**
   * Get dashboard connection KPI metrics
   */
  getStats: async (): Promise<ExternalProfilesDashboardStats> => {
    const res = await apiClient.get('/external-profiles/stats');
    const data = unpack(res);
    return (
      data.stats || {
        total_connected: 0,
        verified_profiles: 0,
        reconnection_required: 0,
        never_synced: 0,
      }
    );
  },

  /**
   * List all external profiles connected for current student
   */
  getProfiles: async (): Promise<StudentExternalProfile[]> => {
    const res = await apiClient.get('/external-profiles');
    const data = unpack(res);
    return data.profiles || [];
  },

  /**
   * Get single profile by ID
   */
  getProfileById: async (id: string): Promise<StudentExternalProfile> => {
    const res = await apiClient.get(`/external-profiles/${id}`);
    const data = unpack(res);
    return data.profile;
  },

  /**
   * Add a new external profile
   */
  addProfile: async (payload: CreateExternalProfilePayload): Promise<StudentExternalProfile> => {
    const res = await apiClient.post('/external-profiles', payload);
    const data = unpack(res);
    return data.profile;
  },

  /**
   * Update profile metadata or privacy settings
   */
  updateProfile: async (id: string, payload: UpdateExternalProfilePayload): Promise<StudentExternalProfile> => {
    const res = await apiClient.patch(`/external-profiles/${id}`, payload);
    const data = unpack(res);
    return data.profile;
  },

  /**
   * Permanently delete profile
   */
  deleteProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete(`/external-profiles/${id}`);
    const data = unpack(res);
    return data.success !== false;
  },

  /**
   * Disconnect profile
   */
  disconnectProfile: async (id: string): Promise<boolean> => {
    const res = await apiClient.post(`/external-profiles/${id}/disconnect`);
    const data = unpack(res);
    return data.success !== false;
  },

  /**
   * Synchronize single profile
   */
  syncProfile: async (id: string): Promise<{ profile: StudentExternalProfile; syncRun: ExternalProfileSyncRun }> => {
    const res = await apiClient.post(`/external-profiles/${id}/sync`);
    return unpack(res);
  },

  /**
   * Synchronize all eligible profiles sequentially
   */
  syncAllProfiles: async (): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
    results: ExternalProfileSyncRun[];
  }> => {
    const res = await apiClient.post('/external-profiles/sync-all');
    return unpack(res);
  },

  /**
   * Start challenge-based verification
   */
  startChallengeVerification: async (id: string): Promise<{ token: string; expires_at: string; instructions: string }> => {
    const res = await apiClient.post(`/external-profiles/${id}/verify-challenge/start`);
    const data = unpack(res);
    return data.challenge;
  },

  /**
   * Check challenge token on public profile
   */
  checkChallengeVerification: async (
    id: string
  ): Promise<{ verified: boolean; message: string; profile: StudentExternalProfile }> => {
    const res = await apiClient.post(`/external-profiles/${id}/verify-challenge/check`);
    return unpack(res);
  },

  /**
   * Get sync run history
   */
  getProfileHistory: async (id: string): Promise<ExternalProfileSyncRun[]> => {
    const res = await apiClient.get(`/external-profiles/${id}/history`);
    const data = unpack(res);
    return data.history || [];
  },

  /**
   * Cross-module consented summary
   */
  getConsentedSummary: async (
    context: 'resume' | 'career' | 'jobs'
  ): Promise<{
    verified_links: Array<{ name: string; url: string; platform: string; username: string }>;
    skills_evidence: string[];
  }> => {
    const res = await apiClient.get(`/external-profiles/consented-summary?context=${context}`);
    const data = unpack(res);
    return data.summary || { verified_links: [], skills_evidence: [] };
  },
};
