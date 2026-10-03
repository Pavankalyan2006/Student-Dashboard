import * as React from 'react';
import {
  Sparkles,
  Bot,
  HelpCircle,
  FileQuestion,
  Lightbulb,
  Code2,
  Briefcase,
  X,
  ArrowRight,
  Files,
} from 'lucide-react';
import { useUiStore } from '../../../store/uiStore';

export function CourseAIActions({
  courseTitle,
  lessonTitle,
  courseId,
  lessonId,
  onNavigate,
  onClose,
}: {
  courseTitle: string;
  lessonTitle: string;
  courseId?: string;
  lessonId?: string;
  onNavigate: (path: string) => void;
  onClose?: () => void;
}) {
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);

  const handleAction = (template: string) => {
    const prompt = `${template} for "${lessonTitle}" in my "${courseTitle}" B.Tech coursework.`;
    setAiInitialPrompt(prompt);
    onClose?.();
    onNavigate('/ai-agent');
  };

  const handleGenerateNotes = () => {
    onClose?.();
    if (courseId && lessonId) {
      onNavigate(`/notes?course_id=${courseId}&lesson_id=${lessonId}`);
    } else {
      onNavigate('/notes');
    }
  };

  const actions = [
    {
      label: 'Practice in Coding Lab',
      desc: 'Open live sandbox workspace to implement algorithms for this lesson.',
      onClick: () => {
        onClose?.();
        onNavigate(`/coding/editor?courseId=${courseId || ''}&lessonId=${lessonId || ''}`);
      },
      icon: Code2,
      highlight: true,
    },
    {
      label: 'Take Quiz on this Lesson',
      desc: 'Adaptive assessment calibrated directly to this lesson syllabus.',
      onClick: () => {
        onClose?.();
        onNavigate(`/quiz/create?courseId=${courseId || ''}&lessonId=${lessonId || ''}&topic=${encodeURIComponent(lessonTitle)}&source_type=LESSON`);
      },
      icon: HelpCircle,
      highlight: true,
    },
    {
      label: 'Generate structured notes',
      desc: 'Create comprehensive revision notes with formulas & code.',
      onClick: handleGenerateNotes,
      icon: Sparkles,
      highlight: true,
    },
    {
      label: 'Ask from my documents',
      desc: 'Ground questions using your uploaded textbooks and study materials.',
      onClick: () => {
        onClose?.();
        onNavigate(`/documents?course_id=${courseId || ''}&topic=${encodeURIComponent(lessonTitle)}`);
      },
      icon: Files,
      highlight: true,
    },
    {
      label: 'Explain this lesson step-by-step',
      desc: 'Intuitive breakdown with invariants and asymptotic analysis.',
      template: 'Explain the core concepts, invariants, and mathematical intuition',
      icon: Lightbulb,
    },
    {
      label: 'Simplify this concept',
      desc: 'Plain English explanation for beginner intuition.',
      template: 'Simplify and explain in plain English without excessive academic jargon',
      icon: Bot,
    },
    {
      label: 'Give me practical code examples',
      desc: 'Production C++ / TypeScript code snippets with commentary.',
      template: 'Provide clean, well-commented code implementations',
      icon: Code2,
    },
    {
      label: 'Generate a 5-question quiz',
      desc: 'Multiple-choice diagnostic quiz with answer rubrics.',
      template: 'Generate a 5-question multiple choice diagnostic quiz with explanations',
      icon: HelpCircle,
    },
    {
      label: 'Technical interview questions',
      desc: 'Common Tier-1 campus placement screening problems.',
      template: 'Give me top campus placement interview questions and edge cases',
      icon: Briefcase,
    },
    {
      label: 'Create revision flashcards',
      desc: 'Key formula definitions and algorithmic invariants.',
      template: 'Create a concise set of revision flashcards and formula summaries',
      icon: FileQuestion,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#E4E7EC] p-4 space-y-4 text-xs overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">AI Lesson Assistant</h3>
            <p className="text-[10px] text-slate-500 truncate max-w-[190px]">{lessonTitle}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-600 leading-relaxed text-[11px]">
        Select an action below to consult the AI Learning Agent with complete context of{' '}
        <span className="font-semibold text-slate-900">{lessonTitle}</span>.
      </p>

      {/* Action Buttons */}
      <div className="space-y-2">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => (act.onClick ? act.onClick() : handleAction(act.template!))}
              className={`w-full p-3 rounded-xl border transition-all text-left space-y-1 cursor-pointer group shadow-2xs ${
                (act as any).highlight
                  ? 'border-blue-300 bg-blue-50/60 hover:bg-blue-100/60'
                  : 'border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 group-hover:text-indigo-900">
                  <Icon className="h-3.5 w-3.5 text-[#2563EB] group-hover:text-[#4F46E5]" />
                  <span>{act.label}</span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pl-5.5">{act.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
