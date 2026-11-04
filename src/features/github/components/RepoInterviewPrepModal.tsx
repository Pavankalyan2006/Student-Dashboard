import React, { useState } from 'react';
import { useGitHubInterviewPrep } from '../hooks/useGitHub';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, X, ShieldCheck, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface RepoInterviewPrepModalProps {
  repoId: string;
  repoName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RepoInterviewPrepModal: React.FC<RepoInterviewPrepModalProps> = ({
  repoId,
  repoName,
  isOpen,
  onClose,
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const interviewMutation = useGitHubInterviewPrep(repoId);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      const res = await interviewMutation.mutateAsync();
      if (res.questions) {
        setQuestions(res.questions);
        setExpandedIndex(0);
      }
    } catch (err: any) {
      toast.error('Failed to generate interview questions');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Technical Interview Preparation</h3>
              <p className="text-xs text-slate-300">
                Codebase defense questions and model answers for {repoName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Simulates engineering hiring manager and system design questions based on your actual codebase structure.
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {questions.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-4">
              <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Generate Project Defense Questions</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Evaluate your technical choices, architectural bottlenecks, testing strategies, and system design decisions.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={interviewMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {interviewMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {interviewMutation.isPending ? 'Analyzing Codebase...' : 'Generate 5 Technical Questions'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  5 Tailored Interview Questions
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={interviewMutation.isPending}
                  className="text-xs text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Re-generate
                </button>
              </div>

              {questions.map((q, idx) => {
                const isExpanded = expandedIndex === idx;
                const questionText = q.question || q;
                const answerText = q.model_answer || q.answer || 'Focus on explaining your architecture choices, database scaling, and why you selected this technology stack over alternatives.';
                const category = q.category || 'System Architecture';

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl bg-slate-50/70 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3 pr-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                            {category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                            {questionText}
                          </h4>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 border-t border-slate-200 bg-white space-y-3">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                            Model Technical Response:
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {answerText}
                          </p>
                        </div>
                        {q.key_points && q.key_points.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Key Talking Points:
                            </span>
                            <ul className="list-disc ml-4 space-y-1 text-slate-600">
                              {q.key_points.map((pt: string, pi: number) => (
                                <li key={pi}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
