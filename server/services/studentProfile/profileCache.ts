// Phase 5: maps the canonical profile onto the records the rest of the application already reads.
//
// In snapshot mode these records ARE the authoritative store (persisted by db/persistence.ts).
// In Supabase mode Postgres is authoritative and these records are the read cache that existing
// modules (semester centre, AI context, resume, planner...) keep reading synchronously; they are
// written only after the Postgres transaction commits.
import { db } from '../../db/database';
import { onboardingStores } from '../onboardingService';
import type {
  CareerGoals,
  EducationProfile,
  LearningPreferences,
  PortfolioProject,
  SkillLevel,
  StudentSkillsAssessment,
  StudyConstraints,
  SemesterSyllabusData,
} from '../../models/onboardingTypes';
import type {
  AcademicSection,
  CanonicalProfile,
  CareerSection,
  CertificationEntry,
  ExperienceEntry,
  ExperienceSection,
  IdentitySection,
  LearningSection,
  OnboardingProgress,
  Proficiency,
  SkillCategory,
  SkillsSection,
} from './types';

export interface ProfileMeta {
  student_id: string;
  profile_version: number;
  last_profile_update: string | null;
  onboarding: OnboardingProgress;
}

const experienceEntries = new Map<string, ExperienceEntry[]>();
const certificationEntries = new Map<string, CertificationEntry[]>();
const profileMeta = new Map<string, ProfileMeta>();

/** Registered with the snapshot persistence in server.ts. */
export const studentProfileStores = { experienceEntries, certificationEntries, profileMeta };

const CATEGORY_ALIASES: [RegExp, SkillCategory][] = [
  [/programming|language/i, 'PROGRAMMING_LANGUAGE'],
  [/front/i, 'FRONTEND'],
  [/back|web/i, 'BACKEND'],
  [/data ?base|sql/i, 'DATABASE'],
  [/ai|ml|machine|data science|deep/i, 'AI_ML'],
  [/cloud|devops/i, 'CLOUD'],
  [/test/i, 'TESTING'],
  [/tool|git/i, 'DEVELOPER_TOOLS'],
];

export function normalizeCategory(raw: string | undefined): SkillCategory {
  if (!raw) return 'OTHER';
  const upper = raw.toUpperCase();
  if (
    ['PROGRAMMING_LANGUAGE', 'FRONTEND', 'BACKEND', 'DATABASE', 'AI_ML', 'CLOUD', 'DEVELOPER_TOOLS', 'TESTING', 'OTHER'].includes(upper)
  ) {
    return upper as SkillCategory;
  }
  for (const [re, cat] of CATEGORY_ALIASES) if (re.test(raw)) return cat;
  return 'OTHER';
}

function levelToProficiency(level: SkillLevel | string | undefined): Proficiency {
  switch (level) {
    case 'EXPERT':
      return 'EXPERT';
    case 'ADVANCED':
      return 'ADVANCED';
    case 'INTERMEDIATE':
      return 'INTERMEDIATE';
    default:
      return 'BEGINNER';
  }
}

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : []);
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
/** Academic counters use 0 for "not entered". */
const pos = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);

export function defaultOnboarding(now = new Date().toISOString()): OnboardingProgress {
  return {
    current_step: 1,
    completed_steps: [],
    skipped_steps: [],
    completed: false,
    completed_at: null,
    started_at: now,
    last_saved_at: now,
  };
}

export function getMeta(studentId: string): ProfileMeta | null {
  return profileMeta.get(studentId) || null;
}

export function ensureMeta(studentId: string, completedLegacy = false, completedAt: string | null = null): ProfileMeta {
  let meta = profileMeta.get(studentId);
  if (!meta) {
    const onboarding = defaultOnboarding();
    if (completedLegacy) {
      // An account that finished the earlier onboarding keeps its completion; we do not invent a date.
      onboarding.completed = true;
      onboarding.completed_at = completedAt;
      onboarding.current_step = 7;
    }
    meta = { student_id: studentId, profile_version: 0, last_profile_update: null, onboarding };
    profileMeta.set(studentId, meta);
  }
  return meta;
}

