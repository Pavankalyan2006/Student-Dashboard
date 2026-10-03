import { apiClient } from '../../../api/client';
import { DashboardData, TodayPlanTask } from '../types/dashboard';

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    return apiClient.get<DashboardData>('/dashboard');
  },

  toggleTodayTask: async (taskId: string): Promise<TodayPlanTask> => {
    return apiClient.patch<TodayPlanTask>(`/dashboard/today/${taskId}`);
  },
};
