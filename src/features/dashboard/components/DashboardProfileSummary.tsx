import * as React from 'react';
import { GraduationCap, Target, UserCog } from 'lucide-react';
import type { DashboardProfileContext } from '../types/dashboard';

const SECTION_LABELS: Record<string, string> = {
  account: 'Account',
  academic: 'Academic profile',
  skills: 'Technical skills',
  experience: 'Projects and experience',
  career: 'Career goals',
  learning: 'Learning preferences',
};

/**
 * Phase 5: shows what the platform knows about the student, straight from the central profile.
 * Missing values are shown as "Not set" with a link to fill them in; nothing is assumed.
 */
export function DashboardProfileSummary({ profile, onNavigate }: { profile: DashboardProfileContext; onNavigate: (path: string) => void }) {
  const academic = [
    profile.degree,
    profile.branch,
    profile.semester ? `Semester ${profile.semester}` : null,
    profile.academic_year ? `Year ${profile.academic_year}` : null,
  ].filter(Boolean).join(' · ');
  const subjects = (profile.subjects || []).filter(Boolean);
  // The profile stores short-term goals as free text; accept a list too.
  const goals = Array.isArray(profile.short_term_goals)
    ? profile.short_term_goals.filter(Boolean).slice(0, 2).join(' · ')
    : (profile.short_term_goals || '').trim();
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 md:grid-cols-3" aria-label="Your academic profile">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600"><GraduationCap className="h-4 w-4" /> Academic</div>
        <p className="text-sm font-medium text-slate-900">{academic || 'Not set'}</p>
        {profile.college && <p className="text-xs text-slate-600">{profile.college}</p>}
        <p className="text-xs text-slate-600">{subjects.length ? `Subjects: ${subjects.slice(0, 5).join(', ')}${subjects.length > 5 ? '…' : ''}` : 'No current subjects added'}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600"><Target className="h-4 w-4" /> Goals</div>
        <p className="text-sm font-medium text-slate-900">{profile.target_roles?.length ? profile.target_roles.join(', ') : 'No target role set'}</p>
        {goals ? <p className="text-xs text-slate-600 line-clamp-2">{goals}</p> : null}
        {profile.weekly_study_hours ? <p className="text-xs text-slate-600">{profile.weekly_study_hours} study hours a week</p> : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600"><UserCog className="h-4 w-4" /> Profile</div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-slate-100" role="progressbar" aria-valuenow={profile.completion_percentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${profile.completion_percentage}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-900">{profile.completion_percentage}%</span>
        </div>
        {profile.incomplete_sections.length > 0 && (
          // Phase 6 (P6-004): the raw section keys read as unfinished required work right after a
          // completed registration. Once registration is complete, what is left is optional.
          <p className="text-xs text-slate-600">
            {profile.onboarding_completed ? 'Optional details you can still add: ' : 'Still to fill in: '}
            {profile.incomplete_sections.map((k) => SECTION_LABELS[k] || k).join(', ')}
          </p>
        )}
        <button onClick={() => onNavigate(profile.onboarding_completed ? '/profile/edit' : '/onboarding')} className="text-xs font-semibold text-blue-600 hover:underline">
          {profile.onboarding_completed ? 'Update profile' : 'Continue registration'}
        </button>
      </div>
    </section>
  );
}
