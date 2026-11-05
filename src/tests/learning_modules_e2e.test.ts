import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { DashboardService } from '../../server/services/dashboard';
import { semesterCommandCenterService } from '../../server/services/semesterCommandCenterService';
import { CourseService } from '../../server/services/courses';
import { NotesService } from '../../server/services/notes';
import { DocumentService } from '../../server/services/documents';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { AgentRegistry } from '../../server/ai/orchestration/registry';
import { AgentRouter } from '../../server/ai/orchestration/router';
import { TaskPlanner } from '../../server/ai/orchestration/planner';
import { MasterAgent } from '../../server/ai/orchestration/master';
import { AgentContext } from '../../server/ai/orchestration/types';

describe('Complete 9 Learning Modules & Multi-Intelligence Agent System E2E Suite', () => {
  const studentId = 'std_01j8k9x2p4';

  const mockAgentContext: AgentContext = {
    student_id: studentId,
    role: 'STUDENT',
    conversation_id: 'conv_learning_modules_test',
    request_id: 'req_lm_01',
    current_course: { id: 'c_dbms_01', name: 'Database Management Systems', code: 'CS301', progress: 75 },
    current_lesson: { id: 'l_indexing_01', title: 'B-Tree & Indexing', topic: 'Indexing' },
  };

  // -------------------------------------------------------------
  // 1. Dashboard Module Inspection & Component Verification
  // -------------------------------------------------------------
  describe('1. Dashboard Module', () => {
    it('retrieves student dashboard with learning progress, streak, and plan items', async () => {
      const data = await DashboardService.getStudentDashboard(studentId);
      expect(data).toBeDefined();
      expect(data.student.id).toBe(studentId);
      // Values are derived from the student's records, so only their consistency is asserted.
      expect(data.summary.streak_days).toBeGreaterThanOrEqual(0);
      expect(data.summary.courses_active).toBeLessThanOrEqual(data.course_progress.length);
      expect(Array.isArray(data.today_plan)).toBe(true);
    });

    it('toggles interactive checklist items on Today Plan', async () => {
      await db.seedTodayPlanIfEmpty(studentId, [
        { id: `task_e2e_${studentId}`, title: 'Revise DSA notes', type: 'notes', estimated_time: '20 min', is_completed: false, action_url: '/notes' },
      ]);
      const dataBefore = await DashboardService.getStudentDashboard(studentId);
      const taskId = dataBefore.today_plan[0].id;
      const initialStatus = dataBefore.today_plan[0].is_completed;

      const updated = await DashboardService.toggleTodayTask(studentId, taskId);
      expect(updated.is_completed).toBe(!initialStatus);

      // Revert back
      await DashboardService.toggleTodayTask(studentId, taskId);
    });
  });

  // -------------------------------------------------------------
  // 2. Semester Command Center Module
  // -------------------------------------------------------------
  describe('2. Semester Command Center Module', () => {
    it('provides semester overview, current week, and credit metrics', () => {
      const overview = semesterCommandCenterService.getOverview();
      expect(overview).toBeDefined();
      expect(overview.config.semester_number).toBeGreaterThanOrEqual(1);
      expect(overview.config.total_teaching_weeks).toBeGreaterThanOrEqual(12);
      expect(overview.subjects.length).toBeGreaterThanOrEqual(1);
      expect(overview.upcoming_events.length).toBeGreaterThanOrEqual(1);
    });

    it('manages subjects, syllabus units, and study stream timeline nodes', () => {
      const subjects = semesterCommandCenterService.getSubjects();
      expect(subjects.length).toBeGreaterThanOrEqual(1);

      const firstSubject = subjects[0];
      expect(firstSubject.units.length).toBeGreaterThanOrEqual(1);

      const studyStream = semesterCommandCenterService.getStudyStream(firstSubject.id);
      expect(studyStream.length).toBeGreaterThanOrEqual(1);
      expect(studyStream[0]).toHaveProperty('title');
      expect(studyStream[0]).toHaveProperty('status');
    });

    it('tracks slip tests, minor examinations, and daily recovery plans', () => {
      const slipTests = semesterCommandCenterService.getSlipTests();
      expect(slipTests.length).toBeGreaterThanOrEqual(1);

      const recoveryPlans = semesterCommandCenterService.getRecoveryPlans();
      expect(recoveryPlans.length).toBeGreaterThanOrEqual(1);

      const todayGuidance = semesterCommandCenterService.getTodayGuidance();
      expect(todayGuidance).toBeDefined();
      expect(todayGuidance.primary_focus).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 3. AI Tutor & Multi-Intelligence Agent System
  // -------------------------------------------------------------
  describe('3. AI Tutor & Multi-Intelligence Orchestration', () => {
    it('verifies all specialized agents are registered and active in AgentRegistry', () => {
      const allAgents = AgentRegistry.getAll();
      expect(allAgents.length).toBeGreaterThanOrEqual(25);

      const requiredAgents = [
        'LearningAgent',
        'CourseAgent',
        'NotesAgent',
        'DocumentRAGAgent',
        'CodingAgent',
        'DSAAgent',
        'QuizAgent',
        'StudyPlannerAgent',
        'DoubtSolverAgent',
        'FlashcardAgent',
        'ExamPreparationAgent',
      ];

      for (const agentName of requiredAgents) {
        expect(AgentRegistry.isEnabled(agentName as any)).toBe(true);
      }
    });

    it('routes domain-specific queries accurately through AgentRouter', () => {
      const tutorIntent = AgentRouter.route(
        'Explain B-Trees and indexing in DBMS with real-world examples',
        mockAgentContext
      );
      expect(tutorIntent.targetAgents.includes('LearningAgent') || tutorIntent.targetAgents.includes('DatabaseAgent')).toBe(true);

      const plannerIntent = AgentRouter.route(
        'Create a 7-day study plan for my Database Management Systems exam',
        mockAgentContext
      );
      expect(plannerIntent.targetAgents).toContain('StudyPlannerAgent');
    });

    it('streams multi-agent response using MasterAgent with plan and completion events', async () => {
      const conv = await db.createConversation(studentId, 'Test Learning Modules Conversation');
      const receivedEvents: string[] = [];

      for await (const event of MasterAgent.runStream(
        studentId,
        conv.id,
        'Explain the differences between B-Tree and B+ Tree indexing'
      )) {
        receivedEvents.push(event.type);
      }

      expect(receivedEvents).toContain('message_start');
      expect(receivedEvents).toContain('agent_plan');
      expect(receivedEvents).toContain('message_delta');
      expect(receivedEvents).toContain('message_complete');
    }, 25000);
  });

  // -------------------------------------------------------------
  // 4. Courses Module
  // -------------------------------------------------------------
  describe('4. Courses Module', () => {
    it('loads course details, syllabus units, and lessons via CourseService', async () => {
      const coursesRes = await CourseService.listCourses({}, studentId);
      expect(coursesRes.items.length).toBeGreaterThanOrEqual(1);

      const firstCourse = await CourseService.getCourse(coursesRes.items[0].id, studentId);
      expect(firstCourse).toBeDefined();
      expect(firstCourse.title).toBeDefined();
      expect(firstCourse.chapters.length).toBeGreaterThanOrEqual(1);
      expect(firstCourse.chapters[0].lessons.length).toBeGreaterThanOrEqual(1);
    });

    it('handles student enrollment and track progression', async () => {
      const coursesRes = await CourseService.listCourses({}, studentId);
      const enrollment = await CourseService.enroll(studentId, coursesRes.items[0].id);
      expect(enrollment).toBeDefined();
      expect(enrollment.student_id).toBe(studentId);
      expect(enrollment.course_id).toBe(coursesRes.items[0].id);
    });
  });

  // -------------------------------------------------------------
  // 5. Notes Module
  // -------------------------------------------------------------
  describe('5. Notes Module', () => {
    it('retrieves student notes and displays structured note content', async () => {
      const notesRes = await NotesService.listNotes(studentId, { limit: 10 });
      expect(notesRes.items.length).toBeGreaterThanOrEqual(1);

      const firstNote = await NotesService.getNote(notesRes.items[0].id, studentId);
      expect(firstNote.title).toBeDefined();
      expect(firstNote.content).toBeDefined();
      expect(firstNote.tags.length).toBeGreaterThanOrEqual(1);
    });

    it('creates a new structured note with tags and course association', async () => {
      const newNote = await NotesService.generateNote(studentId, {
        source_type: 'topic',
        topic: 'B-Tree Invariants & Rebalancing Invariants',
        note_type: 'STUDY_NOTES',
        level: 'INTERMEDIATE',
      });

      expect(newNote.id).toBeDefined();
      expect(newNote.student_id).toBe(studentId);
      expect(newNote.title).toContain('B-Tree');
    });
  });

  // -------------------------------------------------------------
  // 6. Documents Module
  // -------------------------------------------------------------
  describe('6. Documents Module', () => {
    it('retrieves student documents with page boundaries and status', async () => {
      const docsRes = await DocumentService.listDocuments(studentId, {});
      expect(docsRes.items.length).toBeGreaterThanOrEqual(1);

      const doc = docsRes.items[0];
      expect(doc.title).toBeDefined();
      expect(doc.status).toBe('READY');
      expect(doc.page_count).toBeGreaterThanOrEqual(1);
    });

    it('creates and processes a document generating pages and text chunks', async () => {
      const doc = await DocumentService.createDocument(
        studentId,
        {
          filename: 'BTech_Database_Indexing_Chapter.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024 * 500,
          courseTitle: 'Database Management Systems',
          tags: ['B-Tree', 'Indexing', 'DBMS'],
        },
        Buffer.from('PDF sample content discussing B-Tree indexing and search performance.')
      );

      expect(doc).toBeDefined();
      expect(doc.status).toBe('READY');
      expect(doc.page_count).toBeGreaterThanOrEqual(1);

      const pages = await DocumentService.getDocumentPages(doc.id, studentId);
      expect(pages.length).toBeGreaterThanOrEqual(1);
      expect(pages[0]).toHaveProperty('page_number');
    });
  });

  // -------------------------------------------------------------
  // 7. Doubt Solver AI Module
  // -------------------------------------------------------------
  describe('7. Doubt Solver AI Module', () => {
    it('retrieves existing doubts with multi-tier resolution cards', async () => {
      const doubts = await LearningModulesService.getDoubts(studentId);
      expect(doubts.length).toBeGreaterThanOrEqual(1);

      const resolved = doubts.find((d) => d.resolution !== undefined);
      expect(resolved).toBeDefined();
      expect(resolved?.resolution?.direct_answer).toBeDefined();
      expect(resolved?.resolution?.detailed_explanation).toBeDefined();
      expect(resolved?.resolution?.related_concepts.length).toBeGreaterThanOrEqual(1);
    });

    it('creates and resolves a new student doubt with DoubtSolverAgent logic', async () => {
      const created = await LearningModulesService.createDoubt(studentId, {
        title: 'Why do B+ Trees store all actual record pointers in leaf nodes?',
        question_text: 'What is the exact performance advantage of storing values exclusively in the leaves rather than internal nodes?',
        course_name: 'Database Management Systems',
        topic: 'Indexing & Storage',
      });

      expect(created.id).toBeDefined();
      expect(created.status).toBe('RESOLVED');
      expect(created.resolution).toBeDefined();
      expect(created.resolution?.detailed_explanation.length).toBeGreaterThan(20);
      expect(created.resolution?.quiz_question).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 8. Flashcards (Spaced Repetition) Module
  // -------------------------------------------------------------
  describe('8. Flashcards (Spaced Repetition) Module', () => {
    it('loads flashcard decks with mastery tracking and card counts', async () => {
      const decks = await LearningModulesService.getFlashcardDecks(studentId);
      expect(decks.length).toBeGreaterThanOrEqual(1);

      const firstDeck = decks[0];
      expect(firstDeck.title).toBeDefined();
      expect(firstDeck.cards.length).toBeGreaterThanOrEqual(1);
      expect(firstDeck.cards[0]).toHaveProperty('front');
      expect(firstDeck.cards[0]).toHaveProperty('back');
    });

    it('reviews a flashcard and updates spaced repetition mastery state', async () => {
      const decks = await LearningModulesService.getFlashcardDecks(studentId);
      const deck = decks[0];
      const card = deck.cards[0];

      const reviewedCard = await LearningModulesService.reviewFlashcard(
        studentId,
        deck.id,
        card.id,
        4 // Easy confidence
      );

      expect(reviewedCard.confidence).toBe(4);
      expect(reviewedCard.review_count).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------
  // 9. Study Planner AI Module
  // -------------------------------------------------------------
  describe('9. Study Planner AI Module', () => {
    it('loads student study plans and today scheduled agenda tasks', async () => {
      const plans = await LearningModulesService.getStudyPlans(studentId);
      expect(plans.length).toBeGreaterThanOrEqual(1);

      const todayTasks = await LearningModulesService.getTodayTasks(studentId);
      expect(todayTasks.length).toBeGreaterThanOrEqual(1);
      expect(todayTasks[0]).toHaveProperty('title');
      expect(todayTasks[0]).toHaveProperty('duration_minutes');
    });

    it('creates a custom study plan with milestone tasks', async () => {
      const newPlan = await LearningModulesService.createStudyPlan(studentId, {
        title: 'End-Semester DBMS & OS 14-Day Sprint',
        type: 'EXAM',
        description: 'Intensive revision and past-year question paper practice',
        target_date: '2026-11-20',
        total_hours_target: 30,
        tasks: [
          {
            id: 'task_e2e_1',
            plan_id: '',
            student_id: studentId,
            title: 'Master B+ Tree Indexing and Concurrency Control',
            subject: 'Database Management Systems',
            topic: 'Transactions',
            start_time: '10:00 AM',
            duration_minutes: 90,
            status: 'PENDING',
            priority: 'HIGH',
            is_ai_recommended: true,
          },
        ],
      });

      expect(newPlan.id).toBeDefined();
      expect(newPlan.tasks.length).toBe(1);

      // Update task status
      const updated = await LearningModulesService.updateTaskStatus(
        studentId,
        newPlan.id,
        newPlan.tasks[0].id,
        'COMPLETED'
      );

      expect(updated.status).toBe('COMPLETED');
    });
  });
});
