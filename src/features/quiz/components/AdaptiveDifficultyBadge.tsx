import React from 'react';
import { QuizDifficulty } from '../types/quiz';
import { Zap } from 'lucide-react';

interface AdaptiveDifficultyBadgeProps {
  difficulty: QuizDifficulty;
  isAdaptive?: boolean;
  className?: string;
}

export const AdaptiveDifficultyBadge: React.FC<AdaptiveDifficultyBadgeProps> = ({
  difficulty,
  isAdaptive = false,
  className = '',
}) => {
  const getStyles = () => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'EASY':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'HARD':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'ADVANCED':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyles()} ${className}`}
    >
      {isAdaptive && <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />}
      <span>{difficulty}</span>
      {isAdaptive && <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">(Adaptive)</span>}
    </span>
  );
};
