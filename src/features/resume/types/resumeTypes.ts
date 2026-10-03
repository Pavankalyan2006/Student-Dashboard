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

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
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
  source: string;
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
