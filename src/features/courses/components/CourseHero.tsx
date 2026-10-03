import * as React from 'react';
import { BookOpen, Clock, Bookmark, Play, ArrowRight, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { CourseWithDetails } from '../types/courses';
import { Button } from '../../../components/ui/button';

export function CourseHero({
  course,
  onNavigate,
  onEnroll,
  onToggleBookmark,
}: {
  course: CourseWithDetails;
  onNavigate: (path: string) => void;
  onEnroll: () => void;
  onToggleBookmark: () => void;
}) {
  const hours = Math.round(course.estimated_minutes / 60);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1530] via-[#101E42] to-[#1C2E5D] text-white p-6 sm:p-8 border border-[#1E2E55] shadow-lg">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-60 w-60 rounded-full bg-[#2563EB]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-blue-300 border border-white/15">
            {course.code}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15">
            {course.branch} · Semester {course.semester}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            {course.difficulty}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {course.title}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {course.description}
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-[#38BDF8]" />
            <span>{course.total_lessons} Curated Lessons</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#38BDF8]" />
            <span>~{hours} Hours Total Content</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Degree Credit Course</span>
          </span>
        </div>

        {/* Progress Bar (if enrolled) */}
        {course.enrollment && (
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {course.completed_lessons} of {course.total_lessons} lessons completed
              </span>
              <span className="font-bold text-white tabular-nums">
                {course.progress_percentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] rounded-full transition-all duration-500"
                style={{ width: `${course.progress_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {course.enrollment ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate(`/courses/${course.id}/learn`)}
              className="gap-2 shadow-sm font-bold"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Resume Course</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={onEnroll}
              className="gap-2 shadow-sm font-bold bg-[#2563EB] hover:bg-blue-600"
            >
              <span>Enroll &amp; Start Learning</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onToggleBookmark}
            className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <Bookmark
              className={`h-4 w-4 ${course.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
            />
            <span>{course.is_bookmarked ? 'Bookmarked' : 'Bookmark Course'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
