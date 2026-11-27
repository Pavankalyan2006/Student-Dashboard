import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

/** The top bar's shortcut to the AI tutor, in the NEXORA brand gradient. */
export function AskAIButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask the AI tutor"
      className={cn(
        'press relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-brand-gradient px-2.5 py-2 text-[13px] font-semibold text-white shadow-[0_6px_18px_-8px_rgb(120_101_245_/_0.8)] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_8px_22px_-8px_rgb(120_101_245_/_0.95)] sm:px-3.5',
        className
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">Ask AI</span>
    </button>
  );
}
