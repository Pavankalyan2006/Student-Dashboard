import * as React from 'react';
import {
  Users,
  BookOpen,
  Cpu,
  Activity,
  ShieldCheck,
  Server,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Sparkles,
  RefreshCw,
  FolderGit2,
  FileText,
  Clock,
} from 'lucide-react';
import { adminApi, AdminDashboardSummary, AdminAuditLogItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [summary, setSummary] = React.useState<AdminDashboardSummary | null>(null);
  const [recentLogs, setRecentLogs] = React.useState<AdminAuditLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadData = async () => {
    try {
      const [sumData, logsData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getAuditLogs({ limit: 6 }),
      ]);
      setSummary(sumData);
      setRecentLogs(logsData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load admin summary');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium">Aggregating live platform metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Platform Operations Dashboard
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Live Production
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-tenant telemetry, student accounts, AI workloads, and infrastructure health.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-amber-400')} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Student Accounts */}
        <div
          onClick={() => onNavigate('/admin/students')}
          className="p-5 rounded-2xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Students</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{summary?.total_students ?? 0}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-medium">● {summary?.active_students ?? 0} Active</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400 font-medium">● {summary?.suspended_students ?? 0} Suspended</span>
          </div>
        </div>

        {/* AI Workloads */}
        <div
          onClick={() => onNavigate('/admin/ai')}
          className="p-5 rounded-2xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Operations</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{summary?.ai_requests_count ?? 0}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Avg Latency: <strong className="text-slate-200">{summary?.ai_avg_latency_ms ?? 0}ms</strong></span>
          </div>
        </div>

        {/* Learning Activity */}
        <div
          onClick={() => onNavigate('/admin/content')}
          className="p-5 rounded-2xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Academics</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{summary?.courses_count ?? 0}</div>
          <div className="text-xs text-slate-400">
            <span>{summary?.lessons_completed_count ?? 0} lessons completed</span>
          </div>
        </div>

        {/* System Health */}
        <div
          onClick={() => onNavigate('/admin/system')}
          className="p-5 rounded-2xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">System State</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6" />
            {summary?.system_health ?? 'HEALTHY'}
          </div>
          <div className="text-xs text-slate-400">
            <span>{summary?.active_jobs_count ?? 0} active jobs · 0 queue lag</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Coding Runs</p>
            <p className="text-lg font-bold text-white">{summary?.coding_submissions_count ?? 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">DSA Solved</p>
            <p className="text-lg font-bold text-white">{summary?.dsa_problems_solved_count ?? 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <FolderGit2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Projects</p>
            <p className="text-lg font-bold text-white">{summary?.projects_count ?? 0}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Research Papers</p>
            <p className="text-lg font-bold text-white">{summary?.research_papers_count ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Launch & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Cards */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 tracking-tight">Administrative Controls</h2>
          
          <button
            onClick={() => onNavigate('/admin/students')}
            className="w-full p-4 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-white">Student Account Management</p>
              <p className="text-xs text-slate-400 mt-0.5">Filter by branch, review status, suspend / reactivate</p>
            </div>
            <Users className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('/admin/ai')}
            className="w-full p-4 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-white">AI Models & Tool Safety</p>
              <p className="text-xs text-slate-400 mt-0.5">Configure model roles and toggle registered tool safety</p>
            </div>
            <Cpu className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('/admin/jobs')}
            className="w-full p-4 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-white">Background Job Pipeline</p>
              <p className="text-xs text-slate-400 mt-0.5">Inspect embeddings, parsing, and trigger safe retries</p>
            </div>
            <Activity className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => onNavigate('/admin/settings')}
            className="w-full p-4 rounded-xl bg-navy-900 border border-navy-700 hover:border-amber-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-white">Feature Flags & Maintenance</p>
              <p className="text-xs text-slate-400 mt-0.5">Control live rollout percentages and system mode</p>
            </div>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Audit Trail Preview */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-navy-900 border border-navy-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Administrative Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-0.5">Non-repudiable log of administrative actions</p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Immutable
            </span>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent audit logs found.</p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-navy-950 border border-navy-700 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-300">{log.action}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-800 text-slate-300">
                        {log.target_type}: {log.target_id}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      By <strong className="text-slate-300">{log.admin_name}</strong> · IP: {log.ip_hash.substring(0, 12)}...
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
