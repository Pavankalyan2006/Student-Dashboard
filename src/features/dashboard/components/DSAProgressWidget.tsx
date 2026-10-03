import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dsaApi } from '../../dsa/api/dsaApi';
import { Binary, PlayCircle, ArrowRight, Award, GitBranch } from 'lucide-react';

export const DSAProgressWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { data: progress } = useQuery({
    queryKey: ['dsa-progress-dashboard'],
    queryFn: () => dsaApi.getProgress().catch(() => null),
  });

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-lg">
            <Binary className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">DSA & Algorithm Visualizer</h3>
            <p className="text-[11px] text-slate-500">Interactive step simulations & Big-O analysis</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/dsa')}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
        >
          <span>Open DSA Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Simulations</span>
          <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
            {progress?.visualizations_completed?.length ?? 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">DSA Solved</span>
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
            {progress?.problems_solved?.length ?? 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Topics</span>
          <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">
            {progress?.topics_viewed?.length ?? 0}
          </span>
        </div>
      </div>

      {/* Visualizer Quick Action */}
      <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">Featured Visualizer</span>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Binary Search Algorithm</h4>
          <span className="text-[11px] text-slate-500">Divide & Conquer · O(log N) Time</span>
        </div>

        <button
          onClick={() => onNavigate('/dsa/visualize/binary-search')}
          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>Simulate</span>
        </button>
      </div>
    </div>
  );
};
