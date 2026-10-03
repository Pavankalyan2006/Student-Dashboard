import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, NotificationResponse } from '../api/notifications';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const notificationsQuery = useQuery<NotificationResponse>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Poll every 30s for real-time alerts
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: notificationsQuery.data?.items || [],
    unreadCount: notificationsQuery.data?.unreadCount || 0,
    total: notificationsQuery.data?.total || 0,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    refetch: notificationsQuery.refetch,
  };
}
