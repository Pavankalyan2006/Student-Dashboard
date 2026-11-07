// src/features/jobs/types/jobsTypes.ts
// Frontend TypeScript definitions for Jobs Discovery Platform

export type JobPrimaryCategory = 'GOVERNMENT' | 'PRIVATE';

export type JobEmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'CONTRACT'
  | 'TRAINEE_APPRENTICE';

export type JobWorkArrangement = 'ONSITE' | 'REMOTE' | 'HYBRID';

export type JobVerificationStatus =
  | 'OFFICIAL_GOVERNMENT_SOURCE'
  | 'AUTHORIZED_JOB_PROVIDER'
  | 'DIRECT_EMPLOYER_BOARD'
  | 'COMMUNITY_VERIFIED';

export type JobListingStatus = 'ACTIVE' | 'CLOSING_SOON' | 'EXPIRED' | 'CANCELLED';

export interface JobListing {
  id: string;
  external_job_id?: string;
  source_id: string;
  source_name: string;
  source_type: string;
  source_url: string;
  application_url: string;
  title: string;
  organization: string;
  category: JobPrimaryCategory;
  subcategory: string;
  employment_type: JobEmploymentType;
  work_arrangement: JobWorkArrangement;
  location: string;
  city?: string;
  state?: string;
  country: string;
  remote_eligible: boolean;
  experience_label: string;
  experience_min?: number;
  experience_max?: number;
  minimum_qualification: string;
  required_skills: string[];
  preferred_skills?: string[];
  salary_text?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description: string;
  simplified_summary?: string;
  application_deadline?: string;
  publication_date: string;
  last_verified_at: string;
  status: JobListingStatus;
  verification_status: JobVerificationStatus;
  is_freshers_friendly: boolean;
  notification_number?: string;
  official_notification_pdf_url?: string;
  age_limit_max?: number;
  total_vacancies?: number;
  application_fee_text?: string;
}

export interface StudentSavedJob {
  id: string;
  student_id: string;
  job_id: string;
  saved_at: string;
  notes?: string;
  is_interested: boolean;
  application_status: string;
  job?: JobListing;
}

export interface StudentJobAlert {
  id: string;
  student_id: string;
  title: string;
  category: JobPrimaryCategory | 'ALL';
  subcategories: string[];
  keywords: string[];
  locations: string[];
  remote_only: boolean;
  freshers_only: boolean;
  is_active: boolean;
  last_triggered_at?: string;
  created_at: string;
}

export interface JobSourceConfig {
  id: string;
  name: string;
  category: JobPrimaryCategory | 'BOTH';
  source_url: string;
  enabled: boolean;
  health_status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  last_successful_sync?: string;
  records_retrieved_last_run?: number;
  last_error?: string;
}

export interface JobSyncRun {
  id: string;
  source_id: string;
  source_name: string;
  started_at: string;
  completed_at: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  records_retrieved: number;
  records_added: number;
  records_updated: number;
  duplicates_skipped: number;
}

export interface StudentJobMatchExplanation {
  job_id: string;
  student_id: string;
  match_percentage: number | null;
  match_basis: string;
  is_eligible_qualification: boolean | null;
  matched_skills: string[];
  missing_skills: string[];
  qualification_match_details: string;
  experience_match_details: string;
  recommendation_reasons: string[];
  suggested_action: 'APPLY_NOW' | 'UPSKILL_FIRST' | 'PREPARE_RESUME' | 'EXPLORE';
  ai_explanation?: string;
}

export interface JobsDashboardStats {
  total_jobs: number;
  government_jobs: number;
  private_jobs: number;
  closing_soon_count: number;
  saved_jobs_count: number;
  matching_profile_count: number;
  last_sync_time?: string;
  active_sources_count: number;
  healthy_sources_count: number;
}

export interface SubcategoryMeta {
  key: string;
  label: string;
  description: string;
  icon?: string;
}
