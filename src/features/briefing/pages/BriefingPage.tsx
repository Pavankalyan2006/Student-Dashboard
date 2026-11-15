import * as React from 'react';
import { Sunrise, Bot, RotateCcw, CalendarClock } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { useUiStore } from '../../../store/uiStore';
import { useBriefing, useBriefingActions } from '../briefingApi';
import { BriefingItemRow } from '../components/BriefingItemRow';

const ACTION_LABEL = { done: 'Done', accepted: 'Added to plan', postponed: 'Postponed', dismissed: 'Dismissed' } as const;

/**
 * Today's briefing, built only from the student's own records: deadlines, planned tasks, attendance, Knowledge
 * Graph gaps, due flashcards, open mistakes and upcoming contests. Each item can be done, added to the plan
 * (with the title, time and day changed first), postponed or dismissed.
 */
export function BriefingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const q = useBriefing();
  const { undo } = useBriefingActions();
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);

  if (q.isLoading) return <PageContainer><LoadingState message="Preparing your briefing…" /></PageContainer>;
  if (q.isError || !q.data) return <PageContainer><ErrorState message="Your briefing could not be loaded." onRetry={() => q.refetch()} /></PageContainer>;
  const b = q.data;
  const dateLabel = new Date(`${b.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const planWithTutor = () => {
    const lines = b.items.map((i) => `- ${i.title} (${i.detail}${i.minutes ? `, about ${i.minutes} min` : ''})`).join('\n');
    setAiInitialPrompt(`Here is my briefing for ${dateLabel}:\n${lines}\n\nHelp me order these into a realistic plan for today. Ask me how many hours I have before you start.`);
    onNavigate('/ai-agent');
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal Intelligence"
        title="Daily Briefing"
        description={`${dateLabel}. Built from your own deadlines, plans, attendance, practice and flashcards. Nothing here is invented: each item names the record it came from.`}
        icon={<Sunrise className="h-6 w-6" />}
        actions={b.items.length > 0 ? <Button variant="outline" className="gap-2" onClick={planWithTutor}><Bot className="h-4 w-4" /> Plan my day with AI Tutor</Button> : undefined}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="For today" value={b.counts.do_today} hint="Overdue, due soon or below minimum" tone="warning" className="min-w-0" />
        <MetricCard label="In your briefing" value={b.counts.total} hint="Most important first" className="min-w-0" />
        <MetricCard label="Handled" value={b.counts.done} hint="Done or added to plan" tone="success" className="min-w-0" />
        <MetricCard label="Postponed" value={b.counts.postponed} hint={`${b.counts.dismissed} dismissed`} tone="neutral" className="min-w-0" />
      </div>

      <PageSection className="min-w-0" title="Your briefing" description="Done marks it handled (a planned study task is ticked in the Study Planner too). Add to plan lets you change the title, time and day first.">
        {b.items.length === 0 ? (
          <EmptyState
            title={b.handled.length ? 'All handled for today' : 'Nothing for today yet'}
            description={b.handled.length ? 'You have dealt with everything in today’s briefing.' : 'Your briefing fills in as you add exams and assignments, plan study tasks, enter attendance, add your syllabus and answer questions.'}
            icon={<CalendarClock className="h-6 w-6" />}
            actionText={b.handled.length ? undefined : 'Add a deadline'}
            onAction={b.handled.length ? undefined : () => onNavigate('/deadlines')}
          />
        ) : (
          <ul className="space-y-3" data-testid="briefing-items">
            {b.items.map((i) => <BriefingItemRow key={i.id} item={i} date={b.date} onNavigate={onNavigate} />)}
          </ul>
        )}
      </PageSection>

      {b.handled.length > 0 && (
        <PageSection className="min-w-0" title="Handled" description="Bring an item back if you changed your mind.">
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {b.handled.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate text-slate-700">{h.title}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-500">{ACTION_LABEL[h.action]}</span>
                  <Button size="sm" variant="ghost" className="gap-1" aria-label={`Bring back ${h.title}`} disabled={undo.isPending} onClick={() => undo.mutate(h.id)}><RotateCcw className="h-3.5 w-3.5" /> Undo</Button>
                </span>
              </li>
            ))}
          </ul>
        </PageSection>
      )}
    </PageContainer>
  );
}

export default BriefingPage;
