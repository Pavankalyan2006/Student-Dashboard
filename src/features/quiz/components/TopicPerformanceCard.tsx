import React from 'react';
import { TopicPerformance } from '../types/quiz';
import { Target, Award, AlertCircle } from 'lucide-react';

interface TopicPerformanceCardProps {
  performance: TopicPerformance;
  onPractice?: (topicId: string, topicName: string) => void;
}

export const TopicPerformanceCard: React.FC<TopicPerformanceCardProps> = ({
  performance,
  onPractice,
}) => {
  const accuracy = performance.accuracy;

  const getStatusBadge = () => {
    if (accuracy >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Award className="w-3 h-3" />
          Mastered
        </span>
      );
    }
    if (accuracy >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Target className="w-3 h-3" />
          Proficient
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-3 h-3" />
        Needs Practice
      </span>
    );
  };

  const getBarColor = () => {
    if (accuracy >= 80) return 'bg-emerald-500';
    if (accuracy >= 60) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  const totalQuestions = performance.total_questions || performance.questions_answered || 0;
  const correctCount = performance.correct_answers || performance.correct_count || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
            {performance.topic_name}
          </h4>
          {getStatusBadge()}
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Accuracy</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{accuracy}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
              style={{ width: `${Math.min(100, Math.max(5, accuracy))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {correctCount} / {totalQuestions} Correct
        </span>
        {onPractice && (
          <button
            onClick={() => onPractice(performance.topic_id, performance.topic_name)}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Practice Topic →
          </button>
        )}
      </div>
    </div>
  );
};
