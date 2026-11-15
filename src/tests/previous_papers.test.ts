import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

process.env.DATA_PERSISTENCE = 'off';

import { splitQuestions, analyseSubject, questionMatchesTopic } from '../../server/services/paperMath';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';

const PAPER = `B.Tech III Year End Semester Examination
Time: 3 hours            Max. Marks: 70
Answer any five questions.
UNIT - I
1. a) Explain the process state diagram with a neat sketch. (7 marks)
   b) What is a process control block? [5M]
2. Compare CPU scheduling algorithms FCFS and round robin.
UNIT - II
Q3. Explain deadlock prevention and deadlock avoidance. (10 marks)
OR
Q4. Describe the producer consumer problem using semaphores.`;

describe('Previous papers: splitting', () => {
  it('finds questions, units and marks and skips headers', () => {
    const qs = splitQuestions(PAPER);
    expect(qs.map((q) => q.text.slice(0, 20))).toEqual(['Explain the process ', 'What is a process co', 'Compare CPU scheduli', 'Explain deadlock pre', 'Describe the produce']);
    expect(qs[0]).toMatchObject({ unit: 'Unit I', marks: 7 });
    expect(qs[1].marks).toBe(5);
    expect(qs[3]).toMatchObject({ unit: 'Unit II', marks: 10 });
    expect(splitQuestions('Time: 3 hours\nMax Marks 70')).toEqual([]);
  });
});

describe('Previous papers: topic matching', () => {
  it('matches any part of a compound syllabus topic, folding plurals and possessives', () => {
    expect(questionMatchesTopic("Explain the Banker's algorithm for deadlock avoidance.", 'Bankers Algorithm & Deadlock Detection')).toBe(true);
    expect(questionMatchesTopic('Explain paging and the page table.', 'Paging, Segmentation & Page Replacement Algorithms')).toBe(true);
    expect(questionMatchesTopic('Explain process scheduling with a Gantt chart.', 'Multi-Level Queue & Round Robin Scheduling')).toBe(false);
    expect(questionMatchesTopic('Write an introduction to networks.', 'Introduction & Basics')).toBe(false);
  });
});

describe('Previous papers: analysis', () => {
  const topics = [
    { id: 't1', name: 'Process Control Block', state: 'demonstrated' },
    { id: 't2', name: 'CPU Scheduling', state: 'practiced' },
    { id: 't3', name: 'Deadlock Avoidance', state: 'not_started' },
    { id: 't4', name: 'Virtual Memory' },
  ];
  it('ranks topics by papers asking them and flags frequent ones not yet demonstrated', () => {
    const p1 = { id: 'p1', subject_id: 's', year: 2024, questions: splitQuestions(PAPER) };
    const p2 = { id: 'p2', subject_id: 's', year: 2023, questions: splitQuestions('1. Explain CPU scheduling with an example.\n2. Write about deadlock avoidance using the bankers algorithm.\n3. Explain the process control block.') };
    const other = { id: 'p3', subject_id: 'x', questions: splitQuestions('1. Explain virtual memory in detail.') };
    const a = analyseSubject('s', topics, [p1, p2, other]);
    expect(a.papers).toBe(2);
    // Same number of papers and questions: more marks first.
    expect(a.topics.map((t) => [t.topic_id, t.papers, t.marks])).toEqual([['t3', 2, 10], ['t1', 2, 5], ['t2', 2, 0]]);
    expect(a.topics.find((t) => t.topic_id === 't3')!.years).toEqual([2024, 2023]);
    expect(a.never_asked.map((t) => t.topic_id)).toEqual(['t4']); // only asked in another subject's paper
    expect(a.focus.map((f) => f.topic_id)).toEqual(['t3', 't2']); // t1 is demonstrated
    expect(a.unmatched.length).toBeGreaterThan(0); // producer consumer, process state diagram
  });
});

