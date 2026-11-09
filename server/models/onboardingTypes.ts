// ============================================================================
// STUDENT ONBOARDING, EXTENDED PROFILE & INTELLIGENCE ENGINE TYPES
// ============================================================================

// --- Onboarding Status ---
export type OnboardingStepId =
  | 'ACCOUNT_IDENTITY'
  | 'PERSONAL_PROFILE'
  | 'EDUCATION_BACKGROUND'
  | 'SEMESTER_SYLLABUS'
  | 'TECHNICAL_SKILLS'
  | 'INTERESTS_TOPICS'
  | 'CAREER_GOALS'
  | 'LEARNING_GOALS'
  | 'AI_PREFERENCES'
  | 'STUDY_SCHEDULE'
  | 'COURSE_MATERIALS'
  | 'PROJECT_PORTFOLIO'
  | 'APPLICATIONS_LINKS'
  | 'RESEARCH_COMMUNITY'
  | 'FINAL_REVIEW'
  // Legacy aliases for backward compatibility:
  | 'BASIC_PROFILE'
  | 'EDUCATION'
  | 'LEARNING_PREFERENCES'
  | 'SKILLS_ASSESSMENT'
  | 'ACADEMIC_HISTORY'
  | 'PROJECTS_PORTFOLIO'
  | 'STUDY_CONSTRAINTS';

export interface OnboardingStepStatus {
  step_id: OnboardingStepId;
  label: string;
  completed: boolean;
  skipped: boolean;
  updated_at: string | null;
}

export interface OnboardingStatus {
  student_id: string;
  is_complete: boolean;
  current_step: OnboardingStepId;
  steps: OnboardingStepStatus[];
  started_at: string;
  completed_at: string | null;
  last_saved_at: string;
}

// --- Step 1 & 2: Account & Personal Profile ---
export interface BasicProfileData {
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  email: string; // read-only from auth
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  preferred_language: string;
  timezone: string;
  accessibility_preferences?: string[];
  name_pronunciation?: string;
  bio?: string;
  languages_understood?: string[];
  terms_accepted?: boolean;
  is_email_verified?: boolean;
}

// --- Step 3: Education Profile ---
export type DegreeType = 'B.Tech' | 'B.E.' | 'M.Tech' | 'M.E.' | 'B.Sc' | 'M.Sc' | 'BCA' | 'MCA' | 'Other';
export type StudyMode = 'FULL_TIME' | 'PART_TIME' | 'DISTANCE' | 'ONLINE';

export interface EducationProfile {
  student_id: string;
  degree: DegreeType;
  branch: string;
  specialization?: string;
  /** Phase 5 */
  department?: string;
  institution: string;
  university?: string;
  current_year: number;
  current_semester: number;
  admission_year?: number;
  expected_graduation_year: number;
  study_mode: StudyMode;
  education_status?: string;
  previous_qualification?: string;
  /** Phase 5: structured list; previous_qualification keeps the first entry for older readers. */
  previous_qualifications?: string[];
  current_cgpa?: number;
  cgpa_scale?: number;
  academic_interests?: string[];
  current_subjects: string[];
  previous_subjects?: string[];
  previous_marks?: { subject: string; marks: number; max_marks: number; grade?: string }[];
  achievements?: string[];
  certifications?: string[];
  completed_courses?: string[];
  current_challenges?: string[];
  // Pre-B.Tech Heritage & Entrance Performance:
  tenth_board?: string;
  tenth_percentage?: number;
  twelfth_or_diploma?: string;
  twelfth_stream?: string;
  twelfth_percentage?: number;
  entrance_exam_name?: string;
  entrance_exam_rank?: string;
  // Socio-Economic Context:
  first_generation_engineer?: boolean;
  family_context_note?: string;
  financial_urgency?: 'IMMEDIATE_JOB_CRITICAL' | 'PREFER_JOB_SOON' | 'BALANCED_EXPLORATION' | 'INVESTING_IN_HIGHER_STUDIES';
  education_loan_active?: boolean;
  updated_at: string;
}

