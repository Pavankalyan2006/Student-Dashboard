import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { DashboardService } from '../../server/services/dashboard';

describe('Phase 2 Student Dashboard Service & Isolation', () => {
  it('retrieves comprehensive dashboard for authenticated student', async () => {
    const data = await DashboardService.getStudentDashboard('std_01j8k9x2p4');

    expect(data.student.id).toBe('std_01j8k9x2p4');
    expect(data.student.name).toBe('Pavan Kalyan V.');
    expect(data.student.branch).toContain('Computer Science');
    expect(data.student.semester).toBe(6);
    expect(data.summary.overall_progress).toBe(68);
    expect(data.summary.streak_days).toBe(7);

    // Continue learning
    expect(data.continue_learning).not.toBeNull();
    expect(data.continue_learning?.course_name).toBe('Design and Analysis of Algorithms (DAA)');
    expect(data.continue_learning?.progress).toBe(58);

    // Today's plan
    expect(data.today_plan.length).toBeGreaterThanOrEqual(3);

    // Active courses
    expect(data.course_progress.length).toBe(4);

    // Recommendations
    expect(data.recommendations.length).toBeGreaterThanOrEqual(2);

    // Analytics
    expect(data.analytics.weekly_study_minutes.length).toBe(7);
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
