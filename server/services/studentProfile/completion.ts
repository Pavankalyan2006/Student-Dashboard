// Phase 5: profile completion computed only from fields the student actually filled in.
// Optional information (CGPA, achievements, previous qualifications, phone) never counts against
// the student. There is no stored or hardcoded percentage.
import type { CanonicalProfile } from './types';

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
  required: boolean;
}

export interface CompletionSection {
  key: 'account' | 'academic' | 'skills' | 'experience' | 'career' | 'learning';
  label: string;
  step: number; // onboarding step that edits this section
  percentage: number;
  complete: boolean; // every required item done
  items: CompletionItem[];
  missing_recommended: string[];
  action: { label: string; step: number; profile_tab: string } | null;
}

export interface ProfileCompletionReport {
  overall_percentage: number;
  completed_sections: string[];
  incomplete_sections: string[];
  sections: CompletionSection[];
  onboarding_ready: boolean; // all required items of the required steps are done
}

const has = (v: unknown) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '');

export function computeCompletion(p: CanonicalProfile, opts: { requireVerifiedEmail?: boolean } = {}): ProfileCompletionReport {
  const s = (
    key: CompletionSection['key'],
    label: string,
    step: number,
    tab: string,
    items: CompletionItem[]
  ): CompletionSection => {
    const done = items.filter((i) => i.done).length;
    const missing = items.filter((i) => !i.done && !i.required).map((i) => i.label);
    const missingRequired = items.filter((i) => !i.done && i.required);
    return {
      key,
      label,
      step,
      percentage: items.length ? Math.round((done / items.length) * 100) : 100,
      complete: missingRequired.length === 0,
      items,
      missing_recommended: missing,
      action:
        missingRequired.length || missing.length
          ? { label: `Add ${(missingRequired[0] || items.find((i) => !i.done))!.label.toLowerCase()}`, step, profile_tab: tab }
          : null,
    };
  };

  const sections: CompletionSection[] = [
    s('account', 'Account', 1, 'account', [
      { key: 'full_name', label: 'Full name', done: has(p.identity.full_name), required: true },
      { key: 'terms', label: 'Terms and privacy consent', done: has(p.identity.terms_accepted_at) && has(p.identity.privacy_accepted_at), required: true },
      { key: 'email_verified', label: 'Verified email', done: p.identity.email_verified, required: Boolean(opts.requireVerifiedEmail) },
      { key: 'avatar', label: 'Profile photo', done: has(p.identity.avatar_url), required: false },
    ]),
    s('academic', 'Academic profile', 2, 'academic', [
      { key: 'college', label: 'College', done: has(p.academic.college), required: true },
      { key: 'degree', label: 'Degree', done: has(p.academic.degree), required: true },
      { key: 'branch', label: 'Branch', done: has(p.academic.branch), required: true },
      { key: 'semester', label: 'Current semester', done: has(p.academic.current_semester), required: true },
      { key: 'academic_year', label: 'Academic year', done: has(p.academic.academic_year), required: true },
      { key: 'graduation', label: 'Expected graduation year', done: has(p.academic.expected_graduation_year), required: true },
      { key: 'university', label: 'University', done: has(p.academic.university), required: false },
      { key: 'subjects', label: 'Current subjects', done: has(p.academic.subjects), required: false },
    ]),
    s('skills', 'Technical skills', 3, 'skills', [
      { key: 'one_skill', label: 'At least one skill', done: p.skills.skills.length >= 1, required: false },
      { key: 'three_skills', label: 'Three or more skills', done: p.skills.skills.length >= 3, required: false },
      { key: 'language', label: 'A programming language', done: p.skills.skills.some((x) => x.category === 'PROGRAMMING_LANGUAGE'), required: false },
      { key: 'interests', label: 'Learning interests', done: has(p.learning.learning_interests), required: false },
    ]),
    s('experience', 'Projects and experience', 4, 'experience', [
      { key: 'project', label: 'A project or experience entry', done: p.experience.projects.length > 0 || p.experience.experience.length > 0, required: false },
      { key: 'project_link', label: 'A project link', done: p.experience.projects.some((x) => x.github_url || x.demo_url || x.project_url), required: false },
      { key: 'github', label: 'GitHub profile', done: has(p.experience.github_url), required: false },
    ]),
    s('career', 'Career goals', 5, 'career', [
      {
        key: 'direction',
        label: 'Target role or career direction',
        done: has(p.career.target_roles) || has(p.career.career_interests) || has(p.career.higher_education_interests) || has(p.career.competitive_exams),
        required: true,
      },
      { key: 'locations', label: 'Preferred locations', done: has(p.career.preferred_locations), required: false },
      { key: 'short_term', label: 'Short-term goals', done: has(p.career.short_term_goals), required: false },
      { key: 'long_term', label: 'Long-term goals', done: has(p.career.long_term_goals), required: false },
    ]),
    s('learning', 'Learning preferences', 6, 'learning', [
      { key: 'language', label: 'Preferred language', done: has(p.learning.preferred_languages), required: true },
      { key: 'style', label: 'Explanation style', done: has(p.learning.explanation_style), required: false },
      { key: 'difficulty', label: 'Preferred difficulty', done: has(p.learning.difficulty), required: false },
      { key: 'availability', label: 'Study availability', done: has(p.learning.weekly_study_hours) || has(p.learning.daily_study_minutes), required: false },
      { key: 'days', label: 'Study days', done: has(p.learning.preferred_study_days), required: false },
    ]),
  ];

  const overall = Math.round(sections.reduce((sum, x) => sum + x.percentage, 0) / sections.length);
  return {
    overall_percentage: overall,
    completed_sections: sections.filter((x) => x.percentage === 100).map((x) => x.key),
    incomplete_sections: sections.filter((x) => x.percentage < 100).map((x) => x.key),
    sections,
    onboarding_ready: sections.every((x) => x.complete),
  };
}
