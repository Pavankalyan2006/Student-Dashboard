import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from '../lib/router';
import {
  useGitHubStatus,
  useGitHubRepositories,
  useGitHubFeaturedRepos,
  useGitHubLanguages,
  useGitHubLearningDiscovery,
  useDisconnectGitHub,
  useSyncAllGitHub,
  useConnectGitHubPat,
  useConnectGitHub,
} from '../features/github/hooks/useGitHub';
import { RepoFeatureModal } from '../features/github/components/RepoFeatureModal';
import { RepoResumeModal } from '../features/github/components/RepoResumeModal';
import { RepoInterviewPrepModal } from '../features/github/components/RepoInterviewPrepModal';
import {
  FolderGit2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  ChevronRight,
  Layers,
  Star,
  GitFork,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  BookOpen,
  PieChart,
  Activity,
  Code2,
  FileText,
  MapPin,
  Building,
  Users,
  Compass,
  ArrowRight,
  Check,
  X,
  Loader2,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

interface GitHubDashboardPageProps {
  onNavigate?: (path: string) => void;
}

export const GitHubDashboardPage: React.FC<GitHubDashboardPageProps> = ({ onNavigate }) => {
  const fallbackNavigate = useNavigate();
  const navigate = onNavigate || fallbackNavigate;
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTabState] = useState<string>(() => searchParams.get('tab') || 'repositories');

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

  // Queries & Mutations
  const { data: status, isLoading: isStatusLoading } = useGitHubStatus();
  const { data: repos = [], isLoading: isReposLoading } = useGitHubRepositories();
  const { data: featuredRepos = [], isLoading: isFeaturedLoading } = useGitHubFeaturedRepos();
  const { data: languagesData, isLoading: isLanguagesLoading } = useGitHubLanguages();
  const syncAllMutation = useSyncAllGitHub();
  const disconnectMutation = useDisconnectGitHub();
  const connectPatMutation = useConnectGitHubPat();
  const connectUsernameMutation = useConnectGitHub();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedVisibility, setSelectedVisibility] = useState('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks' | 'name'>('updated');

  // Learning Discovery State
  const [learningQuery, setLearningQuery] = useState('');
  const [learningTopic, setLearningTopic] = useState<string | undefined>(undefined);
  const { data: learningResults, isLoading: isLearningLoading } = useGitHubLearningDiscovery({
    query: learningQuery || undefined,
    topic: learningTopic,
  });

  // Modal States
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [patTokenInput, setPatTokenInput] = useState('');
  const [patUsernameInput, setPatUsernameInput] = useState('');
  const [activeModalRepo, setActiveModalRepo] = useState<any | null>(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const isConnected = status?.is_connected;
  const connection = status?.connection;

  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalRepos = repos.length;
    const publicCount = repos.filter((r) => r.visibility.toLowerCase() === 'public').length;
    const privateCount = repos.filter((r) => r.visibility.toLowerCase() === 'private').length;
    const totalStars = repos.reduce((acc, r) => acc + (r.stars || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks || 0), 0);
    const openIssues = repos.reduce((acc, r) => acc + (r.open_issues_count || 0), 0);
    const featuredCount = featuredRepos.length;

    return {
      totalRepos,
      publicCount,
      privateCount,
      totalStars,
      totalForks,
      openIssues,
      featuredCount,
    };
  }, [repos, featuredRepos]);

  // Unique Languages
  const uniqueLanguages = useMemo(() => {
    const set = new Set<string>();
    repos.forEach((r) => {
      if (r.language && r.language !== 'Unknown') set.add(r.language);
    });
    return Array.from(set);
  }, [repos]);

  // Filtered & Sorted Repositories
  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesQuery =
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLang =
          selectedLanguage === 'ALL' ||
          r.language.toLowerCase() === selectedLanguage.toLowerCase();
        const matchesVis =
          selectedVisibility === 'ALL' ||
          r.visibility.toLowerCase() === selectedVisibility.toLowerCase();
        return matchesQuery && matchesLang && matchesVis;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') return b.stars - a.stars;
        if (sortBy === 'forks') return b.forks - a.forks;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.last_synced_at).getTime() - new Date(a.last_synced_at).getTime();
      });
  }, [repos, searchQuery, selectedLanguage, selectedVisibility, sortBy]);

  const handleConnectWithPat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patTokenInput.trim()) {
      toast.error('Personal Access Token is required');
      return;
    }
    try {
      await connectPatMutation.mutateAsync({
        token: patTokenInput.trim(),
        username: patUsernameInput.trim() || undefined,
      });
      setIsConnectModalOpen(false);
      setPatTokenInput('');
      setPatUsernameInput('');
    } catch (err) {
      // toast shown in mutation
    }
  };

  const handleQuickConnect = async () => {
    try {
      await connectUsernameMutation.mutateAsync('student-engineer');
      setIsConnectModalOpen(false);
    } catch (err) {
      // toast handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/30">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            Developer Workspace & Code Intelligence
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            GitHub Workspace
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Connect real repositories, explore code architectures, formulate verified STAR-format resume bullets, practice project defense interview questions, and discover educational B.Tech codebases.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isConnected ? (
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4" />
                Connect GitHub Account
              </button>
            ) : (
              <>
                <button
                  onClick={() => syncAllMutation.mutate()}
                  disabled={syncAllMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-bold rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncAllMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync All Repositories
                </button>

                <button
                  onClick={() => setActiveTab('featured')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs md:text-sm font-semibold rounded-2xl border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <Star className="w-4 h-4 text-amber-400" />
                  Portfolio ({stats.featuredCount})
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('learning')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs md:text-sm font-semibold rounded-2xl border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-400" />
              Learning Discovery
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* Security & Cryptographic Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 flex items-start justify-between gap-4 text-xs shadow-md">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Cryptographic Token Isolation & Zero-Leakage:</span>{' '}
            All OAuth tokens and Personal Access Tokens are encrypted with AES-256 on the backend. Tokens are strictly never sent to the browser or stored in localStorage. Default GitHub permission mode is strictly{' '}
            <span className="underline font-semibold text-emerald-300">READ-ONLY</span>.
          </div>
        </div>

        {isConnected && connection?.last_synced_at && (
          <div className="shrink-0 text-slate-400 text-[11px] font-mono hidden md:block">
            Last Synced: {new Date(connection.last_synced_at).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Profile & Account Banner (If Connected) */}
      {isConnected && connection && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {connection.avatar_url ? (
                <img
                  src={connection.avatar_url}
                  alt={connection.username}
                  className="w-16 h-16 rounded-2xl border border-slate-200 shadow-sm object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                  {connection.username.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {connection.name || connection.username}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">@{connection.username}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Connection
                  </span>
                </div>

                {connection.bio && (
                  <p className="text-xs text-slate-600 max-w-xl">{connection.bio}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  {connection.company && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> {connection.company}
                    </span>
                  )}
                  {connection.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {connection.location}
                    </span>
                  )}
                  {connection.followers !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {connection.followers} followers · {connection.following} following
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={connection.profile_url || `https://github.com/${connection.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
              </a>

              <button
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Repos</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalRepos}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Public Repos</span>
          <div className="text-2xl font-black text-emerald-600">{stats.publicCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Private Repos</span>
          <div className="text-2xl font-black text-amber-600">{stats.privateCount}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Stars</span>
          <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-500" /> {stats.totalStars}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Forks</span>
          <div className="text-2xl font-black text-slate-700 flex items-center gap-1">
            <GitFork className="w-5 h-5" /> {stats.totalForks}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Open Issues</span>
          <div className="text-2xl font-black text-slate-700">{stats.openIssues}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Portfolio Projects</span>
          <div className="text-2xl font-black text-indigo-600">{stats.featuredCount}</div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { key: 'repositories', label: 'My Repositories', icon: FolderGit2, count: repos.length },
          { key: 'featured', label: 'Featured Portfolio', icon: Star, count: featuredRepos.length },
          { key: 'languages', label: 'Language Analytics', icon: PieChart },
          { key: 'learning', label: 'Learning Discovery', icon: Compass },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* TAB 1: REPOSITORIES */}
        {activeTab === 'repositories' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search repositories by name, topic, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="updated">Recently Updated</option>
                    <option value="stars">Most Stars</option>
                    <option value="forks">Most Forks</option>
                    <option value="name">Repository Name</option>
                  </select>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-600">Visibility:</span>
                  {['ALL', 'PUBLIC', 'PRIVATE'].map((vis) => (
                    <button
                      key={vis}
                      onClick={() => setSelectedVisibility(vis)}
                      className={`px-3 py-1 rounded-xl font-medium transition-colors cursor-pointer ${
                        selectedVisibility === vis
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {vis}
                    </button>
                  ))}
                </div>

                {uniqueLanguages.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-600">Language:</span>
                    <button
                      onClick={() => setSelectedLanguage('ALL')}
                      className={`px-3 py-1 rounded-xl font-medium transition-colors cursor-pointer ${
                        selectedLanguage === 'ALL'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ALL
                    </button>
                    {uniqueLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1 rounded-xl font-medium transition-colors cursor-pointer ${
                          selectedLanguage === lang
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Repos Grid */}
            {isReposLoading ? (
              <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading repositories...</span>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No Repositories Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {repos.length === 0
                    ? 'Connect your GitHub account or Personal Access Token to synchronize your repositories.'
                    : 'No repositories match your current filter and search criteria.'}
                </p>
                {repos.length === 0 && (
                  <button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Connect GitHub Account
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRepos.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.language}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              r.visibility.toLowerCase() === 'private'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {r.visibility.toUpperCase()}
                          </span>
                          {r.is_featured && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        onClick={() => navigate(`/github/repo/${r.id}`)}
                        className="cursor-pointer space-y-1"
                      >
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {r.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {r.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Topics */}
                      {r.topics && r.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {r.topics.slice(0, 3).map((topic, ti) => (
                            <span
                              key={ti}
                              className="text-[9px] font-medium px-2 py-0.2 rounded-full bg-slate-100 text-slate-600"
                            >
                              #{topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500" /> {r.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-slate-400" /> {r.forks}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Resume Export Quick Action */}
                        <button
                          onClick={() => {
                            setActiveModalRepo(r);
                            setIsResumeModalOpen(true);
                          }}
                          title="Generate Resume Bullets"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        {/* Feature Toggle */}
                        <button
                          onClick={() => {
                            setActiveModalRepo(r);
                            setIsFeatureModalOpen(true);
                          }}
                          title="Feature in Portfolio"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${r.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>

                        {/* Explore */}
                        <button
                          onClick={() => navigate(`/github/repo/${r.id}`)}
                          className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 ml-1"
                        >
                          Explore <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FEATURED PORTFOLIO */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Featured Portfolio Projects</h3>
                <p className="text-xs text-slate-500">
                  Projects selected to showcase your technical competence on your student profile and job applications.
                </p>
              </div>
            </div>

            {featuredRepos.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Star className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No Projects Featured Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the star icon or "Feature Project" on any of your repositories to document your role, key features, and engineering lessons.
                </p>
                <button
                  onClick={() => setActiveTab('repositories')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  Browse Repositories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredRepos.map((r) => {
                  const meta = r.featured_metadata || {};
                  return (
                    <div
                      key={r.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                            {r.language}
                          </span>
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/70 px-2.5 py-0.5 rounded-full">
                            Role: {meta.role || 'Contributor'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{r.name}</h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {r.description || 'No description.'}
                          </p>
                        </div>

                        {/* Tech Stack */}
                        {meta.tech_stack && meta.tech_stack.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Tech Stack:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {meta.tech_stack.map((t: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Features */}
                        {meta.key_features && meta.key_features.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Key Features:
                            </span>
                            <ul className="list-disc ml-4 space-y-0.5 text-xs text-slate-600">
                              {meta.key_features.slice(0, 3).map((f: string, i: number) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Challenges Solved */}
                        {meta.challenges_solved && (
                          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-0.5">
                            <span className="font-bold text-slate-800">Challenge Solved:</span>
                            <p>{meta.challenges_solved}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {meta.demo_url && (
                            <a
                              href={meta.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveModalRepo(r);
                              setIsResumeModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> Export to Resume
                          </button>

                          <button
                            onClick={() => {
                              setActiveModalRepo(r);
                              setIsFeatureModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LANGUAGE ANALYTICS */}
        {activeTab === 'languages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Programming Language Distribution</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Distribution of detected programming languages across your accessible repositories.
                </p>
              </div>

              {isLanguagesLoading ? (
                <div className="py-12 text-center text-slate-400">Loading language distribution...</div>
              ) : !languagesData || languagesData.languages.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No language data available. Connect repositories to view analytics.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Multi-color Progress Bar */}
                  <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                    {languagesData.languages.map((lang, idx) => {
                      const colors = [
                        'bg-indigo-600',
                        'bg-emerald-500',
                        'bg-amber-500',
                        'bg-rose-500',
                        'bg-purple-600',
                        'bg-cyan-500',
                        'bg-blue-600',
                      ];
                      const color = colors[idx % colors.length];
                      return (
                        <div
                          key={lang.name}
                          style={{ width: `${lang.percentage}%` }}
                          title={`${lang.name}: ${lang.percentage}%`}
                          className={`${color} h-full transition-all`}
                        />
                      );
                    })}
                  </div>

                  {/* Language Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {languagesData.languages.map((lang, idx) => {
                      const colors = [
                        'bg-indigo-600',
                        'bg-emerald-500',
                        'bg-amber-500',
                        'bg-rose-500',
                        'bg-purple-600',
                        'bg-cyan-500',
                        'bg-blue-600',
                      ];
                      const dotColor = colors[idx % colors.length];
                      return (
                        <div
                          key={lang.name}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{lang.name}</h4>
                              <p className="text-[11px] text-slate-500">{lang.repo_count} repositories</p>
                            </div>
                          </div>
                          <span className="text-base font-extrabold text-slate-800 font-mono">
                            {lang.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Educational Context Note */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> B.Tech Career Insight:
                    </span>
                    <p className="leading-relaxed">
                      Balancing low-level languages (C, C++, Java) for Data Structures and Algorithms with high-level ecosystems (TypeScript, Python, Go) for Web and Distributed Systems maximizes placement interview readiness across top product and service firms.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: LEARNING DISCOVERY */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Educational Repository Discovery</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Discover verified open-source engineering reference projects, algorithm libraries, and system architecture blueprints tailored for B.Tech students.
                </p>
              </div>

              {/* Search & Topic Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search learning repositories (e.g. algorithms, distributed systems)..."
                    value={learningQuery}
                    onChange={(e) => setLearningQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { label: 'All Topics', value: undefined },
                    { label: 'DSA & Algorithms', value: 'algorithms-dsa' },
                    { label: 'System Design', value: 'system-design' },
                    { label: 'Web Dev', value: 'fullstack-web' },
                    { label: 'AI & Machine Learning', value: 'ai-ml' },
                    { label: 'DevOps & Cloud', value: 'devops' },
                  ].map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => setLearningTopic(topic.value)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                        learningTopic === topic.value
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {isLearningLoading ? (
              <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Discovering educational repositories...</span>
              </div>
            ) : !learningResults || learningResults.items.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">No Learning Repositories Found</h4>
                <p className="text-xs text-slate-500">Try adjusting your search query or topic filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {learningResults.items.map((repo: any) => (
                  <div
                    key={repo.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                          {repo.language || 'Multi-language'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {repo.stargazers_count?.toLocaleString()}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 truncate">{repo.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {repo.description || 'Verified open-source educational repository.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        Owner: {repo.owner?.login || 'official'}
                      </span>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                      >
                        View on GitHub <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Connect GitHub Account</h3>
                  <p className="text-xs text-slate-300">Choose your preferred authorization method</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Option A: Personal Access Token (Recommended for Local Dev) */}
              <form onSubmit={handleConnectWithPat} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Method 1: Personal Access Token (PAT)
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    AES-256 Encrypted
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">GitHub Access Token</label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={patTokenInput}
                    onChange={(e) => setPatTokenInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Generate at GitHub → Settings → Developer Settings → Personal Access Tokens (`read:user`, `repo`).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Username (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. torvalds"
                    value={patUsernameInput}
                    onChange={(e) => setPatUsernameInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={connectPatMutation.isPending}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-300" />
                  {connectPatMutation.isPending ? 'Verifying & Encrypting...' : 'Connect via Encrypted PAT'}
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Option B: Quick Demo Fallback */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Method 2: Quick Connect (Student Sandbox)
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Instantly load verified sample student engineering repositories for testing without creating a personal access token.
                </p>
                <button
                  type="button"
                  onClick={handleQuickConnect}
                  disabled={connectUsernameMutation.isPending}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                  {connectUsernameMutation.isPending ? 'Connecting...' : 'Connect Demo Student Profile'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Project Modal */}
      {activeModalRepo && (
        <RepoFeatureModal
          repoId={activeModalRepo.id}
          repoName={activeModalRepo.name}
          isFeaturedInitial={activeModalRepo.is_featured}
          initialMetadata={activeModalRepo.featured_metadata}
          isOpen={isFeatureModalOpen}
          onClose={() => {
            setIsFeatureModalOpen(false);
            setActiveModalRepo(null);
          }}
        />
      )}

      {/* Resume Bullets Modal */}
      {activeModalRepo && (
        <RepoResumeModal
          repoId={activeModalRepo.id}
          repoName={activeModalRepo.name}
          defaultTechStack={activeModalRepo.languages || [activeModalRepo.language]}
          isOpen={isResumeModalOpen}
          onClose={() => {
            setIsResumeModalOpen(false);
            setActiveModalRepo(null);
          }}
        />
      )}
    </div>
  );
};
