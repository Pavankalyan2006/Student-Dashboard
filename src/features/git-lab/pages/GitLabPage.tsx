// Git practice lab: lessons, graded exercises and a free sandbox.
// All commands run in a simulated repository on the server; nothing runs on a real computer.
import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, Circle, GitBranch, Lightbulb, RotateCcw, Terminal, Trophy, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { gitLabApi, GitRepoView, GitWorkspace } from '../api/gitLabApi';

interface Props {
  onNavigate?: (path: string) => void;
}

type View = { kind: 'lesson'; id: string } | { kind: 'exercise'; id: string } | { kind: 'sandbox' };

interface TermLine {
  cmd: string;
  ok: boolean;
  output: string;
}

const Badge: React.FC<{ children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'indigo' }> = ({ children, tone = 'slate' }) => {
  const tones = { slate: 'bg-slate-100 text-slate-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-800', indigo: 'bg-indigo-50 text-indigo-700' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tones[tone]}`}>{children}</span>;
};

/** Terminal: one command at a time, sent to the simulator. */
const GitTerminal: React.FC<{ lines: TermLine[]; onRun: (cmd: string) => Promise<void>; busy: boolean }> = ({ lines, onRun, busy }) => {
  const [cmd, setCmd] = React.useState('');
  const [past, setPast] = React.useState<string[]>([]);
  const [pos, setPos] = React.useState(-1);
  const end = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [lines]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = cmd.trim();
    if (!c || busy) return;
    setPast((p) => [c, ...p].slice(0, 50));
    setPos(-1);
    setCmd('');
    await onRun(c);
  };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' && past.length) {
      e.preventDefault();
      const n = Math.min(pos + 1, past.length - 1);
      setPos(n);
      setCmd(past[n]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const n = pos - 1;
      setPos(n);
      setCmd(n >= 0 ? past[n] : '');
    }
  };
  return (
    <div className="rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-slate-400">
        <Terminal className="w-3.5 h-3.5" /> Simulated terminal (type "help")
      </div>
      <div className="p-4 h-64 overflow-y-auto space-y-2" aria-live="polite">
        {lines.length === 0 && <p className="text-slate-500">No commands yet.</p>}
        {lines.map((l, i) => (
          <div key={i}>
            <div className="text-emerald-400">$ {l.cmd}</div>
            {l.output && <pre className={`whitespace-pre-wrap break-words ${l.ok ? 'text-slate-200' : 'text-rose-300'}`}>{l.output}</pre>}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-800 px-4 py-2">
        <label htmlFor="git-cmd" className="text-emerald-400">$</label>
        <input id="git-cmd" value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={onKey} maxLength={500} autoComplete="off" spellCheck={false}
          placeholder='git status' aria-label="Git command" className="flex-1 bg-transparent outline-none text-slate-100 placeholder:text-slate-600" />
        <button type="submit" disabled={busy || !cmd.trim()} className="px-3 py-1 rounded bg-emerald-600 text-white font-sans font-semibold disabled:opacity-40 cursor-pointer">Run</button>
      </form>
    </div>
  );
};

/** Repository state: branches, commit graph (as a list), status and files. */
const RepoPanel: React.FC<{ repo: GitRepoView }> = ({ repo }) => {
  if (!repo.initialized) return <p className="text-sm text-slate-500">Not a repository yet. Start with <code className="font-mono">git init</code>.</p>;
  const s = repo.status!;
  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-semibold text-slate-700">HEAD:</span>
        <Badge tone="indigo">{repo.head.branch ? `${repo.head.branch}` : `detached at ${repo.head.commit}`}</Badge>
        {repo.merge_in_progress && <Badge tone="amber">Merge in progress: {repo.merge_in_progress.conflicts.join(', ')}</Badge>}
        {repo.stash.length > 0 && <Badge>{repo.stash.length} stash entr{repo.stash.length === 1 ? 'y' : 'ies'}</Badge>}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 mb-1">Commits (newest first)</h4>
        {repo.commits.length === 0 ? <p className="text-slate-500">No commits yet.</p> : (
          <ol className="space-y-1">
            {repo.commits.slice(0, 30).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c.parents.length > 1 ? 'bg-amber-500' : 'bg-indigo-500'}`} aria-hidden />
                <code className="font-mono text-slate-500">{c.short_id}</code>
                <span className="text-slate-800">{c.message}</span>
                {c.refs.map((r) => <Badge key={r} tone={r.startsWith('tag:') ? 'amber' : r.includes('/') && !r.startsWith('HEAD') ? 'slate' : 'green'}>{r}</Badge>)}
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">Staged</h4>
          {s.staged.length ? s.staged.map((x) => <div key={x.path} className="text-emerald-700">{x.change}: {x.path}</div>) : <div className="text-slate-400">Nothing staged</div>}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">Not staged / untracked</h4>
          {s.conflicted.map((p) => <div key={p} className="text-rose-700">conflict: {p}</div>)}
          {s.unstaged.map((x) => <div key={x.path} className="text-amber-700">{x.change}: {x.path}</div>)}
          {s.untracked.map((p) => <div key={p} className="text-slate-600">untracked: {p}</div>)}
          {!s.unstaged.length && !s.untracked.length && !s.conflicted.length && <div className="text-slate-400">Clean</div>}
        </div>
      </div>
      <details>
        <summary className="cursor-pointer font-semibold text-slate-800">Files in the working directory ({repo.files.length})</summary>
        <div className="mt-2 space-y-2">
          {repo.files.map((f) => (
            <div key={f.path}>
              <div className="font-mono text-slate-600">{f.path}</div>
              <pre className="bg-slate-50 border border-slate-200 rounded p-2 whitespace-pre-wrap break-words font-mono">{f.content || '(empty)'}</pre>
            </div>
          ))}
        </div>
      </details>
      {repo.remote && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-1">Simulated remote {repo.remote.name}</h4>
          {repo.remote.branches.length ? repo.remote.branches.map((b) => <div key={b.name}>{b.name} at <code className="font-mono">{b.commit}</code></div>) : <div className="text-slate-400">Nothing pushed yet</div>}
        </div>
      )}
    </div>
  );
};