// --- Step 4: Semester & Syllabus ---
export type SubjectType = 'THEORY' | 'CORE' | 'LAB' | 'PROJECT' | 'ELECTIVE' | 'AUDIT';

export interface SyllabusUnit {
  unit_number: number;
  title: string;
  topics: string[];
}

export interface AcademicSubject {
  id: string;
  name: string;
  code?: string;
  credits?: number;
  subject_type: SubjectType;
  description?: string;
  syllabus_units: SyllabusUnit[];
  syllabus_document_url?: string;
}

export interface AcademicDate {
  id: string;
  label: string;
  date: string;
  type: 'INTERNAL_EXAM' | 'SLIP_TEST' | 'QUIZ' | 'MINOR_EXAM' | 'LAB_ASSESSMENT' |
        'ASSIGNMENT' | 'PROJECT_REVIEW' | 'END_SEMESTER' | 'OTHER';
  subject_id?: string;
  notes?: string;
  /** True for placeholder dates generated from a typical semester calendar, not entered by the student. */
  is_estimate?: boolean;
}

export interface SemesterSyllabusData {
  student_id: string;
  academic_year: string;
  semester_number: number;
  subjects: AcademicSubject[];
  academic_dates: AcademicDate[];
  semester_start_date?: string;
  semester_end_date?: string;
  syllabus_reference?: string;
  academic_priorities?: string[];
  study_materials_notes?: string;
  /** True while this is the auto-generated branch template the student has not saved yet. */
  is_template?: boolean;
  updated_at: string;
}

// --- Step 5: Skills Self-Assessment ---
export type SkillLevel = 'NOT_STARTED' | 'BEGINNER' | 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'NOT_SURE';

export interface SkillSelfAssessment {
  skill_name: string;
  skill_category: string;
  self_reported_level: SkillLevel;
  is_custom: boolean;
}

export interface StudentSkillsAssessment {
  student_id: string;
  skills: SkillSelfAssessment[];
  additional_skills: string[];
  certifications?: string[];
  practical_experience?: string;
  evidence_urls?: string[];
  skills_to_improve?: string[];
  updated_at: string;
}

// --- Step 6: Academic History ---
export interface SemesterResult {
  semester: number;
  gpa?: number;
  percentage?: number;
  year: string;
}

export interface SubjectMark {
  subject: string;
  internal_marks?: number;
  external_marks?: number;
  total_marks?: number;
  max_marks: number;
  grade?: string;
  semester: number;
}

export interface AcademicHistory {
  student_id: string;
  semester_results: SemesterResult[];
  subject_marks: SubjectMark[];
  completed_courses_platform: string[];
  completed_lessons_count: number;
  quiz_history_count: number;
  coding_practice_count: number;
  dsa_progress_count: number;
  sql_practice_count: number;
  lab_experiments: string[];
  projects_completed: string[];
  certifications_earned: string[];
  awards: string[];
  topics_needing_improvement: string[];
  previous_goals: string[];
  updated_at: string;
}

// --- Step 7 & 8: Career Goals & Learning Development ---
export type CareerDirection =
  | 'SOFTWARE_DEVELOPMENT' | 'FRONTEND_DEVELOPMENT' | 'BACKEND_DEVELOPMENT'
  | 'FULLSTACK_DEVELOPMENT' | 'AI_ML' | 'DATA_SCIENCE' | 'DATA_ENGINEERING'
  | 'CYBERSECURITY' | 'CLOUD_DEVOPS' | 'MOBILE_DEVELOPMENT' | 'TESTING_AUTOMATION'
  | 'PRODUCT_BUSINESS' | 'RESEARCH' | 'HIGHER_STUDIES' | 'COMPETITIVE_EXAMS'
  | 'GOVERNMENT_EXAMS' | 'ENTREPRENEURSHIP' | 'PRODUCT_COMPANIES' | 'SOFTWARE_ENGINEERING' | 'OTHER';

