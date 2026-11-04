// src/features/profile/components/AddExternalProfileModal.tsx
// Interactive modal to discover, validate, and connect external student profiles

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ExternalPlatformMeta,
  ExternalPlatformCategory,
  CreateExternalProfilePayload,
  ProfileSharingSettings,
} from '../types/externalProfileTypes';
import { externalProfilesApi } from '../api/externalProfilesApi';

interface AddExternalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileAdded: () => void;
  platforms: ExternalPlatformMeta[];
}

const CATEGORY_TABS: Array<{ id: ExternalPlatformCategory | 'ALL'; label: string }> = [
  { id: 'ALL', label: 'All Platforms' },
  { id: 'DEVELOPER_CODE_HOSTING', label: 'Code Hosting' },
  { id: 'CODING_PRACTICE', label: 'Coding Practice' },
  { id: 'PROFESSIONAL_NETWORKING', label: 'Professional' },
  { id: 'PORTFOLIO_PROJECT', label: 'Portfolio' },
  { id: 'COMPETITIVE_PROGRAMMING', label: 'Contests' },
  { id: 'ACADEMIC_RESEARCH', label: 'Academic & Research' },
  { id: 'DESIGN_DATA_SPECIALIZED', label: 'Design & Data' },
];

export const AddExternalProfileModal: React.FC<AddExternalProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileAdded,
  platforms,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExternalPlatformCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<ExternalPlatformMeta | null>(null);

  // Form states
  const [urlInput, setUrlInput] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    normalized_url?: string;
    username?: string;
    error?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sharing toggles
  const [sharing, setSharing] = useState<ProfileSharingSettings>({
    use_for_resume: true,
    use_for_career: true,
    use_for_job_matching: true,
    use_for_skill_gap: true,
    include_in_resume_links: true,
    include_in_public_portfolio: false,
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlatform(null);
      setUrlInput('');
      setDisplayName('');
      setValidationResult(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Real-time URL validation debounce
  useEffect(() => {
    if (!selectedPlatform || !urlInput.trim()) {
      setValidationResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const res = await externalProfilesApi.validateProfileUrl(selectedPlatform.id, urlInput.trim());
        setValidationResult(res);
      } catch (err: any) {
        setValidationResult({ valid: false, error: err.message || 'Validation failed' });
      } finally {
        setIsValidating(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [urlInput, selectedPlatform]);

  if (!isOpen) return null;

  const filteredPlatforms = platforms.filter((p) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      p.category === selectedCategory ||
      (p.secondary_categories && p.secondary_categories.includes(selectedCategory));
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform) return;
    if (!validationResult || !validationResult.valid) {
      setErrorMessage(validationResult?.error || 'Please enter a valid profile URL or handle.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: CreateExternalProfilePayload = {
        platform_id: selectedPlatform.id,
        profile_url: urlInput.trim(),
        username: validationResult.username,
        display_name: displayName.trim() || validationResult.username || selectedPlatform.name,
        sharing_settings: sharing,
      };

      await externalProfilesApi.addProfile(payload);
      onProfileAdded();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {selectedPlatform ? `Connect ${selectedPlatform.name}` : 'Connect External Platform'}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedPlatform
                  ? 'Enter your profile URL or handle with real-time validation'
                  : 'Select an external developer, coding, or professional profile to sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedPlatform ? (
            /* Platform Selection View */
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search platforms (e.g. GitHub, LeetCode, Codeforces, Kaggle, ORCID)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Platforms Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform);
                      setUrlInput('');
                    }}
                    className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all duration-200 text-left flex items-start justify-between group shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-700/80 flex items-center justify-center font-bold text-sm text-white">
                          {platform.name.charAt(0)}
                        </div>
                        <h4 className="font-semibold text-white text-sm group-hover:text-indigo-400 transition-colors">
                          {platform.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {platform.description}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {platform.sync_supported && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Auto Sync
                          </span>
                        )}
                        {platform.oauth_supported && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                            OAuth
                          </span>
                        )}
                        {!platform.sync_supported && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 border border-slate-700 font-medium">
                            Manual Link
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Selected Platform Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Back to platforms button & Selected platform summary banner */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  ← Choose a different platform
                </button>
                <span className="text-xs text-slate-400">{selectedPlatform.category}</span>
              </div>

              {/* Platform Info Box */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-lg text-white shrink-0">
                  {selectedPlatform.name.charAt(0)}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{selectedPlatform.name}</span>
                    <a
                      href={selectedPlatform.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      Visit site <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-slate-300">{selectedPlatform.description}</p>
                  <p className="text-slate-400 italic pt-1">{selectedPlatform.privacy_notes}</p>
                </div>
              </div>

              {/* Profile URL Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-200">
                  Profile URL or Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={selectedPlatform.url_placeholder}
                    required
                    className={`w-full px-4 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      validationResult?.valid
                        ? 'border-emerald-500/80 focus:border-emerald-500'
                        : validationResult?.error
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {isValidating && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">
                      Validating...
                    </span>
                  )}
                </div>

                {/* Validation Feedback */}
                {validationResult?.valid && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <div>
                      <span>Normalized URL: </span>
                      <strong className="text-emerald-300 font-mono text-[11px]">
                        {validationResult.normalized_url}
                      </strong>
                      {validationResult.username && (
                        <span> (Username: @{validationResult.username})</span>
                      )}
                    </div>
                  </div>
                )}

                {validationResult?.error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationResult.error}</span>
                  </div>
                )}
              </div>

              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-200">
                  Display Label / Name <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={`e.g. ${selectedPlatform.name} Main Profile`}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Privacy and Cross-Module Sharing Preferences */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Privacy & Cross-Module Sharing Controls
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Granular consent</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={sharing.use_for_resume}
                      onChange={(e) => setSharing({ ...sharing, use_for_resume: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-white block">Include in Resume</span>
                      <span className="text-[11px] text-slate-400">Verified links on generated CV</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={sharing.use_for_career}
                      onChange={(e) => setSharing({ ...sharing, use_for_career: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-white block">Career Roadmaps</span>
                      <span className="text-[11px] text-slate-400">Skill milestone progress</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={sharing.use_for_job_matching}
                      onChange={(e) => setSharing({ ...sharing, use_for_job_matching: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-white block">Job Match Scoring</span>
                      <span className="text-[11px] text-slate-400">Tailor recommended openings</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70">
                    <input
                      type="checkbox"
                      checked={sharing.include_in_public_portfolio}
                      onChange={(e) => setSharing({ ...sharing, include_in_public_portfolio: e.target.checked })}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="font-medium text-white block">Public Portfolio</span>
                      <span className="text-[11px] text-slate-400">Display on public student showcase</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !validationResult?.valid}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  {isSubmitting ? (
                    <>Connecting...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Connect {selectedPlatform.name}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
