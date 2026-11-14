import * as React from 'react';
import { History, BookOpen, Binary, HelpCircle, FileText, Files, Hammer, ArrowRight } from 'lucide-react';
import { RecentActivityItem } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function RecentActivity({
  activities,
  onNavigate,
}: {
  activities: RecentActivityItem[];
  onNavigate: (path: string) => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-3.5 w-3.5 text-blue-600" />;
      case 'dsa': return <Binary className="h-3.5 w-3.5 text-amber-600" />;
      case 'quiz': return <HelpCircle className="h-3.5 w-3.5 text-purple-600" />;
      case 'note': return <FileText className="h-3.5 w-3.5 text-emerald-600" />;
      case 'document': return <Files className="h-3.5 w-3.5 text-teal-600" />;
      case 'project': return <Hammer className="h-3.5 w-3.5 text-indigo-600" />;
      default: return <History className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-blue-600" />
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Recent Activity</CardTitle>
            <p className="text-xs text-slate-500">Latest learning actions across your workspace</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              onClick={() => onNavigate(act.link)}
              className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                  {getIcon(act.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {act.title}
                  </h5>
                  <span className="text-[10px] text-slate-500 tabular-nums block">
                    {act.formatted_time}
                  </span>
                </div>
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
