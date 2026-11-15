// Delivery measures for mock-interview answers.
//
// These are counts taken from the answer text (and its time, when the page sent one): length, sentence length,
// filler words, structure words and pace. They are not a judgement of confidence, honesty or ability, and the
// report says so. For a voice answer they are measured on the browser's transcript, which can mis-hear words.

export interface DeliveryMetrics {
  words: number;
  sentences: number;
  avg_sentence_words: number;
  filler_words: number;
  fillers_found: string[];
  structure_markers: number;
  /** Situation, Task, Action, Result signposts that appear in the answer. */
  star_parts: string[];
  words_per_minute?: number;
  notes: string[];
}

// Words and phrases that usually carry no meaning in a spoken or written answer. "like" and "actually" are left out
// because they are common in normal use and would be counted wrongly.
const FILLERS = ['um', 'umm', 'uh', 'uhh', 'er', 'erm', 'hmm', 'basically', 'you know', 'i mean', 'kind of', 'sort of', 'stuff like that', 'and all'];
const MARKERS = ['first', 'firstly', 'second', 'secondly', 'third', 'then', 'next', 'finally', 'because', 'therefore', 'so that', 'for example', 'for instance', 'in summary', 'to summarise', 'to summarize', 'as a result', 'however', 'on the other hand', 'overall'];
const STAR: Record<string, RegExp> = {
  Situation: /\b(situation|context|background|during (my|our|the)|when i was|at the time)\b/,
  Task: /\b(task|my role|i was responsible|goal was|needed to|had to)\b/,
  Action: /\b(i (built|wrote|designed|decided|implemented|led|created|fixed|changed|proposed|organised|organized|set up))\b/,
  Result: /\b(result|outcome|as a result|in the end|we (reduced|improved|increased|delivered|won|shipped)|which (reduced|improved|increased))\b/,
};

const countPhrase = (text: string, phrase: string) => {
  const re = new RegExp(`(^|[^a-z])${phrase.replace(/ /g, '\\s+')}(?=[^a-z]|$)`, 'g');
  return (text.match(re) || []).length;
};

/** Pure. */
export function deliveryMetrics(answer: string, durationSeconds?: number): DeliveryMetrics {
  const text = ` ${String(answer || '').toLowerCase().replace(/[’']/g, "'")} `;
  const words = (answer.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length;
  const sentences = Math.max(words ? 1 : 0, (answer.match(/[^.!?\n]+[.!?]+|[^.!?\n]+\n|[^.!?\n]+$/g) || []).filter((s) => /[A-Za-z0-9]/.test(s)).length);
  const fillersFound: string[] = [];
  let filler = 0;
  for (const f of FILLERS) {
    const n = countPhrase(text, f);
    if (n) {
      filler += n;
      fillersFound.push(f);
    }
  }
  let markers = 0;
  for (const m of MARKERS) markers += countPhrase(text, m);
  const star = Object.entries(STAR).filter(([, re]) => re.test(text)).map(([k]) => k);
  const avg = sentences ? Math.round((words / sentences) * 10) / 10 : 0;
  const wpm = durationSeconds && durationSeconds >= 10 && words ? Math.round(words / (durationSeconds / 60)) : undefined;

  const notes: string[] = [];
  if (words > 0 && words < 40) notes.push('Short answer: interviewers usually expect a few sentences with a reason or an example.');
  if (avg > 35) notes.push('Long sentences: splitting them makes the answer easier to follow.');
  if (words >= 40 && filler / words > 0.04) notes.push(`Filler words appear often (${filler}): pausing instead reads more clearly.`);
  if (words >= 60 && markers === 0) notes.push('No signposts such as "first", "because" or "for example": they help the listener follow your structure.');
  if (wpm && wpm > 190) notes.push(`Pace of about ${wpm} words a minute is fast for speaking.`);
  return { words, sentences, avg_sentence_words: avg, filler_words: filler, fillers_found: fillersFound, structure_markers: markers, star_parts: star, words_per_minute: wpm, notes };
}

export interface DeliverySummary {
  answers_measured: number;
  avg_words: number;
  total_filler_words: number;
  answers_with_structure: number;
  avg_words_per_minute?: number;
  time_used_minutes: number;
  time_planned_minutes: number;
  time_note: string;
  disclaimer: string;
}

/** Pure: totals across a session's answers, and how the time used compares with the planned duration. */
export function deliverySummary(metrics: DeliveryMetrics[], plannedMinutes: number, elapsedSeconds: number): DeliverySummary {
  const n = metrics.length;
  const sum = (f: (m: DeliveryMetrics) => number) => metrics.reduce((a, m) => a + f(m), 0);
  const paced = metrics.filter((m) => m.words_per_minute);
  const used = Math.round((elapsedSeconds / 60) * 10) / 10;
  const planned = Math.max(0, Math.round(plannedMinutes || 0));
  let time_note = 'No answer times were recorded.';
  if (elapsedSeconds > 0 && planned > 0) {
    const ratio = used / planned;
    time_note = ratio > 1.15 ? `You took ${used} min of the ${planned} planned: practise shorter answers.` : ratio < 0.4 ? `You used ${used} min of the ${planned} planned: there was room for more detail.` : `You used ${used} min of the ${planned} planned.`;
  }
  return {
    answers_measured: n,
    avg_words: n ? Math.round(sum((m) => m.words) / n) : 0,
    total_filler_words: sum((m) => m.filler_words),
    answers_with_structure: metrics.filter((m) => m.structure_markers > 0 || m.star_parts.length >= 2).length,
    avg_words_per_minute: paced.length ? Math.round(paced.reduce((a, m) => a + (m.words_per_minute || 0), 0) / paced.length) : undefined,
    time_used_minutes: used,
    time_planned_minutes: planned,
    time_note,
    disclaimer: 'Counted from your answer text and timing. These are not a measure of confidence or ability, and voice transcripts can mis-hear words.',
  };
}
