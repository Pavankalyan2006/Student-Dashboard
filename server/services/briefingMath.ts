// Pure logic for the Daily Briefing: turns the student's own records into a short, ordered list for today.
// No imports, no I/O. Every item points at the record it came from; nothing is invented, and a source the
// student has no data in simply adds no items.

export type BriefingKind =
  | 'overdue'
  | 'due_soon'
  | 'start_prep'
  | 'study_task'
  | 'attendance'
  | 'revision'
  | 'foundation'
  | 'flashcards'
  | 'mistakes'
  | 'contest'
  | 'next_topic';

export type BriefingAction = 'done' | 'dismissed' | 'postponed' | 'accepted';

export interface BriefingItem {
  /** Stable id. Daily nudges (flashcards, mistakes) carry the date, so dismissing them lasts one day. */
  id: string;
  kind: BriefingKind;
  /** 1 = do today, 2 = important, 3 = when you have time. */
  priority: 1 | 2 | 3;
  title: string;
  detail: string;
  /** The record this item came from, in plain words ("Semester calendar", "Mistake Notebook"). */
  source: string;
  route: string;
  url?: string;
  /** Suggested minutes, used as the default when the student adds the item to today's plan. */
  minutes: number;
  /** Subject or topic, carried into the plan task. */
  subject?: string;
  topic?: string;
}

export interface ActionRecord {
  action: BriefingAction;
  at: string;
  /** postponed only: hidden until this date (YYYY-MM-DD). */
  until?: string;
}

export interface BriefingInput {
  today: string;
  deadlines: { id: string; source: string; kind: string; title: string; date: string; days_left: number; route: string; subject?: string; suggested_start?: string; url?: string }[];
  tasks: { id: string; plan_id: string; title: string; subject?: string; topic?: string; date?: string; status: string; duration_minutes?: number }[];
  due_flashcards: number;
  open_mistakes: { total: number; top_topics: string[] };
  needs_revision: { subject: string; topic: string; topic_id: string; open_mistakes: number }[];
  missing_foundations: { subject: string; topic: string; before: string; before_id: string }[];
  next_topics: { subject: string; topic: string; topic_id: string }[];
  attendance: { id: string; name: string; percent: number | null; must_attend: number; required: number }[];
  contests: { id: string; name: string; start: string; url: string; hours_away: number }[];
}

export interface Briefing {
  date: string;
  items: BriefingItem[];
  /** Items the student already acted on today, so the page can say "3 done". */
  handled: { id: string; title: string; action: BriefingAction }[];
  counts: { total: number; do_today: number; done: number; postponed: number; dismissed: number };
}

