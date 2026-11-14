import * as React from 'react';
import { UserRound } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * One-click values from the student's profile, shown inside a form field ("From your profile: OS, DBMS").
 * Part of the input, not a suggestion panel: it only fills the field the student is already using.
 */
export function ProfileQuickPicks({
  label = 'From your profile',
  values,
  selected,
  onPick,
  max = 6,
  className,
}: {
  label?: string;
  values: string[];
  selected?: string;
  onPick: (value: string) => void;
  max?: number;
  className?: string;
}) {
  if (!values.length) return null;
  return (
    <div className={cn('mt-2 flex flex-wrap items-center gap-1.5', className)} data-testid="profile-quick-picks">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
        <UserRound className="h-3 w-3" aria-hidden="true" /> {label}:
      </span>
      {values.slice(0, max).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          aria-pressed={selected === v}
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
            selected === v
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
