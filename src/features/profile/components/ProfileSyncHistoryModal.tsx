// src/features/profile/components/ProfileSyncHistoryModal.tsx
// Modal displaying audit log and synchronization run history for an external profile

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  StudentExternalProfile,
  ExternalProfileSyncRun,
} from '../types/externalProfileTypes';
import { externalProfilesApi } from '../api/externalProfilesApi';

interface ProfileSyncHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentExternalProfile | null;
}

export const ProfileSyncHistoryModal: React.FC<ProfileSyncHistoryModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [history, setHistory] = useState<ExternalProfileSyncRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      loadHistory();
    }
  }, [isOpen, profile]);

  const loadHistory = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const runs = await externalProfilesApi.getProfileHistory(profile.id);
      setHistory(runs);
    } catch (err) {
      console.error('Failed to load profile history', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Synchronization Audit Logs</h3>
              <p className="text-xs text-slate-400">
                {profile.platform_name} (@{profile.username})
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Sync logs record every automated and on-demand synchronization attempt. Transparent reporting confirms what data was ingested and records any rate-limiting or network issues honestly.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Loading sync records...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No synchronization runs recorded yet for this profile.</p>
              <p className="text-slate-400 mt-1">Click "Sync" on the profile card to trigger the first sync.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((run) => (
                <div
                  key={run.id}
                  className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {run.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      )}
                      {run.status === 'SKIPPED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          <Info className="w-3 h-3" />
                          Manual Link Preserved
                        </span>
                      )}
                      {run.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(run.completed_at).toLocaleString()}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {run.records_updated} fields updated
                    </span>
                  </div>

                  {run.fields_updated && run.fields_updated.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {run.fields_updated.map((field) => (
                        <span
                          key={field}
                          className="px-2 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 font-mono"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  )}

                  {run.error_message && (
                    <p className="text-[11px] text-amber-300/90 italic pt-1 border-t border-slate-700/50">
                      {run.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
