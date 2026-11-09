import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const store = useAuthStore();
  const { student, isAuthenticated, isLoading, error, login, register, logout, checkAuth, refreshStudent } = store;

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
    // Phase 5
    provider: store.provider,
    emailVerificationRequired: store.emailVerificationRequired,
    pendingProvisioning: store.pendingProvisioning,
    retryProvisioning: store.retryProvisioning,
    sendPasswordReset: store.sendPasswordReset,
    resendVerificationEmail: store.resendVerificationEmail,
    reloadVerification: store.reloadVerification,
  };
}
