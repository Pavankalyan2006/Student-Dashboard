// src/features/labs/components/LabDashboard.tsx
// Master Lab Assistant Dashboard with real metrics, search/filtering, onboarding empty state, and laboratory cards

import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  UploadCloud,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Cpu,
  Layers,
  ChevronRight,
  FileText,
  Printer,
  Sparkles,
  HelpCircle,
  TrendingUp,
  FolderPlus,
  Trash2,
  Edit,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { LabCourse, StudentLabAnalytics, LabType } from '../types/labAssistantTypes';

interface LabDashboardProps {
  labs: LabCourse[];
  analytics: StudentLabAnalytics;
  onOpenCreateLab: () => void;
  onOpenManualEntry: (lab: LabCourse) => void;
  onOpenUploadManual: (lab: LabCourse) => void;
  onSelectExperiment: (lab: LabCourse, expId: string) => void;
  onOpenReport: (lab: LabCourse, expId: string) => void;
  onDeleteLab: (labId: string) => void;
  onEditLab: (lab: LabCourse) => void;
}

export function LabDashboard({
  labs,
  analytics,
  onOpenCreateLab,
  onOpenManualEntry,
  onOpenUploadManual,
  onSelectExperiment,
  onOpenReport,
  onDeleteLab,
  onEditLab,
}: LabDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [selectedLabType, setSelectedLabType] = useState<LabType | 'ALL'>('ALL');

  // Filtered laboratories
  const filteredLabs = labs.filter((lab) => {
    const nameStr = (lab.name || lab.title || '').toLowerCase();
    const subjectStr = (lab.subject || '').toLowerCase();
    const codeStr = (lab.course_code || '').toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      nameStr.includes(searchLower) ||
      subjectStr.includes(searchLower) ||
      codeStr.includes(searchLower);
    const matchesSem = selectedSemester === 'ALL' || lab.semester === selectedSemester;
    const matchesType = selectedLabType === 'ALL' || (lab.lab_type || 'PROGRAMMING') === selectedLabType;
    return matchesSearch && matchesSem && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 hero-brand rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 backdrop-blur-md border border-white/10">
            <FlaskConical className="w-3.5 h-3.5 text-blue-300" />
            <span>Interactive Practical Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Lab Assistant & Manual Workspace</h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            Process your university laboratory manuals, follow step-by-step practical procedures, execute verified code and SQL sandboxes, record real measurements, practice viva voce, and compile professional records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Button
            onClick={onOpenCreateLab}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md gap-1.5 h-10 px-4"
          >
            <Plus className="w-4 h-4" /> Add New Lab
          </Button>

          {labs.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenManualEntry(labs[0])}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs gap-1.5 h-10 px-4"
              >
                <BookOpen className="w-4 h-4 text-blue-300" /> Enter Manual Details
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenUploadManual(labs[0])}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs gap-1.5 h-10 px-4"
              >
                <UploadCloud className="w-4 h-4 text-indigo-300" /> Upload Lab Manual
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Real Persistent KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-gray-500">Total Laboratories</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900">{analytics.total_labs}</span>
            <span className="text-xs text-blue-600 font-semibold">Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-gray-500">Total Experiments</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900">{analytics.total_experiments}</span>
            <span className="text-xs text-gray-400 font-medium">Syllabus items</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-gray-500">Completed Experiments</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{analytics.completed_experiments}</span>
            <span className="text-xs text-emerald-600 font-semibold">
              {analytics.total_experiments > 0
                ? `${Math.round((analytics.completed_experiments / analytics.total_experiments) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs">
          <span className="text-xs font-medium text-gray-500">Viva Voce Questions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-600">{analytics.total_viva_attempted}</span>
            <span className="text-xs text-gray-400 font-medium">Attempted</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laboratories by name, subject, or course code..."
            aria-label="Search laboratories"
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <select
            aria-label="Filter by semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="min-w-0 flex-1 sm:flex-none px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by lab type"
            value={selectedLabType}
            onChange={(e) => setSelectedLabType(e.target.value as any)}
            className="min-w-0 flex-1 sm:flex-none px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Lab Types</option>
            <option value="PROGRAMMING">Programming</option>
            <option value="DBMS">Database / SQL</option>
            <option value="AI_ML">AI & Machine Learning</option>
            <option value="NETWORKS">Computer Networks</option>
            <option value="OPERATING_SYSTEMS">Operating Systems</option>
            <option value="HARDWARE">Hardware / Electronics</option>
          </select>
        </div>
      </div>

      {/* LABORATORIES LIST & ONBOARDING STATE */}
      {filteredLabs.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <FlaskConical className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              {labs.length === 0 ? 'No Laboratory Courses Yet' : 'No Matching Laboratories Found'}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {labs.length === 0
                ? 'Create your first university laboratory course to start adding manual experiments, running code, and preparing reports.'
                : 'Try adjusting your search query or semester filters.'}
            </p>
          </div>
          {labs.length === 0 && (
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                onClick={onOpenCreateLab}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 h-9 px-4 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Create Your First Lab
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const expCount = lab.experiments?.length || lab.experiments_count || 0;
            const completedCount = lab.completed_experiments_count || 0;
            const inProgressCount = lab.in_progress_experiments_count || 0;
            const progress = expCount > 0 ? Math.round((completedCount / expCount) * 100) : 0;
            const firstExpId = lab.experiments && lab.experiments.length > 0 ? lab.experiments[0].id : null;

            return (
              <div
                key={lab.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Lab Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {lab.lab_type || 'PROGRAMMING'} • Sem {lab.semester || 1}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditLab(lab)}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded"
                        title="Edit Lab"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete laboratory '${lab.name || lab.title}' and all experiments?`)) {
                            onDeleteLab(lab.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Lab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {lab.name || lab.title || 'Laboratory Course'}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {lab.course_code ? `${lab.course_code} • ` : ''}{lab.subject || 'Practical'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                      {lab.department || 'Computer Science & Engineering'}
                    </p>
                  </div>

                  {/* Real Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Progress</span>
                      <span className="font-bold text-gray-900">
                        {completedCount}/{expCount} Done ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lab Card Actions Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenManualEntry(lab)}
                      className="px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100/60 rounded"
                      title="Add or edit experiments manually"
                    >
                      + Manual
                    </button>
                    <button
                      onClick={() => onOpenUploadManual(lab)}
                      className="px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100/60 rounded"
                      title="Upload PDF or DOCX manual"
                    >
                      Upload
                    </button>
                  </div>

                  {firstExpId ? (
                    <Button
                      size="sm"
                      onClick={() => onSelectExperiment(lab, firstExpId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3 gap-1 shadow-xs"
                    >
                      Open Lab <ChevronRight className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onOpenManualEntry(lab)}
                      className="bg-gray-800 hover:bg-gray-900 text-white text-xs h-7 px-3 gap-1"
                    >
                      Add Experiments <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
