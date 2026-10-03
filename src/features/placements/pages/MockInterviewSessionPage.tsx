import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  Mic,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Flag,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  sessionId: string;
  onNavigate: (path: string) => void;
}

export const MockInterviewSessionPage: React.FC<Props> = ({ sessionId, onNavigate }) => {
  const queryClient = useQueryClient();
  const [answerDraft, setAnswerDraft] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [starModalOpen, setStarModalOpen] = useState(false);
  const [starResult, setStarResult] = useState<any>(null);
  const [isStarLoading, setIsStarLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['mock-interview-session', sessionId],
    queryFn: () => placementsApi.getInterviewSession(sessionId),
    refetchInterval: false,
  });

  const session = data?.session;
  const questions = data?.questions || [];
  const answers = data?.answers || [];

  // Active question is the last un-answered question or the latest question in sequence
  const currentQuestion = questions.find(
    (q) => !answers.some((a) => a.question_id === q.id)
  ) || questions[questions.length - 1];

  const isCompleted = session?.status === 'COMPLETED';
  const allAnswered =
    questions.length > 0 &&
    answers.length >= questions.length &&
    (session?.current_question_index ?? 0) >= (session?.max_questions ?? 0);

  // Timer
  useEffect(() => {
    if (session?.status !== 'IN_PROGRESS') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answerDraft.trim()) {
      toast.error('Please formulate an answer before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await placementsApi.submitAnswer(
        sessionId,
        currentQuestion.id,
        answerDraft.trim(),
        elapsedSeconds
      );

      setAnswerDraft('');
      toast.success('Answer recorded and evaluated!');

      // Refetch session state
      await queryClient.invalidateQueries({ queryKey: ['mock-interview-session', sessionId] });

      if (res.is_completed) {
        toast.info('All interview questions completed. Finalizing session...');
        await handleFinishInterview();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    try {
      await placementsApi.completeInterview(sessionId);
      toast.success('Interview successfully completed!');
      onNavigate(`/placements/mock-interview/${sessionId}/result`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete interview');
    }
  };

  const handleImproveStar = async () => {
    if (!answerDraft.trim()) {
      toast.error('Enter your draft answer first to format it with STAR.');
      return;
    }
    setIsStarLoading(true);
    setStarModalOpen(true);
    try {
      const formatted = await placementsApi.improveWithStar(answerDraft);
      setStarResult(formatted);
    } catch {
      toast.error('Failed to format with STAR');
    } finally {
      setIsStarLoading(false);
    }
  };

  const handleApplyStarAnswer = () => {
    if (starResult?.improved_answer) {
      setAnswerDraft(starResult.improved_answer);
      setStarModalOpen(false);
      toast.success('Applied structured STAR answer to your response!');
    }
  };

  const handleAbandon = async () => {
    if (window.confirm('Are you sure you want to abandon this interview session? Your progress will be saved.')) {
      await placementsApi.abandonInterview(sessionId);
      onNavigate('/placements');
    }
  };

  if (isLoading || !session) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500">Connecting to AI Interview Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Cockpit Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Mic className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base">{session.interview_type} Interview</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {session.status}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {session.mode}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-700">{session.role_id.replace('role_', '').toUpperCase()}</span>
              {session.company_id && ` • Target: ${session.company_id.replace('comp_', '').toUpperCase()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono font-semibold">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            {formatTimer(elapsedSeconds)}
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</div>
            <div className="text-xs font-bold text-slate-900">
              Question {answers.length + (allAnswered ? 0 : 1)} of {session.max_questions}
            </div>
          </div>

          <button
            onClick={handleAbandon}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Main Grid: Left Interview Info + Right Question Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Session details & Interview guidelines */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Interview Topics</h3>
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isAnswered = answers.some((a) => a.question_id === q.id);
                return (
                  <div
                    key={q.id}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
                      isAnswered
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                        : q.id === currentQuestion?.id
                        ? 'bg-blue-50/60 border-blue-300 font-semibold text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>
                      Q{idx + 1}: {q.topic}
                    </span>
                    {isAnswered && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAR Framework Helper Box */}
          <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>STAR Response Method</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
              <li><strong>Situation:</strong> Context of the engineering problem.</li>
              <li><strong>Task:</strong> Your specific technical responsibility.</li>
              <li><strong>Action:</strong> Tools, code, algorithms, and fixes YOU implemented.</li>
              <li><strong>Result:</strong> Quantifiable outcome, benchmarks, or lessons learned.</li>
            </ul>
          </div>
        </div>

        {/* Right Pane: AI Question & Student Answer Composer */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Question Box */}
          {currentQuestion && !allAnswered ? (
            <div className="bg-white border-2 border-blue-500/30 rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {currentQuestion.topic}
                </span>
                {currentQuestion.follow_up_to && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    Adaptive Follow-up
                  </span>
                )}
              </div>

              <div>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Practice Mode Concept Hints */}
              {session.mode === 'PRACTICE' && (
                <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                  <span className="font-semibold block mb-1">Key concepts the interviewer expects:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentQuestion.expected_concepts || []).map((concept: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-amber-300 rounded text-[11px]">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Textarea */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="font-semibold text-slate-700">Your Response</label>
                  <span>{answerDraft.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>

                <textarea
                  rows={6}
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                  placeholder="Articulate your technical response. Mention relevant data structures, design constraints, and trade-offs..."
                  className="w-full p-4 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleImproveStar}
                  className="flex items-center gap-1.5 px-3 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Format with STAR AI
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answerDraft.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all ml-auto"
                >
                  {isSubmitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Submit Answer & Continue</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">All Interview Questions Answered!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have addressed all questions for this session. Complete the session to view detailed concept coverage and course recommendations.
              </p>
              <button
                onClick={handleFinishInterview}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                View Final Feedback Report
              </button>
            </div>
          )}

          {/* Previous Answer History */}
          {answers.length > 0 && (
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Submitted Answers in this Session ({answers.length})
              </h4>
              {answers.map((ans, i) => {
                const q = questions.find((item) => item.id === ans.question_id);
                return (
                  <div key={ans.id} className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold text-slate-900">
                        Q{i + 1}: {q?.topic || 'Question'}
                      </span>
                      {ans.evaluation?.score !== undefined && (
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Coverage Score: {ans.evaluation.score}%
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {ans.answer_text}
                    </p>
                    {ans.evaluation?.strengths?.length > 0 && (
                      <div className="text-[11px] text-emerald-700">
                        <strong>Strengths: </strong>{ans.evaluation.strengths.join(' ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* STAR AI Re-formatting Modal */}
      {starModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">STAR Method Narrative Coach</h3>
              </div>
              <button
                onClick={() => setStarModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            {isStarLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-xs text-slate-500">Restructuring your story into Situation, Task, Action, Result...</p>
              </div>
            ) : starResult ? (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                    <strong className="text-blue-900 block mb-0.5">Situation (Context):</strong>
                    <span className="text-slate-700">{starResult.situation}</span>
                  </div>
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <strong className="text-amber-900 block mb-0.5">Task (Responsibility):</strong>
                    <span className="text-slate-700">{starResult.task}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                    <strong className="text-emerald-900 block mb-0.5">Action (Your Contribution):</strong>
                    <span className="text-slate-700">{starResult.action}</span>
                  </div>
                  <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg">
                    <strong className="text-purple-900 block mb-0.5">Result (Outcome):</strong>
                    <span className="text-slate-700">{starResult.result}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-900">Coach Critique: </strong>
                  {starResult.critique}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setStarModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                  >
                    Keep Original
                  </button>
                  <button
                    onClick={handleApplyStarAnswer}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Apply Structured Answer
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