const ExerciseView: React.FC<{ id: string; onDone: () => void }> = ({ id, onDone }) => {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['git-lab', 'exercise', id], queryFn: () => gitLabApi.exercise(id) });
  const [lines, setLines] = React.useState<TermLine[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [solution, setSolution] = React.useState<string[] | null>(null);
  React.useEffect(() => {
    setLines([]);
    setSolution(null);
  }, [id]);
  const ws = q.data;
  const update = (w: GitWorkspace) => qc.setQueryData(['git-lab', 'exercise', id], w);
  const run = async (cmd: string) => {
    setBusy(true);
    try {
      const w = await gitLabApi.run(id, cmd);
      setLines((l) => [...l, { cmd, ok: !!w.result?.ok, output: w.result?.output || '' }]);
      update(w);
      if (w.newly_completed) {
        toast.success('Exercise complete');
        onDone();
      }
    } catch (err: any) {
      toast.error(err?.message || 'The command could not be sent');
    } finally {
      setBusy(false);
    }
  };
  const hint = async () => {
    try {
      await gitLabApi.hint(id);
      await q.refetch();
    } catch (err: any) {
      toast.error(err?.message || 'No hint available');
    }
  };
  const reset = async () => {
    if (!window.confirm('Start this exercise again from the beginning?')) return;
    try {
      update(await gitLabApi.resetExercise(id));
      setLines([]);
      setSolution(null);
    } catch (err: any) {
      toast.error(err?.message || 'Could not reset');
    }
  };
  const showSolution = async () => {
    try {
      setSolution((await gitLabApi.solution(id)).solution);
    } catch (err: any) {
      toast.error(err?.message || 'Solution not available yet');
    }
  };
  if (q.isLoading) return <LoadingState message="Preparing the practice repository..." />;
  if (q.isError || !ws) return <ErrorState title="Could not load the exercise" message={(q.error as any)?.message || "Please try again."} onRetry={() => q.refetch()} />;
  const ex = ws.exercise;
  const allHints = ws.hints.length >= ex.hint_count;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{ex.title}</h2>
          <Badge>{ex.difficulty}</Badge>
          {ex.completed_at && <Badge tone="green">Completed</Badge>}
        </div>
        <p className="text-sm text-slate-700">{ex.instructions}</p>
        <ul className="space-y-1" aria-label="Checks">
          {ws.evaluation.checks.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm">
              {c.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-label="passed" /> : <XCircle className="w-4 h-4 text-slate-300" aria-label="not yet" />}
              <span className={c.passed ? 'text-slate-800' : 'text-slate-500'}>{c.label}</span>
            </li>
          ))}
        </ul>
        {ws.explanation && ws.evaluation.passed && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900"><strong>What happened: </strong>{ws.explanation}</div>
        )}
        {ws.hints.length > 0 && (
          <ol className="list-decimal list-inside text-sm text-amber-900 bg-amber-50 rounded-xl p-3 space-y-1">
            {ws.hints.map((h, i) => <li key={i}>{h}</li>)}
          </ol>
        )}
        {solution && <pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-wrap">{solution.join('\n')}</pre>}
        <div className="flex flex-wrap gap-2">
          <button onClick={hint} disabled={allHints} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 text-amber-800 hover:bg-amber-50 disabled:opacity-40 cursor-pointer">
            <Lightbulb className="w-3.5 h-3.5" /> {allHints ? 'No more hints' : `Hint (${ws.hints.length}/${ex.hint_count})`}
          </button>
          {(allHints || ex.completed_at) && !solution && (
            <button onClick={showSolution} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer">Show reference solution</button>
          )}
          <button onClick={reset} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Start over
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GitTerminal lines={lines} onRun={run} busy={busy} />
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><RepoPanel repo={ws.repo} /></div>
      </div>
    </div>
  );
};

