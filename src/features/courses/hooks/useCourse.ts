import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../api/coursesApi';
import { CourseWithDetails } from '../types/courses';
import { toast } from 'sonner';

export function useCourse(courseId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<CourseWithDetails>({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourse(courseId),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Enrolled in course successfully!');
    },
    onError: () => toast.error('Failed to enroll in course'),
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => coursesApi.toggleBookmark(courseId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(data.bookmarked ? 'Course bookmarked' : 'Bookmark removed');
    },
    onError: () => toast.error('Failed to update bookmark'),
  });

  return {
    course: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    enroll: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
    toggleBookmark: bookmarkMutation.mutate,
  };
}
