import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileStack, Upload, Trash2, Bot, AlertTriangle, ListChecks } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { useUiStore } from '../../../store/uiStore';
import { cn } from '../../../lib/utils';

interface Topic {
  topic_id: string;
  topic: string;
  unit?: string;
  state?: string;
  questions: number;
  papers: number;
  marks: number;
  years: number[];
  examples: string[];
}
interface Analysis {
  subject: string;
  subject_id: string;
  papers: number;
  questions: number;
  matched_questions: number;
  topics: Topic[];
  never_asked: { topic_id: string; topic: string }[];
  focus: { topic_id: string; topic: string; papers: number; state?: string }[];
  unmatched: string[];
}
interface Overview {
  subjects: { id: string; name: string; code?: string; topics: number }[];
  papers: { id: string; subject_id: string; subject_name: string; title: string; year?: number; exam?: string; source: string; question_count: number; created_at: string }[];
  analyses: Analysis[];
}

const KEY = ['previous-papers', 'me'];
const input = 'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none';
const STATE: Record<string, { label: string; tone: string }> = {
  demonstrated: { label: 'Demonstrated', tone: 'bg-emerald-50 text-emerald-700' },
  practiced: { label: 'Practiced', tone: 'bg-blue-50 text-blue-700' },
  learning: { label: 'Learning', tone: 'bg-amber-50 text-amber-700' },
  needs_revision: { label: 'Needs revision', tone: 'bg-rose-50 text-rose-700' },
  not_started: { label: 'Not started', tone: 'bg-slate-100 text-slate-600' },
};

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('The file could not be read.'));
    r.readAsDataURL(f);
  });

/**
 * Previous Papers: the student adds their own past papers and sees which syllabus topics are asked most, next
 * to how well they know each one. Nothing is invented: only papers the student added are counted.
 */