export interface CareerGoals {
  student_id: string;
  career_directions: CareerDirection[];
  target_job_role?: string;
  preferred_industry?: string;
  target_companies?: string[];
  internship_goals?: string;
  placement_timeline?: string;
  work_mode_preference?: 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
  employment_type_preference?: 'INTERNSHIP' | 'FULL_TIME' | 'BOTH';
  preferred_location?: string;
  placement_priorities?: string[];
  placement_readiness_self_rating?: number;
  desired_technical_skills: string[];
  higher_study_plans?: string;
  competitive_exam_goals?: string;
  entrepreneurship_interest?: boolean;
  long_term_goal?: string;
  career_concerns?: string;
  preferred_project_areas?: string[];
  resume_status?: 'NOT_STARTED' | 'DRAFT' | 'IN_PROGRESS' | 'READY';
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  hackerrank_url?: string;
  codechef_url?: string;
  kaggle_url?: string;
  portfolio_urls?: string[];
  research_topics?: string[];
  research_keywords?: string[];
  scholarly_sources?: string[];
  community_interests?: string[];
  notification_preferences?: {
    study_reminders: boolean;
    revision_reminders: boolean;
    deadline_reminders: boolean;
    goal_reminders: boolean;
    community_notifications: boolean;
  };
  primary_career_track?: 'CAMPUS_PLACEMENT' | 'HIGHER_STUDIES_GATE' | 'HIGHER_STUDIES_ABROAD' | 'GOVERNMENT_EXAMS' | 'STARTUP_FOUNDER';
  target_exam_goals?: string;
  favorite_subjects?: string[];
  challenging_subjects?: string[];
  achievements_and_rewards?: string[];
  // Phase 5 structured career profile (single-value fields above keep the first entry for older readers)
  target_roles?: string[];
  career_interests?: string[];
  preferred_industries?: string[];
  preferred_locations?: string[];
  internship_interests?: string[];
  placement_goals?: string;
  higher_education_interests?: string[];
  competitive_exams?: string[];
  gate_paper?: string;
  short_term_goals?: string;
  updated_at: string;
}

// --- Step 9 & 11: Learning Preferences & Document Preferences ---
export type LearningStyle = 'VISUAL' | 'READING' | 'HANDS_ON' | 'VIDEO' | 'DISCUSSION' | 'MIXED';
export type ExplanationDepth = 'QUICK_OVERVIEW' | 'STANDARD' | 'DEEP_DIVE' | 'ELI5';

export interface LearningPreferences {
  student_id: string;
  favorite_subjects: string[];
  topics_of_interest: string[];
  difficult_topics: string[];
  preferred_programming_languages: string[];
  learning_style: LearningStyle | string;
  explanation_depth: ExplanationDepth;
  preferred_explanation_language: string;
  additional_languages?: string[];
  preferred_content_format?: string[];
  difficulty_level?: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'ADAPTIVE';
  step_by_step_preference?: boolean;
  visual_preference: boolean;
  video_preference: boolean;
  text_preference: boolean;
  practical_coding_preference: boolean;
  theory_practice_balance?: string;
  ai_response_length?: 'CONCISE' | 'BALANCED' | 'IN_DEPTH';
  note_format_preference?: string;
  flashcard_format_preference?: string;
  quiz_difficulty_preference?: string;
  practice_frequency_preference?: string;
  document_summary_length?: string;
  citation_style_preference?: string;
  resource_links?: string[];
  weekday_study_hours: number;
  weekend_study_hours: number;
  preferred_study_time: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'FLEXIBLE';
  revision_frequency: 'DAILY' | 'ALTERNATE_DAYS' | 'WEEKLY' | 'BEFORE_EXAMS' | 'FLEXIBLE';
  learning_pace?: 'FAST_PACED' | 'STEADY_BALANCED' | 'FOUNDATIONAL_STEP_BY_STEP';
  /** Phase 5: fields holding a placeholder value because the student has not chosen one. */
  unset_fields?: string[];
  updated_at: string;
}

// --- Step 12: Projects & Portfolio ---
export type ProjectStatus = 'IDEA' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'ABANDONED';

