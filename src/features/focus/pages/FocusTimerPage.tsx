import * as React from 'react';
import { Timer, Play, Pause, RotateCcw, SkipForward, CheckCircle2, Coffee, Flame, CalendarCheck, ListChecks, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader, MetricCard } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';
import { learningModulesApi } from '../../../api/learningModulesApi';
import type { StudyPlanTask } from '../../../types/learningModules';
import { cn } from '../../../lib/utils';
import {
  FOCUS_PRESETS,
  type FocusSession,
  type FocusPreset,
  loadSessions,
  saveSessions,
  summarize,
  formatClock,
  formatMinutes,
  dayKey,
} from '../focusSessions';

type Mode = 'focus' | 'rest';

/** Short two-tone chime so the end of a session is noticed in another tab. Silent if audio is blocked. */
function chime() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return;
    const ctx = new Ctx();
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.25 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.25 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.25);
    });
    window.setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    /* no audio available */
  }
}

export function FocusTimerPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { student } = useAuth();
  const studentId = student?.id ? String(student.id) : null;

  const [preset, setPreset] = React.useState<FocusPreset>(FOCUS_PRESETS[0]);
  const [mode, setMode] = React.useState<Mode>('focus');
  const [remaining, setRemaining] = React.useState(FOCUS_PRESETS[0].focus * 60);
  const [endsAt, setEndsAt] = React.useState<number | null>(null);
  const [label, setLabel] = React.useState('');
  const [taskId, setTaskId] = React.useState<string>('');
  const [sessions, setSessions] = React.useState<FocusSession[]>([]);
  const [tasks, setTasks] = React.useState<StudyPlanTask[] | null>(null);
  const [tasksError, setTasksError] = React.useState(false);
  const [now, setNow] = React.useState(() => new Date());

  const running = endsAt !== null;
  const total = (mode === 'focus' ? preset.focus : preset.rest) * 60;

  React.useEffect(() => {
    if (studentId) setSessions(loadSessions(studentId));
  }, [studentId]);

  const loadTasks = React.useCallback(async () => {
    try {
      setTasksError(false);
      const list = await learningModulesApi.studyPlanner.getTodayTasks();
      setTasks(list.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS'));
    } catch {
      setTasks([]);
      setTasksError(true);
    }
  }, []);
  React.useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const selectedTask = tasks?.find((t) => t.id === taskId);

  const finish = React.useCallback(
    (completedMode: Mode) => {
      setEndsAt(null);
      chime();
      if (completedMode === 'focus') {
        const minutes = preset.focus;
        const entry: FocusSession = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ended_at: new Date().toISOString(),
          minutes,
          label: (selectedTask?.title || label).trim() || 'Focus session',
          task_id: selectedTask?.id,
        };
        setSessions((prev) => {
          const next = [...prev, entry];
          if (studentId) saveSessions(studentId, next);
          return next;
        });
        toast.success(`${minutes}-minute focus session done`, { description: `Take a ${preset.rest}-minute break.` });
        setMode('rest');
        setRemaining(preset.rest * 60);
      } else {
        toast('Break over', { description: 'Ready for the next focus session.' });
        setMode('focus');
        setRemaining(preset.focus * 60);
      }
    },
    [preset, label, selectedTask, studentId]
  );

  // Count down from a fixed end time, so a throttled background tab still finishes on time.
  React.useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) finish(mode);
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [endsAt, mode, finish]);

  // Show the countdown in the tab title while it runs.
  React.useEffect(() => {
    if (!running) return;
    const prev = document.title;
    document.title = `${formatClock(remaining)} · ${mode === 'focus' ? 'Focus' : 'Break'}`;
    return () => {
      document.title = prev;
    };
  }, [running, remaining, mode]);

  // Refresh "today" figures at midnight and after a session.
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const start = () => setEndsAt(Date.now() + remaining * 1000);
  const pause = () => setEndsAt(null);
  const reset = () => {
    setEndsAt(null);
    setRemaining(total);
  };
  const skip = () => {
    setEndsAt(null);
    const next: Mode = mode === 'focus' ? 'rest' : 'focus';
    setMode(next);
    setRemaining((next === 'focus' ? preset.focus : preset.rest) * 60);
  };
  const choosePreset = (p: FocusPreset) => {
    if (running) return;
    setPreset(p);
    setMode('focus');
    setRemaining(p.focus * 60);
  };

  const markTaskDone = async (task: StudyPlanTask) => {
    try {
      await learningModulesApi.studyPlanner.updateTaskStatus(task.plan_id, task.id, 'COMPLETED');
      toast.success(`Marked "${task.title}" as completed`);
      setTaskId('');
      void loadTasks();
    } catch (e: any) {
      toast.error(`Could not update the task: ${e?.message || 'try again'}`);
    }
  };

  const clearHistory = () => {
    if (!studentId) return;
    setSessions([]);
    saveSessions(studentId, []);
    toast('Focus history cleared');
  };

  const stats = summarize(sessions, now);
  const todaysSessions = sessions.filter((s) => dayKey(new Date(s.ended_at)) === dayKey(now)).slice().reverse();
  const maxDay = Math.max(...stats.week.map((d) => d.minutes), 1);
  const progress = total > 0 ? 1 - remaining / total : 0;
  const R = 108;
  const C = 2 * Math.PI * R;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal Workspace"
        icon={<Timer />}
        title="Focus Timer"
        description="Work in timed focus sessions with short breaks. Link a session to one of today's study planner tasks and mark it done when you finish."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Focus today" value={formatMinutes(stats.todayMinutes)} hint={`${stats.todaySessions} session${stats.todaySessions === 1 ? '' : 's'}`} icon={<Timer />} />
        <MetricCard label="Last 7 days" value={formatMinutes(stats.weekMinutes)} icon={<CalendarCheck />} tone="info" />
        <MetricCard label="Focus streak" value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`} hint="Days in a row with a finished session" icon={<Flame />} tone="warning" />
        <MetricCard
          label="Today's planner tasks"
          value={tasks === null ? '…' : String(tasks.length)}
          hint="Still to do"
          icon={<ListChecks />}
          tone="violet"
          onClick={() => onNavigate('/study-planner')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Timer */}
        <section aria-label="Timer" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="radiogroup" aria-label="Session length" className="inline-flex rounded-lg bg-slate-100 p-1">
              {FOCUS_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={preset.id === p.id}
                  disabled={running}
                  onClick={() => choosePreset(p)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed',
                    preset.id === p.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                mode === 'focus' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
              )}
            >
              {mode === 'focus' ? <Timer className="h-3.5 w-3.5" /> : <Coffee className="h-3.5 w-3.5" />}
              {mode === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>

          <div className="relative mx-auto my-6 aspect-square w-full max-w-[260px]">
            <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="120" cy="120" r={R} fill="none" strokeWidth="10" className="stroke-slate-100" />
              <circle
                cx="120"
                cy="120"
                r={R}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                className={cn('transition-[stroke-dashoffset] duration-500', mode === 'focus' ? 'stroke-blue-600' : 'stroke-emerald-500')}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-bold tabular-nums tracking-tight text-slate-900" role="timer" aria-live="off" data-testid="focus-clock">
                {formatClock(remaining)}
              </span>
              <span className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                {mode === 'focus' ? selectedTask?.title || label || 'Focus session' : 'Stand up, stretch, drink water'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {running ? (
              <Button onClick={pause} className="min-w-[120px]">
                <Pause className="mr-1.5 h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button onClick={start} className="min-w-[120px]" data-testid="focus-start">
                <Play className="mr-1.5 h-4 w-4" /> {remaining < total ? 'Resume' : 'Start'}
              </Button>
            )}
            <Button variant="outline" onClick={reset} disabled={!running && remaining === total}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
            </Button>
            <Button variant="ghost" onClick={skip}>
              <SkipForward className="mr-1.5 h-4 w-4" /> {mode === 'focus' ? 'Skip to break' : 'Skip break'}
            </Button>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-700">Today's planner task (optional)</span>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                disabled={running}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:bg-slate-50"
              >
                <option value="">No task</option>
                {(tasks || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} · {t.subject} ({t.duration_minutes} min)
                  </option>
                ))}
              </select>
              {tasksError && <span className="mt-1 block text-xs text-red-600">Could not load today's planner tasks.</span>}
              {tasks && tasks.length === 0 && !tasksError && (
                <span className="mt-1 block text-xs text-slate-500">
                  No open tasks for today.{' '}
                  <button type="button" className="font-semibold text-blue-600 hover:underline" onClick={() => onNavigate('/study-planner')}>
                    Plan your day
                  </button>
                </span>
              )}
            </label>
            {!selectedTask && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">What are you working on?</span>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Revise deadlock prevention"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                />
              </label>
            )}
            {selectedTask && !running && (
              <Button variant="outline" size="sm" onClick={() => markTaskDone(selectedTask)}>
                <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" /> Mark "{selectedTask.title}" done
              </Button>
            )}
          </div>
        </section>

        {/* History */}
        <div className="space-y-6">
          <section aria-label="Focus minutes, last 7 days" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Last 7 days</h2>
            <p className="text-xs text-slate-500">Minutes of finished focus sessions per day</p>
            <div className="mt-4 flex h-40 items-end gap-2" role="list">
              {stats.week.map((d) => (
                <div key={d.day} role="listitem" aria-label={`${d.label}: ${d.minutes} minutes`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[10px] font-semibold tabular-nums text-slate-600">{d.minutes || ''}</span>
                  <div
                    className={cn('w-full max-w-[36px] rounded-t-md', d.day === dayKey(now) ? 'bg-blue-600' : 'bg-blue-200')}
                    style={{ height: `${Math.max(d.minutes ? 6 : 2, (d.minutes / maxDay) * 100)}%` }}
                  />
                  <span className={cn('text-[11px]', d.day === dayKey(now) ? 'font-semibold text-slate-900' : 'text-slate-500')}>{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="Today's sessions" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Today's sessions</h2>
              {sessions.length > 0 && (
                <button type="button" onClick={clearHistory} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
                  <Trash2 className="h-3.5 w-3.5" /> Clear history
                </button>
              )}
            </div>
            {todaysSessions.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No finished sessions yet today. Start the timer to log your first one.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100" data-testid="focus-sessions">
                {todaysSessions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate text-slate-800">{s.label}</span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-500">
                      {s.minutes} min · {new Date(s.ended_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-slate-500">Your focus history is saved in this browser for your account only.</p>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
