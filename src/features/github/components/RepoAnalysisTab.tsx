import React from 'react';
import { useGitHubAnalysis, useAnalyzeGitHubRepository } from '../hooks/useGitHub';
import { GitHubRepositoryAnalysis } from '../types';
import {
  Sparkles,
  Layers,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Database,
  Terminal,
  FileCode,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface RepoAnalysisTabProps {
  repoId: string;
}

export const RepoAnalysisTab: React.FC<RepoAnalysisTabProps> = ({ repoId }) => {
  const { data: analysis, isLoading } = useGitHubAnalysis(repoId);
  const analyzeMutation = useAnalyzeGitHubRepository(repoId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Architectural & Security Analysis</h2>
          <p className="text-xs text-slate-500">
            Automated code intelligence detecting framework components, system boundaries, and security concerns.
          </p>
        </div>

        <button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {analyzeMutation.isPending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {analysis ? 'Re-run Analysis' : 'Run Repository Analysis'}
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Analyzing codebase architecture and running secret redaction scans...
        </div>
      ) : !analysis ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Layers className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Analysis Available</h4>
          <p className="text-xs text-slate-500">Click "Run Repository Analysis" to evaluate this codebase.</p>
        </div>
      ) : (() => {
        const components = analysis.architecture_components || (analysis as any).components || [];
        const observedFacts = analysis.observed_facts || [];
        const aiSuggestions = analysis.ai_suggestions || [];
        const securityObservations =
          analysis.potential_security_concerns || (analysis as any).security_observations || [];

        return (
          <div className="space-y-6">
            {/* Architecture Components Grid */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> Detected Architecture Components ({components.length})
              </h3>

              {components.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  No explicit architectural components identified in current file tree.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {components.map((comp: any, idx: number) => {
                    const category = comp.category || comp.type || 'COMPONENT';
                    const evidenceFiles = comp.evidence_files || comp.files || [];

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                            {category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{comp.name}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>

                        {evidenceFiles.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="text-slate-400 font-medium">Evidence files:</span>
                            {evidenceFiles.map((file: string, fIdx: number) => (
                              <span
                                key={fIdx}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700"
                              >
                                {file}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Facts vs AI Suggestions (Strict Section 29 compliance) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Observed Facts */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Observed Facts (Code Evidence)</span>
                </div>
                {observedFacts.length === 0 ? (
                  <p className="text-xs text-slate-500">No observed facts recorded.</p>
                ) : (
                  <ul className="space-y-2 text-xs text-slate-700">
                    {observedFacts.map((fact: string, idx: number) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <strong className="text-emerald-950">Observed:</strong> {fact}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* AI Suggestions */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>AI Engineering Suggestions</span>
                </div>
                {aiSuggestions.length === 0 ? (
                  <p className="text-xs text-slate-500">No suggestions recorded.</p>
                ) : (
                  <ul className="space-y-2 text-xs text-slate-700">
                    {aiSuggestions.map((sug: string, idx: number) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                        <strong className="text-indigo-950">Suggestion:</strong> {sug}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Security & Secret Redaction Findings */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Potential Security & Maintainability Findings
              </h3>

              {securityObservations.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> No unredacted hardcoded credentials or API keys detected.
                </div>
              ) : (
                <ul className="space-y-2 text-xs">
                  {securityObservations.map((sec: string, idx: number) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
