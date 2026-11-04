// src/features/system-design/components/InterviewPracticeModal.tsx
// 10-Step Guided System Design Technical Interview Simulator with Timer & Scorecard

import * as React from 'react';
import {
  X,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import { InterviewSession, InterviewStep } from '../types/systemDesign';
import { toast } from 'sonner';

interface InterviewPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
  challengeTitle: string;
}

const INTERVIEW_STEPS: Array<{ key: InterviewStep; label: string; guide: string }> = [
  { key: 'REQUIREMENTS_CLARIFICATION', label: '1. Requirements Clarification', guide: 'Clarify scope, user volume, read/write patterns, and what features are explicitly out-of-scope.' },
  { key: 'SCALE_ESTIMATION', label: '2. Capacity & Scale Estimation', guide: 'Calculate Average RPS, Peak RPS, Storage per year, and Bandwidth requirements.' },
  { key: 'API_DESIGN', label: '3. API & Contract Design', guide: 'Define REST/gRPC endpoints, HTTP verbs, payload parameters, and status codes.' },
  { key: 'DATA_MODEL', label: '4. Data Model & Storage Choice', guide: 'Decide SQL vs NoSQL, entities, primary keys, indexing strategies, and normalization trade-offs.' },
  { key: 'HIGH_LEVEL_DESIGN', label: '5. High-Level Architecture', guide: 'Outline end-to-end request flow: Client → CDN → Load Balancer → App Tier → Cache → Database.' },
  { key: 'DETAILED_DESIGN', label: '6. Detailed Component Design', guide: 'Deep dive into caching strategies (Cache-Aside, Write-Through), message queues, and worker jobs.' },
  { key: 'BOTTLENECK_ANALYSIS', label: '7. Bottlenecks & SPoFs', guide: 'Identify single points of failure, hotspot partitions, DB connection limits, and slow queries.' },
  { key: 'RELIABILITY_SECURITY', label: '8. Reliability & Security', guide: 'Specify multi-AZ failover, JWT authentication, rate limiting, and circuit breakers.' },
  { key: 'TRADEOFFS_REVIEW', label: '9. Trade-Off Quantification', guide: 'Explain CAP theorem compromises: consistency vs availability, latency vs memory cost.' },
  { key: 'FINAL_SUMMARY', label: '10. Final Summary & Next Steps', guide: 'Summarize how the architecture satisfies all functional and non-functional requirements.' }
];

export function InterviewPracticeModal({
  isOpen,
  onClose,
  challengeId,
  challengeTitle
}: InterviewPracticeModalProps) {
  const [session, setSession] = React.useState<InterviewSession | null>(null);
  const [targetRole, setTargetRole] = React.useState<'JUNIOR_SDE' | 'MID_SDE' | 'SENIOR_SDE' | 'STAFF_ARCHITECT'>('SENIOR_SDE');
  const [duration, setDuration] = React.useState(45);
  const [starting, setStarting] = React.useState(false);
  const [submittingStep, setSubmittingStep] = React.useState(false);

  // Active step draft
  const [stepNotes, setStepNotes] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(duration * 60);

  // Timer Countdown
  React.useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS') return;
    const interval = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!isOpen) return null;

  const handleStartInterview = async () => {
    try {
      setStarting(true);
      const newSession = await systemDesignApi.startInterview(challengeId, targetRole, duration);
      setSession(newSession);
      setTimeLeft(duration * 60);
      toast.success(`Started mock interview for ${challengeTitle}!`);
    } catch (err: any) {
      toast.error('Failed to start interview: ' + err.message);
    } finally {
      setStarting(false);
    }
  };

  const handleAdvanceStep = async () => {
    if (!session) return;
    if (!stepNotes.trim()) {
      toast.warning('Please enter your response notes before advancing to the next step.');
      return;
    }
    try {
      setSubmittingStep(true);
      const updated = await systemDesignApi.submitInterviewStep(session.id, session.current_step, stepNotes);
      setSession(updated);
      setStepNotes('');
      toast.success('Step evaluated by interviewer!');
    } catch (err: any) {
      toast.error('Error submitting step: ' + err.message);
    } finally {
      setSubmittingStep(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentStepDef = INTERVIEW_STEPS.find(s => s.key === session?.current_step) || INTERVIEW_STEPS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">System Design Interview Simulator</h2>
              <p className="text-[11px] text-slate-400">{challengeTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session && session.status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!session ? (
            /* Setup Screen */
            <div className="max-w-md mx-auto space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Interactive Technical Interview</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Experience a structured 10-step FAANG system design interview. Receive Socratic follow-up questions, step-by-step interviewer notes, and a debrief scorecard.
                </p>
              </div>

              <div className="text-left space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Target Engineering Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value="JUNIOR_SDE">Junior Software Engineer</option>
                    <option value="MID_SDE">Mid-Level Software Engineer</option>
                    <option value="SENIOR_SDE">Senior Software Engineer (FAANG)</option>
                    <option value="STAFF_ARCHITECT">Staff / Principal Architect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Interview Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  >
                    <option value={30}>30 Minutes (Fast Track)</option>
                    <option value={45}>45 Minutes (Standard FAANG Round)</option>
                    <option value={60}>60 Minutes (Deep Dive Round)</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleStartInterview}
                disabled={starting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
              >
                {starting ? 'Initializing Session...' : 'Begin Mock Interview'}
              </Button>
            </div>
          ) : session.status === 'COMPLETED' ? (
            /* Debrief Scorecard */
            <div className="space-y-6">
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3">
                <Award className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Interview Debrief & Assessment</h3>
                <div className="text-4xl font-extrabold text-emerald-400">{session.overall_score}%</div>
                <div className="inline-block px-3 py-1 bg-emerald-950/70 border border-emerald-800 rounded-full text-xs font-semibold text-emerald-300">
                  {session.debrief_feedback?.overall_verdict || 'STRONG_HIRE'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Key Strengths</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {session.debrief_feedback?.strengths.map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Areas for Improvement</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {session.debrief_feedback?.improvements.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* In-Progress Step Screen */
            <div className="space-y-5">
              {/* Step Navigation Pill Strip */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                {INTERVIEW_STEPS.map((s, idx) => {
                  const isCurrent = s.key === session.current_step;
                  const isDone = session.step_index > idx;
                  return (
                    <div
                      key={s.key}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap border ${
                        isCurrent
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                          : isDone
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {idx + 1}. {s.label.split('. ')[1]}
                    </div>
                  );
                })}
              </div>

              {/* Current Step Prompt */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
                  Step {session.step_index + 1} of 10
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{currentStepDef.label}</h3>
                <p className="text-xs text-slate-400 mt-1">{currentStepDef.guide}</p>
              </div>

              {/* Candidate Notes Editor */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Response & Architectural Formulation:
                </label>
                <textarea
                  rows={8}
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  placeholder={`Write your design decisions and calculations for ${currentStepDef.label}...`}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Interviewer Feedback on Previous Step */}
              {session.step_index > 0 && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-300">
                  <div className="font-bold mb-1">Previous Step Feedback:</div>
                  <p className="text-slate-300">
                    {session.step_responses[INTERVIEW_STEPS[session.step_index - 1].key]?.interviewer_feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {session && session.status === 'IN_PROGRESS' && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Role: {session.target_role.replace(/_/g, ' ')}
            </span>
            <Button
              onClick={handleAdvanceStep}
              disabled={submittingStep}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
            >
              {submittingStep ? 'Evaluating...' : session.step_index === 9 ? 'Complete Interview' : 'Submit & Next Step'}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
