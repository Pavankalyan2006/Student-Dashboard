/**
 * Phase 6: reads bibliographic metadata out of the text of an uploaded paper.
 *
 * Every value comes from the document's own text, and each one records where it was found
 * (page number and how it was read). A field that cannot be found stays empty: nothing is
 * guessed, and the uploader's name is never used as the author. Authors read from a PDF
 * are flagged for the student to check, because layout-based reading is error-prone.
 */

export interface PageText {
  page_number: number;
  text: string;
}

export type MetadataField = 'title' | 'authors' | 'abstract' | 'publication_year' | 'doi' | 'keywords' | 'references';

export interface FieldProvenance {
  /** Where the value came from: the uploaded file's text, or a DOI match on OpenAlex. */
  source: 'DOCUMENT_TEXT' | 'OPENALEX_DOI';
  page?: number;
  method: string;
  /** True when the student should check the value before citing it. */
  needs_check?: boolean;
}

export interface ExtractedPaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  publication_year: number;
  doi?: string;
  keywords: string[];
  references: string[];
  provenance: Partial<Record<MetadataField, FieldProvenance>>;
  /** Fields that were looked for and not found. */
  missing: MetadataField[];
}

export const EXTRACTION_LIMITS = { maxReferences: 200, maxKeywords: 15, maxAbstract: 4000, maxAuthors: 30 };

