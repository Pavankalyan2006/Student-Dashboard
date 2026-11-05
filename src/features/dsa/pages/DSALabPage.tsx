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
  Circle,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Play,
  Bot,
  HelpCircle,
  Flame,
  Bookmark,
  BookmarkCheck,
  Building2,
  Tag,
  Check,
  SlidersHorizontal,
  Compass,
  Trophy,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { dsaApi } from '../api/dsaApi';
import { DSATopic, Algorithm, DSAProgress, DSAProblem } from '../types/dsa';
import { toast } from 'sonner';

interface DSALabPageProps {
  onNavigate?: (path: string) => void;
}

type TabType =
  | 'problems'
  | 'roadmap'
  | 'topics'
  | 'difficulty'
  | 'daily'
  | 'bookmarks'
  | 'visualizers'
  | 'analytics';

export const DSALabPage: React.FC<DSALabPageProps> = ({ onNavigate }) => {
  const [topics, setTopics] = React.useState<DSATopic[]>([]);
  const [algorithms, setAlgorithms] = React.useState<Algorithm[]>([]);
  const [problems, setProblems] = React.useState<DSAProblem[]>([]);
  const [progress, setProgress] = React.useState<DSAProgress | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = React.useState<string[]>([]);
  const [dailyChallenge, setDailyChallenge] = React.useState<{
    date: string;
    problem: DSAProblem;
    is_completed: boolean;
  } | null>(null);
  const [roadmap, setRoadmap] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = React.useState<TabType>('problems');

  // Filters
  const [problemSearch, setProblemSearch] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = React.useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [selectedStage, setSelectedStage] = React.useState<string>('ALL');
  const [sortBy, setSortBy] = React.useState<'number' | 'difficulty' | 'title'>('number');
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(15);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [topicsRes, algosRes, probsRes, progRes, bookmarksRes, dailyRes, roadmapRes] =
        await Promise.all([
          dsaApi.getTopics(),
          dsaApi.getAlgorithms(),
          dsaApi.getProblems(),
          dsaApi.getProgress().catch(() => null),
          dsaApi.getBookmarks().catch(() => []),
          dsaApi.getDailyChallenge().catch(() => null),
          dsaApi.getRoadmap().catch(() => []),
        ]);

      setTopics(topicsRes);
      setAlgorithms(algosRes);
      setProblems(probsRes);
      setProgress(progRes);
      setBookmarkedIds(bookmarksRes);
      setDailyChallenge(dailyRes);
      setRoadmap(roadmapRes);
    } catch (err) {
      console.error('Error fetching DSA Lab data:', err);
      toast.error('Failed to load DSA Lab data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    try {
      const res = await dsaApi.toggleBookmark(problemId);
      setBookmarkedIds(res.bookmarks);
      if (res.bookmarked) {
        toast.success('Problem bookmarked');
      } else {
        toast.info('Removed from bookmarks');
      }
    } catch {
      toast.error('Failed to toggle bookmark');
    }
  };

  const topicMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const t of topics) {
      map.set(t.id, t.name);
    }
    return map;
  }, [topics]);

  // All distinct companies
  const allCompanies = React.useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      p.companies?.forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [problems]);

  // Filtered & Sorted Problems
  const filteredProblems = React.useMemo(() => {
    const solvedSet = new Set(progress?.problems_solved || []);
    const attemptedSet = new Set(progress?.problems_attempted || []);
    const bookmarkSet = new Set(bookmarkedIds);

    let res = problems.filter((p) => {
      // Search
      if (problemSearch.trim()) {
        const q = problemSearch.toLowerCase().trim();
        const inTitle = p.title.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inSubtopic = p.subtopic?.toLowerCase().includes(q);
        const inCompany = p.companies?.some((c) => c.toLowerCase().includes(q));
        const inTag = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inSubtopic && !inCompany && !inTag) {
          return false;
        }
      }

      // Topic filter
      if (selectedTopic !== 'ALL' && p.topic_id !== selectedTopic) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // Company filter
      if (selectedCompany !== 'ALL' && !p.companies?.includes(selectedCompany)) {
        return false;
      }

      // Stage filter
      if (selectedStage !== 'ALL' && p.roadmap_stage !== selectedStage) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'SOLVED' && !solvedSet.has(p.id)) {
        return false;
      }
      if (selectedStatus === 'ATTEMPTED' && (!attemptedSet.has(p.id) || solvedSet.has(p.id))) {
        return false;
      }
      if (selectedStatus === 'UNSOLVED' && (solvedSet.has(p.id) || attemptedSet.has(p.id))) {
        return false;
      }
      if (selectedStatus === 'BOOKMARKED' && !bookmarkSet.has(p.id)) {
        return false;
      }

      return true;
    });

    // Sorting
    res.sort((a, b) => {
      if (sortBy === 'number') {
        const numA = a.number || 0;
        const numB = b.number || 0;
        return numA - numB;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'difficulty') {
        const order: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
        return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
      }
      return 0;
    });

    return res;
  }, [
    problems,
    problemSearch,
    selectedTopic,
    selectedDifficulty,
    selectedCompany,
    selectedStage,
    selectedStatus,
    sortBy,
    progress,
    bookmarkedIds,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / pageSize));
  const paginatedProblems = filteredProblems.slice((page - 1) * pageSize, page * pageSize);

  // Stats calculation
  const stats = React.useMemo(() => {
    const solvedSet = new Set(progress?.problems_solved || []);
    const attemptedSet = new Set(progress?.problems_attempted || []);

    const easyTotal = problems.filter((p) => p.difficulty === 'EASY').length;
    const medTotal = problems.filter((p) => p.difficulty === 'MEDIUM').length;
    const hardTotal = problems.filter((p) => p.difficulty === 'HARD').length;

    const easySolved = problems.filter((p) => p.difficulty === 'EASY' && solvedSet.has(p.id)).length;
    const medSolved = problems.filter((p) => p.difficulty === 'MEDIUM' && solvedSet.has(p.id)).length;
    const hardSolved = problems.filter((p) => p.difficulty === 'HARD' && solvedSet.has(p.id)).length;

    const totalSolved = solvedSet.size;
    const totalAttempted = attemptedSet.size;
    const total = problems.length || 150;

    return {
      total,
      solved: totalSolved,
      attempted: totalAttempted,
      unsolved: Math.max(0, total - totalSolved),
      completionPercentage: Math.round((totalSolved / total) * 100),
      acceptanceRate: totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0,
      streak: progress?.daily_streak || 1,
      easy: { solved: easySolved, total: easyTotal },
      medium: { solved: medSolved, total: medTotal },
      hard: { solved: hardSolved, total: hardTotal },
    };
  }, [problems, progress]);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'HARD':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const resetFilters = () => {
    setProblemSearch('');
    setSelectedTopic('ALL');
    setSelectedDifficulty('ALL');
    setSelectedCompany('ALL');
    setSelectedStatus('ALL');
    setSelectedStage('ALL');
    setSortBy('number');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7 animate-fade-in">
      {/* Hero Header Strip */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Top 150 DSA Interview Practice Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Master 150 Core DSA Questions with Live Sandbox Execution
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Curated 16 canonical topic tracks, exact difficulty balance (45 Easy, 75 Medium, 30 Hard), real compiler test evaluation in Python, JavaScript, and Java, progressive hints, and personalized roadmap mastery.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {dailyChallenge?.problem && (
              <Button
                onClick={() => navigate(`/dsa/problem/${dailyChallenge.problem.id}`)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold gap-2 h-10 px-4 shadow-sm"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                Solve Daily Challenge
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setActiveTab('roadmap')}
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 gap-2 h-10 px-4 backdrop-blur-sm font-semibold"
            >
              <Compass className="w-4 h-4 text-blue-200" />
              View Roadmap
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/dsa/visualize/binary-search')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 gap-2 h-10 px-4 backdrop-blur-sm"
            >
              <PlayCircle className="w-4 h-4 text-emerald-300" />
              Algorithm Visualizers
            </Button>
          </div>
        </div>
      </div>

      {/* Quantitative Targets & Progress Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Progress */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Progress</span>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {stats.completionPercentage}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.solved} <span className="text-sm font-semibold text-slate-400">/ {stats.total}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{stats.attempted} attempted</span>
            <span>{stats.unsolved} remaining</span>
          </div>
        </div>

        {/* Easy Track */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Easy</span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {stats.easy.total > 0 ? Math.round((stats.easy.solved / stats.easy.total) * 100) : 0}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.easy.solved} <span className="text-sm font-semibold text-slate-400">/ {stats.easy.total}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(stats.easy.solved / Math.max(1, stats.easy.total)) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500">Foundational patterns</span>
        </div>

        {/* Medium Track */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Medium</span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {stats.medium.total > 0 ? Math.round((stats.medium.solved / stats.medium.total) * 100) : 0}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.medium.solved} <span className="text-sm font-semibold text-slate-400">/ {stats.medium.total}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(stats.medium.solved / Math.max(1, stats.medium.total)) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500">Core interview bulk</span>
        </div>

        {/* Hard Track */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Hard</span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {stats.hard.total > 0 ? Math.round((stats.hard.solved / stats.hard.total) * 100) : 0}%
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats.hard.solved} <span className="text-sm font-semibold text-slate-400">/ {stats.hard.total}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(stats.hard.solved / Math.max(1, stats.hard.total)) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500">FAANG differentiator</span>
        </div>

        {/* Streak & Acceptance */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-current" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{stats.streak}</span>
              <span className="text-sm font-semibold text-slate-400">days</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Acceptance: <strong className="text-slate-800 dark:text-slate-200">{stats.acceptanceRate}%</strong>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for placement
          </div>
        </div>
      </div>

      {/* Navigation Switcher Tabs (9 Sections) */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'problems'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>All 150 Problems</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {problems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'roadmap'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Learning Roadmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'topics'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>16 Canonical Topics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('difficulty')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'difficulty'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Difficulty Tracks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'daily'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Daily Challenge</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('problems');
            setSelectedStatus('BOOKMARKED');
          }}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'BOOKMARKED' && activeTab === 'problems'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bookmarked</span>
          {bookmarkedIds.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {bookmarkedIds.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visualizers')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'visualizers'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Visualizers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </div>

      {/* ---------------- SECTION 1: ALL PROBLEMS ---------------- */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search 150 questions by title, subtopic, or company..."
                aria-label="Search DSA questions"
                  value={problemSearch}
                  onChange={(e) => {
                    setProblemSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/60"
                />
              </div>

              {/* Topic Dropdown */}
              <select aria-label="Filter by topic"
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-48 text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All 16 Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({problems.filter((p) => p.topic_id === t.id).length})
                  </option>
                ))}
              </select>

              {/* Difficulty Dropdown */}
              <select aria-label="Filter by difficulty"
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-36 text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy (45)</option>
                <option value="MEDIUM">Medium (75)</option>
                <option value="HARD">Hard (30)</option>
              </select>

              {/* Company Dropdown */}
              <select aria-label="Filter by company"
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-40 text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Companies</option>
                {allCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select aria-label="Filter by status"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full md:w-36 text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="SOLVED">Solved</option>
                <option value="ATTEMPTED">Attempted</option>
                <option value="UNSOLVED">Unsolved</option>
                <option value="BOOKMARKED">Bookmarked</option>
              </select>

              {/* Reset Button */}
              {(problemSearch ||
                selectedTopic !== 'ALL' ||
                selectedDifficulty !== 'ALL' ||
                selectedCompany !== 'ALL' ||
                selectedStatus !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              )}
            </div>

            {/* Quick status counters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>
                  Showing <strong className="text-slate-900 dark:text-white">{filteredProblems.length}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">150</strong> questions
                </span>
                {selectedStatus !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-[11px] font-medium">
                    Filter: {selectedStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Sort By:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('number')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    sortBy === 'number'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Number
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('difficulty')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    sortBy === 'difficulty'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Difficulty
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('title')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    sortBy === 'title'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Title
                </button>
              </div>
            </div>
          </div>

          {/* Problem Cards List */}
          <div className="space-y-2.5">
            {paginatedProblems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching questions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search criteria, topic selection, or difficulty filters.
                </p>
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              paginatedProblems.map((prob) => {
                const isSolved = progress?.problems_solved?.includes(prob.id);
                const isAttempted = progress?.problems_attempted?.includes(prob.id) && !isSolved;
                const isSaved = bookmarkedIds.includes(prob.id);

                return (
                  <div
                    key={prob.id}
                    onClick={() => navigate(`/dsa/problem/${prob.id}`)}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Solved Status Indicator */}
                      <div className="pt-0.5 sm:pt-0">
                        {isSolved ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950 flex-shrink-0" />
                        ) : isAttempted ? (
                          <div className="w-5 h-5 rounded-full border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 flex-shrink-0" />
                        )}
                      </div>

                      {/* Number & Title */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            #{prob.number || prob.id.replace('dsa_top150_', '')}
                          </span>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                            {prob.title}
                          </h3>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(
                              prob.difficulty
                            )}`}
                          >
                            {prob.difficulty}
                          </span>

                          {prob.subtopic && (
                            <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                              {prob.subtopic}
                            </span>
                          )}
                        </div>

                        {/* Company badges & topic name */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-600 dark:text-slate-400">
                            {topicMap.get(prob.topic_id) || prob.topic_id}
                          </span>

                          {prob.companies && prob.companies.length > 0 && (
                            <span className="hidden sm:flex items-center gap-1 text-slate-400 text-[10px]">
                              • <Building2 className="w-3 h-3 text-slate-400" />
                              {prob.companies.slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, prob.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'border-amber-300 text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Bookmark for revision'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      {/* Launch Interactive Solve */}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dsa/problem/${prob.id}`);
                        }}
                        className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1 shadow-xs"
                      >
                        <span>Solve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Page <strong className="text-slate-900 dark:text-white">{page}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 text-xs"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- SECTION 2: LEARNING ROADMAP ---------------- */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Structured 4-Stage DSA Mastery Path</h2>
            <p className="text-xs text-slate-500">
              Progressively transition from beginner algorithm foundations to complex FAANG placement interview rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {roadmap.map((stageItem, idx) => {
              const stagePct = stageItem.total_problems > 0
                ? Math.round((stageItem.solved_problems / stageItem.total_problems) * 100)
                : 0;

              return (
                <div
                  key={stageItem.stage}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono">
                      STAGE {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {stageItem.solved_problems}/{stageItem.total_problems} solved ({stagePct}%)
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{stageItem.stage}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{stageItem.description}</p>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${stagePct}%` }}
                    />
                  </div>

                  {/* Topics in this stage */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Topic Focus</h4>
                    <div className="space-y-1.5">
                      {stageItem.topics?.map((top: any) => (
                        <div
                          key={top.topic_id}
                          onClick={() => {
                            setSelectedTopic(top.topic_id);
                            setSelectedStage(stageItem.stage);
                            setActiveTab('problems');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors text-xs"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {top.topic_name}
                          </span>
                          <span className="font-mono text-slate-500">
                            {top.solved}/{top.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedStage(stageItem.stage);
                      setActiveTab('problems');
                    }}
                    className="w-full text-xs gap-1.5"
                  >
                    <span>Practice Stage Problems</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- SECTION 3: 16 CANONICAL TOPICS ---------------- */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">16 Canonical Topic Categories</h2>
            <p className="text-xs text-slate-500">
              Exact category distribution conforming to premier B.Tech computer science curriculum standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topics.map((top) => {
              const topProblems = problems.filter((p) => p.topic_id === top.id);
              const solvedCount = topProblems.filter((p) => progress?.problems_solved?.includes(p.id)).length;
              const pct = topProblems.length > 0 ? Math.round((solvedCount / topProblems.length) * 100) : 0;

              return (
                <div
                  key={top.id}
                  onClick={() => {
                    setSelectedTopic(top.id);
                    setActiveTab('problems');
                  }}
                  className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {top.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {solvedCount}/{topProblems.length}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {top.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {top.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{pct}% mastered</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Explore <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- SECTION 4: DIFFICULTY TRACKS ---------------- */}
      {activeTab === 'difficulty' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Three Focused Difficulty Tracks</h2>
            <p className="text-xs text-slate-500">
              Balanced split: 45 Easy questions (Warmup & Core Data Structures), 75 Medium questions (Interview Standard), 30 Hard questions (Competitive Placement).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Easy Track */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  EASY TRACK
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {stats.easy.solved}/{stats.easy.total} Solved
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">45 Foundation Questions</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Focus: Basic pointer manipulation, hash tables, array iterations, linear traversals, and simple recursion.
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Target Time: 10 - 15 mins per problem</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Essential for clearing initial screening rounds</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedDifficulty('EASY');
                  setActiveTab('problems');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                Practice 45 Easy Questions
              </Button>
            </div>

            {/* Medium Track */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  MEDIUM TRACK
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {stats.medium.solved}/{stats.medium.total} Solved
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">75 Core Interview Questions</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Focus: Sliding windows, binary search invariants, tree DFS/BFS, topological sorts, priority queues, and dynamic programming.
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>Target Time: 25 - 35 mins per problem</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span>Accounts for 70%+ of top tech technical interview loops</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedDifficulty('MEDIUM');
                  setActiveTab('problems');
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
              >
                Practice 75 Medium Questions
              </Button>
            </div>

            {/* Hard Track */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  HARD TRACK
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {stats.hard.solved}/{stats.hard.total} Solved
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">30 Advanced Mastery Questions</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Focus: Complex dynamic programming, median data streaming, Alien Dictionary, Word Ladder, and Levenshtein distance.
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-rose-500" />
                  <span>Target Time: 45 - 55 mins per problem</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-rose-500" />
                  <span>Key differentiator for Google, Meta, and Tier-1 offers</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedDifficulty('HARD');
                  setActiveTab('problems');
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              >
                Practice 30 Hard Questions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SECTION 5: DAILY CHALLENGE ---------------- */}
      {activeTab === 'daily' && dailyChallenge && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-500/30 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Daily Coding Challenge • {dailyChallenge.date}
            </span>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {dailyChallenge.problem.title}
            </h2>

            <div className="flex items-center justify-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyBadge(dailyChallenge.problem.difficulty)}`}>
                {dailyChallenge.problem.difficulty}
              </span>
              <span className="text-xs text-slate-500">
                {topicMap.get(dailyChallenge.problem.topic_id)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed pt-2">
              {dailyChallenge.problem.description}
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button
                onClick={() => navigate(`/dsa/problem/${dailyChallenge.problem.id}`)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 px-6 h-10 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Solve Today's Problem
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SECTION 6: VISUALIZERS ---------------- */}
      {activeTab === 'visualizers' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interactive Step Visualizers</h2>
            <p className="text-xs text-slate-500">
              Zero-hallucination, deterministic execution simulations for core algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {algorithms.map((algo) => (
              <div
                key={algo.id}
                onClick={() => navigate(`/dsa/visualize/${algo.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
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
      )}

      {/* ---------------- SECTION 7: ANALYTICS ---------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Topic Mastery Analytics</h2>
            <p className="text-xs text-slate-500">
              Detailed breakdown of completed practice questions across all 16 canonical categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((top) => {
              const topProblems = problems.filter((p) => p.topic_id === top.id);
              const solvedCount = topProblems.filter((p) => progress?.problems_solved?.includes(p.id)).length;
              const pct = topProblems.length > 0 ? Math.round((solvedCount / topProblems.length) * 100) : 0;

              return (
                <div
                  key={top.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{top.name}</span>
                    <span className="font-mono text-slate-500">
                      {solvedCount}/{topProblems.length} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
