// src/features/jobs/components/JobDetailsModal.tsx
// Comprehensive job details dialog with Transparent Profile Match, Official Links, and Tracking

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Banknote,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Check,
  AlertCircle,
  Copy,
  Users,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { JobListing, StudentJobMatchExplanation } from '../types/jobsTypes';
import { jobsApi } from '../api/jobsApi';
import { copyText } from '../../../lib/clipboard';

interface JobDetailsModalProps {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave: (job: JobListing) => void;
  onTrackApplication: (job: JobListing, status?: string, notes?: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onTrackApplication,
}) => {
  const [matchData, setMatchData] = useState<StudentJobMatchExplanation | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [trackNotes, setTrackNotes] = useState('');
  const [trackStatus, setTrackStatus] = useState('SAVED');
  const [showTrackForm, setShowTrackForm] = useState(false);

  useEffect(() => {
    if (job && isOpen) {
      setIsLoadingMatch(true);
      jobsApi
        .getJobMatch(job.id)
        .then((data) => setMatchData(data))
        .catch(() => setMatchData(null))
        .finally(() => setIsLoadingMatch(false));
    } else {
      setMatchData(null);
      setShowTrackForm(false);
      setTrackNotes('');
    }
  }, [job, isOpen]);

  if (!isOpen || !job) return null;

  const isGovt = job.category === 'GOVERNMENT';

  const handleCopyLink = () => {
    copyText(window.location.origin + `/career/jobs?id=${job.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTrackSubmit = () => {
    onTrackApplication(job, trackStatus, trackNotes);
    setShowTrackForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top colored accent bar */}
        <div
          className={`h-2 w-full ${
            isGovt
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
              : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500'
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isGovt
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                {isGovt ? <Building2 className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                {isGovt ? 'Official Government Recruitment' : 'Private Engineering Opportunity'}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {job.subcategory.replace(/_/g, ' ')}
              </span>

              {job.notification_number && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <FileText className="w-3.5 h-3.5" />
                  {job.notification_number}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h2>
            <div className="flex items-center gap-2 mt-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              <span>{job.organization}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                Source: {job.source_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy opportunity link"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>

            <button
              onClick={() => onToggleSave(job)}
              className={`p-2 rounded-xl transition-colors ${
                isSaved
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? 'Saved' : 'Save'}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Transparent AI Profile Match Card */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-purple-950/20 p-5 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Transparent Student Profile Match
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compares the skills this listing names with the skills on your profile and resume
                  </p>
                </div>
              </div>

              {matchData && (
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {matchData.match_percentage === null ? '—' : `${matchData.match_percentage}%`}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Listed skills on your profile
                  </span>
                </div>
              )}
            </div>

            {isLoadingMatch ? (
              <div className="flex items-center gap-2 py-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Analyzing requirements against your student record...
              </div>
            ) : matchData ? (
              <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {matchData.match_basis}
                </p>
                {matchData.ai_explanation && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold">AI suggestion:</span> {matchData.ai_explanation}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Competencies ({matchData.matched_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {matchData.matched_skills.length > 0 ? (
                        matchData.matched_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No direct overlaps detected yet</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-rose-700 dark:text-rose-400 block mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Gaps to Target Next ({matchData.missing_skills.length})
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {matchData.missing_skills.length > 0 ? (
                        matchData.missing_skills.slice(0, 4).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-rose-100/70 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-600 font-medium">All core technical skills satisfied!</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Recommended Action:</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {matchData.suggested_action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span>{matchData.qualification_match_details}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Location
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {job.location} {job.remote_eligible && '(Remote Eligible)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block mb-1 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5" /> Compensation / Pay
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {job.salary_text || 'Standard Cadre Scale'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Application Deadline
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {job.application_deadline || 'Open / Rolling'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-400 block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Open Vacancies
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {job.total_vacancies ? `${job.total_vacancies} Posts` : 'Multiple Openings'}
              </span>
            </div>
          </div>

          {/* Description & Mission */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Role Description & Mission
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Educational Qualification & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                Educational Qualification
              </h5>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {job.minimum_qualification}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                Experience & Eligibility Criteria
              </h5>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {job.experience_label}
                {job.age_limit_max && ` | Maximum Age Limit: ${job.age_limit_max} Years`}
                {job.application_fee_text && ` | Application Fee: ${job.application_fee_text}`}
              </p>
            </div>
          </div>

          {/* Required Skills Section */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Required Technical Competencies
              </h4>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inline Track Application Form */}
          {showTrackForm && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in">
              <h5 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                Track in Application Tracker
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Application Status
                  </label>
                  <select
                    value={trackStatus}
                    onChange={(e) => setTrackStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="SAVED">Saved (not applied yet)</option>
                    <option value="APPLIED">Applied (I submitted it myself)</option>
                    <option value="ASSESSMENT">Assessment / Exam scheduled</option>
                    <option value="INTERVIEW">Interview scheduled</option>
                    <option value="OFFER">Offer received</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Personal Notes / Admit Card No.
                  </label>
                  <input
                    type="text"
                    value={trackNotes}
                    onChange={(e) => setTrackNotes(e.target.value)}
                    placeholder="e.g. Registered with Hall Ticket, exam in June"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrackForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTrackSubmit}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Save to Tracker
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!showTrackForm && (
              <button
                type="button"
                onClick={() => setShowTrackForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                Track Application
              </button>
            )}

            {job.official_notification_pdf_url && (
              <a
                href={job.official_notification_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Notification PDF (from the source)
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                isGovt
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              Open the original posting
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
