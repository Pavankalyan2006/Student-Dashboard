/**
 * Phase 7: one search across the platform.
 *
 * Each source is read at query time for the signed-in student only. Private sources (notes, documents,
 * projects, research, previous papers, code reviews, ML files, AI conversations, the knowledge graph,
 * applications and competitions) never return another student's data. Shared sources are the course
 * catalogue and the community/catalogue index. Every result says where it came from and where the
 * words matched (for a document, the page). A source that fails is skipped and named, never guessed.
 */
import { db } from '../db/database';
import { paperStores } from './previousPapersService';
import { codeReviewStores } from './codeReviewService';
import { competitionStores } from './competitionHubService';
import { LearningModulesService } from './learningModulesService';
import { MlLabService } from './mlLabService';
import { knowledgeMapFor } from './knowledgeMapService';

export const SEARCH_TYPES = [
  'courses', 'topics', 'notes', 'documents', 'projects', 'research', 'previous_papers', 'code',
  'conversations', 'opportunities', 'community',
] as const;
export type GlobalSearchType = (typeof SEARCH_TYPES)[number];

export interface GlobalSearchItem {
  id: string;
  type: GlobalSearchType;
  title: string;
  /** A short passage around the match. */
  description: string;
  url: string;
  tags: string[];
  /** Where the result comes from, e.g. "Your documents · page 3". */
  source: string;
  matched_in: string;
  private: boolean;
  score: number;
}

export interface GlobalSearchResult {
  items: GlobalSearchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: Partial<Record<GlobalSearchType, number>>;
  sources_failed: string[];
}

export const SEARCH_LIMITS = { queryChars: 200, maxBody: 20000, maxDocPages: 400, maxConversations: 60, maxMessages: 300 };

// ---------------------------------------------------------------------------
// Matching (pure, exported for tests)
// ---------------------------------------------------------------------------

