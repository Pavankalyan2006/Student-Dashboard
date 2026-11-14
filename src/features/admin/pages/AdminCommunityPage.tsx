import * as React from 'react';
import {
  MessageSquareWarning,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { adminApi } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminCommunityPage() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedReport, setSelectedReport] = React.useState<any | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<'REVIEWING' | 'RESOLVED' | 'DISMISSED' | null>(null);
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getCommunityReports();
      setReports(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch community moderation reports');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const handleActionClick = (report: any, action: 'REVIEWING' | 'RESOLVED' | 'DISMISSED') => {
    setSelectedReport(report);
    setTargetStatus(action);
    setNotes(action === 'DISMISSED' ? 'Content evaluated and deemed non-violating.' : 'Action taken by moderator.');
  };

  const handleConfirmAction = async () => {
    if (!selectedReport || !targetStatus) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateCommunityReport(selectedReport.id, targetStatus, notes);
      toast.success(`Report ${selectedReport.id} marked as ${targetStatus}`);
      setSelectedReport(null);
      setTargetStatus(null);
      setNotes('');
      fetchReports();
    } catch (err: any) {
      toast.error(err.message || 'Failed to moderate report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Community Content Moderation & Abuse Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review reported forum questions, project showcases, and student discussions to uphold academic integrity.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh Reports
        </button>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl bg-navy-900 border border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 border-b border-navy-700 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Reason & Target</th>
                <th className="py-3 px-4">Report Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No community moderation reports currently pending.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-navy-800/50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-300 block">{rep.reason}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rep.target_type}: {rep.target_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[280px]">
                      <p className="truncate">{rep.description}</p>
                      {rep.moderation_notes && (
                        <p className="text-[10px] text-slate-500 mt-0.5 italic">Note: {rep.moderation_notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                          (rep.status === 'PENDING' || rep.status === 'OPEN') && 'bg-amber-950 text-amber-300 border-amber-800',
                          rep.status === 'REVIEWING' && 'bg-indigo-950 text-indigo-300 border-indigo-800 animate-pulse',
                          rep.status === 'RESOLVED' && 'bg-emerald-950 text-emerald-300 border-emerald-800',
                          rep.status === 'DISMISSED' && 'bg-slate-800 text-slate-400 border-slate-700'
                        )}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{rep.reporter_id}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(rep.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleActionClick(rep, 'REVIEWING')}
                          title="Mark Reviewing"
                          className="px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 text-[10px] font-semibold cursor-pointer"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleActionClick(rep, 'RESOLVED')}
                          title="Resolve Violation"
                          className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-semibold cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleActionClick(rep, 'DISMISSED')}
                          title="Dismiss Report"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-semibold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Dialog */}
      {selectedReport && targetStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Moderate Report ({targetStatus})</h3>
            <p className="text-xs text-slate-300">
              Target: <strong className="text-white">{selectedReport.target_type} {selectedReport.target_id}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Moderation Audit Note</label>
              <textarea
                rows={3}
                placeholder="Reason or actions taken regarding this content report..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedReport(null);
                  setTargetStatus(null);
                  setNotes('');
                }}
                className="px-4 py-2 rounded-xl bg-navy-800 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                {isSubmitting ? 'Updating...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
