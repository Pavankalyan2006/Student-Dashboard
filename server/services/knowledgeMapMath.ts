// Pure logic for the Knowledge Graph: links the student's syllabus topics to their own evidence (answered
// questions, mistakes, notes, flashcard decks) and gives each topic a state. No imports, no I/O.
//
// States, from the student's records only:
//   needs_revision  a question on this topic was answered wrong and has not been answered right since
//   demonstrated    at least 3 questions on it answered right, with at least 70% of answers right
//   practiced       questions answered on it, or the topic was revised in the syllabus tracker
//   learning        ticked as covered in the syllabus tracker, or notes or flashcards exist for it
//   not_started     none of the above
// Opening a lesson never counts as mastery; only answered questions can make a topic "demonstrated".

export type TopicState = 'needs_revision' | 'demonstrated' | 'practiced' | 'learning' | 'not_started';
export const TOPIC_STATES: TopicState[] = ['needs_revision', 'demonstrated', 'practiced', 'learning', 'not_started'];
export const DEMONSTRATED_MIN_CORRECT = 3;
export const DEMONSTRATED_MIN_ACCURACY = 0.7;

export interface MapTopicInput {
  id: string;
  name: string;
  unit?: string;
  completed: boolean;
  revision_count: number;
  prerequisites?: string[];
}
export interface MapSubjectInput {
  id: string;
  name: string;
  code?: string;
  topics: MapTopicInput[];
}
/** Answered questions grouped by the topic label the question carries. */
export interface PracticeInput {
  topic: string;
  answered: number;
  correct: number;
}
export interface MistakeTopicInput {
  topic: string;
  open: number;
  fixed: number;
}
export interface TextItem {
  id: string;
  title: string;
  /** Extra text that may name the topic: subject, tags, source. */
  text?: string;
}

export interface MapTopic extends MapTopicInput {
  state: TopicState;
  answered: number;
  correct: number;
  /** correct / answered, 0-100, or null with no answered questions. */
  accuracy: number | null;
  open_mistakes: number;
  fixed_mistakes: number;
  notes: { id: string; title: string }[];
  decks: { id: string; title: string }[];
  /** Ids of topics this one depends on: explicit prerequisites, else the previous topic in the same unit. */
  depends_on: string[];
  /** Why the state was given, in plain words. */
  reason: string;
}
export interface MapSubject {
  id: string;
  name: string;
  code?: string;
  topics: MapTopic[];
  counts: Record<TopicState, number>;
}
export interface KnowledgeMap {
  subjects: MapSubject[];
  /** Topics needing revision, most open mistakes first. */
  needs_revision: { subject: string; subject_id: string; topic: string; topic_id: string; open_mistakes: number }[];
  /**
   * Foundations to check: a topic the student is working on whose earlier topic has not been started.
   * Ordered as they appear in the syllabus.
   */
  missing_foundations: { subject: string; topic: string; topic_id: string; before: string; before_id: string }[];
  /** For each subject, the first topic in syllabus order that is not yet learning or better. */
  next_topics: { subject: string; subject_id: string; topic: string; topic_id: string }[];
  /** Practice labels that match no syllabus topic (for example a quiz on a subject not in the syllabus). */
  unmatched_practice: (PracticeInput & { open_mistakes: number })[];
  totals: Record<TopicState, number> & { topics: number };
}

const STOP = new Set(['and', 'the', 'of', 'in', 'to', 'for', 'with', 'on', 'a', 'an', 'its', 'using', 'introduction', 'basics', 'basic', 'concepts', 'unit', 'part', 'fundamentals']);

/** Lower-case words of at least 3 characters, without common filler words. */
export function keywords(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9+#]+/g) || []).filter((w) => w.length >= 3 && !STOP.has(w));
}

/**
 * True when `text` is about `topic`: the whole topic name appears in it, or at least two thirds of the topic's
 * keywords (and at least two of them) do. Single-keyword topics need the whole name.
 */
export function mentions(text: string, topic: string): boolean {
  const t = ` ${text.toLowerCase()} `;
  const name = topic.toLowerCase().trim();
  if (name.length >= 3 && t.includes(name)) return true;
  const kw = [...new Set(keywords(topic))];
  if (kw.length < 2) return false;
  const words = new Set(keywords(text));
  const hit = kw.filter((k) => words.has(k)).length;
  return hit >= 2 && hit / kw.length >= 2 / 3;
}

const about = (label: string, topic: string) => mentions(label, topic) || mentions(topic, label);
const zero = (): Record<TopicState, number> => ({ needs_revision: 0, demonstrated: 0, practiced: 0, learning: 0, not_started: 0 });
const RANK: Record<TopicState, number> = { not_started: 0, learning: 1, practiced: 2, needs_revision: 2, demonstrated: 3 };

