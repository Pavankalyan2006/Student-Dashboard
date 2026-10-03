import { db } from '../db/database';
import {
  MockInterviewSession,
  MockInterviewQuestion,
  MockInterviewAnswer,
  MockInterviewFeedback,
  CreateMockInterviewRequest,
  SubmitInterviewAnswerRequest,
  AnswerEvaluation,
} from '../models/placementTypes';
import { ProjectService } from './projectService';
import { InterviewAdaptationService } from './interviewAdaptationService';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class MockInterviewService {
  /**
   * Creates a new mock interview session and scaffolds the initial question.
   */
  public static async createSession(
    studentId: string,
    req: CreateMockInterviewRequest
  ): Promise<{ session: MockInterviewSession; initial_question: MockInterviewQuestion }> {
    if (!studentId) {
      throw new AuthorizationError('Authentication required to create mock interview session');
    }

    let projectTitle: string | undefined;
    let projectContext: any = null;

    // Validate project ownership if this is a project interview
    if (req.project_id) {
      const project = await ProjectService.getProject(req.project_id, studentId);
      projectTitle = project.title;
      const modules = await db.getProjectModules(req.project_id);
      const tech = await db.getProjectTechnologies(req.project_id);
      const arch = await db.getProjectArchitecture(req.project_id);
      projectContext = {
        title: project.title,
        domain: project.domain,
        problem_statement: project.problem_statement,
        modules: modules.map((m) => m.name),
        tech_stack: tech.map((t) => t.technology),
        arch_type: arch?.architecture_type || 'Client-Server Architecture',
      };
    }

    const role = req.role_id ? await db.getPlacementRoleById(req.role_id) : null;
    const company = req.company_id ? await db.getPlacementCompanyById(req.company_id) : null;

    const maxQuestions = Math.max(
      2,
      Math.min(10, req.max_questions || (req.interview_type === 'HR' ? 4 : 5))
    );
    const durationMinutes = req.duration_minutes || (maxQuestions * 6);
    const sessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const session: MockInterviewSession = {
      id: sessionId,
      student_id: studentId,
      interview_type: req.interview_type,
      role_id: req.role_id || 'role_sde',
      company_id: req.company_id,
      project_id: req.project_id,
      difficulty: req.difficulty || 'MEDIUM',
      mode: req.mode || 'SIMULATION',
      duration_minutes: durationMinutes,
      status: 'READY',
      current_question_index: 1,
      max_questions: maxQuestions,
      created_at: now,
    };

    await db.saveMockInterviewSession(session);

    // Formulate initial question based on interview type & grounded project data
    const initialQuestion = await this.generateQuestion(
      session,
      1,
      undefined,
      projectContext
    );

    await db.saveMockInterviewQuestion(initialQuestion);
    logger.info(`Initialized mock interview session ${sessionId} for student ${studentId}`);

    return { session, initial_question: initialQuestion };
  }

  public static async getSession(
    sessionId: string,
    studentId: string
  ): Promise<{
    session: MockInterviewSession;
    questions: MockInterviewQuestion[];
    answers: MockInterviewAnswer[];
  }> {
    const session = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    const questions = await db.getMockInterviewQuestions(sessionId);
    const answers = await db.getMockInterviewAnswers(sessionId);

    return { session, questions, answers };
  }

  public static async startSession(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewSession> {
    const session = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.status !== 'READY') {
      return session; // Idempotent start
    }

    session.status = 'IN_PROGRESS';
    session.started_at = new Date().toISOString();
    await db.saveMockInterviewSession(session);

    return session;
  }

  public static async submitAnswer(
    sessionId: string,
    studentId: string,
    questionId: string,
    req: SubmitInterviewAnswerRequest
  ): Promise<{
    answer: MockInterviewAnswer;
    next_question: MockInterviewQuestion | null;
    is_completed: boolean;
  }> {
    const session = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.status === 'COMPLETED' || session.status === 'ABANDONED') {
      throw new ValidationError(`Cannot submit answers to a ${session.status.toLowerCase()} session`);
    }

    const question = await db.getMockInterviewQuestionById(questionId);
    if (!question || question.session_id !== sessionId) {
      throw new NotFoundError(`Question '${questionId}' not found in session '${sessionId}'`);
    }

    // Evaluate answer text against expected concepts
    const evaluation = this.evaluateAnswer(req.answer_text, question.expected_concepts, question.difficulty);

    const answerId = `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const answer: MockInterviewAnswer = {
      id: answerId,
      session_id: sessionId,
      question_id: questionId,
      student_id: studentId,
      answer_text: req.answer_text,
      duration_seconds: req.duration_seconds || 60,
      evaluation,
      created_at: new Date().toISOString(),
    };

    await db.saveMockInterviewAnswer(answer);

    const allQuestions = await db.getMockInterviewQuestions(sessionId);

    // Determine adaptive next step
    const decision = InterviewAdaptationService.determineNextStep(
      session,
      question,
      answer,
      allQuestions
    );

    let nextQuestion: MockInterviewQuestion | null = null;
    let isCompleted = false;

    if (decision.should_follow_up && session.current_question_index < session.max_questions) {
      const nextIndex = session.current_question_index + 1;
      nextQuestion = await this.generateFollowUpQuestion(
        session,
        nextIndex,
        question,
        decision.suggested_concept
      );
      await db.saveMockInterviewQuestion(nextQuestion);
      session.current_question_index = nextIndex;
      await db.saveMockInterviewSession(session);
    } else if (session.current_question_index < session.max_questions) {
      const nextIndex = session.current_question_index + 1;
      nextQuestion = await this.generateQuestion(session, nextIndex, allQuestions);
      await db.saveMockInterviewQuestion(nextQuestion);
      session.current_question_index = nextIndex;
      await db.saveMockInterviewSession(session);
    } else {
      isCompleted = true;
    }

    return {
      answer,
      next_question: nextQuestion,
      is_completed: isCompleted,
    };
  }

  public static async completeSession(
    sessionId: string,
    studentId: string
  ): Promise<{ session: MockInterviewSession; feedback: MockInterviewFeedback }> {
    const session = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    const questions = await db.getMockInterviewQuestions(sessionId);
    const answers = await db.getMockInterviewAnswers(sessionId);

    // Calculate aggregated score
    let totalScore = 0;
    let totalCoveredConcepts = 0;
    let totalExpectedConcepts = 0;
    const allCovered: Set<string> = new Set();
    const allMissing: Set<string> = new Set();
    const topicsCovered: Set<string> = new Set();

    for (const q of questions) {
      topicsCovered.add(q.topic);
      totalExpectedConcepts += q.expected_concepts.length;
    }

    for (const a of answers) {
      totalScore += a.evaluation.score;
      a.evaluation.covered_concepts.forEach((c) => {
        allCovered.add(c);
        totalCoveredConcepts++;
      });
      a.evaluation.missing_concepts.forEach((m) => allMissing.add(m));
    }

    const avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 70;
    const coveragePercentage = totalExpectedConcepts > 0
      ? Math.round((totalCoveredConcepts / totalExpectedConcepts) * 100)
      : 80;

    const feedback: MockInterviewFeedback = {
      overall_score: avgScore,
      summary: `Completed ${session.interview_type} mock interview with ${answers.length} response(s). Overall technical accuracy and concept coverage was ${coveragePercentage}%.`,
      topics_covered: Array.from(topicsCovered),
      concepts_explained_well: Array.from(allCovered).slice(0, 5),
      concepts_to_review: Array.from(allMissing).slice(0, 5),
      communication_observations: [
        'Answers were organized and demonstrated familiarity with key terminology.',
        'Consider elaborating on edge cases and concrete system trade-offs when concluding explanations.',
      ],
      technical_gaps: Array.from(allMissing).map((m) => `Revise foundational principles of "${m}"`),
      concept_coverage_stat: {
        covered: totalCoveredConcepts,
        total: totalExpectedConcepts,
        percentage: coveragePercentage,
      },
      recommended_practice: {
        quizzes: [
          { id: 'quiz_dbms_01', title: 'DBMS Transactions & SQL Quiz', topic: 'DBMS' },
          { id: 'quiz_os_01', title: 'Operating Systems Deadlocks & Memory Quiz', topic: 'OS' },
        ],
        dsa_problems: [
          { id: 'two_pointers', title: 'Two Pointers Traversal', difficulty: 'MEDIUM' },
        ],
        coding_challenges: [
          { id: 'coding_api_pool', title: 'Concurrent Connection Pooling' },
        ],
        courses: [
          {
            id: 'crs_db_04',
            title: 'Database Systems & Distributed Queries',
            lesson_id: 'lsn_dbms_concur',
            lesson_title: 'Transaction Concurrency & Locking',
          },
        ],
      },
    };

    session.status = 'COMPLETED';
    session.completed_at = new Date().toISOString();
    session.overall_score = avgScore;
    session.feedback_summary = feedback;

    await db.saveMockInterviewSession(session);

    return { session, feedback };
  }

  public static async abandonSession(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewSession> {
    const session = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    session.status = 'ABANDONED';
    await db.saveMockInterviewSession(session);
    return session;
  }

  public static async getFeedback(
    sessionId: string,
    studentId: string
  ): Promise<MockInterviewFeedback> {
    const session = await db.getMockInterviewSessionById(sessionId, studentId);
    if (!session) {
      throw new NotFoundError(`Mock interview session '${sessionId}' not found`);
    }

    if (session.feedback_summary) {
      return session.feedback_summary;
    }

    // If not completed yet, complete session or calculate current feedback
    const { feedback } = await this.completeSession(sessionId, studentId);
    return feedback;
  }

  /**
   * Evaluates student's answer text against expected concepts.
   */
  private static evaluateAnswer(
    answerText: string,
    expectedConcepts: string[],
    difficulty: string
  ): AnswerEvaluation {
    const textLower = answerText.toLowerCase();
    const covered: string[] = [];
    const missing: string[] = [];

    for (const concept of expectedConcepts) {
      const parts = concept.toLowerCase().split(/\s+/);
      const isPresent = parts.some((p) => p.length > 3 && textLower.includes(p));
      if (isPresent) {
        covered.push(concept);
      } else {
        missing.push(concept);
      }
    }

    const coverageRatio = expectedConcepts.length > 0 ? covered.length / expectedConcepts.length : 0.8;
    const baseScore = Math.round(coverageRatio * 75);
    const wordCountBonus = Math.min(25, Math.floor(answerText.trim().split(/\s+/).length / 4));
    const score = Math.min(100, Math.max(30, baseScore + wordCountBonus));

    const strengths: string[] = [];
    if (covered.length > 0) {
      strengths.push(`Addressed core concepts: ${covered.slice(0, 3).join(', ')}.`);
    }
    if (answerText.length > 120) {
      strengths.push('Provided structured elaboration and technical context.');
    }

    const improvements: string[] = [];
    if (missing.length > 0) {
      improvements.push(`Deepen explanation around: ${missing.slice(0, 3).join(', ')}.`);
    }

    return {
      covered_concepts: covered,
      missing_concepts: missing,
      strengths,
      improvements,
      score,
      clarity_feedback: 'Demonstrated coherent thought process with direct relevance to the interview prompt.',
      follow_up_needed: missing.length > 0 && score < 85,
      suggested_follow_up: missing.length > 0 ? missing[0] : undefined,
    };
  }

  /**
   * Generates a primary question for the interview session.
   */
  private static async generateQuestion(
    session: MockInterviewSession,
    questionNumber: number,
    existingQuestions: MockInterviewQuestion[] = [],
    projectContext?: any
  ): Promise<MockInterviewQuestion> {
    const qId = `mq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. If project interview or session has project_id:
    if (session.project_id && (session.interview_type === 'PROJECT' || questionNumber === 1)) {
      const title = projectContext?.title || 'Your Capstone Engineering Project';
      const arch = projectContext?.arch_type || 'Layered Architecture';
      const tech = projectContext?.tech_stack?.slice(0, 3).join(', ') || 'Node.js, PostgreSQL';

      const projectPrompts = [
        {
          question: `In your project "${title}", how is data persistence and state handled between the client and database (${tech})?`,
          expected: ['database schema', 'connection pooling', 'acid', 'data flow', 'api response'],
          topic: 'Project Architecture',
        },
        {
          question: `What was the most challenging technical constraint or bottleneck you encountered while implementing "${title}", and how did you resolve it?`,
          expected: ['bottleneck', 'profiling or debugging', 'trade-offs', 'resolution', 'metrics'],
          topic: 'Project Technical Decisions',
        },
        {
          question: `Why did you select a ${arch} for "${title}" over alternative microservices or monolithic patterns?`,
          expected: ['scalability', 'decoupling', 'latency', 'maintenance', 'simplicity'],
          topic: 'System Architecture Rationale',
        },
      ];

      const selected = projectPrompts[(questionNumber - 1) % projectPrompts.length];
      return {
        id: qId,
        session_id: session.id,
        question_number: questionNumber,
        question: selected.question,
        question_type: 'PROJECT',
        topic: selected.topic,
        difficulty: session.difficulty,
        expected_concepts: selected.expected,
        created_at: new Date().toISOString(),
      };
    }

    // 2. HR / Behavioral
    if (session.interview_type === 'HR' || session.interview_type === 'BEHAVIORAL') {
      const hrBank = [
        {
          question: 'Can you introduce yourself and highlight two technical accomplishments from your engineering coursework?',
          expected: ['introduction', 'academic background', 'projects or achievements', 'passion for technology', 'future goals'],
          topic: 'Self Introduction',
        },
        {
          question: 'Describe a situation where you had a disagreement with a team member on a project deliverable. How did you handle it using the STAR approach?',
          expected: ['situation', 'task', 'action', 'result', 'empathy', 'active listening', 'consensus'],
          topic: 'Conflict Resolution & Teamwork',
        },
        {
          question: 'Tell me about a time you missed a project deadline or encountered a critical system bug before submission. What did you learn?',
          expected: ['situation', 'mistake or hurdle', 'root cause analysis', 'corrective action', 'learnings'],
          topic: 'Resilience & Continuous Learning',
        },
      ];
      const selected = hrBank[(questionNumber - 1) % hrBank.length];
      return {
        id: qId,
        session_id: session.id,
        question_number: questionNumber,
        question: selected.question,
        question_type: 'HR',
        topic: selected.topic,
        difficulty: session.difficulty,
        expected_concepts: selected.expected,
        created_at: new Date().toISOString(),
      };
    }

    // 3. Technical Questions Bank
    const techBank = [
      {
        question: 'Explain the four ACID properties in database management systems and how isolation levels prevent concurrent anomalies.',
        expected: ['atomicity', 'consistency', 'isolation', 'durability', 'dirty read', 'repeatable read'],
        topic: 'DBMS',
      },
      {
        question: 'What are the four Coffman conditions necessary for a deadlock to occur in an operating system, and how does preemption eliminate deadlocks?',
        expected: ['mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'resource preemption'],
        topic: 'Operating Systems',
      },
      {
        question: 'Walk me through the TCP 3-way handshake and why sequence numbers must be exchanged before full-duplex data transmission begins.',
        expected: ['syn', 'syn-ack', 'ack', 'initial sequence number', 'full duplex buffer synchronization'],
        topic: 'Computer Networks',
      },
      {
        question: 'How do B+ Trees differ from standard Binary Search Trees, and why are they favored for disk-backed database indexing?',
        expected: ['b+ tree', 'range scan', 'leaf node pointers', 'disk block locality', 'fanout and height'],
        topic: 'DBMS Indexing',
      },
      {
        question: 'Explain the difference between class inheritance and object composition in Object-Oriented Design. When should you prefer composition?',
        expected: ['inheritance', 'composition', 'coupling', 'fragile base class', 'runtime flexibility'],
        topic: 'OOP & System Design',
      },
    ];

    const unasked = techBank.filter(
      (item) => !existingQuestions.some((eq) => eq.topic === item.topic)
    );
    const selected = unasked.length > 0 ? unasked[0] : techBank[(questionNumber - 1) % techBank.length];

    return {
      id: qId,
      session_id: session.id,
      question_number: questionNumber,
      question: selected.question,
      question_type: 'TECHNICAL',
      topic: selected.topic,
      difficulty: session.difficulty,
      expected_concepts: selected.expected,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Generates a grounded adaptive follow-up question.
   */
  private static async generateFollowUpQuestion(
    session: MockInterviewSession,
    questionNumber: number,
    parentQuestion: MockInterviewQuestion,
    focusConcept?: string
  ): Promise<MockInterviewQuestion> {
    const qId = `mq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const topic = parentQuestion.topic;

    let questionText = '';
    let expectedConcepts: string[] = [];

    if (topic.includes('DBMS') || topic.includes('Index')) {
      questionText = focusConcept?.toLowerCase().includes('isolation') || focusConcept?.toLowerCase().includes('read')
        ? 'Can you clarify the specific difference between a Non-Repeatable Read and a Phantom Read in SQL transaction isolation?'
        : 'Following up on database storage: How does Write-Ahead Logging (WAL) coordinate with periodic checkpointing to prevent disk saturation?';
      expectedConcepts = ['dirty read', 'phantom read', 'predicate lock', 'checkpoint', 'wal or write-ahead logging'];
    } else if (topic.includes('OS') || topic.includes('Deadlock')) {
      questionText = 'How does the Banker\'s algorithm utilize resource-allocation graphs and claim matrices to avoid entering an unsafe state?';
      expectedConcepts = ['safe state', 'bankers algorithm', 'allocation matrix', 'need matrix', 'available vector'];
    } else if (topic.includes('Network') || topic.includes('TCP')) {
      questionText = 'What is the purpose of the TIME_WAIT state during TCP connection teardown, and what issues arise if it is set too low?';
      expectedConcepts = ['time_wait', '2 msl or maximum segment lifetime', 'delayed packets', 'socket exhaustion', 'fin-ack'];
    } else if (topic.includes('Project')) {
      questionText = `Regarding ${focusConcept || 'your architecture'}: What would happen if traffic spiked tenfold, and how would your database and caching layer absorb the load?`;
      expectedConcepts = ['caching or redis', 'read replicas', 'connection pooling', 'rate limiting', 'horizontal scaling'];
    } else {
      questionText = `Building on your previous response: Could you provide a concrete numerical or code example illustrating ${focusConcept || 'this tradeoff'}?`;
      expectedConcepts = [focusConcept || 'concrete example', 'complexity', 'trade-offs', 'implementation'];
    }

    return {
      id: qId,
      session_id: session.id,
      question_number: questionNumber,
      question: questionText,
      question_type: parentQuestion.question_type,
      topic: `${parentQuestion.topic} (Follow-up)`,
      difficulty: session.difficulty,
      expected_concepts: expectedConcepts,
      follow_up_to: parentQuestion.id,
      created_at: new Date().toISOString(),
    };
  }
}
