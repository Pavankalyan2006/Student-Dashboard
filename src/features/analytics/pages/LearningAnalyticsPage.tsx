import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Flame, CalendarDays, TrendingUp, TrendingDown, Timer, Clock } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { apiClient } from '../../../api/client';
import { useAuth } from '../../../hooks/useAuth';
import { loadSessions, formatMinutes } from '../../focus/focusSessions';
import { cn } from '../../../lib/utils';
import { buildWeeks, heatLevel, WEEKDAYS, MODULE_ROUTES, hourLabel, type LearningAnalytics } from '../learningAnalytics';

const HEAT_CLASSES = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-500',
  'bg-emerald-700',
];

export function LearningAnalyticsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { student } = useAuth();
  const studentId = student?.id ? String(student.id) : null;
  const tz = -new Date().getTimezoneOffset();

  const query = useQuery({
    queryKey: ['learning-analytics', studentId, tz],
    queryFn: () => apiClient.get<LearningAnalytics>(`/learning/analytics?days=365&tz=${tz}`),
    enabled: Boolean(studentId),
    staleTime: 60_000,
  });

  const focus = React.useMemo(() => {
    if (!studentId) return { minutes30: 0, sessions30: 0 };
    const cutoff = Date.now() - 30 * 86400000;
    const recent = loadSessions(studentId).filter((s) => Date.parse(s.ended_at) >= cutoff);
    return { minutes30: recent.reduce((a, s) => a + s.minutes, 0), sessions30: recent.length };
  }, [studentId]);

  const data = query.data;
  const weeks = React.useMemo(() => (data ? buildWeeks(data.calendar) : []), [data]);
  const maxModule = data ? Math.max(1, ...data.by_module.map((m) => m.count)) : 1;
  const maxWeekday = data ? Math.max(1, ...data.by_weekday) : 1;
  const maxHour = data ? Math.max(1, ...data.by_hour) : 1;
  const trend = data ? data.last_30_days - data.previous_30_days : 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal Workspace"
        title="Learning Analytics"
        description="Your activity across courses, quizzes, coding, interviews, GATE, notes and the AI Tutor, from your own records."
        icon={<Activity className="h-6 w-6" />}
      />

      {query.isLoading && <LoadingState message="Reading your activity…" />}
      {query.isError && <ErrorState message="Your analytics could not be loaded." onRetry={() => query.refetch()} />}

      {data && (
        <div className="space-y-6" data-testid="learning-analytics">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Current streak" value={`${data.current_streak} ${data.current_streak === 1 ? 'day' : 'days'}`} hint={`Longest: ${data.longest_streak} ${data.longest_streak === 1 ? 'day' : 'days'}`} icon={<Flame className="h-5 w-5" />} tone="warning" />
            <MetricCard label="Active days" value={data.active_days} hint="In the last 12 months" icon={<CalendarDays className="h-5 w-5" />} tone="success" />
            <MetricCard
              label="Last 30 days"
              value={data.last_30_days}
              hint={data.previous_30_days || data.last_30_days ? `${trend >= 0 ? '+' : ''}${trend} vs the 30 days before` : 'No activity yet'}
              icon={trend >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              tone={trend >= 0 ? 'brand' : 'neutral'}
            />
            <MetricCard
              label="Focus time, 30 days"
              value={formatMinutes(focus.minutes30)}
              hint={`${focus.sessions30} Focus Timer ${focus.sessions30 === 1 ? 'session' : 'sessions'} in this browser`}
              icon={<Timer className="h-5 w-5" />}
              tone="violet"
              onClick={() => onNavigate('/focus')}
            />
          </div>

          <PageSection title="Activity calendar" description={`${data.total_events} activities from ${data.range.from} to ${data.range.to}. Each square is one day.`}>
            {!data.has_data ? (
              <EmptyState
                title="No activity recorded yet"
                description="Take a quiz, solve a problem, finish a lesson or ask the AI Tutor, and it will show up here the same day."
                actionText="Open the AI Tutor"
                onAction={() => onNavigate('/ai-agent')}
              />
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1" role="img" aria-label={`Activity calendar: ${data.active_days} active days in the last year`} data-testid="activity-heatmap">
                  <div className="mr-1 flex flex-col gap-1 pt-0 text-[10px] text-slate-500">
                    {WEEKDAYS.map((d, i) => (
                      <span key={d} className="flex h-3 items-center">{i % 2 ? d : ''}</span>
                    ))}
                  </div>
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                      {week.map((cell, di) =>
                        cell ? (
                          <span
                            key={cell.date}
                            title={`${cell.count} ${cell.count === 1 ? 'activity' : 'activities'} on ${cell.date}`}
                            className={cn('h-3 w-3 rounded-sm', HEAT_CLASSES[heatLevel(cell.count)])}
                          />
                        ) : (
                          <span key={`e${di}`} className="h-3 w-3" />
                        )
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="mr-1">Less</span>
                  {HEAT_CLASSES.map((c, i) => (
                    <span key={i} className={cn('h-3 w-3 rounded-sm', c)} />
                  ))}
                  <span className="ml-1">More</span>
                </div>
              </div>
            )}
          </PageSection>

          {data.has_data && (
            <div className="grid gap-6 lg:grid-cols-2">
              <PageSection title="Where your time goes" description="Activities per module in the last 12 months.">
                <ul className="space-y-2" data-testid="analytics-modules">
                  {data.by_module.map((m) => (
                    <li key={m.module}>
                      <button
                        type="button"
                        onClick={() => onNavigate(MODULE_ROUTES[m.module] || '/progress')}
                        className="group w-full text-left"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-700 group-hover:text-blue-600">{m.label}</span>
                          <span className="tabular-nums text-slate-500">{m.count}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(m.count / maxModule) * 100}%` }} />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </PageSection>

              <PageSection title="When you study" description="Your local time. Use it to plan sessions when you are most active.">
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">By weekday</p>
                    <div className="flex h-24 items-end gap-2">
                      {data.by_weekday.map((n, i) => (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${n} on ${WEEKDAYS[i]}`}>
                          <div className={cn('w-full rounded-t', i === data.busiest_weekday ? 'bg-blue-600' : 'bg-blue-200')} style={{ height: `${Math.max(4, (n / maxWeekday) * 80)}px` }} />
                          <span className="text-[11px] text-slate-500">{WEEKDAYS[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> By hour
                      {data.busiest_hour !== null && <span className="ml-auto normal-case tracking-normal text-slate-600">Most active around {hourLabel(data.busiest_hour)}</span>}
                    </p>
                    <div className="flex h-16 items-end gap-[2px]">
                      {data.by_hour.map((n, h) => (
                        <div key={h} className={cn('flex-1 rounded-t', h === data.busiest_hour ? 'bg-violet-600' : 'bg-violet-200')} style={{ height: `${Math.max(3, (n / maxHour) * 60)}px` }} title={`${n} at ${hourLabel(h)}`} />
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                      <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
                    </div>
                  </div>
                </div>
              </PageSection>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

export default LearningAnalyticsPage;
