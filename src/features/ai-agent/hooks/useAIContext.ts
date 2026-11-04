import { useQuery } from '@tanstack/react-query';
import { conversationApi } from '../api/conversationApi';
import { StudentLearningContext, AITutorContextOptions } from '../types/ai';

export function useAIContext() {
  return useQuery<StudentLearningContext>({
    queryKey: ['ai-learning-context'],
    queryFn: () => conversationApi.getLearningContext(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useTutorContextOptions() {
  return useQuery<AITutorContextOptions>({
    queryKey: ['ai-tutor-context-options'],
    queryFn: () => conversationApi.getTutorContextOptions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

