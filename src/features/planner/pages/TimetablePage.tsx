import * as React from 'react';
import { AlertTriangle, CalendarDays, Clock, MapPin, Plus, Trash2, User, BookOpen, Timer } from 'lucide-react';
import { PageContainer, PageHeader, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { AnimatePresence, ProgressRing, motion, EASE_OUT } from '../../../components/motion';
import { cn } from '../../../lib/utils';
import {
  CLASS_COLORS,
  WEEK_DAYS,
  currentAndNext,
  findClashes,
  toMinutes,
  weekdayIndex,
  weeklyHours,
  type ClassColor,
  type ClassKind,
  type TimetableSlot,
} from '../../../../server/services/plannerService';
import { newPlannerId, useTimetable } from '../usePlanner';

const HOUR_PX = 56;

const COLOR_STYLES: Record<ClassColor, { block: string; dot: string; swatch: string }> = {
  blue: { block: 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400', dot: 'bg-blue-500', swatch: 'bg-blue-500' },
  violet: { block: 'bg-violet-50 border-violet-200 text-violet-900 hover:border-violet-400', dot: 'bg-violet-500', swatch: 'bg-violet-500' },
  emerald: { block: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400', dot: 'bg-emerald-500', swatch: 'bg-emerald-500' },
  amber: { block: 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400', dot: 'bg-amber-500', swatch: 'bg-amber-500' },
  rose: { block: 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-400', dot: 'bg-rose-500', swatch: 'bg-rose-500' },
  sky: { block: 'bg-sky-50 border-sky-200 text-sky-900 hover:border-sky-400', dot: 'bg-sky-500', swatch: 'bg-sky-500' },
  slate: { block: 'bg-slate-100 border-slate-300 text-slate-900 hover:border-slate-500', dot: 'bg-slate-500', swatch: 'bg-slate-500' },
};

const KIND_LABEL: Record<ClassKind, string> = { lecture: 'Lecture', lab: 'Lab', tutorial: 'Tutorial', other: 'Other' };

const field =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

/** The current time, refreshed every 30 seconds. */
function useNow() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtHour = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
function fmtAway(mins: number) {
  if (mins < 60) return `in ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `in ${h} h ${mins % 60} min`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'tomorrow' : `in ${d} days`;
}

type Draft = Omit<TimetableSlot, 'id'> & { id?: string; repeatDays: number[] };

/** Places overlapping classes on one day side by side: each gets a lane and the number of lanes in its group. */
function layoutDay(daySlots: TimetableSlot[]) {
  const out = new Map<string, { lane: number; lanes: number }>();
  const sorted = [...daySlots].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  let group: TimetableSlot[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;
  const close = () => group.forEach((s) => out.set(s.id, { lane: out.get(s.id)!.lane, lanes: laneEnds.length }));
  for (const s of sorted) {
    const start = toMinutes(s.start);
    if (start >= groupEnd && group.length) {
      close();
      group = [];
      laneEnds = [];
    }
    let lane = laneEnds.findIndex((end) => end <= start);
    if (lane === -1) lane = laneEnds.push(0) - 1;
    laneEnds[lane] = toMinutes(s.end);
    out.set(s.id, { lane, lanes: 1 });
    group.push(s);
    groupEnd = Math.max(groupEnd, toMinutes(s.end));
  }
  if (group.length) close();
  return out;
}

export function TimetablePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { query, save } = useTimetable();
  const now = useNow();
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [mobileDay, setMobileDay] = React.useState(() => weekdayIndex(new Date()));

  if (query.isLoading) return <PageContainer><LoadingState message="Loading your timetable…" /></PageContainer>;
  if (query.isError || !query.data)
    return <PageContainer><ErrorState message="Your timetable could not be loaded." onRetry={() => query.refetch()} /></PageContainer>;

  const slots = query.data.slots;
  const today = weekdayIndex(now);
  const { current, next } = currentAndNext(slots, now);
  const clashes = findClashes(slots);
  const subjects = new Set(slots.map((s) => s.subject.toLowerCase())).size;
  const showDays = slots.some((s) => s.day === 6) ? 7 : 6;

  const startHour = Math.min(8, ...slots.map((s) => Math.floor(toMinutes(s.start) / 60)));
  const endHour = Math.max(17, ...slots.map((s) => Math.ceil(toMinutes(s.end) / 60)));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMins - startHour * 60) / 60) * HOUR_PX;
  const nowVisible = nowMins >= startHour * 60 && nowMins <= endHour * 60;

  const openNew = (day = today, hour = 9) =>
    setDraft({
      subject: '',
      day,
      start: `${pad(hour)}:00`,
      end: `${pad(Math.min(23, hour + 1))}:00`,
      room: '',
      teacher: '',
      kind: 'lecture',
      color: CLASS_COLORS[slots.length % CLASS_COLORS.length],
      repeatDays: [day],
    });
  const openEdit = (s: TimetableSlot) => setDraft({ ...s, repeatDays: [s.day] });

  const commit = () => {
    if (!draft) return;
    const { repeatDays, id, ...base } = draft;
    let nextSlots: TimetableSlot[];
    if (id) nextSlots = slots.map((s) => (s.id === id ? { ...base, id } : s));
    else nextSlots = [...slots, ...repeatDays.map((day) => ({ ...base, day, id: newPlannerId() }))];
    save.mutate({ ...query.data!, slots: nextSlots }, { onSuccess: () => setDraft(null) });
  };
  const remove = (id: string) => {
    save.mutate({ ...query.data!, slots: slots.filter((s) => s.id !== id) });
    setDraft(null);
  };

  const draftValid = draft && draft.subject.trim() && draft.start < draft.end && draft.repeatDays.length > 0;
  const currentProgress = current ? ((nowMins - toMinutes(current.start)) / (toMinutes(current.end) - toMinutes(current.start))) * 100 : 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Class Timetable"
        description="Your week at a glance. See which class is on now, what's next, and spot clashes before they happen."
        icon={<CalendarDays className="h-6 w-6" />}
        actions={
          <Button className="gap-2" onClick={() => openNew()} data-testid="timetable-add">
            <Plus className="h-4 w-4" /> Add class
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Live now / next card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 bg-[length:200%_200%] p-5 text-white shadow-md animate-gradient-pan sm:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div key={`now-${current.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative flex items-center gap-4">
                <ProgressRing value={currentProgress} size={68} stroke={6} trackClassName="stroke-white/20" barClassName="stroke-white">
                  <span className="text-xs font-bold tabular-nums">{Math.round(currentProgress)}%</span>
                </ProgressRing>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse-ring" /> On now
                  </p>
                  <p className="truncate font-display text-xl font-bold">{current.subject}</p>
                  <p className="text-sm text-white/80">
                    until {current.end}
                    {current.room && ` · ${current.room}`}
                  </p>
                </div>
              </motion.div>
            ) : next ? (
              <motion.div key={`next-${next.slot.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="relative flex items-center gap-4">
                <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Timer className="h-7 w-7" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Up next · {fmtAway(next.minutesAway)}</p>
                  <p className="truncate font-display text-xl font-bold">{next.slot.subject}</p>
                  <p className="text-sm text-white/80">
                    {WEEK_DAYS[next.slot.day]} {next.slot.start}–{next.slot.end}
                    {next.slot.room && ` · ${next.slot.room}`}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">No classes yet</p>
                <p className="font-display text-xl font-bold">Add your first class to see what's next</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <MetricCard label="Classes per week" value={slots.length} hint={`${subjects} subject${subjects === 1 ? '' : 's'}`} icon={<BookOpen />} tone="brand" />
        <MetricCard label="Hours per week" value={weeklyHours(slots).toFixed(1)} hint="Time in class" icon={<Clock />} tone="violet" />
      </div>

      {clashes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              {clashes.length} clash{clashes.length === 1 ? '' : 'es'} in your week
            </p>
            <ul className="mt-1 space-y-0.5 text-[13px]">
              {clashes.slice(0, 4).map(([a, b]) => (
                <li key={`${a.id}-${b.id}`}>
                  {WEEK_DAYS[a.day]}: {a.subject} ({a.start}–{a.end}) overlaps {b.subject} ({b.start}–{b.end})
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {slots.length === 0 ? (
        <EmptyState
          title="Build your weekly timetable"
          description="Add each class once and repeat it on the days it happens. Your dashboard will then show what's on now and what's next."
          icon={<CalendarDays />}
          actionText="Add your first class"
          onAction={() => openNew()}
        />
      ) : (
        <>
          {/* Phones: one day at a time */}
          <div className="md:hidden">
            <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Day">
              {WEEK_DAYS.slice(0, showDays).map((d, i) => (
                <button
                  key={d}
                  role="tab"
                  aria-selected={mobileDay === i}
                  onClick={() => setMobileDay(i)}
                  className={cn(
                    'relative shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                    mobileDay === i ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {mobileDay === i && <motion.span layoutId="tt-day-pill" className="absolute inset-0 rounded-lg bg-blue-600" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                  <span className="relative">{d}</span>
                  {i === today && <span className="relative ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-400 align-middle" />}
                </button>
              ))}
            </div>
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {slots
                  .filter((s) => s.day === mobileDay)
                  .sort((a, b) => a.start.localeCompare(b.start))
                  .map((s, i) => (
                    <motion.button
                      layout
                      key={s.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                      exit={{ opacity: 0, x: -16 }}
                      onClick={() => openEdit(s)}
                      className={cn('flex w-full items-center gap-3 rounded-xl border p-3.5 text-left', COLOR_STYLES[s.color].block, current?.id === s.id && 'ring-2 ring-red-400')}
                    >
                      <div className="w-14 shrink-0 text-xs font-semibold tabular-nums">
                        {s.start}
                        <br />
                        <span className="opacity-60">{s.end}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{s.subject}</p>
                        <p className="truncate text-xs opacity-75">{[KIND_LABEL[s.kind], s.room, s.teacher].filter(Boolean).join(' · ')}</p>
                      </div>
                    </motion.button>
                  ))}
              </AnimatePresence>
              {!slots.some((s) => s.day === mobileDay) && (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No classes on {WEEK_DAYS[mobileDay]}.</p>
              )}
            </div>
          </div>

          {/* Tablets and up: the whole week */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs md:block">
            <div className="min-w-[760px]" style={{ display: 'grid', gridTemplateColumns: `64px repeat(${showDays}, minmax(0, 1fr))` }}>
              <div className="sticky top-0 z-10 border-b border-slate-200 bg-white" />
              {WEEK_DAYS.slice(0, showDays).map((d, i) => (
                <div
                  key={d}
                  className={cn('border-b border-l border-slate-200 bg-white px-3 py-2.5 text-center text-[13px] font-semibold', i === today ? 'text-blue-700' : 'text-slate-600')}
                >
                  {d}
                  {i === today && <span className="ml-1.5 rounded-full bg-blue-600 px-1.5 py-px text-[10px] font-bold text-white">Today</span>}
                </div>
              ))}

              {/* Hour labels */}
              <div className="relative" style={{ height: hours.length * HOUR_PX }}>
                {hours.map((h, i) => (
                  <div key={h} className="absolute right-2 -translate-y-1/2 text-[11px] font-medium text-slate-400" style={{ top: i * HOUR_PX }}>
                    {i === 0 ? '' : fmtHour(h)}
                  </div>
                ))}
              </div>

              {WEEK_DAYS.slice(0, showDays).map((d, day) => (
                <div key={d} className={cn('relative border-l border-slate-200', day === today && 'bg-blue-50/40')} style={{ height: hours.length * HOUR_PX }}>
                  {hours.map((h, i) => (
                    <button
                      key={h}
                      type="button"
                      aria-label={`Add a class on ${d} at ${fmtHour(h)}`}
                      onClick={() => openNew(day, h)}
                      className="group absolute inset-x-0 border-t border-slate-100 transition-colors hover:bg-blue-50/70"
                      style={{ top: i * HOUR_PX, height: HOUR_PX }}
                    >
                      <Plus className="mx-auto h-4 w-4 text-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}

                  {(() => {
                    const daySlots = slots.filter((s) => s.day === day);
                    const lanes = layoutDay(daySlots);
                    return daySlots.map((s, i) => {
                      const { lane, lanes: n } = lanes.get(s.id)!;
                      const top = ((toMinutes(s.start) - startHour * 60) / 60) * HOUR_PX;
                      const height = Math.max(26, ((toMinutes(s.end) - toMinutes(s.start)) / 60) * HOUR_PX - 3);
                      const isNow = current?.id === s.id;
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: EASE_OUT, delay: day * 0.04 + i * 0.03 }}
                          whileHover={{ scale: 1.02, zIndex: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openEdit(s)}
                          className={cn(
                            'absolute z-[2] overflow-hidden rounded-lg border px-2 py-1.5 text-left shadow-xs transition-colors',
                            COLOR_STYLES[s.color].block,
                            isNow && 'ring-2 ring-red-400 ring-offset-1'
                          )}
                          style={{ top: top + 1.5, height, left: `calc(${(lane / n) * 100}% + 4px)`, width: `calc(${100 / n}% - 8px)` }}
                          title={`${s.subject} · ${s.start}–${s.end}`}
                        >
                          <p className="truncate text-[12.5px] font-semibold leading-tight">{s.subject}</p>
                          {height > 40 && (
                            <p className="truncate text-[11px] opacity-75">
                              {s.start}–{s.end}
                              {s.room && ` · ${s.room}`}
                            </p>
                          )}
                          {height > 62 && <p className="truncate text-[11px] opacity-60">{KIND_LABEL[s.kind]}{s.teacher && ` · ${s.teacher}`}</p>}
                        </motion.button>
                      );
                    });
                  })()}

                  {day === today && nowVisible && (
                    <div className="pointer-events-none absolute inset-x-0 z-[3]" style={{ top: nowTop }} aria-hidden="true">
                      <div className="relative h-0.5 bg-red-500">
                        <span className="absolute -left-1.5 -top-[5px] h-3 w-3 rounded-full bg-red-500 animate-pulse-ring" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <p className="text-center text-xs text-slate-500">
        Tracking attendance for these classes?{' '}
        <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={() => onNavigate('/attendance')}>
          Open Attendance
        </button>
      </p>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? 'Edit class' : 'Add a class'}</DialogTitle>
            <DialogDescription>{draft?.id ? 'Change the details or remove this class.' : 'Pick every day this class repeats on.'}</DialogDescription>
          </DialogHeader>
          {draft && (
            <form
              className="space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (draftValid) commit();
              }}
            >
              <label className="block space-y-1">
                <span className="text-[13px] font-medium text-slate-700">Subject</span>
                <input autoFocus className={field} value={draft.subject} placeholder="e.g. Data Structures" onChange={(e) => setDraft({ ...draft, subject: e.target.value })} data-testid="timetable-subject" />
              </label>

              <div>
                <span className="text-[13px] font-medium text-slate-700">{draft.id ? 'Day' : 'Days'}</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {WEEK_DAYS.map((d, i) => {
                    const on = draft.id ? draft.day === i : draft.repeatDays.includes(i);
                    return (
                      <motion.button
                        key={d}
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          draft.id
                            ? setDraft({ ...draft, day: i, repeatDays: [i] })
                            : setDraft({ ...draft, repeatDays: on ? draft.repeatDays.filter((x) => x !== i) : [...draft.repeatDays, i].sort() })
                        }
                        className={cn(
                          'h-8 w-11 rounded-lg border text-xs font-semibold transition-colors',
                          on ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        )}
                        aria-pressed={on}
                      >
                        {d}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Starts</span>
                  <input type="time" className={field} value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
                </label>
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Ends</span>
                  <input type="time" className={field} value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
                </label>
              </div>
              {draft.start >= draft.end && <p className="text-xs text-rose-600">The class must end after it starts.</p>}

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="flex items-center gap-1 text-[13px] font-medium text-slate-700"><MapPin className="h-3.5 w-3.5" /> Room</span>
                  <input className={field} value={draft.room} placeholder="e.g. LH-204" onChange={(e) => setDraft({ ...draft, room: e.target.value })} />
                </label>
                <label className="space-y-1">
                  <span className="flex items-center gap-1 text-[13px] font-medium text-slate-700"><User className="h-3.5 w-3.5" /> Faculty</span>
                  <input className={field} value={draft.teacher} placeholder="Optional" onChange={(e) => setDraft({ ...draft, teacher: e.target.value })} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Type</span>
                  <select className={field} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as ClassKind })}>
                    {Object.entries(KIND_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
                <div className="space-y-1">
                  <span className="text-[13px] font-medium text-slate-700">Colour</span>
                  <div className="flex h-9 items-center gap-1.5">
                    {CLASS_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={c}
                        aria-pressed={draft.color === c}
                        onClick={() => setDraft({ ...draft, color: c })}
                        className={cn('h-6 w-6 rounded-full transition-transform hover:scale-110', COLOR_STYLES[c].swatch, draft.color === c && 'ring-2 ring-slate-900 ring-offset-2')}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-3">
                {draft.id && (
                  <Button type="button" variant="ghost" className="mr-auto gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(draft.id!)}>
                    <Trash2 className="h-4 w-4" /> Remove
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
                <Button type="submit" disabled={!draftValid || save.isPending} data-testid="timetable-save">
                  {draft.id ? 'Save' : draft.repeatDays.length > 1 ? `Add to ${draft.repeatDays.length} days` : 'Add class'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
