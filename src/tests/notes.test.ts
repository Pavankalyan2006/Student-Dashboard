import { describe, it, expect, vi } from 'vitest';
import { db } from '../../server/db/database';
import { NotesService } from '../../server/services/notes';
import { ToolRegistry } from '../../server/ai/tools';
import { AIService } from '../../server/ai/service';

describe('Phase 5 AI Notes Generator & Student Learning Materials', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_test_isolated_student';

  it('lists seeded notes for authenticated student with pagination', async () => {
    const res = await NotesService.listNotes(studentA, { limit: 10 });
    expect(res.items.length).toBeGreaterThanOrEqual(2);
    expect(res.total).toBeGreaterThanOrEqual(2);

    const dbmsNote = res.items.find((n) => n.title.includes('Normalization'));
    expect(dbmsNote).toBeDefined();
    expect(dbmsNote?.student_id).toBe(studentA);
    expect(dbmsNote?.tags).toContain('DBMS');
  });

  it('generates a new academic note from topic with structured sections', async () => {
    const newNote = await NotesService.generateNote(studentA, {
      source_type: 'topic',
      topic: 'B-Trees and B+ Trees Indexing in Databases',
      note_type: 'STUDY_NOTES',
      level: 'INTERMEDIATE',
      length: 'MEDIUM',
    });

    expect(newNote).toBeDefined();
    expect(newNote.id).toMatch(/^note_/);
    expect(newNote.student_id).toBe(studentA);
    expect(newNote.title).toContain('B-Trees');
    expect(newNote.content).toBeDefined();
    expect(newNote.version).toBe(1);

    // Retrieve note directly
    const fetched = await NotesService.getNote(newNote.id, studentA);
    expect(fetched.id).toBe(newNote.id);
  });

  it('generates notes from an existing course lesson source', async () => {
    const courseNote = await NotesService.generateNote(studentA, {
      source_type: 'lesson',
      course_id: 'crs_daa_01',
      lesson_id: 'lsn_daa_01',
      note_type: 'EXAM_NOTES',
      level: 'INTERMEDIATE',
    });

    expect(courseNote).toBeDefined();
    expect(courseNote.source_type).toBe('lesson');
    expect(courseNote.lesson_id).toBe('lsn_daa_01');
    expect(courseNote.content).toContain('Asymptotic');
  });

  it('enforces student ownership and strictly blocks cross-student note access', async () => {
    // Note created by student A
    const resA = await NotesService.listNotes(studentA, { limit: 1 });
    const noteA = resA.items[0];

    // Student B attempts to access note A -> must throw AuthorizationError
    await expect(NotesService.getNote(noteA.id, studentB)).rejects.toThrow();

    // Student B attempts to update note A -> must throw AuthorizationError
    await expect(
      NotesService.updateNote(noteA.id, studentB, { title: 'Malicious Change' })
    ).rejects.toThrow();

    // Student B attempts to delete note A -> must throw AuthorizationError
    await expect(NotesService.deleteNote(noteA.id, studentB)).rejects.toThrow();

    // Student B notes list must be isolated and not contain Student A's notes
    const resB = await NotesService.listNotes(studentB);
    const leaked = resB.items.find((n) => n.id === noteA.id);
    expect(leaked).toBeUndefined();
  });

  it('supports note updates with automatic version history tracking', async () => {
    // Create note
    const note = await NotesService.createManualNote(studentA, {
      title: 'Memory Hierarchy & Cache Mapping Test',
      content: '## Initial Cache Notes\nDirect mapped cache index bits.',
    });

    expect(note.version).toBe(1);

    // Update content -> increments version to 2
    const updated = await NotesService.updateNote(
      note.id,
      studentA,
      {
        content: '## Revised Cache Notes\nSet associative cache replacement policies: LRU vs FIFO.',
      },
      'Added set-associative policies'
    );

    expect(updated.version).toBe(2);

    const versions = await NotesService.getVersions(note.id, studentA);
    expect(versions.length).toBe(2);
    expect(versions[0].version_number).toBe(1);
    expect(versions[1].version_number).toBe(2);
  });

  it('toggles note favorite status', async () => {
    const res = await NotesService.listNotes(studentA, { limit: 1 });
    const target = res.items[0];

    const toggle1 = await NotesService.toggleFavorite(target.id, studentA);
    const updated1 = await NotesService.getNote(target.id, studentA);
    expect(updated1.is_favorite).toBe(toggle1.is_favorite);

    const toggle2 = await NotesService.toggleFavorite(target.id, studentA);
    expect(toggle2.is_favorite).toBe(!toggle1.is_favorite);
  });

  it('searches student notes by keyword query', async () => {
    const results = await NotesService.listNotes(studentA, { search: 'Normalization' });
    expect(results.items.length).toBeGreaterThan(0);
    expect(results.items[0].title.toLowerCase()).toContain('normalization');
  });

  it('refuses to generate flashcards or quiz when the AI provider is unavailable', async () => {
    const res = await NotesService.listNotes(studentA, { limit: 1 });
    const target = res.items[0];
    // Tests have no real model (no key, or the mock provider's plain-text reply). Each call must fail
    // with an AI error instead of returning template flashcards or questions.
    const aiError = (e: any) => [503, 502].includes(e?.statusCode) && ['AI_UNAVAILABLE', 'AI_BAD_RESPONSE'].includes(e?.code);
    await NotesService.generateFlashcards(studentA, target.id).then(
      () => expect.fail('flashcards should not be generated without a model'),
      (e) => expect(aiError(e)).toBe(true)
    );
    await NotesService.generateQuiz(studentA, target.id).then(
      () => expect.fail('quiz should not be generated without a model'),
      (e) => expect(aiError(e)).toBe(true)
    );
  });

  it('generates revision flashcards and practice quiz MCQs from note', async () => {
    const res = await NotesService.listNotes(studentA, { limit: 1 });
    const target = res.items[0];
    // Stub the model with well-formed output; one MCQ has an out-of-range answer and must be dropped.
    const spy = vi.spyOn(AIService, 'generate').mockImplementation(async (messages: any[]) => {
      const prompt = messages.map((m: any) => m.content).join('\n');
      if (prompt.includes('flashcards for active recall')) {
        return { text: JSON.stringify({ flashcards: [{ question: 'What is 2NF?', answer: 'No partial dependency on a key.', difficulty: 'easy' }] }) } as any;
      }
      return {
        text: JSON.stringify({
          questions: [
            { question: 'Which form removes transitive dependencies?', options: ['1NF', '2NF', '3NF'], correct_answer_index: 2, explanation: '3NF removes transitive dependencies.' },
            { question: 'Broken question', options: ['A', 'B'], correct_answer_index: 5, explanation: 'x' },
          ],
        }),
      } as any;
    });

    const flashcards = await NotesService.generateFlashcards(studentA, target.id);
    expect(flashcards.length).toBeGreaterThanOrEqual(1);
    expect(flashcards[0].question).toBeDefined();
    expect(flashcards[0].answer).toBeDefined();

    const quiz = await NotesService.generateQuiz(studentA, target.id);
    expect(quiz.length).toBeGreaterThanOrEqual(1);
    expect(quiz[0].options.length).toBeGreaterThanOrEqual(2);
    expect(quiz[0].explanation).toBeDefined();
    expect(quiz.map((q) => q.question)).toEqual(['Which form removes transitive dependencies?']);
    spy.mockRestore();
  });

  it('executes AI Tool Registry tools for Notes in authenticated student context', async () => {
    const listToolResult = await ToolRegistry.execute(
      'search_notes',
      { query: 'Asymptotic' },
      { studentId: studentA, role: 'STUDENT' }
    );
    expect(Array.isArray(listToolResult)).toBe(true);

    const getNoteResult = await ToolRegistry.execute(
      'get_note',
      { noteId: 'note_db_01' },
      { studentId: studentA, role: 'STUDENT' }
    );
    expect(getNoteResult.id).toBe('note_db_01');
    expect(getNoteResult.title).toContain('Normalization');
  });
});
