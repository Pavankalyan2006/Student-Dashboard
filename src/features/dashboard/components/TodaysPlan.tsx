import * as React from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, ListTodo } from 'lucide-react';
import { TodayPlanTask } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function TodaysPlan({
  tasks,
  onToggleTask,
  onNavigate,
}: {
  tasks: TodayPlanTask[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (path: string) => void;
}) {
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dsa': return <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase font-semibold">DSA</span>;
      case 'course': return <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">Course</span>;
      case 'notes': return <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-semibold">Notes</span>;
      case 'quiz': return <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase font-semibold">Quiz</span>;
      case 'project': return <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-semibold">Project</span>;
      default: return null;
    }
  };

  return (
    <Card className="border border-[#E4E7EC] bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-[#2563EB]" />
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-[#101828]">Today's Learning Plan</CardTitle>
            <p className="text-xs text-[#667085]">Personalized daily engineering objectives</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
          {completedCount} / {totalCount} Done
        </span>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#667085]">
            All objectives for today are completed! Take a break or consult AI for extra drills.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                task.is_completed
                  ? 'bg-slate-50/60 border-slate-200/80 text-slate-500'
                  : 'bg-white border-[#E4E7EC] hover:border-blue-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-[#2563EB] cursor-pointer transition-colors shrink-0"
                  aria-label={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.is_completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 hover:text-slate-500" />
                  )}
                </button>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeBadge(task.type)}
                    <span
                      className={`text-xs font-semibold truncate ${
                        task.is_completed ? 'line-through text-slate-400' : 'text-[#101828]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#667085]">
                    <Clock className="h-3 w-3" />
                    <span>Est. {task.estimated_time}</span>
                  </div>
                </div>
              </div>

              <Button
                variant={task.is_completed ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => onNavigate(task.action_url)}
                className="h-7 text-xs px-2.5 shrink-0 gap-1"
              >
                <span>{task.is_completed ? 'Review' : 'Start'}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
