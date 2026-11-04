// src/features/languages/components/LanguageQuizView.tsx
// Interactive quizzes and assessments with real scoring and explanations

import * as React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { LanguageQuizQuestion, QuizSubmissionResult, LanguageEntry } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface LanguageQuizViewProps {
  language: LanguageEntry;
  onBack: () => void;
}

export function LanguageQuizView({ language, onBack }: LanguageQuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, number>>({});
  const [result, setResult] = React.useState<QuizSubmissionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Default quiz questions for language
  const questions: LanguageQuizQuestion[] = [
    {
      id: 'q1',
      type: 'MCQ',
      question: `What is the polite, universal greeting in ${language.name}?`,
      options: [
        language.sample_phrase.split(' ')[0] || language.name,
        'Hasta nunca',
        'Adiós definitivo',
        'Buenas pesadillas',
      ],
      correct_index: 0,
      explanation: `"${language.sample_phrase.split(' ')[0] || language.name}" is the fundamental polite greeting in ${language.name}.`,
    },
    {
      id: 'q2',
      type: 'MCQ',
      question: `Which script is natively used to write ${language.name}?`,
      options: [language.scripts[0] || 'Latin', 'Egyptian Demotic', 'Linear B', 'Ogham'],
      correct_index: 0,
      explanation: `${language.name} is written in the ${language.scripts.join(', ')} script.`,
    },
    {
      id: 'q3',
      type: 'MCQ',
      question: `What is the primary text direction of ${language.name}?`,
      options: [
        language.direction === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)',
        language.direction === 'rtl' ? 'Left-to-Right (LTR)' : 'Right-to-Left (RTL)',
        'Boustrophedon (Alternating)',
        'Vertical top-to-bottom only',
      ],
      correct_index: 0,
      explanation: `${language.name} is written ${language.direction === 'rtl' ? 'Right-to-Left' : 'Left-to-Right'}.`,
    },
    {
      id: 'q4',
      type: 'MCQ',
      question: `In formal contexts in ${language.name}, which principle is most critical?`,
      options: [
        'Using proper polite honorifics and respectful verb forms',
        'Speaking as loud as possible',
        'Omitting all vowels',
        'Using slang words exclusively',
      ],
      correct_index: 0,
      explanation: 'Polite honorifics distinguish formal professional and elder communication in most languages.',
    },
  ];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const answersPayload = Object.entries(selectedAnswers).map(([qid, idx]) => ({
        question_id: qid,
        selected_index: idx,
      }));

      const res = await languageApi.submitQuiz(language.code, `quiz_${language.code}_1`, answersPayload);
      setResult(res);
      toast.success(res.passed ? 'Quiz Passed! Great job.' : 'Quiz completed. Review your mistakes below.');
    } catch (err: any) {
      toast.error('Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="text-xs text-slate-400 font-mono">
          Assessment • {language.name}
        </div>
      </div>

      {/* Result Card */}
      {result ? (
        <div className="space-y-6 animate-in fade-in">
          <div
            className={`p-6 rounded-3xl border text-center space-y-3 ${
              result.passed
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="text-4xl font-extrabold font-mono">
              {result.score_percentage}%
            </div>
            <div className="text-base font-bold text-white">
              {result.passed ? 'Assessment Passed! Outstanding Work' : 'Review Needed to Pass (70% required)'}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You answered {result.correct_count} of {result.total_questions} questions correctly.
            </p>
            <div className="pt-2">
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
              </button>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Question Review & Explanations</h3>
            {result.question_results.map((qr, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Question {i + 1}</span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 ${
                      qr.is_correct ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {qr.is_correct ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </>
                    )}
                  </span>
                </div>
                <div className="text-sm font-medium text-white">{qr.question}</div>
                <div className="text-xs text-slate-400">
                  Your Answer: <strong className={qr.is_correct ? 'text-emerald-300' : 'text-rose-300'}>{qr.user_answer}</strong>
                </div>
                {!qr.is_correct && (
                  <div className="text-xs text-slate-400">
                    Correct Answer: <strong className="text-emerald-400">{qr.correct_answer}</strong>
                  </div>
                )}
                <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  <span className="text-indigo-400 font-semibold">Note:</span> {qr.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Form */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-1">
              {language.name} Foundation & Culture Quiz
            </h2>
            <p className="text-xs text-slate-400">
              Answer all 4 questions to evaluate your understanding of essential {language.name} greetings, script, and polite conversation rules.
            </p>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="text-xs text-indigo-400 font-mono font-semibold">
                  Question {idx + 1} of {questions.length}
                </div>
                <h3 className="text-sm font-semibold text-white">{q.question}</h3>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                            : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <span className="text-xs text-slate-400">
              {Object.keys(selectedAnswers).length} of {questions.length} answered
            </span>
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || Object.keys(selectedAnswers).length < questions.length}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <>Grading...</> : <>Submit Assessment <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
