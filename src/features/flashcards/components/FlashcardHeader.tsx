// src/features/flashcards/components/FlashcardHeader.tsx
import * as React from 'react';
import { Search, Plus, Play, Sparkles, BrainCircuit } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface FlashcardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateOpen: (defaultTab?: 'manual' | 'ai' | 'notes' | 'course') => void;
  onStartReviewDue: () => void;
  dueCardsCount: number;
}

export const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onCreateOpen,
  onStartReviewDue,
  dueCardsCount,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#101828] tracking-tight">
              AI Flashcards
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
              SM-2 Spaced Repetition
            </span>
          </div>
          <p className="text-sm text-[#475467] mt-1">
            Learn faster with active recall, curriculum-aligned decks, and personalized revision schedules.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            onClick={() => onCreateOpen('ai')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            AI Generator
          </Button>

          <Button
            onClick={() => onCreateOpen('manual')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold text-[#344054] border-[#D0D5DD] hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Flashcards
          </Button>

          <Button
            onClick={onStartReviewDue}
            disabled={dueCardsCount === 0}
            size="sm"
            className="gap-1.5 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Review {dueCardsCount > 0 ? `(${dueCardsCount} Due)` : ''}
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search decks, questions, answers, syllabus topics, or tags..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#D0D5DD] bg-white placeholder-[#667085] text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
