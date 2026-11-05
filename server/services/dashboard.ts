import { db } from '../db/database';
import { DashboardData, TodayPlanTask, CourseProgressItem, ActiveProjectItem, UpcomingCalendarItem } from '../models/types';
import { NotFoundError, AuthenticationError } from '../core/exceptions';
import { logger } from '../core/logging';
import { OnboardingService } from './onboardingService';

export class DashboardService {
  /**
   * Retrieves the comprehensive dashboard for the authenticated student.
   * Student identity is strictly isolated and validated server-side.
   * Dynamically tailors all subjects, projects, career goals, and tasks
   * from the student's actual filled onboarding profile and history.
   */
  public static async getStudentDashboard(userId: string): Promise<DashboardData> {
    if (!userId) {
      throw new AuthenticationError('Valid student identity required');
    }

    const student = await db.getStudentById(userId);
    if (!student) {
      throw new NotFoundError('Student account not found');
    }

    logger.info(`Fetching personalized dashboard for student ${userId}`, {
      userId,
      context: { branch: student.branch, semester: student.semester },
    });

    const baseDashboard = await db.getStudentDashboardData(userId);

    // Fetch student's real onboarding details to personalize their workspace
    try {
      const [edu, sem, career, projects, skills] = await Promise.all([
        OnboardingService.getEducationProfile(userId),
        OnboardingService.getSemesterSyllabus(userId),
        OnboardingService.getCareerGoals(userId),
        OnboardingService.getPortfolioProjects(userId),
        OnboardingService.getSkillsAssessment(userId),
      ]);

      // The education profile is created at registration and the syllabus falls back to a branch
      // template, so neither on its own means the student has told us anything.
      const savedSyllabus = sem && !sem.is_template ? sem : null;
      const hasOnboardingData = Boolean(
        (savedSyllabus?.subjects && savedSyllabus.subjects.length > 0) || (projects && projects.length > 0) || career?.target_job_role
      );

      // 1. Sync student metadata (the education profile is kept in step with the profile page)
      if (edu) {
        baseDashboard.student.branch = edu.branch || baseDashboard.student.branch;
        baseDashboard.student.semester = edu.current_semester || baseDashboard.student.semester;
      }

      if (hasOnboardingData) {
        baseDashboard.is_new_student = false;
      }

      {
        // 2. Subjects from the student's syllabus. Progress comes only from a course the student
        // enrolled in for that subject; otherwise the subject shows as not started.
        if (sem && sem.subjects && sem.subjects.length > 0 && baseDashboard.course_progress.length === 0) {
          const colors = ['#2563EB', '#4F46E5', '#7C3AED', '#0891B2', '#059669', '#D97706'];
          baseDashboard.course_progress = sem.subjects.map((sub, i) => ({
            id: sub.id,
            name: sub.name,
            code: sub.code || '',
            progress: 0,
            completed_lessons: 0,
            total_lessons: sub.syllabus_units?.length || 0,
            last_accessed: 'Not started',
            category: sub.subject_type || 'Core Curriculum',
            color: colors[i % colors.length],
          }));
        }

        // Suggested study tasks for today from the student's own subjects. They are stored so the
        // student can tick them off, and none starts as completed.
        if (sem && sem.subjects && sem.subjects.length > 0 && baseDashboard.today_plan.length === 0) {
          baseDashboard.today_plan = await db.seedTodayPlanIfEmpty(
            userId,
            sem.subjects.slice(0, 3).map((sub, i) => ({
              id: `today_task_${userId}_${i}`,
              title: `Revise ${sub.name}${sub.syllabus_units?.[0]?.title ? ` — ${sub.syllabus_units[0].title}` : ''}`,
              type: (['course', 'notes', 'quiz'][i % 3]) as any,
              estimated_time: `${30 + i * 15} min`,
              is_completed: false,
              action_url: i === 0 ? '/courses' : i === 1 ? '/notes' : '/quiz',
            }))
          );
        }

        // Upcoming assessment dates from the student's schedule. Placeholder dates from the branch
        // template keep their "(estimated)" label.
        if (sem && sem.academic_dates && sem.academic_dates.length > 0) {
          baseDashboard.upcoming_items = sem.academic_dates.map((d) => {
            const eventType = d.type || 'OTHER';
            const subject = sem.subjects.find((s) => s.id === d.subject_id);
            const label = d.label || 'Assessment';
            const isExam = /EXAM|TEST|END_SEMESTER/.test(eventType);
            return {
              id: d.id,
              title: subject ? `${label} · ${subject.name}` : label,
              date: d.date,
              time: '',
              type: (eventType === 'PROJECT_REVIEW'
                ? 'milestone'
                : eventType === 'QUIZ'
                  ? 'quiz'
                  : isExam
                    ? 'exam'
                    : 'assignment') as UpcomingCalendarItem['type'],
              status: new Date(d.date).getTime() < Date.now() ? 'Past' : d.is_estimate ? 'Estimated' : 'Upcoming',
              link: '/semester',
            };
          });
        }

        // 3. Portfolio projects entered during onboarding, when the student has no workspace projects.
        if (projects && projects.length > 0 && baseDashboard.projects.length === 0) {
          baseDashboard.projects = projects.map((p) => ({
            id: p.id,
            title: p.title,
            progress: p.status === 'COMPLETED' ? 100 : 0,
            current_milestone: p.status === 'COMPLETED' ? 'Completed' : 'No milestones tracked yet',
            next_step: p.status === 'COMPLETED' ? 'Add it to your resume' : 'Open it in Projects to add milestones',
            tech_stack: p.technologies || [],
            link: '/projects',
          }));
        }

        // 4. Sync career direction & recommendations
        if (career && career.target_job_role) {
          baseDashboard.student.focus_topic = `${career.target_job_role} Preparation & Core Syllabus Mastery`;
          baseDashboard.recommendations = [
            {
              id: 'rec_career_tailored',
              title: `${career.target_job_role} Career Roadmap & Skill Gap Analysis`,
              type: 'course',
              reason: `Personalized for your declared ambition: ${career.target_job_role}`,
              difficulty: 'Intermediate',
              estimated_time: '25 min',
              action_url: '/career',
            },
            {
              id: 'rec_exam_tailored',
              title: `${sem?.subjects?.[0]?.name || 'Engineering'} High-Yield Exam Question Bank`,
              type: 'quiz',
              reason: `Targeted practice for Semester ${baseDashboard.student.semester} examinations`,
              difficulty: 'Intermediate',
              estimated_time: '20 min',
              action_url: '/exams',
            },
          ];
        }

        // Summary counts reflect only what is listed above.
        baseDashboard.summary.projects_active = Math.max(
          baseDashboard.summary.projects_active,
          baseDashboard.projects.filter((p) => p.progress < 100).length
        );
      }
    } catch (err: any) {
      logger.warn(`Failed personalizing dashboard from onboarding service: ${err.message}`);
    }

    return baseDashboard;
  }

  /**
   * Toggles completion status of a daily learning plan task.
   */
  public static async toggleTodayTask(userId: string, taskId: string): Promise<TodayPlanTask> {
    return db.toggleTodayTask(userId, taskId);
  }
}
