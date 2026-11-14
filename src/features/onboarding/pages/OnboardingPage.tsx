// Phase 5: the student registration and onboarding wizard (replaces the earlier 5-step page on
// the same /register and /onboarding routes).
//
// Step 1 creates the account (Firebase Auth when configured, otherwise the existing provider) and
// records consent. Steps 2-6 fill the central student profile; each step is saved to the server
// before moving on, so a student who leaves can sign in again and resume at the same step. Step 7
// reviews everything and records completion with the real timestamp.
import * as React from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Loader2, MailCheck, RefreshCw, Pencil } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { profileMeApi } from '../../profile/api/profileMeApi';
import { applyProfileUpdate, useStudentProfile } from '../../profile/hooks/useStudentProfile';
import {
  AcademicForm,
  CareerForm,
  ExperienceForm,
  FieldErrors,
  FieldError,
  IdentityForm,
  LearningForm,
  SkillsForm,
  TextField,
  fieldErrorsFrom,
  SKILL_CATEGORY_LABELS,
} from '../../profile/components/ProfileSectionForms';
import { trackEvent } from '../../../lib/analytics';

export const REGISTRATION_STEPS = [
  { n: 1, title: 'Account and identity', optional: false },
  { n: 2, title: 'Academic profile', optional: false },
  { n: 3, title: 'Technical skills', optional: true },
  { n: 4, title: 'Projects and experience', optional: true },
  { n: 5, title: 'Career profile', optional: false },
  { n: 6, title: 'Learning preferences', optional: false },
  { n: 7, title: 'Review and complete', optional: false },
] as const;

export function passwordProblems(password: string, email: string): string[] {
  const p: string[] = [];
  if (password.length < 8) p.push('at least 8 characters');
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) p.push('a letter and a number');
  if (email && password.toLowerCase() === email.toLowerCase()) p.push('different from your email');
  return p;
}

function AccountCreateForm({ onCreated }: { onCreated: () => void }) {
  const { register, provider, pendingProvisioning, retryProvisioning, error } = useAuth();
  const [f, setF] = React.useState({ name: '', email: '', password: '', confirm: '', phone: '', terms: false, privacy: false });
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [busy, setBusy] = React.useState(false);
  const set = (k: keyof typeof f) => (v: any) => setF((x) => ({ ...x, [k]: v }));
  const problems = passwordProblems(f.password, f.email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (f.name.trim().length < 2) errs.full_name = 'is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) errs.email = 'enter a valid email address';
    if (problems.length) errs.password = `needs ${problems.join(', ')}`;
    if (f.password !== f.confirm) errs.confirm_password = 'passwords do not match';
    if (!f.terms) errs.accept_terms = 'must be accepted';
    if (!f.privacy) errs.accept_privacy = 'must be accepted';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await register({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        phone: f.phone.trim() || undefined,
        accept_terms: true,
        accept_privacy: true,
      });
      toast.success('Account created. Next: your academic profile.');
      onCreated();
    } catch (err: any) {
      setErrors({ ...fieldErrorsFrom(err), form: err.message || 'Registration failed' });
    } finally {
      setBusy(false);
    }
  };

  if (pendingProvisioning) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-amber-700">{error}</p>
        <Button onClick={async () => (await retryProvisioning()) && onCreated()}>
          <RefreshCw className="w-4 h-4 mr-1" /> Try again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField id="full_name" label="Full name" required value={f.name} onChange={set('name')} errors={errors} />
        <TextField id="email" label="Email address" type="email" required value={f.email} onChange={set('email')} errors={errors} />
        <div>
          <TextField id="password" label="Password" type="password" required value={f.password} onChange={set('password')} errors={errors} />
          {f.password && (
            <p className={`mt-1 text-[11px] ${problems.length ? 'text-amber-700' : 'text-emerald-700'}`}>
              {problems.length ? `Needs ${problems.join(', ')}` : 'Strong enough'}
            </p>
          )}
        </div>
        <TextField id="confirm_password" label="Confirm password" type="password" required value={f.confirm} onChange={set('confirm')} errors={errors} />
        <TextField id="phone" label="Phone number" type="tel" value={f.phone} onChange={set('phone')} errors={errors} />
      </div>
      <div className="space-y-2 rounded-lg border border-slate-200 p-3">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={f.terms} onChange={(e) => set('terms')(e.target.checked)} /> I agree to the Terms of Use. <span className="text-red-600">*</span>
        </label>
        <FieldError errors={errors} name="accept_terms" />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={f.privacy} onChange={(e) => set('privacy')(e.target.checked)} /> I have read the Privacy Policy and agree to my profile being used to personalise my learning. <span className="text-red-600">*</span>
        </label>
        <FieldError errors={errors} name="accept_privacy" />
      </div>
      {errors.form && <p role="alert" className="text-sm text-red-600">{errors.form}</p>}
      <p className="text-xs text-slate-500">
        {provider === 'firebase'
          ? 'Your password is handled by Firebase Authentication. We will send a verification email.'
          : 'Your password is stored only as a secure hash.'}
      </p>
      <Button type="submit" isLoading={busy} className="w-full sm:w-auto">
        Create account <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </form>
  );
}