describe('Previous Papers and Virtual Lab over HTTP', () => {
  let server: Server;
  let base = '';
  const tokens: Record<'a' | 'b', string> = { a: '', b: '' };
  const call = async (who: 'a' | 'b' | null, method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', ...(who ? { authorization: `Bearer ${tokens[who]}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const json: any = await res.json().catch(() => ({}));
    return { status: res.status, data: json.data, json };
  };
  let subjectId = '';

  beforeAll(async () => {
    const { createApp } = await import('../../server/app');
    const app = await createApp();
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const stamp = Date.now().toString(36);
    for (const who of ['a', 'b'] as const) {
      const r = await call(null, 'POST', '/auth/register', { full_name: `PP ${who}`, email: `pp-${who}-${stamp}@example.com`, password: 'Str0ng!Passw0rd#2026' });
      tokens[who] = r.data.token;
    }
    const s = await call('a', 'POST', '/semester/subjects', { name: 'Operating Systems', code: 'OS', credits: 4, units: [{ id: 'u1', name: 'Unit 1', topics: [{ id: 'os-t1', name: 'CPU Scheduling', completed: false }, { id: 'os-t2', name: 'Deadlock Avoidance', completed: false }] }] });
    expect(s.status).toBe(201);
    subjectId = s.data.id;
  }, 30_000);

  afterAll(() => new Promise<void>((done) => (server ? server.close(() => done()) : done())));

  it('needs a session', async () => {
    expect((await call(null, 'GET', '/previous-papers/me')).status).toBe(401);
    expect((await call(null, 'POST', '/previous-papers/me', {})).status).toBe(401);
  });

  it('adds, analyses and removes a student’s own papers only', async () => {
    const added = await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, year: 2024, text: '1. Explain CPU scheduling.\n2. Explain deadlock avoidance.' });
    expect(added.status).toBe(200);
    expect(added.data.questions).toHaveLength(2);
    const ov = await call('a', 'GET', '/previous-papers/me');
    expect(ov.data.papers).toHaveLength(1);
    expect(ov.data.papers[0].questions).toBeUndefined(); // list stays light
    expect(ov.data.analyses[0].topics.map((t: any) => t.topic_id).sort()).toEqual(['os-t1', 'os-t2']);

    // B cannot use A's subject, see A's papers or delete them.
    expect((await call('b', 'POST', '/previous-papers/me', { subject_id: subjectId, text: '1. Explain CPU scheduling.' })).status).toBe(400);
    expect((await call('b', 'GET', '/previous-papers/me')).data.papers).toEqual([]);
    expect((await call('b', 'DELETE', `/previous-papers/me/${added.data.id}`)).status).toBe(404);

    // Validation: nothing to split, bad year, not a PDF, scanned-PDF path needs real text.
    expect((await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, text: 'Time: 3 hours' })).status).toBe(400);
    expect((await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, year: 1800, text: '1. Explain CPU scheduling.' })).status).toBe(400);
    const fake = Buffer.from('not a pdf at all').toString('base64');
    const bad = await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, file: { name: 'x.pdf', data: fake } });
    expect(bad.status).toBe(400);
    expect(bad.json.message).toMatch(/not a PDF/);
    const exe = await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, file: { name: 'x.exe', data: fake } });
    expect(exe.status).toBe(400);
    const txt = await call('a', 'POST', '/previous-papers/me', { subject_id: subjectId, file: { name: 'paper.txt', data: Buffer.from('Q1. Explain deadlock avoidance.').toString('base64') } });
    expect(txt.status).toBe(200);
    expect(txt.data.source).toBe('txt');

    expect((await call('a', 'DELETE', `/previous-papers/me/${added.data.id}`)).status).toBe(200);
    expect((await call('a', 'GET', '/previous-papers/me')).data.papers).toHaveLength(1);
  });

  it('lists the new pages in the sidebar', () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    expect(hrefs).toContain('/previous-papers');
    expect(hrefs).toContain('/virtual-lab');
  });
});
