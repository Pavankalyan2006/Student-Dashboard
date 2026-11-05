import * as React from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function LearningStreak({
  streakDays = 0,
  longestStreak = 0,
}: {
  streakDays?: number;
  longestStreak?: number;
}) {
  // Last 7 calendar days ending today; a day is active when it falls inside the current streak.
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: labels[d.getDay()], active: 6 - i < streakDays };
  });

  return (
    <Card className="border border-[#E4E7EC] bg-white flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#101828]">Learning Habit</CardTitle>
          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
        </div>
        <p className="text-xs text-[#667085]">Daily active study consistency</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Big number */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#101828] tabular-nums">{streakDays}</span>
          <span className="text-xs font-semibold text-amber-700">Days Active Streak</span>
        </div>

        {/* Days visualizer */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500">{d.day}</span>
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  d.active
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {d.active ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Footer milestone */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#667085]">
          <span className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Longest Streak: {longestStreak} days</span>
          </span>
          <span className="text-amber-800 font-semibold font-mono">100% this week</span>
        </div>
      </CardContent>
    </Card>
  );
}
