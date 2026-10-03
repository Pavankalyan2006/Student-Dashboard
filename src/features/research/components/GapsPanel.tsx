import React from 'react';
import { useResearchGaps, useAnalyzeGaps } from '../hooks/useResearch';
import { ResearchGap } from '../types';
import { AlertCircle, Sparkles, RefreshCw, CheckCircle2, ShieldAlert, BookOpen } from 'lucide-react';

interface GapsPanelProps {
  projectId: string;
}

export const GapsPanel: React.FC<GapsPanelProps> = ({ projectId }) => {
  const { data: gaps = [], isLoading } = useResearchGaps(projectId);
  const analyzeMutation = useAnalyzeGaps(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Gap Analysis</h2>
          <p className="text-xs text-slate-500">
            Identify potential boundaries, unaddressed edge distributions, and methodological voids in current literature.
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
          Analyze Gaps from Papers
        </button>
      </div>

      {/* Epistemic disclaimer badge */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <span className="font-bold">Academic Grounding Notice:</span> All items below represent{' '}
          <span className="font-semibold underline">potential research gaps based on the analyzed sources</span>. They are derived from explicit limitations reported in peer-reviewed papers rather than asserted as unverified facts.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading gap analysis...
        </div>
      ) : gaps.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Gaps Identified Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Analyze Gaps from Papers" to extract empirical bounds from your saved research literature.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 transition-all space-y-3 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                    {gap.category} GAP
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Confidence: {gap.confidence_status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Potential gap based on analyzed sources
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{gap.description}</h4>

              {gap.evidence && gap.evidence.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Supporting Literature Evidence
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-700">
                    {gap.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
