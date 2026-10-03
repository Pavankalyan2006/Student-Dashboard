import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardData } from '../types/dashboard';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

export function useDashboard() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getDashboard(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => dashboardApi.toggleTodayTask(taskId),
    onSuccess: (updatedTask) => {
      // Optimistically update query cache
      queryClient.setQueryData<DashboardData>(['dashboard'], (old) => {
        if (!old) return old;
        return {
          ...old,
          today_plan: old.today_plan.map((t) =>
            t.id === updatedTask.id ? { ...t, is_completed: updatedTask.is_completed } : t
          ),
        };
      });

      if (updatedTask.is_completed) {
        toast.success(`Completed: ${updatedTask.title}`);
      }
    },
    onError: () => {
      toast.error('Failed to update task status');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleTodayTask: toggleTaskMutation.mutate,
    isTogglingTask: toggleTaskMutation.isPending,
  };
}
