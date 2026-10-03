import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { student, isAuthenticated, isLoading, error, login, logout, checkAuth } = useAuthStore();

  const isSuperAdmin = student?.role === 'SUPER_ADMIN';

  return {
    student,
    isAuthenticated,
    isLoading,
    error,
    isSuperAdmin,
    login,
    logout,
    checkAuth,
  };
}
