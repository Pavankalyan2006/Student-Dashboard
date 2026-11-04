// src/features/knowledge-base/components/KnowledgeDocumentsView.tsx
// Document management view with indexing status, collection assigning, AI triggers, and re-indexing

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FolderPlus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Layers,
  BookOpen,
  Download,
  Upload,
} from 'lucide-react';
import { DocumentCardData } from '../../documents/types/document';
import { KnowledgeCollection } from '../types/knowledgeBaseTypes';

interface KnowledgeDocumentsViewProps {
  documents: DocumentCardData[];
  collections: KnowledgeCollection[];
  selectedCollectionId?: string | null;
  onSelectCollectionFilter: (colId: string | null) => void;
  onAskAi: (doc: DocumentCardData) => void;
  onGenerateStudyMaterial: (doc: DocumentCardData) => void;
  onReindex: (doc: DocumentCardData) => Promise<void>;
  onAssignCollection: (doc: DocumentCardData, collectionId: string) => Promise<void>;
  onDeleteDocument: (doc: DocumentCardData) => Promise<void>;
  onOpenUpload: () => void;
  onOpenDocument?: (doc: DocumentCardData) => void;
  onUploadNewVersion?: (doc: DocumentCardData) => void;
}

export const KnowledgeDocumentsView: React.FC<KnowledgeDocumentsViewProps> = ({
  documents,
  collections,
  selectedCollectionId,
  onSelectCollectionFilter,
  onAskAi,
  onGenerateStudyMaterial,
  onReindex,
  onAssignCollection,
  onDeleteDocument,
  onOpenUpload,
  onOpenDocument,
  onUploadNewVersion,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'PROCESSING' | 'FAILED'>('ALL');
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const filteredDocuments = documents.filter((doc) => {
    // Collection filter
    if (selectedCollectionId) {
      const col = collections.find((c) => c.id === selectedCollectionId);
      if (col && !col.document_ids.includes(doc.id)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(q);
      const nameMatch = doc.original_filename.toLowerCase().includes(q);
      const tagMatch = doc.tags?.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !nameMatch && !tagMatch) return false;
    }

    return true;
  });

  const handleReindexClick = async (doc: DocumentCardData) => {
    setReindexingId(doc.id);
    try {
      await onReindex(doc);
    } finally {
      setReindexingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title, filename, or tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Collection Filter */}
          <select
            value={selectedCollectionId || ''}
            onChange={(e) => onSelectCollectionFilter(e.target.value ? e.target.value : null)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Collections ({collections.length})</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.document_count || 0})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Indexed & Ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20"
          >
            + Upload PDF
          </button>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No documents found</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            {search || selectedCollectionId || statusFilter !== 'ALL'
              ? 'Try adjusting your filters or search keywords'
              : 'Upload your first syllabus, textbook chapter, or lecture slides to begin'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Upload Document Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredDocuments.map((doc) => {
            const isReindexing = reindexingId === doc.id;
            const docCollection = collections.find((c) => c.document_ids.includes(doc.id));

            return (
              <div
                key={doc.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Document Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4
                        onClick={() => onOpenDocument && onOpenDocument(doc)}
                        className={`text-sm font-bold text-white truncate max-w-md ${
                          onOpenDocument ? 'cursor-pointer hover:text-indigo-400 transition' : ''
                        }`}
                        title={onOpenDocument ? 'Open document reader' : undefined}
                      >
                        {doc.title || doc.original_filename}
                      </h4>

                      {/* Version Badge */}
                      {((doc as any).metadata?.version || (doc as any).metadata?.versions?.length) && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700/60">
                          v{(doc as any).metadata?.version || (doc as any).metadata?.versions?.length + 1}
                        </span>
                      )}

                      {/* Status Badge */}
                      {doc.status === 'READY' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Indexed & Ready
                        </span>
                      )}
                      {doc.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-pulse">
                          <Clock className="w-3 h-3" /> Indexing...
                        </span>
                      )}
                      {doc.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          <AlertCircle className="w-3 h-3" /> Indexing Failed
                        </span>
                      )}

                      {/* Collection Pill */}
                      {docCollection && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: docCollection.color || '#4F46E5' }}
                        >
                          {docCollection.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span>{doc.original_filename}</span>
                      <span>•</span>
                      <span>{formatBytes(doc.file_size || 0)}</span>
                      {doc.page_count !== undefined && doc.page_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{doc.page_count} pages</span>
                        </>
                      )}
                      {doc.created_at && (
                        <>
                          <span>•</span>
                          <span>Uploaded {new Date(doc.created_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {doc.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Read / Open in Workspace Button */}
                  {onOpenDocument && (
                    <button
                      onClick={() => onOpenDocument(doc)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                      title="Open full document workspace"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Read</span>
                    </button>
                  )}

                  {/* Ask AI Button */}
                  <button
                    onClick={() => onAskAi(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>

                  {/* Generate Study Deck Button */}
                  <button
                    onClick={() => onGenerateStudyMaterial(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Study Deck</span>
                  </button>

                  {/* Assign Collection Dropdown */}
                  <select
                    value={docCollection?.id || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        onAssignCollection(doc, e.target.value);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition"
                    title="Move to Collection"
                  >
                    <option value="">Move to Collection...</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Download Original File Button */}
                  <a
                    href={`/api/v1/documents/${doc.id}/download`}
                    download
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition inline-flex items-center justify-center"
                    title="Download original file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {/* Upload New Version Button */}
                  {onUploadNewVersion && (
                    <button
                      onClick={() => onUploadNewVersion(doc)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition inline-flex items-center justify-center"
                      title="Upload newer version"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}

                  {/* Re-index Button */}
                  <button
                    onClick={() => handleReindexClick(doc)}
                    disabled={isReindexing}
                    title="Re-run text parsing and vector indexing"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteDocument(doc)}
                    title="Delete document"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 text-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
