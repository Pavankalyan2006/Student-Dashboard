import { db } from '../db/database';
import {
  UnifiedLearningProgress,
  SubsystemProgressOverview,
} from '../models/communityProfileProgressTypes';
import { OnboardingService } from './onboardingService';

export class ProgressService {
  /**
   * Aggregates unified cross-platform learning analytics from verified student records
   */
  public static async getUnifiedProgress(
    studentId: string,
    filters?: { timeRange?: string; subject?: string }
  ): Promise<any> {
    const [
      streak,
      allActivities,
      skills,
      projects,
      research,
      certificates,
      goals,
    ] = await Promise.all([
      db.getLearningStreak(studentId),
      db.getStudentActivities(studentId),
      db.getStudentSkills(studentId),
      db.getProjects(studentId),
      db.getResearchProjects(studentId),
      db.getCertificates(studentId),
      db.getStudentGoals(studentId),
    ]);

    // Determine timeRange filter cutoff
    const timeRange = filters?.timeRange || 'all';
    let cutoff = 0;
    if (timeRange === '7d') cutoff = Date.now() - 7 * 86400000;
    else if (timeRange === '30d') cutoff = Date.now() - 30 * 86400000;
    else if (timeRange === '90d') cutoff = Date.now() - 90 * 86400000;
    else if (timeRange === 'semester') cutoff = Date.now() - 120 * 86400000;

    const activities = cutoff > 0
      ? allActivities.filter((a) => new Date(a.created_at).getTime() >= cutoff)
      : allActivities;

    const enrolledCourses = (await db.getCourses({ limit: 1000 }, studentId).catch(() => ({ items: [] as any[] }))).items.filter((c: any) => c.is_enrolled);

    // Real activity counts
    let lessonsCount = activities.filter((a) => {
      const t: string = a.activity_type || (a as any).type || '';
      return t === 'COURSE_LESSON_COMPLETED' || t === 'LESSON_COMPLETED';
    }).length;

    let totalQuizScore = 0;
    let quizScoreCount = 0;
    let quizzesCount = activities.filter((a) => {
      const t: string = a.activity_type || (a as any).type || '';
      const isQuiz = t === 'QUIZ_COMPLETED' || t === 'QUIZ_SUBMITTED';
      if (isQuiz) {
        const score = (a.metadata as any)?.score || (a.metadata as any)?.accuracy;
        if (typeof score === 'number') {
          totalQuizScore += score;
          quizScoreCount++;
        }
      }
      return isQuiz;
    }).length;

    let codingCount = activities.filter((a) => {
      const t: string = a.activity_type || (a as any).type || '';
      return t === 'CODING_PROBLEM_SOLVED' || t === 'CODING_SUBMISSION';
    }).length;

    let dsaCount = activities.filter((a) => {
      const t: string = a.activity_type || (a as any).type || '';
      return t === 'DSA_PROBLEM_SOLVED' || t.includes('DSA');
    }).length;

    const papersCount = activities.filter((a) => {
      const t: string = a.activity_type || (a as any).type || '';
      return t === 'PAPER_ANALYZED' || t.includes('RESEARCH') || t.includes('PAPER');
    }).length;

    let interviewsCount = activities.filter((a) => {
      const t: string = a.activity_type || (a as any).type || '';
      return t === 'MOCK_INTERVIEW_COMPLETED' || t.includes('INTERVIEW');
    }).length;

    // Module records are the source of truth: quiz submissions, coding and DSA work are stored by
    // their own modules and do not always write an activity-log entry.
    const { CodingService } = await import('./coding');
    const { DSAService } = await import('./dsa');
    const [quizAttempts, codingSummary, dsaProgress] = await Promise.all([
      db.getQuizAttempts(studentId).catch(() => []),
      CodingService.getStudentProgress(studentId).catch(() => null),
      DSAService.getProgress(studentId).catch(() => null),
    ]);
    const completedAttempts = quizAttempts.filter((a) =>
      (a.status === 'COMPLETED' || !!a.completed_at) &&
      (cutoff === 0 || new Date(a.completed_at || a.started_at).getTime() >= cutoff)
    );
    if (completedAttempts.length >= quizzesCount) {
      quizzesCount = completedAttempts.length;
      totalQuizScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
      quizScoreCount = completedAttempts.length;
    }
    codingCount = Math.max(codingCount, codingSummary?.problems_completed ?? 0);
    // Lesson completions are stored as course progress; time filters apply only to the activity log.
    if (cutoff === 0) {
      lessonsCount = Math.max(lessonsCount, enrolledCourses.reduce((sum: number, c: any) => sum + (c.completed_lessons ?? 0), 0));
    }
    dsaCount = Math.max(dsaCount, dsaProgress?.problems_solved.length ?? 0);
    const mockSessions = await (db.getMockInterviewSessions(studentId) as Promise<any[]>).catch(() => [] as any[]);
    interviewsCount = Math.max(
      interviewsCount,
      mockSessions.filter((m) => m.status === 'COMPLETED' && (cutoff === 0 || new Date(m.completed_at || m.updated_at || m.created_at).getTime() >= cutoff)).length
    );

    const quizAccuracy = quizScoreCount > 0 ? Math.round(totalQuizScore / quizScoreCount) : 0;

    const hasSufficientData = activities.length > 0 || completedAttempts.length > 0 || codingCount > 0 || dsaCount > 0;

    // Day distribution strictly from real student activity timestamps
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayBuckets: Record<string, { lessons: number; coding: number; quizzes: number; research: number; total: number }> = {
      Mon: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
      Tue: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
      Wed: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
      Thu: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
      Fri: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
      Sat: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
      Sun: { lessons: 0, coding: 0, quizzes: 0, research: 0, total: 0 },
    };

    activities.forEach((act) => {
      const d = new Date(act.created_at);
      if (!isNaN(d.getTime())) {
        const dayName = dayNames[d.getDay()];
        if (dayBuckets[dayName]) {
          if (act.activity_type === 'COURSE_LESSON_COMPLETED') dayBuckets[dayName].lessons++;
          else if (act.activity_type === 'CODING_PROBLEM_SOLVED' || act.activity_type === 'DSA_PROBLEM_SOLVED') dayBuckets[dayName].coding++;
          else if (act.activity_type === 'QUIZ_COMPLETED') dayBuckets[dayName].quizzes++;
          else if (act.activity_type === 'PAPER_ANALYZED') dayBuckets[dayName].research++;
          dayBuckets[dayName].total++;
        }
      }
    });

    const displayDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyChart = displayDays.map((day) => ({
      day,
      ...dayBuckets[day],
    }));

    // Real category breakdown
    const categoryBreakdown = [
      { category: 'Core Courses', completed: lessonsCount, in_progress: 0, total: lessonsCount },
      { category: 'DSA Practice', completed: dsaCount, in_progress: dsaProgress ? Math.max(0, dsaProgress.problems_attempted.length - dsaProgress.problems_solved.length) : 0, total: dsaProgress ? Math.max(dsaCount, dsaProgress.problems_attempted.length) : dsaCount },
      { category: 'Coding Lab', completed: codingCount, in_progress: codingSummary ? Math.max(0, codingSummary.problems_attempted - codingSummary.problems_completed) : 0, total: codingSummary ? Math.max(codingCount, codingSummary.problems_attempted) : codingCount },
      { category: 'Research Papers', completed: papersCount, in_progress: 0, total: papersCount },
      { category: 'Engineering Projects', completed: projects.filter((p: any) => p.status === 'COMPLETED').length, in_progress: projects.filter((p: any) => p.status !== 'COMPLETED').length, total: projects.length },
    ];

    // Real Subsystem progress indicators
    const strongSkills = skills.filter((s) => s.proficiency === 'ADVANCED' || (s as any).level === 'ADVANCED').length;
    const courseCompletionRate = enrolledCourses.length
      ? Math.round(enrolledCourses.reduce((sum: number, c: any) => sum + (c.progress_percentage ?? 0), 0) / enrolledCourses.length)
      : 0;

    const subsystems = {
      courses: { completion_rate: courseCompletionRate, completed_lessons: lessonsCount },
      skills: { strong_skills_count: strongSkills, total_skills: skills.length },
      quizzes: { average_score: quizAccuracy, total_quizzes: quizzesCount },
      coding: { problems_solved: codingCount },
      dsa: { problems_solved: dsaCount },
      projects: { active_count: projects.length },
      // No readiness model exists yet, so no index is claimed; the interview count is real.
      placement: { readiness_index: null, mock_interviews_completed: interviewsCount },
      research: { papers_analyzed: papersCount },
    };

    const activeGoals = goals.filter((g) => g.status === 'ACTIVE' || (g.status as string) === 'IN_PROGRESS').length;
    const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;

    let edu = null;
    let student = null;
    try {
      edu = OnboardingService.getEducationProfileSync(studentId);
      student = await db.getStudentById(studentId);
    } catch {}

    const coursesCompleted = enrolledCourses.filter((c: any) => (c.progress_percentage ?? 0) >= 100).length;
    const coursesInProgress = enrolledCourses.filter((c: any) => (c.progress_percentage ?? 0) > 0 && (c.progress_percentage ?? 0) < 100).length;
    const studyMinutes = activities.reduce((sum, a) => sum + (Number((a.metadata as any)?.duration_minutes) || 0), 0);

    const overviewCards = {
      learning_activity: {
        completed_count: activities.length,
        recent_count: activities.slice(0, 10).length,
        date_range: timeRange,
      },
      courses: {
        enrolled_count: enrolledCourses.length,
        in_progress_count: coursesInProgress,
        completed_count: coursesCompleted,
        lesson_progress: lessonsCount,
      },
      assessments: {
        completed_quizzes: quizzesCount,
        average_score: quizzesCount > 0 ? `${quizAccuracy}%` : 'No attempts yet',
        recent_attempt: quizzesCount > 0 ? (activities.find((a) => a.activity_type === 'QUIZ_COMPLETED')?.created_at || null) : null,
      },
      coding: {
        attempts_count: codingCount + dsaCount,
        solved_count: codingCount + dsaCount,
        distinct_problems: codingCount + dsaCount,
        recent_activity: activities.find((a) => a.activity_type === 'CODING_PROBLEM_SOLVED' || a.activity_type === 'DSA_PROBLEM_SOLVED')?.title || 'No recent coding',
      },
      revision: {
        sessions_completed: activities.filter((a) => a.activity_type === 'QUIZ_ATTEMPTED').length,
        items_due: 0,
        overdue_items: 0,
      },
      projects: {
        total_projects: projects.length,
        in_progress: projects.filter((p: any) => p.status !== 'COMPLETED').length,
        completed: projects.filter((p: any) => p.status === 'COMPLETED').length,
        recent_milestones: 0,
      },
      career_prep: {
        mock_interviews: interviewsCount,
        applications_count: 0,
      },
      learning_goals: {
        active_goals: activeGoals,
        completed_goals: completedGoals,
        approaching_deadline: goals.filter((g) => g.status === 'ACTIVE' && new Date(g.target_date).getTime() - Date.now() < 7 * 86400000).length,
      },
    };

    const activityTimeline = activities.slice(0, 15).map((a) => {
      const actType = a.activity_type || (a as any).type || 'GENERAL';
      return {
        id: a.id,
        title: a.title,
        source_module: actType.split('_')[0],
        timestamp: a.created_at,
        status: 'Completed',
        link: a.metadata?.link || (actType.includes('COURSE') ? '/courses' : actType.includes('CODING') ? '/coding-lab' : actType.includes('DSA') ? '/dsa-lab' : '/dashboard'),
      };
    });

    const overviewCardsList = [
      { id: 'learning_activity', title: 'Learning Activity', metric: `${activities.length} Activities`, ...overviewCards.learning_activity },
      { id: 'courses', title: 'Courses', metric: lessonsCount > 0 ? `${lessonsCount} Lessons Completed` : 'No course activity', ...overviewCards.courses },
      { id: 'assessments', title: 'Assessments', metric: quizzesCount > 0 ? `${quizAccuracy}% Avg Score` : 'No assessments yet', ...overviewCards.assessments },
      { id: 'coding', title: 'Coding', metric: (codingCount + dsaCount) > 0 ? `${codingCount + dsaCount} Problem${(codingCount + dsaCount) > 1 ? 's' : ''} Solved` : '0 Problems Solved', ...overviewCards.coding },
      { id: 'revision', title: 'Revision', metric: '0 Items Due', ...overviewCards.revision },
      { id: 'projects', title: 'Projects', metric: `${projects.length} Total Project${projects.length !== 1 ? 's' : ''}`, ...overviewCards.projects },
      { id: 'career', title: 'Career Prep', metric: interviewsCount > 0 ? `${interviewsCount} Mock Interviews` : 'Preparation pending', ...overviewCards.career_prep },
      { id: 'goals', title: 'Goals', metric: `${activeGoals} Active Goal${activeGoals !== 1 ? 's' : ''}`, ...overviewCards.learning_goals },
    ];
    Object.assign(overviewCardsList, overviewCards);

    const currentSem = (student as any)?.semester || (edu as any)?.current_semester || 6;

    const studentInfo = {
      name: student?.name || (edu as any)?.full_name || 'Engineering Student',
      degree: edu?.degree || 'B.Tech',
      branch: student?.branch || edu?.branch || 'Computer Science and Engineering',
      semester: currentSem,
      institution: edu?.institution || 'Engineering College',
    };

    return {
      student_id: studentId,
      student_info: studentInfo,
      time_range: timeRange,
      summary: {
        total_activities: activities.length,
        courses_completed: coursesCompleted,
        quiz_average_accuracy: quizAccuracy,
        coding_problems_solved: codingCount + dsaCount,
        // Only minutes the activity log actually recorded; no per-activity estimate.
        study_hours_logged: Math.round((studyMinutes / 60) * 10) / 10,
        active_goals_count: activeGoals,
      },
      academic_progress: {
        current_semester: currentSem,
        semester: currentSem,
        branch: student?.branch || edu?.branch || 'Computer Science and Engineering',
        subjects: [],
        examinations: [],
        syllabus_coverage: 0,
        study_tasks_completed: 0,
      },
      courses_completed: coursesCompleted,
      skills_count: skills.length,
      coding_problems_solved: codingCount + dsaCount,
      dsa_problems_solved: dsaCount,
      projects_count: projects.length,
      research_papers_analyzed: papersCount,
      metrics_explanation: {
        courses: 'Enrolled courses whose lessons are all completed',
        skills: 'Demonstrated evidence across coding labs, research, and technical quizzes',
        coding: 'Verified solutions executed in sandboxed coding lab with unit tests',
        dsa: 'Data structure and algorithmic challenge submissions verified in DSA lab',
        projects: 'Capstone and module projects with verified architecture specifications',
        research: 'Peer-reviewed academic papers analyzed using structured analysis methodology',
      },
      overall_indicators: {
        courses_completion_rate: courseCompletionRate,
        quiz_average_accuracy: quizAccuracy,
        coding_problems_solved: codingCount,
        dsa_problems_solved: dsaCount,
        projects_completed: projects.filter((p: any) => p.status === 'COMPLETED').length,
        placement_modules_practiced: interviewsCount,
        research_papers_analyzed: papersCount,
        verified_skills_count: skills.length,
      },
      subsystems,
      streak,
      activity_chart_weekly: weeklyChart,
      weekly_activity: weeklyChart,
      category_breakdown: categoryBreakdown,
      overview_cards: overviewCardsList,
      activity_timeline: activityTimeline,
      recent_activity_count: activities.length,
      has_sufficient_data: hasSufficientData,
      date_filter: timeRange,
    };
  }

