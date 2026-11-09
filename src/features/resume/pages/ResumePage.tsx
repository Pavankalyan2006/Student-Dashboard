import React, { useEffect, useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { Resume, FullResumeData } from '../types/resumeTypes';
import { ResumeAnalysisModal } from '../components/ResumeAnalysisModal';
import { ResumeTailorModal } from '../components/ResumeTailorModal';
import { ResumeVersionDrawer } from '../components/ResumeVersionDrawer';
import { ResumeTemplateUploadModal } from '../components/ResumeTemplateUploadModal';
import {
  FileUser,
  Plus,
  Edit3,
  Eye,
  FileCheck,
  Target,
  Sparkles,
  Layers,
  GraduationCap,
  FolderGit2,
  Award,
  Briefcase,
  Trophy,
  History,
  CheckCircle2,
  Printer,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumePageProps {
  onNavigate: (path: string) => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({ onNavigate }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResumeData, setActiveResumeData] = useState<FullResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const list = await resumeApi.listResumes();
      setResumes(list);

      if (list.length > 0) {
        const full = await resumeApi.getFullResume(list[0].id);
        setActiveResumeData(full);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = async () => {
    try {
      const created = await resumeApi.createResume({ title: 'New resume' });
      toast.success('New resume draft created');
      onNavigate(`/resume/${created.resume.id}/edit`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create resume');
    }
  };

  const handleRunAnalysis = async () => {
    if (!activeResumeData) return;
    setAnalysisModalOpen(true);
    setAnalysisLoading(true);
    try {
      const result = await resumeApi.analyzeResume(activeResumeData.resume.id);
      setAnalysisData(result);
    } catch (err: any) {
      toast.error(err.message || 'Failed to analyze resume');
    } finally {
      setAnalysisLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your verified resume workspace...</p>
      </div>
    );
  }

  const resume = activeResumeData?.resume;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
              <FileUser className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                My Resume
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Build and maintain a professional resume using your verified education, skills, projects and experience.
              </p>
            </div>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {resume && (
            <>
              <button
                onClick={() => onNavigate(`/resume/${resume.id}/edit`)}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Resume
              </button>
              <button
                onClick={() => onNavigate(`/resume/${resume.id}/preview`)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                onClick={() => onNavigate(`/resume/${resume.id}/preview?print=true`)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <Printer className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                onClick={handleRunAnalysis}
                className="px-3.5 py-2 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5 shadow-xs transition"
              >
                <FileCheck className="h-3.5 w-3.5" />
                Analyze Resume
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-3.5 py-2 rounded-lg border border-purple-200 bg-purple-50/70 text-purple-700 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1.5 shadow-xs transition"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload PDF Template
              </button>
            </>
          )}
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Resume
          </button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-xs">
          <FileUser className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            No Resume Found Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Initialize your resume with your verified student profile, coursework, and Project Builder projects.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Current Resume Card & Completeness Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Resume Info Banner */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {resume?.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                      {resume?.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Targeting: <span className="font-semibold text-slate-800">{resume?.target_role}</span> ({resume?.target_industry})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVersionDrawerOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs transition"
                  >
                    <History className="h-3.5 w-3.5" />
                    Versions
                  </button>
                  <button
                    onClick={() => setTailorModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-semibold hover:bg-indigo-100 flex items-center gap-1 shadow-2xs transition"
                  >
                    <Target className="h-3.5 w-3.5" />
                    Tailor to Job
                  </button>
                </div>
              </div>

              {/* Summary snippet */}
              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                <span className="font-semibold text-slate-900 block mb-1">Summary</span>
                {resume?.summary}
              </div>

              {/* Sections Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 text-center transition">
                  <Layers className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-xl font-bold text-slate-900 block">
                    {activeResumeData?.skills?.length || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Skills Listed</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 text-center transition">
                  <FolderGit2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-xl font-bold text-slate-900 block">
                    {activeResumeData?.projects?.length || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Projects Linked</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 text-center transition">
                  <GraduationCap className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                  <span className="text-xl font-bold text-slate-900 block">
                    {activeResumeData?.education?.length || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Education Entries</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 text-center transition">
                  <Award className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                  <span className="text-xl font-bold text-slate-900 block">
                    {activeResumeData?.certifications?.length || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Certifications</span>
                </div>
              </div>
            </div>

            {/* Resume Completeness Panel */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Resume Completeness
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent checklist of vital components expected by technical recruiters
                  </p>
                </div>
                <span className="text-base font-bold text-blue-600">
                  {activeResumeData?.completeness_score || 0}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${activeResumeData?.completeness_score || 0}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(activeResumeData?.completeness_breakdown || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100/60 transition"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        item.complete ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {item.section} ({item.weight}%)
                      </span>
                      <span className="text-[11px] text-slate-500">{item.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Actions & Templates */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
              <div className="space-y-2">
                {resume && (
                  <>
                    <button
                      onClick={() => onNavigate(`/resume/${resume.id}/edit`)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/20 flex items-center justify-between text-xs font-semibold text-slate-800 group transition shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-blue-600" />
                        Edit Sections
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                    <button
                      onClick={() => onNavigate(`/resume/${resume.id}/tailor`)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/20 flex items-center justify-between text-xs font-semibold text-slate-800 group transition shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-indigo-600" />
                        Tailor to Job Description
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                    <button
                      onClick={handleRunAnalysis}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/20 flex items-center justify-between text-xs font-semibold text-slate-800 group transition shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                        Run ATS Analysis
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                    <button
                      onClick={() => onNavigate(`/career/roadmap`)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/20 flex items-center justify-between text-xs font-semibold text-slate-800 group transition shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-600" />
                        Target Career Roadmap
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="w-full p-2.5 rounded-xl border border-purple-200 hover:border-purple-500 bg-purple-50/60 hover:bg-purple-100/60 flex items-center justify-between text-xs font-semibold text-purple-900 group transition shadow-2xs"
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-purple-600" />
                        Upload Custom PDF Template
                      </span>
                      <ChevronRight className="h-4 w-4 text-purple-500 group-hover:translate-x-0.5 transition" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Template Selector Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Active Template</h3>
                <button
                  onClick={() => onNavigate('/resume/templates')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase flex items-center gap-0.5"
                >
                  {resume?.template === 'CUSTOM_UPLOADED'
                    ? resume.custom_template_config?.template_name || 'CUSTOM'
                    : resume?.template}{' '}
                  • View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {resume?.template === 'CUSTOM_UPLOADED' ? (
                <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      {resume.custom_template_config?.template_name || 'Uploaded PDF Template'}
                    </span>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 hover:underline"
                    >
                      Re-upload
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-purple-700">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                      style={{ backgroundColor: resume.custom_template_config?.styling.accent_color || '#1E40AF' }}
                    />
                    <span className="truncate">
                      From {resume.custom_template_config?.filename} • {resume.custom_template_config?.styling.font_family} typography
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate(`/resume/${resume.id}/preview?print=true`)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Download Uploaded Resume (PDF)
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  All templates maintain strict ATS readability and standard margins.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['TECHNICAL', 'MODERN', 'CLASSIC', 'MINIMAL', 'ACADEMIC'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={async () => {
                      if (!resume) return;
                      await resumeApi.updateResume(resume.id, { template: t });
                      toast.success(`Switched template to ${t}`);
                      loadData();
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left shadow-2xs ${
                      resume?.template === t
                        ? 'border-2 border-blue-600 bg-blue-50/80 text-blue-900'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{t}</div>
                    <div className="text-[9px] text-slate-400 font-normal">
                      {t === 'TECHNICAL'
                        ? 'Code-dense layout'
                        : t === 'MODERN'
                        ? 'Contemporary sans'
                        : t === 'CLASSIC'
                        ? 'Traditional serif'
                        : t === 'MINIMAL'
                        ? 'Scandinavian whitespace'
                        : 'Curricular depth'}
                    </div>
                  </button>
                ))}

                <button
                  onClick={() => setUploadModalOpen(true)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left shadow-2xs ${
                    resume?.template === 'CUSTOM_UPLOADED'
                      ? 'border-2 border-purple-600 bg-purple-50/80 text-purple-900'
                      : 'border-dashed border-purple-300 bg-white hover:bg-purple-50/60 text-purple-700'
                  }`}
                >
                  <div className="text-[11px] font-bold flex items-center gap-1">
                    <Upload className="h-3 w-3 text-purple-600" />
                    <span>Upload PDF</span>
                  </div>
                  <div className="text-[9px] text-purple-500 font-normal">
                    Custom template
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <ResumeAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        analysis={analysisData}
        isLoading={analysisLoading}
      />

      {resume && (
        <>
          <ResumeTailorModal
            isOpen={tailorModalOpen}
            onClose={() => setTailorModalOpen(false)}
            resumeId={resume.id}
          />
          <ResumeVersionDrawer
            isOpen={versionDrawerOpen}
            onClose={() => setVersionDrawerOpen(false)}
            resumeId={resume.id}
            onVersionRestored={loadData}
          />
          <ResumeTemplateUploadModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            resumeId={resume.id}
            onTemplateApplied={(updated) => {
              setActiveResumeData(updated);
              loadData();
            }}
            onNavigate={onNavigate}
          />
        </>
      )}
    </div>
  );
};
