// Previous Papers: the student adds their own past question papers (pasted text, or a text PDF or .txt file),
// and the page shows which of their syllabus topics are asked most, joined with their Knowledge Graph state.
//
// Only the split questions are kept, not the file. Scanned PDFs have no text to read and OCR is not set up on
// this deployment, so they are refused with a clear message instead of being guessed.
import { NotFoundError, ValidationError } from '../core/exceptions';
import { DocumentParserRegistry } from '../parsers';
import { semesterCommandCenterService } from './semesterCommandCenterService';
import { knowledgeMapFor } from './knowledgeMapService';
import { analyseSubject, splitQuestions, type PaperQuestion, type SubjectAnalysis } from './paperMath';

export * from './paperMath';

export interface StoredPaper {
  id: string;
  subject_id: string;
  subject_name: string;
  title: string;
  year?: number;
  exam?: string;
  source: 'text' | 'pdf' | 'txt';
  questions: PaperQuestion[];
  created_at: string;
}

export const MAX_PAPERS = 40;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const paperStores: { papers: Map<string, StoredPaper[]> } = { papers: new Map() };

const paperId = () => `pp${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clean = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

async function textFromFile(file: { name?: unknown; data?: unknown }): Promise<{ text: string; source: 'pdf' | 'txt' }> {
  const name = clean(file.name, 120).toLowerCase();
  const b64 = String(file.data || '').replace(/^data:[^,]*,/, '');
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64)) throw new ValidationError('The file could not be read.');
  const buf = Buffer.from(b64, 'base64');
  if (!buf.length) throw new ValidationError('The file is empty.');
  if (buf.length > MAX_FILE_BYTES) throw new ValidationError('Files must be 5 MB or smaller.');
  if (name.endsWith('.pdf')) {
    if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') throw new ValidationError('That file is not a PDF.');
    const parsed = await DocumentParserRegistry.parse(buf, 'application/pdf', 'pdf', { filename: name });
    if (parsed.metadata?.is_scanned) {
      throw new ValidationError('This PDF is a scan with no text in it. Text recognition (OCR) is not set up here, so paste the questions as text instead.');
    }
    return { text: parsed.pages.map((p) => p.text).join('\n'), source: 'pdf' };
  }
  if (name.endsWith('.txt')) {
    const text = buf.toString('utf8');
    if (text.includes('\u0000')) throw new ValidationError('That file is not plain text.');
    return { text, source: 'txt' };
  }
  throw new ValidationError('Upload a PDF or .txt file, or paste the questions.');
}

export class PreviousPapersService {
  static list(studentId: string): StoredPaper[] {
    return paperStores.papers.get(studentId) || [];
  }

  static async add(studentId: string, body: any): Promise<StoredPaper> {
    if (!body || typeof body !== 'object') throw new ValidationError('Send the paper details.');
    const existing = this.list(studentId);
    if (existing.length >= MAX_PAPERS) throw new ValidationError(`You can keep up to ${MAX_PAPERS} papers. Remove one first.`);
    const subjects = await semesterCommandCenterService.getSubjects(studentId);
    const subject = subjects.find((s: any) => String(s.id) === String(body.subject_id));
    if (!subject) throw new ValidationError('Pick one of the subjects in your syllabus.');
    const year = body.year === undefined || body.year === null || body.year === '' ? undefined : Number(body.year);
    if (year !== undefined && (!Number.isInteger(year) || year < 1990 || year > new Date().getFullYear() + 1)) throw new ValidationError('Year must be between 1990 and next year.');

    let text = '';
    let source: StoredPaper['source'] = 'text';
    if (body.file) ({ text, source } = await textFromFile(body.file));
    else text = String(body.text || '');
    if (text.length > 200_000) throw new ValidationError('That paper is too long. Paste one paper at a time.');
    const questions = splitQuestions(text);
    if (!questions.length) throw new ValidationError('No questions were found. Put each question on its own line, numbered like "1." or "Q1".');

    const paper: StoredPaper = {
      id: paperId(),
      subject_id: String(subject.id),
      subject_name: String(subject.name),
      title: clean(body.title, 120) || `${subject.name} paper${year ? ` ${year}` : ''}`,
      year,
      exam: clean(body.exam, 60) || undefined,
      source,
      questions,
      created_at: new Date().toISOString(),
    };
    // A new array each time, so the state store sees the change and persists it.
    paperStores.papers.set(studentId, [paper, ...existing]);
    return paper;
  }

  static remove(studentId: string, id: string) {
    const list = this.list(studentId);
    if (!list.some((p) => p.id === id)) throw new NotFoundError('That paper was not found.');
    paperStores.papers.set(studentId, list.filter((p) => p.id !== id));
    return { removed: id };
  }

  /** Papers (without question text) and the analysis per subject that has papers. */
  static async overview(studentId: string) {
    const papers = this.list(studentId);
    const [subjects, map] = await Promise.all([
      Promise.resolve().then(() => semesterCommandCenterService.getSubjects(studentId)).catch(() => [] as any[]),
      knowledgeMapFor(studentId).catch(() => null),
    ]);
    const stateOf = new Map<string, string>();
    for (const s of map?.subjects || []) for (const t of s.topics) stateOf.set(t.id, t.state);
    const analyses: (SubjectAnalysis & { subject: string })[] = [];
    for (const s of subjects as any[]) {
      if (!papers.some((p) => p.subject_id === String(s.id))) continue;
      const topics = (s.units || []).flatMap((u: any) => (u.topics || []).map((t: any) => ({ id: String(t.id), name: String(t.name), unit: String(u.name || ''), state: stateOf.get(String(t.id)) })));
      analyses.push({ subject: String(s.name), ...analyseSubject(String(s.id), topics, papers) });
    }
    return {
      subjects: (subjects as any[]).map((s) => ({ id: String(s.id), name: String(s.name), code: s.code || undefined, topics: (s.units || []).reduce((n: number, u: any) => n + (u.topics || []).length, 0) })),
      papers: papers.map(({ questions, ...p }) => ({ ...p, question_count: questions.length })),
      analyses,
    };
  }
}
