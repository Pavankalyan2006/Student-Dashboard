// One student context for every AI feature.
//
// Every AI request made while serving a signed-in student gets a short "student context" block built
// from that student's own records: the central profile (academic, skills, goals, learning preferences)
// and their live learning state (current course, recent topics, weak areas). It is rebuilt on every
// request, so a profile edit or a finished activity is reflected in the very next AI answer.
//
// Privacy: the block never contains the student's name, email, phone, college, marks or any account id.
import type { CanonicalProfile, ProfileModule } from '../services/studentProfile/types';
import { getRequestContext } from '../core/requestContext';
import { logger } from '../core/logging';

/** Marker so the block is added once, even if a caller already put it in its own prompt. */
export const STUDENT_CONTEXT_MARKER = 'STUDENT CONTEXT (from this student';

/** Which part of the platform an API path belongs to; decides which extra profile fields matter. */
export function moduleForPath(path: string): ProfileModule {
  const p = path.replace(/^\/api\/v1/, '').toLowerCase();
  const rules: [RegExp, ProfileModule][] = [
    [/^\/(ai|context)\b|^\/students\/[^/]+\/ai/, 'tutor'],
    [/^\/notes\b/, 'notes'],
    [/^\/(doubts|learning-modules\/doubts)\b|\/doubts\b/, 'doubts'],
    [/\/flashcards\b/, 'flashcards'],
    [/\/(study-planner|plans)\b/, 'planner'],
    [/^\/(languages|language-learning)\b/, 'languages'],
    [/^\/(sql-lab)\b|\/sql-lab\b/, 'sql'],
    [/^\/(ml-lab)\b|\/ml-lab\b/, 'ml'],
    [/^\/(coding|dsa|sandbox)\b/, 'coding'],
    [/^\/system-design\b/, 'system_design'],
    [/^\/(labs|lab-assistant|git-lab)\b/, 'lab'],
    [/^\/(quiz|quizzes|assessments|exams)\b|\/exams?\b/, 'quiz'],
    [/^\/gate\b/, 'gate'],
    [/^\/(mock-interviews|interviews)\b/, 'interview'],
    [/^\/resumes\b/, 'career'], // resume AI gets career context, never the contact details
    [/^\/(jobs|jobs-discovery|career\/jobs-discovery)\b/, 'jobs'],
    [/^\/placements\b/, 'placement'],
    [/^\/(career|skills|applications)\b/, 'career'],
    [/^\/(projects|research|github)\b/, 'projects'],
    [/^\/semester\b/, 'semester'],
    [/^\/courses?\b|^\/lessons\b/, 'courses'],
  ];
  for (const [re, mod] of rules) if (re.test(p)) return mod;
  return 'tutor';
}

const lower = (v: string | null | undefined) => (v ? String(v).replace(/_/g, ' ').toLowerCase() : '');
const list = (xs: (string | null | undefined)[] | undefined, n = 8) =>
  (xs || []).filter(Boolean).slice(0, n).join(', ');

export interface LiveLearningState {
  current_course?: string;
  current_lesson?: string;
  recent_topics?: string[];
  weak_areas?: string[];
  pending_today?: string[];
}

