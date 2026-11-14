// src/features/languages/components/LanguageOnboardingModal.tsx
// Onboarding wizard for enrolling in a language

import * as React from 'react';
import {
  X,
  Languages,
  CheckCircle2,
  Compass,
  Briefcase,
  GraduationCap,
  Plane,
  MessageCircle,
  Award,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { LanguageEntry, LearningPurpose, StudentProficiencyLevel } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface LanguageOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageEntry | null;
  onEnrolled: (enrollment: any) => void;
}

export function LanguageOnboardingModal({
  isOpen,
  onClose,
  language,
  onEnrolled,
}: LanguageOnboardingModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [purpose, setPurpose] = React.useState<LearningPurpose>('CAREER');
  const [currentLevel, setCurrentLevel] = React.useState<StudentProficiencyLevel>('COMPLETE_BEGINNER');
  const [targetLevel, setTargetLevel] = React.useState('B2 (Conversational Fluency)');
  const [explanationLanguage, setExplanationLanguage] = React.useState('English');
  const [dailyGoalMinutes, setDailyGoalMinutes] = React.useState<number>(15);
  const [selectedMethods, setSelectedMethods] = React.useState<string[]>([
    'INTERACTIVE_LESSONS',
    'VOCABULARY_FLASHCARDS',
    'AI_CONVERSATION',
  ]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !language) return null;

  const purposeOptions: Array<{ key: LearningPurpose; label: string; desc: string; icon: any }> = [
    { key: 'CAREER', label: 'Career & Tech Jobs', desc: 'Global corporate & MNC opportunities', icon: Briefcase },
    { key: 'STUDY_ABROAD', label: 'Studying Abroad', desc: 'Higher education & international university prep', icon: Plane },
    { key: 'EDUCATION', label: 'Academic & Engineering', desc: 'Technical literature & scientific research', icon: GraduationCap },
    { key: 'TRAVEL', label: 'Travel & Tourism', desc: 'Navigating flights, hotels, dining & sightseeing', icon: Compass },
    { key: 'COMMUNICATION', label: 'Communication & Friends', desc: 'Connecting with native speakers and community', icon: MessageCircle },
    { key: 'EXAMS', label: 'Language Certifications', desc: 'DELE, Goethe, JLPT, TOPIK, HSK exams', icon: Award },
    { key: 'CULTURE', label: 'Culture & Media', desc: 'Cinema, music, literature, and heritage', icon: Sparkles },
  ];

  const levelOptions: Array<{ key: StudentProficiencyLevel; cefr: string; label: string; desc: string }> = [
    { key: 'COMPLETE_BEGINNER', cefr: 'A1', label: 'Complete Beginner (A1)', desc: 'Zero prior knowledge. Starting from script & alphabet.' },
    { key: 'BEGINNER', cefr: 'A1', label: 'Elementary / False Beginner (A1-A2)', desc: 'Know a few greetings, numbers, and basic nouns.' },
    { key: 'ELEMENTARY', cefr: 'A2', label: 'Lower Intermediate (A2)', desc: 'Can make simple sentences and order food.' },
    { key: 'INTERMEDIATE', cefr: 'B1', label: 'Intermediate (B1)', desc: 'Can hold routine conversations and write short messages.' },
    { key: 'UPPER_INTERMEDIATE', cefr: 'B2', label: 'Upper Intermediate (B2)', desc: 'Understand main ideas and speak spontaneously.' },
    { key: 'ADVANCED', cefr: 'C1', label: 'Advanced (C1-C2)', desc: 'Near-native fluency for professional & technical topics.' },
  ];

  const methodOptions = [
    { key: 'INTERACTIVE_LESSONS', label: 'Structured Lessons', desc: 'Step-by-step grammar and writing rules' },
    { key: 'VOCABULARY_FLASHCARDS', label: 'Spaced Repetition', desc: 'SM-2 memory retention flashcards' },
    { key: 'AI_CONVERSATION', label: 'AI Partner Practice', desc: 'Interactive conversational chat with feedback' },
    { key: 'AUDIO_PRONUNCIATION', label: 'Listening & Audio', desc: 'Pronunciation and speech recognition' },
    { key: 'WRITING_PRACTICE', label: 'Written Expression', desc: 'Short essays, emails, and translations' },
  ];

  const toggleMethod = (key: string) => {
    if (selectedMethods.includes(key)) {
      if (selectedMethods.length > 1) {
        setSelectedMethods(selectedMethods.filter((m) => m !== key));
      }
    } else {
      setSelectedMethods([...selectedMethods, key]);
    }
  };

  const handleEnroll = async () => {
    try {
      setIsSubmitting(true);
      const enrollment = await languageApi.enroll(language.code, {
        purpose,
        current_level: currentLevel,
        target_level: targetLevel,
        explanation_language: explanationLanguage,
        daily_goal_minutes: dailyGoalMinutes,
        preferred_methods: selectedMethods,
      });

      toast.success(`Successfully enrolled in ${language.name}!`);
      onEnrolled(enrollment);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll in language.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{language.flag_emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Start Learning {language.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                  {language.native_name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalized Learning Pathway Setup • Step {step} of 3
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-50 h-1">
          <div
            className="bg-indigo-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* STEP 1: Purpose & Explanation Language */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Why are you learning {language.name}?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We'll tailor vocabulary, conversational scenarios, and examples to your primary objective.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {purposeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = purpose === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setPurpose(opt.key)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-slate-900 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{opt.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Preferred Language for Explanations & Translations:
                </label>
                <select
                  value={explanationLanguage}
                  onChange={(e) => setExplanationLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="English">English (Standard)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="German">German (Deutsch)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Current & Target Proficiency Levels */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-semibold text-slate-900">What is your current level in {language.name}?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mapped approximately to the CEFR standard. You can retake or adjust this anytime.
                </p>
              </div>

              <div className="space-y-2.5">
                {levelOptions.map((opt) => {
                  const isSelected = currentLevel === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setCurrentLevel(opt.key)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-slate-900 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span>{opt.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {opt.cefr}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Target Fluency Goal:</label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="A2 (Basic Everyday Travel)">A2 — Basic Everyday Travel & Daily Life</option>
                  <option value="B1 (Conversational Independence)">B1 — Conversational Independence</option>
                  <option value="B2 (Professional Fluency & Work)">B2 — Professional Fluency & Technical Work</option>
                  <option value="C1 (Advanced Proficiency & University)">C1 — Advanced Proficiency & Higher Studies</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Daily Commitment & Learning Methods */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Daily Study Commitment</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Consistent micro-learning is the fastest way to acquire a language.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[5, 10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoalMinutes(mins)}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      dailyGoalMinutes === mins
                        ? 'border-indigo-500 bg-indigo-50 text-slate-900 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <div className="text-lg font-bold text-slate-900">{mins}</div>
                    <div className="text-[11px] text-slate-500">mins / day</div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Preferred Learning Modalities:</h4>
                <div className="space-y-2">
                  {methodOptions.map((opt) => {
                    const isChecked = selectedMethods.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleMethod(opt.key)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isChecked
                            ? 'border-indigo-200 bg-indigo-50 text-slate-900'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-medium text-slate-800">{opt.label}</div>
                          <div className="text-[11px] text-slate-500">{opt.desc}</div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-600'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleEnroll}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Starting...</>
              ) : (
                <>
                  Start Learning Now <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
