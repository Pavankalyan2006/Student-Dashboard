import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';

interface DPTableVisualizerProps {
  step: VisualizationStep;
}

export const DPTableVisualizer: React.FC<DPTableVisualizerProps> = ({ step }) => {
  const tableData = step.state?.table || (Array.isArray(step.state) ? step.state : [0, 1, 1, 2, 3, 5, 8]);
  const is2D = Array.isArray(tableData) && Array.isArray(tableData[0]);

  const highlighted = step.highlighted_elements || [];
  const comparisons = step.comparisons || [];
  const pointers = step.pointers || {};

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[280px] p-6 space-y-6">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 uppercase tracking-wide">
          DP Tabulation Table (Memoized Subproblems)
        </span>
      </div>

      {!is2D ? (
        /* 1D DP Array Visualization */
        <div className="flex flex-col items-center space-y-2 w-full max-w-2xl overflow-x-auto py-4">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            {(tableData as number[]).map((val, idx) => {
              const isCurrent = pointers.current === idx || highlighted.includes(idx);
              const isDependency = comparisons.includes(idx) || pointers.dep1 === idx || pointers.dep2 === idx;
              const isBaseCase = pointers.base0 === idx || pointers.base1 === idx;
              const isResult = pointers.result === idx;

              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Status / Pointer Tag */}
                  <div className="min-h-[20px] mb-1">
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                        NOW
                      </span>
                    )}
                    {isDependency && !isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-100 text-amber-750 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        DEP
                      </span>
                    )}
                    {isResult && !isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        RES
                      </span>
                    )}
                  </div>

                  {/* DP Cell Box */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-sm font-mono font-bold border-2 shadow-xs transition-all duration-300 ${
                      isResult
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30'
                        : isDependency
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-amber-400/20'
                        : isBaseCase
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {val}
                  </div>

                  {/* Cell Index Label */}
                  <span className="text-[10px] font-mono text-slate-400 mt-1">
                    dp[{idx}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2D DP Matrix Visualization */
        <div className="overflow-x-auto max-w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="border-collapse">
            <tbody>
              {(tableData as number[][]).map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="px-2 py-1 text-[10px] font-mono text-slate-400 text-right">
                    r{rIdx}
                  </td>
                  {row.map((cellVal, cIdx) => (
                    <td key={cIdx} className="p-1">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        {cellVal}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
