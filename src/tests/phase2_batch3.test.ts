// Phase 2 › Batch 3: System Design, Lab Assistant and Viva over HTTP. Synthetic students only.
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { startTestApi, TestApi } from './helpers/httpApp';
import { AIService } from '../../server/ai/service';

let api: TestApi;
beforeAll(async () => {
  api = await startTestApi();
});
afterAll(async () => {
  await api.close();
});
afterEach(() => vi.restoreAllMocks());

const unavailable = () => vi.spyOn(AIService, 'generate').mockResolvedValue({ text: '**AI unavailable.** No model configured.' } as any);

async function labWithExperiment(token: string) {
  const lab = await api.call('POST', '/labs', token, { name: 'Operating Systems Lab', subject: 'Operating Systems', semester: 5 });
  expect(lab.status).toBe(201);
  const exp = await api.call('POST', `/labs/${lab.body.data.id}/experiments`, token, {
    title: 'FCFS scheduling',
    aim: 'Simulate first come first served CPU scheduling',
    expected_output: 'Average waiting time: 17',
    procedure: ['Read burst times', 'Compute waiting times', 'Print averages'],
    viva_questions: [{ id: 'vq_fcfs', question: 'What is the convoy effect?', expected_concept: 'Short processes wait behind a long CPU-bound process in FCFS scheduling.' }],
  });
  expect(exp.status).toBe(201);
  return { labId: lab.body.data.id as string, expId: exp.body.data.id as string };
}

describe('Phase 2 › Batch 3 › Lab Assistant and Viva', () => {
  it('a new student sees no labs, and nobody else can read, overwrite or evaluate another student\'s lab', async () => {
    const A = await api.register('lab-a');
    const B = await api.register('lab-b');
    expect((await api.call('GET', '/labs', B.token)).body.data).toEqual([]);

    const { labId, expId } = await labWithExperiment(A.token);
    const listA = await api.call('GET', '/labs', A.token);
    expect(listA.body.data).toHaveLength(1);
    expect(listA.body.data[0].experiments_count).toBe(1);
    expect((await api.call('GET', '/labs', B.token)).body.data).toEqual([]);
    expect((await api.call('GET', `/labs/${labId}`, B.token)).status).toBe(404);
    expect((await api.call('GET', `/labs/${labId}/experiments/${expId}`, B.token)).status).toBe(404);
    expect((await api.call('POST', `/labs/${labId}/experiments/${expId}/viva/vq_fcfs`, B.token, { student_answer: 'x' })).status).toBe(404);

    // B tries to overwrite A's experiment by sending its id into B's own lab.
    const labB = await api.call('POST', '/labs', B.token, { name: 'B Lab', subject: 'Networks', semester: 5 });
    const hijack = await api.call('POST', `/labs/${labB.body.data.id}/experiments`, B.token, { id: expId, title: 'hijacked' });
    expect(hijack.status).toBe(201);
    expect(hijack.body.data.id).not.toBe(expId);
    const stillA = await api.call('GET', `/labs/${labId}/experiments/${expId}`, A.token);
    expect(stillA.status).toBe(200);
    expect(stillA.body.data.title).toBe('FCFS scheduling');
  });

  it('viva feedback without a model is a labelled keyword check, and an empty answer is rejected', async () => {
    const A = await api.register('viva-a');
    const { labId, expId } = await labWithExperiment(A.token);
    const empty = await api.call('POST', `/labs/${labId}/experiments/${expId}/viva/vq_fcfs/evaluate`, A.token, { student_answer: '  ' });
    expect(empty.status).toBe(400);
    const r = await api.call('POST', `/labs/${labId}/experiments/${expId}/viva/vq_fcfs/evaluate`, A.token, {
      student_answer: 'In FCFS scheduling, short processes wait behind one long process.',
    });
    expect(r.status).toBe(200);
    expect(r.body.data.ai_evaluation.method).toBe('KEYWORD_MATCH');
    expect(r.body.data.ai_evaluation.correctness).toMatch(/Keyword check/);
    // The answer and the evaluation are saved on the experiment.
    const exp = await api.call('GET', `/labs/${labId}/experiments/${expId}`, A.token);
    expect(exp.body.data.viva_questions[0].student_answer).toMatch(/FCFS/);
  });

  it('AI viva generation, doubt solving and manual extraction return 503 and save nothing without a model', async () => {
    const A = await api.register('labai-a');
    const { labId, expId } = await labWithExperiment(A.token);
    unavailable();
    const gen = await api.call('POST', `/labs/${labId}/experiments/${expId}/viva/generate`, A.token, { count: 2 });
    expect(gen.status).toBe(503);
    const doubt = await api.call('POST', `/labs/${labId}/experiments/${expId}/doubt`, A.token, { doubt: 'Why is my waiting time negative?' });
    expect(doubt.status).toBe(503);
    const extract = await api.call('POST', `/labs/${labId}/extract-ai`, A.token, { raw_text: 'Experiment 1: FCFS. Aim: simulate.' });
    expect(extract.status).toBe(503);
    const exp = await api.call('GET', `/labs/${labId}/experiments/${expId}`, A.token);
    expect(exp.body.data.viva_questions).toHaveLength(1);
    const history = await api.call('GET', `/labs/${labId}/experiments/${expId}/doubt`, A.token);
    expect(history.body.data).toEqual([]);
  });

  it('with a model, viva generation saves the parsed questions and doubts save both messages', async () => {
    const A = await api.register('labai-b');
    const { labId, expId } = await labWithExperiment(A.token);
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({
      text: JSON.stringify({ questions: [{ question: 'Why can FCFS starve short jobs?', expected_concept: 'Convoy effect', difficulty: 'BASIC' }] }),
    } as any);
    const gen = await api.call('POST', `/labs/${labId}/experiments/${expId}/viva/generate`, A.token, { count: 1 });
    expect(gen.status).toBe(200);
    expect(gen.body.data[0].question).toMatch(/starve/);
    vi.spyOn(AIService, 'generate').mockResolvedValueOnce({ text: 'Check that waiting time starts at 0 for the first process.' } as any);
    const doubt = await api.call('POST', `/labs/${labId}/experiments/${expId}/doubt`, A.token, { doubt: 'Why is my waiting time negative?' });
    expect(doubt.status).toBe(200);
    const history = await api.call('GET', `/labs/${labId}/experiments/${expId}/doubt`, A.token);
    expect(history.body.data.map((m: any) => m.sender)).toEqual(['student', 'assistant']);
  });

  it('the lab report never presents the expected output or a default conclusion as the student\'s result', async () => {
    const A = await api.register('report-a');
    const { labId, expId } = await labWithExperiment(A.token);
    const report = await api.call('POST', `/labs/${labId}/experiments/${expId}/report`, A.token, {});
    expect(report.status).toBe(200);
    expect(report.body.data.expected_output).toBe('Average waiting time: 17');
    expect(report.body.data.actual_output).toBe('');
    expect(report.body.data.result_conclusion).toBe('');
    // A second experiment without a report does not get the first one's report.
    const exp2 = await api.call('POST', `/labs/${labId}/experiments`, A.token, { title: 'SJF scheduling' });
    const r2 = await api.call('GET', `/labs/${labId}/experiments/${exp2.body.data.id}/report`, A.token);
    expect(r2.body.data.experiment_id).toBe(exp2.body.data.id);
  });
});

