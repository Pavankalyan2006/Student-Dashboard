import React, { useState, useEffect, useRef, useCallback } from 'react';
import { quizApi } from '../api/quizApi';
import { Quiz, QuizDeliveryQuestion, QuizAttempt, QuizResult } from '../types/quiz';
import { QuizQuestionCard } from '../components/QuizQuestionCard';
import { QuestionNavigator } from '../components/QuestionNavigator';
import { QuizTimer } from '../components/QuizTimer';
import { QuizSourceBadge } from '../components/QuizSourceBadge';
import { AdaptiveDifficultyBadge } from '../components/AdaptiveDifficultyBadge';
import { Button } from '../../../components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizPlayerPageProps {
  quizId?: string;
  onNavigate?: (path: string) => void;
}

export const QuizPlayerPage: React.FC<QuizPlayerPageProps> = ({ quizId: propQuizId, onNavigate }) => {
  const navigate = useCallback((path: string, state?: any) => {
    if (state) {
      (window as any).__QUIZ_RESULT_STATE__ = state;
    }
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState(state || {}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }, [onNavigate]);

  const quizId = propQuizId || (typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '');

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<QuizDeliveryQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const saveTimeoutRef = useRef<any>(null);

  // Initialize or resume attempt
  useEffect(() => {
    if (!quizId) return;

    const start = async () => {
      try {
        setLoading(true);
        const res = await quizApi.startQuiz(quizId);
        setQuiz(res.quiz);
        setAttempt(res.attempt);
        setQuestions(res.questions);

        // Restore state if resumed
        const restoredAnswers = res.attempt.metadata?.current_answers || res.attempt.answers || {};
        const restoredFlags = res.attempt.metadata?.flagged_questions || res.attempt.flagged_questions || [];
        const restoredIndex = res.attempt.metadata?.current_index || res.attempt.current_question_index || 0;

        setAnswers(restoredAnswers);
        setFlaggedQuestions(restoredFlags);
        setCurrentIndex(Math.min(restoredIndex, Math.max(0, res.questions.length - 1)));

        // Setup timer
        if (res.quiz.time_limit_seconds) {
          const startedAt = new Date(res.attempt.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startedAt) / 1000);
          const remaining = Math.max(0, res.quiz.time_limit_seconds - elapsed);
          setSecondsRemaining(remaining);
        }

        if (res.resumed) {
          toast.info('Active Session Resumed', {
            description: 'Your previous answers and flags have been restored.',
          });
        }
      } catch (err: any) {
        toast.error('Failed to load quiz', { description: err.message });
        navigate('/quiz');
      } finally {
        setLoading(false);
      }
    };

    start();
  }, [quizId, navigate]);

  // Debounced Auto-Save
  const triggerDebouncedSave = useCallback(
    (
      newAnswers: Record<string, string | string[]>,
      newFlags: string[],
      newIndex: number
    ) => {
      if (!attempt) return;
      setSavingStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await quizApi.saveAnswers(attempt.id, newAnswers, newFlags, newIndex);
          setSavingStatus('saved');
        } catch {
          setSavingStatus('error');
        }
      }, 1000);
    },
    [attempt]
  );

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0 || loading || submitting) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, loading, submitting]);

  const handleAutoSubmit = async () => {
    toast.warning('Time Expired!', {
      description: 'Your assessment is being submitted automatically.',
    });
    await handleSubmitConfirmed();
  };

  const handleAnswerChange = (val: string | string[]) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);
    triggerDebouncedSave(updated, flaggedQuestions, currentIndex);
  };

  const handleToggleFlag = () => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    let updatedFlags: string[];
    if (flaggedQuestions.includes(qId)) {
      updatedFlags = flaggedQuestions.filter((id) => id !== qId);
    } else {
      updatedFlags = [...flaggedQuestions, qId];
    }
    setFlaggedQuestions(updatedFlags);
    triggerDebouncedSave(answers, updatedFlags, currentIndex);
  };

  const handleSelectQuestion = (idx: number) => {
    setCurrentIndex(idx);
    triggerDebouncedSave(answers, flaggedQuestions, idx);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handleSubmitConfirmed = async () => {
    if (!attempt || !quiz) return;
    try {
      setSubmitting(true);
      setShowSubmitModal(false);
      const result: QuizResult = await quizApi.submitAttempt(attempt.id, answers);
      toast.success('Assessment Completed!', {
        description: `Your authoritative score: ${result.score}%`,
      });
      navigate(`/quiz/${quiz.id}/result`, { state: { result } });
    } catch (err: any) {
      toast.error('Submission failed', { description: err.message });
      setSubmitting(false);
    }
  };

  const handleAbandon = async () => {
    if (!attempt || !quiz) return;
    if (window.confirm('Are you sure you want to abandon this assessment? In-progress data will be closed.')) {
      try {
        await quizApi.abandonAttempt(attempt.id);
        toast.info('Assessment abandoned');
        navigate('/quiz');
      } catch (err: any) {
        toast.error('Failed to abandon assessment', { description: err.message });
      }
    }
  };

  if (loading || !quiz || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Preparing secure evaluation sandbox...
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <QuizSourceBadge sourceType={quiz.source_type} />
            <AdaptiveDifficultyBadge
              difficulty={currentQ.difficulty || quiz.difficulty}
              isAdaptive={quiz.adaptive_mode}
            />
            {savingStatus === 'saving' && (
              <span className="text-xs text-amber-500 font-medium animate-pulse">
                Saving answers...
              </span>
            )}
            {savingStatus === 'saved' && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-saved
              </span>
            )}
          </div>
          <h1 className="font-bold text-slate-900 dark:text-white text-lg">
            {quiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {secondsRemaining !== null && (
            <QuizTimer secondsRemaining={secondsRemaining} />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleAbandon}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900"
          >
            Abandon
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={submitting}
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Assessment
          </Button>
        </div>
      </div>

      {/* Main Assessment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card & Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Question Index Progress */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>
              {Math.round(((currentIndex + 1) / questions.length) * 100)}% Progress
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <QuizQuestionCard
            question={currentQ}
            selectedAnswer={answers[currentQ.id] || null}
            onAnswerChange={handleAnswerChange}
            isFlagged={flaggedQuestions.includes(currentQ.id)}
            onToggleFlag={handleToggleFlag}
          />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={handlePrevious}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 text-xs ${
                flaggedQuestions.includes(currentQ.id)
                  ? 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40'
                  : ''
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              {flaggedQuestions.includes(currentQ.id) ? 'Flagged' : 'Flag'}
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Review & Submit
                <Send className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Navigator (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestionIds={flaggedQuestions}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Submit Assessment?</h3>
                <p className="text-xs text-slate-500">Ready to complete your attempt?</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 my-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Questions:</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Answered:</span>
                <span className="font-semibold">{answeredCount}</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Unanswered:
                  </span>
                  <span>{unansweredCount}</span>
                </div>
              )}
              {flaggedQuestions.length > 0 && (
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                  <span>Flagged for Review:</span>
                  <span className="font-semibold">{flaggedQuestions.length}</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                You have {unansweredCount} unanswered questions. Unanswered questions are evaluated with 0 marks.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitModal(false)}
              >
                Return to Quiz
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={submitting}
                onClick={handleSubmitConfirmed}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Evaluating...' : 'Confirm Submission'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
