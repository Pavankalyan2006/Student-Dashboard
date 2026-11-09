// Phase 5: profile-driven recommendations for the learning, lab and career modules.
//
// Every item says which profile fields it came from. When the profile does not have the data a
// module needs, the module returns no items and tells the student what to add; nothing is guessed.
// Recommendations never restrict access: they only order and highlight existing catalogue content.
import { db } from '../../db/database';
import { TOP150_PROBLEMS } from '../../db/dsa150Catalog';
import { SYSTEM_DESIGN_CHALLENGES } from '../../db/systemDesignCatalog';
import { GATE_PAPERS } from '../../db/gateCatalog';
import { TARGET_ROLES_METADATA } from '../../db/mockInterviewCatalog';
import type { CanonicalProfile, Proficiency } from './types';

export interface RecommendationItem {
  id: string;
  title: string;
  kind: 'MANDATORY' | 'RECOMMENDED';
  reason: string;
  link?: string;
  meta?: Record<string, unknown>;
}

export interface ModuleRecommendations {
  module: string;
  based_on: string[];
  items: RecommendationItem[];
  missing_profile_data: string[];
  summary: string;
}

const RANK: Record<Proficiency, number> = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2, EXPERT: 3 };
const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'engineering', 'developer', 'engineer'].includes(w));

function overlap(a: string[], b: string[]): string[] {
  const set = new Set(a.flatMap(words));
  return Array.from(new Set(b.flatMap(words).filter((w) => set.has(w))));
}

function bestLevel(p: CanonicalProfile, cats: string[]): Proficiency | null {
  const levels = p.skills.skills.filter((s) => cats.includes(s.category)).map((s) => s.proficiency);
  if (!levels.length) return null;
  return levels.sort((x, y) => RANK[y] - RANK[x])[0];
}

const empty = (module: string, missing: string[], summary: string): ModuleRecommendations => ({
  module,
  based_on: [],
  items: [],
  missing_profile_data: missing,
  summary,
});

async function courses(p: CanonicalProfile): Promise<ModuleRecommendations> {
  const all = (await db.getAllCourses()).filter((c) => c.is_published !== false && !c.student_id);
  const subjects = p.academic.subjects;
  const interestTerms = [
    ...p.skills.skills.map((s) => s.name),
    ...p.learning.learning_interests,
    ...p.career.target_roles,
    ...p.career.career_interests,
  ];
  if (!subjects.length && !interestTerms.length && !p.academic.branch) {
    return empty('courses', ['academic.subjects', 'skills', 'learning_interests', 'target_roles'], 'Add your subjects, skills or goals to get course recommendations.');
  }
  const items: (RecommendationItem & { score: number })[] = [];
  for (const c of all) {
    const text = [c.title, c.description, c.category || '', ...(c.skills || [])];
    const subjectHit = subjects.find((s) => overlap([s], [c.title]).length >= Math.min(2, words(s).length));
    const sameSemester = p.academic.current_semester && c.semester === p.academic.current_semester;
    const interestHit = overlap(interestTerms, text);
    if (subjectHit) {
      items.push({
        id: c.id,
        title: c.title,
        kind: 'MANDATORY',
        reason: `Matches your current subject "${subjectHit}"${sameSemester ? ` (semester ${c.semester})` : ''}`,
        link: `/courses/${c.id}`,
        score: 100,
      });
    } else if (interestHit.length >= 1) {
      items.push({
        id: c.id,
        title: c.title,
        kind: 'RECOMMENDED',
        reason: `Related to your ${interestHit.slice(0, 3).join(', ')} interests/skills`,
        link: `/courses/${c.id}`,
        score: interestHit.length * 10 + (sameSemester ? 5 : 0),
      });
    }
  }
  items.sort((a, b) => b.score - a.score);
  return {
    module: 'courses',
    based_on: ['academic.subjects', 'academic.current_semester', 'skills', 'learning_interests', 'career.target_roles'],
    items: items.slice(0, 12).map(({ score, ...r }) => r),
    missing_profile_data: subjects.length ? [] : ['academic.subjects'],
    summary: 'Courses marked "Your subject" match your current subjects; the rest are suggestions, not requirements.',
  };
}

