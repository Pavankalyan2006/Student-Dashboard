// src/features/jobs/pages/JobsDiscoveryPage.tsx
// Master page for Multi-Source Jobs Discovery Platform (Government + Private)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Building2,
  Briefcase,
  Bookmark,
  Bell,
  Sparkles,
  Radio,
  Clock,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  FileSearch,
  GraduationCap,
} from 'lucide-react';
import { jobsApi } from '../api/jobsApi';
import {
  JobListing,
  JobPrimaryCategory,
  StudentSavedJob,
  JobsDashboardStats,
  SubcategoryMeta,
} from '../types/jobsTypes';
import { JobCard } from '../components/JobCard';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { JobAlertsModal } from '../components/JobAlertsModal';
import { ExternalJdAnalyzerModal } from '../components/ExternalJdAnalyzerModal';
import { JobSourcesHealthModal } from '../components/JobSourcesHealthModal';
import { useProfileDefaults } from '../../profile/hooks/useProfileDefaults';
import { ProfileQuickPicks } from '../../profile/components/ProfileQuickPicks';

interface JobsDiscoveryPageProps {
  onNavigate?: (path: string) => void;
}

export const JobsDiscoveryPage: React.FC<JobsDiscoveryPageProps> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // State
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<StudentSavedJob[]>([]);
  const [stats, setStats] = useState<JobsDashboardStats | null>(null);
  const [categoriesData, setCategoriesData] = useState<{
    government: { subcategories: SubcategoryMeta[] };
    private: { subcategories: SubcategoryMeta[] };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'GOVERNMENT' | 'PRIVATE' | 'SAVED'>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [freshersOnly, setFreshersOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'deadline'>('newest');

  // Modals
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Stats and Categories
  const loadInitialData = async () => {
    try {
      const [statsRes, catRes, savedRes] = await Promise.all([
        jobsApi.getStats(),
        jobsApi.getCategories(),
        jobsApi.getSavedJobs().catch(() => []),
      ]);
      setStats(statsRes);
      setCategoriesData(catRes as any);
      setSavedJobs(savedRes || []);
    } catch {
      // ignore
    }
  };

  // Fetch Jobs based on filters
  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {
        q: searchQuery || undefined,
        category: activeTab === 'SAVED' ? undefined : activeTab,
        subcategory: selectedSubcategory !== 'ALL' ? selectedSubcategory : undefined,
        location: locationQuery || undefined,
        remote_only: remoteOnly ? true : undefined,
        freshers_only: freshersOnly ? true : undefined,
        sort_by: sortBy,
        limit: 100,
      };

      const res = await jobsApi.getJobs(params);
      setJobs(res.jobs || []);

      // If URL has ?id=xxx, auto-select that job
      const targetId = new URLSearchParams(window.location.search).get('id');
      if (targetId && !selectedJob) {
        const found = res.jobs.find((j) => j.id === targetId);
        if (found) setSelectedJob(found);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadJobs();
  }, [activeTab, selectedSubcategory, remoteOnly, freshersOnly, sortBy]);

  // Handle Search Submission
  // Search by one of the student's own target roles in one click.
  const profileDefaults = useProfileDefaults();
  const [rolePickNonce, setRolePickNonce] = useState(0);
  useEffect(() => {
    if (rolePickNonce) loadJobs();
  }, [rolePickNonce]);
  const pickRole = (role: string) => {
    setSearchQuery(role);
    setRolePickNonce((n) => n + 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  // Toggle Save Job
  const handleToggleSave = async (job: JobListing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlySaved = savedJobs.some((s) => s.job_id === job.id);
    try {
      if (isCurrentlySaved) {
        await jobsApi.unsaveJob(job.id);
        setSavedJobs((prev) => prev.filter((s) => s.job_id !== job.id));
        showToast('Opportunity removed from saved bookmarks');
      } else {
        const saved = await jobsApi.saveJob(job.id);
        setSavedJobs((prev) => [...prev, saved]);
        showToast('Opportunity bookmarked successfully');
      }
    } catch {
      showToast('Action failed. Please try again.');
    }
  };

  // Track Application directly
  const handleTrackApplication = async (job: JobListing, status?: string, notes?: string) => {
    try {
      await jobsApi.trackApplication(job.id, { status, notes });
      showToast(`Added "${job.title}" to your Applications Tracker. Nothing was sent to the employer.`);
      // Update local saved state
      const saved = await jobsApi.saveJob(job.id, notes, true, status || 'SAVED');
      setSavedJobs((prev) => {
        const filtered = prev.filter((s) => s.job_id !== job.id);
        return [...filtered, saved];
      });
    } catch (err: any) {
      showToast(`Could not add to the Applications Tracker: ${err?.response?.data?.message || err?.message || 'unknown error'}`);
    }
  };

  // Available subcategories based on current active tab
  const currentSubcategories = useMemo(() => {
    if (!categoriesData) return [];
    if (activeTab === 'GOVERNMENT') return categoriesData.government?.subcategories || [];
    if (activeTab === 'PRIVATE') return categoriesData.private?.subcategories || [];
    return [
      ...(categoriesData.government?.subcategories || []).slice(0, 8),
      ...(categoriesData.private?.subcategories || []).slice(0, 10),
    ];
  }, [categoriesData, activeTab]);

  // Display jobs (filter if on SAVED tab)
  const displayedJobs = useMemo(() => {
    if (activeTab === 'SAVED') {
      const savedJobIds = new Set(savedJobs.map((s) => s.job_id));
      return jobs.filter((j) => savedJobIds.has(j.id));
    }
    return jobs;
  }, [jobs, activeTab, savedJobs]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
          {toastMessage}
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hero-brand text-white p-6 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Jobs from connected public feeds</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Government & Private Jobs Discovery
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Listings appear only after a real sync from a source with a working feed (currently the Remotive public API).
              Government portals are listed in the Source Monitor as links; they have no feed here. Nothing is applied for on your behalf.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 md:flex-col md:items-end">
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all shadow-xs"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              Job Alerts
            </button>

            <button
              onClick={() => setIsAnalyzerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all shadow-xs"
            >
              <FileSearch className="w-4 h-4 text-cyan-300" />
              Analyze External JD
            </button>

            <button
              onClick={() => setIsSourcesOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all shadow-xs"
            >
              <Radio className="w-4 h-4 text-emerald-300" />
              Source Monitor
            </button>

            <button
              onClick={() => navigate('/career/applications')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
            >
              <Briefcase className="w-4 h-4" />
              Applications Tracker
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Active Opportunities
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total_jobs}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              From synced sources
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Government & PSUs
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.government_jobs}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              From synced sources
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Private Tech Roles
            </span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.private_jobs}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              20+ Tech Tracks
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Closing Soon
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.closing_soon_count}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Within 7 Days
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-purple-500" /> Saved Bookmarks
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {savedJobs.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Shortlisted for Review
            </span>
          </div>
        </div>
      )}

      {/* Primary Category Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => {
            setActiveTab('ALL');
            setSelectedSubcategory('ALL');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          All Opportunities
        </button>

        <button
          onClick={() => {
            setActiveTab('GOVERNMENT');
            setSelectedSubcategory('ALL');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'GOVERNMENT'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Government & PSUs (15+ Cadres)
        </button>

        <button
          onClick={() => {
            setActiveTab('PRIVATE');
            setSelectedSubcategory('ALL');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PRIVATE'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Private Tech & Startups (20+ Tracks)
        </button>

        <button
          onClick={() => {
            setActiveTab('SAVED');
            setSelectedSubcategory('ALL');
          }}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'SAVED'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Bookmarks ({savedJobs.length})
        </button>
      </div>

      {/* Subcategory Carousel Chips */}
      {currentSubcategories.length > 0 && activeTab !== 'SAVED' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubcategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubcategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Subcategories
          </button>

          {currentSubcategories.map((sub) => (
            <button
              key={sub.key}
              onClick={() => setSelectedSubcategory(sub.key)}
              title={sub.description}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubcategory === sub.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Search & Filters Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 shadow-sm flex flex-col md:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, organization, skills, or notification number (e.g. UPSC, ISRO, SDE, React)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="relative w-full md:w-56">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="City or state..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Remote
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={freshersOnly}
              onChange={(e) => setFreshersOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Freshers (0-1 Yrs)
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="deadline">Deadline Soonest</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            Filter
          </button>
        </div>
      </form>
      <ProfileQuickPicks label="Your target roles" values={profileDefaults.targetRoles} selected={searchQuery} onPick={pickRole} className="-mt-2 px-1" />

      {/* Job Listings Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Showing {displayedJobs.length} {activeTab === 'SAVED' ? 'Bookmarked' : 'Available'} Opportunities
          </span>

          {(searchQuery || locationQuery || remoteOnly || freshersOnly || selectedSubcategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
                setRemoteOnly(false);
                setFreshersOnly(false);
                setSelectedSubcategory('ALL');
                loadJobs();
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {stats && stats.total_jobs === 0 ? 'No listings yet' : 'No matching job opportunities found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {stats && stats.total_jobs === 0
                ? 'Listings appear only after a sync from a source with a working feed. Open the Source Monitor and choose Sync Now; if the source cannot be reached, it says so there.'
                : 'Try broadening your search keywords, resetting subcategory filters, or switching between Government and Private tabs.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
                setRemoteOnly(false);
                setFreshersOnly(false);
                setSelectedSubcategory('ALL');
                setActiveTab('ALL');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-xs"
            >
              View All Opportunities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedJobs.some((s) => s.job_id === job.id)}
                onSelect={(selected) => setSelectedJob(selected)}
                onToggleSave={handleToggleSave}
                onTrackApplication={(selected, e) => {
                  e.stopPropagation();
                  handleTrackApplication(selected);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobs.some((s) => s.job_id === selectedJob.id) : false}
        onToggleSave={handleToggleSave}
        onTrackApplication={handleTrackApplication}
      />

      <JobAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
      />

      <ExternalJdAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
      />

      <JobSourcesHealthModal
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        onSyncCompleted={() => {
          loadJobs();
          loadInitialData();
        }}
      />
    </div>
  );
};

export default JobsDiscoveryPage;
