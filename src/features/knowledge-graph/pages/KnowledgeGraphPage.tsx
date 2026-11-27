import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, Search, Bot, BookOpen, Layers, NotebookPen, ListChecks, AlertTriangle, ArrowRight } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { useUiStore } from '../../../store/uiStore';
import { cn } from '../../../lib/utils';

type TopicState = 'needs_revision' | 'demonstrated' | 'practiced' | 'learning' | 'not_started';

interface MapTopic {
  id: string;
  name: string;
  unit?: string;
  completed: boolean;
  revision_count: number;
  state: TopicState;
  reason: string;
  answered: number;
  correct: number;
  accuracy: number | null;
  open_mistakes: number;
  fixed_mistakes: number;
  notes: { id: string; title: string }[];
  decks: { id: string; title: string }[];
  depends_on: string[];
}
interface MapSubject {
  id: string;
  name: string;
  code?: string;
  topics: MapTopic[];
  counts: Record<TopicState, number>;
}
interface KnowledgeMap {
  subjects: MapSubject[];
  needs_revision: { subject: string; subject_id: string; topic: string; topic_id: string; open_mistakes: number }[];
  missing_foundations: { subject: string; topic: string; topic_id: string; before: string; before_id: string }[];
  next_topics: { subject: string; subject_id: string; topic: string; topic_id: string }[];
  unmatched_practice: { topic: string; answered: number; correct: number; open_mistakes: number }[];
  totals: Record<TopicState, number> & { topics: number };
}

