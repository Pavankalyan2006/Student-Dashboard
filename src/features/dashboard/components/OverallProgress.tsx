import * as React from 'react';
import { TrendingUp, Award, Layers } from 'lucide-react';
import { DashboardSummary } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function OverallProgress({ summary }: { summary: DashboardSummary }) {
  const tracks = [
    { label: 'Coursework Modules', progress: 72, color: 'bg-[#2563EB]' },
    { label: 'DSA Problem Lab', progress: 64, color: 'bg-[#4F46E5]' },
    { label: 'Coding Lab Exercises', progress: 80, color: 'bg-[#0891B2]' },
    { label: 'Capstone Projects', progress: 58, color: 'bg-[#7C3AED]' },
    { label: 'Placement Readiness', progress: 45, color: 'bg-[#16A34A]' },
  ];

  return (
    <Card className="border border-[#E4E7EC] bg-white flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#101828]">Academic Mastery</CardTitle>
          <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 tabular-nums">
            {summary.overall_progress}% Overall
          </span>
        </div>
        <p className="text-xs text-[#667085]">Aggregated across engineering competencies</p>
      </CardHeader>

      <CardContent className="space-y-3.5">
        {tracks.map((t) => (
          <div key={t.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{t.label}</span>
              <span className="font-bold text-slate-900 tabular-nums">{t.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${t.color}`}
                style={{ width: `${t.progress}%` }}
              />
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#667085]">
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Degree Credits: {summary.credits_completed} / {summary.total_credits}</span>
          </span>
          <span className="font-mono text-emerald-700 font-semibold">Tier 1 Track</span>
        </div>
      </CardContent>
    </Card>
  );
}
