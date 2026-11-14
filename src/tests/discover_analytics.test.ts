import { describe, it, expect, vi, afterEach } from 'vitest';
import { summariseLearning, moduleForActivity, localDate } from '../../server/services/learningAnalyticsService';
import { buildWeeks, heatLevel, hourLabel } from '../features/analytics/learningAnalytics';
import {
  cleanCitations,
  rankNotes,
  keywords,
  buildDiscoverPrompt,
  searchWikipedia,
  DiscoverService,
} from '../../server/services/discoverService';
import { linkCitations, noteFromResult } from '../features/discover/discover';
import { isAIGenerationRequest, createRateLimiter } from '../../server/middleware/rateLimiter';
import { ResearchProviderService } from '../../server/services/researchProviderService';
import { AIService } from '../../server/ai/service';
import { db } from '../../server/db/database';

const NOW = new Date('2026-11-14T12:00:00Z');

describe('Learning analytics from real records', () => {
  it('counts per local day, zero-fills the calendar and computes real streaks', () => {
    const ev = (iso: string, module: any = 'quiz') => ({ at: iso, module });
    const out = summariseLearning(
      [
        ev('2026-11-14T05:00:00Z'),
        ev('2026-11-13T05:00:00Z', 'coding'),
        ev('2026-11-12T05:00:00Z'),
        // three-day run earlier in the year
        ev('2026-03-01T05:00:00Z'),
        ev('2026-03-02T05:00:00Z'),
        ev('2026-03-03T05:00:00Z'),
        ev('2026-03-04T05:00:00Z'),
      ],
      { now: NOW, days: 365, offsetMinutes: 330 }
    );
    expect(out.calendar).toHaveLength(365);
    expect(out.calendar.at(-1)).toEqual({ date: '2026-11-14', count: 1 });
    expect(out.calendar.filter((d) => d.count === 0).length).toBe(365 - 7);
    expect(out.current_streak).toBe(3);
    expect(out.longest_streak).toBe(4);
    expect(out.active_days).toBe(7);
    expect(out.by_module[0]).toMatchObject({ module: 'quiz', count: 6 });
    expect(out.last_30_days).toBe(3);
    expect(out.has_data).toBe(true);
  });

  it('uses the student\'s own time zone for days and hours', () => {
    // 20:00 UTC on the 13th is 01:30 on the 14th in India.
    expect(localDate(Date.parse('2026-11-13T20:00:00Z'), 330)).toBe('2026-11-14');
    const out = summariseLearning([{ at: '2026-11-13T20:00:00Z', module: 'notes' }], { now: NOW, offsetMinutes: 330 });
    expect(out.busiest_hour).toBe(1);
    expect(out.calendar.at(-1)?.count).toBe(1);
  });

  it('reports nothing, not a guess, when there is no activity', () => {
    const out = summariseLearning([], { now: NOW });
    expect(out).toMatchObject({ has_data: false, current_streak: 0, longest_streak: 0, busiest_hour: null, busiest_weekday: null });
  });

  it('ignores future timestamps and maps activity types to modules', () => {
    expect(summariseLearning([{ at: '2027-01-01T00:00:00Z', module: 'quiz' }], { now: NOW }).total_events).toBe(0);
    expect(moduleForActivity('COURSE_LESSON_COMPLETED')).toBe('courses');
    expect(moduleForActivity('DSA_PROBLEM_SOLVED')).toBe('coding');
    expect(moduleForActivity('GIT_EXERCISE_COMPLETED')).toBe('git');
    expect(moduleForActivity('PAPER_ANALYZED')).toBe('research');
  });

  it('lays days out in weekday columns and uses fixed colour thresholds', () => {
    // 2026-11-10 is a Tuesday, so the first column has two empty cells.
    const weeks = buildWeeks(['2026-11-10', '2026-11-11', '2026-11-12'].map((date) => ({ date, count: 1 })));
    expect(weeks[0].slice(0, 2)).toEqual([null, null]);
    expect(weeks[0][2]?.date).toBe('2026-11-10');
    expect([0, 1, 2, 4, 9].map(heatLevel)).toEqual([0, 1, 2, 3, 4]);
    expect(hourLabel(0)).toBe('12 AM');
    expect(hourLabel(13)).toBe('1 PM');
  });

  it('the dashboard streak no longer reports a made-up longest streak', async () => {
    const id = `stu_streak_${Date.now()}`;
    await db.recordActivity(id, { activity_type: 'QUIZ_COMPLETED', entity_type: 'QUIZ', entity_id: 'q1', title: 'Quiz' } as any);
    const s = await db.getLearningStreak(id);
    expect(s.current_streak).toBe(1);
    expect(s.longest_streak).toBe(1); // was hardcoded to at least 5
  });
});

