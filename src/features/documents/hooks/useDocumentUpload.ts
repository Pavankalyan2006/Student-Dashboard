import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import { Document, UploadDocumentPayload } from '../types/document';
import { toast } from 'sonner';

export interface UploadProgressState {
  filename: string;
  sizeBytes: number;
  progressPercentage: number;
  status: 'idle' | 'reading' | 'uploading' | 'queued' | 'completed' | 'error';
  errorMessage?: string;
  createdDocument?: Document;
}

export interface UploadFileOptions {
  title?: string;
  category?: string;
  folderId?: string;
  courseId?: string;
  courseTitle?: string;
  subject?: string;
  semester?: number;
  academicYear?: string;
  topic?: string;
  tags?: string[];
  description?: string;
  notes?: string;
}

export function useDocumentUpload(onSuccessCallback?: (doc: Document) => void) {
  const queryClient = useQueryClient();
  const [uploadState, setUploadState] = React.useState<UploadProgressState>({
    filename: '',
    sizeBytes: 0,
    progressPercentage: 0,
    status: 'idle',
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options?: UploadFileOptions }) => {
      // 1. Validation
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = [
        'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'txt', 'md',
        'csv', 'tsv', 'png', 'jpg', 'jpeg', 'webp',
        'py', 'java', 'c', 'cpp', 'js', 'ts', 'sql', 'html', 'css', 'json', 'xml'
      ];
      if (!allowedExts.includes(ext)) {
        throw new Error(
          `Unsupported file type (.${ext}). Supported formats: PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, Images (PNG, JPG, WEBP), and Code (Python, Java, C/C++, JS/TS, SQL)`
        );
      }

      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_SIZE) {
        throw new Error('File exceeds maximum size limit of 50MB');
      }

      setUploadState({
        filename: file.name,
        sizeBytes: file.size,
        progressPercentage: 20,
        status: 'reading',
      });

      // 2. Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = (e) => reject(new Error('Failed to read file: ' + e));
        reader.readAsDataURL(file);
      });

      setUploadState((prev) => ({
        ...prev,
        progressPercentage: 60,
        status: 'uploading',
      }));

      // 3. Send upload request with metadata
      const payload: UploadDocumentPayload = {
        title: options?.title?.trim() || undefined,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        contentBase64: base64Data,
        category: options?.category,
        folderId: options?.folderId,
        courseId: options?.courseId,
        courseTitle: options?.courseTitle,
        subject: options?.subject,
        semester: options?.semester,
        topic: options?.topic,
        tags: options?.tags,
        description: options?.description,
        notes: options?.notes,
      };

      const doc = await documentsApi.uploadDocument(payload);

      setUploadState((prev) => ({
        ...prev,
        progressPercentage: 100,
        status: 'queued',
        createdDocument: doc,
      }));

      return doc;
    },
    onSuccess: (doc) => {
      toast.success(`"${doc.title}" uploaded! Processing started in background.`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
      setUploadState((prev) => ({ ...prev, status: 'completed' }));
      onSuccessCallback?.(doc);
    },
    onError: (err: any) => {
      const msg = err.message || 'Upload failed';
      toast.error(msg);
      setUploadState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: msg,
      }));
    },
  });

  const uploadFile = (file: File, options?: UploadFileOptions) => {
    uploadMutation.mutate({ file, options });
  };

  const resetUpload = () => {
    setUploadState({
      filename: '',
      sizeBytes: 0,
      progressPercentage: 0,
      status: 'idle',
    });
  };

  return {
    uploadFile,
    uploadState,
    isUploading: uploadMutation.isPending,
    resetUpload,
  };
}

