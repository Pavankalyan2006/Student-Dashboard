// src/features/languages/components/VocabularyTrainerView.tsx
// Vocabulary trainer with 3D flip cards and SM-2 Spaced Repetition interval review

import * as React from 'react';
import {
  RotateCw,
  Bookmark,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Filter,
  Eye,
  EyeOff,
  Flame,
  Award,
} from 'lucide-react';
import { SpacedRepetitionCard, LanguageEntry, ReviewRating } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface VocabularyTrainerViewProps {
  cards: SpacedRepetitionCard[];
  language: LanguageEntry;
  onRefresh: () => void;
  onBack: () => void;
}

export function VocabularyTrainerView({
  cards,
  language,
  onRefresh,
  onBack,
}: VocabularyTrainerViewProps) {
  const [filterMode, setFilterMode] = React.useState<'DUE' | 'ALL'>('DUE');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const displayedCards = React.useMemo(() => {
    if (filterMode === 'DUE') {
      return cards.filter((c) => !c.next_review_date || c.next_review_date <= todayStr);
    }
    return cards;
  }, [cards, filterMode, todayStr]);

  const currentCard = displayedCards[currentIndex];

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReview = async (rating: ReviewRating) => {
    if (!currentCard || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await languageApi.reviewSpacedVocab(language.code, currentCard.id, rating);
      toast.success(`Word reviewed: interval updated.`);

      setIsFlipped(false);
      if (currentIndex < displayedCards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onRefresh();
      }
    } catch (err: any) {
      toast.error('Failed to record review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentCard) return;
    try {
      const nextState = !currentCard.is_bookmarked;
      await languageApi.bookmarkVocab(language.code, currentCard.id, nextState);
      currentCard.is_bookmarked = nextState;
      toast.success(nextState ? 'Card bookmarked' : 'Bookmark removed');
      onRefresh();
    } catch (err: any) {
      toast.error('Failed to update bookmark.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterMode('DUE');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'DUE'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            Due for Revision ({cards.filter((c) => !c.next_review_date || c.next_review_date <= todayStr).length})
          </button>
          <button
            onClick={() => {
              setFilterMode('ALL');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-50 text-slate-500 hover:text-slate-900'
            }`}
          >
            All Saved ({cards.length})
          </button>
        </div>
      </div>

      {/* Main Flashcard or Empty State */}
      {!currentCard ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <Award className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-slate-900">Deck Completed!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            You've reviewed all vocabulary cards scheduled for this session. Your retention intervals have been updated.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setFilterMode('ALL');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-750 text-slate-900 text-xs font-semibold transition-colors"
            >
              Browse All Saved Words
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Counter & Bookmark */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">
              Card {currentIndex + 1} of {displayedCards.length}
            </span>
            <div className="flex items-center gap-2">
              {currentCard.is_mastered && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                  ✓ Mastered
                </span>
              )}
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-lg transition-colors ${
                  currentCard.is_bookmarked
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Bookmark card"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* 3D Flashcard Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[320px] rounded-3xl surface-hero border border-slate-200 hover:border-slate-200 p-8 flex flex-col justify-between shadow-2xl transition-all relative select-none"
          >
            {/* Top Row: Language Tag & Speaker */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                <span>{language.flag_emoji}</span> {language.name} • {currentCard.part_of_speech || 'Vocabulary'}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playSpeech(currentCard.word);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white transition-colors"
                title="Speak target word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Middle: Word / Translation */}
            <div className="text-center py-6 space-y-3">
              {!isFlipped ? (
                // Front: Target Word & Transliteration
                <div className="space-y-2" dir={language.direction}>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-wide">
                    {currentCard.word}
                  </div>
                  {currentCard.transliteration && (
                    <div className="text-sm font-mono text-indigo-600" dir="ltr">
                      /{currentCard.transliteration}/
                    </div>
                  )}
                  <div className="text-xs text-slate-500 pt-2" dir="ltr">
                    (Click to reveal translation & examples)
                  </div>
                </div>
              ) : (
                // Back: Meaning, Example, Breakdown
                <div className="space-y-3 animate-in fade-in">
                  <div className="text-2xl font-bold text-emerald-600">{currentCard.translation}</div>
                  {currentCard.example_sentence && (
                    <div className="p-3 rounded-xl bg-white border border-slate-200 max-w-md mx-auto text-left">
                      <div className="text-xs font-semibold text-slate-800" dir={language.direction}>
                        {currentCard.example_sentence}
                      </div>
                      {currentCard.example_translation && (
                        <div className="text-[11px] text-slate-500 mt-1 italic">
                          "{currentCard.example_translation}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Row: Tap Instruction */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'Click card to flip back' : 'Tap anywhere to reveal'}</span>
            </div>
          </div>

          {/* SM-2 SuperMemo Rating Buttons (Revealed on flip) */}
          {isFlipped && (
            <div className="space-y-2 animate-in fade-in">
              <div className="text-center text-xs text-slate-500 font-medium">How well did you remember this?</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'AGAIN', label: 'Again', desc: '< 1 day', color: 'border-rose-200 hover:bg-rose-50 text-rose-600' },
                  { key: 'HARD', label: 'Hard', desc: '3 days', color: 'border-amber-200 hover:bg-amber-50 text-amber-600' },
                  { key: 'GOOD', label: 'Good', desc: '4 days', color: 'border-blue-200 hover:bg-blue-50 text-blue-600' },
                  { key: 'EASY', label: 'Easy', desc: '6+ days', color: 'border-emerald-200 hover:bg-emerald-50 text-emerald-600' },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleReview(btn.key as any)}
                    className={`p-3 rounded-2xl bg-white border text-center transition-all ${btn.color} disabled:opacity-50`}
                  >
                    <div className="text-xs font-bold">{btn.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{btn.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