const SandboxView: React.FC = () => {
  const q = useQuery({ queryKey: ['git-lab', 'sandbox'], queryFn: () => gitLabApi.sandbox() });
  const qc = useQueryClient();
  const [lines, setLines] = React.useState<TermLine[]>([]);
  const [busy, setBusy] = React.useState(false);
  const run = async (cmd: string) => {
    setBusy(true);
    try {
      const r = await gitLabApi.runSandbox(cmd);
      setLines((l) => [...l, { cmd, ok: r.result.ok, output: r.result.output }]);
      qc.setQueryData(['git-lab', 'sandbox'], { repo: r.repo });
    } catch (err: any) {
      toast.error(err?.message || 'The command could not be sent');
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (!window.confirm('Empty the sandbox repository?')) return;
    qc.setQueryData(['git-lab', 'sandbox'], await gitLabApi.resetSandbox());
    setLines([]);
  };
  if (q.isLoading) return <LoadingState message="Loading sandbox..." />;
  if (q.isError || !q.data) return <ErrorState title="Could not load the sandbox" message={(q.error as any)?.message || "Please try again."} onRetry={() => q.refetch()} />;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Free sandbox</h2>
          <p className="text-sm text-slate-600">Try any supported command. Nothing is graded here, and the repository is kept until you empty it.</p>
        </div>
        <button onClick={reset} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Empty sandbox</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GitTerminal lines={lines} onRun={run} busy={busy} />
        <div className="bg-white rounded-2xl border border-slate-200 p-5"><RepoPanel repo={q.data.repo} /></div>
      </div>
    </div>
  );
};

