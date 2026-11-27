import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { EASE_OUT } from '../../../components/motion';
import { useSpotlight } from './PublicBackdrop';

/** Shared pieces for the public Home, About and How it works pages. */

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: EASE_OUT },
} as const;

export function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn('relative mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28', className)}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 backdrop-blur',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-blue-500 to-sky-400" aria-hidden="true" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  /** A trailing phrase drawn in the brand gradient. */
  accent?: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <motion.div {...reveal} className={cn('mb-12 max-w-3xl space-y-4', align === 'center' && 'mx-auto text-center')}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-[40px] sm:leading-[1.12]">
        {title} {accent && <span className="text-gradient">{accent}</span>}
      </h2>
      {description && <p className="text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>}
    </motion.div>
  );
}

/** A glassy card with a soft light that follows the cursor. */
export function SpotlightCard({
  className,
  children,
  as = 'div',
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'button' | 'article'; type?: 'button' }) {
  const { ref, onPointerMove } = useSpotlight<HTMLElement>();
  const Comp = as as any;
  return (
    <Comp
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        'spotlight-card group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:border-blue-200 hover:shadow-[0_24px_60px_-30px_rgb(105_87_232_/_0.55)]',
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200/80 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold text-slate-900 hover:bg-slate-50/60"
            >
              {item.q}
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function CtaBand({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <Section className="pb-28 pt-0 lg:pt-0">
      <motion.div
        {...reveal}
        className="hero-brand inverse-island relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white sm:px-12 sm:py-20"
      >
        <div aria-hidden="true" className="neural-backdrop pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#9B78FF]/30 blur-3xl animate-float" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-[#37C9E8]/20 blur-3xl animate-float [animation-delay:1.2s]" />
        <div className="relative mx-auto max-w-2xl space-y-5">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
          <p className="text-base leading-relaxed text-white/70 sm:text-lg">{text}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={primary.onClick}
              className="press btn-shine relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#182033] shadow-[0_12px_30px_-12px_rgb(155_120_255_/_0.9)] hover:bg-[#F3F1FE]"
            >
              {primary.label} <ArrowRight className="h-4 w-4" />
            </button>
            {secondary && (
              <button
                type="button"
                onClick={secondary.onClick}
                className="press inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {secondary.label}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/** Primary and secondary hero buttons. */
export function HeroButtons({
  primary,
  secondary,
}: {
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={primary.onClick}
        className="press btn-shine relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_34px_-14px_rgb(120_101_245_/_0.95)] hover:brightness-110"
      >
        {primary.label} <ArrowRight className="h-4 w-4" />
      </button>
      {secondary && (
        <button
          type="button"
          onClick={secondary.onClick}
          className="press inline-flex items-center gap-2 rounded-2xl border border-slate-300/80 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-800 backdrop-blur hover:border-blue-300 hover:text-blue-700"
        >
          {secondary.label}
        </button>
      )}
    </div>
  );
}
