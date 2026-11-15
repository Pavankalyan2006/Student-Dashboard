// Pure logic for Previous Papers: splits a question paper's text into questions and finds which syllabus
// topics are asked most. No I/O. Matching uses the same strict rule as the Knowledge Graph, so a question that
// names no topic stays unmatched instead of being guessed onto one.
import { mentions, keywords } from './knowledgeMapMath';

/** Lower case, possessives dropped, simple plurals folded ("Banker's algorithms" -> "banker algorithm"). */
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .replace(/[a-z0-9+#]+/g, (w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}

/**
 * Syllabus topic names are often several topics joined ("Paging, Segmentation & Page Replacement"). A question
 * matches the topic when it mentions the whole name or any one part of it, using the Knowledge Graph's strict
 * rule on each part. Parts made only of filler words are ignored.
 */
export function questionMatchesTopic(question: string, topic: string): boolean {
  const q = normalise(question);
  const parts = [topic, ...topic.split(/\s*(?:&|,|;|\/|\band\b|\s[-–]\s)\s*/i)].map((p) => normalise(p.trim())).filter((p) => p.length >= 3 && keywords(p).length > 0);
  return [...new Set(parts)].some((p) => mentions(q, p));
}

export interface PaperQuestion {
  text: string;
  marks?: number;
  unit?: string;
}

export const MAX_QUESTIONS = 200;
const MAX_Q_LEN = 600;

const QUESTION_START = /^\s*(?:Q\s*\.?\s*\d+[a-z]?|Question\s+\d+|\d{1,2}\s*[.)]|\(?[a-h]\)|\(?(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\))\s*[.:)-]?\s*/i;
const UNIT_HEADING = /^\s*(UNIT|MODULE|SECTION|PART)\s*[-–:]?\s*([A-Z0-9]{1,4})\b/i;
const MARKS = /[[(]\s*(\d{1,2})\s*(?:marks?|m)\s*[\])]|\b(\d{1,2})\s*marks?\b/i;
const NOISE = /^(?:or|\s*|time\s*:.*|max(?:imum)?\.?\s*marks.*|answer\s+(?:any|all).*|note\s*:.*|page\s+\d+.*)$/i;

/** Splits pasted or extracted paper text into questions, carrying the unit heading and any marks shown. */
export function splitQuestions(text: string): PaperQuestion[] {
  const out: PaperQuestion[] = [];
  let unit: string | undefined;
  let cur: PaperQuestion | null = null;
  const push = () => {
    if (cur && cur.text.trim().length >= 8) {
      const m = MARKS.exec(cur.text);
      const marks = m ? Number(m[1] || m[2]) : undefined;
      out.push({ text: cur.text.replace(/\s+/g, ' ').trim().slice(0, MAX_Q_LEN), marks: marks && marks <= 100 ? marks : undefined, unit: cur.unit });
    }
    cur = null;
  };
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (NOISE.test(line)) continue;
    const u = UNIT_HEADING.exec(line);
    if (u && line.length < 40) {
      push();
      unit = `${u[1][0].toUpperCase()}${u[1].slice(1).toLowerCase()} ${u[2].toUpperCase()}`;
      continue;
    }
    if (QUESTION_START.test(line)) {
      push();
      // "1. a) Explain…": drop both the number and the part letter.
      cur = { text: line.replace(QUESTION_START, '').replace(QUESTION_START, ''), unit };
    } else if (cur) cur.text += ` ${line}`;
    else if (line.length >= 25 && /\?|explain|define|describe|derive|write|compare|discuss|what|how|why|draw|prove|solve|find/i.test(line)) {
      // Papers that do not number questions: one question per line.
      out.length < MAX_QUESTIONS && (cur = { text: line, unit });
      push();
    }
    if (out.length >= MAX_QUESTIONS) break;
  }
  push();
  return out.slice(0, MAX_QUESTIONS);
}

export interface PaperInput {
  id: string;
  subject_id: string;
  year?: number;
  questions: PaperQuestion[];
}
export interface TopicInput {
  id: string;
  name: string;
  unit?: string;
  state?: string;
}
export interface TopicFrequency {
  topic_id: string;
  topic: string;
  unit?: string;
  state?: string;
  questions: number;
  papers: number;
  marks: number;
  years: number[];
  examples: string[];
}
export interface SubjectAnalysis {
  subject_id: string;
  papers: number;
  questions: number;
  matched_questions: number;
  topics: TopicFrequency[];
  never_asked: { topic_id: string; topic: string }[];
  /** Asked in at least half the papers (and at least twice) but not yet demonstrated in the Knowledge Graph. */
  focus: { topic_id: string; topic: string; papers: number; state?: string }[];
  unmatched: string[];
}

export function analyseSubject(subjectId: string, topics: TopicInput[], papers: PaperInput[]): SubjectAnalysis {
  const mine = papers.filter((p) => p.subject_id === subjectId);
  const freq = new Map<string, TopicFrequency>();
  const unmatched: string[] = [];
  let total = 0;
  let matched = 0;
  for (const p of mine) {
    for (const q of p.questions) {
      total++;
      const hits = topics.filter((t) => questionMatchesTopic(q.text, t.name));
      if (!hits.length) {
        if (unmatched.length < 20) unmatched.push(q.text.slice(0, 160));
        continue;
      }
      matched++;
      for (const t of hits) {
        const f = freq.get(t.id) || { topic_id: t.id, topic: t.name, unit: t.unit, state: t.state, questions: 0, papers: 0, marks: 0, years: [], examples: [] };
        f.questions++;
        f.marks += q.marks || 0;
        if (p.year && !f.years.includes(p.year)) f.years.push(p.year);
        if (f.examples.length < 3) f.examples.push(q.text.slice(0, 200));
        (f as any)._papers = ((f as any)._papers || new Set()).add(p.id);
        freq.set(t.id, f);
      }
    }
  }
  const rows = [...freq.values()].map((f) => {
    const { _papers, ...rest } = f as any;
    return { ...rest, papers: (_papers as Set<string>).size, years: [...f.years].sort((a, b) => b - a) } as TopicFrequency;
  });
  rows.sort((a, b) => b.papers - a.papers || b.questions - a.questions || b.marks - a.marks || a.topic.localeCompare(b.topic));
  const asked = new Set(rows.map((r) => r.topic_id));
  const threshold = Math.max(2, Math.ceil(mine.length / 2));
  return {
    subject_id: subjectId,
    papers: mine.length,
    questions: total,
    matched_questions: matched,
    topics: rows,
    never_asked: topics.filter((t) => !asked.has(t.id)).map((t) => ({ topic_id: t.id, topic: t.name })),
    focus: rows.filter((r) => r.papers >= threshold && r.state !== 'demonstrated').map((r) => ({ topic_id: r.topic_id, topic: r.topic, papers: r.papers, state: r.state })),
    unmatched,
  };
}
