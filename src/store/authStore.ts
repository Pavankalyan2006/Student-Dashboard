import { create } from 'zustand';
import { StudentProfile, authApi, RegisterInput } from '../api/auth';
import { apiClient } from '../api/client';

interface AuthState {
  student: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (student: StudentProfile, token: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<StudentProfile>;
  register: (input: RegisterInput) => Promise<StudentProfile>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshStudent: () => Promise<StudentProfile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  student: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setAuth: (student, token) => {
    apiClient.setToken(token);
    set({ student, token, isAuthenticated: true, isLoading: false, error: null });
  },

  clearAuth: () => {
    apiClient.setToken(null);
    set({ student: null, token: null, isAuthenticated: false, isLoading: false, error: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      set({
        student: res.student,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return res.student;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(input);
      set({
        student: res.student,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return res.student;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      get().clearAuth();
    }
  },

  checkAuth: async () => {
    const existingToken = apiClient.getToken();
    if (!existingToken) {
      set({ isLoading: false, isAuthenticated: false, student: null });
      return;
    }

    try {
      const res = await authApi.getCurrentStudent();
      set({
        student: res.student,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      get().clearAuth();
    }
  },

  refreshStudent: async () => {
    try {
      const res = await authApi.getCurrentStudent();
      set({ student: res.student });
      return res.student;
    } catch {
      return null;
    }
  },
}));
