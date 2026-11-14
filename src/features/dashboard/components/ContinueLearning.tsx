import * as React from 'react';
import { BookOpen, Play, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ContinueLearningItem } from '../types/dashboard';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function ContinueLearning({
  item,
  onNavigate,
}: {
  item: ContinueLearningItem | null;
  onNavigate: (path: string) => void;
}) {
  if (!item) {
    return (
      <Card className="p-6 border-dashed border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <BookOpen className="h-4 w-4" />
            <span>Start Your First Course</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            No active coursework in progress
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md">
            Enroll in Semester 1-8 core engineering subjects, DAA, AI, or Systems to begin tracking your lessons.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => onNavigate('/courses')} className="shrink-0 gap-1.5">
          <span>Explore Courses</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6 border border-slate-200 bg-white hover:border-blue-200 transition-colors shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Course details */}
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
              Continue Learning
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500 truncate">{item.category}</span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {item.course_name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
              <span className="font-semibold text-slate-800">Current Lesson:</span>
              <span className="truncate">{item.lesson_title}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Lesson {item.completed_lessons} of {item.total_lessons} completed
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{item.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>

          {/* Up next footer */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Up next:</span>
            <span className="font-medium text-slate-700 truncate">{item.next_topic}</span>
          </div>
        </div>

        {/* Right: Resume button */}
        <div className="shrink-0 flex items-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate(`/courses`)}
            className="w-full md:w-auto gap-2 shadow-xs"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Resume Lesson</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
