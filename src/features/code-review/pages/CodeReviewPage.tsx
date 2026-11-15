import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ScanSearch, Plus, Trash2, Upload, Check, X, PencilLine, Bot, AlertTriangle, Info, History, FileCode2 } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { codingApi } from '../../coding/api/codingApi';
import { githubApi } from '../../github/api/githubApi';
import { useUiStore } from '../../../store/uiStore';
import { cn } from '../../../lib/utils';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type Status = 'open' | 'accepted' | 'rejected' | 'modified';
interface Finding {
  id: string;
  file: string;
  line?: number;
  end_line?: number;
  severity: Severity;
  category: string;
  title: string;
  explanation: string;
  suggestion?: string;
  corrected_example?: string;
  learning?: string;
  source: 'static' | 'ai';
  rule?: string;
  status: Status;
  student_note?: string;
}
interface FnMetric { name: string; line: number; length: number; complexity: number; max_loop_depth: number; recursive: boolean; estimate?: string }
interface Review {
  id: string;
  title: string;
  created_at: string;
  source: { kind: string; ref?: string };
  files: { name: string; content: string; language: string }[];
  findings: Finding[];
  metrics: { file: string; language: string; lines: number; code_lines: number; comment_lines: number; functions: FnMetric[]; max_nesting: number }[];
  summary?: string;
  overall?: Record<string, string>;
  complexity: { file: string; function: string; time: string; space: string; reasoning: string }[];
  test_suggestions: { title: string; input?: string; expected?: string; why?: string }[];
  ai: 'done' | 'unavailable' | 'failed' | 'skipped' | 'off';
  ai_error?: string;
  has_tests: boolean;
  secrets_redacted: number;
  disclaimer: string;
}
interface Summary {
  id: string;
  title: string;
  created_at: string;
  files: { name: string; language: string }[];
  counts: Record<Severity, number>;
  decided: number;
  total: number;
  ai: string;
}

const SEV: Record<Severity, { label: string; tone: string; rank: number }> = {
  critical: { label: 'Critical', tone: 'bg-rose-600 text-white', rank: 0 },
  high: { label: 'High', tone: 'bg-rose-100 text-rose-700', rank: 1 },
  medium: { label: 'Medium', tone: 'bg-amber-100 text-amber-800', rank: 2 },
  low: { label: 'Low', tone: 'bg-sky-100 text-sky-700', rank: 3 },
  info: { label: 'Info', tone: 'bg-slate-100 text-slate-600', rank: 4 },
};
const STATUS_LABEL: Record<Status, string> = { open: 'Open', accepted: 'Accepted', rejected: 'Rejected', modified: 'Modified' };
const LANGS = ['auto', 'python', 'javascript', 'typescript', 'java', 'c', 'cpp'];
const input = 'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none';
const label = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const KEY = ['code-review', 'me'];

interface Draft { name: string; content: string; language: string }
const blank = (i: number): Draft => ({ name: `main${i ? i + 1 : ''}.py`, content: '', language: 'auto' });

/**
 * Code Review Intelligence: automated checks with line numbers, plus an AI review when a model is available. The
 * student decides on each finding. Nothing is executed, and a review never claims the code is secure or bug-free.
 */
