import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import { DocumentListParams } from '../types/document';
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

  return {
    ...query,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    deleteDocument: deleteDocumentMutation.mutateAsync,
    isDeleting: deleteDocumentMutation.isPending,
    retryProcessing: retryProcessingMutation.mutate,
    isRetrying: retryProcessingMutation.isPending,
  };
}
