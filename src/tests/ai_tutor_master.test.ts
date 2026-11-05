import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { AgentService } from '../../server/ai/agent';
import { AIService } from '../../server/ai/service';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { QuizGenerationService } from '../../server/services/quizGeneration';
import { NotesService } from '../../server/services/notes';
import { PromptService } from '../../server/ai/prompts';
import { AgentRouter } from '../../server/ai/orchestration/router';

import { useMockQuizModel } from './helpers/mockAIModel';

useMockQuizModel();

describe('AI Academic Tutor - Complete Master System Tests', () => {
  const studentA = 'std_01j8k9x2p4';
  let studentB: any = null;

  it('verifies all 7 Teaching Mode system prompts are registered', () => {
    const modes = [
      'tutor_explain',
      'tutor_step_by_step',
      'tutor_problem_solve',
      'tutor_exam_prep',
      'tutor_coding',
      'tutor_interview',
      'tutor_revision',
    ];

    for (const key of modes) {
      const prompt = PromptService.getPrompt(key);
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(50);
    }
  });

  it('routes explicit teaching modes to specialized agent pipelines', () => {
    const dummyContext: any = { student_id: studentA, role: 'STUDENT' };

    const explainRoute = AgentRouter.route('AVL tree balancing', dummyContext, 'EXPLAIN');
    expect(explainRoute.intent).toBe('CONCEPT_EXPLANATION');

    const stepRoute = AgentRouter.route('Teach me dynamic programming', dummyContext, 'STEP_BY_STEP');
    expect(stepRoute.intent).toBe('STEP_BY_STEP_TUTORING');

    const solveRoute = AgentRouter.route('Calculate EMAT with TLB', dummyContext, 'SOLVE');
    expect(solveRoute.intent).toBe('PROBLEM_SOLVING');

    const examRoute = AgentRouter.route('Prepare me for OS midterm', dummyContext, 'EXAM_PREP');
    expect(examRoute.intent).toBe('EXAM_PREPARATION_WORKFLOW');

    const codingRoute = AgentRouter.route('Debug this python loop', dummyContext, 'CODING');
    expect(codingRoute.intent).toBe('CODE_DEBUG_AND_REVIEW');

    const interviewRoute = AgentRouter.route('System design trade-offs', dummyContext, 'INTERVIEW');
    expect(interviewRoute.intent).toBe('TECHNICAL_INTERVIEW_PREP');

    const revisionRoute = AgentRouter.route('Spaced review of algorithms', dummyContext, 'REVISION');
    expect(revisionRoute.intent).toBe('ACTIVE_REVISION_TUTORING');
  });

  it('creates and lists conversations with persistence across sessions', async () => {
    const title = 'Operating Systems Concurrency Session';
    const conv = await db.createConversation(studentA, title);
    expect(conv.id).toBeDefined();
    expect(conv.title).toBe(title);

    const list = await db.getConversationsByStudentId(studentA);
    expect(list.some((c) => c.id === conv.id)).toBe(true);

    const fetched = await db.getConversationById(conv.id, studentA);
    expect(fetched?.id).toBe(conv.id);
  });

  it('enforces strict student isolation (IDOR protection) on conversations', async () => {
    studentB = await db.createStudent({
      name: 'Priya Sundaram',
      email: 'priya.sundaram@btech.edu',
      password_hash: 'secret_hash',
      branch: 'Electrical Engineering',
      semester: 4,
      role: 'STUDENT',
      is_active: true,
    });

    const convB = await db.createConversation(studentB.id, "Priya's Private EEE Session");
    expect(convB.id).toBeDefined();

    // Student A must NOT be able to access Student B's conversation
    await expect(db.getConversationById(convB.id, studentA)).rejects.toThrow();

    // Student A must NOT be able to delete Student B's conversation
    await expect(db.deleteConversation(convB.id, studentA)).rejects.toThrow();

    // Student B can access their own conversation
    const priyaConv = await db.getConversationById(convB.id, studentB.id);
    expect(priyaConv?.title).toBe("Priya's Private EEE Session");
  });

  it('executes multi-turn conversation preserving context across follow-up turns', async () => {
    const conv = await db.createConversation(studentA, 'Multi-Turn Context Drill');

    // Turn 1: Ask initial concept question
    await db.addMessageToConversation(conv.id, studentA, {
      conversation_id: conv.id,
      role: 'user',
      content: 'Explain Binary Search Tree property and time complexity',
    });

    const eventsTurn1: any[] = [];
    for await (const event of AgentService.runAgentStream(
      studentA,
      conv.id,
      'Explain Binary Search Tree property and time complexity'
    )) {
      eventsTurn1.push(event);
    }

    const complete1 = eventsTurn1.find((e) => e.type === 'message_complete');
    expect(complete1).toBeDefined();
    expect(complete1.data.message.content.length).toBeGreaterThan(10);

    // Turn 2: Ask follow-up referring to previous turn
    await db.addMessageToConversation(conv.id, studentA, {
      conversation_id: conv.id,
      role: 'user',
      content: 'How does an AVL tree rotation maintain this invariant in O(1) time?',
    });

    const eventsTurn2: any[] = [];
    for await (const event of AgentService.runAgentStream(
      studentA,
      conv.id,
      'How does an AVL tree rotation maintain this invariant in O(1) time?'
    )) {
      eventsTurn2.push(event);
    }

    const complete2 = eventsTurn2.find((e) => e.type === 'message_complete');
    expect(complete2).toBeDefined();

    // Verify messages persist in sequence
    const messages = await db.getMessagesByConversationId(conv.id, studentA);
    expect(messages.length).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
    expect(messages[2].role).toBe('user');
    expect(messages[3].role).toBe('assistant');
  });

  it('supports course and lesson context injection with verifiable citations', async () => {
    const conv = await db.createConversation(studentA, 'Course Context Session');

    // Ingest CS401 course context
    const events: any[] = [];
    for await (const event of AgentService.runAgentStream(
      studentA,
      conv.id,
      'What are the unit chapters and core exam topics in this course?',
      { courseId: 'crs_cat_001', mode: 'EXAM_PREP' }
    )) {
      events.push(event);
    }

    const complete = events.find((e) => e.type === 'message_complete');
    expect(complete).toBeDefined();
    expect(complete.data.message.metadata.citations.length).toBeGreaterThanOrEqual(1);
    expect(complete.data.message.metadata.citations.some((c: any) => c.source.includes('COURSE') || c.source.includes('course'))).toBe(true);
  });

  it('generates and persists active recall flashcards through Flashcards service', async () => {
    const deck = await LearningModulesService.createFlashcardDeck(studentA, {
      title: 'Operating Systems Concurrency Invariants',
      subject: 'Operating Systems',
      description: 'AI Tutor generated deck for process synchronization',
      cards: [
        {
          front: 'What are the 4 conditions necessary for deadlock?',
          back: '1. Mutual Exclusion 2. Hold and Wait 3. No Preemption 4. Circular Wait',
          type: 'CONCEPT',
          topic: 'Deadlock',
        },
        {
          front: 'Why does Banker’s Algorithm verify state safety?',
          back: 'It checks if a valid execution sequence exists where all processes can finish without deadlock.',
          type: 'DEFINITION',
          topic: 'Deadlock Avoidance',
        },
      ],
      source_type: 'AI_TUTOR',
    });

    expect(deck.id).toBeDefined();
    expect(deck.cards.length).toBe(2);
    expect(deck.cards[0].front).toContain('deadlock');

    const retrieved = await LearningModulesService.getFlashcardDeckById(studentA, deck.id);
    expect(retrieved.title).toBe('Operating Systems Concurrency Invariants');
  });

  it('generates diagnostic practice quizzes through Quiz service', async () => {
    const quizResult = await QuizGenerationService.generateQuiz(studentA, {
      source_type: 'TOPIC',
      topic: 'Virtual Memory & Page Replacement',
      difficulty: 'MEDIUM',
      question_count: 2,
    });

    expect(quizResult.quiz).toBeDefined();
    expect(quizResult.quiz.id).toBeDefined();
    expect(quizResult.questions.length).toBe(2);
    expect(quizResult.questions[0].options!.length).toBeGreaterThanOrEqual(2);
    expect(quizResult.questions[0].explanation).toBeDefined();
  });

  it('generates and persists study notes through Notes service', async () => {
    const note = await NotesService.createManualNote(studentA, {
      title: 'Process Synchronization Invariants',
      content: '## Critical Section Problem\n\n1. **Mutual Exclusion**: If process Pi is executing in its critical section, no other processes can be executing.\n2. **Progress**: Selection of next process cannot be postponed indefinitely.\n3. **Bounded Waiting**: Bound exists on number of times other processes are allowed to enter.',
      tags: ['Operating Systems'],
    });

    expect(note.id).toBeDefined();
    expect(note.title).toBe('Process Synchronization Invariants');

    const fetched = await NotesService.getNote(note.id, studentA);
    expect(fetched.content).toContain('Mutual Exclusion');
  });

  it('creates milestone study tasks through Study Planner service', async () => {
    const plan = await LearningModulesService.createStudyPlan(studentA, {
      title: 'Operating Systems Midterm Mastery Plan',
      description: 'Scheduled from AI Academic Tutor session',
      type: 'EXAM',
      target_date: '2026-11-15',
      total_hours_target: 12,
      tasks: [
        {
          title: 'Review Concurrency Invariants & Semaphores',
          subject: 'Operating Systems',
          target_date: '2026-11-10',
          estimated_minutes: 60,
          priority: 'HIGH',
        } as any,
      ],
    });

    expect(plan.id).toBeDefined();
    expect(plan.title).toBe('Operating Systems Midterm Mastery Plan');
    expect(plan.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('records user feedback (helpful / unhelpful) and reasons on messages', async () => {
    const convs = await db.getConversationsByStudentId(studentA);
    const msgs = await db.getMessagesByConversationId(convs[0].id, studentA);
    const assistantMsg = msgs.find((m) => m.role === 'assistant');

    expect(assistantMsg).toBeDefined();
    if (assistantMsg) {
      const fb = await db.recordFeedback(studentA, assistantMsg.id, true);
      expect(fb.is_helpful).toBe(true);

      const updatedMsgs = await db.getMessagesByConversationId(convs[0].id, studentA);
      const updatedAssMsg = updatedMsgs.find((m) => m.id === assistantMsg.id);
      expect(updatedAssMsg?.metadata?.feedback?.is_helpful).toBe(true);
    }
  });

  it('allows renaming, pinning, archiving, and deleting conversations with ownership checks', async () => {
    const conv = await db.createConversation(studentA, 'Temporary Session');

    // Rename
    const renamed = await db.updateConversation(conv.id, studentA, { title: 'Renamed Session' });
    expect(renamed.title).toBe('Renamed Session');

    // Pin
    const pinned = await db.updateConversation(conv.id, studentA, { is_pinned: true });
    expect(pinned.is_pinned).toBe(true);

    // Archive
    const archived = await db.updateConversation(conv.id, studentA, { is_archived: true });
    expect(archived.is_archived).toBe(true);

    // Delete
    const deleted = await db.deleteConversation(conv.id, studentA);
    expect(deleted).toBe(true);

    // Verification: Cannot fetch deleted conversation
    const fetched = await db.getConversationById(conv.id, studentA);
    expect(fetched).toBeNull();
  });
});
