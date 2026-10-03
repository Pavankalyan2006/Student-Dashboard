import * as React from 'react';
import {
  ArrowLeft,
  Shield,
  Bell,
  Sparkles,
  Github,
  Save,
  Lock,
  Globe,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  StudentPrivacySetting,
  NotificationPreference,
  StudentPreference,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function ProfileSettingsPage({
  initialTab = 'privacy',
  onNavigate,
}: {
  initialTab?: 'privacy' | 'notifications' | 'ai' | 'accounts';
  onNavigate: (path: string) => void;
}) {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Privacy state
  const [privacy, setPrivacy] = React.useState<StudentPrivacySetting | null>(null);
  // Notification state
  const [notifs, setNotifs] = React.useState<NotificationPreference | null>(null);
  // Student AI Preference state
  const [prefs, setPrefs] = React.useState<StudentPreference | null>(null);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [privData, notifData, prefData] = await Promise.all([
        communityProfileApi.getPrivacy(),
        communityProfileApi.getNotificationPreferences(),
        communityProfileApi.getPreferences(),
      ]);
      setPrivacy(privData);
      setNotifs(notifData);
      setPrefs(prefData);
    } catch {
      toast.error('Failed to load student settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacy = async () => {
    if (!privacy) return;
    try {
      setSaving(true);
      const updated = await communityProfileApi.updatePrivacy(privacy);
      setPrivacy(updated);
      toast.success('Privacy preferences saved successfully!');
    } catch {
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    if (!notifs) return;
    try {
      setSaving(true);
      const updated = await communityProfileApi.updateNotificationPreferences(notifs);
      setNotifs(updated);
      toast.success('Notification preferences updated!');
    } catch {
      toast.error('Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  const saveAIPreferences = async () => {
    if (!prefs) return;
    try {
      setSaving(true);
      const updated = await communityProfileApi.updatePreferences(prefs);
      setPrefs(updated);
      toast.success('AI interaction preferences saved!');
    } catch {
      toast.error('Failed to update AI preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 rounded" />
        <div className="h-80 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E4E7EC] pb-4">
        <button
          onClick={() => onNavigate('/profile')}
          className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#101828]">Student Account & Privacy Controls</h1>
          <p className="text-xs text-[#667085]">
            Configure who can view your portfolio items, manage notification digests, and tune AI explanations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-blue-50 text-[#2563EB]'
              : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Privacy & Visibility</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-blue-50 text-[#2563EB]'
              : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-blue-50 text-[#2563EB]'
              : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span>AI Tutor Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-blue-50 text-[#2563EB]'
              : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <Github className="h-3.5 w-3.5" />
          <span>Connected Accounts</span>
        </button>
      </div>

      {/* Tab 1: Privacy Controls */}
      {activeTab === 'privacy' && privacy && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#101828]">Profile & Portfolio Visibility</h2>
            <p className="text-xs text-[#667085]">
              Decide which areas of your learning record are visible to other students. Internal IDs and tokens are never exposed.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Profile Visibility</label>
                <p className="text-[11px] text-[#667085]">Controls who can view your basic profile card</p>
              </div>
              <select
                value={privacy.profile_visibility}
                onChange={(e) =>
                  setPrivacy({ ...privacy, profile_visibility: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-[#D0D5DD] bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="COMMUNITY">Community Only (Verified B.Tech Students)</option>
                <option value="PRIVATE">Strictly Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Project Showcase Visibility</label>
                <p className="text-[11px] text-[#667085]">Projects marked as showcase in community</p>
              </div>
              <select
                value={privacy.project_visibility}
                onChange={(e) =>
                  setPrivacy({ ...privacy, project_visibility: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-[#D0D5DD] bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="COMMUNITY">Community Only</option>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">GitHub Repository Scope</label>
                <p className="text-[11px] text-[#667085]">Only public repositories are exposed to collaborators</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Public Repos Only
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Research Papers & Notes</label>
                <p className="text-[11px] text-[#667085]">Drafts and extracted notes remain confidential</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">
                Private by Default
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Resume Builder Drafts</label>
                <p className="text-[11px] text-[#667085]">Tailored ATS resumes are strictly private</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-1 rounded">
                Private by Default
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={savePrivacy}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Privacy Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Notification Preferences */}
      {activeTab === 'notifications' && notifs && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#101828]">Notification Channels & Categories</h2>
            <p className="text-xs text-[#667085]">
              Tune what events trigger in-app banners or email digests without overwhelming your workflow.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#101828]">In-App Banners & Dropdown</span>
                <p className="text-[11px] text-[#667085]">Display notification bell count in topbar</p>
              </div>
              <input
                type="checkbox"
                checked={notifs.in_app_enabled}
                onChange={(e) => setNotifs({ ...notifs, in_app_enabled: e.target.checked })}
                className="h-4 w-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#101828]">Learning & Course Milestones</span>
                <p className="text-[11px] text-[#667085]">Alerts when completing lessons or earning certificates</p>
              </div>
              <input
                type="checkbox"
                checked={notifs.learning_updates}
                onChange={(e) => setNotifs({ ...notifs, learning_updates: e.target.checked })}
                className="h-4 w-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#101828]">Community Answers & Mentions</span>
                <p className="text-[11px] text-[#667085]">Notify when peers answer your question or mention your project</p>
              </div>
              <input
                type="checkbox"
                checked={notifs.community_updates}
                onChange={(e) => setNotifs({ ...notifs, community_updates: e.target.checked })}
                className="h-4 w-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/60 transition-colors cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#101828]">Project & Code Analysis Updates</span>
                <p className="text-[11px] text-[#667085]">Notify when background GitHub code reviews finish</p>
              </div>
              <input
                type="checkbox"
                checked={notifs.project_updates}
                onChange={(e) => setNotifs({ ...notifs, project_updates: e.target.checked })}
                className="h-4 w-4 text-[#2563EB] rounded focus:ring-[#2563EB]"
              />
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={saveNotifications}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Notification Preferences'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: AI Preferences */}
      {activeTab === 'ai' && prefs && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#101828]">AI Assistant Interaction Tuning</h2>
            <p className="text-xs text-[#667085]">
              These preferences configure your primary AI Learning Agent across courses, DSA Lab, and research.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Explanation Depth</label>
                <p className="text-[11px] text-[#667085]">Calibration level for technical concept breakdowns</p>
              </div>
              <select
                value={prefs.explanation_level}
                onChange={(e) => setPrefs({ ...prefs, explanation_level: e.target.value as any })}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#D0D5DD] bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="BEGINNER">Beginner (Intuitive analogies & step-by-step)</option>
                <option value="INTERMEDIATE">Intermediate (Standard undergraduate rigor)</option>
                <option value="ADVANCED">Advanced (Formal proofs, invariants & complexity)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Response Style</label>
                <p className="text-[11px] text-[#667085]">Verbosity of AI tutoring and code feedback</p>
              </div>
              <select
                value={prefs.response_style}
                onChange={(e) => setPrefs({ ...prefs, response_style: e.target.value as any })}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#D0D5DD] bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="CONCISE">Concise (Direct answers & minimal prose)</option>
                <option value="DETAILED">Detailed (Comprehensive explanations & edge cases)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-[#101828]">Preferred Language</label>
                <p className="text-[11px] text-[#667085]">Language for explanations and concept clarification</p>
              </div>
              <select
                value={prefs.preferred_language}
                onChange={(e) => setPrefs({ ...prefs, preferred_language: e.target.value as any })}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#D0D5DD] bg-white font-medium focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={saveAIPreferences}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save AI Preferences'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Connected Accounts */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#101828]">Connected Developer Accounts</h2>
            <p className="text-xs text-[#667085]">
              Manage third-party Git accounts and external integrations. Sensitive OAuth tokens are never exposed.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#101828]">GitHub Integration</h4>
                <p className="text-[11px] text-[#667085]">
                  Connected as <span className="font-semibold text-slate-800">pavan-btech</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                <span>Connected</span>
              </span>
              <button
                onClick={() => onNavigate('/github')}
                className="px-3 py-1.5 text-xs font-medium text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                Manage Repositories
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
