import React from 'react';
import { PlacementReadiness } from '../types/placement';
import { TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  readiness: PlacementReadiness;
  onNavigate?: (path: string) => void;
}

export const PlacementReadinessCard: React.FC<Props> = ({ readiness, onNavigate }) => {
  const { dimensions, overall_percentage } = readiness;

  const items = [
    { key: 'aptitude', data: dimensions.aptitude, color: 'bg-blue-600', link: '/placements/topics?cat=APTITUDE' },
    { key: 'technical', data: dimensions.technical, color: 'bg-indigo-600', link: '/placements/technical' },
    { key: 'coding', data: dimensions.coding, color: 'bg-emerald-600', link: '/coding' },
    { key: 'dsa', data: dimensions.dsa, color: 'bg-teal-600', link: '/dsa' },
    { key: 'communication', data: dimensions.communication, color: 'bg-purple-600', link: '/placements/hr' },
    { key: 'interview_practice', data: dimensions.interview_practice, color: 'bg-amber-600', link: '/placements/mock-interview/setup' },
    { key: 'projects', data: dimensions.projects, color: 'bg-rose-600', link: '/projects' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h3 className="font-semibold text-slate-900 text-lg">Placement Readiness Index</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated from actual platform problem solving, quiz benchmarks, project milestones, and mock interviews.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Activity Benchmark</div>
            <div className="text-xl font-bold text-slate-900">{overall_percentage}%</div>
          </div>
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-blue-700 text-xs">
            {overall_percentage}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => onNavigate && onNavigate(item.link)}
            className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>{item.data.label}</span>
              <span className="text-slate-900 font-bold">{item.data.score}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${item.data.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{item.data.metric_label}:</span>
              <span className="font-medium text-slate-700">{item.data.metric_value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        <span>
          Academic Metric Guarantee: Represents objective platform activity and accuracy scores. Never presents fabricated hiring probabilities.
        </span>
      </div>
    </div>
  );
};
