// Phase 5: module-specific, minimised views of the canonical profile.
//
// Each module gets only the fields it uses. AI-facing contexts (tutor, agent, doubts, quiz, lab,
// interview...) never include name, email, phone, photo, CGPA, consent timestamps or account
// identifiers; those are personal data the model does not need.
import type { CanonicalProfile, ProfileModule, SkillEntry } from './types';

const skillsIn = (p: CanonicalProfile, cats: SkillEntry['category'][]) =>
  p.skills.skills.filter((s) => cats.includes(s.category)).map((s) => ({ name: s.name, proficiency: s.proficiency }));

const academicCore = (p: CanonicalProfile) => ({
  degree: p.academic.degree,
  branch: p.academic.branch,
  specialization: p.academic.specialization,
  academic_year: p.academic.academic_year,
  semester: p.academic.current_semester,
  subjects: p.academic.subjects,
});

const learningCore = (p: CanonicalProfile) => ({
  preferred_language: p.learning.preferred_languages[0] || null,
  other_languages: p.learning.preferred_languages.slice(1),
  explanation_style: p.learning.explanation_style,
  learning_style: p.learning.learning_style,
  difficulty: p.learning.difficulty,
});

const preparingGate = (p: CanonicalProfile) => p.career.competitive_exams.some((x) => /^gate\b/i.test(x));

