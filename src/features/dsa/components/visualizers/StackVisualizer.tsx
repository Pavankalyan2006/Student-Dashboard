import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';
import { ArrowDown } from 'lucide-react';

interface StackVisualizerProps {
  step: VisualizationStep;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = ({ step }) => {
  const stack: number[] = Array.isArray(step.state)
    ? step.state
    : Array.isArray(step.state?.stack)
    ? step.state.stack
    : [10, 20, 30];

  const highlighted = step.highlighted_elements || [];
  const topIdx = stack.length - 1;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] p-6 space-y-4">
      {/* Top Pointer Indicator */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-full text-xs font-mono font-bold border border-purple-300 dark:border-purple-800">
          <span>TOP</span>
          <span>{topIdx >= 0 ? `[${topIdx}]` : 'NULL'}</span>
        </div>
        <ArrowDown className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 animate-bounce" />
      </div>

      {/* Vertical Stack Frame */}
      <div className="w-48 sm:w-56 min-h-[180px] p-2 border-b-4 border-x-4 border-slate-700 dark:border-slate-400 rounded-b-xl flex flex-col-reverse items-center justify-start gap-2 bg-slate-50/50 dark:bg-slate-900/40">
        {stack.length === 0 ? (
          <div className="py-12 text-slate-400 dark:text-slate-500 text-xs font-mono">
            [ Empty Stack ]
          </div>
        ) : (
          stack.map((val, idx) => {
            const isTop = idx === topIdx;
            const isHighlighted = highlighted.includes(idx) || highlighted.includes(val);

            return (
              <div
                key={idx}
                className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-between font-mono text-sm border-2 shadow-xs transition-all duration-300 ${
                  isTop
                    ? 'border-purple-600 bg-purple-600 text-white shadow-purple-500/20 font-bold'
                    : isHighlighted
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{val}</span>
                <span className="text-[10px] opacity-75">idx {idx}</span>
              </div>
            );
          })
        )}
      </div>

      <span className="text-[11px] font-mono text-slate-500">
        Stack Capacity: Dynamic • Discipline: LIFO
      </span>
    </div>
  );
};
