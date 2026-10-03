import React from 'react';
import { WeakAreaItem } from '../types/placement';
import { AlertTriangle, ArrowRight, BookOpen, Binary, Code2 } from 'lucide-react';

interface Props {
  weakArea: WeakAreaItem;
  onNavigate?: (path: string) => void;
}

export const WeakAreaCard: React.FC<Props> = ({ weakArea, onNavigate }) => {
  const isHigh = weakArea.severity === 'HIGH';

  const getRemediationRoute = (cat: string) => {
    switch (cat) {
      case 'DSA':
        return '/dsa';
      case 'PROGRAMMING':
        return '/coding';
      case 'APTITUDE':
        return '/placements/topics?cat=APTITUDE';
      default:
        return '/courses';
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isHigh
        ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
        : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${isHigh ? 'text-rose-600' : 'text-amber-600'}`} />
          <h4 className="font-semibold text-slate-900 text-sm">{weakArea.topic}</h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
          isHigh ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {weakArea.severity} Priority
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-2.5">
        {weakArea.reason}
      </p>

      <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 mb-3 text-xs text-slate-700">
        <span className="font-semibold text-slate-900">Recommended Action: </span>
        {weakArea.recommended_action}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onNavigate && onNavigate(getRemediationRoute(weakArea.category))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            isHigh
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          <span>Remediate Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
