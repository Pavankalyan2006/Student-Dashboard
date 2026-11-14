import * as React from 'react';
import { CheckCircle2, Circle, Play, ArrowLeft, ChevronDown, ChevronRight, X } from 'lucide-react';
import { CourseChapterWithLessons } from '../types/courses';

export function LessonNavigation({
  courseTitle,
  courseCode,
  courseId,
  chapters,
  currentLessonId,
  onSelectLesson,
  onBackToCourse,
  onCloseMobile,
}: {
  courseTitle: string;
  courseCode: string;
  courseId: string;
  chapters: CourseChapterWithLessons[];
  currentLessonId?: string;
  onSelectLesson: (lessonId: string) => void;
  onBackToCourse: () => void;
  onCloseMobile?: () => void;
}) {
  const [collapsedChapters, setCollapsedChapters] = React.useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedLessons = chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.is_completed).length,
    0
  );
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden text-xs">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToCourse}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Course Syllabus</span>
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-700 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div>
          <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
            {courseCode}
          </span>
          <h2 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{courseTitle}</h2>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{completedLessons} / {totalLessons} Lessons</span>
            <span className="font-bold text-slate-900 tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters & Lessons Accordion List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chapters.map((ch, idx) => {
          const isCollapsed = collapsedChapters[ch.id];
          return (
            <div key={ch.id} className="space-y-1">
              {/* Chapter Header Toggle */}
              <button
                type="button"
                onClick={() => toggleChapter(ch.id)}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 text-left font-bold text-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}</span>
                  <span className="truncate text-xs">{ch.title}</span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Lessons List */}
              {!isCollapsed && (
                <div className="space-y-0.5 pl-2">
                  {ch.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLessonId;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          onSelectLesson(lesson.id);
                          onCloseMobile?.();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-50/80 text-blue-600 font-bold border border-blue-200/80 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-1">
                          {lesson.is_completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100 shrink-0" />
                          ) : isCurrent ? (
                            <Play className="h-3.5 w-3.5 fill-blue-600 text-blue-600 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate text-xs">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {lesson.estimated_minutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
