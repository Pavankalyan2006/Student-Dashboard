import React, { useEffect, useState, useCallback } from 'react';
import { quizApi } from '../api/quizApi';
import { QuizReviewResult, ReviewQuestionItem } from '../types/quiz';
import { Button } from '../../../components/ui/button';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Bot,
  Layers,
  Send,
  BookOpen,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizReviewPageProps {
  quizId?: string;
  onNavigate?: (path: string) => void;
}

export const QuizReviewPage: React.FC<QuizReviewPageProps> = ({ quizId: propQuizId, onNavigate }) => {
  const navigate = useCallback((path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [onNavigate]);

  const quizId = propQuizId || (typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '');

  const [review, setReview] = useState<QuizReviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Explainer State
  const [activeQuestionForAi, setActiveQuestionForAi] = useState<ReviewQuestionItem | null>(null);
  const [aiCustomQuery, setAiCustomQuery] = useState('');
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    const loadReview = async () => {
      try {
        setLoading(true);
        const attempts = await quizApi.getAttempts(quizId);
        const completed = attempts.filter((a) => a.status === 'COMPLETED');

        if (completed.length === 0) {
          toast.info('No completed attempt found for this quiz');
          navigate(`/quiz/${quizId}`);
          return;
        }

        const latestAttempt = completed[0];
        const res = await quizApi.getAttemptReview(latestAttempt.id);
        setReview(res);
      } catch (err: any) {
        toast.error('Failed to load review', { description: err.message });
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [quizId, navigate]);

  const handleOpenAiExplainer = (q: ReviewQuestionItem, defaultPrompt?: string) => {
    setActiveQuestionForAi(q);
    setAiExplanation(null);
    setAiCustomQuery(defaultPrompt || 'Why is my answer wrong and what is the underlying concept?');
    handleFetchExplanation(q, defaultPrompt || 'Why is my answer wrong and what is the underlying concept?');
  };

  const handleFetchExplanation = async (q: ReviewQuestionItem, query: string) => {
    try {
      setExplaining(true);
      const res = await quizApi.explainAnswer(q.question_id, q.student_answer, query);
      setAiExplanation(res);
    } catch (err: any) {
      toast.error('AI Explanation failed', { description: err.message });
    } finally {
      setExplaining(false);
    }
  };

  if (loading || !review) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Loading detailed question review and explanations...
        </p>
      </div>
    );
  }

  const questionsList = review.items || review.questions || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Quiz Hub
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Question Review & Explanations
            </h1>
            <p className="text-xs text-slate-500">
              {review.quiz_title || review.quiz?.title || 'Academic Assessment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {review.correct_count} Correct
          </div>
          <div className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {review.incorrect_count} Incorrect
          </div>
          <div className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300">
            Score: {review.score}%
          </div>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-6">
        {questionsList.map((item, idx) => {
          const isCorrect = item.is_correct;
          const hasAnswer = item.student_answer !== null && item.student_answer !== undefined && item.student_answer !== '';
          const formattedCorrect = Array.isArray(item.correct_answer)
            ? item.correct_answer.join(', ')
            : String(item.correct_answer);
          const formattedStudent = Array.isArray(item.student_answer)
            ? item.student_answer.join(', ')
            : item.student_answer ? String(item.student_answer) : '(No answer submitted)';

          return (
            <div
              key={item.question_id || idx}
              className={`rounded-2xl border p-6 transition-all ${
                isCorrect
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 shadow-sm'
                  : hasAnswer
                  ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : hasAnswer
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {item.question_type.replace('_', ' ')}
                  </span>
                  {item.topic_id && (
                    <span className="text-xs text-slate-400">
                      • {item.topic_id}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </span>
                  ) : hasAnswer ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                      <HelpCircle className="w-4 h-4" /> Unanswered
                    </span>
                  )}
                </div>
              </div>

              {/* Question Body */}
              <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-relaxed mb-4">
                {item.question_text}
              </h3>

              {/* Student vs Correct Answer Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    isCorrect
                      ? 'bg-emerald-50/60 text-emerald-900 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50/60 text-rose-900 border-rose-200 dark:bg-rose-950/20 dark:text-rose-200 dark:border-rose-800'
                  }`}
                >
                  <span className="font-semibold block mb-1 opacity-75">Your Answer:</span>
                  <span className="font-mono text-sm font-medium">{formattedStudent}</span>
                </div>

                <div className="p-3.5 rounded-xl border text-xs bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700">
                  <span className="font-semibold block mb-1 text-slate-500 dark:text-slate-400">Authoritative Correct Answer:</span>
                  <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formattedCorrect}
                  </span>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  Conceptual Explanation
                </div>
                <p className="leading-relaxed">{item.explanation}</p>
              </div>

              {/* Citation & Ask AI Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                {item.citation ? (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.citation}</span>
                  </div>
                ) : (
                  <span />
                )}

                <Button
                  size="sm"
                  variant="ai"
                  onClick={() => handleOpenAiExplainer(item)}
                  className="flex items-center gap-1.5 text-xs shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI to Explain
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive AI Explainer Modal */}
      {activeQuestionForAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Bot className="w-5 h-5" />
                AI Learning Agent Explainer
              </div>
              <button
                onClick={() => setActiveQuestionForAi(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-1">
                Question:
              </span>
              <p className="line-clamp-2">{activeQuestionForAi.question_text}</p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                'Why is my answer wrong?',
                'Teach me this concept step-by-step',
                'Give me a similar practice question',
                'Explain with a real-world example',
              ].map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => {
                    setAiCustomQuery(promptText);
                    handleFetchExplanation(activeQuestionForAi, promptText);
                  }}
                  className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Response Section */}
            {explaining ? (
              <div className="py-8 text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  AI Tutor is analyzing pedagogical context...
                </p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs space-y-2">
                  <div className="font-bold text-blue-900 dark:text-blue-200">
                    Why Correct:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiExplanation.why_correct}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    Diagnostic Analysis:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {aiExplanation.why_wrong}
                  </p>
                </div>

                {aiExplanation.similar_example && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Concept Comparison:
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {aiExplanation.similar_example}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={aiCustomQuery}
                onChange={(e) => setAiCustomQuery(e.target.value)}
                placeholder="Ask specific question to AI Tutor..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && aiCustomQuery.trim() && !explaining) {
                    handleFetchExplanation(activeQuestionForAi, aiCustomQuery);
                  }
                }}
              />
              <Button
                size="sm"
                variant="primary"
                disabled={explaining || !aiCustomQuery.trim()}
                onClick={() => handleFetchExplanation(activeQuestionForAi, aiCustomQuery)}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
