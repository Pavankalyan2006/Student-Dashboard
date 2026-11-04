import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from '../lib/router';
import {
  useGitHubRepository,
  useGitHubTree,
  useSyncGitHubRepository,
  useUpdateRepoNotes,
} from '../features/github/hooks/useGitHub';
import { RepoReadmeTab } from '../features/github/components/RepoReadmeTab';
import { RepoFileExplorerTab } from '../features/github/components/RepoFileExplorerTab';
import { RepoAnalysisTab } from '../features/github/components/RepoAnalysisTab';
import { RepoCommitsTab } from '../features/github/components/RepoCommitsTab';
import { RepoIssuesTab } from '../features/github/components/RepoIssuesTab';
import { RepoPullRequestsTab } from '../features/github/components/RepoPullRequestsTab';
import { RepoLinkProjectModal } from '../features/github/components/RepoLinkProjectModal';
import { RepoFeatureModal } from '../features/github/components/RepoFeatureModal';
import { RepoResumeModal } from '../features/github/components/RepoResumeModal';
import { RepoInterviewPrepModal } from '../features/github/components/RepoInterviewPrepModal';
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
  FileText,
  HelpCircle,
  Save,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [activeTab, setActiveTabState] = useState<string>(() => searchParams.get('tab') || 'readme');

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
  const updateNotesMutation = useUpdateRepoNotes(repoId || '');

  // Modals state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  // Personal notes state
  const [personalNotes, setPersonalNotes] = useState('');
  React.useEffect(() => {
    if (repo?.personal_notes !== undefined) {
      setPersonalNotes(repo.personal_notes || '');
    }
  }, [repo?.personal_notes]);

  const handleSaveNotes = async () => {
    if (!repoId) return;
    try {
      await updateNotesMutation.mutateAsync(personalNotes);
    } catch (err: any) {
      toast.error('Failed to save notes');
    }
  };

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
    { key: 'readme', label: 'README', icon: FileText },
    { key: 'files', label: 'File Explorer', icon: FileCode, count: files.length },
    { key: 'analysis', label: 'Architecture & AI Analysis', icon: Layers },
    { key: 'commits', label: 'Commits', icon: GitCommit },
    { key: 'issues', label: 'Issues', icon: AlertCircle, count: repo.open_issues_count },
    { key: 'pulls', label: 'Pull Requests', icon: GitPullRequest },
    { key: 'notes', label: 'Study Notes', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/github')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to GitHub Workspace
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{repo.full_name}</h1>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
              repo.visibility.toLowerCase() === 'private'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {repo.visibility.toUpperCase()}
            </span>
            {repo.is_featured && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{repo.description || 'No description provided'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Feature in Portfolio */}
          <button
            onClick={() => setIsFeatureModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Star className={`w-3.5 h-3.5 ${repo.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            {repo.is_featured ? 'Edit Featured' : 'Feature Project'}
          </button>

          {/* Resume Bullets */}
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Resume Bullets
          </button>

          {/* Interview Prep */}
          <button
            onClick={() => setIsInterviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            Interview Prep
          </button>

          {/* Link to Project Builder */}
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
            {repo.linked_project_id ? 'Linked to Project' : 'Link to Project Builder'}
          </button>

          {/* Sync */}
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync
          </button>

          {/* External GitHub link */}
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
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5 font-mono">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-800">{repo.default_branch}</span>
          </div>
          <div>Primary Language: <strong className="text-slate-800">{repo.language}</strong></div>
          {repo.license && <div>License: <strong className="text-slate-800">{repo.license}</strong></div>}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars}
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-slate-400" /> {repo.forks}
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Last synchronized: {new Date(repo.last_synced_at).toLocaleString()}
        </div>
      </div>

      {/* Topics if any */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 font-semibold">Topics:</span>
          {repo.topics.map((topic, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
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
        {activeTab === 'readme' && <RepoReadmeTab repoId={repo.id} />}

        {activeTab === 'files' && <RepoFileExplorerTab repoId={repo.id} files={files} />}

        {activeTab === 'analysis' && <RepoAnalysisTab repoId={repo.id} />}

        {activeTab === 'commits' && <RepoCommitsTab repoId={repo.id} />}

        {activeTab === 'issues' && <RepoIssuesTab repoId={repo.id} />}

        {activeTab === 'pulls' && <RepoPullRequestsTab repoId={repo.id} />}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personal Study Notes & Learning Log</h3>
                <p className="text-xs text-slate-500">
                  Private engineering notes, technical takeaways, or todo items for this repository.
                </p>
              </div>
              <button
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            <textarea
              rows={8}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Record your takeaways, design pattern discoveries, architectural learnings, or personal action items..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <RepoLinkProjectModal
        repoId={repo.id}
        repoName={repo.name}
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
      />

      <RepoFeatureModal
        repoId={repo.id}
        repoName={repo.name}
        isFeaturedInitial={repo.is_featured}
        initialMetadata={repo.featured_metadata}
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      />

      <RepoResumeModal
        repoId={repo.id}
        repoName={repo.name}
        defaultTechStack={
          Array.isArray(repo.languages)
            ? repo.languages
            : repo.languages
              ? Object.keys(repo.languages)
              : [repo.language]
        }
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      <RepoInterviewPrepModal
        repoId={repo.id}
        repoName={repo.name}
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
      />
    </div>
  );
};
