/**
 * Phase 12 - Resume Builder, Career Assistant & Skill Assessment Types
 */

export type ResumeTemplate = 'CLASSIC' | 'MODERN' | 'TECHNICAL' | 'MINIMAL' | 'ACADEMIC' | 'CUSTOM_UPLOADED';
export type ResumeStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface CustomTemplateConfig {
  template_name: string;
  filename: string;
  detected_sections: {
    key: string;
    label: string;
    original_heading?: string;
    found: boolean;
    confidence?: number;
  }[];
  section_order: string[];
  styling: {
    font_family: 'sans' | 'serif' | 'mono';
    accent_color: string;
    header_alignment: 'left' | 'center';
    layout: 'SINGLE_COLUMN' | 'TWO_COLUMN';
    divider_style: 'solid' | 'subtle' | 'bold' | 'none';
    density: 'compact' | 'normal' | 'spacious';
  };
  detected_headings?: Record<string, string>;
  uploaded_at: string;
}

export type SkillCategory =
  | 'PROGRAMMING'
  | 'DATA'
  | 'AI_ML'
  | 'WEB'
  | 'DATABASE'
  | 'CLOUD'
  | 'DEVOPS'
  | 'SECURITY'
  | 'SOFTWARE_ENGINEERING'
  | 'COMMUNICATION'
  | 'APTITUDE'
  | 'DOMAIN';

export type ResumeSkillCategory =
  | 'PROGRAMMING'
  | 'FRAMEWORK'
  | 'DATABASE'
  | 'AI_ML'
  | 'CLOUD'
  | 'DEVOPS'
  | 'TOOLS'
  | 'SOFT_SKILL'
  | 'LANGUAGE'
  | 'OTHER';

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type SkillConfidence =
  | 'VERIFIED'
  | 'STRONG_EVIDENCE'
  | 'DEVELOPING_EVIDENCE'
  | 'LIMITED_EVIDENCE'
  | 'NOT_ASSESSED';

export type SkillSource =
  | 'STUDENT_DECLARED'
  | 'COURSE'
  | 'QUIZ'
  | 'DSA'
  | 'CODING'
  | 'PROJECT'
  | 'CERTIFICATION'
  | 'ASSESSMENT';

export type ResumeSkillSource =
  | 'STUDENT_ENTERED'
  | 'PROJECT'
  | 'COURSE'
  | 'CERTIFICATION'
  | 'ASSESSMENT'
  | 'PLATFORM_ACTIVITY';

export type RoadmapStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type RoadmapStepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type RoadmapStepSource =
  | 'COURSE'
  | 'DSA'
  | 'CODING'
  | 'QUIZ'
  | 'PROJECT'
  | 'NOTES'
  | 'PLACEMENT';

export interface Resume {
  id: string;
  student_id: string;
  title: string;
  template: ResumeTemplate;
  target_role: string;
  target_industry: string;
  summary: string;
  status: ResumeStatus;
  section_order: string[];
  custom_template_config?: CustomTemplateConfig;
  created_at: string;
  updated_at: string;
}

export interface ResumeProfile {
  id: string;
  resume_id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  headline: string;
}

export interface ResumeEducation {
  id: string;
  resume_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  description: string;
  order_index: number;
}

export interface ResumeSkill {
  id: string;
  resume_id: string;
  skill: string;
  category: ResumeSkillCategory;
  proficiency: SkillProficiency;
  source: ResumeSkillSource;
  order_index: number;
}

export interface ResumeProject {
  id: string;
  resume_id: string;
  project_id?: string;
  title: string;
  description_override: string;
  highlighted_features: string[];
  technologies: string[];
  order_index: number;
}

export interface ResumeExperience {
  id: string;
  resume_id: string;
  organization: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  achievements: string[];
  order_index: number;
}

export interface ResumeCertification {
  id: string;
  resume_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  credential_id: string;
  credential_url: string;
  description: string;
  order_index: number;
}

export interface ResumeAchievement {
  id: string;
  resume_id: string;
  title: string;
  description: string;
  date: string;
  source: string;
  order_index: number;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  content_snapshot: FullResumeData;
  created_at: string;
  created_by: string;
}

