// Discover: answers with sources, in the style of a research assistant.
//
// The question is searched in three places:
//   1. Wikipedia (MediaWiki Action API; free, no key; text under CC BY-SA 4.0, attributed on every card)
//   2. OpenAlex scholarly works (free, no key) through the existing ResearchProviderService
//   3. The student's own notes on this platform
// The AI then writes a short answer that may only use those sources, citing them as [1], [2]...
// Citations that point at no source are removed. If nothing is found, no answer is generated.
import { ResearchProviderService } from './researchProviderService';
import { AIService } from '../ai/service';
import { db } from '../db/database';
import { logger } from '../core/logging';

export type DiscoverSourceKind = 'wikipedia' | 'paper' | 'note';

export interface DiscoverSource {
  n: number;
  kind: DiscoverSourceKind;
  title: string;
  url: string;
  snippet: string;
  publisher: string;
  license?: string;
  year?: number;
  authors?: string[];
}

export interface DiscoverProviderStatus {
  provider: 'Wikipedia' | 'OpenAlex' | 'Your notes';
  ok: boolean;
  count: number;
  error?: string;
}

export interface DiscoverResult {
  question: string;
  answer: string | null;
  cited: number[];
  sources: DiscoverSource[];
  providers: DiscoverProviderStatus[];
  ai_error?: string;
  generated_at: string;
}

const UA = 'BTech-Student-AI-Platform/1.0 (educational learning app)';
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);

