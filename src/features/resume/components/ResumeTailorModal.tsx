import React, { useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { ResumeTailoringResult } from '../types/resumeTypes';
import { X, Sparkles, Target, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
}

export const ResumeTailorModal: React.FC<ResumeTailorModalProps> = ({
  isOpen,
  onClose,
  resumeId,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tailoringResult, setTailoringResult] = useState<ResumeTailoringResult | null>(null);

  if (!isOpen) return null;

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    try {
      setIsLoading(true);
      const result = await resumeApi.tailorResume(resumeId, {
        job_description: jobDescription,
        job_title: jobTitle || 'Target Role',
        company: company || 'Company',
      });
      setTailoringResult(result);
      toast.success('Resume tailored against job description');
    } catch (err: any) {
      toast.error(err.message || 'Failed to tailor resume');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shadow-2xs">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Job Description Tailoring
              </h2>
              <p className="text-xs text-slate-500">
                Match verified resume evidence against target requirements without fabricating claims
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!tailoringResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title / Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Backend Software Engineer"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Acme Tech"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paste Job Description *
                </label>
                <textarea
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the requirements, responsibilities, and qualifications from the target job posting..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  Anti-Fabrication Guardrail: The AI will highlight your real skills and recommend framing adjustments, but will NEVER invent technologies you have not verified.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Target: {tailoringResult.job_title} at {tailoringResult.company}
                  </h3>
                  <button
                    onClick={() => setTailoringResult(null)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Analyze another description
                  </button>
                </div>
                <p className="text-xs text-slate-500">{tailoringResult.disclaimer}</p>
              </div>

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Matched Verified Skills ({tailoringResult.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoringResult.matched_skills.length > 0 ? (
                      tailoringResult.matched_skills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No direct skills matched yet.</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Potential Skill Gaps ({tailoringResult.potential_skill_gaps.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoringResult.potential_skill_gaps.length > 0 ? (
                      tailoringResult.potential_skill_gaps.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600">Great alignment! No prominent missing skills.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggested Wording Adjustments */}
              {tailoringResult.suggested_wording.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Suggested Resume Phrasing Improvements
                  </h4>
                  {tailoringResult.suggested_wording.map((sw, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                        <span>Section: {sw.section}</span>
                        <span className="text-blue-600 font-normal">{sw.reason}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        <span className="font-semibold text-slate-700">Original: </span>
                        {sw.current}
                      </div>
                      <div className="text-slate-900 text-[11px] p-2.5 rounded-lg bg-blue-50/80 border border-blue-100">
                        <span className="font-semibold text-blue-600">Tailored Suggestion: </span>
                        {sw.suggested}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          {!tailoringResult && (
            <button
              onClick={handleTailor}
              disabled={isLoading || !jobDescription.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Target className="h-3.5 w-3.5" />
                  Tailor Resume
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
