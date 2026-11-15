import * as React from 'react';
import { Check, CalendarPlus, Clock, X, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { addDays, useBriefingActions, type BriefingItem } from '../briefingApi';

const PRIORITY: Record<BriefingItem['priority'], { label: string; tone: string }> = {
  1: { label: 'Today', tone: 'bg-rose-50 text-rose-700 ring-rose-200' },
  2: { label: 'Important', tone: 'bg-amber-50 text-amber-700 ring-amber-200' },
  3: { label: 'When you can', tone: 'bg-slate-100 text-slate-600 ring-slate-200' },
};

/** One briefing item with its four actions: done, add to plan (editable), postpone, dismiss. */
export function BriefingItemRow({ item, date, onNavigate, compact }: { item: BriefingItem; date: string; onNavigate: (p: string) => void; compact?: boolean }) {
  const { act, plan } = useBriefingActions();
  const [editing, setEditing] = React.useState(false);
  const [postponing, setPostponing] = React.useState(false);
  const [title, setTitle] = React.useState(item.title);
  const [minutes, setMinutes] = React.useState(item.minutes || 30);
  const [day, setDay] = React.useState(date);
  const busy = act.isPending || plan.isPending;
  const canPlan = item.kind !== 'study_task' && item.kind !== 'attendance';
  const open = () => (item.url ? window.open(item.url, '_blank', 'noopener,noreferrer') : onNavigate(item.route));

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4" data-testid={`briefing-item-${item.kind}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium ring-1', PRIORITY[item.priority].tone)}>{PRIORITY[item.priority].label}</span>
            <span className="text-[11px] text-slate-500">From {item.source}</span>
          </div>
          <button type="button" onClick={open} className="mt-1 block max-w-full truncate text-left text-sm font-semibold text-slate-900 hover:text-blue-700">
            {item.title}
            {item.url ? <ExternalLink className="ml-1 inline h-3.5 w-3.5" /> : <ArrowRight className="ml-1 inline h-3.5 w-3.5 opacity-50" />}
          </button>
          <p className="text-xs text-slate-600">{item.detail}</p>
        </div>
        {compact && (
          <Button size="sm" variant="outline" aria-label={`Mark ${item.title} done`} disabled={busy} onClick={() => act.mutate({ id: item.id, action: 'done' })} className="shrink-0 gap-1">
            <Check className="h-3.5 w-3.5" /> Done
          </Button>
        )}
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => act.mutate({ id: item.id, action: 'done' })} aria-label={`Mark ${item.title} done`}><Check className="h-3.5 w-3.5" /> Done</Button>
          {canPlan && <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => { setEditing(!editing); setPostponing(false); }} aria-expanded={editing}><CalendarPlus className="h-3.5 w-3.5" /> Add to plan</Button>}
          <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={() => { setPostponing(!postponing); setEditing(false); }} aria-expanded={postponing}><Clock className="h-3.5 w-3.5" /> Postpone</Button>
          <Button size="sm" variant="ghost" className="gap-1.5 text-slate-500" disabled={busy} onClick={() => act.mutate({ id: item.id, action: 'dismissed' })} aria-label={`Dismiss ${item.title}`}><X className="h-3.5 w-3.5" /> Dismiss</Button>
        </div>
      )}

      {editing && (
        <form
          className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_auto_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            plan.mutate({ id: item.id, title: title.trim() || item.title, minutes, date: day }, { onSuccess: () => setEditing(false) });
          }}
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} aria-label="Task title" className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm" />
          <label className="flex items-center gap-1 text-xs text-slate-600">
            <input type="number" min={5} max={600} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} aria-label="Minutes" className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-sm" /> min
          </label>
          <input type="date" value={day} min={date} max={addDays(date, 30)} onChange={(e) => setDay(e.target.value)} aria-label="Day" className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" />
          <Button size="sm" type="submit" disabled={busy}>Add</Button>
        </form>
      )}

      {postponing && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Show it again on
          {[
            { label: 'Tomorrow', d: 1 },
            { label: 'In 3 days', d: 3 },
            { label: 'Next week', d: 7 },
          ].map((o) => (
            <Button key={o.d} size="sm" variant="outline" disabled={busy} onClick={() => act.mutate({ id: item.id, action: 'postponed', until: addDays(date, o.d) })}>
              {o.label}
            </Button>
          ))}
        </div>
      )}
    </li>
  );
}
