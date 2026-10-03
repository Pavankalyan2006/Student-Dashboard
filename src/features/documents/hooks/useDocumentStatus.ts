import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';

export function useDocumentStatus(documentId?: string) {
  return useQuery({
    queryKey: ['document-status', documentId],
    queryFn: () => (documentId ? documentsApi.getStatus(documentId) : null),
    enabled: Boolean(documentId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'READY' || status === 'FAILED') {
        return false;
      }
      return 2000; // Poll every 2s while in progress
    },
  });
}
