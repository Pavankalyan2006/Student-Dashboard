// Phase 5: the canonical student profile.
//
// This is the one shape every module reads through StudentProfileService. It is assembled from
// (and written back to) the existing records: the student account, the onboarding education /
// skills / career / learning / schedule records, portfolio projects, and the Phase 5 experience and
// certification records. See docs/phase-5/PHASE_5_STUDENT_PROFILE_SCHEMA.md.

export const SKILL_CATEGORIES = [
  'PROGRAMMING_LANGUAGE',
  'FRONTEND',
  'BACKEND',
  'DATABASE',
  'AI_ML',
  'CLOUD',
  'DEVELOPER_TOOLS',
  'TESTING',
  'OTHER',
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

/** Self-reported. The server never upgrades a level on its own. */
export const PROFICIENCY_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
export type Proficiency = (typeof PROFICIENCY_LEVELS)[number];

export const ACADEMIC_STATUSES = ['STUDYING', 'BACKLOGS_PENDING', 'GAP_YEAR', 'COMPLETED', 'OTHER'] as const;
export const EXPERIENCE_KINDS = ['INTERNSHIP', 'WORK', 'RESEARCH', 'VOLUNTEER', 'OTHER'] as const;
export const EXPLANATION_STYLES = ['QUICK_OVERVIEW', 'STANDARD', 'DEEP_DIVE', 'ELI5'] as const;
export const LEARNING_STYLES = ['VISUAL', 'READING', 'HANDS_ON', 'VIDEO', 'DISCUSSION', 'MIXED'] as const;
export const DIFFICULTY_LEVELS = ['FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'ADAPTIVE'] as const;
export const REVISION_PREFERENCES = ['DAILY', 'ALTERNATE_DAYS', 'WEEKLY', 'BEFORE_EXAMS', 'FLEXIBLE'] as const;
export const STUDY_TIMES = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FLEXIBLE'] as const;
export const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

export interface IdentitySection {
  full_name: string;
  display_name: string | null;
  email: string; // read-only: owned by the auth provider
  email_verified: boolean; // read-only: from the verified token
  phone: string | null;
  avatar_url: string | null;
  terms_accepted_at: string | null;
  privacy_accepted_at: string | null;
}

export interface AcademicSection {
  university: string | null;
  college: string | null;
  degree: string | null;
  department: string | null;
  branch: string | null;
  specialization: string | null;
  academic_year: number | null; // year of study, 1..6
  current_semester: number | null; // 1..12
  admission_year: number | null;
  expected_graduation_year: number | null;
  subjects: string[];
  academic_status: string | null;
  cgpa: number | null; // optional, never derived
  cgpa_scale: number | null;
  previous_qualifications: string[];
  academic_achievements: string[];
}

export interface SkillEntry {
  name: string;
  category: SkillCategory;
  proficiency: Proficiency;
}

export interface SkillsSection {
  skills: SkillEntry[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  project_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  status: string | null;
}

export interface ExperienceEntry {
  id: string;
  kind: (typeof EXPERIENCE_KINDS)[number];
  organization: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  credential_url: string | null;
}

export interface ExperienceSection {
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  achievements: string[];
  research_interests: string[];
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
}

export interface CareerSection {
  target_roles: string[];
  career_interests: string[];
  preferred_industries: string[];
  preferred_locations: string[];
  internship_interests: string[];
  placement_goals: string | null;
  higher_education_interests: string[];
  competitive_exams: string[]; // e.g. GATE, GRE, CAT; empty means none
  gate_paper: string | null; // only meaningful when competitive_exams includes GATE
  short_term_goals: string | null;
  long_term_goals: string | null;
}

export interface NotificationSettings {
  in_app: boolean;
  email_digest: 'NONE' | 'DAILY' | 'WEEKLY';
  study_reminders: boolean;
  revision_reminders: boolean;
  deadline_reminders: boolean;
}

export interface LearningSection {
  preferred_languages: string[]; // natural languages for explanations, first is primary
  explanation_style: (typeof EXPLANATION_STYLES)[number] | null;
  learning_style: (typeof LEARNING_STYLES)[number] | null;
  difficulty: (typeof DIFFICULTY_LEVELS)[number] | null;
  learning_interests: string[];
  weekly_study_hours: number | null;
  preferred_study_days: (typeof WEEK_DAYS)[number][];
  daily_study_minutes: number | null;
  preferred_study_time: (typeof STUDY_TIMES)[number] | null;
  revision_preference: (typeof REVISION_PREFERENCES)[number] | null;
  notifications: NotificationSettings;
}

export interface OnboardingProgress {
  current_step: number; // 1..7
  completed_steps: number[];
  skipped_steps: number[];
  completed: boolean;
  completed_at: string | null;
  started_at: string;
  last_saved_at: string;
}

export interface AccountSection {
  student_id: string;
  auth_provider: 'legacy' | 'firebase';
  registered_at: string;
  account_status: string;
  last_profile_update: string | null;
  profile_version: number;
  onboarding: OnboardingProgress;
}

export interface CanonicalProfile {
  identity: IdentitySection;
  academic: AcademicSection;
  skills: SkillsSection;
  experience: ExperienceSection;
  career: CareerSection;
  learning: LearningSection;
  account: AccountSection;
}

export type ProfileSectionKey = 'identity' | 'academic' | 'skills' | 'experience' | 'career' | 'learning';

export const ONBOARDING_STEP_SECTIONS: Record<number, ProfileSectionKey | 'review'> = {
  1: 'identity',
  2: 'academic',
  3: 'skills',
  4: 'experience',
  5: 'career',
  6: 'learning',
  7: 'review',
};

export const PROFILE_MODULES = [
  'dashboard',
  'semester',
  'tutor',
  'agent',
  'courses',
  'notes',
  'doubts',
  'flashcards',
  'planner',
  'languages',
  'coding',
  'sql',
  'ml',
  'system_design',
  'lab',
  'quiz',
  'gate',
  'interview',
  'projects',
  'career',
  'resume',
  'jobs',
  'placement',
  'community',
  'goals',
  'notifications',
] as const;
export type ProfileModule = (typeof PROFILE_MODULES)[number];