function coding(p: CanonicalProfile): ModuleRecommendations {
  const langs = p.skills.skills.filter((s) => s.category === 'PROGRAMMING_LANGUAGE');
  if (!langs.length) return empty('coding', ['skills (programming languages)'], 'Add a programming language to your skills to get matched exercises. Every language stays available.');
  const top = [...langs].sort((a, b) => RANK[b.proficiency] - RANK[a.proficiency])[0];
  const difficulty = RANK[top.proficiency] >= 2 ? 'HARD' : RANK[top.proficiency] === 1 ? 'MEDIUM' : 'EASY';
  const problems = TOP150_PROBLEMS.filter((x) => x.difficulty === difficulty).slice(0, 8);
  return {
    module: 'coding',
    based_on: ['skills (programming languages and proficiency)'],
    items: problems.map((x) => ({
      id: x.id,
      title: x.title,
      kind: 'RECOMMENDED' as const,
      reason: `${difficulty.toLowerCase()} problem for your ${top.proficiency.toLowerCase()} ${top.name}`,
      link: `/dsa/problem/${x.id}`,
      meta: { difficulty: x.difficulty, suggested_language: top.name },
    })),
    missing_profile_data: [],
    summary: `Suggested in ${top.name} (${langs.map((l) => l.name).join(', ')} on your profile). You can switch to any supported language.`,
  };
}

function sql(p: CanonicalProfile): ModuleRecommendations {
  const level = bestLevel(p, ['DATABASE']);
  const tracks: Record<Proficiency, string[]> = {
    BEGINNER: ['SELECT and WHERE filters', 'ORDER BY and LIMIT', 'Aggregates with GROUP BY'],
    INTERMEDIATE: ['INNER and LEFT JOINs', 'Subqueries', 'HAVING and grouped filters'],
    ADVANCED: ['Window functions', 'Common table expressions', 'Query plans and indexes'],
    EXPERT: ['Recursive CTEs', 'Index design trade-offs', 'Transaction isolation'],
  };
  const lvl = level || 'BEGINNER';
  return {
    module: 'sql',
    based_on: level ? ['skills (databases)'] : [],
    items: tracks[lvl].map((t, i) => ({ id: `sql_${lvl}_${i}`, title: t, kind: 'RECOMMENDED' as const, reason: level ? `Next step for a ${lvl.toLowerCase()} database skill level` : 'Starting point (no database skill on your profile yet)', link: '/sql-lab' })),
    missing_profile_data: level ? [] : ['skills (a database such as SQL, PostgreSQL or MySQL)'],
    summary: level ? `Based on your ${lvl.toLowerCase()} database skill.` : 'Add a database skill to your profile for a better match.',
  };
}

function ml(p: CanonicalProfile): ModuleRecommendations {
  const level = bestLevel(p, ['AI_ML']);
  const interests = [...p.learning.learning_interests, ...p.experience.research_interests];
  if (!level && !interests.some((i) => /ai|ml|machine|learning|data|vision|nlp/i.test(i))) {
    return empty('ml', ['skills (AI/ML)', 'learning_interests'], 'Add AI/ML skills or interests to get experiment suggestions.');
  }
  const lvl = level || 'BEGINNER';
  const byLevel: Record<Proficiency, string[]> = {
    BEGINNER: ['Linear regression on a small dataset', 'k-NN classification', 'Train/test split and accuracy'],
    INTERMEDIATE: ['Decision trees vs random forests', 'Cross-validation', 'Feature scaling effects'],
    ADVANCED: ['Regularisation sweep (L1/L2)', 'Clustering with k-means and silhouette', 'Bias-variance experiment'],
    EXPERT: ['Hyper-parameter search design', 'Model comparison with confidence intervals', 'Error analysis by slice'],
  };
  return {
    module: 'ml',
    based_on: [level ? 'skills (AI/ML)' : '', interests.length ? 'learning_interests' : ''].filter(Boolean),
    items: byLevel[lvl].map((t, i) => ({ id: `ml_${lvl}_${i}`, title: t, kind: 'RECOMMENDED' as const, reason: `Suited to ${lvl.toLowerCase()} AI/ML level`, link: '/ml-lab' })),
    missing_profile_data: level ? [] : ['skills (AI/ML)'],
    summary: `Experiments for a ${lvl.toLowerCase()} level.`,
  };
}

