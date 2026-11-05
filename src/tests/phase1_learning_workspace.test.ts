// Phase 1 (Learning Workspace) regression tests.
// Each test uses fresh synthetic student ids so no seeded or real student data is touched.
import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { semesterCommandCenterService as scc } from '../../server/services/semesterCommandCenterService';
import { OnboardingService } from '../../server/services/onboardingService';

const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

describe('Phase 1 › Semester Command Center is per student', () => {
  beforeAll(async () => {
    await db.initialize();
  });

  it('a new student starts empty instead of seeing the demo semester', () => {
    const a = uid('std_p1_new');
    const o = scc.getOverview(a);
    expect(o.subjects).toEqual([]);
    expect(o.upcoming_events).toEqual([]);
    expect(o.active_recovery_plans).toEqual([]);
    expect(o.config.student_id).toBe(a);
    expect(o.config.target_gpa).toBeUndefined();
    expect(o.config.academic_goals).toEqual([]);
    expect(o.today_guidance.primary_focus.subject_name).toBe('');
    expect(o.latest_weekly_review.subject_deltas).toEqual([]);
    expect(o.latest_weekly_review.study_hours_completed).toBe(0);
    expect(scc.getSlipTests(a)).toEqual([]);
    expect(scc.getStudyStream(a)).toEqual([]);
  });

  it("one student's subjects, events, config and slip tests are invisible to another", () => {
    const a = uid('std_p1_a');
    const b = uid('std_p1_b');
    const sub = scc.addSubject(a, { name: 'Compiler Design', code: 'CS701', credits: 3, subject_type: 'CORE', difficulty: 'HARD', priority: 'HIGH', units: [] } as any);
    scc.addEvent(a, { title: 'CD assignment', date: '2030-01-10', event_type: 'ASSIGNMENT', priority: 'MEDIUM', status: 'UPCOMING' } as any);
    scc.updateConfig(a, { target_gpa: 8.4 });
    scc.addSlipTest(a, { title: 'CD slip test', date: '2030-01-05', marks: 20, subject_id: sub.id } as any);

    expect(scc.getSubjects(a).map((s) => s.id)).toContain(sub.id);
    expect(scc.getSubjects(b)).toEqual([]);
    expect(scc.getEvents(b)).toEqual([]);
    expect(scc.getSlipTests(b)).toEqual([]);
    expect(scc.getOverview(b).config.target_gpa).toBeUndefined();
    expect(scc.getOverview(a).config.target_gpa).toBe(8.4);
    // B cannot change A's subject by id.
    expect(() => scc.updateSubjectUnits(b, sub.id, [])).toThrow(/not found/i);
    expect(scc.getSubjectById(b, sub.id)).toBeUndefined();
  });

  it('marking syllabus topics complete is saved for that student and drives progress', async () => {
    const a = uid('std_p1_syl');
    const b = uid('std_p1_syl_b');
    for (const id of [a, b]) {
      await OnboardingService.saveSemesterSyllabus(id, {
        subjects: [
          { id: 'sub_os', name: 'Operating Systems', code: 'CS501', credits: 4, subject_type: 'THEORY', syllabus_units: [{ unit_number: 1, title: 'Processes', topics: ['PCB', 'Scheduling'] }] },
        ],
      } as any);
    }
    const subject = scc.getSubjects(a).find((s) => s.id === 'sub_os')!;
    expect(subject.progress_percent).toBe(0);
    const units = subject.units.map((u) => ({ ...u, topics: u.topics.map((t, i) => ({ ...t, completed: i === 0 })) }));
    const updated = scc.updateSubjectUnits(a, 'sub_os', units);
    expect(updated.progress_percent).toBe(50);
    expect(updated.units[0].status).toBe('IN_PROGRESS');
    // Re-reading gives the saved value; another student with the same syllabus is unaffected.
    expect(scc.getSubjects(a).find((s) => s.id === 'sub_os')!.progress_percent).toBe(50);
    expect(scc.getSubjects(b).find((s) => s.id === 'sub_os')!.progress_percent).toBe(0);
    expect(scc.getOverview(a).today_guidance.primary_focus.target_topics).toEqual(['Scheduling']);
  });

  it('rejects invalid input', () => {
    const a = uid('std_p1_val');
    expect(() => scc.addSubject(a, { name: '  ' } as any)).toThrow(/name is required/);
    expect(() => scc.addEvent(a, { title: 'x', date: 'not-a-date' } as any)).toThrow(/valid/);
    expect(() => scc.updateConfig(a, { target_gpa: 12 })).toThrow(/between 0 and 10/);
    const t = scc.addSlipTest(a, { title: 'T', date: '2030-02-01', marks: 20 } as any);
    expect(() => scc.recordSlipTestScore(a, t.id, 25, [])).toThrow(/between 0 and 20/);
    expect(() => scc.getOverview(undefined)).toThrow(/Authentication required/);
  });

  it('a low slip-test score creates a recovery plan only for that student', () => {
    const a = uid('std_p1_rec');
    const b = uid('std_p1_rec_b');
    const t = scc.addSlipTest(a, { title: 'DBMS ST', date: '2030-02-01', marks: 20 } as any);
    scc.recordSlipTestScore(a, t.id, 8, ['BCNF']);
    expect(scc.getRecoveryPlans(a)).toHaveLength(1);
    expect(scc.getRecoveryPlans(a)[0].recommendations[0]).toContain('BCNF');
    expect(scc.getRecoveryPlans(b)).toEqual([]);
  });
});

