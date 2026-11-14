/** Shapes of GET /learning/mistakes and POST /learning/mistakes/retry (see server/services/mistakeNotebookService.ts). */
export interface MistakeItem {
  key: string;
  source: 'quiz' | 'gate';
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

export interface RetryResult {
  correct: boolean;
  correct_answer: unknown;
  explanation?: string;
}

/** Which input the retry needs: one choice, several choices, or typed text/number. */
export function answerInputKind(item: Pick<MistakeItem, 'question_type' | 'options'>): 'single' | 'multi' | 'text' {
  const t = item.question_type.toUpperCase();
  if (t === 'MULTI_SELECT' || t === 'MSQ') return 'multi';
  if (t === 'TRUE_FALSE') return 'single';
  if (t === 'NAT' || t === 'SHORT_ANSWER' || t === 'CODE_OUTPUT' || !item.options.length) return 'text';
  return 'single';
}

/** Shows an answer the way the student saw it: option letters become "A. text"; ranges become "a to b". */
export function formatAnswer(answer: unknown, options: { id: string; text: string }[] = []): string {
  const one = (a: unknown): string => {
    const s = String(a);
    const o = options.find((x) => x.id === s);
    return o && o.id !== o.text ? `${o.id}. ${o.text}` : s;
  };
  if (answer === null || answer === undefined || answer === '') return '—';
  if (Array.isArray(answer)) return answer.map(one).join(', ');
  if (typeof answer === 'object') {
    const r = answer as { min?: number; max?: number; exact?: number };
    if (r.exact !== undefined) return String(r.exact);
    if (r.min !== undefined && r.max !== undefined) return `${r.min} to ${r.max}`;
    return JSON.stringify(answer);
  }
  return one(answer);
}