function systemDesign(p: CanonicalProfile): ModuleRecommendations {
  if (!p.career.target_roles.length) return empty('system_design', ['career.target_roles'], 'Add a target role to get matched design challenges.');
  const level = bestLevel(p, ['BACKEND', 'CLOUD', 'DATABASE']);
  const want = level && RANK[level] >= 2 ? ['INTERMEDIATE', 'ADVANCED'] : level === 'INTERMEDIATE' ? ['BEGINNER', 'INTERMEDIATE'] : ['BEGINNER'];
  const roles = p.career.target_roles.join(' ');
  const items = SYSTEM_DESIGN_CHALLENGES.filter((c: any) => want.includes(String(c.difficulty).toUpperCase()))
    .map((c: any) => ({ c, hit: overlap([roles], [c.title, c.category || '']).length }))
    .sort((a, b) => b.hit - a.hit)
    .slice(0, 6)
    .map(({ c }) => ({ id: c.id, title: c.title, kind: 'RECOMMENDED' as const, reason: `${String(c.difficulty).toLowerCase()} challenge for a ${p.career.target_roles[0]} target${level ? ` with ${level.toLowerCase()} backend skills` : ''}`, link: '/system-design' }));
  return { module: 'system_design', based_on: ['career.target_roles', 'skills (backend, cloud, databases)'], items, missing_profile_data: level ? [] : ['skills (backend/cloud/databases)'], summary: `For ${p.career.target_roles.join(', ')}.` };
}

function gate(p: CanonicalProfile): ModuleRecommendations {
  const preparing = p.career.competitive_exams.some((x) => /^gate\b/i.test(x));
  if (!preparing) {
    return { module: 'gate', based_on: ['career.competitive_exams'], items: [], missing_profile_data: [], summary: 'GATE is not one of your selected exams. Add it in your career profile if you are preparing.' };
  }
  const paper = GATE_PAPERS.find((x) => p.career.gate_paper && (x.code.toLowerCase() === p.career.gate_paper.toLowerCase() || x.name.toLowerCase() === p.career.gate_paper.toLowerCase()));
  if (!paper) return empty('gate', ['career.gate_paper'], 'Choose your GATE paper in your career profile.');
  return {
    module: 'gate',
    based_on: ['career.competitive_exams', 'career.gate_paper'],
    items: [{ id: paper.code, title: `${paper.code}: ${paper.name}`, kind: 'MANDATORY', reason: 'Your selected GATE paper', link: '/gate' }],
    missing_profile_data: [],
    summary: `Preparing for GATE ${paper.code}.`,
  };
}

function interview(p: CanonicalProfile): ModuleRecommendations {
  if (!p.career.target_roles.length) return empty('interview', ['career.target_roles'], 'Add a target role to set up relevant mock interviews.');
  const roleText = p.career.target_roles.join(' ');
  const matched = TARGET_ROLES_METADATA.map((r) => ({ r, hit: overlap([roleText], [r.title, r.department, ...r.keySkills]).length }))
    .filter((x) => x.hit > 0)
    .sort((a, b) => b.hit - a.hit)
    .slice(0, 3);
  const skillNames = p.skills.skills.map((s) => s.name);
  return {
    module: 'interview',
    based_on: ['career.target_roles', 'skills', 'experience.projects', 'experience.experience'],
    items: matched.map(({ r }) => ({
      id: r.id,
      title: r.title,
      kind: 'RECOMMENDED' as const,
      reason: `Closest catalogue role to "${p.career.target_roles[0]}"`,
      link: '/mock-interviews',
      meta: {
        categories: r.suggestedCategories,
        skills_you_listed: overlap(skillNames, r.keySkills),
        // Questions about projects/experience use only entries the student added.
        projects_to_discuss: p.experience.projects.map((x) => x.title).slice(0, 3),
        experience_to_discuss: p.experience.experience.map((x) => `${x.role} at ${x.organization}`).slice(0, 3),
      },
    })),
    missing_profile_data: p.experience.projects.length ? [] : ['experience.projects'],
    summary: 'Interview topics come from your target role and the skills and projects you entered.',
  };
}

