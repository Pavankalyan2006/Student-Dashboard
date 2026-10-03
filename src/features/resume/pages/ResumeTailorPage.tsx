import React, { useEffect, useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { FullResumeData, ResumeTailoringResult } from '../types/resumeTypes';
import {
  Target,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FolderGit2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumeTailorPageProps {
  resumeId: string;
  onNavigate: (path: string) => void;
}

export const ResumeTailorPage: React.FC<ResumeTailorPageProps> = ({ resumeId, onNavigate }) => {
  const [data, setData] = useState<FullResumeData | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tailoringResult, setTailoringResult] = useState<ResumeTailoringResult | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const full = await resumeApi.getFullResume(resumeId);
        setData(full);
        setJobTitle(full.resume.target_role || 'Software Engineer');
      } catch {
        toast.error('Failed to load resume');
      }
    };
    fetch();
  }, [resumeId]);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }
    try {
      setIsLoading(true);
      const res = await resumeApi.tailorResume(resumeId, {
        job_description: jobDescription,
        job_title: jobTitle,
        company,
      });
      setTailoringResult(res);
      toast.success('Resume tailored successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to tailor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <button
          onClick={() => onNavigate(`/resume/${resumeId}/edit`)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resume Tailoring & Job Alignment
          </h1>
          <p className="text-xs text-slate-500">
            Compare your verified experience against target job postings to identify keyword matches and gaps.
          </p>
        </div>
      </div>

      {!tailoringResult ? (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Backend Developer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Amazon, Start-up"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description Text *
            </label>
            <textarea
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting requirements and responsibilities here..."
              className="w-full p-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 text-blue-800 text-xs border border-blue-200">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              Factual Alignment: We match only skills and projects you have verified in your profile.
            </span>
          </div>

          <button
            onClick={handleTailor}
            disabled={isLoading || !jobDescription.trim()}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? 'Analyzing Compatibility...' : 'Run Alignment Analysis'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Alignment for {tailoringResult.job_title} at {tailoringResult.company}
              </h2>
              <p className="text-xs text-slate-500">{tailoringResult.disclaimer}</p>
            </div>
            <button
              onClick={() => setTailoringResult(null)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Tailor another posting
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Matched Skills ({tailoringResult.matched_skills.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tailoringResult.matched_skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Unrepresented Keywords ({tailoringResult.potential_skill_gaps.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tailoringResult.potential_skill_gaps.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Phrasing tweaks */}
          {tailoringResult.suggested_wording.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Suggested Resume Adjustments
              </h3>
              <div className="space-y-3">
                {tailoringResult.suggested_wording.map((sw, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 text-xs">
                    <span className="font-bold text-blue-600 block">{sw.section}: {sw.reason}</span>
                    <div className="text-slate-500">Current: "{sw.current}"</div>
                    <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-800 font-medium">
                      Suggestion: "{sw.suggested}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
