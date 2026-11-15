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
  Brain,
  Trash2,
  KeyRound,
  Download,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Check,
  RefreshCw,
  ExternalLink,
  User,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { externalIntegrationsApi } from '../../../api/externalIntegrationsApi';
import { externalProfilesApi } from '../api/externalProfilesApi';
import { onboardingApi } from '../../../api/onboardingApi';
import {
  StudentPrivacySetting,
  NotificationPreference,
  StudentPreference,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { getAnalyticsConsent, setAnalyticsConsent } from '../../../lib/analytics';
import { useStudentContext } from '../../../hooks/useStudentContext';

export function ProfileSettingsPage({
  initialTab = 'account',
  onNavigate,
}: {
  initialTab?: 'account' | 'privacy' | 'notifications' | 'learning' | 'appearance' | 'platforms';
  onNavigate: (path: string) => void;
}) {
  const { refreshStudentContext } = useStudentContext();
  const { provider, sendPasswordReset, student: authStudent } = useAuth();
  const [analyticsConsent, setAnalyticsConsentState] = React.useState(getAnalyticsConsent());
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Student profile state
  const [profile, setProfile] = React.useState<any | null>(null);
  // Privacy state
  const [privacy, setPrivacy] = React.useState<StudentPrivacySetting | null>(null);
  // Notification state
  const [notifs, setNotifs] = React.useState<NotificationPreference | null>(null);
  // Student AI Preference state
  const [prefs, setPrefs] = React.useState<StudentPreference | null>(null);
  // Student AI Memory state
  const [memories, setMemories] = React.useState<any[]>([]);

  // Password change state
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Data export state
  const [exporting, setExporting] = React.useState(false);

  // Appearance state
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('light');
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [profData, privData, notifData, prefData, memoryData] = await Promise.all([
        communityProfileApi.getProfile().catch(() => null),
        communityProfileApi.getPrivacy(),
        communityProfileApi.getNotificationPreferences(),
        communityProfileApi.getPreferences(),
        onboardingApi.getMemories().catch(() => []),
      ]);
      setProfile(profData);
      setPrivacy(privData);
      setNotifs(notifData);
      setPrefs(prefData);
      if (prefData?.theme) setTheme(prefData.theme as any);
      setMemories(memoryData || []);
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
      await refreshStudentContext().catch(() => {});
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
      const updated = await communityProfileApi.updatePreferences({
        ...prefs,
        theme,
      });
      setPrefs(updated);
      await refreshStudentContext().catch(() => {});
      toast.success('Learning preferences saved!');
    } catch {
      toast.error('Failed to update learning preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error('Current and new password are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await communityProfileApi.changePassword(oldPassword, newPassword);
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const data = await communityProfileApi.exportStudentData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-profile-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Personal student data downloaded');
    } catch {
      toast.error('Failed to export student data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => onNavigate('/profile')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Profile</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings & Preferences</h1>
          <p className="text-xs text-slate-500">
            Manage your authenticated account, AI tutor behaviors, appearance, notifications, and security.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'account', label: 'Account & Security', icon: User },
          { id: 'learning', label: 'Learning & AI', icon: Sparkles },
          { id: 'appearance', label: 'Appearance', icon: Sun },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy & Data', icon: Shield },
          { id: 'platforms', label: 'Connected Platforms', icon: Github },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Account & Security */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          {/* Identity card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Display Name</span>
                <p className="font-semibold text-slate-900 mt-0.5">{profile?.name || 'Aarav Test Student'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Email Address</span>
                <p className="font-semibold text-slate-900 mt-0.5">{profile?.email || 'student@example.com'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Degree & Branch</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {profile?.branch || 'Artificial Intelligence and Machine Learning'} (Sem {profile?.semester || 7})
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Institution</span>
                <p className="font-semibold text-slate-900 mt-0.5">{profile?.college_name || 'NIT'}</p>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          {provider === 'firebase' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Password</h2>
              </div>
              <p className="text-xs text-slate-500">Your password is managed by the sign-in service. We will email you a secure link to change it.</p>
              <button
                type="button"
                onClick={async () => {
                  if (!authStudent?.email) return;
                  try {
                    await sendPasswordReset(authStudent.email);
                    toast.success('Password reset email sent. Check your inbox.');
                  } catch (err: any) {
                    toast.error(err?.message || 'Could not send the reset email');
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Email me a password reset link
              </button>
            </div>
          ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
          )}
        </div>
      )}

      {/* Tab 2: Learning & AI Preferences */}
      {activeTab === 'learning' && prefs && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">AI Tutor & Explanation Preferences</h2>
            <p className="text-xs text-slate-500">
              These preferences configure the system prompt and tone across AI Tutor, Doubt Solver, and Coding Lab.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Explanation Level</label>
                <p className="text-[11px] text-slate-500">Conceptual depth of AI explanations</p>
              </div>
              <select
                value={prefs.explanation_level}
                onChange={(e) =>
                  setPrefs({ ...prefs, explanation_level: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="BEGINNER">Beginner (Foundational)</option>
                <option value="INTERMEDIATE">Intermediate (Standard B.Tech)</option>
                <option value="ADVANCED">Advanced (In-depth engineering)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Response Style</label>
                <p className="text-[11px] text-slate-500">Brevity vs comprehensive breakdown</p>
              </div>
              <select
                value={prefs.response_style}
                onChange={(e) =>
                  setPrefs({ ...prefs, response_style: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="CONCISE">Concise & Direct</option>
                <option value="DETAILED">Detailed with Examples</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Code Explanation Style</label>
                <p className="text-[11px] text-slate-500">How algorithmic solutions are broken down</p>
              </div>
              <select
                value={prefs.code_explanation_preference}
                onChange={(e) =>
                  setPrefs({ ...prefs, code_explanation_preference: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="STEP_BY_STEP">Step-by-step with comments</option>
                <option value="CONCEPTUAL">High-level architectural pattern</option>
                <option value="EXHAUSTIVE">Exhaustive with complexity analysis</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Preferred Language</label>
                <p className="text-[11px] text-slate-500">Primary language for AI tutoring dialogue</p>
              </div>
              <select
                value={prefs.preferred_language}
                onChange={(e) =>
                  setPrefs({ ...prefs, preferred_language: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={saveAIPreferences}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save AI Preferences'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Appearance */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Appearance & Display Settings</h2>
            <p className="text-xs text-slate-500">Configure theme and accessibility preferences.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Color Theme</label>
                <p className="text-[11px] text-slate-500">Choose light, dark, or system appearance</p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      theme === th.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <th.icon className="h-3.5 w-3.5" />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Reduced Motion</label>
                <p className="text-[11px] text-slate-500">Disable decorative animations and transitions</p>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={saveAIPreferences}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Appearance'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && notifs && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Notification Categories</h2>
            <p className="text-xs text-slate-500">
              Select which categories of academic reminders and platform updates you wish to receive.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'in_app',
                title: 'In-App Alerts',
                desc: 'Surface badge counts and reminder toasts within the platform',
              },
              {
                key: 'learning',
                title: 'Academic & Learning Reminders',
                desc: 'Upcoming study planner tasks, syllabus milestones, and revision due alerts',
              },
              {
                key: 'community',
                title: 'Community Q&A & Peer Discussions',
                desc: 'Answers to your posted doubts, upvotes, and discussion replies',
              },
              {
                key: 'projects',
                title: 'Project Milestones',
                desc: 'Milestone tracking and team collaboration alerts',
              },
              {
                key: 'career',
                title: 'Career & Placement Deadlines',
                desc: 'Interview practice reminders and application follow-up notices',
              },
              {
                key: 'system',
                title: 'System & Security Alerts',
                desc: 'Security notifications and important platform updates',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean((notifs as any)[item.key])}
                  onChange={(e) =>
                    setNotifs({ ...notifs, [item.key]: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <ReminderCategories notifs={notifs} setNotifs={setNotifs} />

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={saveNotifications}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Notification Preferences'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Privacy & Data */}
      {activeTab === 'privacy' && privacy && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Profile & Data Visibility</h2>
            <p className="text-xs text-slate-500">
              Decide which areas of your learning record are visible to other verified students.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Profile Visibility</label>
                <p className="text-[11px] text-slate-500">Controls who can view your basic profile card</p>
              </div>
              <select
                value={privacy.profile_visibility}
                onChange={(e) =>
                  setPrivacy({ ...privacy, profile_visibility: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="COMMUNITY">Community Only (Verified Students)</option>
                <option value="PRIVATE">Strictly Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label className="text-xs font-semibold text-slate-900">Project Showcase Visibility</label>
                <p className="text-[11px] text-slate-500">Controls visibility of published project showcases</p>
              </div>
              <select
                value={privacy.project_visibility}
                onChange={(e) =>
                  setPrivacy({ ...privacy, project_visibility: e.target.value as any })
                }
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="COMMUNITY">Community Only</option>
                <option value="PRIVATE">Strictly Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </div>

            {/* Phase 5: product analytics are off until the student opts in */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <label htmlFor="analytics-consent" className="text-xs font-semibold text-slate-900">Usage analytics</label>
                <p className="text-[11px] text-slate-500">Share anonymous usage events (no name, email, answers or documents). Off by default.</p>
              </div>
              <input
                id="analytics-consent"
                type="checkbox"
                checked={analyticsConsent}
                onChange={(e) => {
                  setAnalyticsConsent(e.target.checked);
                  setAnalyticsConsentState(e.target.checked);
                }}
                className="h-4 w-4"
              />
            </div>

            {/* Data Export section */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-blue-950">Export Student Data (GDPR / Privacy)</h4>
                <p className="text-[11px] text-blue-800">
                  Download a complete, machine-readable JSON archive of your profile, learning history, goals, and notes.
                </p>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-xl transition-colors shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>{exporting ? 'Generating Archive...' : 'Download My Data'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={savePrivacy}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Privacy Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: Connected Platforms */}
      {activeTab === 'platforms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Connected Platforms & Developer Accounts</h2>
            <p className="text-xs text-slate-500">
              Link and sync your coding and professional accounts. Passwords are never requested.
            </p>
          </div>

          <PlatformLinksList onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}

/** The student's real platform links (from the server). Earlier this tab showed GitHub, LinkedIn and LeetCode as
 *  "Connected" with sample account names for every student. */
function PlatformLinksList({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [conns, setConns] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    // Links live in two places (Integrations Center and the External Profile Hub); show both.
    Promise.all([externalIntegrationsApi.getConnections(), externalProfilesApi.getProfiles()])
      .then(([c, profiles]) =>
        setConns([
          ...c.filter((x) => x.status !== 'DISCONNECTED'),
          ...profiles
            .filter((p) => p.connection_status !== 'DISCONNECTED')
            .map((p) => ({
              id: p.id,
              provider: p.platform_name || p.platform_id,
              username: p.username,
              display_name: p.display_name,
              status: p.verification_status === 'VERIFIED' || p.verification_status === 'CONNECTED_OAUTH' ? 'CONNECTED' : 'LINKED',
            })),
        ])
      )
      .catch((e: any) => setError(e?.message || 'Could not load your platform links'));
  }, []);
  if (error) return <p className="text-xs text-rose-600">{error}</p>;
  if (!conns) return <p className="text-xs text-slate-500">Loading your platform links...</p>;
  return (
    <div className="space-y-3">
      {conns.length === 0 && <p className="text-xs text-slate-500">You have not linked any platforms yet.</p>}
      {conns.map((c) => {
        const verified = c.status === 'CONNECTED' || c.status === 'SYNCED';
        return (
          <div key={c.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 capitalize">{c.provider}</h4>
              <p className="text-[11px] text-slate-500 truncate">
                Account: <span className="font-semibold text-slate-800">{c.username || c.display_name}</span>
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                verified ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-sky-700 bg-sky-50 border-sky-200'
              }`}
            >
              {verified ? 'Connected' : 'Linked (not verified)'}
            </span>
          </div>
        );
      })}
      <button
        onClick={() => onNavigate('/integrations')}
        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
      >
        Manage platforms
      </button>
    </div>
  );
}


/** Phase 7: the reminder categories from the brief, the lead time, and where reminders are delivered. */
const REMINDER_CATEGORIES: { key: string; label: string; desc: string }[] = [
  { key: 'assignments', label: 'Upcoming assignments', desc: 'Assignments, labs, seminars and project reviews in your semester calendar' },
  { key: 'exams', label: 'Examination dates', desc: 'Slip tests, minors, lab exams, end-semester exams and GATE' },
  { key: 'study_reminders', label: 'Study reminders', desc: 'Tasks planned for today in your study planner' },
  { key: 'project_deadlines', label: 'Project deadlines', desc: 'Milestones in your projects' },
  { key: 'revision', label: 'Revision activities', desc: 'Flashcards that are due for review' },
  { key: 'opportunity_deadlines', label: 'Saved opportunity deadlines', desc: 'Application deadlines and Competition Hub registration dates you saved' },
  { key: 'team_updates', label: 'Team updates', desc: 'Competition team tasks assigned to you that are due soon' },
  { key: 'interview_sessions', label: 'Interview sessions', desc: 'Interview and assessment dates on your saved applications' },
];

function ReminderCategories({ notifs, setNotifs }: { notifs: any; setNotifs: (n: any) => void }) {
  const cats: Record<string, boolean> = notifs.categories || {};
  const lead = Number(notifs.reminder_lead_days) || 3;
  return (
    <section aria-labelledby="reminder-cats" className="space-y-3 pt-4 border-t border-slate-100">
      <div>
        <h3 id="reminder-cats" className="text-sm font-bold text-slate-900">Reminders</h3>
        <p className="text-xs text-slate-500">
          Reminders are made only from dates you recorded in the app, and each one is sent once. They appear in the app; email delivery is not connected.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {REMINDER_CATEGORIES.map((c) => (
          <label key={c.key} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
            <span>
              <span className="block text-xs font-semibold text-slate-900">{c.label}</span>
              <span className="block text-[11px] text-slate-500">{c.desc}</span>
            </span>
            <input
              type="checkbox"
              checked={cats[c.key] !== false}
              onChange={(e) => setNotifs({ ...notifs, categories: { ...cats, [c.key]: e.target.checked } })}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 cursor-pointer"
            />
          </label>
        ))}
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-700">
        Remind me
        <select
          value={lead}
          onChange={(e) => setNotifs({ ...notifs, reminder_lead_days: Number(e.target.value) })}
          className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
        >
          {[1, 2, 3, 5, 7, 14].map((d) => <option key={d} value={d}>{d} day{d === 1 ? '' : 's'}</option>)}
        </select>
        before a date
      </label>
    </section>
  );
}
