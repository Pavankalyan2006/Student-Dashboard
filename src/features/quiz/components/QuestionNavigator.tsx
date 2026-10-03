import React from 'react';
import { QuizDeliveryQuestion } from '../types/quiz';
import { Flag, Check } from 'lucide-react';

interface QuestionNavigatorProps {
  questions: QuizDeliveryQuestion[];
  currentIndex: number;
  answers: Record<string, string | string[]>;
  flaggedQuestionIds: string[];
  onSelectQuestion: (index: number) => void;
  className?: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestionIds,
  onSelectQuestion,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Question Navigator
        </h4>
        <span className="text-xs font-medium text-slate-400">
          {Object.keys(answers).length} / {questions.length} Answered
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered =
            answers[q.id] !== undefined &&
            answers[q.id] !== null &&
            answers[q.id] !== '' &&
            (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : true);
          const isFlagged = flaggedQuestionIds.includes(q.id);

          let btnClass = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400';

          if (isCurrent) {
            btnClass = 'ring-2 ring-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold border-blue-400';
          } else if (isAnswered) {
            btnClass = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-medium';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(idx)}
              className={`relative h-10 w-full rounded-lg border text-sm flex items-center justify-center transition-all ${btnClass}`}
              title={`Jump to Question ${idx + 1}`}
              aria-label={`Question ${idx + 1}${isAnswered ? ', Answered' : ''}${isFlagged ? ', Flagged' : ''}${isCurrent ? ', Current' : ''}`}
            >
              <span>{idx + 1}</span>

              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm">
                  <Flag className="w-2 h-2 fill-current" />
                </span>
              )}

              {isAnswered && !isCurrent && (
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Navigator Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-50 border border-blue-400 dark:bg-blue-950/70" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/40" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300 dark:bg-slate-800" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500 flex items-center justify-center">
            <Flag className="w-2 h-2 text-white fill-current" />
          </div>
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );
};
