import * as React from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles,
  Trophy,
  Bookmark,
  Share2,
} from 'lucide-react';
import { LessonWithNavigation } from '../types/courses';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export function LessonContent({
  lesson,
  onComplete,
  isCompleting,
  onNavigateLesson,
  onOpenAI,
  onBackToCourse,
}: {
  lesson: LessonWithNavigation;
  onComplete: () => void;
  isCompleting: boolean;
  onNavigateLesson: (lessonId: string) => void;
  onOpenAI: () => void;
  onBackToCourse?: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  const toggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    toast.success(!isBookmarked ? 'Lesson bookmarked' : 'Bookmark removed');
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2 truncate">
          {onBackToCourse && (
            <button
              onClick={onBackToCourse}
              className="text-blue-600 hover:underline font-semibold cursor-pointer truncate max-w-[120px]"
            >
              {lesson.course_title}
            </button>
          )}
          <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
            {lesson.course_code}
          </span>
          <span className="text-slate-400">/</span>
          <span className="truncate max-w-[180px]">{lesson.chapter_title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${
                isBookmarked ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>

          <button
            onClick={onOpenAI}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Main Reading Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Lesson Header */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{lesson.estimated_minutes} min read</span>
            </span>
            <span>·</span>
            <span className="capitalize">{lesson.lesson_type.toLowerCase()} Lesson</span>
            {lesson.is_completed && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Completed</span>
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Technical Content / Empty State */}
        {!lesson.content || !lesson.content.trim() ? (
          <div className="py-12 text-center space-y-3 border border-dashed rounded-2xl p-8 bg-slate-50/50">
            <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No content uploaded for this lesson</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This module is part of the curriculum structure. You can ask the AI Assistant to generate study notes or practical code examples.
            </p>
            <Button variant="primary" size="sm" onClick={onOpenAI} className="gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Lesson Content with AI</span>
            </Button>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base">
            <MarkdownContent content={lesson.content} />
          </div>
        )}

        {/* Bottom Interactive Complete & Navigation Bar */}
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                {lesson.is_completed ? 'Lesson Completed' : 'Finished studying this lesson?'}
              </h4>
              <p className="text-[11px] text-slate-500">
                {lesson.is_completed
                  ? 'Your progress is recorded and synchronized with your learning dashboard.'
                  : 'Mark as complete to update your semester course progress.'}
              </p>
            </div>

            <Button
              variant={lesson.is_completed ? 'outline' : 'primary'}
              size="md"
              disabled={isCompleting || lesson.is_completed}
              onClick={onComplete}
              className="gap-2 shrink-0 font-semibold"
            >
              <CheckCircle2 className={`h-4 w-4 ${lesson.is_completed ? 'text-emerald-600' : ''}`} />
              <span>{lesson.is_completed ? 'Lesson Completed ✓' : 'Mark as Complete'}</span>
            </Button>
          </div>

          {/* Previous / Next Lesson Navigation */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {lesson.prev_lesson ? (
              <button
                type="button"
                onClick={() => onNavigateLesson(lesson.prev_lesson!.id)}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left max-w-xs cursor-pointer group"
              >
                <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Previous
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {lesson.prev_lesson.title}
                  </div>
                </div>
              </button>
            ) : (
              <div />
            )}

            {lesson.next_lesson ? (
              <button
                type="button"
                onClick={() => onNavigateLesson(lesson.next_lesson!.id)}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-right max-w-xs ml-auto cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Next Lesson
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {lesson.next_lesson.title}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 ml-auto border border-emerald-200">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span>Final Lesson in Course!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
