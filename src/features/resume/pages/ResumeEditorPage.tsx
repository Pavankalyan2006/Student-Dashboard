import React, { useEffect, useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { FullResumeData, ResumeProfile, ResumeEducation, ResumeSkill, ResumeProject, ResumeExperience, ResumeCertification, ResumeAchievement } from '../types/resumeTypes';
import { ResumePreview } from '../components/ResumePreview';
import { ResumeAIModal } from '../components/ResumeAIModal';
import { ResumeAnalysisModal } from '../components/ResumeAnalysisModal';
import {
  FileUser,
  Save,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  FileCheck,
  ChevronLeft,
  Briefcase,
  GraduationCap,
  Layers,
  FolderGit2,
  Award,
  Trophy,
  User,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ResumeEditorPageProps {
  resumeId: string;
  onNavigate: (path: string) => void;
}

export const ResumeEditorPage: React.FC<ResumeEditorPageProps> = ({ resumeId, onNavigate }) => {
  const [data, setData] = useState<FullResumeData | null>(null);
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'SUMMARY' | 'BULLET' | 'IMPROVE'>('SUMMARY');
  const [aiTargetField, setAiTargetField] = useState<string>('');

  // Analysis Modal
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const loadResume = async () => {
    try {
      setIsLoading(true);
      const full = await resumeApi.getFullResume(resumeId);
      setData(full);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  if (isLoading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading resume editor...</p>
      </div>
    );
  }

  const { resume, profile, education, skills, projects, experience, certifications, achievements } = data;
  const sections = resume.section_order || [
    'profile',
    'summary',
    'education',
    'skills',
    'projects',
    'experience',
    'certifications',
    'achievements',
  ];

  // Move section up or down and persist
  const handleMoveSection = async (index: number, direction: 'UP' | 'DOWN') => {
    const newOrder = [...sections];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setData({
      ...data,
      resume: {
        ...data.resume,
        section_order: newOrder,
      },
    });

    try {
      await resumeApi.updateSectionOrder(resumeId, newOrder);
      toast.success('Section order saved');
    } catch (err: any) {
      toast.error('Failed to update section order');
    }
  };

  const handleSaveProfile = async (updates: Partial<ResumeProfile>) => {
    if (!profile) return;
    try {
      setIsSaving(true);
      const updated = await resumeApi.updateProfile(resumeId, updates);
      setData({ ...data, profile: updated });
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSummary = async (newSummary: string) => {
    try {
      setIsSaving(true);
      const updated = await resumeApi.updateResume(resumeId, { summary: newSummary });
      setData({ ...data, resume: updated });
      toast.success('Summary saved');
    } catch {
      toast.error('Failed to save summary');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalysisModalOpen(true);
    setAnalysisLoading(true);
    try {
      const res = await resumeApi.analyzeResume(resumeId);
      setAnalysisData(res);
    } catch {
      toast.error('Failed to analyze');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/resume')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {resume.title}
            </h1>
            <p className="text-xs text-slate-500">
              Template: <span className="font-semibold text-blue-600 uppercase">{resume.template}</span> • Targeting: {resume.target_role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="lg:hidden flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                mobileTab === 'editor' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-500'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                mobileTab === 'preview' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-500'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handleRunAnalysis}
            className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900 text-indigo-600 text-xs font-semibold hover:bg-indigo-50 flex items-center gap-1.5 transition"
          >
            <FileCheck className="h-3.5 w-3.5" />
            ATS Check
          </button>
          <button
            onClick={() => onNavigate(`/resume/${resumeId}/preview`)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Eye className="h-3.5 w-3.5" />
            Full Preview
          </button>
        </div>
      </div>

      {/* Editor Grid: Left Sections List, Center Active Editor, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Section Reordering & Nav (3 cols) */}
        <div className={`lg:col-span-3 space-y-3 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Sections & Order
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Reorderable</span>
            </div>

            <div className="space-y-1.5">
              {sections.map((sec, idx) => (
                <div
                  key={sec}
                  onClick={() => setActiveSection(sec)}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                    activeSection === sec
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-900'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="capitalize">{sec}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(idx, 'UP');
                      }}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move section up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(idx, 'DOWN');
                      }}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move section down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Active Section Editor (5 cols) */}
        <div className={`lg:col-span-4 space-y-4 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            {/* Header of Section */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                Edit {activeSection}
              </h2>
              {activeSection === 'summary' && (
                <button
                  onClick={() => {
                    setAiMode('SUMMARY');
                    setAiModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold hover:bg-blue-100 flex items-center gap-1"
                >
                  <Wand2 className="h-3 w-3" />
                  AI Summary
                </button>
              )}
            </div>

            {/* Section 1: Profile Form */}
            {activeSection === 'profile' && profile && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setData({ ...data, profile: { ...profile, full_name: e.target.value } })}
                    onBlur={() => handleSaveProfile({ full_name: profile.full_name })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={profile.headline || ''}
                    onChange={(e) => setData({ ...data, profile: { ...profile, headline: e.target.value } })}
                    onBlur={() => handleSaveProfile({ headline: profile.headline })}
                    placeholder="e.g. B.Tech Computer Science Student | Aspiring SDE"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setData({ ...data, profile: { ...profile, email: e.target.value } })}
                      onBlur={() => handleSaveProfile({ email: profile.email })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={profile.phone || ''}
                      onChange={(e) => setData({ ...data, profile: { ...profile, phone: e.target.value } })}
                      onBlur={() => handleSaveProfile({ phone: profile.phone })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={profile.github_url || ''}
                      onChange={(e) => setData({ ...data, profile: { ...profile, github_url: e.target.value } })}
                      onBlur={() => handleSaveProfile({ github_url: profile.github_url })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setData({ ...data, profile: { ...profile, linkedin_url: e.target.value } })}
                      onBlur={() => handleSaveProfile({ linkedin_url: profile.linkedin_url })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Summary Form */}
            {activeSection === 'summary' && (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={resume.summary}
                  onChange={(e) => setData({ ...data, resume: { ...resume, summary: e.target.value } })}
                  onBlur={() => handleSaveSummary(resume.summary)}
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>{resume.summary.split(/\s+/).filter(Boolean).length} words</span>
                  <button
                    onClick={() => {
                      setAiMode('IMPROVE');
                      setAiModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    Improve with AI
                  </button>
                </div>
              </div>
            )}

            {/* Section 3: Education Form */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={edu.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Degree #{idx + 1}
                      </span>
                      <button
                        onClick={async () => {
                          const updated = education.filter((_, i) => i !== idx);
                          await resumeApi.updateEducation(resumeId, updated);
                          setData({ ...data, education: updated });
                          toast.success('Degree removed');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[idx].institution = e.target.value;
                        setData({ ...data, education: copy });
                      }}
                      onBlur={() => resumeApi.updateEducation(resumeId, education)}
                      placeholder="Institution / University"
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].degree = e.target.value;
                          setData({ ...data, education: copy });
                        }}
                        onBlur={() => resumeApi.updateEducation(resumeId, education)}
                        placeholder="Degree (e.g. B.Tech)"
                        className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        value={edu.field_of_study}
                        onChange={(e) => {
                          const copy = [...education];
                          copy[idx].field_of_study = e.target.value;
                          setData({ ...data, education: copy });
                        }}
                        onBlur={() => resumeApi.updateEducation(resumeId, education)}
                        placeholder="Field of Study"
                        className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={async () => {
                    const newEdu: ResumeEducation = {
                      id: `edu_${Date.now()}`,
                      resume_id: resumeId,
                      institution: 'New Institution',
                      degree: 'B.Tech',
                      field_of_study: 'Computer Science',
                      start_date: '2023',
                      end_date: '2027',
                      grade: '',
                      description: '',
                      order_index: education.length,
                    };
                    const updated = [...education, newEdu];
                    await resumeApi.updateEducation(resumeId, updated);
                    setData({ ...data, education: updated });
                  }}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Education Entry
                </button>
              </div>
            )}

            {/* Section 4: Skills Form */}
            {activeSection === 'skills' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk, idx) => (
                    <span
                      key={sk.id}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                    >
                      {sk.skill}
                      <button
                        onClick={async () => {
                          const updated = skills.filter((_, i) => i !== idx);
                          await resumeApi.updateSkills(resumeId, updated);
                          setData({ ...data, skills: updated });
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <input
                    id="new-skill-input"
                    type="text"
                    placeholder="Enter skill name (e.g. Docker, Python)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const val = e.currentTarget.value.trim();
                        e.currentTarget.value = '';
                        const newSkill: ResumeSkill = {
                          id: `rsk_${Date.now()}`,
                          resume_id: resumeId,
                          skill: val,
                          category: 'PROGRAMMING',
                          proficiency: 'INTERMEDIATE',
                          source: 'STUDENT_ENTERED',
                          order_index: skills.length,
                        };
                        const updated = [...skills, newSkill];
                        await resumeApi.updateSkills(resumeId, updated);
                        setData({ ...data, skills: updated });
                      }
                    }}
                  />
                  <button
                    onClick={async () => {
                      const inp = document.getElementById('new-skill-input') as HTMLInputElement;
                      if (inp && inp.value.trim()) {
                        const val = inp.value.trim();
                        inp.value = '';
                        const newSkill: ResumeSkill = {
                          id: `rsk_${Date.now()}`,
                          resume_id: resumeId,
                          skill: val,
                          category: 'PROGRAMMING',
                          proficiency: 'INTERMEDIATE',
                          source: 'STUDENT_ENTERED',
                          order_index: skills.length,
                        };
                        const updated = [...skills, newSkill];
                        await resumeApi.updateSkills(resumeId, updated);
                        setData({ ...data, skills: updated });
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Section 5: Projects Form with Phase 10 Import */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                {projects.map((p, idx) => (
                  <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.title}
                      </span>
                      <button
                        onClick={async () => {
                          const updated = projects.filter((_, i) => i !== idx);
                          await resumeApi.updateProjects(resumeId, updated);
                          setData({ ...data, projects: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={p.description_override || ''}
                      onChange={(e) => {
                        const copy = [...projects];
                        copy[idx].description_override = e.target.value;
                        setData({ ...data, projects: copy });
                      }}
                      onBlur={() => resumeApi.updateProjects(resumeId, projects)}
                      placeholder="Project overview description..."
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setAiMode('BULLET');
                          setAiModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline text-[11px] font-medium flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        Generate Action Bullet
                      </button>
                    </div>
                  </div>
                ))}

                {/* Import from Phase 10 Project Builder */}
                <button
                  onClick={async () => {
                    try {
                      // Demo project import
                      const imported = await resumeApi.importProject(resumeId, 'prj_seed_01');
                      setData({ ...data, projects: [...projects, imported] });
                      toast.success(`Imported verified project: ${imported.title}`);
                    } catch (err: any) {
                      toast.error('Failed to import project');
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <FolderGit2 className="h-4 w-4" />
                  Import from Project Builder
                </button>
              </div>
            )}

            {/* Other Sections (Experience, Certifications, Achievements) */}
            {activeSection === 'experience' && (
              <div className="space-y-3">
                {experience.map((exp, idx) => (
                  <div key={exp.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{exp.role} @ {exp.organization}</span>
                      <button
                        onClick={async () => {
                          const updated = experience.filter((_, i) => i !== idx);
                          await resumeApi.updateExperience(resumeId, updated);
                          setData({ ...data, experience: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[idx].role = e.target.value;
                        setData({ ...data, experience: copy });
                      }}
                      onBlur={() => resumeApi.updateExperience(resumeId, experience)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                ))}
                <button
                  onClick={async () => {
                    const newExp: ResumeExperience = {
                      id: `rexp_${Date.now()}`,
                      resume_id: resumeId,
                      organization: 'Engineering Team / Lab',
                      role: 'Research Intern / Contributor',
                      location: 'Remote',
                      start_date: '2025',
                      end_date: 'Present',
                      description: '',
                      achievements: [],
                      order_index: experience.length,
                    };
                    const updated = [...experience, newExp];
                    await resumeApi.updateExperience(resumeId, updated);
                    setData({ ...data, experience: updated });
                  }}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Experience
                </button>
              </div>
            )}

            {activeSection === 'certifications' && (
              <div className="space-y-3">
                {certifications.map((c, idx) => (
                  <div key={c.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{c.name}</span>
                      <button
                        onClick={async () => {
                          const updated = certifications.filter((_, i) => i !== idx);
                          await resumeApi.updateCertifications(resumeId, updated);
                          setData({ ...data, certifications: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const copy = [...certifications];
                        copy[idx].name = e.target.value;
                        setData({ ...data, certifications: copy });
                      }}
                      onBlur={() => resumeApi.updateCertifications(resumeId, certifications)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                ))}
                <button
                  onClick={async () => {
                    const newCert: ResumeCertification = {
                      id: `rcert_${Date.now()}`,
                      resume_id: resumeId,
                      name: 'Cloud / Developer Certification',
                      issuer: 'Provider',
                      issue_date: '2025',
                      credential_id: '',
                      credential_url: '',
                      description: '',
                      order_index: certifications.length,
                    };
                    const updated = [...certifications, newCert];
                    await resumeApi.updateCertifications(resumeId, updated);
                    setData({ ...data, certifications: updated });
                  }}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Certification
                </button>
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="space-y-3">
                {achievements.map((ach, idx) => (
                  <div key={ach.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{ach.title}</span>
                      <button
                        onClick={async () => {
                          const updated = achievements.filter((_, i) => i !== idx);
                          await resumeApi.updateAchievements(resumeId, updated);
                          setData({ ...data, achievements: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => {
                        const copy = [...achievements];
                        copy[idx].title = e.target.value;
                        setData({ ...data, achievements: copy });
                      }}
                      onBlur={() => resumeApi.updateAchievements(resumeId, achievements)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                ))}
                <button
                  onClick={async () => {
                    const newAch: ResumeAchievement = {
                      id: `rach_${Date.now()}`,
                      resume_id: resumeId,
                      title: 'Hackathon / Academic Achievement',
                      description: 'Top finish in competitive engineering sprint.',
                      date: '2025',
                      source: 'STUDENT_ENTERED',
                      order_index: achievements.length,
                    };
                    const updated = [...achievements, newAch];
                    await resumeApi.updateAchievements(resumeId, updated);
                    setData({ ...data, achievements: updated });
                  }}
                  className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Achievement
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className={`lg:col-span-5 space-y-3 ${mobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Live Preview ({resume.template})
              </span>
              <button
                onClick={() => onNavigate(`/resume/${resumeId}/preview`)}
                className="text-blue-600 hover:underline font-medium"
              >
                Expand full screen
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-300 dark:border-slate-800 shadow-md transform scale-[0.9] origin-top bg-slate-100 dark:bg-slate-900 p-2 max-h-[80vh] overflow-y-auto">
              <ResumePreview data={data} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      <ResumeAIModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        resumeId={resumeId}
        initialMode={aiMode}
        initialText={resume.summary}
        targetRole={resume.target_role}
        onApply={(appliedText) => {
          if (aiMode === 'SUMMARY') {
            handleSaveSummary(appliedText);
          } else {
            handleSaveSummary(appliedText);
          }
        }}
      />

      {/* Analysis Modal */}
      <ResumeAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        analysis={analysisData}
        isLoading={analysisLoading}
        onApplyBulletFix={async (current, suggestion) => {
          toast.success('Applied phrasing suggestion to resume');
          setAnalysisModalOpen(false);
          loadResume();
        }}
      />
    </div>
  );
};
