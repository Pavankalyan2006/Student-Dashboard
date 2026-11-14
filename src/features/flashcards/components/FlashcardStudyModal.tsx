// src/features/flashcards/components/FlashcardStudyModal.tsx
import * as React from 'react';
import {
  X,
  RotateCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';
import { Flashcard, FlashcardDeck, ReviewRating } from '../../../types/learningModules';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface FlashcardStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: FlashcardDeck | null;
  onReviewCard: (deckId: string, cardId: string, rating: ReviewRating) => Promise<Flashcard | null>;
  onBookmarkCard?: (deckId: string, cardId: string, isBookmarked: boolean) => Promise<void>;
  initialCards?: Flashcard[];
}

export const FlashcardStudyModal: React.FC<FlashcardStudyModalProps> = ({
  isOpen,
  onClose,
  deck,
  onReviewCard,
  onBookmarkCard,
  initialCards,
}) => {
  const [cards, setCards] = React.useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isShuffled, setIsShuffled] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Session Tracking
  const [reviewedCards, setReviewedCards] = React.useState<
    Array<{ card: Flashcard; rating: string; confidence: number }>
  >([]);
  const [showSummary, setShowSummary] = React.useState(false);
  const [sessionStartTime] = React.useState<number>(Date.now());

  // Initialize Cards
  React.useEffect(() => {
    if (isOpen && deck) {
      const activeList = initialCards && initialCards.length > 0 ? initialCards : deck.cards || [];
      setCards([...activeList]);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowSummary(false);
      setReviewedCards([]);
    }
  }, [isOpen, deck, initialCards]);

  // Shuffle Cards
  const toggleShuffle = () => {
    if (isShuffled) {
      const activeList = initialCards && initialCards.length > 0 ? initialCards : deck?.cards || [];
      setCards([...activeList]);
      setIsShuffled(false);
      setCurrentIndex(0);
      toast.info('Cards restored to original order');
    } else {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setIsShuffled(true);
      setCurrentIndex(0);
      toast.success('Cards shuffled for varied active recall');
    }
  };

  const currentCard = cards[currentIndex];

  // Submit Rating
  const handleRating = async (rating: ReviewRating) => {
    if (!currentCard || !deck || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const updatedCard = await onReviewCard(currentCard.deck_id || deck.id, currentCard.id, rating);

      // Record session review
      const ratingStr = typeof rating === 'string' ? rating : rating >= 4 ? 'GOOD' : 'AGAIN';
      const confidenceNum = typeof rating === 'number' ? rating : rating === 'EASY' ? 5 : rating === 'GOOD' ? 4 : rating === 'HARD' ? 3 : 1;

      setReviewedCards((prev) => [
        ...prev,
        {
          card: updatedCard || currentCard,
          rating: ratingStr,
          confidence: confidenceNum,
        },
      ]);

      setIsFlipped(false);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Session Complete
        setShowSummary(true);
      }
    } catch (err: any) {
      toast.error('Failed to submit review: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation & shortcuts
  React.useEffect(() => {
    if (!isOpen || showSummary) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setIsFlipped(false);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setIsFlipped(false);
        }
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRating('AGAIN');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRating('HARD');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRating('GOOD');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRating('EASY');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSummary, isFlipped, currentIndex, cards.length]);

  if (!isOpen || !deck) return null;

  // Session Summary Stats
  const againCount = reviewedCards.filter((r) => r.rating === 'AGAIN').length;
  const hardCount = reviewedCards.filter((r) => r.rating === 'HARD').length;
  const goodCount = reviewedCards.filter((r) => r.rating === 'GOOD').length;
  const easyCount = reviewedCards.filter((r) => r.rating === 'EASY').length;
  const difficultCards = reviewedCards.filter((r) => r.rating === 'AGAIN' || r.rating === 'HARD').map((r) => r.card);
  const timeElapsedSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
  const timeFormatted = `${Math.floor(timeElapsedSeconds / 60)}m ${timeElapsedSeconds % 60}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {deck.subject}
              </span>
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs md:max-w-md">
                {deck.title}
              </h2>
            </div>
            {!showSummary && cards.length > 0 && (
              <p className="text-[11px] text-slate-600 mt-0.5">
                Card {currentIndex + 1} of {cards.length}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!showSummary && (
              <button
                onClick={toggleShuffle}
                title="Shuffle Cards"
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                  isShuffled
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!showSummary && cards.length > 0 && (
          <div className="w-full h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center">
          {showSummary ? (
            /* =======================================================
               Session Summary View
               ======================================================= */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Review Round Completed!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Active recall intervals have been updated in your personalized SuperMemo-2 schedule.
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <p className="text-[10px] uppercase font-bold text-rose-700">Again (1d)</p>
                  <p className="text-xl font-extrabold text-rose-800 mt-0.5">{againCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-[10px] uppercase font-bold text-amber-700">Hard (2d)</p>
                  <p className="text-xl font-extrabold text-amber-800 mt-0.5">{hardCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <p className="text-[10px] uppercase font-bold text-blue-700">Good (4d)</p>
                  <p className="text-xl font-extrabold text-blue-800 mt-0.5">{goodCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">Easy (7d)</p>
                  <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{easyCount}</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-center gap-4">
                <span>Total Cards: {reviewedCards.length}</span>
                <span>•</span>
                <span>Time Spent: {timeFormatted}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {difficultCards.length > 0 && (
                  <Button
                    onClick={() => {
                      setCards([...difficultCards]);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setShowSummary(false);
                      setReviewedCards([]);
                      toast.info(`Reviewing ${difficultCards.length} difficult cards again`);
                    }}
                    variant="outline"
                    className="w-full sm:w-auto text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-50"
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                    Review Difficult Cards ({difficultCards.length})
                  </Button>
                )}

                <Button
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Return to Library
                </Button>
              </div>
            </div>
          ) : currentCard ? (
            /* =======================================================
               Active 3D Flip Card View
               ======================================================= */
            <div className="space-y-5 max-w-xl mx-auto w-full">
              {/* Card Surface */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                aria-label={isFlipped ? 'Card back: Answer view' : 'Card front: Prompt view. Click to flip'}
                className={`min-h-[290px] p-7 rounded-3xl border cursor-pointer select-none transition-all duration-300 flex flex-col justify-between shadow-lg relative group ${
                  isFlipped
                    ? 'bg-gradient-to-br from-purple-50/70 via-white to-blue-50/70 border-purple-300 ring-2 ring-purple-100'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xl'
                }`}
              >
                {/* Card Top Meta */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {currentCard.type}
                    </span>
                    <span className="text-gray-500 text-[11px] font-medium">
                      {currentCard.topic}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      [{currentCard.difficulty}]
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    {onBookmarkCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookmarkCard(deck.id, currentCard.id, !currentCard.is_bookmarked);
                        }}
                        className="hover:text-amber-500 transition-colors"
                        title={currentCard.is_bookmarked ? 'Remove bookmark' : 'Bookmark card'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            currentCard.is_bookmarked ? 'text-amber-500 fill-amber-500' : ''
                          }`}
                        />
                      </button>
                    )}
                    <span className="text-[11px] flex items-center gap-1 text-gray-400">
                      {isFlipped ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {isFlipped ? 'Answer' : 'Question'}
                    </span>
                  </div>
                </div>

                {/* Card Center Content */}
                <div className="my-auto py-6 text-center">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-relaxed px-4">
                        {currentCard.front}
                      </h3>
                      {currentCard.source_title && (
                        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Source: {currentCard.source_title}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 text-left px-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-purple-700">
                        Explanation & Key Invariants
                      </p>
                      <div className="text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line bg-white/70 p-4 rounded-xl border border-purple-100">
                        {currentCard.back}
                      </div>

                      {currentCard.example && (
                        <div className="text-xs text-slate-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <span className="font-bold text-gray-700">Example / Note: </span>
                          {currentCard.example}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Hint */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-gray-100 pt-3">
                  <span className="text-[11px]">
                    State: <strong className="text-blue-600 font-semibold">{currentCard.state}</strong>
                    {currentCard.review_count > 0 && ` (${currentCard.review_count} reviews)`}
                  </span>
                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Space</kbd> to flip
                  </span>
                </div>
              </div>

              {/* Bottom Controls / Ratings */}
              {isFlipped ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-xs font-semibold text-center text-slate-600">
                    How well did you recall this concept?
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRating('AGAIN')}
                      disabled={isSubmitting}
                      className="p-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-all flex flex-col items-center justify-center shadow-sm hover:scale-[1.02]"
                    >
                      <span>Again</span>
                      <span className="text-[10px] font-normal text-rose-600 mt-0.5">1d (Reset)</span>
                    </button>

                    <button
                      onClick={() => handleRating('HARD')}
                      disabled={isSubmitting}
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all flex flex-col items-center justify-center shadow-sm hover:scale-[1.02]"
                    >
                      <span>Hard</span>
                      <span className="text-[10px] font-normal text-amber-600 mt-0.5">2d</span>
                    </button>

                    <button
                      onClick={() => handleRating('GOOD')}
                      disabled={isSubmitting}
                      className="p-3 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-all flex flex-col items-center justify-center shadow-sm hover:scale-[1.02]"
                    >
                      <span>Good</span>
                      <span className="text-[10px] font-normal text-blue-600 mt-0.5">4d</span>
                    </button>

                    <button
                      onClick={() => handleRating('EASY')}
                      disabled={isSubmitting}
                      className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all flex flex-col items-center justify-center shadow-sm hover:scale-[1.02]"
                    >
                      <span>Easy</span>
                      <span className="text-[10px] font-normal text-emerald-600 mt-0.5">7d+</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    onClick={() => {
                      if (currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                        setIsFlipped(false);
                      }
                    }}
                    disabled={currentIndex === 0}
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    onClick={() => setIsFlipped(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 shadow-sm"
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                    Reveal Answer
                  </Button>

                  <Button
                    onClick={() => {
                      if (currentIndex < cards.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        setIsFlipped(false);
                      } else {
                        setShowSummary(true);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-900">No cards available to study</p>
              <Button onClick={onClose} size="sm" variant="outline">
                Back to Decks
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
