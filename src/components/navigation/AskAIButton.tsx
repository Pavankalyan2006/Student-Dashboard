import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AskAIButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask the AI tutor"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-slate-900 px-2.5 py-2 text-[13px] font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 active:translate-y-px sm:px-3.5',
        className
      )}
    >
      <Sparkles className="h-4 w-4 text-violet-300" />
      <span className="hidden sm:inline">Ask AI</span>
    </button>
  );
}
