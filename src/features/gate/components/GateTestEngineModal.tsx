// src/features/gate/components/GateTestEngineModal.tsx
// Full-Screen Official Exam Simulation Engine for GATE Mock Tests

import React, { useState, useEffect } from 'react';
import {
  GateMockTest,
  GateQuestion,
  GateTestSession,
  GateTestResult,
  QuestionPaletteStatus
} from '../types/gateTypes';
import { gateApi } from '../api/gateApi';
import {
  Clock,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface GateTestEngineModalProps {
  test: GateMockTest | null;
  questions: GateQuestion[];
  session: GateTestSession | null;
  isOpen: boolean;
  onClose: () => void;
  onFinishTest: (result: GateTestResult) => void;
}

export const GateTestEngineModal: React.FC<GateTestEngineModalProps> = ({
  test,
  questions,
  session,
  isOpen,
  onClose,
  onFinishTest,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    session?.remaining_seconds || (test?.duration_minutes || 180) * 60
  );
  const [answers, setAnswers] = useState<Record<string, { answer: any; status: QuestionPaletteStatus; time_spent: number }>>({});
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize answers from session
  useEffect(() => {
    if (session?.answers) {
      const init: Record<string, { answer: any; status: QuestionPaletteStatus; time_spent: number }> = {};
      for (const [qid, data] of Object.entries(session.answers)) {
        init[qid] = {
          answer: data.selected_answer,
          status: data.status || 'NOT_VISITED',
          time_spent: data.time_spent_seconds || 0,
        };
      }
      setAnswers(init);
    }
  }, [session]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!isOpen || showSubmitConfirm) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, showSubmitConfirm]);

  if (!isOpen || !test || questions.length === 0) return null;

  const currentQ = questions[currentIdx] || questions[0];
  const currentAnswerData = answers[currentQ.id] || {
    answer: currentQ.question_type === 'MSQ' ? [] : '',
    status: 'NOT_VISITED',
    time_spent: 0,
  };

  const handleSelectOption = (optId: string) => {
    if (currentQ.question_type === 'MCQ') {
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          answer: optId,
          status: 'ANSWERED',
          time_spent: (prev[currentQ.id]?.time_spent || 0) + 5,
        },
      }));
    } else if (currentQ.question_type === 'MSQ') {
      const curArr = Array.isArray(currentAnswerData.answer) ? currentAnswerData.answer : [];
      const newArr = curArr.includes(optId)
        ? curArr.filter((x: string) => x !== optId)
        : [...curArr, optId].sort();
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: {
          answer: newArr,
          status: newArr.length > 0 ? 'ANSWERED' : 'UNANSWERED',
          time_spent: (prev[currentQ.id]?.time_spent || 0) + 5,
        },
      }));
    }
  };

  const handleNatInputChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        answer: val,
        status: val.trim() !== '' ? 'ANSWERED' : 'UNANSWERED',
        time_spent: (prev[currentQ.id]?.time_spent || 0) + 5,
      },
    }));
  };

  const handleMarkForReviewAndNext = () => {
    const hasAnswer =
      currentAnswerData.answer !== '' &&
      currentAnswerData.answer !== null &&
      currentAnswerData.answer !== undefined &&
      (!Array.isArray(currentAnswerData.answer) || currentAnswerData.answer.length > 0);

    const newStatus: QuestionPaletteStatus = hasAnswer ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: prev[currentQ.id]?.answer ?? currentAnswerData.answer,
        status: newStatus,
        time_spent: (prev[currentQ.id]?.time_spent || 0) + 5,
      },
    }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleSaveAndNext = () => {
    const hasAnswer =
      currentAnswerData.answer !== '' &&
      currentAnswerData.answer !== null &&
      currentAnswerData.answer !== undefined &&
      (!Array.isArray(currentAnswerData.answer) || currentAnswerData.answer.length > 0);

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: prev[currentQ.id]?.answer ?? currentAnswerData.answer,
        status: hasAnswer ? 'ANSWERED' : 'UNANSWERED',
        time_spent: (prev[currentQ.id]?.time_spent || 0) + 5,
      },
    }));

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleClearResponse = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        answer: currentQ.question_type === 'MSQ' ? [] : '',
        status: 'UNANSWERED',
        time_spent: prev[currentQ.id]?.time_spent || 0,
      },
    }));
  };

  const handleAutoSubmit = async () => {
    toast.warning('Exam time expired! Auto-submitting responses...');
    await performSubmit();
  };

  const performSubmit = async () => {
    if (!session) return;
    try {
      setIsSubmitting(true);
      // Save draft answers first
      const formattedAnswers: Record<string, any> = {};
      for (const [qid, data] of Object.entries(answers)) {
        formattedAnswers[qid] = {
          selected_answer: data.answer,
          status: data.status,
          time_spent_seconds: data.time_spent,
        };
      }
      await gateApi.saveMockTestAnswers(session.id, formattedAnswers, remainingSeconds);
      const result = await gateApi.submitMockTest(session.id);
      toast.success('Exam submitted successfully!');
      onFinishTest(result);
    } catch (err: any) {
      toast.error('Submission failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Palette metrics
  let countAnswered = 0;
  let countNotAnswered = 0;
  let countMarked = 0;
  let countAnsweredAndMarked = 0;
  let countNotVisited = 0;

  for (const q of questions) {
    const s = answers[q.id]?.status || 'NOT_VISITED';
    if (s === 'ANSWERED') countAnswered++;
    else if (s === 'UNANSWERED') countNotAnswered++;
    else if (s === 'MARKED_FOR_REVIEW') countMarked++;
    else if (s === 'ANSWERED_AND_MARKED') countAnsweredAndMarked++;
    else countNotVisited++;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 select-none">
      {/* Official Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-sm text-indigo-600 font-mono tracking-tight">
            GATE SIMULATOR
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-xs text-slate-900 truncate max-w-md">{test.title}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Virtual Scientific Calculator Toggle */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showCalculator
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Virtual Calc</span>
          </button>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-amber-600">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Time Left: {formatTimer(remainingSeconds)}</span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowSubmitConfirm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-4"
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question View & Answer Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-50 text-slate-700">
                {currentQ.question_type}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                +{currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
              </span>
              {currentQ.negative_marks > 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700">
                  -{currentQ.negative_marks} Neg
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-50 text-slate-500">
                  No Negative Marks
                </span>
              )}
            </div>

            <span className="text-xs text-indigo-600 font-semibold font-mono">
              Section: {currentQ.subject}
            </span>
          </div>

          {/* Question Statement */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 font-sans leading-relaxed whitespace-pre-line">
            {currentQ.question_statement}
          </div>

          {/* Diagram if available */}
          {currentQ.diagram_url && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
              <img src={currentQ.diagram_url} alt="Exam Diagram" className="max-h-56 mx-auto rounded-lg" />
            </div>
          )}

          {/* Answer Controls */}
          <div className="space-y-3 pt-2">
            {/* MCQ */}
            {currentQ.question_type === 'MCQ' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswerData.answer === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-slate-900 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-xs text-slate-800 leading-normal mt-0.5">{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MSQ */}
            {currentQ.question_type === 'MSQ' && currentQ.options && (
              <div className="space-y-2">
                {currentQ.options.map((opt) => {
                  const isChecked = Array.isArray(currentAnswerData.answer) && currentAnswerData.answer.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50 text-slate-900 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
                          isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'
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

            {/* NAT */}
            {currentQ.question_type === 'NAT' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={currentAnswerData.answer || ''}
                  onChange={(e) => handleNatInputChange(e.target.value)}
                  placeholder="Enter numeric response (use virtual calc for decimals)..."
                  className="w-full max-w-md px-4 py-3 bg-white border border-slate-200 rounded-xl text-base font-mono text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 mt-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkForReviewAndNext}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs h-9"
              >
                Mark for Review & Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearResponse}
                className="border-slate-200 text-slate-500 hover:text-slate-900 text-xs h-9"
              >
                Clear Response
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="border-slate-200 text-slate-700 text-xs h-9"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <Button
                size="sm"
                onClick={handleSaveAndNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 flex items-center gap-1"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Sidebar */}
        <div className="w-80 bg-white border-l border-slate-200 p-5 flex flex-col space-y-5 shrink-0 overflow-y-auto">
          {/* Palette Legend */}
          <div className="space-y-2 text-[11px] font-semibold border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-4 h-4 rounded-sm bg-emerald-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {countAnswered}
                </span>
                Answered
              </span>
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-4 h-4 rounded-sm bg-rose-500 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {countNotAnswered}
                </span>
                Not Answered
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-4 h-4 rounded-sm bg-purple-600 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {countMarked}
                </span>
                Marked for Review
              </span>
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-4 h-4 rounded-sm bg-slate-100 text-slate-700 font-mono text-[9px] flex items-center justify-center font-bold">
                  {countNotVisited}
                </span>
                Not Visited
              </span>
            </div>

            <div className="pt-1">
              <span className="flex items-center gap-2 text-slate-700">
                <span className="w-4 h-4 rounded-sm bg-purple-600 border-2 border-emerald-400 text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {countAnsweredAndMarked}
                </span>
                Answered & Marked for Review
              </span>
            </div>
          </div>

          {/* Question Grid Buttons */}
          <div className="space-y-2 flex-1">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Choose a Question</h4>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {questions.map((q, idx) => {
                const s = answers[q.id]?.status || 'NOT_VISITED';
                const isCurrent = idx === currentIdx;

                let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
                if (s === 'ANSWERED') bgClass = 'bg-emerald-600 text-white border-emerald-500';
                if (s === 'UNANSWERED') bgClass = 'bg-rose-600 text-white border-rose-500';
                if (s === 'MARKED_FOR_REVIEW') bgClass = 'bg-purple-600 text-white border-purple-500';
                if (s === 'ANSWERED_AND_MARKED') bgClass = 'bg-purple-600 text-white border-2 border-emerald-400';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-400 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scientific Calculator Modal */}
      {showCalculator && (
        <div className="fixed bottom-16 right-6 w-72 bg-white border border-indigo-200 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              GATE Scientific Calculator
            </span>
            <button onClick={() => setShowCalculator(false)} className="text-slate-500 hover:text-slate-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-right font-mono text-sm font-bold text-emerald-600 truncate">
            {calcInput || '0'}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
            {['sin', 'cos', 'tan', 'C', 'ln', 'log', 'sqrt', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')'].map((k) => (
              <button
                key={k}
                onClick={() => {
                  if (k === 'C') setCalcInput('');
                  else if (k === 'sqrt') setCalcInput((p) => p + 'Math.sqrt(');
                  else if (k === 'sin') setCalcInput((p) => p + 'Math.sin(');
                  else if (k === 'cos') setCalcInput((p) => p + 'Math.cos(');
                  else if (k === 'tan') setCalcInput((p) => p + 'Math.tan(');
                  else if (k === 'log') setCalcInput((p) => p + 'Math.log10(');
                  else if (k === 'ln') setCalcInput((p) => p + 'Math.log(');
                  else setCalcInput((p) => p + k);
                }}
                className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => {
              try {
                // Safely evaluate math expression
                const res = Function(`'use strict'; return (${calcInput})`)();
                setCalcInput(String(Math.round(res * 10000) / 10000));
              } catch {
                setCalcInput('Error');
              }
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-xs"
          >
            = (Calculate)
          </Button>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Confirm Exam Submission
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to end this examination? Once submitted, answers cannot be modified.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold p-4 bg-white rounded-xl border border-slate-200">
              <div className="text-slate-500">Total Questions:</div>
              <div className="text-slate-900 text-right">{questions.length}</div>

              <div className="text-emerald-600">Answered:</div>
              <div className="text-emerald-700 text-right">{countAnswered + countAnsweredAndMarked}</div>

              <div className="text-rose-600">Unanswered / Not Visited:</div>
              <div className="text-rose-700 text-right">{countNotAnswered + countNotVisited}</div>

              <div className="text-purple-600">Marked for Review:</div>
              <div className="text-purple-700 text-right">{countMarked}</div>

              <div className="text-amber-600">Time Left:</div>
              <div className="text-amber-700 text-right">{formatTimer(remainingSeconds)}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitConfirm(false)}
                className="border-slate-200 text-slate-700 text-xs"
              >
                Back to Exam
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={performSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Test'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
