import * as React from 'react';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { Document } from '../types/document';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

export interface DocumentUploaderProps {
  onSuccess?: (doc: Document) => void;
  className?: string;
}

export function DocumentUploader({ onSuccess, className }: DocumentUploaderProps) {
  const { uploadFile, uploadState, isUploading, resetUpload } = useDocumentUpload(onSuccess);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadState.status === 'idle' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-white text-center',
            isDragOver
              ? 'border-[#2563EB] bg-blue-50/50 scale-[0.99]'
              : 'border-[#D0D5DD] hover:border-[#2563EB] hover:bg-slate-50/50'
          )}
        >
          <div className="h-12 w-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-3 shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-[#101828]">
            <span className="text-[#2563EB] underline decoration-blue-300 underline-offset-2">
              Click to upload
            </span>{' '}
            or drag and drop your document
          </p>
          <p className="text-xs text-[#475467] mt-1">
            Initially supports PDF, DOCX, PPTX, or TXT study materials
          </p>

          <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PDF</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">DOCX</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PPTX</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">TXT</span>
            <span>·</span>
            <span>Max 25MB</span>
          </div>
        </div>
      )}

      {/* Upload Progress State */}
      {(uploadState.status === 'reading' ||
        uploadState.status === 'uploading' ||
        uploadState.status === 'queued') && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-sm truncate">
              <FileText className="h-5 w-5 text-[#2563EB] shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-[#101828] truncate">
                  {uploadState.filename}
                </p>
                <p className="text-[11px] text-[#667085]">
                  {(uploadState.sizeBytes / (1024 * 1024)).toFixed(2)} MB · Validating & storing
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-[#2563EB]">
              {uploadState.progressPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
              style={{ width: `${uploadState.progressPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin text-[#2563EB]" />
            <span>
              {uploadState.status === 'reading'
                ? 'Validating file format and safety checksums...'
                : uploadState.status === 'uploading'
                ? 'Uploading securely to student storage...'
                : 'Queuing for semantic chunking and vector indexing...'}
            </span>
          </p>
        </div>
      )}

      {/* Error State */}
      {uploadState.status === 'error' && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-rose-900">Upload Failed</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {uploadState.errorMessage || 'Failed to process document'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 text-xs"
            >
              Try Again
            </Button>
            <button
              onClick={resetUpload}
              className="text-rose-500 hover:text-rose-800 p-1"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Completed State */}
      {uploadState.status === 'completed' && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-900">Upload Succeeded</p>
              <p className="text-[11px] text-emerald-700">
                Document is stored and being indexed for AI study workspace.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetUpload}
            className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
          >
            Upload Another
          </Button>
        </div>
      )}
    </div>
  );
}
