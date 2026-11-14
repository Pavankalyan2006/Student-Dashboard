import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import { PlacementQuestion, PlacementAssessmentResult } from '../types/placement';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const PlacementAssessmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultCategory,
}) => {
  const queryClient = useQueryClient();

  // Setup state
  const [stage, setStage] = useState<'CONFIG' | 'TEST' | 'RESULTS'>('CONFIG');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory || 'APTITUDE');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('MEDIUM');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(10);

  // Active Test state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<PlacementAssessmentResult | null>(null);

  // Fetch available questions
  const { data: allQuestions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['placement-questions', selectedCategory],
    queryFn: () => placementsApi.getQuestions(undefined, selectedCategory),
    enabled: isOpen,
  });

  // Filter test questions based on selection
  const testQuestions: PlacementQuestion[] = React.useMemo(() => {
    let pool = allQuestions;
    if (selectedDifficulty) {
      const match = pool.filter((q) => q.difficulty === selectedDifficulty);
      if (match.length >= 3) pool = match;
    }
    return pool.slice(0, questionCount);
  }, [allQuestions, selectedDifficulty, questionCount]);

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: (submission: any) => placementsApi.submitAssessment(submission),
    onSuccess: (data) => {
      setAssessmentResult(data);
      setStage('RESULTS');
      queryClient.invalidateQueries({ queryKey: ['placement-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['placement-readiness'] });
    },
  });

  // Timer effect
  useEffect(() => {
    if (stage !== 'TEST' || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(); // Auto-submit on expiration
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, secondsRemaining]);

  if (!isOpen) return null;

  const handleStartTest = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSecondsRemaining(durationMinutes * 60);
    setStage('TEST');
  };

  const handleSelectAnswer = (qId: string, val: string | number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitTest = () => {
    setShowConfirmSubmit(false);
    const timeSpent = durationMinutes * 60 - secondsRemaining;
    submitMutation.mutate({
      title: `${selectedCategory.replace('_', ' ')} Timed Assessment`,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      time_spent_seconds: Math.max(10, timeSpent),
      answers,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = testQuestions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Placement Assessment Engine</h3>
              <p className="text-[11px] text-slate-500">Timed practice with server-side validation & explanations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STAGE 1: CONFIGURATION */}
          {stage === 'CONFIG' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Configure Your Timed Assessment</h4>
                <p className="text-xs text-slate-500">
                  Select assessment category, difficulty level, and time allowance to simulate real hiring screening rounds.
                </p>
              </div>

              {/* Category Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assessment Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'APTITUDE', label: 'Quantitative Aptitude' },
                    { id: 'LOGICAL_REASONING', label: 'Logical Reasoning' },
                    { id: 'VERBAL', label: 'Verbal Ability' },
                    { id: 'DBMS', label: 'SQL & Database Systems' },
                    { id: 'OPERATING_SYSTEMS', label: 'Operating Systems' },
                    { id: 'COMPUTER_NETWORKS', label: 'Computer Networks' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedCategory === cat.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['EASY', 'MEDIUM', 'HARD'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDifficulty(d)}
                        className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all ${
                          selectedDifficulty === d
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Duration & Questions</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setQuestionCount(5);
                        setDurationMinutes(5);
                      }}
                      className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all ${
                        questionCount === 5
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      5 Qs (5 mins)
                    </button>
                    <button
                      onClick={() => {
                        setQuestionCount(10);
                        setDurationMinutes(12);
                      }}
                      className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all ${
                        questionCount === 10
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      10 Qs (12 mins)
                    </button>
                  </div>
                </div>
              </div>

              {/* Rules / Disclaimers Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  Assessment Guidelines
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-500">
                  <li>Timer begins immediately once you launch the test.</li>
                  <li>Questions auto-submit when the countdown expires.</li>
                  <li>Scores are calculated strictly on the backend; step-by-step solutions are revealed after completion.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleStartTest}
                  disabled={testQuestions.length === 0 || isQuestionsLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>Start Timed Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: ACTIVE TEST SESSION */}
          {stage === 'TEST' && currentQ && (
            <div className="space-y-6">
              {/* Question Navigation Palette & Timer */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {testQuestions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    secondsRemaining < 60
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(secondsRemaining)}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Question {currentIndex + 1} of {testQuestions.length}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {currentQ.difficulty}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {currentQ.question_text}
                </h4>

                {/* Multiple Choice Options */}
                {currentQ.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQ.id] === opt;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectAnswer(currentQ.id, opt)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className="text-xs font-medium">{opt}</span>
                          <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Controls: Prev / Next / Submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 border border-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < testQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(testQuestions.length - 1, prev + 1))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Submit Test
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: TEST RESULTS & ANSWER REVIEW */}
          {stage === 'RESULTS' && assessmentResult && (
            <div className="space-y-6">
              {/* Score Header Card */}
              <div className="hero-brand text-white p-6 rounded-2xl text-center space-y-2 shadow-md">
                <div className="inline-flex p-3 bg-white/10 rounded-full mb-1">
                  <Award className="h-8 w-8 text-amber-300" />
                </div>
                <h4 className="text-xl font-extrabold">{assessmentResult.title} Results</h4>
                <div className="text-3xl font-black text-emerald-400">
                  {assessmentResult.score_percentage}%
                </div>
                <p className="text-xs text-blue-200">
                  You scored {assessmentResult.correct_answers} out of {assessmentResult.total_questions} questions correct in {Math.round(assessmentResult.time_spent_seconds / 60)} minutes.
                </p>
              </div>

              {/* Weak Topics Flagged */}
              {assessmentResult.weak_topics.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Identified Topics Needing Revision
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {assessmentResult.weak_topics.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-[11px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Review List with Explanations */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 text-sm">Detailed Question Solutions</h5>
                <div className="space-y-3">
                  {assessmentResult.detailed_results.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border ${
                        res.is_correct
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-rose-200 bg-rose-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-bold text-xs text-slate-800">Q{idx + 1}. {res.question_text}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {res.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-500">Your Answer: </span>
                          <span className={res.is_correct ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {res.submitted_answer || 'Skipped'}
                          </span>
                        </div>
                        {!res.is_correct && (
                          <div>
                            <span className="font-semibold text-slate-500">Correct Answer: </span>
                            <span className="text-slate-800 font-bold">{res.correct_answer}</span>
                          </div>
                        )}
                        <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-slate-700 bg-white/70 p-2.5 rounded-xl">
                          <span className="font-bold text-blue-700">Explanation: </span>
                          {res.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retake / Finish actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setStage('CONFIG')}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retake Test
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white p-5 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Submit Assessment?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You have answered {Object.keys(answers).length} out of {testQuestions.length} questions.
                Are you ready to submit and calculate your authoritative score?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Review Questions
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={submitMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {submitMutation.isPending ? 'Scoring...' : 'Yes, Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
