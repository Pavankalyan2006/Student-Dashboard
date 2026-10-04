// src/features/applications/pages/ApplicationTrackerPage.tsx
// Complete Internship & Application Tracker with Kanban Pipeline, Timeline Milestones, and Job Description Skill Gap Analysis

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

export function ApplicationTrackerPage({ onNavigate }: ApplicationTrackerPageProps) {
  const [applications, setApplications] = React.useState<InternshipApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState<'kanban' | 'list' | 'create'>('kanban');
  const [selectedApp, setSelectedApp] = React.useState<InternshipApplication | null>(null);

  // Form State
  const [companyName, setCompanyName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [location, setLocation] = React.useState('Bengaluru / Remote');
  const [deadline, setDeadline] = React.useState('');
  const [applicationUrl, setApplicationUrl] = React.useState('');
  const [salaryRange, setSalaryRange] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [jobDescription, setJobDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningModulesApi.applications.getApplications();
      setApplications(data);
      if (data.length > 0 && !selectedApp) {
        setSelectedApp(data[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load applications: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedApp]);

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

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Internship / Application Tracker" description="Loading recruiting pipeline..." />
        <LoadingState message="InternshipTrackerAgent syncing deadlines and interview rounds..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Internship & Application Tracker"
        description="Track internships, campus placements, OA assessments, and technical interview stages with JD skill-gap analysis."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            InternshipTrackerAgent Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
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

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Total Applied</p>
            <h3 className="text-2xl font-bold text-[#101828] mt-1">{applications.length}</h3>
            <p className="text-xs text-blue-600 mt-0.5">Active candidates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Interviews Scheduled</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">
              {applications.filter((a) => a.status === 'INTERVIEW').length}
            </h3>
            <p className="text-xs text-[#475467] mt-0.5">Technical & HR rounds</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Offers Received</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {applications.filter((a) => a.status === 'OFFER' || a.status === 'ACCEPTED').length}
            </h3>
            <p className="text-xs text-emerald-600 mt-0.5">Verified offers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Next Deadline</p>
            <h3 className="text-sm font-bold text-[#101828] mt-1 truncate">
              {applications[0]?.deadline || 'None pending'}
            </h3>
            <p className="text-xs text-amber-600 mt-0.5">{applications[0]?.company_name || 'All clear'}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Kanban Pipeline View */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col);
            return (
              <div key={col} className="p-3 bg-gray-50/70 rounded-xl border border-gray-200 min-w-[200px] space-y-3">
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
                      className="p-3.5 bg-white rounded-xl border border-[#E4E7EC] hover:border-blue-400 shadow-sm cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#101828]">{app.company_name}</span>
                        {app.deadline && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            {app.deadline}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#475467] font-medium">{app.role}</p>
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
                          {STATUS_COLUMNS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
              </p>
            </div>
            {selectedApp.application_url && (
              <a
                href={selectedApp.application_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                Job Posting <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
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

          {/* Timeline Milestones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#344054] uppercase tracking-wider">Application Timeline</h4>
            <div className="space-y-2">
              {selectedApp.timeline?.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#101828]">{event.title}</span>
                    {event.notes && <p className="text-gray-500 text-[11px] mt-0.5">{event.notes}</p>}
                  </div>
                  <span className="text-gray-400 font-medium">{event.date}</span>
                </div>
              ))}
            </div>
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
                <label className="block text-xs font-semibold text-[#344054] mb-1">Company Name</label>
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
                <label className="block text-xs font-semibold text-[#344054] mb-1">Job Role</label>
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
    </PageContainer>
  );
}
