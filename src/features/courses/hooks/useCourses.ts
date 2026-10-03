import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, CourseFilterParams } from '../api/coursesApi';
import { CourseCardData } from '../types/courses';
import { toast } from 'sonner';

export function useCourses(params: CourseFilterParams = {}) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => coursesApi.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const coursesQuery = useQuery({
    queryKey: ['courses', params],
    queryFn: () => coursesApi.getCourses(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.enroll(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Successfully enrolled in course!');
    },
    onError: () => toast.error('Failed to enroll in course'),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.toggleBookmark(courseId),
    onSuccess: (data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(data.bookmarked ? 'Course bookmarked' : 'Bookmark removed');
    },
    onError: () => toast.error('Failed to update bookmark'),
  });

  return {
    categories: categoriesQuery.data,
    courses: coursesQuery.data?.items || [],
    total: coursesQuery.data?.total || 0,
    page: coursesQuery.data?.page || 1,
    limit: coursesQuery.data?.limit || 12,
    totalPages: coursesQuery.data?.totalPages || 1,
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    error: coursesQuery.error,
    refetch: coursesQuery.refetch,
    enrollCourse: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
    toggleBookmark: bookmarkMutation.mutate,
  };
}
