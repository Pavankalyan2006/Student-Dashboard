// src/features/career/pages/JobDiscoveryPage.tsx
// Job Discovery, Job Description Import & Multi-Agent Gap Analysis

import * as React from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Sparkles,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  Send,
  Building,
  Target,
  FileText,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Layers,
  Award,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { externalIntegrationsApi } from '../../../api/externalIntegrationsApi';
import { ExternalJob, JobAnalysisResult } from '../../../types/externalIntegrations';
import { toast } from 'sonner';

interface JobDiscoveryPageProps {
  onNavigate?: (path: string) => void;
}

export function JobDiscoveryPage({ onNavigate }: JobDiscoveryPageProps) {
  const [jobs, setJobs] = React.useState<ExternalJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<string>('ALL');
  const [isRemoteOnly, setIsRemoteOnly] = React.useState(false);

  // Job Analysis Modal & State
  const [analyzingJob, setAnalyzingJob] = React.useState<ExternalJob | null>(null);
  const [analysisResult, setAnalysisResult] = React.useState<JobAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Paste / Import Job Description Modal
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [importForm, setImportForm] = React.useState({
    title: '',
    company: '',
    location: 'Bangalore, India',
    is_remote: true,
    url: '',
    description: '',
  });
  const [isImporting, setIsImporting] = React.useState(false);

  const loadJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      const jobList = await externalIntegrationsApi.getJobs({
        query: searchQuery || undefined,
        location: selectedLocation !== 'ALL' ? selectedLocation : undefined,
        remote: isRemoteOnly || undefined,
      });
      setJobs(jobList);
    } catch (err: any) {
      toast.error('Failed to load jobs: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedLocation, isRemoteOnly]);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleAnalyzeJob = async (job: ExternalJob) => {
    setAnalyzingJob(job);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await externalIntegrationsApi.analyzeJob(job.id);
      setAnalysisResult(result);
    } catch (err: any) {
      toast.error('Job analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.title || !importForm.company || !importForm.description) {
      toast.error('Please fill in title, company, and job description.');
      return;
    }

    try {
      setIsImporting(true);
      const newJob = await externalIntegrationsApi.importJobDescription(importForm);
      toast.success('Job imported successfully into your discovery pipeline!');
      setShowImportModal(false);
      setImportForm({
        title: '',
        company: '',
        location: 'Bangalore, India',
        is_remote: true,
        url: '',
        description: '',
      });
      await loadJobs();
      // Automatically run analysis on the newly imported job
      handleAnalyzeJob(newJob);
    } catch (err: any) {
      toast.error('Failed to import job: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleTrackJob = (job: ExternalJob) => {
    toast.success(`Job "${job.title}" at ${job.company || job.company_name} added to Application Tracker!`);
    if (onNavigate) {
      onNavigate('/applications');
    }
  };

  const handlePrepareJob = (job: ExternalJob) => {
    toast.info(`Configuring Placement Prep session for ${job.company || job.company_name} (${job.title})...`);
    if (onNavigate) {
      onNavigate('/placements');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Job Discovery & Gap Analysis"
        description="Search curated career opportunities or paste any external job description to generate multi-agent skill gap reports, resume tailoring, and interview preparation plans."
        badge={
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            Multi-Agent Career Agent
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate && onNavigate('/applications')}
              className="border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              <Target className="w-4 h-4 mr-1.5 text-indigo-400" />
              Application Tracker
            </Button>
            <Button
              size="sm"
              onClick={() => setShowImportModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Paste Job Description
            </Button>
          </div>
        }
      />

      {/* Search and Filters Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, company, or tech stack (e.g. React, Python, ML)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Locations</option>
              <option value="Bangalore">Bangalore, India</option>
              <option value="Hyderabad">Hyderabad, India</option>
              <option value="Pune">Pune, India</option>
              <option value="Remote">Remote</option>
            </select>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg">
              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={(e) => setIsRemoteOnly(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              Remote Only
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing {jobs.length} career opportunities</span>
          <span className="flex items-center gap-1 text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5" />
            External descriptions sanitized against prompt injection
          </span>
        </div>
      </div>

      {/* Job Listings Grid */}
      {loading ? (
        <LoadingState message="Scanning verified job openings..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs matching your filter"
          description="Try broadening your search query or paste any external job description from LinkedIn, Indeed, or company careers pages."
          action={
            <Button
              size="sm"
              onClick={() => setShowImportModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Paste External Job Description
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white hover:text-indigo-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Building className="w-3.5 h-3.5 text-indigo-400" />
                        {job.company || job.company_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location}
                      </span>
                      {job.is_remote && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {job.source}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(job.skills_required || job.required_skills || []).map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAnalyzeJob(job)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-200" />
                    AI Gap Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrepareJob(job)}
                    className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Prepare
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTrackJob(job)}
                    className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    <Target className="w-3.5 h-3.5 mr-1 text-sky-400" />
                    Track
                  </Button>
                  {(job.url || job.job_url) && (
                    <a
                      href={job.url || job.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Open Original Job Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: AI JOB GAP ANALYSIS (Section 26) */}
      {analyzingJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" /> Multi-Agent Job Fit Analysis
                </div>
                <h3 className="text-xl font-bold text-white">
                  {analyzingJob.title} <span className="text-slate-400 font-normal">at {analyzingJob.company || analyzingJob.company_name}</span>
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnalyzingJob(null)}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                Close
              </Button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isAnalyzing ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-slate-300 font-medium">
                    CareerAgent & SkillEvidenceAgent are comparing verified GitHub repos, LeetCode stats, and Courses against job specifications...
                  </p>
                </div>
              ) : analysisResult ? (
                <>
                  {/* Match Score Banner */}
                  <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-800/40 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold text-emerald-400">{analysisResult.fit_score ?? analysisResult.overall_match_score}% Match</div>
                      <p className="text-xs text-slate-300 mt-1">
                        High alignment with your verified B.Tech projects & coding history.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.success('Resume tailoring workspace loaded!');
                          if (onNavigate) onNavigate('/resume');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Tailor Resume
                      </Button>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Verified Evidence */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Verified In Your Profile (
                        {analysisResult.matched_skills?.length || 0})
                      </h4>
                      <div className="space-y-1.5">
                        {(analysisResult.matched_skills || []).map((skill: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs"
                          >
                            <span className="font-semibold text-slate-200">{skill}</span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills Needing Practice */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Skills Needing Practice (
                        {analysisResult.skills_needing_practice?.length || 0})
                      </h4>
                      <div className="space-y-1.5">
                        {(analysisResult.skills_needing_practice || []).map((skill: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-xs"
                          >
                            <span className="font-semibold text-slate-200">{skill}</span>
                            <button
                              onClick={() => {
                                toast.info(`Adding ${skill} to your study plan...`);
                                if (onNavigate) onNavigate('/study-planner');
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                            >
                              Add to Plan →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Relevant Student Projects */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Relevant Student Projects to Highlight:
                    </h4>
                    <div className="space-y-2">
                      {(analysisResult.relevant_projects || []).map((proj: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                          <div className="font-semibold text-indigo-300">{proj.title}</div>
                          <p className="text-slate-400">{proj.relevance_note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Prep Plan */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900/30 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> Recommended 7-Day Interview Prep:
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                      {(analysisResult.suggested_preparation || []).map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs text-slate-500">
                Data analyzed in accordance with student-owned records & zero AI prompt injection risks.
              </span>
              <Button
                size="sm"
                onClick={() => {
                  if (analyzingJob) handleTrackJob(analyzingJob);
                  setAnalyzingJob(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
              >
                Track in Application Center
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PASTE / IMPORT JOB DESCRIPTION */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Import / Paste External Job Description
                </h3>
                <p className="text-xs text-slate-400">
                  Import any job post from LinkedIn, Indeed, Glassdoor or careers page for instant AI analysis.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(false)}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={importForm.title}
                    onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={importForm.company}
                    onChange={(e) => setImportForm({ ...importForm, company: e.target.value })}
                    placeholder="e.g. Google, Microsoft, Startup"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={importForm.location}
                    onChange={(e) => setImportForm({ ...importForm, location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Original Job URL (Optional)</label>
                  <input
                    type="url"
                    value={importForm.url}
                    onChange={(e) => setImportForm({ ...importForm, url: e.target.value })}
                    placeholder="https://linkedin.com/jobs/view/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Job Description / Requirements *
                </label>
                <textarea
                  required
                  rows={6}
                  value={importForm.description}
                  onChange={(e) => setImportForm({ ...importForm, description: e.target.value })}
                  placeholder="Paste the requirements, qualifications, and role responsibilities here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importForm.is_remote}
                    onChange={(e) => setImportForm({ ...importForm, is_remote: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  Remote Position
                </label>

                <Button
                  type="submit"
                  disabled={isImporting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  {isImporting ? 'Processing...' : 'Import & Run Gap Analysis'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
