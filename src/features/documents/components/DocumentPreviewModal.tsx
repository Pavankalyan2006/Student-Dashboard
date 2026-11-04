import * as React from 'react';
import { DocumentCardData } from '../types/document';
import {
  FileText,
  Download,
  X,
  ExternalLink,
  Star,
  FolderSymlink,
  History,
  FileEdit,
  Code,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { DocumentStatusBadge } from './DocumentStatusBadge';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentCardData | null;
  onDownload: (documentId: string, filename: string) => void;
  onOpenWorkspace?: (documentId: string) => void;
  onOpenVersions?: (document: DocumentCardData) => void;
  onOpenMove?: (document: DocumentCardData) => void;
  onOpenEdit?: (document: DocumentCardData) => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  onDownload,
  onOpenWorkspace,
  onOpenVersions,
  onOpenMove,
  onOpenEdit,
}: DocumentPreviewModalProps) {
  const [textContent, setTextContent] = React.useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen || !document) {
      setTextContent(null);
      return;
    }

    const ext = document.file_extension?.toLowerCase() || '';
    const isTextFormat = [
      'txt', 'md', 'csv', 'tsv', 'py', 'java', 'c', 'cpp', 'js', 'ts', 'sql', 'html', 'css', 'json', 'xml'
    ].includes(ext);

    if (isTextFormat) {
      setIsLoadingContent(true);
      fetch(`/api/v1/documents/${document.id}/file`, { credentials: 'include' })
        .then((res) => res.text())
        .then((text) => {
          // If stored as base64 data URI
          if (text.startsWith('data:')) {
            const base64 = text.split(',')[1] || '';
            try {
              setTextContent(atob(base64));
            } catch {
              setTextContent(text);
            }
          } else {
            setTextContent(text);
          }
        })
        .catch(() => setTextContent('Failed to load text preview.'))
        .finally(() => setIsLoadingContent(false));
    }
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const ext = document.file_extension?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isText = [
    'txt', 'md', 'csv', 'tsv', 'py', 'java', 'c', 'cpp', 'js', 'ts', 'sql', 'html', 'css', 'json', 'xml'
  ].includes(ext);

  const fileUrl = `/api/v1/documents/${document.id}/file`;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex flex-col h-[90vh] w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
              {ext}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                  {document.title}
                </h3>
                <DocumentStatusBadge status={document.status} />
              </div>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                {document.original_filename} · {formatSize(document.file_size)} · v
                {document.current_version || 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(document.id, document.original_filename)}
              className="text-xs gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </Button>

            {onOpenWorkspace && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenWorkspace(document.id);
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Workspace</span>
              </Button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-900/5 relative overflow-hidden flex items-center justify-center">
          {isImage ? (
            <div className="w-full h-full p-6 flex items-center justify-center overflow-auto">
              <img
                src={fileUrl}
                alt={document.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-md border border-slate-200 bg-white"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={document.title}
              className="w-full h-full border-none"
            />
          ) : isText ? (
            <div className="w-full h-full p-6 overflow-auto bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed select-text">
              {isLoadingContent ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Loading preview...
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
              )}
            </div>
          ) : (
            <div className="p-8 max-w-md text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Direct In-Browser Preview Not Supported for .{ext.toUpperCase()}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You can safely download the original file to view it on your device, or open the AI
                  workspace to interact with extracted content and ask questions.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={() => onDownload(document.id, document.original_filename)}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Original Document</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Metadata & Quick Action Bar */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            {document.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px]">
                {document.category}
              </span>
            )}
            {document.folder_name && (
              <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                📁 {document.folder_name}
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              Uploaded on {new Date(document.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVersions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenVersions(document)}
                className="text-xs text-slate-600 gap-1 h-7"
              >
                <History className="h-3 w-3" />
                <span>Versions</span>
              </Button>
            )}
            {onOpenMove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenMove(document)}
                className="text-xs text-slate-600 gap-1 h-7"
              >
                <FolderSymlink className="h-3 w-3" />
                <span>Move</span>
              </Button>
            )}
            {onOpenEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenEdit(document)}
                className="text-xs text-slate-600 gap-1 h-7"
              >
                <FileEdit className="h-3 w-3" />
                <span>Edit Metadata</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
