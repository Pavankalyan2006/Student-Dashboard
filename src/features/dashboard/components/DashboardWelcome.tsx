import * as React from 'react';
import { motion } from 'motion/react';
import { Flame, Compass, CalendarDays, Clock, BookOpen, Binary, Hammer } from 'lucide-react';
import { DashboardStudent, DashboardSummary } from '../types/dashboard';
import { AnimatedNumber, EASE_OUT, ProgressRing } from '../../../components/motion';
import { HeroConstellation } from '../../../components/brand/Illustrations';

/**
 * The NEXORA AI dashboard hero: greeting, semester context, overall progress and this week's
 * real numbers from the dashboard summary. No value here is invented; a missing summary hides the stats.
 */
export function DashboardWelcome({
  student,
  streakDays = 0,
  summary,
}: {
  student: DashboardStudent;
  streakDays?: number;
  summary?: DashboardSummary;
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = student.name ? student.name.split(' ')[0] : 'Student';
  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const overall = summary ? Math.max(0, Math.min(100, Math.round(summary.overall_progress))) : null;

  const stats = summary
    ? [
        { label: 'Study hours this week', value: Math.round((Number(summary.study_hours_this_week) || 0) * 10) / 10, icon: Clock, tint: 'text-sky-300' },
        { label: 'Active courses', value: summary.courses_active, icon: BookOpen, tint: 'text-violet-300' },
        { label: 'DSA problems solved', value: summary.dsa_solved, icon: Binary, tint: 'text-amber-300' },
        { label: 'Active projects', value: summary.projects_active, icon: Hammer, tint: 'text-emerald-300' },
      ]
    : [];

  return (
    <section
      aria-label="Welcome"
      className="hero-brand inverse-island relative overflow-hidden rounded-3xl p-6 text-white ring-1 ring-white/[0.06] sm:p-7 lg:p-8"
    >
      {/* Ambient light, a neural constellation and a fine dot texture. Decorative only. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#9B78FF]/25 blur-3xl animate-float" />
        <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-[#37C9E8]/15 blur-3xl animate-float [animation-delay:1.4s]" />
        <HeroConstellation className="absolute -right-6 top-2 hidden h-[220px] w-[420px] opacity-70 md:block" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255_/_0.07)_1px,transparent_1.2px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
            <CalendarDays className="h-3.5 w-3.5" /> {today}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="font-display text-[26px] font-bold leading-tight tracking-tight sm:text-[32px]"
          >
            {greeting},{' '}
            <span className="bg-gradient-to-r from-[#C7B2FB] via-[#B4A7F7] to-[#7AD8EF] bg-clip-text text-transparent">{firstName}</span>
          </motion.h1>
          <div className="flex flex-wrap items-center gap-2">
            {student.semester ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-emerald-200 ring-1 ring-inset ring-white/15">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#36D399]" />
                Semester {student.semester}
              </span>
            ) : null}
            {student.branch && (
              <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/75 ring-1 ring-inset ring-white/10">
                {student.branch}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/10 px-2.5 py-1 text-xs font-semibold text-amber-100 ring-1 ring-inset ring-amber-300/30">
              <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="flex">
                <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </motion.span>
              <span className="tabular-nums">
                {streakDays} {streakDays === 1 ? 'day' : 'days'} streak
              </span>
            </span>
          </div>
          {student.focus_topic ? (
            <p className="flex max-w-xl items-center gap-2 text-sm leading-relaxed text-white/70">
              <Compass className="h-4 w-4 shrink-0 text-[#7AD8EF]" />
              <span className="truncate">
                Current focus: <span className="font-semibold text-white">{student.focus_topic}</span>
              </span>
            </p>
          ) : (
            <p className="max-w-xl text-sm leading-relaxed text-white/70">Learn smarter, build faster and achieve more, one session at a time.</p>
          )}
        </div>

        {overall !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.45, ease: EASE_OUT }}
            className="glass-panel flex shrink-0 items-center gap-4 self-start rounded-2xl !border-white/10 !bg-white/[0.06] p-4 lg:self-auto"
          >
            <ProgressRing value={overall} size={84} stroke={8} gradient trackClassName="stroke-white/10" label="Overall academic progress">
              <span className="font-display text-lg font-bold tabular-nums">
                <AnimatedNumber value={`${overall}%`} />
              </span>
            </ProgressRing>
            <div className="text-xs">
              <div className="font-semibold uppercase tracking-wider text-white/55">Overall progress</div>
              <div className="mt-1 text-sm font-semibold text-white">Across enrolled courses</div>
              {summary && summary.total_credits > 0 && (
                <div className="mt-0.5 text-white/60 tabular-nums">
                  {summary.credits_completed} / {summary.total_credits} credits
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {stats.length > 0 && (
        <div className="relative mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: EASE_OUT }}
                className="rounded-xl bg-white/[0.05] px-3.5 py-3 ring-1 ring-inset ring-white/[0.08] transition-colors hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
                  <Icon className={`h-3.5 w-3.5 ${s.tint}`} />
                  <span className="truncate">{s.label}</span>
                </div>
                <div className="mt-1.5 font-display text-xl font-bold tabular-nums text-white sm:text-2xl">
                  <AnimatedNumber value={s.value} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
