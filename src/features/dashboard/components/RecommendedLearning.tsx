import * as React from 'react';
import { Sparkles, ArrowRight, Clock, Compass } from 'lucide-react';
import { LearningRecommendation } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function RecommendedLearning({
  recommendations,
  onNavigate,
}: {
  recommendations: LearningRecommendation[];
  onNavigate: (path: string) => void;
}) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Advanced': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <Card className="border border-[#E4E7EC] bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#4F46E5]" />
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-[#101828]">Recommended Next Steps</CardTitle>
            <p className="text-xs text-[#667085]">Contextual suggestions tailored to your recent progress</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#667085]">
            No pending recommendations. Complete a lesson to generate personalized next steps.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="group p-3.5 rounded-xl border border-[#E4E7EC] bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rec.type}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-[#101828] group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-[#475467] mt-1 leading-relaxed line-clamp-2">
                    {rec.reason}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-[#667085]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{rec.estimated_time}</span>
                  </span>
                  <Button
                    variant="ai"
                    size="sm"
                    onClick={() => onNavigate(rec.action_url)}
                    className="h-6 px-2 text-[11px] gap-1"
                  >
                    <span>Practice</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