/** Builds the text block. Pure, so it can be tested without a database. */
export function formatStudentContext(p: CanonicalProfile, module: ProfileModule, live?: LiveLearningState): string {
  const lines: string[] = [];
  const a = p.academic;
  const academic = [
    a.degree || a.branch ? `${a.degree || 'Degree'} in ${a.branch || 'unspecified branch'}` : '',
    a.specialization ? `specialisation ${a.specialization}` : '',
    a.academic_year ? `year ${a.academic_year}` : '',
    a.current_semester ? `semester ${a.current_semester}` : '',
  ].filter(Boolean);
  if (academic.length) lines.push(`Academic: ${academic.join(', ')}`);
  if (a.subjects?.length) lines.push(`Current subjects: ${list(a.subjects, 10)}`);

  const skills = p.skills.skills.slice(0, 12).map((s) => (s.proficiency ? `${s.name} (${lower(s.proficiency)})` : s.name));
  if (skills.length) lines.push(`Skills: ${skills.join(', ')}`);

  const l = p.learning;
  const pref = [
    l.preferred_languages[0] ? `explain in ${l.preferred_languages[0]} (keep technical terms in English)` : '',
    l.explanation_style ? `${l.explanation_style === 'ELI5' ? 'very simple, step-by-step' : lower(l.explanation_style)} explanations` : '',
    l.learning_style ? `${lower(l.learning_style)} learner` : '',
    l.difficulty ? `${lower(l.difficulty)} level` : '',
  ].filter(Boolean);
  if (pref.length) lines.push(`Learning preferences: ${pref.join('; ')}`);
  if (l.learning_interests?.length) lines.push(`Wants to learn: ${list(l.learning_interests)}`);

  const c = p.career;
  if (c.target_roles.length) lines.push(`Target roles: ${list(c.target_roles, 5)}`);
  if (c.short_term_goals) lines.push(`Short-term goal: ${c.short_term_goals.slice(0, 200)}`);
  if (c.long_term_goals) lines.push(`Long-term goal: ${c.long_term_goals.slice(0, 200)}`);
  if (c.competitive_exams.length) lines.push(`Preparing for: ${list(c.competitive_exams)}${c.gate_paper ? ` (GATE paper ${c.gate_paper})` : ''}`);

  // Module-specific detail, only where it changes the answer.
  if (module === 'planner') {
    const plan = [
      l.weekly_study_hours ? `${l.weekly_study_hours} h per week` : '',
      l.daily_study_minutes ? `${l.daily_study_minutes} min per day` : '',
      l.preferred_study_days.length ? `on ${l.preferred_study_days.join(', ')}` : '',
      l.preferred_study_time ? `prefers ${lower(l.preferred_study_time)}` : '',
      l.revision_preference ? `revision ${lower(l.revision_preference)}` : '',
    ].filter(Boolean);
    if (plan.length) lines.push(`Study availability: ${plan.join(', ')}`);
  }
  if (['interview', 'career', 'jobs', 'placement', 'projects'].includes(module)) {
    if (c.preferred_industries.length) lines.push(`Preferred industries: ${list(c.preferred_industries)}`);
    if (c.placement_goals) lines.push(`Placement goal: ${c.placement_goals.slice(0, 200)}`);
    const projects = p.experience.projects.slice(0, 5).map((x) => `${x.title}${x.technologies?.length ? ` [${x.technologies.slice(0, 4).join(', ')}]` : ''}`);
    if (projects.length) lines.push(`Projects: ${projects.join('; ')}`);
    const exp = p.experience.experience.slice(0, 3).map((x) => `${lower(x.kind)} as ${x.role}`);
    if (exp.length) lines.push(`Experience: ${exp.join('; ')}`);
  }
  if (module === 'projects' && p.experience.research_interests?.length) lines.push(`Research interests: ${list(p.experience.research_interests)}`);

  if (live) {
    if (live.current_course) lines.push(`Currently studying: ${live.current_course}${live.current_lesson ? ` (lesson: ${live.current_lesson})` : ''}`);
    if (live.recent_topics?.length) lines.push(`Recent activity: ${list(live.recent_topics, 4)}`);
    if (live.weak_areas?.length) lines.push(`Weak areas from their results: ${list(live.weak_areas, 6)}`);
    if (live.pending_today?.length) lines.push(`Still planned for today: ${list(live.pending_today, 4)}`);
  }

  if (!lines.length) return '';
  return [
    `${STUDENT_CONTEXT_MARKER}'s own profile and activity; nothing here is assumed):`,
    ...lines.map((x) => `- ${x}`),
    'Use this to pitch depth, choose examples from their subjects and goals, and suggest a concrete next step when it helps.',
    'Do not invent facts about the student beyond this list, and do not repeat the list back unless they ask what you know about them.',
  ].join('\n');
}

