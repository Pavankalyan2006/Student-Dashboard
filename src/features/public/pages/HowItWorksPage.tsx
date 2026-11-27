import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  UserPlus,
  ClipboardList,
  BrainCircuit,
  Repeat,
  TrendingUp,
  Sun,
  Coffee,
  FlaskConical,
  Moon,
  Sunset,
  Bot,
  BookOpen,
  Binary,
  Database,
  CalendarRange,
  Briefcase,
  FileSearch,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { CtaBand, Eyebrow, Faq, HeroButtons, Section, SectionHeading, SpotlightCard, reveal } from '../components/PublicKit';
import { EASE_OUT } from '../../../components/motion';
import { NexoraMark } from '../../../components/brand/Nexora';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../lib/utils';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

/* ───────────────────────────── The journey ───────────────────────────── */

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create your account',
    text: 'Sign up with your email. Your workspace is private from the first second; nobody else can open it.',
    visual: ['Name and email', 'A password only you know', 'Agree to how your data is used'],
  },
  {
    icon: ClipboardList,
    title: 'Tell it about you',
    text: 'A short, skippable onboarding: university, branch, semester, subjects, skills, projects, goals and how you like to learn.',
    visual: ['Academic profile', 'Technical skills', 'Career goals and exams', 'Learning preferences'],
  },
  {
    icon: BrainCircuit,
    title: 'Your agent gets to work',
    text: 'It builds your semester view, suggests today’s tasks from your own subjects and tunes the tutor to your level.',
    visual: ['Semester Command Center ready', 'Today’s plan from your subjects', 'Tutor set to your difficulty'],
  },
  {
    icon: Repeat,
    title: 'Learn, practise, revise',
    text: 'Study with the tutor, run labs, take quizzes. Mistakes and weak topics feed straight back into your plan and flashcards.',
    visual: ['Tutor explains a topic', 'Lab or quiz to practise it', 'Flashcards scheduled to revise it'],
  },
  {
    icon: TrendingUp,
    title: 'Grow towards your goal',
    text: 'Progress you can trust, a skill-gap view for your target role, and the projects, resume and interviews to get there.',
    visual: ['Honest progress by subject', 'Skill gap for your target role', 'Resume, interviews, applications'],
  },
];

function Journey() {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const DURATION = 5200;

  React.useEffect(() => {
    if (paused) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % STEPS.length), DURATION);
    return () => window.clearTimeout(id);
  }, [active, paused]);

  const step = STEPS[active];
  const Icon = step.icon;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <ol className="space-y-2">
        {STEPS.map((s, i) => {
          const SIcon = s.icon;
          const on = i === active;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={on ? 'step' : undefined}
                className={cn('press relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-colors', on ? 'border-blue-200 bg-white/80 shadow-[0_16px_40px_-24px_rgb(105_87_232_/_0.6)]' : 'border-transparent hover:bg-white/50')}
              >
                <div className="flex items-center gap-4">
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors', on ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-slate-500')}>
                    <SIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step {i + 1}</p>
                    <p className="font-semibold text-slate-900">{s.title}</p>
                  </div>
                </div>
                {on && (
                  <motion.span
                    key={`${active}-${paused}`}
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-0.5 bg-brand-gradient"
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? undefined : '100%' }}
                    transition={{ duration: DURATION / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <SpotlightCard className="p-7 sm:p-9">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.32, ease: EASE_OUT }} className="relative space-y-6">
            <div className="flex items-center gap-4">
              <motion.span initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 16 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg">
                <Icon className="h-7 w-7" />
              </motion.span>
              <span className="font-display text-5xl font-extrabold text-slate-200">0{active + 1}</span>
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{step.title}</h3>
            <p className="text-[15px] leading-relaxed text-slate-600">{step.text}</p>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <NexoraMark className="h-5 w-5" />
                <span className="text-xs font-semibold text-slate-500">What you see</span>
              </div>
              <ul className="space-y-2">
                {step.visual.map((v, i) => (
                  <motion.li key={v} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.1 }} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-xs">
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25 + i * 0.1, type: 'spring', stiffness: 500, damping: 20 }} className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-3 w-3" />
                    </motion.span>
                    {v}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </SpotlightCard>
    </div>
  );
}

/* ───────────────────────────── A day with NEXORA ───────────────────────────── */

