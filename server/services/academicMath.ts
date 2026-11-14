// Pure grade and attendance calculations, shared by the server and the Grades & CGPA / Attendance pages
// (the pages use them to update numbers as the student types, before saving). No imports on purpose.

export type GradeScale = 'O_10' | 'AA_10' | 'POINTS';

/** Common Indian 10-point letter scales. POINTS lets a student type grade points for any other university. */
export const GRADE_SCALES: Record<Exclude<GradeScale, 'POINTS'>, { label: string; grades: Record<string, number>; fail: string[] }> = {
  O_10: {
    label: 'O, A+, A, B+, B, C, P, F',
    grades: { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0, Ab: 0 },
    fail: ['F', 'Ab'],
  },
  AA_10: {
    label: 'AA, AB, BB, BC, CC, CD, DD, FF',
    grades: { AA: 10, AB: 9, BB: 8, BC: 7, CC: 6, CD: 5, DD: 4, FF: 0 },
    fail: ['FF'],
  },
};

export interface GradedSubject {
  id: string;
  name: string;
  credits: number;
  /** A letter from the chosen scale, or a number 0–10 when the scale is POINTS. Empty while results are awaited. */
  grade: string;
}

export interface SemesterRecord {
  semester: number;
  subjects: GradedSubject[];
}

export interface AttendanceSubject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

export interface AcademicRecord {
  student_id: string;
  scale: GradeScale;
  total_semesters: number;
  target_cgpa: number | null;
  semesters: SemesterRecord[];
  attendance: { required_percent: number; subjects: AttendanceSubject[] };
  updated_at: string | null;
}

// ---------- Pure calculations ----------

/** Grade point for a grade, or null when the grade is empty or not on the scale. */
export function gradePoint(scale: GradeScale, grade: string): number | null {
  const g = String(grade ?? '').trim();
  if (!g) return null;
  if (scale === 'POINTS') {
    const n = Number(g);
    return Number.isFinite(n) && n >= 0 && n <= 10 ? n : null;
  }
  const p = GRADE_SCALES[scale].grades[g];
  return p === undefined ? null : p;
}

export function isFail(scale: GradeScale, grade: string): boolean {
  if (scale === 'POINTS') return gradePoint(scale, grade) === 0;
  return GRADE_SCALES[scale].fail.includes(String(grade).trim());
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Credit-weighted average over graded subjects; subjects without a grade yet are left out. */
export function weightedAverage(scale: GradeScale, subjects: GradedSubject[]): { gpa: number | null; credits: number } {
  let credits = 0;
  let sum = 0;
  for (const s of subjects) {
    const p = gradePoint(scale, s.grade);
    if (p === null || !(s.credits > 0)) continue;
    credits += s.credits;
    sum += p * s.credits;
  }
  return { gpa: credits ? round2(sum / credits) : null, credits };
}

export interface GradeSummary {
  semesters: { semester: number; sgpa: number | null; credits: number; backlogs: number }[];
  cgpa: number | null;
  credits_done: number;
  backlogs: { semester: number; name: string }[];
  plan: null | {
    target: number;
    remaining_semesters: number;
    remaining_credits: number;
    required_sgpa: number | null;
    feasible: boolean;
    already_met: boolean;
  };
}

/**
 * SGPA per semester, CGPA, backlogs and, when the student set a target, the average SGPA they need in the
 * remaining semesters. Remaining credits assume the same credits per semester as the student's own average
 * so far, and the page says so.
 */
export function summariseGrades(r: Pick<AcademicRecord, 'scale' | 'semesters' | 'total_semesters' | 'target_cgpa'>): GradeSummary {
  const semesters = [...r.semesters]
    .sort((a, b) => a.semester - b.semester)
    .map((s) => {
      const { gpa, credits } = weightedAverage(r.scale, s.subjects);
      return { semester: s.semester, sgpa: gpa, credits, backlogs: s.subjects.filter((x) => isFail(r.scale, x.grade)).length };
    });
  const all = r.semesters.flatMap((s) => s.subjects);
  const { gpa: cgpa, credits: creditsDone } = weightedAverage(r.scale, all);
  const backlogs = r.semesters.flatMap((s) => s.subjects.filter((x) => isFail(r.scale, x.grade)).map((x) => ({ semester: s.semester, name: x.name })));

  let plan: GradeSummary['plan'] = null;
  const graded = semesters.filter((s) => s.sgpa !== null);
  if (r.target_cgpa !== null && r.target_cgpa !== undefined && cgpa !== null && graded.length) {
    const remainingSemesters = Math.max(0, r.total_semesters - graded.length);
    const perSemester = creditsDone / graded.length;
    const remainingCredits = Math.round(perSemester * remainingSemesters);
    const alreadyMet = cgpa >= r.target_cgpa;
    let required: number | null = null;
    if (remainingCredits > 0) required = round2((r.target_cgpa * (creditsDone + remainingCredits) - cgpa * creditsDone) / remainingCredits);
    plan = {
      target: r.target_cgpa,
      remaining_semesters: remainingSemesters,
      remaining_credits: remainingCredits,
      required_sgpa: required,
      feasible: alreadyMet || (required !== null && required <= 10),
      already_met: alreadyMet,
    };
  }
  return { semesters, cgpa, credits_done: creditsDone, backlogs, plan };
}

/** Attendance for one subject against the required percentage. */
export function attendanceStatus(attended: number, total: number, requiredPercent: number) {
  const r = Math.min(100, Math.max(1, requiredPercent)) / 100;
  const percent = total > 0 ? round2((attended / total) * 100) : null;
  // Largest k with attended / (total + k) >= r.
  const canMiss = total > 0 && attended / total >= r ? Math.max(0, Math.floor(attended / r - total + 1e-9)) : 0;
  // Smallest n with (attended + n) / (total + n) >= r. Impossible only when r = 100% and a class was missed.
  let mustAttend = 0;
  if (total > 0 && attended / total < r) mustAttend = r >= 1 ? Infinity : Math.ceil((r * total - attended) / (1 - r) - 1e-9);
  return { percent, can_miss: canMiss, must_attend: mustAttend, safe: total === 0 || attended / total >= r };
}

