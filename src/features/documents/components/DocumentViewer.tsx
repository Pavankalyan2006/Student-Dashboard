import * as React from 'react';
import { Document, DocumentPage } from '../types/document';
import { useDocumentViewerStore } from '../stores/documentViewerStore';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import {
  BookOpen,
  Sparkles,
  FileText,
  FilePenLine,
  Search,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

export interface DocumentViewerProps {
  document: Document;
  pages: DocumentPage[];
  onAskAboutPage?: (pageNumber: number) => void;
  onSummarizePage?: (pageNumber: number) => void;
  onGenerateNotesFromPage?: (pageNumber: number) => void;
  className?: string;
}

export function DocumentViewer({
  document,
  pages,
  onAskAboutPage,
  onSummarizePage,
  onGenerateNotesFromPage,
  className,
}: DocumentViewerProps) {
  const {
    currentPage,
    zoom,
    selectedPages,
    sidebarTab,
    setCurrentPage,
    setTotalPages,
    togglePageSelection,
    setSidebarTab,
  } = useDocumentViewerStore();

  const [inDocSearch, setInDocSearch] = React.useState('');

  React.useEffect(() => {
    if (pages.length > 0) {
      setTotalPages(pages.length);
    }
  }, [pages, setTotalPages]);

  const activePage = pages.find((p) => p.page_number === currentPage) || pages[0];

  // In-document search matches
  const searchMatches = React.useMemo(() => {
    if (!inDocSearch.trim()) return [];
    const query = inDocSearch.toLowerCase();
    return pages
      .filter((p) => p.text.toLowerCase().includes(query))
      .map((p) => ({
        pageNumber: p.page_number,
        heading: p.metadata?.headings?.[0] || `Page ${p.page_number}`,
        preview: p.text.slice(0, 120),
      }));
  }, [pages, inDocSearch]);

  return (
    <div className={cn('flex h-full w-full bg-slate-50 overflow-hidden', className)}>
      {/* Left Navigation Sidebar: Pages Thumbnails & Search */}
      <div className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        {/* Sidebar tabs */}
        <div className="flex items-center border-b border-slate-200 p-1 bg-slate-50/60">
          <button
            onClick={() => setSidebarTab('pages')}
            className={cn(
              'flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer text-center',
              sidebarTab === 'pages'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Pages ({pages.length})
          </button>
          <button
            onClick={() => setSidebarTab('search')}
            className={cn(
              'flex-1 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer text-center',
              sidebarTab === 'search'
                ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Search
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {sidebarTab === 'pages' && (
            <>
              {pages.map((p) => {
                const isSelected = selectedPages.includes(p.page_number);
                const isCurrent = p.page_number === currentPage;

                return (
                  <div
                    key={p.page_number}
                    onClick={() => setCurrentPage(p.page_number)}
                    className={cn(
                      'group flex items-start gap-2 p-2 rounded-lg border text-left cursor-pointer transition-all',
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePageSelection(p.page_number);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                      title={isSelected ? 'Deselect page' : 'Select page for AI'}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span
                          className={cn(
                            'font-semibold',
                            isCurrent ? 'text-blue-600' : 'text-slate-800'
                          )}
                        >
                          Page {p.page_number}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.metadata?.word_count || p.text.split(/\s+/).length}w
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate leading-tight">
                        {p.metadata?.headings?.[0] || p.text.slice(0, 40)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {sidebarTab === 'search' && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2.5" />
                <input
                  type="text"
                  placeholder="Find text in document..."
                  value={inDocSearch}
                  onChange={(e) => setInDocSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {inDocSearch && (
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 px-1">
                    {searchMatches.length} match(es)
                  </p>
                  {searchMatches.map((m) => (
                    <div
                      key={m.pageNumber}
                      onClick={() => setCurrentPage(m.pageNumber)}
                      className="p-2 rounded-md border border-slate-200 bg-white hover:bg-blue-50/40 cursor-pointer text-left"
                    >
                      <span className="text-[10px] font-semibold text-blue-700">
                        Page {m.pageNumber}
                      </span>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                        {m.preview}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Document Reading Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Selected Page Action Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-blue-50/70 border-b border-blue-200/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900">
              Page {activePage?.page_number || currentPage} of {pages.length}
            </span>
            {selectedPages.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                {selectedPages.length} page(s) selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAskAboutPage?.(activePage?.page_number || currentPage)}
              className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-100/60 bg-white"
            >
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span>Ask about this page</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onSummarizePage?.(activePage?.page_number || currentPage)}
              className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-100/60 bg-white"
            >
              <FileText className="h-3 w-3 text-emerald-600" />
              <span>Summarize page</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateNotesFromPage?.(activePage?.page_number || currentPage)}
              className="h-7 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-100/60 bg-white"
            >
              <FilePenLine className="h-3 w-3 text-amber-600" />
              <span>Create Note</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Page Sheet Canvas */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-100">
          <div
            className="w-full max-w-3xl min-h-[680px] bg-white rounded-xl border border-slate-200 shadow-md p-8 sm:p-12 flex flex-col justify-between transition-transform duration-150 origin-top overflow-hidden break-words"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <div className="min-w-0 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    B.Tech Academic Curriculum Document
                  </span>
                  <h1 className="text-base font-bold text-slate-900 mt-0.5 truncate">{document.title}</h1>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                  Page {activePage?.page_number || currentPage}
                </span>
              </div>

              {/* Rendered Page Text with KaTeX & Markdown - Responsive Table & Text containment */}
              <div className="prose prose-slate max-w-none text-xs leading-relaxed text-[#1F2937] overflow-x-auto break-words [overflow-wrap:anywhere] space-y-3 [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_pre]:overflow-x-auto [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_code]:break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {activePage?.text || 'No text extracted for this page.'}
                </ReactMarkdown>
              </div>
            </div>

            {/* Document sheet footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-12 text-[10px] text-slate-400">
              <span>{document.original_filename}</span>
              <span>
                Page {activePage?.page_number || currentPage} of {pages.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
