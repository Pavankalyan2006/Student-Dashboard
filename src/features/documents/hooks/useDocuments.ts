import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import {
  DocumentListParams,
  CreateFolderPayload,
  UpdateFolderPayload,
  UploadDocumentPayload,
} from '../types/document';
import { toast } from 'sonner';

export function useDocuments(params: DocumentListParams = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.getDocuments(params),
    staleTime: 1000 * 30, // 30 seconds
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.toggleFavorite(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update favorite status');
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.deleteDocument(documentId),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete document');
    },
  });

  const retryProcessingMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.retryProcessing(documentId),
    onSuccess: () => {
      toast.info('Document processing re-queued');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to retry processing');
    },
  });

  const moveDocumentMutation = useMutation({
    mutationFn: ({ documentId, folderId }: { documentId: string; folderId: string | null }) =>
      documentsApi.moveDocument(documentId, folderId),
    onSuccess: () => {
      toast.success('Document moved successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to move document');
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({
      documentId,
      updates,
    }: {
      documentId: string;
      updates: { title?: string; description?: string; category?: string; folder_id?: string };
    }) => documentsApi.updateDocument(documentId, updates),
    onSuccess: () => {
      toast.success('Document metadata updated');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update document');
    },
  });

  const indexInKnowledgeMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.indexInKnowledgeBase(documentId),
    onSuccess: (data) => {
      toast.success(data.message || 'Document indexed in Knowledge Base');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to index in Knowledge Base');
    },
  });

  const linkToLabMutation = useMutation({
    mutationFn: ({ documentId, labId, labTitle }: { documentId: string; labId: string; labTitle?: string }) =>
      documentsApi.linkToLab(documentId, labId, labTitle),
    onSuccess: () => {
      toast.success('Document linked to Lab experiment');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to link document to Lab');
    },
  });

  return {
    ...query,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isDeleting: deleteDocumentMutation.isPending,
    retryProcessing: retryProcessingMutation.mutate,
    isRetrying: retryProcessingMutation.isPending,
    moveDocument: moveDocumentMutation.mutateAsync,
    isMoving: moveDocumentMutation.isPending,
    updateDocument: updateDocumentMutation.mutateAsync,
    isUpdating: updateDocumentMutation.isPending,
    indexInKnowledge: indexInKnowledgeMutation.mutateAsync,
    isIndexing: indexInKnowledgeMutation.isPending,
    linkToLab: linkToLabMutation.mutateAsync,
    isLinkingLab: linkToLabMutation.isPending,
  };
}

export function useFolders() {
  const queryClient = useQueryClient();

  const foldersQuery = useQuery({
    queryKey: ['documentFolders'],
    queryFn: () => documentsApi.getFolders(),
    staleTime: 1000 * 60,
  });

  const createFolderMutation = useMutation({
    mutationFn: (payload: CreateFolderPayload) => documentsApi.createFolder(payload),
    onSuccess: () => {
      toast.success('Folder created successfully');
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create folder');
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ folderId, payload }: { folderId: string; payload: UpdateFolderPayload }) =>
      documentsApi.updateFolder(folderId, payload),
    onSuccess: () => {
      toast.success('Folder updated successfully');
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update folder');
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: ({
      folderId,
      actionOnDocuments,
    }: {
      folderId: string;
      actionOnDocuments?: 'unfile' | 'delete';
    }) => documentsApi.deleteFolder(folderId, actionOnDocuments),
    onSuccess: () => {
      toast.success('Folder removed successfully');
      queryClient.invalidateQueries({ queryKey: ['documentFolders'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete folder');
    },
  });

  return {
    folders: foldersQuery.data || [],
    isLoading: foldersQuery.isLoading,
    error: foldersQuery.error,
    refetch: foldersQuery.refetch,
    createFolder: createFolderMutation.mutateAsync,
    isCreating: createFolderMutation.isPending,
    updateFolder: updateFolderMutation.mutateAsync,
    isUpdating: updateFolderMutation.isPending,
    deleteFolder: deleteFolderMutation.mutateAsync,
    isDeleting: deleteFolderMutation.isPending,
  };
}

export function useDocumentStats() {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['documentStats'],
    queryFn: () => documentsApi.getStats(),
    staleTime: 1000 * 30,
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
}

export function useDocumentVersions(documentId: string | null) {
  const queryClient = useQueryClient();

  const versionsQuery = useQuery({
    queryKey: ['documentVersions', documentId],
    queryFn: () => (documentId ? documentsApi.getVersions(documentId) : Promise.resolve([])),
    enabled: Boolean(documentId),
  });

  const uploadVersionMutation = useMutation({
    mutationFn: (payload: {
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      contentBase64?: string;
      changeNotes?: string;
    }) => {
      if (!documentId) throw new Error('No document ID specified');
      return documentsApi.uploadNewVersion(documentId, payload);
    },
    onSuccess: () => {
      toast.success('New version uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documentVersions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to upload new version');
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: (versionNumber: number) => {
      if (!documentId) throw new Error('No document ID specified');
      return documentsApi.restoreVersion(documentId, versionNumber);
    },
    onSuccess: () => {
      toast.success('Version restored successfully');
      queryClient.invalidateQueries({ queryKey: ['documentVersions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to restore version');
    },
  });

  return {
    versions: versionsQuery.data || [],
    isLoading: versionsQuery.isLoading,
    refetch: versionsQuery.refetch,
    uploadVersion: uploadVersionMutation.mutateAsync,
    isUploading: uploadVersionMutation.isPending,
    restoreVersion: restoreVersionMutation.mutateAsync,
    isRestoring: restoreVersionMutation.isPending,
  };
}

