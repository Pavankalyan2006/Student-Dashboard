// src/features/profile/types/externalProfileTypes.ts
// Frontend type definitions for External Profiles management

export type ExternalPlatformId =
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  | 'leetcode'
  | 'hackerrank'
  | 'codechef'
  | 'codeforces'
  | 'atcoder'
  | 'geeksforgeeks'
  | 'hackerearth'
  | 'exercism'
  | 'linkedin'
  | 'portfolio_website'
  | 'github_pages'
  | 'behance'
  | 'dribbble'
  | 'topcoder'
  | 'google_scholar'
  | 'orcid'
  | 'researchgate'
  | 'kaggle'
  | 'huggingface'
  | 'figma'
  | 'custom_link';

export type ExternalPlatformCategory =
  | 'DEVELOPER_CODE_HOSTING'
  | 'CODING_PRACTICE'
  | 'PROFESSIONAL_NETWORKING'
  | 'PORTFOLIO_PROJECT'
  | 'COMPETITIVE_PROGRAMMING'
  | 'ACADEMIC_RESEARCH'
  | 'DESIGN_DATA_SPECIALIZED';

export type ConnectionMethod =
  | 'OAUTH2'
  | 'OFFICIAL_API'
  | 'PUBLIC_PROFILE_URL'
  | 'PUBLIC_HANDLE'
  | 'MANUAL_ENTRY';

export type VerificationStatus =
  | 'MANUALLY_ADDED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'CONNECTED_OAUTH'
  | 'CONNECTION_EXPIRED'
  | 'RECONNECTION_REQUIRED'
  | 'SYNC_FAILED'
  | 'DISCONNECTED';

export type ConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'REAUTH_REQUIRED';

export interface ProfileSharingSettings {
  use_for_resume: boolean;
  use_for_career: boolean;
  use_for_job_matching: boolean;
  use_for_skill_gap: boolean;
  include_in_resume_links: boolean;
  include_in_public_portfolio: boolean;
}

export interface ExternalPlatformMeta {
  id: ExternalPlatformId;
  name: string;
  category: ExternalPlatformCategory;
  secondary_categories?: ExternalPlatformCategory[];
  description: string;
  icon_name: string;
  brand_color: string;
  official_url: string;
  url_placeholder: string;
  url_patterns: string[];
  username_pattern?: string;
  supported_connection_methods: ConnectionMethod[];
  oauth_supported: boolean;
  api_supported: boolean;
  challenge_verification_supported: boolean;
  sync_supported: boolean;
  available_data_fields: string[];
  rate_limit_per_minute?: number;
  privacy_notes: string;
  enabled: boolean;
}

export interface StudentExternalProfile {
  id: string;
  student_id: string;
  platform_id: ExternalPlatformId;
  platform_name: string;
  username: string;
  display_name?: string;
  original_profile_url: string;
  normalized_profile_url: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
  connection_method: ConnectionMethod;
  verification_status: VerificationStatus;
  connection_status: ConnectionStatus;
  verification_challenge_token?: string;
  verification_challenge_expires?: string;
  last_successful_sync?: string;
  last_attempted_sync?: string;
  last_error_summary?: string;
  sharing_settings: ProfileSharingSettings;
  categories: ExternalPlatformCategory[];
  data_categories: string[];
  metrics_summary?: Record<string, string | number>;
  created_at: string;
  updated_at: string;
}

export interface ExternalProfileSyncRun {
  id: string;
  profile_id: string;
  student_id: string;
  platform_id: ExternalPlatformId;
  started_at: string;
  completed_at: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'SKIPPED';
  records_updated: number;
  fields_updated: string[];
  error_message?: string;
}

export interface ExternalProfilesDashboardStats {
  total_connected: number;
  verified_profiles: number;
  reconnection_required: number;
  never_synced: number;
  last_successful_sync?: string;
}

export interface CreateExternalProfilePayload {
  platform_id: ExternalPlatformId;
  profile_url: string;
  username?: string;
  display_name?: string;
  connection_method?: ConnectionMethod;
  sharing_settings?: Partial<ProfileSharingSettings>;
}

export interface UpdateExternalProfilePayload {
  username?: string;
  display_name?: string;
  profile_url?: string;
  sharing_settings?: Partial<ProfileSharingSettings>;
}

export interface ProfileValidationResult {
  valid: boolean;
  normalized_url: string;
  username: string;
  error?: string;
}
