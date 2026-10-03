import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';
import { ArrowRight } from 'lucide-react';

interface QueueVisualizerProps {
  step: VisualizationStep;
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({ step }) => {
  const queue: (number | string)[] = Array.isArray(step.state)
    ? step.state
    : Array.isArray(step.state?.queue)
    ? step.state.queue
    : [10, 20, 30, 40];

  const highlighted = step.highlighted_elements || [];
  const comparisons = step.comparisons || [];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[280px] p-6 space-y-6">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
        <span>FIFO (First In, First Out) Pipeline</span>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-xl py-6 px-4 bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
        {/* Outflow Marker (FRONT) */}
        <div className="flex flex-col items-center mr-4 text-emerald-600 dark:text-emerald-400">
          <span className="text-[10px] font-mono font-bold tracking-tight mb-1">DEQUEUE (OUT)</span>
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>

        {/* Queue Tunnel */}
        <div className="flex-1 flex items-center justify-start gap-2 overflow-x-auto p-3 min-h-[80px] bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl shadow-inner">
          {queue.length === 0 ? (
            <div className="w-full text-center text-xs font-mono text-slate-400 py-4">
              Queue is empty
            </div>
          ) : (
            queue.map((val, idx) => {
              const isFront = idx === 0;
              const isRear = idx === queue.length - 1;
              const isHighlighted = highlighted.includes(idx) || highlighted.includes(val);
              const isComparison = comparisons.includes(idx) || comparisons.includes(val);

              return (
                <div key={idx} className="flex flex-col items-center flex-shrink-0">
                  {/* Position Badge */}
                  <div className="min-h-[20px] mb-1">
                    {isFront && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        FRONT
                      </span>
                    )}
                    {isRear && !isFront && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                        REAR
                      </span>
                    )}
                  </div>

                  {/* Queue Element */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-mono font-bold border-2 shadow-xs transition-all duration-300 ${
                      isComparison
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-amber-400/30'
                        : isHighlighted
                        ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {val}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 mt-1">pos {idx}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Inflow Marker (REAR) */}
        <div className="flex flex-col items-center ml-4 text-blue-600 dark:text-blue-400">
          <span className="text-[10px] font-mono font-bold tracking-tight mb-1">ENQUEUE (IN)</span>
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      {/* Variables Readout Bar */}
      {step.variables && Object.keys(step.variables).length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-center pt-2 text-xs">
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