export function setMeta(meta: ProfileMeta): void {
  profileMeta.set(meta.student_id, structuredClone(meta));
}

/** Reads the canonical profile from the application records. Returns null if the student does not exist. */
export function readCanonicalProfile(studentId: string): CanonicalProfile | null {
  const student = (db as any).students.get(studentId);
  if (!student) return null;
  const edu: EducationProfile | undefined = onboardingStores.educationProfiles.get(studentId);
  const skills: StudentSkillsAssessment | undefined = onboardingStores.skillsAssessments.get(studentId);
  const career: CareerGoals | undefined = onboardingStores.careerGoals.get(studentId);
  const learning: LearningPreferences | undefined = onboardingStores.learningPreferences.get(studentId);
  const schedule: StudyConstraints | undefined = onboardingStores.studyConstraints.get(studentId);
  const projects: PortfolioProject[] = onboardingStores.portfolioProjects.get(studentId) || [];
  const notif = (db as any).notificationPreferences.get(studentId);
  const meta = ensureMeta(studentId, Boolean(student.onboarding_completed), student.onboarding_completed_at || null);

  const identity: IdentitySection = {
    full_name: student.name,
    display_name: str(student.display_name),
    email: student.email,
    email_verified: Boolean(student.email_verified),
    phone: str(student.phone),
    avatar_url: str(student.avatar_url),
    terms_accepted_at: student.terms_accepted_at || null,
    privacy_accepted_at: student.privacy_accepted_at || null,
  };

  const academic: AcademicSection = {
    university: str(edu?.university),
    college: str(edu?.institution),
    degree: str(edu?.degree),
    department: str(edu?.department),
    branch: str(edu?.branch) || (edu ? null : str(student.branch)),
    specialization: str(edu?.specialization),
    academic_year: pos(edu?.current_year),
    current_semester: pos(edu?.current_semester) ?? (edu ? null : pos(student.semester)),
    admission_year: pos(edu?.admission_year),
    expected_graduation_year: pos(edu?.expected_graduation_year),
    subjects: arr(edu?.current_subjects),
    academic_status: str(edu?.education_status),
    cgpa: num(edu?.current_cgpa),
    cgpa_scale: num(edu?.cgpa_scale),
    previous_qualifications: edu?.previous_qualifications?.length
      ? arr(edu.previous_qualifications)
      : arr(edu?.previous_qualification ? [edu.previous_qualification] : []),
    academic_achievements: arr(edu?.achievements),
  };

  const skillsSection: SkillsSection = {
    skills: (skills?.skills || [])
      .filter((s) => s.self_reported_level !== 'NOT_STARTED')
      .map((s) => ({
        name: s.skill_name,
        category: normalizeCategory(s.skill_category),
        proficiency: levelToProficiency(s.self_reported_level),
      })),
  };

  const experience: ExperienceSection = {
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      technologies: arr(p.technologies),
      project_url: str(p.documentation_url),
      github_url: str(p.repository_url),
      demo_url: str(p.demo_url),
      status: str(p.status),
    })),
    experience: structuredClone(experienceEntries.get(studentId) || []),
    certifications: structuredClone(certificationEntries.get(studentId) || []),
    achievements: arr(career?.achievements_and_rewards),
    research_interests: arr(career?.research_topics),
    github_url: str(career?.github_url),
    linkedin_url: str(career?.linkedin_url),
    portfolio_url: str(career?.portfolio_urls?.[0]),
  };

  const careerSection: CareerSection = {
    target_roles: career?.target_roles?.length ? arr(career.target_roles) : arr(career?.target_job_role ? [career.target_job_role] : []),
    career_interests: arr(career?.career_interests),
    preferred_industries: career?.preferred_industries?.length
      ? arr(career.preferred_industries)
      : arr(career?.preferred_industry ? [career.preferred_industry] : []),
    preferred_locations: career?.preferred_locations?.length
      ? arr(career.preferred_locations)
      : arr(career?.preferred_location ? [career.preferred_location] : []),
    internship_interests: arr(career?.internship_interests),
    placement_goals: str(career?.placement_goals),
    higher_education_interests: arr(career?.higher_education_interests),
    competitive_exams: arr(career?.competitive_exams),
    gate_paper: str(career?.gate_paper),
    short_term_goals: str(career?.short_term_goals),
    long_term_goals: str(career?.long_term_goal),
  };

  const languages = learning
    ? arr([learning.preferred_explanation_language, ...(learning.additional_languages || [])])
    : [];
  const unset = new Set(learning?.unset_fields || []);
  const learningSection: LearningSection = {
    preferred_languages: Array.from(new Set(languages)),
    explanation_style: unset.has('explanation_depth') ? null : (learning?.explanation_depth as any) || null,
    learning_style: (learning?.learning_style as any) || null,
    difficulty: (learning?.difficulty_level as any) || null,
    learning_interests: arr(learning?.topics_of_interest),
    // 0 is what the schedule store holds for "not entered"; it is not a real availability.
    weekly_study_hours: pos(schedule?.weekly_study_hours),
    preferred_study_days: (arr(schedule?.available_days) as any) || [],
    daily_study_minutes: pos(schedule?.daily_study_hours) != null ? Math.round(schedule!.daily_study_hours * 60) : null,
    preferred_study_time: unset.has('preferred_study_time') ? null : (learning?.preferred_study_time as any) || null,
    revision_preference: unset.has('revision_frequency') ? null : (learning?.revision_frequency as any) || null,
    notifications: {
      in_app: notif ? Boolean(notif.in_app) : true,
      email_digest: notif?.email_digest || 'NONE',
      study_reminders: notif ? notif.study_reminders !== false : true,
      revision_reminders: notif ? notif.revision_reminders !== false : true,
      deadline_reminders: notif ? notif.goal_deadlines !== false : true,
    },
  };

  return {
    identity,
    academic,
    skills: skillsSection,
    experience,
    career: careerSection,
    learning: learningSection,
    account: {
      student_id: studentId,
      auth_provider: student.auth_provider || 'legacy',
      registered_at: student.created_at,
      account_status: student.status || (student.is_active ? 'ACTIVE' : 'SUSPENDED'),
      last_profile_update: meta.last_profile_update,
      profile_version: meta.profile_version,
      onboarding: structuredClone(meta.onboarding),
    },
  };
}

