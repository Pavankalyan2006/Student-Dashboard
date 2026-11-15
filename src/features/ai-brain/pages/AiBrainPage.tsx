import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Brain, Search, Loader2, FileText, BookOpen, FolderKanban, Network, NotebookPen, Download, ShieldCheck, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { linkCitations } from '../../discover/discover';
import { cn } from '../../../lib/utils';

type Kind = 'note' | 'document' | 'project' | 'topic' | 'mistakes';
interface BrainSource {
  n: number;
  kind: Kind;
  title: string;
  snippet: string;
  route: string;
  page?: number;
}
interface BrainAnswer {
  question: string;
  sources: BrainSource[];
  answer: string | null;
  cited: number[];
  ai_error?: string;
  refused?: string;
}
interface Overview {
  personalize: boolean;
  use_activity: boolean;
  memory_notes: number;
  counts: Record<'notes' | 'documents' | 'flashcard_decks' | 'projects' | 'open_mistakes' | 'fixed_mistakes' | 'topics' | 'topics_demonstrated' | 'topics_needs_revision' | 'agent_requests' | 'tool_calls_logged', number>;
}

const KIND: Record<Kind, { label: string; icon: React.ReactNode; tone: string }> = {
  note: { label: 'Your note', icon: <BookOpen className="h-3.5 w-3.5" />, tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  document: { label: 'Your document', icon: <FileText className="h-3.5 w-3.5" />, tone: 'bg-sky-50 text-sky-700 ring-sky-200' },
  project: { label: 'Your project', icon: <FolderKanban className="h-3.5 w-3.5" />, tone: 'bg-violet-50 text-violet-700 ring-violet-200' },
  topic: { label: 'Knowledge Graph', icon: <Network className="h-3.5 w-3.5" />, tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  mistakes: { label: 'Mistake Notebook', icon: <NotebookPen className="h-3.5 w-3.5" />, tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const EXAMPLES = ['What should I revise in my weakest subject?', 'What have I written about normalization?', 'Which of my projects use React?'];

/** Splits an answer into paragraphs from the records (cited) and suggestions the AI added (marked). */
function AnswerText({ text, onSource }: { text: string; onSource: (n: number) => void }) {
  return (
    <div className="prose prose-slate max-w-none text-sm leading-relaxed prose-p:my-2" data-testid="ai-brain-answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const m = /^#src-(\d+)$/.exec(href || '');
            if (m) {
              return (
                <button type="button" onClick={() => onSource(Number(m[1]))} className="mx-0.5 rounded bg-blue-50 px-1 align-super text-[10px] font-semibold text-blue-700 no-underline hover:bg-blue-100" aria-label={`Source ${m[1]}`}>
                  {m[1]}
                </button>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
          strong: ({ children }) => <strong>{children}</strong>,
        }}
      >
        {linkCitations(text.replace(/(^|\n|\.\s+)Suggestion:/g, '$1**Suggestion (not from your records):**'))}
      </ReactMarkdown>
    </div>
  );
}

/**
 * My AI Brain: what the platform holds about the student's learning, and answers to questions about it from
 * their own records only, each with numbered sources.
 */
export function AiBrainPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [question, setQuestion] = React.useState('');
  const overview = useQuery({ queryKey: ['ai-brain', 'me'], queryFn: () => apiClient.get<Overview>('/ai-brain/me') });
  const ask = useMutation({
    mutationFn: (q: string) => apiClient.post<BrainAnswer>('/ai-brain/me/ask', { question: q }),
    onError: (e: any) => toast.error(e?.message || 'Your question could not be answered.'),
  });
  const exportData = useMutation({
    mutationFn: () => apiClient.get<any>('/ai-brain/me/export'),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-ai-data.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => toast.error('Your data could not be exported.'),
  });

  if (overview.isLoading) return <PageContainer><LoadingState message="Loading your AI Brain…" /></PageContainer>;
  if (overview.isError || !overview.data) return <PageContainer><ErrorState message="Your AI Brain could not be loaded." onRetry={() => overview.refetch()} /></PageContainer>;
  const o = overview.data;
  const c = o.counts;
  const r = ask.data;
  const submit = (q: string) => {
    const v = q.trim();
    if (v.length >= 3) {
      setQuestion(v);
      ask.mutate(v);
    }
  };
  const jump = (n: number) => document.getElementById(`brain-src-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal Intelligence"
        title="My AI Brain"
        description="Everything the platform knows about your learning, in one place. Ask about your own notes, documents, projects, topics and mistakes, and get an answer that cites them."
        icon={<Brain className="h-6 w-6" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => onNavigate('/ai-memory')}><SlidersHorizontal className="h-4 w-4" /> AI Memory controls</Button>
            <Button variant="outline" className="gap-2" isLoading={exportData.isPending} onClick={() => exportData.mutate()}><Download className="h-4 w-4" /> Export my AI data</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Notes" value={c.notes} onClick={() => onNavigate('/notes')} className="min-w-0" />
        <MetricCard label="Documents" value={c.documents} onClick={() => onNavigate('/knowledge-base')} className="min-w-0" />
        <MetricCard label="Projects" value={c.projects} onClick={() => onNavigate('/projects')} className="min-w-0" />
        <MetricCard label="Topics demonstrated" value={c.topics ? `${c.topics_demonstrated}/${c.topics}` : '—'} tone="success" onClick={() => onNavigate('/knowledge-graph')} className="min-w-0" />
        <MetricCard label="Open mistakes" value={c.open_mistakes} hint={`${c.fixed_mistakes} fixed`} tone="warning" onClick={() => onNavigate('/mistakes')} className="min-w-0" />
        <MetricCard label="AI tool calls logged" value={c.tool_calls_logged} hint={`${c.agent_requests} tutor requests`} tone="neutral" onClick={() => onNavigate('/agents')} className="min-w-0" />
      </div>

      <PageSection className="min-w-0" title="Ask about your own data" description="Answers use only your records. Anything the AI adds that your records do not say is marked as a suggestion.">
        {!o.personalize ? (
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p>Personalised AI is off, so your records are not sent to the AI.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => onNavigate('/ai-memory')}>Change in AI Memory</Button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={(e) => { e.preventDefault(); submit(question); }} className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={300} placeholder="What have I studied about deadlocks?" aria-label="Your question" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none" data-testid="ai-brain-input" />
              </label>
              <Button type="submit" className="h-11 gap-2" disabled={ask.isPending || question.trim().length < 3}>
                {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />} Ask
              </Button>
            </form>
            {!r && !ask.isPending && (
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLES.map((e) => (
                  <button key={e} type="button" onClick={() => submit(e)} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200">{e}</button>
                ))}
              </div>
            )}
          </>
        )}

        {ask.isPending && <p className="mt-4 flex items-center gap-2 text-sm text-slate-600" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Searching your records and writing an answer…</p>}

        {r && !ask.isPending && (
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
              <p className="text-xs font-medium uppercase text-slate-500">{r.question}</p>
              {r.refused ? (
                <p className="mt-2 text-sm text-slate-700">{r.refused}</p>
              ) : r.answer ? (
                <AnswerText text={r.answer} onSource={jump} />
              ) : r.sources.length === 0 ? (
                <p className="mt-2 text-sm text-slate-700">None of your notes, documents, projects, topics or mistakes match this question, so there is nothing to answer from. Try other words, or add notes on it first.</p>
              ) : (
                <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {r.ai_error}</p>
              )}
            </div>
            <div className="min-w-0 lg:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Your records used ({r.sources.length})</p>
              <ol className="space-y-2">
                {r.sources.map((s) => (
                  <li key={s.n} id={`brain-src-${s.n}`} className={cn('rounded-xl border bg-white p-3', r.cited.includes(s.n) ? 'border-blue-200' : 'border-slate-200')}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">[{s.n}]</span>
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1', KIND[s.kind].tone)}>{KIND[s.kind].icon}{KIND[s.kind].label}</span>
                      {s.page ? <span className="text-[11px] text-slate-500">page {s.page}</span> : null}
                    </div>
                    <button type="button" onClick={() => onNavigate(s.route)} className="mt-1 block max-w-full truncate text-left text-sm font-medium text-slate-900 hover:text-blue-700">{s.title}</button>
                    <p className="line-clamp-3 text-xs text-slate-600">{s.snippet}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </PageSection>

      <PageSection className="min-w-0" title="What the AI may use" description="Set in AI Memory. Every AI feature follows these switches.">
        <ul className="grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-xl border border-slate-200 bg-white p-3"><span className="block text-xs text-slate-500">Personalised answers</span><span className="font-semibold text-slate-900">{o.personalize ? 'On' : 'Off'}</span></li>
          <li className="rounded-xl border border-slate-200 bg-white p-3"><span className="block text-xs text-slate-500">Recent activity</span><span className="font-semibold text-slate-900">{o.personalize && o.use_activity ? 'On' : 'Off'}</span></li>
          <li className="rounded-xl border border-slate-200 bg-white p-3"><span className="block text-xs text-slate-500">Things you asked it to remember</span><span className="font-semibold text-slate-900">{o.memory_notes}</span></li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">Your name, email, college and marks are never sent to the AI.</p>
      </PageSection>
    </PageContainer>
  );
}

export default AiBrainPage;
