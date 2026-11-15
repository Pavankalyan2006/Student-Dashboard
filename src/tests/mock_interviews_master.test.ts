// src/tests/mock_interviews_master.test.ts
// Comprehensive Vitest suite validating the AI Mock Interviews Module

import { describe, it, expect, beforeEach } from 'vitest';
import { MockInterviewEngineService } from '../../server/services/mockInterviewEngineService';
import { db } from '../../server/db/database';

describe('AI Mock Interviews Module - Master Verification Suite', () => {
  const studentId = 'std_test_mock_interview_2026';

  beforeEach(async () => {
    await db.initialize();
  });

  describe('1. Catalog, Categories & Metadata', () => {
    it('provides all 14 interview tracks with rubrics and defaults', () => {
      const categories = MockInterviewEngineService.getCategories();
      expect(categories.length).toBe(14); // Phase 5 added PROJECT and COMMUNICATION

      const requiredCategories = [
        'HR',
        'BEHAVIORAL',
        'TECHNICAL',
        'CODING',
        'DSA',
        'SQL',
        'SYSTEM_DESIGN',
        'AI_ML',
        'RESUME',
        'INTERNSHIP',
        'GRADUATE_JOB',
        'CUSTOM',
        'PROJECT',
        'COMMUNICATION',
      ];

      for (const cat of requiredCategories) {
        const found = categories.find((c) => c.id === cat);
        expect(found, `Category ${cat} must exist`).toBeDefined();
        expect(found!.rubricTemplate.length).toBeGreaterThan(0);
        expect(found!.defaultQuestions).toBeGreaterThanOrEqual(2);
        expect(found!.defaultDuration).toBeGreaterThanOrEqual(15);
      }
    });

    it('provides target engineering roles with skill mappings', () => {
      const roles = MockInterviewEngineService.getTargetRoles();
      expect(roles.length).toBeGreaterThanOrEqual(10);

      const sdeRole = roles.find((r) => r.id === 'SDE');
      expect(sdeRole).toBeDefined();
      expect(sdeRole!.keySkills.length).toBeGreaterThan(0);
      expect(sdeRole!.suggestedCategories).toContain('CODING');
    });

    it('filters question catalog by category, difficulty, and search term', () => {
      const techQuestions = MockInterviewEngineService.getQuestions({ category: 'TECHNICAL' });
      expect(techQuestions.length).toBeGreaterThan(0);
      expect(techQuestions.every((q) => q.category === 'TECHNICAL')).toBe(true);

      const codingQuestions = MockInterviewEngineService.getQuestions({ category: 'CODING' });
      expect(codingQuestions.length).toBeGreaterThan(0);
      expect(codingQuestions.every((q) => q.category === 'CODING')).toBe(true);

      const sqlQuestions = MockInterviewEngineService.getQuestions({ category: 'SQL' });
      expect(sqlQuestions.length).toBeGreaterThan(0);
      expect(sqlQuestions.every((q) => q.category === 'SQL')).toBe(true);

      const searchMatch = MockInterviewEngineService.getQuestions({ search: 'ACID' });
      expect(searchMatch.length).toBeGreaterThan(0);
      expect(searchMatch[0].expected_concepts.some((c) => c.toLowerCase().includes('atomicity'))).toBe(true);
    });
  });

  describe('2. Session Creation Across Tracks', () => {
    it('creates a Technical CS session with initial question', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'TECHNICAL',
        target_role: 'Software Development Engineer',
        difficulty: 'INTERMEDIATE',
        experience_level: 'STUDENT',
        duration_minutes: 30,
        max_questions: 4,
      });

      expect(res.session.id).toBeDefined();
      expect(res.session.student_id).toBe(studentId);
      expect(res.session.category).toBe('TECHNICAL');
      expect(res.session.status).toBe('READY');
      expect(res.initial_question).toBeDefined();
      expect(res.initial_question.question_number).toBe(1);
      expect(res.initial_question.expected_concepts.length).toBeGreaterThan(0);
    });

    it('creates a Coding session with python sandbox defaults', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'CODING',
        target_role: 'Backend Developer',
        programming_language: 'python',
        difficulty: 'BEGINNER',
        max_questions: 3,
      });

      expect(res.session.category).toBe('CODING');
      expect(res.session.programming_language).toBe('python');
      expect(res.initial_question.question_type).toBe('CODING');
      expect(res.initial_question.starter_code).toBeDefined();
    });

    it('creates an SQL session with table schema context', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'SQL',
        target_role: 'Data Analyst',
        difficulty: 'INTERMEDIATE',
        max_questions: 2,
      });

      expect(res.session.category).toBe('SQL');
      expect(res.initial_question.question_type).toBe('SQL');
      expect(res.initial_question.sql_schema_table).toBe('departments');
    });

    it('creates a System Design session with distributed architecture rubric', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'SYSTEM_DESIGN',
        target_role: 'Software Development Engineer',
        difficulty: 'INTERMEDIATE',
        max_questions: 3,
      });

      expect(res.session.category).toBe('SYSTEM_DESIGN');
      expect(res.initial_question.question_type).toBe('SYSTEM_DESIGN');
      expect(res.initial_question.rubric.some((r) => r.dimension.includes('Architecture'))).toBe(true);
    });

    it('creates an HR / Behavioral STAR session', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'BEHAVIORAL',
        target_role: 'Full-Stack Developer',
        difficulty: 'INTERMEDIATE',
        max_questions: 4,
      });

      expect(res.session.category).toBe('BEHAVIORAL');
      expect(res.initial_question.rubric.some((r) => r.dimension.includes('STAR'))).toBe(true);
    });
  });

  describe('3. Sandbox Execution & System Artifacts', () => {
    it('executes python code in the isolated sandbox', async () => {
      const sessionRes = await MockInterviewEngineService.createSession(studentId, {
        category: 'CODING',
        target_role: 'Python Developer',
      });

      const execResult = await MockInterviewEngineService.runCodeInSandbox(
        sessionRes.session.id,
        studentId,
        {
          question_id: sessionRes.initial_question.id,
          language: 'python',
          source_code: 'print(sum([1, 2, 3, 4]))',
        }
      );

      expect(execResult).toBeDefined();
      expect(execResult.stdout?.trim()).toBe('10');
      expect(execResult.exit_code).toBe(0);
    });

    it('executes SQL queries against the isolated student university_db sandbox', async () => {
      const sessionRes = await MockInterviewEngineService.createSession(studentId, {
        category: 'SQL',
        target_role: 'Data Analyst',
      });

      const sqlResult = await MockInterviewEngineService.runSqlInSandbox(
        sessionRes.session.id,
        studentId,
        {
          question_id: sessionRes.initial_question.id,
          query: 'SELECT dept_id, dept_name, budget FROM departments WHERE budget > 6000000;',
          db_name: 'university_db',
        }
      );

      expect(sqlResult.success).toBe(true);
      expect(sqlResult.rows.length).toBeGreaterThan(0);
      expect(sqlResult.columns).toContain('dept_name');
    });

    it('saves visual architecture topology artifacts for System Design', async () => {
      const sessionRes = await MockInterviewEngineService.createSession(studentId, {
        category: 'SYSTEM_DESIGN',
        target_role: 'Software Development Engineer',
      });

      const saveRes = await MockInterviewEngineService.saveSystemDesignArtifact(
        sessionRes.session.id,
        studentId,
        {
          question_id: sessionRes.initial_question.id,
          topology: [
            { id: '1', name: 'API Gateway', type: 'GATEWAY' },
            { id: '2', name: 'Redis Cache', type: 'CACHE' },
            { id: '3', name: 'PostgreSQL DB', type: 'DATABASE' },
          ],
        }
      );

      expect(saveRes.success).toBe(true);
      const sessionData = await MockInterviewEngineService.getSession(sessionRes.session.id, studentId);
      expect(sessionData.session.system_design_artifacts?.[sessionRes.initial_question.id]).toBeDefined();
    });
  });

  describe('4. Interactive Lifecycle: Start, Pause, Resume, Hints, Skip', () => {
    it('manages pause and resume states idempotently', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'TECHNICAL',
        target_role: 'Software Development Engineer',
      });

      const started = await MockInterviewEngineService.startSession(res.session.id, studentId);
      expect(started.status).toBe('IN_PROGRESS');

      const paused = await MockInterviewEngineService.pauseSession(res.session.id, studentId);
      expect(paused.status).toBe('PAUSED');
      expect(paused.is_paused).toBe(true);

      const resumed = await MockInterviewEngineService.resumeSession(res.session.id, studentId);
      expect(resumed.status).toBe('IN_PROGRESS');
      expect(resumed.is_paused).toBe(false);
    });

    it('provides pedagogical hints without revealing complete answers', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'TECHNICAL',
        target_role: 'Software Development Engineer',
      });

      const hintData = await MockInterviewEngineService.requestHint(
        res.session.id,
        studentId,
        res.initial_question.id
      );

      expect(hintData.hint).toBeDefined();
      expect(hintData.hint.length).toBeGreaterThan(10);
    });

    it('skips a question cleanly with 0 points and advances to next', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'TECHNICAL',
        target_role: 'Software Development Engineer',
        max_questions: 3,
      });

      const skipRes = await MockInterviewEngineService.skipQuestion(
        res.session.id,
        studentId,
        res.initial_question.id
      );

      expect(skipRes.next_question).toBeDefined();
      expect(skipRes.next_question!.question_number).toBe(2);

      const sessionData = await MockInterviewEngineService.getSession(res.session.id, studentId);
      expect(sessionData.answers.length).toBe(1);
      expect(sessionData.answers[0].answer_text).toContain('[SKIPPED BY CANDIDATE]');
      expect(sessionData.answers[0].evaluation.score).toBe(0);
    });
  });

  describe('5. Semantic Evaluation, Rubrics & Completion Report', () => {
    it('evaluates submitted answer against multi-dimensional rubric', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'TECHNICAL',
        target_role: 'Software Development Engineer',
        max_questions: 2,
      });

      const submitRes = await MockInterviewEngineService.submitAnswer(
        res.session.id,
        studentId,
        res.initial_question.id,
        {
          answer_text: 'Atomicity guarantees all-or-nothing execution via write-ahead logging. Consistency enforces constraints. Isolation levels like Read Committed, Repeatable Read, and Serializable prevent dirty reads and phantom reads. Durability ensures committed state persists on disk.',
          duration_seconds: 90,
          input_mode: 'TEXT',
        }
      );

      expect(submitRes.answer).toBeDefined();
      expect(submitRes.answer.evaluation.score).toBeGreaterThanOrEqual(70);
      expect(submitRes.answer.evaluation.covered_concepts.length).toBeGreaterThan(0);
      expect(submitRes.answer.evaluation.rubric_scores.length).toBeGreaterThan(0);
    });

    it('completes session and generates comprehensive debrief report with learning modules', async () => {
      const res = await MockInterviewEngineService.createSession(studentId, {
        category: 'CODING',
        target_role: 'Software Development Engineer',
        max_questions: 2,
      });

      // Answer Q1 by naming its reference concepts, so the keyword check has something to find.
      const concepts = res.initial_question.expected_concepts || [];
      await MockInterviewEngineService.submitAnswer(res.session.id, studentId, res.initial_question.id, {
        answer_text: `My approach covers ${concepts.join(', ')}.`,
      });

      const finishRes = await MockInterviewEngineService.completeSession(res.session.id, studentId);
      expect(finishRes.session.status).toBe('COMPLETED');
      expect(finishRes.report.overall_score).toBeGreaterThan(0);
      expect(finishRes.report.scoring_method).toBe('KEYWORD_MATCH');
      expect(finishRes.report.scoring_definition).toMatch(/keyword check/i);
      expect(finishRes.report.scoring_definition).toMatch(/not a hiring assessment/i);
      expect(finishRes.report.communication_observations).toEqual([]);

      const dsaRec = finishRes.report.recommended_learning_modules.find((m) => m.route_path === '/dsa');
      expect(dsaRec).toBeDefined();
    });
  });

  describe('6. Saved Questions & Scheduling', () => {
    it('saves, retrieves, and deletes questions from revision bank', async () => {
      const saved = await MockInterviewEngineService.saveQuestion(studentId, {
        question_id: 'cat_q_tech_01',
        category: 'TECHNICAL',
        topic: 'DBMS Transactions',
        question: 'Explain ACID properties and isolation levels.',
        student_notes: 'Must revise write-skew and SSI.',
      });

      expect(saved.id).toBeDefined();
      expect(saved.student_id).toBe(studentId);

      const list = await MockInterviewEngineService.getSavedQuestions(studentId);
      expect(list.some((q) => q.question_id === 'cat_q_tech_01')).toBe(true);

      const deleted = await MockInterviewEngineService.deleteSavedQuestion(studentId, saved.id);
      expect(deleted).toBe(true);
    });

    it('schedules and cancels practice sessions', async () => {
      const scheduled = await MockInterviewEngineService.scheduleInterview(studentId, {
        category: 'CODING',
        target_role: 'Backend Developer',
        scheduled_date: '2026-11-01',
        scheduled_time: '19:30',
        reminder_minutes_before: 30,
      });

      expect(scheduled.id).toBeDefined();
      expect(scheduled.status).toBe('PENDING');

      const allSched = await MockInterviewEngineService.getScheduled(studentId);
      expect(allSched.some((s) => s.id === scheduled.id)).toBe(true);

      const deleted = await MockInterviewEngineService.deleteScheduled(studentId, scheduled.id);
      expect(deleted).toBe(true);
    });
  });

  describe('7. Analytics & New Student Onboarding State', () => {
    it('calculates real analytics and reports onboarding for new students', async () => {
      const freshStudentId = `std_fresh_${Date.now()}`;
      const analytics = await MockInterviewEngineService.getAnalytics(freshStudentId);

      expect(analytics.total_completed).toBe(0);
      expect(analytics.is_onboarding).toBe(true);
      expect(analytics.recommended_next_interview).toBeDefined();
      expect(analytics.recommended_next_interview.category).toBe('TECHNICAL');
    });

    it('enforces student ownership and isolates sessions', async () => {
      const res = await MockInterviewEngineService.createSession('student_alpha', {
        category: 'TECHNICAL',
        target_role: 'Software Development Engineer',
      });

      await expect(
        MockInterviewEngineService.getSession(res.session.id, 'student_bravo')
      ).rejects.toThrow();
    });
  });
});
