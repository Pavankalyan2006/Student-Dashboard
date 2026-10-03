import * as React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Lock,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { adminApi, SecurityEventItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminSecurityPage() {
  const [events, setEvents] = React.useState<SecurityEventItem[]>([]);
  const [rateLimits, setRateLimits] = React.useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evs, rls] = await Promise.all([
        adminApi.getSecurityEvents({ severity: severityFilter }),
        adminApi.getRateLimits(),
      ]);
      setEvents(evs);
      setRateLimits(rls);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load security audit data');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [severityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Security Hardening & Threat Audit Plane
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audit log of authentication failures, rate limit events, IDOR denials, and injection attempts.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14234B] hover:bg-[#1C3168] border border-[#233870] text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh Audit
        </button>
      </div>

      {/* Security Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#0D1836] border border-[#1A284D] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-white">IDOR Protection Active</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Strict object ownership check on all user IDs</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1836] border border-[#1A284D] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-white">Prompt Injection Shield</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Context boundaries around external documents & repos</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1836] border border-[#1A284D] flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-white">Adaptive Rate Limiting</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Active IP and user sliding-window buckets</p>
          </div>
        </div>
      </div>

      {/* Rate Limit Rules */}
      <div className="p-6 rounded-2xl bg-[#0D1836] border border-[#1A284D] space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Sliders className="h-5 w-5 text-amber-400" />
          Configured Rate Limit Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rateLimits.map((rl) => (
            <div key={rl.id} className="p-3.5 rounded-xl bg-[#081024] border border-[#182649] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <code className="text-amber-300 font-mono text-[11px] font-bold">{rl.endpoint_pattern}</code>
                <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-slate-400">
                Max <strong>{rl.max_requests}</strong> req / <strong>{rl.window_seconds}s</strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events Table */}
      <div className="rounded-2xl bg-[#0D1836] border border-[#1A284D] overflow-hidden space-y-3">
        <div className="p-4 bg-[#0A132C] border-b border-[#1A284D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm">Security Incident Feed</h3>
            <p className="text-xs text-slate-400">Logged security policy violations and administrative security events.</p>
          </div>

          <div className="flex items-center gap-2">
            {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer',
                  severityFilter === sev
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-[#081024] text-slate-400 hover:text-white border border-[#182649]'
                )}
              >
                {sev || 'ALL'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A132C] text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162345]">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No security events found matching the filter.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#111E42]/50">
                    <td className="py-3 px-4 font-semibold text-white">{ev.event_type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'text-[10px] uppercase font-bold px-2 py-0.5 rounded border',
                          ev.severity === 'CRITICAL' && 'bg-rose-950 text-rose-300 border-rose-800',
                          ev.severity === 'HIGH' && 'bg-orange-950 text-orange-300 border-orange-800',
                          ev.severity === 'MEDIUM' && 'bg-amber-950 text-amber-300 border-amber-800',
                          ev.severity === 'LOW' && 'bg-blue-950 text-blue-300 border-blue-800'
                        )}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{ev.ip_address}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">{ev.path}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-[300px] truncate">{ev.details}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] text-right">
                      {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
