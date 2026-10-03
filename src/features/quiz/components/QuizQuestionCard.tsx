import React from 'react';
import { QuizDeliveryQuestion } from '../types/quiz';
import { Flag, CheckSquare, Square, Check, Terminal } from 'lucide-react';

interface QuizQuestionCardProps {
  question: QuizDeliveryQuestion;
  selectedAnswer: string | string[] | null;
  onAnswerChange: (answer: string | string[]) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  className?: string;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
  isFlagged,
  onToggleFlag,
  className = '',
}) => {
  const qType = question.question_type;

  // Handle MCQ selection
  const handleMcqSelect = (opt: string) => {
    onAnswerChange(opt);
  };

  // Handle Multi-Select selection
  const handleMultiSelectToggle = (opt: string) => {
    const current = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
    const index = current.indexOf(opt);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(opt);
    }
    onAnswerChange(current);
  };

  // Handle True / False selection
  const handleTrueFalseSelect = (val: 'True' | 'False') => {
    onAnswerChange(val);
  };

  // Handle Short Answer / Code Output text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onAnswerChange(e.target.value);
  };

  const isMultiSelected = (opt: string) => {
    return Array.isArray(selectedAnswer) && selectedAnswer.includes(opt);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm ${className}`}>
      {/* Header with Type & Flag */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {qType.replace('_', ' ')}
          </span>
          {question.topic_name && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Topic: {question.topic_name}
            </span>
          )}
        </div>

        <button
          onClick={onToggleFlag}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
            isFlagged
              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Flag question for later review"
        >
          <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-600' : ''}`} />
          <span>{isFlagged ? 'Flagged' : 'Flag Question'}</span>
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-4">
        {question.question_text}
      </h3>

      {/* Code Snippet for CODE_OUTPUT or general snippet */}
      {question.metadata?.code_snippet && (
        <div className="mb-6 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 text-slate-100 p-4 font-mono text-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              {question.metadata.language || 'Code Execution Snippet'}
            </span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap">{question.metadata.code_snippet}</pre>
        </div>
      )}

      {/* Options Rendering Based on Type */}

      {/* 1. MCQ */}
      {qType === 'MCQ' && question.options && (
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const letter = String.fromCharCode(65 + idx);
            return (
              <label
                key={idx}
                onClick={() => handleMcqSelect(opt)}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : letter}
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 pt-0.5 leading-normal">
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* 2. MULTI_SELECT */}
      {qType === 'MULTI_SELECT' && question.options && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 italic">
            Select all choices that apply.
          </p>
          {question.options.map((opt, idx) => {
            const checked = isMultiSelected(opt);
            return (
              <label
                key={idx}
                onClick={() => handleMultiSelectToggle(opt)}
                className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="pt-0.5">
                  {checked ? (
                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-normal">
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* 3. TRUE / FALSE */}
      {qType === 'TRUE_FALSE' && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {(['True', 'False'] as const).map((val) => {
            const isSelected = selectedAnswer === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleTrueFalseSelect(val)}
                className={`py-6 rounded-xl border font-bold text-base transition-all flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? val === 'True'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500'
                      : 'border-rose-600 bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 shadow-sm ring-2 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-200'
                }`}
              >
                <span>{val}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. SHORT_ANSWER */}
      {qType === 'SHORT_ANSWER' && (
        <div className="space-y-2 mt-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Enter your concise technical answer or complexity notation:
          </label>
          <input
            type="text"
            value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
            onChange={handleTextChange}
            placeholder="e.g. O(V + E) or Priority Inversion"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">
            Grading evaluates theoretical keywords, exact asymptotic terms, and standard nomenclature.
          </p>
        </div>
      )}

      {/* 5. CODE_OUTPUT */}
      {qType === 'CODE_OUTPUT' && (
        <div className="space-y-2 mt-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            What will be printed to stdout?
          </label>
          <textarea
            rows={3}
            value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
            onChange={handleTextChange}
            placeholder="Exact console output..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          />
        </div>
      )}
    </div>
  );
};
