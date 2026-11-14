import { describe, it, expect } from 'vitest';
import {
  gradePoint,
  summariseGrades,
  attendanceStatus,
  sanitiseRecord,
  AcademicRecordsService,
  emptyRecord,
} from '../../server/services/academicRecordsService';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const sem = (semester: number, subjects: [string, number, string][]) => ({
  semester,
  subjects: subjects.map(([name, credits, grade], i) => ({ id: `${semester}_${i}`, name, credits, grade })),
});

describe('Grades & CGPA', () => {
  it('maps grades on each scale and rejects grades that are not on it', () => {
    expect(gradePoint('O_10', 'O')).toBe(10);
    expect(gradePoint('O_10', 'B+')).toBe(7);
    expect(gradePoint('AA_10', 'BC')).toBe(7);
    expect(gradePoint('AA_10', 'O')).toBeNull();
    expect(gradePoint('POINTS', '8.5')).toBe(8.5);
    expect(gradePoint('POINTS', '11')).toBeNull();
    expect(gradePoint('O_10', '')).toBeNull();
  });

  it('computes credit-weighted SGPA and CGPA, ignoring subjects still awaited', () => {
    const r = { scale: 'O_10' as const, total_semesters: 8, target_cgpa: null, semesters: [
      sem(1, [['Maths', 4, 'A+'], ['Physics', 3, 'A'], ['Lab', 1, 'O']]), // (36+24+10)/8 = 8.75
      sem(2, [['DS', 4, 'O'], ['Awaited', 3, '']]), // 10
    ] };
    const s = summariseGrades(r);
    expect(s.semesters.map((x) => x.sgpa)).toEqual([8.75, 10]);
    expect(s.cgpa).toBe(9.17); // (70 + 40) / 12, credit-weighted over 12 graded credits
    expect(s.credits_done).toBe(12);
  });

  it('lists backlogs and plans the SGPA needed for a target', () => {
    const r = { scale: 'O_10' as const, total_semesters: 4, target_cgpa: 8, semesters: [
      sem(1, [['Maths', 4, 'B'], ['Chem', 4, 'F']]), // SGPA 3, 8 credits
      sem(2, [['DS', 4, 'B+'], ['OS', 4, 'B+']]), // SGPA 7
    ] };
    const s = summariseGrades(r);
    expect(s.backlogs).toEqual([{ semester: 1, name: 'Chem' }]);
    expect(s.cgpa).toBe(5);
    // 16 credits left: (8 * 32 - 5 * 16) / 16 = 11 -> not reachable
    expect(s.plan).toMatchObject({ remaining_semesters: 2, remaining_credits: 16, required_sgpa: 11, feasible: false, already_met: false });
    expect(summariseGrades({ ...r, target_cgpa: 6 }).plan).toMatchObject({ required_sgpa: 7, feasible: true });
  });
});

describe('Attendance', () => {
  it('says how many classes can be missed or must be attended', () => {
    expect(attendanceStatus(30, 36, 75)).toMatchObject({ percent: 83.33, can_miss: 4, must_attend: 0, safe: true });
    expect(attendanceStatus(20, 30, 75)).toMatchObject({ safe: false, can_miss: 0, must_attend: 10 });
    expect(attendanceStatus(3, 4, 75)).toMatchObject({ safe: true, can_miss: 0 });
    expect(attendanceStatus(0, 0, 75)).toMatchObject({ percent: null, safe: true });
    expect(attendanceStatus(9, 10, 100).must_attend).toBe(Infinity);
  });
});

describe('Academic record storage', () => {
  it('validates input and keeps each student separate', () => {
    expect(() => sanitiseRecord('a', { scale: 'O_10', semesters: [sem(1, [['X', 3, 'ZZ']])] })).toThrow(/not a grade/);
    expect(() => sanitiseRecord('a', { semesters: [sem(1, []), sem(1, [])] })).toThrow(/twice/);
    const clean = sanitiseRecord('a', { attendance: { required_percent: 500, subjects: [{ name: 'OS', attended: 50, total: 10 }] } });
    expect(clean.attendance.required_percent).toBe(100);
    expect(clean.attendance.subjects[0]).toMatchObject({ attended: 10, total: 10 }); // attended can't exceed held

    const a = `stu_a_${Date.now()}`;
    const b = `stu_b_${Date.now()}`;
    AcademicRecordsService.save(a, { ...emptyRecord(a), attendance: { required_percent: 75, subjects: [{ id: 'os', name: 'OS', attended: 3, total: 4 }] } });
    const after = AcademicRecordsService.mark(a, 'os', false);
    expect(after.record.attendance.subjects[0]).toMatchObject({ attended: 3, total: 5 });
    expect(after.attendance[0]).toMatchObject({ percent: 60, safe: false, must_attend: 3 });
    expect(AcademicRecordsService.view(b).record.attendance.subjects).toEqual([]);
    expect(() => AcademicRecordsService.mark(b, 'os', true)).toThrow(/not in your attendance/);
  });

  it('is reachable from the sidebar', () => {
    expect(ALL_NAV_ITEMS.some((i) => i.href === '/grades')).toBe(true);
    expect(ALL_NAV_ITEMS.some((i) => i.href === '/attendance')).toBe(true);
  });
});
