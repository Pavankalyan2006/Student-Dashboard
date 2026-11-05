// src/features/languages/components/LessonWorkspaceView.tsx
// Comprehensive 15-section interactive lesson workspace with audio, native script, and exercises

import * as React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Volume2,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  Award,
  ChevronRight,
  Save,
} from 'lucide-react';
import { LanguageLessonDetail, LanguageEntry } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface LessonWorkspaceViewProps {
  lesson: LanguageLessonDetail;
  language: LanguageEntry;
  onBack: () => void;
  onCompleted: () => void;
}

export function LessonWorkspaceView({
  lesson,
  language,
  onBack,
  onCompleted,
}: LessonWorkspaceViewProps) {
  const [activeTab, setActiveTab] = React.useState<'lesson' | 'grammar' | 'vocabulary' | 'practice'>('lesson');
  const [exerciseAnswers, setExerciseAnswers] = React.useState<Record<string, string>>({});
  const [exerciseEvaluated, setExerciseEvaluated] = React.useState<Record<string, boolean>>({});
  const [studentNotes, setStudentNotes] = React.useState(lesson.student_notes || '');
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(!!lesson.is_completed);

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectAnswer = (exerciseId: string, answer: string) => {
    setExerciseAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
    setExerciseEvaluated((prev) => ({ ...prev, [exerciseId]: true }));
  };

  const handleCompleteLesson = async () => {
    try {
      setIsCompleting(true);
      await languageApi.completeLesson(language.code, lesson.id, studentNotes);
      setIsCompleted(true);
      toast.success('Lesson completed.');
      onCompleted();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save lesson progress.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            {lesson.level}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" /> {lesson.estimated_duration_min} mins
          </span>
          {isCompleted && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </div>
      </div>

      {/* Lesson Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{language.flag_emoji}</span>
          <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{language.name} Foundation</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{lesson.title}</h2>
      </div>

      {/* Learning Objectives Checklist */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> Learning Objectives
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lesson.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lesson Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        {[
          { key: 'lesson', label: 'Lesson Content', icon: BookOpen },
          { key: 'grammar', label: 'Grammar Notes', icon: FileText },
          { key: 'vocabulary', label: 'Vocabulary', icon: Layers },
          { key: 'practice', label: 'Practice Exercises', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Lesson Content */}
      {activeTab === 'lesson' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Detailed Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-2">Lesson Overview & Context</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{lesson.explanation}</p>
          </div>

          {/* Native Script Examples */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Key Phrases & Examples</h3>
            <div className="space-y-3">
              {lesson.native_script_examples.map((ex, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                  dir={language.direction}
                >
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-white">{ex.target}</div>
                    {ex.transliteration && (
                      <div className="text-xs text-indigo-400 font-mono" dir="ltr">
                        /{ex.transliteration}/
                      </div>
                    )}
                    <div className="text-xs text-slate-400" dir="ltr">
                      "{ex.translation}"
                    </div>
                    {ex.breakdown && (
                      <div className="text-[11px] text-slate-500 italic" dir="ltr">
                        {ex.breakdown}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => playSpeech(ex.target)}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors shrink-0"
                    title="Listen to pronunciation"
                    dir="ltr"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Grammar Notes */}
      {activeTab === 'grammar' && (
        <div className="space-y-4 animate-in fade-in">
          {lesson.grammar_notes.map((g, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> {g.concept}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {g.rule}
              </p>
              <div className="text-xs font-mono text-indigo-400 bg-indigo-950/20 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                Pattern: {g.pattern}
              </div>

              {/* Positive Examples */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Correct Examples:</span>
                {g.positive_examples.map((pe, idx) => (
                  <div key={idx} className="text-xs text-slate-300 pl-2 border-l-2 border-emerald-500">
                    {pe}
                  </div>
                ))}
              </div>

              {/* Common Mistakes */}
              {g.common_mistakes && g.common_mistakes.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Common Pitfalls:</span>
                  {g.common_mistakes.map((cm, idx) => (
                    <div key={idx} className="text-xs text-slate-400 pl-2 border-l-2 border-amber-500">
                      {cm}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Vocabulary List */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lesson.vocabulary.map((v) => (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{v.word}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {v.part_of_speech}
                    </span>
                  </div>
                  {v.transliteration && (
                    <div className="text-xs text-indigo-400 font-mono mt-0.5">/{v.transliteration}/</div>
                  )}
                  <div className="text-xs text-slate-300 font-medium mt-1">{v.translation}</div>
                  <div className="text-[11px] text-slate-500 mt-1 italic">"{v.example_sentence}"</div>
                </div>

                <button
                  onClick={() => playSpeech(v.word)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors shrink-0"
                  title="Pronounce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Interactive Practice Exercises */}
      {activeTab === 'practice' && (
        <div className="space-y-4 animate-in fade-in">
          {lesson.interactive_exercises.map((ex) => {
            const isEvaluated = !!exerciseEvaluated[ex.id];
            const studentChoice = exerciseAnswers[ex.id];
            const isCorrect = studentChoice === ex.correct_answer;

            return (
              <div key={ex.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {ex.type}
                  </span>
                  {isEvaluated && (
                    <span
                      className={`text-xs font-semibold ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white">{ex.prompt}</h4>

                {/* Multiple Choice Options */}
                {ex.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ex.options.map((opt) => {
                      const isOptionSelected = studentChoice === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectAnswer(ex.id, opt)}
                          className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                            isOptionSelected
                              ? isCorrect
                                ? 'border-emerald-500 bg-emerald-950/30 text-white'
                                : 'border-rose-500 bg-rose-950/30 text-white'
                              : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {isEvaluated && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-indigo-400">Explanation:</strong> {ex.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Student Personal Notes Scratchpad */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5 text-indigo-400" /> Student Notes & Key Takeaways
        </label>
        <textarea
          rows={3}
          value={studentNotes}
          onChange={(e) => setStudentNotes(e.target.value)}
          placeholder="Jot down memory hooks, tricky pronunciations, or grammar doubts..."
          className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Complete Lesson Action */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </button>

        <button
          onClick={handleCompleteLesson}
          disabled={isCompleting || isCompleted}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-colors disabled:opacity-60"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Lesson Completed
            </>
          ) : isCompleting ? (
            <>Saving Progress...</>
          ) : (
            <>
              Mark as Completed <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