export async function searchWikipedia(question: string, limit = 3): Promise<Omit<DiscoverSource, 'n'>[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: question,
    gsrlimit: String(limit),
    prop: 'extracts|info',
    exintro: '1',
    explaintext: '1',
    exlimit: String(limit),
    inprop: 'url',
    origin: '*',
  }).toString();
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json', 'User-Agent': UA }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Wikipedia answered ${res.status}`);
  const body: any = await res.json();
  const pages: any[] = Array.isArray(body?.query?.pages) ? body.query.pages : [];
  return pages
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p) => p?.title && p?.extract)
    .map((p) => ({
      kind: 'wikipedia' as const,
      title: String(p.title),
      url: String(p.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(String(p.title).replace(/ /g, '_'))}`),
      snippet: clip(String(p.extract).replace(/\s+/g, ' ').trim(), 900),
      publisher: 'Wikipedia',
      license: 'CC BY-SA 4.0',
    }));
}

export async function searchPapers(question: string, limit = 3): Promise<Omit<DiscoverSource, 'n'>[]> {
  const papers = await ResearchProviderService.searchOpenAlex({ query: question, limit });
  return papers
    .filter((p) => p.title && p.url)
    .map((p) => ({
      kind: 'paper' as const,
      title: p.title,
      url: String(p.url),
      snippet: clip(p.abstract || 'No abstract is available for this work.', 700),
      publisher: p.venue || 'OpenAlex',
      year: p.publication_year || undefined,
      authors: (p.authors || []).slice(0, 3),
    }));
}

const STOP = new Set('a an and are as at be by for from how in is it of on or that the this to was what when where which who why with does do vs versus explain define difference between'.split(' '));

export function keywords(q: string): string[] {
  return [...new Set(q.toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length > 1 && !STOP.has(w)))];
}

/** Scores the student's notes by how many question keywords they contain; the title counts more. */
export function rankNotes(notes: { id: string; title: string; content?: string; tags?: string[] }[], q: string, limit = 2) {
  const words = keywords(q);
  if (!words.length) return [];
  return notes
    .map((n) => {
      const title = (n.title || '').toLowerCase();
      const body = `${(n.tags || []).join(' ')} ${n.content || ''}`.toLowerCase();
      const hits = words.filter((w) => title.includes(w) || body.includes(w));
      const score = words.reduce((s, w) => s + (title.includes(w) ? 3 : 0) + (body.includes(w) ? 1 : 0), 0);
      return { n, score, coverage: hits.length / words.length };
    })
    .filter((x) => x.score > 0 && x.coverage >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.n);
}

async function searchOwnNotes(studentId: string, question: string): Promise<Omit<DiscoverSource, 'n'>[]> {
  const notes = await db.getNotes(studentId);
  return rankNotes(notes as any[], question).map((n: any) => ({
    kind: 'note' as const,
    title: n.title,
    url: `/notes/${n.id}`,
    snippet: clip(String(n.content || n.description || '').replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim(), 600),
    publisher: 'Your notes',
  }));
}

/** Removes citation markers that do not point at a real source and lists the ones that remain. */
export function cleanCitations(text: string, sourceCount: number): { text: string; cited: number[] } {
  const cited = new Set<number>();
  const cleaned = text
    .replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_m, inner: string) => {
      const ok = inner
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= sourceCount);
      ok.forEach((n) => cited.add(n));
      return ok.length ? ok.map((n) => `[${n}]`).join('') : '';
    })
    .replace(/[ \t]+([.,;:])/g, '$1');
  return { text: cleaned.trim(), cited: [...cited].sort((a, b) => a - b) };
}

export function buildDiscoverPrompt(question: string, sources: DiscoverSource[]): string {
  const list = sources
    .map((s) => `[${s.n}] ${s.title} (${s.publisher}${s.year ? `, ${s.year}` : ''})\n${s.snippet}`)
    .join('\n\n');
  return [
    `Question: ${question}`,
    '',
    'Sources:',
    list,
    '',
    'Write a clear answer for a B.Tech student in 120–250 words, in Markdown.',
    'Use ONLY facts stated in the sources above. After each sentence that uses a source, cite it like [1] or [2][3].',
    'If the sources do not answer part of the question, say so plainly instead of guessing.',
    'End with one line starting "Go deeper:" naming the single most useful source to read next, with its citation.',
  ].join('\n');
}

export class DiscoverService {
  static async answer(studentId: string, rawQuestion: string): Promise<DiscoverResult> {
    const question = String(rawQuestion || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const providers: DiscoverProviderStatus[] = [];
    const run = async (provider: DiscoverProviderStatus['provider'], fn: () => Promise<Omit<DiscoverSource, 'n'>[]>) => {
      try {
        const items = await fn();
        providers.push({ provider, ok: true, count: items.length });
        return items;
      } catch (err: any) {
        const error = err?.name === 'TimeoutError' ? 'timed out' : err?.message || 'unreachable';
        providers.push({ provider, ok: false, count: 0, error });
        logger.warn(`Discover: ${provider} search failed`, { error });
        return [];
      }
    };

    const [wiki, papers, notes] = await Promise.all([
      run('Wikipedia', () => searchWikipedia(question)),
      run('OpenAlex', () => searchPapers(question)),
      run('Your notes', () => searchOwnNotes(studentId, question)),
    ]);
    const sources: DiscoverSource[] = [...notes, ...wiki, ...papers].map((s, i) => ({ ...s, n: i + 1 }));
    const base = { question, sources, providers, generated_at: new Date().toISOString() };
    if (!sources.length) return { ...base, answer: null, cited: [] };

    try {
      const result = await AIService.generate(
        [
          {
            role: 'system',
            content:
              'You are a careful research assistant for students. You answer only from the numbered sources you are given and cite them. You never invent facts, numbers, names or sources.',
          },
          { role: 'user', content: buildDiscoverPrompt(question, sources) },
        ],
        undefined,
        0.2
      );
      if (AIService.isUnavailableResult(result)) {
        return { ...base, answer: null, cited: [], ai_error: 'The AI answer is unavailable right now. The sources are listed below.' };
      }
      const { text, cited } = cleanCitations(result.text || '', sources.length);
      if (!text) return { ...base, answer: null, cited: [], ai_error: 'The AI returned an empty answer. The sources are listed below.' };
      return { ...base, answer: text, cited };
    } catch (err: any) {
      logger.warn('Discover: AI answer failed', { error: err?.message });
      return { ...base, answer: null, cited: [], ai_error: 'The AI answer is unavailable right now. The sources are listed below.' };
    }
  }
}
