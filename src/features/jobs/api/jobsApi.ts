// src/features/jobs/api/jobsApi.ts
// Frontend API Client for Multi-Source Jobs Discovery Platform (Government + Private)

import { apiClient } from '../../../api/client';
import {
  JobListing,
  StudentSavedJob,
  StudentJobAlert,
  JobSourceConfig,
  JobSyncRun,
  StudentJobMatchExplanation,
  JobsDashboardStats,
  SubcategoryMeta,
  JobPrimaryCategory,
} from '../types/jobsTypes';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const jobsApi = {
  // 1. Listings & Search
  getJobs: async (params?: {
    q?: string;
    category?: JobPrimaryCategory | 'ALL';
    subcategory?: string;
    source_id?: string;
    location?: string;
    remote_only?: boolean;
    freshers_only?: boolean;
    status?: string;
    sort_by?: 'newest' | 'deadline' | 'relevance';
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: JobListing[]; total: number }> => {
    const res = await apiClient.get('/jobs-discovery/jobs', { params });
    if (res && typeof res === 'object' && Array.isArray((res as any).data)) {
      return { jobs: (res as any).data, total: (res as any).total || (res as any).data.length };
    }
    return { jobs: Array.isArray(res) ? res : [], total: 0 };
  },

  getJobById: async (id: string): Promise<JobListing> => {
    const res = await apiClient.get(`/jobs-discovery/jobs/${id}`);
    return unpack(res);
  },

  // 2. Metrics & Categories
  getStats: async (): Promise<JobsDashboardStats> => {
    const res = await apiClient.get('/jobs-discovery/stats');
    return unpack(res);
  },

  getCategories: async (): Promise<{
    government: { category: string; label: string; subcategories: SubcategoryMeta[] };
    private: { category: string; label: string; subcategories: SubcategoryMeta[] };
  }> => {
    const res = await apiClient.get('/jobs-discovery/categories');
    return unpack(res);
  },

  // 3. Sources & Synchronization
  getSources: async (): Promise<{
    sources: JobSourceConfig[];
    recent_sync_runs: JobSyncRun[];
  }> => {
    const res = await apiClient.get('/jobs-discovery/sources');
    return unpack(res);
  },

  triggerSync: async (): Promise<any> => {
    const res = await apiClient.post('/jobs-discovery/sync', {});
    return unpack(res);
  },

  // 4. Saved Jobs Bookmarks
  getSavedJobs: async (): Promise<StudentSavedJob[]> => {
    const res = await apiClient.get('/jobs-discovery/saved');
    return unpack(res) || [];
  },

  saveJob: async (
    jobId: string,
    notes?: string,
    isInterested: boolean = true,
    applicationStatus?: string
  ): Promise<StudentSavedJob> => {
    const res = await apiClient.post(`/jobs-discovery/jobs/${jobId}/save`, {
      notes,
      is_interested: isInterested,
      application_status: applicationStatus,
    });
    return unpack(res);
  },

  unsaveJob: async (jobId: string): Promise<boolean> => {
    const res = await apiClient.delete(`/jobs-discovery/jobs/${jobId}/save`);
    return Boolean(res);
  },

  // 5. Job Alerts
  getAlerts: async (): Promise<StudentJobAlert[]> => {
    const res = await apiClient.get('/jobs-discovery/alerts');
    return unpack(res) || [];
  },

  saveAlert: async (alertData: Partial<StudentJobAlert>): Promise<StudentJobAlert> => {
    const res = await apiClient.post('/jobs-discovery/alerts', alertData);
    return unpack(res);
  },

  deleteAlert: async (alertId: string): Promise<boolean> => {
    const res = await apiClient.delete(`/jobs-discovery/alerts/${alertId}`);
    return Boolean(res);
  },

  // 6. Match Explanation
  getJobMatch: async (jobId: string): Promise<StudentJobMatchExplanation> => {
    const res = await apiClient.get(`/jobs-discovery/jobs/${jobId}/match`);
    return unpack(res);
  },

  // 7. Direct Tracking to Application Tracker
  trackApplication: async (
    jobId: string,
    payload?: { status?: string; notes?: string }
  ): Promise<any> => {
    const res = await apiClient.post(`/jobs-discovery/jobs/${jobId}/track`, payload || {});
    return unpack(res);
  },

  // 8. Analyze External JD
  analyzeExternalJd: async (payload: {
    title?: string;
    organization?: string;
    description: string;
    category?: JobPrimaryCategory;
  }): Promise<any> => {
    const res = await apiClient.post('/jobs-discovery/analyze-jd', payload);
    return unpack(res);
  },
};
