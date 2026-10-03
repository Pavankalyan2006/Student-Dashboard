import * as React from 'react';
import { AlertCircle, ArrowRight, Target } from 'lucide-react';
import { SkillArea } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function WeakAreas({
  areas,
  onNavigate,
}: {
  areas: SkillArea[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Card className="border border-[#E4E7EC] bg-white flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600" />
            <CardTitle className="text-sm font-bold text-[#101828]">Target Improvement Areas</CardTitle>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Remedial
          </span>
        </div>
        <p className="text-xs text-[#667085]">Identified through recent lab and quiz diagnostics</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {areas.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#667085]">
            Complete a few assessments or lab submissions to identify your weak areas.
          </div>
        ) : (
          areas.map((area, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-amber-50/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{area.topic}</span>
                <span className="font-bold text-amber-700 tabular-nums">{area.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#667085] truncate">{area.subject}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(area.action_url || '/dsa')}
                  className="h-6 px-2 text-[10px] gap-1 hover:border-amber-400"
                >
                  <span>Practice</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
