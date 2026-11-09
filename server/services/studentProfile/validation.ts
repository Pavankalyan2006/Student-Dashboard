// Phase 5: server-side validation for every profile section. The browser validates too, but only
// this layer is trusted. Unknown fields are rejected so a client cannot set server-managed fields
// (firebase_uid, role, account status, onboarding completion, email, verification state).
import crypto from 'crypto';
import { ValidationError } from '../../core/exceptions';
import {
  ACADEMIC_STATUSES,
  AcademicSection,
  CareerSection,
  CertificationEntry,
  DIFFICULTY_LEVELS,
  EXPERIENCE_KINDS,
  EXPLANATION_STYLES,
  ExperienceEntry,
  ExperienceSection,
  IdentitySection,
  LEARNING_STYLES,
  LearningSection,
  PROFICIENCY_LEVELS,
  ProjectEntry,
  REVISION_PREFERENCES,
  SKILL_CATEGORIES,
  STUDY_TIMES,
  SkillEntry,
  SkillsSection,
  WEEK_DAYS,
} from './types';

type Errors = Record<string, string>;

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function fail(errors: Errors): never {
  const first = Object.entries(errors)[0];
  const err = new ValidationError(`${first[0]}: ${first[1]}`);
  (err as any).details = errors;
  throw err;
}

function checkKeys(input: Record<string, unknown>, allowed: string[], section: string): void {
  const unknown = Object.keys(input).filter((k) => !allowed.includes(k));
  if (unknown.length) {
    fail(Object.fromEntries(unknown.map((k) => [`${section}.${k}`, 'is not an editable field'])));
  }
}

export function cleanText(v: unknown, field: string, errors: Errors, opts: { max: number; min?: number; required?: boolean }): string | null {
  if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
    if (opts.required) errors[field] = 'is required';
    return null;
  }
  if (typeof v !== 'string') {
    errors[field] = 'must be text';
    return null;
  }
  const t = v.trim().replace(/\s+/g, ' ');
  if (CONTROL.test(t)) errors[field] = 'contains invalid characters';
  if (opts.min && t.length < opts.min) errors[field] = `must be at least ${opts.min} characters`;
  if (t.length > opts.max) errors[field] = `must be at most ${opts.max} characters`;
  return t;
}

function cleanLongText(v: unknown, field: string, errors: Errors, max: number): string | null {
  if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) return null;
  if (typeof v !== 'string') {
    errors[field] = 'must be text';
    return null;
  }
  const t = v.trim();
  if (CONTROL.test(t)) errors[field] = 'contains invalid characters';
  if (t.length > max) errors[field] = `must be at most ${max} characters`;
  return t;
}

export function cleanUrl(v: unknown, field: string, errors: Errors): string | null {
  const t = cleanText(v, field, errors, { max: 300 });
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    return u.toString();
  } catch {
    errors[field] = 'must be a valid http(s) link';
    return null;
  }
}

function cleanList(v: unknown, field: string, errors: Errors, opts: { maxItems?: number; maxLen?: number } = {}): string[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) {
    errors[field] = 'must be a list';
    return [];
  }
  const maxItems = opts.maxItems ?? 30;
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of v) {
    const t = cleanText(item, field, errors, { max: opts.maxLen ?? 100 });
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  if (out.length > maxItems) errors[field] = `can have at most ${maxItems} entries`;
  return out;
}

function cleanInt(v: unknown, field: string, errors: Errors, min: number, max: number, required = false): number | null {
  if (v === undefined || v === null || v === '') {
    if (required) errors[field] = 'is required';
    return null;
  }
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < min || n > max) {
    errors[field] = `must be a whole number between ${min} and ${max}`;
    return null;
  }
  return n;
}

function cleanNumber(v: unknown, field: string, errors: Errors, min: number, max: number): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) {
    errors[field] = `must be a number between ${min} and ${max}`;
    return null;
  }
  return Math.round(n * 100) / 100;
}

function cleanEnum<T extends readonly string[]>(v: unknown, field: string, errors: Errors, values: T): T[number] | null {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v !== 'string' || !values.includes(v)) {
    errors[field] = `must be one of ${values.join(', ')}`;
    return null;
  }
  return v as T[number];
}

function cleanDate(v: unknown, field: string, errors: Errors): string | null {
  const t = cleanText(v, field, errors, { max: 10 });
  if (!t) return null;
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(t)) {
    errors[field] = 'must be YYYY-MM or YYYY-MM-DD';
    return null;
  }
  return t;
}