const LessonView: React.FC<{ id: string; onOpenExercise: (id: string) => void; onChanged: () => void }> = ({ id, onOpenExercise, onChanged }) => {
  const q = useQuery({ queryKey: ['git-lab', 'lesson', id], queryFn: () => gitLabApi.lesson(id) });
  const markDone = async () => {
    try {
      await gitLabApi.completeLesson(id);
      await q.refetch();
      onChanged();
      toast.success('Lesson marked as read');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save');
    }
  };
  if (q.isLoading) return <LoadingState message="Loading lesson..." />;
  if (q.isError || !q.data) return <ErrorState title="Could not load the lesson" message={(q.error as any)?.message || "Please try again."} onRetry={() => q.refetch()} />;
  const l = q.data;
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{l.order}. {l.title}</h2>
          {l.completed && <Badge tone="green">Read</Badge>}
        </div>
        <p className="text-sm text-slate-600">{l.summary}</p>
      </header>
      {l.sections.map((s) => (
        <section key={s.heading} className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">{s.heading}</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{s.body}</p>
          {s.commands && <pre className="text-xs font-mono bg-slate-950 text-slate-100 rounded-xl p-3 overflow-x-auto">{s.commands.map((c) => `$ ${c}`).join('\n')}</pre>}
        </section>
      ))}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {!l.completed && <button onClick={markDone} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white cursor-pointer">Mark lesson as read</button>}
        {l.exercises.map((e) => (
          <button key={e.id} onClick={() => onOpenExercise(e.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer">
            Practice: {e.title}{e.status === 'COMPLETED' || e.completed_at ? ' ✓' : ''}
          </button>
        ))}
      </div>
    </article>
  );
};

export const GitLabPage: React.FC<Props> = ({ onNavigate }) => {
  const qc = useQueryClient();
  const lessons = useQuery({ queryKey: ['git-lab', 'lessons'], queryFn: () => gitLabApi.lessons() });
  const exercises = useQuery({ queryKey: ['git-lab', 'exercises'], queryFn: () => gitLabApi.exercises() });
  const progress = useQuery({ queryKey: ['git-lab', 'progress'], queryFn: () => gitLabApi.progress() });
  const [view, setView] = React.useState<View>({ kind: 'lesson', id: 'fundamentals' });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['git-lab', 'lessons'] });
    qc.invalidateQueries({ queryKey: ['git-lab', 'exercises'] });
    qc.invalidateQueries({ queryKey: ['git-lab', 'progress'] });
  };
  const navBtn = (active: boolean) => `w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 cursor-pointer ${active ? 'bg-indigo-50 text-indigo-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`;

  return (
    <PageContainer>
      <PageHeader
        title="Git Practice Lab"
        description="Learn Git with lessons and graded exercises in a simulated repository. Commands never run on a real computer and nothing is sent to GitHub."
        badge={<Badge tone="indigo">Simulator</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {progress.data && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-600"><Trophy className="w-4 h-4 text-amber-500" /> {progress.data.exercises_completed}/{progress.data.exercises_total} exercises · {progress.data.lessons_completed}/{progress.data.lessons_total} lessons</span>
            )}
            {onNavigate && <button onClick={() => onNavigate('/github')} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer">GitHub workspace</button>}
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 mt-5">
        <nav aria-label="Git lab contents" className="space-y-4 lg:sticky lg:top-4 self-start">
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-3 mb-1 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Lessons</h3>
            {lessons.isLoading ? <p className="px-3 text-xs text-slate-500">Loading...</p> : lessons.isError ? <p className="px-3 text-xs text-rose-600">Could not load lessons.</p> : (
              lessons.data!.map((l) => (
                <button key={l.id} onClick={() => setView({ kind: 'lesson', id: l.id })} className={navBtn(view.kind === 'lesson' && view.id === l.id)}>
                  {l.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span className="truncate">{l.order}. {l.title}</span>
                </button>
              ))
            )}
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide px-3 mb-1 flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> Exercises</h3>
            {exercises.data?.map((e) => (
              <button key={e.id} onClick={() => setView({ kind: 'exercise', id: e.id })} className={navBtn(view.kind === 'exercise' && view.id === e.id)}>
                {e.completed_at ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Circle className={`w-4 h-4 shrink-0 ${e.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-300'}`} />}
                <span className="truncate">{e.title}</span>
              </button>
            ))}
            <button onClick={() => setView({ kind: 'sandbox' })} className={navBtn(view.kind === 'sandbox')}>
              <Terminal className="w-4 h-4 text-slate-500 shrink-0" /> Free sandbox
            </button>
          </div>
        </nav>
        <div className="min-w-0">
          {view.kind === 'lesson' && <LessonView id={view.id} onOpenExercise={(id) => setView({ kind: 'exercise', id })} onChanged={refresh} />}
          {view.kind === 'exercise' && <ExerciseView id={view.id} onDone={refresh} />}
          {view.kind === 'sandbox' && <SandboxView />}
        </div>
      </div>
    </PageContainer>
  );
};
