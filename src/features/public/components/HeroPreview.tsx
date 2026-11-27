import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { BookOpen, CalendarDays, CheckCircle2, Code2, KanbanSquare, Sparkles, Timer } from 'lucide-react';
import { EASE_OUT } from '../../../components/motion';

/**
 * A stylised picture of the student workspace for the landing page. It tilts gently toward the pointer.
 * Every label is generic (subject names, "Today"), never a real student's data or a usage statistic.
 */
export function HeroPreview() {
  const ref = React.useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 140, damping: 18 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.85, ease: EASE_OUT }}
      className="relative mx-auto mt-16 max-w-5xl [perspective:1400px]"
      aria-hidden="true"
    >
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-2xl shadow-blue-900/10 backdrop-blur-xl"
      >
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="mx-auto hidden h-5 w-64 rounded-md bg-slate-100 sm:block" />
        </div>
        <div className="grid grid-cols-12 gap-2 rounded-xl bg-slate-50 p-2 text-left sm:gap-3 sm:p-3">
          {/* mini sidebar */}
          <div className="col-span-3 hidden flex-col gap-1.5 rounded-lg bg-navy-950 p-3 sm:flex">
            <div className="mb-2 h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-500" />
            {['w-20', 'w-16', 'w-24', 'w-14', 'w-20', 'w-16', 'w-12'].map((w, i) => (
              <div key={i} className={`h-2 rounded-full ${i === 1 ? 'bg-blue-400/80' : 'bg-white/15'} ${w}`} />
            ))}
          </div>
          {/* content */}
          <div className="col-span-12 space-y-2 sm:col-span-9 sm:space-y-3">
            <div className="rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Today</p>
              <p className="font-display text-base font-bold sm:text-lg">Good morning, ready for DSA?</p>
              <div className="mt-2 h-1.5 w-2/3 overflow-hidden rounded-full bg-white/20">
                <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: '64%' }} transition={{ duration: 1.4, delay: 1.4, ease: EASE_OUT }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: BookOpen, label: 'Courses', tone: 'text-blue-600 bg-blue-50' },
                { icon: Code2, label: 'Coding Lab', tone: 'text-violet-600 bg-violet-50' },
                { icon: CalendarDays, label: 'Timetable', tone: 'text-emerald-600 bg-emerald-50' },
              ].map(({ icon: Icon, label, tone }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3"
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="mt-2 text-[11px] font-semibold text-slate-800 sm:text-xs">{label}</p>
                  <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-slate-100" />
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-3">
                {['Operating Systems', 'Database Systems', 'Computer Networks'].map((t, i) => (
                  <div key={t} className="flex items-center gap-2 text-[11px] text-slate-700">
                    <span className={`h-1.5 w-1.5 rounded-full ${['bg-blue-500', 'bg-violet-500', 'bg-emerald-500'][i]}`} />
                    {t}
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1.5 rounded-lg border border-slate-200 bg-white p-3">
                {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-violet-400"
                    initial={{ height: 4 }}
                    animate={{ height: `${h * 0.5}px` }}
                    transition={{ duration: 0.8, delay: 1.3 + i * 0.06, ease: EASE_OUT }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* floating chips */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, ease: EASE_OUT }}
          style={{ translateZ: 60 }}
          className="absolute -left-4 top-1/3 hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl md:flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <Timer className="h-4 w-4" />
          </span>
          <span className="text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Next class</span>
            <span className="block text-xs font-bold text-slate-900">Data Structures</span>
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, ease: EASE_OUT }}
          style={{ translateZ: 80 }}
          className="absolute -right-4 top-10 hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xl md:flex"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-bold text-slate-900">Lab record done</span>
          <KanbanSquare className="h-4 w-4 text-violet-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, ease: EASE_OUT }}
          style={{ translateZ: 70 }}
          className="absolute -bottom-5 right-10 hidden items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xl md:flex"
        >
          <Sparkles className="h-3.5 w-3.5" /> Ask the AI tutor
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
