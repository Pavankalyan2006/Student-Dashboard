// src/features/knowledge-base/components/KnowledgeUploadModal.tsx
// Document upload modal with collection assignment, tags, and progress

import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Folder, RefreshCw } from 'lucide-react';
import { documentsApi } from '../../documents/api/documentsApi';
import { knowledgeBaseApi } from '../api/knowledgeBaseApi';
import { KnowledgeCollection } from '../types/knowledgeBaseTypes';
import { DocumentCardData } from '../../documents/types/document';
import { toast } from 'sonner';

interface KnowledgeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: KnowledgeCollection[];
  defaultCollectionId?: string | null;
  targetDocument?: DocumentCardData | null;
  onUploadSuccess: () => void;
}

export const KnowledgeUploadModal: React.FC<KnowledgeUploadModalProps> = ({
  isOpen,
  onClose,
  collections,
  defaultCollectionId,
  targetDocument,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState<string>(defaultCollectionId || '');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetDocument) {
      setTitle(targetDocument.title || targetDocument.original_filename);
    } else {
      setFile(null);
      setTitle('');
      setTags('');
    }
  }, [targetDocument, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Convert to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(new Error('Failed reading file: ' + err));
        reader.readAsDataURL(file);
      });

      if (targetDocument) {
        await knowledgeBaseApi.uploadDocumentVersion(targetDocument.id, {
          original_filename: file.name,
          file_data_base64: base64Data,
          mime_type: file.type || 'application/pdf',
          size_bytes: file.size,
        });
      } else {
        // 2. Upload to documents API
        const parsedTags = tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);

        const created = await documentsApi.uploadDocument({
          originalName: file.name,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
          contentBase64: base64Data,
          title: title.trim() || file.name,
          tags: parsedTags,
        });

        if ((created as any).duplicate_of) {
          toast.info(`This file is already in your documents as "${created.title}". No copy was made.`);
        }

        // 3. If collection selected, assign document
        if (collectionId && created.id) {
          try {
            await knowledgeBaseApi.assignDocumentToCollection(collectionId, created.id);
          } catch (colErr) {
            console.warn('Collection assignment warning:', colErr);
          }
        }
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg ${
                targetDocument ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
              } flex items-center justify-center`}
            >
              {targetDocument ? <RefreshCw className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {targetDocument ? 'Upload New Document Version' : 'Upload to Knowledge Base'}
              </h3>
              {targetDocument && (
                <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                  Updating: <span className="text-slate-800 font-semibold">{targetDocument.title || targetDocument.original_filename}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Picker Drag Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-200 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-slate-50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.tsv,.py,.java,.cpp,.c,.ts,.js,.sql,.json"
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-indigo-700 text-sm font-medium">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="truncate max-w-[300px]">{file.name}</span>
                <span className="text-xs text-slate-500">
                  ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-900">Click or drag file here to upload</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PDF, DOCX, PPTX, TXT, MD, CSV, Code (.py, .java, .cpp, .ts, .sql) up to 25MB
                </p>
              </div>
            )}
          </div>

          {!targetDocument && (
            <>
              {/* Document Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Chapter 4 - Virtual Memory"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Attach to Collection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Attach to Subject Collection
                </label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No Collection (General Unfiled)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. os, paging, virtual-memory, exam-notes"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className={`px-5 py-2 ${
                targetDocument
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
              } disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-md`}
            >
              {uploading
                ? 'Processing & Indexing...'
                : targetDocument
                ? 'Upload & Re-index Version'
                : 'Upload & Index'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
