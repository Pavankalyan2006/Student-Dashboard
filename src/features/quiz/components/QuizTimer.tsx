import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface QuizTimerProps {
  secondsRemaining: number;
  className?: string;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ secondsRemaining, className = '' }) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining > 0 && secondsRemaining <= 60;
  const isWarning = secondsRemaining > 60 && secondsRemaining <= 180;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getColorClasses = () => {
    if (isUrgent) {
      return 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800 animate-pulse';
    }
    if (isWarning) {
      return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${minutes} minutes and ${seconds} seconds`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-semibold text-sm ${getColorClasses()} ${className}`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
      ) : (
        <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      )}
      <span>{formattedTime}</span>
    </div>
  );
};
