import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import { Document } from '../types/document';
import { toast } from 'sonner';

export interface UploadProgressState {
  filename: string;
  sizeBytes: number;
  progressPercentage: number;
  status: 'idle' | 'reading' | 'uploading' | 'queued' | 'completed' | 'error';
  errorMessage?: string;
  createdDocument?: Document;
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
    mutationFn: async (file: File) => {
      // 1. Validation
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'md'];
      if (!allowedExts.includes(ext)) {
        throw new Error(`Unsupported file type (.${ext}). Supported: PDF, DOCX, PPTX, TXT`);
      }

      const MAX_SIZE = 25 * 1024 * 1024; // 25MB
      if (file.size > MAX_SIZE) {
        throw new Error('File exceeds maximum size limit of 25MB');
      }

      setUploadState({
        filename: file.name,
        sizeBytes: file.size,
        progressPercentage: 25,
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

      // 3. Send upload request
      const doc = await documentsApi.uploadDocument({
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        contentBase64: base64Data,
      });

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

  const uploadFile = (file: File) => {
    uploadMutation.mutate(file);
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
