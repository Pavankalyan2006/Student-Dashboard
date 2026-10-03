import * as React from 'react';
import { BookOpen, Clock, ArrowRight, Play, Bookmark, CheckCircle2 } from 'lucide-react';
import { CourseCardData } from '../types/courses';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function CourseCard({
  course,
  onNavigate,
  onEnroll,
  onToggleBookmark,
}: {
  course: CourseCardData;
  onNavigate: (path: string) => void;
  onEnroll?: (courseId: string) => void;
  onToggleBookmark?: (courseId: string) => void;
}) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Advanced':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const hours = Math.round(course.estimated_minutes / 60);

  return (
    <Card className="group overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
      {/* Thumbnail with overlay tags */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="font-mono font-bold text-xs bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md border border-white/20">
            {course.code}
          </span>

          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(course.id);
              }}
              aria-label={course.is_bookmarked ? 'Remove bookmark' : 'Bookmark course'}
              className="p-1.5 rounded-full bg-slate-900/60 backdrop-blur-xs text-white hover:bg-slate-900/80 transition-colors cursor-pointer"
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${
                  course.is_bookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'
                }`}
              />
            </button>
          )}
        </div>

        {/* Bottom tags on image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
            {course.branch} · Sem {course.semester}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border backdrop-blur-xs ${getDifficultyColor(
              course.difficulty
            )}`}
          >
            {course.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h3
            onClick={() => onNavigate(`/courses/${course.id}`)}
            className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors line-clamp-1 cursor-pointer"
          >
            {course.title}
          </h3>
          <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">
            {course.short_description || course.description}
          </p>
        </div>

        {/* Progress or Lessons/Duration Metadata */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-[#667085]">
          {course.is_enrolled && course.progress_percentage !== undefined ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-700">Course Progress</span>
                <span className="font-bold text-[#101828] tabular-nums">
                  {course.progress_percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                  style={{ width: `${course.progress_percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-[#2563EB]" />
                <span>{course.total_lessons} lessons</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>~{hours} hrs</span>
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            {course.is_enrolled ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate(`/courses/${course.id}/learn`)}
                className="w-full gap-1.5 text-xs shadow-2xs"
              >
                <Play className="h-3 w-3 fill-white" />
                <span>Continue Learning</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(`/courses/${course.id}`)}
                  className="flex-1 text-xs"
                >
                  View Syllabus
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => (onEnroll ? onEnroll(course.id) : onNavigate(`/courses/${course.id}`))}
                  className="flex-1 text-xs gap-1"
                >
                  <span>Start</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
