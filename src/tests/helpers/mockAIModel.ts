import { beforeEach, afterEach, vi } from 'vitest';
import { AIService } from '../../../server/ai/service';

// No AI provider is configured in the test environment, and quiz generation no longer invents
// template questions when the model is unavailable. Tests that exercise the quiz pipeline
// (generation → validation → storage → attempts → scoring) therefore use a stubbed model that
// answers quiz prompts with well-formed JSON. Every other prompt goes to the real AIService.
export function quizModelResponse(prompt: string): string | null {
  const m = prompt.match(/(\d+)-question educational assessment on "([^"]+)"/);
  if (!m) return null;
  const count = Number(m[1]);
  const topic = m[2];
  const questions = Array.from({ length: count }, (_, i) => ({
    question_type: 'MCQ',
    question_text: `Stub question ${i + 1} about ${topic}: which option is labelled correct?`,
    options: [`Correct ${i + 1}`, `Distractor A${i + 1}`, `Distractor B${i + 1}`, `Distractor C${i + 1}`],
    correct_answer: `Correct ${i + 1}`,
    explanation: `Stub explanation ${i + 1}: the option labelled correct is the answer for this test question.`,
    difficulty: 'MEDIUM',
    topic_name: topic,
  }));
  return JSON.stringify({ title: `${topic} practice`, description: `Stub quiz on ${topic}`, questions });
}

export function useMockQuizModel(): void {
  const realGenerate = AIService.generate.bind(AIService);
  let spy: { mockRestore: () => void } | undefined;
  beforeEach(() => {
    spy = vi.spyOn(AIService, 'generate').mockImplementation(async (messages: any[], promptKey?: string, temperature?: number) => {
      const prompt = messages.map((m) => m.content).join('\n');
      const text = quizModelResponse(prompt);
      if (text) return { text, provider: 'test-stub', model: 'test-stub' } as any;
      return realGenerate(messages, promptKey, temperature);
    });
  });
  afterEach(() => {
    spy?.mockRestore();
  });
}

/**
 * Phase 3: makes the AI provider look configured and answers every prompt with `responder(prompt)`.
 * Returns the spies so a test can assert what was (or was not) sent to the model.
 */
export function stubModel(responder: (prompt: string) => string) {
  const status = vi.spyOn(AIService, 'getStatus').mockReturnValue({ provider: 'stub', configured: true, model: 'test-stub' });
  const gen = vi.spyOn(AIService, 'generate').mockImplementation(async (messages: any[]) => {
    const prompt = messages.map((m) => m.content).join('\n');
    return { text: responder(prompt), provider: 'test-stub', model: 'test-stub' } as any;
  });
  return { status, gen, restore: () => { status.mockRestore(); gen.mockRestore(); } };
}
