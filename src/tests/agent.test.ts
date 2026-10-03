import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database';
import { ToolRegistry } from '../../server/ai/tools';
import { AgentService } from '../../server/ai/agent';

describe('Phase 3 AI Learning Agent & Tool Orchestration', () => {
  const studentId = 'std_01j8k9x2p4';

  it('lists existing conversations for authenticated student', async () => {
    const convs = await db.getConversationsByStudentId(studentId);
    expect(convs.length).toBeGreaterThanOrEqual(1);
    expect(convs.some((c) => c.title.includes('Binary Search Trees'))).toBe(true);
  });

  it('enforces conversation data isolation: student cannot access another student conversations', async () => {
    // Create new student
    const studentB = await db.createStudent({
      name: 'Rohan Sharma',
      email: 'rohan@btech.edu',
      password_hash: 'hashed',
      branch: 'Computer Science',
      semester: 4,
      role: 'STUDENT',
      is_active: true,
    });

    // Create conversation for student B
    const convB = await db.createConversation(studentB.id, "Rohan's Private Session");

    // Student A cannot access Student B's conversation
    await expect(db.getConversationById(convB.id, studentId)).rejects.toThrow();

    // Student B can access their own conversation
    const fetched = await db.getConversationById(convB.id, studentB.id);
    expect(fetched?.title).toBe("Rohan's Private Session");
  });

  it('creates, updates, and deletes conversations', async () => {
    const conv = await db.createConversation(studentId, 'Test Algorithm Session');
    expect(conv.id).toBeDefined();

    const updated = await db.updateConversation(conv.id, studentId, {
      title: 'Renamed Session',
      is_pinned: true,
    });
    expect(updated.title).toBe('Renamed Session');
    expect(updated.is_pinned).toBe(true);

    const deleted = await db.deleteConversation(conv.id, studentId);
    expect(deleted).toBe(true);
  });

  it('executes tool registry read-only tools securely with schema validation', async () => {
    const progress = await ToolRegistry.execute(
      'get_dsa_progress',
      {},
      { studentId, role: 'STUDENT' }
    );

    expect(progress.solvedCount).toBeGreaterThanOrEqual(100);
    expect(progress.topics).toBeDefined();
  });

  it('executes AI generation tools (generate_quiz)', async () => {
    const quiz = await ToolRegistry.execute(
      'generate_quiz',
      { topic: 'AVL Trees', questionCount: 2 },
      { studentId, role: 'STUDENT' }
    );

    expect(quiz.topic).toBe('AVL Trees');
    expect(quiz.questions.length).toBe(2);
    expect(quiz.questions[0].options.length).toBe(4);
  });

  it('runs AgentService stream generator and produces events', async () => {
    const conv = await db.createConversation(studentId, 'Agent Test Run');
    const events: string[] = [];

    for await (const event of AgentService.runAgentStream(
      studentId,
      conv.id,
      'Explain binary search trees and show my weak DSA topics'
    )) {
      events.push(event.type);
    }

    expect(events).toContain('message_start');
    expect(events).toContain('agent_plan');
    expect(events).toContain('tool_start');
    expect(events).toContain('tool_result');
    expect(events).toContain('message_delta');
    expect(events).toContain('message_complete');
  }, 15000);

  it('records helpful and not helpful feedback for messages', async () => {
    const convs = await db.getConversationsByStudentId(studentId);
    const msgs = await db.getMessagesByConversationId(convs[0].id, studentId);
    const assistantMsg = msgs.find((m) => m.role === 'assistant');

    if (assistantMsg) {
      const fb = await db.recordFeedback(studentId, assistantMsg.id, true, 'Clear mathematical explanation');
      expect(fb.is_helpful).toBe(true);
      expect(fb.reason).toBe('Clear mathematical explanation');
    }
  });

  it('retrieves dynamic student learning context', async () => {
    const context = await db.getStudentLearningContext(studentId);
    expect(context.student.name).toBe('Pavan Kalyan V.');
    expect(context.current_course.name).toBeDefined();
    expect(context.current_lesson.title).toBeDefined();
    expect(context.recent_topics.length).toBeGreaterThan(0);
    expect(context.suggested_actions.length).toBeGreaterThan(0);
  });
});
