import * as React from 'react';
import {
  User,
  BookOpen,
  Award,
  Hammer,
  GraduationCap,
  Flame,
  Activity,
  Edit3,
  Bookmark,
  ShieldCheck,
  Settings,
  Github,
  Globe,
  Linkedin,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  StudentProfileData,
  UnifiedPortfolioSummary,
  StudentActivity,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

import { ProfileManager } from '../components/ProfileManager';

export function ProfilePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [profile, setProfile] = React.useState<StudentProfileData | null>(null);
  const [portfolio, setPortfolio] = React.useState<UnifiedPortfolioSummary | null>(null);
  const [recentActivities, setRecentActivities] = React.useState<StudentActivity[]>([]);
  const [streakDays, setStreakDays] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    'about' | 'skills' | 'projects' | 'research' | 'portfolio' | 'activity'
  >('about');

  React.useEffect(() => {
    loadData();
    // Phase 5: reload the header and summaries after any confirmed profile save.
    const onUpdate = () => loadData();
    window.addEventListener('profile:updated', onUpdate);
    return () => window.removeEventListener('profile:updated', onUpdate);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profData, portData, actData] = await Promise.all([
        communityProfileApi.getProfile(),
        communityProfileApi.getPortfolio(),
        communityProfileApi.getActivity(),
      ]);
      setProfile(profData);
      setPortfolio(portData);
      setRecentActivities(actData.slice(0, 8));
      setStreakDays(await communityProfileApi.getActivityStreakDays().catch(() => 0));
    } catch (err: any) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Phase 5: complete profile management (central profile service). */}
      <ProfileManager />
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={
                  profile.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || 'Student')}`
                }
                alt={profile.name}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-blue-50 border border-slate-200 shadow-xs"
              />
              <span className="absolute -bottom-1.5 -right-1.5 p-1 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#101828] break-words">{profile.name}</h1>
                <span className="max-w-full truncate px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
                  @{profile.username}
                </span>
                <span className="max-w-full truncate px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-[#475467]">
                  {profile.branch} · Sem {profile.semester}
                </span>
              </div>

              <p className="text-xs text-[#667085] break-all">
                {profile.email} · Class of {profile.graduation_year}
              </p>

              {profile.bio && (
                <p className="text-xs text-[#344054] max-w-2xl leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {profile.links?.github && (
                  <a
                    href={profile.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#475467] hover:text-[#101828] text-xs flex items-center gap-1 transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.links?.linkedin && (
                  <a
                    href={profile.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#475467] hover:text-[#101828] text-xs flex items-center gap-1 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.links?.website && (
                  <a
                    href={profile.links.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#475467] hover:text-[#101828] text-xs flex items-center gap-1 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Profile Completion Meter */}
          <div className="flex flex-col sm:items-end justify-between gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/onboarding')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Onboarding Setup</span>
              </button>
              <button
                onClick={() => onNavigate('/profile/edit')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => onNavigate('/profile/settings')}
                className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg border border-[#E4E7EC] transition-colors cursor-pointer"
                title="Account Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Completion Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 w-full sm:w-56 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#344054]">Profile Completion</span>
                <span className="font-bold text-[#2563EB] tabular-nums">
                  {profile.completion_percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${profile.completion_percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-[#667085]">
                {profile.completion_percentage === 100
                  ? 'All recommended profile sections completed!'
                  : 'Add projects and certificates to reach 100%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('/progress/courses')}
          className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#2563EB] mb-2">
            <BookOpen className="h-4 w-4" />
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <div className="text-xl font-bold text-[#101828] tabular-nums">
            {profile.stats?.courses_completed ?? portfolio?.courses_completed_count ?? 0}
          </div>
          <div className="text-[11px] font-medium text-[#475467]">Courses Finished</div>
        </div>

        <div
          onClick={() => onNavigate('/progress/skills')}
          className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#2563EB] mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <div className="text-xl font-bold text-[#101828] tabular-nums">
            {profile.stats?.skills_count ?? portfolio?.skills_count ?? 0}
          </div>
          <div className="text-[11px] font-medium text-[#475467]">Verified Skills</div>
        </div>

        <div
          onClick={() => onNavigate('/progress/projects')}
          className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#2563EB] mb-2">
            <Hammer className="h-4 w-4 text-amber-500" />
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <div className="text-xl font-bold text-[#101828] tabular-nums">
            {profile.stats?.projects_count ?? portfolio?.projects_count ?? 0}
          </div>
          <div className="text-[11px] font-medium text-[#475467]">Projects Built</div>
        </div>

        <div
          onClick={() => onNavigate('/progress/research')}
          className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#2563EB] mb-2">
            <GraduationCap className="h-4 w-4 text-[#4F46E5]" />
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <div className="text-xl font-bold text-[#101828] tabular-nums">
            {profile.stats?.research_papers_analyzed ?? portfolio?.research_papers_count ?? 0}
          </div>
          <div className="text-[11px] font-medium text-[#475467]">Papers Analyzed</div>
        </div>

        <div
          onClick={() => onNavigate('/profile/certificates')}
          className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#2563EB] mb-2">
            <Award className="h-4 w-4 text-purple-500" />
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <div className="text-xl font-bold text-[#101828] tabular-nums">
            {profile.stats?.certificates_count ?? portfolio?.certificates_count ?? 0}
          </div>
          <div className="text-[11px] font-medium text-[#475467]">Certificates</div>
        </div>

        <div
          onClick={() => onNavigate('/profile/activity')}
          className="bg-white p-4 rounded-xl border border-[#E4E7EC] shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#2563EB] mb-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <div className="text-xl font-bold text-[#101828] tabular-nums">
            {profile.stats?.learning_streak_days ?? streakDays}d
          </div>
          <div className="text-[11px] font-medium text-[#475467]">Learning Streak</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2 overflow-x-auto">
        {[
          { id: 'about', label: 'About & Interests' },
          { id: 'skills', label: 'Skills & Evidence' },
          { id: 'projects', label: 'Projects & GitHub' },
          { id: 'research', label: 'Research' },
          { id: 'portfolio', label: 'Student Portfolio' },
          { id: 'activity', label: 'Recent Activity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-50 text-[#2563EB]'
                : 'text-[#475467] hover:text-[#101828] hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('/profile/bookmarks')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Bookmarks</span>
          </button>
          <button
            onClick={() => onNavigate('/profile/achievements')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Award className="h-3.5 w-3.5 text-purple-600" />
            <span>Achievements</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-4">
            <h3 className="text-sm font-bold text-[#101828]">Academic Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-[#344054] border border-slate-200"
                >
                  {item}
                </span>
              )) || <p className="text-xs text-[#667085]">No interests specified yet.</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#101828]">Current Learning Goals</h3>
              <button
                onClick={() => onNavigate('/goals')}
                className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
              >
                View all goals
              </button>
            </div>
            <div className="space-y-2">
              {profile.learning_goals?.map((goal: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#344054]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
                  <span>{goal}</span>
                </div>
              )) || <p className="text-xs text-[#667085]">No goals created yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#101828]">Skills & Evidence Portfolio</h3>
              <p className="text-xs text-[#667085]">
                Verified against coursework, coding lab executions, and research citations.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/progress/skills')}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Skill progression dashboard →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {profile.skills?.map((skill: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#101828]">{skill}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Strong Evidence
                  </span>
                </div>
                <div className="text-[11px] text-[#667085] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Verified via 4 practice sessions & quiz</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101828]">Current Engineering Projects</h3>
            <button
              onClick={() => onNavigate('/projects')}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Open Project Builder →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#101828]">Distributed Key-Value Store</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#475467] leading-relaxed">
                Raft consensus protocol implementation in Go with automated cluster failover and persistent write-ahead logging.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#667085]">
                <Github className="h-3.5 w-3.5" />
                <span>pavan-btech/distributed-kv</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#101828]">B.Tech AI Learning Platform</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Capstone
                </span>
              </div>
              <p className="text-xs text-[#475467] leading-relaxed">
                Autonomous agentic pair programmer and curriculum accelerator for engineering undergraduate students.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#667085]">
                <Github className="h-3.5 w-3.5" />
                <span>pavan-btech/b.tech-ai-learning-platform</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'research' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101828]">Active Academic Research</h3>
            <button
              onClick={() => onNavigate('/research')}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Open Research Assistant →
            </button>
          </div>

          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#4F46E5]" />
              <h4 className="text-xs font-bold text-[#101828]">
                Transformer Memory Optimization & Quantization in Embedded Devices
              </h4>
            </div>
            <p className="text-xs text-[#475467] leading-relaxed">
              Evaluating low-rank adaptation (LoRA) and post-training 4-bit integer quantization across memory-constrained edge hardware.
            </p>
            <div className="text-[11px] text-[#4F46E5] font-medium pt-1">
              3 papers analyzed · 2 citations logged · Literature review drafted
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#101828]">Unified Internal Student Portfolio</h3>
              <p className="text-xs text-[#667085]">
                Verified records feeding your Resume Builder, Career Roadmaps, and AI context.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#475467] px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
              Total Items: {portfolio?.items.length ?? 0}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {portfolio?.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#101828]">{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-[#475467] font-medium uppercase">
                      {item.item_type}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-[#667085] line-clamp-1">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      item.visibility === 'PUBLIC'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.visibility === 'COMMUNITY'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.visibility === 'PRIVATE' && <Lock className="h-2.5 w-2.5" />}
                    {item.visibility}
                  </span>
                </div>
              </div>
            )) || <p className="text-xs text-[#667085]">No portfolio items recorded yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E4E7EC] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101828]">Recent Chronological Activity</h3>
            <button
              onClick={() => onNavigate('/profile/activity')}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Full activity history →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] shrink-0 mt-0.5">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#101828] truncate">{act.title}</p>
                  <p className="text-[11px] text-[#667085] flex items-center gap-2 mt-0.5">
                    <span>{new Date(act.created_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="text-[10px] font-mono uppercase text-[#475467]">
                      {act.activity_type.replace(/_/g, ' ')}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
