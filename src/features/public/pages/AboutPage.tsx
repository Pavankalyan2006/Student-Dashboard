import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Compass,
  Eye,
  HeartHandshake,
  Lock,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  MoveHorizontal,
  FileText,
  MessageSquare,
  Youtube,
  FolderOpen,
  Calendar,
  Code2,
  LayoutDashboard,
  Check,
  X as XIcon,
} from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { CtaBand, Eyebrow, HeroButtons, Section, SectionHeading, SpotlightCard, reveal } from '../components/PublicKit';
import { EASE_OUT } from '../../../components/motion';
import { NexoraMark } from '../../../components/brand/Nexora';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../lib/utils';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

/* ───────────────────────────── The name ───────────────────────────── */

const NAME_PARTS = [
  {
    part: 'NEX',
    word: 'Nexus',
    text: 'The point where everything connects. Your subjects, labs, notes, plans and goals stop living in separate apps and start informing each other.',
  },
  {
    part: 'ORA',
    word: 'Aura',
    text: 'A steady presence around your work. An agent that remembers what you are studying, notices where you struggle and nudges you at the right time.',
  },
];

function NameExplainer() {
  const [active, setActive] = React.useState(0);
  return (
    <SpotlightCard className="p-7 sm:p-10">
      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex items-baseline justify-center gap-1 font-display text-6xl font-extrabold tracking-[0.06em] sm:text-7xl lg:text-8xl">
          {NAME_PARTS.map((p, i) => (
            <button
              key={p.part}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={cn('relative rounded-2xl px-1 transition-colors duration-300', active === i ? 'text-gradient' : 'text-slate-300')}
            >
              {p.part}
              {active === i && (
                <motion.span layoutId="name-underline" className="absolute -bottom-2 left-2 right-2 h-1 rounded-full bg-brand-gradient" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              {NAME_PARTS[active].part} · from “{NAME_PARTS[active].word}”
            </p>
            <h3 className="font-display text-3xl font-bold tracking-tight text-slate-900">{NAME_PARTS[active].word}</h3>
            <p className="text-[15px] leading-relaxed text-slate-600">{NAME_PARTS[active].text}</p>
            <p className="text-sm text-slate-500">Hover or tap the other half of the name.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
}

/* ───────────────────────────── Before / after ───────────────────────────── */

const BEFORE = [
  { icon: FileText, label: 'Syllabus PDF in an email from first week' },
  { icon: Youtube, label: 'Eleven open video tabs for one topic' },
  { icon: MessageSquare, label: 'Past papers buried in a group chat' },
  { icon: FolderOpen, label: 'Lab code in a folder called “final_final2”' },
  { icon: Calendar, label: 'Exam dates on a photo of the notice board' },
];
const AFTER = [
  { icon: LayoutDashboard, label: 'Subjects and units tracked in one command center' },
  { icon: Sparkles, label: 'A tutor that explains the topic at your level' },
  { icon: FileText, label: 'Past papers turned into timed practice' },
  { icon: Code2, label: 'Lab code saved, versioned and explained' },
  { icon: Calendar, label: 'Exams in a plan that fits your week' },
];

function BeforeAfter() {
  const [pos, setPos] = React.useState(50);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/60 backdrop-blur-xl">
      <div className="grid min-h-[380px] grid-cols-1">
        {/* After (base layer) */}
        <div className="hero-brand inverse-island col-start-1 row-start-1 p-7 text-white sm:p-10">
          <div className="ml-auto max-w-md space-y-4 text-right sm:text-left md:ml-[52%] md:max-w-none">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7AD8EF] md:justify-start">
              <NexoraMark className="h-5 w-5" /> With NEXORA
            </p>
            <ul className="space-y-2.5">
              {AFTER.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.label} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-2.5 text-sm ring-1 ring-inset ring-white/10">
                    <Icon className="h-4 w-4 shrink-0 text-[#B4A7F7]" /> {a.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        {/* Before (clipped layer) */}
        <div
          className="col-start-1 row-start-1 bg-[var(--surface-1)] p-7 sm:p-10"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          aria-hidden={pos < 5}
        >
          <div className="max-w-md space-y-4 md:max-w-[46%]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">A normal week before</p>
            <ul className="space-y-2.5">
              {BEFORE.map((b, i) => {
                const Icon = b.icon;
                return (
                  <li
                    key={b.label}
                    className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-600"
                    style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)` }}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" /> {b.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      {/* Handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-brand-gradient" />
        <div className="absolute top-1/2 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6957E8] shadow-xl ring-1 ring-slate-200">
          <MoveHorizontal className="h-5 w-5" />
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare a week before and with NEXORA"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

/* ───────────────────────────── Principles ───────────────────────────── */

const PRINCIPLES = [
  {
    icon: Lightbulb,
    title: 'Explain, don’t just answer',
    short: 'Understanding beats a copied answer.',
    long: 'The tutor shows its reasoning, checks what you already know and offers practice afterwards. Getting the answer is the start of learning, not the end of it.',
  },
  {
    icon: Eye,
    title: 'Honest numbers only',
    short: 'Every metric comes from your real activity.',
    long: 'Progress, streaks and readiness are counted from what you actually did. When there is no data yet, you see an empty state, never a made-up score or a ranking against classmates.',
  },
  {
    icon: Lock,
    title: 'Yours, and only yours',
    short: 'Private by default, student-only by design.',
    long: 'There are no faculty dashboards and no public profiles unless you publish one. You can see what the assistant knows about you, switch personalisation off and clear its memory.',
  },
  {
    icon: HeartHandshake,
    title: 'Calm over noisy',
    short: 'Built for long study sessions.',
    long: 'Soft colours, a dark theme, few interruptions and motion that respects your system settings. Reminders arrive when they help, not to drive engagement.',
  },
];

function Principles() {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PRINCIPLES.map((p, i) => {
        const Icon = p.icon;
        const isOpen = open === i;
        return (
          <SpotlightCard
            key={p.title}
            as="button"
            type="button"
            onClick={() => setOpen(isOpen ? null : i)}
            aria-expanded={isOpen}
            className="press p-6 text-left sm:p-7"
          >
            <div className="relative flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600 ring-1 ring-inset ring-blue-100 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-slate-900">{p.title}</h3>
                  <ChevronRight className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', isOpen && 'rotate-90 text-blue-600')} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{p.short}</p>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                      className="overflow-hidden pt-3 text-sm leading-relaxed text-slate-700"
                    >
                      {p.long}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}

/* ───────────────────────────── Four years ───────────────────────────── */

const YEARS = [
  {
    title: 'First year: find your footing',
    focus: 'Foundations',
    items: ['Programming basics with instant feedback', 'Maths and physics explained step by step', 'A first study routine that sticks'],
    color: 'from-[#37C9E8] to-[#7865F5]',
  },
  {
    title: 'Second year: go deep on the core',
    focus: 'Core CS',
    items: ['Data structures with visual step-throughs', 'DBMS and SQL on real tables', 'Semester plans built around every minor exam'],
    color: 'from-[#7865F5] to-[#9B78FF]',
  },
  {
    title: 'Third year: build and apply',
    focus: 'Projects and internships',
    items: ['Projects with milestones and GitHub', 'Interview practice that gives feedback', 'An internship tracker for every application'],
    color: 'from-[#9B78FF] to-[#F5B942]',
  },
  {
    title: 'Final year: launch',
    focus: 'Placements and beyond',
    items: ['Placement drives, mock rounds and an ATS-ready resume', 'GATE or higher-studies preparation if you choose it', 'A final-year project you can explain with confidence'],
    color: 'from-[#F5B942] to-[#36D399]',
  },
];

function FourYears() {
  const [y, setY] = React.useState(0);
  const year = YEARS[y];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="relative">
        <div aria-hidden="true" className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-slate-200" />
        <motion.div
          aria-hidden="true"
          className="absolute left-[27px] top-6 w-0.5 bg-brand-gradient"
          animate={{ height: `${(y / (YEARS.length - 1)) * 100}%` }}
          style={{ maxHeight: 'calc(100% - 3rem)' }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        <ol className="relative space-y-3">
          {YEARS.map((yr, i) => (
            <li key={yr.title}>
              <button
                type="button"
                onClick={() => setY(i)}
                aria-current={y === i ? 'step' : undefined}
                className={cn('press flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors', y === i ? 'bg-white/80 shadow-sm ring-1 ring-blue-200' : 'hover:bg-white/50')}
              >
                <span
                  className={cn(
                    'relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-[var(--surface-0)]',
                    i <= y ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Year {i + 1}</span>
                  <span className="block font-semibold text-slate-900">{yr.focus}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <SpotlightCard className="p-7 sm:p-9">
        <AnimatePresence mode="wait">
          <motion.div key={y} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE_OUT }} className="relative space-y-5">
            <span className={cn('inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white', year.color)}>{year.focus}</span>
            <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{year.title}</h3>
            <ul className="space-y-3">
              {year.items.map((it, i) => (
                <motion.li key={it} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white', year.color)}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {it}
                </motion.li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <button type="button" disabled={y === 0} onClick={() => setY(y - 1)} className="press rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">
                Previous year
              </button>
              <button type="button" disabled={y === YEARS.length - 1} onClick={() => setY(y + 1)} className="press rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                Next year
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </SpotlightCard>
    </div>
  );
}

/* ───────────────────────────── Privacy controls ───────────────────────────── */

const CONTROLS = [
  { id: 'personal', label: 'Personalised answers', on: 'Answers use your profile, subjects and progress.', off: 'Answers receive nothing about you.' },
  { id: 'activity', label: 'Learn from recent activity', on: 'Your agent notices weak topics from quizzes and labs.', off: 'Your agent ignores your recent activity.' },
  { id: 'memory', label: 'Remember what I tell it', on: 'Things you ask it to remember are kept, and you can delete them.', off: 'Nothing new is remembered between chats.' },
];

function PrivacyPlayground() {
  const [state, setState] = React.useState<Record<string, boolean>>({ personal: true, activity: true, memory: true });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Eyebrow>Privacy you can see</Eyebrow>
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-[40px] sm:leading-[1.12]">
          You decide what your agent <span className="text-gradient">knows.</span>
        </h2>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          These are the same switches you get in the app’s AI Memory page. Flip them to see what changes. Your name, email, college and marks are never sent to the AI.
        </p>
        <ul className="space-y-2 text-sm text-slate-700">
          {['No faculty or admin view of your workspace', 'Export or clear what your agent knows at any time', 'Your public portfolio exists only if you publish it'].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <SpotlightCard className="space-y-3 p-5 sm:p-6">
        {CONTROLS.map((c) => {
          const on = state[c.id];
          return (
            <div key={c.id} className="relative flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{c.label}</p>
                <AnimatePresence mode="wait">
                  <motion.p key={String(on)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className={cn('mt-1 text-[13px]', on ? 'text-slate-600' : 'text-amber-700')}>
                    {on ? c.on : c.off}
                  </motion.p>
                </AnimatePresence>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={c.label}
                onClick={() => setState((s) => ({ ...s, [c.id]: !s[c.id] }))}
                className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-brand-gradient' : 'bg-slate-300')}
              >
                <motion.span
                  className="absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow"
                  animate={{ left: on ? 24 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                >
                  {on ? <Check className="h-3 w-3 text-[#6957E8]" /> : <XIcon className="h-3 w-3 text-slate-400" />}
                </motion.span>
              </button>
            </div>
          );
        })}
        <p className="relative px-1 pt-1 text-xs text-slate-500">A demonstration. The real switches live in AI Memory after you sign in.</p>
      </SpotlightCard>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { isAuthenticated } = useAuth();
  const start = () => onNavigate(isAuthenticated ? '/dashboard' : '/register');

  return (
    <PublicLayout currentPath="/about" onNavigate={onNavigate} backdrop="about">
      <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-16 text-center sm:px-6 lg:px-8 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}>
          <Eyebrow>About NEXORA AI</Eyebrow>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT }}
          className="mt-6 text-balance font-display text-[40px] font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
        >
          Studying shouldn’t feel <span className="text-gradient">scattered.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600"
        >
          Engineering students juggle a syllabus, labs, exams, projects and a career, across a dozen apps that never talk to each other.
          We built NEXORA AI so all of it lives in one place, with an agent that understands the whole picture.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="mt-8 flex justify-center">
          <HeroButtons primary={{ label: isAuthenticated ? 'Open my workspace' : 'Start free', onClick: start }} secondary={{ label: 'How it works', onClick: () => onNavigate('/how-it-works') }} />
        </motion.div>
      </section>

      <Section className="pt-10 lg:pt-14">
        <motion.div {...reveal}>
          <NameExplainer />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="Why we exist" title="Same week," accent="two very different students." description="Drag the handle to compare." />
        <motion.div {...reveal}>
          <BeforeAfter />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="What we believe" title="Four principles behind" accent="every screen." description="Tap a principle to read what it means in practice." />
        <motion.div {...reveal}>
          <Principles />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <SectionHeading eyebrow="All four years" title="It grows" accent="with you." description="What your agent focuses on changes as you move through your degree." />
        <motion.div {...reveal}>
          <FourYears />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <motion.div {...reveal}>
          <PrivacyPlayground />
        </motion.div>
      </Section>

      <Section className="pt-0 lg:pt-0">
        <motion.div {...reveal} className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Compass className="h-8 w-8 text-blue-600" />
          <p className="text-balance font-display text-2xl font-semibold leading-snug text-slate-900 sm:text-3xl">
            “Our mission is simple: give every engineering student a patient, private study partner that knows their syllabus and believes in their goals.”
          </p>
          <p className="text-sm font-medium text-slate-500">The NEXORA AI team</p>
        </motion.div>
      </Section>

      <CtaBand
        title="Bring your whole degree into one place."
        text="It takes a few minutes to set up, and you can skip anything and add it later."
        primary={{ label: isAuthenticated ? 'Open my workspace' : 'Create my account', onClick: start }}
        secondary={{ label: 'See how it works', onClick: () => onNavigate('/how-it-works') }}
      />
    </PublicLayout>
  );
}
