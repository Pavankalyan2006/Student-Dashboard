import * as React from 'react';
import { DocumentCitation as CitationType } from '../types/document';
import { BookOpen, ExternalLink, Quote } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface DocumentCitationProps {
  citation: CitationType;
  onNavigateToPage?: (pageNumber: number) => void;
  className?: string;
  compact?: boolean;
}

export function DocumentCitation({
  citation,
  onNavigateToPage,
  className,
  compact = false,
}: DocumentCitationProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToPage) {
      onNavigateToPage(citation.page_number);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer',
          className
        )}
        title={`Jump to Page ${citation.page_number} in ${citation.document_title || 'Document'}`}
      >
        <BookOpen className="h-2.5 w-2.5" />
        <span>Page {citation.page_number}</span>
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-300 transition-all cursor-pointer text-left',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900 group-hover:text-blue-600 truncate">
          <BookOpen className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{citation.document_title || 'Study Document'}</span>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white text-slate-700 border border-slate-200 shrink-0">
          Page {citation.page_number}
          <ExternalLink className="h-2.5 w-2.5 text-slate-400 group-hover:text-blue-600" />
        </span>
      </div>

      {citation.quoted_text && (
        <div className="flex items-start gap-1 text-[11px] text-slate-600 line-clamp-2 italic leading-relaxed pl-1 border-l-2 border-slate-200 group-hover:border-blue-300">
          <Quote className="h-2.5 w-2.5 text-slate-400 shrink-0 mt-0.5" />
          <span>"{citation.quoted_text}"</span>
        </div>
      )}
    </div>
  );
}

export function CitationList({
  citations,
  onNavigateToPage,
}: {
  citations: CitationType[];
  onNavigateToPage?: (pageNumber: number) => void;
}) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1">
        <BookOpen className="h-3 w-3 text-slate-400" />
        <span>Grounded Sources ({citations.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((c, i) => (
          <DocumentCitation
            key={`${c.document_id}_${c.page_number}_${i}`}
            citation={c}
            onNavigateToPage={onNavigateToPage}
          />
        ))}
      </div>
    </div>
  );
}