const newId = (prefix: string) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
const ID_RE = /^[A-Za-z0-9_-]{3,64}$/;

// ---------------------------------------------------------------------------

export const IDENTITY_FIELDS = ['full_name', 'display_name', 'phone', 'avatar_url', 'accept_terms', 'accept_privacy'];

export function validateIdentity(input: Record<string, any>, current: IdentitySection): IdentitySection {
  checkKeys(input, IDENTITY_FIELDS, 'identity');
  const e: Errors = {};
  const next = { ...current };
  if ('full_name' in input) next.full_name = cleanText(input.full_name, 'full_name', e, { min: 2, max: 100, required: true }) || current.full_name;
  if (next.full_name && !/^[\p{L}\p{M} .'-]+$/u.test(next.full_name)) e.full_name = 'may contain only letters, spaces, dots, hyphens and apostrophes';
  if ('display_name' in input) next.display_name = cleanText(input.display_name, 'display_name', e, { max: 60 });
  if ('phone' in input) {
    const phone = cleanText(input.phone, 'phone', e, { max: 20 });
    if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) e.phone = 'must be a valid phone number';
    next.phone = phone;
  }
  if ('avatar_url' in input) next.avatar_url = cleanUrl(input.avatar_url, 'avatar_url', e);
  const now = new Date().toISOString();
  if ('accept_terms' in input) {
    if (input.accept_terms !== true) e.accept_terms = 'must be accepted';
    else next.terms_accepted_at = current.terms_accepted_at || now;
  }
  if ('accept_privacy' in input) {
    if (input.accept_privacy !== true) e.accept_privacy = 'must be accepted';
    else next.privacy_accepted_at = current.privacy_accepted_at || now;
  }
  if (Object.keys(e).length) fail(e);
  return next;
}

export const ACADEMIC_FIELDS = [
  'university', 'college', 'degree', 'department', 'branch', 'specialization', 'academic_year', 'current_semester',
  'admission_year', 'expected_graduation_year', 'subjects', 'academic_status', 'cgpa', 'cgpa_scale',
  'previous_qualifications', 'academic_achievements',
];

export function validateAcademic(input: Record<string, any>, current: AcademicSection, requireCore: boolean): AcademicSection {
  checkKeys(input, ACADEMIC_FIELDS, 'academic');
  const e: Errors = {};
  const n: AcademicSection = { ...current };
  const t = (k: keyof AcademicSection, max = 150) => {
    if (k in input) (n as any)[k] = cleanText(input[k], k, e, { max });
  };
  t('university');
  t('college');
  t('degree', 60);
  t('department', 120);
  t('branch', 120);
  t('specialization', 120);
  const year = new Date().getFullYear();
  if ('academic_year' in input) n.academic_year = cleanInt(input.academic_year, 'academic_year', e, 1, 6);
  if ('current_semester' in input) n.current_semester = cleanInt(input.current_semester, 'current_semester', e, 1, 12);
  if ('admission_year' in input) n.admission_year = cleanInt(input.admission_year, 'admission_year', e, year - 15, year + 1);
  if ('expected_graduation_year' in input)
    n.expected_graduation_year = cleanInt(input.expected_graduation_year, 'expected_graduation_year', e, year - 10, year + 10);
  if ('subjects' in input) n.subjects = cleanList(input.subjects, 'subjects', e, { maxItems: 20, maxLen: 120 });
  if ('academic_status' in input) n.academic_status = cleanEnum(input.academic_status, 'academic_status', e, ACADEMIC_STATUSES);
  if ('cgpa_scale' in input) {
    n.cgpa_scale = cleanNumber(input.cgpa_scale, 'cgpa_scale', e, 4, 10);
    if (n.cgpa_scale != null && ![4, 5, 10].includes(n.cgpa_scale)) e.cgpa_scale = 'must be 4, 5 or 10';
  }
  if ('cgpa' in input) n.cgpa = cleanNumber(input.cgpa, 'cgpa', e, 0, 10);
  if (n.cgpa != null && n.cgpa > (n.cgpa_scale ?? 10)) e.cgpa = `cannot exceed the CGPA scale (${n.cgpa_scale ?? 10})`;
  if ('previous_qualifications' in input)
    n.previous_qualifications = cleanList(input.previous_qualifications, 'previous_qualifications', e, { maxItems: 10, maxLen: 200 });
  if ('academic_achievements' in input)
    n.academic_achievements = cleanList(input.academic_achievements, 'academic_achievements', e, { maxItems: 20, maxLen: 200 });

  // Cross-field consistency (only when both values are present).
  if (n.current_semester && n.academic_year && Math.ceil(n.current_semester / 2) !== n.academic_year) {
    e.current_semester = `semester ${n.current_semester} does not belong to year ${n.academic_year}`;
  }
  if (n.admission_year && n.expected_graduation_year) {
    if (n.expected_graduation_year < n.admission_year) e.expected_graduation_year = 'cannot be before the admission year';
    else if (n.expected_graduation_year - n.admission_year > 8) e.expected_graduation_year = 'is more than 8 years after admission';
  }
  if (requireCore) {
    for (const k of ['college', 'degree', 'branch', 'current_semester', 'academic_year', 'expected_graduation_year'] as const) {
      if (n[k] == null || n[k] === '') e[k] = e[k] || 'is required';
    }
  }
  if (Object.keys(e).length) fail(e);
  return n;
}

export function validateSkills(input: Record<string, any>, current: SkillsSection): SkillsSection {
  checkKeys(input, ['skills'], 'skills');
  const e: Errors = {};
  if (!Array.isArray(input.skills)) fail({ skills: 'must be a list' });
  if (input.skills.length > 80) fail({ skills: 'can have at most 80 entries' });
  const seen = new Set<string>();
  const skills: SkillEntry[] = [];
  input.skills.forEach((raw: any, i: number) => {
    if (!raw || typeof raw !== 'object') {
      e[`skills[${i}]`] = 'must be an object';
      return;
    }
    checkKeys(raw, ['name', 'category', 'proficiency'], `skills[${i}]`);
    const name = cleanText(raw.name, `skills[${i}].name`, e, { max: 80, required: true });
    const category = cleanEnum(raw.category, `skills[${i}].category`, e, SKILL_CATEGORIES) || 'OTHER';
    // Proficiency must be chosen by the student; there is no default and no automatic upgrade.
    const proficiency = cleanEnum(raw.proficiency, `skills[${i}].proficiency`, e, PROFICIENCY_LEVELS);
    if (!proficiency) e[`skills[${i}].proficiency`] = e[`skills[${i}].proficiency`] || 'must be chosen by the student';
    if (!name || !proficiency) return;
    if (seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());
    skills.push({ name, category, proficiency });
  });
  if (Object.keys(e).length) fail(e);
  return { ...current, skills };
}

function validateProject(raw: any, i: number, e: Errors, existingIds: Set<string>): ProjectEntry | null {
  if (!raw || typeof raw !== 'object') {
    e[`projects[${i}]`] = 'must be an object';
    return null;
  }
  checkKeys(raw, ['id', 'title', 'description', 'technologies', 'project_url', 'github_url', 'demo_url', 'status'], `projects[${i}]`);
  const id = typeof raw.id === 'string' && ID_RE.test(raw.id) && existingIds.has(raw.id) ? raw.id : newId('proj');
  const title = cleanText(raw.title, `projects[${i}].title`, e, { max: 120, required: true });
  const github = cleanUrl(raw.github_url, `projects[${i}].github_url`, e);
  if (github && !/^https?:\/\/(www\.)?github\.com\//i.test(github)) e[`projects[${i}].github_url`] = 'must be a github.com link';
  return {
    id,
    title: title || '',
    description: cleanLongText(raw.description, `projects[${i}].description`, e, 2000) || '',
    technologies: cleanList(raw.technologies, `projects[${i}].technologies`, e, { maxItems: 20, maxLen: 60 }),
    project_url: cleanUrl(raw.project_url, `projects[${i}].project_url`, e),
    github_url: github,
    demo_url: cleanUrl(raw.demo_url, `projects[${i}].demo_url`, e),
    status: cleanEnum(raw.status, `projects[${i}].status`, e, ['IDEA', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'] as const),
  };
}

function validateExperienceEntry(raw: any, i: number, e: Errors, existingIds: Set<string>): ExperienceEntry | null {
  if (!raw || typeof raw !== 'object') {
    e[`experience[${i}]`] = 'must be an object';
    return null;
  }
  checkKeys(raw, ['id', 'kind', 'organization', 'role', 'start_date', 'end_date', 'is_current', 'description'], `experience[${i}]`);
  const start = cleanDate(raw.start_date, `experience[${i}].start_date`, e);
  const end = cleanDate(raw.end_date, `experience[${i}].end_date`, e);
  if (start && end && end < start) e[`experience[${i}].end_date`] = 'cannot be before the start date';
  return {
    id: typeof raw.id === 'string' && ID_RE.test(raw.id) && existingIds.has(raw.id) ? raw.id : newId('exp'),
    kind: cleanEnum(raw.kind, `experience[${i}].kind`, e, EXPERIENCE_KINDS) || 'OTHER',
    organization: cleanText(raw.organization, `experience[${i}].organization`, e, { max: 120, required: true }) || '',
    role: cleanText(raw.role, `experience[${i}].role`, e, { max: 120, required: true }) || '',
    start_date: start,
    end_date: raw.is_current === true ? null : end,
    is_current: raw.is_current === true,
    description: cleanLongText(raw.description, `experience[${i}].description`, e, 2000),
  };
}

function validateCertification(raw: any, i: number, e: Errors, existingIds: Set<string>): CertificationEntry | null {
  if (!raw || typeof raw !== 'object') {
    e[`certifications[${i}]`] = 'must be an object';
    return null;
  }
  checkKeys(raw, ['id', 'name', 'issuer', 'issue_date', 'credential_url'], `certifications[${i}]`);
  return {
    id: typeof raw.id === 'string' && ID_RE.test(raw.id) && existingIds.has(raw.id) ? raw.id : newId('cert'),
    name: cleanText(raw.name, `certifications[${i}].name`, e, { max: 150, required: true }) || '',
    issuer: cleanText(raw.issuer, `certifications[${i}].issuer`, e, { max: 120 }),
    issue_date: cleanDate(raw.issue_date, `certifications[${i}].issue_date`, e),
    credential_url: cleanUrl(raw.credential_url, `certifications[${i}].credential_url`, e),
  };
}

export const EXPERIENCE_FIELDS = [
  'projects', 'experience', 'certifications', 'achievements', 'research_interests', 'github_url', 'linkedin_url', 'portfolio_url',
];

/** Lists replace the stored list. Ids that are not already this student's are re-issued, never reused. */
export function validateExperience(input: Record<string, any>, current: ExperienceSection): ExperienceSection {
  checkKeys(input, EXPERIENCE_FIELDS, 'experience');
  const e: Errors = {};
  const n: ExperienceSection = structuredClone(current);
  const listOf = (k: string, max: number) => {
    if (!Array.isArray(input[k])) {
      e[k] = 'must be a list';
      return [];
    }
    if (input[k].length > max) e[k] = `can have at most ${max} entries`;
    return input[k] as any[];
  };
  if ('projects' in input) {
    const ids = new Set(current.projects.map((p) => p.id));
    n.projects = listOf('projects', 30).map((r, i) => validateProject(r, i, e, ids)).filter(Boolean) as ProjectEntry[];
  }
  if ('experience' in input) {
    const ids = new Set(current.experience.map((p) => p.id));
    n.experience = listOf('experience', 30).map((r, i) => validateExperienceEntry(r, i, e, ids)).filter(Boolean) as ExperienceEntry[];
  }
  if ('certifications' in input) {
    const ids = new Set(current.certifications.map((p) => p.id));
    n.certifications = listOf('certifications', 50).map((r, i) => validateCertification(r, i, e, ids)).filter(Boolean) as CertificationEntry[];
  }
  if ('achievements' in input) n.achievements = cleanList(input.achievements, 'achievements', e, { maxItems: 30, maxLen: 200 });
  if ('research_interests' in input) n.research_interests = cleanList(input.research_interests, 'research_interests', e);
  if ('github_url' in input) {
    n.github_url = cleanUrl(input.github_url, 'github_url', e);
    if (n.github_url && !/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/i.test(n.github_url)) e.github_url = 'must be a github.com profile link';
  }
  if ('linkedin_url' in input) n.linkedin_url = cleanUrl(input.linkedin_url, 'linkedin_url', e);
  if ('portfolio_url' in input) n.portfolio_url = cleanUrl(input.portfolio_url, 'portfolio_url', e);
  if (Object.keys(e).length) fail(e);
  return n;
}

export const CAREER_FIELDS = [
  'target_roles', 'career_interests', 'preferred_industries', 'preferred_locations', 'internship_interests', 'placement_goals',
  'higher_education_interests', 'competitive_exams', 'gate_paper', 'short_term_goals', 'long_term_goals',
];

export function validateCareer(input: Record<string, any>, current: CareerSection, requireDirection: boolean): CareerSection {
  checkKeys(input, CAREER_FIELDS, 'career');
  const e: Errors = {};
  const n: CareerSection = { ...current };
  for (const k of ['target_roles', 'career_interests', 'preferred_industries', 'preferred_locations', 'internship_interests', 'higher_education_interests', 'competitive_exams'] as const) {
    if (k in input) (n as any)[k] = cleanList(input[k], k, e, { maxItems: 15 });
  }
  for (const k of ['placement_goals', 'short_term_goals', 'long_term_goals'] as const) {
    if (k in input) (n as any)[k] = cleanLongText(input[k], k, e, 1000);
  }
  if ('gate_paper' in input) n.gate_paper = cleanText(input.gate_paper, 'gate_paper', e, { max: 60 });
  const preparingGate = n.competitive_exams.some((x) => /^gate\b/i.test(x));
  if (n.gate_paper && !preparingGate) e.gate_paper = 'can only be set when GATE is one of your competitive exams';
  if (requireDirection && !n.target_roles.length && !n.career_interests.length && !n.higher_education_interests.length && !n.competitive_exams.length) {
    e.target_roles = 'add at least one target role, career interest, higher-education plan or exam';
  }
  if (Object.keys(e).length) fail(e);
  return n;
}

export const LEARNING_FIELDS = [
  'preferred_languages', 'explanation_style', 'learning_style', 'difficulty', 'learning_interests', 'weekly_study_hours',
  'preferred_study_days', 'daily_study_minutes', 'preferred_study_time', 'revision_preference', 'notifications',
];

export function validateLearning(input: Record<string, any>, current: LearningSection, requireLanguage: boolean): LearningSection {
  checkKeys(input, LEARNING_FIELDS, 'learning');
  const e: Errors = {};
  const n: LearningSection = structuredClone(current);
  if ('preferred_languages' in input) n.preferred_languages = cleanList(input.preferred_languages, 'preferred_languages', e, { maxItems: 5, maxLen: 40 });
  if ('explanation_style' in input) n.explanation_style = cleanEnum(input.explanation_style, 'explanation_style', e, EXPLANATION_STYLES);
  if ('learning_style' in input) n.learning_style = cleanEnum(input.learning_style, 'learning_style', e, LEARNING_STYLES);
  if ('difficulty' in input) n.difficulty = cleanEnum(input.difficulty, 'difficulty', e, DIFFICULTY_LEVELS);
  if ('learning_interests' in input) n.learning_interests = cleanList(input.learning_interests, 'learning_interests', e);
  if ('weekly_study_hours' in input) n.weekly_study_hours = cleanNumber(input.weekly_study_hours, 'weekly_study_hours', e, 0, 112);
  if ('daily_study_minutes' in input) n.daily_study_minutes = cleanInt(input.daily_study_minutes, 'daily_study_minutes', e, 0, 960);
  if ('preferred_study_days' in input) {
    const days = cleanList(input.preferred_study_days, 'preferred_study_days', e, { maxItems: 7, maxLen: 3 }).map((d) => d.toUpperCase());
    const bad = days.filter((d) => !(WEEK_DAYS as readonly string[]).includes(d));
    if (bad.length) e.preferred_study_days = `unknown day(s): ${bad.join(', ')}`;
    n.preferred_study_days = days as any;
  }
  if ('preferred_study_time' in input) n.preferred_study_time = cleanEnum(input.preferred_study_time, 'preferred_study_time', e, STUDY_TIMES);
  if ('revision_preference' in input) n.revision_preference = cleanEnum(input.revision_preference, 'revision_preference', e, REVISION_PREFERENCES);
  if ('notifications' in input) {
    const raw = input.notifications;
    if (!raw || typeof raw !== 'object') e.notifications = 'must be an object';
    else {
      checkKeys(raw, ['in_app', 'email_digest', 'study_reminders', 'revision_reminders', 'deadline_reminders'], 'notifications');
      for (const k of ['in_app', 'study_reminders', 'revision_reminders', 'deadline_reminders'] as const) {
        if (k in raw) {
          if (typeof raw[k] !== 'boolean') e[`notifications.${k}`] = 'must be true or false';
          else n.notifications[k] = raw[k];
        }
      }
      if ('email_digest' in raw) n.notifications.email_digest = cleanEnum(raw.email_digest, 'notifications.email_digest', e, ['NONE', 'DAILY', 'WEEKLY'] as const) || n.notifications.email_digest;
    }
  }
  if (n.daily_study_minutes != null && n.weekly_study_hours != null && n.daily_study_minutes / 60 > n.weekly_study_hours && n.weekly_study_hours > 0) {
    e.daily_study_minutes = 'daily study time cannot exceed weekly study hours';
  }
  if (requireLanguage && !n.preferred_languages.length) e.preferred_languages = 'choose at least one language';
  if (Object.keys(e).length) fail(e);
  return n;
}
