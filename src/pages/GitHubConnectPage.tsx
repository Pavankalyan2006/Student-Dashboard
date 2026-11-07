import React, { useState } from 'react';
import { useNavigate } from '../lib/router';
import { useConnectGitHub, useConnectGitHubPat } from '../features/github/hooks/useGitHub';
import { FolderGit2, ShieldCheck, ArrowLeft, CheckCircle2, Lock, KeyRound, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubConnectPageProps {
  onNavigate?: (path: string) => void;
}

export const GitHubConnectPage: React.FC<GitHubConnectPageProps> = ({ onNavigate }) => {
  const fallbackNavigate = useNavigate();
  const navigate = onNavigate || fallbackNavigate;
  const connectUsernameMutation = useConnectGitHub();
  const connectPatMutation = useConnectGitHubPat();

  const [activeTab, setActiveTab] = useState<'pat' | 'username'>('pat');
  const [token, setToken] = useState('');
  const [patUsername, setPatUsername] = useState('');
  const [username, setUsername] = useState('');

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Personal Access Token is required');
      return;
    }
    try {
      await connectPatMutation.mutateAsync({
        token: token.trim(),
        username: patUsername.trim() || undefined,
      });
      navigate('/github');
    } catch (err: any) {
      // handled
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectUsernameMutation.mutateAsync(username);
      navigate('/github');
    } catch (err: any) {
      toast.error('Failed to complete GitHub connection');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl space-y-6">
        <div>
          <button
            onClick={() => navigate('/github')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to GitHub Workspace
          </button>

          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-3">
            <FolderGit2 className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Connect GitHub Account</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Authorize read-only access to your repositories for AI code intelligence, architecture mapping, and career portfolio integration.
          </p>
        </div>

        {/* Minimal scopes list */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Requested Minimal Scopes (Read Only)
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">read:user</strong> — Read public student profile metadata
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">repo</strong> / <strong className="text-slate-800">public_repo</strong> — Inspect repository trees, READMEs & commits
              </span>
            </li>
          </ul>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pat')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pat' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Personal Access Token (PAT)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'username' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Sandbox / Username
          </button>
        </div>

        {activeTab === 'pat' ? (
          <form onSubmit={handlePatSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Personal Access Token
                </label>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  AES-256 Encrypted
                </span>
              </div>
              <input
                type="password"
                required
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Create a token at GitHub → Settings → Developer Settings → Personal access tokens.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                GitHub Username (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={patUsername}
                onChange={(e) => setPatUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={connectPatMutation.isPending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              {connectPatMutation.isPending ? 'Validating Token...' : 'Connect via Encrypted PAT'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="gh-username" className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                GitHub Username
              </label>
              <input
                id="gh-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Shows public profile data and public repositories only. No token is used, so this is not a verified connection and private data is never read.
              </p>
            </div>

            <button
              type="submit"
              disabled={connectUsernameMutation.isPending}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {connectUsernameMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
              )}
              {connectUsernameMutation.isPending ? 'Looking up profile...' : 'Link public profile'}
            </button>
          </form>
        )}

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          Access tokens are validated with GitHub, encrypted on the server (AES-256) and never sent back to the browser. A read-only token is enough. OAuth sign-in is available only when the server has a GitHub OAuth app configured.
        </p>
      </div>
    </div>
  );
};
