import * as React from 'react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { CourseProgressItem } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function CourseProgress({
  courses,
  onNavigate,
}: {
  courses: CourseProgressItem[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Active B.Tech Courses</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Semester 6 registered coursework progression</p>
        </div>
        <button
          onClick={() => onNavigate('/courses')}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-3">
        {courses.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No courses enrolled yet. Explore your branch catalog to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => onNavigate('/courses')}
                className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all cursor-pointer shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {course.code}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{course.last_accessed}</span>
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {course.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{course.category}</p>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {course.completed_lessons} / {course.total_lessons} lessons
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: course.color || '#6957E8',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
