// Phase 2 › Batch 4: Quiz, GATE and Exam Preparation over HTTP. Synthetic students only.
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { startTestApi, TestApi } from './helpers/httpApp';
import { AIService } from '../../server/ai/service';
import { db } from '../../server/db/database';

let api: TestApi;
beforeAll(async () => {
  api = await startTestApi();
});
afterAll(async () => {
  await api.close();
});
afterEach(() => vi.restoreAllMocks());

const QUESTIONS = [
  { question_text: '2 + 2 = ?', question_type: 'MCQ', options: ['3', '4', '5', '6'], correct_answer: '4' },
  { question_text: 'TCP is connection-oriented.', question_type: 'TRUE_FALSE', options: ['True', 'False'], correct_answer: 'True' },
  { question_text: 'Which layer does IP belong to?', question_type: 'MCQ', options: ['Transport', 'Network', 'Session', 'Physical'], correct_answer: 'Network' },
];

describe('Phase 2 › Batch 4 › Quiz', () => {
  it('answers stay hidden until submission, scoring is server-side, and other students cannot read the quiz', async () => {
    const A = await api.register('quiz-a');
    const B = await api.register('quiz-b');
    const created = await api.call('POST', '/quiz', A.token, { title: 'Networks basics', source_type: 'TOPIC', questions: QUESTIONS });
    expect(created.status).toBe(201);
    const quizId = created.body.data.id;

    expect((await api.call('GET', `/quiz/${quizId}`, B.token)).status).toBe(404);
    expect((await api.call('GET', `/quiz/${quizId}/questions`, B.token)).status).toBe(404);
    expect((await api.call('POST', `/quiz/${quizId}/start`, B.token, {})).status).toBe(403);

    const start = await api.call('POST', `/quiz/${quizId}/start`, A.token, {});
    expect(JSON.stringify(start.body)).not.toContain('correct_answer');
    const attemptId = start.body.data.attempt.id;
    const qs = (await api.call('GET', `/quiz/${quizId}/questions`, A.token)).body.data;
    expect(JSON.stringify(qs)).not.toContain('correct_answer');

    // Review before submitting would reveal the answers, so it is refused.
    const early = await api.call('GET', `/quiz/attempts/${attemptId}/review`, A.token);
    expect(early.status).toBe(400);
    expect(JSON.stringify(early.body)).not.toContain('correct_answer');

    // The explanation endpoint also contains the answer: refused mid-attempt and for other students.
    const explainEarly = await api.call('POST', '/quiz/explain-answer', A.token, { question_id: qs[0].id, student_answer: '3' });
    expect(explainEarly.status).toBe(400);
    expect(JSON.stringify(explainEarly.body)).not.toContain('"4"');
    expect((await api.call('POST', '/quiz/explain-answer', B.token, { question_id: qs[0].id })).status).toBe(404);

    // The client cannot set its own score.
    const submit = await api.call('POST', `/quiz/attempts/${attemptId}/submit`, A.token, {
      answers: { [qs[0].id]: '4', [qs[1].id]: 'False' },
      score: 100,
      correct_count: 3,
    });
    expect(submit.status).toBe(200);
    expect(submit.body.data).toMatchObject({ correct_count: 1, incorrect_count: 1, unanswered_count: 1 });
    expect((await api.call('POST', `/quiz/attempts/${attemptId}/submit`, A.token, { answers: {} })).status).toBe(400);
    expect((await api.call('GET', `/quiz/attempts/${attemptId}/review`, B.token)).status).toBe(403);
    const review = await api.call('GET', `/quiz/attempts/${attemptId}/review`, A.token);
    expect(review.status).toBe(200);
    expect(JSON.stringify(review.body)).toContain('correct_answer');
    const explain = await api.call('POST', '/quiz/explain-answer', A.token, { question_id: qs[0].id, student_answer: '3' });
    expect(explain.status).toBe(200);
    expect(explain.body.data.why_correct).toContain('4');
    expect((await api.call('POST', '/quiz/explain-answer', B.token, { question_id: qs[0].id })).status).toBe(404);
  });

  it('AI quiz generation returns 503 without a model and never sends answers with the new quiz', async () => {
    const A = await api.register('quiz-gen');
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({ text: '**AI unavailable.** No model configured.' } as any);
    expect((await api.call('POST', '/quiz/generate', A.token, { topic: 'Deadlocks', question_count: 3 })).status).toBe(503);
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({
      text: JSON.stringify({
        title: 'Deadlocks',
        questions: [
          { question_type: 'MCQ', question_text: 'Which condition is NOT required for deadlock?', options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'], correct_answer: 'Preemption', explanation: 'No preemption is the required condition.', difficulty: 'MEDIUM' },
        ],
      }),
    } as any);
    const gen = await api.call('POST', '/quiz/generate', A.token, { topic: 'Deadlocks', question_count: 1 });
    expect(gen.status).toBe(201);
    expect(gen.body.data.questions.length).toBeGreaterThan(0);
    expect(JSON.stringify(gen.body.data.questions)).not.toMatch(/correct_answer|explanation/);
  });
});

describe('Phase 2 › Batch 4 › GATE', () => {
  it('question bank hides the key, unanswered is not penalised, negative marking applies to wrong MCQs only', async () => {
    const A = await api.register('gate-a');
    const list = await api.call('GET', '/gate/questions?paper_code=CS', A.token);
    expect(list.status).toBe(200);
    expect(JSON.stringify(list.body.data)).not.toMatch(/correct_answer|"explanation"/);
    const mcq = (await db.getGateQuestions({ paper_code: 'CS' })).find((q: any) => q.question_type === 'MCQ' && q.negative_marks > 0)!;
    expect((await api.call('POST', `/gate/questions/${mcq.id}/attempt`, A.token, { selected_answer: '' })).status).toBe(400);
    const wrongOpt = mcq.options!.find((o: any) => o.id !== mcq.correct_answer)!.id;
    const wrong = await api.call('POST', `/gate/questions/${mcq.id}/attempt`, A.token, { selected_answer: wrongOpt });
    expect(wrong.body.data).toMatchObject({ is_correct: false, negative_deducted: mcq.negative_marks });
    expect(wrong.body.data.correct_answer).toBe(mcq.correct_answer); // revealed only after answering
    expect((await api.call('POST', '/gate/questions/nope/attempt', A.token, { selected_answer: 'A' })).status).toBe(404);

    // Bookmarking before answering must not reveal the key either.
    const other = (await db.getGateQuestions({ paper_code: 'CS' })).find((q: any) => q.id !== mcq.id)!;
    await api.call('POST', `/gate/questions/${other.id}/bookmark`, A.token, {});
    const bm = await api.call('GET', '/gate/bookmarks', A.token);
    expect(bm.body.data.some((b: any) => b.question_id === other.id)).toBe(true);
    expect(JSON.stringify(bm.body.data)).not.toMatch(/correct_answer|"explanation"/);
  });

  it('mock tests report raw marks without an invented GATE score, and sessions are private', async () => {
    const A = await api.register('gate-m');
    const B = await api.register('gate-n');
    const start = await api.call('POST', '/gate/tests/gate_test_cs_2024_full/start', A.token, {});
    expect(start.status).toBe(200);
    const session = start.body.data;
    expect((await api.call('PUT', `/gate/sessions/${session.id}/answers`, B.token, { answers: {}, remaining_seconds: 10 })).status).toBe(403);
    const test = await db.getGateMockTestById('gate_test_cs_2024_full');
    const qs = await Promise.all(test!.question_ids.map((id: string) => db.getGateQuestionById(id)));
    const firstMcq = qs.find((q: any) => q.question_type === 'MCQ')!;
    const answers = { [firstMcq.id]: { question_id: firstMcq.id, selected_answer: firstMcq.options!.find((o: any) => o.id !== firstMcq.correct_answer)!.id, status: 'ANSWERED' } };
    expect((await api.call('PUT', `/gate/sessions/${session.id}/answers`, A.token, { answers, remaining_seconds: 99999 })).status).toBe(200);
    const result = await api.call('POST', `/gate/sessions/${session.id}/submit`, A.token, {});
    expect(result.status).toBe(200);
    expect(result.body.data.estimated_gate_score).toBeUndefined();
    expect(result.body.data.total_marks_obtained).toBe(-firstMcq.negative_marks); // raw marks can be negative
    expect(result.body.data.unattempted_count).toBe(test!.question_ids.length - 1);
    // After submission no more answers are accepted.
    expect((await api.call('PUT', `/gate/sessions/${session.id}/answers`, A.token, { answers, remaining_seconds: 1 })).status).toBe(400);
  });

  it('answers sent after the time limit are refused by the server', async () => {
    const A = await api.register('gate-t');
    const start = await api.call('POST', '/gate/tests/gate_test_cs_os_speed/start', A.token, {});
    const s = await db.getGateTestSession(start.body.data.id, A.id);
    (s as any).start_time = new Date(Date.now() - (s!.duration_minutes * 60 + 600) * 1000).toISOString();
    const late = await api.call('PUT', `/gate/sessions/${s!.id}/answers`, A.token, { answers: {}, remaining_seconds: 3000 });
    expect(late.status).toBe(400);
    expect(late.body.message).toMatch(/Time is up/);
  });

  it('a new profile has no invented exam date or goals; the dashboard has no estimated score; the AI tutor is honest', async () => {
    const A = await api.register('gate-p');
    const profile = (await api.call('GET', '/gate/profile', A.token)).body.data;
    expect(profile.target_date).toBeFalsy();
    expect(profile.air_goal).toBeFalsy();
    expect(profile.target_score).toBeUndefined();
    const dash = (await api.call('GET', '/gate/dashboard', A.token)).body.data;
    expect(dash.metrics.estimated_gate_score).toBeUndefined();
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({ text: '**AI unavailable.** No model configured.' } as any);
    expect((await api.call('POST', '/gate/ai-tutor', A.token, { prompt: 'Explain EMAT', mode: 'CONCEPT' })).status).toBe(503);
  });
});

describe('Phase 2 › Batch 4 › Exam Preparation', () => {
  it('exams need a real date and syllabus, start at 0% readiness, and readiness follows the student\'s confidence', async () => {
    const A = await api.register('exam-a');
    const B = await api.register('exam-b');
    expect((await api.call('POST', '/exams', A.token, { title: 'OS End Sem', subject: 'Operating Systems', syllabus: 'Scheduling' })).status).toBe(400);
    expect((await api.call('POST', '/exams', A.token, { title: 'OS End Sem', subject: 'Operating Systems', exam_date: '2026-12-01' })).status).toBe(400);
    const created = await api.call('POST', '/exams', A.token, {
      title: 'OS End Sem', subject: 'Operating Systems', exam_date: '2026-12-01', available_prep_hours: 20,
      syllabus: 'Scheduling, Deadlocks, Paging, File Systems',
    });
    expect(created.status).toBe(201);
    const exam = created.body.data;
    expect(exam.readiness_score).toBe(0);
    expect(exam.topics.map((t: any) => t.confidence)).toEqual(['WEAK', 'WEAK', 'WEAK', 'WEAK']);
    expect(exam.topics.every((t: any) => t.subtopics.length === 0)).toBe(true);

    const up1 = await api.call('PATCH', `/exams/${exam.id}/topics/${exam.topics[0].id}`, A.token, { confidence: 'STRONG' });
    expect(up1.body.data.readiness_score).toBe(25);
    const up2 = await api.call('PATCH', `/exams/${exam.id}/topics/${exam.topics[1].id}`, A.token, { confidence: 'DEVELOPING', status: 'IN_PROGRESS' });
    expect(up2.body.data.readiness_score).toBe(38); // (1 + 0.5) / 4
    expect((await api.call('PATCH', `/exams/${exam.id}/topics/${exam.topics[1].id}`, A.token, { confidence: 'GENIUS' })).status).toBe(400);
    expect((await api.call('PATCH', `/exams/${exam.id}/topics/${exam.topics[1].id}`, B.token, { confidence: 'STRONG' })).status).toBe(404);
    expect((await api.call('GET', '/exams', B.token)).body.data).toEqual([]);
    expect((await api.call('DELETE', `/exams/${exam.id}`, B.token)).status).toBe(404);
    expect((await api.call('DELETE', `/exams/${exam.id}`, A.token)).status).toBe(200);
  });
});
