import { toast } from 'sonner';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  X,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Sparkles,
  Send,
  ArrowRight,
  ShieldAlert,
  Bot,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const ResumeProjectDefenseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'PROJECT_DEFENSE' | 'STAR'>('AUDIT');

  // STAR Practice state
  const [starAnswer, setStarAnswer] = useState<string>('');
  const [starFeedback, setStarFeedback] = useState<any | null>(null);

  const { data: audit, isLoading } = useQuery({
    queryKey: ['placement-resume-audit'],
    queryFn: () => placementsApi.getResumeAudit(),
    enabled: isOpen,
  });

  const starMutation = useMutation({
    mutationFn: (answer: string) => placementsApi.improveWithStar(answer),
    onSuccess: (data) => {
      setStarFeedback(data);
    },
    onError: (err: any) => {
      setStarFeedback(null);
      toast.error(err?.message || 'Could not restructure the answer.');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Resume & Project Interview Defense</h3>
              <p className="text-[11px] text-slate-500">
                Completeness audit from your saved resume, technical project defense questions & STAR formatting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-slate-50/20">
          {[
            { id: 'AUDIT', label: 'Resume Completeness Audit' },
            { id: 'PROJECT_DEFENSE', label: 'Project Defense Questions' },
            { id: 'STAR', label: 'STAR Behavioral Practice' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-slate-100 rounded-2xl" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
            </div>
          )}

          {/* TAB 1: RESUME AUDIT */}
          {activeTab === 'AUDIT' && audit && (
            <div className="space-y-6">
              {/* Score Box */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Profile Completeness
                  </span>
                  <div className="text-3xl font-black text-emerald-400">
                    {audit.completeness_percentage}%
                  </div>
                  <p className="text-xs text-slate-300">
                    {audit.has_resume
                      ? `Based on your saved resume data with ${audit.project_count} projects and ${audit.skill_count} verified skills.`
                      : 'No primary resume saved yet. Build your resume in the Resume Studio.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate('/resume');
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  Open Resume Studio
                </button>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Verification Breakdown
                </h4>
                <div className="space-y-2">
                  {audit.checks.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-white text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {c.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {c.completed ? `+${c.weight}%` : 'Pending (+15%)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Link info */}
              {audit.connected_github && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-slate-800" />
                    <span className="font-medium text-slate-700">Connected GitHub: </span>
                    <a
                      href={audit.connected_github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      {audit.connected_github}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJECT DEFENSE QUESTIONS */}
          {activeTab === 'PROJECT_DEFENSE' && audit && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Technical Follow-Up Defense Questions</h4>
                <p className="text-xs text-slate-500">
                  Grounded in your actual saved project descriptions and technical stack.
                </p>
              </div>

              <div className="space-y-3">
                {audit.project_defense_questions.map((q: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Project: {q.project_title}
                      </span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {q.star_focus}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 leading-snug">
                      {q.question}
                    </h5>

                    <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-xs text-slate-600">
                      <span className="font-bold text-slate-800">Interviewer Rubric: </span>
                      {q.expected_rubric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STAR PRACTICE */}
          {activeTab === 'STAR' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">STAR Behavioral Answer Refiner</h4>
                <p className="text-xs text-slate-500">
                  Input your raw, conversational answer to an interview question. The AI coach will structure it into Situation, Task, Action, and Result.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={starAnswer}
                  onChange={(e) => setStarAnswer(e.target.value)}
                  placeholder="e.g. In my third-year database project, our team faced a bottleneck where API queries took 4 seconds during load tests. I took charge of indexing..."
                  rows={4}
                  className="w-full p-3.5 border border-slate-200 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => starMutation.mutate(starAnswer)}
                    disabled={!starAnswer.trim() || starMutation.isPending}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{starMutation.isPending ? 'Refining...' : 'Refine with STAR'}</span>
                  </button>
                </div>
              </div>

              {/* STAR Output */}
              {starFeedback && (
                <div className="p-5 border border-blue-200 bg-blue-50/30 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                    <Bot className="h-4 w-4 text-blue-600" />
                    Structured STAR Breakdown
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-indigo-700">Situation:</span>
                      <p className="text-slate-600">{starFeedback.situation}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-indigo-700">Task:</span>
                      <p className="text-slate-600">{starFeedback.task}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-indigo-700">Action:</span>
                      <p className="text-slate-600">{starFeedback.action}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-indigo-700">Result:</span>
                      <p className="text-slate-600">{starFeedback.result}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800">Improved Delivery:</span>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{starFeedback.improved_answer}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
