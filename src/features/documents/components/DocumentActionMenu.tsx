import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown';
import { Button } from '../../../components/ui/button';
import {
  MoreVertical,
  BookOpen,
  Sparkles,
  FileText,
  FilePenLine,
  HelpCircle,
  Star,
  Trash2,
  RotateCw,
  Download,
  Eye,
  History,
  FolderSymlink,
  FileEdit,
  Database,
  FlaskConical,
} from 'lucide-react';
import { DocumentCardData } from '../types/document';

export interface DocumentActionMenuProps {
  document: DocumentCardData;
  onOpen: () => void;
  onAskAi: () => void;
  onGenerateSummary: () => void;
  onGenerateNotes: () => void;
  onGenerateQuiz?: () => void;
  onToggleFavorite: () => void;
  onRetryProcessing?: () => void;
  onDelete: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onOpenVersions?: () => void;
  onOpenMove?: () => void;
  onOpenEdit?: () => void;
  onIndexKnowledge?: () => void;
  onLinkLab?: () => void;
}

export function DocumentActionMenu({
  document,
  onOpen,
  onAskAi,
  onGenerateSummary,
  onGenerateNotes,
  onGenerateQuiz,
  onToggleFavorite,
  onRetryProcessing,
  onDelete,
  onPreview,
  onDownload,
  onOpenVersions,
  onOpenMove,
  onOpenEdit,
  onIndexKnowledge,
  onLinkLab,
}: DocumentActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
          aria-label="Document options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 text-xs">
        {onPreview && (
          <DropdownMenuItem onClick={onPreview} className="gap-2 cursor-pointer">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            <span>Quick Preview</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onOpen} className="gap-2 cursor-pointer">
          <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
          <span>Open AI Workspace</span>
        </DropdownMenuItem>

        {onDownload && (
          <DropdownMenuItem onClick={onDownload} className="gap-2 cursor-pointer">
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            <span>Download Document</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onAskAi}
          disabled={document.status !== 'READY'}
          className="gap-2 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span>Ask AI Assistant</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onGenerateSummary}
          disabled={document.status !== 'READY'}
          className="gap-2 cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5 text-emerald-600" />
          <span>Generate Summary</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onGenerateNotes}
          disabled={document.status !== 'READY'}
          className="gap-2 cursor-pointer"
        >
          <FilePenLine className="h-3.5 w-3.5 text-amber-600" />
          <span>Export to Notes</span>
        </DropdownMenuItem>

        {onGenerateQuiz && (
          <DropdownMenuItem
            onClick={onGenerateQuiz}
            disabled={document.status !== 'READY'}
            className="gap-2 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
            <span>Generate Quiz</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Integration Actions */}
        {onIndexKnowledge && (
          <DropdownMenuItem onClick={onIndexKnowledge} className="gap-2 cursor-pointer">
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              {document.content_indexed ? 'Re-index Knowledge Base' : 'Add to Knowledge Base'}
            </span>
          </DropdownMenuItem>
        )}

        {onLinkLab && (
          <DropdownMenuItem onClick={onLinkLab} className="gap-2 cursor-pointer">
            <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
            <span>Use as Lab Manual</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Organization & Versioning */}
        {onOpenEdit && (
          <DropdownMenuItem onClick={onOpenEdit} className="gap-2 cursor-pointer">
            <FileEdit className="h-3.5 w-3.5 text-slate-600" />
            <span>Edit Metadata & Category</span>
          </DropdownMenuItem>
        )}

        {onOpenMove && (
          <DropdownMenuItem onClick={onOpenMove} className="gap-2 cursor-pointer">
            <FolderSymlink className="h-3.5 w-3.5 text-blue-600" />
            <span>Move to Folder</span>
          </DropdownMenuItem>
        )}

        {onOpenVersions && (
          <DropdownMenuItem onClick={onOpenVersions} className="gap-2 cursor-pointer">
            <History className="h-3.5 w-3.5 text-purple-600" />
            <span>Version History (v{document.current_version || 1})</span>
          </DropdownMenuItem>
        )}

        {document.status === 'FAILED' && onRetryProcessing && (
          <DropdownMenuItem onClick={onRetryProcessing} className="gap-2 cursor-pointer">
            <RotateCw className="h-3.5 w-3.5 text-blue-600" />
            <span>Retry Processing</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onToggleFavorite} className="gap-2 cursor-pointer">
          <Star
            className={`h-3.5 w-3.5 ${
              document.is_favorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
            }`}
          />
          <span>{document.is_favorite ? 'Remove Favorite' : 'Mark as Favorite'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-red-600 focus:text-red-700 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Document</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

