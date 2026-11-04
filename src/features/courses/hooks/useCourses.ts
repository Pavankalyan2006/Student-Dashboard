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

  const createCourseMutation = useMutation({
    mutationFn: (payload: Parameters<typeof coursesApi.createCourse>[0]) => coursesApi.createCourse(payload),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Course "${course.title}" created successfully!`);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create course'),
  });

  const enrollAcademicSubjectMutation = useMutation({
    mutationFn: (subjectId: string) => coursesApi.enrollAcademicSubject(subjectId),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['academic-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Enrolled in "${course.title}"!`);
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to enroll academic subject'),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ courseId, archive }: { courseId: string; archive: boolean }) =>
      archive ? coursesApi.archiveCourse(courseId) : coursesApi.restoreCourse(courseId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(variables.archive ? 'Course archived' : 'Course restored to active workspace');
    },
    onError: () => toast.error('Failed to update course archive status'),
  });

  const removeMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.removeCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Course removed from workspace');
    },
    onError: () => toast.error('Failed to remove course'),
  });

  const unenrollMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.unenroll(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Course removed from enrolled courses');
    },
    onError: () => toast.error('Failed to unenroll from course'),
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
    unenrollCourse: unenrollMutation.mutate,
    isUnenrolling: unenrollMutation.isPending,
    toggleBookmark: bookmarkMutation.mutate,
    createCourse: createCourseMutation.mutateAsync,
    isCreating: createCourseMutation.isPending,
    enrollAcademicSubject: enrollAcademicSubjectMutation.mutateAsync,
    isEnrollingSubject: enrollAcademicSubjectMutation.isPending,
    archiveCourse: (courseId: string, archive: boolean = true) => archiveMutation.mutateAsync({ courseId, archive }),
    isArchiving: archiveMutation.isPending,
    removeCourse: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
  };
}
