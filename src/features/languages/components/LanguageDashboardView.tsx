// src/features/languages/components/LanguageDashboardView.tsx
// Personalized student dashboard for enrolled languages with real metrics

import * as React from 'react';
import {
  Flame,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Volume2,
  PenTool,
  MessageSquare,
  Globe,
  Award,
  Plus,
  Play,
  RotateCw,
} from 'lucide-react';
import { StudentLanguageEnrollment, LanguageEntry, LanguageLearningPath } from '../types/languageTypes';

interface LanguageDashboardViewProps {
  enrollments: StudentLanguageEnrollment[];
  activeEnrollment: StudentLanguageEnrollment | null;
  onSelectLanguage: (code: string) => void;
  dashboardData: any;
  onContinueLesson: (lessonId: string) => void;
  onStartRevision: () => void;
  onOpenSection: (sectionKey: string) => void;
  onExploreLanguages: () => void;
}

export function LanguageDashboardView({
  enrollments,
  activeEnrollment,
  onSelectLanguage,
  dashboardData,
  onContinueLesson,
  onStartRevision,
  onOpenSection,
  onExploreLanguages,
}: LanguageDashboardViewProps) {
  if (!activeEnrollment) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
        <Globe className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-900">No Enrolled Languages Yet</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Select from up to 150 supported world & regional languages like Spanish, German, Japanese, Telugu, Hindi, or French to start your learning journey.
        </p>
        <button
          onClick={onExploreLanguages}
          className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-600/25 flex items-center gap-2 mx-auto"
        >
          Explore All 150 Languages <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const lang = activeEnrollment.language;
  const paths: LanguageLearningPath[] = dashboardData?.learning_paths || [];
  const continueLesson = dashboardData?.continue_lesson;
  const dueVocabCount = dashboardData?.vocabulary_due_count || 0;
  const totalMastered = dashboardData?.mastered_vocab_count || 0;
  const completedLessons = dashboardData?.completed_lessons || 0;
  const totalLessons = dashboardData?.total_lessons || 15;
  const progressPct = dashboardData?.progress_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {enrollments.map((enr) => {
            const isSelected = enr.language_code === activeEnrollment.language_code;
            const l = enr.language;
            return (
              <button
                key={enr.language_code}
                onClick={() => onSelectLanguage(enr.language_code)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-slate-900 shadow-sm ring-1 ring-indigo-500/50'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-200'
                }`}
              >
                <span>{l?.flag_emoji || '🌐'}</span>
                <span>{l?.name || enr.language_code.toUpperCase()}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-700 font-mono">
                  {enr.cefr_level}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onExploreLanguages}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-200 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 text-xs font-medium whitespace-nowrap transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Language
        </button>
      </div>

      {/* Hero Active Language Card */}
      <div className="relative overflow-hidden rounded-2xl surface-hero border border-indigo-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl filter drop-shadow">{lang?.flag_emoji || '🌐'}</span>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-slate-900">{lang?.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-medium">
                  {lang?.native_name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
                  Level {activeEnrollment.cefr_level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl line-clamp-1">
                Goal: {activeEnrollment.purpose} • Target: {activeEnrollment.target_level} • Explanation: {activeEnrollment.explanation_language}
              </p>

              {/* Progress Bar */}
              <div className="mt-4 flex items-center gap-3 max-w-md">
                <div className="flex-1 bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {completedLessons}/{totalLessons} lessons ({progressPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-xl">
                <Flame className="w-5 h-5" /> {activeEnrollment.current_streak_days || 1}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Day Streak</div>
            </div>
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xl">
                <Layers className="w-5 h-5" /> {totalMastered}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Mastered Vocab</div>
            </div>
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-bold text-xl">
                <Clock className="w-5 h-5" /> {activeEnrollment.daily_goal_minutes}m
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Daily Goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Continue Learning & Vocabulary Due */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Continue Learning Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Current Lesson
              </span>
              <span className="text-emerald-600 font-medium">Ready to Resume</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {continueLesson ? continueLesson.title : `Lesson 1: Greetings & Introductions in ${lang?.name}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Master essential greetings, polite forms, vocabulary pronunciations, and basic sentence construction.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onContinueLesson(continueLesson ? continueLesson.lesson_id : `les_${activeEnrollment.language_code}_1`)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Continue Learning
            </button>
          </div>
        </div>

        {/* Spaced Repetition Due Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-600" /> Spaced Repetition
              </span>
              <span className="text-amber-600 font-mono text-xs font-semibold">SM-2 Algorithm</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {dueVocabCount > 0 ? `${dueVocabCount} Words Due for Review` : 'All Caught Up Today!'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {dueVocabCount > 0
                ? 'Review vocabulary cards at optimal intervals to lock them into long-term memory.'
                : 'Great job! You have reviewed all scheduled vocabulary cards for today. Keep practicing or explore new words.'}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={onStartRevision}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" /> Practice Vocabulary Flashcards
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Activity Tiles */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Learning & Practice Hub</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'vocabulary', label: 'Vocabulary', desc: 'SM-2 flashcards', icon: Layers, color: 'text-indigo-600' },
            { key: 'grammar', label: 'Grammar', desc: 'Rules & sentence patterns', icon: FileText, color: 'text-purple-600' },
            { key: 'pronunciation', label: 'Audio & Speech', desc: 'Listen & speak', icon: Volume2, color: 'text-pink-600' },
            { key: 'writing', label: 'Writing Lab', desc: 'AI feedback & essays', icon: PenTool, color: 'text-emerald-600' },
            { key: 'conversation', label: 'AI Partner', desc: 'Interactive dialogues', icon: MessageSquare, color: 'text-cyan-600' },
            { key: 'quizzes', label: 'Quizzes', desc: 'Tests & assessments', icon: Award, color: 'text-amber-600' },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.key}
                onClick={() => onOpenSection(tile.key)}
                className="bg-white border border-slate-200 hover:border-slate-200 rounded-xl p-3.5 text-left transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div className={`p-2 rounded-lg bg-slate-50 w-fit mb-2 ${tile.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tile.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{tile.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Curriculum & Learning Paths */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Curriculum & Pathways</h3>
        <div className="space-y-4">
          {paths.map((path) => (
            <div key={path.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 font-mono">
                    {path.level}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{path.title}</h4>
                </div>
                <span className="text-xs text-slate-500">~{path.estimated_hours} Hours</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{path.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {path.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => onContinueLesson(lesson.id)}
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-200 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-xs text-slate-700 font-mono">
                        {lesson.order}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {lesson.title}
                        </div>
                        <div className="text-[10px] text-slate-500">{lesson.estimated_duration_min} mins</div>
                      </div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
