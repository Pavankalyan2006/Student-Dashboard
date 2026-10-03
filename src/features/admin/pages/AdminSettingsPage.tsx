import * as React from 'react';
import {
  Settings,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Sliders,
  Lock,
} from 'lucide-react';
import { adminApi, FeatureFlagItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminSettingsPage() {
  const [flags, setFlags] = React.useState<FeatureFlagItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadFlags = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getFeatureFlags();
      setFlags(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch platform configuration');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (flag: FeatureFlagItem) => {
    const nextState = !flag.is_enabled;
    try {
      await adminApi.updateFeatureFlag(flag.key, { is_enabled: nextState });
      setFlags((prev) =>
        prev.map((f) => (f.key === flag.key ? { ...f, is_enabled: nextState } : f))
      );
      toast.success(`Feature '${flag.name}' ${nextState ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update feature flag');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Platform Configuration & Feature Gates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Server-enforced runtime switches for modules, subagent autonomy, and emergency maintenance mode.
          </p>
        </div>

        <button
          onClick={loadFlags}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14234B] hover:bg-[#1C3168] border border-[#233870] text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Reload Configuration
        </button>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map((flag) => {
          const isMaintenance = flag.key === 'maintenance_mode';
          return (
            <div
              key={flag.key}
              className={cn(
                'p-5 rounded-2xl border transition-all space-y-3',
                isMaintenance && flag.is_enabled
                  ? 'bg-rose-950/30 border-rose-800'
                  : 'bg-[#0D1836] border-[#1A284D]'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{flag.name}</h3>
                    <code className="text-[10px] text-amber-300 font-mono">[{flag.key}]</code>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{flag.description}</p>
                </div>

                <button
                  onClick={() => handleToggle(flag)}
                  className={cn(
                    'p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0',
                    flag.is_enabled
                      ? isMaintenance
                        ? 'bg-rose-600 border-rose-500 text-white'
                        : 'bg-emerald-950/70 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  )}
                  title={flag.is_enabled ? 'Turn OFF' : 'Turn ON'}
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-[#182649] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-cyan-400" />
                  Server Enforced: <strong>{flag.is_server_enforced ? 'Yes' : 'No'}</strong>
                </span>
                <span>Rollout: <strong>{flag.rollout_percentage}%</strong></span>
                <span
                  className={cn(
                    'font-bold',
                    flag.is_enabled ? 'text-emerald-400' : 'text-slate-500'
                  )}
                >
                  {flag.is_enabled ? '● ENABLED' : '○ DISABLED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
