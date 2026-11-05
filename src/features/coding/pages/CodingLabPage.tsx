import * as React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { codingApi } from '../api/codingApi';
import { CodingLanguage, CodingProblem, ProblemDifficulty } from '../types/coding';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import {
  Code2,
  Terminal,
  Play,
  Bookmark,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Layers,
  Search,
  Filter,
  Flame,
  Award,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface CodingLabPageProps {
  onNavigate?: (path: string) => void;
}

export const CodingLabPage: React.FC<CodingLabPageProps> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };
  const setLanguage = useCodingEditorStore((s) => s.setLanguage);

  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch problems
  const { data: problems = [], isLoading: loadingProblems } = useQuery({
    queryKey: ['coding-problems', selectedDifficulty, selectedTopic, searchQuery],
    queryFn: () =>
      codingApi.getProblems({
        difficulty: selectedDifficulty,
        topic: selectedTopic,
        search: searchQuery,
      }),
  });

  // Fetch progress
  const { data: progress } = useQuery({
    queryKey: ['coding-progress'],
    queryFn: () => codingApi.getProgress(),
  });

  // Fetch recent sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['coding-sessions'],
    queryFn: () => codingApi.getSessions(),
  });

  const handleStartNewSession = (lang: CodingLanguage = 'python') => {
    setLanguage(lang);
    navigate(`/coding/editor?language=${lang}`);
  };

  const getDifficultyBadge = (diff: ProblemDifficulty) => {
    switch (diff) {
      case 'BEGINNER':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'EASY':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'HARD':
      case 'ADVANCED':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const languages: { id: CodingLanguage; name: string; desc: string; icon: string }[] = [
    { id: 'python', name: 'Python 3', desc: 'Data structures, algorithmic scripts & AI labs', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', desc: 'Node.js runtime, asynchronous event loops', icon: '⚡' },
    { id: 'cpp', name: 'C++', desc: 'High performance competitive programming & STL', icon: '⚙️' },
    { id: 'c', name: 'C', desc: 'Systems programming, memory pointers, operating systems', icon: '💻' },
    { id: 'java', name: 'Java', desc: 'Object-oriented software development & OOP patterns', icon: '☕' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Isolated Execution Sandbox</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Coding Lab</h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Write, run, debug and understand code with AI. Practice curriculum algorithmic challenges with guaranteed isolated execution.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleStartNewSession('python')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 rounded-xl text-xs font-bold shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Coding Session</span>
            </button>

            <button
              onClick={() => navigate('/coding/saved')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Code</span>
            </button>

            <button
              onClick={() => navigate('/coding/history')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>Execution History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Metric & Continue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Continue Coding Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Continue Coding
              </span>
              <Terminal className="w-4 h-4 text-blue-600" />
            </div>
            {sessions.length > 0 ? (
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Active {sessions[0].language.toUpperCase()} Session
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-mono">
                  {sessions[0].source_code.slice(0, 100)}...
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Ready to code?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Start an empty sandbox workspace in Python, C++, Java, or JavaScript.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() =>
              sessions.length > 0
                ? navigate(`/coding/editor?sessionId=${sessions[0].id}`)
                : handleStartNewSession('python')
            }
            className="mt-4 flex items-center justify-between w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>{sessions.length > 0 ? 'Resume Session' : 'Launch Editor'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Coding Progress Summary */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Coding Progress
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">Problems Solved</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {progress?.problems_completed || 0}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">Total Runs</span>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {progress?.total_executions || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500">Languages:</span>
              {!progress?.languages_used?.length && <span className="text-[11px] text-slate-400">none yet</span>}
              {(progress?.languages_used || []).map((l) => (
                <span
                  key={l}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold uppercase"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            {progress?.topics_practiced?.length ? (
              <span>Practiced: {progress.topics_practiced.slice(0, 3).join(', ')}</span>
            ) : (
              <span>Complete challenges to track curriculum mastery</span>
            )}
          </div>
        </div>

        {/* AI Coding Assistant Card */}
        <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                AI Coding Intelligence
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Personal Engineering Tutor
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Understand tricky compilation traces, evaluate O(N) Big-O bounds, generate test cases, and receive hints.
            </p>
          </div>

          <button
            onClick={() => {
              useCodingEditorStore.getState().setAiPanelOpen(true);
              navigate('/coding/editor');
            }}
            className="mt-4 flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch AI IDE</span>
          </button>
        </div>
      </div>

      {/* Supported Languages Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-600" />
          <span>Supported Languages & Environments</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {languages.map((lang) => (
            <div
              key={lang.id}
              onClick={() => handleStartNewSession(lang.id)}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer shadow-xs transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl mb-1 block">{lang.icon}</span>
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                  {lang.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {lang.desc}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <span>Code Now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Problems Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Recommended Practice Problems</span>
            </h2>
            <p className="text-xs text-slate-500">
              Curated B.Tech algorithm challenges with official public and hidden test cases.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem..."
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loadingProblems ? (
            <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
              Loading problems...
            </div>
          ) : problems.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No matching problems found.
            </div>
          ) : (
            problems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => navigate(`/coding/problem/${prob.id}`)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-xs cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(
                        prob.difficulty
                      )}`}
                    >
                      {prob.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {prob.topic}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                    {prob.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prob.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {prob.tags?.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Solve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
