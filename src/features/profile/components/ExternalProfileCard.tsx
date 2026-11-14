// src/features/profile/components/ExternalProfileCard.tsx
// Rich profile card with status badges, metric pills, privacy indicators, and actionable controls

import React from 'react';
import {
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Settings2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  FileText,
  Briefcase,
  Target,
  Globe,
  Share2,
} from 'lucide-react';
import {
  StudentExternalProfile,
  VerificationStatus,
  ConnectionStatus,
} from '../types/externalProfileTypes';

interface ExternalProfileCardProps {
  profile: StudentExternalProfile;
  isSyncing: boolean;
  onSync: (id: string) => void;
  onVerify: (profile: StudentExternalProfile) => void;
  onOpenPrivacy: (profile: StudentExternalProfile) => void;
  onOpenHistory: (profile: StudentExternalProfile) => void;
  onDelete: (id: string, name: string) => void;
  layout?: 'grid' | 'list';
}

export const ExternalProfileCard: React.FC<ExternalProfileCardProps> = ({
  profile,
  isSyncing,
  onSync,
  onVerify,
  onOpenPrivacy,
  onOpenHistory,
  onDelete,
  layout = 'grid',
}) => {
  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'CONNECTED_OAUTH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            OAuth Connected
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Profile
          </span>
        );
      case 'MANUALLY_ADDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200">
            <FileText className="w-3.5 h-3.5" />
            Manually Added
          </span>
        );
      case 'PENDING_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        );
      case 'RECONNECTION_REQUIRED':
      case 'CONNECTION_EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Reconnection Required
          </span>
        );
      case 'SYNC_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Sync Failed
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-500 border border-slate-500/30">
            <Lock className="w-3.5 h-3.5" />
            Disconnected
          </span>
        );
      default:
        return null;
    }
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never synced';
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMins)}m ago`;
    }
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const isConnected = profile.connection_status !== 'DISCONNECTED';
  const showVerifyBtn =
    profile.verification_status === 'MANUALLY_ADDED' ||
    profile.verification_status === 'PENDING_VERIFICATION' ||
    profile.verification_status === 'RECONNECTION_REQUIRED';

  if (layout === 'list') {
    return (
      <div className="bg-white border border-slate-200 hover:border-slate-200 rounded-xl p-4 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[260px]">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-900">
            {profile.platform_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 text-base">{profile.display_name || profile.platform_name}</h4>
              {getVerificationBadge(profile.verification_status)}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>@{profile.username}</span>
              <span>•</span>
              <span>{profile.platform_name}</span>
            </p>
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {profile.metrics_summary &&
            Object.entries(profile.metrics_summary).slice(0, 3).map(([key, val]) => (
              <span
                key={key}
                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
              >
                <span className="text-slate-500">{key}:</span> <strong className="text-slate-900">{val}</strong>
              </span>
            ))}
        </div>

        {/* Sync Status & Sharing Toggles */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Synced: {formatLastSync(profile.last_successful_sync)}</span>
          </div>

          <div className="flex items-center gap-1">
            {profile.sharing_settings.use_for_resume && (
              <span title="Included in Resume" className="p-1 rounded bg-indigo-50 text-indigo-600">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            {profile.sharing_settings.use_for_career && (
              <span title="Used for Career Advice" className="p-1 rounded bg-blue-50 text-blue-600">
                <Briefcase className="w-3.5 h-3.5" />
              </span>
            )}
            {profile.sharing_settings.use_for_job_matching && (
              <span title="Used for Job Matching" className="p-1 rounded bg-amber-50 text-amber-600">
                <Target className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => onSync(profile.id)}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
            title="Sync Now"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {showVerifyBtn && (
            <button
              onClick={() => onVerify(profile)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200 transition-colors"
            >
              Verify
            </button>
          )}

          <button
            onClick={() => onOpenPrivacy(profile)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
            title="Privacy & Sharing"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <a
            href={profile.normalized_profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
            title="Visit External Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => onDelete(profile.id, profile.platform_name)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
            title="Delete Profile"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="bg-white border border-slate-200 hover:border-slate-200 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-indigo-500/5">
      <div>
        {/* Header: Platform & Badges */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-900 shadow-inner">
              {profile.platform_name.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                {profile.display_name || profile.platform_name}
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span>@{profile.username}</span>
                <span>•</span>
                <span className="text-slate-500">{profile.platform_name}</span>
              </p>
            </div>
          </div>
          {getVerificationBadge(profile.verification_status)}
        </div>

        {/* Headline or Bio */}
        {profile.headline && (
          <p className="text-xs text-slate-700 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            {profile.headline}
          </p>
        )}

        {/* Metrics Summary Grid */}
        {profile.metrics_summary && Object.keys(profile.metrics_summary).length > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(profile.metrics_summary).slice(0, 4).map(([key, val]) => (
              <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-500 block truncate">{key}</span>
                <span className="text-sm font-bold text-slate-900 truncate block">{val}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-center">
            <span className="text-xs text-slate-500">
              {profile.connection_status === 'SYNCING'
                ? 'Syncing metrics in progress...'
                : 'Manual link preserved. Programmatic metrics not configured.'}
            </span>
          </div>
        )}

        {/* Error or Warning Notice */}
        {profile.last_error_summary && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-700 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
            <span className="line-clamp-2">{profile.last_error_summary}</span>
          </div>
        )}

        {/* Sync Time & Sharing Permissions */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Synced: {formatLastSync(profile.last_successful_sync)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Used for:</span>
            {profile.sharing_settings.use_for_resume && (
              <span title="Resume Links" className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                Resume
              </span>
            )}
            {profile.sharing_settings.use_for_career && (
              <span title="Career Roadmap" className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                Career
              </span>
            )}
            {profile.sharing_settings.use_for_job_matching && (
              <span title="Job Discovery" className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-semibold">
                Jobs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        <button
          onClick={() => onSync(profile.id)}
          disabled={isSyncing}
          className="col-span-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          title="Synchronize Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Sync</span>
        </button>

        {showVerifyBtn ? (
          <button
            onClick={() => onVerify(profile)}
            className="col-span-1 py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-100 text-emerald-700 text-xs font-medium flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
            title="Start Challenge Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenHistory(profile)}
            className="col-span-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            title="Sync History"
          >
            <History className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>
        )}

        <button
          onClick={() => onOpenPrivacy(profile)}
          className="col-span-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
          title="Privacy & Sharing"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Privacy</span>
        </button>

        <a
          href={profile.normalized_profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
          title="Open External URL"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Visit</span>
        </a>
      </div>
    </div>
  );
};
