import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AskAIButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-1',
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>Ask AI</span>
    </button>
  );
}
