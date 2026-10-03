import * as React from 'react';
import { DSAProgress, DSATopic, Algorithm, DSAProblem } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface DSAProgressPageProps {
  onNavigate?: (path: string) => void;
}

export const DSAProgressPage: React.FC<DSAProgressPageProps> = ({ onNavigate }) => {
  const [progress, setProgress] = React.useState<DSAProgress | null>(null);
  const [topics, setTopics] = React.useState<DSATopic[]>([]);
  const [algorithms, setAlgorithms] = React.useState<Algorithm[]>([]);
  const [problems, setProblems] = React.useState<DSAProblem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      dsaApi.getProgress().catch(() => null),
      dsaApi.getTopics(),
      dsaApi.getAlgorithms(),
      dsaApi.getProblems(),
    ])
      .then(([progRes, topicsRes, algosRes, probsRes]) => {
        setProgress(progRes);
        setTopics(topicsRes);
        setAlgorithms(algosRes);
        setProblems(probsRes);
      })
      .finally(() => setLoading(false));
  }, []);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const solvedCount = progress?.problems_solved?.length || 0;
  const attemptedCount = progress?.problems_attempted?.length || 0;
  const completedVisualizations = progress?.visualizations_completed || [];
  const weakTopics = progress?.weak_topics || [];

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dsa')}
          className="h-9 w-9 p-0 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            DSA Learning Progress & Mastery
          </h1>
          <p className="text-xs text-slate-500">
            Track your algorithmic depth, simulation milestones, and target areas for improvement.
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Problems Solved</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {solvedCount} / {problems.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Simulations Run</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {completedVisualizations.length} / {algorithms.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Curriculum Depth</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {topics.length > 0
                ? Math.round(((progress?.topics_viewed?.length || 0) / topics.length) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Hints Utilized</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {progress?.hints_used || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Weak Topics Diagnostic Alert */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/80 p-5 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Target Improvement Recommendations
            </h3>
            <p className="text-xs text-amber-800/90 dark:text-amber-300 leading-relaxed">
              Based on your coding submissions and hint usage, our AI recommends strengthening your fundamentals in:{' '}
              <strong>{weakTopics.join(', ')}</strong>. Try reviewing the step-by-step visualizers and attempting additional practice problems.
            </p>
          </div>
        </div>
      )}

      {/* Topics Mastery Progress List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Curriculum Topic Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => {
            const isViewed = progress?.topics_viewed?.includes(topic.id);
            const topicProblems = problems.filter((p) => p.topic_id === topic.id);
            const topicSolved = topicProblems.filter((p) =>
              progress?.problems_solved?.includes(p.id)
            );
            const pct = topicProblems.length > 0 ? (topicSolved.length / topicProblems.length) * 100 : 0;

            return (
              <div
                key={topic.id}
                onClick={() => navigate(`/dsa/topic/${topic.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {topic.name}
                    </span>
                    {isViewed && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Viewed" />
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {topicSolved.length}/{topicProblems.length} Solved
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
