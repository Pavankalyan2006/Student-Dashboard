import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from '../lib/router';
import {
  useGitHubRepository,
  useGitHubTree,
  useSyncGitHubRepository,
} from '../features/github/hooks/useGitHub';
import { RepoFileExplorerTab } from '../features/github/components/RepoFileExplorerTab';
import { RepoAnalysisTab } from '../features/github/components/RepoAnalysisTab';
import { RepoCommitsTab } from '../features/github/components/RepoCommitsTab';
import { RepoIssuesTab } from '../features/github/components/RepoIssuesTab';
import { RepoPullRequestsTab } from '../features/github/components/RepoPullRequestsTab';
import { RepoLinkProjectModal } from '../features/github/components/RepoLinkProjectModal';
import {
  FolderGit2,
  GitBranch,
  Star,
  GitFork,
  RefreshCw,
  Link as LinkIcon,
  ArrowLeft,
  FileCode,
  Sparkles,
  Layers,
  GitCommit,
  AlertCircle,
  GitPullRequest,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface RepositoryDetailPageProps {
  repoId?: string;
  onNavigate?: (path: string) => void;
}

export const RepositoryDetailPage: React.FC<RepositoryDetailPageProps> = ({
  repoId: propRepoId,
  onNavigate,
}) => {
  const { repoId: routeRepoId } = useParams<{ repoId: string }>();
  const repoId = propRepoId || routeRepoId;
  const fallbackNavigate = useNavigate();
  const navigate = onNavigate || fallbackNavigate;
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTabState] = useState<string>(() => searchParams.get('tab') || 'files');

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
  }, [searchParams]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const { data: repo, isLoading: isRepoLoading } = useGitHubRepository(repoId);
  const { data: files = [], isLoading: isFilesLoading } = useGitHubTree(repoId);
  const syncMutation = useSyncGitHubRepository(repoId || '');

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  if (isRepoLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Loading repository details...
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Repository Not Found</h2>
        <button
          onClick={() => navigate('/github/repos')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Repositories
        </button>
      </div>
    );
  }

  const navTabs = [
    { key: 'files', label: 'File Explorer', icon: FileCode, count: files.length },
    { key: 'analysis', label: 'Architecture & AI Analysis', icon: Layers },
    { key: 'commits', label: 'Commits', icon: GitCommit },
    { key: 'issues', label: 'Issues', icon: AlertCircle, count: repo.open_issues_count },
    { key: 'pulls', label: 'Pull Requests', icon: GitPullRequest },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/github/repos')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> All Repositories
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{repo.full_name}</h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {repo.visibility}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{repo.description || 'No description provided'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            {repo.linked_project_id ? 'Linked to Project' : 'Link to Project Builder'}
          </button>

          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync
          </button>

          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Open on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 font-mono">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">{repo.default_branch}</span>
          </div>
          <div>Language: <strong className="text-slate-800">{repo.language}</strong></div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars}
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-slate-400" /> {repo.forks}
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Last synced: {new Date(repo.last_synced_at).toLocaleTimeString()}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'files' && <RepoFileExplorerTab repoId={repo.id} files={files} />}

        {activeTab === 'analysis' && <RepoAnalysisTab repoId={repo.id} />}

        {activeTab === 'commits' && <RepoCommitsTab repoId={repo.id} />}

        {activeTab === 'issues' && <RepoIssuesTab repoId={repo.id} />}

        {activeTab === 'pulls' && <RepoPullRequestsTab repoId={repo.id} />}
      </div>

      {/* Link to Project Builder Modal */}
      <RepoLinkProjectModal
        repoId={repo.id}
        repoName={repo.name}
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
      />
    </div>
  );
};
