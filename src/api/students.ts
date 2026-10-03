import { apiClient } from './client';
import { StudentProfile } from './auth';

export const studentsApi = {
  getProfile: async (): Promise<StudentProfile> => {
    return apiClient.get<StudentProfile>('/students/me');
  },

  getAllStudents: async (): Promise<StudentProfile[]> => {
    return apiClient.get<StudentProfile[]>('/students');
  },

  updateStatus: async (studentId: string, isActive: boolean): Promise<StudentProfile> => {
    return apiClient.patch<StudentProfile>(`/students/${studentId}/status`, { is_active: isActive });
  },
};
