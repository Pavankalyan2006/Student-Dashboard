import * as React from 'react';
import {
  Binary,
  Layers,
  GitBranch,
  Search,
  Code2,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  BookOpen,
  Award,
  ExternalLink,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Play,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { dsaApi } from '../api/dsaApi';
import { DSATopic, Algorithm, DSAProgress, DSAProblem } from '../types/dsa';

interface DSALabPageProps {
  onNavigate?: (path: string) => void;
}

export const DSALabPage: React.FC<DSALabPageProps> = ({ onNavigate }) => {
  const [topics, setTopics] = React.useState<DSATopic[]>([]);
  const [algorithms, setAlgorithms] = React.useState<Algorithm[]>([]);
  const [problems, setProblems] = React.useState<DSAProblem[]>([]);
  const [progress, setProgress] = React.useState<DSAProgress | null>(null);
  const [loading, setLoading] = React.useState(true);

  // LeetCode Top 150 Filters & Pagination
  const [problemSearch, setProblemSearch] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(12);

  React.useEffect(() => {
    Promise.all([
      dsaApi.getTopics(),
      dsaApi.getAlgorithms(),
      dsaApi.getProblems(),
      dsaApi.getProgress().catch(() => null),
    ])
      .then(([topicsRes, algosRes, probsRes, progRes]) => {
        setTopics(topicsRes);
        setAlgorithms(algosRes);
        setProblems(probsRes);
        setProgress(progRes);
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

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      case 'HARD':
      case 'ADVANCED':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const topicMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const t of topics) {
      map.set(t.id, t.name);
    }
    return map;
  }, [topics]);

  const filteredProblems = React.useMemo(() => {
    return problems.filter((p) => {
      const matchSearch =
        !problemSearch ||
        p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(problemSearch.toLowerCase());
      const matchTopic = selectedTopic === 'ALL' || p.topic_id === selectedTopic;
      const matchDiff = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
      return matchSearch && matchTopic && matchDiff;
    });
  }, [problems, problemSearch, selectedTopic, selectedDifficulty]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const paginatedProblems = filteredProblems.slice((page - 1) * pageSize, page * pageSize);

  const stats = React.useMemo(() => {
    const solvedSet = new Set(progress?.problems_solved || []);
    const easyCount = problems.filter((p) => p.difficulty === 'EASY' || p.difficulty === 'BEGINNER').length;
    const mediumCount = problems.filter((p) => p.difficulty === 'MEDIUM').length;
    const hardCount = problems.filter((p) => p.difficulty === 'HARD' || p.difficulty === 'ADVANCED').length;

    const easySolved = problems.filter((p) => (p.difficulty === 'EASY' || p.difficulty === 'BEGINNER') && solvedSet.has(p.id)).length;
    const mediumSolved = problems.filter((p) => p.difficulty === 'MEDIUM' && solvedSet.has(p.id)).length;
    const hardSolved = problems.filter((p) => (p.difficulty === 'HARD' || p.difficulty === 'ADVANCED') && solvedSet.has(p.id)).length;

    return {
      total: problems.length,
      solved: solvedSet.size,
      easyCount,
      easySolved,
      mediumCount,
      mediumSolved,
      hardCount,
      hardSolved,
    };
  }, [problems, progress]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono">
            <Binary className="w-3.5 h-3.5 text-blue-300" />
            <span>Interactive Data Structures & Algorithms Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Master Algorithms with Deterministic Step Visualizers
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Step through sorting, trees, dynamic programming, and graphs. Verify Big-O complexity, test edge cases, and solve curated B.Tech placement coding challenges.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/dsa/visualize/binary-search')}
            className="bg-white text-blue-900 hover:bg-blue-50 font-bold gap-2 h-11 px-5 shadow-md"
          >
            <PlayCircle className="w-4 h-4 text-blue-600" />
            Launch Visualizer
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dsa/tutor')}
            className="bg-white/15 hover:bg-white/25 text-white border-white/30 gap-2 h-11 px-5 backdrop-blur-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Ask AI DSA Tutor
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/quiz/create?source_type=DSA&topic=Data%20Structures%20and%20Algorithms')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 gap-2 h-11 px-5 backdrop-blur-sm"
          >
            <HelpCircle className="w-4 h-4 text-purple-300" />
            Adaptive DSA Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dsa/practice')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 gap-2 h-11 px-5 backdrop-blur-sm"
          >
            <Code2 className="w-4 h-4" />
            Practice Problems
          </Button>
        </div>
      </div>

      {/* Student Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Curriculum Topics</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {topics.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Visualizations</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {algorithms.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Problems Solved</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {progress?.problems_solved?.length || 0}/{problems.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Mastery Score</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {progress?.problems_solved?.length
                ? Math.min(100, Math.round((progress.problems_solved.length / Math.max(1, problems.length)) * 100))
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Featured Visualizers Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Interactive Algorithm Visualizers
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic, zero-hallucination execution state visualizers.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dsa/topics')}
            className="text-xs text-blue-600 dark:text-blue-400 gap-1"
          >
            All Algorithms <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {algorithms.slice(0, 6).map((algo) => (
            <div
              key={algo.id}
              onClick={() => navigate(`/dsa/visualize/${algo.id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {algo.visualization_type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Time: {algo.time_complexity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {algo.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {algo.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  Space: {algo.space_complexity}
                </span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curriculum Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Curriculum & Data Structures
            </h2>
            <p className="text-xs text-slate-500">
              Comprehensive B.Tech curriculum mapped to CS degree benchmarks.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dsa/topics')}
            className="text-xs text-blue-600 dark:text-blue-400 gap-1"
          >
            View All Topics <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => navigate(`/dsa/topic/${topic.id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(
                      topic.difficulty
                    )}`}
                  >
                    {topic.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {topic.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {topic.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/quiz/create?source_type=DSA&dsaTopic=${encodeURIComponent(topic.name)}&topic=${encodeURIComponent(topic.name)}`);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                  title={`Take AI Quiz on ${topic.name}`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Take Quiz</span>
                </button>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Topic <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= LEETCODE TOP INTERVIEW 150 PROBLEM HUB ================= */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>LeetCode Top Interview 150 Study Plan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                All 150 Top Interview Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Practice the complete collection of high-frequency interview questions across 23 topics. Write code in Python, C++, Java, C, or JavaScript, get AI tutor hints, and study official editorials.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dsa/practice')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 h-10 px-4 text-xs font-semibold backdrop-blur-sm"
              >
                <span>Dedicated Practice Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Progress Tracker Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <span className="text-[11px] font-mono text-slate-400 block">Total Problems</span>
              <span className="text-xl font-bold text-white">{stats.total}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20">
              <span className="text-[11px] font-mono text-emerald-400 block">Easy Solved</span>
              <span className="text-xl font-bold text-emerald-300">
                {stats.easySolved} / {stats.easyCount}
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20">
              <span className="text-[11px] font-mono text-amber-400 block">Medium Solved</span>
              <span className="text-xl font-bold text-amber-300">
                {stats.mediumSolved} / {stats.mediumCount}
              </span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-rose-500/20">
              <span className="text-[11px] font-mono text-rose-400 block">Hard Solved</span>
              <span className="text-xl font-bold text-rose-300">
                {stats.hardSolved} / {stats.hardCount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search any of the 150 questions (e.g. Merge Sorted Array, 3Sum, LRU Cache)..."
                value={problemSearch}
                onChange={(e) => {
                  setProblemSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-xs h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Topic Dropdown */}
            <div className="w-full sm:w-64">
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All 23 Topics ({problems.length})</option>
                {topics.map((t) => {
                  const count = problems.filter((p) => p.topic_id === t.id).length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Page Size / View Toggle */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <Button
                variant={pageSize === 12 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setPageSize(12);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 rounded-lg"
              >
                12 / page
              </Button>
              <Button
                variant={pageSize === 36 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setPageSize(36);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 rounded-lg"
              >
                36 / page
              </Button>
              <Button
                variant={pageSize >= 150 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setPageSize(200);
                  setPage(1);
                }}
                className="text-xs h-9 px-3 rounded-lg"
              >
                Show All ({filteredProblems.length})
              </Button>
            </div>
          </div>

          {/* Difficulty Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Difficulty:
            </span>
            {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => {
              const isActive = selectedDifficulty === diff;
              const count =
                diff === 'ALL'
                  ? problems.length
                  : problems.filter((p) => p.difficulty === diff).length;

              return (
                <button
                  key={diff}
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {diff === 'ALL' ? 'All Difficulties' : diff} ({count})
                </button>
              );
            })}

            {(problemSearch || selectedTopic !== 'ALL' || selectedDifficulty !== 'ALL') && (
              <button
                onClick={() => {
                  setProblemSearch('');
                  setSelectedTopic('ALL');
                  setSelectedDifficulty('ALL');
                  setPage(1);
                }}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 ml-auto font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Problem Cards Grid */}
        {filteredProblems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No problems match your filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, topic selection, or difficulty filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProblemSearch('');
                setSelectedTopic('ALL');
                setSelectedDifficulty('ALL');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProblems.map((prob) => {
              const isSolved = progress?.problems_solved?.includes(prob.id);
              const topicName = topicMap.get(prob.topic_id) || 'General';

              return (
                <div
                  key={prob.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    {/* Header: Difficulty & Topic */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
                          {topicName}
                        </span>
                      </div>

                      {isSolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => navigate(`/dsa/problem/${prob.id}`)}
                      className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {prob.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {prob.description}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
                    {/* Editorial and Complexity Row */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      {prob.editorial_url ? (
                        <a
                          href={prob.editorial_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 hover:underline px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>LeetCode Editorial</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">LeetCode Top 150</span>
                      )}

                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                        {prob.optimal_complexity?.time || 'O(N)'}
                      </span>
                    </div>

                    {/* Action Buttons: Launch Visualizer, Ask AI Tutor, Code Solution */}
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dsa/visualize/${prob.algorithm_id || prob.id}`)}
                        className="text-[11px] h-8 px-2 gap-1 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg font-semibold shadow-2xs"
                        title="Launch step-by-step visualizer for this question"
                      >
                        <Play className="w-3 h-3 text-indigo-600 dark:text-indigo-400 fill-current" />
                        <span>Visualize</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dsa/tutor/${prob.id}`)}
                        className="text-[11px] h-8 px-2 gap-1 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 rounded-lg font-semibold shadow-2xs"
                        title="Ask AI DSA Tutor about this problem"
                      >
                        <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                        <span>AI Tutor</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/dsa/problem/${prob.id}`)}
                        className="text-[11px] h-8 px-2 gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                        title="Open code editor to solve"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>Solve</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredProblems.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500">
              Showing{' '}
              <strong className="text-slate-900 dark:text-white">
                {(page - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 dark:text-white">
                {Math.min(page * pageSize, filteredProblems.length)}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-900 dark:text-white">
                {filteredProblems.length}
              </strong>{' '}
              questions
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 900, behavior: 'smooth' });
                }}
                className="text-xs h-8 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i + 1;
                  if (totalPages > 5 && page > 3) {
                    pNum = Math.min(totalPages, page - 2 + i);
                  }
                  return (
                    <button
                      key={pNum}
                      onClick={() => {
                        setPage(pNum);
                        window.scrollTo({ top: 900, behavior: 'smooth' });
                      }}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                        page === pNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 900, behavior: 'smooth' });
                }}
                className="text-xs h-8 gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
