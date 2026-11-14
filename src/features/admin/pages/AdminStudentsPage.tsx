import * as React from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Plus,
  Key,
  X,
} from 'lucide-react';
import { adminApi, AdminStudentItem } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminStudentsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [students, setStudents] = React.useState<AdminStudentItem[]>([]);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [branchFilter, setBranchFilter] = React.useState('');

  // Suspension dialog state
  const [selectedStudent, setSelectedStudent] = React.useState<AdminStudentItem | null>(null);
  const [statusAction, setStatusAction] = React.useState<'SUSPEND' | 'REACTIVATE' | null>(null);
  const [statusReason, setStatusReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Create student modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: '',
    email: '',
    password: '',
    branch: 'Computer Science & AI/ML',
    semester: 4,
    role: 'STUDENT' as 'STUDENT' | 'SUPER_ADMIN',
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin/students/create' || window.location.search.includes('create=true')) {
        setIsCreateModalOpen(true);
      }
    }
  }, []);

  const handleGeneratePassword = () => {
    setCreateForm((prev) => ({ ...prev, password: 'StudentPass@2025!' }));
    toast.info('Generated initial temporary password');
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Name, university email, and initial password are required.');
      return;
    }
    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setIsCreating(true);
    try {
      await adminApi.createStudent({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        branch: createForm.branch,
        semester: Number(createForm.semester),
        role: createForm.role,
      });
      toast.success(`Student account created successfully for ${createForm.name}!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        branch: 'Computer Science & AI/ML',
        semester: 4,
        role: 'STUDENT',
      });
      fetchStudents(1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create student account');
    } finally {
      setIsCreating(false);
    }
  };

  const fetchStudents = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getStudents({
        search,
        status: statusFilter,
        branch: branchFilter,
        page,
        limit: 10,
      });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStudents(1);
  }, [statusFilter, branchFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleOpenStatusModal = (student: AdminStudentItem, action: 'SUSPEND' | 'REACTIVATE') => {
    setSelectedStudent(student);
    setStatusAction(action);
    setStatusReason(action === 'REACTIVATE' ? 'Account verified and restored by administrator' : '');
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedStudent || !statusAction) return;
    if (!statusReason.trim()) {
      toast.error('Administrative reason is required for status modifications.');
      return;
    }

    setIsSubmitting(true);
    const newStatus = statusAction === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE';

    try {
      await adminApi.updateStudentStatus(selectedStudent.id, newStatus, statusReason.trim());
      toast.success(`Student account successfully ${statusAction === 'SUSPEND' ? 'suspended' : 'reactivated'}`);
      setSelectedStudent(null);
      setStatusAction(null);
      setStatusReason('');
      fetchStudents(pagination.page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Student Account Administration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage enrolled B.Tech students, audit account states, and handle suspension workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-semibold text-slate-950 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Create Student Account
          </button>

          <button
            onClick={() => fetchStudents(pagination.page)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Refresh Table
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or university email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="PENDING">PENDING</option>
            <option value="DISABLED">DISABLED</option>
          </select>

          {/* Branch filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Branches</option>
            <option value="Computer Science">Computer Science & AI/ML</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics">Electronics & Communication</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-navy-900 border border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 border-b border-navy-700 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Academic Info</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                students.map((std) => {
                  const currentStatus = std.status || (std.is_active ? 'ACTIVE' : 'SUSPENDED');
                  const isSuspended = currentStatus === 'SUSPENDED' || currentStatus === 'DISABLED';
                  return (
                    <tr key={std.id} className="hover:bg-navy-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${std.name}`}
                            alt={std.name}
                            className="h-8 w-8 rounded-full bg-navy-800 border border-navy-600"
                          />
                          <div>
                            <p className="font-semibold text-white">{std.name}</p>
                            <p className="text-slate-400 text-[11px]">{std.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <p className="truncate max-w-[200px]">{std.branch}</p>
                        <p className="text-[10px] text-slate-400">Semester {std.semester}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                            currentStatus === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950/60 text-rose-300 border-rose-800'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              currentStatus === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'
                            )}
                          />
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                            std.role === 'SUPER_ADMIN'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          )}
                        >
                          {std.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(std.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onNavigate(`/admin/students/${std.id}`)}
                            title="View student administrative summary"
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {std.role !== 'SUPER_ADMIN' && (
                            <>
                              {isSuspended ? (
                                <button
                                  onClick={() => handleOpenStatusModal(std, 'REACTIVATE')}
                                  title="Reactivate student account"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenStatusModal(std, 'SUSPEND')}
                                  title="Suspend student account"
                                  className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-medium text-[11px] transition-colors cursor-pointer"
                                >
                                  Suspend
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-navy-700 bg-navy-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages || 1}</strong> ({pagination.total} students)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-navy-700 bg-navy-900 disabled:opacity-40 hover:bg-navy-800 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => fetchStudents(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-navy-700 bg-navy-900 disabled:opacity-40 hover:bg-navy-800 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Reason Dialog */}
      {selectedStudent && statusAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-navy-900 border border-navy-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-3 rounded-xl border',
                  statusAction === 'SUSPEND'
                    ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                )}
              >
                {statusAction === 'SUSPEND' ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {statusAction === 'SUSPEND' ? 'Suspend Student Account' : 'Reactivate Student Account'}
                </h3>
                <p className="text-xs text-slate-400">Student: {selectedStudent.name} ({selectedStudent.email})</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {statusAction === 'SUSPEND'
                ? 'Suspended students will immediately lose access to authenticated API endpoints, AI copilot sessions, and repository tools. All student data is preserved.'
                : 'Reactivating this account will grant the student immediate access back into their learning workspaces and records.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Administrative Audit Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter mandatory reason for this account status change..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setStatusAction(null);
                  setStatusReason('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-medium text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isSubmitting || !statusReason.trim()}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2',
                  statusAction === 'SUSPEND'
                    ? 'bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50'
                )}
              >
                {isSubmitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Student Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-navy-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Student Account</h3>
                  <p className="text-[11px] text-slate-400">Super Admin Authority: Provision a new student identity</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#152349] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  University Email <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul.sharma@btech.edu"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Initial Password <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="h-3 w-3" />
                    Quick Fill Default
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Minimum 8 characters"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Engineering Branch <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={createForm.branch}
                    onChange={(e) => setCreateForm({ ...createForm, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Computer Science & AI/ML">Computer Science & AI/ML</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Current Semester <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={createForm.semester}
                    onChange={(e) => setCreateForm({ ...createForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="STUDENT">STUDENT (Standard Learner)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Administrator)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-700">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-medium text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-semibold text-slate-950 transition-all cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isCreating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
