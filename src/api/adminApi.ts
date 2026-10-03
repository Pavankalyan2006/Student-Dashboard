import { apiClient } from './client';

export interface AdminDashboardSummary {
  total_students: number;
  active_students: number;
  suspended_students: number;
  courses_count: number;
  lessons_completed_count: number;
  quizzes_attempted_count: number;
  coding_submissions_count: number;
  dsa_problems_solved_count: number;
  projects_count: number;
  research_papers_count: number;
  ai_requests_count: number;
  ai_avg_latency_ms: number;
  system_health: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  pending_community_reports: number;
  active_jobs_count: number;
}

export interface AdminStudentItem {
  id: string;
  name: string;
  email: string;
  branch: string;
  semester: number;
  role: 'STUDENT' | 'SUPER_ADMIN';
  is_active: boolean;
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED';
  status_reason?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLogItem {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, any>;
  ip_hash: string;
  user_agent: string;
  created_at: string;
}

export interface AIProviderItem {
  id: string;
  provider_name: string;
  display_name: string;
  is_enabled: boolean;
  is_primary: boolean;
  health_status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  total_requests: number;
  failed_requests: number;
  avg_latency_ms: number;
  last_request_at?: string;
}

export interface AIModelItem {
  id: string;
  model_id: string;
  model_name: string;
  role_type: 'DEFAULT' | 'RESEARCH' | 'CODING' | 'EMBEDDING' | 'FAST' | 'ADVANCED';
  provider_id: string;
  context_window_tokens: number;
  max_output_tokens: number;
  is_active: boolean;
}

export interface AIToolItem {
  name: string;
  description: string;
  category: string;
  permissions: string[];
  timeoutMs: number;
  confirmationRequired: boolean;
  requires_confirmation: boolean;
  is_enabled: boolean;
  input_schema?: Record<string, any>;
}

export interface FeatureFlagItem {
  id: string;
  key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  is_server_enforced: boolean;
  rollout_percentage: number;
  updated_at: string;
}

export interface BackgroundJobItem {
  id: string;
  job_type: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  student_id?: string;
  input_summary: string;
  progress_percentage: number;
  retry_count: number;
  max_retries: number;
  duration_ms?: number;
  error_summary?: string;
  created_at: string;
}

export interface SystemHealthData {
  overall_status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  environment: string;
  version: string;
  timestamp: string;
  uptime_seconds: number;
  components: {
    name: string;
    status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
    latency_ms: number;
    last_checked: string;
  }[];
}

export interface SecurityEventItem {
  id: string;
  event_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip_address: string;
  user_id?: string;
  path: string;
  details: string;
  created_at: string;
}

export interface StructuredLogItem {
  id: string;
  request_id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'security';
  service: string;
  method?: string;
  path?: string;
  status_code?: number;
  latency_ms?: number;
  user_id?: string;
  message: string;
}

export const adminApi = {
  getDashboard: () => apiClient.request<AdminDashboardSummary>('/admin/dashboard'),

  getStudents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.request<{
      data: AdminStudentItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/students?${query}`);
  },

  getStudentDetail: (studentId: string) =>
    apiClient.request<{
      student: AdminStudentItem;
      academic_profile: any;
      progress_summary: any;
      counts: { projects: number; certificates: number; goals: number };
    }>(`/admin/students/${studentId}`),

  updateStudentStatus: (studentId: string, status: string, reason: string) =>
    apiClient.request<AdminStudentItem>(`/admin/students/${studentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  getAuditLogs: (params: { limit?: number; targetType?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.request<AdminAuditLogItem[]>(`/admin/audit-logs?${query}`);
  },

  // AI
  getAiProviders: () => apiClient.request<AIProviderItem[]>('/admin/ai/providers'),
  updateAiProvider: (id: string, updates: Partial<AIProviderItem>) =>
    apiClient.request<AIProviderItem>(`/admin/ai/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getAiModels: () => apiClient.request<AIModelItem[]>('/admin/ai/models'),
  updateAiModel: (id: string, updates: Partial<AIModelItem>) =>
    apiClient.request<AIModelItem>(`/admin/ai/models/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getAiUsage: () => apiClient.request<any>('/admin/ai/usage'),
  getAiTools: () => apiClient.request<AIToolItem[]>('/admin/ai/tools'),
  updateAiTool: (name: string, is_enabled: boolean) =>
    apiClient.request<{ data: AIToolItem }>(`/admin/ai/tools/${name}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_enabled }),
    }),

  // Integrations
  getGithubStatus: () => apiClient.request<any>('/admin/integrations/github'),
  updateGithubStatus: (updates: any) =>
    apiClient.request<any>('/admin/integrations/github', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getResearchProviders: () => apiClient.request<any[]>('/admin/integrations/research'),
  updateResearchProvider: (id: string, updates: any) =>
    apiClient.request<any>(`/admin/integrations/research/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  getStorageMetrics: () => apiClient.request<any>('/admin/integrations/storage'),

  // Jobs
  getJobs: (params: { status?: string; type?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.request<BackgroundJobItem[]>(`/admin/jobs?${query}`);
  },
  getJobDetail: (id: string) => apiClient.request<BackgroundJobItem>(`/admin/jobs/${id}`),
  retryJob: (id: string) =>
    apiClient.request<BackgroundJobItem>(`/admin/jobs/${id}/retry`, {
      method: 'POST',
    }),

  // System
  getSystemHealth: () => apiClient.request<SystemHealthData>('/admin/system/health'),
  getSystemMetrics: () => apiClient.request<any>('/admin/system/metrics'),
  getSystemLogs: (params: { limit?: number; level?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.request<StructuredLogItem[]>(`/admin/system/logs?${query}`);
  },

  // Security
  getSecurityEvents: (params: { severity?: string; limit?: number } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.request<SecurityEventItem[]>(`/admin/security/events?${query}`);
  },
  getRateLimits: () => apiClient.request<any[]>('/admin/security/rate-limits'),
  updateRateLimit: (id: string, updates: any) =>
    apiClient.request<any>(`/admin/security/rate-limits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Community
  getCommunityReports: () => apiClient.request<any[]>('/admin/community/reports'),
  updateCommunityReport: (id: string, status: string, moderation_notes: string) =>
    apiClient.request<any>(`/admin/community/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, moderation_notes }),
    }),

  // Settings / Feature Flags
  getFeatureFlags: () => apiClient.request<FeatureFlagItem[]>('/admin/settings/features'),
  updateFeatureFlag: (key: string, updates: Partial<FeatureFlagItem>) =>
    apiClient.request<FeatureFlagItem>(`/admin/settings/features/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Content
  getCourses: () => apiClient.request<any[]>('/admin/content/courses'),
  createCourse: (data: any) =>
    apiClient.request<any>('/admin/content/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
