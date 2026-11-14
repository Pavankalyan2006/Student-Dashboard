// src/features/gate/components/GateQuestionPracticeModal.tsx
import React, { useState, useEffect } from 'react';
import { GateQuestion, GateQuestionAttempt } from '../types/gateTypes';
import { gateApi } from '../api/gateApi';
import {
  X,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface GateQuestionPracticeModalProps {
  question: GateQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onNextQuestion?: () => void;
  onAskAiTutor?: (question: GateQuestion) => void;
}

export const GateQuestionPracticeModal: React.FC<GateQuestionPracticeModalProps> = ({
  question,
  isOpen,
  onClose,
  onNextQuestion,
  onAskAiTutor,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>('');
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    attempt: GateQuestionAttempt;
    is_correct: boolean;
    marks_awarded: number;
    negative_deducted: number;
    correct_answer: any;
    explanation: string;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isOpen && timerRunning && !evaluationResult) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, timerRunning, evaluationResult]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(question?.question_type === 'MSQ' ? [] : '');
    setTimeSpent(0);
    setTimerRunning(true);
    setShowHint(false);
    setEvaluationResult(null);
  }, [question?.id]);

  if (!isOpen || !question) return null;

  const handleToggleMsqOption = (optId: string) => {
    setSelectedAnswer((prev: string[]) => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      if (arr.includes(optId)) {
        return arr.filter((x) => x !== optId);
      } else {
        return [...arr, optId].sort();
      }
    });
  };

  const handleSubmit = async () => {
    if (
      selectedAnswer === '' ||
      selectedAnswer === null ||
      selectedAnswer === undefined ||
      (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)
    ) {
      toast.error('Please select or enter an answer before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setTimerRunning(false);
      const res = await gateApi.attemptQuestion(question.id, selectedAnswer, timeSpent);
      setEvaluationResult(res);
      if (res.is_correct) {
        toast.success(`Correct! +${res.marks_awarded} Marks`);
      } else {
        toast.error(
          res.negative_deducted > 0
            ? `Incorrect! -${res.negative_deducted} Negative Marks`
            : 'Incorrect! 0 Marks'
        );
      }
    } catch (err: any) {
      toast.error('Submission failed: ' + err.message);
      setTimerRunning(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await gateApi.toggleBookmark(question.id);
      if (res.bookmarked) {
        toast.success('Question saved to bookmarks for revision');
      } else {
        toast.info('Bookmark removed');
      }
    } catch (err: any) {
      toast.error('Bookmark error: ' + err.message);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              [{question.paper_code}] {question.subject}
            </span>

            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-50 text-slate-800">
              {question.question_type}
            </span>

            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
            </span>

            {question.negative_marks > 0 ? (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                -{question.negative_marks} Neg
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-50 text-slate-500">
                No Neg Marking
              </span>
            )}

            {question.is_pyq && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Official PYQ {question.year}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              {formatTimer(timeSpent)}
            </div>

            <button
              onClick={handleBookmark}
              title="Bookmark Question"
              className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* Question Statement */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl leading-relaxed text-slate-900 font-sans whitespace-pre-line text-sm">
            {question.question_statement}
          </div>

          {/* Diagram image if provided */}
          {question.diagram_url && (
            <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
              <img
                src={question.diagram_url}
                alt="Question Diagram"
                className="max-h-60 mx-auto rounded-lg object-contain"
              />
            </div>
          )}

          {/* Answer Input Controls */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {question.question_type === 'MCQ' && 'Select One Correct Option (Single Choice):'}
              {question.question_type === 'MSQ' && 'Select All Correct Options (Multiple Select, No Negative Marking):'}
              {question.question_type === 'NAT' && 'Enter Numerical Answer (Within Decimal Tolerance):'}
            </label>

            {/* MCQ Options */}
            {question.question_type === 'MCQ' && question.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  const isSubmitted = !!evaluationResult;
                  const isCorrectAnswer = isSubmitted && evaluationResult.correct_answer === opt.id;
                  const isWrongSelected = isSubmitted && isSelected && !evaluationResult.is_correct;

                  let borderClass = 'border-slate-200 bg-white hover:border-slate-200';
                  if (isSelected) borderClass = 'border-indigo-500 bg-indigo-50 text-slate-900';
                  if (isCorrectAnswer) borderClass = 'border-emerald-500 bg-emerald-50 text-slate-900 ring-1 ring-emerald-500';
                  if (isWrongSelected) borderClass = 'border-rose-500 bg-rose-50 text-slate-900 ring-1 ring-rose-500';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => !evaluationResult && setSelectedAnswer(opt.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        evaluationResult ? 'cursor-default' : 'cursor-pointer'
                      } ${borderClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-xs text-slate-800 mt-0.5 leading-normal">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MSQ Options */}
            {question.question_type === 'MSQ' && question.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((opt) => {
                  const isChecked = Array.isArray(selectedAnswer) && selectedAnswer.includes(opt.id);
                  const isSubmitted = !!evaluationResult;
                  // The answer key comes from the server only after the answer is checked.
                  const correctArr = Array.isArray(evaluationResult?.correct_answer)
                    ? evaluationResult!.correct_answer
                    : [evaluationResult?.correct_answer];
                  const shouldBeChecked = isSubmitted && correctArr.includes(opt.id);

                  let borderClass = 'border-slate-200 bg-white hover:border-slate-200';
                  if (isChecked) borderClass = 'border-indigo-500 bg-indigo-50 text-slate-900';
                  if (shouldBeChecked) borderClass = 'border-emerald-500 bg-emerald-50 text-slate-900 ring-1 ring-emerald-500';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => !evaluationResult && handleToggleMsqOption(opt.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        evaluationResult ? 'cursor-default' : 'cursor-pointer'
                      } ${borderClass}`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-bold text-xs text-indigo-700 mr-1">{opt.id}:</span>
                      <span className="text-xs text-slate-800 leading-normal">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NAT Numeric Input */}
            {question.question_type === 'NAT' && (
              <div className="space-y-2">
                <input
                  type="text"
                  disabled={!!evaluationResult}
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Enter integer or real decimal value (e.g. 15 or 16.24)..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 disabled:opacity-70"
                />
                <span className="text-[11px] text-slate-500 block">
                  Virtual calculator is allowed during GATE. Values within official decimal tolerance range will be accepted.
                </span>
              </div>
            )}
          </div>

          {/* Hint Disclosure */}
          {showHint && question.hint && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Professor Hint:</span>
                {question.hint}
              </div>
            </div>
          )}

          {/* Evaluation Result & Solution Breakdown */}
          {evaluationResult && (
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                evaluationResult.is_correct
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {evaluationResult.is_correct ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {evaluationResult.is_correct ? 'Correct Solution!' : 'Incorrect Answer'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {evaluationResult.is_correct
                        ? `Scored +${evaluationResult.marks_awarded} Marks`
                        : evaluationResult.negative_deducted > 0
                        ? `Penalty: -${evaluationResult.negative_deducted} Negative Marks`
                        : '0 Marks Awarded (No Negative Penalty)'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Official Answer Key</span>
                  <span className="text-sm font-bold font-mono text-emerald-700">
                    {typeof evaluationResult.correct_answer === 'object' && 'min' in evaluationResult.correct_answer
                      ? `[${evaluationResult.correct_answer.min} to ${evaluationResult.correct_answer.max}]`
                      : Array.isArray(evaluationResult.correct_answer)
                      ? evaluationResult.correct_answer.join(', ')
                      : String(evaluationResult.correct_answer)}
                  </span>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs text-slate-800">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Authoritative Step-by-Step Explanation:
                </div>
                <div className="leading-relaxed whitespace-pre-line text-slate-700 font-sans">
                  {evaluationResult.explanation}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Source: {question.source_attribution}
                </span>

                {onAskAiTutor && (
                  <button
                    onClick={() => onAskAiTutor(question)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI Tutor for deeper derivation
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!showHint && question.hint && !evaluationResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(true)}
                className="border-slate-200 text-slate-500 hover:text-amber-700 text-xs h-8"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                Show Hint
              </Button>
            )}

            {!evaluationResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAnswer(question.question_type === 'MSQ' ? [] : '')}
                className="border-slate-200 text-slate-500 text-xs h-8"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!evaluationResult ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-4"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (onNextQuestion) {
                    onNextQuestion();
                  } else {
                    onClose();
                  }
                }}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4 flex items-center gap-1"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
