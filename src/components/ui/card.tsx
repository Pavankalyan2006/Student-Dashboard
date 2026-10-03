import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#E4E7EC] bg-white text-[#101828] shadow-xs transition-shadow',
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
      className={cn('text-base font-semibold leading-none tracking-tight text-[#101828]', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs text-[#475467] leading-relaxed', className)} {...props} />;
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
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#475467]">{title}</span>
        {icon && <div className="text-slate-400 p-1.5 rounded-lg bg-slate-50">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-[#101828] tabular-nums">{value}</div>
        {(subtitle || change) && (
          <div className="flex items-center gap-1.5 mt-1 text-xs">
            {change && (
              <span
                className={cn(
                  'font-medium tabular-nums',
                  changeType === 'positive' && 'text-[#16A34A]',
                  changeType === 'negative' && 'text-[#DC2626]',
                  changeType === 'neutral' && 'text-[#475467]'
                )}
              >
                {change}
              </span>
            )}
            {subtitle && <span className="text-[#667085]">{subtitle}</span>}
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

export function ProgressCard({ title, current, total, unit = '', category, color = 'bg-[#2563EB]', className }: ProgressCardProps) {
  const percentage = Math.min(100, Math.round((current / (total || 1)) * 100));

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between text-xs text-[#475467] mb-2">
        <span className="font-medium text-[#101828]">{title}</span>
        {category && <span className="text-[#667085]">{category}</span>}
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-lg font-bold text-[#101828] tabular-nums">
          {current} {unit}
        </span>
        <span className="text-xs text-[#667085] tabular-nums">
          of {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}
