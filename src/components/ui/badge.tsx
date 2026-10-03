import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'ai';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    outline: 'border border-[#E4E7EC] text-[#475467]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-rose-700 border border-rose-200',
    ai: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-tight transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function MetadataGroup({ items, className }: { items: (string | React.ReactNode)[]; className?: string }) {
  const filtered = items.filter(Boolean);
  return (
    <div className={cn('flex items-center gap-2 text-xs text-[#667085]', className)}>
      {filtered.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span aria-hidden="true" className="text-slate-300">·</span>}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
}