function VerificationBanner() {
  const { provider, student, resendVerificationEmail, reloadVerification, emailVerificationRequired } = useAuth();
  const { data, refetch } = useStudentProfile();
  if (provider !== 'firebase' || data?.profile.identity.email_verified || student?.email_verified) return null;
  return (
    <div className="mb-4 rounded-lg border border-[#FEDF89] bg-[#FFFAEB] p-3 text-sm text-amber-800 flex flex-wrap items-center gap-2">
      <MailCheck className="w-4 h-4" />
      <span>
        Verify your email address using the link we sent.{emailVerificationRequired ? ' Verification is needed before you can finish registration.' : ''}
      </span>
      <Button size="sm" variant="outline" onClick={async () => { try { await resendVerificationEmail(); toast.success('Verification email sent.'); } catch (e: any) { toast.error(e.message); } }}>
        Resend
      </Button>
      <Button size="sm" variant="outline" onClick={async () => { const ok = await reloadVerification(); await refetch(); toast[ok ? 'success' : 'info'](ok ? 'Email verified.' : 'Not verified yet.'); }}>
        I have verified
      </Button>
    </div>
  );
}

function Review({ onEdit }: { onEdit: (step: number) => void }) {
  const { data } = useStudentProfile();
  if (!data) return null;
  const { profile: p, completion } = data;
  const rows: [number, string, [string, React.ReactNode][]][] = [
    [1, 'Account', [['Name', p.identity.full_name], ['Email', `${p.identity.email}${p.identity.email_verified ? ' (verified)' : ' (not verified)'}`], ['Phone', p.identity.phone || '—']]],
    [2, 'Academic', [['College', p.academic.college || '—'], ['University', p.academic.university || '—'], ['Degree / branch', `${p.academic.degree || '—'} · ${p.academic.branch || '—'}`], ['Semester / year', `${p.academic.current_semester || '—'} / ${p.academic.academic_year || '—'}`], ['Graduation', p.academic.expected_graduation_year || '—'], ['Subjects', p.academic.subjects.join(', ') || '—']]],
    [3, 'Skills', [['Skills', p.skills.skills.map((s) => `${s.name} (${s.proficiency.toLowerCase()}, ${SKILL_CATEGORY_LABELS[s.category]})`).join(', ') || '—'], ['Interests', p.learning.learning_interests.join(', ') || '—']]],
    [4, 'Projects and experience', [['Projects', p.experience.projects.map((x) => x.title).join(', ') || '—'], ['Experience', p.experience.experience.map((x) => `${x.role} at ${x.organization}`).join(', ') || '—'], ['Certifications', p.experience.certifications.map((x) => x.name).join(', ') || '—']]],
    [5, 'Career', [['Target roles', p.career.target_roles.join(', ') || '—'], ['Locations', p.career.preferred_locations.join(', ') || '—'], ['Exams', p.career.competitive_exams.join(', ') || '—']]],
    [6, 'Learning', [['Languages', p.learning.preferred_languages.join(', ') || '—'], ['Style / difficulty', `${p.learning.explanation_style || '—'} / ${p.learning.difficulty || '—'}`], ['Availability', `${p.learning.weekly_study_hours ?? '—'} h/week, ${p.learning.daily_study_minutes ?? '—'} min/day`]]],
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        Profile completion: <strong>{completion.overall_percentage}%</strong>
        {completion.incomplete_sections.length > 0 && <span className="text-slate-500"> · recommended to finish later: {completion.sections.filter((s) => s.percentage < 100).map((s) => s.label).join(', ')}</span>}
      </p>
      {rows.map(([step, title, fields]) => (
        <div key={step} className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            <Button size="sm" variant="ghost" onClick={() => onEdit(step)}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {fields.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-900 break-words">{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

export function OnboardingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { isAuthenticated, student, emailVerificationRequired } = useAuth();
  const { data, isLoading, refetch } = useStudentProfile();
  const [step, setStep] = React.useState<number>(1);
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [saving, setSaving] = React.useState(false);
  const resumed = React.useRef(false);

  // Resume where the student stopped (saved on the server, so it survives logout and other devices).
  React.useEffect(() => {
    if (data && !resumed.current) {
      resumed.current = true;
      const o = data.profile.account.onboarding;
      const fromUrl = Number(new URLSearchParams(window.location.search).get('step'));
      setStep(fromUrl >= 1 && fromUrl <= 7 ? fromUrl : o.completed ? 7 : Math.max(2, o.current_step));
    }
  }, [data]);

  React.useEffect(() => {
    setErrors({});
    setDraft({});
  }, [step]);

  if (!isAuthenticated) {
    return (
      <Shell step={1} completed={[]} skipped={[]} onJump={() => {}}>
        <h2 className="text-lg font-semibold mb-1">Create your account</h2>
        <p className="text-sm text-slate-500 mb-4">Step 1 of 7. You can save and continue the rest later.</p>
        <AccountCreateForm onCreated={() => { resumed.current = false; void refetch(); }} />
        <p className="mt-4 text-sm text-slate-500">
          Already registered? <button className="text-blue-600 font-medium" onClick={() => onNavigate('/login')}>Sign in</button>
        </p>
      </Shell>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading your profile…
      </div>
    );
  }

  const { profile, completion } = data;
  const o = profile.account.onboarding;
  const meta = REGISTRATION_STEPS[step - 1];

  const save = async (opts: { skip?: boolean; advance?: boolean } = {}) => {
    setSaving(true);
    setErrors({});
    try {
      const res = await profileMeApi.saveStep(step, draft, Boolean(opts.skip));
      applyProfileUpdate(res); // success only after the server confirmed the write
      toast.success(opts.skip ? `Skipped ${meta.title.toLowerCase()} — you can add it later from your profile.` : 'Saved');
      if (opts.advance !== false) setStep((s) => Math.min(7, s + 1));
    } catch (err: any) {
      setErrors(fieldErrorsFrom(err));
      toast.error(err.message || 'Could not save this step. Nothing was changed.');
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      const res = await profileMeApi.complete();
      applyProfileUpdate(res);
      void trackEvent('onboarding_completed', { step_count: 7 });
      toast.success('Registration complete. Welcome!');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Could not complete registration.');
    } finally {
      setSaving(false);
    }
  };

  const formProps = { profile, errors, onChange: setDraft };
  return (
    <Shell step={step} completed={o.completed_steps} skipped={o.skipped_steps} onJump={setStep}>
      <VerificationBanner />
      <h2 className="text-lg font-semibold mb-1">{meta.title}</h2>
      <p className="text-sm text-slate-500 mb-4">
        Step {step} of 7{meta.optional ? ' · optional, you can skip it and complete it later' : ''}. Fields marked * are required.
      </p>
      {step === 1 && <IdentityForm {...formProps} emailVerificationRequired={emailVerificationRequired} />}
      {step === 2 && <AcademicForm {...formProps} />}
      {step === 3 && <SkillsForm {...formProps} />}
      {step === 4 && <ExperienceForm {...formProps} />}
      {step === 5 && <CareerForm {...formProps} />}
      {step === 6 && <LearningForm {...formProps} />}
      {step === 7 && <Review onEdit={setStep} />}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button variant="outline" disabled={step === 1 || saving} onClick={() => setStep((s) => Math.max(1, s - 1))}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < 7 && (
          <>
            <Button variant="outline" isLoading={saving} onClick={() => save({ advance: false })}>Save progress</Button>
            {meta.optional && <Button variant="ghost" disabled={saving} onClick={() => save({ skip: true })}>Skip for now</Button>}
            <Button isLoading={saving} onClick={() => save()}>
              Save and continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
        {step === 7 && (
          o.completed ? (
            <Button onClick={() => onNavigate('/dashboard')}>Go to dashboard</Button>
          ) : (
            <Button isLoading={saving} disabled={!completion.onboarding_ready} onClick={finish}>
              Confirm and complete registration
            </Button>
          )
        )}
        {step === 7 && !completion.onboarding_ready && (
          <p className="text-xs text-amber-700 w-full">
            Still required:{' '}
            {completion.sections.flatMap((s) => s.items.filter((i) => i.required && !i.done).map((i) => `${i.label} (step ${s.step})`)).join(', ')}
          </p>
        )}
      </div>
      {student && <p className="mt-6 text-xs text-slate-400">Your progress is saved on the server after each step. You can sign out and continue later.</p>}
    </Shell>
  );
}

function Shell({ step, completed, skipped, onJump, children }: { step: number; completed: number[]; skipped: number[]; onJump: (n: number) => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[240px_1fr] gap-6">
        {/* Phase 6 (P6-005): on phones the step list filled the first screen and pushed the form below the fold; it now follows the form there. */}
        <nav aria-label="Registration steps" className="order-2 md:order-1 bg-white rounded-xl border border-slate-200 p-4 h-fit">
          <p className="text-xs font-semibold text-slate-500 mb-3">Student registration</p>
          <ol className="space-y-1">
            {REGISTRATION_STEPS.map((s) => {
              const done = completed.includes(s.n);
              const skip = skipped.includes(s.n);
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    onClick={() => onJump(s.n)}
                    aria-current={s.n === step ? 'step' : undefined}
                    className={`w-full text-left flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${s.n === step ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-300" />}
                    <span>{s.n}. {s.title}</span>
                    {skip && <span className="ml-auto text-[10px] text-slate-400">skipped</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <main className="order-1 md:order-2 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
