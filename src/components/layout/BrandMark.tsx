import * as React from 'react';
import { cn } from '../../lib/utils';

/** The platform mark: a stylised "B" path over a soft indigo-to-violet tile. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 shadow-[0_6px_16px_-6px_rgb(70_84_224_/_0.6)] ring-1 ring-inset ring-white/15',
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%] text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4.5h6.2a3.6 3.6 0 0 1 0 7.2H6z" />
        <path d="M6 11.7h7.3a3.9 3.9 0 0 1 0 7.8H6z" />
        <path d="M17.5 3.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}
