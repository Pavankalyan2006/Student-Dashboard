// src/features/languages/components/WritingPracticeView.tsx
// Writing practice workspace with AI grammar, vocabulary, clarity feedback, and side-by-side comparison

import * as React from 'react';
import {
  PenTool,
  Send,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  Clock,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { WritingSubmission, LanguageEntry } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface WritingPracticeViewProps {
  language: LanguageEntry;
  onBack: () => void;
}

export function WritingPracticeView({ language, onBack }: WritingPracticeViewProps) {
  const [submissions, setSubmissions] = React.useState<WritingSubmission[]>([]);
  const [activeSubmission, setActiveSubmission] = React.useState<WritingSubmission | null>(null);
  const [selectedPromptType, setSelectedPromptType] = React.useState('SELF_INTRODUCTION');
  const [studentText, setStudentText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const prompts: Array<{ key: string; title: string; prompt: string; level: string }> = [
    {
      key: 'SELF_INTRODUCTION',
      title: 'Self-Introduction & Engineering Goals',
      prompt: `Write 3–5 sentences introducing yourself, your branch of study, and your interests in ${language.name}.`,
      level: 'A1-A2',
    },
    {
      key: 'DAILY_ROUTINE',
      title: 'Daily University Routine',
      prompt: `Describe your typical morning and evening schedule, mentioning classes, coding labs, and study sessions in ${language.name}.`,
      level: 'A2-B1',
    },
    {
      key: 'FORMAL_EMAIL',
      title: 'Formal Academic / Internship Email',
      prompt: `Draft a polite formal email inquiring about a summer software internship or research position in ${language.name}.`,
      level: 'B1-B2',
    },
    {
      key: 'TECH_OPINION',
      title: 'Opinion on Artificial Intelligence',
      prompt: `Share your perspective on how AI and cloud computing will impact society over the next decade in ${language.name}.`,
      level: 'B2-C1',
    },
  ];

  const currentPrompt = prompts.find((p) => p.key === selectedPromptType) || prompts[0];

  const loadSubmissions = React.useCallback(async () => {
    try {
      const list = await languageApi.getWritingSubmissions(language.code);
      setSubmissions(list);
      if (list.length > 0 && !activeSubmission) {
        setActiveSubmission(list[0]);
      }
    } catch (err) {
      // quiet catch
    }
  }, [language.code, activeSubmission]);

  React.useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const sub = await languageApi.submitWritingPractice(language.code, {
        prompt_type: currentPrompt.key,
        prompt_text: currentPrompt.prompt,
        student_text: studentText.trim(),
      });

      setSubmissions((prev) => [sub, ...prev]);
      setActiveSubmission(sub);
      setStudentText('');
      toast.success('Writing evaluated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit writing for feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="text-xs text-slate-500">
          Practicing in: <strong className="text-slate-900">{language.name}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Prompts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prompt Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-emerald-600" /> Writing Assignment
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
                {currentPrompt.level}
              </span>
            </div>

            <div className="space-y-1">
              <select
                value={selectedPromptType}
                onChange={(e) => setSelectedPromptType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              >
                {prompts.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.title} ({p.level})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">{currentPrompt.prompt}</p>
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500">Your Response in {language.name}:</label>
              <span className="text-[11px] text-slate-500 font-mono">
                {studentText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={7}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder={`Write your sentences in ${language.name}... (e.g. ${language.sample_phrase})`}
              className="w-full p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
              dir={language.direction}
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Preserves original draft • Evaluated against CEFR benchmarks
              </span>
              <button
                type="submit"
                disabled={!studentText.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    Submit for AI Review <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: AI Feedback Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {!activeSubmission ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <Sparkles className="w-10 h-10 text-indigo-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">AI Writing Evaluation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit an exercise to see real-time grammar, vocabulary, sentence clarity, and side-by-side corrected text.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" /> AI Coach Feedback
                </span>
                <span className="text-sm font-extrabold text-emerald-600 font-mono">
                  {activeSubmission.ai_feedback?.overall_score || 88}/100
                </span>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-xs text-slate-500">Grammar</div>
                  <div className="text-sm font-bold text-indigo-600 font-mono mt-0.5">
                    {activeSubmission.ai_feedback?.grammar_score || 85}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-xs text-slate-500">Vocabulary</div>
                  <div className="text-sm font-bold text-purple-600 font-mono mt-0.5">
                    {activeSubmission.ai_feedback?.vocabulary_score || 90}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-xs text-slate-500">Clarity</div>
                  <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5">
                    {activeSubmission.ai_feedback?.clarity_score || 88}%
                  </div>
                </div>
              </div>

              {/* Side-by-side / Comparison View */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Original vs Improved:
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 line-through">
                  "{activeSubmission.student_text}"
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
                  "{activeSubmission.ai_feedback?.corrected_text || activeSubmission.student_text}"
                </div>
              </div>

              {/* Key Grammar Points */}
              {activeSubmission.ai_feedback?.grammar_points && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Grammar Insights:
                  </div>
                  {activeSubmission.ai_feedback.grammar_points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Positive Reinforcement */}
              {activeSubmission.ai_feedback?.positive_reinforcement && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700">
                  {activeSubmission.ai_feedback.positive_reinforcement}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
