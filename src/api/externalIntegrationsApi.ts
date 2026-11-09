// src/api/externalIntegrationsApi.ts
// Client API for Social Media, Career, Coding & External Platform Integration
// Phase 3: no offline fallback. Errors reach the page; nothing is shown as connected or synced unless the server says so.

import { apiClient } from './client';
import {
  ExternalProviderInfo,
  ExternalAccountConnection,
  ExternalActivity,
  ExternalSkillEvidence,
  ExternalJob,
  JobAnalysisResult,
  CareerConsistencyReport,
  ExternalProviderId,
} from '../types/externalIntegrations';

const unwrapData = <T>(res: any): T => (res && res.data !== undefined ? res.data : res) as T;

export const externalIntegrationsApi = {
  getProviders: async (): Promise<ExternalProviderInfo[]> =>
    unwrapData<ExternalProviderInfo[]>(await apiClient.request<any>('/integrations/providers')),

  getConnections: async (): Promise<ExternalAccountConnection[]> =>
    unwrapData<ExternalAccountConnection[]>(await apiClient.request<any>('/integrations/connections')),

  /** Only GitHub has a sign-in; other providers answer OAUTH_NOT_AVAILABLE. */
  initiateOAuth: async (provider: ExternalProviderId, redirectUri?: string): Promise<{ auth_url: string; state: string }> =>
    unwrapData(await apiClient.request<any>(`/integrations/connections/${provider}/start`, { method: 'POST', body: JSON.stringify({ redirect_uri: redirectUri }) })),

  connectPlatform: async (
    provider: ExternalProviderId,
    payload: { username?: string; profile_url?: string; code?: string }
  ): Promise<ExternalAccountConnection> =>
    unwrapData(await apiClient.request<any>(`/integrations/connections/${provider}/connect`, { method: 'POST', body: JSON.stringify(payload) })),

  syncConnection: async (connectionId: string): Promise<ExternalAccountConnection> =>
    unwrapData(await apiClient.request<any>(`/integrations/connections/${connectionId}/sync`, { method: 'POST' })),

  disconnectPlatform: async (connectionId: string): Promise<void> => {
    await apiClient.request(`/integrations/connections/${connectionId}`, { method: 'DELETE' });
  },

  getActivities: async (): Promise<ExternalActivity[]> =>
    unwrapData<ExternalActivity[]>(await apiClient.request<any>('/integrations/activity')),

  getSkillEvidence: async (): Promise<ExternalSkillEvidence[]> =>
    unwrapData<ExternalSkillEvidence[]>(await apiClient.request<any>('/integrations/skills')),

  getConsistencyReport: async (): Promise<CareerConsistencyReport> =>
    unwrapData<CareerConsistencyReport>(await apiClient.request<any>('/integrations/consistency')),

  /** Job descriptions this student imported (there is no live job feed). */
  getJobs: async (filters?: { query?: string; location?: string; remote?: boolean }): Promise<ExternalJob[]> => {
    const params = new URLSearchParams();
    if (filters?.query) params.append('q', filters.query);
    if (filters?.location) params.append('location', filters.location);
    return unwrapData<ExternalJob[]>(await apiClient.request<any>(`/integrations/jobs?${params.toString()}`));
  },

  importJobDescription: async (payload: {
    title: string;
    company: string;
    location?: string;
    is_remote?: boolean;
    url?: string;
    description: string;
  }): Promise<ExternalJob> =>
    unwrapData(await apiClient.request<any>('/integrations/jobs/import', {
      method: 'POST',
      body: JSON.stringify({ ...payload, job_url: payload.url || undefined }),
    })),

  analyzeJob: async (jobId: string): Promise<JobAnalysisResult> =>
    unwrapData(await apiClient.request<any>(`/integrations/jobs/${jobId}/analyze`, { method: 'POST' })),
};