export interface PortfolioProject {
  id: string;
  student_id: string;
  title: string;
  description: string;
  problem_statement?: string;
  technologies: string[];
  category?: string;
  status: ProjectStatus;
  start_date?: string;
  completion_date?: string;
  contribution?: string;
  repository_url?: string;
  demo_url?: string;
  documentation_url?: string;
  skills_demonstrated: string[];
  next_milestones?: string[];
  challenges_outcomes?: string;
  created_at: string;
  updated_at: string;
}

// --- Step 10: Study Constraints & Schedule ---
export interface StudyConstraints {
  student_id: string;
  daily_study_hours: number;
  weekly_study_hours: number;
  available_days?: string[];
  preferred_start_time?: string;
  preferred_end_time?: string;
  break_preference?: string;
  exam_period_hours?: number;
  study_reminders_enabled?: boolean;
  deadline_reminders_enabled?: boolean;
  upcoming_commitments?: string[];
  preferred_session_duration: number; // minutes
  device_limitations?: string[];
  internet_limitations?: string;
  budget_preference: 'FREE_ONLY' | 'LOW_BUDGET' | 'MODERATE' | 'NO_CONSTRAINT';
  preferred_free_resources: string[];
  scheduling_constraints?: string[];
  updated_at: string;
}

// --- Profile Completion ---
export interface ProfileSectionStatus {
  section: OnboardingStepId;
  label: string;
  completed: boolean;
  completion_percentage: number;
  required_fields_filled: number;
  total_required_fields: number;
  optional_fields_filled: number;
  total_optional_fields: number;
  last_updated: string | null;
}

export interface ProfileCompletion {
  student_id: string;
  overall_percentage: number;
  sections: ProfileSectionStatus[];
  is_onboarding_complete: boolean;
  required_percentage: number;
  optional_percentage: number;
}

// --- Student Memory ---
export interface StudentMemoryEntry {
  id: string;
  student_id: string;
  memory_type: 'PREFERENCE' | 'LEARNING_INSIGHT' | 'INTERACTION' | 'GOAL_PROGRESS' | 'FEEDBACK';
  key: string;
  value: string;
  context?: string;
  source: 'AI_INFERRED' | 'STUDENT_PROVIDED' | 'PLATFORM_DERIVED';
  confidence: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

// --- Unified Student Intelligence Context ---
export interface StudentIntelligenceContext {
  student_id: string;
  basic_profile: BasicProfileData;
  education: EducationProfile | null;
  semester_syllabus: SemesterSyllabusData | null;
  preferences: LearningPreferences | null;
  skills: StudentSkillsAssessment | null;
  academic_history: AcademicHistory | null;
  career_goals: CareerGoals | null;
  projects: PortfolioProject[];
  study_constraints: StudyConstraints | null;
  profile_completion: ProfileCompletion;
  recent_memories: StudentMemoryEntry[];
  onboarding_status: OnboardingStatus;
}

// --- Recommendation with Evidence ---
export interface StudentRecommendation {
  id: string;
  student_id: string;
  title: string;
  description: string;
  target_page: string;
  target_action?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  reason: string;
  confidence: number;
  estimated_time_minutes?: number;
  status: 'ACTIVE' | 'DISMISSED' | 'COMPLETED' | 'POSTPONED';
  category: 'ACADEMIC' | 'SKILL' | 'CAREER' | 'REVISION' | 'PRACTICE' | 'PROJECT' | 'GENERAL';
  created_at: string;
  updated_at: string;
}

// --- Dedicated Per-Student Trained AI Companion Agent ---
export interface StudentAIPersona {
  student_id: string;
  agent_companion_name: string;
  agent_avatar_url: string;
  pedagogical_tone: 'SOCRATIC_ENCOURAGING' | 'EXAM_ORIENTED_RIGOROUS' | 'PRACTICAL_INDUSTRY_FIRST' | 'PATIENT_FOUNDATIONAL';
  primary_focus_directives: string[];
  system_prompt_blueprint: string;
  knowledge_graph_summary: string;
  last_trained_at: string;
}