function proficiencyToLevel(p: Proficiency): SkillLevel {
  return p as SkillLevel;
}

const DAY_HOURS = (minutes: number | null) => (minutes == null ? undefined : Math.round((minutes / 60) * 100) / 100);

/**
 * Writes a complete canonical profile onto the application records. Called with an already
 * validated profile; does not perform I/O beyond the in-memory records.
 */
export function applyCanonicalProfile(studentId: string, p: CanonicalProfile): void {
  const now = new Date().toISOString();
  const student = (db as any).students.get(studentId);
  if (!student) throw new Error(`Student ${studentId} not found`);

  // --- identity and account ---
  student.name = p.identity.full_name;
  student.display_name = p.identity.display_name || undefined;
  student.avatar_url = p.identity.avatar_url || undefined;
  student.phone = p.identity.phone || undefined;
  student.terms_accepted_at = p.identity.terms_accepted_at || undefined;
  student.privacy_accepted_at = p.identity.privacy_accepted_at || undefined;
  if (p.academic.branch) student.branch = p.academic.branch;
  if (p.academic.current_semester) student.semester = p.academic.current_semester;
  student.onboarding_completed = p.account.onboarding.completed;
  student.onboarding_completed_at = p.account.onboarding.completed_at || undefined;
  student.updated_at = now;

  // --- academic -> education profile + semester syllabus subjects ---
  const a = p.academic;
  const hasAcademic = Boolean(a.college || a.degree || a.branch || a.current_semester || a.university);
  const prevEdu: EducationProfile | undefined = onboardingStores.educationProfiles.get(studentId);
  if (hasAcademic || prevEdu) {
    const edu: EducationProfile = {
      ...(prevEdu || ({} as EducationProfile)),
      student_id: studentId,
      degree: (a.degree || '') as any,
      branch: a.branch || '',
      specialization: a.specialization || undefined,
      department: a.department || undefined,
      institution: a.college || '',
      university: a.university || undefined,
      current_year: a.academic_year || (a.current_semester ? Math.ceil(a.current_semester / 2) : 0),
      current_semester: a.current_semester || 0,
      admission_year: a.admission_year || undefined,
      expected_graduation_year: a.expected_graduation_year || 0,
      study_mode: prevEdu?.study_mode || 'FULL_TIME',
      education_status: a.academic_status || undefined,
      current_cgpa: a.cgpa ?? undefined,
      cgpa_scale: a.cgpa_scale ?? undefined,
      current_subjects: [...a.subjects],
      previous_qualifications: [...a.previous_qualifications],
      previous_qualification: a.previous_qualifications[0],
      achievements: [...a.academic_achievements],
      updated_at: now,
    };
    onboardingStores.educationProfiles.set(studentId, edu);
    syncSyllabusSubjects(studentId, a, prevEdu);
  }

  // --- skills ---
  const prevSkills = onboardingStores.skillsAssessments.get(studentId);
  if (p.skills.skills.length || prevSkills) {
    const assessment: StudentSkillsAssessment = {
      ...(prevSkills || ({ additional_skills: [] } as any)),
      student_id: studentId,
      skills: p.skills.skills.map((s) => ({
        skill_name: s.name,
        skill_category: s.category,
        self_reported_level: proficiencyToLevel(s.proficiency),
        is_custom: true,
      })),
      additional_skills: prevSkills?.additional_skills || [],
      certifications: p.experience.certifications.map((c) => c.name),
      updated_at: now,
    };
    onboardingStores.skillsAssessments.set(studentId, assessment);
  }

  // --- projects ---
  const prevProjects: PortfolioProject[] = onboardingStores.portfolioProjects.get(studentId) || [];
  onboardingStores.portfolioProjects.set(
    studentId,
    p.experience.projects.map((proj) => {
      const prev = prevProjects.find((x) => x.id === proj.id);
      return {
        ...(prev || ({ skills_demonstrated: [], created_at: now } as any)),
        id: proj.id,
        student_id: studentId,
        title: proj.title,
        description: proj.description,
        technologies: [...proj.technologies],
        status: (proj.status as any) || prev?.status || 'COMPLETED',
        repository_url: proj.github_url || undefined,
        demo_url: proj.demo_url || undefined,
        documentation_url: proj.project_url || undefined,
        skills_demonstrated: prev?.skills_demonstrated || [],
        updated_at: now,
      } as PortfolioProject;
    })
  );
  experienceEntries.set(studentId, structuredClone(p.experience.experience));
  certificationEntries.set(studentId, structuredClone(p.experience.certifications));

  // --- career ---
  const c = p.career;
  const prevCareer: CareerGoals | undefined = onboardingStores.careerGoals.get(studentId);
  const careerHasData =
    prevCareer ||
    c.target_roles.length ||
    c.career_interests.length ||
    p.experience.achievements.length ||
    p.experience.research_interests.length ||
    p.experience.github_url ||
    c.long_term_goals ||
    c.short_term_goals;
  if (careerHasData) {
    onboardingStores.careerGoals.set(studentId, {
      ...(prevCareer || ({ career_directions: [], desired_technical_skills: [] } as any)),
      student_id: studentId,
      target_roles: [...c.target_roles],
      target_job_role: c.target_roles[0],
      career_interests: [...c.career_interests],
      preferred_industries: [...c.preferred_industries],
      preferred_industry: c.preferred_industries[0],
      preferred_locations: [...c.preferred_locations],
      preferred_location: c.preferred_locations.join(', ') || undefined,
      internship_interests: [...c.internship_interests],
      internship_goals: c.internship_interests.join(', ') || prevCareer?.internship_goals,
      placement_goals: c.placement_goals || undefined,
      higher_education_interests: [...c.higher_education_interests],
      higher_study_plans: c.higher_education_interests.join(', ') || undefined,
      competitive_exams: [...c.competitive_exams],
      competitive_exam_goals: c.competitive_exams.join(', ') || undefined,
      gate_paper: c.gate_paper || undefined,
      short_term_goals: c.short_term_goals || undefined,
      long_term_goal: c.long_term_goals || undefined,
      achievements_and_rewards: [...p.experience.achievements],
      research_topics: [...p.experience.research_interests],
      github_url: p.experience.github_url || undefined,
      linkedin_url: p.experience.linkedin_url || undefined,
      portfolio_urls: p.experience.portfolio_url ? [p.experience.portfolio_url] : [],
      career_directions: prevCareer?.career_directions || [],
      desired_technical_skills: prevCareer?.desired_technical_skills || [],
      updated_at: now,
    } as CareerGoals);
  }

  // --- learning preferences + schedule ---
  const l = p.learning;
  const prevLearning: LearningPreferences | undefined = onboardingStores.learningPreferences.get(studentId);
  const learningHasData =
    prevLearning || l.preferred_languages.length || l.explanation_style || l.difficulty || l.learning_interests.length || l.learning_style;
  if (learningHasData) {
    onboardingStores.learningPreferences.set(studentId, {
      favorite_subjects: [],
      difficult_topics: [],
      visual_preference: false,
      video_preference: false,
      text_preference: false,
      practical_coding_preference: false,
      weekday_study_hours: 0,
      weekend_study_hours: 0,
      ...(prevLearning || {}),
      student_id: studentId,
      preferred_explanation_language: l.preferred_languages[0] || '',
      additional_languages: l.preferred_languages.slice(1),
      explanation_depth: (l.explanation_style || prevLearning?.explanation_depth || 'STANDARD') as any,
      learning_style: l.learning_style || prevLearning?.learning_style || '',
      difficulty_level: (l.difficulty || undefined) as any,
      topics_of_interest: [...l.learning_interests],
      preferred_programming_languages: p.skills.skills
        .filter((s) => s.category === 'PROGRAMMING_LANGUAGE')
        .map((s) => s.name),
      preferred_study_time: (l.preferred_study_time || 'FLEXIBLE') as any,
      revision_frequency: (l.revision_preference || 'FLEXIBLE') as any,
      // Older readers need a value in these fields; remember which ones the student did not choose.
      unset_fields: [
        ...(l.explanation_style ? [] : ['explanation_depth']),
        ...(l.preferred_study_time ? [] : ['preferred_study_time']),
        ...(l.revision_preference ? [] : ['revision_frequency']),
      ],
      updated_at: now,
    } as LearningPreferences);
  }
  const prevSchedule: StudyConstraints | undefined = onboardingStores.studyConstraints.get(studentId);
  if (prevSchedule || l.weekly_study_hours != null || l.daily_study_minutes != null || l.preferred_study_days.length) {
    onboardingStores.studyConstraints.set(studentId, {
      budget_preference: 'FREE_ONLY',
      preferred_free_resources: [],
      preferred_session_duration: 45,
      ...(prevSchedule || {}),
      student_id: studentId,
      daily_study_hours: DAY_HOURS(l.daily_study_minutes) ?? 0,
      weekly_study_hours: l.weekly_study_hours ?? 0,
      available_days: [...l.preferred_study_days],
      updated_at: now,
    } as StudyConstraints);
  }

  // Settings page records: one source for preferred language and notifications.
  const notif = (db as any).notificationPreferences.get(studentId);
  (db as any).notificationPreferences.set(studentId, {
    id: `notif_pref_${studentId}`,
    learning: true,
    community: true,
    projects: true,
    research: true,
    github: true,
    career: true,
    system: true,
    exam_reminders: true,
    ...(notif || {}),
    student_id: studentId,
    in_app: l.notifications.in_app,
    email_digest: l.notifications.email_digest,
    study_reminders: l.notifications.study_reminders,
    revision_reminders: l.notifications.revision_reminders,
    goal_deadlines: l.notifications.deadline_reminders,
    updated_at: now,
  });
  const pref = (db as any).studentPreferences.get(studentId);
  if (pref && l.preferred_languages[0] && ['English', 'Telugu', 'Hindi'].includes(l.preferred_languages[0])) {
    pref.preferred_language = l.preferred_languages[0];
    pref.updated_at = now;
  }

  // Community/profile card record (name, branch, semester, skills shown on the public card).
  const card = (db as any).studentProfiles.get(studentId);
  if (card) {
    card.name = p.identity.full_name;
    card.avatar_url = p.identity.avatar_url || undefined;
    if (a.branch) card.branch = a.branch;
    if (a.current_semester) card.semester = a.current_semester;
    if (a.expected_graduation_year) card.graduation_year = a.expected_graduation_year;
    card.college_name = a.college || undefined;
    card.skills = p.skills.skills.map((s) => s.name);
    card.interests = [...l.learning_interests];
    card.target_role = c.target_roles[0];
    card.updated_at = now;
  }

  setMeta({
    student_id: studentId,
    profile_version: p.account.profile_version,
    last_profile_update: p.account.last_profile_update,
    onboarding: p.account.onboarding,
  });
}

