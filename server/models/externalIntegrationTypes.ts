// server/models/externalIntegrationTypes.ts
// Comprehensive data models for Social Media, Career, Coding & External Platform Integration

export type ExternalProviderId =
  | 'linkedin'
  | 'indeed'
  | 'leetcode'
  | 'github'
  | 'hackerrank'
  | 'codechef'
  | 'geeksforgeeks'
  | 'kaggle'
  | 'LINKEDIN'
  | 'INDEED'
  | 'LEETCODE'
  | 'GITHUB'
  | 'HACKERRANK'
  | 'CODECHEF'
  | 'GEEKSFORGEEKS'
  | 'KAGGLE';

export type ExternalPlatformCategory =
  | 'CAREER_PROFESSIONAL'
  | 'CODING_COMPETITIVE'
  | 'DATA_AI'
  | 'DEVELOPER_TOOLS'
  | 'CAREER'
  | 'CODING'
  | 'DATA_SCIENCE'
  | 'COLLABORATION';

export type ConnectionStatus =
  | 'CONNECTED'
  /** Profile link saved by the student; ownership not verified, nothing imported. */
  | 'LINKED'
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
  token_reference?: string; // Identifier for encrypted credentials in vault/db
  token_expiry?: string;
  sync_status: 'IDLE' | 'IN_PROGRESS' | 'SUCCESS' | 'ERROR';
  error_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ExternalActivity {
  id: string;
  student_id: string;
  provider: ExternalProviderId | string;
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
  provider: ExternalProviderId | string;
  title: string;
  badge_name?: string;
  rating?: number;
  global_rank?: string;
  category: string;
  unlocked_at?: string;
}

export interface ExternalCodingStats {
  problems_solved_total: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  ranking?: number;
  contest_rating?: number;
  badges_count: number;
  streak_days: number;
}

export interface ExternalProfile {
  provider: ExternalProviderId | string;
  username: string;
  headline?: string;
  bio?: string;
  profile_url: string;
  coding_stats?: ExternalCodingStats;
  achievements: ExternalAchievement[];
  last_synced: string;
}

export interface ExternalSkillEvidence {
  id: string;
  student_id: string;
  skill_name: string;
  source_provider: ExternalProviderId | 'INTERNAL_COURSE' | 'INTERNAL_LAB' | string;
  evidence_type: 'REPOSITORY' | 'COMPETITIVE_CODING' | 'DATASET' | 'COURSE_COMPLETION' | 'CERTIFICATE';
  evidence_description: string;
  evidence_url?: string;
  verified: boolean;
  confidence_score: number; // 0 - 100
  recorded_at: string;
  proficiency?: string;
  evidence_sources?: Array<{ name: string; url?: string; type?: string }>;
  last_updated?: string;
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
  source: ExternalProviderId | 'MANUAL_IMPORT' | string;
  job_url?: string;
  deadline?: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  posted_at: string;
}

export interface ExternalSyncJob {
  id: string;
  student_id: string;
  provider: ExternalProviderId;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  records_imported: number;
  records_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface CareerConsistencyReport {
  /** null: no comparison engine exists, so nothing is measured. */
  overall_consistency_score: number | null;
  matched_items: {
    title: string;
    sources: string[];
    status: 'VERIFIED_MATCH' | 'MINOR_DISCREPANCY' | 'NEEDS_REVIEW';
    details: string;
  }[];
  recommendations: string[];
}
