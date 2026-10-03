import { describe, it, expect } from 'vitest';
import { ToolRegistry } from '../../server/ai/tools';
import { PromptService } from '../../server/ai/prompts';

describe('AI Infrastructure & Tool Registry', () => {
  it('registers foundational tools and returns their input schemas', () => {
    const tools = ToolRegistry.getAllTools();
    const names = tools.map((t) => t.name);

    expect(names).toContain('get_student_profile');
    expect(names).toContain('get_student_progress');
    expect(names).toContain('search_courses');
    expect(names).toContain('search_documents');
    expect(names).toContain('analyze_code');
  });

  it('retrieves default engineering system prompt', () => {
    const prompt = PromptService.getPrompt('student_learning_agent');
    expect(prompt).toContain('B.Tech AI Learning Assistant');
  });

  it('executes get_student_profile securely through the registry', async () => {
    const result = await ToolRegistry.execute(
      'get_student_profile',
      {},
      { studentId: 'std_01j8k9x2p4', role: 'STUDENT' }
    );

    expect(result.id).toBe('std_01j8k9x2p4');
    expect(result.email).toBe('student@btech.edu');
    expect(result.role).toBe('STUDENT');
  });
});