  public static async exportProgress(studentId: string): Promise<any> {
    const unified = await this.getUnifiedProgress(studentId, { timeRange: 'all' });
    const activities = await db.getStudentActivities(studentId);
    const goals = await db.getStudentGoals(studentId);
    const student = await db.getStudentById(studentId);
    return {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      student_id: studentId,
      student_name: student?.name || unified.student_info?.name || 'Student',
      progress: unified,
      progress_summary: unified,
      all_activities: activities,
      learning_goals: goals,
    };
  }

  public static async getOverallProgress(studentId: string): Promise<any> {
    return this.getUnifiedProgress(studentId);
  }

  // --- Subsystem Progress Overviews ---
  // Every number below comes from the student's own records in the owning module
  // (course enrollments, quiz attempts, coding sessions, DSA progress, projects, activity log).
  // When there is no record the value is 0 or an empty list; nothing is filled in.

  /** Counts per ISO week for the last `weeks` weeks, oldest first. */
  private static weeklyTrend(timestamps: (string | undefined)[], weeks = 4): { label: string; value: number }[] {
    const now = Date.now();
    const buckets = Array.from({ length: weeks }, () => 0);
    for (const ts of timestamps) {
      if (!ts) continue;
      const t = new Date(ts).getTime();
      if (isNaN(t)) continue;
      const weeksAgo = Math.floor((now - t) / (7 * 86400000));
      if (weeksAgo >= 0 && weeksAgo < weeks) buckets[weeks - 1 - weeksAgo]++;
    }
    return buckets.map((value, i) => ({ label: i === weeks - 1 ? 'This week' : `${weeks - 1 - i}w ago`, value }));
  }

