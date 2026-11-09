// Phase 6: voluntary, private pilot feedback.
//
// Students in the controlled pilot can rate parts of the platform (1-5), report a problem, or
// raise a privacy/security concern. Each entry belongs to the student who wrote it: only that
// student can list or withdraw it through the API. There is no admin page; the owner reads an
// anonymised export with scripts/pilot/export-feedback.cjs.
//
// Data minimisation:
// - Consent to the notice (FEEDBACK_CONSENT_VERSION) is required for every submission.
// - Only fixed question ids and fixed choice lists are accepted; free text is optional, short,
//   and email addresses / phone numbers in it are redacted before it is stored.
// - Nothing from the student profile is copied into an entry (no name, email, college, CGPA).
// - Entries older than PILOT_FEEDBACK_RETENTION_DAYS (default 90) are deleted automatically.
import crypto from 'crypto';
import { ValidationError, NotFoundError, AppError } from '../core/exceptions';

export const FEEDBACK_CONSENT_VERSION = 'pilot-feedback-v1';

export const FEEDBACK_CONSENT_TEXT =
  'Your feedback is voluntary. It is used only to find problems and improve this learning platform during the pilot. ' +
  'It is private: other students never see it, and it is not shown on your profile or in the community. ' +
  'The project owner reads it in an export that replaces your account with a random code and never includes your name or email. ' +
  'Do not include passwords, phone numbers or other personal details in written answers. ' +
  'You can withdraw (delete) any feedback you sent from this page at any time. ' +
  'Feedback is deleted automatically after the retention period.';

export const RATING_LABELS = { 1: 'Very poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' } as const;

export const FEEDBACK_SECTIONS = [
  {
    key: 'registration',
    title: 'Registration',
    questions: [
      { id: 'reg_easy', text: 'Was registration easy?' },
      { id: 'reg_clear_details', text: 'Were the requested details clear?' },
      { id: 'reg_completion_worked', text: 'Did profile completion work correctly?' },
    ],
    text_prompt: { id: 'reg_confusing_fields', text: 'Was any field confusing? Which one?' },
  },
  {
    key: 'learning',
    title: 'Learning experience',
    questions: [
      { id: 'learn_dashboard_useful', text: 'Was the dashboard useful?' },
      { id: 'learn_course_navigation', text: 'Were courses easy to navigate?' },
      { id: 'learn_ai_understandable', text: 'Were AI explanations understandable?' },
      { id: 'learn_resources_relevant', text: 'Were learning resources relevant?' },
    ],
  },
  {
    key: 'labs',
    title: 'Practical labs',
    questions: [
      { id: 'lab_coding_easy', text: 'Was Coding Lab easy to use?' },
      { id: 'lab_code_execution', text: 'Did code execution work?' },
      { id: 'lab_sql_understandable', text: 'Was SQL Lab understandable?' },
      { id: 'lab_ml_useful', text: 'Was AI/ML experimentation useful?' },
    ],
  },
  {
    key: 'career',
    title: 'Career preparation',
    questions: [
      { id: 'career_resume_useful', text: 'Was Resume useful?' },
      { id: 'career_jobs_relevant', text: 'Were job recommendations relevant?' },
      { id: 'career_interview_helpful', text: 'Was Mock Interview feedback helpful?' },
    ],
  },
  {
    key: 'experience',
    title: 'User experience',
    questions: [
      { id: 'ux_navigation', text: 'Was the interface easy to navigate?' },
      { id: 'ux_reliable_loading', text: 'Did pages load reliably?' },
      { id: 'ux_mobile', text: 'Did the mobile experience work?' },
    ],
    yes_no: { id: 'ux_errors_encountered', text: 'Did you encounter errors?' },
  },
  {
    key: 'overall',
    title: 'Overall',
    questions: [{ id: 'overall_satisfaction', text: 'Overall, how satisfied are you with the platform?' }],
  },
] as const;

export const PILOT_TASKS = [
  { id: 'WF1', title: 'Registration and onboarding' },
  { id: 'WF2', title: 'Academic learning (course, AI Tutor, notes)' },
  { id: 'WF3', title: 'Revision (flashcards, quiz)' },
  { id: 'WF4', title: 'Programming (Coding Lab)' },
  { id: 'WF5', title: 'AI/ML experimentation (ML Lab)' },
  { id: 'WF6', title: 'Research (papers, documents, RAG)' },
  { id: 'WF7', title: 'Career preparation (resume, jobs, interview)' },
  { id: 'WF8', title: 'Learning goals' },
  { id: 'WF9', title: 'Community participation' },
  { id: 'WF10', title: 'Account management (settings, privacy)' },
] as const;