/** Live state from the student's records; empty pieces are left out rather than guessed. */
export async function liveState(studentId: string): Promise<LiveLearningState | undefined> {
  try {
    const { db } = await import('../db/database');
    const ctx: any = await db.getStudentLearningContext(studentId);
    const course = ctx?.current_course?.name && ctx.current_course.name !== 'No active course' ? ctx.current_course.name : undefined;
    const lesson = ctx?.current_lesson?.title && ctx.current_lesson.title !== 'No lesson in progress' ? ctx.current_lesson.title : undefined;
    return {
      current_course: course,
      current_lesson: lesson,
      recent_topics: ctx?.recent_topics || [],
      weak_areas: ctx?.weak_areas || [],
      pending_today: ctx?.suggested_actions?.filter((s: string) => !s.startsWith('Continue ')) || [],
    };
  } catch {
    return undefined;
  }
}

/**
 * The context block for the student this request is serving, or '' when there is no signed-in student,
 * personalisation is switched off, or the profile cannot be read. Never throws.
 */
export async function studentContextForCurrentRequest(): Promise<string> {
  if (process.env.AI_PERSONALIZATION === 'off') return '';
  const rc = getRequestContext();
  if (!rc?.studentId || rc.personalize === false) return '';
  try {
    const { StudentProfileService } = await import('../services/studentProfile/studentProfileService');
    const { profile } = await StudentProfileService.getProfile(rc.studentId);
    const module = moduleForPath(rc.path);
    return formatStudentContext(profile, module, await liveState(rc.studentId));
  } catch (err) {
    logger.warn(`Student context unavailable for AI request: ${(err as any)?.code || (err as any)?.name || 'error'}`);
    return '';
  }
}

/** Appends the block to a system instruction unless it is already there. */
export function withStudentContext(systemInstruction: string | undefined, block: string): string | undefined {
  if (!block) return systemInstruction;
  if (systemInstruction?.includes(STUDENT_CONTEXT_MARKER)) return systemInstruction;
  return systemInstruction ? `${systemInstruction}\n\n${block}` : block;
}

/**
 * What the assistant knows about the student for a given page, as plain lines, so the student can see
 * (and correct) exactly what personalises their answers.
 */
export async function studentContextSummary(studentId: string, pagePath: string): Promise<{ module: ProfileModule; lines: string[] }> {
  const { StudentProfileService } = await import('../services/studentProfile/studentProfileService');
  const { profile } = await StudentProfileService.getProfile(studentId);
  const module = moduleForPath(apiPathForPage(pagePath));
  const block = formatStudentContext(profile, module, await liveState(studentId));
  const lines = block
    .split('\n')
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2));
  return { module, lines };
}

/** Maps a page URL to the API area that serves it, so the summary matches what that page's AI receives. */
export function apiPathForPage(pagePath: string): string {
  const p = (pagePath || '/').split(/[?#]/)[0];
  const map: [RegExp, string][] = [
    [/^\/(ai-agent|ai-tutor)/, '/ai'],
    [/^\/doubts/, '/doubts'],
    [/^\/flashcards/, '/flashcards'],
    [/^\/(study-planner|focus|analytics)/, '/study-planner'],
    [/^\/languages/, '/languages'],
    [/^\/sql-lab/, '/sql-lab'],
    [/^\/ml-lab/, '/ml-lab'],
    [/^\/(coding|dsa)/, '/coding'],
    [/^\/system-design/, '/system-design'],
    [/^\/(labs|git)/, '/labs'],
    [/^\/(quiz|exams|mistakes|assessment\/(?!gate))/, '/quiz'],
    [/^\/(gate|assessment\/gate)/, '/gate'],
    [/^\/(mock-interviews|interviews)/, '/mock-interviews'],
    [/^\/career\/jobs|^\/jobs/, '/jobs'],
    [/^\/(placement|placements)/, '/placements'],
    [/^\/(career|resume|applications|skills)/, '/career'],
    [/^\/(projects|research|github)/, '/projects'],
    [/^\/(semester|grades|cgpa|attendance)/, '/semester'],
    [/^\/(courses|course|learn)/, '/courses'],
    [/^\/notes/, '/notes'],
  ];
  for (const [re, api] of map) if (re.test(p)) return api;
  return '/ai';
}
