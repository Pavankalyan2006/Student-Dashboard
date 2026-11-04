// src/features/system-design/components/LessonDetailModal.tsx
// Comprehensive Lesson Reader with Markdown Content, Trade-Offs, and Knowledge Check Quiz

import * as React from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SystemDesignLesson } from '../types/systemDesign';
import { toast } from 'sonner';

interface LessonDetailModalProps {
  lesson: SystemDesignLesson;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (lessonId: string, quizScore: number) => Promise<void>;
  isCompleted?: boolean;
}

export function LessonDetailModal({
  lesson,
  isOpen,
  onClose,
  onComplete,
  isCompleted = false
}: LessonDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<'lesson' | 'quiz'>('lesson');
  const [quizAnswers, setQuizAnswers] = React.useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  if (!isOpen || !lesson) return null;

  const questions = lesson.knowledge_check || [];

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedQuiz) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const calculateScore = () => {
    if (questions.length === 0) return 100;
    let correct = 0;
    questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct_option_index) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleQuizSubmit = async () => {
    if (Object.keys(quizAnswers).length < questions.length) {
      toast.warning('Please answer all knowledge check questions before submitting.');
      return;
    }
    const score = calculateScore();
    setSubmittedQuiz(true);

    if (score >= 60) {
      try {
        setSubmitting(true);
        await onComplete(lesson.id, score);
        toast.success(`Passed knowledge check with ${score}%! Lesson marked complete.`);
      } catch (err: any) {
        toast.error('Failed to record completion: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      toast.error(`Score ${score}% is below passing threshold (60%). Review the explanations and retry.`);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setSubmittedQuiz(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Level {lesson.level}: {lesson.level_name}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {lesson.estimated_minutes} min read
              </span>
              {isCompleted && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{lesson.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'lesson'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Curriculum Content
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Knowledge Check Quiz ({questions.length})
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'lesson' ? (
            <div className="space-y-6">
              {/* Main Content Markdown */}
              <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm space-y-4">
                {lesson.content_markdown.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return <h3 key={idx} className="text-lg font-bold text-white mt-4">{paragraph.replace('# ', '')}</h3>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h4 key={idx} className="text-base font-bold text-indigo-300 mt-3">{paragraph.replace('### ', '')}</h4>;
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-1 text-slate-300">
                        {paragraph.split('\n').map((li, i) => (
                          <li key={i}>{li.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>

              {/* Key Architectural Decisions */}
              {lesson.key_decisions?.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2.5">
                    <Lightbulb className="w-4 h-4" />
                    Key Architectural Decisions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {lesson.key_decisions.map((kd, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{kd}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trade-Offs: Advantages vs Disadvantages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
                    <ThumbsUp className="w-4 h-4" />
                    Engineering Advantages
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {lesson.advantages?.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-2.5">
                    <ThumbsDown className="w-4 h-4" />
                    Disadvantages & Trade-offs
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {lesson.disadvantages?.map((dis, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">✗</span>
                        <span>{dis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Common Pitfalls / Anti-patterns */}
              {lesson.common_mistakes?.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
                    <AlertTriangle className="w-4 h-4" />
                    Common Interview Traps & Production Mistakes
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {lesson.common_mistakes.map((cm, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">!</span>
                        <span>{cm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practical Production Examples */}
              {lesson.practical_examples?.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Real-World Production Benchmark Examples
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {lesson.practical_examples.map((pe, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">→</span>
                        <span>{pe}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* Knowledge Check Quiz View */
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Interactive Knowledge Check</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Score at least 60% to formally mark this topic completed in your learning profile.
                  </p>
                </div>
                {submittedQuiz && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Score:</span>
                    <div className={`text-xl font-extrabold ${calculateScore() >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {calculateScore()}%
                    </div>
                  </div>
                )}
              </div>

              {questions.map((q, qIdx) => {
                const selectedOption = quizAnswers[q.id];
                const isCorrect = selectedOption === q.correct_option_index;

                return (
                  <div key={q.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="text-sm font-semibold text-slate-100 flex items-start gap-2">
                      <span className="text-indigo-400 font-mono text-xs mt-0.5">Q{qIdx + 1}.</span>
                      <span>{q.question}</span>
                    </div>

                    <div className="space-y-2 mt-3">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';
                        if (selectedOption === optIdx) {
                          btnStyle = 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500';
                        }
                        if (submittedQuiz) {
                          if (optIdx === q.correct_option_index) {
                            btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                          } else if (selectedOption === optIdx && !isCorrect) {
                            btnStyle = 'bg-red-950/70 border-red-500 text-red-200';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            disabled={submittedQuiz}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && optIdx === q.correct_option_index && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300">
                        <span className="font-bold text-indigo-300">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {activeTab === 'lesson' ? 'Read lesson thoroughly before taking quiz' : `${Object.keys(quizAnswers).length} of ${questions.length} answered`}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'lesson' ? (
              <Button
                onClick={() => setActiveTab('quiz')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                Take Knowledge Check Quiz <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : submittedQuiz ? (
              <Button onClick={handleResetQuiz} variant="outline" className="border-slate-700 text-slate-300 text-xs">
                Retry Quiz
              </Button>
            ) : (
              <Button
                onClick={handleQuizSubmit}
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
