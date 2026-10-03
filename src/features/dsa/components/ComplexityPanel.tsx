import * as React from 'react';
import { Clock, HardDrive, CheckCircle2, XCircle } from 'lucide-react';

interface ComplexityPanelProps {
  complexity: {
    time: string;
    space: string;
    best_case: string;
    average_case: string;
    worst_case: string;
    in_place: boolean;
    stable: boolean;
  };
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ complexity }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Complexity Analysis
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
          Verified Big-O
        </span>
      </div>

      {/* Time Complexity Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Best Case</span>
          <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            {complexity.best_case}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Average</span>
          <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {complexity.average_case}
          </span>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Worst Case</span>
          <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 block">
            {complexity.worst_case}
          </span>
        </div>
      </div>

      {/* Space & Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {/* Space Complexity */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Space</span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
              {complexity.space}
            </span>
          </div>
        </div>

        {/* Stable */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Stability</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {complexity.stable ? 'Stable' : 'Unstable'}
            </span>
          </div>
          {complexity.stable ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
        </div>

        {/* In-Place */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">In-Place</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {complexity.in_place ? 'Yes (O(1) aux)' : 'No (Aux memory)'}
            </span>
          </div>
          {complexity.in_place ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
};