export function topicState(t: { completed: boolean; revision_count: number }, answered: number, correct: number, open: number, hasMaterial: boolean): { state: TopicState; reason: string } {
  if (open > 0) return { state: 'needs_revision', reason: `${open} question${open === 1 ? '' : 's'} answered wrong and not yet answered right` };
  if (correct >= DEMONSTRATED_MIN_CORRECT && answered > 0 && correct / answered >= DEMONSTRATED_MIN_ACCURACY)
    return { state: 'demonstrated', reason: `${correct} of ${answered} answers right` };
  if (answered > 0) return { state: 'practiced', reason: `${correct} of ${answered} answers right so far` };
  if (t.revision_count > 0) return { state: 'practiced', reason: `Revised ${t.revision_count} time${t.revision_count === 1 ? '' : 's'} in your syllabus tracker` };
  if (t.completed) return { state: 'learning', reason: 'Ticked as covered in your syllabus tracker; no questions answered on it yet' };
  if (hasMaterial) return { state: 'learning', reason: 'You have notes or flashcards on it; no questions answered yet' };
  return { state: 'not_started', reason: 'No notes, practice or syllabus progress yet' };
}

export function buildKnowledgeMap(subjects: MapSubjectInput[], practice: PracticeInput[], mistakes: MistakeTopicInput[], notes: TextItem[], decks: TextItem[]): KnowledgeMap {
  const usedLabels = new Set<string>();
  const outSubjects: MapSubject[] = subjects.map((s) => {
    const topics: MapTopic[] = s.topics.map((t, i) => {
      let answered = 0;
      let correct = 0;
      let open = 0;
      let fixed = 0;
      for (const p of practice) {
        if (about(p.topic, t.name)) {
          answered += p.answered;
          correct += p.correct;
          usedLabels.add(p.topic);
        }
      }
      for (const m of mistakes) {
        if (about(m.topic, t.name)) {
          open += m.open;
          fixed += m.fixed;
          usedLabels.add(m.topic);
        }
      }
      const linkedNotes = notes.filter((n) => mentions(`${n.title} ${n.text || ''}`, t.name)).map((n) => ({ id: n.id, title: n.title }));
      const linkedDecks = decks.filter((d) => mentions(`${d.title} ${d.text || ''}`, t.name)).map((d) => ({ id: d.id, title: d.title }));
      const { state, reason } = topicState(t, answered, correct, open, linkedNotes.length + linkedDecks.length > 0);
      const prev = s.topics[i - 1];
      const explicit = (t.prerequisites || []).map((name) => s.topics.find((x) => x.id === name || x.name.toLowerCase() === name.toLowerCase())?.id).filter(Boolean) as string[];
      return {
        ...t,
        state,
        reason,
        answered,
        correct,
        accuracy: answered ? Math.round((correct / answered) * 100) : null,
        open_mistakes: open,
        fixed_mistakes: fixed,
        notes: linkedNotes.slice(0, 5),
        decks: linkedDecks.slice(0, 5),
        depends_on: explicit.length ? explicit : prev && prev.unit === t.unit ? [prev.id] : [],
      };
    });
    const counts = zero();
    for (const t of topics) counts[t.state]++;
    return { id: s.id, name: s.name, code: s.code, topics, counts };
  });

  const needs_revision = outSubjects
    .flatMap((s) => s.topics.filter((t) => t.state === 'needs_revision').map((t) => ({ subject: s.name, subject_id: s.id, topic: t.name, topic_id: t.id, open_mistakes: t.open_mistakes })))
    .sort((a, b) => b.open_mistakes - a.open_mistakes || a.topic.localeCompare(b.topic));

  const missing_foundations: KnowledgeMap['missing_foundations'] = [];
  const next_topics: KnowledgeMap['next_topics'] = [];
  for (const s of outSubjects) {
    const byId = new Map(s.topics.map((t) => [t.id, t]));
    for (const t of s.topics) {
      if (RANK[t.state] < 2) continue; // only topics the student is actively practising
      for (const dep of t.depends_on) {
        const d = byId.get(dep);
        if (d && d.state === 'not_started') missing_foundations.push({ subject: s.name, topic: t.name, topic_id: t.id, before: d.name, before_id: d.id });
      }
    }
    const next = s.topics.find((t) => t.state === 'not_started');
    if (next) next_topics.push({ subject: s.name, subject_id: s.id, topic: next.name, topic_id: next.id });
  }

  const totals = { ...zero(), topics: 0 };
  for (const s of outSubjects) {
    for (const k of TOPIC_STATES) totals[k] += s.counts[k];
    totals.topics += s.topics.length;
  }
  const openByLabel = new Map(mistakes.map((m) => [m.topic, m.open]));
  return {
    subjects: outSubjects,
    needs_revision,
    missing_foundations,
    next_topics,
    unmatched_practice: practice
      .filter((p) => !usedLabels.has(p.topic) && p.answered > 0)
      .map((p) => ({ ...p, open_mistakes: openByLabel.get(p.topic) || 0 }))
      .sort((a, b) => b.open_mistakes - a.open_mistakes || b.answered - a.answered),
    totals,
  };
}
