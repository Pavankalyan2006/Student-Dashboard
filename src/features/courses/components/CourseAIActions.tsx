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
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ListChecks,
  Compass,
} from 'lucide-react';
import { useUiStore } from '../../../store/uiStore';
import { Button } from '../../../components/ui/button';
import { coursesApi } from '../api/coursesApi';
import { CourseAIAssistantResponse } from '../types/courses';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { toast } from 'sonner';

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

  const [activeResult, setActiveResult] = React.useState<CourseAIAssistantResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const executeAiAction = async (action: string) => {
    if (!courseId) {
      handleOpenInFullAgent(action);
      return;
    }

    setIsLoading(true);
    setActiveResult(null);

    try {
      const res = await coursesApi.executeAiAssistant(courseId, {
        action: action as any,
        topic: lessonTitle,
        lessonId,
      });
      setActiveResult(res);
      toast.success('AI insights ready!');
    } catch (err: any) {
      toast.error(err?.message || 'AI request failed');
      handleOpenInFullAgent(action);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInFullAgent = (actionName: string) => {
    const prompt = `I am currently studying the lesson "${lessonTitle}" in course "${courseTitle}". Please ${actionName} with clear technical explanations and examples.`;
    setAiInitialPrompt(prompt);
    onClose?.();
    onNavigate('/ai-agent');
  };

  const handleCopy = () => {
    if (activeResult?.result) {
      navigator.clipboard.writeText(activeResult.result);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const aiActions = [
    {
      id: 'explain_simple',
      label: 'Explain in Simple Language',
      desc: 'Intuitive plain-English breakdown with conceptual clarity.',
      icon: Bot,
      category: 'explanations',
    },
    {
      id: 'practical_example',
      label: 'Explain with Practical Example',
      desc: 'Real-world software engineering application & code snippet.',
      icon: Code2,
      category: 'explanations',
    },
    {
      id: 'step_by_step',
      label: 'Step-by-Step Breakdown',
      desc: 'Detailed invariants, mathematical formulation & proofs.',
      icon: Lightbulb,
      category: 'explanations',
    },
    {
      id: 'summarize_chapter',
      label: 'Summarize Key Concepts',
      desc: 'High-density revision summary of essential principles.',
      icon: ListChecks,
      category: 'revision',
    },
    {
      id: 'revision_notes',
      label: 'Generate Revision Notes',
      desc: 'Structured notes with core definitions & exam focal points.',
      icon: Sparkles,
      category: 'revision',
    },
    {
      id: 'practice_questions',
      label: 'Create Practice Questions',
      desc: 'Multiple-choice and conceptual viva examination questions.',
      icon: HelpCircle,
      category: 'practice',
    },
    {
      id: 'flashcards',
      label: 'Create Revision Flashcards',
      desc: 'Key formula definitions and algorithmic invariants.',
      icon: FileQuestion,
      category: 'practice',
    },
    {
      id: 'explain_terms',
      label: 'Explain Difficult Terminology',
      desc: 'Glossary of specialized engineering terms in this lesson.',
      icon: Briefcase,
      category: 'explanations',
    },
    {
      id: 'revision_checklist',
      label: 'Generate Revision Checklist',
      desc: 'Confidence check for exam readiness and viva questions.',
      icon: Check,
      category: 'revision',
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
            <p className="text-[10px] text-slate-500 truncate max-w-[170px]">{lessonTitle}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick shortcuts to other modules */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            onNavigate(`/coding/editor?courseId=${courseId || ''}&lessonId=${lessonId || ''}`);
          }}
          className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer"
        >
          <Code2 className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Coding Lab</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose?.();
            onNavigate(
              `/quiz/create?courseId=${courseId || ''}&lessonId=${lessonId || ''}&topic=${encodeURIComponent(
                lessonTitle
              )}&source_type=LESSON`
            );
          }}
          className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-colors flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
          <span>Lesson Quiz</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-6 text-center space-y-2 border border-blue-200 rounded-xl bg-blue-50/50">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#2563EB]" />
          <p className="font-bold text-blue-900 text-xs">Consulting AI Assistant...</p>
          <p className="text-[10px] text-blue-600">
            Calibrating response with {courseTitle} syllabus context
          </p>
        </div>
      )}

      {/* Active in-panel AI Result */}
      {activeResult && !isLoading && (
        <div className="space-y-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/30">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
            <span className="font-bold text-blue-950 capitalize flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>{activeResult.action.replace(/_/g, ' ')}</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy response"
                className="p-1 rounded text-slate-500 hover:text-slate-800"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveResult(null)}
                title="Close result"
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-slate-800 text-[11px] leading-relaxed max-h-60 overflow-y-auto">
            <MarkdownContent content={activeResult.result} />
          </div>

          {activeResult.key_points && activeResult.key_points.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-blue-100 text-[10px]">
              <span className="font-bold text-blue-900">Key Points:</span>
              <ul className="list-disc pl-3 text-slate-700 space-y-0.5">
                {activeResult.key_points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {activeResult.flashcards && activeResult.flashcards.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-blue-100 text-[10px]">
              <span className="font-bold text-blue-900">Sample Flashcards:</span>
              {activeResult.flashcards.slice(0, 2).map((fc, i) => (
                <div key={i} className="p-2 rounded bg-white border border-blue-100 space-y-0.5">
                  <div className="font-bold text-slate-800">Q: {fc.front}</div>
                  <div className="text-slate-600">A: {fc.back}</div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenInFullAgent(activeResult.action)}
            className="w-full text-[11px] gap-1 text-[#2563EB]"
          >
            <span>Continue in Full AI Agent</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* AI Prompts list */}
      <div className="space-y-2">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
          Context-Aware Prompts
        </p>

        {aiActions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              disabled={isLoading}
              onClick={() => executeAiAction(act.id)}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all text-left space-y-0.5 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors text-[11px]">
                  <Icon className="h-3.5 w-3.5 text-blue-600" />
                  <span>{act.label}</span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-500 leading-snug line-clamp-1">{act.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
