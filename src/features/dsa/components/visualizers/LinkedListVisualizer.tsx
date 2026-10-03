import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';
import { ArrowRight } from 'lucide-react';

interface LinkedListVisualizerProps {
  step: VisualizationStep;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({ step }) => {
  const nodes: number[] = Array.isArray(step.state)
    ? step.state
    : Array.isArray(step.state?.nodes)
    ? step.state.nodes
    : [10, 20, 30, 40, 50];

  const highlighted = step.highlighted_elements || [];
  const pointers = step.pointers || {};

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[280px] p-6 space-y-6 overflow-x-auto">
      <div className="flex items-center gap-2 sm:gap-4 py-4 min-w-max">
        {nodes.map((val, idx) => {
          const activePointers = Object.entries(pointers).filter(
            ([_, pVal]) => Number(pVal) === idx
          );
          const isHighlighted = highlighted.includes(idx) || highlighted.includes(val);

          return (
            <React.Fragment key={idx}>
              {/* Linked List Node */}
              <div className="flex flex-col items-center">
                {/* Pointer Tag */}
                <div className="min-h-[22px] flex items-center justify-center mb-1">
                  {activePointers.length > 0 && (
                    <div className="flex items-center gap-1">
                      {activePointers.map(([pName]) => (
                        <span
                          key={pName}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                        >
                          {pName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Node Box with Data + Next compartments */}
                <div
                  className={`flex items-stretch rounded-xl border-2 overflow-hidden shadow-xs transition-all duration-300 ${
                    isHighlighted
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 shadow-indigo-500/20'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="px-3.5 py-2.5 flex items-center justify-center font-mono font-bold text-sm text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700">
                    {val}
                  </div>
                  <div className="px-2 py-2.5 flex items-center justify-center bg-slate-100 dark:bg-slate-900/60 text-[10px] font-mono text-slate-400">
                    •
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 mt-1">Node {idx}</span>
              </div>

              {/* Connecting Arrow */}
              <div className="flex items-center text-slate-400 dark:text-slate-600">
                <ArrowRight className="w-5 h-5 text-indigo-500" />
              </div>
            </React.Fragment>
          );
        })}

        {/* NULL Termination Node */}
        <div className="flex flex-col items-center">
          <div className="min-h-[22px] mb-1" />
          <div className="px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-900">
            NULL
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">tail.next</span>
        </div>
      </div>

      {/* Variables Bar */}
      {step.variables && Object.keys(step.variables).length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-center pt-2 text-xs">
          {Object.entries(step.variables).map(([k, v]) => (
            <div
              key={k}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-mono"
            >
              <span className="text-slate-500">{k}:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