const MOMENTS = [
  { at: 7.5, time: '7:30 am', icon: Sun, title: 'Morning briefing', text: 'Today’s classes from your timetable, one deadline due tomorrow, and three flashcards to warm up with.', tint: 'from-[#F5B942] to-[#F87171]' },
  { at: 11, time: '11:00 am', icon: Coffee, title: 'Doubt between lectures', text: 'A quick question about normalisation in DBMS. The doubt solver answers step by step and saves it to your notes.', tint: 'from-[#37C9E8] to-[#7865F5]' },
  { at: 14.5, time: '2:30 pm', icon: FlaskConical, title: 'Lab session', text: 'Your SQL lab record: run the queries, check the output, and let the lab assistant draft the viva questions.', tint: 'from-[#36D399] to-[#37C9E8]' },
  { at: 18.5, time: '6:30 pm', icon: Sunset, title: 'Practice hour', text: 'Two DSA problems picked from your weak topics, then a short timed quiz on this week’s OS unit.', tint: 'from-[#7865F5] to-[#9B78FF]' },
  { at: 22, time: '10:00 pm', icon: Moon, title: 'Wind down', text: 'A two-minute review: what you finished, your streak, and tomorrow’s plan already waiting.', tint: 'from-[#9B78FF] to-[#182033]' },
];

