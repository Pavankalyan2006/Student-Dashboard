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
import { ValidationError } from '../core/exceptions';

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
    // Practice questions answered plus aptitude quizzes taken (earlier versions counted every quiz as 10 questions).
    const aptitudeQuestionsCount = aptitudePractice.length + aptitudeAttempts.length;

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
    // Average of the scores the interview evaluator actually gave; sessions without a score are not counted as 70.
    const scoredSessions = completedSessions.filter((s) => typeof s.overall_score === 'number');
    const communicationScore = scoredSessions.length > 0
      ? Math.round(scoredSessions.reduce((acc, s) => acc + (s.overall_score as number), 0) / scoredSessions.length)
      : 0;

    // Dimension 6: Interview Practice
    // Targets are stated in the formula text: 3 completed mock interviews, 2 projects, 25 coding and 25 DSA problems.
    const interviewPracticeScore = Math.min(100, Math.round((completedSessions.length / 3) * 100));

    // Dimension 7: Projects
    const projectsScore = Math.min(100, Math.round((projects.length / 2) * 100));

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
        topic: 'Aptitude practice accuracy',
        category: 'APTITUDE',
        reason: `${aptitudeScore}% correct over ${aptitudePractice.length} aptitude practice question(s), below 60%.`,
        severity: 'HIGH',
        recommended_action: 'Review the explanations of the questions you missed, then practise more aptitude questions.',
      });
    }

    // Technical categories where practice accuracy is below 60% (at least 3 answers, so one slip is not a weak area).
    const byCategory = new Map<string, { n: number; ok: number }>();
    for (const p of techPractice) {
      const c = byCategory.get(p.category) || { n: 0, ok: 0 };
      c.n += 1;
      if (p.is_correct) c.ok += 1;
      byCategory.set(p.category, c);
    }
    for (const [cat, c] of byCategory) {
      const pct = Math.round((c.ok / c.n) * 100);
      if (c.n >= 3 && pct < 60) {
        weakAreas.push({
          topic: `${cat.replace(/_/g, ' ')} practice accuracy`,
          category: cat as PlacementCategory,
          reason: `${pct}% correct over ${c.n} practice question(s).`,
          severity: pct < 40 ? 'HIGH' : 'MEDIUM',
          recommended_action: `Revisit ${cat.replace(/_/g, ' ')} topics and retry the questions you missed.`,
        });
      }
    }

    if (dsaSolved < 10) {
      weakAreas.push({
        topic: 'DSA problems solved',
        category: 'DSA',
        reason: `${dsaSolved} DSA problem(s) solved in the DSA Lab.`,
        severity: dsaSolved === 0 ? 'HIGH' : 'MEDIUM',
        recommended_action: 'Solve a few easy problems in the DSA Lab, then move to medium ones.',
      });
    }

    // Concepts the last mock interview's evaluator asked the student to review.
    const lastCompleted = completedSessions[0];
    for (const missed of (lastCompleted?.feedback_summary?.concepts_to_review || []).slice(0, 2)) {
      weakAreas.push({
        topic: `Review: ${missed}`,
        category: 'PROGRAMMING',
        reason: `Flagged for review in your ${lastCompleted.interview_type} mock interview feedback.`,
        severity: 'MEDIUM',
        recommended_action: `Study ${missed} and answer a question on it in your next mock interview.`,
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

  /**
   * Next steps picked from the platform's own catalogues (quizzes, DSA Lab, Coding Lab, courses), skipping what the
   * student already finished. Courses and quizzes are only suggested when they match a weak area.
   */
  public static async getRecommendations(studentId: string) {
    const readiness = await this.getReadiness(studentId);
    const weakWords = readiness.weak_areas
      .flatMap((w) => [w.category, w.topic])
      .join(' ')
      .toLowerCase()
      .replace(/_/g, ' ');
    const areaTerms: Record<string, string[]> = {
      dbms: ['dbms', 'database', 'sql'],
      'operating systems': ['operating system', ' os '],
      'computer networks': ['network'],
      aptitude: ['aptitude', 'quant'],
      oop: ['object', 'oop'],
      dsa: ['data structure', 'algorithm'],
    };
    const terms = Object.entries(areaTerms).filter(([k]) => weakWords.includes(k)).flatMap(([, v]) => v);
    const matchesWeak = (text: string) => terms.some((t) => ` ${text.toLowerCase()} `.includes(t));

    const attempted = new Set((await db.getQuizAttempts(studentId)).map((a) => a.quiz_id));
    const quizzes = (await db.getQuizzes(studentId)).filter((q) => !attempted.has(q.id) && matchesWeak(`${q.title} ${q.description || ''}`));

    const dsa = await db.getDSAProgress(studentId);
    const solvedDsa = new Set(dsa?.problems_solved || []);
    const order: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
    const dsaProblems = (await db.getDSAProblems({}))
      .filter((p: any) => !solvedDsa.has(p.id))
      .sort((a: any, b: any) => (order[a.difficulty] ?? 3) - (order[b.difficulty] ?? 3) || (a.number ?? 0) - (b.number ?? 0));

    const accepted = new Set((await db.getStudentSubmissions(studentId)).filter((s) => s.status === 'ACCEPTED').map((s) => s.problem_id));
    const coding = (await db.getCodingProblems()).filter((p) => !accepted.has(p.id))
      .sort((a, b) => (order[a.difficulty] ?? 3) - (order[b.difficulty] ?? 3));

    const courses = terms.length ? (await db.getCourses({ limit: 200 })).items.filter((c: any) => matchesWeak(`${c.title} ${c.category || ''}`)) : [];

    return {
      weak_areas: readiness.weak_areas,
      recommended_quizzes: quizzes.slice(0, 3).map((q) => ({ id: q.id, title: q.title, topic: (q as any).topic_id || '' })),
      recommended_dsa: dsaProblems.slice(0, 3).map((p: any) => ({ id: p.id, title: p.title, difficulty: p.difficulty })),
      recommended_coding: coding.slice(0, 2).map((p) => ({ id: p.id, title: p.title })),
      recommended_courses: courses.slice(0, 2).map((c: any) => ({ id: c.id, title: c.title })),
      basis: terms.length
        ? 'Quizzes and courses match your weak areas; DSA and coding problems are the easiest ones you have not solved yet.'
        : 'No weak area found yet, so only unsolved DSA and coding problems are suggested.',
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
      masteryThreshold: number = 5,
      available?: number
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
        // Questions in the bank for this category; for activity categories, the target count used for MASTERED.
        total_available: available ?? masteryThreshold,
        completed_count: count,
        accuracy_percentage: count > 0 ? acc : null,
        status,
        route,
        description,
      };
    };

    const bank = await db.getPlacementQuestions();
    const getMcqCatStats = (cat: string) => {
      const atts = categoryAttempts(cat);
      const c = atts.length;
      const cor = atts.filter((a) => a.is_correct).length;
      const acc = c > 0 ? Math.round((cor / c) * 100) : null;
      return { count: c, acc, available: bank.filter((q) => q.category === cat).length };
    };
    // Average of real evaluator scores only; null when no session has a score.
    const avgScore = (list: typeof completedSessions) => {
      const scored = list.filter((x) => typeof x.overall_score === 'number');
      return scored.length ? Math.round(scored.reduce((a, x) => a + (x.overall_score as number), 0) / scored.length) : null;
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
      calcCatProgress('quant', 'Quantitative Aptitude', 'Calculator', '/placements/topics?cat=APTITUDE', 'Percentages, profit & loss, time & work, speed distance, permutations, probability', quantStats.count, quantStats.acc, 5, quantStats.available),
      calcCatProgress('lr', 'Logical Reasoning', 'BrainCircuit', '/placements/topics?cat=LOGICAL_REASONING', 'Syllogisms, seating arrangements, blood relations, series, coding-decoding', lrStats.count, lrStats.acc, 5, lrStats.available),
      calcCatProgress('verbal', 'Verbal Ability', 'MessageSquareText', '/placements/topics?cat=VERBAL', 'Grammar, reading comprehension, sentence completion, error detection, vocabulary', verbalStats.count, verbalStats.acc, 5, verbalStats.available),
      calcCatProgress('prog_fundamentals', 'Programming Fundamentals', 'Code2', '/coding', 'Variables, control flow, functions, arrays, recursion, complexity in Java/Python/C++', progStats.count, progStats.acc, 5, progStats.available),
      calcCatProgress('dsa', 'Data Structures & Algorithms', 'Binary', '/dsa', 'Arrays, linked lists, trees, graphs, heaps, dynamic programming, two pointers', dsaSolved, null, 15),
      calcCatProgress('dbms_sql', 'SQL & DBMS', 'Database', '/sql-lab', 'ACID transactions, normalization, indexing, joins, aggregate queries, locking', dbmsStats.count, dbmsStats.acc, 5, dbmsStats.available),
      calcCatProgress('os', 'Operating Systems', 'Cpu', '/placements/topics?cat=OPERATING_SYSTEMS', 'Deadlocks, process synchronization, paging, virtual memory, scheduling', osStats.count, osStats.acc, 5, osStats.available),
      calcCatProgress('networks', 'Computer Networks', 'Network', '/placements/topics?cat=COMPUTER_NETWORKS', 'OSI model, TCP/IP, 3-way handshake, DNS, HTTP/HTTPS, routing', cnStats.count, cnStats.acc, 5, cnStats.available),
      calcCatProgress('oop', 'Object-Oriented Programming', 'Boxes', '/placements/topics?cat=OOP', 'Encapsulation, polymorphism, inheritance, abstraction, SOLID principles', oopStats.count, oopStats.acc, 5, oopStats.available),
      calcCatProgress('software_eng', 'Software Engineering & Testing', 'ShieldCheck', '/placements/topics?cat=SOFTWARE_ENGINEERING', 'Agile, SDLC, testing pyramid, CI/CD, unit testing, architecture', seStats.count, seStats.acc, 5, seStats.available),
      calcCatProgress('tech_interviews', 'Technical Interviews', 'FileQuestion', '/placements/mock-interview/setup?type=TECHNICAL', 'System design basics, live problem walkthroughs, technical concept defense', technicalInterviewSessions.length, avgScore(technicalInterviewSessions), 3),
      calcCatProgress('coding_assessments', 'Coding Assessments', 'Terminal', '/coding', 'Timed coding test environments with automated test case evaluation', assessments.filter((a) => a.category.toLowerCase().includes('coding')).length, null, 3),
      calcCatProgress('gd', 'Group Discussions', 'Users', '/placements?tab=gd', 'Current affairs, technical debates, structured arguments, counterpoint synthesis', 0, null, 2),
      calcCatProgress('hr_interviews', 'HR Interviews', 'UserCheck', '/placements/mock-interview/setup?type=HR', 'Behavioral STAR methodology, strengths/weaknesses, company fit, career goals', hrInterviewSessions.length, avgScore(hrInterviewSessions), 2),
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
        title: typeof s.overall_score === 'number' ? `${s.interview_type} Mock Interview (${s.overall_score}%)` : `${s.interview_type} Mock Interview (not scored)`,
        timestamp: s.completed_at || s.created_at,
        details: s.feedback_summary?.summary?.slice(0, 90) || 'Completed mock interview',
      });
    }

    for (const p of practiceAttempts.slice(0, 5)) {
      recentActivityList.push({
        id: p.id,
        type: 'PRACTICE',
        title: `Practiced ${p.category} Question`,
        timestamp: p.created_at,
        details: p.is_correct ? 'Answered correctly' : 'Answered incorrectly; explanation shown',
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
    const questionIds = Object.keys(submission?.answers || {});
    if (questionIds.length === 0) throw new ValidationError('answers must include at least one question');
    if (questionIds.length > 200) throw new ValidationError('An assessment can have at most 200 questions');
    for (const qId of questionIds) {
      if (!(await db.getPlacementQuestionById(qId))) throw new ValidationError(`Unknown question '${qId}'`);
    }
    const spent = submission.time_spent_seconds;
    if (spent !== undefined && (typeof spent !== 'number' || !Number.isFinite(spent) || spent < 0 || spent > 6 * 3600)) {
      throw new ValidationError('time_spent_seconds must be a number of seconds');
    }
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

    const totalQuestions = questionIds.length;
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
      // 0 when the client did not report it (was an invented 300 seconds).
      time_spent_seconds: Math.round(spent || 0),
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

