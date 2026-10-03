import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../api/coursesApi';
import { LessonWithNavigation } from '../types/courses';
import { toast } from 'sonner';

export function useLesson(lessonId: string, onCompletedNext?: (nextLessonId: string | null) => void) {
  const queryClient = useQueryClient();

  const query = useQuery<LessonWithNavigation>({
    queryKey: ['lesson', lessonId],
    queryFn: () => coursesApi.getLesson(lessonId),
    enabled: !!lessonId,
    staleTime: 1000 * 60, // 1 minute
  });

  const completeMutation = useMutation({
    mutationFn: () => coursesApi.completeLesson(lessonId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(data.isCourseCompleted ? '🎉 Congratulations! You completed the entire course!' : 'Lesson completed!');
      onCompletedNext?.(data.nextLessonId);
    },
    onError: () => toast.error('Failed to complete lesson'),
  });

  const updateProgressMutation = useMutation({
    mutationFn: (progressPercentage: number) => coursesApi.updateLessonProgress(lessonId, progressPercentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
    },
  });

  return {
    lesson: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    completeLesson: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
    updateProgress: updateProgressMutation.mutate,
  };
}
