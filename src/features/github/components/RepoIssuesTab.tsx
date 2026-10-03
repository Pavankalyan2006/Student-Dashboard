import React, { useState } from 'react';
import { useGitHubIssues } from '../hooks/useGitHub';
import { GitHubIssue } from '../types';
import { AlertCircle, Sparkles, CheckCircle2, Tag, ShieldCheck } from 'lucide-react';

interface RepoIssuesTabProps {
  repoId: string;
}

export const RepoIssuesTab: React.FC<RepoIssuesTabProps> = ({ repoId }) => {
  const { data: issues = [], isLoading } = useGitHubIssues(repoId);
  const [selectedIssueNum, setSelectedIssueNum] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Repository Issues</h2>
          <p className="text-xs text-slate-500">
            Open issues and bug reports. Read-only AI inspection and learning task formulation.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading issues...
        </div>
      ) : issues.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Open Issues</h4>
          <p className="text-xs text-slate-500">Repository issue tracker is clean.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, idx) => {
            const issueKey = (issue as any).id || issue.number || `issue-${idx}`;
            const statusLabel = (issue as any).state || (issue as any).status || 'open';
            const labels = issue.labels || [];

            return (
              <div
                key={issueKey}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{issue.number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold uppercase">
                        {statusLabel}
                      </span>
                      {labels.map((l, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {l}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{issue.title}</h4>
                    <p className="text-xs text-slate-500">Opened by {issue.author}</p>
                  </div>

                <button
                  onClick={() =>
                    setSelectedIssueNum(selectedIssueNum === issue.number ? null : issue.number)
                  }
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {selectedIssueNum === issue.number ? 'Hide Steps' : 'AI Investigation Plan'}
                </button>
              </div>

              {issue.body && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {issue.body}
                </p>
              )}

              {selectedIssueNum === issue.number && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Recommended Investigation Steps
                  </div>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Inspect input validation boundaries in related API route files.</li>
                    <li>Verify whether unit tests reproduce the reported condition.</li>
                    <li>Ensure secret values and database credentials remain protected.</li>
                  </ol>
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
