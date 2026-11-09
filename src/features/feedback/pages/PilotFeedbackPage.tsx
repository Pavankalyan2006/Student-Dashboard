// Phase 6: private, voluntary pilot feedback (Settings > Pilot feedback, or /pilot-feedback).
// Three kinds: a short survey (1-5 ratings), a problem report, and a privacy or security concern.
// The student sees and can withdraw only their own entries. No other student or page shows them.
import * as React from 'react';
import { MessageSquareHeart, Bug, ShieldAlert, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, ApiError } from '../../../api/client';

type Kind = 'SURVEY' | 'PROBLEM' | 'PRIVACY_CONCERN';
interface Question { id: string; text: string }
interface Section { key: string; title: string; questions: Question[]; text_prompt?: Question; yes_no?: Question }
interface Config {
  enabled: boolean;
  consent_version: string;
  consent_text: string;
  rating_scale: Record<string, string>;
  sections: Section[];
  tasks: { id: string; title: string }[];
  devices: string[];
  problem_impact: string[];
  retention_days: number;
}
interface Entry {
  id: string;
  kind: Kind;
  ratings: Record<string, number>;
  answers: Record<string, string | boolean>;
  tasks_attempted: string[];
  problem: { module: string; what_happened: string } | null;
  comments: string;
  created_at: string;
}

const DEVICE_LABELS: Record<string, string> = { PHONE: 'Phone', TABLET: 'Tablet', LAPTOP_DESKTOP: 'Laptop or desktop' };
const IMPACT_LABELS: Record<string, string> = {
  BLOCKED_ME: 'It stopped me finishing a task',
  WRONG_RESULT: 'It showed a wrong result',
  CONFUSING: 'It was confusing',
  MINOR: 'Minor issue',
};
const KIND_LABELS: Record<Kind, string> = { SURVEY: 'Survey', PROBLEM: 'Problem report', PRIVACY_CONCERN: 'Privacy or security concern' };

