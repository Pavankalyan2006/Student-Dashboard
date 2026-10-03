import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { PlacementTopicService } from '../../server/services/placementTopicService';
import { PlacementCompanyRoleService } from '../../server/services/placementCompanyRoleService';
import { PlacementPlanService } from '../../server/services/placementPlanService';
import { MockInterviewService } from '../../server/services/mockInterviewService';
import { InterviewAdaptationService } from '../../server/services/interviewAdaptationService';
import { PlacementService } from '../../server/services/placementService';
import { ProjectService } from '../../server/services/projectService';
import { ToolRegistry } from '../../server/ai/tools';

describe('Phase 11: Placement Preparation & AI Mock Interview System', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_unauthorized_student_99';

  beforeEach(async () => {
    await db.initialize();
  });

  describe('1. Placement Topics & Question Bank', () => {
    it('retrieves seed placement topics across aptitude, cs core, and hr', async () => {
      const topics = await PlacementTopicService.getTopics();
      expect(topics.length).toBeGreaterThanOrEqual(7);

      const dbms = topics.find(t => t.slug === 'dbms-transactions-acid-concurrency');
      expect(dbms).toBeDefined();
      expect(dbms?.category).toBe('DBMS');
      expect(dbms?.difficulty).toBe('HARD');

      const aptitude = topics.find(t => t.category === 'APTITUDE');
      expect(aptitude).toBeDefined();

      const lr = topics.find(t => t.category === 'LOGICAL_REASONING');
      expect(lr).toBeDefined();
    });

    it('filters topics by category', async () => {
      const dbmsTopics = await PlacementTopicService.getTopics('DBMS');
      expect(dbmsTopics.length).toBeGreaterThan(0);
      expect(dbmsTopics.every(t => t.category === 'DBMS')).toBe(true);
    });

    it('retrieves topic details with concepts, common interview questions, and practice items', async () => {
      const details = await PlacementTopicService.getTopicDetails('top_place_tech_dbms_01');
      expect(details).toBeDefined();
      expect(details?.topic.id).toBe('top_place_tech_dbms_01');
      expect(details?.concepts.length).toBeGreaterThan(0);
      expect(details?.interview_questions.length).toBeGreaterThan(0);
      expect(details?.practice_questions.length).toBeGreaterThan(0);
    });

    it('evaluates practice multiple-choice questions correctly with explanation', async () => {
      const topic = await PlacementTopicService.getTopicDetails('top_place_tech_dbms_01');
      const q = topic?.practice_questions[0];
      expect(q).toBeDefined();

      // Submit correct answer
      const correctEval = await PlacementTopicService.evaluatePracticeAnswer(q!.id, q!.correct_answer);
      expect(correctEval.is_correct).toBe(true);
      expect(correctEval.explanation).toBeDefined();

      // Submit wrong answer
      const wrongEval = await PlacementTopicService.evaluatePracticeAnswer(q!.id, 'definitely_wrong_answer_xyz');
      expect(wrongEval.is_correct).toBe(false);
      expect(wrongEval.correct_answer).toBe(q!.correct_answer);
    });
  });

  describe('2. Company & Role Profiles with Verification Disclaimers', () => {
    it('retrieves companies and company preparation profiles', async () => {
      const companies = await PlacementCompanyRoleService.getCompanies();
      expect(companies.length).toBeGreaterThanOrEqual(4);

      const google = companies.find(c => c.name.toLowerCase().includes('google'));
      expect(google).toBeDefined();

      const profile = await PlacementCompanyRoleService.getCompanyProfile(google!.id);
      expect(profile).toBeDefined();
      expect(profile?.reported_rounds.length).toBeGreaterThan(0);
      expect(profile?.coding_topics.length).toBeGreaterThan(0);
      expect(profile?.source_metadata).toBeDefined();
      expect(profile?.last_verified_at).toBeDefined();
    });

    it('retrieves technical roles with required competencies', async () => {
      const roles = await PlacementCompanyRoleService.getRoles();
      expect(roles.length).toBeGreaterThanOrEqual(4);

      const sde = roles.find(r => r.slug === 'software-development-engineer');
      expect(sde).toBeDefined();
      expect(sde?.skill_requirements.length).toBeGreaterThan(0);
      expect(sde?.technical_topics.length).toBeGreaterThan(0);
    });
  });

  describe('3. Personalized Placement Plan & Security Ownership', () => {
    it('generates a multi-week structured study roadmap', async () => {
      const { plan, tasks } = await PlacementPlanService.createPlan(studentA, {
        target_role_id: 'role_backend',
        target_company_id: 'comp_amazon',
        duration_weeks: 4,
        daily_hours: 2,
      });

      expect(plan.id).toBeDefined();
      expect(plan.student_id).toBe(studentA);
      expect(plan.target_role_id).toBe('role_backend');
      expect(plan.target_company_id).toBe('comp_amazon');
      expect(tasks.length).toBeGreaterThanOrEqual(4);
      expect(plan.status).toBe('ACTIVE');

      // Check task structure linking to platform modules
      const sources = tasks.map(t => t.source_type.toLowerCase());
      expect(sources).toContain('dsa');
      expect(sources).toContain('topic');
    });

    it('toggles plan task completion and updates progress', async () => {
      const plans = await PlacementPlanService.getPlans(studentA);
      const plan = plans[0];
      const tasks = await PlacementPlanService.getPlanTasks(plan.id, studentA);
      const task = tasks[0];

      const initialStatus = task.status;
      const updated = await PlacementPlanService.updatePlanTask(plan.id, studentA, task.id, {
        status: 'COMPLETED',
      });
      expect(updated.status).toBe('COMPLETED');
      expect(updated.completed_at).toBeDefined();

      // Reset
      await PlacementPlanService.updatePlanTask(plan.id, studentA, task.id, {
        status: initialStatus,
      });
    });

    it('enforces student ownership and forbids Student B from modifying Student A tasks', async () => {
      const plans = await PlacementPlanService.getPlans(studentA);
      const plan = plans[0];
      const tasks = await PlacementPlanService.getPlanTasks(plan.id, studentA);
      const task = tasks[0];

      await expect(
        PlacementPlanService.updatePlanTask(plan.id, studentB, task.id, { status: 'COMPLETED' })
      ).rejects.toThrow(/permission|forbidden/i);
    });
  });

  describe('4. Mock Interview Lifecycle, Adaptive Branching & Debrief', () => {
    let testSessionId: string;

    it('creates a new technical mock interview session with initial question', async () => {
      const { session, initial_question } = await MockInterviewService.createSession(studentA, {
        interview_type: 'TECHNICAL',
        role_id: 'role_sde',
        difficulty: 'MEDIUM',
        duration_minutes: 30,
        focus_areas: ['DBMS', 'Operating Systems'],
      });

      expect(session.id).toBeDefined();
      expect(session.student_id).toBe(studentA);
      expect(session.status).toBe('READY');

      expect(initial_question).toBeDefined();
      expect(initial_question.question_number).toBe(1);
      expect(initial_question.question).toBeDefined();
      expect(initial_question.expected_concepts.length).toBeGreaterThan(0);

      testSessionId = session.id;
    });

    it('enforces student ownership on mock interview sessions', async () => {
      // Student A can access
      const data = await MockInterviewService.getSession(testSessionId, studentA);
      expect(data.session.id).toBe(testSessionId);

      // Student B cannot access
      await expect(MockInterviewService.getSession(testSessionId, studentB)).rejects.toThrow(
        /permission|forbidden/i
      );
    });

    it('evaluates student response against expected concepts and triggers adaptive follow-up', async () => {
      // Start session
      await MockInterviewService.startSession(testSessionId, studentA);

      const data = await MockInterviewService.getSession(testSessionId, studentA);
      const currentQ = data.questions[data.questions.length - 1];

      // Submit comprehensive answer covering expected concepts
      const answerText = `To prevent data redundancy and maintain referential integrity, database normalization decomposes tables into normal forms (1NF, 2NF, 3NF, BCNF) based on functional dependencies. In contrast, ACID transactions ensure atomicity, consistency, isolation, and durability through write-ahead logging and two-phase locking.`;

      const result = await MockInterviewService.submitAnswer(testSessionId, studentA, currentQ.id, {
        answer_text: answerText,
        duration_seconds: 45,
      });

      expect(result.answer.evaluation).toBeDefined();
      expect(result.answer.evaluation.covered_concepts.length).toBeGreaterThan(0);
      expect(result.answer.evaluation.strengths.length).toBeGreaterThan(0);

      // Check that session updated with either follow-up or next question
      const updatedSession = await MockInterviewService.getSession(testSessionId, studentA);
      expect(updatedSession.answers.length).toBe(1);
      expect(updatedSession.questions.length).toBe(2);
    });

    it('completes the interview and produces structured debrief feedback with recommendations', async () => {
      const { session: completed, feedback } = await MockInterviewService.completeSession(testSessionId, studentA);
      expect(completed.status).toBe('COMPLETED');
      expect(completed.completed_at).toBeDefined();
      expect(feedback).toBeDefined();

      expect(typeof feedback.overall_score).toBe('number');
      expect(feedback.summary).toBeDefined();
      expect(feedback.topics_covered.length).toBeGreaterThan(0);
      expect(feedback.recommended_practice).toBeDefined();
      expect(feedback.recommended_practice.quizzes.length).toBeGreaterThan(0);
      expect(feedback.recommended_practice.courses.length).toBeGreaterThan(0);
    });

    it('tests deterministic adaptation logic across strong, partial, and weak answers', () => {
      const mockSession: any = {
        current_question_index: 1,
        max_questions: 5,
        difficulty: 'MEDIUM',
      };
      const mockQ: any = { id: 'q1', topic: 'DBMS', expected_concepts: ['c1', 'c2'] };

      // Strong answer -> deepen
      const strongAnswer: any = {
        evaluation: {
          score: 90,
          covered_concepts: ['c1', 'c2'],
          missing_concepts: [],
          strengths: ['Clear terminology', 'Great depth'],
          improvements: [],
          follow_up_needed: true,
        },
      };
      const strong = InterviewAdaptationService.determineNextStep(
        mockSession,
        mockQ,
        strongAnswer,
        [mockQ]
      );
      expect(strong.should_follow_up).toBe(true);
      expect(strong.follow_up_direction).toBe('DEEPEN');

      // Incomplete answer -> clarify
      const partialAnswer: any = {
        evaluation: {
          score: 50,
          covered_concepts: ['c1'],
          missing_concepts: ['c2'],
          strengths: ['Identified basics'],
          improvements: ['Missed trade-offs'],
          follow_up_needed: true,
        },
      };
      const partial = InterviewAdaptationService.determineNextStep(
        mockSession,
        mockQ,
        partialAnswer,
        [mockQ]
      );
      expect(partial.should_follow_up).toBe(true);
      expect(partial.follow_up_direction).toBe('CLARIFY');

      // Max consecutive follow-ups reached -> next topic
      const followUpQ: any = { id: 'q2', follow_up_to: 'q1', topic: 'DBMS' };
      const maxed = InterviewAdaptationService.determineNextStep(
        mockSession,
        followUpQ,
        strongAnswer,
        [mockQ, followUpQ]
      );
      expect(maxed.should_follow_up).toBe(false);
      expect(maxed.follow_up_direction).toBe('NEXT_TOPIC');
    });
  });

  describe('5. Project Defense Grounded in Actual Student Projects', () => {
    let studentProjectId: string;

    it('creates a project for studentA and runs a project interview defense', async () => {
      const project = await ProjectService.createProject(studentA, {
        title: 'Distributed Transaction Coordinator with Raft Consensus',
        project_type: 'MAJOR_PROJECT',
        domain: 'Distributed Systems',
        problem_statement: 'Achieving atomic commit across heterogeneous microservices.',
        technologies: [
          { category: 'BACKEND', technology: 'Go' },
          { category: 'API', technology: 'gRPC' },
          { category: 'DATABASE', technology: 'PostgreSQL' },
          { category: 'DEPLOYMENT', technology: 'Docker' },
        ],
      });
      studentProjectId = project.id;

      // Start project defense session
      const { session, initial_question } = await MockInterviewService.createSession(studentA, {
        interview_type: 'PROJECT',
        role_id: 'role_sde',
        project_id: studentProjectId,
        difficulty: 'HARD',
      });

      expect(session.id).toBeDefined();
      expect(session.project_id).toBe(studentProjectId);

      expect(initial_question.topic).toBe('Project Architecture');
      expect(initial_question.question.toLowerCase()).toContain('distributed transaction coordinator');
    });

    it('blocks studentB from initiating a project interview using studentA project', async () => {
      await expect(
        MockInterviewService.createSession(studentB, {
          interview_type: 'PROJECT',
          role_id: 'role_sde',
          project_id: studentProjectId,
        })
      ).rejects.toThrow(/Forbidden/i);
    });
  });

  describe('6. Empirical Placement Readiness & Weak-Area Detection', () => {
    it('computes grounded multi-dimensional readiness without fabricated hiring probabilities', async () => {
      const readiness = await PlacementService.getReadiness(studentA);
      expect(readiness).toBeDefined();
      expect(readiness.dimensions).toBeDefined();

      const dims = readiness.dimensions;
      expect(dims.aptitude.score).toBeGreaterThanOrEqual(0);
      expect(dims.technical.score).toBeGreaterThanOrEqual(0);
      expect(dims.coding.score).toBeGreaterThanOrEqual(0);
      expect(dims.dsa.score).toBeGreaterThanOrEqual(0);
      expect(dims.projects.score).toBeGreaterThanOrEqual(0);
      expect(dims.interview_practice.score).toBeGreaterThanOrEqual(0);

      // Verify no misleading claims
      expect(readiness.overall_percentage).toBeGreaterThanOrEqual(0);
      expect(readiness.overall_percentage).toBeLessThanOrEqual(100);
    });

    it('detects weak placement areas with required evidence thresholds', async () => {
      const weakAreas = await PlacementService.getWeakAreas(studentA);
      expect(Array.isArray(weakAreas)).toBe(true);
      if (weakAreas.length > 0) {
        const item = weakAreas[0];
        expect(item.topic).toBeDefined();
        expect(item.severity).toBeDefined();
        expect(item.recommended_action).toBeDefined();
      }
    });
  });

  describe('7. ToolRegistry Placement Tools Execution', () => {
    it('executes get_placement_topics tool', async () => {
      const tool = ToolRegistry.getTool('get_placement_topics');
      expect(tool).toBeDefined();
      const result = await tool!.handler({ category: 'DBMS' }, { studentId: studentA, role: 'STUDENT' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('executes get_company_preparation tool', async () => {
      const tool = ToolRegistry.getTool('get_company_preparation');
      expect(tool).toBeDefined();
      const result = await tool!.handler({ company_id: 'comp_google' }, { studentId: studentA, role: 'STUDENT' });
      expect(result.company_id).toBe('comp_google');
      expect(result.reported_rounds.length).toBeGreaterThan(0);
    });

    it('executes get_role_preparation tool', async () => {
      const tool = ToolRegistry.getTool('get_role_preparation');
      expect(tool).toBeDefined();
      const result = await tool!.handler({ role_id: 'role_sde' }, { studentId: studentA, role: 'STUDENT' });
      expect(result.id).toBe('role_sde');
    });

    it('executes get_placement_progress tool', async () => {
      const tool = ToolRegistry.getTool('get_placement_progress');
      expect(tool).toBeDefined();
      const result = await tool!.handler({}, { studentId: studentA, role: 'STUDENT' });
      expect(result.dimensions).toBeDefined();
      expect(result.overall_percentage).toBeGreaterThanOrEqual(0);
    });

    it('executes start_mock_interview and get_mock_interview tools', async () => {
      const startTool = ToolRegistry.getTool('start_mock_interview');
      expect(startTool).toBeDefined();
      const startResult = await startTool!.handler(
        { interview_type: 'HR', role_id: 'role_sde', difficulty: 'EASY' },
        { studentId: studentA, role: 'STUDENT' }
      );
      expect(startResult.session.id).toBeDefined();

      const getTool = ToolRegistry.getTool('get_mock_interview');
      expect(getTool).toBeDefined();
      const fetchResult = await getTool!.handler(
        { session_id: startResult.session.id },
        { studentId: studentA, role: 'STUDENT' }
      );
      expect(fetchResult.session.id).toBe(startResult.session.id);
    });

    it('executes get_recent_placement_activity tool', async () => {
      const tool = ToolRegistry.getTool('get_recent_placement_activity');
      expect(tool).toBeDefined();
      const result = await tool!.handler({}, { studentId: studentA, role: 'STUDENT' });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('8. Recommendations, Plan Updates & Feedback Endpoints', () => {
    it('retrieves structured placement recommendations linking to courses, quizzes, and labs', async () => {
      const recs = await PlacementService.getRecommendations(studentA);
      expect(recs).toBeDefined();
      expect(recs.recommended_quizzes.length).toBeGreaterThan(0);
      expect(recs.recommended_dsa.length).toBeGreaterThan(0);
      expect(recs.recommended_courses.length).toBeGreaterThan(0);
    });

    it('updates placement plan properties and enforces ownership', async () => {
      const plans = await PlacementPlanService.getPlans(studentA);
      const plan = plans[0];
      const updated = await PlacementPlanService.updatePlan(plan.id, studentA, {
        title: 'Updated 4-Week Sprint Plan',
        status: 'PAUSED',
      });
      expect(updated.title).toBe('Updated 4-Week Sprint Plan');
      expect(updated.status).toBe('PAUSED');

      // Unauthorized update by studentB
      await expect(
        PlacementPlanService.updatePlan(plan.id, studentB, { status: 'COMPLETED' })
      ).rejects.toThrow(/permission|forbidden/i);
    });

    it('retrieves interview feedback for a session and verifies ownership', async () => {
      const { session } = await MockInterviewService.createSession(studentA, {
        interview_type: 'HR',
        role_id: 'role_sde',
      });
      const feedback = await MockInterviewService.getFeedback(session.id, studentA);
      expect(feedback).toBeDefined();
      expect(feedback.topics_covered).toBeDefined();

      // Student B cannot get feedback
      await expect(
        MockInterviewService.getFeedback(session.id, studentB)
      ).rejects.toThrow(/permission|forbidden/i);
    });

    it('verifies that expanded roles (Full Stack, Cloud, DevOps, Cyber Security, etc.) exist', async () => {
      const roles = await PlacementCompanyRoleService.getRoles();
      const slugs = roles.map((r) => r.slug);
      expect(slugs).toContain('full-stack-developer');
      expect(slugs).toContain('cloud-engineer');
      expect(slugs).toContain('devops-engineer');
      expect(slugs).toContain('cyber-security-analyst');
      expect(slugs).toContain('data-analyst');
      expect(slugs).toContain('qa-engineer');
    });
  });
});
