import React, { useEffect, useState } from 'react';
import { quizApi } from '../api/quizApi';
import { Quiz, QuizAttempt, QuizProgress } from '../types/quiz';
import { QuizCard } from '../components/QuizCard';
import { WeakAreaCard } from '../components/WeakAreaCard';
import { TopicPerformanceCard } from '../components/TopicPerformanceCard';
import { Button } from '../../../components/ui/button';
import {
  BrainCircuit,
  PlusCircle,
  History,
  TrendingUp,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizPageProps {
  onNavigate?: (path: string) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<(QuizAttempt & { quiz_title?: string })[]>([]);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedQuizzes, fetchedAttempts, fetchedProgress] = await Promise.all([
        quizApi.getQuizzes(),
        quizApi.getAttempts(),
        quizApi.getQuizProgress(),
      ]);
      setQuizzes(fetchedQuizzes);
      setAttempts(fetchedAttempts);
      setProgress(fetchedProgress);
    } catch (err: any) {
      toast.error('Failed to load quizzes', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const activeAttempts = attempts.filter((a) => a.status === 'IN_PROGRESS');
  const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');

  // Map of last attempt scores by quiz_id
  const attemptScoresMap = new Map<string, number>();
  for (const a of completedAttempts) {
    if (!attemptScoresMap.has(a.quiz_id)) {
      attemptScoresMap.set(a.quiz_id, a.score);
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await quizApi.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully');
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (err: any) {
      toast.error('Failed to delete quiz', { description: err.message });
    }
  };

  const handleGenerateRevision = (topicName: string) => {
    navigate(`/quiz/create?topic=${encodeURIComponent(topicName)}&mode=revision`);
  };

  const handlePracticeTopic = (topicId: string, topicName: string) => {
    navigate(`/quiz/create?topic=${encodeURIComponent(topicName)}`);
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = sourceFilter === 'ALL' || q.source_type === sourceFilter;
    const matchesDiff = difficultyFilter === 'ALL' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSource && matchesDiff;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 hero-brand text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-300 font-semibold text-xs tracking-wider uppercase">
            <BrainCircuit className="w-4 h-4 text-blue-400" />
            Adaptive Assessment Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Quiz & Assessments
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Test your knowledge, identify weak areas, and master concepts through adaptive practice grounded in your courses, notes, and documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/quiz/history')}
          >
            <History className="w-4 h-4 mr-1.5" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={() => navigate('/quiz/progress')}
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Progress & Weak Areas
          </Button>
          <Button
            variant="ai"
            size="sm"
            className="shadow-lg"
            onClick={() => navigate('/quiz/create')}
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Create Quiz
          </Button>
        </div>
      </div>

      {/* Continue In-Progress Quiz Section (if any) */}
      {activeAttempts.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Resume Active Assessment
              </h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {activeAttempts.length} In Progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAttempts.map((att) => (
              <div
                key={att.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {att.quiz_title || 'Active Engineering Quiz'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Started {new Date(att.started_at).toLocaleDateString()} at{' '}
                    {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="flex items-center gap-1.5"
                  onClick={() => navigate(`/quiz/${att.quiz_id}`)}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Resume
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Areas Attention Section */}
      {progress && progress.weak_areas && progress.weak_areas.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Identified Weak Areas Needing Review
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              Accuracy &lt; 60%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.weak_areas.map((weak, idx) => (
              <WeakAreaCard
                key={idx}
                topic={weak}
                onGenerateRevision={handleGenerateRevision}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quizzes Catalog */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recommended Quizzes & Topic Practice
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Foundational, GATE-level, and adaptive assessments across your active curriculum
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => navigate('/quiz/create')}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
            Generate New Quiz
          </Button>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input aria-label="Search quizzes"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quizzes by title or topic..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-800/60 text-xs">
              {(['ALL', 'TOPIC', 'COURSE', 'DSA', 'NOTES', 'DOCUMENT'] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceFilter(src)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    sourceFilter === src
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {src === 'ALL' ? 'All Sources' : src}
                </button>
              ))}
            </div>

            <select aria-label="Filter by difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
              No Quizzes Found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Create your first AI-generated assessment from a topic, course syllabus, notes, or uploaded textbook.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/quiz/create')}
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Create Assessment
            </Button>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              No matching assessments
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or filter selections.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => {
                setSearchQuery('');
                setSourceFilter('ALL');
                setDifficultyFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                lastAttemptScore={attemptScoresMap.get(quiz.id)}
                onNavigate={navigate}
                onDelete={quiz.student_id ? handleDeleteQuiz : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* Topic Mastery Summary */}
      {progress && progress.topic_performances && (
        <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Curriculum Topic Mastery
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 dark:text-blue-400"
              onClick={() => navigate('/quiz/progress')}
            >
              View Full Analytics →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Array.isArray(progress.topic_performances)
              ? progress.topic_performances
              : Object.values(progress.topic_performances)
            )
              .slice(0, 4)
              .map((tp, idx) => (
                <TopicPerformanceCard
                  key={idx}
                  performance={tp}
                  onPractice={handlePracticeTopic}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
};
