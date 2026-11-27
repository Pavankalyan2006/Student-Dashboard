import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Code2,
  CalendarRange,
  Briefcase,
  Microscope,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Check,
  Bot,
  Layers,
  Binary,
  Database,
  Target,
  GraduationCap,
  Rocket,
  FlaskConical,
  Trophy,
  Brain,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { CtaBand, Eyebrow, Faq, HeroButtons, Section, SectionHeading, SpotlightCard, reveal } from '../components/PublicKit';
import { AnimatedNumber, EASE_OUT } from '../../../components/motion';
import { NexoraMark, AiThinking } from '../../../components/brand/Nexora';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../lib/utils';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

/* ───────────────────────────── Hero: try asking ───────────────────────────── */

const ROTATING = ['studies with you', 'codes with you', 'plans your semester', 'preps your placements'];

const SAMPLE_QUESTIONS = [
  {
    q: 'Explain deadlock in OS like I have an exam tomorrow',
    a: 'Four conditions must all hold: mutual exclusion, hold and wait, no preemption and circular wait. Break any one and deadlock is impossible. For your exam, learn one prevention trick per condition, then practise the Banker’s algorithm on a 3-process table.',
  },
  {
    q: 'Why is my binary search stuck in an infinite loop?',
    a: 'You probably update with lo = mid instead of lo = mid + 1. When lo and hi are next to each other, mid equals lo and nothing moves. Use mid = lo + (hi - lo) / 2 and always shrink the range past mid.',
  },
  {
    q: 'Plan my week: DBMS minor on Friday, two labs pending',
    a: 'Mon: normalisation (1NF to BCNF) and 10 flashcards. Tue: finish the SQL lab record. Wed: transactions and ACID with one past paper. Thu: OS lab and a timed DBMS quiz. Fri morning: review your mistake notebook only.',
  },
];

function useTypewriter(text: string, speed = 14) {
  const [out, setOut] = React.useState('');
  React.useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setOut(text);
      return;
    }
    setOut('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return out;
}

function AskDemo() {
  const [active, setActive] = React.useState(0);
  const [thinking, setThinking] = React.useState(false);
  const [shown, setShown] = React.useState(0);
  const answer = useTypewriter(thinking ? '' : SAMPLE_QUESTIONS[shown].a);

  const pick = (i: number) => {
    setActive(i);
    setThinking(true);
    window.setTimeout(() => {
      setShown(i);
      setThinking(false);
    }, 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT }}
      className="gradient-border relative min-w-0 rounded-[1.75rem] bg-white/80 p-5 shadow-[0_40px_90px_-40px_rgb(105_87_232_/_0.6)] backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <NexoraMark className="h-8 w-8" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Your NEXORA agent</p>
            <p className="text-[11px] text-slate-500">Try a question below</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-200">
          Example
        </span>
      </div>

      <div className="mt-5 space-y-2" role="tablist" aria-label="Example questions">
        {SAMPLE_QUESTIONS.map((s, i) => (
          <button
            key={s.q}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => pick(i)}
            className={cn(
              'press w-full rounded-2xl border px-4 py-2.5 text-left text-[13px] font-medium transition-colors',
              active === i
                ? 'border-blue-300 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-white/70 text-slate-700 hover:border-blue-200 hover:bg-white'
            )}
          >
            {s.q}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[148px] rounded-2xl border border-slate-200 bg-slate-50/80 p-4" aria-live="polite">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-violet-600">
          <Sparkles className="h-3.5 w-3.5" /> NEXORA
        </div>
        {thinking ? (
          <AiThinking />
        ) : (
          <p className="text-[13.5px] leading-relaxed text-slate-700">
            {answer}
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-violet-500" aria-hidden="true" />
          </p>
        )}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Inside the app, answers use your own syllabus, notes and progress.</p>
    </motion.div>
  );
}

function RotatingWord() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % ROTATING.length), 2600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="relative inline-grid min-h-[2.1em] sm:min-h-0">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING[i]}
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="text-gradient sm:whitespace-nowrap"
        >
          {ROTATING[i]}.
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ───────────────────────────── Module explorer ───────────────────────────── */

