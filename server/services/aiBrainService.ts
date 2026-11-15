// My AI Brain: one place that shows what the platform holds about the student's learning, and answers
// questions about it from their own records only, with numbered sources.
//
// Sources are the student's notes, uploaded documents (with page numbers), projects, Knowledge Graph topics
// and Mistake Notebook topics, each read for this student only. Nothing is sent to the AI provider when the
// student has switched personalisation off in AI Memory, and the student's name, email and college are never
// part of a source.
import { db } from '../db/database';
import { logger } from '../core/logging';
import { ValidationError } from '../core/exceptions';
import { AIService } from '../ai/service';
import { AiMemoryService } from './aiMemoryService';
import { KnowledgeBaseService } from './knowledgeBaseService';
import { MistakeNotebookService } from './mistakeNotebookService';
import { AgentActivityService } from './agentActivityService';
import { BriefingService } from './briefingService';
import { rankNotes, cleanCitations } from './discoverService';
import { knowledgeMapFor, mentions } from './knowledgeMapService';

export type BrainSourceKind = 'note' | 'document' | 'project' | 'topic' | 'mistakes';

export interface BrainSource {
  n: number;
  kind: BrainSourceKind;
  title: string;
  snippet: string;
  route: string;
  page?: number;
}

export interface BrainAnswer {
  question: string;
  sources: BrainSource[];
  answer: string | null;
  cited: number[];
  /** Set when the AI could not answer; the sources are still returned. */
  ai_error?: string;
  /** Set when the student has switched personalisation off. */
  refused?: string;
  generated_at: string;
}