export const STATE_META: Record<TopicState, { label: string; fill: string; stroke: string; chip: string }> = {
  demonstrated: { label: 'Demonstrated', fill: '#d1fae5', stroke: '#059669', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  practiced: { label: 'Practiced', fill: '#dbeafe', stroke: '#6957E8', chip: 'bg-blue-50 text-blue-700 ring-blue-200' },
  learning: { label: 'Learning', fill: '#fef3c7', stroke: '#d97706', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  needs_revision: { label: 'Needs revision', fill: '#ffe4e6', stroke: '#e11d48', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  not_started: { label: 'Not started', fill: '#f1f5f9', stroke: '#94a3b8', chip: 'bg-slate-100 text-slate-600 ring-slate-200' },
};
const ORDER: TopicState[] = ['needs_revision', 'not_started', 'learning', 'practiced', 'demonstrated'];

const COL_W = 210;
const ROW_H = 64;
const NODE_W = 180;
const NODE_H = 44;
const PAD = 16;

/** Columns by unit in syllabus order, one row per topic within the unit. */
function layout(subject: MapSubject) {
  const units: string[] = [];
  for (const t of subject.topics) if (!units.includes(t.unit || '')) units.push(t.unit || '');
  const rowInUnit = new Map<string, number>();
  const pos = new Map<string, { x: number; y: number }>();
  for (const t of subject.topics) {
    const col = units.indexOf(t.unit || '');
    const row = rowInUnit.get(t.unit || '') || 0;
    rowInUnit.set(t.unit || '', row + 1);
    pos.set(t.id, { x: PAD + col * COL_W, y: PAD + 28 + row * ROW_H });
  }
  const rows = Math.max(1, ...[...rowInUnit.values()]);
  return { units, pos, width: PAD * 2 + units.length * COL_W - (COL_W - NODE_W), height: PAD * 2 + 28 + rows * ROW_H };
}

const short = (s: string, n = 24) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function KnowledgeGraphPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);
  const q = useQuery({ queryKey: ['knowledge-graph', 'me'], queryFn: () => apiClient.get<KnowledgeMap>('/knowledge-graph/me') });
  const initialTopic = React.useMemo(() => new URLSearchParams(window.location.search).get('topic'), []);
  const [subjectId, setSubjectId] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(initialTopic);
  const [filter, setFilter] = React.useState<TopicState | 'all'>('all');
  const [search, setSearch] = React.useState('');

  const map = q.data;
  React.useEffect(() => {
    if (!map || subjectId) return;
    const fromTopic = initialTopic ? map.subjects.find((s) => s.topics.some((t) => t.id === initialTopic)) : undefined;
    setSubjectId((fromTopic || map.subjects[0])?.id || null);
  }, [map, subjectId, initialTopic]);

  if (q.isLoading) return <PageContainer><LoadingState message="Building your Knowledge Graph…" /></PageContainer>;
  if (q.isError || !map) return <PageContainer><ErrorState message="Your Knowledge Graph could not be built." onRetry={() => q.refetch()} /></PageContainer>;

  const header = (
    <PageHeader
      eyebrow="Personal Intelligence"
      title="Knowledge Graph"
      description="Every topic in your syllabus, linked to your own answers, mistakes, notes and flashcards. A topic counts as demonstrated only after you answer questions on it correctly; opening a lesson never counts."
      icon={<Network className="h-6 w-6" />}
      actions={<Button variant="outline" className="gap-2" onClick={() => onNavigate('/semester-command-center/syllabus')}><ListChecks className="h-4 w-4" /> Syllabus tracker</Button>}
    />
  );

  if (!map.subjects.length || map.totals.topics === 0) {
    return (
      <PageContainer>
        {header}
        <EmptyState
          title="No syllabus yet"
          description="Add your subjects, units and topics in the Semester Command Center. Your graph is built from them and from the questions you answer."
          icon={<Network className="h-6 w-6" />}
          actionText="Add my syllabus"
          onAction={() => onNavigate('/semester-command-center/syllabus')}
        />
      </PageContainer>
    );
  }

  const subject = map.subjects.find((s) => s.id === subjectId) || map.subjects[0];
  const { units, pos, width, height } = layout(subject);
  const term = search.trim().toLowerCase();
  const visible = (t: MapTopic) => (filter === 'all' || t.state === filter) && (!term || t.name.toLowerCase().includes(term));
  const topic = subject.topics.find((t) => t.id === selected) || null;
  const byId = new Map(subject.topics.map((t) => [t.id, t]));

  const askTutor = (t: MapTopic) => {
    const evidence = t.answered ? `I have answered ${t.answered} questions on it with ${t.accuracy}% right${t.open_mistakes ? ` and ${t.open_mistakes} still wrong` : ''}.` : 'I have not answered any questions on it yet.';
    setAiInitialPrompt(`Help me with "${t.name}" from ${subject.name}. ${evidence} Explain it step by step at my level, then give me three practice questions and check my answers.`);
    onNavigate('/ai-agent');
  };

  return (
    <PageContainer>
      {header}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ORDER.map((s) => (
          <MetricCard key={s} label={STATE_META[s].label} value={map.totals[s]} hint={`of ${map.totals.topics} topics`} tone={s === 'demonstrated' ? 'success' : s === 'needs_revision' ? 'warning' : s === 'practiced' ? 'brand' : s === 'learning' ? 'info' : 'neutral'} onClick={() => setFilter(filter === s ? 'all' : s)} className={cn('min-w-0', filter === s && 'ring-2 ring-blue-300')} />
        ))}
      </div>

      <PageSection
        className="min-w-0"
        title="Your graph"
        description="Columns are units in syllabus order. An arrow shows the topic that comes before. Select a topic to see the evidence behind its state."
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a topic" aria-label="Find a topic" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none" />
          </label>
          <select value={subject.id} onChange={(e) => { setSubjectId(e.target.value); setSelected(null); }} aria-label="Subject" className="h-9 min-w-0 max-w-full rounded-lg border border-slate-200 bg-white px-3 text-sm" data-testid="kg-subject">
            {map.subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code ? `${s.code} · ` : ''}{s.name} ({s.topics.length})</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by state">
            {(['all', ...ORDER] as const).map((s) => (
              <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={cn('rounded-full px-2.5 py-1 text-xs font-medium ring-1', filter === s ? 'bg-slate-900 text-white ring-slate-900' : s === 'all' ? 'bg-white text-slate-600 ring-slate-200' : STATE_META[s].chip)}>
                {s === 'all' ? 'All' : STATE_META[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white lg:col-span-2" data-testid="kg-graph">
            <svg width={width} height={height} role="img" aria-label={`Knowledge Graph for ${subject.name}`} className="block">
              <defs>
                <marker id="kg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
              </defs>
              {units.map((u, i) => (
                <text key={u + i} x={PAD + i * COL_W} y={PAD + 12} className="fill-slate-500 text-[11px] font-semibold uppercase">{short(u || 'Topics', 26)}</text>
              ))}
              {subject.topics.flatMap((t) =>
                t.depends_on.map((d) => {
                  const a = pos.get(d);
                  const b = pos.get(t.id);
                  if (!a || !b) return null;
                  const sameCol = a.x === b.x;
                  const path = sameCol
                    ? `M ${a.x + 12} ${a.y + NODE_H} L ${b.x + 12} ${b.y}`
                    : `M ${a.x + NODE_W} ${a.y + NODE_H / 2} C ${a.x + NODE_W + 20} ${a.y + NODE_H / 2}, ${b.x - 20} ${b.y + NODE_H / 2}, ${b.x} ${b.y + NODE_H / 2}`;
                  const dim = !visible(t) && !visible(byId.get(d)!);
                  return <path key={`${d}-${t.id}`} d={path} fill="none" stroke="#94a3b8" strokeWidth={1.25} opacity={dim ? 0.2 : 0.8} markerEnd="url(#kg-arrow)" />;
                })
              )}
              {subject.topics.map((t) => {
                const p = pos.get(t.id)!;
                const meta = STATE_META[t.state];
                const on = visible(t);
                const isSel = t.id === selected;
                return (
                  <g
                    key={t.id}
                    transform={`translate(${p.x} ${p.y})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${t.name}: ${meta.label}`}
                    aria-pressed={isSel}
                    onClick={() => setSelected(t.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(t.id); } }}
                    className="cursor-pointer focus:outline-none"
                    opacity={on ? 1 : 0.25}
                    data-testid={`kg-node-${t.id}`}
                  >
                    <rect width={NODE_W} height={NODE_H} rx={10} fill={meta.fill} stroke={isSel ? '#0f172a' : meta.stroke} strokeWidth={isSel ? 2.5 : 1.25} />
                    <text x={10} y={19} className="fill-slate-900 text-[12px] font-semibold">{short(t.name)}</text>
                    <text x={10} y={34} className="fill-slate-600 text-[10.5px]">
                      {meta.label}
                      {t.accuracy !== null ? ` · ${t.accuracy}%` : ''}
                      {t.open_mistakes ? ` · ${t.open_mistakes} wrong` : ''}
                    </text>
                    <title>{`${t.name}\n${meta.label}: ${t.reason}`}</title>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5" data-testid="kg-detail">
            {!topic ? (
              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{subject.name}</p>
                <ul className="mt-3 space-y-1.5">
                  {ORDER.map((s) => (
                    <li key={s} className="flex items-center justify-between gap-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs ring-1', STATE_META[s].chip)}>{STATE_META[s].label}</span>
                      <span className="font-medium text-slate-900">{subject.counts[s]}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-500">Select a topic in the graph to see why it has its state and what to do next.</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium ring-1', STATE_META[topic.state].chip)}>{STATE_META[topic.state].label}</span>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{topic.name}</h3>
                  <p className="text-xs text-slate-500">{subject.name}{topic.unit ? ` · ${topic.unit}` : ''}</p>
                  <p className="mt-2 text-slate-700">{topic.reason}.</p>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2"><dt className="text-slate-500">Answered</dt><dd className="text-sm font-semibold text-slate-900">{topic.answered ? `${topic.correct}/${topic.answered}` : '—'}</dd></div>
                  <div className="rounded-lg bg-slate-50 p-2"><dt className="text-slate-500">Open mistakes</dt><dd className="text-sm font-semibold text-slate-900">{topic.open_mistakes}</dd></div>
                  <div className="rounded-lg bg-slate-50 p-2"><dt className="text-slate-500">Syllabus</dt><dd className="text-sm font-semibold text-slate-900">{topic.completed ? 'Covered' : 'Not ticked'}</dd></div>
                  <div className="rounded-lg bg-slate-50 p-2"><dt className="text-slate-500">Revisions</dt><dd className="text-sm font-semibold text-slate-900">{topic.revision_count}</dd></div>
                </dl>
                {topic.depends_on.length > 0 && (
                  <p className="text-xs text-slate-600">Comes after: {topic.depends_on.map((d) => byId.get(d)).filter(Boolean).map((d) => (
                    <button key={d!.id} type="button" className="ml-1 font-medium text-blue-700 hover:underline" onClick={() => setSelected(d!.id)}>{d!.name}</button>
                  ))}</p>
                )}
                {(topic.notes.length > 0 || topic.decks.length > 0) && (
                  <div className="space-y-1">
                    {topic.notes.map((n) => (
                      <button key={n.id} type="button" onClick={() => onNavigate(`/notes/${n.id}`)} className="flex w-full min-w-0 items-center gap-2 text-left text-xs text-slate-700 hover:text-blue-700"><BookOpen className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{n.title}</span></button>
                    ))}
                    {topic.decks.map((d) => (
                      <button key={d.id} type="button" onClick={() => onNavigate('/flashcards')} className="flex w-full min-w-0 items-center gap-2 text-left text-xs text-slate-700 hover:text-blue-700"><Layers className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{d.title}</span></button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => askTutor(topic)}><Bot className="h-3.5 w-3.5" /> Ask AI Tutor</Button>
                  {topic.open_mistakes > 0 && <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNavigate('/mistakes')}><NotebookPen className="h-3.5 w-3.5" /> Retry mistakes</Button>}
                  <Button size="sm" variant="outline" onClick={() => onNavigate('/semester-command-center/syllabus')}>Syllabus</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection className="min-w-0" title="Needs revision" description="Topics with questions you answered wrong and have not answered right since.">
          {map.needs_revision.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Nothing open. Wrong answers you later get right are counted as fixed.</p>
          ) : (
            <ul className="space-y-2">
              {map.needs_revision.slice(0, 8).map((r) => (
                <li key={r.topic_id}>
                  <button type="button" onClick={() => { setSubjectId(r.subject_id); setSelected(r.topic_id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm hover:border-slate-300">
                    <span className="min-w-0"><span className="block truncate font-medium text-slate-900">{r.topic}</span><span className="block truncate text-xs text-slate-500">{r.subject}</span></span>
                    <span className="shrink-0 text-xs font-semibold text-rose-700">{r.open_mistakes} wrong</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PageSection>
        <PageSection className="min-w-0" title="Foundations and next topics" description="Earlier topics you skipped, and the next topic in each subject you have not started.">
          {map.missing_foundations.length === 0 && map.next_topics.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Every topic has been started.</p>
          ) : (
            <ul className="space-y-2">
              {map.missing_foundations.slice(0, 4).map((f) => (
                <li key={`${f.topic_id}-${f.before_id}`} className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">Cover <strong>{f.before}</strong> before going further with {f.topic} <span className="text-xs">({f.subject})</span></span>
                </li>
              ))}
              {map.next_topics.slice(0, 6).map((n) => (
                <li key={n.topic_id}>
                  <button type="button" onClick={() => { setSubjectId(n.subject_id); setSelected(n.topic_id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left text-sm hover:border-slate-300">
                    <span className="min-w-0"><span className="block truncate font-medium text-slate-900">{n.topic}</span><span className="block truncate text-xs text-slate-500">Next in {n.subject}</span></span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PageSection>
      </div>

      {map.unmatched_practice.length > 0 && (
        <PageSection className="min-w-0" title="Practice outside your syllabus" description="Questions you answered on topics that do not match a syllabus topic. They are shown here instead of being guessed onto one.">
          <div className="flex flex-wrap gap-2">
            {map.unmatched_practice.slice(0, 12).map((p) => (
              <span key={p.topic} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{p.topic}: {p.correct}/{p.answered}{p.open_mistakes ? `, ${p.open_mistakes} open` : ''}</span>
            ))}
          </div>
        </PageSection>
      )}
    </PageContainer>
  );
}

export default KnowledgeGraphPage;
