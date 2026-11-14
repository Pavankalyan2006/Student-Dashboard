// Mistake Notebook: every question the student got wrong, in one place, until they get it right.
//
// Built only from the student's own records:
//   - quiz question attempts marked incorrect (with the answer they gave)
//   - GATE practice attempts marked incorrect
// A mistake counts as fixed once the student answers that same question correctly later, either in a new
// quiz/GATE attempt or by retrying it here. Retrying never reveals the correct answer before the student
// has committed to one.
import { db } from '../db/database';
import { QuestionEvaluationService } from './questionEvaluation';
import { GateService } from './gateService';
import { ActivityService } from './activityService';
import { NotFoundError, ValidationError } from '../core/exceptions';

export type MistakeSource = 'quiz' | 'gate';

export interface MistakeItem {
  key: string;
  source: MistakeSource;
  question_id: string;
  question_type: string;
  question_text: string;
  options: { id: string; text: string }[];
  your_answer: unknown;
  topic: string;
  context: string;
  times_wrong: number;
  last_wrong_at: string;
  status: 'open' | 'fixed';
  fixed_at?: string;
}

export interface MistakeNotebook {
  items: MistakeItem[];
  open: number;
  fixed: number;
  by_topic: { topic: string; open: number; fixed: number }[];
}

interface Outcome {
  at: string;
  correct: boolean;
  answer: unknown;
}

const hasAnswer = (a: unknown) =>
  a !== undefined && a !== null && !(typeof a === 'string' && a.trim() === '') && !(Array.isArray(a) && a.length === 0);

/**
 * Pure: turns a question's answer history into a notebook entry. A question with no wrong answer is not a
 * mistake. It is fixed when the latest answer after the last wrong one was correct.
 */
export function mistakeStatus(history: Outcome[]): { times_wrong: number; last_wrong_at: string; status: 'open' | 'fixed'; fixed_at?: string; your_answer: unknown } | null {
  const sorted = [...history].filter((h) => !Number.isNaN(Date.parse(h.at))).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const wrong = sorted.filter((h) => !h.correct);
  if (!wrong.length) return null;
  const lastWrong = wrong[wrong.length - 1];
  const latest = sorted[sorted.length - 1];
  const fixed = latest.correct && Date.parse(latest.at) >= Date.parse(lastWrong.at);
  return {
    times_wrong: wrong.length,
    last_wrong_at: lastWrong.at,
    status: fixed ? 'fixed' : 'open',
    fixed_at: fixed ? latest.at : undefined,
    your_answer: lastWrong.answer,
  };
}

async function quizHistories(studentId: string) {
  const attempts = await db.getQuizAttempts(studentId).catch(() => [] as any[]);
  const byQuestion = new Map<string, Outcome[]>();
  const quizOf = new Map<string, string>();
  for (const att of attempts as any[]) {
    const qas = await db.getQuestionAttempts(att.id).catch(() => [] as any[]);
    for (const qa of qas as any[]) {
      if (!hasAnswer(qa.selected_answer)) continue; // unanswered is not a mistake
      const list = byQuestion.get(qa.question_id) || [];
      list.push({ at: qa.created_at || att.completed_at || att.started_at, correct: Boolean(qa.is_correct), answer: qa.selected_answer });
      byQuestion.set(qa.question_id, list);
      quizOf.set(qa.question_id, att.quiz_id);
    }
  }
  // Retries made in the notebook.
  const reviews = await db.getStudentActivities(studentId, { type: 'MISTAKE_REVIEWED' }).catch(() => [] as any[]);
  // The activity log is newest first; walk it oldest first so retries made in the same millisecond keep their order.
  for (const r of [...(reviews as any[])].reverse()) {
    const qid = r.metadata?.question_id;
    if (r.metadata?.source !== 'quiz' || !qid || !byQuestion.has(qid)) continue;
    byQuestion.get(qid)!.push({ at: r.created_at, correct: Boolean(r.metadata?.correct), answer: r.metadata?.answer });
  }
  return { byQuestion, quizOf };
}

