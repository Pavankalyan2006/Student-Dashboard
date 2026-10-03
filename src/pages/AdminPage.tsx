import * as React from 'react';
import { ShieldCheck, UserCheck, UserX, AlertCircle, RefreshCw, KeyRound, Sliders } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/layout/PageComponents';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { studentsApi } from '../api/students';
import { StudentProfile } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function AdminPage() {
  const { isSuperAdmin } = useAuth();
  const [students, setStudents] = React.useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await studentsApi.getAllStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isSuperAdmin) {
      fetchStudents();
    }
  }, [isSuperAdmin]);

  const handleToggleStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const updated = await studentsApi.updateStatus(studentId, !currentStatus);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? updated : s)));
      toast.success(`Account ${updated.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student status');
    }
  };

  if (!isSuperAdmin) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldCheck className="h-10 w-10 text-rose-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Super Admin Access Required</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            This module is restricted to platform administrators with SUPER_ADMIN privileges.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Super Admin Shell Foundation"
        description="Administrative controls for student provisioning, role management, and platform invariants."
        badge={
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
            SUPER_ADMIN
          </span>
        }
        actions={
          <Button variant="outline" size="sm" onClick={fetchStudents} disabled={isLoading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-medium text-slate-500">Registered Accounts</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{students.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Database verified records</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium text-slate-500">Active Students</div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums mt-1">
            {students.filter((s) => s.is_active).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Allowed workspace login</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-medium text-slate-500">Platform Security Invariants</div>
          <div className="text-2xl font-bold text-blue-600 tabular-nums mt-1">Enforced</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Server-side RBAC &amp; JWT cookies</div>
        </Card>
      </div>

      {/* Student Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Account Directory</CardTitle>
          <CardDescription>
            View student academic branches, semesters, and toggle platform activation status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading student accounts...</div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-50 text-rose-800 text-xs">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Branch &amp; Semester</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{st.name}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{st.email}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {st.branch} · Sem {st.semester}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            st.role === 'SUPER_ADMIN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {st.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            st.is_active ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              st.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {st.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant={st.is_active ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleStatus(st.id, st.is_active)}
                          className="h-7 text-xs"
                        >
                          {st.is_active ? (
                            <>
                              <UserX className="h-3 w-3 mr-1 text-rose-500" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1 text-emerald-500" />
                              Activate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
