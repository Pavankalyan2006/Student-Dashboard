// Phase 5: complete profile management on the Student Profile page. Same forms and API as the
// registration wizard; every save goes to the central profile and is confirmed before "Saved".
import * as React from 'react';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';
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
    <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#101828]">Profile completion</h3>
        <span className="text-lg font-bold text-[#2563EB]">{c.overall_percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#F2F4F7] overflow-hidden mb-4" role="progressbar" aria-valuenow={c.overall_percentage} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[#2563EB]" style={{ width: `${c.overall_percentage}%` }} />
      </div>
      <ul className="space-y-2">
        {c.sections.map((s) => (
          <li key={s.key} className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${s.percentage === 100 ? 'bg-[#12B76A]' : s.complete ? 'bg-[#F79009]' : 'bg-[#F04438]'}`} />
            <span className="text-[#344054]">{s.label}</span>
            <span className="text-xs text-[#667085]">{s.percentage}%</span>
            {s.action && onOpen && (
              <button className="ml-auto text-xs text-[#2563EB] hover:underline" onClick={() => onOpen(TABS.find((t) => t.completion === s.key)!.key)}>
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

  React.useEffect(() => {
    setErrors({});
    setDraft({});
  }, [tab]);

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-[#667085] p-6">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading profile…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-4 text-sm text-[#B42318]">
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
      <div className="min-w-0 rounded-2xl border border-[#E4E7EC] bg-white">
        <div role="tablist" aria-label="Profile sections" className="flex flex-wrap gap-1 border-b border-[#EAECF0] p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === t.key ? 'bg-[#EFF4FF] text-[#1D4ED8] font-medium' : 'text-[#475467] hover:bg-[#F2F4F7]'}`}
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
            <span className="text-xs text-[#98A2B3]">
              Last saved {data.profile.account.last_profile_update ? new Date(data.profile.account.last_profile_update).toLocaleString() : 'never'}
            </span>
          </div>
        </div>
      </div>
      <ProfileCompletionCard onOpen={setTab} />
    </div>
  );
}

/** Small "recommended for you" panel used by module pages; explains which profile data it used. */
export function ProfileRecommendationsPanel({ module, title, onNavigate }: { module: string; title?: string; onNavigate?: (path: string) => void }) {
  const [state, setState] = React.useState<{ loading: boolean; data: any | null }>({ loading: true, data: null });
  const load = React.useCallback(async () => {
    try {
      const { profileMeApi } = await import('../api/profileMeApi');
      setState({ loading: false, data: await profileMeApi.recommendations(module) });
    } catch {
      setState({ loading: false, data: null });
    }
  }, [module]);
  React.useEffect(() => {
    void load();
    const on = () => void load();
    window.addEventListener('profile:updated', on);
    return () => window.removeEventListener('profile:updated', on);
  }, [load]);
  const d = state.data;
  if (state.loading || !d) return null;
  const go = (path: string) => (onNavigate ? onNavigate(path) : (window.location.href = path));
  return (
    <section aria-label={title || 'Recommended for you'} className="rounded-2xl border border-[#E4E7EC] bg-white p-4" data-testid={`profile-recs-${module}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#101828]">{title || 'Recommended for you'}</h3>
        <button className="text-xs text-[#2563EB] hover:underline" onClick={() => go('/profile/edit')}>Edit profile</button>
      </div>
      <p className="text-xs text-[#667085] mb-2">{d.summary}</p>
      {d.items.length === 0 ? (
        d.missing_profile_data.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => go('/profile/edit')}>
            Add {d.missing_profile_data[0]} <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )
      ) : (
        <ul className="space-y-1.5">
          {d.items.slice(0, 6).map((it: any) => (
            <li key={it.id} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 text-[10px] px-1.5 py-0.5 rounded ${it.kind === 'MANDATORY' ? 'bg-[#FEF0C7] text-[#93370D]' : 'bg-[#EFF4FF] text-[#1D4ED8]'}`}>
                {it.kind === 'MANDATORY' ? (module === 'courses' ? 'Your subject' : 'Selected') : 'Suggested'}
              </span>
              <span className="flex-1">
                {/* A link back to the page the student is already on would do nothing when clicked. */}
                {it.link && it.link !== window.location.pathname ? (
                  <button className="text-left text-[#101828] hover:text-[#2563EB]" onClick={() => go(it.link)}>{it.title}</button>
                ) : (
                  <span className="text-[#101828]">{it.title}</span>
                )}
                <span className="block text-[11px] text-[#667085]">{it.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