export function buildModuleContext(p: CanonicalProfile, module: ProfileModule): Record<string, unknown> {
  switch (module) {
    case 'dashboard':
      return {
        name: p.identity.display_name || p.identity.full_name,
        university: p.academic.university,
        college: p.academic.college,
        ...academicCore(p),
        expected_graduation_year: p.academic.expected_graduation_year,
        target_roles: p.career.target_roles,
        short_term_goals: p.career.short_term_goals,
        weekly_study_hours: p.learning.weekly_study_hours,
      };
    case 'semester':
      return {
        university: p.academic.university,
        college: p.academic.college,
        ...academicCore(p),
        academic_status: p.academic.academic_status,
      };
    case 'tutor':
    case 'doubts':
    case 'notes':
    case 'flashcards':
    case 'quiz':
    case 'lab':
      return { ...academicCore(p), ...learningCore(p), learning_interests: p.learning.learning_interests };
    case 'agent':
      // The agent receives this only when the request is about the student's own learning/career.
      return {
        ...academicCore(p),
        ...learningCore(p),
        target_roles: p.career.target_roles,
        skills: p.skills.skills.map((s) => ({ name: s.name, proficiency: s.proficiency })),
      };
    case 'courses':
      return {
        ...academicCore(p),
        skills: p.skills.skills.map((s) => ({ name: s.name, category: s.category, proficiency: s.proficiency })),
        learning_interests: p.learning.learning_interests,
        target_roles: p.career.target_roles,
        career_interests: p.career.career_interests,
      };
    case 'planner':
      return {
        semester: p.academic.current_semester,
        subjects: p.academic.subjects,
        weekly_study_hours: p.learning.weekly_study_hours,
        daily_study_minutes: p.learning.daily_study_minutes,
        preferred_study_days: p.learning.preferred_study_days,
        preferred_study_time: p.learning.preferred_study_time,
        revision_preference: p.learning.revision_preference,
        short_term_goals: p.career.short_term_goals,
      };
    case 'languages':
      return { ...learningCore(p), daily_study_minutes: p.learning.daily_study_minutes };
    case 'coding':
      return {
        languages: skillsIn(p, ['PROGRAMMING_LANGUAGE']),
        difficulty: p.learning.difficulty,
        target_roles: p.career.target_roles,
      };
    case 'sql':
      return { database_skills: skillsIn(p, ['DATABASE']), difficulty: p.learning.difficulty };
    case 'ml':
      return {
        ai_ml_skills: skillsIn(p, ['AI_ML']),
        languages: skillsIn(p, ['PROGRAMMING_LANGUAGE']),
        interests: p.learning.learning_interests,
        research_interests: p.experience.research_interests,
        difficulty: p.learning.difficulty,
      };
    case 'system_design':
      return {
        target_roles: p.career.target_roles,
        backend_skills: skillsIn(p, ['BACKEND', 'DATABASE', 'CLOUD']),
        difficulty: p.learning.difficulty,
      };
    case 'gate':
      return {
        preparing_for_gate: preparingGate(p),
        gate_paper: preparingGate(p) ? p.career.gate_paper : null,
        branch: p.academic.branch,
        subjects: p.academic.subjects,
      };
    case 'interview':
    case 'career':
    case 'placement':
    case 'jobs':
      return {
        degree: p.academic.degree,
        branch: p.academic.branch,
        expected_graduation_year: p.academic.expected_graduation_year,
        target_roles: p.career.target_roles,
        career_interests: p.career.career_interests,
        preferred_industries: p.career.preferred_industries,
        preferred_locations: p.career.preferred_locations,
        internship_interests: p.career.internship_interests,
        placement_goals: p.career.placement_goals,
        skills: p.skills.skills.map((s) => ({ name: s.name, category: s.category, proficiency: s.proficiency })),
        projects: p.experience.projects.map((x) => ({ title: x.title, technologies: x.technologies, description: x.description })),
        experience: p.experience.experience.map((x) => ({ kind: x.kind, role: x.role, organization: x.organization, start_date: x.start_date, end_date: x.end_date, is_current: x.is_current })),
        certifications: p.experience.certifications.map((x) => ({ name: x.name, issuer: x.issuer })),
      };
    case 'resume':
      // Resume drafts are shown to the student for confirmation before anything is saved.
      return {
        full_name: p.identity.full_name,
        email: p.identity.email,
        phone: p.identity.phone,
        college: p.academic.college,
        university: p.academic.university,
        degree: p.academic.degree,
        branch: p.academic.branch,
        expected_graduation_year: p.academic.expected_graduation_year,
        cgpa: p.academic.cgpa,
        cgpa_scale: p.academic.cgpa_scale,
        skills: p.skills.skills,
        projects: p.experience.projects,
        experience: p.experience.experience,
        certifications: p.experience.certifications,
        achievements: [...p.academic.academic_achievements, ...p.experience.achievements],
        github_url: p.experience.github_url,
        linkedin_url: p.experience.linkedin_url,
        portfolio_url: p.experience.portfolio_url,
        target_roles: p.career.target_roles,
      };
    case 'projects':
      return {
        skills: p.skills.skills.map((s) => ({ name: s.name, category: s.category, proficiency: s.proficiency })),
        interests: p.learning.learning_interests,
        target_roles: p.career.target_roles,
        existing_projects: p.experience.projects.map((x) => x.title),
      };
    case 'goals':
      return {
        short_term_goals: p.career.short_term_goals,
        long_term_goals: p.career.long_term_goals,
        target_roles: p.career.target_roles,
        weekly_study_hours: p.learning.weekly_study_hours,
        semester: p.academic.current_semester,
      };
    case 'notifications':
      return { ...p.learning.notifications };
    case 'community':
      // Filtered further by the student's privacy settings in StudentProfileService.
      return {
        display_name: p.identity.display_name || p.identity.full_name,
        branch: p.academic.branch,
        semester: p.academic.current_semester,
        skills: p.skills.skills.map((s) => s.name),
      };
    default:
      return {};
  }
}

/** Short plain-text line for AI prompts; contains no personal identifiers. */
export function formatAcademicPromptLine(ctx: Record<string, any>): string {
  const parts: string[] = [];
  if (ctx.degree || ctx.branch) parts.push(`${ctx.degree || 'Degree'} in ${ctx.branch || 'unspecified branch'}`);
  if (ctx.semester) parts.push(`semester ${ctx.semester}`);
  if (ctx.subjects?.length) parts.push(`current subjects: ${ctx.subjects.slice(0, 10).join(', ')}`);
  if (ctx.preferred_language) parts.push(`explain in ${ctx.preferred_language}`);
  if (ctx.explanation_style) parts.push(`explanation style ${String(ctx.explanation_style).replace(/_/g, ' ').toLowerCase()}`);
  if (ctx.difficulty) parts.push(`difficulty ${String(ctx.difficulty).toLowerCase()}`);
  return parts.join('; ');
}
