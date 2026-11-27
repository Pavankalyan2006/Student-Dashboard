import * as React from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Circle, KanbanSquare } from 'lucide-react';
import { motion, SpotlightCard, celebrate, originOf } from '../../../components/motion';
import { cn } from '../../../lib/utils';
import { WEEK_DAYS, currentAndNext, weekdayIndex } from '../../../../server/services/plannerService';
import { todayISO, useTaskBoard, useTimetable } from '../usePlanner';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

/** Dashboard card: today's classes from the timetable and the most urgent open tasks from the task board. */
export function TodayAtAGlance({ onNavigate }: { onNavigate: (path: string) => void }) {
  const tt = useTimetable();
  const tb = useTaskBoard();
  const now = new Date();
  const today = todayISO();

  const slots = tt.query.data?.slots ?? [];
  const todays = slots.filter((s) => s.day === weekdayIndex(now)).sort((a, b) => a.start.localeCompare(b.start));
  const { current, next } = currentAndNext(slots, now);
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const tasks = tb.query.data?.tasks ?? [];
  const open = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => (a.due ?? '9999').localeCompare(b.due ?? '9999') || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 4);

  const finish = (id: string, el: Element | null) => {
    if (!tb.query.data) return;
    celebrate(originOf(el));
    tb.save.mutate({
      ...tb.query.data,
      tasks: tb.query.data.tasks.map((t) => (t.id === id ? { ...t, status: 'done', completed_at: new Date().toISOString() } : t)),
    });
  };

  return (
    <section aria-labelledby="today-glance-heading" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <h2 id="today-glance-heading" className="sr-only">Today at a glance</h2>

      <SpotlightCard className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-slate-900">
            <CalendarDays className="h-4 w-4 text-blue-600" /> Today's classes
          </h3>
          <button type="button" onClick={() => onNavigate('/timetable')} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:gap-1.5 transition-[gap]">
            Timetable <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {tt.query.isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        ) : todays.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            {slots.length
              ? next
                ? `No classes today. Next: ${next.slot.subject}, ${WEEK_DAYS[next.slot.day]} at ${next.slot.start}.`
                : 'No classes today.'
              : 'Add your timetable to see your classes here.'}
          </p>
        ) : (
          <ol className="relative space-y-2 border-l-2 border-slate-100 pl-4">
            {todays.map((s, i) => {
              const isNow = current?.id === s.id;
              const past = s.end <= nowHHMM;
              return (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={cn('relative flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm', isNow ? 'bg-blue-50 ring-1 ring-blue-200' : past ? 'opacity-55' : 'bg-slate-50')}
                >
                  <span className={cn('absolute -left-[23px] h-3 w-3 rounded-full border-2 border-white', isNow ? 'bg-red-500 animate-pulse-ring' : past ? 'bg-slate-300' : 'bg-blue-500')} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900">{s.subject}</span>
                    {s.room && <span className="text-xs text-slate-500">{s.room}</span>}
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">
                    {isNow ? <span className="text-red-600">Now · till {s.end}</span> : `${s.start}–${s.end}`}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        )}
      </SpotlightCard>

      <SpotlightCard className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-display text-[15px] font-semibold text-slate-900">
            <KanbanSquare className="h-4 w-4 text-violet-600" /> Up next on your board
          </h3>
          <button type="button" onClick={() => onNavigate('/tasks')} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:gap-1.5 transition-[gap]">
            Task Board <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {tb.query.isLoading ? (
          <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
        ) : open.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{tasks.length ? 'Every task is done. 🎉' : 'Add tasks to your board to see the most urgent ones here.'}</p>
        ) : (
          <ul className="space-y-1.5">
            {open.map((t, i) => (
              <motion.li key={t.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => finish(t.id, e.currentTarget)}
                  aria-label={`Mark "${t.title}" done`}
                  className="group/check shrink-0 text-slate-300 hover:text-emerald-500"
                >
                  <Circle className="h-[18px] w-[18px] group-hover/check:hidden" />
                  <CheckCircle2 className="hidden h-[18px] w-[18px] group-hover/check:block" />
                </motion.button>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{t.title}</span>
                {t.due && (
                  <span className={cn('shrink-0 text-xs font-semibold', t.due < today ? 'text-rose-600' : t.due === today ? 'text-amber-600' : 'text-slate-500')}>
                    {t.due < today ? 'Overdue' : t.due === today ? 'Today' : new Date(t.due + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </SpotlightCard>
    </section>
  );
}