export function queryTokens(q: string): string[] {
  return Array.from(new Set(String(q || '').toLowerCase().slice(0, SEARCH_LIMITS.queryChars).split(/[^a-z0-9+#.]+/).map((t) => t.replace(/^\.+|\.+$/g, '')).filter((t) => t.length >= 2)));
}

/** Every token must appear in the title or body. Title hits score higher than body hits. */
export function scoreText(tokens: string[], title: string, body: string, phrase: string): number {
  if (!tokens.length) return 0;
  const t = title.toLowerCase();
  const b = body.toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (t.includes(tok)) score += 10;
    else if (b.includes(tok)) score += 3;
    else return 0;
  }
  if (phrase && t.includes(phrase)) score += 25;
  else if (phrase && b.includes(phrase)) score += 8;
  if (t.startsWith(tokens[0])) score += 5;
  return score;
}

/** About `width` characters of the body around the first matching token, with ellipses. */
export function snippet(body: string, tokens: string[], width = 160): string {
  const clean = String(body || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const lower = clean.toLowerCase();
  let at = -1;
  for (const tok of tokens) {
    const i = lower.indexOf(tok);
    if (i >= 0 && (at < 0 || i < at)) at = i;
  }
  if (at < 0 || clean.length <= width) return clean.slice(0, width) + (clean.length > width ? '…' : '');
  const start = Math.max(0, at - Math.floor(width / 3));
  const end = Math.min(clean.length, start + width);
  return `${start > 0 ? '…' : ''}${clean.slice(start, end)}${end < clean.length ? '…' : ''}`;
}

const cap = (s: unknown) => String(s ?? '').slice(0, SEARCH_LIMITS.maxBody);

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

type Candidate = Omit<GlobalSearchItem, 'score' | 'description' | 'matched_in'> & { body: string; matched_in?: string };

export class GlobalSearchService {
  public static async search(studentId: string, rawQuery: string, type: string = 'all', page = 1, limit = 10): Promise<GlobalSearchResult> {
    const phrase = String(rawQuery || '').toLowerCase().trim().slice(0, SEARCH_LIMITS.queryChars);
    const tokens = queryTokens(phrase);
    const wanted = SEARCH_TYPES.includes(type as GlobalSearchType) ? [type as GlobalSearchType] : [...SEARCH_TYPES];
    const failed: string[] = [];
    const empty: GlobalSearchResult = { items: [], total: 0, page, limit, totalPages: 1, counts: {}, sources_failed: [] };
    if (!tokens.length) return empty;

    const results: GlobalSearchItem[] = [];
    const push = (c: Candidate) => {
      const s = scoreText(tokens, c.title, c.body, phrase);
      if (s <= 0) return;
      const inTitle = tokens.every((tok) => c.title.toLowerCase().includes(tok));
      const { body, ...rest } = c;
      results.push({ ...rest, score: s, description: snippet(body || c.title, tokens), matched_in: c.matched_in || (inTitle ? 'title' : 'content') });
    };
    const run = async (name: GlobalSearchType, label: string, fn: () => Promise<void> | void) => {
      if (!wanted.includes(name)) return;
      try {
        await fn();
      } catch {
        failed.push(label);
      }
    };

    await Promise.all([
      run('courses', 'Courses', async () => {
        const list = await db.getCourses({ limit: 1000 }, studentId);
        for (const c of list.items) {
          push({ id: c.id, type: 'courses', title: c.title, body: `${c.code || ''} ${c.short_description || ''} ${c.description || ''} ${(c as any).tags?.join(' ') || ''}`, url: `/courses/${c.id}`, tags: [c.code].filter(Boolean) as string[], source: c.is_enrolled ? 'Course catalogue · enrolled' : 'Course catalogue', private: false });
        }
      }),
      run('topics', 'Knowledge graph', async () => {
        const map = await knowledgeMapFor(studentId);
        for (const s of map?.subjects || []) {
          push({ id: `subj:${s.id}`, type: 'topics', title: s.name, body: `${s.code || ''} ${s.topics.map((t) => t.name).join(', ')}`, url: '/knowledge-graph', tags: [s.code].filter(Boolean) as string[], source: 'Your subjects (knowledge graph)', private: true });
          for (const t of s.topics) {
            push({ id: `topic:${t.id}`, type: 'topics', title: t.name, body: `${s.name}. State: ${String(t.state).toLowerCase().replace(/_/g, ' ')}.`, url: '/knowledge-graph', tags: [s.name], source: `Your knowledge graph · ${s.name}`, private: true });
          }
        }
      }),
      run('notes', 'Notes', async () => {
        for (const n of await db.getNotes(studentId)) {
          push({ id: n.id, type: 'notes', title: n.title, body: cap(`${n.description || ''} ${(n as any).content || ''} ${((n as any).tags || []).join(' ')}`), url: `/notes/${n.id}`, tags: ((n as any).tags || []).slice(0, 4), source: 'Your notes', private: true });
        }
      }),
      run('documents', 'Documents', async () => {
        for (const d of await db.getDocuments(studentId)) {
          const head = `${d.description || ''} ${(d as any).metadata?.subject || ''} ${((d as any).metadata?.tags || []).join(' ')}`;
          const titleHit = scoreText(tokens, d.title, head, phrase) > 0;
          let pageHit: { page: number; text: string } | null = null;
          if (!titleHit) {
            const pages = (await db.getDocumentPages(d.id, studentId)).slice(0, SEARCH_LIMITS.maxDocPages);
            for (const p of pages) {
              const text = String(p.text || '').toLowerCase();
              if (tokens.every((tok) => text.includes(tok))) {
                pageHit = { page: p.page_number, text: String(p.text || '') };
                break;
              }
            }
          }
          if (titleHit) {
            push({ id: d.id, type: 'documents', title: d.title, body: head, url: `/documents/${d.id}/page/1`, tags: [], source: 'Your documents', private: true });
          } else if (pageHit) {
            push({ id: d.id, type: 'documents', title: d.title, body: pageHit.text, url: `/documents/${d.id}/page/${pageHit.page}`, tags: [], source: `Your documents · page ${pageHit.page}`, matched_in: `page ${pageHit.page}`, private: true });
          }
        }
      }),
      run('projects', 'Projects', async () => {
        for (const p of await db.getProjects(studentId)) {
          push({ id: p.id, type: 'projects', title: p.title, body: cap(`${p.description} ${p.problem_statement || ''} ${p.domain || ''} ${(p.tags || []).join(' ')}`), url: `/projects/${p.id}/overview`, tags: (p.tags || []).slice(0, 4), source: 'Your projects', private: true });
        }
      }),
      run('research', 'Research', async () => {
        for (const rp of await db.getResearchProjects(studentId)) {
          push({ id: rp.id, type: 'research', title: rp.title, body: `${rp.topic} ${rp.objective} ${rp.domain}`, url: `/research/${rp.id}`, tags: [rp.domain].filter(Boolean), source: 'Your research projects', private: true });
          for (const paper of await db.getResearchPapers(rp.id, studentId)) {
            push({ id: paper.id, type: 'research', title: paper.title, body: cap(`${(paper.authors || []).join(', ')} ${paper.abstract || ''} ${paper.notes || ''}`), url: `/research/${rp.id}/papers`, tags: [paper.publication_year ? String(paper.publication_year) : ''].filter(Boolean), source: `Saved paper · ${rp.title}`, private: true });
          }
          for (const idea of await db.getResearchIdeas(rp.id, studentId)) {
            push({ id: idea.id, type: 'research', title: idea.title, body: cap(`${idea.problem} ${idea.proposed_approach} ${idea.hypothesis || ''}`), url: `/research/${rp.id}/ideas`, tags: [], source: `Research idea · ${rp.title}`, private: true });
          }
        }
      }),
      run('previous_papers', 'Previous papers', () => {
        for (const pp of paperStores.papers.get(studentId) || []) {
          push({ id: pp.id, type: 'previous_papers', title: pp.title, body: cap(`${pp.subject_name} ${pp.exam || ''} ${pp.year || ''} ${pp.questions.map((q: any) => q.text).join(' ')}`), url: '/previous-papers', tags: [pp.subject_name, pp.year ? String(pp.year) : ''].filter(Boolean), source: `Your previous papers · ${pp.subject_name}`, private: true });
        }
      }),
      run('code', 'Code', () => {
        for (const r of codeReviewStores.reviews.get(studentId) || []) {
          push({ id: r.id, type: 'code', title: r.title, body: cap(`${r.files.map((f: any) => `${f.path || f.name || ''} ${f.content || ''}`).join(' ')} ${r.summary || ''}`), url: '/code-review', tags: r.files.map((f: any) => f.path || f.name).filter(Boolean).slice(0, 3), source: 'Your code reviews', private: true });
        }
        for (const ws of (MlLabService as any).workspaces?.get?.(studentId) || []) {
          for (const f of ws.files || []) {
            push({ id: `${ws.id}:${f.id}`, type: 'code', title: f.name, body: cap(f.content), url: '/ml-lab', tags: [ws.name], source: `ML Lab workspace · ${ws.name}`, private: true });
          }
        }
      }),
      run('conversations', 'AI conversations', async () => {
        const convs = (await db.getConversationsByStudentId(studentId)).slice(0, SEARCH_LIMITS.maxConversations);
        for (const c of convs) {
          const msgs = (await db.getMessagesByConversationId(c.id, studentId)).slice(-SEARCH_LIMITS.maxMessages);
          const hit = msgs.find((m) => tokens.every((tok) => String(m.content || '').toLowerCase().includes(tok)));
          const titleHit = tokens.every((tok) => c.title.toLowerCase().includes(tok));
          if (!hit && !titleHit) continue;
          push({ id: c.id, type: 'conversations', title: c.title, body: hit ? cap(hit.content) : '', url: '/ai-tutor', tags: [], source: `Your AI conversations · ${new Date(c.updated_at).toLocaleDateString('en-IN')}`, matched_in: hit ? (hit.role === 'user' ? 'your message' : 'AI reply') : 'title', private: true });
        }
      }),
      run('opportunities', 'Opportunities', async () => {
        for (const a of await LearningModulesService.getApplications(studentId)) {
          push({ id: a.id, type: 'opportunities', title: `${a.role} at ${a.company_name}`, body: `${a.location || ''} ${a.status} ${(a as any).notes || ''}`, url: '/applications', tags: [String(a.status).toLowerCase()], source: 'Your application tracker', private: true });
        }
        for (const e of competitionStores.events.get(studentId) || []) {
          push({ id: e.id, type: 'opportunities', title: e.title, body: `${e.kind} ${e.organiser} ${e.notes || ''} ${e.location || ''}`, url: '/competitions', tags: [], source: 'Your Competition Hub events', private: true });
        }
      }),
      run('community', 'Community', async () => {
        const idx = await db.search('', 'community', 1, 500, studentId);
        for (const it of idx.items) {
          push({ id: it.id, type: 'community', title: it.title, body: `${it.description} ${(it.tags || []).join(' ')}`, url: it.url, tags: it.tags.slice(0, 4), source: 'Community', private: false });
        }
      }),
    ]);

    results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    const counts: Partial<Record<GlobalSearchType, number>> = {};
    for (const r of results) counts[r.type] = (counts[r.type] || 0) + 1;
    const total = results.length;
    const start = (page - 1) * limit;
    return { items: results.slice(start, start + limit), total, page, limit, totalPages: Math.ceil(total / limit) || 1, counts, sources_failed: failed };
  }
}
