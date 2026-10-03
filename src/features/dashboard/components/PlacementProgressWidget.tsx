import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../../placements/api/placementsApi';
import { Briefcase, ArrowRight, Sparkles, Target, Award, CheckCircle2 } from 'lucide-react';

export const PlacementProgressWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { data: readiness } = useQuery({
    queryKey: ['placement-readiness-widget'],
    queryFn: () => placementsApi.getReadiness().catch(() => null),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['placement-sessions-widget'],
    queryFn: () => placementsApi.getInterviewSessions().catch(() => []),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['placement-plans-widget'],
    queryFn: () => placementsApi.getPlans().catch(() => []),
  });

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
  const activePlan = plans.length > 0 ? plans[0] : null;
  const planTasks = activePlan?.tasks || [];
  const completedTasks = planTasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-lg">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Placement Prep & Mock Interviews</h3>
            <p className="text-[11px] text-slate-500">AI Coach, CS fundamentals, aptitude & multi-round mocks</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/placements')}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>Placement Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Readiness</span>
          <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
            {readiness?.overall_percentage ?? 0}%
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Mock Rounds</span>
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
            {completedSessions.length}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Roadmap Tasks</span>
          <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
            {planTasks.length > 0 ? `${completedTasks}/${planTasks.length}` : 'Set Plan'}
          </span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onNavigate('/placements/mock-interview/setup')}
          className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Start Mock Interview</span>
        </button>
        <button
          onClick={() => onNavigate('/placements/plans')}
          className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Roadmap</span>
        </button>
      </div>
    </div>
  );
};
