import * as React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { SkillArea } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function Strengths({ strengths }: { strengths: SkillArea[] }) {
  return (
    <Card className="border border-slate-200 bg-white flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <CardTitle className="text-sm font-bold text-slate-900">Mastered Strengths</CardTitle>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            High Confidence
          </span>
        </div>
        <p className="text-xs text-slate-500">Consistent high scoring across assessments</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {strengths.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No verified strengths yet. Continue coursework to establish proficiency.
          </div>
        ) : (
          strengths.map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-emerald-50/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{item.topic}</span>
                <span className="font-bold text-emerald-700 tabular-nums">{item.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-500">
                <span>{item.subject}</span>
                <span className="text-emerald-700 font-medium">Verified</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
