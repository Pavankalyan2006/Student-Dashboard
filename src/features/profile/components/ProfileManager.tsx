// Phase 5: complete profile management on the Student Profile page. Same forms and API as the
// registration wizard; every save goes to the central profile and is confirmed before "Saved".
import * as React from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentProfile, useUpdateProfileSection } from '../hooks/useStudentProfile';
import type { ProfileSectionKey } from '../api/profileMeApi';
import {
  AcademicForm,
  CareerForm,
  ExperienceForm,
  FieldErrors,
  IdentityForm,
  LearningForm,
  SkillsForm,
  fieldErrorsFrom,
} from './ProfileSectionForms';

const TABS: { key: ProfileSectionKey; label: string; completion: string }[] = [
  { key: 'identity', label: 'Account', completion: 'account' },
  { key: 'academic', label: 'Academic', completion: 'academic' },
  { key: 'skills', label: 'Skills', completion: 'skills' },
  { key: 'experience', label: 'Projects & experience', completion: 'experience' },
  { key: 'career', label: 'Career goals', completion: 'career' },
  { key: 'learning', label: 'Learning preferences', completion: 'learning' },
];

export function ProfileCompletionCard({ onOpen }: { onOpen?: (tab: ProfileSectionKey) => void }) {
  const { data } = useStudentProfile();
  if (!data) return null;
  const c = data.completion;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Profile completion</h3>
        <span className="text-lg font-bold text-blue-600">{c.overall_percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4" role="progressbar" aria-valuenow={c.overall_percentage} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-blue-600" style={{ width: `${c.overall_percentage}%` }} />
      </div>
      <ul className="space-y-2">
        {c.sections.map((s) => (
          <li key={s.key} className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${s.percentage === 100 ? 'bg-emerald-500' : s.complete ? 'bg-amber-500' : 'bg-[#F04438]'}`} />
            <span className="text-slate-700">{s.label}</span>
            <span className="text-xs text-slate-500">{s.percentage}%</span>
            {s.action && onOpen && (
              <button className="ml-auto text-xs text-blue-600 hover:underline" onClick={() => onOpen(TABS.find((t) => t.completion === s.key)!.key)}>
                {s.action.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProfileManager({ initialTab = 'identity' }: { initialTab?: ProfileSectionKey }) {
  const { emailVerificationRequired } = useAuth();
  const { data, isLoading, error, refetch } = useStudentProfile();
  const update = useUpdateProfileSection();
  const [tab, setTab] = React.useState<ProfileSectionKey>(initialTab);
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [formKey, setFormKey] = React.useState(0);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // From the completion checklist: open the section, bring the form into view and focus its first field,
  // so the click visibly does something even when that section is already open.
  const openSection = React.useCallback((key: ProfileSectionKey) => {
    setTab(key);
    window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      panel.querySelector<HTMLElement>('input:not([type=hidden]):not([disabled]), select, textarea')?.focus({ preventScroll: true });
    });
  }, []);

  React.useEffect(() => {
    setErrors({});
    setDraft({});
  }, [tab]);

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-slate-500 p-6">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading profile…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-4 text-sm text-red-700">
        Could not load your profile. <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const save = async () => {
    setErrors({});
    let payload = draft;
    if (tab === 'skills') payload = { skills: (draft as any).skills || data.profile.skills.skills };
    if (tab === 'identity') {
      // Consent is recorded once; the account tab only edits contact details.
      const { accept_terms, accept_privacy, ...rest } = draft as any;
      payload = { ...rest, ...(data.profile.identity.terms_accepted_at ? {} : accept_terms ? { accept_terms } : {}), ...(data.profile.identity.privacy_accepted_at ? {} : accept_privacy ? { accept_privacy } : {}) };
    }
    try {
      await update.mutateAsync({ section: tab, data: payload, version: data.profile.account.profile_version });
      toast.success('Profile saved');
      setFormKey((k) => k + 1);
    } catch (err: any) {
      setErrors(fieldErrorsFrom(err));
      if (err?.status === 409) {
        toast.error('Your profile changed in another tab. Reloading the latest version.');
        await refetch();
        setFormKey((k) => k + 1);
      } else {
        toast.error(err.message || 'Could not save. Nothing was changed.');
      }
    }
  };

  const props = { profile: data.profile, errors, onChange: setDraft };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 min-w-0">
      <div ref={panelRef} className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white">
        <div role="tablist" aria-label="Profile sections" className="flex flex-wrap gap-1 border-b border-slate-200 p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === t.key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-5 min-w-0" key={`${tab}-${formKey}`}>
          {tab === 'identity' && <IdentityForm {...props} emailVerificationRequired={emailVerificationRequired} />}
          {tab === 'academic' && <AcademicForm {...props} />}
          {tab === 'skills' && <SkillsForm {...props} withInterests={false} />}
          {tab === 'experience' && <ExperienceForm {...props} />}
          {tab === 'career' && <CareerForm {...props} />}
          {tab === 'learning' && <LearningForm {...props} />}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button isLoading={update.isPending} onClick={save}>Save changes</Button>
            <span className="text-xs text-slate-400">
              Last saved {data.profile.account.last_profile_update ? new Date(data.profile.account.last_profile_update).toLocaleString() : 'never'}
            </span>
          </div>
        </div>
      </div>
      <ProfileCompletionCard onOpen={openSection} />
    </div>
  );
}
