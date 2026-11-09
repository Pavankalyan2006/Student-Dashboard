import { create } from 'zustand';
import { StudentProfile, authApi, RegisterInput, AuthConfig } from '../api/auth';
import { apiClient } from '../api/client';
import { describeFirebaseError, getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';
import { trackEvent } from '../lib/analytics';

// Phase 5: one authoritative provider. When the server reports provider "firebase" (and this
// build has the Firebase web config), credentials are handled by Firebase Auth and the server only
// ever sees Firebase ID tokens. Otherwise the existing email/password provider is used.

interface AuthState {
  student: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  provider: 'legacy' | 'firebase' | null;
  emailVerificationRequired: boolean;
  /** Firebase sign-up worked but the profile record could not be created yet; retry is safe. */
  pendingProvisioning: boolean;

  setAuth: (student: StudentProfile, token: string) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<StudentProfile>;
  register: (input: RegisterInput) => Promise<StudentProfile>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshStudent: () => Promise<StudentProfile | null>;
  resolveProvider: () => Promise<'legacy' | 'firebase'>;
  retryProvisioning: () => Promise<StudentProfile | null>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  reloadVerification: () => Promise<boolean>;
}

let configPromise: Promise<AuthConfig | null> | null = null;
let tokenListenerAttached = false;

function attachTokenListener() {
  if (tokenListenerAttached) return;
  tokenListenerAttached = true;
  void import('firebase/auth').then(({ onIdTokenChanged }) => {
    onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user) return;
      // Keep the bearer token current (Firebase rotates it about hourly).
      apiClient.setToken(await user.getIdToken());
    });
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  student: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  provider: null,
  emailVerificationRequired: false,
  pendingProvisioning: false,

  resolveProvider: async () => {
    if (get().provider) return get().provider!;
    if (!configPromise) configPromise = authApi.getConfig().catch(() => null);
    const cfg = await configPromise;
    const provider = cfg?.provider === 'firebase' && isFirebaseConfigured() ? 'firebase' : 'legacy';
    if (cfg?.provider === 'firebase' && !isFirebaseConfigured()) {
      set({ error: 'Sign-in is not available: this build is missing the Firebase configuration (VITE_FIREBASE_*).' });
    }
    set({ provider, emailVerificationRequired: Boolean(cfg?.email_verification_required) });
    if (provider === 'firebase') attachTokenListener();
    return provider;
  },

  setAuth: (student, token) => {
    apiClient.setToken(token);
    set({ student, token, isAuthenticated: true, isLoading: false, error: null });
  },

  clearAuth: () => {
    apiClient.setToken(null);
    set({ student: null, token: null, isAuthenticated: false, isLoading: false, error: null, pendingProvisioning: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const provider = await get().resolveProvider();
    try {
      if (provider === 'firebase') {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        let cred;
        try {
          cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        } catch (err) {
          throw new Error(describeFirebaseError(err));
        }
        const token = await cred.user.getIdToken();
        const res = await authApi.firebaseSession(token, {});
        set({ student: res.student, token, isAuthenticated: true, isLoading: false, error: null, pendingProvisioning: false });
        void trackEvent('login_completed', { method: 'password' });
        return res.student;
      }
      const res = await authApi.login(email, password);
      set({ student: res.student, token: res.token, isAuthenticated: true, isLoading: false, error: null });
      void trackEvent('login_completed', { method: 'password' });
      return res.student;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (input) => {
    set({ isLoading: true, error: null });
    const provider = await get().resolveProvider();
    try {
      if (provider === 'firebase') {
        const fb = await import('firebase/auth');
        const auth = getFirebaseAuth();
        let cred;
        try {
          cred = await fb.createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
        } catch (err) {
          throw new Error(describeFirebaseError(err));
        }
        try {
          await fb.updateProfile(cred.user, { displayName: input.name });
        } catch {}
        try {
          // Real verification email from Firebase; the UI shows the status reported by Firebase.
          await fb.sendEmailVerification(cred.user);
        } catch {}
        const token = await cred.user.getIdToken();
        try {
          const res = await authApi.firebaseSession(token, {
            full_name: input.name,
            accept_terms: input.accept_terms,
            accept_privacy: input.accept_privacy,
            phone: input.phone,
          });
          set({ student: res.student, token, isAuthenticated: true, isLoading: false, error: null, pendingProvisioning: false });
          void trackEvent('registration_completed', { method: 'password' });
          return res.student;
        } catch (err: any) {
          // Firebase account exists, profile record does not yet. Do not report success; let the
          // student retry (the server call is idempotent, so no duplicate account is created).
          set({ isLoading: false, pendingProvisioning: true, error: `Your sign-in was created, but your profile could not be saved yet: ${err.message}. Press "Try again".` });
          throw err;
        }
      }
      const res = await authApi.register(input);
      set({ student: res.student, token: res.token, isAuthenticated: true, isLoading: false, error: null });
      void trackEvent('registration_completed', { method: 'password' });
      return res.student;
    } catch (err: any) {
      set({ isLoading: false, error: get().error || err.message || 'Registration failed' });
      throw err;
    }
  },

  retryProvisioning: async () => {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return null;
    set({ isLoading: true });
    try {
      const token = await user.getIdToken();
      const res = await authApi.firebaseSession(token, { full_name: user.displayName || undefined });
      set({ student: res.student, token, isAuthenticated: true, isLoading: false, error: null, pendingProvisioning: false });
      return res.student;
    } catch (err: any) {
      set({ isLoading: false, pendingProvisioning: true, error: err.message });
      return null;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      if (get().provider === 'firebase') {
        const { signOut } = await import('firebase/auth');
        await signOut(getFirebaseAuth());
      }
    } finally {
      get().clearAuth();
    }
  },

  checkAuth: async () => {
    const provider = await get().resolveProvider();
    if (provider === 'firebase') {
      const auth = getFirebaseAuth();
      const { onAuthStateChanged } = await import('firebase/auth');
      const user = await new Promise<any>((resolve) => {
        const off = onAuthStateChanged(auth, (u) => {
          off();
          resolve(u);
        });
      });
      if (!user) {
        get().clearAuth();
        return;
      }
      try {
        const token = await user.getIdToken();
        // Bootstrap is idempotent: it also recovers a sign-up whose profile save failed earlier.
        const res = await authApi.firebaseSession(token, { full_name: user.displayName || undefined });
        set({ student: res.student, token, isAuthenticated: true, isLoading: false, pendingProvisioning: false });
      } catch (err: any) {
        set({ isLoading: false, isAuthenticated: false, pendingProvisioning: true, error: err.message });
      }
      return;
    }

    const existingToken = apiClient.getToken();
    if (!existingToken) {
      set({ isLoading: false, isAuthenticated: false, student: null });
      return;
    }
    try {
      const res = await authApi.getCurrentStudent();
      set({ student: res.student, isAuthenticated: true, isLoading: false });
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

  sendPasswordReset: async (email) => {
    const provider = await get().resolveProvider();
    if (provider !== 'firebase') {
      throw new Error('Password reset by email needs Firebase sign-in, which is not configured on this server yet.');
    }
    const { sendPasswordResetEmail } = await import('firebase/auth');
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (err) {
      throw new Error(describeFirebaseError(err));
    }
  },

  resendVerificationEmail: async () => {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error('Sign in first.');
    const { sendEmailVerification } = await import('firebase/auth');
    try {
      await sendEmailVerification(user);
    } catch (err) {
      throw new Error(describeFirebaseError(err));
    }
  },

  /** Reloads the Firebase user and forces a fresh token so the server sees the new verified state. */
  reloadVerification: async () => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return false;
    await user.reload();
    const token = await user.getIdToken(true);
    const res = await authApi.firebaseSession(token, {});
    set({ student: res.student, token });
    return Boolean(user.emailVerified);
  },
}));
