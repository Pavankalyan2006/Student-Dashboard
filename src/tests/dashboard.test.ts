import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { DashboardService } from '../../server/services/dashboard';

describe('Phase 2 Student Dashboard Service & Isolation', () => {
  it('retrieves a dashboard whose numbers come from the student\'s own enrollments', async () => {
    const data = await DashboardService.getStudentDashboard('std_01j8k9x2p4');

    expect(data.student.id).toBe('std_01j8k9x2p4');
    expect(data.student.name).toBe('Pavan Kalyan V.');
    expect(data.student.branch).toContain('Computer Science');
    expect(data.student.semester).toBe(6);

    // Overall progress and the course list are derived from real enrollments, not constants.
    const enrolled = (await db.getCourses({ limit: 1000 }, 'std_01j8k9x2p4')).items.filter((c) => c.is_enrolled);
    const expectedOverall = enrolled.length
      ? Math.round(enrolled.reduce((sum, c) => sum + (c.progress_percentage ?? 0), 0) / enrolled.length)
      : 0;
    expect(data.summary.overall_progress).toBe(expectedOverall);
    if (enrolled.length > 0) {
      expect(data.course_progress.map((c) => c.id).sort()).toEqual(enrolled.map((c) => c.id).sort());
    }
    if (data.continue_learning) {
      expect(enrolled.map((c) => c.id)).toContain(data.continue_learning.course_id);
    }

    // Recommendations
    expect(data.recommendations.length).toBeGreaterThanOrEqual(2);

    // Analytics
    expect(data.analytics.weekly_study_minutes.length).toBe(7);
  });

  it('reflects a new enrollment and never pre-completes tasks for a fresh student', async () => {
    const fresh = await db.createStudent({
      name: 'Dashboard Fresh Student',
      email: `dash_fresh_${Date.now()}@example.test`,
      password_hash: 'hashed_pw',
      branch: 'Computer Science & Engineering',
      semester: 3,
      role: 'STUDENT',
      is_active: true,
    });

    const before = await DashboardService.getStudentDashboard(fresh.id);
    expect(before.summary.courses_active).toBe(0);
    expect(before.summary.dsa_solved).toBe(0);
    expect(before.summary.study_hours_this_week).toBe(0);
    expect(before.today_plan.every((t) => !t.is_completed)).toBe(true);
    expect(before.course_progress.every((c) => c.progress === 0)).toBe(true);

    await db.enrollStudentInCourse(fresh.id, 'crs_daa_01');
    const after = await DashboardService.getStudentDashboard(fresh.id);
    expect(after.summary.courses_active).toBe(1);
    expect(after.course_progress.map((c) => c.id)).toEqual(['crs_daa_01']);
    expect(after.is_new_student).toBe(false);
  });

  it('enforces student data isolation: does not leak data across students', async () => {
    // Create another student
    const studentB = await db.createStudent({
      name: 'Ananya Sharma',
      email: 'ananya@btech.edu',
      password_hash: 'hashed_pw',
      branch: 'Electronics & Communication',
      semester: 4,
      role: 'STUDENT',
      is_active: true,
    });

    const dataB = await DashboardService.getStudentDashboard(studentB.id);

    // Student B must have their own identity and not receive student A's details
    expect(dataB.student.id).toBe(studentB.id);
    expect(dataB.student.name).toBe('Ananya Sharma');
    expect(dataB.student.email).toBe('ananya@btech.edu');
    expect(dataB.student.branch).toBe('Electronics & Communication');
    expect(dataB.student.id).not.toBe('std_01j8k9x2p4');
  });

  it('toggles task completion status for student today plan', async () => {
    const studentId = 'std_01j8k9x2p4';
    await db.seedTodayPlanIfEmpty(studentId, [
      { id: `task_toggle_${studentId}`, title: 'Revise lesson notes', type: 'notes', estimated_time: '20 min', is_completed: false, action_url: '/notes' },
    ]);
    const data = await DashboardService.getStudentDashboard(studentId);
    const firstTask = data.today_plan[0];
    const initialStatus = firstTask.is_completed;

    const toggled = await DashboardService.toggleTodayTask(studentId, firstTask.id);
    expect(toggled.is_completed).toBe(!initialStatus);

    // Toggle back
    const toggledBack = await DashboardService.toggleTodayTask(studentId, firstTask.id);
    expect(toggledBack.is_completed).toBe(initialStatus);
  });

  it('handles onboarding state for a brand new student', async () => {
    const newStudent = await db.createStudent({
      name: 'New Engineering Student',
      email: 'new_student@btech.edu',
      password_hash: 'hashed_pw',
      branch: 'Information Technology',
      semester: 1,
      role: 'STUDENT',
      is_active: true,
    });

    const newDash = await DashboardService.getStudentDashboard(newStudent.id);
    expect(newDash.is_new_student).toBe(true);
    expect(newDash.summary.overall_progress).toBe(0);
    expect(newDash.recommendations.length).toBeGreaterThan(0);
  });

  it('rejects unauthorized or missing student IDs', async () => {
    await expect(DashboardService.getStudentDashboard('')).rejects.toThrow();
    await expect(DashboardService.getStudentDashboard('std_non_existent')).rejects.toThrow();
  });
});
