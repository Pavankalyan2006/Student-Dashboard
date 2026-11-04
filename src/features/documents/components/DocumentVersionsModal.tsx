import * as React from 'react';
import { useDocumentVersions } from '../hooks/useFolders';
import { DocumentCardData } from '../types/document';
import {
  History,
  UploadCloud,
  Download,
  RotateCcw,
  X,
  CheckCircle2,
  FileText,
  Clock,
  HardDrive,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export interface DocumentVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentCardData | null;
  onSuccess?: () => void;
}

export function DocumentVersionsModal({
  isOpen,
  onClose,
  document,
  onSuccess,
}: DocumentVersionsModalProps) {
  const documentId = document?.id || null;
  const { versions, isLoading, uploadVersion, isUploading, restoreVersion, isRestoring } =
    useDocumentVersions(documentId);

  const [isUploadingNew, setIsUploadingNew] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [changeNotes, setChangeNotes] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen || !document) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File exceeds maximum size of 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(selectedFile);
      });

      await uploadVersion({
        originalName: selectedFile.name,
        mimeType: selectedFile.type || 'application/octet-stream',
        sizeBytes: selectedFile.size,
        contentBase64: base64Data,
        changeNotes: changeNotes.trim() || undefined,
      });

      setSelectedFile(null);
      setChangeNotes('');
      setIsUploadingNew(false);
      onSuccess?.();
    } catch {
      // Handled by hook toast
    }
  };

  const handleDownloadVersion = (versionNumber: number, filename?: string) => {
    const url = `/api/v1/documents/${document.id}/versions/${versionNumber}/download`;
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename || `version_${versionNumber}_${document.original_filename}`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleRestore = async (versionNumber: number) => {
    if (
      !window.confirm(
        `Are you sure you want to restore version v${versionNumber}? The current document will be saved as a new version history checkpoint.`
      )
    ) {
      return;
    }

    try {
      await restoreVersion(versionNumber);
      onSuccess?.();
    } catch {
      // Handled by hook toast
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document Version History</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-md">
                {document.title} · Current v{document.current_version || 1}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isUploadingNew && (
              <Button
                size="sm"
                onClick={() => setIsUploadingNew(true)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload New Version</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Upload New Version Form */}
        {isUploadingNew && (
          <form
            onSubmit={handleUploadSubmit}
            className="my-4 p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <UploadCloud className="h-4 w-4 text-blue-600" />
                Upload Revision or Updated Document
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsUploadingNew(false);
                  setSelectedFile(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-lg border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 text-center cursor-pointer transition-colors"
              >
                <p className="text-xs font-semibold text-blue-600">Click to choose revised file</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Maximum size 50MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-white">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-slate-900">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-500">({formatSize(selectedFile.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Version Notes / Change Summary
              </label>
              <input
                type="text"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="e.g. Added Chapter 4 exercises, updated professor solutions"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={isUploading || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>{isUploading ? 'Uploading Revision...' : 'Save New Version'}</span>
              </Button>
            </div>
          </form>
        )}

        {/* Version List */}
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="text-xs text-slate-400 p-6 text-center">Loading version history...</p>
          ) : versions.length === 0 ? (
            <div className="p-6 text-center border border-dashed rounded-xl">
              <p className="text-xs text-slate-500">Currently at Initial Version v1</p>
            </div>
          ) : (
            versions.map((ver) => {
              const isCurrent = ver.version_number === (document.current_version || 1);
              return (
                <div
                  key={ver.version_number}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-300 bg-blue-50/30 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          v{ver.version_number}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            Active Version
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-900">
                          {ver.original_filename}
                        </span>
                      </div>

                      {ver.change_notes && (
                        <p className="text-xs text-slate-600 italic">
                          &ldquo;{ver.change_notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatSize(ver.file_size)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ver.uploaded_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadVersion(ver.version_number, ver.original_filename)
                        }
                        title="Download this version"
                        className="h-8 px-2.5 text-xs text-slate-600 gap-1 border-slate-200"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>

                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(ver.version_number)}
                          disabled={isRestoring}
                          title="Restore this version as active"
                          className="h-8 px-2.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
