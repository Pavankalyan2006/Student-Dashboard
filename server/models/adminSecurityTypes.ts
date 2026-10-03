// ============================================================================
// PHASE 15 — SUPER ADMIN, SECURITY HARDENING & PRODUCTION TYPES
// TypeScript Domain Models and Types
// ============================================================================

import { UserRole } from './types';

// ----------------------------------------------------------------------------
// 1. STUDENT ACCOUNT STATUS & ADMIN AUDIT LOG
// ----------------------------------------------------------------------------

export type StudentAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED';

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: 'STUDENT' | 'AI_PROVIDER' | 'AI_TOOL' | 'FEATURE_FLAG' | 'CONTENT' | 'SYSTEM' | 'COMMUNITY_REPORT' | 'SECURITY';
  target_id: string;
  metadata: Record<string, any>;
  ip_hash: string;
  user_agent: string;
  created_at: string;
}

// ----------------------------------------------------------------------------
// 2. SYSTEM HEALTH & MONITORING
// ----------------------------------------------------------------------------

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latency_ms: number;
  message?: string;
  last_checked: string;
}

export interface SystemHealthReport {
  overall_status: HealthStatus;
  environment: 'development' | 'staging' | 'production';
  version: string;
  timestamp: string;
  uptime_seconds: number;
  components: ComponentHealth[];
}

export interface SystemMetricsReport {
  timestamp: string;
  request_count: number;
  error_rate_percentage: number;
  avg_api_latency_ms: number;
  db_latency_ms: number;
  queue_depth: number;
  active_jobs_count: number;
  ai_latency_avg_ms: number;
  cache_hit_rate_percentage: number;
}

export interface StructuredLogEntry {
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
  role?: string;
  message: string;
  metadata?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// 3. AI PROVIDER & MODEL MANAGEMENT
// ----------------------------------------------------------------------------

export interface AIProviderAdminConfig {
  id: string;
  provider_name: string;
  display_name: string;
  is_enabled: boolean;
  is_primary: boolean;
  health_status: HealthStatus;
  last_request_at?: string;
  last_error?: string;
  total_requests: number;
  failed_requests: number;
  avg_latency_ms: number;
  created_at: string;
}

export interface AIModelAdminConfig {
  id: string;
  model_id: string;
  model_name: string;
  role_type: 'DEFAULT' | 'RESEARCH' | 'CODING' | 'EMBEDDING' | 'FAST' | 'ADVANCED';
  provider_id: string;
  context_window_tokens: number;
  max_output_tokens: number;
  is_active: boolean;
}

export interface AIUsageAnalytics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  estimated_tokens_used: number;
  estimated_cost_usd: number;
  tool_executions_count: number;
  model_distribution: { model: string; count: number }[];
  hourly_traffic: { hour: string; requests: number; errors: number }[];
}

// ----------------------------------------------------------------------------
// 4. INTEGRATIONS ADMIN (GITHUB, RESEARCH, STORAGE)
// ----------------------------------------------------------------------------

export interface GitHubIntegrationStatus {
  is_enabled: boolean;
  app_client_id: string;
  oauth_configured: boolean;
  api_health: HealthStatus;
  rate_limit_remaining: number;
  rate_limit_reset: string;
  total_connected_students: number;
  total_repositories_analyzed: number;
  last_webhook_event_at?: string;
}

export interface ResearchProviderStatus {
  id: string;
  name: string;
  provider_type: 'OPENALEX' | 'SEMANTIC_SCHOLAR' | 'CROSSREF' | 'PUBMED';
  is_enabled: boolean;
  health_status: HealthStatus;
  rate_limit_remaining?: number;
  last_successful_request_at?: string;
  last_error?: string;
  total_queries: number;
}

export interface StorageAdminMetrics {
  storage_driver: 'LOCAL' | 'S3' | 'GCS' | 'MINIO';
  health_status: HealthStatus;
  total_objects: number;
  total_bytes: number;
  failed_uploads_count: number;
  cleanup_last_run: string;
}

// ----------------------------------------------------------------------------
// 5. BACKGROUND JOB SYSTEM
// ----------------------------------------------------------------------------

export type BackgroundJobType =
  | 'PDF_PARSING'
  | 'VECTOR_EMBEDDING'
  | 'GITHUB_SYNC'
  | 'REPOSITORY_ANALYSIS'
  | 'RESEARCH_PAPER_ANALYSIS'
  | 'LITERATURE_SYNTHESIS'
  | 'CERTIFICATE_GENERATION'
  | 'ANALYTICS_AGGREGATION'
  | 'STORAGE_CLEANUP';

export type BackgroundJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface BackgroundJobRecord {
  id: string;
  job_type: BackgroundJobType;
  status: BackgroundJobStatus;
  student_id?: string;
  idempotency_key?: string;
  input_summary: string;
  progress_percentage: number;
  retry_count: number;
  max_retries: number;
  duration_ms?: number;
  error_summary?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// ----------------------------------------------------------------------------
// 6. SECURITY & FEATURE FLAGS
// ----------------------------------------------------------------------------

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  is_enabled: boolean;
  is_server_enforced: boolean;
  rollout_percentage: number;
  updated_at: string;
}

export interface SecurityEventRecord {
  id: string;
  event_type: 'AUTH_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'IDOR_ATTEMPT' | 'PROMPT_INJECTION_DETECTED' | 'INVALID_FILE_UPLOAD' | 'ADMIN_ACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ip_address: string;
  user_id?: string;
  path: string;
  details: string;
  created_at: string;
}

export interface RateLimitConfig {
  id: string;
  endpoint_pattern: string;
  max_requests: number;
  window_seconds: number;
  is_active: boolean;
}

export interface PlatformAdminSummary {
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
  system_health: HealthStatus;
  pending_community_reports: number;
  active_jobs_count: number;
}
