import React, { useEffect, useState } from 'react';
import { quizApi } from '../api/quizApi';
import { QuizResult, Quiz } from '../types/quiz';
import { Button } from '../../../components/ui/button';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizResultPageProps {
  quizId?: string;
  onNavigate?: (path: string) => void;
}

export const QuizResultPage: React.FC<QuizResultPageProps> = ({ quizId: propQuizId, onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const quizId = propQuizId || (typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '');
  const [result, setResult] = useState<QuizResult | null>(
    (typeof window !== 'undefined' && (window as any).__QUIZ_RESULT_STATE__?.result) || null
  );
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(!result);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    const loadResult = async () => {
      try {
        setLoading(true);
        const fetchedQuiz = await quizApi.getQuiz(quizId);
        setQuiz(fetchedQuiz);

        if (!result) {
          const attempts = await quizApi.getAttempts(quizId);
          const completed = attempts.filter((a) => a.status === 'COMPLETED');
          if (completed.length > 0) {
            const latest = completed[0];
            // Fetch review to reconstruct result
            const review = await quizApi.getAttemptReview(latest.id);
            setResult({
              attempt_id: latest.id,
              quiz_id: quizId,
              quiz_title: fetchedQuiz.title,
              score: latest.score,
              correct_count: latest.correct_count,
              incorrect_count: latest.incorrect_count,
              unanswered_count: latest.unanswered_count,
              time_taken_seconds: latest.time_taken_seconds,
              completed_at: latest.completed_at,
              topic_breakdown: Array.isArray(review.topic_breakdown)
                ? review.topic_breakdown
                : Object.entries(review.topic_breakdown || {}).map(([topic, stats]: any) => ({
                    topic,
                    total: stats.total,
                    correct: stats.correct,
                    accuracy: stats.accuracy,
                  })),
              passed: latest.score >= 60,
              recommended_actions: review.recommended_actions || [],
            });
          }
        }
      } catch (err: any) {
        toast.error('Failed to load result', { description: err.message });
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [quizId, result]);

  const handleRetryMissed = async () => {
    if (!result || !quizId) return;
    try {
      setRetrying(true);
      const res = await quizApi.retryQuiz(quizId, result.attempt_id);
      toast.success('Retry Session Ready!', {
        description: 'Practice quiz focusing on missed questions generated.',
      });
      navigate(`/quiz/${res.quiz.id}`);
    } catch (err: any) {
      toast.error('Failed to generate retry quiz', { description: err.message });
    } finally {
      setRetrying(false);
    }
  };

  if (loading || !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Calculating final authoritative marks...
        </p>
      </div>
    );
  }

  const passed = result.score >= 60;
  const minutes = Math.floor(result.time_taken_seconds / 60);
  const seconds = result.time_taken_seconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Score Hero Card */}
      <div
        className={`rounded-2xl p-8 text-center border shadow-sm transition-all ${
          passed
            ? 'bg-gradient-to-b from-emerald-50/70 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800'
            : 'bg-gradient-to-b from-amber-50/70 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800'
        }`}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-inner bg-white dark:bg-slate-900 border">
          <span
            className={`text-2xl font-black ${
              passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {result.score}%
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {passed ? 'Assessment Completed Successfully!' : 'Assessment Complete — Further Practice Advised'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
          {quiz?.title || result.quiz_title}
        </p>

        {/* Aggregate Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {result.correct_count}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-0.5">
              <XCircle className="w-3.5 h-3.5" /> Incorrect
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {result.incorrect_count}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-semibold mb-0.5">
              <HelpCircle className="w-3.5 h-3.5" /> Skipped
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {result.unanswered_count}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-0.5">
              <Clock className="w-3.5 h-3.5" /> Time Taken
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {timeFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* Topic-Wise Breakdown */}
      {result.topic_breakdown && result.topic_breakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Performance by Conceptual Topic
          </h3>

          <div className="space-y-4">
            {result.topic_breakdown.map((t, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span>{t.topic}</span>
                  <span className="font-bold">
                    {t.correct} / {t.total} ({t.accuracy}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      t.accuracy >= 80
                        ? 'bg-emerald-500'
                        : t.accuracy >= 60
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, t.accuracy))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Actions */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Recommended Pedagogical Next Steps
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {result.recommended_actions?.map((action, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                {idx + 1}
              </div>
              <span className="pt-0.5 leading-relaxed">{action}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="primary"
            onClick={() => navigate(`/quiz/${quizId}/review`)}
            className="flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Review Questions & Explanations
          </Button>

          {result.incorrect_count > 0 && (
            <Button
              variant="outline"
              disabled={retrying}
              onClick={handleRetryMissed}
              className="flex items-center gap-1.5 border-amber-300 hover:bg-amber-50 dark:border-amber-700"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              {retrying ? 'Preparing Retry...' : `Retry ${result.incorrect_count} Missed Questions`}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/quiz')}
          >
            Back to Quiz Hub
          </Button>
        </div>
      </div>
    </div>
  );
};
