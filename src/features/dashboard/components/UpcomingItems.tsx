import * as React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { UpcomingCalendarItem } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function UpcomingItems({
  items,
  onNavigate,
}: {
  items: UpcomingCalendarItem[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Upcoming Deadlines &amp; Events</CardTitle>
            <p className="text-xs text-slate-500">Evaluations, project milestones, and placement dates</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No upcoming deadlines scheduled in the immediate academic calendar.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.link)}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                    {item.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{item.date}</span>
                  <span>·</span>
                  <span>{item.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {item.status}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
