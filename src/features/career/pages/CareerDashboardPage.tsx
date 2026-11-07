// src/features/career/pages/CareerDashboardPage.tsx
// Comprehensive Centralized Career Dashboard integrating all 8 Career Modules:
// 1. Career Dashboard, 2. Resume Builder, 3. Applications Tracker, 4. Placement Preparation,
// 5. Connected Platforms, 6. Sync Center, 7. External Profiles, 8. Jobs Discovery

import React, { useEffect, useState } from 'react';
import {
  careerApi,
  CareerRole,
  CareerRoadmap,
  CareerRecommendationResult,
  CareerDashboardSummary,
  CareerProfileData,
} from '../api/careerApi';
import { skillsApi, StudentSkill } from '../../skills/api/skillsApi';
import {
  Compass,
  Target,
  Layers,
  Award,
  BookOpen,
  FolderGit2,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileUser,
  Clock,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Edit3,
  X,
  MapPin,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const CareerDashboardPage: React.FC<CareerDashboardPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<CareerDashboardSummary | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendationResult | null>(null);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [allRoles, setAllRoles] = useState<CareerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingRoleId, setGeneratingRoleId] = useState<string | null>(null);

  // Edit Career Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<Partial<CareerProfileData>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashSummary, recs, rdmList, skills, roles] = await Promise.all([
        careerApi.getDashboardSummary().catch(() => null),
        careerApi.getRecommendations().catch(() => null),
        careerApi.listRoadmaps().catch(() => []),
        skillsApi.getProfile().catch(() => []),
        careerApi.listRoles().catch(() => []),
      ]);
      setSummary(dashSummary);
      setRecommendations(recs);
      setRoadmaps(rdmList);
      setStudentSkills(skills);
      setAllRoles(roles);

      if (dashSummary?.career_profile) {
        setEditProfileForm(dashSummary.career_profile);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load career dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await careerApi.updateProfile(editProfileForm);
      toast.success('Career preferences updated successfully!');
      setIsEditProfileOpen(false);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error('Failed to update career preferences: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">
          Synchronizing career readiness, resumes, applications, and placement preparation...
        </p>
      </div>
    );
  }

  const activeRoadmap = roadmaps[0];
  const readiness = summary?.readiness;
  const careerProfile = summary?.career_profile;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Banner with 8 Quick-Navigation Anchors */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-sm border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
              <Compass className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Career Command Center
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  8-Module Integrated System
                </span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized career hub synthesizing your student profile, verified resumes, active internship pipeline, AI placement practice, connected accounts, and live job opportunities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition backdrop-blur-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Career Profile
            </button>
            <button
              onClick={() => onNavigate('/resume')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <FileUser className="h-3.5 w-3.5" />
              Resume Builder
            </button>
          </div>
        </div>

        {/* Quick Module Navigation Pills */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-300">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">
            Career Modules:
          </span>
          <button
            onClick={() => onNavigate('/resume')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <FileUser className="h-3 w-3 text-sky-400" /> Resume Builder
          </button>
          <button
            onClick={() => onNavigate('/applications')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <Briefcase className="h-3 w-3 text-emerald-400" /> Applications Tracker
          </button>
          <button
            onClick={() => onNavigate('/placements')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <Target className="h-3 w-3 text-purple-400" /> Placement Prep
          </button>
          <button
            onClick={() => onNavigate('/career/jobs')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <Building className="h-3 w-3 text-amber-400" /> Jobs Discovery
          </button>
          <button
            onClick={() => onNavigate('/connected-platforms')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <ExternalLink className="h-3 w-3 text-blue-400" /> Connected Platforms
          </button>
          <button
            onClick={() => onNavigate('/sync')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <RefreshCw className="h-3 w-3 text-teal-400" /> Sync Center
          </button>
          <button
            onClick={() => onNavigate('/profile/external')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 shrink-0 flex items-center gap-1 transition"
          >
            <ShieldCheck className="h-3 w-3 text-indigo-400" /> External Profiles
          </button>
        </div>
      </div>

      {/* 2. Personalized Career Profile Summary Card */}
      {careerProfile && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Personalized Career Profile & Target Aspirations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target job roles, preferred industries, preferred locations, and work arrangement preferences.
              </p>
            </div>
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 self-start sm:self-auto"
            >
              <Edit3 className="h-3 w-3" /> Edit Preferences
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Roles
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {careerProfile.target_roles.map((r, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-200 dark:border-purple-800/40"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Work Arrangement & Batch
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {careerProfile.preferred_work_arrangement} • Batch of {careerProfile.graduation_year || 2026}
              </p>
              <span className="text-[11px] text-slate-500">
                Locations: {careerProfile.preferred_locations.slice(0, 3).join(', ')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Preferred Industries
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {careerProfile.preferred_industries.slice(0, 3).map((ind, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Career Goals
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                {careerProfile.career_goals[0] || 'Achieve software engineering readiness'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Four Career Readiness Indicators (Evidence-Based Calculation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Career Readiness Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Computed strictly from active records: completed resume sections, verified skills, recorded interviews, and active applications.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Zero Fabricated Scores
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Resume Completeness */}
          <div
            onClick={() => onNavigate('/resume')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 shadow-xs cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Resume Completeness</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                  {readiness?.resume_completeness || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readiness?.resume_completeness || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {readiness?.resume_sections_status.filter((s) => s.complete).length || 0} of {readiness?.resume_sections_status.length || 7} sections complete.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>Open Resume Builder</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 2: Target Skill Alignment */}
          <div
            onClick={() => onNavigate('/career/skill-gap')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-xs cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Skill Alignment</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                  {readiness?.skills_aligned_percentage == null ? 'No target role' : `${readiness.skills_aligned_percentage}%`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${readiness?.skills_aligned_percentage || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {readiness?.target_role_name
                  ? `${readiness.matching_skills.length} of your skills match ${readiness.target_role_name}.`
                  : 'Add a target role to your career profile to compare your skills.'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>View Skill Gap Analysis</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 3: Placement Preparation Progress */}
          <div
            onClick={() => onNavigate('/placements')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 shadow-xs cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Placement Prep</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {readiness?.placement_prep_progress.mock_interviews_count || 0} Mocks
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (readiness?.placement_prep_progress.mock_interviews_count || 0) * 33)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {readiness?.placement_prep_progress.latest_mock_score !== undefined
                  ? `Latest mock score: ${readiness.placement_prep_progress.latest_mock_score}%`
                  : 'Ready for initial diagnostic mock interview.'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Open Placement Coach</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 4: Applications in Progress */}
          <div
            onClick={() => onNavigate('/applications')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-xs cursor-pointer transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Tracked Applications</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                  {readiness?.applications_in_progress || 0} Active
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (readiness?.applications_in_progress || 0) * 20)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {readiness?.upcoming_deadlines[0]
                  ? `Next deadline: ${readiness.upcoming_deadlines[0].company} (${readiness.upcoming_deadlines[0].date})`
                  : 'No pending application deadlines.'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Manage Applications</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Transparent Calculation Explanation Alert */}
        {readiness && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <HelpCircle className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-semibold">Evidence-Based Readiness Method: </strong>
              {readiness.readiness_explanation}
            </p>
          </div>
        )}
      </div>

      {/* 4. Recommended Next Actions */}
      {summary?.recommended_actions && summary.recommended_actions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Recommended Next Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.recommended_actions.map((act) => (
              <div
                key={act.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50'
                          : act.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50'
                      }`}
                    >
                      {act.priority} PRIORITY
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{act.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{act.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>
                </div>

                <button
                  onClick={() => onNavigate(act.target_path)}
                  className="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {act.action_label} <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Chronological Career Activity Stream & Active Learning Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Activity Stream */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Recent Career Activity
            </h3>
            <span className="text-xs text-slate-400 font-medium">Auto-recorded updates</span>
          </div>

          {summary?.recent_activity && summary.recent_activity.length > 0 ? (
            <div className="space-y-2.5">
              {summary.recent_activity.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.url && onNavigate(item.url)}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-white block">{item.title}</span>
                    <span className="text-[11px] text-slate-500">{item.subtitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs space-y-2">
              <p>No career activities recorded yet.</p>
              <button
                onClick={() => onNavigate('/career/jobs')}
                className="text-purple-600 hover:underline font-semibold"
              >
                Track your first application →
              </button>
            </div>
          )}
        </div>

        {/* Active Learning Roadmap */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-600" />
                Active Learning Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                {activeRoadmap ? activeRoadmap.title : 'No active roadmap generated yet'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/career/roadmap')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Full Roadmap
            </button>
          </div>

          {activeRoadmap ? (
            <div className="space-y-2.5">
              {activeRoadmap.steps.slice(0, 4).map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step.status === 'COMPLETED' ? '✓' : idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {step.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {step.estimated_effort} • Type: {step.source_type}
                      </span>
                    </div>
                  </div>
                  {step.url && (
                    <button
                      onClick={() => onNavigate(step.url!)}
                      className="text-blue-600 hover:underline text-[11px] font-medium"
                    >
                      Go →
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 space-y-3">
              <p className="text-xs">Select your engineering role to generate a personalized step-by-step roadmap.</p>
              <button
                onClick={() => onNavigate('/career/explore')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-xs"
              >
                Explore Roles & Build Roadmap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Suggested Roles Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Curated Engineering Roles & Skill Alignments
          </h2>
          <button
            onClick={() => onNavigate('/career/explore')}
            className="text-xs text-purple-600 hover:underline font-semibold flex items-center gap-1"
          >
            Compare All {allRoles.length} Roles <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations?.potentially_relevant_roles.map((match) => (
            <div
              key={match.role_id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {match.role_name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    {match.match_percentage}% Skill Overlap
                  </span>
                </div>

                <div className="space-y-1">
                  {match.match_reasons.map((r, i) => (
                    <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">•</span>
                      {r}
                    </p>
                  ))}
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-emerald-600 block mb-1">
                    Verified Match Evidence:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.top_matching_skills.slice(0, 4).map((sk, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {match.skills_to_develop.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Skills to Bridge:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {match.skills_to_develop.slice(0, 3).map((sk, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`/career/role/${match.role_id}`)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 flex items-center gap-1"
                >
                  Explore Role <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  disabled={generatingRoleId === match.role_id}
                  onClick={async () => {
                    try {
                      setGeneratingRoleId(match.role_id);
                      await careerApi.generateRoadmap(match.role_id);
                      toast.success(`Generated roadmap for ${match.role_name}`);
                      onNavigate('/career/roadmap');
                    } catch {
                      toast.error('Failed to generate roadmap');
                    } finally {
                      setGeneratingRoleId(null);
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50"
                >
                  {generatingRoleId === match.role_id ? 'Generating...' : 'Start Roadmap'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT CAREER PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600" />
                Edit Career Aspirations & Preferences
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Roles (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editProfileForm.target_roles?.join(', ') || ''}
                  onChange={(e) =>
                    setEditProfileForm({
                      ...editProfileForm,
                      target_roles: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Software Engineer, Machine Learning Engineer, Cloud Architect"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Work Arrangement
                  </label>
                  <select
                    value={editProfileForm.preferred_work_arrangement || 'FLEXIBLE'}
                    onChange={(e) =>
                      setEditProfileForm({
                        ...editProfileForm,
                        preferred_work_arrangement: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="FLEXIBLE">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={editProfileForm.graduation_year || 2026}
                    onChange={(e) =>
                      setEditProfileForm({
                        ...editProfileForm,
                        graduation_year: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Job Locations (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editProfileForm.preferred_locations?.join(', ') || ''}
                  onChange={(e) =>
                    setEditProfileForm({
                      ...editProfileForm,
                      preferred_locations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Bengaluru, Hyderabad, Pune, Remote"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Career Goal
                </label>
                <textarea
                  rows={2}
                  value={editProfileForm.career_goals?.[0] || ''}
                  onChange={(e) =>
                    setEditProfileForm({
                      ...editProfileForm,
                      career_goals: [e.target.value, ...(editProfileForm.career_goals?.slice(1) || [])],
                    })
                  }
                  placeholder="Describe your primary career milestone (e.g. Secure a product-based SDE internship)"
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
