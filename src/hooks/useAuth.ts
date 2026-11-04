import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { student, isAuthenticated, isLoading, error, login, register, logout, checkAuth, refreshStudent } = useAuthStore();

  const isSuperAdmin = student?.role === 'SUPER_ADMIN';

  return {
    student,
    isAuthenticated,
    isLoading,
    error,
    isSuperAdmin,
    login,
    register,
    logout,
    checkAuth,
    refreshStudent,
  };
}
