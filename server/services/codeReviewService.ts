// Code Review Intelligence: the student submits files (pasted, uploaded, from their saved Coding Lab code or from a
// connected GitHub repository). Deterministic static checks run first and always; the AI review adds line-level
// findings, complexity notes and test ideas when a model is available. Each finding can be accepted, rejected or
// marked "modified" with a note, and reviews are kept as history.
//
// Secrets are redacted before code is sent to the AI. No code is executed. A review never says code is secure or
// bug-free.
import { NotFoundError, ValidationError } from '../core/exceptions';
import { AIService } from '../ai/service';
import { parseModelJson } from '../ai/modelOutput';
import { logger } from '../core/logging';
import { CodingService } from './coding';
import { GitHubService } from './githubService';
import { GitHubAnalysisService } from './githubAnalysisService';
import { AgentActivityService } from './agentActivityService';
import {
  LIMITS,
  detectLanguage,
  hasTests,
  numbered,
  sanitiseAiFindings,
  severityCounts,
  staticReview,
  type FileMetrics,
  type FindingStatus,
  type ReviewFile,
  type ReviewFinding,
} from './codeReviewMath';

export * from './codeReviewMath';

export interface ComplexityNote {
  file: string;
  function: string;
  time: string;
  space: string;
  reasoning: string;
}
export interface TestSuggestion {
  title: string;
  input?: string;
  expected?: string;
  why?: string;
}

export interface StoredReview {
  id: string;
  title: string;
  created_at: string;
  source: { kind: 'paste' | 'saved' | 'github'; ref?: string };
  files: ReviewFile[];
  findings: ReviewFinding[];
  metrics: FileMetrics[];
  summary?: string;
  overall?: Record<string, string>;
  complexity: ComplexityNote[];
  test_suggestions: TestSuggestion[];
  ai: 'done' | 'unavailable' | 'failed' | 'skipped' | 'off';
  ai_error?: string;
  has_tests: boolean;
  secrets_redacted: number;
}

export const MAX_REVIEWS = 20;
export const DISCLAIMER =
  'This review is a set of automated checks and AI suggestions. It does not prove the code is correct, secure or free of bugs. Test it, and check each suggestion before you use it.';
export const codeReviewStores: { reviews: Map<string, StoredReview[]> } = { reviews: new Map() };

const OVERALL_KEYS = ['correctness', 'readability', 'maintainability', 'performance', 'error_handling', 'security', 'testing', 'documentation', 'architecture'];
const reviewId = () => `cr${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const cleanName = (v: unknown, i: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\\]/g, '')
    .replace(/^\/+/, '')
    .trim()
    .slice(0, 160) || `file${i + 1}.txt`;

function validateFiles(files: ReviewFile[]): ReviewFile[] {
  if (!files.length) throw new ValidationError('Add at least one file to review.');
  if (files.length > LIMITS.maxFiles) throw new ValidationError(`Review up to ${LIMITS.maxFiles} files at a time.`);
  const names = new Set<string>();
  let total = 0;
  for (const f of files) {
    if (!f.content.trim()) throw new ValidationError(`${f.name} is empty.`);
    if (f.content.includes('\u0000')) throw new ValidationError(`${f.name} is not a text file.`);
    if (f.content.length > LIMITS.maxFileChars) throw new ValidationError(`${f.name} is longer than ${LIMITS.maxFileChars.toLocaleString('en-US')} characters. Review a smaller part of it.`);
    total += f.content.length;
    if (names.has(f.name)) throw new ValidationError(`Two files are both named ${f.name}.`);
    names.add(f.name);
  }
  if (total > LIMITS.maxTotalChars) throw new ValidationError(`All files together must be under ${LIMITS.maxTotalChars.toLocaleString('en-US')} characters.`);
  return files;
}

async function resolveFiles(studentId: string, body: any): Promise<{ files: ReviewFile[]; source: StoredReview['source']; title?: string }> {
  if (body?.saved_code_id) {
    const saved = await CodingService.getSavedCode(String(body.saved_code_id), studentId);
    const ext = { python: 'py', javascript: 'js', c: 'c', cpp: 'cpp', java: 'java' }[saved.language] || 'txt';
    const name = `${String(saved.title || 'code').replace(/[^\w.-]+/g, '_').slice(0, 60)}.${ext}`;
    return { files: [{ name, content: String(saved.source_code || ''), language: detectLanguage(name, saved.source_code, saved.language) }], source: { kind: 'saved', ref: saved.id }, title: saved.title };
  }
  if (body?.github?.repo_id && body?.github?.path) {
    const path = String(body.github.path).slice(0, 300);
    const file = await GitHubService.getFileContent(String(body.github.repo_id), path, studentId);
    const content = String(file?.content || '');
    if (!content) throw new ValidationError('That file has no text content to review.');
    const name = cleanName(file.path || path, 0);
    return { files: [{ name, content, language: detectLanguage(name, content) }], source: { kind: 'github', ref: `${body.github.repo_id}:${name}` }, title: name };
  }
  if (!Array.isArray(body?.files)) throw new ValidationError('Paste code, upload files, or pick saved code or a repository file.');
  const files = body.files.slice(0, LIMITS.maxFiles + 1).map((f: any, i: number) => {
    const name = cleanName(f?.name, i);
    const content = String(f?.content ?? '').replace(/\r\n/g, '\n');
    return { name, content, language: detectLanguage(name, content, f?.language) };
  });
  return { files, source: { kind: 'paste' } };
}

function aiPrompt(files: ReviewFile[], staticFindings: ReviewFinding[]): string {
  const code = files.map((f) => `=== FILE: ${f.name} (${f.language}) ===\n${numbered(f.content)}`).join('\n\n');
  const already = staticFindings.length
    ? staticFindings
        .slice(0, 30)
        .map((f) => `- ${f.file}${f.line ? `:${f.line}` : ''} ${f.title}`)
        .join('\n')
    : '- none';
  return `Review the student's code below. Line numbers are shown before "|"; cite those numbers.

