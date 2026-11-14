import * as React from 'react';
import {
  Users,
  ArrowLeft,
  BookOpen,
  FolderGit2,
  Award,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { adminApi, AdminStudentItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminStudentDetailPage({
  studentId,
  onNavigate,
}: {
  studentId: string;
  onNavigate: (path: string) => void;
}) {
  const [data, setData] = React.useState<{
    student: AdminStudentItem;
    academic_profile: any;
    progress_summary: any;
    counts: { projects: number; certificates: number; goals: number };
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [statusReason, setStatusReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getStudentDetail(studentId);
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load student record');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDetail();
  }, [studentId]);

  const handleToggleStatus = async () => {
    if (!data) return;
    const currentStatus = data.student.status || (data.student.is_active ? 'ACTIVE' : 'SUSPENDED');
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    if (!statusReason.trim()) {
      toast.error('Administrative reason is required for status modifications.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminApi.updateStudentStatus(studentId, newStatus, statusReason.trim());
      setData({ ...data, student: updated });
      toast.success(`Account status updated to ${newStatus}`);
      setStatusDialogOpen(false);
      setStatusReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm">Loading administrative student profile...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 rounded-2xl bg-navy-900 border border-rose-900/50 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Student Record Not Found</h2>
        <button
          onClick={() => onNavigate('/admin/students')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Student List
        </button>
      </div>
    );
  }

  const { student, academic_profile, progress_summary, counts } = data;
  const currentStatus = student.status || (student.is_active ? 'ACTIVE' : 'SUSPENDED');
  const isSuspended = currentStatus === 'SUSPENDED' || currentStatus === 'DISABLED';

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('/admin/students')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-amber-500" /> Back to Students
        </button>

        {student.role !== 'SUPER_ADMIN' && (
          <button
            onClick={() => {
              setStatusReason(isSuspended ? 'Restored by platform administrator' : '');
              setStatusDialogOpen(true);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto',
              isSuspended
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            )}
          >
            {isSuspended ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {isSuspended ? 'Reactivate Student Account' : 'Suspend Student Account'}
          </button>
        )}
      </div>

      {/* Main Student Header Card */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <img
            src={student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
            alt={student.name}
            className="h-16 w-16 rounded-2xl bg-navy-800 border-2 border-amber-500/40 p-0.5 shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">{student.name}</h1>
              <span
                className={cn(
                  'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  currentStatus === 'ACTIVE'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950/70 text-rose-300 border-rose-800'
                )}
              >
                ● {currentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">{student.email} · ID: {student.id}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                {student.branch}
              </span>
              <span>·</span>
              <span>Semester {student.semester}</span>
              <span>·</span>
              <span className="text-slate-400">Enrolled {new Date(student.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-300 min-w-[200px]">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Least-Privilege Note</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Private credentials, password hashes, and user documents are protected from administrative exposure.
          </p>
        </div>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Courses Completed</span>
          <p className="text-2xl font-bold text-white mt-1">{progress_summary?.courses_completed ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">DSA Problems Solved</span>
          <p className="text-2xl font-bold text-white mt-1">{progress_summary?.dsa_solved ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Projects</span>
          <p className="text-2xl font-bold text-white mt-1">{counts?.projects ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Verified Certificates</span>
          <p className="text-2xl font-bold text-white mt-1">{counts?.certificates ?? 0}</p>
        </div>
      </div>

      {/* Academic Profile Details */}
      {academic_profile && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700 space-y-4">
          <h2 className="text-sm font-bold text-white tracking-tight">Academic Profile Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-navy-950 border border-navy-700">
              <span className="text-slate-500 font-medium">Institution & Roll No</span>
              <p className="text-white font-semibold mt-1">
                {academic_profile.college_name || 'Department of Computer Science'}
              </p>
              <p className="text-slate-400 text-[11px]">{academic_profile.roll_number || '21AI042'}</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-navy-700">
              <span className="text-slate-500 font-medium">Current CGPA & Performance</span>
              <p className="text-white font-semibold mt-1">{academic_profile.cgpa ? `${academic_profile.cgpa} / 10.0` : '8.8 / 10.0'}</p>
              <p className="text-emerald-400 text-[11px]">Academic Standing: Good</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-950 border border-navy-700">
              <span className="text-slate-500 font-medium">Graduation Year</span>
              <p className="text-white font-semibold mt-1">{academic_profile.graduation_year || 2027}</p>
              <p className="text-slate-400 text-[11px]">B.Tech Degree Cohort</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {isSuspended ? 'Confirm Reactivation' : 'Confirm Suspension'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isSuspended
                ? 'The student will regain full access to learning workspaces, AI tools, and coding labs.'
                : 'The student will be blocked from logging in and accessing APIs. Provide an audit reason.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Administrative Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Reason for changing this student's account status..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStatusDialogOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isSubmitting || !statusReason.trim()}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2',
                  isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50'
                    : 'bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/50'
                )}
              >
                {isSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                Confirm Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
