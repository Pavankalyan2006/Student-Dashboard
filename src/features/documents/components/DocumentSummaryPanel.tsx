import * as React from 'react';
import { useDocumentSummary } from '../hooks/useDocumentSummary';
import { Document, DocumentSummaryLevel } from '../types/document';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import {
  FileText,
  Sparkles,
  RefreshCw,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Sigma,
  FilePenLine,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';
import { documentsApi } from '../api/documentsApi';

export interface DocumentSummaryPanelProps {
  document: Document;
  onSaveAsNote?: (noteId: string) => void;
  className?: string;
}

export function DocumentSummaryPanel({
  document,
  onSaveAsNote,
  className,
}: DocumentSummaryPanelProps) {
  const [level, setLevel] = React.useState<DocumentSummaryLevel>('standard');
  const [startPage, setStartPage] = React.useState<string>('1');
  const [endPage, setEndPage] = React.useState<string>(String(document.page_count || 1));
  const [useRange, setUseRange] = React.useState(false);

  const { summary, isLoading, isGenerating, generateSummary } = useDocumentSummary(
    document.id,
    level
  );
  const [isExportingNote, setIsExportingNote] = React.useState(false);

  const handleGenerate = () => {
    generateSummary({
      level,
      start_page: useRange ? Number(startPage) : undefined,
      end_page: useRange ? Number(endPage) : undefined,
      force_regenerate: true,
    });
  };

  const handleSaveToNotes = async () => {
    try {
      setIsExportingNote(true);
      const note = await documentsApi.generateNotes(document.id, {
        start_page: useRange ? Number(startPage) : undefined,
        end_page: useRange ? Number(endPage) : undefined,
        note_type: level === 'exam_revision' ? 'EXAM_NOTES' : 'STUDY_NOTES',
      });
      toast.success('Saved to your Notes repository!');
      if (onSaveAsNote && note?.id) {
        onSaveAsNote(note.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save note');
    } finally {
      setIsExportingNote(false);
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white border-l border-[#E4E7EC]', className)}>
      {/* Panel Header */}
      <div className="p-4 border-b border-[#E4E7EC] bg-slate-50/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#101828]">Curriculum Summary</h3>
              <p className="text-[10px] text-[#667085]">Structured AI Synthesis</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-7 text-xs gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            {isGenerating ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span>{summary ? 'Regenerate' : 'Generate'}</span>
          </Button>
        </div>

        {/* Level Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-lg border border-slate-200 text-center">
          {(['quick', 'standard', 'detailed', 'exam_revision'] as DocumentSummaryLevel[]).map(
            (lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={cn(
                  'py-1 text-[10px] font-medium rounded capitalize transition-colors cursor-pointer',
                  level === lvl
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {lvl === 'exam_revision' ? 'Exam' : lvl}
              </button>
            )
          )}
        </div>

        {/* Page Range Filter */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useRange}
              onChange={(e) => setUseRange(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-0"
            />
            <span>Page Range</span>
          </label>

          {useRange && (
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <input
                type="number"
                min="1"
                max={document.page_count}
                value={startPage}
                onChange={(e) => setStartPage(e.target.value)}
                className="w-10 px-1 py-0.5 border rounded text-center bg-white"
              />
              <span>to</span>
              <input
                type="number"
                min="1"
                max={document.page_count}
                value={endPage}
                onChange={(e) => setEndPage(e.target.value)}
                className="w-10 px-1 py-0.5 border rounded text-center bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {isLoading || isGenerating ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-[#2563EB] mb-2" />
            <p className="font-semibold text-slate-800">Synthesizing Document...</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Extracting key concepts, formulas, and high-yield exam takeaways.
            </p>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Overview */}
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
              <h4 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                Executive Overview
              </h4>
              <p className="text-slate-700 leading-relaxed text-[11px]">{summary.overview}</p>
            </div>

            {/* Key Concepts */}
            {summary.key_concepts && summary.key_concepts.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-[#2563EB]" />
                  <span>Key Concepts</span>
                </h4>
                <ul className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                  {summary.key_concepts.map((concept, i) => (
                    <li key={i} className="text-slate-700 leading-relaxed text-[11px]">
                      {concept}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exam Points */}
            {summary.exam_points && summary.exam_points.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80">
                <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Exam High-Yield Focus</span>
                </h4>
                <ul className="space-y-1 pl-4 list-disc text-amber-900 text-[11px]">
                  {summary.exam_points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulas with KaTeX */}
            {summary.formulas && summary.formulas.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sigma className="h-3.5 w-3.5 text-purple-600" />
                  <span>Formulas & Mathematical Invariants</span>
                </h4>
                <div className="space-y-2">
                  {summary.formulas.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1"
                    >
                      <span className="text-[11px] font-semibold text-slate-800">{f.name}</span>
                      <div className="text-xs text-slate-900 overflow-x-auto py-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {f.formula}
                        </ReactMarkdown>
                      </div>
                      {f.explanation && (
                        <p className="text-[10px] text-slate-500 italic">{f.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save to Notes Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToNotes}
                disabled={isExportingNote}
                className="w-full gap-1.5 border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                <FilePenLine className="h-3.5 w-3.5 text-[#2563EB]" />
                <span>
                  {isExportingNote ? 'Saving to Notes...' : 'Save Summary to My Notes'}
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="h-8 w-8 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No Summary Generated Yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Click "Generate" above to synthesize high-yield curriculum takeaways, definitions, and
              formulas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
