import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';

interface ArrayVisualizerProps {
  step: VisualizationStep;
}

export const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ step }) => {
  const array: number[] = Array.isArray(step.state)
    ? step.state
    : Array.isArray(step.state?.array)
    ? step.state.array
    : [2, 5, 8, 12, 16, 23, 38];

  const highlighted = step.highlighted_elements || [];
  const comparisons = step.comparisons || [];
  const swaps = step.swaps || null;
  const pointers = step.pointers || {};

  // Compute maximum value for relative bar heights
  const maxVal = Math.max(...array.map((v) => Math.abs(Number(v) || 1)), 10);

  const getElementColor = (idx: number, val: number) => {
    if (swaps && (swaps[0] === idx || swaps[1] === idx)) {
      return 'bg-purple-500 text-white border-purple-600 shadow-purple-500/30';
    }
    if (comparisons.includes(val) || comparisons.includes(idx)) {
      return 'bg-amber-400 text-amber-950 border-amber-500 shadow-amber-400/30 font-extrabold';
    }
    if (highlighted.includes(idx) || highlighted.includes(val)) {
      return 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30 font-bold';
    }
    return 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[280px] p-6 space-y-6">
      {/* Bars Chart View */}
      <div className="flex items-end justify-center gap-2 sm:gap-3 w-full h-36 px-4">
        {array.map((val, idx) => {
          const heightPct = Math.max(15, Math.round((Math.abs(val) / maxVal) * 100));
          const isHighlighted = highlighted.includes(idx) || (swaps && (swaps[0] === idx || swaps[1] === idx));

          return (
            <div key={idx} className="flex flex-col items-center flex-1 max-w-[56px] h-full justify-end">
              <span className="text-[10px] font-mono text-slate-500 mb-1">{val}</span>
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-md transition-all duration-300 border-t border-x ${
                  isHighlighted
                    ? 'bg-gradient-to-t from-blue-600 to-indigo-500 border-blue-400'
                    : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Array Element Boxes with Pointer Flags */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {array.map((val, idx) => {
          // Identify any pointers currently targeting this index
          const activePointers = Object.entries(pointers).filter(
            ([_, pVal]) => Number(pVal) === idx
          );

          return (
            <div key={idx} className="flex flex-col items-center">
              {/* Pointer Labels Above */}
              <div className="min-h-[22px] flex items-center justify-center">
                {activePointers.length > 0 && (
                  <div className="flex items-center gap-1">
                    {activePointers.map(([pName]) => (
                      <span
                        key={pName}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                      >
                        {pName}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Element Box */}
              <div
                className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center text-sm font-mono border-2 shadow-xs transition-all duration-300 ${getElementColor(
                  idx,
                  val
                )}`}
              >
                {val}
              </div>

              {/* Index Number Below */}
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                [{idx}]
              </span>
            </div>
          );
        })}
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