export const FEEDBACK_KINDS = ['SURVEY', 'PROBLEM', 'PRIVACY_CONCERN'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
const DEVICES = ['PHONE', 'TABLET', 'LAPTOP_DESKTOP'] as const;
const PROBLEM_IMPACT = ['BLOCKED_ME', 'WRONG_RESULT', 'CONFUSING', 'MINOR'] as const;

const QUESTION_IDS = new Set<string>(FEEDBACK_SECTIONS.flatMap((s) => s.questions.map((q) => q.id)));
const TASK_IDS = new Set<string>(PILOT_TASKS.map((t) => t.id));
const MAX_TEXT = 1000;
const MAX_ENTRIES_PER_STUDENT = 50;

export interface PilotFeedbackEntry {
  id: string;
  student_id: string;
  kind: FeedbackKind;
  consent_version: string;
  ratings: Record<string, number>;
  answers: Record<string, string | boolean>; // fixed ids only: free text or yes/no
  tasks_attempted: string[];
  device: (typeof DEVICES)[number] | null;
  problem: { module: string; page: string; what_happened: string; expected: string; steps: string; impact: (typeof PROBLEM_IMPACT)[number] } | null;
  comments: string;
  created_at: string;
}

/** Persisted by the snapshot store (registered in server.ts). */
export const pilotFeedbackStores = {
  entries: new Map<string, PilotFeedbackEntry[]>(),
};

export function pilotFeedbackEnabled(): boolean {
  return String(process.env.PILOT_FEEDBACK_ENABLED || '').toLowerCase() === 'true';
}

function retentionDays(): number {
  const n = Number(process.env.PILOT_FEEDBACK_RETENTION_DAYS || 90);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 90;
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?\d[\d\s-]{8,}\d)/g;

/** Trims, limits and removes email addresses and phone numbers from free text. */
export function cleanFeedbackText(raw: unknown, field: string, max = MAX_TEXT): string {
  if (raw === undefined || raw === null || raw === '') return '';
  if (typeof raw !== 'string') throw new ValidationError(`${field}: must be text`);
  const v = raw.trim();
  if (v.length > max) throw new ValidationError(`${field}: must be at most ${max} characters`);
  return v.replace(EMAIL_RE, '[email removed]').replace(PHONE_RE, '[number removed]');
}

function pick<T extends readonly string[]>(raw: unknown, allowed: T, field: string): T[number] | null {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw !== 'string' || !(allowed as readonly string[]).includes(raw)) {
    throw new ValidationError(`${field}: must be one of ${allowed.join(', ')}`);
  }
  return raw as T[number];
}

export class PilotFeedbackService {
  static config() {
    return {
      enabled: pilotFeedbackEnabled(),
      consent_version: FEEDBACK_CONSENT_VERSION,
      consent_text: FEEDBACK_CONSENT_TEXT,
      rating_scale: RATING_LABELS,
      sections: FEEDBACK_SECTIONS,
      tasks: PILOT_TASKS,
      devices: DEVICES,
      problem_impact: PROBLEM_IMPACT,
      retention_days: retentionDays(),
    };
  }

  private static prune(studentId: string): PilotFeedbackEntry[] {
    const cutoff = Date.now() - retentionDays() * 864e5;
    const list = (pilotFeedbackStores.entries.get(studentId) || []).filter((e) => Date.parse(e.created_at) >= cutoff);
    if (list.length) pilotFeedbackStores.entries.set(studentId, list);
    else pilotFeedbackStores.entries.delete(studentId);
    return list;
  }

  static listMine(studentId: string): PilotFeedbackEntry[] {
    return this.prune(studentId)
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((e) => structuredClone(e));
  }

