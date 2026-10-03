import * as React from 'react';

export const VisualizationLegend: React.FC = () => {
  const legendItems = [
    { label: 'Active / Current', colorClass: 'bg-blue-600 border-blue-700' },
    { label: 'Comparing', colorClass: 'bg-amber-400 border-amber-500' },
    { label: 'Swapping', colorClass: 'bg-purple-500 border-purple-600' },
    { label: 'Found / Visited', colorClass: 'bg-emerald-500 border-emerald-600' },
    { label: 'Unprocessed', colorClass: 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2 px-4 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
      <span className="font-bold text-slate-400 mr-1">LEGEND:</span>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-sm border ${item.colorClass}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