/**
 * Keeps the semester syllabus (read by the Semester Command Center, planner and AI context) in
 * step with the subjects the student entered. Existing subjects keep their id so their saved
 * topic progress stays attached; new subjects get new ids; progress of removed subjects is kept
 * in history and never reassigned to another subject.
 */
function syncSyllabusSubjects(studentId: string, a: AcademicSection, prevEdu?: EducationProfile): void {
  const existing: SemesterSyllabusData | undefined = onboardingStores.semesterSyllabusData.get(studentId);
  const semesterChanged = Boolean(prevEdu && a.current_semester && prevEdu.current_semester !== a.current_semester);
  const subjectsChanged =
    JSON.stringify((prevEdu?.current_subjects || []).map((s) => s.toLowerCase())) !==
    JSON.stringify(a.subjects.map((s) => s.toLowerCase()));
  if (!a.subjects.length && !semesterChanged) return;
  if (existing && !semesterChanged && !subjectsChanged && !existing.is_template) return;
  const now = new Date().toISOString();
  const keep = semesterChanged ? [] : existing?.subjects || [];
  const subjects = a.subjects.map((name, i) => {
    const match = keep.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (match) return match;
    return {
      id: `subj_${studentId.slice(-6)}_${Date.now().toString(36)}_${i}`,
      name,
      subject_type: 'CORE' as const,
      syllabus_units: [],
    };
  });
  const year = new Date().getFullYear();
  onboardingStores.semesterSyllabusData.set(studentId, {
    student_id: studentId,
    academic_year: existing?.academic_year || `${year}-${year + 1}`,
    semester_number: a.current_semester || existing?.semester_number || 1,
    subjects,
    // Dates are absolute; past ones simply stop being upcoming. Nothing is deleted.
    academic_dates: existing?.academic_dates || [],
    semester_start_date: semesterChanged ? undefined : existing?.semester_start_date,
    semester_end_date: semesterChanged ? undefined : existing?.semester_end_date,
    is_template: false,
    updated_at: now,
  });
}