describe('Discover: answers only from real sources', () => {
  afterEach(() => vi.restoreAllMocks());

  it('drops citations that point at no source', () => {
    const { text, cited } = cleanCitations('Paging splits memory [1]. Made up [7]. Both [1, 2] and [2,9].', 2);
    expect(text).toBe('Paging splits memory [1]. Made up. Both [1][2] and [2].');
    expect(cited).toEqual([1, 2]);
  });

  it('finds the student\'s own notes by keywords, title first', () => {
    const notes = [
      { id: 'a', title: 'Deadlocks in OS', content: 'Coffman conditions', tags: [] },
      { id: 'b', title: 'Sorting', content: 'quick sort and merge sort', tags: [] },
      { id: 'c', title: 'Misc', content: 'a deadlock appears in databases too', tags: [] },
    ];
    expect(keywords('What is a deadlock in OS?')).toEqual(['deadlock', 'os']);
    expect(rankNotes(notes, 'deadlocks in OS').map((n) => n.id)).toEqual(['a']);
    expect(rankNotes(notes, 'binary trees')).toEqual([]);
  });

  it('the prompt lists every source and forbids outside facts', () => {
    const p = buildDiscoverPrompt('What is TCP?', [{ n: 1, kind: 'wikipedia', title: 'TCP', url: 'u', snippet: 'Transmission Control Protocol…', publisher: 'Wikipedia' }]);
    expect(p).toContain('[1] TCP (Wikipedia)');
    expect(p).toMatch(/Use ONLY facts stated in the sources/);
  });

  it('parses the Wikipedia API and keeps the licence', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ query: { pages: [
        { index: 2, title: 'B-tree', extract: 'A B-tree is a self-balancing tree.', fullurl: 'https://en.wikipedia.org/wiki/B-tree' },
        { index: 1, title: 'B+ tree', extract: 'A B+ tree is an m-ary tree.', fullurl: 'https://en.wikipedia.org/wiki/B%2B_tree' },
      ] } }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    );
    const out = await searchWikipedia('b+ tree index');
    expect(out.map((s) => s.title)).toEqual(['B+ tree', 'B-tree']);
    expect(out[0]).toMatchObject({ kind: 'wikipedia', license: 'CC BY-SA 4.0', publisher: 'Wikipedia' });
    const url = String((globalThis.fetch as any).mock.calls[0][0]);
    expect(url).toContain('en.wikipedia.org/w/api.php');
    expect(url).toContain('gsrsearch=b%2B+tree+index');
  });

  it('writes no answer when no source is found, and keeps sources when the AI fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    vi.spyOn(ResearchProviderService, 'searchOpenAlex').mockRejectedValue(new Error('offline'));
    const gen = vi.spyOn(AIService, 'generate');
    const none = await DiscoverService.answer('stu_none', 'quantum chromodynamics lattice');
    expect(none.answer).toBeNull();
    expect(none.sources).toEqual([]);
    expect(none.providers.find((p) => p.provider === 'Wikipedia')).toMatchObject({ ok: false });
    expect(gen).not.toHaveBeenCalled();

    vi.spyOn(ResearchProviderService, 'searchOpenAlex').mockResolvedValue([
      { title: 'A paper', url: 'https://doi.org/x', abstract: 'Abstract', authors: ['A. Author'], publication_year: 2020, venue: 'Venue' } as any,
    ]);
    gen.mockRejectedValue(new Error('quota'));
    const failed = await DiscoverService.answer('stu_none', 'some topic');
    expect(failed.answer).toBeNull();
    expect(failed.sources).toHaveLength(1);
    expect(failed.ai_error).toMatch(/unavailable/);

    gen.mockResolvedValue({ text: '**AI unavailable.** No AI provider is configured.' } as any);
    const notice = await DiscoverService.answer('stu_none', 'some topic');
    expect(notice.answer).toBeNull(); // the "unavailable" notice is never shown as an answer
    expect(notice.ai_error).toMatch(/unavailable/);

    gen.mockResolvedValue({ text: 'Claim [1]. Invented [4].' } as any);
    const ok = await DiscoverService.answer('stu_none', 'some topic');
    expect(ok.answer).toBe('Claim [1]. Invented.');
    expect(ok.cited).toEqual([1]);
  });

  it('links citations in the page and saves the sources with the note', () => {
    expect(linkCitations('A [1][2].')).toBe('A [[1]](#src-1)[[2]](#src-2).');
    const note = noteFromResult({
      question: 'What is TCP?', answer: 'TCP is reliable [1].', cited: [1], providers: [], generated_at: NOW.toISOString(),
      sources: [{ n: 1, kind: 'wikipedia', title: 'TCP', url: 'https://en.wikipedia.org/wiki/TCP', snippet: '', publisher: 'Wikipedia', license: 'CC BY-SA 4.0' }],
    });
    expect(note.content).toContain('## Sources');
    expect(note.content).toContain('1. TCP (Wikipedia, CC BY-SA 4.0) — https://en.wikipedia.org/wiki/TCP');
  });
});

