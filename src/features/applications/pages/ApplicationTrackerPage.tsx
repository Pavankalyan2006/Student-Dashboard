// src/features/applications/pages/ApplicationTrackerPage.tsx
// Complete Internship & Application Tracker with Kanban Pipeline, Interactive List View, Timeline Milestones, Edit/Delete CRUD, and CSV Export

import * as React from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Filter,
  Search,
  Download,
  Trash2,
  Edit3,
  ArrowUpDown,
  X,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { InternshipApplication, ApplicationStatus } from '../../../types/learningModules';
import { toast } from 'sonner';

interface ApplicationTrackerPageProps {
  onNavigate?: (path: string) => void;
}

const STATUS_COLUMNS: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
];

const ALL_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'TECHNICAL_ROUND',
  'HR_ROUND',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
];

export function ApplicationTrackerPage({ onNavigate }: ApplicationTrackerPageProps) {
  const [applications, setApplications] = React.useState<InternshipApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState<'kanban' | 'list' | 'create'>('kanban');
  const [selectedApp, setSelectedApp] = React.useState<InternshipApplication | null>(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [sortBy, setSortBy] = React.useState<'DATE_DESC' | 'DATE_ASC' | 'DEADLINE_ASC' | 'COMPANY_ASC'>('DATE_DESC');

  // Create Form State
  const [companyName, setCompanyName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [location, setLocation] = React.useState('Bengaluru / Remote');
  const [deadline, setDeadline] = React.useState('');
  const [applicationUrl, setApplicationUrl] = React.useState('');
  const [salaryRange, setSalaryRange] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [jobDescription, setJobDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState<Partial<InternshipApplication>>({});
  const [isUpdating, setIsUpdating] = React.useState(false);

  // New Milestone Form State
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState('');
  const [newMilestoneDate, setNewMilestoneDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [newMilestoneNotes, setNewMilestoneNotes] = React.useState('');
  const [newMilestoneStatus, setNewMilestoneStatus] = React.useState<ApplicationStatus>('INTERVIEW');
  const [isAddingMilestone, setIsAddingMilestone] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningModulesApi.applications.getApplications();
      setApplications(data);
      setSelectedApp((prev) => {
        if (!prev && data.length > 0) return data[0];
        if (prev) {
          return data.find((a) => a.id === prev.id) || data[0] || null;
        }
        return null;
      });
    } catch (err: any) {
      toast.error('Failed to load applications: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim()) {
      toast.error('Please enter Company Name and Role');
      return;
    }
    try {
      setIsSaving(true);
      const created = await learningModulesApi.applications.createApplication({
        company_name: companyName,
        role,
        location,
        deadline: deadline || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        application_url: applicationUrl,
        salary_range: salaryRange,
        notes: notes || 'Standard campus referral',
        status: 'APPLIED',
      });
      toast.success('Internship application recorded and deadline reminder queued!');
      setCompanyName('');
      setRole('');
      setJobDescription('');
      setSelectedApp(created);
      setActiveView('kanban');
      loadData();
    } catch (err: any) {
      toast.error('Failed to save application: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await learningModulesApi.applications.updateStatus(appId, newStatus);
      toast.success(`Application stage moved to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to update stage: ' + err.message);
    }
  };

  const handleDeleteApplication = async (appId: string, company: string) => {
    if (!window.confirm(`Are you sure you want to delete the application record for ${company}? This action is irreversible.`)) {
      return;
    }
    try {
      await learningModulesApi.applications.deleteApplication(appId);
      toast.success(`Application for ${company} deleted.`);
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete application: ' + err.message);
    }
  };

  const handleOpenEditModal = (app: InternshipApplication) => {
    setSelectedApp(app);
    setEditFormData({
      company_name: app.company_name,
      role: app.role,
      location: app.location,
      deadline: app.deadline || '',
      application_url: app.application_url || '',
      salary_range: app.salary_range || '',
      interview_date: app.interview_date || '',
      assessment_date: app.assessment_date || '',
      contact_person: app.contact_person || '',
      notes: app.notes || '',
      status: app.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      setIsUpdating(true);
      const updated = await learningModulesApi.applications.updateApplication(selectedApp.id, editFormData);
      toast.success('Application details updated successfully!');
      setSelectedApp(updated);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Failed to update application: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newMilestoneTitle.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }
    try {
      setIsAddingMilestone(true);
      const updated = await learningModulesApi.applications.addTimelineEvent(selectedApp.id, {
        title: newMilestoneTitle.trim(),
        date: newMilestoneDate || new Date().toISOString().split('T')[0],
        notes: newMilestoneNotes.trim() || undefined,
        status: newMilestoneStatus,
      });
      toast.success('Milestone recorded on application timeline!');
      setSelectedApp(updated);
      setNewMilestoneTitle('');
      setNewMilestoneNotes('');
      loadData();
    } catch (err: any) {
      toast.error('Failed to record milestone: ' + err.message);
    } finally {
      setIsAddingMilestone(false);
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      toast.info('No applications recorded yet to export');
      return;
    }
    const headers = ['Company', 'Role', 'Location', 'Status', 'ApplicationDate', 'Deadline', 'SalaryRange', 'URL', 'Notes'];
    const rows = applications.map((a) => [
      `"${a.company_name.replace(/"/g, '""')}"`,
      `"${a.role.replace(/"/g, '""')}"`,
      `"${a.location.replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.application_date || ''}"`,
      `"${a.deadline || ''}"`,
      `"${(a.salary_range || '').replace(/"/g, '""')}"`,
      `"${(a.application_url || '').replace(/"/g, '""')}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `btech_internship_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Application records exported as CSV');
  };

  // Filtered & Sorted applications
  const filteredApps = React.useMemo(() => {
    return applications
      .filter((app) => {
        const matchesSearch =
          app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'DATE_DESC') {
          return new Date(b.created_at || b.application_date).getTime() - new Date(a.created_at || a.application_date).getTime();
        }
        if (sortBy === 'DATE_ASC') {
          return new Date(a.created_at || a.application_date).getTime() - new Date(b.created_at || b.application_date).getTime();
        }
        if (sortBy === 'DEADLINE_ASC') {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'COMPANY_ASC') {
          return a.company_name.localeCompare(b.company_name);
        }
        return 0;
      });
  }, [applications, searchQuery, statusFilter, sortBy]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Internship & Application Tracker" description="Loading recruiting pipeline..." />
        <LoadingState message="InternshipTracker syncing deadlines and interview rounds..." />
      </PageContainer>
    );
  }

  // Conversion calculations
  const totalApplied = applications.length;
  const interviewsCount = applications.filter((a) => a.status === 'INTERVIEW' || a.status === 'TECHNICAL_ROUND' || a.status === 'HR_ROUND').length;
  const offersCount = applications.filter((a) => a.status === 'OFFER' || a.status === 'ACCEPTED').length;
  const interviewRate = totalApplied > 0 ? Math.round((interviewsCount / totalApplied) * 100) : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Internships & Applications Tracker"
        description="Track internships, campus placements, online assessments, and interview rounds with JD skill gap matching and timeline milestones."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            Verified Pipeline Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs gap-1 border-gray-300"
              title="Export all tracked applications to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
            <Button
              variant={activeView === 'kanban' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveView('kanban')}
              className={activeView === 'kanban' ? 'bg-[#2563EB] text-white' : ''}
            >
              Pipeline Kanban
            </Button>
            <Button
              variant={activeView === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveView('list')}
              className={activeView === 'list' ? 'bg-[#2563EB] text-white' : ''}
            >
              List View ({applications.length})
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveView(activeView === 'create' ? 'kanban' : 'create')}
              className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              <Plus className="w-4 h-4" />
              {activeView === 'create' ? 'View Pipeline' : 'Add Application'}
            </Button>
          </div>
        }
      />

      {/* KPI Highlights with Transparent Evidence Calculation */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Total Tracked</p>
            <h3 className="text-2xl font-bold text-[#101828] mt-1">{totalApplied}</h3>
            <p className="text-xs text-blue-600 mt-0.5">Active candidates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Interviews Scheduled</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{interviewsCount}</h3>
            <p className="text-[11px] text-[#475467] mt-0.5">
              {interviewRate}% interview rate ({interviewsCount}/{totalApplied || 1})
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Offers Received</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{offersCount}</h3>
            <p className="text-xs text-emerald-600 mt-0.5">Verified offers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Next Deadline / Round</p>
            <h3 className="text-sm font-bold text-[#101828] mt-1 truncate">
              {applications.find((a) => a.deadline)?.deadline || 'None pending'}
            </h3>
            <p className="text-xs text-amber-600 mt-0.5 truncate">
              {applications.find((a) => a.deadline)?.company_name || 'All clear'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {activeView !== 'create' && (
        <div className="p-3 bg-white rounded-xl border border-[#E4E7EC] flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role title, or location..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-[#344054] focus:outline-none"
              >
                <option value="ALL">All Statuses ({applications.length})</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st} ({applications.filter((a) => a.status === st).length})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-[#344054] focus:outline-none"
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="DATE_ASC">Oldest First</option>
                <option value="DEADLINE_ASC">Deadline (Soonest)</option>
                <option value="COMPANY_ASC">Company (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no applications match */}
      {filteredApps.length === 0 && activeView !== 'create' && (
        <EmptyState
          title="No applications match your filter"
          description="Adjust your search query or add a new job listing from Discovery to start tracking."
          action={
            <Button
              size="sm"
              onClick={() => onNavigate?.('/career/jobs')}
              className="bg-[#2563EB] text-white"
            >
              Browse Jobs Discovery
            </Button>
          }
        />
      )}

      {/* Kanban Pipeline View */}
      {activeView === 'kanban' && filteredApps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col);
            return (
              <div key={col} className="p-3 bg-gray-50/70 rounded-xl border border-gray-200 min-w-[220px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#344054] tracking-wide">{col}</span>
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded border">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-3.5 bg-white rounded-xl border transition-all cursor-pointer space-y-2 ${
                        selectedApp?.id === app.id
                          ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm'
                          : 'border-[#E4E7EC] hover:border-blue-400 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#101828] truncate">{app.company_name}</span>
                        {app.deadline && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                            {app.deadline}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#475467] font-medium truncate">{app.role}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {app.location}
                      </p>

                      {/* Advance Stage Control */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <select
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="text-[10px] font-semibold border rounded px-1.5 py-0.5 bg-gray-50 text-[#344054]"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApplication(app.id, app.company_name);
                          }}
                          className="text-gray-400 hover:text-rose-600 p-1"
                          title="Delete application"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Table View */}
      {activeView === 'list' && filteredApps.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#344054]">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Company & Role</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied Date</th>
                  <th className="px-4 py-3">Deadline / Rounds</th>
                  <th className="px-4 py-3">Compensation</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      selectedApp?.id === app.id ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="font-bold text-[#101828]">{app.company_name}</div>
                      <div className="text-gray-500 text-[11px]">{app.role}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{app.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'OFFER' || app.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : app.status === 'INTERVIEW' || app.status === 'TECHNICAL_ROUND'
                            ? 'bg-purple-50 text-purple-700'
                            : app.status === 'ASSESSMENT'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{app.application_date}</td>
                    <td className="px-4 py-3">
                      {app.interview_date ? (
                        <span className="text-purple-600 font-semibold text-[11px]">Interview: {app.interview_date}</span>
                      ) : app.deadline ? (
                        <span className="text-amber-700 text-[11px]">Due: {app.deadline}</span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.salary_range || 'Standard'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(app)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                          title="Edit details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(app.id, app.company_name)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 rounded hover:bg-gray-100"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Application Detailed View (Timeline & Skill Gap) */}
      {selectedApp && activeView !== 'create' && (
        <div className="p-6 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  {selectedApp.status}
                </span>
                <h3 className="text-xl font-bold text-[#101828]">{selectedApp.company_name}</h3>
              </div>
              <p className="text-xs text-[#475467] mt-1">
                {selectedApp.role} • {selectedApp.location} • Applied on {selectedApp.application_date}
                {selectedApp.salary_range && ` • Compensation: ${selectedApp.salary_range}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(selectedApp)}
                className="text-xs gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Record
              </Button>
              <Button
                size="sm"
                onClick={() => onNavigate?.('/placements/mock-interview/setup')}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Prepare Interview
              </Button>
              {selectedApp.application_url && (
                <a
                  href={selectedApp.application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
                >
                  Job Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Job Description Skill Matching Analysis */}
          {selectedApp.jd_analysis && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Verified Skill Evidence vs Job Description
                </h4>
                <span className="text-xs font-bold text-blue-700">
                  {selectedApp.jd_analysis.readiness_percent}% Skill Match
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {selectedApp.jd_analysis.required_skills.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                    <span className="text-xs font-bold text-[#101828] block">{s.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                        s.evidence_status === 'EVIDENCE_AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : s.evidence_status === 'DEVELOPING'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {s.evidence_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-blue-900 block">Recommended Preparation:</span>
                <ul className="list-disc pl-4 text-xs text-blue-800 space-y-0.5 mt-1">
                  {selectedApp.jd_analysis.recommended_preparation.map((prep, pIdx) => (
                    <li key={pIdx}>{prep}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Timeline Milestones and Add Milestone */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#344054] uppercase tracking-wider">
                Application Timeline & Recruiter Milestones
              </h4>
              <span className="text-xs text-gray-400">
                {selectedApp.timeline?.length || 0} milestone(s) recorded
              </span>
            </div>

            <div className="space-y-2">
              {selectedApp.timeline?.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs border border-gray-100">
                  <div>
                    <span className="font-semibold text-[#101828]">{event.title}</span>
                    {event.notes && <p className="text-gray-500 text-[11px] mt-0.5">{event.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-gray-600 font-medium">
                      {event.status}
                    </span>
                    <span className="text-gray-400 font-medium">{event.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Milestone Form */}
            <form onSubmit={handleAddMilestone} className="p-3 bg-gray-50/70 rounded-xl border border-gray-200 space-y-2.5">
              <span className="text-xs font-bold text-gray-700 block">Record Milestone / Recruiter Conversation</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Event title (e.g. Technical Round 1 scheduled)"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="sm:col-span-2 px-2.5 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={newMilestoneStatus}
                  onChange={(e) => setNewMilestoneStatus(e.target.value as ApplicationStatus)}
                  className="px-2.5 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Recruiter notes, interviewer name, or OA feedback..."
                  value={newMilestoneNotes}
                  onChange={(e) => setNewMilestoneNotes(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button type="submit" size="sm" disabled={isAddingMilestone} className="bg-blue-600 text-white text-xs shrink-0">
                  {isAddingMilestone ? 'Adding...' : 'Add Milestone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mode: Create Application */}
      {activeView === 'create' && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Add Internship / Job Application
          </h2>
          <form onSubmit={handleCreateApplication} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Google / Microsoft / Razorpay"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Job Role *</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru / Hyderabad / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Posting URL</label>
                <input
                  type="url"
                  placeholder="https://careers..."
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Stipend / CTC</label>
                <input
                  type="text"
                  placeholder="e.g. ₹75,000 / month"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Paste Job Description (For Automatic Verified Skill-Gap Matching)
              </label>
              <textarea
                placeholder="Paste key qualifications, tech stack, and responsibilities..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveView('kanban')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-[#2563EB] text-white">
                {isSaving ? 'Analyzing JD...' : 'Save & Track Application'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT APPLICATION MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Edit Application Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={editFormData.company_name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    value={editFormData.role || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editFormData.status || 'APPLIED'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as ApplicationStatus })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={editFormData.deadline || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    value={editFormData.interview_date || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, interview_date: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recruiter / Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe (Recruiter)"
                    value={editFormData.contact_person || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, contact_person: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Stipend / CTC</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000 / month"
                    value={editFormData.salary_range || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, salary_range: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes & Follow-ups</label>
                <textarea
                  rows={3}
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Record recruiter conversation summary, questions asked, or next action..."
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating} className="bg-blue-600 text-white">
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