describe('Phase 1 › AI Tutor quiz generation does not invent questions', () => {
  it('returns 503 AI_UNAVAILABLE and creates no quiz when the model is unavailable', async () => {
    const { QuizGenerationService } = await import('../../server/services/quizGeneration');
    await db.initialize();
    const student = `std_p1_quiz_${Date.now()}`;
    const before = (await db.getQuizzes(student)).filter((q) => q.student_id === student).length;
    await expect(QuizGenerationService.generateQuiz(student, { topic: 'Paging', question_count: 3 } as any)).rejects.toMatchObject({
      statusCode: 503,
    });
    const after = (await db.getQuizzes(student)).filter((q) => q.student_id === student).length;
    expect(after).toBe(before);
  });

  it('drops a generated MCQ whose correct answer is not among its options', async () => {
    const { AIService } = await import('../../server/ai/service');
    const { QuizGenerationService } = await import('../../server/services/quizGeneration');
    const { vi } = await import('vitest');
    const spy = vi.spyOn(AIService, 'generate').mockResolvedValue({
      text: JSON.stringify({
        questions: [
          { question_type: 'MCQ', question_text: 'Which unit holds a page table entry?', options: ['PTE', 'TLB', 'MMU'], correct_answer: 'PTE', explanation: 'A page table entry is stored per page.' },
          { question_type: 'MCQ', question_text: 'Which policy replaces the oldest page?', options: ['LRU', 'Optimal', 'Clock'], correct_answer: 'FIFO', explanation: 'FIFO replaces the oldest page.' },
        ],
      }),
    } as any);
    try {
      const { questions } = await QuizGenerationService.generateQuiz(`std_p1_quiz2_${Date.now()}`, { topic: 'Paging', question_count: 2 } as any);
      expect(questions.map((q) => q.correct_answer)).toEqual(['PTE']);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('Phase 1 › AI Agent reports only real tool results', () => {
  it('does not append canned notes, cards or sources, and marks unrun steps as failed', async () => {
    const { AgentService } = await import('../../server/ai/agent');
    await db.initialize();
    const created = await db.createStudent({
      name: 'Phase One Agent',
      email: `${uid('p1agent')}@example.test`,
      password_hash: 'hashed',
      branch: 'Computer Science',
      semester: 5,
      role: 'STUDENT',
      is_active: true,
    } as any);
    const student = created.id;
    const conv = await db.createConversation(student, 'Agent honesty');
    let content = '';
    let plan: any[] = [];
    for await (const ev of AgentService.runAgentStream(student, conv.id, 'Generate 3 flashcards on deadlocks')) {
      if (ev.type === 'message_delta') content += (ev.data as any).delta;
      if (ev.type === 'agent_plan') plan = (ev.data as any).steps;
    }
    expect(content).not.toMatch(/High-Yield Formula Sheet|Banker’s Safety Check|Consolidated Academic Notes|Active Recall Flashcard Deck/);
    expect(plan.length).toBeGreaterThan(0);
    // No step claims completion for work that produced nothing.
    expect(plan.filter((s) => s.status === 'completed' && /Notes|Flashcard/.test(s.title))).toEqual([]);
  });

  it('progress agent reports the student’s real counts, not sample numbers', async () => {
    const { AgentHandlers } = await import('../../server/ai/orchestration/agentHandlers');
    await db.initialize();
    const res = await AgentHandlers.executeTask(
      { id: 't', title: 'p', description: '', agent: 'ProgressAgent', action: 'x', params: {}, dependencies: [], status: 'pending' } as any,
      { student_id: `std_p1_prog_${Date.now()}`, role: 'STUDENT' } as any,
      new Map()
    );
    expect(res.data.solvedCount).toBe(0);
    expect(res.data.weakTopics).toEqual([]);
    expect(res.summary).not.toMatch(/140|Dynamic Programming/);
  });
});

describe('Phase 1 › Courses: private courses stay private', () => {
  it('another student cannot enroll in, bookmark or record progress on a private course', async () => {
    const { CourseService } = await import('../../server/services/courses');
    await db.initialize();
    const a = uid('std_p1_crs_a');
    const b = uid('std_p1_crs_b');
    const course = await CourseService.createCustomCourse(a, { title: 'Private Compilers', code: 'PC1' } as any);
    const chapter = await CourseService.addChapter(course.id, a, { title: 'Lexing' });
    const lesson = await CourseService.addLesson(course.id, chapter.id, a, { title: 'Tokens', content: 'Tokens are units.' } as any);

    await expect(db.enrollStudentInCourse(b, course.id)).rejects.toThrow(/permission/i);
    await expect(db.toggleCourseBookmark(b, course.id)).rejects.toThrow(/permission/i);
    await expect(db.completeLesson(b, lesson.id)).rejects.toThrow(/permission/i);
    await expect(db.updateLessonProgress(b, lesson.id, 50)).rejects.toThrow(/permission/i);
    // The owner still can.
    const done = await db.completeLesson(a, lesson.id);
    expect(done.progress.status).toBe('COMPLETED');
  });

  it('archiving a catalog course you are not enrolled in is rejected instead of enrolling you', async () => {
    await db.initialize();
    const s = uid('std_p1_arch');
    await expect(db.archiveCourse('crs_cat_001', s, true)).rejects.toThrow(/enrolled/);
    const course = await db.getCourseById('crs_cat_001', s);
    expect(course?.is_enrolled).toBe(false);
  });
});

describe('Phase 1 › Documents upload validation', () => {
  const dataUrl = (text: string) => `data:text/plain;base64,${Buffer.from(text).toString('base64')}`;

  it('rejects an empty file, strips directories from the name, and never records fewer bytes than received', async () => {
    const { DocumentService } = await import('../../server/services/documents');
    await db.initialize();
    const s = uid('std_p1_doc');
    await expect(
      DocumentService.uploadDocument(s, { originalName: 'empty.txt', mimeType: 'text/plain', sizeBytes: 0, contentBase64: 'data:text/plain;base64,' } as any)
    ).rejects.toThrow(/empty/i);

    const doc = await DocumentService.uploadDocument(s, {
      originalName: '../../../etc/passwd.txt',
      mimeType: 'text/plain',
      sizeBytes: 3,
      contentBase64: dataUrl('eleven bytes'),
    } as any);
    expect(doc.original_filename).toBe('passwd.txt');
    expect(doc.file_size).toBe(Buffer.byteLength('eleven bytes'));
  });

  it('applies the same checks to a new version', async () => {
    const { DocumentService } = await import('../../server/services/documents');
    await db.initialize();
    const s = uid('std_p1_docv');
    const doc = await DocumentService.uploadDocument(s, { originalName: 'a.txt', mimeType: 'text/plain', sizeBytes: 5, contentBase64: dataUrl('hello') } as any);
    await expect(
      DocumentService.uploadNewVersion(doc.id, s, { originalName: 'a.exe', mimeType: 'application/octet-stream', sizeBytes: 2, contentBase64: dataUrl('MZ') })
    ).rejects.toThrow(/Unsupported/);
  });
});
