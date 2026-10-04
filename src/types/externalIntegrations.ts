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
  sync?: boolean;
  certifications?: boolean;
}

export interface ExternalProviderInfo {
  id: ExternalProviderId;
  name: string;
  display_name: string;
  category: ExternalPlatformCategory;
  description: string;
  icon_name?: string;
  icon?: string;
  official_url: string;
  authentication_method: 'OAUTH2' | 'PUBLIC_PROFILE_URL' | 'API_KEY' | 'PUBLIC_PROFILE';
  oauth_supported: boolean;
  api_supported?: boolean;
  capabilities: ProviderCapabilities;
  rate_limits: {
    max_requests_per_minute: number;
    sync_interval_hours: number;
  } | string;
  privacy_requirements: string[] | string;
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
  sync_status: 'IDLE' | 'IN_PROGRESS' | 'SUCCESS' | 'ERROR' | 'SYNCED';
  error_status?: string | null;
  token_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface ExternalActivity {
  id: string;
  student_id: string;
  connection_id?: string;
  provider: ExternalProviderId | string;
  activity_type: 'PROBLEM_SOLVED' | 'COMMIT' | 'CONTEST' | 'NOTEBOOK_RUN' | 'JOB_SAVED' | 'PROFILE_SYNC' | 'PROFILE_UPDATE' | string;
  title: string;
  description?: string;
  details?: Record<string, any> | any;
  metrics?: Record<string, any>;
  url?: string;
  timestamp?: string;
  occurred_at?: string;
  created_at?: string;
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

export interface ExternalSkillEvidence {
  id?: string;
  student_id?: string;
  skill_name: string;
  source_provider?: ExternalProviderId | 'INTERNAL_COURSE' | 'INTERNAL_LAB' | string;
  evidence_type?: 'REPOSITORY' | 'COMPETITIVE_CODING' | 'DATASET' | 'COURSE_COMPLETION' | 'CERTIFICATE' | string;
  evidence_description?: string;
  evidence_url?: string;
  verified?: boolean;
  confidence_score: number;
  recorded_at?: string;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | string;
  evidence_sources?: { name?: string; url?: string; type?: string; source?: string; description?: string }[];
  last_updated?: string;
}

export interface ExternalJob {
  id: string;
  student_id?: string;
  provider?: ExternalProviderId | string;
  title: string;
  company_name?: string;
  company?: string;
  location: string;
  is_remote: boolean;
  employment_type?: 'INTERNSHIP' | 'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | string;
  experience_level: 'ENTRY' | 'MID' | 'SENIOR' | 'INTERN' | string;
  salary_range?: string;
  source: ExternalProviderId | 'MANUAL_IMPORT' | string;
  job_url?: string;
  url?: string;
  deadline?: string;
  description: string;
  required_skills?: string[];
  skills_required?: string[];
  preferred_skills?: string[];
  posted_at?: string;
  status?: string;
  created_at?: string;
}

export interface CareerConsistencyReport {
  student_id?: string;
  last_analyzed?: string;
  overall_consistency_score?: number;
  consistency_score?: number;
  verified_matches?: any[];
  items_to_review?: any[];
  discrepancies?: any[];
  matched_items?: {
    title: string;
    sources: string[];
    status: 'VERIFIED_MATCH' | 'MINOR_DISCREPANCY' | 'NEEDS_REVIEW';
    details: string;
  }[];
  recommendations?: string[];
}

export interface JobAnalysisResult {
  job_id: string;
  title?: string;
  company?: string;
  overall_match_score?: number;
  fit_score?: number;
  matching_skills?: string[];
  matched_skills?: string[];
  missing_skills?: string[];
  skills_needing_practice?: string[];
  recommended_actions?: string[];
  suggested_preparation?: string[];
  project_recommendations?: string[];
  relevant_projects?: any[];
  course_recommendations?: string[];
  resume_sections_to_highlight?: string[];
}

