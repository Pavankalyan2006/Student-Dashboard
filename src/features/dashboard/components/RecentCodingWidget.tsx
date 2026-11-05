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

      {/* Recommended Problem / Quick Action */}
      <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">Recommended Practice</span>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Pair with Target Sum (Two Sum)</h4>
          <span className="text-[11px] text-slate-500">Arrays & Hashing · Easy</span>
        </div>

        <button
          onClick={() => onNavigate('/coding/problem/prob_two_sum')}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Solve</span>
        </button>
      </div>
    </div>
  );
};
