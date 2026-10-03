import * as React from 'react';
import { useDocumentViewerStore } from '../stores/documentViewerStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  FileText,
  FilePenLine,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

export interface DocumentToolbarProps {
  title: string;
  onBack?: () => void;
  onGenerateQuiz?: () => void;
  className?: string;
}

export function DocumentToolbar({ title, onBack, onGenerateQuiz, className }: DocumentToolbarProps) {
  const {
    currentPage,
    totalPages,
    zoom,
    fitMode,
    searchQuery,
    rightPanel,
    setCurrentPage,
    zoomIn,
    zoomOut,
    setFitMode,
    setSearchQuery,
    setRightPanel,
  } = useDocumentViewerStore();

  const [pageInput, setPageInput] = React.useState(String(currentPage));

  React.useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-[#E4E7EC] text-xs shadow-2xs',
        className
      )}
    >
      {/* Left: Back button & Title */}
      <div className="flex items-center gap-2.5 min-w-0 max-w-sm sm:max-w-md">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-lg shrink-0"
            title="Back to Documents"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2 truncate">
          <BookOpen className="h-4 w-4 text-[#2563EB] shrink-0" />
          <h2 className="font-semibold text-[#101828] truncate text-xs sm:text-sm" title={title}>
            {title}
          </h2>
        </div>
      </div>

      {/* Center: Page Controls & Zoom */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Page navigator */}
        <div className="flex items-center rounded-lg border border-[#E4E7EC] bg-slate-50/50 p-0.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <form onSubmit={handlePageSubmit} className="flex items-center px-1">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              className="w-8 text-center text-xs font-mono font-medium text-slate-800 bg-white rounded border border-slate-200 py-0.5 px-0.5 focus:outline-none focus:border-blue-500"
              aria-label="Current page number"
            />
            <span className="text-[11px] text-slate-500 ml-1.5 tabular-nums">/ {totalPages}</span>
          </form>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-1 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="hidden sm:flex items-center rounded-lg border border-[#E4E7EC] bg-slate-50/50 p-0.5">
          <button
            onClick={zoomOut}
            className="p-1 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 text-[11px] font-mono tabular-nums text-slate-700 min-w-10 text-center">
            {zoom}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Panel Toggles (AI Assistant, Summary, Notes, Quiz) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onGenerateQuiz && (
          <button
            onClick={onGenerateQuiz}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer shadow-2xs"
            title="Generate AI Quiz from this document"
          >
            <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
            <span className="hidden sm:inline">Generate Quiz</span>
          </button>
        )}

        <button
          onClick={() => setRightPanel('chat')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
            rightPanel === 'chat'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#475467] hover:bg-slate-100 hover:text-[#101828]'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        <button
          onClick={() => setRightPanel('summary')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
            rightPanel === 'summary'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#475467] hover:bg-slate-100 hover:text-[#101828]'
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Summary</span>
        </button>

        <button
          onClick={() => setRightPanel('notes')}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
            rightPanel === 'notes'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#475467] hover:bg-slate-100 hover:text-[#101828]'
          )}
        >
          <FilePenLine className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Notes</span>
        </button>
      </div>
    </div>
  );
}