const MODULES = [
  {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    title: 'Understand it, then remember it',
    text: 'An AI tutor that explains at your level, notes it can summarise, PDFs you can question, and flashcards that come back exactly when you are about to forget.',
    points: ['AI Tutor with beginner to advanced modes', 'Document Q&A with page references', 'Spaced-repetition flashcards', 'Doubt solver for text, code and maths'],
    tint: 'from-[#7865F5] to-[#9B78FF]',
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: Code2,
    title: 'Labs that run in your browser',
    text: 'Write and run code, step through algorithms, query real tables and train small models, with nothing to install and an assistant that explains what went wrong.',
    points: ['Coding Lab and sandbox', 'DSA Lab with 150 curated problems', 'SQL Lab with sample databases', 'AI/ML and System Design labs'],
    tint: 'from-[#37C9E8] to-[#7865F5]',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: CalendarRange,
    title: 'Your semester, under control',
    text: 'Subjects, units, slip tests, minors and end-sems in one command center. The planner turns them into a realistic week that fits the hours you actually have.',
    points: ['Semester Command Center', 'Study planner and timetable', 'Deadlines and task board', 'Grades, CGPA and attendance'],
    tint: 'from-[#36D399] to-[#37C9E8]',
  },
  {
    id: 'career',
    label: 'Career',
    icon: Briefcase,
    title: 'From first resume to first offer',
    text: 'See the gap between where you are and the role you want, then close it: mock interviews, an ATS-aware resume builder and a tracker for every application.',
    points: ['Skill-gap analysis and roadmaps', 'AI mock interviews', 'Resume builder with ATS checks', 'Internship and placement tracker'],
    tint: 'from-[#F5B942] to-[#F87171]',
  },
  {
    id: 'research',
    label: 'Build',
    icon: Microscope,
    title: 'Projects and research, documented',
    text: 'Plan milestones, connect GitHub, keep a paper library with citations, and write literature reviews with an assistant that cites its sources.',
    points: ['Project workspace with milestones', 'GitHub workspace', 'Research library and citations', 'Personal knowledge base'],
    tint: 'from-[#9B78FF] to-[#37C9E8]',
  },
] as const;

