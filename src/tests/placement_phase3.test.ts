import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { PlacementService } from '../../server/services/placementService';
import { PlacementAIService } from '../../server/services/placementAIService';
import { stubModel } from './helpers/mockAIModel';

// Phase 3: placement numbers come from the student's records; AI helpers never return canned text.
describe('Phase 3 placement preparation', () => {
  const sid = 'std_p3_place_a';
  beforeAll(async () => {
    await db.initialize();
  });

  it('a new student has zero readiness, no invented weak topics, and no interview score of 70', async () => {
    const r = await PlacementService.getReadiness(sid);
    expect(r.overall_percentage).toBe(0);
    expect(r.dimensions.communication.score).toBe(0);
    expect(r.dimensions.aptitude.metric_value).toBe(0);
    expect(JSON.stringify(r.weak_areas)).not.toMatch(/Time, Speed|Two Pointers/);
    const stats = await PlacementService.getDashboardStats(sid);
    expect(stats.is_onboarding).toBe(true);
    const dsa = stats.categories_progress.find((c) => c.category_id === 'dsa')!;
    expect(dsa.accuracy_percentage).toBeNull();
  });

  it('category totals come from the question bank', async () => {
    const stats = await PlacementService.getDashboardStats(sid);
    const quant = stats.categories_progress.find((c) => c.category_id === 'quant')!;
    expect(quant.total_available).toBe((await db.getPlacementQuestions(undefined, 'APTITUDE')).length);
  });

  it('weak areas come from the student’s own practice accuracy', async () => {
    const qs = (await db.getPlacementQuestions(undefined, 'DBMS')).slice(0, 3);
    expect(qs.length).toBe(3);
    const answers = Object.fromEntries(qs.map((q) => [q.id, '__wrong__']));
    const res = await PlacementService.submitAssessment(sid, { answers, title: 'P3 DBMS', category: 'DBMS', time_spent_seconds: 90 } as any);
    expect(res.score_percentage).toBe(0);
    expect(res.time_spent_seconds).toBe(90);
    const r = await PlacementService.getReadiness(sid);
    const dbms = r.weak_areas.find((w) => w.category === 'DBMS');
    expect(dbms?.reason).toContain('0% correct over 3');
  });

  it('recommendations exist in the catalogues and skip solved work', async () => {
    const rec: any = await PlacementService.getRecommendations(sid);
    const dsaIds = new Set((await db.getDSAProblems({})).map((p: any) => p.id));
    for (const p of rec.recommended_dsa) expect(dsaIds.has(p.id)).toBe(true);
    const codingIds = new Set((await db.getCodingProblems()).map((p) => p.id));
    for (const p of rec.recommended_coding) expect(codingIds.has(p.id)).toBe(true);
    for (const q of rec.recommended_quizzes) expect(await db.getQuizById(q.id)).toBeTruthy();
    expect(rec.recommended_quizzes.map((q: any) => q.id)).not.toContain('quiz_dbms_01');
    expect(rec.basis).toBeTruthy();
  });

  it('assessment submissions are validated (no empty or unknown questions, no invented time)', async () => {
    await expect(PlacementService.submitAssessment(sid, { answers: {} } as any)).rejects.toMatchObject({ statusCode: 400 });
    await expect(PlacementService.submitAssessment(sid, { answers: { nope: 'a' } } as any)).rejects.toMatchObject({ statusCode: 400 });
    const q = (await db.getPlacementQuestions())[0];
    const r = await PlacementService.submitAssessment(sid, { answers: { [q.id]: String(q.correct_answer) } } as any);
    expect(r.score_percentage).toBe(100);
    expect(r.time_spent_seconds).toBe(0);
  });

  it('coach and STAR need the model (503) and STAR keeps only the student’s facts', async () => {
    await expect(PlacementAIService.askPlacementCoach(sid, 'Explain deadlock')).rejects.toMatchObject({ statusCode: 503 });
    await expect(PlacementAIService.improveWithStar('I fixed the login bug in our club app.')).rejects.toMatchObject({ statusCode: 503 });
    await expect(PlacementAIService.improveWithStar('')).rejects.toMatchObject({ statusCode: 400 });
    const stub = stubModel(() => JSON.stringify({ situation: 'Club app', task: 'Login bug', action: 'I fixed it', result: '', improved_answer: 'In our club app I fixed the login bug.', critique: 'Add the result.' }));
    try {
      const r = await PlacementAIService.improveWithStar('I fixed the login bug in our club app.');
      expect(r.result).toBe('');
      expect(r.critique).toContain('result');
      const prompt = stub.gen.mock.calls[0][0].map((m: any) => m.content).join('\\n');
      expect(prompt).toContain('Do not invent achievements');
    } finally {
      stub.restore();
    }
  });

  it('exported notes contain only the student’s text', async () => {
    const n = await PlacementAIService.generatePlacementNotes(sid, 'Deadlocks', 'Four Coffman conditions.', 'OS');
    expect(n.content).toContain('Four Coffman conditions.');
    expect(n.content).not.toMatch(/Redis|10x traffic/);
    await expect(PlacementAIService.generatePlacementNotes(sid, '', 'x')).rejects.toMatchObject({ statusCode: 400 });
  });
});
