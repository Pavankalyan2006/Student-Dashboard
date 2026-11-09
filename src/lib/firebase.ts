// Phase 5: the single Firebase initialisation for the browser.
//
// Configuration comes only from VITE_FIREBASE_* environment variables (see .env.example). The web
// API key identifies the Firebase project; it is not a secret, but it is still kept out of source.
// Only Firebase App, Auth and (where supported and consented) Analytics are loaded.
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  type Auth,
} from 'firebase/auth';

const env = (import.meta as any).env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

/** True when the browser build has the Firebase project configuration it needs for Auth. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured for this build (VITE_FIREBASE_* variables are missing).');
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig as Required<typeof firebaseConfig>);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    // Session restoration across reloads; Firebase refreshes the ID token automatically.
    void setPersistence(auth, browserLocalPersistence);
  }
  return auth;
}

/** Plain-language messages for Firebase Auth error codes; never echoes passwords. */
export function describeFirebaseError(err: any): string {
  const code: string = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead, or reset your password.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Choose a stronger password (at least 8 characters with a letter and a number).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Could not reach the sign-in service. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled for this Firebase project.';
    case 'auth/unauthorized-domain':
      return 'This website is not an authorised domain for the Firebase project.';
    default:
      return err?.message ? String(err.message).replace(/^Firebase:\s*/, '') : 'Sign-in failed. Please try again.';
  }
}
