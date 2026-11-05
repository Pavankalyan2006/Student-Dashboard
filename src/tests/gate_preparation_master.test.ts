// src/tests/gate_preparation_master.test.ts
// Comprehensive Test Suite for GATE Exam Preparation System

import { describe, it, expect, beforeEach } from 'vitest';
import { GateService } from '../../server/services/gateService';

describe('GATE Exam Preparation Master Test Suite', () => {
  const studentId = 'test_std_gate_001';

  beforeEach(async () => {
    // Reset test student profile
    await GateService.updateProfile(studentId, {
      student_id: studentId,
      target_paper: 'CS',
      exam_cycle: 'GATE 2026',
      target_date: '2026-02-07',
      target_score: 75,
      air_goal: '< 500',
      weekly_study_hours: 20,
      study_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      onboarding_completed: true,
    });
  });

  describe('1. Paper Catalog & Configurable Papers', () => {
    it('provides all 8 official GATE engineering and science papers', async () => {
      const papers = await GateService.getPapers();
      expect(papers.length).toBeGreaterThanOrEqual(8);

      const paperCodes = papers.map((p) => p.code);
      expect(paperCodes).toContain('CS'); // Computer Science & IT
      expect(paperCodes).toContain('DA'); // Data Science & AI
      expect(paperCodes).toContain('EC'); // Electronics & Comm
      expect(paperCodes).toContain('EE'); // Electrical Eng
      expect(paperCodes).toContain('ME'); // Mechanical Eng
      expect(paperCodes).toContain('CE'); // Civil Eng
      expect(paperCodes).toContain('MA'); // Mathematics
      expect(paperCodes).toContain('PH'); // Physics
    });

    it('retrieves specific paper by code', async () => {
      const csPaper = await GateService.getPaperByCode('CS');
      expect(csPaper).toBeDefined();
      expect(csPaper?.name).toContain('Computer Science');
      expect(csPaper?.is_active).toBe(true);

      const daPaper = await GateService.getPaperByCode('DA');
      expect(daPaper).toBeDefined();
      expect(daPaper?.name).toContain('Data Science');
    });

    it('allows student to switch target paper and preserves student context', async () => {
      // Initially CS
      let profile = await GateService.getProfile(studentId);
      expect(profile?.target_paper).toBe('CS');

      // Switch to DA (Data Science & AI)
      await GateService.updateProfile(studentId, { target_paper: 'DA' });
      profile = await GateService.getProfile(studentId);
      expect(profile?.target_paper).toBe('DA');

      // Switch back to CS
      await GateService.updateProfile(studentId, { target_paper: 'CS' });
      profile = await GateService.getProfile(studentId);
      expect(profile?.target_paper).toBe('CS');
    });
  });

  describe('2. Versioned Syllabus Explorer & Topic Progress', () => {
    it('returns structured syllabus sections and topics for Computer Science (CS)', async () => {
      const sections = await GateService.getSyllabus('CS', studentId);
      expect(sections.length).toBeGreaterThanOrEqual(10);

      const sectionNames = sections.map((s) => s.name);
      expect(sectionNames).toContain('Engineering Mathematics');
      expect(sectionNames).toContain('Digital Logic');
      expect(sectionNames).toContain('Computer Organization & Architecture');
      expect(sectionNames).toContain('Algorithms');
      expect(sectionNames).toContain('Theory of Computation');
      expect(sectionNames).toContain('Compiler Design');
      expect(sectionNames).toContain('Operating Systems');
      expect(sectionNames).toContain('Databases (DBMS)');
      expect(sectionNames).toContain('Computer Networks');
      expect(sectionNames).toContain('General Aptitude');

      // Check total topics (52 topics across CS syllabus)
      const totalTopics = sections.reduce((acc, s) => acc + s.topics.length, 0);
      expect(totalTopics).toBeGreaterThanOrEqual(45);
    });

    it('returns syllabus for Data Science and Artificial Intelligence (DA)', async () => {
      const sections = await GateService.getSyllabus('DA', studentId);
      expect(sections.length).toBeGreaterThanOrEqual(6);

      const sectionNames = sections.map((s) => s.name);
      expect(sectionNames).toContain('Probability & Statistics');
      expect(sectionNames).toContain('Linear Algebra & Calculus');
      expect(sectionNames).toContain('Machine Learning');
      expect(sectionNames).toContain('Artificial Intelligence');
      expect(sectionNames).toContain('General Aptitude');
    });

    it('persists topic completion, confidence rating, revision flag, and student notes', async () => {
      const topicId = 'cs_top_31'; // Virtual memory, page replacement

      const updateRes = await GateService.updateTopicStatus(studentId, topicId, {
        status: 'COMPLETED',
        confidence: 'HIGH',
        revision_flag: true,
        student_notes: 'Important: SRTF and Round Robin tie-breaking rules for GATE 2026.',
      });

      expect(updateRes.success).toBe(true);
      expect(updateRes.data.status).toBe('COMPLETED');
      expect(updateRes.data.confidence).toBe('HIGH');
      expect(updateRes.data.revision_flag).toBe(true);
      expect(updateRes.data.student_notes).toContain('SRTF and Round Robin');

      // Verify progress persists when re-fetching syllabus
      const sections = await GateService.getSyllabus('CS', studentId);
      const osSection = sections.find((s) => s.id === 'cs_sec_08');
      const topic = osSection?.topics.find((t) => t.id === topicId);
      expect(topic?.status).toBe('COMPLETED');
      expect(topic?.confidence).toBe('HIGH');
      expect(topic?.student_notes).toBeDefined();
    });
  });

  describe('3. Question Bank & Official PYQ Sourcing', () => {
    it('retrieves questions filtered by paper, subject, difficulty, and question format', async () => {
      const allCs = await GateService.getQuestions({ paper_code: 'CS' });
      expect(allCs.length).toBeGreaterThanOrEqual(5);

      // Filter by subject
      const osQuestions = await GateService.getQuestions({ paper_code: 'CS', subject: 'Operating Systems' });
      expect(osQuestions.length).toBeGreaterThanOrEqual(1);
      expect(osQuestions.every((q) => q.subject === 'Operating Systems')).toBe(true);

      // Filter by type
      const natQuestions = await GateService.getQuestions({ paper_code: 'CS', question_type: 'NAT' });
      expect(natQuestions.length).toBeGreaterThanOrEqual(1);
      expect(natQuestions.every((q) => q.question_type === 'NAT')).toBe(true);
    });

    it('identifies verified previous-year questions with correct attribution and year', async () => {
      const pyqs = await GateService.getQuestions({ paper_code: 'CS', is_pyq: true });
      expect(pyqs.length).toBeGreaterThanOrEqual(3);

      const gate2024Q = pyqs.find((q) => q.year === 2024);
      expect(gate2024Q).toBeDefined();
      expect(gate2024Q?.source_attribution).toContain('GATE 2024');
      expect(gate2024Q?.is_pyq).toBe(true);
    });

    it('supports bookmarking and un-bookmarking questions for spaced revision', async () => {
      const questionId = 'gate_q_cs_2024_01';

      // Bookmark
      const b1 = await GateService.toggleBookmark(studentId, questionId, 'Review formula for time quantum');
      expect(b1.bookmarked).toBe(true);

      const bookmarks = await GateService.getBookmarks(studentId);
      expect(bookmarks.some((b) => b.question_id === questionId)).toBe(true);

      // Toggle off
      const b2 = await GateService.toggleBookmark(studentId, questionId);
      expect(b2.bookmarked).toBe(false);

      const bookmarksAfter = await GateService.getBookmarks(studentId);
      expect(bookmarksAfter.some((b) => b.question_id === questionId)).toBe(false);
    });
  });

  describe('4. Server-Side Scoring Engine & Rules Evaluation', () => {
    it('evaluates Multiple Choice Question (MCQ) with negative marking', async () => {
      // 1-mark question: correct gives +1, wrong gives -0.33
      // gate_q_cs_2024_01 is 1 mark, correct is B
      const correctEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2024_01', 'B', 45);
      expect(correctEval.is_correct).toBe(true);
      expect(correctEval.marks_awarded).toBe(1);
      expect(correctEval.negative_deducted).toBe(0);

      // Incorrect attempt
      const wrongEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2024_01', 'A', 30);
      expect(wrongEval.is_correct).toBe(false);
      expect(wrongEval.negative_deducted).toBeCloseTo(0.33, 2);

      // 2-mark question: correct gives +2, wrong gives -0.66
      // gate_q_cs_2024_02 is 2 marks, correct is B
      const wrong2Eval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2024_02', 'A', 60);
      expect(wrong2Eval.is_correct).toBe(false);
      expect(wrong2Eval.negative_deducted).toBeCloseTo(0.66, 2);
    });

    it('evaluates Multiple Select Question (MSQ) with exact match and NO negative marks', async () => {
      // gate_q_cs_2023_04 is MSQ, correct is ['A', 'B', 'C']
      // Exact match
      const exactEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2023_04', ['A', 'B', 'C'], 75);
      expect(exactEval.is_correct).toBe(true);
      expect(exactEval.marks_awarded).toBe(2);
      expect(exactEval.negative_deducted).toBe(0);

      // Partial match: in GATE MSQs, partial match yields 0 marks but 0 negative marks
      const partialEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2023_04', ['A', 'B'], 50);
      expect(partialEval.is_correct).toBe(false);
      expect(partialEval.marks_awarded).toBe(0);
      expect(partialEval.negative_deducted).toBe(0);

      // Wrong selection: 0 marks and 0 negative marks
      const wrongEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2023_04', ['A', 'D'], 60);
      expect(wrongEval.is_correct).toBe(false);
      expect(wrongEval.marks_awarded).toBe(0);
      expect(wrongEval.negative_deducted).toBe(0);
    });

    it('evaluates Numerical Answer Type (NAT) with decimal tolerance and NO negative marks', async () => {
      // gate_q_cs_2023_03 is NAT, tolerance is [6, 6] (exact is 6)
      const exactEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2023_03', '6', 90);
      expect(exactEval.is_correct).toBe(true);
      expect(exactEval.marks_awarded).toBe(2);
      expect(exactEval.negative_deducted).toBe(0);

      // Outside tolerance range (10)
      const outEval = await GateService.attemptQuestion(studentId, 'gate_q_cs_2023_03', '10', 70);
      expect(outEval.is_correct).toBe(false);
      expect(outEval.marks_awarded).toBe(0);
      expect(outEval.negative_deducted).toBe(0); // NAT has zero negative marking
    });
  });

  describe('5. Full-Length Mock Test & CBT Simulation Engine', () => {
    it('creates a test session, saves answers, and calculates authoritative server-side score', async () => {
      const test = await GateService.getMockTestById('gate_test_cs_2024_full');
      expect(test).toBeDefined();

      // Start session
      const session = await GateService.startMockTest(studentId, test!.id);
      expect(session).toBeDefined();
      expect(session.status).toBe('IN_PROGRESS');

      // Save user answers
      const answers: Record<string, any> = {};
      answers['gate_q_cs_2024_01'] = { selected_answer: 'B' }; // Correct (+1)
      answers['gate_q_cs_2024_02'] = { selected_answer: 'A' }; // Wrong (B is correct) -> 2 marks, -0.66
      answers['gate_q_cs_2023_03'] = { selected_answer: '6' }; // Correct NAT (+2)
      answers['gate_q_cs_2023_04'] = { selected_answer: ['A', 'B', 'C'] }; // Correct MSQ (+2)

      await GateService.saveMockTestAnswers(session.id, studentId, answers, 7200);

      // Submit test
      const result = await GateService.submitMockTest(session.id, studentId);
      expect(result).toBeDefined();
      expect(result.student_id).toBe(studentId);
      expect(result.test_id).toBe(test!.id);

      // Verify scoring math:
      // Correct marks: 1 + 2 + 2 = 5
      // Negative deducted: 0.66
      // Net total score: 5 - 0.66 = 4.34
      expect(result.correct_count).toBe(3);
      expect(result.incorrect_count).toBe(1);
      expect(result.negative_marks_lost).toBeCloseTo(0.66, 2);
      expect(result.total_marks_obtained).toBeCloseTo(4.34, 2);

      // Verify estimated normalized GATE score (0-1000)
      // No GATE score out of 1000 is invented: it depends on all candidates' marks in the real exam.
      expect(result.estimated_gate_score).toBeUndefined();

      // Verify question reviews contain detailed breakdown
      expect(result.question_reviews.length).toBe(test!.question_ids.length);
      const q1Review = result.question_reviews.find((r) => r.question_id === 'gate_q_cs_2024_01');
      expect(q1Review?.is_correct).toBe(true);
      expect(q1Review?.marks_awarded).toBe(1);

      // Verify subject breakdown exists
      expect(result.subject_breakdown).toBeDefined();
    });

    it('prevents duplicate submissions from corrupting test session results', async () => {
      const test = await GateService.getMockTestById('gate_test_cs_2024_full');
      const session = await GateService.startMockTest(studentId, test!.id);

      // First submission
      const firstResult = await GateService.submitMockTest(session.id, studentId);
      expect(firstResult).toBeDefined();

      // Second submission should return existing result without duplicate calculations
      const secondResult = await GateService.submitMockTest(session.id, studentId);
      expect(secondResult.id).toBe(firstResult.id);
      expect(secondResult.total_marks_obtained).toBe(firstResult.total_marks_obtained);
    });
  });

  describe('6. Study Planner & Daily Tasks', () => {
    it('manages daily study tasks and updates completion status', async () => {
      // Add custom task
      const newTask = await GateService.addStudyTask(studentId, {
        paper_code: 'CS',
        title: 'Practice Algorithms Dynamic Programming PYQs',
        subject: 'Algorithms',
        type: 'PRACTICE',
        date: '2026-10-20',
        duration_minutes: 60,
        notes: 'Target 5 PYQs on Matrix Chain Multiplication',
        is_completed: false,
      });

      expect(newTask.id).toBeDefined();
      expect(newTask.is_completed).toBe(false);

      // Toggle completion
      const toggled = await GateService.toggleStudyTask(studentId, newTask.id);
      expect(toggled?.is_completed).toBe(true);

      // Verify task in list
      const tasks = await GateService.getStudyPlan(studentId, 'CS');
      expect(tasks.some((t) => t.id === newTask.id && t.is_completed)).toBe(true);
    });
  });

  describe('7. Dashboard Diagnostics & Weak Topic Detection', () => {
    it('aggregates real metrics, syllabus progress, and detects weak topics based on errors', async () => {
      const dashboard = await GateService.getDashboard(studentId);
      expect(dashboard).toBeDefined();
      expect(dashboard.paper_info.code).toBe('CS');
      expect(dashboard.profile.student_id).toBe(studentId);

      // Metrics
      expect(dashboard.metrics).toBeDefined();
      expect(dashboard.metrics.total_questions_practiced).toBeGreaterThanOrEqual(0);
      expect(dashboard.metrics.estimated_gate_score).toBeUndefined();

      // Upcoming study tasks
      expect(dashboard.upcoming_tasks).toBeDefined();

      // Weak topics list
      expect(dashboard.weak_topics).toBeDefined();
    });
  });
});
