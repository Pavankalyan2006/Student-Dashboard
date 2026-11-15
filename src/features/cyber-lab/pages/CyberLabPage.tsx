import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck, Lock, CheckCircle2, Lightbulb, BookOpen, ArrowLeft, Scale } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { cn } from '../../../lib/utils';
import { ShellEnv, CaptureEnv, McqEnv, SqliEnv, XssEnv, IdorEnv, JwtEnv, HashEnv, CryptoEnv } from '../components/Environments';

interface Track {
  id: string;
  title: string;
  summary: string;
  courses: { id: string; title: string }[];
  links?: { href: string; label: string }[];
  total: number;
  completed: number;
}
interface Exercise {
  id: string;
  track: string;
  level: 1 | 2 | 3;
  title: string;
  kind: string;
  brief: string;
  data?: Record<string, any>;
  hints: string[];
  skills: string[];
  unlocked: boolean;
  completed_at?: string;
  attempts: number;
  lesson?: string;
}
interface Overview {
  rules: string[];
  agreed_at?: string;
  tracks: Track[];
  exercises: Exercise[];
  completed: number;
  total: number;
  skills: { skill: string; exercises: number; last_at: string }[];
}

const KEY = ['cybersecurity', 'me'];
const LEVEL = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' } as const;

function Environment({ ex, answer, setAnswer }: { ex: Exercise; answer: string; setAnswer: (v: string) => void }) {
  const data = ex.data || {};
  const props = { data, onFound: React.useCallback((f: string) => setAnswer(f), [setAnswer]) };
  switch (ex.kind) {
    case 'shell':
      return <ShellEnv key={ex.id} {...props} />;
    case 'sqli':
      return <SqliEnv key={ex.id} {...props} />;
    case 'xss':
      return <XssEnv key={ex.id} {...props} />;
    case 'idor':
      return <IdorEnv key={ex.id} {...props} />;
    case 'jwt':
      return <JwtEnv key={ex.id} {...props} />;
    case 'hash':
      return <HashEnv key={ex.id} {...props} />;
    case 'crypto':
      return <CryptoEnv key={ex.id} {...props} />;
    case 'mcq':
      return <McqEnv key={ex.id} {...props} value={answer} onChange={setAnswer} />;
    default:
      return data.capture ? <CaptureEnv {...props} /> : null;
  }
}

