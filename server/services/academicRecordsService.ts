// Grades, CGPA and attendance that the student enters for their own college.
//
// Nothing here is estimated: SGPA and CGPA are credit-weighted from the grades the student typed, and the
// attendance numbers come from the classes they marked. Each student's record is stored separately and is
// persisted with the rest of the platform's state (see registerSources in server/app.ts).
import { ValidationError } from '../core/exceptions';
import {
  type GradeScale,
  type AcademicRecord,
  type SemesterRecord,
  type AttendanceSubject,
  gradePoint,
  summariseGrades,
  attendanceStatus,
} from './academicMath';

export * from './academicMath';


export const academicStores: { records: Map<string, AcademicRecord> } = { records: new Map() };

export function emptyRecord(studentId: string): AcademicRecord {
  return {
    student_id: studentId,
    scale: 'O_10',
    total_semesters: 8,
    target_cgpa: null,
    semesters: [],
    attendance: { required_percent: 75, subjects: [] },
    updated_at: null,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------- Validation ----------

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const idOf = (v: unknown, i: number) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : `s${Date.now().toString(36)}${i}`);

/** Accepts the record the page sends, keeping only valid fields within sane limits. */
export function sanitiseRecord(studentId: string, input: any): AcademicRecord {
  if (!input || typeof input !== 'object') throw new ValidationError('Send your academic record as an object.');
  const scale: GradeScale = ['O_10', 'AA_10', 'POINTS'].includes(input.scale) ? input.scale : 'O_10';
  const totalSemesters = Math.round(num(input.total_semesters, 1, 16, 8));
  const target = input.target_cgpa === null || input.target_cgpa === '' || input.target_cgpa === undefined ? null : round2(num(input.target_cgpa, 0, 10, 0));
  const semesters: SemesterRecord[] = (Array.isArray(input.semesters) ? input.semesters : []).slice(0, 16).map((s: any) => ({
    semester: Math.round(num(s?.semester, 1, 16, 1)),
    subjects: (Array.isArray(s?.subjects) ? s.subjects : []).slice(0, 25).map((x: any, i: number) => {
      const grade = str(x?.grade, 4);
      if (grade && gradePoint(scale, grade) === null) throw new ValidationError(`"${grade}" is not a grade on the chosen scale.`);
      return { id: idOf(x?.id, i), name: str(x?.name, 80) || `Subject ${i + 1}`, credits: num(x?.credits, 0, 30, 0), grade };
    }),
  }));
  const seen = new Set<number>();
  for (const s of semesters) {
    if (seen.has(s.semester)) throw new ValidationError(`Semester ${s.semester} is listed twice.`);
    seen.add(s.semester);
  }
  const att = input.attendance || {};
  const subjects: AttendanceSubject[] = (Array.isArray(att.subjects) ? att.subjects : []).slice(0, 25).map((x: any, i: number) => {
    const total = Math.round(num(x?.total, 0, 1000, 0));
    const attended = Math.round(num(x?.attended, 0, total, 0));
    return { id: idOf(x?.id, i), name: str(x?.name, 80) || `Subject ${i + 1}`, attended, total };
  });
  return {
    student_id: studentId,
    scale,
    total_semesters: totalSemesters,
    target_cgpa: target,
    semesters,
    attendance: { required_percent: Math.round(num(att.required_percent, 1, 100, 75)), subjects },
    updated_at: new Date().toISOString(),
  };
}

// ---------- Service ----------

export class AcademicRecordsService {
  static get(studentId: string): AcademicRecord {
    return academicStores.records.get(studentId) || emptyRecord(studentId);
  }

  static view(studentId: string) {
    const record = this.get(studentId);
    return {
      record,
      grades: summariseGrades(record),
      attendance: record.attendance.subjects.map((s) => ({ id: s.id, ...attendanceStatus(s.attended, s.total, record.attendance.required_percent) })),
    };
  }

  static save(studentId: string, input: unknown) {
    // A new object each time, so the state store sees the change and persists it.
    academicStores.records.set(studentId, sanitiseRecord(studentId, input));
    return this.view(studentId);
  }

  /** Marks one class for a subject: present adds to attended and total, absent only to total. */
  static mark(studentId: string, subjectId: string, present: boolean) {
    const record = this.get(studentId);
    const subject = record.attendance.subjects.find((s) => s.id === subjectId);
    if (!subject) throw new ValidationError('That subject is not in your attendance list.');
    const subjects = record.attendance.subjects.map((s) =>
      s.id === subjectId ? { ...s, attended: s.attended + (present ? 1 : 0), total: s.total + 1 } : s
    );
    academicStores.records.set(studentId, {
      ...record,
      attendance: { ...record.attendance, subjects },
      updated_at: new Date().toISOString(),
    });
    return this.view(studentId);
  }
}
