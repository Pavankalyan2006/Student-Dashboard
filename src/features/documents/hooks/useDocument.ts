import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';

export function useDocument(documentId?: string) {
  const docQuery = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => (documentId ? documentsApi.getDocument(documentId) : null),
    enabled: Boolean(documentId),
    staleTime: 1000 * 60, // 1 minute
  });

  const pagesQuery = useQuery({
    queryKey: ['document-pages', documentId],
    queryFn: () => (documentId ? documentsApi.getPages(documentId) : []),
    enabled: Boolean(documentId) && docQuery.data?.status === 'READY',
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    document: docQuery.data,
    isLoading: docQuery.isLoading,
    isError: docQuery.isError,
    error: docQuery.error,
    refetchDocument: docQuery.refetch,
    pages: pagesQuery.data || [],
    isLoadingPages: pagesQuery.isLoading,
  };
}
