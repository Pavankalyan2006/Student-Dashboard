// src/features/mock-interviews/components/MockInterviewSetupModal.tsx
// Comprehensive Guided Interview Configuration Modal

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Play,
  Briefcase,
  Layers,
  Code2,
  Clock,
  HelpCircle,
  FileText,
  Sliders,
  Building2,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  MockInterviewCategory,
  InterviewDifficulty,
  ExperienceLevel,
  InterviewStyle,
  FeedbackMode,
  CategoryMetadata,
  TargetRoleMetadata,
} from '../types/mockInterviewTypes';
import { mockInterviewApi } from '../api/mockInterviewApi';
import { apiClient } from '../../../api/client';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (sessionId: string) => void;
  preselectedCategory?: MockInterviewCategory;
  preselectedRole?: string;
}

export const MockInterviewSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStartSession,
  preselectedCategory,
  preselectedRole,
}) => {
  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [roles, setRoles] = useState<TargetRoleMetadata[]>([]);
  const [studentResumes, setStudentResumes] = useState<any[]>([]);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<MockInterviewCategory>(
    preselectedCategory || 'TECHNICAL'
  );
  const [targetRole, setTargetRole] = useState(preselectedRole || 'Software Development Engineer');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('INTERMEDIATE');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('STUDENT');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [maxQuestions, setMaxQuestions] = useState(4);
  const [progLanguage, setProgLanguage] = useState('python');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [interviewStyle, setInterviewStyle] = useState<InterviewStyle>('FRIENDLY');
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>('COMPREHENSIVE');
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (preselectedCategory) setSelectedCategory(preselectedCategory);
    if (preselectedRole) setTargetRole(preselectedRole);
  }, [preselectedCategory, preselectedRole]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, rls] = await Promise.all([
          mockInterviewApi.getCategories(),
          mockInterviewApi.getTargetRoles(),
        ]);
        setCategories(cats || []);
        setRoles(rls || []);

        // Load student resumes if available
        try {
          const res = await apiClient.get('/resumes');
          const data = (res as any)?.data || res || [];
          if (Array.isArray(data)) {
            setStudentResumes(data);
            if (data.length > 0) setSelectedResumeId(data[0].id);
          }
        } catch {
          // Soft fail for resumes
        }
      } catch (err) {
        console.error('Failed to load interview setup metadata', err);
      }
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const finalRole = targetRole === 'CUSTOM' ? (customRole.trim() || 'Software Engineer') : targetRole;
      const res = await mockInterviewApi.createSession({
        category: selectedCategory,
        target_role: finalRole,
        difficulty,
        experience_level: experienceLevel,
        duration_minutes: durationMinutes,
        max_questions: maxQuestions,
        programming_language: progLanguage,
        target_company: targetCompany.trim() || undefined,
        job_description: jobDescription.trim() || undefined,
        resume_id: selectedResumeId || undefined,
        interview_style: interviewStyle,
        feedback_mode: feedbackMode,
      });

      // Start the created session
      await mockInterviewApi.startSession(res.session.id);
      toast.success(`Started ${selectedCategory} Mock Interview for ${finalRole}!`);
      onClose();
      onStartSession(res.session.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize mock interview');
    } finally {
      setIsLaunching(false);
    }
  };

  const activeCategoryMeta = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
                <Sparkles className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Configure AI Mock Interview</h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  Realistic simulation with grounded follow-ups, code/SQL sandbox execution, and multi-rubric scoring.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2 mt-6 text-xs">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                step === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              1. Category & Role
            </button>
            <span className="text-slate-500">/</span>
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                step === 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              2. Round Parameters
            </button>
            <span className="text-slate-500">/</span>
            <button
              onClick={() => setStep(3)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                step === 3 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              3. Summary & Launch
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* STEP 1: Category & Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Select Interview Category (12 Supported Tracks)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setDurationMinutes(cat.defaultDuration);
                        setMaxQuestions(cat.defaultQuestions);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        selectedCategory === cat.id
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{cat.title}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {cat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{cat.shortDesc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Target Engineering Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setTargetRole(r.title)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition ${
                        targetRole === r.title
                          ? 'border-blue-600 bg-blue-600 text-white font-semibold shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTargetRole('CUSTOM')}
                    className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition ${
                      targetRole === 'CUSTOM'
                        ? 'border-blue-600 bg-blue-600 text-white font-semibold shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    + Custom Role
                  </button>
                </div>
                {targetRole === 'CUSTOM' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="e.g. Distributed Systems Engineer / React Native Dev"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Parameters */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Interview Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="BEGINNER">Beginner (Foundational definitions & simple logic)</option>
                    <option value="INTERMEDIATE">Intermediate (Production trade-offs & optimal Big-O)</option>
                    <option value="ADVANCED">Advanced (High-scale concurrency, SPoFs & deep internals)</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Candidate Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="STUDENT">B.Tech Student (Pre-final year)</option>
                    <option value="INTERNSHIP_CANDIDATE">Internship Candidate</option>
                    <option value="FRESHER">Graduate / Fresher</option>
                    <option value="EXPERIENCED">Experienced Candidate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Interview Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={15}>15 Minutes (Express Sprint)</option>
                    <option value={30}>30 Minutes (Standard Round)</option>
                    <option value={45}>45 Minutes (Deep Technical)</option>
                    <option value={60}>60 Minutes (Full Simulation)</option>
                  </select>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Questions Count
                  </label>
                  <select
                    value={maxQuestions}
                    onChange={(e) => setMaxQuestions(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={2}>2 Questions (Quick checkpoint)</option>
                    <option value={3}>3 Questions</option>
                    <option value={4}>4 Questions (Balanced)</option>
                    <option value={5}>5 Questions</option>
                    <option value={6}>6 Questions</option>
                    <option value={8}>8 Questions (Comprehensive)</option>
                  </select>
                </div>

                {/* Programming Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={progLanguage}
                    onChange={(e) => setProgLanguage(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="python">Python 3.11</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java 21</option>
                    <option value="cpp">C++ 20</option>
                    <option value="go">Go 1.22</option>
                    <option value="sql">PostgreSQL / SQL</option>
                  </select>
                </div>
              </div>

              {/* Optional Company & Resume */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Optional Grounding Context
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Company (Practice Preparation)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Microsoft, Amazon, TCS Digital"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-600 mt-1">
                      Used for company-style topic orientation; not an official employer interview.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Built Resume (Resume Builder)
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- No specific resume attached --</option>
                      {studentResumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title || 'Untitled resume'}{typeof r.ats_score === 'number' ? ` (ATS check: ${r.ats_score}%)` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-600 mt-1">
                      Questions will probe your verified projects, tools, and technical decisions.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Description Snippet (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Paste key responsibilities or required technologies to tailor interview questioning..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Style & Feedback Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Interviewer Style
                  </label>
                  <select
                    value={interviewStyle}
                    onChange={(e) => setInterviewStyle(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="FRIENDLY">Friendly & Encouraging (Guided hints)</option>
                    <option value="RIGOROUS">Rigorous & Direct (Senior FAANG Bar Raiser style)</option>
                    <option value="ACADEMIC">Academic & Theoretical (Formulae & proof depth)</option>
                    <option value="FAST_PACED">Fast-Paced Screening (Short, crisp checks)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Evaluation & Feedback Mode
                  </label>
                  <select
                    value={feedbackMode}
                    onChange={(e) => setFeedbackMode(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="COMPREHENSIVE">Comprehensive Post-Interview Debrief Report</option>
                    <option value="INSTANT">Instant Per-Question Critique</option>
                    <option value="HINTS_ENABLED">Pedagogical Practice (Hints unlocked)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Summary & Launch */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                      {selectedCategory}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                      {activeCategoryMeta?.title || selectedCategory} Practice Round
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">Target Role</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {targetRole === 'CUSTOM' ? customRole : targetRole}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-slate-600 block text-[11px]">Difficulty</span>
                    <span className="font-bold text-slate-900 capitalize">{difficulty.toLowerCase()}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-slate-600 block text-[11px]">Duration</span>
                    <span className="font-bold text-slate-900">{durationMinutes} Minutes</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-slate-600 block text-[11px]">Questions</span>
                    <span className="font-bold text-slate-900">{maxQuestions} Questions</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-slate-600 block text-[11px]">Environment</span>
                    <span className="font-bold text-slate-900 capitalize">{progLanguage} Sandbox</span>
                  </div>
                </div>

                {targetCompany && (
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Targeted practice profile: <strong>{targetCompany}</strong></span>
                  </div>
                )}

                {selectedResumeId && (
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Resume attached: Questions will test your verified projects.</span>
                  </div>
                )}
              </div>

              {/* Rubric Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Scoring Rubric Dimensions
                </h4>
                <div className="space-y-1.5">
                  {(activeCategoryMeta?.rubricTemplate || []).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <span className="font-semibold text-slate-800">{r.dimension}</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {r.weight}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Practice Notice:</strong> This simulation is conducted by our pedagogical AI Interviewer to build confidence, identify technical gaps, and test real execution in isolated sandboxes. Scores reflect practice estimates, not official employer evaluations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Continue to Step {step + 1}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              disabled={isLaunching}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-md disabled:opacity-50"
            >
              {isLaunching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching Live Workspace...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Launch Live Interview Workspace</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