async function safe<T>(fn: () => T | Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const plain = (s: unknown) => String(s || '').replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim();

export function buildBrainPrompt(question: string, sources: BrainSource[]): string {
  const list = sources.map((s) => `[${s.n}] ${s.kind.toUpperCase()}: ${s.title}${s.page ? ` (page ${s.page})` : ''}\n${s.snippet}`).join('\n\n');
  return [
    `The student asks about their own study records: ${question}`,
    '',
    'Their records:',
    list,
    '',
    'Answer in 80–200 words, in Markdown, speaking to the student as "you".',
    'Use ONLY what the records above say. After each sentence that uses a record, cite it like [1] or [2][3].',
    'If you suggest something that the records do not state, start that sentence with "Suggestion:" and do not cite it.',
    'If the records do not answer the question, say so plainly. Never invent marks, dates, files or achievements.',
  ].join('\n');
}

/** Gathers the student's own records that match the question, as numbered sources. */
export async function findBrainSources(studentId: string, question: string): Promise<BrainSource[]> {
  const [notes, docs, projects, map, notebook] = await Promise.all([
    safe(() => db.getNotes(studentId) as Promise<any[]>, []),
    safe(() => KnowledgeBaseService.searchKnowledge(studentId, { query: question, limit: 3 } as any), { matches: [] } as any),
    safe(() => db.getProjects(studentId) as Promise<any[]>, []),
    safe(() => knowledgeMapFor(studentId), null as any),
    safe(() => MistakeNotebookService.forStudent(studentId), { by_topic: [] } as any),
  ]);
  const out: Omit<BrainSource, 'n'>[] = [];

  for (const n of rankNotes(notes.filter((x) => x.student_id === studentId), question, 3) as any[]) {
    out.push({ kind: 'note', title: String(n.title || 'Note'), snippet: clip(plain(n.content || n.description), 500), route: `/notes/${n.id}` });
  }
  for (const m of (docs.matches || []).slice(0, 3)) {
    out.push({ kind: 'document', title: String(m.document_title || 'Document'), snippet: clip(plain(m.snippet), 500), route: "/knowledge-base", page: m.page_number || undefined });
  }
  const projectRows = projects.filter((p) => p.student_id === studentId).map((p) => ({ id: p.id, title: p.title || p.name || 'Project', content: [p.description, (p.tech_stack || p.technologies || []).join?.(' ')].filter(Boolean).join(' ') }));
  for (const p of rankNotes(projectRows, question, 2) as any[]) {
    out.push({ kind: 'project', title: p.title, snippet: clip(plain(p.content), 400), route: `/projects/${p.id}` });
  }
  if (map) {
    const topics = map.subjects.flatMap((s: any) => s.topics.map((t: any) => ({ s, t }))).filter(({ t }: any) => mentions(question, t.name)).slice(0, 4);
    for (const { s, t } of topics) {
      out.push({
        kind: 'topic',
        title: `${t.name} (${s.name})`,
        snippet: `State: ${t.state.replace('_', ' ')}. ${t.reason}.${t.accuracy !== null ? ` Accuracy ${t.accuracy}% over ${t.answered} answers.` : ''}${t.open_mistakes ? ` ${t.open_mistakes} open mistakes.` : ''}`,
        route: `/knowledge-graph?topic=${encodeURIComponent(t.id)}`,
      });
    }
  }
  for (const m of (notebook.by_topic || []).filter((x: any) => x.open + x.fixed > 0 && (mentions(question, x.topic) || mentions(x.topic, question))).slice(0, 2)) {
    out.push({ kind: 'mistakes', title: `Mistakes in ${m.topic}`, snippet: `${m.open} open, ${m.fixed} fixed in your Mistake Notebook.`, route: '/mistakes' });
  }
  return out.map((s, i) => ({ ...s, n: i + 1 }));
}

export class AiBrainService {
  /** Counts of what the platform holds for this student, each from their own records. */
  static async overview(studentId: string) {
    const [notes, docs, decks, projects, notebook, map, workflows] = await Promise.all([
      safe(() => db.getNotes(studentId) as Promise<any[]>, []),
      safe(() => db.getDocuments(studentId) as Promise<any[]>, []),
      safe(() => db.getFlashcardDecks(studentId) as Promise<any[]>, []),
      safe(() => db.getProjects(studentId) as Promise<any[]>, []),
      safe(() => MistakeNotebookService.forStudent(studentId), { open: 0, fixed: 0 } as any),
      safe(() => knowledgeMapFor(studentId), null as any),
      safe(() => db.getAgentWorkflows(studentId, 50) as Promise<any[]>, []),
    ]);
    const memory = AiMemoryService.get(studentId);
    const own = (xs: any[]) => xs.filter((x) => x.student_id === studentId);
    return {
      personalize: memory.personalize,
      use_activity: memory.use_activity,
      memory_notes: memory.notes.length,
      counts: {
        notes: own(notes).length,
        documents: own(docs).length,
        flashcard_decks: own(decks).length,
        projects: own(projects).length,
        open_mistakes: Number(notebook.open) || 0,
        fixed_mistakes: Number(notebook.fixed) || 0,
        topics: map?.totals?.topics || 0,
        topics_demonstrated: map?.totals?.demonstrated || 0,
        topics_needs_revision: map?.totals?.needs_revision || 0,
        agent_requests: own(workflows).length,
        tool_calls_logged: AgentActivityService.list(studentId, 100).length,
      },
    };
  }

  static async ask(studentId: string, raw: unknown): Promise<BrainAnswer> {
    const question = String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    if (question.length < 3) throw new ValidationError('Ask a question of at least 3 characters.');
    const base = { question, generated_at: new Date().toISOString() };
    if (!AiMemoryService.get(studentId).personalize) {
      return { ...base, sources: [], answer: null, cited: [], refused: 'Personalised AI is off in AI Memory, so your records are not sent to the AI. Turn it on there to ask about your own data.' };
    }
    const sources = await findBrainSources(studentId, question);
    if (!sources.length) return { ...base, sources, answer: null, cited: [] };
    try {
      const result = await AIService.generate(
        [
          { role: 'system', content: "You answer a student's questions about their own study records. You use only the numbered records given, cite them, and never invent facts, marks, dates or files." },
          { role: 'user', content: buildBrainPrompt(question, sources) },
        ],
        undefined,
        0.2
      );
      if (AIService.isUnavailableResult(result)) return { ...base, sources, answer: null, cited: [], ai_error: 'The AI answer is unavailable right now. Your matching records are listed below.' };
      const { text, cited } = cleanCitations(result.text || '', sources.length);
      if (!text) return { ...base, sources, answer: null, cited: [], ai_error: 'The AI returned an empty answer. Your matching records are listed below.' };
      return { ...base, sources, answer: text, cited };
    } catch (err: any) {
      logger.warn('AI Brain: answer failed', { error: err?.message });
      return { ...base, sources, answer: null, cited: [], ai_error: 'The AI answer is unavailable right now. Your matching records are listed below.' };
    }
  }

  /** Everything the AI features keep about the student, as one JSON file they can download. */
  static async exportData(studentId: string) {
    const map = await safe(() => knowledgeMapFor(studentId), null as any);
    const memory = AiMemoryService.get(studentId);
    return {
      exported_at: new Date().toISOString(),
      ai_memory: { personalize: memory.personalize, use_activity: memory.use_activity, notes: memory.notes },
      agent_switches: AgentActivityService.prefs(studentId),
      agent_tool_log: AgentActivityService.list(studentId, 100),
      briefing_actions: BriefingService.actions(studentId),
      knowledge_graph: map
        ? map.subjects.map((s: any) => ({ subject: s.name, topics: s.topics.map((t: any) => ({ topic: t.name, state: t.state, reason: t.reason, answered: t.answered, correct: t.correct, open_mistakes: t.open_mistakes })) }))
        : [],
    };
  }
}
