// Starting values for forms across the platform, taken from the student's own profile.
// Pages use these to open on the student's subjects, level and goals instead of generic defaults;
// the student can always change them. Nothing here is invented: missing profile data means no default.
import { useStudentProfile } from './useStudentProfile';
import type { CanonicalProfile } from '../api/profileMeApi';

export interface ProfileDefaults {
  ready: boolean;
  subjects: string[];
  targetRoles: string[];
  interests: string[];
  skills: string[];
  /** FOUNDATIONAL | INTERMEDIATE | ADVANCED | ADAPTIVE, or null */
  level: string | null;
  weeklyStudyHours: number | null;
  dailyStudyMinutes: number | null;
  semester: number | null;
  branch: string | null;
  gatePaper: string | null;
}

export function profileDefaultsFrom(p: CanonicalProfile | undefined | null): ProfileDefaults {
  const uniq = (xs: (string | null | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x && x.trim())).map((x) => x.trim()))];
  const preparingGate = Boolean(p?.career.competitive_exams.some((x) => /^gate\b/i.test(x)));
  return {
    ready: Boolean(p),
    subjects: uniq(p?.academic.subjects ?? []),
    targetRoles: uniq(p?.career.target_roles ?? []),
    interests: uniq(p?.learning.learning_interests ?? []),
    skills: uniq((p?.skills.skills ?? []).map((s) => s.name)),
    level: p?.learning.difficulty ?? null,
    weeklyStudyHours: p?.learning.weekly_study_hours ?? null,
    dailyStudyMinutes: p?.learning.daily_study_minutes ?? null,
    semester: p?.academic.current_semester ?? null,
    branch: p?.academic.branch ?? null,
    gatePaper: preparingGate ? p?.career.gate_paper ?? null : null,
  };
}

export function useProfileDefaults(): ProfileDefaults {
  const { data } = useStudentProfile();
  return profileDefaultsFrom(data?.profile);
}

/** Maps the profile level onto the three-step scales most generators use. */
export function levelToDifficulty(level: string | null): 'EASY' | 'MEDIUM' | 'HARD' | null {
  if (level === 'FOUNDATIONAL') return 'EASY';
  if (level === 'INTERMEDIATE') return 'MEDIUM';
  if (level === 'ADVANCED') return 'HARD';
  return null;
}

export function levelToStudentLevel(level: string | null): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null {
  if (level === 'FOUNDATIONAL') return 'BEGINNER';
  if (level === 'INTERMEDIATE') return 'INTERMEDIATE';
  if (level === 'ADVANCED') return 'ADVANCED';
  return null;
}
