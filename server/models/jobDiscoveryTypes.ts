// server/models/jobDiscoveryTypes.ts
// Comprehensive domain models for Multi-Source Jobs Discovery (Government + Private)

export type JobPrimaryCategory = 'GOVERNMENT' | 'PRIVATE';

export type GovernmentSubcategory =
  | 'CENTRAL_GOVERNMENT'
  | 'STATE_GOVERNMENT'
  | 'PSU'
  | 'BANKING'
  | 'RAILWAYS'
  | 'DEFENCE'
  | 'POLICE_PARAMILITARY'
  | 'CIVIL_SERVICES'
  | 'SSC'
  | 'UPSC'
  | 'STATE_PSC'
  | 'TEACHING_EDUCATION'
  | 'GOVERNMENT_HEALTHCARE'
  | 'ENGINEERING_RECRUITMENT'
  | 'RESEARCH_SCIENTIFIC'
  | 'GOVERNMENT_IT_SOFTWARE'
  | 'APPRENTICESHIPS'
  | 'GOVERNMENT_INTERNSHIPS'
  | 'CONTRACT_GOVERNMENT'
  | 'OTHER_GOVERNMENT';

export type PrivateSubcategory =
  | 'SOFTWARE_DEVELOPMENT'
  | 'QA_TESTING'
  | 'JAVA_DEVELOPMENT'
  | 'PYTHON_DEVELOPMENT'
  | 'WEB_DEVELOPMENT'
  | 'FRONTEND_DEVELOPMENT'
  | 'BACKEND_DEVELOPMENT'
  | 'FULLSTACK_DEVELOPMENT'
  | 'MOBILE_APP_DEVELOPMENT'
  | 'AI_MACHINE_LEARNING'
  | 'DATA_SCIENCE'
  | 'DATA_ANALYTICS'
  | 'CLOUD_COMPUTING'
  | 'DEVOPS_SRE'
  | 'CYBERSECURITY'
  | 'DATABASE_SQL'
  | 'NETWORKING'
  | 'SYSTEM_DESIGN_ARCHITECTURE'
  | 'TECHNICAL_SUPPORT'
  | 'IT_INFRASTRUCTURE'
  | 'PRODUCT_MANAGEMENT'
  | 'BUSINESS_ANALYSIS'
  | 'DESIGN_UI_UX'
  | 'FRESHERS_ROLES'
  | 'GRADUATE_TRAINEE'
  | 'INTERNSHIPS'
  | 'REMOTE_JOBS'
  | 'OTHER_PRIVATE';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'APPRENTICESHIP'
  | 'CONTRACT'
  | 'TRAINEE';

export type WorkArrangement = 'ONSITE' | 'REMOTE' | 'HYBRID';

export type SourceVerificationStatus =
  | 'OFFICIAL_GOVERNMENT_SOURCE'
  | 'AUTHORIZED_JOB_PROVIDER'
  | 'SECONDARY_SOURCE_VERIFY_NOTICE'
  | 'UNVERIFIED';

export type JobStatus = 'ACTIVE' | 'CLOSING_SOON' | 'EXPIRED' | 'CANCELLED';

export interface JobListing {
  id: string;
  external_job_id?: string;
  source_id: string;
  source_name: string;
  source_type: 'GOVERNMENT_PORTAL' | 'EMPLOYER_ATS' | 'AUTHORIZED_FEED' | 'PUBLIC_JOB_API' | 'MANUAL_IMPORT';
  source_url: string;
  application_url: string;
  title: string;
  organization: string;
  category: JobPrimaryCategory;
  subcategory: string;
  employment_type: EmploymentType;
  work_arrangement: WorkArrangement;
  location: string;
  country: string;
  state?: string;
  city?: string;
  remote_eligible: boolean;
  experience_min?: number;
  experience_max?: number;
  experience_label?: string;
  minimum_qualification?: string;
  required_skills: string[];
  preferred_skills: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_text?: string;
  description: string;
  responsibilities?: string[];
  eligibility_requirements?: string[];
  application_instructions?: string;
  application_open_date?: string;
  application_deadline?: string;
  publication_date: string;
  last_verified_at: string;
  retrieved_at: string;
  status: JobStatus;
  verification_status: SourceVerificationStatus;
  is_freshers_friendly: boolean;

  // Government Specific Fields
  notification_number?: string;
  recruiting_body?: string;
  total_vacancies?: number;
  age_limit_min?: number;
  age_limit_max?: number;
  application_fee?: string;
  exam_stages?: string[];
  official_notification_pdf_url?: string;
  amendment_notice_url?: string;

  // AI-Assisted Enrichment (Clearly distinguished from raw source data)
  ai_enrichment?: {
    summary?: string;
    skills_extracted?: string[];
    eligibility_breakdown?: string[];
    simplification_for_students?: string;
    preparation_checklist?: string[];
    enriched_at?: string;
  };

  created_at: string;
  updated_at: string;
}

export interface StudentSavedJob {
  id: string;
  student_id: string;
  job_id: string;
  saved_at: string;
  notes?: string;
  is_interested: boolean;
  application_status?: string;
  job?: JobListing;
}

export interface StudentJobAlert {
  id: string;
  student_id: string;
  title: string;
  category?: JobPrimaryCategory | 'ALL';
  subcategories: string[];
  keywords: string[];
  locations: string[];
  remote_only: boolean;
  freshers_only: boolean;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
}

export interface JobSourceConfig {
  id: string;
  name: string;
  category: JobPrimaryCategory | 'BOTH';
  type: 'GOVERNMENT_PORTAL' | 'EMPLOYER_ATS' | 'AUTHORIZED_FEED' | 'PUBLIC_JOB_API';
  source_url: string;
  enabled: boolean;
  last_attempted_sync?: string;
  last_successful_sync?: string;
  health_status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  last_error?: string;
  records_retrieved_last_run: number;
  new_records_last_run: number;
  updated_records_last_run: number;
  duplicates_ignored_last_run: number;
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
  errors?: string[];
}

export interface StudentJobMatchExplanation {
  job_id: string;
  student_id: string;
  /** Share of the listing's skills found on the student's profile; null when the listing names no skills. */
  match_percentage: number | null;
  match_basis: string;
  /** Always null: the platform does not judge qualification eligibility. */
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
