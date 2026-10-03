import * as React from 'react';
import { Star, BookOpen, Clock, MoreVertical, Trash2, HelpCircle, Layers, Copy, ArrowRight } from 'lucide-react';
import { NoteCardData } from '../types/notes';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown';

interface NoteCardProps {
  note: NoteCardData;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenQuiz?: (id: string) => void;
  onOpenFlashcards?: (id: string) => void;
}

export function NoteCard({
  note,
  onOpen,
  onToggleFavorite,
  onDelete,
  onOpenQuiz,
  onOpenFlashcards,
}: NoteCardProps) {
  const formattedDate = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const readableType = note.note_type
    .replace('_NOTES', '')
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card className="group relative flex flex-col justify-between p-5 bg-white border border-[#E4E7EC] hover:border-[#2563EB]/40 transition-all hover:shadow-sm">
      <div>
        {/* Top bar: Source indicator & Favorite + Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#475467]">
            <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
            <span className="truncate max-w-[200px]">
              {note.source_title || (note.source_type === 'topic' ? 'Topic Note' : 'Curriculum Note')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              className="p-1 rounded text-[#98A2B3] hover:text-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <Star
                className={`h-4 w-4 ${
                  note.is_favorite ? 'fill-amber-400 text-amber-500' : 'text-[#98A2B3]'
                }`}
              />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded text-[#98A2B3] hover:text-[#101828] hover:bg-[#F2F4F7] transition-colors focus-visible:outline-none"
                  aria-label="Note options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-[#E4E7EC] shadow-md z-50">
                <DropdownMenuItem onClick={() => onOpen(note.id)} className="cursor-pointer text-xs flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-[#475467]" />
                  Open & Read Note
                </DropdownMenuItem>
                {onOpenFlashcards && (
                  <DropdownMenuItem
                    onClick={() => onOpenFlashcards(note.id)}
                    className="cursor-pointer text-xs flex items-center gap-2"
                  >
                    <Layers className="h-3.5 w-3.5 text-[#475467]" />
                    Review Flashcards
                  </DropdownMenuItem>
                )}
                {onOpenQuiz && (
                  <DropdownMenuItem
                    onClick={() => onOpenQuiz(note.id)}
                    className="cursor-pointer text-xs flex items-center gap-2"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-[#475467]" />
                    Start Note Quiz
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(note.id)}
                  className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 flex items-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpen(note.id)}
          className="text-base font-semibold text-[#101828] group-hover:text-[#2563EB] transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
        >
          {note.title}
        </h3>

        {/* Unboxed Metadata Line (anti-slop rule) */}
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-xs text-[#475467] mb-3">
          <span className="font-medium text-[#101828]">{readableType}</span>
          <span>·</span>
          <span>{note.level}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
            <Clock className="h-3 w-3 text-[#98A2B3]" />
            {note.reading_time_minutes} min read
          </span>
          <span>·</span>
          <span>{formattedDate}</span>
        </div>

        {/* Short Preview */}
        <p className="text-xs text-[#475467] line-clamp-3 leading-relaxed mb-4">
          {note.content_preview}
        </p>
      </div>

      {/* Footer: Tags & Read Button */}
      <div className="pt-3 border-t border-[#F2F4F7] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-6">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono text-[#475467] bg-[#F2F4F7] px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] text-[#98A2B3]">+{note.tags.length - 3}</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpen(note.id)}
          className="h-7 px-2 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:bg-blue-50 group-hover:translate-x-0.5 transition-all"
        >
          Read <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
