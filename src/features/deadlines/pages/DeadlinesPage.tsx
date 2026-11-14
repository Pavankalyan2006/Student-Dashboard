import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarClock, AlertTriangle, Download, Plus, Trophy, ExternalLink, GraduationCap, ClipboardList, Flag, Briefcase, Hammer, BookOpen, CalendarDays } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { cn } from '../../../lib/utils';
import { toICS, type DeadlineSummary, type DeadlineWithDays, type DeadlineSource } from '../../../../server/services/deadlineMath';

interface Contest {
  id: number;
  name: string;
  start: string;
  duration_minutes: number;
  url: string;
}
interface ContestFeed {
  available: boolean;
  source: { name: string; url: string };
  contests: Contest[];
  fetched_at: string | null;
  message?: string;
}

const KEY = ['deadlines', 'me'];
const tz = () => -new Date().getTimezoneOffset();
const input = 'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

const SOURCE_STYLE: Record<DeadlineSource, { icon: React.ReactNode; cls: string }> = {
  exam: { icon: <GraduationCap className="h-4 w-4" />, cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
  assignment: { icon: <ClipboardList className="h-4 w-4" />, cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  semester: { icon: <CalendarDays className="h-4 w-4" />, cls: 'bg-slate-50 text-slate-700 ring-slate-200' },
  goal: { icon: <Flag className="h-4 w-4" />, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  study_plan: { icon: <BookOpen className="h-4 w-4" />, cls: 'bg-blue-50 text-blue-700 ring-blue-200' },
  project: { icon: <Hammer className="h-4 w-4" />, cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
  application: { icon: <Briefcase className="h-4 w-4" />, cls: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  contest: { icon: <Trophy className="h-4 w-4" />, cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
};

const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
const whenLabel = (n: number) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n > 1 ? `in ${n} days` : n === -1 ? '1 day overdue' : `${-n} days overdue`);
// suggested_start is clamped to today, so equal-or-earlier means the usual preparation window has begun.
const todayOf = (d: DeadlineWithDays) => {
  const t = new Date(`${d.date}T00:00:00Z`).getTime() - d.days_left * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
};
const localYmd = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const localHm = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function Row({ d, onNavigate }: { d: DeadlineWithDays; onNavigate: (p: string) => void }) {
  const st = SOURCE_STYLE[d.source];
  return (
    <li className="flex items-start gap-3 px-4 py-3" data-testid="deadline-row">
      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', st.cls)}>{st.icon}</span>
      <div className="min-w-0 flex-1">
        <button className="block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline" onClick={() => onNavigate(d.route)}>{d.title}</button>
        <p className="text-xs text-slate-500">
          {d.kind} · {dayLabel(d.date)}{d.time ? `, ${d.time}` : ''}
        </p>
        {d.suggested_start && d.days_left > 0 && (
          <p className="mt-0.5 text-xs text-blue-700" data-testid="deadline-prep">
            {d.suggested_start <= todayOf(d) ? `Start preparing now: ${d.prep_days} days of revision is typical and ${d.days_left} remain` : `Start preparing by ${dayLabel(d.suggested_start)} (${d.prep_days} days before)`}
          </p>
        )}
      </div>
      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', d.days_left < 0 ? 'bg-rose-100 text-rose-700' : d.days_left <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700')}>
        {whenLabel(d.days_left)}
      </span>
    </li>
  );
}

function Group({ title, items, onNavigate, testId }: { title: string; items: DeadlineWithDays[]; onNavigate: (p: string) => void; testId: string }) {
  if (!items.length) return null;
  return (
    <section data-testid={testId}>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title} · {items.length}</h3>
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">{items.map((d) => <Row key={`${d.source}-${d.id}`} d={d} onNavigate={onNavigate} />)}</ul>
    </section>
  );
}

/**
 * Every exam, assignment, goal, study plan, project milestone and application deadline the student has,
 * in one timeline, with busy weeks and back-to-back exams called out. Adds go to the semester calendar.
 */
export function DeadlinesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<DeadlineSummary>(`/deadlines/me?tz=${tz()}`) });
  const contests = useQuery({ queryKey: ['deadlines', 'contests'], queryFn: () => apiClient.get<ContestFeed>('/deadlines/contests'), staleTime: 10 * 60_000 });
  const [form, setForm] = React.useState({ title: '', date: '', type: 'ASSIGNMENT' });

  const addEvent = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/semester/events', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['semester'] });
      toast.success('Added to your calendar');
    },
    onError: (e: any) => toast.error(e?.message || 'Could not add it.'),
  });

  if (query.isLoading) return <PageContainer><LoadingState message="Gathering your deadlines…" /></PageContainer>;
  if (query.isError || !query.data) return <PageContainer><ErrorState message="Your deadlines could not be loaded." onRetry={() => query.refetch()} /></PageContainer>;
  const s = query.data;
  const all = [...s.overdue, ...s.this_week, ...s.next_two_weeks, ...s.later];

  const exportIcs = () => {
    const blob = new Blob([toICS(all.filter((d) => d.days_left >= 0), Date.now())], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-deadlines.ics';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    addEvent.mutate({ title: form.title.trim(), date: form.date, event_type: form.type, priority: form.type.startsWith('MINOR') || form.type === 'END_SEMESTER' ? 'HIGH' : 'MEDIUM' }, { onSuccess: () => setForm({ title: '', date: '', type: form.type }) });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Deadlines"
        description="Exams, assignments, goals, study plans, project milestones and application deadlines from across the platform in one timeline."
        icon={<CalendarClock className="h-6 w-6" />}
        actions={<Button variant="outline" className="gap-2" onClick={exportIcs} disabled={!all.some((d) => d.days_left >= 0)} data-testid="deadlines-export"><Download className="h-4 w-4" /> Export to calendar</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="deadlines-metrics">
        <MetricCard label="Overdue" value={s.counts.overdue} hint={s.counts.overdue ? 'Goals, milestones or applications past their date' : 'Nothing overdue'} icon={<AlertTriangle className="h-5 w-5" />} tone={s.counts.overdue ? 'warning' : 'success'} />
        <MetricCard label="Due in the next 7 days" value={s.counts.this_week} hint={s.this_week[0] ? `Next: ${s.this_week[0].title}` : 'A clear week'} icon={<CalendarClock className="h-5 w-5" />} tone="brand" />
        <MetricCard label="Exams in the next 30 days" value={s.counts.exams_30_days} hint="From your semester calendar" icon={<GraduationCap className="h-5 w-5" />} tone="violet" />
      </div>

      {(s.clashes.length > 0 || s.crunch_weeks.length > 0) && (
        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4" data-testid="deadlines-alerts">
          {s.clashes.map((c) => (
            <p key={`${c.a}-${c.b}`} className="flex items-start gap-2 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {c.a} and {c.b} are {c.days_apart === 0 ? 'on the same day' : 'on back-to-back days'} ({dayLabel(c.date)}). Prepare for both before then.
            </p>
          ))}
          {s.crunch_weeks.map((w) => (
            <p key={w.week_start} className="flex items-start gap-2 text-sm text-amber-900">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
              Busy week of {dayLabel(w.week_start)}: {w.count} deadlines{w.exams ? `, ${w.exams} of them exams` : ''}. Start early on {w.titles.slice(0, 2).join(' and ')}.
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          {all.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center" data-testid="deadlines-empty">
              <p className="text-sm text-slate-600">No deadlines yet. Add your exam and assignment dates here or in the semester calendar, set target dates on your goals, or save an internship with a closing date.</p>
            </div>
          ) : (
            <>
              <Group title="Overdue" items={s.overdue} onNavigate={onNavigate} testId="deadlines-overdue" />
              <Group title="Next 7 days" items={s.this_week} onNavigate={onNavigate} testId="deadlines-week" />
              <Group title="Next 3 weeks" items={s.next_two_weeks} onNavigate={onNavigate} testId="deadlines-soon" />
              <Group title="Later" items={s.later} onNavigate={onNavigate} testId="deadlines-later" />
            </>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <PageSection title="Add a date" description="Saved to your semester calendar.">
            <form onSubmit={submit} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4" data-testid="deadlines-form">
              <label className="sr-only" htmlFor="dl-title">What is due</label>
              <input id="dl-title" className={cn(input, 'w-full')} placeholder="For example: DBMS assignment 2" value={form.title} maxLength={140} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="dl-date">Date</label>
                <input id="dl-date" type="date" className={cn(input, 'flex-1')} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                <label className="sr-only" htmlFor="dl-type">Type</label>
                <select id="dl-type" className={cn(input, 'flex-1')} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="SLIP_TEST">Slip test</option>
                  <option value="LAB_EXAM">Lab exam</option>
                  <option value="MINOR_1">Minor exam</option>
                  <option value="END_SEMESTER">End-semester exam</option>
                  <option value="PROJECT_REVIEW">Project review</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Button type="submit" className="w-full gap-1" disabled={!form.title.trim() || !form.date || addEvent.isPending} data-testid="deadlines-add"><Plus className="h-4 w-4" /> Add</Button>
            </form>
          </PageSection>

          <PageSection title="Upcoming coding contests" description="Rated Codeforces rounds. Times are in your time zone.">
            <div className="rounded-2xl border border-slate-200 bg-white" data-testid="deadlines-contests">
              {contests.isLoading ? (
                <p className="p-4 text-sm text-slate-500">Loading…</p>
              ) : !contests.data?.available ? (
                <p className="p-4 text-sm text-slate-600">{contests.data?.message || 'Contests could not be loaded.'}</p>
              ) : contests.data.contests.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">No contests announced yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {contests.data.contests.slice(0, 8).map((c) => (
                    <li key={c.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(c.start).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {Math.floor(c.duration_minutes / 60)}h{c.duration_minutes % 60 ? ` ${c.duration_minutes % 60}m` : ''}
                      </p>
                      <div className="mt-1.5 flex gap-3 text-xs">
                        <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={c.url} target="_blank" rel="noopener noreferrer">View <ExternalLink className="h-3 w-3" /></a>
                        <button
                          className="text-blue-600 hover:underline disabled:opacity-50"
                          disabled={addEvent.isPending || all.some((d) => d.title === `Codeforces: ${c.name}`)}
                          onClick={() => addEvent.mutate({ title: `Codeforces: ${c.name}`, date: localYmd(c.start), start_time: localHm(c.start), event_type: 'OTHER', priority: 'LOW', notes: c.url })}
                        >
                          {all.some((d) => d.title === `Codeforces: ${c.name}`) ? 'Added' : 'Add to my deadlines'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {contests.data && (
                <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500">
                  Source: <a className="hover:underline" href={contests.data.source.url} target="_blank" rel="noopener noreferrer">{contests.data.source.name}</a>
                </p>
              )}
            </div>
          </PageSection>
        </div>
      </div>
    </PageContainer>
  );
}

export default DeadlinesPage;