function ExerciseView({ ex, track, onBack, onNavigate }: { ex: Exercise; track?: Track; onBack: () => void; onNavigate: (p: string) => void }) {
  const qc = useQueryClient();
  const [answer, setAnswer] = React.useState('');
  const [hints, setHints] = React.useState(0);
  const [wrong, setWrong] = React.useState(false);
  const submit = useMutation({
    mutationFn: () => apiClient.post<{ correct: boolean; lesson?: string; already_completed?: boolean }>(`/cybersecurity/exercises/${ex.id}/attempt`, { answer }),
    onSuccess: (r) => {
      if (r.correct) {
        setWrong(false);
        toast.success(r.already_completed ? 'Correct again.' : `Solved: ${ex.title}`);
        qc.invalidateQueries({ queryKey: KEY });
      } else setWrong(true);
    },
    onError: (e: any) => toast.error(e?.message || 'The answer could not be checked.'),
  });

  return (
    <div className="space-y-4" data-testid="cyber-exercise">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All exercises
      </button>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">{ex.title}</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{LEVEL[ex.level]}</span>
          {ex.completed_at && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Solved</span>}
        </div>
        <p className="mt-1 text-sm text-slate-700">{ex.brief}</p>
        <p className="mt-1 text-xs text-slate-500">Skills: {ex.skills.join(', ')}</p>
      </div>

      <Environment ex={ex} answer={answer} setAnswer={setAnswer} />

      <form
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (answer.trim()) submit.mutate();
        }}
      >
        {ex.kind !== 'mcq' && (
          <input
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 font-mono text-sm focus:border-blue-400 focus:outline-none"
            placeholder={ex.kind === 'answer' ? 'Your answer' : 'FLAG{…} or your answer'}
            aria-label="Answer"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setWrong(false);
            }}
          />
        )}
        <Button type="submit" size="sm" disabled={!answer.trim() || submit.isPending} isLoading={submit.isPending} className={ex.kind === 'mcq' ? 'ml-auto' : ''}>
          Check answer
        </Button>
        {wrong && <p className="w-full text-sm text-rose-700" role="status">Not quite. Try again{hints < ex.hints.length ? ', or take a hint' : ''}.</p>}
      </form>

      {ex.lesson && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" data-testid="cyber-lesson">
          <p className="font-semibold">What happened, and how to defend against it</p>
          <p className="mt-1">{ex.lesson}</p>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-3">
        {ex.hints.length > 0 && (
          <div className="min-w-0 flex-1 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {ex.hints.slice(0, hints).map((h, i) => <p key={i} className="mb-1"><Lightbulb className="mr-1 inline h-3.5 w-3.5" />{h}</p>)}
            {hints < ex.hints.length && (
              <button type="button" className="text-xs font-semibold underline" onClick={() => setHints((n) => n + 1)}>
                {hints ? 'Another hint' : 'Show a hint'}
              </button>
            )}
          </div>
        )}
        {track && (
          <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-3 text-sm">
            <p className="text-xs font-medium text-slate-500">Learn the theory</p>
            {track.courses.map((c) => (
              <button key={c.id} type="button" className="mt-1 flex items-center gap-1.5 text-blue-700 hover:underline" onClick={() => onNavigate(`/courses/${c.id}`)}>
                <BookOpen className="h-3.5 w-3.5" /> {c.title}
              </button>
            ))}
            {track.links?.map((l) => (
              <button key={l.href} type="button" className="mt-1 flex items-center gap-1.5 text-blue-700 hover:underline" onClick={() => onNavigate(l.href)}>
                <BookOpen className="h-3.5 w-3.5" /> {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Cybersecurity Lab: guided exercises against practice targets that run in the student's own browser
 * (a simulated shell, a toy SQLite login, a sandboxed comment board, a simulated API). Nothing here reaches
 * another machine. Answers are checked on the server, which records solved exercises and the skills shown.
 */
export function CyberLabPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<Overview>('/cybersecurity/me') });
  const [open, setOpen] = React.useState<string | null>(null);
  const agree = useMutation({
    mutationFn: () => apiClient.post('/cybersecurity/me/agree', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: any) => toast.error(e?.message || 'Could not save.'),
  });

  if (q.isLoading) return <PageContainer><LoadingState message="Loading the lab…" /></PageContainer>;
  if (q.isError || !q.data) return <PageContainer><ErrorState message="The lab could not be loaded." onRetry={() => q.refetch()} /></PageContainer>;
  const d = q.data;
  const ex = open ? d.exercises.find((e) => e.id === open) : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Practice"
        title="Cybersecurity Lab"
        description="Break practice systems on purpose, then learn the fix. Every target runs inside your browser: no real machine is scanned or attacked."
        icon={<ShieldCheck className="h-6 w-6" />}
      />

      {!d.agreed_at ? (
        <PageSection title="Before you start" description="These rules apply to everything in this lab.">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" data-testid="cyber-rules">
            <ul className="space-y-2 text-sm text-slate-700">
              {d.rules.map((r, i) => <li key={i} className="flex gap-2"><Scale className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />{r}</li>)}
            </ul>
            <Button onClick={() => agree.mutate()} isLoading={agree.isPending}>I agree, start the lab</Button>
          </div>
        </PageSection>
      ) : ex ? (
        <ExerciseView key={ex.id} ex={ex} track={d.tracks.find((t) => t.id === ex.track)} onBack={() => setOpen(null)} onNavigate={onNavigate} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <MetricCard label="Exercises solved" value={`${d.completed} / ${d.total}`} className="min-w-0" />
            <MetricCard label="Skills shown" value={d.skills.length} hint={d.skills.slice(0, 3).map((s) => s.skill).join(', ') || 'Solve an exercise to start'} tone="info" className="min-w-0" />
            <MetricCard label="Tracks finished" value={d.tracks.filter((t) => t.total && t.completed === t.total).length} hint={`of ${d.tracks.length}`} className="min-w-0" />
          </div>

          {d.tracks.map((t) => (
            <PageSection key={t.id} className="min-w-0" title={t.title} description={`${t.summary} ${t.completed}/${t.total} solved.`}>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid={`cyber-track-${t.id}`}>
                {d.exercises.filter((e) => e.track === t.id).map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      disabled={!e.unlocked}
                      onClick={() => setOpen(e.id)}
                      className={cn('flex w-full items-start gap-2 rounded-xl border p-3 text-left', e.unlocked ? 'border-slate-200 bg-white hover:border-blue-300' : 'cursor-not-allowed border-dashed border-slate-200 bg-slate-50 opacity-70')}
                    >
                      {e.completed_at ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : e.unlocked ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> : <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900">{e.title}</span>
                        <span className="block text-xs text-slate-500">{LEVEL[e.level]}{e.unlocked ? '' : ' · finish an easier one first'}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </PageSection>
          ))}

          {d.skills.length > 0 && (
            <PageSection title="Skills you have shown" description="From the exercises you solved. Each skill lists how many exercises showed it.">
              <div className="flex flex-wrap gap-1.5" data-testid="cyber-skills">
                {d.skills.map((s) => <span key={s.skill} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">{s.skill} · {s.exercises}</span>)}
              </div>
            </PageSection>
          )}
        </>
      )}
    </PageContainer>
  );
}

export default CyberLabPage;
