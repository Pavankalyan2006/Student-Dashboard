import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { codingApi } from '../../coding/api/codingApi';
import { Code2, Play, Terminal, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RecentCodingWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { data: progress } = useQuery({
    queryKey: ['coding-progress-dashboard'],
    queryFn: () => codingApi.getProgress(),
  });

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-lg">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Coding Lab & Sandbox</h3>
            <p className="text-[11px] text-slate-500">Live multi-language execution & AI intelligence</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/coding')}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <span>Open Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Solved</span>
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
            {progress?.problems_completed ?? 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Runs</span>
          <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
            {progress?.total_executions ?? 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Languages</span>
          <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">
            {progress?.languages_used?.length ?? 0}
          </span>
        </div>
      </div>

      {/* Quick action: back to the problem list (no hard-coded suggestion) */}
      <button
        type="button"
        onClick={() => onNavigate('/coding')}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left text-xs transition-colors hover:border-blue-300 hover:bg-blue-50/50"
      >
        <span>
          <span className="block font-semibold text-slate-900">Continue practising</span>
          <span className="text-[11px] text-slate-500">Open the Coding Lab problem list</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white">
          <Play className="h-3 w-3 fill-current" /> Open
        </span>
      </button>
    </div>
  );
};
