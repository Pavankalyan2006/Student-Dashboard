import * as React from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Clock,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { adminApi, SystemHealthData, StructuredLogItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminSystemPage() {
  const [health, setHealth] = React.useState<SystemHealthData | null>(null);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<StructuredLogItem[]>([]);
  const [logLevel, setLogLevel] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [h, m, l] = await Promise.all([
        adminApi.getSystemHealth(),
        adminApi.getSystemMetrics(),
        adminApi.getSystemLogs({ level: logLevel }),
      ]);
      setHealth(h);
      setMetrics(m);
      setLogs(l);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch system diagnostic data');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [logLevel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            System Observability & Diagnostic Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time component probe health, latency telemetry, and structured JSON audit logging.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14234B] hover:bg-[#1C3168] border border-[#233870] text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Run Health Probes
        </button>
      </div>

      {/* Component Probes Grid */}
      {health && (
        <div className="p-6 rounded-2xl bg-[#0D1836] border border-[#1A284D] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Server className="h-5 w-5 text-amber-400" />
              Core Subsystem Health Probes
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              Uptime: {Math.floor(health.uptime_seconds / 60)}m {health.uptime_seconds % 60}s
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {health.components.map((comp) => (
              <div
                key={comp.name}
                className="p-3.5 rounded-xl bg-[#081024] border border-[#182649] flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-[170px]">{comp.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{comp.latency_ms}ms response</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" title="HEALTHY" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time System Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0D1836] border border-[#1A284D]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total HTTP Requests</span>
            <p className="text-2xl font-bold text-white mt-1">{metrics.request_count}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Error Rate: {metrics.error_rate_percentage}%</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1836] border border-[#1A284D]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">API Mean Latency</span>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{metrics.avg_api_latency_ms}ms</p>
            <p className="text-[11px] text-slate-500 mt-0.5">DB Latency: {metrics.db_latency_ms}ms</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1836] border border-[#1A284D]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Cache Hit Ratio</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.cache_hit_rate_percentage}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Redis L1/L2</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0D1836] border border-[#1A284D]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Queue Depth</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{metrics.queue_depth}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active Jobs: {metrics.active_jobs_count}</p>
          </div>
        </div>
      )}

      {/* Structured Logs Terminal */}
      <div className="p-6 rounded-2xl bg-[#0D1836] border border-[#1A284D] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Structured JSON Logs Stream</h3>
          </div>

          <div className="flex items-center gap-2">
            {['', 'info', 'warn', 'error', 'security'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLogLevel(lvl)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer',
                  logLevel === lvl
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-[#081024] text-slate-400 hover:text-white border border-[#182649]'
                )}
              >
                {lvl ? lvl.toUpperCase() : 'ALL'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#060B19] border border-[#14203D] font-mono text-xs max-h-96 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No structured log entries found.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-2 rounded bg-[#091124] border border-[#131F3A] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[10px] uppercase font-bold px-1.5 py-0.2 rounded',
                        log.level === 'error' && 'bg-rose-950 text-rose-300',
                        log.level === 'warn' && 'bg-amber-950 text-amber-300',
                        log.level === 'security' && 'bg-purple-950 text-purple-300',
                        log.level === 'info' && 'bg-blue-950 text-blue-300'
                      )}
                    >
                      {log.level}
                    </span>
                    <span className="text-cyan-400">{log.service}</span>
                    <span className="text-slate-500">[{log.request_id}]</span>
                  </div>
                  <span className="text-slate-600 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 text-[11px]">{log.message}</p>
                {log.path && (
                  <p className="text-[10px] text-slate-500">
                    {log.method} {log.path} {log.status_code ? `· HTTP ${log.status_code}` : ''} {log.latency_ms ? `· ${log.latency_ms}ms` : ''}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
