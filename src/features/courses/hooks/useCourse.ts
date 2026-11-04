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

  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof coursesApi.updateCourse>[1]) => coursesApi.updateCourse(courseId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course details updated');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update course'),
  });

  const addChapterMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string }) => coursesApi.addChapter(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Chapter added to course');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add chapter'),
  });

  const addLessonMutation = useMutation({
    mutationFn: ({
      chapterId,
      payload,
    }: {
      chapterId: string;
      payload: { title: string; description?: string; content?: string; estimated_minutes?: number };
    }) => coursesApi.addLesson(courseId, chapterId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Lesson added to chapter');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add lesson'),
  });

  const addResourceMutation = useMutation({
    mutationFn: (payload: Parameters<typeof coursesApi.addResource>[1]) => coursesApi.addResource(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Resource linked to course');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to link resource'),
  });

  const removeResourceMutation = useMutation({
    mutationFn: (resourceId: string) => coursesApi.removeResource(courseId, resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Resource unlinked');
    },
    onError: () => toast.error('Failed to unlink resource'),
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
    updateCourse: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    addChapter: addChapterMutation.mutateAsync,
    isAddingChapter: addChapterMutation.isPending,
    addLesson: addLessonMutation.mutateAsync,
    isAddingLesson: addLessonMutation.isPending,
    addResource: addResourceMutation.mutateAsync,
    isAddingResource: addResourceMutation.isPending,
    removeResource: removeResourceMutation.mutateAsync,
    isRemovingResource: removeResourceMutation.isPending,
  };
}
