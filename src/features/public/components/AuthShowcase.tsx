import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, CalendarDays, Code2, GraduationCap, ShieldCheck } from 'lucide-react';
import { NexoraLogo } from '../../../components/brand/Nexora';
import { HeroConstellation } from '../../../components/brand/Illustrations';
import { EASE_OUT } from '../../../components/motion';

const POINTS = [
  { icon: GraduationCap, title: 'Your syllabus, your semester', text: 'Courses, notes and exam plans follow your own branch and university.' },
  { icon: Code2, title: 'Real labs in the browser', text: 'Coding, DSA, SQL and system design practice without installing anything.' },
  { icon: Bot, title: 'An AI tutor that knows your context', text: 'Answers grounded in your own notes, documents and progress.' },
  { icon: CalendarDays, title: 'Timetable, tasks and deadlines', text: 'Know what is on now, what is next and what is due.' },
];

/** Left half of the sign-in page on large screens: brand, what the platform does, rotating highlight. */
export function AuthShowcase() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const t = window.setInterval(() => setActive((a) => (a + 1) % POINTS.length), 3800);
    return () => window.clearInterval(t);
  }, []);

  return (
    <aside className="hero-brand inverse-island relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#7865F5]/25 blur-3xl animate-float" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-[#37C9E8]/15 blur-3xl animate-float [animation-delay:1.5s]" />
        <HeroConstellation className="absolute right-0 top-1/3 h-[220px] w-[420px] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255_/_0.07)_1px,transparent_1.2px)] bg-[size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="relative flex items-center gap-3">
        <NexoraLogo tone="dark" tagline="Learn Smarter. Build Faster. Achieve More." markClassName="h-11 w-11" />
      </motion.div>

      <div className="relative max-w-lg">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
          className="font-display text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl"
        >
          Everything for your degree,{' '}
          <span className="bg-gradient-to-r from-[#C7B2FB] via-[#B4A7F7] to-[#7AD8EF] bg-clip-text text-transparent">in one workspace.</span>
        </motion.h2>

        <ul className="mt-10 space-y-3">
          {POINTS.map((p, i) => {
            const Icon = p.icon;
            const on = i === active;
            return (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08, ease: EASE_OUT }}
                onMouseEnter={() => setActive(i)}
                className="relative flex gap-4 rounded-2xl p-4"
              >
                <AnimatePresence>
                  {on && (
                    <motion.span
                      layoutId="auth-point"
                      className="absolute inset-0 rounded-2xl bg-white/[0.07] ring-1 ring-inset ring-white/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? 'bg-brand-gradient' : 'bg-white/10'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="relative">
                  <span className="block text-[15px] font-semibold">{p.title}</span>
                  <span className="mt-0.5 block text-sm text-white/65">{p.text}</span>
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <p className="relative flex items-center gap-2 text-xs text-white/55">
        <ShieldCheck className="h-4 w-4 text-emerald-300" /> Your data stays yours. Nothing is shared with other students.
      </p>
    </aside>
  );
}
