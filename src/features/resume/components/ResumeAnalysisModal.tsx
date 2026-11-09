import React from 'react';
import { ResumeAnalysisResult } from '../types/resumeTypes';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface ResumeAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ResumeAnalysisResult | null;
  isLoading: boolean;
  onApplyBulletFix?: (current: string, suggestion: string) => void;
}

export const ResumeAnalysisModal: React.FC<ResumeAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onApplyBulletFix,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Resume ATS & Quality Analysis
              </h2>
              <p className="text-xs text-slate-500">
                Transparent rubric evaluating keyword coverage, structure, and readability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500">
              <Sparkles className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium">Running resume checks...</p>
            </div>
          ) : !analysis ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">No analysis data available. Click Analyze Resume to run.</p>
            </div>
          ) : (
            <>
              {/* Score & Transparent Breakdown Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-md">
                    <span className="text-xl leading-none">{analysis.calculated_score}</span>
                    <span className="text-[10px] opacity-80 uppercase">Score</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Resume checklist score
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {analysis.scoring_explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{analysis.disclaimer}</p>
              </div>

              {/* Grid Checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Keyword Coverage */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-blue-600" />
                      Role Keywords ({analysis.keyword_coverage.coverage_percentage === null ? 'no target role' : `${analysis.keyword_coverage.coverage_percentage}%`})
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-600 block mb-1">
                        Found in Resume:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keyword_coverage.found_keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    {analysis.keyword_coverage.missing_keywords.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Role skills not found (add only if you have used them):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {analysis.keyword_coverage.missing_keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Section Structure */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      Section Structure
                    </span>
                    {analysis.section_structure.valid ? (
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Complete
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Incomplete
                      </span>
                    )}
                  </div>
                  <ul className="text-xs space-y-1 text-slate-600">
                    {analysis.section_structure.suggestions.length > 0 ? (
                      analysis.section_structure.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-blue-600 font-bold">•</span>
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="text-[11px] text-emerald-600">All standard resume sections are represented.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Weak Bullet Phrasings & Suggested Improvements */}
              {analysis.weak_bullet_phrasings.length > 0 && (
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40">
                  <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    Phrasing to review ({analysis.weak_bullet_phrasings.length})
                  </h4>
                  <div className="space-y-3">
                    {analysis.weak_bullet_phrasings.map((wb, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-md bg-white border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="text-slate-500 text-[11px]">
                          <span className="font-semibold text-red-600">Current: </span>
                          "{wb.current}"
                        </div>
                        {wb.suggestion && (
                          <div className="text-slate-800 text-[11px]">
                            <span className="font-semibold text-emerald-600">Suggested: </span>
                            "{wb.suggestion}"
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>{wb.reason}</span>
                          {onApplyBulletFix && wb.suggestion && (
                            <button
                              onClick={() => onApplyBulletFix(wb.current, wb.suggestion)}
                              className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition"
                            >
                              Apply Suggestion
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