export class MistakeNotebookService {
  static async forStudent(studentId: string): Promise<MistakeNotebook> {
    const items: MistakeItem[] = [];

    const { byQuestion, quizOf } = await quizHistories(studentId);
    const quizTitles = new Map<string, string>();
    for (const [qid, history] of byQuestion) {
      const st = mistakeStatus(history);
      if (!st) continue;
      const quizId = quizOf.get(qid)!;
      const questions = await db.getQuizQuestions(quizId).catch(() => [] as any[]);
      const q = (questions as any[]).find((x) => x.id === qid);
      if (!q) continue;
      if (!quizTitles.has(quizId)) quizTitles.set(quizId, (await db.getQuizById(quizId).catch(() => null) as any)?.title || 'Quiz');
      items.push({
        key: `quiz:${qid}`,
        source: 'quiz',
        question_id: qid,
        question_type: q.question_type,
        question_text: q.question_text,
        options: (q.options || []).map((o: string) => ({ id: o, text: o })),
        topic: q.topic_name || q.metadata?.topic_name || q.topic_id || 'General',
        context: quizTitles.get(quizId)!,
        ...st,
      });
    }

    const gate = await (db as any).getGateQuestionAttempts(studentId).catch(() => [] as any[]);
    const gateByQ = new Map<string, Outcome[]>();
    for (const a of gate as any[]) {
      if (!hasAnswer(a.selected_answer)) continue;
      const list = gateByQ.get(a.question_id) || [];
      list.push({ at: a.attempted_at, correct: Boolean(a.is_correct), answer: a.selected_answer });
      gateByQ.set(a.question_id, list);
    }
    for (const [qid, history] of gateByQ) {
      const st = mistakeStatus(history);
      if (!st) continue;
      const q: any = await db.getGateQuestionById(qid).catch(() => null);
      if (!q) continue;
      items.push({
        key: `gate:${qid}`,
        source: 'gate',
        question_id: qid,
        question_type: q.question_type,
        question_text: q.question_statement,
        options: (q.options || []).map((o: any) => ({ id: o.id, text: o.text })),
        topic: q.subject || q.topic_id || 'GATE',
        context: `GATE ${q.paper_code}${q.year ? ` ${q.year}` : ''}`,
        ...st,
      });
    }

    items.sort((a, b) => (a.status === b.status ? Date.parse(b.last_wrong_at) - Date.parse(a.last_wrong_at) : a.status === 'open' ? -1 : 1));
    const topics = new Map<string, { open: number; fixed: number }>();
    for (const it of items) {
      const t = topics.get(it.topic) || { open: 0, fixed: 0 };
      t[it.status === 'open' ? 'open' : 'fixed']++;
      topics.set(it.topic, t);
    }
    return {
      items,
      open: items.filter((i) => i.status === 'open').length,
      fixed: items.filter((i) => i.status === 'fixed').length,
      by_topic: [...topics.entries()].map(([topic, c]) => ({ topic, ...c })).sort((a, b) => b.open - a.open || b.fixed - a.fixed),
    };
  }

  /** Grades a retry. The correct answer and explanation are returned only after the student has answered. */
  static async retry(studentId: string, source: MistakeSource, questionId: string, answer: unknown) {
    if (!hasAnswer(answer)) throw new ValidationError('Choose or enter an answer first.');
    if (source === 'gate') {
      const r = await GateService.attemptQuestion(studentId, questionId, answer, 0);
      return { correct: r.is_correct, correct_answer: r.correct_answer, explanation: r.explanation };
    }
    if (source !== 'quiz') throw new ValidationError('Unknown question source.');
    // Only questions this student actually got wrong can be retried here.
    const { byQuestion, quizOf } = await quizHistories(studentId);
    if (!byQuestion.has(questionId)) throw new NotFoundError('This question is not in your mistake notebook.');
    const questions = await db.getQuizQuestions(quizOf.get(questionId)!);
    const q: any = (questions as any[]).find((x) => x.id === questionId);
    if (!q) throw new NotFoundError('Question not found.');
    const result = QuestionEvaluationService.evaluateAnswer(q, answer as any);
    await ActivityService.recordActivity(studentId, 'MISTAKE_REVIEWED', 'QUIZ_QUESTION', questionId, `Retried: ${String(q.question_text).slice(0, 80)}`, {
      source: 'quiz',
      question_id: questionId,
      correct: result.is_correct,
      answer,
    });
    return { correct: result.is_correct, correct_answer: q.correct_answer, explanation: q.explanation };
  }
}