export const MAX_ITEMS = 12;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const dayWord = (d: number) => (d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`);

/** Every candidate item for today, before the student's earlier actions are applied. */
export function candidateItems(input: BriefingInput): BriefingItem[] {
  const items: BriefingItem[] = [];
  const { today } = input;

  for (const d of input.deadlines.filter((x) => x.days_left < 0 && x.source !== 'contest').slice(0, 4)) {
    items.push({
      id: `deadline:${d.source}:${d.id}`,
      kind: 'overdue',
      priority: 1,
      title: d.title,
      detail: `${d.kind}, was due ${plural(-d.days_left, 'day')} ago (${d.date})`,
      source: 'Deadlines',
      route: d.route,
      minutes: 45,
      subject: d.subject,
    });
  }
  for (const d of input.deadlines.filter((x) => x.days_left >= 0 && x.days_left <= 3 && x.source !== 'contest')) {
    items.push({
      id: `deadline:${d.source}:${d.id}`,
      kind: 'due_soon',
      priority: 1,
      title: d.title,
      detail: `${d.kind}, due ${dayWord(d.days_left)} (${d.date})`,
      source: 'Deadlines',
      route: d.route,
      minutes: 60,
      subject: d.subject,
    });
  }
  // Exams further away whose suggested preparation start has arrived.
  for (const d of input.deadlines.filter((x) => x.days_left > 3 && x.suggested_start && x.suggested_start <= today).slice(0, 3)) {
    items.push({
      id: `prep:${d.source}:${d.id}`,
      kind: 'start_prep',
      priority: 2,
      title: `Start preparing: ${d.title}`,
      detail: `${d.kind} on ${d.date}, ${plural(d.days_left, 'day')} away`,
      source: 'Deadlines',
      route: d.route,
      minutes: 60,
      subject: d.subject,
    });
  }
  for (const a of input.attendance.filter((x) => x.percent !== null && x.must_attend > 0)) {
    const need = Number.isFinite(a.must_attend) ? `attend the next ${plural(a.must_attend, 'class')} to get back to ${a.required}%` : `cannot reach ${a.required}% this term`;
    items.push({
      id: `attendance:${a.id}`,
      kind: 'attendance',
      priority: 1,
      title: `${a.name} attendance is ${a.percent}%`,
      detail: `Below your ${a.required}% minimum: ${need}`,
      source: 'Attendance',
      route: '/attendance',
      minutes: 0,
      subject: a.name,
    });
  }
  for (const t of input.tasks.filter((x) => x.status === 'PENDING' || x.status === 'IN_PROGRESS').slice(0, 5)) {
    const late = t.date && t.date < today;
    items.push({
      id: `task:${t.plan_id}:${t.id}`,
      kind: 'study_task',
      priority: late ? 1 : 2,
      title: t.title,
      detail: [late ? `Planned for ${t.date}, not done yet` : 'Planned for today', t.duration_minutes ? `${t.duration_minutes} min` : '', t.subject || ''].filter(Boolean).join(' · '),
      source: 'Study planner',
      route: '/study-planner',
      minutes: t.duration_minutes || 45,
      subject: t.subject,
      topic: t.topic,
    });
  }
  for (const r of input.needs_revision.slice(0, 3)) {
    items.push({
      id: `revise:${r.topic_id}`,
      kind: 'revision',
      priority: 2,
      title: `Revise ${r.topic}`,
      detail: `${r.subject}: ${plural(r.open_mistakes, 'question')} answered wrong and not yet answered right`,
      source: 'Knowledge Graph',
      route: `/knowledge-graph?topic=${encodeURIComponent(r.topic_id)}`,
      minutes: 30,
      subject: r.subject,
      topic: r.topic,
    });
  }
  for (const f of input.missing_foundations.slice(0, 2)) {
    items.push({
      id: `foundation:${f.before_id}`,
      kind: 'foundation',
      priority: 2,
      title: `Cover ${f.before} first`,
      detail: `${f.subject}: you are practising ${f.topic}, which comes after it in your syllabus`,
      source: 'Knowledge Graph',
      route: `/knowledge-graph?topic=${encodeURIComponent(f.before_id)}`,
      minutes: 40,
      subject: f.subject,
      topic: f.before,
    });
  }
  if (input.due_flashcards > 0) {
    items.push({
      id: `flashcards:${today}`,
      kind: 'flashcards',
      priority: 3,
      title: `Review ${plural(input.due_flashcards, 'flashcard')}`,
      detail: 'Due for review today in your decks',
      source: 'Flashcards',
      route: '/flashcards',
      minutes: Math.min(60, Math.max(5, Math.ceil(input.due_flashcards / 2))),
    });
  }
  if (input.open_mistakes.total > 0) {
    items.push({
      id: `mistakes:${today}`,
      kind: 'mistakes',
      priority: 3,
      title: `Retry ${plural(input.open_mistakes.total, 'open mistake')}`,
      detail: input.open_mistakes.top_topics.length ? `Most in ${input.open_mistakes.top_topics.slice(0, 3).join(', ')}` : 'Questions you answered wrong and have not answered right since',
      source: 'Mistake Notebook',
      route: '/mistakes',
      minutes: 20,
    });
  }
  for (const c of input.contests.filter((x) => x.hours_away >= 0 && x.hours_away <= 48).slice(0, 2)) {
    items.push({
      id: `contest:${c.id}`,
      kind: 'contest',
      priority: 3,
      title: c.name,
      detail: `Codeforces round starts in ${c.hours_away < 1 ? 'under an hour' : plural(Math.round(c.hours_away), 'hour')}`,
      source: 'Codeforces',
      route: '/deadlines',
      url: c.url,
      minutes: 120,
    });
  }
  for (const n of input.next_topics.slice(0, 2)) {
    items.push({
      id: `next:${n.topic_id}`,
      kind: 'next_topic',
      priority: 3,
      title: `Start ${n.topic}`,
      detail: `${n.subject}: the next topic in your syllabus you have not started`,
      source: 'Knowledge Graph',
      route: `/knowledge-graph?topic=${encodeURIComponent(n.topic_id)}`,
      minutes: 45,
      subject: n.subject,
      topic: n.topic,
    });
  }
  // One item per id: an overdue exam is not also "due soon".
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

/** True when an earlier action still hides the item today. */
export function isHidden(rec: ActionRecord | undefined, today: string): boolean {
  if (!rec) return false;
  if (rec.action === 'postponed') return !!rec.until && rec.until > today;
  return true;
}

export function buildBriefing(input: BriefingInput, actions: Record<string, ActionRecord>): Briefing {
  const all = candidateItems(input);
  const visible = all.filter((i) => !isHidden(actions[i.id], input.today));
  visible.sort((a, b) => a.priority - b.priority);
  const items = visible.slice(0, MAX_ITEMS);
  const handled = all
    .filter((i) => isHidden(actions[i.id], input.today))
    .map((i) => ({ id: i.id, title: i.title, action: actions[i.id].action }));
  return {
    date: input.today,
    items,
    handled,
    counts: {
      total: items.length,
      do_today: items.filter((i) => i.priority === 1).length,
      done: handled.filter((h) => h.action === 'done' || h.action === 'accepted').length,
      postponed: handled.filter((h) => h.action === 'postponed').length,
      dismissed: handled.filter((h) => h.action === 'dismissed').length,
    },
  };
}

/** Drops action records older than `keepDays` and keeps the newest `max`. */
export function pruneActions(actions: Record<string, ActionRecord>, nowMs: number, keepDays = 60, max = 300): Record<string, ActionRecord> {
  const cutoff = nowMs - keepDays * 86_400_000;
  const kept = Object.entries(actions)
    .filter(([, r]) => Date.parse(r.at) >= cutoff)
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .slice(0, max);
  return Object.fromEntries(kept);
}
