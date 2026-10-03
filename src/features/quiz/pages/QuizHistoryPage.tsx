import React, { useEffect, useState } from 'react';
import { quizApi } from '../api/quizApi';
import { QuizAttempt } from '../types/quiz';
import { QuizSourceBadge } from '../components/QuizSourceBadge';
import { AdaptiveDifficultyBadge } from '../components/AdaptiveDifficultyBadge';
import { Button } from '../../../components/ui/button';
import {
  ArrowLeft,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Filter,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizHistoryPageProps {
  onNavigate?: (path: string) => void;
}

export const QuizHistoryPage: React.FC<QuizHistoryPageProps> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  const [attempts, setAttempts] = useState<(QuizAttempt & { quiz_title?: string; quiz_difficulty?: string; source_type?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getAttempts();
      setAttempts(data);
    } catch (err: any) {
      toast.error('Failed to load quiz history', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filtered = attempts
    .filter((a) => {
      const matchesSearch = (a.quiz_title || 'Quiz').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.score - a.score;
      }
      return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Quiz Hub
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Assessment History & Records
            </h1>
            <p className="text-xs text-slate-500">
              Track previous assessment performances, completed scores, and review attempts.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/quiz/create')}
        >
          New Quiz
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quiz title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ABANDONED">Abandoned</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Table / List View */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading attempt logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            No Assessment Attempts Found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete your first quiz to record attempts, marks, and detailed answer keys.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/quiz')}
            className="mt-4"
          >
            Start a Quiz
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((att) => {
            const isDone = att.status === 'COMPLETED';
            const minutes = Math.floor(att.time_taken_seconds / 60);
            const seconds = att.time_taken_seconds % 60;

            return (
              <div
                key={att.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <QuizSourceBadge sourceType={(att.source_type as any) || 'TOPIC'} />
                    <AdaptiveDifficultyBadge difficulty={(att.quiz_difficulty as any) || 'MEDIUM'} />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {att.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {att.quiz_title || 'Academic Assessment'}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {new Date(att.started_at).toLocaleDateString()} at{' '}
                      {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {minutes}m {seconds}s
                    </span>
                    {isDone && (
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-600 font-semibold">{att.correct_count} Correct</span>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold">{att.incorrect_count} Incorrect</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  {isDone ? (
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {att.score}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Final Mark
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 font-medium">Incomplete</div>
                  )}

                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/quiz/${att.quiz_id}/review`)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Review
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/quiz/${att.quiz_id}`)}
                        className="flex items-center gap-1 text-xs"
                      >
                        Resume
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/quiz/${att.quiz_id}`)}
                      className="text-xs"
                      title="Retake Quiz"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
