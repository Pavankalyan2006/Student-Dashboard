import * as React from 'react';
import {
  GitBranch,
  Search,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminIntegrationsPage() {
  const [github, setGithub] = React.useState<any>(null);
  const [research, setResearch] = React.useState<any[]>([]);
  const [storage, setStorage] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gh, res, stor] = await Promise.all([
        adminApi.getGithubStatus(),
        adminApi.getResearchProviders(),
        adminApi.getStorageMetrics(),
      ]);
      setGithub(gh);
      setResearch(res);
      setStorage(stor);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load external integrations');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleToggleGithub = async () => {
    if (!github) return;
    const nextState = !github.is_enabled;
    try {
      await adminApi.updateGithubStatus({ is_enabled: nextState });
      setGithub({ ...github, is_enabled: nextState });
      toast.success(`GitHub integration ${nextState ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update GitHub integration state');
    }
  };

  const handleToggleResearch = async (prov: any) => {
    const nextState = !prov.is_enabled;
    try {
      await adminApi.updateResearchProvider(prov.id, { is_enabled: nextState });
      setResearch((prev) =>
        prev.map((r) => (r.id === prov.id ? { ...r, is_enabled: nextState } : r))
      );
      toast.success(`${prov.name} ${nextState ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update research provider');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm">Polling integration gateway statuses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            External Integrations & Service Gateways
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage third-party connections to GitHub, Academic Open Access repositories, and Object Storage.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Status
        </button>
      </div>

      {/* GitHub Integration Card */}
      {github && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-800 text-white">
                <GitBranch className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">GitHub Enterprise & OAuth App</h3>
                  <span
                    className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border',
                      github.is_enabled
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border-rose-800'
                    )}
                  >
                    {github.is_enabled ? 'Operational' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">OAuth Client ID: {github.app_client_id}</p>
              </div>
            </div>

            <button
              onClick={handleToggleGithub}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer',
                github.is_enabled
                  ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300'
                  : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
              )}
            >
              {github.is_enabled ? 'Emergency Disable' : 'Enable Integration'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-navy-700 text-xs">
            <div className="p-3 rounded-xl bg-navy-950">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">API Health</span>
              <p className="font-semibold text-emerald-400 mt-0.5">{github.api_health}</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Rate Limit Remaining</span>
              <p className="font-semibold text-white mt-0.5">{github.rate_limit_remaining} / 5000</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Connected Students</span>
              <p className="font-semibold text-cyan-400 mt-0.5">{github.total_connected_students}</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950">
              <span className="text-slate-500 text-[10px] uppercase font-semibold">Repos Analyzed</span>
              <p className="font-semibold text-amber-400 mt-0.5">{github.total_repositories_analyzed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Research Providers */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-400" />
          Academic Research Providers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {research.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-navy-950 border border-navy-700 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{r.name}</h4>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{r.provider_type}</span>
                </div>
                <button
                  onClick={() => handleToggleResearch(r)}
                  className={cn(
                    'p-1.5 rounded-lg border text-xs cursor-pointer',
                    r.is_enabled
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  )}
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="text-xs space-y-1 text-slate-400 pt-2 border-t border-[#121E3B]">
                <p>Status: <strong className="text-emerald-400">{r.health_status}</strong></p>
                <p>Total Queries: <strong className="text-white">{r.total_queries}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Object Storage */}
      {storage && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-amber-400" />
            Document & Attachment Storage Vault
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-navy-950">
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Driver</span>
              <p className="text-white font-semibold mt-1">{storage.storage_driver} File System</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-950">
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Total Objects</span>
              <p className="text-white font-semibold mt-1">{storage.total_objects} stored records</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-950">
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Total Size</span>
              <p className="text-cyan-400 font-semibold mt-1">{(storage.total_bytes / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-950">
              <span className="text-slate-500 uppercase text-[10px] font-semibold">Failed Uploads</span>
              <p className="text-emerald-400 font-semibold mt-1">{storage.failed_uploads_count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
