import * as React from 'react';
import { DocumentCardData } from '../types/document';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { DocumentActionMenu } from './DocumentActionMenu';
import {
  FileText,
  File,
  Presentation,
  FileCode,
  Star,
  Download,
  Eye,
  Folder,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

export interface DocumentListViewProps {
  documents: DocumentCardData[];
  onOpen: (id: string) => void;
  onPreview: (doc: DocumentCardData) => void;
  onDownload: (id: string, filename: string) => void;
  onAskAi: (id: string) => void;
  onGenerateSummary: (id: string) => void;
  onGenerateNotes: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenVersions: (doc: DocumentCardData) => void;
  onOpenMove: (doc: DocumentCardData) => void;
  onOpenEdit: (doc: DocumentCardData) => void;
  onIndexKnowledge: (id: string) => void;
  onLinkLab: (doc: DocumentCardData) => void;
}

export function DocumentListView({
  documents,
  onOpen,
  onPreview,
  onDownload,
  onAskAi,
  onGenerateSummary,
  onGenerateNotes,
  onToggleFavorite,
  onDelete,
  onOpenVersions,
  onOpenMove,
  onOpenEdit,
  onIndexKnowledge,
  onLinkLab,
}: DocumentListViewProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'docx':
      case 'doc':
        return <File className="h-4 w-4 text-blue-600" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="h-4 w-4 text-amber-600" />;
      default:
        return <FileCode className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4 w-10"></th>
            <th className="py-3 px-4">Title & Original File</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Folder</th>
            <th className="py-3 px-4">Size</th>
            <th className="py-3 px-4">Uploaded</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
              onClick={() => onPreview(doc)}
            >
              {/* Star */}
              <td
                className="py-3 px-4 text-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(doc.id);
                }}
              >
                <Star
                  className={`h-4 w-4 transition-colors ${
                    doc.is_favorite
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 group-hover:text-slate-400'
                  }`}
                />
              </td>

              {/* Title & Filename */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {getFileIcon(doc.file_extension)}
                  </div>
                  <div className="max-w-xs sm:max-w-md truncate">
                    <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doc.title}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {doc.original_filename}
                    </p>
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="py-3 px-4">
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[140px]">
                  {doc.category || 'Other Documents'}
                </span>
              </td>

              {/* Folder */}
              <td className="py-3 px-4">
                <span className="flex items-center gap-1 text-[11px] text-slate-600">
                  <Folder className="h-3 w-3 text-slate-400" />
                  <span className="truncate max-w-[120px]">{doc.folder_name || 'Unfiled'}</span>
                </span>
              </td>

              {/* Size */}
              <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                {formatSize(doc.file_size)}
              </td>

              {/* Upload Date */}
              <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                {new Date(doc.created_at).toLocaleDateString()}
              </td>

              {/* Status */}
              <td className="py-3 px-4 whitespace-nowrap">
                <DocumentStatusBadge status={doc.status} />
              </td>

              {/* Actions */}
              <td
                className="py-3 px-4 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(doc)}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 rounded-lg"
                    title="Quick Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(doc.id, doc.original_filename)}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600 rounded-lg"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <DocumentActionMenu
                    document={doc}
                    onOpen={() => onOpen(doc.id)}
                    onAskAi={() => onAskAi(doc.id)}
                    onGenerateSummary={() => onGenerateSummary(doc.id)}
                    onGenerateNotes={() => onGenerateNotes(doc.id)}
                    onToggleFavorite={() => onToggleFavorite(doc.id)}
                    onDelete={() => onDelete(doc.id)}
                    onPreview={() => onPreview(doc)}
                    onDownload={() => onDownload(doc.id, doc.original_filename)}
                    onOpenVersions={() => onOpenVersions(doc)}
                    onOpenMove={() => onOpenMove(doc)}
                    onOpenEdit={() => onOpenEdit(doc)}
                    onIndexKnowledge={() => onIndexKnowledge(doc.id)}
                    onLinkLab={() => onLinkLab(doc)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
