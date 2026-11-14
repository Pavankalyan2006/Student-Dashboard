import * as React from 'react';
import { DocumentCardData } from '../types/document';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { DocumentActionMenu } from './DocumentActionMenu';
import { DocumentDeleteDialog } from './DocumentDeleteDialog';
import {
  FileText,
  FileCode,
  File,
  Presentation,
  Star,
  Clock,
  HardDrive,
  BookOpen,
  Folder,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface DocumentCardProps {
  document: DocumentCardData;
  onOpen: (documentId: string) => void;
  onAskAi: (documentId: string) => void;
  onGenerateSummary: (documentId: string) => void;
  onGenerateNotes: (documentId: string) => void;
  onGenerateQuiz?: (documentId: string) => void;
  onToggleFavorite: (documentId: string) => void;
  onDelete: (documentId: string) => Promise<any>;
  onRetryProcessing?: (documentId: string) => void;
  onPreview?: (document: DocumentCardData) => void;
  onDownload?: (documentId: string, filename: string) => void;
  onOpenVersions?: (document: DocumentCardData) => void;
  onOpenMove?: (document: DocumentCardData) => void;
  onOpenEdit?: (document: DocumentCardData) => void;
  onIndexKnowledge?: (documentId: string) => void;
  onLinkLab?: (document: DocumentCardData) => void;
}

export function DocumentCard({
  document,
  onOpen,
  onAskAi,
  onGenerateSummary,
  onGenerateNotes,
  onGenerateQuiz,
  onToggleFavorite,
  onDelete,
  onRetryProcessing,
  onPreview,
  onDownload,
  onOpenVersions,
  onOpenMove,
  onOpenEdit,
  onIndexKnowledge,
  onLinkLab,
}: DocumentCardProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Icon based on format
  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'docx':
      case 'doc':
        return <File className="h-5 w-5 text-blue-600" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="h-5 w-5 text-amber-600" />;
      default:
        return <FileCode className="h-5 w-5 text-slate-600" />;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(document.id);
      setDeleteOpen(false);
    } catch {
      // Handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-600/40',
          document.status === 'FAILED' && 'border-rose-200 bg-rose-50/20'
        )}
      >
        <div>
          {/* Top header row: Format Icon, Extension, Version, Favorite, Action Menu */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                {getFileIcon(document.file_extension)}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 w-fit">
                  {document.file_extension}
                </span>
              </div>
              {document.current_version && document.current_version > 1 && (
                <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  v{document.current_version}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(document.id);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition-colors cursor-pointer"
                title={document.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
              >
                <Star
                  className={`h-4 w-4 ${
                    document.is_favorite ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              </button>

              <DocumentActionMenu
                document={document}
                onOpen={() => onOpen(document.id)}
                onAskAi={() => onAskAi(document.id)}
                onGenerateSummary={() => onGenerateSummary(document.id)}
                onGenerateNotes={() => onGenerateNotes(document.id)}
                onGenerateQuiz={onGenerateQuiz ? () => onGenerateQuiz(document.id) : undefined}
                onToggleFavorite={() => onToggleFavorite(document.id)}
                onRetryProcessing={() => onRetryProcessing?.(document.id)}
                onDelete={() => setDeleteOpen(true)}
                onPreview={onPreview ? () => onPreview(document) : undefined}
                onDownload={
                  onDownload
                    ? () => onDownload(document.id, document.original_filename)
                    : undefined
                }
                onOpenVersions={onOpenVersions ? () => onOpenVersions(document) : undefined}
                onOpenMove={onOpenMove ? () => onOpenMove(document) : undefined}
                onOpenEdit={onOpenEdit ? () => onOpenEdit(document) : undefined}
                onIndexKnowledge={
                  onIndexKnowledge ? () => onIndexKnowledge(document.id) : undefined
                }
                onLinkLab={onLinkLab ? () => onLinkLab(document) : undefined}
              />
            </div>
          </div>

          {/* Category & Folder Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {document.category && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[180px]">
                {document.category}
              </span>
            )}
            {document.folder_name && (
              <span className="text-[10px] text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                <Folder className="h-2.5 w-2.5 text-slate-400" />
                <span className="truncate max-w-[120px]">{document.folder_name}</span>
              </span>
            )}
          </div>

          {/* Title and description */}
          <div
            onClick={() => (onPreview ? onPreview(document) : onOpen(document.id))}
            className="cursor-pointer group-hover:text-blue-600 transition-colors"
          >
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600">
              {document.title}
            </h3>
            {document.course_title && (
              <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                {document.course_title}
              </p>
            )}
          </div>
        </div>

        {/* Metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <span>{document.page_count > 0 ? `${document.page_count} pages` : 'Analyzing'}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatSize(document.file_size)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <DocumentStatusBadge status={document.status} />

            <span className="text-[10px] text-slate-400 truncate">
              {document.created_at ? new Date(document.created_at).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      </div>

      <DocumentDeleteDialog
        isOpen={deleteOpen}
        documentTitle={document.title}
        isDeleting={isDeleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

