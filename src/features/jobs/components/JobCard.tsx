// src/features/jobs/components/JobCard.tsx
// Rich interactive card component for Government & Private Job listings

import React from 'react';
import {
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
  Clock,
  ArrowRight,
} from 'lucide-react';
import { JobListing } from '../types/jobsTypes';

interface JobCardProps {
  job: JobListing;
  isSaved?: boolean;
  onSelect: (job: JobListing) => void;
  onToggleSave: (job: JobListing, e: React.MouseEvent) => void;
  onTrackApplication: (job: JobListing, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSaved,
  onSelect,
  onToggleSave,
  onTrackApplication,
}) => {
  const isGovt = job.category === 'GOVERNMENT';

  // Calculate days remaining
  let daysLeft: number | null = null;
  if (job.application_deadline) {
    const diff = (new Date(job.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    daysLeft = Math.ceil(diff);
  }

  return (
    <div
      onClick={() => onSelect(job)}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isGovt
            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
        }`}
      />

      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-xs ${
                isGovt
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {isGovt ? <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              {isGovt ? 'Government / PSU' : 'Private Tech'}
            </span>

            {job.notification_number && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <FileText className="w-3 h-3 text-slate-500" />
                {job.notification_number}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Status / Urgency pill */}
            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                <Clock className="w-3 h-3" />
                {daysLeft === 0 ? 'Closes Today' : `${daysLeft}d left`}
              </span>
            )}

            {/* Bookmark button */}
            <button
              type="button"
              onClick={(e) => onToggleSave(job, e)}
              title={isSaved ? 'Remove from Saved' : 'Save opportunity'}
              className={`p-2 rounded-xl transition-all ${
                isSaved
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Title & Organization */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>{job.organization}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500 inline-shrink-0" title="Verified Opportunity" />
          </div>
        </div>

        {/* Key Info Pills */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {job.location}
            {job.remote_eligible && (
              <span className="text-indigo-600 dark:text-indigo-400 font-medium ml-1">(Remote)</span>
            )}
          </span>

          {job.salary_text && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
              <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {job.salary_text}
            </span>
          )}

          {job.is_freshers_friendly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Freshers (0-1 Yrs)
            </span>
          )}

          {job.total_vacancies && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
              {job.total_vacancies} Vacancies
            </span>
          )}

          {job.application_deadline && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Deadline: {job.application_deadline}
            </span>
          )}
        </div>

        {/* Skills preview */}
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.required_skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-md text-[11px] text-slate-400">
                +{job.required_skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onTrackApplication(job, e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Add directly to Applications Tracker"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            Track
          </button>

          {job.official_notification_pdf_url && (
            <a
              href={job.official_notification_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              title="Download official PDF notification"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(job)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Match & Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open official recruitment portal"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