${code}

Automated checks already reported these (do not repeat them; add only what they missed):
${already}

Rules:
- Report only problems you can point to in this code. If something is fine, do not invent an issue.
- Do not say the code is secure, correct or bug-free.
- Keep explanations short and suitable for an engineering student. Explain why, not only what.
- "corrected_example" is a short snippet showing the fix, not the whole file.

Reply with JSON only, in this shape:
{
  "summary": "two or three sentences on the overall state of the code",
  "overall": { ${OVERALL_KEYS.map((k) => `"${k}": "one sentence"`).join(', ')} },
  "findings": [ { "file": "name", "line": 12, "end_line": 14, "severity": "critical|high|medium|low|info", "category": "correctness|readability|naming|maintainability|complexity|performance|error_handling|security|testing|best_practice|documentation|architecture", "title": "short", "explanation": "why it matters", "suggestion": "what to change", "corrected_example": "code", "learning": "the concept behind it" } ],
  "complexity": [ { "file": "name", "function": "name", "time": "O(...)", "space": "O(...)", "reasoning": "one sentence" } ],
  "test_suggestions": [ { "title": "what to test", "input": "example input", "expected": "expected result", "why": "what it catches" } ]
}`;
}

const s = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export class CodeReviewService {
  static list(studentId: string) {
    return (codeReviewStores.reviews.get(studentId) || []).map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      source: r.source,
      files: r.files.map((f) => ({ name: f.name, language: f.language })),
      counts: severityCounts(r.findings),
      decided: r.findings.filter((f) => f.status !== 'open').length,
      total: r.findings.length,
      ai: r.ai,
    }));
  }

  static get(studentId: string, id: string): StoredReview & { disclaimer: string } {
    const r = (codeReviewStores.reviews.get(studentId) || []).find((x) => x.id === id);
    if (!r) throw new NotFoundError('That review was not found.');
    return { ...r, disclaimer: DISCLAIMER };
  }

  static async create(studentId: string, body: any) {
    if (!body || typeof body !== 'object') throw new ValidationError('Send the code to review.');
    const { files: rawFiles, source, title } = await resolveFiles(studentId, body);
    const files = validateFiles(rawFiles);

    const findings: ReviewFinding[] = [];
    const metrics: FileMetrics[] = [];
    for (const f of files) {
      const r = staticReview(f);
      findings.push(...r.findings);
      metrics.push(r.metrics);
    }
    const tests = hasTests(files);
    if (!tests)
      findings.push({
        id: `s${Date.now().toString(36)}t`,
        file: files[0].name,
        severity: 'info',
        category: 'testing',
        title: 'No tests found',
        explanation: 'None of these files contain tests, so there is nothing that shows the code works or keeps working after a change.',
        suggestion: 'Add a few tests: a normal case, an edge case (empty input, one element, the largest value) and an invalid input.',
        source: 'static',
        rule: 'no-tests',
        status: 'open',
      });

    const review: StoredReview = {
      id: reviewId(),
      title: s(body.title, 120) || title || files.map((f) => f.name).join(', ').slice(0, 120),
      created_at: new Date().toISOString(),
      source,
      files,
      findings,
      metrics,
      complexity: [],
      test_suggestions: [],
      ai: 'skipped',
      has_tests: tests,
      secrets_redacted: 0,
    };

    if (body.ai === false) review.ai = 'skipped';
    else if (AgentActivityService.prefs(studentId).disabled.includes('coding')) {
      review.ai = 'off';
      review.ai_error = 'The Coding agent is switched off in the AI Agent Control Center, so only the automated checks ran.';
    } else {
      // Secrets never leave the server.
      let redacted = 0;
      const safeFiles = files.map((f) => {
        const { cleanText, secretsDetectedCount } = GitHubAnalysisService.redactSecrets(f.content);
        redacted += secretsDetectedCount;
        return { ...f, content: cleanText };
      });
      review.secrets_redacted = redacted;
      try {
        const result = await AIService.generate(
          [
            { role: 'system', content: 'You are a careful senior engineer reviewing an engineering student\'s code. You only report issues present in the code shown, cite real line numbers, and never claim code is secure or bug-free.' },
            { role: 'user', content: aiPrompt(safeFiles, findings) },
          ],
          'student_learning_agent',
          0.2
        );
        const out = parseModelJson<any>(result, 'Code review');
        review.summary = s(out?.summary, 1200) || undefined;
        if (out?.overall && typeof out.overall === 'object') {
          review.overall = {};
          for (const k of OVERALL_KEYS) if (s(out.overall[k], 400)) review.overall[k] = s(out.overall[k], 400);
        }
        review.findings.push(...sanitiseAiFindings(out?.findings, files));
        const names = new Set(files.map((f) => f.name));
        review.complexity = (Array.isArray(out?.complexity) ? out.complexity : [])
          .filter((c: any) => c && s(c.function, 80) && s(c.time, 40))
          .slice(0, 20)
          .map((c: any) => ({ file: names.has(c.file) ? c.file : files[0].name, function: s(c.function, 80), time: s(c.time, 40), space: s(c.space, 40), reasoning: s(c.reasoning, 400) }));
        review.test_suggestions = (Array.isArray(out?.test_suggestions) ? out.test_suggestions : [])
          .filter((t: any) => t && s(t.title, 200))
          .slice(0, 10)
          .map((t: any) => ({ title: s(t.title, 200), input: s(t.input, 400) || undefined, expected: s(t.expected, 400) || undefined, why: s(t.why, 400) || undefined }));
        review.ai = 'done';
      } catch (err: any) {
        const status = err?.statusCode || err?.status;
        review.ai = status === 503 ? 'unavailable' : 'failed';
        review.ai_error =
          status === 503
            ? 'The AI review is not available right now. The automated checks below still ran.'
            : 'The AI review did not come back in a usable form. The automated checks below still ran. Try again later.';
        logger.warn('Code review: AI part failed', { error: err?.message });
      }
    }

    const list = codeReviewStores.reviews.get(studentId) || [];
    codeReviewStores.reviews.set(studentId, [review, ...list].slice(0, MAX_REVIEWS));
    return { ...review, disclaimer: DISCLAIMER };
  }

  /** Accept, reject or mark a finding modified (with the student's note). */
  static decide(studentId: string, reviewIdParam: string, findingId: string, body: any) {
    const status = String(body?.status || '') as FindingStatus;
    if (!['open', 'accepted', 'rejected', 'modified'].includes(status)) throw new ValidationError('Status must be accepted, rejected, modified or open.');
    const list = codeReviewStores.reviews.get(studentId) || [];
    const idx = list.findIndex((r) => r.id === reviewIdParam);
    if (idx < 0) throw new NotFoundError('That review was not found.');
    const review = list[idx];
    const f = review.findings.find((x) => x.id === findingId);
    if (!f) throw new NotFoundError('That finding was not found.');
    const note = s(body?.note, 500);
    if (status === 'modified' && !note) throw new ValidationError('Say briefly how you changed the suggestion.');
    const updated: StoredReview = {
      ...review,
      findings: review.findings.map((x) => (x.id === findingId ? { ...x, status, student_note: note || undefined } : x)),
    };
    codeReviewStores.reviews.set(studentId, list.map((r, i) => (i === idx ? updated : r)));
    return updated.findings.find((x) => x.id === findingId)!;
  }

  static remove(studentId: string, id: string) {
    const list = codeReviewStores.reviews.get(studentId) || [];
    if (!list.some((r) => r.id === id)) throw new NotFoundError('That review was not found.');
    codeReviewStores.reviews.set(studentId, list.filter((r) => r.id !== id));
    return { removed: id };
  }
}
