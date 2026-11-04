// src/features/jobs/components/ExternalJdAnalyzerModal.tsx
// AI Job Description Analyzer & Preparation Checklist Generator

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileSearch,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  ListChecks,
} from 'lucide-react';
import { jobsApi } from '../api/jobsApi';
import { JobPrimaryCategory } from '../types/jobsTypes';

interface ExternalJdAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExternalJdAnalyzerModal: React.FC<ExternalJdAnalyzerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<JobPrimaryCategory>('PRIVATE');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 20) return;

    try {
      setLoading(true);
      const data = await jobsApi.analyzeExternalJd({
        title,
        organization,
        category,
        description,
      });
      setResult(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Job Description Analyzer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste any external job description or official gazette circular to extract required skills, qualifications, and an interview preparation checklist.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!result ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer / Scientist B"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, DRDO, TCS, ISRO"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sector Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="PRIVATE">Private Sector / Industry</option>
                    <option value="GOVERNMENT">Government / PSU / Ministry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Job Description / Notification Text *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste the job requirements, responsibilities, or notification circular text here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl text-xs font-mono leading-relaxed border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || description.length < 20}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Analyzing with Gemini AI...' : 'Analyze Job Description'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                    {result.category} • {result.subcategory}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    AI Analysis Report
                  </h4>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Analyze Another JD
                </button>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Executive Summary
                </h5>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-2">
                  {result.simplified_explanation}
                </p>
              </div>

              {/* Extracted Skills */}
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Extracted Core Technologies & Skills ({result.extracted_skills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result.extracted_skills?.map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Qualification & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Minimum Qualification
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">{result.minimum_qualification}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Experience Requirement
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">{result.experience_label}</p>
                </div>
              </div>

              {/* Preparation Checklist */}
              {result.preparation_checklist && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60">
                  <h5 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Targeted Preparation Checklist
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {result.preparation_checklist.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 inline-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
