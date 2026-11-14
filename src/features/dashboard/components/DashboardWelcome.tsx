import * as React from 'react';
import { Flame, Sparkles, Compass } from 'lucide-react';
import { DashboardStudent } from '../types/dashboard';

export function DashboardWelcome({
  student,
  streakDays = 7,
}: {
  student: DashboardStudent;
  streakDays?: number;
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = student.name ? student.name.split(' ')[0] : 'Student';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-white via-white to-slate-50 border border-slate-200 shadow-2xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, {firstName}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Semester {student.semester}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          {student.branch} · Ready to continue your engineering coursework and lab milestones?
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Learning Focus Chip */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs">
          <Compass className="h-4 w-4 text-blue-600" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Focus</div>
            <div className="font-semibold text-slate-900 truncate max-w-[200px]">{student.focus_topic}</div>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
          <div>
            <div className="text-[10px] text-amber-700 uppercase tracking-wider font-semibold">Study Streak</div>
            <div className="font-bold tabular-nums text-amber-950">{streakDays} Days Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
