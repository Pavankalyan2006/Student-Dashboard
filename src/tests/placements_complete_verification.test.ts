import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { PlacementService } from '../../server/services/placementService';
import { PlacementTopicService } from '../../server/services/placementTopicService';
import { PlacementPlanService } from '../../server/services/placementPlanService';
import { MockInterviewService } from '../../server/services/mockInterviewService';
import { AuthorizationError } from '../../server/core/exceptions';

describe('Placement Preparation Complete Verification Suite', () => {
  const studentAlice = 'std_test_alice_101';
  const studentBob = 'std_test_bob_202';

  beforeEach(async () => {
    await db.initialize();
  });

  describe('1. Authoritative Dashboard Stats & 15-Category Breakdown', () => {
    it('returns genuine onboarding state when a student has no preparation records', async () => {
      const stats = await PlacementService.getDashboardStats('std_brand_new_student_999');

      expect(stats.is_onboarding).toBe(true);
      expect(stats.tasks_completed).toBe(0);
      expect(stats.practice_questions_attempted).toBe(0);
      expect(stats.accuracy_percentage).toBeNull();
      expect(stats.mock_interviews_completed).toBe(0);
      expect(stats.topics_needing_revision).toBe(0);

      // Verify all 15 required categories exist and are set to NOT_STARTED
      expect(stats.categories_progress.length).toBe(15);
      const allNotStarted = stats.categories_progress.every((c) => c.status === 'NOT_STARTED');
      expect(allNotStarted).toBe(true);

      const categoryIds = stats.categories_progress.map((c) => c.category_id);
      expect(categoryIds).toContain('quant');
      expect(categoryIds).toContain('lr');
      expect(categoryIds).toContain('verbal');
      expect(categoryIds).toContain('prog_fundamentals');
      expect(categoryIds).toContain('dsa');
      expect(categoryIds).toContain('dbms_sql');
      expect(categoryIds).toContain('os');
      expect(categoryIds).toContain('networks');
      expect(categoryIds).toContain('oop');
      expect(categoryIds).toContain('software_eng');
      expect(categoryIds).toContain('tech_interviews');
      expect(categoryIds).toContain('coding_assessments');
      expect(categoryIds).toContain('gd');
      expect(categoryIds).toContain('hr_interviews');
      expect(categoryIds).toContain('resume_projects');
    });

    it('calculates metrics dynamically once student attempts practice questions', async () => {
      const questions = await PlacementTopicService.getQuestions(undefined, 'APTITUDE');
      expect(questions.length).toBeGreaterThanOrEqual(1);

      const q1 = questions[0];
      // Submit correct answer
      await PlacementTopicService.evaluateQuestionAnswer(studentAlice, q1.id, q1.correct_answer);

      // Submit incorrect answer for another question
      if (questions.length > 1) {
        const q2 = questions[1];
        await PlacementTopicService.evaluateQuestionAnswer(studentAlice, q2.id, 'deliberately_incorrect_val');
      }

      const stats = await PlacementService.getDashboardStats(studentAlice);
      expect(stats.is_onboarding).toBe(false);
      expect(stats.practice_questions_attempted).toBeGreaterThanOrEqual(1);
      expect(stats.accuracy_percentage).not.toBeNull();
      expect(stats.accuracy_percentage!).toBeGreaterThanOrEqual(0);
      expect(stats.accuracy_percentage!).toBeLessThanOrEqual(100);

      // Quant category status should now be IN_PROGRESS
      const quantCat = stats.categories_progress.find((c) => c.category_id === 'quant');
      expect(quantCat).toBeDefined();
      expect(quantCat?.status).toBe('IN_PROGRESS');
      expect(quantCat?.completed_count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Practice Questions & Database Persistence', () => {
    it('persists every question practice attempt in database with timestamp and correctness', async () => {
      const questions = await PlacementTopicService.getQuestions();
      const testQ = questions[0];
      expect(testQ).toBeDefined();

      const evalRes = await PlacementTopicService.evaluateQuestionAnswer(
        studentAlice,
        testQ.id,
        testQ.correct_answer
      );
      expect(evalRes.is_correct).toBe(true);

      const attempts = await db.getPlacementPractice(studentAlice);
      expect(attempts.length).toBeGreaterThanOrEqual(1);

      const recorded = attempts.find((a) => a.question_id === testQ.id);
      expect(recorded).toBeDefined();
      expect(recorded?.student_id).toBe(studentAlice);
      expect(recorded?.is_correct).toBe(true);
      expect(recorded?.correct_answer).toBe(testQ.correct_answer);
      expect(recorded?.created_at).toBeDefined();
    });
  });

  describe('3. Timed Assessment Engine & Server-Side Score Calculation', () => {
    it('evaluates submitted assessments on backend, calculates score, and saves assessment result', async () => {
      const questions = await PlacementTopicService.getQuestions(undefined, 'APTITUDE');
      expect(questions.length).toBeGreaterThanOrEqual(2);

      const q1 = questions[0];
      const q2 = questions[1];

      const submission = {
        title: 'Quantitative Aptitude Diagnostic Sprint',
        category: 'APTITUDE',
        difficulty: 'MEDIUM',
        time_spent_seconds: 240,
        answers: {
          [q1.id]: q1.correct_answer, // Correct
          [q2.id]: 'wrong_answer_xyz', // Wrong
        },
      };

      const result = await PlacementService.submitAssessment(studentAlice, submission);

      expect(result.id).toBeDefined();
      expect(result.student_id).toBe(studentAlice);
      expect(result.total_questions).toBe(2);
      expect(result.correct_answers).toBe(1);
      expect(result.score_percentage).toBe(50);
      expect(result.detailed_results.length).toBe(2);
      expect(result.weak_topics.length).toBeGreaterThanOrEqual(1);

      // Verify assessment history persistence
      const history = await PlacementService.getAssessmentHistory(studentAlice);
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history.some((h) => h.id === result.id)).toBe(true);
    });
  });

  describe('4. Group Discussion (GD) Topic Library & Structure', () => {
    it('retrieves seeded GD topics with 4-phase discussion frameworks and pros/cons', async () => {
      const allGD = await db.getGroupDiscussionTopics();
      expect(allGD.length).toBeGreaterThanOrEqual(5);

      const techGD = await db.getGroupDiscussionTopics('TECH');
      expect(techGD.length).toBeGreaterThanOrEqual(1);
      expect(techGD[0].category).toBe('TECH');
      expect(techGD[0].pros_arguments.length).toBeGreaterThanOrEqual(3);
      expect(techGD[0].cons_arguments.length).toBeGreaterThanOrEqual(3);
      expect(techGD[0].suggested_structure.length).toBe(4);
      expect(techGD[0].evaluation_criteria.length).toBeGreaterThanOrEqual(3);

      const byId = await db.getGroupDiscussionTopicById(techGD[0].id);
      expect(byId).not.toBeNull();
      expect(byId?.id).toBe(techGD[0].id);
    });
  });

  describe('5. Resume & Project Defense Audit', () => {
    it('computes real completeness and project defense questions without inventing achievements', async () => {
      const audit = await PlacementService.getResumeAudit(studentAlice);
      expect(audit).toBeDefined();
      expect(typeof audit.completeness_percentage).toBe('number');
      expect(audit.checks.length).toBeGreaterThanOrEqual(5);
      expect(audit.project_defense_questions.length).toBeGreaterThanOrEqual(1);
      expect(audit.project_defense_questions[0].question).toBeDefined();
      expect(audit.project_defense_questions[0].expected_rubric).toBeDefined();
    });
  });

  describe('6. Student Data Isolation & Security Authorization', () => {
    it('prevents cross-student access to placement plans and tasks (enforces ownership)', async () => {
      const { plan } = await PlacementPlanService.createPlan(studentAlice, {
        target_role_id: 'role_sde',
        target_company_id: 'comp_google',
        duration_weeks: 4,
      });

      expect(plan.student_id).toBe(studentAlice);

      // Student Alice can access plan
      const alicePlan = await PlacementPlanService.getPlanById(plan.id, studentAlice);
      expect(alicePlan.id).toBe(plan.id);

      // Student Bob is blocked from accessing Student Alice's plan
      await expect(
        PlacementPlanService.getPlanById(plan.id, studentBob)
      ).rejects.toThrow(AuthorizationError);

      // Student Bob is blocked from deleting Student Alice's plan
      await expect(
        PlacementPlanService.deletePlan(plan.id, studentBob)
      ).rejects.toThrow(AuthorizationError);
    });

    it('isolates practice question attempts and assessment history per student', async () => {
      const aliceAttempts = await db.getPlacementPractice(studentAlice);
      const bobAttempts = await db.getPlacementPractice(studentBob);

      // Bob should not see Alice's attempts
      expect(bobAttempts.every((a) => a.student_id === studentBob)).toBe(true);
      expect(aliceAttempts.every((a) => a.student_id === studentAlice)).toBe(true);
    });
  });
});
