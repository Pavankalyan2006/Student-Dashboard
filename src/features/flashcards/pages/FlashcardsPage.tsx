// src/features/flashcards/pages/FlashcardsPage.tsx
// Complete Flashcard and Spaced Repetition Learning Hub with 3D Flip Card and Mastery State Tracking

import * as React from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  Plus,
  CheckCircle2,
  Calendar,
  BrainCircuit,
  ArrowRight,
  BookOpen,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { FlashcardDeck, Flashcard } from '../../../types/learningModules';
import { toast } from 'sonner';

interface FlashcardsPageProps {
  onNavigate?: (path: string) => void;
}

export function FlashcardsPage({ onNavigate }: FlashcardsPageProps) {
  const [decks, setDecks] = React.useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeDeck, setActiveDeck] = React.useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'decks' | 'study' | 'create'>('decks');

  // Form State
  const [newTitle, setNewTitle] = React.useState('');
  const [newSubject, setNewSubject] = React.useState('Database Management Systems');
  const [newDescription, setNewDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadDecks = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningModulesApi.flashcards.getDecks();
      setDecks(data);
      if (data.length > 0 && !activeDeck) {
        setActiveDeck(data[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load flashcard decks: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDeck]);

  React.useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter a deck title');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await learningModulesApi.flashcards.createDeck({
        title: newTitle,
        subject: newSubject,
        description: newDescription,
        cards: [
          {
            id: `card_${Date.now()}_1`,
            deck_id: '',
            student_id: '',
            front: `What is the core definition of ${newTitle}?`,
            back: `Essential engineering principles and properties defining ${newTitle}.`,
            type: 'CONCEPT',
            topic: newSubject,
            difficulty: 'MEDIUM',
            state: 'NEW',
            confidence: 0,
            review_count: 0,
            correct_count: 0,
            incorrect_count: 0,
            next_review: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          },
        ],
      });
      toast.success('Flashcard deck created with active recall prompts!');
      setNewTitle('');
      setNewDescription('');
      setActiveDeck(created);
      setViewMode('study');
      loadDecks();
    } catch (err: any) {
      toast.error('Failed to create deck: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewCard = async (qualityConfidence: number) => {
    if (!activeDeck || !activeDeck.cards[currentCardIndex]) return;
    const card = activeDeck.cards[currentCardIndex];
    try {
      await learningModulesApi.flashcards.reviewCard(activeDeck.id, card.id, qualityConfidence);
      toast.success(
        qualityConfidence >= 4 ? 'Great active recall! Scheduled for later.' : 'Card marked for prompt re-review.'
      );
      setIsFlipped(false);
      if (currentCardIndex < activeDeck.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        toast.info('Completed all cards in this review round!');
        setCurrentCardIndex(0);
      }
      loadDecks();
    } catch (err: any) {
      toast.error('Failed to submit review: ' + err.message);
    }
  };

  const currentCard = activeDeck?.cards[currentCardIndex];
  const totalCardsDue = decks.reduce((sum, d) => sum + (d.due_count || 0), 0);
  const totalMastered = decks.reduce((sum, d) => sum + (d.mastered_count || 0), 0);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Flashcards + Spaced Revision" description="Loading spaced repetition intervals..." />
        <LoadingState message="FlashcardAgent calculating active recall memory decay..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Flashcards + Spaced Revision"
        description="Spaced repetition (SM-2 algorithm) ensures weak cards appear frequently while mastered cards are spaced out."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
            Spaced Repetition Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'decks' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('decks')}
              className={viewMode === 'decks' ? 'bg-[#2563EB] text-white' : ''}
            >
              Deck Library
            </Button>
            <Button
              size="sm"
              onClick={() => setViewMode(viewMode === 'create' ? 'decks' : 'create')}
              className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              <Plus className="w-4 h-4" />
              {viewMode === 'create' ? 'View Decks' : 'New Deck'}
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Due for Review Today</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{totalCardsDue} Cards</h3>
            <p className="text-xs text-[#475467] mt-0.5">Spaced repetition priority</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <RotateCw className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Mastered Cards</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalMastered} Cards</h3>
            <p className="text-xs text-emerald-700 mt-0.5">Consolidated long-term memory</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Total Decks</p>
            <h3 className="text-2xl font-bold text-[#101828] mt-1">{decks.length} Decks</h3>
            <p className="text-xs text-purple-600 mt-0.5">Curriculum aligned</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Interval Pace</p>
            <h3 className="text-sm font-bold text-[#101828] mt-1">1d → 3d → 7d → 14d</h3>
            <p className="text-xs text-blue-600 mt-0.5">SuperMemo-2 Curve</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mode: Study (Active Flashcard Flip Interface) */}
      {viewMode === 'study' && activeDeck && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('decks')}
              className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Decks
            </button>
            <span className="text-xs font-medium text-[#475467]">
              Card {currentCardIndex + 1} of {activeDeck.cards?.length || 0}
            </span>
          </div>

          {currentCard ? (
            <div className="space-y-4">
              {/* Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[280px] p-8 rounded-2xl border cursor-pointer select-none transition-all duration-300 flex flex-col justify-between shadow-md relative ${
                  isFlipped
                    ? 'bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-300'
                    : 'bg-white border-[#E4E7EC] hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    {currentCard.type} • {currentCard.topic}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    {isFlipped ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {isFlipped ? 'Answer View' : 'Prompt (Click to Flip)'}
                  </span>
                </div>

                <div className="my-auto py-6 text-center">
                  {!isFlipped ? (
                    <h2 className="text-xl font-bold text-[#101828] leading-relaxed px-4">
                      {currentCard.front}
                    </h2>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs uppercase font-bold tracking-wider text-purple-700">Explanation</p>
                      <p className="text-base font-semibold text-[#101828] leading-relaxed whitespace-pre-line px-4">
                        {currentCard.back}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-[#475467] border-t border-gray-100 pt-3">
                  <span>State: {currentCard.state}</span>
                  <span className="text-[11px] text-gray-400">Click anywhere on card to flip</span>
                </div>
              </div>

              {/* SM-2 Recall Rating Buttons */}
              {isFlipped ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-center text-[#475467]">
                    How well did you remember this concept?
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleReviewCard(1)}
                      className="p-2.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      Again (1d)
                    </button>
                    <button
                      onClick={() => handleReviewCard(2)}
                      className="p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                    >
                      Hard (2d)
                    </button>
                    <button
                      onClick={() => handleReviewCard(3)}
                      className="p-2.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      Good (4d)
                    </button>
                    <button
                      onClick={() => handleReviewCard(5)}
                      className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Easy (7d)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setIsFlipped(true)}
                    variant="outline"
                    className="gap-2 text-xs font-semibold"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Reveal Answer
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Cards in This Deck"
              description="Add concepts or generate flashcards using FlashcardAgent."
            />
          )}
        </div>
      )}

      {/* Mode: Deck Library */}
      {viewMode === 'decks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {deck.subject}
                  </span>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {deck.due_count || 0} due
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101828]">{deck.title}</h3>
                <p className="text-xs text-[#475467] line-clamp-2">{deck.description}</p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-[#475467] font-medium">
                  {deck.cards?.length || 0} total cards
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveDeck(deck);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setViewMode('study');
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs gap-1"
                >
                  Review Deck
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode: Create Deck */}
      {viewMode === 'create' && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Create New Flashcard Deck
          </h2>
          <form onSubmit={handleCreateDeck} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Deck Title</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems: Process Scheduling & Mutexes"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Subject Area</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Description / Syllabus Scope</label>
              <textarea
                placeholder="High-yield definitions, semaphore operations, deadlock conditions..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setViewMode('decks')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#2563EB] text-white">
                {isSubmitting ? 'Generating Flashcards...' : 'Generate Deck'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
