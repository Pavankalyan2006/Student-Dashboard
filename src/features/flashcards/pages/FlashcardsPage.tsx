// src/features/flashcards/pages/FlashcardsPage.tsx
// Complete AI Flashcard and Spaced Repetition Learning Hub with SuperMemo-2 Active Recall

import * as React from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  BrainCircuit,
  Filter,
  ArrowUpDown,
  BookOpen,
  Search,
} from 'lucide-react';
import { PageContainer } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { FlashcardDeck, Flashcard, FlashcardStats, ReviewRating } from '../../../types/learningModules';
import { FlashcardHeader } from '../components/FlashcardHeader';
import { FlashcardOverviewStats } from '../components/FlashcardOverviewStats';
import { FlashcardDeckCard } from '../components/FlashcardDeckCard';
import { FlashcardStudyModal } from '../components/FlashcardStudyModal';
import { FlashcardDeckDetailModal } from '../components/FlashcardDeckDetailModal';
import { CreateFlashcardsModal } from '../components/CreateFlashcardsModal';
import { toast } from 'sonner';

interface FlashcardsPageProps {
  onNavigate?: (path: string) => void;
}

export function FlashcardsPage({ onNavigate }: FlashcardsPageProps) {
  const [decks, setDecks] = React.useState<FlashcardDeck[]>([]);
  const [stats, setStats] = React.useState<FlashcardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<
    'ALL' | 'RECENT' | 'DUE' | 'NOT_STUDIED' | 'MASTERED' | 'BOOKMARKED' | 'ARCHIVED'
  >('ALL');
  const [selectedSubject, setSelectedSubject] = React.useState('all');
  const [sortBy, setSortBy] = React.useState<'recent' | 'title' | 'card_count' | 'due_count'>('recent');

  // Modals State
  const [studyModalOpen, setStudyModalOpen] = React.useState(false);
  const [studyingDeck, setStudyingDeck] = React.useState<FlashcardDeck | null>(null);
  const [studyInitialCards, setStudyInitialCards] = React.useState<Flashcard[] | undefined>(undefined);

  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedDetailDeck, setSelectedDetailDeck] = React.useState<FlashcardDeck | null>(null);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createDefaultTab, setCreateDefaultTab] = React.useState<'manual' | 'ai' | 'notes' | 'course'>('manual');

  // Load Decks & Statistics
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = activeTab.toLowerCase();
      const [decksData, statsData] = await Promise.all([
        learningModulesApi.flashcards.getDecks({
          search: searchQuery.trim() || undefined,
          subject: selectedSubject !== 'all' ? selectedSubject : undefined,
          status: statusParam,
          sortBy,
        }),
        learningModulesApi.flashcards.getStats(),
      ]);

      setDecks(decksData);
      setStats(statsData);

      // Keep detail modal synced if open
      if (selectedDetailDeck) {
        const refreshed = decksData.find((d) => d.id === selectedDetailDeck.id);
        if (refreshed) setSelectedDetailDeck(refreshed);
      }
    } catch (err: any) {
      toast.error('Failed to load flashcard decks: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedSubject, sortBy, selectedDetailDeck?.id]);

  React.useEffect(() => {
    loadData();
  }, [searchQuery, activeTab, selectedSubject, sortBy]);

  // Unique subjects for dropdown
  const uniqueSubjects = React.useMemo(() => {
    const subs = new Set<string>();
    decks.forEach((d) => {
      if (d.subject) subs.add(d.subject);
    });
    return Array.from(subs);
  }, [decks]);

  // Launch Study for a specific deck
  const handleStudyDeck = (deck: FlashcardDeck) => {
    setStudyingDeck(deck);
    setStudyInitialCards(undefined);
    setStudyModalOpen(true);
  };

  // Launch Study for All Due Cards
  const handleStartReviewDue = async () => {
    try {
      const dueCards = await learningModulesApi.flashcards.getDueCards();
      if (dueCards.length === 0) {
        toast.info('No cards are currently due for review! Good job.');
        return;
      }

      // Create a virtual deck for all due cards
      const virtualDueDeck: FlashcardDeck = {
        id: 'virtual_due_deck',
        student_id: '',
        title: 'Daily Spaced Repetition Due Queue',
        subject: 'All Subjects',
        description: `Reviewing ${dueCards.length} cards due across your active curriculum tracks.`,
        total_cards: dueCards.length,
        due_count: dueCards.length,
        mastered_count: 0,
        cards: dueCards,
        created_at: new Date().toISOString(),
      };

      setStudyingDeck(virtualDueDeck);
      setStudyInitialCards(dueCards);
      setStudyModalOpen(true);
    } catch (err: any) {
      toast.error('Failed to fetch due queue: ' + (err.message || err));
    }
  };

  // Open Detail / Card Manager
  const handleOpenDetail = (deck: FlashcardDeck) => {
    setSelectedDetailDeck(deck);
    setDetailModalOpen(true);
  };

  // Edit Deck Details
  const handleEditDeck = async (deck: FlashcardDeck) => {
    const newTitle = window.prompt('Enter new deck title:', deck.title);
    if (!newTitle || !newTitle.trim() || newTitle === deck.title) return;

    try {
      await learningModulesApi.flashcards.updateDeck(deck.id, { title: newTitle.trim() });
      toast.success('Deck title updated');
      loadData();
    } catch (err: any) {
      toast.error('Failed to update deck: ' + (err.message || err));
    }
  };

  // Duplicate Deck
  const handleDuplicateDeck = async (deck: FlashcardDeck) => {
    try {
      await learningModulesApi.flashcards.duplicateDeck(deck.id);
      toast.success(`Duplicated "${deck.title}" without past review history`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to duplicate deck: ' + (err.message || err));
    }
  };

  // Archive / Restore Deck
  const handleArchiveDeck = async (deck: FlashcardDeck) => {
    try {
      const targetState = !deck.is_archived;
      await learningModulesApi.flashcards.archiveDeck(deck.id, targetState);
      toast.success(targetState ? 'Deck moved to archive' : 'Deck restored to active library');
      loadData();
    } catch (err: any) {
      toast.error('Failed to update archive status: ' + (err.message || err));
    }
  };

  // Bookmark Deck
  const handleBookmarkDeck = async (deck: FlashcardDeck) => {
    try {
      const targetState = !deck.is_bookmarked;
      await learningModulesApi.flashcards.bookmarkDeck(deck.id, targetState);
      toast.success(targetState ? 'Deck bookmarked' : 'Bookmark removed');
      loadData();
    } catch (err: any) {
      toast.error('Failed to bookmark deck: ' + (err.message || err));
    }
  };

  // Delete Deck
  const handleDeleteDeck = async (deck: FlashcardDeck) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${deck.title}" and its ${deck.total_cards} cards?`)) {
      return;
    }
    try {
      await learningModulesApi.flashcards.deleteDeck(deck.id);
      toast.success('Deck deleted');
      if (selectedDetailDeck?.id === deck.id) setDetailModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete deck: ' + (err.message || err));
    }
  };

  // Schedule in Planner
  const handleSchedulePlanner = async (deck: FlashcardDeck) => {
    try {
      const task = await learningModulesApi.flashcards.scheduleStudyTask(deck.id);
      toast.success(`Scheduled review task: "${task.title}" for ${task.date}`);
    } catch (err: any) {
      toast.error('Failed to schedule in planner: ' + (err.message || err));
    }
  };

  // Submit Review Rating
  const handleReviewCard = async (deckId: string, cardId: string, rating: ReviewRating): Promise<Flashcard | null> => {
    try {
      const updatedCard = await learningModulesApi.flashcards.reviewCard(deckId, cardId, rating);
      // Refresh background stats without flashing UI
      learningModulesApi.flashcards.getStats().then((s) => setStats(s)).catch(() => {});
      return updatedCard;
    } catch (err: any) {
      toast.error('Failed to record review: ' + (err.message || err));
      return null;
    }
  };

  // Card Management handlers
  const handleAddCard = async (deckId: string, card: Partial<Flashcard>) => {
    const created = await learningModulesApi.flashcards.addCard(deckId, card);
    loadData();
    return created;
  };

  const handleUpdateCard = async (deckId: string, cardId: string, updates: Partial<Flashcard>, resetSchedule?: boolean) => {
    const updated = await learningModulesApi.flashcards.updateCard(deckId, cardId, updates, resetSchedule);
    loadData();
    return updated;
  };

  const handleDeleteCard = async (deckId: string, cardId: string) => {
    await learningModulesApi.flashcards.deleteCard(deckId, cardId);
    loadData();
  };

  const handleBookmarkCard = async (deckId: string, cardId: string, isBookmarked: boolean) => {
    const updated = await learningModulesApi.flashcards.bookmarkCard(deckId, cardId, isBookmarked);
    loadData();
    return updated;
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <FlashcardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateOpen={(tab = 'manual') => {
            setCreateDefaultTab(tab);
            setCreateModalOpen(true);
          }}
          onStartReviewDue={handleStartReviewDue}
          dueCardsCount={stats?.due_today || 0}
        />

        {/* Learning Overview Statistics */}
        <FlashcardOverviewStats stats={stats} loading={loading && !stats} />

        {/* Filter Tabs & Controls */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: 'ALL', label: 'All Decks' },
                  { id: 'DUE', label: 'Due for Review' },
                  { id: 'RECENT', label: 'Recent Activity' },
                  { id: 'NOT_STUDIED', label: 'Not Studied' },
                  { id: 'MASTERED', label: 'Mastered' },
                  { id: 'BOOKMARKED', label: 'Bookmarked' },
                  { id: 'ARCHIVED', label: 'Archived' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'DUE' && (stats?.due_today || 0) > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-amber-950 font-bold">
                      {stats?.due_today}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Subject and Sort Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Subject Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  aria-label="Filter by subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  aria-label="Sort decks"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="recent">Recently Studied</option>
                  <option value="title">Deck Title A-Z</option>
                  <option value="due_count">Most Due for Review</option>
                  <option value="card_count">Most Cards</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          </div>
        </div>

        {/* Decks Collection Grid */}
        {loading && decks.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white h-60" />
            ))}
          </div>
        ) : decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck) => (
              <FlashcardDeckCard
                key={deck.id}
                deck={deck}
                onStudy={handleStudyDeck}
                onOpenDetail={handleOpenDetail}
                onEdit={handleEditDeck}
                onDuplicate={handleDuplicateDeck}
                onArchive={handleArchiveDeck}
                onBookmark={handleBookmarkDeck}
                onDelete={handleDeleteDeck}
                onSchedulePlanner={handleSchedulePlanner}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Flashcard Decks Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No decks or active recall cards matched "${searchQuery}". Try clearing search or filter constraints.`
                  : activeTab === 'ARCHIVED'
                  ? 'No archived decks found. Decks you archive will appear here.'
                  : 'Start learning with active recall by creating your first deck or generating cards from syllabus topics.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {searchQuery && (
                <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setCreateDefaultTab('ai');
                  setCreateModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate with AI
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCreateDefaultTab('manual');
                  setCreateModalOpen(true);
                }}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Manually
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Flashcard Study Modal */}
        <FlashcardStudyModal
          isOpen={studyModalOpen}
          onClose={() => {
            setStudyModalOpen(false);
            setStudyingDeck(null);
            setStudyInitialCards(undefined);
            loadData();
          }}
          deck={studyingDeck}
          initialCards={studyInitialCards}
          onReviewCard={handleReviewCard}
          onBookmarkCard={async (deckId, cardId, isBookmarked) => {
            await handleBookmarkCard(deckId, cardId, isBookmarked);
          }}
        />

        {/* Deck Detail & Card Manager Modal */}
        <FlashcardDeckDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedDetailDeck(null);
            loadData();
          }}
          deck={selectedDetailDeck}
          onStudy={(d) => {
            setDetailModalOpen(false);
            handleStudyDeck(d);
          }}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onBookmarkCard={handleBookmarkCard}
        />

        {/* Create Flashcards Modal (Manual, AI, Notes, Courses) */}
        <CreateFlashcardsModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          defaultTab={createDefaultTab}
          onDeckCreated={(newDeck) => {
            loadData();
            handleStudyDeck(newDeck);
          }}
        />
      </div>
    </PageContainer>
  );
}
export default FlashcardsPage;
