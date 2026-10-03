import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import { DocumentSummaryLevel } from '../types/document';
import { toast } from 'sonner';

export function useDocumentSummary(documentId: string, level: DocumentSummaryLevel = 'standard') {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['document-summary', documentId, level],
    queryFn: () => documentsApi.getSummary(documentId, level),
    enabled: Boolean(documentId),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    retry: 1,
  });

  const generateMutation = useMutation({
    mutationFn: (params: {
      level?: DocumentSummaryLevel;
      start_page?: number;
      end_page?: number;
      force_regenerate?: boolean;
    }) =>
      documentsApi.generateSummary(documentId, {
        level: params.level || level,
        start_page: params.start_page,
        end_page: params.end_page,
        force_regenerate: params.force_regenerate ?? true,
      }),
    onSuccess: (newSummary) => {
      toast.success('Document summary generated');
      queryClient.setQueryData(['document-summary', documentId, newSummary.summary_level], newSummary);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate summary');
    },
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    generateSummary: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
}