export interface JobDescription {
  id: string;
  student_id: string;
  title: string;
  company: string;
  description: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  skills: string[];
  technical_topics: string[];
  recommended_courses: string[];
  recommended_projects: string[];
  recommended_tools: string[];
  interview_topics: string[];
  coding_topics: string[];
  typical_learning_path: string[];
  source_metadata: {
    source_name: string;
    last_reviewed: string;
    disclaimer: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CareerRoadmapStep {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  order_index: number;
  status: RoadmapStepStatus;
  estimated_effort: string;
  source_type: RoadmapStepSource;
  source_id?: string;
  url?: string;
}

export interface CareerRoadmap {
  id: string;
  student_id: string;
  role_id: string;
  title: string;
  status: RoadmapStatus;
  created_at: string;
  updated_at: string;
  steps: CareerRoadmapStep[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  parent_skill_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  source: SkillSource;
  evidence_count: number;
  proficiency: SkillProficiency;
  confidence: SkillConfidence;
  last_updated_at: string;
}

export interface SkillEvidence {
  id: string;
  student_skill_id: string;
  student_id: string;
  skill_id: string;
  source_type: SkillSource;
  source_id: string;
  description: string;
  score?: number;
  created_at: string;
}

export interface SkillAssessment {
  id: string;
  student_id: string;
  title: string;
  skill_id: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  question_count: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score?: number;
  quiz_id?: string;
  quiz_attempt_id?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface FullResumeData {
  resume: Resume;
  profile: ResumeProfile | null;
  education: ResumeEducation[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  experience: ResumeExperience[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
  completeness_score: number;
  completeness_breakdown: {
    section: string;
    complete: boolean;
    weight: number;
    message: string;
  }[];
}

export interface ResumeAnalysisResult {
  keyword_coverage: {
    found_keywords: string[];
    missing_keywords: string[];
    coverage_percentage: number;
  };
  section_structure: {
    valid: boolean;
    present_sections: string[];
    missing_sections: string[];
    suggestions: string[];
  };
  text_readability: {
    score: number;
    reading_level: string;
    word_count: number;
    issues: string[];
  };
  formatting_consistency: {
    bullet_style_consistent: boolean;
    date_format_consistent: boolean;
    issues: string[];
    suggestions: string[];
  };
  role_alignment: {
    target_role: string;
    alignment_percentage: number;
    alignment_notes: string[];
    recommendations: string[];
  };
  contact_info_completeness: {
    complete: boolean;
    missing_fields: string[];
  };
  weak_bullet_phrasings: {
    current: string;
    suggestion: string;
    reason: string;
  }[];
  scoring_explanation: string;
  calculated_score: number;
  disclaimer: string;
}

export interface ResumeTailoringResult {
  job_title: string;
  company: string;
  matched_skills: string[];
  potential_skill_gaps: string[];
  missing_keywords: string[];
  suggested_wording: {
    section: string;
    current: string;
    suggested: string;
    reason: string;
  }[];
  relevant_projects: {
    project_id: string;
    title: string;
    alignment_reason: string;
  }[];
  relevant_coursework: string[];
  suggested_resume_sections: string[];
  disclaimer: string;
}

export interface SkillGapAnalysisResult {
  target_role: string;
  current_strengths: {
    skill: string;
    evidence_state: SkillConfidence;
    evidence_count: number;
  }[];
  skills_to_develop: {
    skill: string;
    evidence_state: SkillConfidence;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    recommended_learning_resource?: {
      title: string;
      type: 'COURSE' | 'NOTES' | 'DOC' | 'CODING' | 'DSA' | 'QUIZ' | 'PROJECT';
      reference_id?: string;
    };
    recommended_project?: string;
    recommended_practice?: string;
  }[];
  coverage_percentage: number;
  disclaimer: string;
}

export interface CareerRecommendationResult {
  potentially_relevant_roles: {
    role_id: string;
    role_name: string;
    match_percentage: number;
    match_reasons: string[];
    top_matching_skills: string[];
    skills_to_develop: string[];
  }[];
  skills_to_develop: string[];
  recommended_projects: string[];
  recommended_courses: string[];
  explanation: string;
  disclaimer: string;
}

export interface CareerProfileData {
  student_id: string;
  target_roles: string[];
  preferred_industries: string[];
  preferred_locations: string[];
  preferred_work_arrangement: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE';
  graduation_year?: number;
  technical_skills: string[];
  career_goals: string[];
  updated_at: string;
}

export interface CareerDashboardSummary {
  career_profile: CareerProfileData;
  readiness: {
    resume_completeness: number;
    resume_sections_status: { section: string; complete: boolean; details?: string }[];
    skills_aligned_percentage: number | null;
    target_role_name?: string | null;
    matching_skills: string[];
    skills_to_develop: string[];
    projects_count: number;
    projects_available: { id: string; title: string; domain?: string }[];
    placement_prep_progress: {
      topics_practiced: number | null;
      total_topics: number | null;
      mock_interviews_count: number;
      latest_mock_score?: number;
      active_sprint_title?: string | null;
    };
    applications_in_progress: number;
    upcoming_deadlines: {
      id: string;
      title: string;
      company: string;
      date: string;
      type: 'DEADLINE' | 'INTERVIEW' | 'ASSESSMENT';
    }[];
    readiness_explanation: string;
  };
  recommended_actions: {
    id: string;
    title: string;
    description: string;
    action_label: string;
    target_path: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'RESUME' | 'PLACEMENT' | 'JOBS' | 'APPLICATIONS' | 'PLATFORMS' | 'SKILLS';
  }[];
  recent_activity: {
    id: string;
    title: string;
    subtitle: string;
    timestamp: string;
    category: 'APPLICATION' | 'RESUME' | 'INTERVIEW' | 'INTEGRATION' | 'PROFILE';
    url?: string;
  }[];
}
