// src/features/profile/components/ProfileVerificationModal.tsx
// Verification modal with challenge tokens, bio instructions, copy-to-clipboard, and live check

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { StudentExternalProfile } from '../types/externalProfileTypes';
import { externalProfilesApi } from '../api/externalProfilesApi';
import { copyText } from '../../../lib/clipboard';

interface ProfileVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentExternalProfile | null;
  onVerified: () => void;
}

export const ProfileVerificationModal: React.FC<ProfileVerificationModalProps> = ({
  isOpen,
  onClose,
  profile,
  onVerified,
}) => {
  const [copied, setCopied] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && profile) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (profile.verification_challenge_token) {
        setChallengeToken(profile.verification_challenge_token);
        setInstructions(`Include the verification code '${profile.verification_challenge_token}' in your public ${profile.platform_name} bio or profile description.`);
      } else {
        handleStartChallenge();
      }
    }
  }, [isOpen, profile]);

  if (!isOpen || !profile) return null;

  const handleStartChallenge = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const challenge = await externalProfilesApi.startChallengeVerification(profile.id);
      setChallengeToken(challenge.token);
      setInstructions(challenge.instructions);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate verification challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!challengeToken) return;
    copyText(challengeToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await externalProfilesApi.checkChallengeVerification(profile.id);
      if (res.verified) {
        setSuccessMsg(res.message || 'Profile verified successfully!');
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Verification token not detected yet. Please ensure it is saved in your public profile and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification check failed.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Verify Ownership</h3>
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
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-700 leading-relaxed">
            To prevent profile spoofing and unlock verified trust badges on your resumes and campus applications, prove ownership of your <strong>{profile.platform_name}</strong> profile.
          </p>

          {/* Instructions Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-semibold text-slate-900 block">Step 1: Add Verification Code</span>
            <p className="text-xs text-slate-700">
              {instructions || `Place this temporary verification token in your public ${profile.platform_name} profile bio or description.`}
            </p>

            {/* Token Copy Box */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs text-emerald-600">
              {isLoading ? (
                <span className="text-slate-500 animate-pulse">Generating security code...</span>
              ) : (
                <>
                  <span className="select-all font-bold">{challengeToken || 'btech-verify-code'}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-900 block">Step 2: Save on {profile.platform_name}</span>
            <p className="text-xs text-slate-700">
              Open your public profile settings, paste the code into your bio, and save changes.
            </p>
            <a
              href={profile.normalized_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline pt-1"
            >
              Open your profile in a new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            onClick={handleStartChallenge}
            disabled={isLoading}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Regenerate Code
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCheckVerification}
              disabled={isChecking || isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:bg-slate-50 disabled:text-slate-500"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking Bio...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
