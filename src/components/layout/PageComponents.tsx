import * as React from 'react';
import { AlertCircle, RefreshCw, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { AnimatedNumber, EASE_OUT } from '../motion';
import { NexoraLoader } from '../brand/Nexora';
import { EmptyOrbit } from '../brand/Illustrations';

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  // The shell already pads and centres <main>; pages only add vertical rhythm. Sections rise in one after
  // another through the global entrance in styles/theme.css, which also covers pages without this container.
  return <div className={cn('mx-auto w-full max-w-7xl space-y-6 lg:space-y-8', className)}>{children}</div>;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  /** Small label above the title, e.g. the module group. */
  eyebrow?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, badge, actions, eyebrow, icon, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-3.5">
        {icon && (
          <motion.div
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            whileHover={{ rotate: -6, scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="gradient-border mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 via-violet-50 to-sky-50 text-blue-600 shadow-[0_8px_20px_-12px_rgb(105_87_232_/_0.7)] [&_svg]:h-5 [&_svg]:w-5"
          >
            {icon}
          </motion.div>
        )}
        <div className="min-w-0 space-y-1.5">
          {eyebrow && (
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-blue-500 to-sky-400" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px] sm:leading-9">
              {title}
            </h1>
            {badge}
          </div>
          {description && <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex min-w-0 flex-wrap items-center gap-2.5 [&>div]:flex-wrap">{actions}</div>}
    </div>
  );
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-[17px] font-semibold tracking-tight text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'brand' | 'violet' | 'success' | 'warning' | 'info' | 'neutral';
  onClick?: () => void;
  className?: string;
}

const METRIC_TONES: Record<NonNullable<MetricCardProps['tone']>, string> = {
  brand: 'bg-blue-50 text-blue-600 ring-blue-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  success: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-600 ring-amber-100',
  info: 'bg-sky-50 text-sky-600 ring-sky-100',
  neutral: 'bg-slate-50 text-slate-600 ring-slate-200',
};

/** A single real metric. Pass "—" (not a made-up number) when the data is not there yet. */
export function MetricCard({ label, value, hint, icon, tone = 'brand', onClick, className }: MetricCardProps) {
  const Comp: any = onClick ? motion.button : motion.div;
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={cn(
        'group/metric relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition-[border-color,box-shadow] hover:border-blue-200 hover:shadow-[0_12px_32px_-16px_rgb(105_87_232_/_0.45)] sm:p-5',
        className
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover/metric:opacity-100" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-slate-600">{label}</span>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset transition-transform duration-300 group-hover/metric:scale-110 group-hover/metric:-rotate-6 motion-reduce:transform-none [&_svg]:h-4 [&_svg]:w-4', METRIC_TONES[tone])}>
            {icon}
          </span>
        )}
      </div>
      <div className="font-display text-[26px] font-bold leading-none tracking-tight text-slate-900 tabular-nums"><AnimatedNumber value={value} /></div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </Comp>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center sm:py-14',
        className
      )}
    >
      <EmptyOrbit className="mb-4">{icon || <FolderOpen className="h-5 w-5" />}</EmptyOrbit>
      <h3 className="mb-1 text-[15px] font-semibold text-slate-900">{title}</h3>
      <p className="mb-5 max-w-sm text-[13px] leading-relaxed text-slate-500">{description}</p>
      {action ? (
        action
      ) : actionText && onAction ? (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
}

/** Loading placeholder: a short skeleton of the page instead of a lone spinner. */
export function LoadingState({ message = 'Loading…', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('space-y-4 py-2', className)} role="status" aria-live="polite">
      <span className="sr-only">{message}</span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5" style={{ animationDelay: `${i * 90}ms` }}>
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-4 h-6 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton mt-4 h-3 w-full" />
        <div className="skeleton mt-2.5 h-3 w-5/6" />
        <div className="skeleton mt-2.5 h-3 w-2/3" />
      </div>
      <div className="flex items-center justify-center gap-2.5 text-xs font-medium text-slate-500" aria-hidden="true">
        <NexoraLoader size="sm" className="!flex-row" />
        {message}
      </div>
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/60 px-6 py-10 text-center', className)}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-red-600 ring-1 ring-inset ring-red-200">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-[15px] font-semibold text-red-900">{title}</h3>
      <p className="mb-4 max-w-md text-[13px] text-red-800/90">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function ModulePlaceholderCard({
  moduleName,
  description,
  features = [],
  actionLabel = 'Back to dashboard',
  onAction,
}: {
  moduleName: string;
  /** Kept for API compatibility; internal roadmap phases are never shown to students. */
  phaseNumber?: number;
  description: string;
  features?: string[];
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="surface-hero relative overflow-hidden rounded-2xl border border-slate-200 p-6 shadow-xs sm:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Coming to your workspace</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{moduleName}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{description}</p>
          {features.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 pt-2 text-sm text-slate-700 sm:grid-cols-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {onAction && (
          <Button variant="outline" size="sm" onClick={onAction} className="shrink-0 gap-1.5 self-start md:self-center">
            <span>{actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
