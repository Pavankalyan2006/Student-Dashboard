// src/types/externalIntegrations.ts
// Frontend TypeScript definitions for External Platform & Social Career Integration

export type ExternalProviderId =
  | 'linkedin'
  | 'indeed'
  | 'leetcode'
  | 'github'
  | 'hackerrank'
  | 'codechef'
  | 'geeksforgeeks'
  | 'kaggle';

export type ExternalPlatformCategory =
  | 'CAREER_PROFESSIONAL'
  | 'CODING_COMPETITIVE'
  | 'DATA_AI'
  | 'DEVELOPER_TOOLS';

export type ConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'REAUTH_REQUIRED';

export interface ProviderCapabilities {
  profile: boolean;
  activity: boolean;
  statistics: boolean;
  jobs: boolean;
  applications: boolean;
  repositories: boolean;
  code_submissions: boolean;
  sync: boolean;
}

export interface ExternalProviderInfo {
  id: ExternalProviderId;
  name: string;
  display_name: string;
  category: ExternalPlatformCategory;
  description: string;
  icon_name: string;
  official_url: string;
  authentication_method: 'OAUTH2' | 'PUBLIC_PROFILE_URL' | 'API_KEY';
  oauth_supported: boolean;
  api_supported: boolean;
  capabilities: ProviderCapabilities;
  rate_limits: {
    max_requests_per_minute: number;
    sync_interval_hours: number;
  };
  privacy_requirements: string[];
  enabled: boolean;
}

export interface ExternalAccountConnection {
  id: string;
  student_id: string;
  provider: ExternalProviderId;
  provider_user_id?: string;
  display_name: string;
  username: string;
  profile_url: string;
  avatar_url?: string;
  status: ConnectionStatus;
  scopes: string[];
  connected_at: string;
  last_synced_at?: string;
  sync_status: 'IDLE' | 'IN_PROGRESS' | 'SUCCESS' | 'ERROR';
  error_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ExternalActivity {
  id: string;
  student_id: string;
  provider: ExternalProviderId;
  activity_type: 'PROBLEM_SOLVED' | 'COMMIT' | 'CONTEST' | 'NOTEBOOK_RUN' | 'JOB_SAVED' | 'PROFILE_SYNC';
  title: string;
  description?: string;
  metrics?: Record<string, any>;
  url?: string;
  timestamp: string;
}

export interface ExternalAchievement {
  id: string;
  student_id: string;
  provider: ExternalProviderId;
  title: string;
  badge_name?: string;
  rating?: number;
  global_rank?: string;
  category: string;
  unlocked_at?: string;
}

export interface ExternalSkillEvidence {
  id: string;
  student_id: string;
  skill_name: string;
  source_provider: ExternalProviderId | 'INTERNAL_COURSE' | 'INTERNAL_LAB';
  evidence_type: 'REPOSITORY' | 'COMPETITIVE_CODING' | 'DATASET' | 'COURSE_COMPLETION' | 'CERTIFICATE';
  evidence_description: string;
  evidence_url?: string;
  verified: boolean;
  confidence_score: number;
  recorded_at: string;
}

export interface ExternalJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  is_remote: boolean;
  employment_type: 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT' | 'PART_TIME';
  experience_level: 'ENTRY' | 'MID' | 'SENIOR' | 'INTERN';
  salary_range?: string;
  source: ExternalProviderId | 'MANUAL_IMPORT';
  job_url?: string;
  deadline?: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  posted_at: string;
}

export interface CareerConsistencyReport {
  overall_consistency_score: number;
  matched_items: {
    title: string;
    sources: string[];
    status: 'VERIFIED_MATCH' | 'MINOR_DISCREPANCY' | 'NEEDS_REVIEW';
    details: string;
  }[];
  recommendations: string[];
}
