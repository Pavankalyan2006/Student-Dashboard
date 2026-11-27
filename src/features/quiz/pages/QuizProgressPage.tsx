import React, { useEffect, useState } from 'react';
import { quizApi } from '../api/quizApi';
import { QuizProgress, TopicPerformance } from '../types/quiz';
import { TopicPerformanceCard } from '../components/TopicPerformanceCard';
import { WeakAreaCard } from '../components/WeakAreaCard';
import { Button } from '../../../components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  AlertCircle,
  BarChart2,
  Sparkles,
  Target,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'sonner';

interface QuizProgressPageProps {
  onNavigate?: (path: string) => void;
}

export const QuizProgressPage: React.FC<QuizProgressPageProps> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await quizApi.getQuizProgress();
      setProgress(data);
    } catch (err: any) {
      toast.error('Failed to load progress', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !progress) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Aggregating educational analytics...</p>
      </div>
    );
  }

  const topicList: TopicPerformance[] = Array.isArray(progress.topic_performances)
    ? progress.topic_performances
    : Object.values(progress.topic_performances || {});

  // Chart data for topic accuracy
  const topicChartData = topicList.map((tp) => ({
    name: tp.topic_name.length > 15 ? tp.topic_name.slice(0, 15) + '...' : tp.topic_name,
    accuracy: tp.accuracy,
    questions: tp.total_questions || tp.questions_answered || 0,
  }));

  // Chart data for score history
  const recentScoresData = (progress.recent_scores || []).map((s, idx) => ({
    quiz: `Q${idx + 1}`,
    score: s.score,
    title: s.quiz_title,
  })).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Cognitive Progress & Mastery Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Diagnostic metrics, topic retention, and adaptive difficulty curve progression.
            </p>
          </div>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={() => navigate('/quiz/create')}
          className="flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create Diagnostic Quiz
        </Button>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">Quizzes Taken</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {progress.total_quizzes_taken || progress.total_quizzes || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {progress.total_quizzes_completed || progress.completed_quizzes || 0} Completed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">Questions Evaluated</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {progress.total_questions_answered || progress.questions_answered || 0}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Across active modules
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">Average Score</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {progress.average_score}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Authoritative Server Grade
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium mb-1">Overall Accuracy</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {progress.accuracy_rate || progress.average_score}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Retention Invariant
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Accuracy Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Accuracy by Academic Topic (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Accuracy']}
                  contentStyle={{ backgroundColor: '#121829', borderColor: '#363F52', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="accuracy" fill="#7B69F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Progression Over Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Recent Assessment Scores Trend
          </h3>
          <div className="h-64 w-full">
            {recentScoresData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentScoresData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="quiz" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Score']}
                    contentStyle={{ backgroundColor: '#121829', borderColor: '#363F52', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8B72F5" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete more assessments to populate learning velocity curves.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weak Areas Action Center */}
      {progress.weak_areas && progress.weak_areas.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Targeted Weak Areas Requiring Revision
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progress.weak_areas.map((w, idx) => (
              <WeakAreaCard
                key={idx}
                topic={w}
                onGenerateRevision={(topicName) => navigate(`/quiz/create?topic=${encodeURIComponent(topicName)}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Strong Areas Mastery */}
      {progress.strong_areas && progress.strong_areas.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Demonstrated Strong Competencies (&ge; 80% Accuracy)
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {progress.strong_areas.map((s, idx) => {
              const name = typeof s === 'object' ? s.topic_name : s;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{name}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Detailed Topic Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          All Topic Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicList.map((tp, idx) => (
            <TopicPerformanceCard
              key={idx}
              performance={tp}
              onPractice={(tId, tName) => navigate(`/quiz/create?topic=${encodeURIComponent(tName)}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
