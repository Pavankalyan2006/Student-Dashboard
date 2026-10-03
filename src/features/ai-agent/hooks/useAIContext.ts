import { useQuery } from '@tanstack/react-query';
import { conversationApi } from '../api/conversationApi';
import { StudentLearningContext } from '../types/ai';

export function useAIContext() {
  return useQuery<StudentLearningContext>({
    queryKey: ['ai-learning-context'],
    queryFn: () => conversationApi.getLearningContext(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
