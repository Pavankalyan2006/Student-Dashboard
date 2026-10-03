import * as React from 'react';
import { DocumentProcessingStatus } from '../types/document';
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface DocumentStatusBadgeProps {
  status: DocumentProcessingStatus;
  className?: string;
  showText?: boolean;
}

export function DocumentStatusBadge({
  status,
  className,
  showText = true,
}: DocumentStatusBadgeProps) {
  switch (status) {
    case 'READY':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60',
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
          {showText && <span>Ready for AI</span>}
        </span>
      );

    case 'FAILED':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60',
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
          {showText && <span>Failed</span>}
        </span>
      );

    case 'PROCESSING':
    case 'EXTRACTING':
    case 'CHUNKING':
    case 'EMBEDDING':
      const labelMap: Record<string, string> = {
        PROCESSING: 'Processing...',
        EXTRACTING: 'Extracting text...',
        CHUNKING: 'Analyzing pages...',
        EMBEDDING: 'Building AI index...',
      };

      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 animate-pulse',
            className
          )}
        >
          <Loader2 className="h-3 w-3 text-blue-600 animate-spin shrink-0" />
          {showText && <span>{labelMap[status] || 'Processing...'}</span>}
        </span>
      );

    case 'UPLOADING':
    case 'UPLOADED':
    case 'QUEUED':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60',
            className
          )}
        >
          <Clock className="h-3 w-3 text-amber-600 shrink-0" />
          {showText && <span>Queued</span>}
        </span>
      );
  }
}