export function CodeReviewPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);
  const history = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<Summary[]>('/code-review/me') });
  const [mode, setMode] = React.useState<'paste' | 'saved' | 'github'>('paste');
  const [drafts, setDrafts] = React.useState<Draft[]>([blank(0)]);
  const [title, setTitle] = React.useState('');
  const [savedId, setSavedId] = React.useState('');
  const [repoId, setRepoId] = React.useState('');
  const [path, setPath] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);

  const saved = useQuery({ queryKey: ['coding', 'saved'], queryFn: () => codingApi.getSavedCodeList(), enabled: mode === 'saved' });
  const repos = useQuery({ queryKey: ['github', 'repos'], queryFn: () => githubApi.listRepositories(), enabled: mode === 'github', retry: false });
  const files = useQuery({ queryKey: ['github', 'files', repoId], queryFn: () => githubApi.getFiles(repoId), enabled: mode === 'github' && !!repoId, retry: false });
  const review = useQuery({ queryKey: [...KEY, openId], queryFn: () => apiClient.get<Review>(`/code-review/me/${encodeURIComponent(openId!)}`), enabled: !!openId });

  const run = useMutation({
    mutationFn: () => {
      const body: any = { title: title || undefined };
      if (mode === 'saved') body.saved_code_id = savedId;
      else if (mode === 'github') body.github = { repo_id: repoId, path };
      else body.files = drafts.map((d) => ({ name: d.name, content: d.content, language: d.language === 'auto' ? undefined : d.language }));
      return apiClient.post<Review>('/code-review/me', body);
    },
    onSuccess: (r) => {
      qc.setQueryData([...KEY, r.id], r);
      qc.invalidateQueries({ queryKey: KEY, exact: true });
      setOpenId(r.id);
      toast.success(`Review ready: ${r.findings.length} finding${r.findings.length === 1 ? '' : 's'}`);
    },
    onError: (e: any) => toast.error(e?.message || 'The review could not be run.'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/code-review/me/${encodeURIComponent(id)}`),
    onSuccess: (_d, id) => {
      if (openId === id) setOpenId(null);
      qc.invalidateQueries({ queryKey: KEY, exact: true });
    },
    onError: (e: any) => toast.error(e?.message || 'The review could not be removed.'),
  });

  const upload = async (list: FileList | null) => {
    if (!list) return;
    const next = [...drafts.filter((d) => d.content.trim())];
    for (const f of Array.from(list)) {
      if (next.length >= 5) {
        toast.error('Review up to 5 files at a time.');
        break;
      }
      if (f.size > 20_000 * 4) {
        toast.error(`${f.name} is too large to review.`);
        continue;
      }
      next.push({ name: f.name, content: await f.text(), language: 'auto' });
    }
    setDrafts(next.length ? next : [blank(0)]);
  };

  const canRun =
    mode === 'saved' ? !!savedId : mode === 'github' ? !!repoId && !!path : drafts.some((d) => d.content.trim()) && drafts.every((d) => d.name.trim());

  if (history.isLoading) return <PageContainer><LoadingState message="Loading your reviews…" /></PageContainer>;
  if (history.isError) return <PageContainer><ErrorState message="Your reviews could not be loaded." onRetry={() => history.refetch()} /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Practice"
        title="Code Review"
        description="Get a review of your code: automated checks with line numbers, and an AI review of correctness, readability, complexity, security and tests. You decide what to accept. Your code is not run."
        icon={<ScanSearch className="h-6 w-6" />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-6">
          <PageSection title="Code to review">
            <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); if (canRun) run.mutate(); }}>
              <div className="flex flex-wrap gap-1.5" role="tablist">
                {([['paste', 'Paste or upload'], ['saved', 'My saved code'], ['github', 'GitHub repository']] as const).map(([m, l]) => (
                  <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} data-testid={`cr-mode-${m}`} className={cn('rounded-lg px-3 py-1.5 text-sm font-medium', mode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>{l}</button>
                ))}
              </div>
              <label className="block text-xs font-medium text-slate-600">Title (optional)<input className={cn(input, 'mt-1 block w-full')} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment 3: linked list" /></label>

              {mode === 'paste' && (
                <div className="space-y-3">
                  {drafts.map((d, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-3">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <input className={cn(input, 'min-w-0 flex-1')} value={d.name} maxLength={160} aria-label="File name" onChange={(e) => setDrafts(drafts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                        <select className={input} value={d.language} aria-label="Language" onChange={(e) => setDrafts(drafts.map((x, j) => (j === i ? { ...x, language: e.target.value } : x)))}>
                          {LANGS.map((l) => <option key={l} value={l}>{l === 'auto' ? 'Detect language' : l === 'cpp' ? 'C++' : label(l)}</option>)}
                        </select>
                        {drafts.length > 1 && <Button type="button" variant="ghost" size="sm" aria-label="Remove file" onClick={() => setDrafts(drafts.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                      <textarea className="block h-48 w-full rounded-lg border border-slate-200 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 focus:border-blue-400 focus:outline-none" spellCheck={false} value={d.content} onChange={(e) => setDrafts(drafts.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))} placeholder="Paste your code here" aria-label={`Code for ${d.name}`} data-testid={`cr-code-${i}`} />
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    {drafts.length < 5 && <Button type="button" variant="outline" size="sm" onClick={() => setDrafts([...drafts, blank(drafts.length)])}><Plus className="mr-1 h-4 w-4" />Add a file</Button>}
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Upload className="h-4 w-4" />Upload files
                      <input type="file" multiple className="sr-only" accept=".py,.js,.jsx,.ts,.tsx,.java,.c,.h,.cpp,.cc,.hpp,.txt,.mjs,.cjs" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
                    </label>
                    <span className="self-center text-xs text-slate-500">Up to 5 files, 20,000 characters each.</span>
                  </div>
                </div>
              )}

              {mode === 'saved' && (
                saved.isLoading ? <LoadingState message="Loading your saved code…" /> :
                saved.isError ? <ErrorState message="Your saved code could not be loaded." onRetry={() => saved.refetch()} /> :
                !saved.data?.length ? <EmptyState title="No saved code yet" description="Save code in the Coding Lab and it will be listed here." icon={<FileCode2 className="h-6 w-6" />} actionText="Open Coding Lab" onAction={() => onNavigate('/coding')} /> : (
                  <select className={cn(input, 'block w-full')} value={savedId} onChange={(e) => setSavedId(e.target.value)} aria-label="Saved code" data-testid="cr-saved">
                    <option value="">Pick saved code…</option>
                    {saved.data.map((s) => <option key={s.id} value={s.id}>{s.title} ({s.language})</option>)}
                  </select>
                )
              )}

              {mode === 'github' && (
                repos.isLoading ? <LoadingState message="Loading your repositories…" /> :
                repos.isError || !repos.data?.length ? <EmptyState title="No connected repositories" description="Connect GitHub and import a repository to review its files here." icon={<FileCode2 className="h-6 w-6" />} actionText="Open GitHub" onAction={() => onNavigate('/github')} /> : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select className={input} value={repoId} onChange={(e) => { setRepoId(e.target.value); setPath(''); }} aria-label="Repository">
                      <option value="">Pick a repository…</option>
                      {repos.data.map((r) => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                    </select>
                    <select className={input} value={path} onChange={(e) => setPath(e.target.value)} disabled={!repoId || files.isLoading} aria-label="File">
                      <option value="">{files.isLoading ? 'Loading files…' : files.isError ? 'Files could not be loaded' : 'Pick a file…'}</option>
                      {(files.data || []).filter((f) => f.type === 'file' && /\.(py|js|jsx|ts|tsx|java|c|h|cpp|cc|hpp)$/i.test(f.path)).slice(0, 500).map((f) => <option key={f.path} value={f.path}>{f.path}</option>)}
                    </select>
                  </div>
                )
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={!canRun || run.isPending} isLoading={run.isPending} data-testid="cr-run"><ScanSearch className="mr-1.5 h-4 w-4" />Review code</Button>
                <span className="text-xs text-slate-500">Passwords and keys found in the code are removed before it is sent to the AI.</span>
              </div>
            </form>
          </PageSection>

          {openId && (review.isLoading ? <LoadingState message="Loading the review…" /> : review.isError || !review.data ? <ErrorState message="That review could not be loaded." onRetry={() => review.refetch()} /> : (
            <ReviewView review={review.data} onAsk={(text) => { setAiInitialPrompt(text); onNavigate('/ai-agent'); }} />
          ))}
        </div>

        <aside className="min-w-0">
          <PageSection title="History">
            {!history.data?.length ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500"><History className="mb-1 h-4 w-4" />Your reviews will be kept here (the last 20).</p>
            ) : (
              <ul className="space-y-2" data-testid="cr-history">
                {history.data.map((h) => (
                  <li key={h.id} className={cn('rounded-xl border p-3', openId === h.id ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-white')}>
                    <button type="button" className="block w-full text-left" onClick={() => setOpenId(h.id)}>
                      <span className="block truncate text-sm font-medium text-slate-800">{h.title}</span>
                      <span className="block text-xs text-slate-500">{new Date(h.created_at).toLocaleString()} · {h.decided}/{h.total} decided</span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {(Object.keys(SEV) as Severity[]).filter((s) => h.counts[s]).map((s) => <span key={s} className={cn('rounded px-1.5 py-0.5 text-[11px] font-medium', SEV[s].tone)}>{h.counts[s]} {SEV[s].label}</span>)}
                      </span>
                    </button>
                    <button type="button" className="mt-1 text-xs text-slate-400 hover:text-rose-600" onClick={() => remove.mutate(h.id)} aria-label={`Delete ${h.title}`}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </PageSection>
        </aside>
      </div>
    </PageContainer>
  );
}

function ReviewView({ review, onAsk }: { review: Review; onAsk: (text: string) => void }) {
  const qc = useQueryClient();
  const [file, setFile] = React.useState(review.files[0]?.name || '');
  const [sevFilter, setSevFilter] = React.useState<Severity | 'all'>('all');
  const [noteFor, setNoteFor] = React.useState<string | null>(null);
  const [note, setNote] = React.useState('');
  const [focusLine, setFocusLine] = React.useState<number | null>(null);
  React.useEffect(() => setFile(review.files[0]?.name || ''), [review.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: Status; note?: string }) =>
      apiClient.patch<Finding>(`/code-review/me/${encodeURIComponent(review.id)}/findings/${encodeURIComponent(id)}`, { status, note }),
    onSuccess: (f) => {
      qc.setQueryData<Review>(['code-review', 'me', review.id], (r) => (r ? { ...r, findings: r.findings.map((x) => (x.id === f.id ? f : x)) } : r));
      qc.invalidateQueries({ queryKey: ['code-review', 'me'], exact: true });
      setNoteFor(null);
      setNote('');
    },
    onError: (e: any) => toast.error(e?.message || 'That finding could not be updated.'),
  });

  const counts = review.findings.reduce((c, f) => ({ ...c, [f.severity]: (c[f.severity] || 0) + 1 }), {} as Record<Severity, number>);
  const current = review.files.find((f) => f.name === file) || review.files[0];
  const lines = current ? current.content.split('\n') : [];
  const inFile = review.findings.filter((f) => f.file === current?.name);
  const marked = new Map<number, Severity>();
  for (const f of inFile) if (f.line) for (let l = f.line; l <= (f.end_line || f.line); l++) if (!marked.has(l) || SEV[f.severity].rank < SEV[marked.get(l)!].rank) marked.set(l, f.severity);
  const shown = inFile.filter((f) => sevFilter === 'all' || f.severity === sevFilter).sort((a, b) => SEV[a.severity].rank - SEV[b.severity].rank || (a.line || 0) - (b.line || 0));
  const metrics = review.metrics.find((m) => m.file === current?.name);
  const codeRef = React.useRef<HTMLDivElement>(null);
  const jump = (line?: number) => {
    if (!line) return;
    setFocusLine(line);
    codeRef.current?.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  return (
    <div className="space-y-6" data-testid="cr-result">
      <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>{review.disclaimer}</span></div>
      {review.ai_error && <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" data-testid="cr-ai-error"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span>{review.ai_error}</span></div>}
      {review.secrets_redacted > 0 && <p className="text-xs text-slate-500">{review.secrets_redacted} secret value{review.secrets_redacted > 1 ? 's were' : ' was'} removed before the code was sent to the AI.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Findings" value={review.findings.length} hint={`${review.findings.filter((f) => f.source === 'static').length} automated, ${review.findings.filter((f) => f.source === 'ai').length} AI`} tone="brand" />
        <MetricCard label="Critical or high" value={(counts.critical || 0) + (counts.high || 0)} tone="warning" />
        <MetricCard label="Decided" value={`${review.findings.filter((f) => f.status !== 'open').length}/${review.findings.length}`} tone="success" />
        <MetricCard label="Lines of code" value={review.metrics.reduce((n, m) => n + m.code_lines, 0)} hint={`${review.files.length} file${review.files.length > 1 ? 's' : ''}`} tone="neutral" />
      </div>

      {(review.summary || review.overall) && (
        <PageSection title="Overall review" description="Written by the AI from your code.">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            {review.summary && <p>{review.summary}</p>}
            {review.overall && (
              <dl className="grid gap-2 sm:grid-cols-2">
                {Object.entries(review.overall).map(([k, v]) => <div key={k}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label(k)}</dt><dd>{v}</dd></div>)}
              </dl>
            )}
          </div>
        </PageSection>
      )}

      <PageSection title="Findings by file">
        {review.files.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {review.files.map((f) => <button key={f.name} type="button" onClick={() => { setFile(f.name); setFocusLine(null); }} className={cn('rounded-lg px-2.5 py-1 font-mono text-xs', f.name === current?.name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700')}>{f.name} ({review.findings.filter((x) => x.file === f.name).length})</button>)}
          </div>
        )}
        <div className="grid gap-4 xl:grid-cols-2">
          <div ref={codeRef} className="max-h-[32rem] min-w-0 overflow-auto rounded-xl bg-slate-950 py-2 font-mono text-xs text-slate-200" data-testid="cr-code-view">
            {lines.map((l, i) => {
              const sev = marked.get(i + 1);
              return (
                <div key={i} data-line={i + 1} className={cn('flex whitespace-pre', sev && (SEV[sev].rank <= 1 ? 'bg-rose-500/20' : SEV[sev].rank === 2 ? 'bg-amber-400/15' : 'bg-sky-400/10'), focusLine === i + 1 && 'ring-1 ring-inset ring-blue-400')}>
                  <span className="w-10 shrink-0 select-none pr-3 text-right text-slate-500">{i + 1}</span>
                  <span className="pr-4">{l || ' '}</span>
                </div>
              );
            })}
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...Object.keys(SEV)] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSevFilter(s as any)} className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sevFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}>{s === 'all' ? `All (${inFile.length})` : `${SEV[s as Severity].label} (${inFile.filter((f) => f.severity === s).length})`}</button>
              ))}
            </div>
            {!shown.length && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No findings here. That does not mean the code has no problems: test it too.</p>}
            <ul className="space-y-3" data-testid="cr-findings">
              {shown.map((f) => (
                <li key={f.id} className={cn('rounded-xl border bg-white p-3 text-sm', f.status === 'rejected' ? 'border-slate-200 opacity-60' : 'border-slate-200')}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold', SEV[f.severity].tone)}>{SEV[f.severity].label}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{label(f.category)}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{f.source === 'ai' ? 'AI' : 'Automated check'}</span>
                    {f.line && <button type="button" className="font-mono text-[11px] text-blue-700 hover:underline" onClick={() => jump(f.line)}>line {f.line}{f.end_line && f.end_line !== f.line ? `–${f.end_line}` : ''}</button>}
                    {f.status !== 'open' && <span className="ml-auto text-[11px] font-medium text-slate-500">{STATUS_LABEL[f.status]}</span>}
                  </div>
                  <p className="mt-1.5 font-medium text-slate-900">{f.title}</p>
                  <p className="mt-1 text-slate-700">{f.explanation}</p>
                  {f.suggestion && <p className="mt-1 text-slate-700"><span className="font-medium">Suggestion: </span>{f.suggestion}</p>}
                  {f.corrected_example && <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-2 text-xs text-slate-100">{f.corrected_example}</pre>}
                  {f.learning && <p className="mt-1 text-xs text-slate-500"><span className="font-medium">Concept: </span>{f.learning}</p>}
                  {f.student_note && <p className="mt-1 text-xs text-slate-600"><span className="font-medium">My change: </span>{f.student_note}</p>}
                  {noteFor === f.id ? (
                    <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) decide.mutate({ id: f.id, status: 'modified', note }); }}>
                      <input className={cn(input, 'min-w-0 flex-1')} autoFocus value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="How did you change it?" aria-label="How you changed the suggestion" />
                      <Button type="submit" size="sm" disabled={!note.trim()}>Save</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setNoteFor(null)}>Cancel</Button>
                    </form>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button size="sm" variant={f.status === 'accepted' ? 'primary' : 'outline'} onClick={() => decide.mutate({ id: f.id, status: f.status === 'accepted' ? 'open' : 'accepted' })} data-testid="cr-accept"><Check className="mr-1 h-3.5 w-3.5" />Accept</Button>
                      <Button size="sm" variant={f.status === 'rejected' ? 'primary' : 'outline'} onClick={() => decide.mutate({ id: f.id, status: f.status === 'rejected' ? 'open' : 'rejected' })}><X className="mr-1 h-3.5 w-3.5" />Reject</Button>
                      <Button size="sm" variant="outline" onClick={() => { setNoteFor(f.id); setNote(f.student_note || ''); }}><PencilLine className="mr-1 h-3.5 w-3.5" />Modified</Button>
                      <Button size="sm" variant="ghost" onClick={() => onAsk(`Explain this code review finding to me and how to fix it.\nFile: ${f.file}${f.line ? `, line ${f.line}` : ''}\nFinding: ${f.title}\n${f.explanation}\n\nThe code around it:\n${f.line ? lines.slice(Math.max(0, f.line - 4), f.line + 3).join('\n') : ''}`)}><Bot className="mr-1 h-3.5 w-3.5" />Ask AI Tutor</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      {metrics && metrics.functions.length > 0 && (
        <PageSection title="Functions and complexity" description="Counted from the code text. The time estimate comes from loop nesting only: check each loop's real bounds.">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm" data-testid="cr-metrics">
              <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2">Function</th><th className="px-3 py-2">Line</th><th className="px-3 py-2">Lines</th><th className="px-3 py-2">Cyclomatic complexity</th><th className="px-3 py-2">Loop nesting</th><th className="px-3 py-2">Estimate</th></tr></thead>
              <tbody>
                {metrics.functions.map((m) => (
                  <tr key={`${m.name}${m.line}`} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{m.name}(){m.recursive ? ' ↻' : ''}</td>
                    <td className="px-3 py-2"><button type="button" className="text-blue-700 hover:underline" onClick={() => jump(m.line)}>{m.line}</button></td>
                    <td className="px-3 py-2">{m.length}</td>
                    <td className={cn('px-3 py-2', m.complexity > 10 && 'font-semibold text-amber-700')}>{m.complexity}</td>
                    <td className="px-3 py-2">{m.max_loop_depth}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{m.estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      )}

      {review.complexity.length > 0 && (
        <PageSection title="Time and space complexity (AI)">
          <ul className="space-y-2">
            {review.complexity.map((c, i) => <li key={i} className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><span className="font-mono text-xs">{c.file} · {c.function}()</span> <span className="ml-2 font-semibold">Time {c.time}</span>{c.space && <span className="ml-2 font-semibold">Space {c.space}</span>}<p className="mt-1 text-slate-600">{c.reasoning}</p></li>)}
          </ul>
        </PageSection>
      )}

      {review.test_suggestions.length > 0 && (
        <PageSection title="Tests to write (AI)">
          <ul className="space-y-2">
            {review.test_suggestions.map((t, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <p className="font-medium text-slate-900">{t.title}</p>
                {(t.input || t.expected) && <p className="mt-1 font-mono text-xs text-slate-600">{t.input && <>Input: {t.input}</>}{t.input && t.expected && ' · '}{t.expected && <>Expected: {t.expected}</>}</p>}
                {t.why && <p className="mt-1 text-slate-600">{t.why}</p>}
              </li>
            ))}
          </ul>
        </PageSection>
      )}
    </div>
  );
}

export default CodeReviewPage;
