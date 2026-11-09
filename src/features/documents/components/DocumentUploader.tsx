import * as React from 'react';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { useFolders } from '../hooks/useFolders';
import { Document, DOCUMENT_CATEGORIES } from '../types/document';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Folder,
  Tag,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

export interface DocumentUploaderProps {
  onSuccess?: (doc: Document) => void;
  className?: string;
  defaultFolderId?: string;
}

export function DocumentUploader({
  onSuccess,
  className,
  defaultFolderId,
}: DocumentUploaderProps) {
  const { uploadFile, uploadState, isUploading, resetUpload } = useDocumentUpload(onSuccess);
  const { folders } = useFolders();

  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Metadata form state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('Lecture Notes');
  const [folderId, setFolderId] = React.useState(defaultFolderId || '');
  const [subject, setSubject] = React.useState('');
  const [courseTitle, setCourseTitle] = React.useState('');
  const [semester, setSemester] = React.useState('');
  const [academicYear, setAcademicYear] = React.useState('2025-2026');
  const [topic, setTopic] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [notes, setNotes] = React.useState('');

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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    // Derive nice display title without file extension
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanTitle = nameWithoutExt.replace(/[_-]/g, ' ');
    setTitle(cleanTitle);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const parsedTags = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    uploadFile(selectedFile, {
      title: title.trim() || undefined,
      category,
      folderId: folderId || undefined,
      subject: subject.trim() || undefined,
      courseTitle: courseTitle.trim() || undefined,
      semester: semester ? Number(semester) : undefined,
      academicYear: academicYear.trim() || undefined,
      topic: topic.trim() || undefined,
      tags: parsedTags,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setNotes('');
    resetUpload();
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.csv,.tsv,.png,.jpg,.jpeg,.webp,.py,.java,.c,.cpp,.js,.ts,.sql"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadState.status === 'idle' && !selectedFile && (
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
            or drag and drop your academic document
          </p>
          <p className="text-xs text-[#475467] mt-1">
            Supports PDF, Word (DOCX), PowerPoint (PPTX), Excel (XLSX), Markdown, Text, CSV, Images, and Code
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 text-[11px] text-slate-500 max-w-lg">
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PDF</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">DOCX</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">PPTX</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">XLSX</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">TXT / MD / CSV</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Images (PNG/JPG)</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Code (Py/Java/C/SQL)</span>
            <span>·</span>
            <span className="font-semibold text-slate-700">Max 50MB</span>
          </div>
        </div>
      )}

      {/* Selected File & Metadata Configuration Form */}
      {uploadState.status === 'idle' && selectedFile && (
        <form
          onSubmit={handleUploadSubmit}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              Choose different file
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Operating Systems Lecture 4"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Folder
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">(Unfiled / Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course / Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Deadlocks, Normalization, BSTs"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. btech, cse, lab, unit-3"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add key highlights or lecture context for this document"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-xs"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Confirm & Upload Document</span>
            </Button>
          </div>
        </form>
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
                : 'Queued for text extraction and indexing...'}
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
              onClick={handleReset}
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
                Document is stored and available in your academic vault.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
          >
            Upload Another
          </Button>
        </div>
      )}
    </div>
  );
}

