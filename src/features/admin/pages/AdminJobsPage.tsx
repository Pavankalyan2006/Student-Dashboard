import * as React from 'react';
import {
  Activity,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, BackgroundJobItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminJobsPage() {
  const [jobs, setJobs] = React.useState<BackgroundJobItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getJobs({ status: statusFilter });
      setJobs(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch background jobs');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleRetry = async (job: BackgroundJobItem) => {
    setRetryingId(job.id);
    try {
      const updated = await adminApi.retryJob(job.id);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
      toast.success(`Job '${job.job_type}' queued for safe retry.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to retry background job');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Background Workload & Asynchronous Task Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor vector embeddings, PDF parsing, repository static analyses, and execute safe retries.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14234B] hover:bg-[#1C3168] border border-[#233870] text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh Jobs
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0D1836] border border-[#1A284D]">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-xs text-slate-300 font-medium">Filter by State:</span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {['', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
                statusFilter === st
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-[#081024] text-slate-400 hover:text-white border border-[#182649]'
              )}
            >
              {st || 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl bg-[#0D1836] border border-[#1A284D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A132C] border-b border-[#1A284D] text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Job Type & ID</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Retries</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162345]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No background jobs found matching the selected status.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const isFailed = job.status === 'FAILED';
                  return (
                    <tr key={job.id} className="hover:bg-[#111E42]/50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white">{job.job_type}</p>
                        <p className="font-mono text-[10px] text-slate-500">{job.id}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[280px]">
                        <p className="truncate">{job.input_summary}</p>
                        {job.error_summary && (
                          <p className="text-[11px] text-rose-400 font-mono truncate">{job.error_summary}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                            job.status === 'COMPLETED' && 'bg-emerald-950 text-emerald-300 border-emerald-800',
                            job.status === 'PROCESSING' && 'bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse',
                            job.status === 'QUEUED' && 'bg-amber-950 text-amber-300 border-amber-800',
                            job.status === 'FAILED' && 'bg-rose-950 text-rose-300 border-rose-800'
                          )}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {job.progress_percentage}%
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {job.retry_count} / {job.max_retries}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {job.duration_ms ? `${job.duration_ms}ms` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isFailed ? (
                          <button
                            onClick={() => handleRetry(job)}
                            disabled={retryingId === job.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] cursor-pointer"
                          >
                            <RotateCcw className={cn('h-3 w-3', retryingId === job.id && 'animate-spin')} />
                            Retry Job
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