export function PilotFeedbackPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [mine, setMine] = React.useState<Entry[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [kind, setKind] = React.useState<Kind>('SURVEY');
  const [consent, setConsent] = React.useState(false);
  const [ratings, setRatings] = React.useState<Record<string, number | null>>({});
  const [confusing, setConfusing] = React.useState('');
  const [errorsSeen, setErrorsSeen] = React.useState<boolean | null>(null);
  const [tasks, setTasks] = React.useState<string[]>([]);
  const [device, setDevice] = React.useState('');
  const [comments, setComments] = React.useState('');
  const [problem, setProblem] = React.useState({ module: '', page: '', what_happened: '', expected: '', steps: '', impact: '' });
  const [sending, setSending] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [c, m] = await Promise.all([apiClient.get<Config>('/pilot-feedback/config'), apiClient.get<Entry[]>('/pilot-feedback/mine')]);
      setConfig(c);
      setMine(m);
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.message || 'Feedback could not be loaded.');
    }
  }, []);
  React.useEffect(() => {
    void load();
  }, [load]);

  const reset = () => {
    setRatings({});
    setConfusing('');
    setErrorsSeen(null);
    setTasks([]);
    setDevice('');
    setComments('');
    setProblem({ module: '', page: '', what_happened: '', expected: '', steps: '', impact: '' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    if (!consent) {
      toast.error('Please read and accept the notice first.');
      return;
    }
    setSending(true);
    try {
      await apiClient.post('/pilot-feedback', {
        kind,
        consent: true,
        consent_version: config.consent_version,
        ratings: Object.fromEntries(Object.entries(ratings).filter(([, v]) => v)),
        answers: { ...(confusing.trim() ? { reg_confusing_fields: confusing } : {}), ...(errorsSeen === null ? {} : { ux_errors_encountered: errorsSeen }) },
        tasks_attempted: tasks,
        device: device || undefined,
        comments,
        ...(kind !== 'SURVEY' ? { problem: { ...problem, impact: problem.impact || undefined } } : {}),
      });
      toast.success('Thank you. Your feedback was saved privately.');
      reset();
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Feedback could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const withdraw = async (id?: string) => {
    try {
      await apiClient.delete(id ? `/pilot-feedback/mine/${id}` : '/pilot-feedback/mine');
      toast.success(id ? 'Feedback withdrawn and deleted.' : 'All your feedback was withdrawn and deleted.');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Could not withdraw the feedback.');
    }
  };

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-sm text-[#B42318]" role="alert">{loadError}</p>
        <button onClick={() => void load()} className="mt-3 text-sm font-semibold text-[#1570EF]">Try again</button>
      </div>
    );
  }
  if (!config) return <div className="max-w-3xl mx-auto p-6 text-sm text-[#667085]">Loading…</div>;

  const scale = Object.entries(config.rating_scale);
  const field = 'w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {onNavigate && (
        <button onClick={() => onNavigate('/settings')} className="flex items-center gap-1 text-xs font-semibold text-[#475467]">
          <ArrowLeft className="h-3.5 w-3.5" /> Settings
        </button>
      )}
      <header>
        <h1 className="text-xl font-bold text-[#101828]">Pilot feedback</h1>
        <p className="text-sm text-[#475467]">Tell us what worked and what did not. Every question is optional.</p>
      </header>

      {!config.enabled ? (
        <p className="rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-4 text-sm text-[#475467]">
          Pilot feedback is not open on this server right now. You can still see and withdraw feedback you sent earlier below.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <div role="radiogroup" aria-label="Feedback type" className="flex flex-wrap gap-2">
            {([
              ['SURVEY', MessageSquareHeart],
              ['PROBLEM', Bug],
              ['PRIVACY_CONCERN', ShieldAlert],
            ] as const).map(([k, Icon]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${kind === k ? 'border-[#1570EF] bg-[#EFF4FF] text-[#1D4ED8]' : 'border-[#D0D5DD] text-[#344054]'}`}
              >
                <Icon className="h-4 w-4" /> {KIND_LABELS[k]}
              </button>
            ))}
          </div>

          {kind === 'SURVEY' &&
            config.sections.map((section) => (
              <fieldset key={section.key} className="rounded-xl border border-[#EAECF0] bg-white p-4 space-y-4">
                <legend className="px-1 text-sm font-semibold text-[#101828]">{section.title}</legend>
                {section.questions.map((q) => (
                  <div key={q.id}>
                    <p id={`${q.id}-label`} className="text-sm text-[#344054] mb-1.5">{q.text}</p>
                    <div role="radiogroup" aria-labelledby={`${q.id}-label`} className="flex flex-wrap gap-1.5">
                      {scale.map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={ratings[q.id] === Number(value)}
                          onClick={() => setRatings((r) => ({ ...r, [q.id]: r[q.id] === Number(value) ? null : Number(value) }))}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs ${ratings[q.id] === Number(value) ? 'border-[#1570EF] bg-[#1570EF] text-white' : 'border-[#D0D5DD] text-[#344054]'}`}
                        >
                          {value} · {label}
                        </button>
                      ))}
                      <span className="self-center text-[11px] text-[#98A2B3]">Leave empty if you did not use it</span>
                    </div>
                  </div>
                ))}
                {section.text_prompt && (
                  <label className="block text-sm text-[#344054]">
                    {section.text_prompt.text}
                    <input value={confusing} onChange={(e) => setConfusing(e.target.value)} maxLength={300} className={`${field} mt-1`} />
                  </label>
                )}
                {section.yes_no && (
                  <div>
                    <p className="text-sm text-[#344054] mb-1.5">{section.yes_no.text}</p>
                    <div className="flex gap-2">
                      {[true, false].map((v) => (
                        <button
                          key={String(v)}
                          type="button"
                          aria-pressed={errorsSeen === v}
                          onClick={() => setErrorsSeen(errorsSeen === v ? null : v)}
                          className={`rounded-lg border px-3 py-1.5 text-xs ${errorsSeen === v ? 'border-[#1570EF] bg-[#EFF4FF] text-[#1D4ED8]' : 'border-[#D0D5DD]'}`}
                        >
                          {v ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>
            ))}

          {kind !== 'SURVEY' && (
            <fieldset className="rounded-xl border border-[#EAECF0] bg-white p-4 space-y-3">
              <legend className="px-1 text-sm font-semibold text-[#101828]">{kind === 'PROBLEM' ? 'What went wrong?' : 'What is the privacy or security concern?'}</legend>
              <label className="block text-sm text-[#344054]">Module (for example Coding Lab)
                <input value={problem.module} onChange={(e) => setProblem({ ...problem, module: e.target.value })} maxLength={80} className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-[#344054]">Page address (optional)
                <input value={problem.page} onChange={(e) => setProblem({ ...problem, page: e.target.value })} maxLength={200} placeholder="/coding" className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-[#344054]">What happened? *
                <textarea value={problem.what_happened} onChange={(e) => setProblem({ ...problem, what_happened: e.target.value })} maxLength={1000} rows={3} required className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-[#344054]">What did you expect?
                <input value={problem.expected} onChange={(e) => setProblem({ ...problem, expected: e.target.value })} maxLength={500} className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-[#344054]">Steps to see it again
                <textarea value={problem.steps} onChange={(e) => setProblem({ ...problem, steps: e.target.value })} maxLength={1000} rows={3} className={`${field} mt-1`} />
              </label>
              {kind === 'PROBLEM' && (
                <label className="block text-sm text-[#344054]">How much did it affect you?
                  <select value={problem.impact} onChange={(e) => setProblem({ ...problem, impact: e.target.value })} className={`${field} mt-1`}>
                    <option value="">Choose…</option>
                    {config.problem_impact.map((i) => <option key={i} value={i}>{IMPACT_LABELS[i] || i}</option>)}
                  </select>
                </label>
              )}
              <p className="text-[11px] text-[#667085]">Please do not paste passwords, tokens or other people’s details. Screenshots are not collected here.</p>
            </fieldset>
          )}

          <fieldset className="rounded-xl border border-[#EAECF0] bg-white p-4 space-y-3">
            <legend className="px-1 text-sm font-semibold text-[#101828]">About your session (optional)</legend>
            <p className="text-sm text-[#344054]">Which pilot tasks did you try?</p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {config.tasks.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm text-[#344054]">
                  <input type="checkbox" checked={tasks.includes(t.id)} onChange={(e) => setTasks(e.target.checked ? [...tasks, t.id] : tasks.filter((x) => x !== t.id))} />
                  {t.title}
                </label>
              ))}
            </div>
            <label className="block text-sm text-[#344054]">Device you used
              <select value={device} onChange={(e) => setDevice(e.target.value)} className={`${field} mt-1`}>
                <option value="">Prefer not to say</option>
                {config.devices.map((d) => <option key={d} value={d}>{DEVICE_LABELS[d] || d}</option>)}
              </select>
            </label>
            <label className="block text-sm text-[#344054]">Anything else? (optional)
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} maxLength={1000} rows={3} className={`${field} mt-1`} />
            </label>
          </fieldset>

          <div className="rounded-xl border border-[#B2DDFF] bg-[#EFF8FF] p-4 space-y-2">
            <p className="text-xs text-[#175CD3]">{config.consent_text} Retention: {config.retention_days} days.</p>
            <label className="flex items-start gap-2 text-sm text-[#101828]">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              I have read this notice and agree to send this feedback.
            </label>
          </div>
          <button type="submit" disabled={sending || !consent} className="rounded-lg bg-[#1570EF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {sending ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#101828]">Feedback you sent ({mine.length})</h2>
          {mine.length > 0 && (
            <button onClick={() => void withdraw()} className="text-xs font-semibold text-[#B42318]">Withdraw all</button>
          )}
        </div>
        {mine.length === 0 ? (
          <p className="text-sm text-[#667085]">You have not sent any feedback.</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#EAECF0] bg-white p-3">
                <div className="text-sm">
                  <p className="font-medium text-[#101828]">{KIND_LABELS[e.kind]} · {new Date(e.created_at).toLocaleString()}</p>
                  <p className="text-xs text-[#475467]">
                    {e.kind === 'SURVEY'
                      ? `${Object.keys(e.ratings).length} rating${Object.keys(e.ratings).length === 1 ? '' : 's'}${e.comments ? ' and a comment' : ''}`
                      : e.problem?.what_happened.slice(0, 120)}
                  </p>
                </div>
                <button onClick={() => void withdraw(e.id)} aria-label="Withdraw this feedback" className="text-[#B42318]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
