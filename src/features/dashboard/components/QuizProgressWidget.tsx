import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../../quiz/api/quizApi';
import { HelpCircle, ArrowRight, BrainCircuit, Target, Sparkles } from 'lucide-react';

export const QuizProgressWidget: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { data: progress } = useQuery({
    queryKey: ['quiz-progress-dashboard'],
    queryFn: () => quizApi.getProgress().catch(() => null),
  });

  const accuracy = Math.round(progress?.accuracy_rate ?? progress?.overall_accuracy ?? 0);
  const rawWeakTopic = (progress?.weak_areas && progress.weak_areas.length > 0)
    ? progress.weak_areas[0]
    : (progress?.weak_topics && progress.weak_topics.length > 0)
      ? progress.weak_topics[0]
      : null;

  const weakTopic = rawWeakTopic
    ? typeof rawWeakTopic === 'object'
      ? {
          topic_name: rawWeakTopic.topic_name,
          accuracy_rate: Math.round(rawWeakTopic.accuracy ?? (rawWeakTopic as any).accuracy_rate ?? 0),
          total_questions: rawWeakTopic.total_questions ?? rawWeakTopic.questions_answered ?? 0,
        }
      : {
          topic_name: String(rawWeakTopic),
          accuracy_rate: 45,
          total_questions: 5,
        }
    : null;

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-lg">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">AI Quiz & Assessments</h3>
            <p className="text-[11px] text-slate-500">Adaptive testing & weak area remediation</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/quiz')}
          className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>Quiz Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Metric Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Quizzes</span>
          <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">
            {progress?.completed_quizzes ?? 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Questions</span>
          <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
            {progress?.questions_answered ?? 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <span className="text-[10px] text-slate-500 block">Accuracy</span>
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
            {accuracy}%
          </span>
        </div>
      </div>

      {/* Weak Area or Featured Adaptive Practice */}
      {weakTopic ? (
        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3 text-amber-600" />
              Weak Area Detected
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
              {weakTopic.topic_name}
            </h4>
            <p className="text-[10px] text-slate-500">
              {weakTopic.accuracy_rate}% accuracy across {weakTopic.total_questions} questions
            </p>
          </div>
          <button
            onClick={() => onNavigate(`/quiz/create?topic=${encodeURIComponent(weakTopic.topic_name)}&difficulty=EASY`)}
            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] shrink-0 cursor-pointer shadow-2xs"
          >
            Practice
          </button>
        </div>
      ) : (
        <div className="p-3 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Adaptive Practice
            </span>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Targeted Concept Revision
            </h4>
            <p className="text-[10px] text-slate-500">
              Dynamic difficulty that adjusts to your response streaks
            </p>
          </div>
          <button
            onClick={() => onNavigate('/quiz/create')}
            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-[11px] shrink-0 cursor-pointer shadow-2xs"
          >
            Start Quiz
          </button>
        </div>
      )}
    </div>
  );
};
