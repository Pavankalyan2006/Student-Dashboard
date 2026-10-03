import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';
import { Layers } from 'lucide-react';

interface RecursionVisualizerProps {
  step: VisualizationStep;
}

export const RecursionVisualizer: React.FC<RecursionVisualizerProps> = ({ step }) => {
  const callStack: string[] = Array.isArray(step.state?.callStack)
    ? step.state.callStack
    : Array.isArray(step.state)
    ? step.state
    : ['main()'];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[280px] p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Recursion Call Stack (Current Depth: {callStack.length})
        </span>
      </div>

      {/* Vertical Stack Frame Layout */}
      <div className="flex flex-col-reverse items-center justify-end w-full max-w-md gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[200px]">
        {callStack.length === 0 ? (
          <div className="text-xs font-mono text-slate-400 py-6">Call stack is empty</div>
        ) : (
          callStack.map((frame, idx) => {
            const isTop = idx === callStack.length - 1;

            return (
              <div
                key={idx}
                className={`w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all duration-300 shadow-xs ${
                  isTop
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-400/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-500">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold">{frame}</span>
                </div>

                {isTop && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-600 text-white uppercase tracking-wider">
                    Active Frame
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Variables Readout Bar */}
      {step.variables && Object.keys(step.variables).length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-center pt-1 text-xs">
          {Object.entries(step.variables).map(([k, v]) => (
            <div
              key={k}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-mono"
            >
              <span className="text-slate-500">{k}:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