function ModuleExplorer({ onOpen }: { onOpen: () => void }) {
  const [active, setActive] = React.useState(0);
  const m = MODULES[active];
  const Icon = m.icon;
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div role="tablist" aria-label="Platform areas" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {MODULES.map((mod, i) => {
          const MIcon = mod.icon;
          const on = i === active;
          return (
            <button
              key={mod.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'press relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors',
                on ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {on && (
                <motion.span
                  layoutId="module-tab"
                  className="absolute inset-0 rounded-2xl border border-blue-200 bg-white/80 shadow-[0_12px_30px_-18px_rgb(105_87_232_/_0.6)] backdrop-blur"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className={cn('relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white', mod.tint)}>
                <MIcon className="h-4.5 w-4.5" />
              </span>
              <span className="relative text-[15px] font-semibold">{mod.label}</span>
            </button>
          );
        })}
      </div>

      <SpotlightCard className="min-h-[360px] p-7 sm:p-9">
        <AnimatePresence mode="wait">
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center"
          >
            <div className="space-y-4">
              <span className={cn('inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', m.tint)}>
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{m.title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{m.text}</p>
              <button type="button" onClick={onOpen} className="press inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800">
                Open it in your workspace →
              </button>
            </div>
            <ul className="space-y-2.5">
              {m.points.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.35, ease: EASE_OUT }}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-800"
                >
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white', m.tint)}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </SpotlightCard>
    </div>
  );
}

/* ───────────────────────────── Live lab: binary search ───────────────────────────── */

const ARRAY = [3, 8, 11, 15, 19, 24, 27, 31, 36, 42, 47, 53, 58, 64, 71];

type BsStep = { lo: number; hi: number; mid: number; note: string; found?: boolean };

function binarySearchSteps(target: number): BsStep[] {
  const steps: BsStep[] = [];
  let lo = 0;
  let hi = ARRAY.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (ARRAY[mid] === target) {
      steps.push({ lo, hi, mid, note: `a[${mid}] = ${ARRAY[mid]} equals ${target}. Found in ${steps.length + 1} steps.`, found: true });
      return steps;
    }
    if (ARRAY[mid] < target) {
      steps.push({ lo, hi, mid, note: `a[${mid}] = ${ARRAY[mid]} < ${target}, so search the right half.` });
      lo = mid + 1;
    } else {
      steps.push({ lo, hi, mid, note: `a[${mid}] = ${ARRAY[mid]} > ${target}, so search the left half.` });
      hi = mid - 1;
    }
  }
  steps.push({ lo, hi, mid: -1, note: `The range is empty: ${target} is not in the array (${steps.length} comparisons).` });
  return steps;
}

function BinarySearchLab() {
  const [target, setTarget] = React.useState(42);
  const steps = React.useMemo(() => binarySearchSteps(target), [target]);
  const [i, setI] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const s = steps[Math.min(i, steps.length - 1)];
  const done = i >= steps.length - 1;

  React.useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [target]);

  React.useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setI((x) => x + 1), 900);
    return () => window.clearTimeout(id);
  }, [playing, i, done]);

  return (
    <SpotlightCard className="p-6 sm:p-8">
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#37C9E8] to-[#7865F5] text-white">
            <Binary className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">Binary search, step by step</p>
            <p className="text-xs text-slate-500">A tiny piece of the DSA Lab, running right here</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Find
          <select
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm font-semibold text-slate-900"
          >
            {[...ARRAY, 50, 2].sort((a, b) => a - b).map((n) => (
              <option key={n} value={n}>
                {n}
                {ARRAY.includes(n) ? '' : ' (missing)'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative mt-7 grid grid-cols-5 gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
        {ARRAY.map((n, idx) => {
          const inRange = s.mid !== -1 ? idx >= s.lo && idx <= s.hi : false;
          const isMid = idx === s.mid;
          const found = isMid && s.found;
          return (
            <motion.div
              key={n}
              layout
              animate={{ scale: isMid ? 1.08 : 1, opacity: inRange || isMid ? 1 : 0.35 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={cn(
                'flex flex-col items-center rounded-xl border py-2.5 font-mono text-sm font-semibold',
                found
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : isMid
                    ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-[0_8px_20px_-10px_rgb(105_87_232_/_0.8)]'
                    : 'border-slate-200 bg-white/80 text-slate-700'
              )}
            >
              {n}
              <span className="mt-0.5 text-[9px] font-medium text-slate-400">{idx}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="min-h-[2.5rem] max-w-xl text-sm text-slate-700" aria-live="polite">
          <span className="mr-2 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
            step {Math.min(i + 1, steps.length)}/{steps.length}
          </span>
          {s.note}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPlaying((p) => !p)} disabled={done} className="press inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? 'Pause' : 'Run'}
          </button>
          <button type="button" onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={done} aria-label="Next step" className="press rounded-xl border border-slate-300 bg-white p-2 text-slate-700 disabled:opacity-40">
            <StepForward className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { setI(0); setPlaying(false); }} aria-label="Reset" className="press rounded-xl border border-slate-300 bg-white p-2 text-slate-700">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}

/* ───────────────────────────── Make it yours ───────────────────────────── */

const GOALS = [
  { id: 'placements', label: 'Placements', icon: Briefcase },
  { id: 'gate', label: 'GATE', icon: GraduationCap },
  { id: 'higher', label: 'Higher studies', icon: Brain },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'startup', label: 'Build a startup', icon: Rocket },
  { id: 'cgpa', label: 'Top CGPA', icon: Trophy },
] as const;
type GoalId = (typeof GOALS)[number]['id'];

const YEAR_BASE: Record<number, string[]> = {
  1: ['Programming fundamentals in the Coding Lab', 'Maths and physics with the AI Tutor', 'A first habit: 20 flashcards a day'],
  2: ['Data structures in the DSA Lab', 'DBMS practice in the SQL Lab', 'A semester plan around your minors'],
  3: ['Core CS revision: OS, CN and DBMS', 'Your first real project with milestones', 'Internship applications in the tracker'],
  4: ['Final-year project and report', 'Placement drives and mock interviews', 'Resume polished against target roles'],
};
const GOAL_ADD: Record<GoalId, string> = {
  placements: 'Weekly DSA sets and one mock interview',
  gate: 'GATE syllabus mapped to your subjects, with timed tests',
  higher: 'Research reading list and SOP-ready project notes',
  research: 'Paper library and a literature-review workspace',
  startup: 'System design lab and a shipped side project on GitHub',
  cgpa: 'Unit-wise revision plan before every slip test',
};

function Personalizer({ onStart }: { onStart: () => void }) {
  const [year, setYear] = React.useState(2);
  const [goals, setGoals] = React.useState<GoalId[]>(['placements']);
  const toggle = (g: GoalId) => setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g].slice(-3)));
  const plan = [...YEAR_BASE[year], ...goals.map((g) => GOAL_ADD[g])];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SpotlightCard className="space-y-7 p-7 sm:p-8">
        <div className="relative space-y-3">
          <p className="text-sm font-semibold text-slate-900">Which year are you in?</p>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Year of study">
            {[1, 2, 3, 4].map((y) => (
              <button
                key={y}
                type="button"
                role="radio"
                aria-checked={year === y}
                onClick={() => setYear(y)}
                className={cn(
                  'press relative rounded-2xl border py-3 text-sm font-semibold transition-colors',
                  year === y ? 'border-transparent text-white' : 'border-slate-200 bg-white/80 text-slate-700 hover:border-blue-200'
                )}
              >
                {year === y && <motion.span layoutId="year-pill" className="absolute inset-0 rounded-2xl bg-brand-gradient" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                <span className="relative">Year {y}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            What are you aiming for? <span className="font-normal text-slate-500">Pick up to three</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => {
              const on = goals.includes(g.id);
              const GIcon = g.icon;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(g.id)}
                  className={cn(
                    'press inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
                    on ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white/80 text-slate-700 hover:border-blue-200'
                  )}
                >
                  <GIcon className="h-4 w-4" />
                  {g.label}
                  {on && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </SpotlightCard>

      <div className="hero-brand inverse-island relative overflow-hidden rounded-3xl p-7 text-white sm:p-8">
        <div aria-hidden="true" className="neural-backdrop pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <Target className="h-4 w-4 text-[#7AD8EF]" /> Your first weeks would focus on
            </p>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">Preview</span>
          </div>
          <ul className="mt-5 space-y-2.5">
            <AnimatePresence initial={false} mode="popLayout">
              {plan.map((p, idx) => (
                <motion.li
                  key={p}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.03, ease: EASE_OUT }}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm ring-1 ring-inset ring-white/10"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold">{idx + 1}</span>
                  {p}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <button type="button" onClick={onStart} className="press mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#182033] hover:bg-[#F3F1FE]">
            Build my real plan →
          </button>
          <p className="mt-3 text-xs text-white/55">Your actual plan comes from your own syllabus and exam dates after onboarding.</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

const FACTS = [
  { value: 150, suffix: '', label: 'curated DSA problems', icon: Binary },
  { value: 100, suffix: '+', label: 'courses in the catalog', icon: Layers },
  { value: 38, suffix: '', label: 'specialist AI agents', icon: Bot },
  { value: 30, suffix: '+', label: 'tools in one workspace', icon: Database },
];

const FAQ = [
  { q: 'Who is NEXORA AI for?', a: 'B.Tech students. Everything is built around a student’s own semester, subjects, labs and career goals. There are no faculty dashboards and no one else sees your workspace.' },
  { q: 'Does the AI just give me answers?', a: 'It explains first. The tutor works at your chosen level, shows its steps, asks follow-up questions and can turn any explanation into notes, flashcards or a quiz so you actually keep it.' },
  { q: 'Do I need to install anything for the labs?', a: 'No. Code, SQL and many Python experiments run in the browser, so you can practise on any laptop, including the one in the college lab.' },
  { q: 'How does it know my syllabus?', a: 'You tell it during onboarding: university, branch, semester and subjects. You can add or change subjects any time from the Semester Command Center.' },
  { q: 'What happens to my data?', a: 'Your profile and activity are used only to personalise your own workspace. You can see what the assistant knows about you, switch personalisation off, and edit or clear its memory.' },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const { isAuthenticated } = useAuth();
  const start = () => onNavigate(isAuthenticated ? '/dashboard' : '/register');

  return (
    <PublicLayout currentPath="/" onNavigate={onNavigate} backdrop="home">
      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="min-w-0 space-y-7">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
            <Eyebrow>The AI learning companion for B.Tech</Eyebrow>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT }}
            className="text-balance font-display text-[38px] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-[68px]"
          >
            An AI that <br className="hidden sm:block" />
            <RotatingWord />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
            className="max-w-xl text-pretty text-lg leading-relaxed text-slate-600"
          >
            NEXORA AI gives every student a personal agent that learns your syllabus, your strengths and your goals, then helps you study,
            practise, plan and get placed from one calm workspace.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT }}>
            <HeroButtons
              primary={{ label: isAuthenticated ? 'Open my workspace' : 'Start free', onClick: start }}
              secondary={{ label: 'See how it works', onClick: () => onNavigate('/how-it-works') }}
            />
          </motion.div>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600"
          >
            {['Built for your branch', 'Labs in the browser', 'Private by default'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </motion.ul>
        </div>
        <AskDemo />
      </section>

      {/* Facts */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...reveal} className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200/80 bg-white/60 p-3 backdrop-blur-xl lg:grid-cols-4">
          {FACTS.map((f) => {
            const FIcon = f.icon;
            return (
              <div key={f.label} className="group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-white/80">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 ring-1 ring-inset ring-blue-100 transition-transform group-hover:-rotate-6 group-hover:scale-110">
                  <FIcon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                    <AnimatedNumber value={`${f.value}${f.suffix}`} />
                  </div>
                  <div className="text-xs text-slate-500 sm:text-sm">{f.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="One workspace"
          title="Everything your degree asks of you,"
          accent="in one place."
          description="Five areas, one agent that connects them. Hover or tap to look inside."
        />
        <ModuleExplorer onOpen={start} />
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading
          eyebrow="Try it now"
          title="Practise, don’t just read."
          accent="Run a lab here."
          description="Pick a number and run the search. Every lab in NEXORA works like this: you act, it shows you exactly what happened."
        />
        <motion.div {...reveal}>
          <BinarySearchLab />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading
          eyebrow="Make it yours"
          title="No two students get"
          accent="the same workspace."
          description="Choose your year and goals to preview where your agent would start."
        />
        <motion.div {...reveal}>
          <Personalizer onStart={start} />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="Questions" title="Good to know" />
        <motion.div {...reveal}>
          <Faq items={FAQ} />
        </motion.div>
      </Section>

      <CtaBand
        title="Learn smarter. Build faster. Achieve more."
        text="Set up your workspace in a few minutes. Your agent starts learning about you from the first step."
        primary={{ label: isAuthenticated ? 'Open my workspace' : 'Create my account', onClick: start }}
        secondary={{ label: 'Read our story', onClick: () => onNavigate('/about') }}
      />
    </PublicLayout>
  );
}
