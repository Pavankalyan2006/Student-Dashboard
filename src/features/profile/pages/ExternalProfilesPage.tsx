// src/features/profile/pages/ExternalProfilesPage.tsx
// Master page for managing external developer, coding, academic, and portfolio profiles

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldAlert,
  Clock,
  LayoutGrid,
  List,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Link2,
  Github,
  Code,
  Briefcase,
  FileText,
  Share2,
} from 'lucide-react';
import {
  StudentExternalProfile,
  ExternalPlatformMeta,
  ExternalProfilesDashboardStats,
  ExternalPlatformCategory,
} from '../types/externalProfileTypes';
import { externalProfilesApi } from '../api/externalProfilesApi';
import { ExternalProfileCard } from '../components/ExternalProfileCard';
import { AddExternalProfileModal } from '../components/AddExternalProfileModal';
import { ProfileVerificationModal } from '../components/ProfileVerificationModal';
import { ProfilePrivacyModal } from '../components/ProfilePrivacyModal';
import { ProfileSyncHistoryModal } from '../components/ProfileSyncHistoryModal';

const CATEGORY_TABS: Array<{ id: ExternalPlatformCategory | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All Connected' },
  { id: 'DEVELOPER_CODE_HOSTING', label: 'Code Hosting' },
  { id: 'CODING_PRACTICE', label: 'Coding Practice' },
  { id: 'PROFESSIONAL_NETWORKING', label: 'Professional' },
  { id: 'PORTFOLIO_PROJECT', label: 'Portfolio' },
  { id: 'COMPETITIVE_PROGRAMMING', label: 'Contests' },
  { id: 'ACADEMIC_RESEARCH', label: 'Research' },
  { id: 'DESIGN_DATA_SPECIALIZED', label: 'Design & Data' },
];

interface ExternalProfilesPageProps {
  embedded?: boolean;
  onNavigate?: (path: string) => void;
}

