import * as React from 'react';
import { AlertCircle, RefreshCw, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6', className)}>
      {children}
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E4E7EC]/80', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828] text-balance">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-[#475467] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 min-w-0 [&>div]:flex-wrap">{actions}</div>}
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
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-base font-semibold text-[#101828]">{title}</h2>}
            {description && <p className="text-xs text-[#475467] mt-0.5">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </section>
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
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#E4E7EC] bg-white',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3">
        {icon || <FolderOpen className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-[#101828] mb-1">{title}</h3>
      <p className="text-xs text-[#475467] max-w-sm mb-4 leading-relaxed">{description}</p>
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

export function LoadingState({ message = 'Loading workspace data...', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <RefreshCw className="h-6 w-6 animate-spin text-[#2563EB] mb-3" />
      <p className="text-xs font-medium text-[#475467]">{message}</p>
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
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/50',
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-[#DC2626] mb-2" />
      <h3 className="text-sm font-semibold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-800 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function ModulePlaceholderCard({
  moduleName,
  phaseNumber,
  description,
  features = [],
  actionLabel = 'View Roadmap',
  onAction,
}: {
  moduleName: string;
  phaseNumber: number;
  description: string;
  features?: string[];
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-white p-6 sm:p-8 relative overflow-hidden shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#4F46E5] bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Scheduled for Phase {phaseNumber}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#101828]">
            {moduleName} Module Foundation Ready
          </h2>
          <p className="text-xs sm:text-sm text-[#475467] leading-relaxed">
            {description}
          </p>
          {features.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-2">
                Planned Architectural Features:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#101828]">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
          <div className="text-xs text-[#667085] text-left md:text-right">
            <div>API Route &amp; State Ready</div>
            <div className="font-mono text-slate-400 text-[11px] mt-0.5">status: foundation_verified</div>
          </div>
          {onAction && (
            <Button variant="outline" size="sm" onClick={onAction} className="gap-1.5">
              <span>{actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
