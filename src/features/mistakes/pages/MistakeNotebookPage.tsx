import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { NotebookPen, CircleAlert, CircleCheck, Tags, RotateCcw, CheckCircle2, XCircle, Bot } from 'lucide-react';
import { PageContainer, PageHeader, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { cn } from '../../../lib/utils';
import { useUiStore } from '../../../store/uiStore';
import { answerInputKind, formatAnswer, type MistakeItem, type MistakeNotebook, type RetryResult } from '../mistakes';

type View = 'open' | 'fixed' | 'all';

function RetryCard({ item, onNavigate }: { item: MistakeItem; onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);
  const kind = answerInputKind(item);
  const options = item.options.length ? item.options : kind === 'single' && item.question_type === 'TRUE_FALSE' ? [{ id: 'True', text: 'True' }, { id: 'False', text: 'False' }] : [];
  const [single, setSingle] = React.useState('');
  const [multi, setMulti] = React.useState<string[]>([]);
  const [text, setText] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const retry = useMutation({
    mutationFn: () =>
      apiClient.post<RetryResult>('/learning/mistakes/retry', {
        source: item.source,
        question_id: item.question_id,
        answer: kind === 'multi' ? multi : kind === 'text' ? text.trim() : single,
      }),
    onSuccess: (r) => {
      toast[r.correct ? 'success' : 'error'](r.correct ? 'Correct. This mistake is fixed.' : 'Not yet. Read the explanation and try again later.');
      qc.invalidateQueries({ queryKey: ['mistakes'] });
      qc.invalidateQueries({ queryKey: ['learning-analytics'] });
    },
    onError: (e: any) => toast.error(e?.message || 'The answer could not be checked.'),
  });

  const ready = kind === 'multi' ? multi.length > 0 : kind === 'text' ? text.trim().length > 0 : Boolean(single);
  const result = retry.data;

  return (
    <article className={cn('rounded-2xl border bg-white p-5 shadow-sm', item.status === 'fixed' ? 'border-emerald-200' : 'border-slate-200')} data-testid="mistake-card">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{item.context}</span>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">{item.topic}</span>
        <span className="text-slate-500">Wrong {item.times_wrong}× · last on {new Date(item.last_wrong_at).toLocaleDateString()}</span>
        {item.status === 'fixed' ? (
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-emerald-700"><CircleCheck className="h-3.5 w-3.5" /> Fixed</span>
        ) : (
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-amber-700"><CircleAlert className="h-3.5 w-3.5" /> Open</span>
        )}
      </div>
      <MarkdownContent content={item.question_text} className="text-sm" />
      <div className="mt-2 flex items-baseline gap-1 text-xs text-rose-700">
        <span className="shrink-0">Your answer:</span>
        <MarkdownContent content={formatAnswer(item.your_answer, item.options)} className="text-xs prose-p:my-0 prose-p:text-rose-700" />
      </div>

      {!open && !result && (
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setOpen(true)} data-testid="mistake-retry">
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      )}

      {open && !result && (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) retry.mutate();
          }}
        >
          {kind === 'text' ? (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder={item.question_type === 'NAT' ? 'Enter a number' : 'Your answer'}
              aria-label="Your answer"
            />
          ) : (
            <fieldset className="space-y-2">
              <legend className="sr-only">Choose your answer</legend>
              {options.map((o) => {
                const checked = kind === 'multi' ? multi.includes(o.id) : single === o.id;
                return (
                  <label key={o.id} className={cn('flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm', checked ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:bg-slate-50')}>
                    <input
                      type={kind === 'multi' ? 'checkbox' : 'radio'}
                      name={`ans-${item.key}`}
                      checked={checked}
                      onChange={() => (kind === 'multi' ? setMulti((m) => (m.includes(o.id) ? m.filter((x) => x !== o.id) : [...m, o.id])) : setSingle(o.id))}
                      className="mt-0.5"
                    />
                    <span className="flex gap-1">{o.id !== o.text ? <strong>{o.id}.</strong> : null}<MarkdownContent content={o.text} className="text-sm prose-p:my-0" /></span>
                  </label>
                );
              })}
            </fieldset>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!ready || retry.isPending}>{retry.isPending ? 'Checking…' : 'Check answer'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {result && (
        <div className={cn('mt-4 rounded-xl p-3 text-sm', result.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900')} data-testid="mistake-result">
          <p className="flex items-center gap-1.5 font-semibold">
            {result.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {result.correct ? 'Correct' : 'Not quite'}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="shrink-0">Correct answer:</span>
            <MarkdownContent content={formatAnswer(result.correct_answer, item.options)} className="text-sm font-semibold prose-p:my-0" />
          </div>
          {result.explanation && <MarkdownContent content={result.explanation} className="mt-2 text-xs" />}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3 gap-1.5 bg-white"
            onClick={() => {
              setAiInitialPrompt(
                `I got this ${item.context} question wrong.\n\nQuestion: ${item.question_text}\n\nMy answer: ${formatAnswer(item.your_answer, item.options)}\nCorrect answer: ${formatAnswer(result.correct_answer, item.options)}\n\nExplain why my answer is wrong, the idea I am missing, and give me one similar practice question.`
              );
              onNavigate('/ai-agent');
            }}
          >
            <Bot className="h-4 w-4" /> Ask the AI Tutor why
          </Button>
        </div>
      )}
    </article>
  );
}

export function MistakeNotebookPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [view, setView] = React.useState<View>('open');
  const [topic, setTopic] = React.useState<string | null>(null);
  const query = useQuery({ queryKey: ['mistakes'], queryFn: () => apiClient.get<MistakeNotebook>('/learning/mistakes'), staleTime: 30_000 });
  const data = query.data;
  const items = (data?.items || []).filter((i) => (view === 'all' || i.status === view) && (!topic || i.topic === topic));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Assessments"
        title="Mistake Notebook"
        description="Every quiz and GATE question you got wrong, kept until you get it right. Retry without seeing the answer first."
        icon={<NotebookPen className="h-6 w-6" />}
      />
      {query.isLoading && <LoadingState message="Collecting your mistakes…" />}
      {query.isError && <ErrorState message="Your mistake notebook could not be loaded." onRetry={() => query.refetch()} />}
      {data && (
        <div className="space-y-6" data-testid="mistake-notebook">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard label="Open mistakes" value={data.open} icon={<CircleAlert className="h-5 w-5" />} tone="warning" onClick={() => setView('open')} />
            <MetricCard label="Fixed" value={data.fixed} hint="Answered correctly after getting it wrong" icon={<CircleCheck className="h-5 w-5" />} tone="success" onClick={() => setView('fixed')} />
            <MetricCard label="Topics with open mistakes" value={data.by_topic.filter((t) => t.open > 0).length} icon={<Tags className="h-5 w-5" />} tone="brand" />
          </div>

          {data.items.length === 0 ? (
            <EmptyState
              title="No mistakes recorded yet"
              description="When you answer a quiz or GATE question wrongly, it appears here so you can come back to it."
              actionText="Take a quiz"
              onAction={() => onNavigate('/quiz')}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm" role="tablist" aria-label="Show">
                  {(['open', 'fixed', 'all'] as View[]).map((v) => (
                    <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn('rounded-md px-3 py-1 capitalize', view === v ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                      {v}
                    </button>
                  ))}
                </div>
                <span className="mx-1 h-5 w-px bg-slate-200" />
                <button onClick={() => setTopic(null)} className={cn('rounded-full px-2.5 py-1 text-xs', !topic ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>All topics</button>
                {data.by_topic.map((t) => (
                  <button key={t.topic} onClick={() => setTopic(t.topic)} className={cn('rounded-full px-2.5 py-1 text-xs', topic === t.topic ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>
                    {t.topic} <span className="opacity-70">{t.open}</span>
                  </button>
                ))}
              </div>
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  {view === 'open' ? 'No open mistakes here. Well done.' : 'Nothing to show for this filter.'}
                </p>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((it) => (
                    <RetryCard key={it.key} item={it} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
}

export default MistakeNotebookPage;
