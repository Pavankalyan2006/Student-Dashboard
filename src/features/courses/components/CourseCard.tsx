import * as React from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Play,
  Bookmark,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  User,
  Compass,
  Layers,
} from 'lucide-react';
import { CourseCardData } from '../types/courses';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown';

interface CourseCardProps {
  course: CourseCardData;
  onNavigate: (path: string) => void;
  onEnroll?: (courseId: string) => void;
  onToggleBookmark?: (courseId: string) => void;
  onEditCourse?: (course: CourseCardData) => void;
  onArchiveCourse?: (courseId: string, archive: boolean) => void;
  onRemoveCourse?: (courseId: string) => void;
  layout?: 'grid' | 'list';
}

export function CourseCard({
  course,
  onNavigate,
  onEnroll,
  onToggleBookmark,
  onEditCourse,
  onArchiveCourse,
  onRemoveCourse,
  layout = 'grid',
}: CourseCardProps) {
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

  const getStatusBadge = () => {
    if (course.is_archived) {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          Archived
        </span>
      );
    }
    switch (course.status) {
      case 'COMPLETED':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>Completed</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            In Progress
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Not Started
          </span>
        );
    }
  };

  const formatLastStudied = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Studied just now';
    if (diffHours < 24) return `Studied ${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Studied yesterday';
    if (diffDays < 7) return `Studied ${diffDays}d ago`;
    return `Studied on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  const hours = Math.round(course.estimated_minutes / 60);

  // ---------------- LIST VIEW LAYOUT ----------------
  if (layout === 'list') {
    return (
      <Card className="group overflow-hidden rounded-xl border border-[#E4E7EC] bg-white hover:border-slate-300 hover:shadow-sm transition-all p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Thumbnail & Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              onClick={() => onNavigate(`/courses/${course.id}`)}
              className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden bg-slate-100 cursor-pointer hidden xs:block"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <span className="absolute bottom-1.5 left-1.5 font-mono text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                {course.code}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {course.code}
                </span>
                <span className="text-[11px] text-slate-500">
                  {course.branch} · Sem {course.semester} · {course.academic_year || '2025-2026'}
                </span>
                {getStatusBadge()}
                {course.category && (
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {course.category}
                  </span>
                )}
              </div>

              <h3
                onClick={() => onNavigate(`/courses/${course.id}`)}
                className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors truncate cursor-pointer"
              >
                {course.title}
              </h3>

              <p className="text-xs text-[#475467] line-clamp-1">
                {course.short_description || course.description}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#667085] pt-0.5">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-slate-400" />
                  <span>{course.total_chapters || 1} units</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-[#2563EB]" />
                  <span>{course.total_lessons} lessons</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>~{hours} hrs</span>
                </span>
                {course.instructor && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>{course.instructor}</span>
                    </span>
                  </>
                )}
                {formatLastStudied(course.last_studied_at) && (
                  <>
                    <span>·</span>
                    <span className="text-slate-500 italic">
                      {formatLastStudied(course.last_studied_at)}
                    </span>
                  </>
                )}
              </div>

              {/* Next recommended lesson */}
              {course.next_recommended_lesson && course.is_enrolled && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#2563EB] pt-0.5">
                  <Compass className="h-3 w-3 shrink-0" />
                  <span className="font-medium text-slate-600">Next lesson:</span>
                  <span
                    onClick={() =>
                      onNavigate(`/courses/${course.id}/learn/${course.next_recommended_lesson?.id}`)
                    }
                    className="font-semibold hover:underline cursor-pointer truncate max-w-xs"
                  >
                    {course.next_recommended_lesson.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Progress & Action Buttons */}
          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
            {/* Progress Bar (if enrolled) */}
            {course.is_enrolled && course.progress_percentage !== undefined && (
              <div className="w-28 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-bold text-[#101828] tabular-nums">
                    {course.progress_percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                    style={{ width: `${course.progress_percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {course.completed_lessons || 0}/{course.total_lessons} done
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {course.is_enrolled ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onNavigate(
                      course.next_recommended_lesson
                        ? `/courses/${course.id}/learn/${course.next_recommended_lesson.id}`
                        : `/courses/${course.id}/learn`
                    )
                  }
                  className="gap-1.5 text-xs shadow-2xs font-semibold"
                >
                  <Play className="h-3 w-3 fill-white" />
                  <span>Continue</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onEnroll ? onEnroll(course.id) : onNavigate(`/courses/${course.id}`)
                  }
                  className="gap-1 text-xs"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}

              {/* Bookmark quick button */}
              {onToggleBookmark && (
                <button
                  type="button"
                  onClick={() => onToggleBookmark(course.id)}
                  aria-label={course.is_bookmarked ? 'Remove bookmark' : 'Bookmark course'}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-500 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      course.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              )}

              {/* Overflow dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="More course actions"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onNavigate(`/courses/${course.id}`)}>
                    <BookOpen className="h-3.5 w-3.5 mr-2 text-slate-500" />
                    <span>View Syllabus</span>
                  </DropdownMenuItem>

                  {course.is_custom && onEditCourse && (
                    <DropdownMenuItem onClick={() => onEditCourse(course)}>
                      <Pencil className="h-3.5 w-3.5 mr-2 text-slate-500" />
                      <span>Edit Course</span>
                    </DropdownMenuItem>
                  )}

                  {onArchiveCourse && (course.is_enrolled || course.is_archived) && (
                    <DropdownMenuItem
                      onClick={() => onArchiveCourse(course.id, !course.is_archived)}
                    >
                      {course.is_archived ? (
                        <>
                          <ArchiveRestore className="h-3.5 w-3.5 mr-2 text-slate-500" />
                          <span>Restore Course</span>
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
                          onRemoveCourse(course.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      <span>Remove Course</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ---------------- GRID VIEW LAYOUT (DEFAULT) ----------------
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className="font-mono font-bold text-xs bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md border border-white/20">
            {course.code}
          </span>

          <div className="flex items-center gap-1.5">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Course options"
                  className="p-1.5 rounded-full bg-slate-900/60 backdrop-blur-xs text-white hover:bg-slate-900/80 transition-colors cursor-pointer"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onNavigate(`/courses/${course.id}`)}>
                  <BookOpen className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  <span>View Syllabus</span>
                </DropdownMenuItem>

                {course.is_custom && onEditCourse && (
                  <DropdownMenuItem onClick={() => onEditCourse(course)}>
                    <Pencil className="h-3.5 w-3.5 mr-2 text-slate-500" />
                    <span>Edit Course</span>
                  </DropdownMenuItem>
                )}

                {onArchiveCourse && (
                  <DropdownMenuItem
                    onClick={() => onArchiveCourse(course.id, !course.is_archived)}
                  >
                    {course.is_archived ? (
                      <>
                        <ArchiveRestore className="h-3.5 w-3.5 mr-2 text-slate-500" />
                        <span>Restore Course</span>
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
                        onRemoveCourse(course.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    <span>Remove Course</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom tags on image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded">
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
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">
              {course.category || 'Core Subject'}
            </span>
            {course.academic_year && <span>{course.academic_year}</span>}
          </div>

          <h3
            onClick={() => onNavigate(`/courses/${course.id}`)}
            className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors line-clamp-1 cursor-pointer"
          >
            {course.title}
          </h3>

          <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">
            {course.short_description || course.description}
          </p>

          {/* Instructor (if available) */}
          {course.instructor && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
              <User className="h-3 w-3 text-slate-400" />
              <span className="truncate">Instructor: {course.instructor}</span>
            </div>
          )}

          {/* Next recommended lesson */}
          {course.next_recommended_lesson && course.is_enrolled && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#2563EB] bg-blue-50/60 p-1.5 rounded-lg border border-blue-100">
              <Compass className="h-3 w-3 shrink-0" />
              <span className="text-slate-600 truncate">
                Next: <strong className="text-[#2563EB]">{course.next_recommended_lesson.title}</strong>
              </span>
            </div>
          )}
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
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  {course.completed_lessons || 0} of {course.total_lessons} lessons completed
                </span>
                {formatLastStudied(course.last_studied_at) && (
                  <span>{formatLastStudied(course.last_studied_at)}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3 text-slate-400" />
                <span>{course.total_chapters || 1} units</span>
              </span>
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
                onClick={() =>
                  onNavigate(
                    course.next_recommended_lesson
                      ? `/courses/${course.id}/learn/${course.next_recommended_lesson.id}`
                      : `/courses/${course.id}/learn`
                  )
                }
                className="w-full gap-1.5 text-xs shadow-2xs font-semibold"
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
                  onClick={() =>
                    onEnroll ? onEnroll(course.id) : onNavigate(`/courses/${course.id}`)
                  }
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
