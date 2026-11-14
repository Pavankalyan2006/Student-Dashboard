import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-shadow',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold leading-none tracking-tight text-slate-900', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-slate-600 leading-relaxed', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-5 pt-0', className)} {...props} />;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, change, changeType = 'positive', icon, className }: StatCardProps) {
  return (
    <Card className={cn('p-5 flex flex-col justify-between hover:border-slate-300 transition-colors', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-slate-600">{title}</span>
        {icon && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="font-display text-[26px] font-bold leading-none tracking-tight text-slate-900 tabular-nums">{value}</div>
        {(subtitle || change) && (
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {change && (
              <span
                className={cn(
                  'font-medium tabular-nums',
                  changeType === 'positive' && 'text-emerald-600',
                  changeType === 'negative' && 'text-red-600',
                  changeType === 'neutral' && 'text-slate-600'
                )}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

export interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  category?: string;
  color?: string;
  className?: string;
}

export function ProgressCard({ title, current, total, unit = '', category, color = 'bg-blue-600', className }: ProgressCardProps) {
  const percentage = Math.min(100, Math.round((current / (total || 1)) * 100));

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
        <span className="font-medium text-slate-900">{title}</span>
        {category && <span className="text-slate-500">{category}</span>}
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-lg font-bold text-slate-900 tabular-nums">
          {current} {unit}
        </span>
        <span className="text-xs text-slate-500 tabular-nums">
          of {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={title}>
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}
