// src/features/flashcards/components/FlashcardDeckDetailModal.tsx
import * as React from 'react';
import {
  X,
  Plus,
  Play,
  Search,
  Bookmark,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Flashcard, FlashcardDeck, FlashcardType } from '../../../types/learningModules';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface FlashcardDeckDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: FlashcardDeck | null;
  onStudy: (deck: FlashcardDeck) => void;
  onAddCard: (deckId: string, card: Partial<Flashcard>) => Promise<Flashcard>;
  onUpdateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>, resetSchedule?: boolean) => Promise<Flashcard>;
  onDeleteCard: (deckId: string, cardId: string) => Promise<void>;
  onBookmarkCard: (deckId: string, cardId: string, isBookmarked: boolean) => Promise<Flashcard>;
}

export const FlashcardDeckDetailModal: React.FC<FlashcardDeckDetailModalProps> = ({
  isOpen,
  onClose,
  deck,
  onStudy,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onBookmarkCard,
}) => {
  const [search, setSearch] = React.useState('');
  const [filterState, setFilterState] = React.useState<'ALL' | 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED' | 'BOOKMARKED'>('ALL');

  // Add / Edit Card Form State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingCardId, setEditingCardId] = React.useState<string | null>(null);
  const [cardFront, setCardFront] = React.useState('');
  const [cardBack, setCardBack] = React.useState('');
  const [cardType, setCardType] = React.useState<FlashcardType>('CONCEPT');
  const [cardTopic, setCardTopic] = React.useState('');
  const [cardDifficulty, setCardDifficulty] = React.useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [resetSchedule, setResetSchedule] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form when modal opens or closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setEditingCardId(null);
      setSearch('');
      setFilterState('ALL');
    }
  }, [isOpen]);

  if (!isOpen || !deck) return null;

  // Filter cards
  const filteredCards = (deck.cards || []).filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(search.toLowerCase()) ||
      card.back.toLowerCase().includes(search.toLowerCase()) ||
      card.topic.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterState === 'ALL') return true;
    if (filterState === 'BOOKMARKED') return card.is_bookmarked === true;
    return card.state === filterState;
  });

  const handleOpenAddCard = () => {
    setEditingCardId(null);
    setCardFront('');
    setCardBack('');
    setCardType('CONCEPT');
    setCardTopic(deck.subject);
    setCardDifficulty('MEDIUM');
    setResetSchedule(false);
    setIsEditing(true);
  };

  const handleOpenEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setCardFront(card.front);
    setCardBack(card.back);
    setCardType(card.type);
    setCardTopic(card.topic);
    setCardDifficulty(card.difficulty);
    setResetSchedule(false);
    setIsEditing(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) {
      toast.error('Card question and answer are required');
      return;
    }

    try {
      setIsSaving(true);
      if (editingCardId) {
        await onUpdateCard(
          deck.id,
          editingCardId,
          {
            front: cardFront,
            back: cardBack,
            type: cardType,
            topic: cardTopic || deck.subject,
            difficulty: cardDifficulty,
          },
          resetSchedule
        );
        toast.success('Card updated successfully');
      } else {
        await onAddCard(deck.id, {
          front: cardFront,
          back: cardBack,
          type: cardType,
          topic: cardTopic || deck.subject,
          difficulty: cardDifficulty,
        });
        toast.success('Card added to deck');
      }
      setIsEditing(false);
      setEditingCardId(null);
    } catch (err: any) {
      toast.error('Failed to save card: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await onDeleteCard(deck.id, cardId);
      toast.success('Card deleted');
    } catch (err: any) {
      toast.error('Failed to delete card: ' + (err.message || err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                {deck.subject}
              </span>
              <h2 className="text-xl font-bold text-slate-900 truncate">{deck.title}</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 line-clamp-1">{deck.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onStudy(deck)}
              disabled={deck.total_cards === 0}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Study
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenAddCard}
              className="text-xs font-semibold text-slate-700 border-slate-300 gap-1 hover:bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Card
            </Button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Add / Edit Card Form */}
          {isEditing && (
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  {editingCardId ? 'Edit Flashcard' : 'Add New Flashcard'}
                </h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Front / Prompt / Question
                  </label>
                  <textarea
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    placeholder="Enter the concept question, formula, or active recall prompt..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Back / Answer / Explanation
                  </label>
                  <textarea
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    placeholder="Enter the concise answer, key invariants, and theoretical explanation..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Card Type</label>
                    <select
                      aria-label="Card type"
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value as FlashcardType)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CONCEPT">Concept</option>
                      <option value="DEFINITION">Definition</option>
                      <option value="FORMULA">Formula</option>
                      <option value="COMPARISON">Comparison</option>
                      <option value="CODE">Code / Syntax</option>
                      <option value="QA">Question & Answer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Subtopic</label>
                    <input
                      type="text"
                      value={cardTopic}
                      onChange={(e) => setCardTopic(e.target.value)}
                      placeholder={deck.subject}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                    <select
                      value={cardDifficulty}
                      onChange={(e) => setCardDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                {editingCardId && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="resetSchedule"
                      checked={resetSchedule}
                      onChange={(e) => setResetSchedule(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="resetSchedule" className="text-xs text-slate-600">
                      Reset SM-2 spaced repetition schedule (restart learning curve)
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? 'Saving...' : editingCardId ? 'Save Changes' : 'Add to Deck'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Search & State Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cards in this deck..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {(['ALL', 'NEW', 'LEARNING', 'REVIEW', 'MASTERED', 'BOOKMARKED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterState(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterState === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                  }`}
                >
                  {st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          {filteredCards.length > 0 ? (
            <div className="space-y-3">
              {filteredCards.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 transition-all shadow-sm space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Card #{idx + 1} • {card.type}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {card.topic}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            card.state === 'MASTERED'
                              ? 'text-emerald-700 bg-emerald-50'
                              : card.state === 'LEARNING'
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-gray-600 bg-gray-50'
                          }`}
                        >
                          {card.state}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Due: {card.next_review}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 pt-1">{card.front}</h4>
                      <p className="text-xs text-slate-600 whitespace-pre-line bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                        {card.back}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onBookmarkCard(deck.id, card.id, !card.is_bookmarked)}
                        className={`p-1.5 rounded-lg text-gray-400 hover:text-amber-500 transition-colors ${
                          card.is_bookmarked ? 'text-amber-500 fill-amber-500' : ''
                        }`}
                        title={card.is_bookmarked ? 'Unbookmark' : 'Bookmark'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditCard(card)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                        title="Edit Card"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3 border-2 border-dashed border-gray-200 rounded-2xl">
              <Layers className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-slate-900">No flashcards found</p>
              <p className="text-xs text-slate-500">
                {search ? 'Try adjusting your search or filters.' : 'Click "Add Card" to add concepts to this deck.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
