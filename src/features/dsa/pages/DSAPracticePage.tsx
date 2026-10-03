import * as React from 'react';
import { DSAProblem, DSATopic, DSAProgress } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import { Search, Code2, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Play, Bot } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

interface DSAPracticePageProps {
  onNavigate?: (path: string) => void;
}

export const DSAPracticePage: React.FC<DSAPracticePageProps> = ({ onNavigate }) => {
  const [problems, setProblems] = React.useState<DSAProblem[]>([]);
  const [topics, setTopics] = React.useState<DSATopic[]>([]);
  const [progress, setProgress] = React.useState<DSAProgress | null>(null);
  const [search, setSearch] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      dsaApi.getProblems(),
      dsaApi.getTopics(),
      dsaApi.getProgress().catch(() => null),
    ])
      .then(([probsRes, topicsRes, progRes]) => {
        setProblems(probsRes);
        setTopics(topicsRes);
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

  const filteredProblems = problems.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchTopic = selectedTopic === 'ALL' || p.topic_id === selectedTopic;
    const matchDiff = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    return matchSearch && matchTopic && matchDiff;
  });

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
      case 'BEGINNER':
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              DSA Problem Bank & Practice
            </h1>
            <p className="text-xs text-slate-500">
              Curated coding problems for algorithmic problem-solving and placement prep.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dsa/tutor')}
            className="text-xs h-9 gap-1.5 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Ask AI DSA Tutor</span>
          </Button>

          {progress && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Solved:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {progress.problems_solved?.length || 0} / {problems.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by name or keyword..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Problem Cards / List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">No practice challenges match your criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProblems.map((prob) => {
            const isSolved = progress?.problems_solved?.includes(prob.id);
            const topic = topics.find((t) => t.id === prob.topic_id);

            return (
              <div
                key={prob.id}
                onClick={() => navigate(`/dsa/problem/${prob.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDifficultyBadge(
                        prob.difficulty
                      )}`}
                    >
                      {prob.difficulty}
                    </span>
                    {topic && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {topic.name}
                      </span>
                    )}
                    {isSolved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Solved
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {prob.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {prob.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dsa/visualize/${prob.algorithm_id || prob.id}`);
                    }}
                    className="text-xs h-8 px-2.5 gap-1 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-semibold shadow-2xs"
                    title="Launch step-by-step visualizer for this question"
                  >
                    <Play className="w-3 h-3 text-indigo-600 dark:text-indigo-400 fill-current" />
                    <span>Visualize</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dsa/tutor/${prob.id}`);
                    }}
                    className="text-xs h-8 px-2.5 gap-1 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 font-semibold shadow-2xs"
                    title="Ask AI DSA Tutor about this problem"
                  >
                    <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                    <span>AI Tutor</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dsa/problem/${prob.id}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-8 px-3.5 gap-1.5 shadow-xs"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{isSolved ? 'Review' : 'Solve'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
