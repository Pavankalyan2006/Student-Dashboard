// src/features/flashcards/components/FlashcardDeckCard.tsx
import * as React from 'react';
import {
  MoreVertical,
  Play,
  Layers,
  Calendar,
  Sparkles,
  FileText,
  BookOpen,
  Bookmark,
  Archive,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { FlashcardDeck } from '../../../types/learningModules';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown';

interface FlashcardDeckCardProps {
  deck: FlashcardDeck;
  onStudy: (deck: FlashcardDeck) => void;
  onOpenDetail: (deck: FlashcardDeck) => void;
  onEdit: (deck: FlashcardDeck) => void;
  onDuplicate: (deck: FlashcardDeck) => void;
  onArchive: (deck: FlashcardDeck) => void;
  onBookmark: (deck: FlashcardDeck) => void;
  onDelete: (deck: FlashcardDeck) => void;
  onSchedulePlanner: (deck: FlashcardDeck) => void;
}

export const FlashcardDeckCard: React.FC<FlashcardDeckCardProps> = ({
  deck,
  onStudy,
  onOpenDetail,
  onEdit,
  onDuplicate,
  onArchive,
  onBookmark,
  onDelete,
  onSchedulePlanner,
}) => {
  const masteryPercentage =
    deck.total_cards > 0 ? Math.round(((deck.mastered_count || 0) / deck.total_cards) * 100) : 0;

  const renderSourceBadge = () => {
    switch (deck.source_type) {
      case 'AI_GENERATED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
            <Sparkles className="w-3 h-3 text-purple-600" />
            AI Generated
          </span>
        );
      case 'NOTES':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
            <FileText className="w-3 h-3 text-amber-600" />
            Notes
          </span>
        );
      case 'DOCUMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            <BookOpen className="w-3 h-3 text-blue-600" />
            Document
          </span>
        );
      case 'COURSE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <BookOpen className="w-3 h-3 text-emerald-600" />
            Course
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
            <Layers className="w-3 h-3 text-gray-500" />
            Manual
          </span>
        );
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-sm bg-white hover:shadow-md ${
        deck.is_archived
          ? 'border-gray-200 opacity-75 bg-gray-50/50'
          : 'border-[#E4E7EC] hover:border-blue-400'
      }`}
    >
      <div className="space-y-3">
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
              {deck.subject}
            </span>
            {renderSourceBadge()}
            {deck.is_bookmarked && (
              <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            )}
            {deck.is_archived && (
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                Archived
              </span>
            )}
          </div>

          {/* Action Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Deck options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border border-[#E4E7EC] rounded-xl p-1">
              <DropdownMenuItem onClick={() => onStudy(deck)} className="text-xs font-medium cursor-pointer">
                <Play className="w-3.5 h-3.5 mr-2 text-blue-600" />
                Study Deck
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenDetail(deck)} className="text-xs font-medium cursor-pointer">
                <Layers className="w-3.5 h-3.5 mr-2 text-gray-600" />
                Manage Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(deck)} className="text-xs font-medium cursor-pointer">
                <FileText className="w-3.5 h-3.5 mr-2 text-gray-600" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(deck)} className="text-xs font-medium cursor-pointer">
                <Copy className="w-3.5 h-3.5 mr-2 text-indigo-600" />
                Duplicate Deck
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSchedulePlanner(deck)} className="text-xs font-medium cursor-pointer">
                <Calendar className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                Schedule in Planner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBookmark(deck)} className="text-xs font-medium cursor-pointer">
                <Bookmark className="w-3.5 h-3.5 mr-2 text-amber-500" />
                {deck.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Deck'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(deck)} className="text-xs font-medium cursor-pointer">
                <Archive className="w-3.5 h-3.5 mr-2 text-gray-500" />
                {deck.is_archived ? 'Restore Deck' : 'Archive Deck'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 border-gray-100" />
              <DropdownMenuItem
                onClick={() => onDelete(deck)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Deck
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title and Description */}
        <div>
          <h3
            onClick={() => onOpenDetail(deck)}
            className="text-base font-bold text-[#101828] hover:text-blue-600 cursor-pointer line-clamp-1 transition-colors"
          >
            {deck.title}
          </h3>
          <p className="text-xs text-[#475467] line-clamp-2 mt-1 leading-relaxed">
            {deck.description || 'Curriculum flashcards designed for targeted active recall and retention.'}
          </p>
        </div>

        {/* Tags */}
        {deck.tags && deck.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deck.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                #{tag}
              </span>
            ))}
            {deck.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{deck.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
        {/* Progress & Due Counts */}
        <div className="flex items-center justify-between text-xs font-medium text-[#475467]">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            {deck.total_cards} {deck.total_cards === 1 ? 'card' : 'cards'}
          </span>

          <div className="flex items-center gap-2">
            {deck.due_count > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                {deck.due_count} due
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Up to date
              </span>
            )}
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>Mastery: {deck.mastered_count || 0}/{deck.total_cards}</span>
            <span className="font-semibold text-emerald-600">{masteryPercentage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => onStudy(deck)}
            disabled={deck.total_cards === 0}
            className="flex-1 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {deck.due_count > 0 ? 'Review Due' : 'Study'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenDetail(deck)}
            className="text-xs font-semibold text-[#344054] border-[#D0D5DD] hover:bg-gray-50"
          >
            Open Deck
          </Button>
        </div>
      </div>
    </div>
  );
};
