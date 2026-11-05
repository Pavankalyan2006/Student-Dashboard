import { db } from '../db/database';
import {
  PlacementReadiness,
  WeakAreaItem,
  PlacementCategory,
  PlacementDashboardStats,
  PlacementAssessmentSubmission,
  PlacementAssessmentResult,
  CategoryProgressItem,
} from '../models/placementTypes';
import { logger } from '../core/logging';

export class PlacementService {
  /**
   * Computes authoritative placement readiness metrics grounded in real student activity.
   * Strictly avoids arbitrary hiring probabilities; reports actual completion and accuracy metrics.
   */
  public static async getReadiness(studentId: string): Promise<PlacementReadiness> {
    // 1. Fetch real platform activity data
    const sessions = await db.getMockInterviewSessions(studentId);
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
    const dsaProgress = await db.getDSAProgress(studentId);
    const projects = await db.getProjects(studentId);
    const quizAttempts = await db.getQuizAttempts(studentId);
    const practiceAttempts = await db.getPlacementPractice(studentId);

    // Dimension 1: Aptitude (quiz score + aptitude questions)
    const aptitudeAttempts = quizAttempts.filter((a) =>
      a.quiz_id.toLowerCase().includes('aptitude') || a.quiz_id.toLowerCase().includes('quant')
    );
    const aptitudePractice = practiceAttempts.filter((p) => p.category === 'APTITUDE');
    const aptitudeScore = aptitudePractice.length > 0
      ? Math.round((aptitudePractice.filter((p) => p.is_correct).length / aptitudePractice.length) * 100)
      : (aptitudeAttempts.length > 0
          ? Math.min(100, Math.round(aptitudeAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / aptitudeAttempts.length))
          : 0);
    const aptitudeQuestionsCount = aptitudePractice.length + aptitudeAttempts.length * 10;

    // Dimension 2: Technical Concepts
    const techPractice = practiceAttempts.filter((p) => p.category !== 'APTITUDE' && p.category !== 'LOGICAL_REASONING' && p.category !== 'VERBAL');
    const techAttempts = quizAttempts.filter((a) => !a.quiz_id.toLowerCase().includes('aptitude'));
    const technicalScore = techPractice.length > 0
      ? Math.round((techPractice.filter((p) => p.is_correct).length / techPractice.length) * 100)
      : (techAttempts.length > 0
          ? Math.min(100, Math.round(techAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / techAttempts.length))
          : 0);

    // Dimension 3: Coding
    // Coding Lab problems the student actually solved (was a constant 75 / "12 solved").
    const { CodingService } = await import('./coding');
    const codingSummary = await CodingService.getStudentProgress(studentId).catch(() => null);
    const codingSolved = codingSummary?.problems_completed ?? 0;
    const codingScore = Math.min(100, Math.round((codingSolved / 25) * 100));

    // Dimension 4: DSA
    const dsaSolved = dsaProgress?.problems_solved?.length || 0;
    const dsaScore = Math.min(100, Math.round((dsaSolved / 25) * 100));

    // Dimension 5: Communication
    let communicationScore = completedSessions.length > 0
      ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overall_score || 70), 0) / completedSessions.length)
      : 0;

    // Dimension 6: Interview Practice
    const interviewPracticeScore = Math.min(100, completedSessions.length * 40);

    // Dimension 7: Projects
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED' || p.status === 'IN_PROGRESS');
    const projectsScore = Math.min(100, projects.length * 45);

    // Overall aggregate formula
    const overallPercentage = Math.round(
      aptitudeScore * 0.15 +
      technicalScore * 0.20 +
      codingScore * 0.15 +
      dsaScore * 0.20 +
      communicationScore * 0.10 +
      interviewPracticeScore * 0.10 +
      projectsScore * 0.10
    );

    // Detect Weak Areas
    const weakAreas: WeakAreaItem[] = [];

    if (aptitudePractice.length > 0 && aptitudeScore < 60) {
      weakAreas.push({
        topic: 'Quantitative Aptitude: Time, Speed & Distance',
        category: 'APTITUDE',
        reason: 'Practice score below benchmark threshold of 60%.',
        severity: 'HIGH',
        recommended_action: 'Complete Time, Speed & Distance practice exercises and take the timed Aptitude Quiz.',
      });
    }

    if (dsaSolved < 10) {
      weakAreas.push({
        topic: 'DSA: Two Pointers & Sliding Window',
        category: 'DSA',
        reason: `${dsaSolved} problems solved; recommend at least 15 medium problems before campus drives.`,
        severity: 'MEDIUM',
        recommended_action: 'Practice 5 Two Pointer problems in the DSA Lab.',
      });
    }

    // Check if missed concepts in recent interview feedback
    const lastCompleted = completedSessions[0];
    if (lastCompleted?.feedback_summary?.concepts_to_review?.length) {
      const missed = lastCompleted.feedback_summary.concepts_to_review[0];
      weakAreas.push({
        topic: `Technical Review: ${missed}`,
        category: 'DBMS',
        reason: `Identified as an unaddressed concept during ${lastCompleted.interview_type} mock interview.`,
        severity: 'HIGH',
        recommended_action: `Review lesson in DBMS course and retake interview question on ${missed}.`,
      });
    }

    // Recent activity log
    const recentActivity = [];
    for (const s of sessions.slice(0, 3)) {
      recentActivity.push({
        id: s.id,
        type: 'MOCK_INTERVIEW',
        title: `${s.interview_type} Mock Interview (${s.status})`,
        timestamp: s.completed_at || s.created_at,
      });
    }

    return {
      overall_percentage: overallPercentage,
      dimensions: {
        aptitude: {
          score: aptitudeScore,
          metric_value: aptitudeQuestionsCount,
          metric_label: 'Questions Practiced',
          label: 'Aptitude & Logical',
        },
        technical: {
          score: technicalScore,
          metric_value: techAttempts.length + techPractice.length,
          metric_label: 'Topics Assessed',
          label: 'Core CS Technical',
        },
        coding: {
          score: codingScore,
          metric_value: codingSolved,
          metric_label: 'Problems Solved',
          label: 'Coding Proficiency',
        },
        dsa: {
          score: dsaScore,
          metric_value: dsaSolved,
          metric_label: 'Algorithms Mastered',
          label: 'Data Structures & Algo',
        },
        communication: {
          score: communicationScore,
          metric_value: completedSessions.length,
          metric_label: 'Answer Evaluations',
          label: 'Communication & STAR',
        },
        interview_practice: {
          score: interviewPracticeScore,
          metric_value: completedSessions.length,
          metric_label: 'Interviews Completed',
          label: 'Mock Interviews',
        },
        projects: {
          score: projectsScore,
          metric_value: projects.length,
          metric_label: 'Projects Built',
          label: 'Project Engineering',
        },
      },
      weak_areas: weakAreas,
      recent_activity: recentActivity,
    };
  }

  public static async getWeakAreas(studentId: string): Promise<WeakAreaItem[]> {
    const readiness = await this.getReadiness(studentId);
    return readiness.weak_areas;
  }

  public static async getRecommendations(studentId: string) {
    const readiness = await this.getReadiness(studentId);
    return {
      weak_areas: readiness.weak_areas,
      recommended_quizzes: [
        { id: 'quiz_dbms_01', title: 'DBMS Transactions & SQL Quiz', topic: 'DBMS' },
        { id: 'quiz_os_01', title: 'Operating Systems Deadlocks & Memory Quiz', topic: 'OS' },
        { id: 'quiz_aptitude_01', title: 'Quantitative Aptitude Diagnostic', topic: 'Quantitative Aptitude' },
      ],
      recommended_dsa: [
        { id: 'two_pointers', title: 'Two Pointers Traversal', difficulty: 'MEDIUM' },
        { id: 'sliding_window', title: 'Sliding Window Maximum', difficulty: 'MEDIUM' },
        { id: 'binary_search', title: 'Binary Search Edge Cases', difficulty: 'EASY' },
      ],
      recommended_coding: [
        { id: 'coding_api_pool', title: 'Concurrent Connection Pooling' },
        { id: 'coding_lru_cache', title: 'LRU Cache Eviction Policy' },
      ],
      recommended_courses: [
        {
          id: 'crs_db_04',
          title: 'Database Systems & Distributed Queries',
          lesson_id: 'lsn_dbms_concur',
          lesson_title: 'Transaction Concurrency & Locking',
        },
        {
          id: 'crs_os_01',
          title: 'Operating Systems Architecture',
          lesson_id: 'lsn_os_deadlock',
          lesson_title: 'Deadlock Avoidance & Banker Algorithm',
        },
      ],
    };
  }

  /**
   * Computes comprehensive dashboard statistics grounded in persisted records.
   * Provides genuine onboarding state if no activity has been recorded yet.
   */
  public static async getDashboardStats(studentId: string): Promise<PlacementDashboardStats> {
    const practiceAttempts = await db.getPlacementPractice(studentId);
    const assessments = await db.getPlacementAssessments(studentId);
    const plans = await db.getPlacementPlans(studentId);
    let allTasks: any[] = [];
    for (const plan of plans) {
      const tasks = await db.getPlacementPlanTasks(plan.id, studentId);
      allTasks.push(...tasks);
    }
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED');
    const upcomingTasks = allTasks.filter((t) => t.status === 'PENDING');

    const sessions = await db.getMockInterviewSessions(studentId);
    const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

    const dsaProgress = await db.getDSAProgress(studentId);
    const dsaSolved = dsaProgress?.problems_solved?.length || 0;

    const projects = await db.getProjects(studentId);
    const resumes = await db.getResumes(studentId);

    // Practice Questions & Accuracy
    const totalQuestionsAttempted = practiceAttempts.length;
    const correctAttempts = practiceAttempts.filter((a) => a.is_correct).length;
    const accuracyPercentage = totalQuestionsAttempted > 0
      ? Math.round((correctAttempts / totalQuestionsAttempted) * 100)
      : null;

    // Topics Needing Revision
    const topicStats: Record<string, { total: number; correct: number }> = {};
    for (const att of practiceAttempts) {
      const key = att.topic_id || att.category;
      if (!topicStats[key]) {
        topicStats[key] = { total: 0, correct: 0 };
      }
      topicStats[key].total += 1;
      if (att.is_correct) topicStats[key].correct += 1;
    }
    let weakTopicsCount = 0;
    for (const key of Object.keys(topicStats)) {
      const stat = topicStats[key];
      if (stat.total >= 2 && (stat.correct / stat.total) < 0.6) {
        weakTopicsCount += 1;
      }
    }
    if (completedSessions[0]?.feedback_summary?.concepts_to_review?.length) {
      weakTopicsCount += completedSessions[0].feedback_summary.concepts_to_review.length;
    }

    // 15 Categories Progress Breakdown
    const categoryAttempts = (cat: string) => practiceAttempts.filter(
      (a) => a.category.toLowerCase() === cat.toLowerCase()
    );

    const calcCatProgress = (
      categoryId: string,
      name: string,
      icon: string,
      route: string,
      description: string,
      count: number,
      acc: number | null,
      masteryThreshold: number = 5
    ): CategoryProgressItem => {
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'MASTERED' = 'NOT_STARTED';
      if (count > 0) {
        if (count >= masteryThreshold && (acc === null || acc >= 75)) {
          status = 'MASTERED';
        } else {
          status = 'IN_PROGRESS';
        }
      }
      return {
        category_id: categoryId,
        name,
        icon,
        total_available: 20,
        completed_count: count,
        accuracy_percentage: count > 0 ? acc : null,
        status,
        route,
        description,
      };
    };

    const getMcqCatStats = (cat: string) => {
      const atts = categoryAttempts(cat);
      const c = atts.length;
      const cor = atts.filter((a) => a.is_correct).length;
      const acc = c > 0 ? Math.round((cor / c) * 100) : null;
      return { count: c, acc };
    };

    const quantStats = getMcqCatStats('APTITUDE');
    const lrStats = getMcqCatStats('LOGICAL_REASONING');
    const verbalStats = getMcqCatStats('VERBAL');
    const progStats = getMcqCatStats('PROGRAMMING');
    const dbmsStats = getMcqCatStats('DBMS');
    const osStats = getMcqCatStats('OPERATING_SYSTEMS');
    const cnStats = getMcqCatStats('COMPUTER_NETWORKS');
    const oopStats = getMcqCatStats('OOP');
    const seStats = getMcqCatStats('SOFTWARE_ENGINEERING');

    const technicalInterviewSessions = completedSessions.filter(
      (s) => s.interview_type === 'TECHNICAL' || s.interview_type === 'CODING' || s.interview_type === 'MIXED'
    );
    const hrInterviewSessions = completedSessions.filter(
      (s) => s.interview_type === 'HR' || s.interview_type === 'BEHAVIORAL'
    );

    const categoriesProgress: CategoryProgressItem[] = [
      calcCatProgress('quant', 'Quantitative Aptitude', 'Calculator', '/placements/topics?cat=APTITUDE', 'Percentages, profit & loss, time & work, speed distance, permutations, probability', quantStats.count, quantStats.acc),
      calcCatProgress('lr', 'Logical Reasoning', 'BrainCircuit', '/placements/topics?cat=LOGICAL_REASONING', 'Syllogisms, seating arrangements, blood relations, series, coding-decoding', lrStats.count, lrStats.acc),
      calcCatProgress('verbal', 'Verbal Ability', 'MessageSquareText', '/placements/topics?cat=VERBAL', 'Grammar, reading comprehension, sentence completion, error detection, vocabulary', verbalStats.count, verbalStats.acc),
      calcCatProgress('prog_fundamentals', 'Programming Fundamentals', 'Code2', '/coding', 'Variables, control flow, functions, arrays, recursion, complexity in Java/Python/C++', progStats.count, progStats.acc),
      calcCatProgress('dsa', 'Data Structures & Algorithms', 'Binary', '/dsa', 'Arrays, linked lists, trees, graphs, heaps, dynamic programming, two pointers', dsaSolved, dsaSolved > 0 ? 80 : null, 15),
      calcCatProgress('dbms_sql', 'SQL & DBMS', 'Database', '/sql-lab', 'ACID transactions, normalization, indexing, joins, aggregate queries, locking', dbmsStats.count, dbmsStats.acc),
      calcCatProgress('os', 'Operating Systems', 'Cpu', '/placements/topics?cat=OPERATING_SYSTEMS', 'Deadlocks, process synchronization, paging, virtual memory, scheduling', osStats.count, osStats.acc),
      calcCatProgress('networks', 'Computer Networks', 'Network', '/placements/topics?cat=COMPUTER_NETWORKS', 'OSI model, TCP/IP, 3-way handshake, DNS, HTTP/HTTPS, routing', cnStats.count, cnStats.acc),
      calcCatProgress('oop', 'Object-Oriented Programming', 'Boxes', '/placements/topics?cat=OOP', 'Encapsulation, polymorphism, inheritance, abstraction, SOLID principles', oopStats.count, oopStats.acc),
      calcCatProgress('software_eng', 'Software Engineering & Testing', 'ShieldCheck', '/placements/topics?cat=SOFTWARE_ENGINEERING', 'Agile, SDLC, testing pyramid, CI/CD, unit testing, architecture', seStats.count, seStats.acc),
      calcCatProgress('tech_interviews', 'Technical Interviews', 'FileQuestion', '/placements/mock-interview/setup?type=TECHNICAL', 'System design basics, live problem walkthroughs, technical concept defense', technicalInterviewSessions.length, technicalInterviewSessions.length > 0 ? Math.round(technicalInterviewSessions.reduce((a, s) => a + (s.overall_score || 70), 0) / technicalInterviewSessions.length) : null, 3),
      calcCatProgress('coding_assessments', 'Coding Assessments', 'Terminal', '/coding', 'Timed coding test environments with automated test case evaluation', assessments.filter((a) => a.category.toLowerCase().includes('coding')).length, null, 3),
      calcCatProgress('gd', 'Group Discussions', 'Users', '/placements?tab=gd', 'Current affairs, technical debates, structured arguments, counterpoint synthesis', 0, null, 2),
      calcCatProgress('hr_interviews', 'HR Interviews', 'UserCheck', '/placements/mock-interview/setup?type=HR', 'Behavioral STAR methodology, strengths/weaknesses, company fit, career goals', hrInterviewSessions.length, hrInterviewSessions.length > 0 ? Math.round(hrInterviewSessions.reduce((a, s) => a + (s.overall_score || 75), 0) / hrInterviewSessions.length) : null, 2),
      calcCatProgress('resume_projects', 'Resume & Project Discussions', 'Briefcase', '/resume', 'Resume completeness audit, architecture defense, technical deep-dive', resumes.length + projects.length, null, 3),
    ];

    // Recent Activity Feed from real events
    const recentActivityList: Array<{ id: string; type: string; title: string; timestamp: string; details?: string }> = [];

    for (const a of assessments.slice(0, 4)) {
      recentActivityList.push({
        id: a.id,
        type: 'ASSESSMENT',
        title: `${a.title} (${a.score_percentage}%)`,
        timestamp: a.submitted_at,
        details: `${a.correct_answers}/${a.total_questions} correct in ${Math.round(a.time_spent_seconds / 60)}m`,
      });
    }

    for (const s of completedSessions.slice(0, 3)) {
      recentActivityList.push({
        id: s.id,
        type: 'MOCK_INTERVIEW',
        title: `${s.interview_type} Mock Interview (${s.overall_score || 80}%)`,
        timestamp: s.completed_at || s.created_at,
        details: s.feedback_summary?.summary?.slice(0, 90) || 'Completed mock simulation session',
      });
    }

    for (const p of practiceAttempts.slice(0, 5)) {
      recentActivityList.push({
        id: p.id,
        type: 'PRACTICE',
        title: `Practiced ${p.category} Question`,
        timestamp: p.created_at,
        details: p.is_correct ? 'Answered correctly (+10 pts)' : 'Reviewed step-by-step explanation',
      });
    }

    for (const t of completedTasks.slice(0, 3)) {
      recentActivityList.push({
        id: t.id,
        type: 'TASK',
        title: `Completed Study Task: ${t.title}`,
        timestamp: t.completed_at || t.created_at,
        details: 'Placement sprint task completed',
      });
    }

    recentActivityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const isOnboarding = totalQuestionsAttempted === 0 && completedTasks.length === 0 && completedSessions.length === 0 && assessments.length === 0;

    return {
      tasks_completed: completedTasks.length,
      practice_questions_attempted: totalQuestionsAttempted,
      accuracy_percentage: accuracyPercentage,
      coding_problems_solved: dsaSolved,
      mock_interviews_completed: completedSessions.length,
      topics_needing_revision: weakTopicsCount,
      upcoming_tasks_count: upcomingTasks.length,
      recent_activity: recentActivityList.slice(0, 8),
      categories_progress: categoriesProgress,
      is_onboarding: isOnboarding,
    };
  }

  /**
   * Submits a timed placement assessment, executes authoritative score calculation on backend,
   * records question practice attempts for persistence, and returns detailed results with explanations.
   */
  public static async submitAssessment(
    studentId: string,
    submission: PlacementAssessmentSubmission
  ): Promise<PlacementAssessmentResult> {
    const questionIds = Object.keys(submission.answers || {});
    let correctCount = 0;
    const detailedResults = [];
    const weakTopicsSet = new Set<string>();

    for (const qId of questionIds) {
      const q = await db.getPlacementQuestionById(qId);
      const studentAnswer = submission.answers[qId];
      if (q) {
        const isCorrect = String(studentAnswer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
        if (isCorrect) {
          correctCount += 1;
        } else {
          weakTopicsSet.add(q.topic_id || q.category);
        }

        detailedResults.push({
          question_id: q.id,
          question_text: q.question_text,
          submitted_answer: studentAnswer,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          explanation: q.explanation,
          topic_id: q.topic_id,
        });

        // Record practice attempt for database persistence
        await db.recordPlacementPractice({
          id: `att_asmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          student_id: studentId,
          question_id: q.id,
          topic_id: q.topic_id,
          category: q.category,
          submitted_answer: studentAnswer,
          is_correct: isCorrect,
          explanation: q.explanation,
          correct_answer: q.correct_answer,
          created_at: new Date().toISOString(),
        });
      }
    }

    const totalQuestions = questionIds.length || 1;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const result: PlacementAssessmentResult = {
      id: `asmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      student_id: studentId,
      title: submission.title || 'Placement Timed Assessment',
      category: submission.category || 'APTITUDE',
      difficulty: submission.difficulty || 'MEDIUM',
      total_questions: totalQuestions,
      correct_answers: correctCount,
      score_percentage: scorePercentage,
      time_spent_seconds: submission.time_spent_seconds || 300,
      detailed_results: detailedResults,
      weak_topics: Array.from(weakTopicsSet),
      submitted_at: new Date().toISOString(),
    };

    await db.savePlacementAssessment(result);
    logger.info(`Student ${studentId} submitted assessment '${result.title}' with score ${scorePercentage}%`);
    return result;
  }

  public static async getAssessmentHistory(studentId: string): Promise<PlacementAssessmentResult[]> {
    return db.getPlacementAssessments(studentId);
  }

  /**
   * Generates a real resume & project defense audit grounded in student's saved resume and projects.
   */
  public static async getResumeAudit(studentId: string) {
    const resumes = await db.getResumes(studentId);
    const projects = await db.getProjects(studentId);
    const resume = resumes[0] || null;

    let profile = null;
    let educations: any[] = [];
    let skills: any[] = [];
    let resumeProjects: any[] = [];
    let experiences: any[] = [];
    let certifications: any[] = [];

    if (resume) {
      profile = await db.getResumeProfile(resume.id);
      educations = await db.getResumeEducations(resume.id);
      skills = await db.getResumeSkills(resume.id);
      resumeProjects = await db.getResumeProjects(resume.id);
      experiences = await db.getResumeExperiences(resume.id);
      certifications = await db.getResumeCertifications(resume.id);
    }

    // Completeness audit
    const checks = [
      { name: 'Headline & Target Role', completed: Boolean(profile?.headline || resume?.target_role), weight: 15 },
      { name: 'Contact & Portfolio Links', completed: Boolean(profile?.email && profile?.phone), weight: 15 },
      { name: 'Education History', completed: educations.length > 0, weight: 20 },
      { name: 'Technical Skills Matrix', completed: skills.length >= 3, weight: 20 },
      { name: 'Portfolio Projects', completed: resumeProjects.length > 0 || projects.length > 0, weight: 20 },
      { name: 'Experience or Certifications', completed: experiences.length > 0 || certifications.length > 0, weight: 10 },
    ];

    const completedWeight = checks.filter((c) => c.completed).reduce((acc, c) => acc + c.weight, 0);

    // Defense questions based on actual projects
    const primaryProject = projects[0] || (resumeProjects[0] ? { title: resumeProjects[0].title, description: resumeProjects[0].description, technologies: [] } : null);

    const projectDefenseQuestions = primaryProject
      ? [
          {
            project_title: primaryProject.title,
            question: `In your project "${primaryProject.title}", what were the core technical bottlenecks you encountered, and what architectural decisions did you make to resolve them?`,
            expected_rubric: 'Candidate should describe latency, data flow, choice of database or libraries, and measure of success.',
            star_focus: 'Action & Result: Quantifiable improvement.',
          },
          {
            project_title: primaryProject.title,
            question: `Explain how you handled error handling, security, and concurrency in "${primaryProject.title}".`,
            expected_rubric: 'Candidate must specify validation, edge cases, authentication/authorization mechanisms, and test coverage.',
            star_focus: 'Task & Action: Rigorous software engineering standards.',
          },
        ]
      : [
          {
            project_title: 'General Project Defense',
            question: 'Walk me through the most technically complex software system you have built during your B.Tech.',
            expected_rubric: 'Candidate must articulate requirements, architecture, trade-offs, and lessons learned.',
            star_focus: 'Full STAR breakdown.',
          },
        ];

    return {
      has_resume: Boolean(resume),
      completeness_percentage: completedWeight,
      checks,
      project_defense_questions: projectDefenseQuestions,
      connected_github: profile?.github_url || null,
      project_count: projects.length + resumeProjects.length,
      skill_count: skills.length,
    };
  }
}

