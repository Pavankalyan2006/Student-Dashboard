// src/features/profile/components/ProfilePrivacyModal.tsx
// Modal for managing granular consent, cross-module sharing, and profile display label

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings2,
  FileText,
  Briefcase,
  Target,
  Sparkles,
  Globe,
  AlertCircle,
  Check,
} from 'lucide-react';
import {
  StudentExternalProfile,
  ProfileSharingSettings,
} from '../types/externalProfileTypes';
import { externalProfilesApi } from '../api/externalProfilesApi';

interface ProfilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentExternalProfile | null;
  onUpdated: () => void;
}

export const ProfilePrivacyModal: React.FC<ProfilePrivacyModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdated,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [sharing, setSharing] = useState<ProfileSharingSettings>({
    use_for_resume: true,
    use_for_career: true,
    use_for_job_matching: true,
    use_for_skill_gap: true,
    include_in_resume_links: true,
    include_in_public_portfolio: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setDisplayName(profile.display_name || '');
      setSharing({ ...profile.sharing_settings });
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await externalProfilesApi.updateProfile(profile.id, {
        display_name: displayName.trim() || profile.platform_name,
        sharing_settings: sharing,
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update privacy settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Privacy & Sharing Controls</h3>
              <p className="text-xs text-slate-500">{profile.platform_name} (@{profile.username})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Label input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Display Name or Label
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Primary GitHub Account"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Custom label shown on your student dashboard and resume header.
            </p>
          </div>

          {/* Granular Sharing Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Cross-Module Consent Settings
            </h4>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sharing.use_for_resume}
                  onChange={(e) => setSharing({ ...sharing, use_for_resume: e.target.checked })}
                  className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Include in AI Resume Generator</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Allows the resume builder to extract metrics, repo highlights, and verified links into your generated PDF.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sharing.use_for_career}
                  onChange={(e) => setSharing({ ...sharing, use_for_career: e.target.checked })}
                  className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Career Roadmap & Recommendations</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Factors in coding contest rating, solved problems, and repos when suggesting semester milestones.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sharing.use_for_job_matching}
                  onChange={(e) => setSharing({ ...sharing, use_for_job_matching: e.target.checked })}
                  className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    <span>Jobs Discovery Match Scoring</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Boosts your match score on verified private and government job openings matching your demonstrated stack.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={sharing.include_in_public_portfolio}
                  onChange={(e) => setSharing({ ...sharing, include_in_public_portfolio: e.target.checked })}
                  className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-900">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Public Portfolio Showcase</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Display badge and link on your publicly shareable student portfolio profile.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