export const ExternalProfilesPage: React.FC<ExternalProfilesPageProps> = ({
  embedded = false,
  onNavigate,
}) => {
  const [profiles, setProfiles] = useState<StudentExternalProfile[]>([]);
  const [platforms, setPlatforms] = useState<ExternalPlatformMeta[]>([]);
  const [stats, setStats] = useState<ExternalProfilesDashboardStats>({
    total_connected: 0,
    verified_profiles: 0,
    reconnection_required: 0,
    never_synced: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingProfileId, setSyncingProfileId] = useState<string | null>(null);

  // Filters & layout
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ExternalPlatformCategory | 'ALL'>('ALL');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfileForVerify, setSelectedProfileForVerify] = useState<StudentExternalProfile | null>(null);
  const [selectedProfileForPrivacy, setSelectedProfileForPrivacy] = useState<StudentExternalProfile | null>(null);
  const [selectedProfileForHistory, setSelectedProfileForHistory] = useState<StudentExternalProfile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profilesData, platformsData, statsData] = await Promise.all([
        externalProfilesApi.getProfiles(),
        externalProfilesApi.getSupportedPlatforms(),
        externalProfilesApi.getStats(),
      ]);
      setProfiles(profilesData);
      setPlatforms(platformsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load external profiles data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const result = await externalProfilesApi.syncAllProfiles();
      showToast(`Synced ${result.succeeded} profile(s) successfully.`);
      await loadData();
    } catch (err: any) {
      showToast(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSyncSingle = async (profileId: string) => {
    setSyncingProfileId(profileId);
    try {
      const { profile } = await externalProfilesApi.syncProfile(profileId);
      setProfiles((prev) => prev.map((p) => (p.id === profileId ? profile : p)));
      showToast(`${profile.platform_name} synchronized successfully.`);
      const updatedStats = await externalProfilesApi.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      showToast(`Sync error: ${err.message}`);
    } finally {
      setSyncingProfileId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;
    try {
      await externalProfilesApi.deleteProfile(profileToDelete.id);
      showToast(`Removed ${profileToDelete.name} profile.`);
      setProfiles((prev) => prev.filter((p) => p.id !== profileToDelete.id));
      setProfileToDelete(null);
      const updatedStats = await externalProfilesApi.getStats();
      setStats(updatedStats);
    } catch (err: any) {
      showToast(`Failed to remove: ${err.message}`);
    }
  };

  // Filtered list
  const filteredProfiles = profiles.filter((p) => {
    const matchesCat =
      activeCategory === 'ALL' ||
      p.categories.includes(activeCategory);
    const matchesSearch =
      !searchQuery ||
      p.platform_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.display_name && p.display_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className={embedded ? 'space-y-6' : 'min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8'}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Header (hidden if embedded) */}
      {!embedded && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Link2 className="w-3.5 h-3.5" />
                <span>Verified Identity & Evidence Hub</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                External Profiles & Platforms
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connect and verify your public developer handles, coding platforms, research identifiers, and portfolio links. Power your AI Resume, Career Roadmaps, and Job Discovery with authentic, verified proof.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleSyncAll}
                disabled={isSyncingAll || profiles.length === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isSyncingAll ? 'Syncing All...' : 'Sync All Profiles'}</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Platform</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* When embedded, render quick action toolbar */}
      {embedded && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-sm">External Platforms & Evidence</h3>
            <p className="text-xs text-slate-400">Verified handles sync public statistics to your student profile.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll || profiles.length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : 'Sync All'}</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Platform</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Connected Profiles</span>
            <span className="text-xl font-extrabold text-white">{stats.total_connected}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Verified Profiles</span>
            <span className="text-xl font-extrabold text-white">{stats.verified_profiles}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Attention Required</span>
            <span className="text-xl font-extrabold text-white">{stats.reconnection_required}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Last Sync</span>
            <span className="text-sm font-bold text-white truncate block">
              {stats.last_successful_sync
                ? new Date(stats.last_successful_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Never synced'}
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Module Integration Notice */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <Share2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Connected Platforms Power Your Entire Workspace:</strong> Verified profiles automatically enrich your{' '}
            <strong className="text-indigo-300">AI Resume</strong>, calculate skill match for{' '}
            <strong className="text-indigo-300">Jobs Discovery</strong>, and guide your{' '}
            <strong className="text-indigo-300">Career Roadmap</strong>.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 shrink-0">
          Privacy rules respected per profile
        </span>
      </div>

      {/* Main Content: Filter Toolbar & Profiles */}
      <div className="space-y-4">
        {/* Search and Layout Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your connected profiles..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1.5 self-end md:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layout === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                layout === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeCategory === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profiles Section */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span>Loading external profiles...</span>
          </div>
        ) : profiles.length === 0 ? (
          /* Honest Onboarding State for Students with 0 Profiles */
          <div className="p-8 md:p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Link2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No external profiles connected yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your GitHub, LeetCode, LinkedIn, Kaggle, or personal portfolio to build a verified developer showcase and unlock automated resume metrics.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Your First Profile</span>
              </button>
            </div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            No profiles match your filter or search query.
          </div>
        ) : (
          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-3'
            }
          >
            {filteredProfiles.map((profile) => (
              <ExternalProfileCard
                key={profile.id}
                profile={profile}
                isSyncing={syncingProfileId === profile.id || isSyncingAll}
                onSync={handleSyncSingle}
                onVerify={(p) => setSelectedProfileForVerify(p)}
                onOpenPrivacy={(p) => setSelectedProfileForPrivacy(p)}
                onOpenHistory={(p) => setSelectedProfileForHistory(p)}
                onDelete={(id, name) => setProfileToDelete({ id, name })}
                layout={layout}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Remove Profile</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <strong>{profileToDelete.name}</strong>? This profile will no longer be used for AI resume links, career milestones, or job matching.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProfileToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      <AddExternalProfileModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProfileAdded={loadData}
        platforms={platforms}
      />

      {/* Verification Modal */}
      <ProfileVerificationModal
        isOpen={!!selectedProfileForVerify}
        onClose={() => setSelectedProfileForVerify(null)}
        profile={selectedProfileForVerify}
        onVerified={loadData}
      />

      {/* Privacy Modal */}
      <ProfilePrivacyModal
        isOpen={!!selectedProfileForPrivacy}
        onClose={() => setSelectedProfileForPrivacy(null)}
        profile={selectedProfileForPrivacy}
        onUpdated={loadData}
      />

      {/* History Audit Modal */}
      <ProfileSyncHistoryModal
        isOpen={!!selectedProfileForHistory}
        onClose={() => setSelectedProfileForHistory(null)}
        profile={selectedProfileForHistory}
      />
    </div>
  );
};
