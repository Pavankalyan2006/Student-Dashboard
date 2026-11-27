// Shared motion primitives for the whole platform.
//
// Every animation here respects the student's "reduce motion" setting: MotionProvider sets
// reducedMotion="user", so transforms are dropped and only opacity fades remain for those students.
import * as React from 'react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export { AnimatePresence, motion };

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const SPRING = { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 } as const;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: EASE_OUT }}>
      {children}
    </MotionConfig>
  );
}

/** Fades and lifts its content in, once, when it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 12,
  className,
  as = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'section' | 'li';
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
    >
      {children}
    </Comp>
  );
}

const staggerParent = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.04 } }),
};
const staggerChild = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** A container whose StaggerItem children animate in one after another. */
export function Stagger({
  children,
  className,
  stagger = 0.06,
  ...rest
}: { children: React.ReactNode; className?: string; stagger?: number } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  return (
    <motion.div className={className} variants={staggerParent} custom={stagger} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...rest }: { children: React.ReactNode; className?: string } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  return (
    <motion.div className={className} variants={staggerChild} {...rest}>
      {children}
    </motion.div>
  );
}

/** Lifts slightly on hover and presses in on tap. */
export const HoverLift = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { lift?: number }>(function HoverLift(
  { lift = 3, className, ...rest },
  ref
) {
  return (
    <motion.div
      ref={ref}
      className={className}
      whileHover={{ y: -lift, transition: SPRING }}
      whileTap={{ scale: 0.985, transition: SPRING }}
      {...rest}
    />
  );
});

/**
 * Counts up to a number when it first comes into view. Non-numeric values ("—", "A+") render as they are;
 * values like "82%" or "7.71" keep their suffix and decimal places.
 */
export function AnimatedNumber({ value, duration = 0.9, className }: { value: React.ReactNode; duration?: number; className?: string }) {
  const parsed = React.useMemo(() => {
    if (typeof value === 'number') return { n: value, prefix: '', suffix: '', decimals: Number.isInteger(value) ? 0 : countDecimals(value) };
    if (typeof value !== 'string') return null;
    const m = value.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!m) return null;
    return { n: Number(m[2]), prefix: m[1], suffix: m[3], decimals: countDecimals(m[2]) };
  }, [value]);

  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(() => (parsed ? format(0, parsed.decimals) : ''));

  React.useEffect(() => {
    if (!parsed) return;
    if (reduce) {
      setDisplay(format(parsed.n, parsed.decimals));
      return;
    }
    if (!inView) return;
    const controls = animate(0, parsed.n, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(format(v, parsed.decimals)),
    });
    return () => controls.stop();
  }, [parsed, inView, reduce, duration]);

  if (!parsed) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={cn('tabular-nums', className)} aria-label={`${parsed.prefix}${format(parsed.n, parsed.decimals)}${parsed.suffix}`}>
      <span aria-hidden="true">
        {parsed.prefix}
        {display}
        {parsed.suffix}
      </span>
    </span>
  );
}

function countDecimals(v: number | string) {
  const s = String(v);
  const i = s.indexOf('.');
  return i === -1 ? 0 : Math.min(2, s.length - i - 1);
}
function format(v: number, decimals: number) {
  return decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString();
}

/** An animated circular progress ring (0–100). */
export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  className,
  trackClassName = 'stroke-slate-100',
  barClassName = 'stroke-blue-600',
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClassName} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={barClassName}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** A horizontal progress bar that grows to its value. */
export function AnimatedBar({ value, className, barClassName = 'bg-blue-600' }: { value: number; className?: string; barClassName?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className={cn('h-full rounded-full', barClassName)} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: EASE_OUT }} />
    </div>
  );
}

/** A thin bar at the top of the window showing how far down the page the student has scrolled. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const opacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-blue-500 via-violet-500 to-sky-400 print:hidden"
      style={{ scaleX, opacity }}
    />
  );
}

/** A floating button that appears after scrolling and returns the student to the top. */
export function BackToTop() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 16, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.8 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 print:hidden"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** A soft spotlight that follows the pointer across a card. */
export function SpotlightCard({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const bg = useTransform([x, y], ([lx, ly]) => `radial-gradient(240px circle at ${lx}px ${ly}px, rgb(94 110 239 / 0.10), transparent 70%)`);
  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        x.set(-200);
        y.set(-200);
      }}
      {...rest}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: bg }} />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/** A short confetti burst for real accomplishments (a task done, a goal reached). Skipped under reduced motion. */
export function celebrate(origin?: { x: number; y: number }) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;
  const fire = confettiOnPage();
  const colors = ['#4654E0', '#8D6BEA', '#38BDF8', '#10B981', '#F59E0B'];
  const base = { origin: origin ?? { x: 0.5, y: 0.6 }, colors, disableForReducedMotion: true };
  fire({ ...base, particleCount: 70, spread: 70, startVelocity: 38 });
  window.setTimeout(() => fire({ ...base, particleCount: 40, spread: 110, startVelocity: 28, scalar: 0.8 }), 160);
}

// The site's Content-Security-Policy does not allow blob: workers, so confetti draws on the main thread,
// on one shared full-window canvas that ignores the pointer.
let confettiInstance: confetti.CreateTypes | null = null;
function confettiOnPage() {
  if (confettiInstance) return confettiInstance;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '9999' });
  document.body.appendChild(canvas);
  confettiInstance = confetti.create(canvas, { resize: true, useWorker: false });
  return confettiInstance;
}

/** Origin for celebrate() taken from an element's position on screen. */
export function originOf(el: Element | null) {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
}
