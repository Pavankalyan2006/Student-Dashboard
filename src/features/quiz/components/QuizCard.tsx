import React from 'react';
import { Quiz } from '../types/quiz';
import { QuizSourceBadge } from './QuizSourceBadge';
import { AdaptiveDifficultyBadge } from './AdaptiveDifficultyBadge';
import { Button } from '../../../components/ui/button';
import { Clock, HelpCircle, ArrowRight, Play, CheckCircle2, RotateCcw, BookOpen } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
  lastAttemptScore?: number;
  onNavigate?: (path: string) => void;
  onDelete?: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, lastAttemptScore, onNavigate, onDelete }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const timeFormatted = quiz.time_limit_seconds
    ? `${Math.round(quiz.time_limit_seconds / 60)} mins`
    : 'Untimed';

  const isCompleted = quiz.status === 'COMPLETED' || lastAttemptScore !== undefined;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <QuizSourceBadge sourceType={quiz.source_type} />
          <AdaptiveDifficultyBadge
            difficulty={quiz.difficulty}
            isAdaptive={quiz.adaptive_mode}
          />
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-base line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {quiz.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {quiz.description || 'Comprehensive assessment designed to evaluate and strengthen engineering domain concepts.'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {quiz.question_count} Questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {timeFormatted}
          </span>
          {lastAttemptScore !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Score: {lastAttemptScore}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 text-xs"
                onClick={() => navigate(`/quiz/${quiz.id}/review`)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Review
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 text-xs"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="w-full flex items-center justify-center gap-1.5"
              onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Assessment
            </Button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
              className="text-slate-400 hover:text-red-500 p-2 text-xs transition-colors shrink-0"
              title="Delete Quiz"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
