import { apiClient } from './client';

export interface NotificationItem {
  id: string;
  student_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ai';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface NotificationResponse {
  items: NotificationItem[];
  unreadCount: number;
  total: number;
}

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationResponse> => {
    return apiClient.get<NotificationResponse>('/notifications');
  },

  markAsRead: async (id: string): Promise<{ id: string; is_read: boolean }> => {
    return apiClient.patch<{ id: string; is_read: boolean }>(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<{ updatedCount: number }> => {
    return apiClient.patch<{ updatedCount: number }>('/notifications/read-all');
  },
};
