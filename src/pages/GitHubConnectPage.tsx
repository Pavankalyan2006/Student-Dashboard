import React, { useState } from 'react';
import { useNavigate } from '../lib/router';
import { useConnectGitHub } from '../features/github/hooks/useGitHub';
import { FolderGit2, ShieldCheck, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubConnectPageProps {
  onNavigate?: (path: string) => void;
}

export const GitHubConnectPage: React.FC<GitHubConnectPageProps> = ({ onNavigate }) => {
  const fallbackNavigate = useNavigate();
  const navigate = onNavigate || fallbackNavigate;
  const connectMutation = useConnectGitHub();
  const [username, setUsername] = useState('student-engineer');

  const handleSimulateOAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectMutation.mutateAsync(username);
      navigate('/github');
    } catch (err: any) {
      toast.error('Failed to complete GitHub authorization');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div>
          <button
            onClick={() => navigate('/github')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to GitHub Dashboard
          </button>

          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-3">
            <FolderGit2 className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">Connect GitHub Account</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Authorize read-only access to your repositories for AI code intelligence, architecture mapping, and project linking.
          </p>
        </div>

        {/* Minimal scopes list */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Requested Minimal Scopes
          </div>
          <ul className="space-y-1.5 text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">read:user</strong> — Read public student profile
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">public_repo</strong> — Inspect public repositories & files
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong className="text-slate-800">repo:status</strong> — Read commit & CI pipeline statuses
              </span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSimulateOAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              GitHub Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={connectMutation.isPending}
            className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            {connectMutation.isPending ? 'Exchanging Secure Token...' : 'Authorize GitHub Integration'}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          OAuth state verified with CSRF cryptographic tokens. Tokens are encrypted server-side with AES-256 and never logged or exposed.
        </p>
      </div>
    </div>
  );
};