export function PreviousPapersPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);
  const q = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<Overview>('/previous-papers/me') });
  const [subjectId, setSubjectId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [year, setYear] = React.useState('');
  const [text, setText] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [view, setView] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!subjectId && q.data?.subjects[0]) setSubjectId(q.data.subjects[0].id);
  }, [q.data, subjectId]);

  const add = useMutation({
    mutationFn: async () => {
      const body: any = { subject_id: subjectId, title, year: year || undefined };
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error('Files must be 5 MB or smaller.');
        body.file = { name: file.name, data: await readFile(file) };
      } else body.text = text;
      return apiClient.post<{ questions: unknown[] }>('/previous-papers/me', body);
    },
    onSuccess: (p) => {
      toast.success(`Added: ${p.questions.length} questions found`);
      setTitle('');
      setYear('');
      setText('');
      setFile(null);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (e: any) => toast.error(e?.message || 'The paper could not be added.'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/previous-papers/me/${encodeURIComponent(id)}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: any) => toast.error(e?.message || 'The paper could not be removed.'),
  });

  if (q.isLoading) return <PageContainer><LoadingState message="Loading your papers…" /></PageContainer>;
  if (q.isError || !q.data) return <PageContainer><ErrorState message="Your papers could not be loaded." onRetry={() => q.refetch()} /></PageContainer>;
  const d = q.data;
  const sid = subjectId || d.subjects[0]?.id || '';
  const analysis = d.analyses.find((a) => a.subject_id === (view || d.analyses[0]?.subject_id)) || null;
  const canAdd = !!sid && (file ? true : text.trim().length >= 20);

  const planWithTutor = (a: Analysis) => {
    const top = a.topics.slice(0, 8).map((t) => `${t.topic} (asked in ${t.papers} of ${a.papers} papers${t.state ? `, my state: ${STATE[t.state]?.label.toLowerCase()}` : ''})`).join('; ');
    setAiInitialPrompt(`From ${a.papers} previous ${a.subject} papers I added, the most asked topics are: ${top}. Help me plan revision for the exam: start with the frequent topics I have not demonstrated, and give me two exam-style questions for the first one.`);
    onNavigate('/ai-agent');
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Assessments"
        title="Previous Papers"
        description="Add past question papers for your subjects. Each question is matched to a topic in your syllabus, so you can see what is asked most and how ready you are for it."
        icon={<FileStack className="h-6 w-6" />}
      />

      {d.subjects.length === 0 ? (
        <EmptyState title="Add your syllabus first" description="Papers are matched to the subjects and topics in your Semester Command Center syllabus." icon={<ListChecks className="h-6 w-6" />} actionText="Add my syllabus" onAction={() => onNavigate('/semester-command-center/syllabus')} />
      ) : (
        <PageSection className="min-w-0" title="Add a paper" description="Paste the questions, or upload a PDF with selectable text or a .txt file (up to 5 MB). Scanned PDFs need text recognition (OCR), which is not set up here, so paste those as text.">
          <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); if (canAdd) add.mutate(); }}>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem]">
              <label className="min-w-0 text-xs font-medium text-slate-600">Subject
                <select className={cn(input, 'mt-1 block w-full')} value={sid} onChange={(e) => setSubjectId(e.target.value)} data-testid="papers-subject">
                  {d.subjects.map((s) => <option key={s.id} value={s.id}>{s.code ? `${s.code} · ` : ''}{s.name}{s.topics ? '' : ' (no topics yet)'}</option>)}
                </select>
              </label>
              <label className="min-w-0 text-xs font-medium text-slate-600">Title<input className={cn(input, 'mt-1 block w-full')} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="End-semester, May" /></label>
              <label className="text-xs font-medium text-slate-600">Year<input className={cn(input, 'mt-1 block w-full')} type="number" min={1990} max={2100} value={year} onChange={(e) => setYear(e.target.value)} /></label>
            </div>
            {!file && (
              <textarea className="block h-36 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none" value={text} onChange={(e) => setText(e.target.value)} placeholder={'UNIT I\n1. Explain the process state diagram. (10 marks)\n2. Compare paging and segmentation.'} aria-label="Paper text" data-testid="papers-text" />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                <Upload className="h-4 w-4" /> {file ? file.name : 'Upload PDF or .txt'}
                <input type="file" accept=".pdf,.txt,application/pdf,text/plain" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
              {file && <Button type="button" size="sm" variant="ghost" onClick={() => setFile(null)}>Use pasted text instead</Button>}
              <Button type="submit" className="ml-auto" disabled={!canAdd || add.isPending} isLoading={add.isPending}>Add paper</Button>
            </div>
          </form>
        </PageSection>
      )}

      {d.papers.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Subjects with papers">
            {d.analyses.map((a) => (
              <button key={a.subject_id} type="button" role="tab" aria-selected={analysis?.subject_id === a.subject_id} onClick={() => setView(a.subject_id)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1', analysis?.subject_id === a.subject_id ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200')}>
                {a.subject} ({a.papers})
              </button>
            ))}
          </div>

          {analysis && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard label="Papers" value={analysis.papers} className="min-w-0" />
                <MetricCard label="Questions" value={analysis.questions} hint={`${analysis.matched_questions} matched to a topic`} className="min-w-0" />
                <MetricCard label="Topics asked" value={analysis.topics.length} hint={`${analysis.never_asked.length} never asked`} tone="info" className="min-w-0" />
                <MetricCard label="Focus topics" value={analysis.focus.length} hint="Asked often, not yet demonstrated" tone="warning" className="min-w-0" />
              </div>

              {analysis.focus.length > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" data-testid="papers-focus">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Asked in at least half your papers but not yet demonstrated: {analysis.focus.map((f) => f.topic).join(', ')}.</span>
                </div>
              )}

              <PageSection className="min-w-0" title="Most asked topics" description="Ranked by how many of your papers ask them. The state comes from your Knowledge Graph." actions={analysis.topics.length ? <Button size="sm" variant="outline" className="gap-1.5" onClick={() => planWithTutor(analysis)}><Bot className="h-3.5 w-3.5" /> Plan revision with AI Tutor</Button> : undefined}>
                {analysis.topics.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">No question matched a topic in your syllabus. Check that the topic names in your syllabus match the words the paper uses.</p>
                ) : (
                  <ul className="space-y-2" data-testid="papers-topics">
                    {analysis.topics.map((t) => (
                      <li key={t.topic_id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="min-w-0 flex-1 truncate font-medium text-slate-900">{t.topic}</span>
                          {t.state && <span className={cn('rounded-full px-2 py-0.5 text-[11px]', STATE[t.state]?.tone)}>{STATE[t.state]?.label}</span>}
                          <span className="text-xs text-slate-600">{t.papers}/{analysis.papers} papers · {t.questions} question{t.questions === 1 ? '' : 's'}{t.marks ? ` · ${t.marks} marks` : ''}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${(t.papers / analysis.papers) * 100}%` }} /></div>
                        {t.years.length > 0 && <p className="mt-1 text-[11px] text-slate-500">Years: {t.years.join(', ')}</p>}
                        <details className="mt-1 text-xs text-slate-600"><summary className="cursor-pointer text-blue-700">Questions</summary><ul className="mt-1 list-disc space-y-1 pl-4">{t.examples.map((e, i) => <li key={i}>{e}</li>)}</ul></details>
                      </li>
                    ))}
                  </ul>
                )}
              </PageSection>

              <div className="grid gap-6 lg:grid-cols-2">
                <PageSection className="min-w-0" title="Never asked in your papers" description="Syllabus topics none of your papers ask about.">
                  {analysis.never_asked.length === 0 ? <p className="text-sm text-slate-600">Every topic was asked at least once.</p> : <div className="flex flex-wrap gap-1.5">{analysis.never_asked.map((t) => <span key={t.topic_id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{t.topic}</span>)}</div>}
                </PageSection>
                <PageSection className="min-w-0" title="Questions not matched to a topic" description="Shown as they are instead of being guessed onto a topic.">
                  {analysis.unmatched.length === 0 ? <p className="text-sm text-slate-600">None.</p> : <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">{analysis.unmatched.slice(0, 8).map((u, i) => <li key={i}>{u}</li>)}</ul>}
                </PageSection>
              </div>
            </>
          )}

          <PageSection className="min-w-0" title="Your papers">
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {d.papers.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-900">{p.title}</span><span className="block text-xs text-slate-500">{p.subject_name}{p.year ? ` · ${p.year}` : ''} · {p.question_count} questions · from {p.source === 'text' ? 'pasted text' : p.source.toUpperCase()}</span></span>
                  <button type="button" className="rounded p-1 text-slate-400 hover:text-rose-600" aria-label={`Remove ${p.title}`} disabled={remove.isPending} onClick={() => remove.mutate(p.id)}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </PageSection>
        </>
      )}
    </PageContainer>
  );
}

export default PreviousPapersPage;