function planner(p: CanonicalProfile): ModuleRecommendations {
  const missing: string[] = [];
  if (!p.academic.subjects.length) missing.push('academic.subjects');
  if (p.learning.weekly_study_hours == null && p.learning.daily_study_minutes == null) missing.push('learning.study availability');
  if (missing.length === 2) return empty('planner', missing, 'Add your subjects and study availability to plan your week.');
  const days = p.learning.preferred_study_days.length ? p.learning.preferred_study_days : ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const minutes = p.learning.daily_study_minutes ?? Math.round(((p.learning.weekly_study_hours || 0) * 60) / days.length);
  const subjects = p.academic.subjects.length ? p.academic.subjects : ['Revision'];
  return {
    module: 'planner',
    based_on: ['academic.subjects', 'learning.preferred_study_days', 'learning.daily_study_minutes', 'learning.weekly_study_hours'],
    items: days.map((d, i) => ({
      id: `slot_${d}`,
      title: `${d}: ${subjects[i % subjects.length]}`,
      kind: 'RECOMMENDED' as const,
      reason: `${minutes} min on your chosen study day${p.learning.preferred_study_time ? `, ${p.learning.preferred_study_time.toLowerCase()}` : ''}`,
      meta: { day: d, minutes, subject: subjects[i % subjects.length] },
    })),
    missing_profile_data: missing,
    summary: `A week of ${minutes}-minute sessions across ${days.length} days, rotating your subjects.`,
  };
}

function career(p: CanonicalProfile): ModuleRecommendations {
  if (!p.career.target_roles.length && !p.career.career_interests.length) {
    return empty('career', ['career.target_roles'], 'Add a target role or career interest for career recommendations.');
  }
  const roleText = [...p.career.target_roles, ...p.career.career_interests].join(' ');
  const role = TARGET_ROLES_METADATA.map((r) => ({ r, hit: overlap([roleText], [r.title, r.department, ...r.keySkills]).length })).sort((a, b) => b.hit - a.hit)[0];
  const have = p.skills.skills.map((s) => s.name);
  const gaps = role && role.hit > 0 ? role.r.keySkills.filter((k) => overlap(have, [k]).length === 0) : [];
  return {
    module: 'career',
    based_on: ['career.target_roles', 'skills', 'experience'],
    items: gaps.map((g, i) => ({ id: `gap_${i}`, title: `Build: ${g}`, kind: 'RECOMMENDED' as const, reason: `Listed for ${role!.r.title}; not yet on your skills` })),
    missing_profile_data: p.skills.skills.length ? [] : ['skills'],
    summary: role && role.hit > 0 ? `Skill gaps for ${role.r.title}, compared with the skills you listed.` : 'No catalogue role matched your target role; skill gaps are not computed.',
  };
}

export async function getModuleRecommendations(p: CanonicalProfile, module: string): Promise<ModuleRecommendations> {
  switch (module) {
    case 'courses':
      return courses(p);
    case 'coding':
    case 'dsa':
      return { ...coding(p), module };
    case 'sql':
      return sql(p);
    case 'ml':
      return ml(p);
    case 'system_design':
      return systemDesign(p);
    case 'gate':
      return gate(p);
    case 'interview':
      return interview(p);
    case 'planner':
      return planner(p);
    case 'career':
    case 'jobs':
    case 'placement':
      return { ...career(p), module };
    default:
      return empty(module, [], 'No profile-based recommendations for this module.');
  }
}

/** Jobs matching against the student's real profile. Unknown requirements stay unknown. */
export function matchJobToProfile(p: CanonicalProfile, job: { title?: string; skills?: string[]; location?: string; description?: string }) {
  const have = p.skills.skills.map((s) => s.name);
  const required = job.skills || [];
  const matched = required.filter((r) => overlap(have, [r]).length > 0);
  const roleMatch = overlap(p.career.target_roles, [job.title || '']).length > 0;
  const locationMatch = job.location ? p.career.preferred_locations.some((l) => overlap([l], [job.location!]).length > 0) : null;
  return {
    matched_skills: matched,
    missing_skills: required.filter((r) => !matched.includes(r)),
    skill_match_percent: required.length ? Math.round((matched.length / required.length) * 100) : null,
    role_match: roleMatch,
    location_match: locationMatch,
    // Eligibility (degree, year, CGPA cut-offs) is never inferred; the listing must state it.
    eligibility: 'NOT_DETERMINED',
  };
}
