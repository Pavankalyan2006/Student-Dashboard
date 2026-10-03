import * as React from 'react';
import {
  Compass,
  BookOpen,
  FolderKanban,
  Target,
  Sparkles,
  ArrowRight,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAIContext } from '../hooks/useAIContext';
import { Skeleton } from '../../../components/ui/feedback';

export function ContextPanel({
  onSelectPrompt,
  onCloseMobile,
}: {
  onSelectPrompt: (prompt: string) => void;
  onCloseMobile?: () => void;
}) {
  const { data: context, isLoading } = useAIContext();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 bg-white border-l border-[#E4E7EC] h-full overflow-y-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!context) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#E4E7EC] overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <Compass className="h-4 w-4 text-[#2563EB]" />
          <h3 className="font-bold uppercase tracking-wider text-[11px]">Learning Context</h3>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Student Badge */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#4F46E5]" />
          <span className="font-bold text-slate-900">{context.student.name}</span>
        </div>
        <p className="text-[11px] text-slate-600">
          {context.student.branch} · Sem {context.student.semester}
        </p>
      </div>

      {/* Active Course & Lesson */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
          <BookOpen className="h-3 w-3 text-[#2563EB]" />
          <span>Active Course</span>
        </div>
        <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/30 space-y-2">
          <div>
            <div className="font-bold text-slate-900 truncate">{context.current_course.name}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{context.current_lesson.title}</div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-[#2563EB] rounded-full"
              style={{ width: `${context.current_course.progress}%` }}
            />
          </div>
          <button
            onClick={() =>
              onSelectPrompt(
                `Explain the core concepts and edge cases of ${context.current_lesson.title} from my ${context.current_course.name} syllabus.`
              )
            }
            className="w-full mt-1 py-1 px-2 rounded-lg bg-white border border-blue-200 text-[#2563EB] font-semibold text-[11px] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Ask About This Lesson</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Active Project */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
          <FolderKanban className="h-3 w-3 text-purple-600" />
          <span>Active Project</span>
        </div>
        <div className="p-3 rounded-xl border border-purple-100 bg-purple-50/20 space-y-1.5">
          <div className="font-bold text-slate-900 truncate">{context.current_project.title}</div>
          <div className="text-[11px] text-slate-500">
            <span className="font-medium text-slate-700">Milestone:</span>{' '}
            {context.current_project.milestone}
          </div>
          <button
            onClick={() =>
              onSelectPrompt(
                `Review system design and technical milestones for my capstone: ${context.current_project.title}.`
              )
            }
            className="w-full mt-1 py-1 px-2 rounded-lg bg-white border border-purple-200 text-purple-700 font-semibold text-[11px] hover:bg-purple-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Discuss Architecture</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Target Weak Areas */}
      {context.weak_areas.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
            <Target className="h-3 w-3 text-amber-600" />
            <span>Target Remedial Areas</span>
          </div>
          <div className="space-y-1">
            {context.weak_areas.map((weak, i) => (
              <button
                key={i}
                onClick={() =>
                  onSelectPrompt(
                    `Give me step-by-step intuition and practice problems for my weak topic: ${weak}.`
                  )
                }
                className="w-full p-2 text-left rounded-lg border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50 text-slate-800 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <span className="truncate pr-1 text-[11px] font-medium">{weak}</span>
                <ArrowRight className="h-3 w-3 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-ups */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
          <Sparkles className="h-3 w-3 text-[#4F46E5]" />
          <span>Quick Prompts</span>
        </div>
        <div className="space-y-1">
          {context.suggested_actions.map((act, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(act)}
              className="w-full text-left p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-[11px] text-slate-700 hover:text-indigo-900 cursor-pointer line-clamp-1"
            >
              {act}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
