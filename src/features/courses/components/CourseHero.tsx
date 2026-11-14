import * as React from 'react';
import {
  BookOpen,
  Clock,
  Bookmark,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Award,
  Sparkles,
  User,
  Compass,
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
} from 'lucide-react';
import { CourseWithDetails } from '../types/courses';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown';

export function CourseHero({
  course,
  onNavigate,
  onEnroll,
  onToggleBookmark,
  onEditCourse,
  onArchiveCourse,
  onRemoveCourse,
}: {
  course: CourseWithDetails;
  onNavigate: (path: string) => void;
  onEnroll: () => void;
  onToggleBookmark: () => void;
  onEditCourse?: () => void;
  onArchiveCourse?: (archive: boolean) => void;
  onRemoveCourse?: () => void;
}) {
  const hours = Math.round(course.estimated_minutes / 60);

  const formatLastStudied = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Studied just now';
    if (diffHours < 24) return `Studied ${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Studied yesterday';
    return `Last studied on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl hero-brand text-white p-6 sm:p-8 border border-navy-700">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

      {/* Top Breadcrumb & Actions Bar */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 mb-5 text-xs">
        <button
          onClick={() => onNavigate('/courses')}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Courses</span>
        </button>

        <div className="flex items-center gap-2">
          {course.is_archived && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Archived
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Course actions"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {course.is_custom && onEditCourse && (
                <DropdownMenuItem onClick={onEditCourse}>
                  <Pencil className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  <span>Edit Course Details</span>
                </DropdownMenuItem>
              )}

              {onArchiveCourse && (course.enrollment || course.is_archived) && (
                <DropdownMenuItem onClick={() => onArchiveCourse(!course.is_archived)}>
                  {course.is_archived ? (
                    <>
                      <ArchiveRestore className="h-3.5 w-3.5 mr-2 text-slate-500" />
                      <span>Restore to Workspace</span>
                    </>
                  ) : (
                    <>
                      <Archive className="h-3.5 w-3.5 mr-2 text-slate-500" />
                      <span>Archive Course</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onRemoveCourse && (
                <DropdownMenuItem
                  danger
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to remove "${course.title}" from your workspace?`
                      )
                    ) {
                      onRemoveCourse();
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Remove from Workspace</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-blue-300 border border-white/15">
            {course.code}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15">
            {course.branch} · Semester {course.semester}
          </span>
          {course.academic_year && (
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/15">
              {course.academic_year}
            </span>
          )}
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
            {course.difficulty}
          </span>
          {course.category && (
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-500/30">
              {course.category}
            </span>
          )}
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
            <BookOpen className="h-4 w-4 text-sky-400" />
            <span>
              {course.chapters.length} Units · {course.total_lessons} Lessons
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-sky-400" />
            <span>~{hours} Hours Total Content</span>
          </span>
          {course.instructor && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-sky-400" />
              <span>{course.instructor}</span>
            </span>
          )}
          {formatLastStudied(course.last_studied_at) && (
            <span className="text-emerald-300 italic">
              {formatLastStudied(course.last_studied_at)}
            </span>
          )}
        </div>

        {/* Progress Bar (if enrolled) */}
        {course.enrollment && (
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {course.completed_lessons} of {course.total_lessons} lessons completed (
                {Math.max(0, course.total_lessons - course.completed_lessons)} remaining)
              </span>
              <span className="font-bold text-white tabular-nums">
                {course.progress_percentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${course.progress_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Next recommended lesson banner */}
        {course.next_recommended_lesson && course.enrollment && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-500/15 border border-blue-400/30 max-w-md text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Compass className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-300 text-[10px] block font-semibold uppercase tracking-wider">
                  Recommended Next
                </span>
                <span className="font-bold text-white truncate block">
                  {course.next_recommended_lesson.title}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                onNavigate(`/courses/${course.id}/learn/${course.next_recommended_lesson?.id}`)
              }
              className="text-sky-400 font-bold hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Jump In</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {course.enrollment ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                onNavigate(
                  course.next_recommended_lesson
                    ? `/courses/${course.id}/learn/${course.next_recommended_lesson.id}`
                    : `/courses/${course.id}/learn`
                )
              }
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
              className="gap-2 shadow-sm font-bold bg-blue-600 hover:bg-blue-600"
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
