import React, { useState } from 'react';
import { useNavigate } from '../lib/router';
import { useGitHubRepositories } from '../features/github/hooks/useGitHub';
import {
  FolderGit2,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  GitBranch,
  Star,
  GitFork,
  CheckCircle2,
  Clock,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

interface RepositoryListPageProps {
  onNavigate?: (path: string) => void;
}

export const RepositoryListPage: React.FC<RepositoryListPageProps> = ({ onNavigate }) => {
  const fallbackNavigate = useNavigate();
  const navigate = onNavigate || fallbackNavigate;
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');

  const { data: repos = [], isLoading } = useGitHubRepositories();

  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = languageFilter === 'ALL' || r.language.toLowerCase() === languageFilter.toLowerCase();
    const matchesVis = visibilityFilter === 'ALL' || r.visibility.toLowerCase() === visibilityFilter.toLowerCase();
    return matchesSearch && matchesLang && matchesVis;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/github')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to GitHub Hub
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Your Repositories</h1>
          <p className="text-xs text-slate-500">
            Browse connected codebases, run architecture analysis, and link code to Project Builder.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search repositories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Language:</span>
            {['ALL', 'TypeScript', 'Python'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  languageFilter === lang
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Visibility:</span>
            {['ALL', 'PUBLIC', 'PRIVATE'].map((vis) => (
              <button
                key={vis}
                onClick={() => setVisibilityFilter(vis)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  visibilityFilter === vis
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Repositories List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading repositories...
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Repositories Match Filters</h4>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or language filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => navigate(`/github/repo/${repo.id}`)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {repo.language}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                      {repo.visibility}
                    </span>
                  </div>

                  {repo.analysis_status === 'ANALYZED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Sparkles className="w-3.5 h-3.5" /> Analyzed
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Not Analyzed</span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {repo.full_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {repo.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3.5 h-3.5" /> {repo.forks}
                  </span>
                  {repo.linked_project_id && (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <LinkIcon className="w-3.5 h-3.5" /> Linked to Project
                    </span>
                  )}
                </div>

                <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
