import React, { useState } from 'react';
import { useGitHubPullRequests } from '../hooks/useGitHub';
import { GitHubPullRequest } from '../types';
import { GitPullRequest, Sparkles, CheckCircle2, GitBranch, ShieldCheck } from 'lucide-react';

interface RepoPullRequestsTabProps {
  repoId: string;
}

export const RepoPullRequestsTab: React.FC<RepoPullRequestsTabProps> = ({ repoId }) => {
  const { data: pullRequests = [], isLoading } = useGitHubPullRequests(repoId);
  const [selectedPrNum, setSelectedPrNum] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pull Requests</h2>
          <p className="text-xs text-slate-500">
            Active and merged pull requests. Automated reviewer checklist and change summaries.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading pull requests...
        </div>
      ) : pullRequests.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <GitPullRequest className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Pull Requests</h4>
        </div>
      ) : (
        <div className="space-y-3">
          {pullRequests.map((pr, idx) => {
            const prKey = (pr as any).id || pr.number || `pr-${idx}`;
            const statusLabel = (pr as any).state || (pr as any).status || 'open';
            const branchSource = (pr as any).head_branch || (pr as any).branch || 'feature';
            const branchTarget = (pr as any).base_branch || (pr as any).target_branch || 'main';
            const filesCount = pr.files_changed || 1;
            const hasStats = pr.additions !== undefined && pr.deletions !== undefined;

            return (
              <div
                key={prKey}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{pr.number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold uppercase">
                        {statusLabel}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <GitBranch className="w-3 h-3" /> {branchSource} → {branchTarget}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{pr.title}</h4>
                    <p className="text-xs text-slate-500">
                      Opened by {pr.author} · {filesCount} files changed {hasStats ? `(+${pr.additions} / -${pr.deletions})` : ''}
                    </p>
                  </div>

                <button
                  onClick={() => setSelectedPrNum(selectedPrNum === pr.number ? null : pr.number)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedPrNum === pr.number ? 'Hide Review' : 'AI Review Checklist'}
                </button>
              </div>

              {selectedPrNum === pr.number && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Pull Request Reviewer Checklist
                  </div>
                  <ul className="space-y-1 text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Ensure unit test coverage exists for all modified functions.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verify no secrets or tokens are introduced in the git diff.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Check that API contracts maintain backward compatibility.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
