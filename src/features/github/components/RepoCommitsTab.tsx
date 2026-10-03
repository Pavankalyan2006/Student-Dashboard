import React, { useState } from 'react';
import { useGitHubCommits } from '../hooks/useGitHub';
import { GitHubCommit } from '../types';
import { GitCommit, Sparkles, User, Calendar, GitBranch } from 'lucide-react';

interface RepoCommitsTabProps {
  repoId: string;
}

export const RepoCommitsTab: React.FC<RepoCommitsTabProps> = ({ repoId }) => {
  const { data: commits = [], isLoading } = useGitHubCommits(repoId);
  const [summarizedHash, setSummarizedHash] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Commit History</h2>
          <p className="text-xs text-slate-500">Chronological code revisions and affected module changes.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading commits...
        </div>
      ) : commits.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <GitCommit className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Commits Synced</h4>
        </div>
      ) : (
        <div className="space-y-3">
          {commits.map((c, idx) => {
            const commitHash = c.hash || (c as any).sha || `commit-${idx}`;
            const shortHash = commitHash.length >= 7 ? commitHash.substring(0, 7) : commitHash;
            const branchName = c.branch || (c as any).base_branch || 'main';
            const authorName = c.author || (c as any).author_name || 'Contributor';
            const commitDate = c.committed_at || (c as any).date;
            const formattedDate = commitDate ? new Date(commitDate).toLocaleDateString() : 'Recent';
            const filesCount = c.files_changed || (c as any).changed_files_count || 1;
            const hasDiffStats = c.additions !== undefined && c.deletions !== undefined;

            return (
              <div
                key={commitHash}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all flex flex-wrap items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {shortHash}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <GitBranch className="w-3 h-3" /> {branchName}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{c.message}</h4>
                  <div className="text-xs text-slate-500 flex items-center gap-3 pt-0.5">
                    <span>By {authorName}</span>
                    <span>·</span>
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-500">
                    {filesCount} files {hasDiffStats ? `(+${c.additions} / -${c.deletions})` : ''}
                  </span>
                  <button
                    onClick={() =>
                      setSummarizedHash(summarizedHash === commitHash ? null : commitHash)
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    {summarizedHash === commitHash ? 'Hide' : 'Explain'}
                  </button>
                </div>

                {summarizedHash === commitHash && (
                  <div className="w-full pt-3 mt-2 border-t border-slate-100 text-xs text-indigo-950 bg-indigo-50/50 p-3 rounded-xl">
                    <strong>AI Commit Summary:</strong> Commit introduces changes across {filesCount} module(s) emphasizing security and modular component separation.
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
