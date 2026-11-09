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
  display_name?: string;
  onboarding_completed?: boolean;
  auth_provider?: 'legacy' | 'firebase';
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  student: StudentProfile;
}

export interface RegisterInput {
  name: string;
  display_name?: string;
  avatar_url?: string;
  email: string;
  password: string;
  degree?: string;
  branch?: string;
  semester?: number;
  institution?: string;
  admission_year?: number;
  roll_number?: string;
  target_role?: string;
  learning_goal?: string;
  phone?: string;
  accept_terms?: boolean;
  accept_privacy?: boolean;
}

export interface AuthConfig {
  provider: 'legacy' | 'firebase';
  email_verification_required: boolean;
  profile_store: 'snapshot' | 'supabase';
}

export interface FirebaseSessionResult {
  student: StudentProfile;
  created: boolean;
  linked: boolean;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    const result = await apiClient.post<LoginResult>('/auth/login', { email, password });
    if (result.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },

  register: async (input: RegisterInput): Promise<LoginResult> => {
    const result = await apiClient.post<LoginResult>('/auth/register', input);
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

  getConfig: async (): Promise<AuthConfig> => apiClient.get<AuthConfig>('/auth/config'),

  /** Phase 5: verifies the Firebase ID token on the server and finds or creates the student (idempotent). */
  firebaseSession: async (
    idToken: string,
    extra: { full_name?: string; accept_terms?: boolean; accept_privacy?: boolean; phone?: string } = {}
  ): Promise<FirebaseSessionResult> => {
    apiClient.setToken(idToken);
    return apiClient.post<FirebaseSessionResult>('/auth/firebase/session', extra);
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const result = await apiClient.post<{ token: string }>('/auth/refresh', { refreshToken });
    if (result.token) {
      apiClient.setToken(result.token);
    }
    return result;
  },
};