describe('Rate limits actually apply', () => {
  afterEach(() => {
    delete process.env.API_RATE_LIMIT_IN_TESTS;
  });

  it('limits requests when mounted under /api (it used to skip every request)', async () => {
    process.env.API_RATE_LIMIT_IN_TESTS = '1';
    const limiter = createRateLimiter({ windowSeconds: 60, maxRequests: 2, keyPrefix: `t${Date.now()}` });
    const statuses: number[] = [];
    for (let i = 0; i < 3; i++) {
      let status = 200;
      const res: any = { setHeader() {}, status(s: number) { status = s; return { json() {} }; } };
      // Inside app.use('/api', ...) Express strips the mount path from req.path.
      await limiter({ path: '/v1/notes', originalUrl: '/api/v1/notes', ip: '1.2.3.4', method: 'GET' } as any, res, () => {});
      statuses.push(status);
    }
    expect(statuses).toEqual([200, 200, 429]);
  });

  it('treats only AI generation calls as AI requests', () => {
    expect(isAIGenerationRequest('POST', '/api/v1/discover/answer')).toBe(true);
    expect(isAIGenerationRequest('POST', '/api/v1/notes/generate')).toBe(true);
    expect(isAIGenerationRequest('POST', '/api/v1/ai/chat')).toBe(true);
    expect(isAIGenerationRequest('GET', '/api/v1/ai/conversations')).toBe(false);
    expect(isAIGenerationRequest('POST', '/api/v1/notes')).toBe(false);
  });
});

import { mistakeStatus, MistakeNotebookService } from '../../server/services/mistakeNotebookService';
import { answerInputKind, formatAnswer } from '../features/mistakes/mistakes';

describe('Mistake Notebook from the student\'s own answers', () => {
  it('a question is a mistake only if it was answered wrongly, and fixed only by a later correct answer', () => {
    const t = (d: number) => new Date(Date.UTC(2026, 10, d)).toISOString();
    expect(mistakeStatus([{ at: t(1), correct: true, answer: 'A' }])).toBeNull();
    expect(mistakeStatus([{ at: t(1), correct: false, answer: 'B' }, { at: t(2), correct: false, answer: 'C' }])).toMatchObject({ times_wrong: 2, status: 'open', your_answer: 'C' });
    expect(mistakeStatus([{ at: t(1), correct: false, answer: 'B' }, { at: t(3), correct: true, answer: 'A' }])).toMatchObject({ status: 'fixed', fixed_at: t(3) });
    // correct first, then wrong: still open
    expect(mistakeStatus([{ at: t(1), correct: true, answer: 'A' }, { at: t(2), correct: false, answer: 'B' }])?.status).toBe('open');
  });

  it('collects a wrong quiz answer, hides nothing it should not, and a correct retry fixes it', async () => {
    const studentId = `stu_mist_${Date.now()}`;
    const questions = await db.getQuizQuestions('quiz_os_process_mgmt');
    const q: any = questions.find((x: any) => x.question_type === 'MCQ' && x.options?.length);
    expect(q).toBeTruthy();
    const wrong = q.options.find((o: string) => o !== q.correct_answer);
    const att: any = await db.createQuizAttempt({ quiz_id: 'quiz_os_process_mgmt', student_id: studentId, score: 0, correct_count: 0, incorrect_count: 1, unanswered_count: 0, time_taken_seconds: 30, status: 'COMPLETED', completed_at: new Date(Date.now() - 60000).toISOString() } as any);
    await db.saveQuestionAttempts(att.id, [{ id: 'qa1', attempt_id: att.id, question_id: q.id, selected_answer: wrong, is_correct: false, time_taken_seconds: 30, attempt_number: 1, created_at: new Date(Date.now() - 60000).toISOString() } as any]);

    const nb = await MistakeNotebookService.forStudent(studentId);
    expect(nb.open).toBe(1);
    expect(nb.items[0]).toMatchObject({ source: 'quiz', question_id: q.id, your_answer: wrong, status: 'open' });
    expect(JSON.stringify(nb.items[0])).not.toContain('"correct_answer"');

    const miss = await MistakeNotebookService.retry(studentId, 'quiz', q.id, wrong);
    expect(miss.correct).toBe(false);
    expect((await MistakeNotebookService.forStudent(studentId)).open).toBe(1);

    const hit = await MistakeNotebookService.retry(studentId, 'quiz', q.id, q.correct_answer);
    expect(hit.correct).toBe(true);
    const after = await MistakeNotebookService.forStudent(studentId);
    expect(after).toMatchObject({ open: 0, fixed: 1 });

    await expect(MistakeNotebookService.retry(studentId, 'quiz', 'not_my_question', 'x')).rejects.toThrow(/not in your mistake notebook/);
  });

  it('picks the right input and shows answers the way the student saw them', () => {
    expect(answerInputKind({ question_type: 'MCQ', options: [{ id: 'A', text: 'x' }] })).toBe('single');
    expect(answerInputKind({ question_type: 'MSQ', options: [{ id: 'A', text: 'x' }] })).toBe('multi');
    expect(answerInputKind({ question_type: 'NAT', options: [] })).toBe('text');
    const opts = [{ id: 'A', text: 'Paging' }, { id: 'B', text: 'Segmentation' }];
    expect(formatAnswer('B', opts)).toBe('B. Segmentation');
    expect(formatAnswer(['A', 'B'], opts)).toBe('A. Paging, B. Segmentation');
    expect(formatAnswer({ min: 24.5, max: 25.5 })).toBe('24.5 to 25.5');
    expect(formatAnswer('Round robin')).toBe('Round robin');
  });
});
