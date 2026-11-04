// src/features/jobs/components/JobSourcesHealthModal.tsx
// Displays source adapters, health status, sync run telemetry, and manual refresh controls

import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { JobSourceConfig, JobSyncRun } from '../types/jobsTypes';
import { jobsApi } from '../api/jobsApi';

interface JobSourcesHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted: () => void;
}

export const JobSourcesHealthModal: React.FC<JobSourcesHealthModalProps> = ({
  isOpen,
  onClose,
  onSyncCompleted,
}) => {
  const [sources, setSources] = useState<JobSourceConfig[]>([]);
  const [syncRuns, setSyncRuns] = useState<JobSyncRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<any | null>(null);

  const fetchSourceStatus = async () => {
    try {
      setLoading(true);
      const res = await jobsApi.getSources();
      setSources(res.sources || []);
      setSyncRuns(res.recent_sync_runs || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSourceStatus();
      setSyncSummary(null);
    }
  }, [isOpen]);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      const res = await jobsApi.triggerSync();
      setSyncSummary(res.data);
      await fetchSourceStatus();
      onSyncCompleted();
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Multi-Source Aggregation & Health Monitor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Government portals, Central Recruitment Boards, and Public APIs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {syncSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs animate-in fade-in">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                Synchronization Completed
              </span>
              <div className="flex items-center gap-4 text-emerald-800 dark:text-emerald-300">
                <span>Added: <strong>{syncSummary.total_added}</strong> new listings</span>
                <span>Updated: <strong>{syncSummary.total_updated}</strong> listings</span>
                <span>Duplicates Filtered: <strong>{syncSummary.total_duplicates_skipped}</strong></span>
              </div>
            </div>
          )}

          {/* Source List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Configured Adapters ({sources.length})
            </h4>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading sources...</div>
            ) : (
              <div className="space-y-3">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {s.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.health_status === 'HEALTHY'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {s.health_status}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          ({s.category})
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        {s.base_url ? (
                          <a
                            href={s.base_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {s.base_url.replace(/^https?:\/\//, '')}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">Direct Notification Feed</span>
                        )}
                        {s.last_successful_sync && (
                          <span>Last sync: {new Date(s.last_successful_sync).toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        {s.records_retrieved_last_run || 0} Retrieved
                      </span>
                      <span className="text-slate-400 text-[11px]">Last run</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sync History */}
          {syncRuns.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent Synchronization Runs
              </h4>
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {syncRuns.slice(0, 5).map((run) => (
                  <div key={run.id} className="p-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {run.source_name}
                      </span>
                      <span className="text-slate-400 ml-2">
                        {new Date(run.started_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 font-medium">+{run.records_added} added</span>
                      <span className="text-slate-400">{run.duplicates_skipped} dupes</span>
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-200 dark:bg-slate-700">
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