const DOI_RE = /\b(10\.\d{4,9}\/[^\s"'<>(),;]+[^\s"'<>(),;.])/i;
const HEADER_NOISE = /^(arxiv|preprint|proceedings|journal|vol\.|volume|issn|isbn|doi|https?:|www\.|copyright|©|received|accepted|published|page \d|\d+$)/i;
const SECTION_RE = /^(\d+\.?\s*)?(introduction|background|related work|keywords|index terms|key words)\b/i;

function lines(text: string): string[] {
  return String(text || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** Finds the first DOI in the text of the first pages. */
export function findDoi(pages: PageText[]): { doi: string; page: number } | null {
  for (const p of pages.slice(0, 3)) {
    const m = p.text.match(DOI_RE);
    if (m) return { doi: m[1].replace(/[.]+$/, ''), page: p.page_number };
  }
  return null;
}

/** Text between an "Abstract" heading and the next section heading on the first two pages. */
export function findAbstract(pages: PageText[]): { abstract: string; page: number } | null {
  for (const p of pages.slice(0, 2)) {
    const text = p.text.replace(/\r/g, '');
    const start = text.search(/\babstract\b[\s:.—–-]*/i);
    if (start < 0) continue;
    const after = text.slice(start).replace(/^\s*abstract[\s:.—–-]*/i, '');
    const end = after.search(/\n\s*(\d+\.?\s*|I\.\s*)?(introduction|keywords|key words|index terms)\b/i);
    const body = (end >= 0 ? after.slice(0, end) : after.slice(0, 2500)).replace(/\s+/g, ' ').trim();
    if (body.split(' ').length >= 20) return { abstract: body.slice(0, EXTRACTION_LIMITS.maxAbstract), page: p.page_number };
  }
  return null;
}

/** "Keywords:" or "Index Terms—" lines on the first two pages. */
export function findKeywords(pages: PageText[]): { keywords: string[]; page: number } | null {
  for (const p of pages.slice(0, 2)) {
    const m = p.text.match(/\b(?:keywords|key words|index terms)\s*[:—–-]\s*([^\n]+(?:\n(?!\s*(?:\d+\.?\s*)?introduction)[^\n]+)?)/i);
    if (!m) continue;
    const kws = m[1]
      .split(/[;,·•]/)
      .map((k) => k.replace(/\s+/g, ' ').replace(/[.]$/, '').trim())
      .filter((k) => k.length > 1 && k.length < 80)
      .slice(0, EXTRACTION_LIMITS.maxKeywords);
    if (kws.length) return { keywords: kws, page: p.page_number };
  }
  return null;
}

/** A plausible publication year on page 1: near ©, "published", or a venue line. Never the current date. */
export function findYear(pages: PageText[]): { year: number; page: number } | null {
  const first = pages[0];
  if (!first) return null;
  const nowYear = new Date().getFullYear();
  const valid = (y: number) => y >= 1950 && y <= nowYear + 1;
  const near = first.text.match(/(?:©|\(c\)|copyright|published|accepted|received|proceedings|conference|journal)[^\n]{0,60}?\b(19[5-9]\d|20\d\d)\b/i);
  if (near && valid(Number(near[1]))) return { year: Number(near[1]), page: first.page_number };
  return null;
}

/** Title: the first substantial line(s) at the top of page 1 that are not a running header. */
export function findTitle(pages: PageText[]): { title: string; page: number; lineIndex: number } | null {
  const first = pages[0];
  if (!first) return null;
  const ls = lines(first.text).slice(0, 15);
  for (let i = 0; i < ls.length; i++) {
    const l = ls[i];
    if (HEADER_NOISE.test(l) || DOI_RE.test(l) || /^abstract\b/i.test(l)) continue;
    const words = l.split(' ').length;
    if (words < 3 || l.length > 250) continue;
    // A title can wrap onto a second line that starts lowercase or continues a phrase.
    let title = l;
    const next = ls[i + 1];
    if (next && next.length < 120 && /^[a-z(:]/.test(next) && !/@/.test(next)) title = `${title} ${next}`;
    return { title: title.replace(/[.]$/, ''), page: first.page_number, lineIndex: i };
  }
  return null;
}

/**
 * Authors: the lines between the title and the abstract that look like a list of names.
 * Lines with affiliations or emails are skipped. The result always needs checking.
 */
export function findAuthors(pages: PageText[], titleLineIndex: number): { authors: string[]; page: number } | null {
  const first = pages[0];
  if (!first) return null;
  const ls = lines(first.text);
  const stop = ls.findIndex((l, i) => i > titleLineIndex && (/^abstract\b/i.test(l) || SECTION_RE.test(l)));
  const block = ls.slice(titleLineIndex + 1, stop > 0 ? stop : titleLineIndex + 6);
  const nameRe = /^[A-Z][a-zA-Z'’.-]+(?:\s+[A-Z][a-zA-Z'’.-]*){1,3}$/;
  const out: string[] = [];
  for (const l of block) {
    if (/@|university|institute|department|college|school|laboratory|lab\b|inc\.|ltd|street|india|usa|china/i.test(l)) continue;
    const parts = l
      .replace(/[\d*†‡§¶,]+(?=\s|$)/g, ',')
      .split(/\s*(?:,|\band\b|&|·)\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    const names = parts.filter((s) => nameRe.test(s));
    if (names.length && names.length >= parts.length / 2) out.push(...names);
  }
  const unique = Array.from(new Set(out)).slice(0, EXTRACTION_LIMITS.maxAuthors);
  return unique.length ? { authors: unique, page: first.page_number } : null;
}

/** Entries after a "References" or "Bibliography" heading, split on [n] or "n." markers. */
export function findReferences(pages: PageText[]): { references: string[]; page: number } | null {
  for (let i = 0; i < pages.length; i++) {
    const idx = pages[i].text.search(/\n\s*(references|bibliography)\s*\n/i);
    if (idx < 0) continue;
    const rest = '\n' + [pages[i].text.slice(idx), ...pages.slice(i + 1).map((p) => p.text)].join('\n').replace(/^\s*(references|bibliography)\s*/i, '');
    let entries = rest.split(/\n\s*\[\d{1,3}\]\s*/).slice(1);
    if (entries.length < 2) entries = rest.split(/\n\s*\d{1,3}\.\s+(?=[A-Z])/).slice(1);
    const refs = entries
      .map((e) => e.replace(/\s+/g, ' ').trim())
      .filter((e) => e.length > 20)
      .slice(0, EXTRACTION_LIMITS.maxReferences);
    if (refs.length) return { references: refs, page: pages[i].page_number };
  }
  return null;
}

export function extractPaperMetadata(pages: PageText[]): ExtractedPaperMetadata {
  const sorted = [...pages].filter((p) => p && typeof p.text === 'string').sort((a, b) => a.page_number - b.page_number);
  const out: ExtractedPaperMetadata = { title: '', authors: [], abstract: '', publication_year: 0, keywords: [], references: [], provenance: {}, missing: [] };

  const title = findTitle(sorted);
  if (title) {
    out.title = title.title;
    out.provenance.title = { source: 'DOCUMENT_TEXT', page: title.page, method: 'first substantial line on the first page', needs_check: true };
    const authors = findAuthors(sorted, title.lineIndex);
    if (authors) {
      out.authors = authors.authors;
      out.provenance.authors = { source: 'DOCUMENT_TEXT', page: authors.page, method: 'name-like lines between the title and the abstract', needs_check: true };
    }
  }
  const abs = findAbstract(sorted);
  if (abs) {
    out.abstract = abs.abstract;
    out.provenance.abstract = { source: 'DOCUMENT_TEXT', page: abs.page, method: 'text after the "Abstract" heading' };
  }
  const year = findYear(sorted);
  if (year) {
    out.publication_year = year.year;
    out.provenance.publication_year = { source: 'DOCUMENT_TEXT', page: year.page, method: 'year next to a copyright, publication or venue line', needs_check: true };
  }
  const doi = findDoi(sorted);
  if (doi) {
    out.doi = doi.doi;
    out.provenance.doi = { source: 'DOCUMENT_TEXT', page: doi.page, method: 'DOI pattern in the text' };
  }
  const kws = findKeywords(sorted);
  if (kws) {
    out.keywords = kws.keywords;
    out.provenance.keywords = { source: 'DOCUMENT_TEXT', page: kws.page, method: 'the "Keywords" or "Index Terms" line' };
  }
  const refs = findReferences(sorted);
  if (refs) {
    out.references = refs.references;
    out.provenance.references = { source: 'DOCUMENT_TEXT', page: refs.page, method: 'entries after the "References" heading' };
  }
  const fields: MetadataField[] = ['title', 'authors', 'abstract', 'publication_year', 'doi', 'keywords', 'references'];
  out.missing = fields.filter((f) => !out.provenance[f]);
  return out;
}