  public static async getCoursesProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const [coursesResult, activities] = await Promise.all([
      db.getCourses({ limit: 1000 }, studentId),
      db.getStudentActivities(studentId, { type: 'COURSE_LESSON_COMPLETED' }),
    ]);
    const enrolled = coursesResult.items.filter((c) => c.is_enrolled);
    const completed = enrolled.filter((c) => (c.progress_percentage ?? 0) >= 100);
    const completedLessons = enrolled.reduce((sum, c) => sum + (c.completed_lessons ?? 0), 0);
    return {
      category: 'COURSES',
      title: 'Course Curriculum & Lesson Progress',
      summary_metrics: {
        enrolled_courses: enrolled.length,
        completed_courses: completed.length,
        completed_lessons: Math.max(completedLessons, activities.length),
      },
      detailed_items: enrolled.map((c) => ({
        id: c.id,
        course: c.title,
        progress: c.progress_percentage ?? 0,
        completed_lessons: c.completed_lessons ?? 0,
        total_lessons: c.total_lessons,
        status: (c.progress_percentage ?? 0) >= 100 ? 'Completed' : (c.progress_percentage ?? 0) > 0 ? 'In Progress' : 'Not started',
        next_lesson: c.next_recommended_lesson?.title,
      })),
      activity_trend: this.weeklyTrend(activities.map((a) => a.created_at)),
      status_distribution: [
        { name: 'Completed', count: completed.length, color: '#16A34A' },
        { name: 'In Progress', count: enrolled.filter((c) => (c.progress_percentage ?? 0) > 0 && (c.progress_percentage ?? 0) < 100).length, color: '#2563EB' },
        { name: 'Not started', count: enrolled.filter((c) => !(c.progress_percentage ?? 0)).length, color: '#94A3B8' },
      ].filter((d) => d.count > 0),
    };
  }

  public static async getSkillsProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const skills = await db.getStudentSkills(studentId);
    const statusOf = (p: string) => (p === 'ADVANCED' || p === 'EXPERT' ? 'Strong evidence' : p === 'INTERMEDIATE' ? 'Developing' : 'Needs practice');
    const items = skills.map((s) => ({
      skill_name: s.skill_name,
      level: s.proficiency,
      status: statusOf(s.proficiency as string),
      confidence: s.confidence,
      evidence_count: s.evidence_count,
      last_updated: s.last_updated_at,
    }));
    const countBy = (name: string) => items.filter((i) => i.status === name).length;
    return {
      category: 'SKILLS',
      title: 'Skill Evidence & Proficiency',
      summary_metrics: {
        total_skills: skills.length,
        strong_evidence: countBy('Strong evidence'),
        developing: countBy('Developing'),
        needs_practice: countBy('Needs practice'),
      },
      detailed_items: items,
      activity_trend: this.weeklyTrend(skills.map((s) => s.last_updated_at)),
      status_distribution: [
        { name: 'Strong evidence', count: countBy('Strong evidence'), color: '#16A34A' },
        { name: 'Developing', count: countBy('Developing'), color: '#F59E0B' },
        { name: 'Needs practice', count: countBy('Needs practice'), color: '#94A3B8' },
      ].filter((d) => d.count > 0),
    };
  }

  public static async getQuizProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const [attempts, quizzes] = await Promise.all([db.getQuizAttempts(studentId), db.getQuizzes(studentId)]);
    const done = attempts.filter((a) => a.status === 'COMPLETED' || !!a.completed_at);
    const titleOf = (id: string) => quizzes.find((q) => q.id === id)?.title || id;
    const avg = done.length ? Math.round(done.reduce((s, a) => s + (a.score || 0), 0) / done.length) : 0;
    const ordered = [...done].sort((a, b) => new Date(a.completed_at || a.started_at).getTime() - new Date(b.completed_at || b.started_at).getTime());
    return {
      category: 'QUIZ',
      title: 'Diagnostic Quiz & Evaluation Performance',
      summary_metrics: {
        quizzes_completed: done.length,
        average_accuracy: done.length ? `${avg}%` : '—',
      },
      detailed_items: ordered.reverse().map((a) => ({
        quiz_id: a.quiz_id,
        quiz: titleOf(a.quiz_id),
        score: a.score,
        date: (a.completed_at || a.started_at || '').slice(0, 10),
        status: a.score >= 60 ? 'Passed' : 'Needs review',
      })),
      activity_trend: [...done]
        .sort((a, b) => new Date(a.completed_at || a.started_at).getTime() - new Date(b.completed_at || b.started_at).getTime())
        .slice(-8)
        .map((a, i) => ({ label: `Attempt ${i + 1}`, value: a.score })),
      status_distribution: [
        { name: '80% and above', count: done.filter((a) => a.score >= 80).length, color: '#16A34A' },
        { name: '60-79%', count: done.filter((a) => a.score >= 60 && a.score < 80).length, color: '#F59E0B' },
        { name: 'Below 60%', count: done.filter((a) => a.score < 60).length, color: '#DC2626' },
      ].filter((d) => d.count > 0),
    };
  }

  public static async getCodingProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const { CodingService } = await import('./coding');
    const summary = await CodingService.getStudentProgress(studentId);
    return {
      category: 'CODING',
      title: 'Coding Lab & Practical Submissions',
      summary_metrics: {
        problems_attempted: summary.problems_attempted,
        problems_solved: summary.problems_completed,
        total_executions: summary.total_executions,
        active_languages: summary.languages_used.join(', ') || '—',
      },
      detailed_items: summary.recent_sessions.map((r) => ({
        id: r.id,
        language: r.language,
        problem: r.problem_title,
        updated_at: r.updated_at,
      })),
      activity_trend: this.weeklyTrend(summary.recent_sessions.map((r) => r.updated_at)),
      status_distribution: [
        { name: 'Solved', count: summary.problems_completed, color: '#16A34A' },
        { name: 'Attempted, not solved', count: Math.max(0, summary.problems_attempted - summary.problems_completed), color: '#F59E0B' },
      ].filter((d) => d.count > 0),
    };
  }

  public static async getDsaProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const { DSAService } = await import('./dsa');
    const p = await DSAService.getProgress(studentId);
    const solved = new Set(p.problems_solved);
    return {
      category: 'DSA',
      title: 'DSA Lab & Algorithm Mastery',
      summary_metrics: {
        topics_explored: p.topics_viewed.length,
        problems_attempted: p.problems_attempted.length,
        problems_solved: p.problems_solved.length,
        visualizations_completed: p.visualizations_completed.length,
        topics_for_review: p.weak_topics.join(', ') || '—',
      },
      detailed_items: Array.from(new Set([...p.problems_attempted, ...p.problems_solved])).map((id) => ({
        problem_id: id,
        status: solved.has(id) ? 'Solved' : 'Attempted',
      })),
      activity_trend: this.weeklyTrend([p.problems_solved.length || p.problems_attempted.length ? p.last_activity_at : undefined]),
      status_distribution: [
        { name: 'Solved', count: p.problems_solved.length, color: '#16A34A' },
        { name: 'Attempted, not solved', count: p.problems_attempted.filter((id) => !solved.has(id)).length, color: '#F59E0B' },
      ].filter((d) => d.count > 0),
    };
  }

  public static async getProjectsProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const projects = await db.getProjects(studentId);
    const statusOf = (p: any) => String(p.status || 'IN_PROGRESS');
    const completed = projects.filter((p: any) => statusOf(p) === 'COMPLETED').length;
    return {
      category: 'PROJECTS',
      title: 'Project Builder & Technical Milestones',
      summary_metrics: {
        total_projects: projects.length,
        completed_projects: completed,
        active_projects: projects.length - completed,
        github_repos_linked: projects.filter((p: any) => !!(p.github_url || p.repository_url || p.repo_url)).length,
      },
      detailed_items: projects.map((p) => ({
        id: p.id,
        title: p.title,
        domain: p.domain,
        status: statusOf(p),
        tech: (p as any).technologies || p.tags || [],
      })),
      activity_trend: this.weeklyTrend(projects.map((p: any) => p.updated_at || p.created_at)),
      status_distribution: [
        { name: 'Completed', count: completed, color: '#16A34A' },
        { name: 'In Progress', count: projects.length - completed, color: '#2563EB' },
      ].filter((d) => d.count > 0),
    };
  }

  public static async getPlacementProgress(studentId: string): Promise<SubsystemProgressOverview> {
    // Completed mock-interview sessions are the source of truth (the engine does not write an
    // activity-log entry); legacy MOCK_INTERVIEW_COMPLETED activities are kept as a fallback.
    const [sessions, activities] = await Promise.all([
      (db.getMockInterviewSessions(studentId) as Promise<any[]>).catch(() => [] as any[]),
      db.getStudentActivities(studentId, { type: 'MOCK_INTERVIEW_COMPLETED' }),
    ]);
    const completed = sessions.filter((s) => s.status === 'COMPLETED');
    const items = completed.length
      ? completed.map((s) => ({
          id: s.id,
          module: `${s.category || s.interview_type || 'Mock'} interview — ${s.target_role || 'General'}`,
          score: s.overall_score,
          date: String(s.completed_at || s.updated_at || s.created_at || '').slice(0, 10),
          status: 'Completed',
        }))
      : activities.map((a) => ({
          id: a.id,
          module: a.title,
          score: (a.metadata as any)?.score,
          date: (a.created_at || '').slice(0, 10),
          status: 'Completed',
        }));
    const scored = items.filter((i) => typeof i.score === 'number');
    return {
      category: 'PLACEMENT',
      title: 'Placement Preparation & Mock Interviews',
      summary_metrics: {
        mock_interviews_completed: items.length,
        average_score: scored.length ? Math.round(scored.reduce((a, i) => a + (i.score as number), 0) / scored.length) : 0,
      },
      detailed_items: items,
      activity_trend: scored.slice(-8).map((i, idx) => ({ label: `Session ${idx + 1}`, value: i.score as number })),
      status_distribution: items.length ? [{ name: 'Completed', count: items.length, color: '#16A34A' }] : [],
    };
  }

  public static async getResearchProgress(studentId: string): Promise<SubsystemProgressOverview> {
    const research = await db.getResearchProjects(studentId);
    const activities = await db.getStudentActivities(studentId, { type: 'PAPER_ANALYZED' });
    return {
      category: 'RESEARCH',
      title: 'Academic Research & Literature Analysis',
      summary_metrics: {
        active_research_projects: research.length,
        papers_analyzed: activities.length,
      },
      detailed_items: research.map((r) => ({
        id: r.id,
        title: r.title,
        domain: r.domain,
        topic: r.topic,
      })),
      activity_trend: this.weeklyTrend(activities.map((a) => a.created_at)),
      status_distribution: research.length ? [{ name: 'Active Research', count: research.length, color: '#4F46E5' }] : [],
    };
  }

  public static async getSubsystemOverview(studentId: string, subsystem: string): Promise<SubsystemProgressOverview> {
    switch (subsystem.toLowerCase()) {
      case 'courses': return this.getCoursesProgress(studentId);
      case 'skills': return this.getSkillsProgress(studentId);
      case 'quiz': return this.getQuizProgress(studentId);
      case 'coding': return this.getCodingProgress(studentId);
      case 'dsa': return this.getDsaProgress(studentId);
      case 'projects': return this.getProjectsProgress(studentId);
      case 'placement': return this.getPlacementProgress(studentId);
      case 'research': return this.getResearchProgress(studentId);
      default: return this.getCoursesProgress(studentId);
    }
  }

  public static async getSubsystemProgress(studentId: string, subsystem: string): Promise<any> {
    const overview = await this.getSubsystemOverview(studentId, subsystem);
    const isEmpty = ((overview as any).detailed_items || []).length === 0;

    let items = (overview as any).detailed_items || [];
    if (subsystem.toLowerCase() === 'skills') {
      items = items.map((i: any) => ({
        ...i,
        status: i.status || 'Strong evidence',
      }));
    }

    return {
      subsystem: subsystem.toLowerCase(),
      items,
      overview,
      empty_state_message: isEmpty ? 'Not enough activity yet' : undefined,
    };
  }
}
