import { apiClient } from './client';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  branch: string;
  semester: number;
  role: 'STUDENT' | 'SUPER_ADMIN';
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  student: StudentProfile;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    const result = await apiClient.post<LoginResult>('/auth/login', { email, password });
    if (result.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },

  getCurrentStudent: async (): Promise<{ student: StudentProfile }> => {
    return apiClient.get<{ student: StudentProfile }>('/auth/me');
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const result = await apiClient.post<{ token: string }>('/auth/refresh', { refreshToken });
    if (result.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },
};
