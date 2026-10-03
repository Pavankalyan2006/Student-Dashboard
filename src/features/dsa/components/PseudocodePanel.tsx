import * as React from 'react';
import { Code, ChevronRight } from 'lucide-react';

interface PseudocodePanelProps {
  pseudocode: string[];
  activeLine?: number;
}

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({ pseudocode, activeLine }) => {
  const lineRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    if (activeLine !== undefined && lineRefs.current[activeLine - 1]) {
      lineRefs.current[activeLine - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLine]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          Pseudocode Synchronization
        </h3>
        <span className="text-[10px] font-mono text-slate-400">
          Line {activeLine || '-'}
        </span>
      </div>

      <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-xs overflow-x-auto max-h-[320px] divide-y divide-slate-800/40">
        {pseudocode.length === 0 ? (
          <div className="text-slate-500 py-4 text-center">No pseudocode provided</div>
        ) : (
          pseudocode.map((line, idx) => {
            const lineNum = idx + 1;
            const isActive = activeLine === lineNum;

            return (
              <div
                key={idx}
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                className={`flex items-center gap-2 py-1 px-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-600/30 text-blue-300 font-bold border-l-2 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                {/* Pointer indicator */}
                <span className="w-4 flex items-center justify-center flex-shrink-0">
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400 animate-pulse" />}
                </span>

                {/* Line number */}
                <span className="text-slate-500 text-[10px] w-5 text-right flex-shrink-0 select-none">
                  {lineNum}
                </span>

                {/* Line text */}
                <span className="whitespace-pre flex-1 pl-1">{line}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
