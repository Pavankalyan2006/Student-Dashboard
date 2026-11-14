import * as React from 'react';
import { FileText, Download, ZoomIn, ZoomOut, RotateCw, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface DocumentViewerProps {
  title: string;
  documentUrl?: string;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DocumentViewer({
  title,
  documentUrl,
  totalPages = 12,
  currentPage = 1,
  onPageChange,
  className,
}: DocumentViewerProps) {
  const [zoom, setZoom] = React.useState(100);

  return (
    <div className={cn('flex flex-col h-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs', className)}>
      {/* Document toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 text-xs">
        <div className="flex items-center gap-2 max-w-sm truncate">
          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-900 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono tabular-nums text-slate-700">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <span className="tabular-nums font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>

          {documentUrl && (
            <a
              href={documentUrl}
              download
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded border border-slate-200 bg-white"
              title="Download Document"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Document preview canvas */}
      <div className="flex-1 bg-slate-100 p-6 overflow-auto flex items-center justify-center">
        <div
          className="bg-white border border-slate-200 shadow-md rounded-lg p-8 max-w-2xl w-full min-h-[480px] flex flex-col justify-between transition-all"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <div className="space-y-4">
            <div className="border-b pb-4">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Engineering Curriculum Reference · PDF Foundation
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{title}</h2>
            </div>
            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong>Abstract:</strong> This document represents an academic reference text or lecture syllabus guide registered in the B.Tech file storage repository.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                // Document Storage Metadata
                <br />
                pages_indexed: {totalPages}
                <br />
                mime_type: application/pdf
                <br />
                vector_embedding_status: RAG_READY (Phase 6)
              </div>
              <p>
                In Phase 6 (Documents AI), this viewer will render vectorized PDF text streams with inline semantic highlighting, formula extraction, and AI conversational margin annotations.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t pt-3 mt-6">
            <span>B.Tech AI Learning Workspace</span>
            <span className="tabular-nums">Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