  static submit(studentId: string, body: Record<string, any>): PilotFeedbackEntry {
    if (!pilotFeedbackEnabled()) {
      throw new AppError('Pilot feedback is not open on this server.', 403, 'PILOT_FEEDBACK_DISABLED');
    }
    if (body?.consent !== true || body?.consent_version !== FEEDBACK_CONSENT_VERSION) {
      throw new ValidationError('consent: please read and accept the feedback notice before sending feedback');
    }
    const kind = pick(body.kind ?? 'SURVEY', FEEDBACK_KINDS, 'kind') as FeedbackKind;

    const ratings: Record<string, number> = {};
    if (body.ratings !== undefined) {
      if (typeof body.ratings !== 'object' || body.ratings === null || Array.isArray(body.ratings)) {
        throw new ValidationError('ratings: must be an object of question id to rating');
      }
      for (const [k, v] of Object.entries(body.ratings)) {
        if (v === null || v === undefined || v === '') continue; // "did not use" / skipped
        if (!QUESTION_IDS.has(k)) throw new ValidationError(`ratings: unknown question '${k}'`);
        if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > 5) throw new ValidationError(`ratings.${k}: must be a whole number from 1 to 5`);
        ratings[k] = v as number;
      }
    }

    const answers: Record<string, string | boolean> = {};
    const confusing = cleanFeedbackText(body.answers?.reg_confusing_fields, 'reg_confusing_fields', 300);
    if (confusing) answers.reg_confusing_fields = confusing;
    if (body.answers?.ux_errors_encountered !== undefined && body.answers?.ux_errors_encountered !== null) {
      if (typeof body.answers.ux_errors_encountered !== 'boolean') throw new ValidationError('ux_errors_encountered: must be yes or no');
      answers.ux_errors_encountered = body.answers.ux_errors_encountered;
    }

    let tasks: string[] = [];
    if (body.tasks_attempted !== undefined) {
      if (!Array.isArray(body.tasks_attempted)) throw new ValidationError('tasks_attempted: must be a list');
      tasks = [...new Set(body.tasks_attempted.map(String))];
      const bad = tasks.find((t) => !TASK_IDS.has(t));
      if (bad) throw new ValidationError(`tasks_attempted: unknown task '${bad}'`);
    }

    const device = pick(body.device, DEVICES, 'device');
    const comments = cleanFeedbackText(body.comments, 'comments');

    let problem: PilotFeedbackEntry['problem'] = null;
    if (kind === 'PROBLEM' || kind === 'PRIVACY_CONCERN') {
      const p = body.problem || {};
      problem = {
        module: cleanFeedbackText(p.module, 'problem.module', 80),
        page: cleanFeedbackText(p.page, 'problem.page', 200),
        what_happened: cleanFeedbackText(p.what_happened, 'problem.what_happened'),
        expected: cleanFeedbackText(p.expected, 'problem.expected', 500),
        steps: cleanFeedbackText(p.steps, 'problem.steps'),
        impact: (pick(p.impact, PROBLEM_IMPACT, 'problem.impact') || (kind === 'PRIVACY_CONCERN' ? 'CONFUSING' : 'MINOR')) as any,
      };
      if (!problem.what_happened) throw new ValidationError('problem.what_happened: describe what happened');
    } else if (!Object.keys(ratings).length && !comments && !Object.keys(answers).length) {
      throw new ValidationError('feedback: answer at least one question or write a comment');
    }

    const list = this.prune(studentId);
    if (list.length >= MAX_ENTRIES_PER_STUDENT) {
      throw new ValidationError(`feedback: you can keep at most ${MAX_ENTRIES_PER_STUDENT} entries; withdraw an older one first`);
    }
    const entry: PilotFeedbackEntry = {
      id: `pfb_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      student_id: studentId,
      kind,
      consent_version: FEEDBACK_CONSENT_VERSION,
      ratings,
      answers,
      tasks_attempted: tasks,
      device,
      problem,
      comments,
      created_at: new Date().toISOString(),
    };
    pilotFeedbackStores.entries.set(studentId, [...list, entry]);
    return structuredClone(entry);
  }

  static withdraw(studentId: string, id: string): void {
    const list = pilotFeedbackStores.entries.get(studentId) || [];
    const next = list.filter((e) => e.id !== id);
    if (next.length === list.length) throw new NotFoundError('Feedback entry not found');
    if (next.length) pilotFeedbackStores.entries.set(studentId, next);
    else pilotFeedbackStores.entries.delete(studentId);
  }

  static withdrawAll(studentId: string): number {
    const n = (pilotFeedbackStores.entries.get(studentId) || []).length;
    pilotFeedbackStores.entries.delete(studentId);
    return n;
  }
}
