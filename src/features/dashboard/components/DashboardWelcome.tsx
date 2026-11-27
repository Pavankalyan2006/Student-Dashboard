import * as React from 'react';
import { motion } from 'motion/react';
import { Flame, Compass, CalendarDays } from 'lucide-react';
import { DashboardStudent } from '../types/dashboard';
import { EASE_OUT } from '../../../components/motion';

export function DashboardWelcome({
  student,
  streakDays = 7,
}: {
  student: DashboardStudent;
  streakDays?: number;
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = student.name ? student.name.split(' ')[0] : 'Student';
  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="hero-brand relative overflow-hidden rounded-2xl p-6 text-white sm:p-7">
      {/* soft moving light and a fine dot texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl animate-float" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl animate-float [animation-delay:1.4s]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255_/_0.08)_1px,transparent_1.2px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
      </div>

      <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
            <CalendarDays className="h-3.5 w-3.5" /> {today}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="font-display text-2xl font-bold tracking-tight sm:text-[28px]"
            >
              {greeting},{' '}
              <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">{firstName}</span>
              <motion.span
                aria-hidden="true"
                className="ml-1.5 inline-block origin-[70%_70%]"
                animate={{ rotate: [0, 16, -8, 14, 0] }}
                transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
              >
                👋
              </motion.span>
            </motion.h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-emerald-200 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Semester {student.semester}
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70">
            {student.branch} · Ready to continue your engineering coursework and lab milestones?
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, ease: EASE_OUT }}
            className="hidden items-center gap-2.5 rounded-xl bg-white/[0.08] px-3.5 py-2.5 text-xs ring-1 ring-inset ring-white/10 backdrop-blur lg:flex"
          >
            <Compass className="h-4 w-4 text-sky-300" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Active focus</div>
              <div className="max-w-[200px] truncate font-semibold">{student.focus_topic}</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, ease: EASE_OUT }}
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 px-3.5 py-2.5 text-xs ring-1 ring-inset ring-amber-300/30"
          >
            <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="flex">
              <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
            </motion.span>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">Study streak</div>
              <div className="font-bold tabular-nums text-amber-50">
                {streakDays} {streakDays === 1 ? 'day' : 'days'} active
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
