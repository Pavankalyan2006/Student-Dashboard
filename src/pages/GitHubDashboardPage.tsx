import React from 'react';
import { useNavigate } from '../lib/router';
import { useGitHubStatus, useGitHubRepositories, useDisconnectGitHub } from '../features/github/hooks/useGitHub';
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
} from 'lucide-react';

interface GitHubDashboardPageProps {
  onNavigate?: (path: string) => void;
}

export const GitHubDashboardPage: React.FC<GitHubDashboardPageProps> = ({ onNavigate }) => {
  const fallbackNavigate = useNavigate();
  const navigate = onNavigate || fallbackNavigate;
  const { data: status, isLoading: isStatusLoading } = useGitHubStatus();
  const { data: repos = [], isLoading: isReposLoading } = useGitHubRepositories();
  const disconnectMutation = useDisconnectGitHub();

  const isConnected = status?.is_connected;
  const connection = status?.connection;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold border border-white/20">
            <FolderGit2 className="w-3.5 h-3.5" />
            Developer Workspace & Code Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            GitHub Integration
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Connect repositories to inspect architecture, run automated code reviews, generate unit tests, and integrate technical evidence into your Project Builder portfolio.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isConnected ? (
              <button
                onClick={() => navigate('/github/connect')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4" />
                Connect GitHub Account
              </button>
            ) : (
              <button
                onClick={() => navigate('/github/repos')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4" />
                View Repositories ({repos.length})
              </button>
            )}

            <button
              onClick={() => {
                if (repos[0]) navigate(`/github/repo/${repos[0].id}?tab=analysis`);
                else navigate('/github/repos');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Repository AI Intelligence
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Security & Token Guarantee Notice */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 flex items-start gap-3 text-xs shadow-md">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-white">Cryptographic Token Protection:</span> All GitHub OAuth access tokens are encrypted with AES-256 on the server and are strictly never sent to the browser or stored in localStorage. Default GitHub permission mode is strictly <span className="underline font-semibold">READ ONLY</span>.
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Connected Account & Repositories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Connection Status</h3>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                  Not Connected
                </span>
              )}
            </div>

            {isConnected && connection ? (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  {connection.avatar_url && (
                    <img
                      src={connection.avatar_url}
                      alt={connection.username}
                      className="w-12 h-12 rounded-full border border-slate-200 shadow-2xs"
                    />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{connection.name || connection.username}</h4>
                    <p className="text-xs text-slate-500 font-mono">@{connection.username}</p>
                    <div className="flex gap-1.5 mt-1">
                      {connection.scopes.map((s, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Connect your GitHub account to sync repositories and inspect codebases.</span>
                <button
                  onClick={() => navigate('/github/connect')}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
                >
                  Connect Now
                </button>
              </div>
            )}
          </div>

          {/* Recent Repositories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Connected Repositories</h3>
                <p className="text-xs text-slate-500">Repositories available for architectural analysis</p>
              </div>
              <button
                onClick={() => navigate('/github/repos')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All ({repos.length})
              </button>
            </div>

            {isReposLoading ? (
              <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                Loading repositories...
              </div>
            ) : repos.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Repositories Synchronized</h4>
                <p className="text-xs text-slate-500">Connect GitHub to load your software projects.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/github/repo/${r.id}`)}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.language}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                          {r.visibility}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {r.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{r.description || 'No description provided'}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>★ {r.stars}</span>
                        <span>⑂ {r.forks}</span>
                      </div>
                      <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Code Intelligence Capabilities */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Code Intelligence Features</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" /> Architectural Component Detection
                </div>
                <p className="text-slate-500 text-[11px]">
                  Maps Frontend, Backend, Database, and Storage nodes directly from codebase evidence.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Automated Secret Redaction
                </div>
                <p className="text-slate-500 text-[11px]">
                  Scans source code for API keys, tokens, and private keys, sanitizing them before LLM analysis.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-600" /> Project Builder Integration
                </div>
                <p className="text-slate-500 text-[11px]">
                  Links GitHub repository commits and architecture to your capstone project portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