function DayScrubber() {
  const [hour, setHour] = React.useState(7.5);
  const current = [...MOMENTS].reverse().find((m) => hour >= m.at) ?? MOMENTS[0];
  const Icon = current.icon;
  const pct = ((hour - 7) / (23 - 7)) * 100;
  const night = hour >= 19;

  return (
    <div className={cn('relative overflow-hidden rounded-3xl p-6 transition-colors duration-700 sm:p-9', night ? 'hero-brand inverse-island text-white' : 'border border-slate-200/80 bg-white/70 backdrop-blur-xl')}>
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <AnimatePresence mode="wait">
          <motion.div key={current.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE_OUT }} className="space-y-4">
            <span className={cn('inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', current.tint)}>
              <Icon className="h-7 w-7" />
            </span>
            <p className={cn('font-mono text-sm', night ? 'text-white/60' : 'text-slate-500')}>{current.time}</p>
            <h3 className={cn('font-display text-2xl font-bold tracking-tight sm:text-3xl', night ? 'text-white' : 'text-slate-900')}>{current.title}</h3>
            <p className={cn('text-[15px] leading-relaxed', night ? 'text-white/75' : 'text-slate-600')}>{current.text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-5">
          <div className="relative h-24">
            {MOMENTS.map((m) => {
              const left = ((m.at - 7) / 16) * 100;
              const MIcon = m.icon;
              const on = m === current;
              return (
                <button
                  key={m.title}
                  type="button"
                  onClick={() => setHour(m.at)}
                  aria-label={`${m.time}: ${m.title}`}
                  className="absolute top-0 -translate-x-1/2"
                  style={{ left: `${left}%` }}
                >
                  <motion.span
                    animate={{ y: on ? -6 : 0, scale: on ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    className={cn('flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm', on ? cn('bg-gradient-to-br text-white', m.tint) : night ? 'bg-white/10 text-white/70' : 'bg-white text-slate-500 ring-1 ring-slate-200')}
                  >
                    <MIcon className="h-5 w-5" />
                  </motion.span>
                </button>
              );
            })}
            <div className={cn('absolute inset-x-0 bottom-3 h-1.5 rounded-full', night ? 'bg-white/10' : 'bg-slate-200')}>
              <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <input
            type="range"
            min={7}
            max={23}
            step={0.25}
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            aria-label="Time of day"
            className="w-full"
          />
          <div className={cn('flex justify-between font-mono text-xs', night ? 'text-white/50' : 'text-slate-500')}>
            <span>7 am</span>
            <span>Drag through the day</span>
            <span>11 pm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Agent routing ───────────────────────────── */

const AGENTS = [
  { id: 'tutor', label: 'Tutor', icon: Bot, x: 18, y: 22 },
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen, x: 50, y: 12 },
  { id: 'dsa', label: 'DSA', icon: Binary, x: 82, y: 22 },
  { id: 'sql', label: 'SQL', icon: Database, x: 18, y: 78 },
  { id: 'planner', label: 'Planner', icon: CalendarRange, x: 50, y: 88 },
  { id: 'career', label: 'Career', icon: Briefcase, x: 82, y: 78 },
  { id: 'docs', label: 'Documents', icon: FileSearch, x: 92, y: 50 },
] as const;
type AgentId = (typeof AGENTS)[number]['id'];

const REQUESTS: { q: string; agents: AgentId[]; result: string }[] = [
  { q: 'Explain AVL rotations with code', agents: ['tutor', 'dsa', 'syllabus'], result: 'An explanation at your level, rotation code, and the unit it belongs to in your syllabus.' },
  { q: 'Plan revision for my DBMS minor', agents: ['planner', 'syllabus', 'sql'], result: 'A day-by-day plan from your DBMS units, with SQL practice slotted before the exam.' },
  { q: 'What did my lecture PDF say about paging?', agents: ['docs', 'tutor'], result: 'An answer quoted from your own document, with the page it came from.' },
  { q: 'Am I ready for a backend internship?', agents: ['career', 'dsa', 'planner'], result: 'Your skill gap for the role, the DSA topics to strengthen, and weeks to do it in.' },
];

function AgentRouting() {
  const [r, setR] = React.useState(0);
  const req = REQUESTS[r];
  const lit = new Set<AgentId>(req.agents);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-2">
        <p className="mb-3 text-sm font-semibold text-slate-900">Pick a request</p>
        {REQUESTS.map((x, i) => (
          <button
            key={x.q}
            type="button"
            onClick={() => setR(i)}
            aria-pressed={r === i}
            className={cn('press w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors', r === i ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white/70 text-slate-700 hover:border-blue-200')}
          >
            “{x.q}”
          </button>
        ))}
        <AnimatePresence mode="wait">
          <motion.div key={r} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> You get
            </span>
            {req.result}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hero-brand inverse-island relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[16/11]">
        <div aria-hidden="true" className="neural-backdrop absolute inset-0 opacity-40" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {AGENTS.map((a) => {
            const on = lit.has(a.id);
            return (
              <motion.line
                key={a.id}
                x1={50}
                y1={50}
                x2={a.x}
                y2={a.y}
                stroke={on ? 'url(#route)' : 'rgb(255 255 255 / 0.12)'}
                strokeWidth={on ? 0.7 : 0.3}
                strokeDasharray={on ? '2 1.5' : '0'}
                vectorEffect="non-scaling-stroke"
                animate={on ? { strokeDashoffset: [0, -7] } : { strokeDashoffset: 0 }}
                transition={on ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
                style={{ strokeWidth: on ? 2.2 : 1 }}
              />
            );
          })}
          <defs>
            <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9B78FF" />
              <stop offset="100%" stopColor="#37C9E8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-1.5">
            <NexoraMark className="h-14 w-14 sm:h-16 sm:w-16" />
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/15">Your agent</span>
          </motion.div>
        </div>
        {AGENTS.map((a) => {
          const AIcon = a.icon;
          const on = lit.has(a.id);
          return (
            <motion.div
              key={a.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${a.x}%`, top: `${a.y}%` }}
              animate={{ scale: on ? 1.1 : 0.92, opacity: on ? 1 : 0.5 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11', on ? 'bg-brand-gradient text-white shadow-[0_0_24px_rgb(155_120_255_/_0.7)]' : 'bg-white/10 text-white/70 ring-1 ring-white/15')}>
                  <AIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="text-[10px] font-semibold text-white/80 sm:text-[11px]">{a.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────── Spaced repetition ───────────────────────────── */

const RATINGS = [
  { id: 'again', label: 'Again', factor: 0, tone: 'border-red-200 bg-red-50 text-red-700' },
  { id: 'hard', label: 'Hard', factor: 1.2, tone: 'border-amber-200 bg-amber-50 text-amber-700' },
  { id: 'good', label: 'Good', factor: 2.5, tone: 'border-blue-200 bg-blue-50 text-blue-700' },
  { id: 'easy', label: 'Easy', factor: 3.2, tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
] as const;

function FlashcardDemo() {
  const [flipped, setFlipped] = React.useState(false);
  const [interval, setIntervalDays] = React.useState(1);
  const [history, setHistory] = React.useState<{ label: string; days: number }[]>([]);

  const rate = (factor: number, label: string) => {
    // Simplified spaced repetition: "Again" resets to tomorrow, otherwise the gap grows by the rating's factor.
    const next = factor === 0 ? 1 : Math.max(1, Math.round(interval * factor));
    setIntervalDays(next);
    setHistory((h) => [...h, { label, days: next }].slice(-6));
    setFlipped(false);
  };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className="[perspective:1200px]">
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Show question' : 'Show answer'}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          className="relative h-64 w-full [transform-style:preserve-3d] sm:h-72"
        >
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-xl [backface-visibility:hidden]">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Operating Systems · Question</span>
            <span className="font-display text-xl font-bold text-slate-900 sm:text-2xl">What are the four conditions for deadlock?</span>
            <span className="text-xs text-slate-500">Tap to flip</span>
          </span>
          <span className="hero-brand inverse-island absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7AD8EF]">Answer</span>
            <span className="text-lg font-semibold leading-relaxed">Mutual exclusion, hold and wait, no preemption, circular wait.</span>
            <span className="text-xs text-white/60">How well did you remember it?</span>
          </span>
        </motion.button>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button key={r.id} type="button" disabled={!flipped} onClick={() => rate(r.factor, r.label)} className={cn('press rounded-xl border py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40', r.tone)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <SectionHeading align="left" eyebrow="Revision that sticks" title="It brings cards back" accent="right before you forget." description="Flip the card, rate how well you knew it, and watch the next review move. Remembered cards come back less often; tricky ones come back tomorrow." />
        <SpotlightCard className="p-5">
          <div className="relative flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Next review</span>
            <motion.span key={interval} initial={{ scale: 1.3, color: '#6957E8' }} animate={{ scale: 1 }} className="font-display text-2xl font-bold tabular-nums text-slate-900">
              in {interval} {interval === 1 ? 'day' : 'days'}
            </motion.span>
          </div>
          <div className="relative mt-4 flex min-h-[44px] flex-wrap items-end gap-2">
            {history.length === 0 && <p className="text-xs text-slate-500">Your ratings will appear here.</p>}
            {history.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1">
                <span className="w-10 rounded-t-md bg-brand-gradient" style={{ height: Math.min(80, 8 + h.days * 3) }} />
                <span className="text-[10px] text-slate-500">{h.label}</span>
              </motion.div>
            ))}
          </div>
          {history.length > 0 && (
            <button type="button" onClick={() => { setHistory([]); setIntervalDays(1); }} className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800">
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </SpotlightCard>
        <p className="text-xs text-slate-500">A simplified version of the scheduling the Flashcards module uses.</p>
      </div>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

const FAQ = [
  { q: 'How long does setup take?', a: 'A few minutes. Only the account, academic profile, career goal and learning preferences are needed; skills and projects can be skipped and added later. Progress is saved after every step.' },
  { q: 'What if my subjects change next semester?', a: 'Update your semester and subjects in the Semester Command Center. Plans, the tutor and practice suggestions follow the change.' },
  { q: 'Does the AI work without my profile?', a: 'Yes, but answers are generic. With personalisation on, the tutor knows your branch, subjects, level and weak topics, so explanations and practice fit you.' },
  { q: 'Can I use it on my phone?', a: 'Yes. The whole workspace is responsive, including the AI chat, notes, flashcards and planner. Coding labs are most comfortable on a laptop.' },
];

export function HowItWorksPage({ onNavigate }: HowItWorksPageProps) {
  const { isAuthenticated } = useAuth();
  const start = () => onNavigate(isAuthenticated ? '/dashboard' : '/register');

  return (
    <PublicLayout currentPath="/how-it-works" onNavigate={onNavigate} backdrop="how">
      <section className="relative mx-auto max-w-5xl px-4 pb-6 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
          <Eyebrow>How it works</Eyebrow>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT }}
          className="mt-6 text-balance font-display text-[40px] font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
        >
          From sign-up to <span className="text-gradient">sign-off,</span> one loop.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }} className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600">
          Tell NEXORA who you are once. After that, every lesson, lab, quiz and plan makes the next one smarter. Here is what happens, step by step.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="mt-8 flex justify-center">
          <HeroButtons primary={{ label: isAuthenticated ? 'Open my workspace' : 'Start free', onClick: start }} secondary={{ label: 'Why NEXORA', onClick: () => onNavigate('/about') }} />
        </motion.div>
      </section>

      <Section>
        <SectionHeading eyebrow="The journey" title="Five steps," accent="then it just flows." description="It plays on its own. Hover to pause, or pick any step." />
        <motion.div {...reveal}>
          <Journey />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="A day with NEXORA" title="What a normal day" accent="looks like." description="Drag the slider or tap a moment." />
        <motion.div {...reveal}>
          <DayScrubber />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="Under the hood" title="One agent," accent="many specialists." description="Your agent hands each request to the specialists it needs, then answers from your own data. Pick a request to see who joins in." />
        <motion.div {...reveal}>
          <AgentRouting />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <motion.div {...reveal}>
          <FlashcardDemo />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="Questions" title="Before you start" />
        <motion.div {...reveal}>
          <Faq items={FAQ} />
        </motion.div>
      </Section>

      <CtaBand
        title="Start the loop today."
        text="Create your account, tell your agent about your semester, and your first plan is ready."
        primary={{ label: isAuthenticated ? 'Open my workspace' : 'Create my account', onClick: start }}
        secondary={{ label: 'Back to home', onClick: () => onNavigate('/') }}
      />
    </PublicLayout>
  );
}
