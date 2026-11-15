// Reads the student's own syllabus, answered questions, mistakes, notes and flashcard decks and builds their
// Knowledge Graph. Every store is read for this student only and is optional: one that fails is skipped.
import { db } from '../db/database';
import { semesterCommandCenterService } from './semesterCommandCenterService';
import { MistakeNotebookService } from './mistakeNotebookService';
import { buildKnowledgeMap, type KnowledgeMap, type PracticeInput } from './knowledgeMapMath';

export * from './knowledgeMapMath';

async function safe<T>(fn: () => T | Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const answered = (v: unknown) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);

/** Answered quiz and GATE questions, tallied by the topic label each question carries. */
export async function practiceByTopic(studentId: string): Promise<PracticeInput[]> {
  const tally = new Map<string, { answered: number; correct: number }>();
  const add = (topic: string, ok: boolean) => {
    const t = tally.get(topic) || { answered: 0, correct: 0 };
    t.answered++;
    if (ok) t.correct++;
    tally.set(topic, t);
  };
  const attempts: any[] = await safe(() => db.getQuizAttempts(studentId) as Promise<any[]>, []);
  const questionsByQuiz = new Map<string, any[]>();
  for (const att of attempts) {
    if (att.student_id && att.student_id !== studentId) continue;
    if (!questionsByQuiz.has(att.quiz_id)) questionsByQuiz.set(att.quiz_id, await safe(() => db.getQuizQuestions(att.quiz_id) as Promise<any[]>, []));
    const questions = questionsByQuiz.get(att.quiz_id)!;
    const qas: any[] = await safe(() => db.getQuestionAttempts(att.id) as Promise<any[]>, []);
    for (const qa of qas) {
      if (!answered(qa.selected_answer)) continue;
      const q = questions.find((x) => x.id === qa.question_id);
      if (!q) continue;
      add(String(q.topic_name || q.metadata?.topic_name || q.topic_id || 'General'), Boolean(qa.is_correct));
    }
  }
  const gate: any[] = await safe(() => (db as any).getGateQuestionAttempts(studentId) as Promise<any[]>, []);
  for (const a of gate) {
    if (!answered(a.selected_answer)) continue;
    const q: any = await safe(() => db.getGateQuestionById(a.question_id), null);
    if (q) add(String(q.subject || q.topic_id || 'GATE'), Boolean(a.is_correct));
  }
  return [...tally.entries()].map(([topic, t]) => ({ topic, ...t }));
}

export async function knowledgeMapFor(studentId: string): Promise<KnowledgeMap> {
  const [subjects, practice, notebook, notes, decks] = await Promise.all([
    safe(() => semesterCommandCenterService.getSubjects(studentId), [] as any[]),
    practiceByTopic(studentId),
    safe(() => MistakeNotebookService.forStudent(studentId), { by_topic: [] } as any),
    safe(() => db.getNotes(studentId) as Promise<any[]>, [] as any[]),
    safe(() => db.getFlashcardDecks(studentId), [] as any[]),
  ]);
  return buildKnowledgeMap(
    subjects.map((s: any) => ({
      id: String(s.id),
      name: String(s.name),
      code: s.code || undefined,
      topics: (s.units || []).flatMap((u: any) =>
        (u.topics || []).map((t: any) => ({
          id: String(t.id),
          name: String(t.name),
          unit: String(u.name || u.id),
          completed: Boolean(t.completed),
          revision_count: Number(t.revision_count) || 0,
          prerequisites: Array.isArray(t.prerequisites) ? t.prerequisites.map(String) : undefined,
        }))
      ),
    })),
    practice,
    notebook.by_topic || [],
    notes.filter((n: any) => n.student_id === studentId).map((n: any) => ({ id: String(n.id), title: String(n.title || ''), text: [n.source_title, ...(n.tags || [])].filter(Boolean).join(' ') })),
    decks.filter((d: any) => d.student_id === studentId).map((d: any) => ({ id: String(d.id), title: String(d.title || ''), text: String(d.subject || '') }))
  );
}
