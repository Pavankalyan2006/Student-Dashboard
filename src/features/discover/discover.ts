/** Shape of POST /discover/answer (see server/services/discoverService.ts). */
export interface DiscoverSource {
  n: number;
  kind: 'wikipedia' | 'paper' | 'note';
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  license?: string;
  year?: number;
  authors?: string[];
}

export interface DiscoverResult {
  question: string;
  answer: string | null;
  cited: number[];
  sources: DiscoverSource[];
  providers: { provider: string; ok: boolean; count: number; error?: string }[];
  ai_error?: string;
  generated_at: string;
}

/** Turns [n] citation markers into in-page links to the matching source card. */
export function linkCitations(markdown: string): string {
  return markdown.replace(/\[(\d{1,2})\](?!\()/g, (_m, n) => `[[${n}]](#src-${n})`);
}

/** A note the student can keep: the answer plus the full source list with links and licences. */
export function noteFromResult(r: DiscoverResult): { title: string; content: string; tags: string[] } {
  const sources = r.sources
    .map((s) => {
      const meta = [s.publisher, s.year, s.license].filter(Boolean).join(', ');
      const url = s.kind === 'note' ? '' : ` — ${s.url}`;
      return `${s.n}. ${s.title} (${meta})${url}`;
    })
    .join('\n');
  return {
    title: r.question.slice(0, 120),
    content: `${r.answer || ''}\n\n## Sources\n${sources}\n\n_Saved from Discover on ${new Date(r.generated_at).toLocaleString()}._`,
    tags: ['discover'],
  };
}

const MAX_HISTORY = 8;
export const historyKey = (studentId: string) => `btech.discover.${studentId}`;

export function loadHistory(studentId: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(historyKey(studentId)) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string').slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

export function pushHistory(studentId: string, question: string): string[] {
  const q = question.trim();
  const next = [q, ...loadHistory(studentId).filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(historyKey(studentId), JSON.stringify(next));
  } catch {
    /* storage full or blocked: history is optional */
  }
  return next;
}
