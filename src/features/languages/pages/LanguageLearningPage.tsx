// src/features/languages/pages/LanguageLearningPage.tsx
// Master Coordinator for the Language Learning Platform (150+ Languages)

import * as React from 'react';
import {
  Globe,
  BookOpen,
  Layers,
  PenTool,
  MessageSquare,
  Award,
  Sparkles,
  RotateCw,
  HelpCircle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { LanguageExploreView } from '../components/LanguageExploreView';
import { LanguageOnboardingModal } from '../components/LanguageOnboardingModal';
import { LanguageDetailsModal } from '../components/LanguageDetailsModal';
import { LanguageDashboardView } from '../components/LanguageDashboardView';
import { LessonWorkspaceView } from '../components/LessonWorkspaceView';
import { VocabularyTrainerView } from '../components/VocabularyTrainerView';
import { WritingPracticeView } from '../components/WritingPracticeView';
import { ConversationPartnerView } from '../components/ConversationPartnerView';
import { ContextualTranslatorView } from '../components/ContextualTranslatorView';
import { LanguageQuizView } from '../components/LanguageQuizView';
import { languageApi } from '../api/languageApi';
import {
  LanguageEntry,
  StudentLanguageEnrollment,
  LanguageLessonDetail,
  SpacedRepetitionCard,
} from '../types/languageTypes';
import { toast } from 'sonner';

type ActiveTab =
  | 'dashboard'
  | 'explore'
  | 'lesson'
  | 'vocabulary'
  | 'writing'
  | 'conversation'
  | 'translator'
  | 'quiz';

export function LanguageLearningPage() {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('dashboard');
  const [loading, setLoading] = React.useState(true);

  // Catalog State
  const [languages, setLanguages] = React.useState<LanguageEntry[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [regions, setRegions] = React.useState<string[]>([]);
  const [scripts, setScripts] = React.useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = React.useState('ALL');
  const [selectedScript, setSelectedScript] = React.useState('ALL');
  const [selectedCapability, setSelectedCapability] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Enrollments State
  const [enrollments, setEnrollments] = React.useState<StudentLanguageEnrollment[]>([]);
  const [activeLangCode, setActiveLangCode] = React.useState<string>('es');
  const [dashboardData, setDashboardData] = React.useState<any>(null);

  // Lesson State
  const [currentLesson, setCurrentLesson] = React.useState<LanguageLessonDetail | null>(null);

  // Vocabulary State
  const [vocabCards, setVocabCards] = React.useState<SpacedRepetitionCard[]>([]);

  // Modals
  const [onboardingLanguage, setOnboardingLanguage] = React.useState<LanguageEntry | null>(null);
  const [detailsLanguage, setDetailsLanguage] = React.useState<LanguageEntry | null>(null);

  // Initial Load
  const loadInitialData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch catalog
      const catRes = await languageApi.getCatalog({
        query: searchQuery,
        region: selectedRegion,
        script: selectedScript,
        capability: selectedCapability,
      });

      setLanguages(catRes.languages);
      setTotalCount(catRes.total_count);
      setRegions(catRes.regions);
      setScripts(catRes.scripts);

      // Fetch student enrollments
      const enr = await languageApi.getMyEnrollments();
      setEnrollments(enr);

      if (enr.length > 0) {
        const initialCode = enr[0].language_code;
        setActiveLangCode(initialCode);
        const dash = await languageApi.getDashboard(initialCode);
        setDashboardData(dash);
      } else {
        // If not enrolled in anything yet, default to explore view
        setActiveTab('explore');
      }
    } catch (err: any) {
      toast.error('Failed to load language platform data.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRegion, selectedScript, selectedCapability]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load dashboard when switching active language
  const handleSelectLanguage = async (code: string) => {
    try {
      setActiveLangCode(code);
      const dash = await languageApi.getDashboard(code);
      setDashboardData(dash);
      setActiveTab('dashboard');
    } catch (err) {
      toast.error(`Failed to load data for ${code}`);
    }
  };

  const handleOpenLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const detail = await languageApi.getLesson(activeLangCode, lessonId);
      setCurrentLesson(detail);
      setActiveTab('lesson');
    } catch (err: any) {
      toast.error('Failed to open lesson.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVocabulary = async () => {
    try {
      setLoading(true);
      const cards = await languageApi.getVocabulary(activeLangCode);
      setVocabCards(cards);
      setActiveTab('vocabulary');
    } catch (err) {
      toast.error('Failed to load vocabulary cards.');
    } finally {
      setLoading(false);
    }
  };

  const activeEnrollment =
    enrollments.find((e) => e.language_code.toLowerCase() === activeLangCode.toLowerCase()) || null;

  const currentLanguageEntry =
    languages.find((l) => l.code.toLowerCase() === activeLangCode.toLowerCase()) ||
    languages[0] || {
      code: 'es',
      name: 'Spanish',
      native_name: 'Español',
      family: 'Romance',
      region: 'European',
      scripts: ['Latin'],
      direction: 'ltr',
      flag_emoji: '🇪🇸',
      sample_phrase: '¡Hola! ¿Cómo estás?',
      sample_translation: 'Hello! How are you?',
      capabilities: {
        text_lessons: 'SUPPORTED',
        vocabulary: 'SUPPORTED',
        grammar: 'SUPPORTED',
        translation: 'SUPPORTED',
        tts_audio: 'SUPPORTED',
        speech_recognition: 'SUPPORTED',
        pronunciation_eval: 'SUPPORTED',
        listening: 'SUPPORTED',
        reading: 'SUPPORTED',
        writing_feedback: 'SUPPORTED',
        ai_conversation: 'SUPPORTED',
        quizzes: 'SUPPORTED',
      },
      available_levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      total_lessons_count: 24,
      total_vocabulary_count: 350,
      description: 'Spanish language course.',
      writing_system_overview: 'Latin alphabet.',
    };

  return (
    <PageContainer>
      <PageHeader
        title="Language Learning Platform"
        description="Master 150+ world & Indian regional languages with interactive lessons, SM-2 spaced repetition, and AI conversational practice."
        badge="150+ Languages"
      />

      {/* Top Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar mb-6">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: Globe },
          { key: 'explore', label: 'Explore 150+ Languages', icon: Plus },
          { key: 'vocabulary', label: 'Vocabulary & Flashcards', icon: Layers },
          { key: 'writing', label: 'Writing Lab', icon: PenTool },
          { key: 'conversation', label: 'AI Partner', icon: MessageSquare },
          { key: 'translator', label: 'Contextual Translator', icon: Sparkles },
          { key: 'quiz', label: 'Quizzes & Tests', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'vocabulary') {
                  handleOpenVocabulary();
                } else {
                  setActiveTab(tab.key as any);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subviews Container */}
      {loading ? (
        <LoadingState message="Loading language curricula and catalog..." />
      ) : (
        <>
          {/* Dashboard Subview */}
          {activeTab === 'dashboard' && (
            <LanguageDashboardView
              enrollments={enrollments}
              activeEnrollment={activeEnrollment}
              onSelectLanguage={handleSelectLanguage}
              dashboardData={dashboardData}
              onContinueLesson={handleOpenLesson}
              onStartRevision={handleOpenVocabulary}
              onOpenSection={(sec) => {
                if (sec === 'vocabulary') handleOpenVocabulary();
                else if (sec === 'writing') setActiveTab('writing');
                else if (sec === 'conversation') setActiveTab('conversation');
                else if (sec === 'quizzes') setActiveTab('quiz');
                else if (sec === 'grammar' || sec === 'pronunciation') {
                  handleOpenLesson(dashboardData?.continue_lesson?.lesson_id || `les_${activeLangCode}_1`);
                }
              }}
              onExploreLanguages={() => setActiveTab('explore')}
            />
          )}

          {/* Explore Catalog Subview */}
          {activeTab === 'explore' && (
            <LanguageExploreView
              languages={languages}
              totalCount={totalCount}
              regions={regions}
              scripts={scripts}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              selectedScript={selectedScript}
              onSelectScript={setSelectedScript}
              selectedCapability={selectedCapability}
              onSelectCapability={setSelectedCapability}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStartLearning={(l) => setOnboardingLanguage(l)}
              onOpenDetails={(l) => setDetailsLanguage(l)}
              onGoToDashboard={(code) => handleSelectLanguage(code)}
            />
          )}

          {/* Interactive Lesson Subview */}
          {activeTab === 'lesson' && currentLesson && (
            <LessonWorkspaceView
              lesson={currentLesson}
              language={currentLanguageEntry}
              onBack={() => setActiveTab('dashboard')}
              onCompleted={() => {
                handleSelectLanguage(activeLangCode);
              }}
            />
          )}

          {/* Vocabulary Trainer Subview */}
          {activeTab === 'vocabulary' && (
            <VocabularyTrainerView
              cards={vocabCards}
              language={currentLanguageEntry}
              onRefresh={() => handleOpenVocabulary()}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* Writing Practice Subview */}
          {activeTab === 'writing' && (
            <WritingPracticeView
              language={currentLanguageEntry}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* AI Conversation Partner Subview */}
          {activeTab === 'conversation' && (
            <ConversationPartnerView
              language={currentLanguageEntry}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* Contextual Translator Subview */}
          {activeTab === 'translator' && (
            <ContextualTranslatorView
              currentLanguage={currentLanguageEntry}
              allLanguages={languages}
              onBack={() => setActiveTab('dashboard')}
            />
          )}

          {/* Quizzes Subview */}
          {activeTab === 'quiz' && (
            <LanguageQuizView
              language={currentLanguageEntry}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
        </>
      )}

      {/* Onboarding Wizard Modal */}
      <LanguageOnboardingModal
        isOpen={!!onboardingLanguage}
        onClose={() => setOnboardingLanguage(null)}
        language={onboardingLanguage}
        onEnrolled={(newEnrollment) => {
          setEnrollments((prev) => [newEnrollment, ...prev]);
          handleSelectLanguage(newEnrollment.language_code);
        }}
      />

      {/* Language Details Modal */}
      <LanguageDetailsModal
        isOpen={!!detailsLanguage}
        onClose={() => setDetailsLanguage(null)}
        language={detailsLanguage}
        onStartLearning={(l) => {
          setDetailsLanguage(null);
          setOnboardingLanguage(l);
        }}
        onGoToDashboard={(code) => {
          setDetailsLanguage(null);
          handleSelectLanguage(code);
        }}
      />
    </PageContainer>
  );
}