describe('Phase 2 › Batch 3 › System Design', () => {
  it('interview sessions are private, scored from notes, and the AI tutor is honest about availability', async () => {
    const A = await api.register('sd-a');
    const B = await api.register('sd-b');
    expect((await api.call('GET', '/system-design/interviews')).status).toBe(401);
    const start = await api.call('POST', '/system-design/interviews', A.token, { challenge_id: 'sd_url_shortener' });
    expect(start.status).toBe(201);
    const id = start.body.data.id;
    expect((await api.call('GET', `/system-design/interviews/${id}`, B.token)).status).toBe(404);
    expect((await api.call('POST', `/system-design/interviews/${id}/responses`, B.token, { step: 'REQUIREMENTS_CLARIFICATION', notes: 'x' })).status).toBe(404);
    const skip = await api.call('POST', `/system-design/interviews/${id}/responses`, A.token, { step: 'FINAL_SUMMARY', notes: 'done' });
    expect(skip.status).toBe(400);
    const step1 = await api.call('POST', `/system-design/interviews/${id}/responses`, A.token, { step: 'REQUIREMENTS_CLARIFICATION', notes: 'users can shorten links' });
    expect(step1.body.data.step_responses.REQUIREMENTS_CLARIFICATION.interviewer_feedback).toMatch(/Checklist \(automatic keyword check\): 1 of 4/);

    unavailable();
    const tutor = await api.call('POST', '/system-design/ai-tutor', A.token, { prompt: 'Explain consistent hashing', mode: 'CONCEPT' });
    expect(tutor.status).toBe(503);
    expect(tutor.body.message).toMatch(/not available/);
  });
});
