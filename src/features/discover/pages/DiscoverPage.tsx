import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Compass, Search, Loader2, BookOpen, FileText, GraduationCap, ExternalLink, Save, History, AlertTriangle, Bot } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { notesApi } from '../../notes/api/notesApi';
import { useAuth } from '../../../hooks/useAuth';
import { useProfileDefaults } from '../../profile/hooks/useProfileDefaults';
import { ProfileQuickPicks } from '../../profile/components/ProfileQuickPicks';
import { cn } from '../../../lib/utils';
import { useUiStore } from '../../../store/uiStore';
import { linkCitations, noteFromResult, loadHistory, pushHistory, type DiscoverResult, type DiscoverSource } from '../discover';

const KIND_META: Record<DiscoverSource['kind'], { label: string; icon: React.ReactNode; tone: string }> = {
  note: { label: 'Your note', icon: <FileText className="h-3.5 w-3.5" />, tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  wikipedia: { label: 'Encyclopedia', icon: <BookOpen className="h-3.5 w-3.5" />, tone: 'bg-sky-50 text-sky-700 ring-sky-200' },
  paper: { label: 'Research paper', icon: <GraduationCap className="h-3.5 w-3.5" />, tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

export function DiscoverPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { student } = useAuth();
  const studentId = student?.id ? String(student.id) : null;
  const defaults = useProfileDefaults();
  const [question, setQuestion] = React.useState('');
  const [history, setHistory] = React.useState<string[]>([]);
  const [highlight, setHighlight] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);

  React.useEffect(() => {
    if (studentId) setHistory(loadHistory(studentId));
  }, [studentId]);

  const ask = useMutation({
    mutationFn: (q: string) => apiClient.post<DiscoverResult>('/discover/answer', { question: q }),
    onSuccess: (r) => {
      if (studentId) setHistory(pushHistory(studentId, r.question));
    },
    onError: (e: any) => toast.error(e?.message || 'Discover could not answer right now.'),
  });

  const save = useMutation({
    mutationFn: (r: DiscoverResult) => notesApi.createManualNote(noteFromResult(r)),
    onSuccess: (note: any) => {
      toast.success('Saved to your notes', note?.id ? { action: { label: 'Open', onClick: () => onNavigate(`/notes/${note.id}`) } } : undefined);
    },
    onError: () => toast.error('The answer could not be saved.'),
  });

  const submit = (q = question) => {
    const text = q.trim();
    if (text.length < 3 || ask.isPending) return;
    setQuestion(text);
    ask.mutate(text);
  };

  const jumpTo = (n: number) => {
    setHighlight(n);
    document.getElementById(`src-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    window.setTimeout(() => setHighlight(null), 1600);
  };

  const r = ask.data;
  const topicPicks = [...defaults.subjects, ...defaults.interests].slice(0, 6);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Learn"
        title="Discover"
        description="Ask anything. Answers are written only from sources you can check: Wikipedia, research papers from OpenAlex, and your own notes."
        icon={<Compass className="h-6 w-6" />}
      />

      <form
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        role="search"
      >
        <label htmlFor="discover-q" className="sr-only">Your question</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="discover-q"
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              placeholder="e.g. How does a B+ tree index speed up database queries?"
              className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              data-testid="discover-input"
            />
          </div>
          <Button type="submit" className="h-11 gap-2" disabled={question.trim().length < 3 || ask.isPending} data-testid="discover-submit">
            {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
            {ask.isPending ? 'Searching sources…' : 'Discover'}
          </Button>
        </div>
        <ProfileQuickPicks
          className="mt-3"
          label="Your subjects"
          values={topicPicks}
          onPick={(v) => {
            const q = `Explain the key ideas of ${v}`;
            setQuestion(q);
            inputRef.current?.focus();
          }}
        />
        {history.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" data-testid="discover-history">
            <span className="flex items-center gap-1 font-medium text-slate-500"><History className="h-3.5 w-3.5" /> Recent</span>
            {history.map((h) => (
              <button key={h} type="button" onClick={() => submit(h)} className="max-w-[16rem] truncate rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 hover:bg-slate-200">
                {h}
              </button>
            ))}
          </div>
        )}
      </form>

      {!r && !ask.isPending && (
        <EmptyState
          className="mt-6"
          title="Every claim comes with a source"
          description="Discover searches first, then writes. Each sentence links to the source it came from, and anything the sources do not cover is said plainly."
          icon={<Compass className="h-8 w-8" />}
        />
      )}

      {r && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]" data-testid="discover-result">
          <PageSection
            title={r.question}
            actions={
              r.answer ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setAiInitialPrompt(`I read this sourced answer to "${r.question}":\n\n${r.answer}\n\nTeach me this step by step at my level, with an example from my subjects, then ask me two questions to check I understood.`);
                      onNavigate('/ai-agent');
                    }}
                    data-testid="discover-tutor"
                  >
                    <Bot className="h-4 w-4" /> Learn it with the AI Tutor
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => save.mutate(r)} disabled={save.isPending} data-testid="discover-save">
                    <Save className="h-4 w-4" /> Save to notes
                  </Button>
                </div>
              ) : undefined
            }
          >
            {r.answer ? (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed prose-p:my-2" data-testid="discover-answer">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
                      const m = /^#src-(\d+)$/.exec(href || '');
                      if (m) {
                        return (
                          <button type="button" onClick={() => jumpTo(Number(m[1]))} className="mx-0.5 rounded bg-blue-50 px-1 align-super text-[10px] font-semibold text-blue-700 no-underline hover:bg-blue-100" aria-label={`Source ${m[1]}`}>
                            {m[1]}
                          </button>
                        );
                      }
                      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                    },
                  }}
                >
                  {linkCitations(r.answer)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{r.sources.length ? r.ai_error || 'No answer was written.' : 'No sources were found for this question, so no answer was written. Try different words.'}</span>
              </div>
            )}
            <p className="mt-4 text-[11px] text-slate-500" data-testid="discover-providers">
              Searched:{' '}
              {r.providers.map((p, i) => (
                <span key={p.provider}>
                  {i > 0 && ' · '}
                  {p.provider} {p.ok ? `(${p.count})` : `(unavailable: ${p.error})`}
                </span>
              ))}
            </p>
          </PageSection>

          <aside aria-label="Sources" className="space-y-3" data-testid="discover-sources">
            <h2 className="text-sm font-semibold text-slate-900">Sources ({r.sources.length})</h2>
            {r.sources.map((s) => {
              const meta = KIND_META[s.kind];
              const external = s.kind !== 'note';
              return (
                <article
                  key={s.n}
                  id={`src-${s.n}`}
                  className={cn(
                    'rounded-xl border bg-white p-3 text-sm transition-shadow',
                    highlight === s.n ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200',
                    r.cited.length && !r.cited.includes(s.n) && 'opacity-80'
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] font-bold text-white">{s.n}</span>
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1', meta.tone)}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                  {external ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 font-medium text-slate-900 hover:text-blue-600">
                      {s.title}
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-blue-500" />
                    </a>
                  ) : (
                    <button type="button" onClick={() => onNavigate(s.url)} className="text-left font-medium text-slate-900 hover:text-blue-600">
                      {s.title}
                    </button>
                  )}
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {[s.publisher, s.year, s.authors?.length ? s.authors.join(', ') : null].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-1.5 line-clamp-4 text-xs text-slate-600">{s.snippet}</p>
                  {s.license && <p className="mt-1 text-[10px] text-slate-400">Text from Wikipedia, licensed {s.license}.</p>}
                </article>
              );
            })}
          </aside>
        </div>
      )}
    </PageContainer>
  );
}

export default DiscoverPage;
