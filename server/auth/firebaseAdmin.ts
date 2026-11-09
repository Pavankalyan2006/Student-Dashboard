// Phase 5: Firebase Admin token verification.
//
// Firebase Auth owns the student's credentials (password, email verification, reset). The
// backend never sees a password: the browser sends a Firebase ID token and this module verifies
// it with the Firebase Admin SDK. Verifying an ID token needs only the project id (the SDK
// fetches Google's public signing keys), so no service-account JSON is required for this path.
// If GOOGLE_APPLICATION_CREDENTIALS is set the SDK picks it up for other Admin features.
import { initializeApp, getApps, getApp, applicationDefault, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from '../core/config';
import { AppError, AuthenticationError } from '../core/exceptions';
import { logger } from '../core/logging';

export interface VerifiedFirebaseUser {
  uid: string;
  email: string | null;
  email_verified: boolean;
  name: string | null;
  phone_number: string | null;
  sign_in_provider: string | null;
}

export type FirebaseTokenVerifier = (idToken: string) => Promise<VerifiedFirebaseUser>;

export class FirebaseUnavailableError extends AppError {
  constructor(message = 'Firebase authentication is temporarily unavailable. Please try again.') {
    super(message, 503, 'FIREBASE_UNAVAILABLE');
  }
}

let app: App | null = null;

/**
 * Serverless hosts (Vercel) have no secrets volume, so the service account can be passed as
 * FIREBASE_SERVICE_ACCOUNT_BASE64 (base64 of the JSON file). Server only; never VITE_.
 */
function readServiceAccountFromEnv(): Record<string, string> | null {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return null;
  try {
    const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    if (parsed?.type !== 'service_account' || !parsed.private_key || !parsed.client_email) {
      throw new Error('not a service account');
    }
    if (config.firebaseProjectId && parsed.project_id !== config.firebaseProjectId) {
      logger.error('FIREBASE_SERVICE_ACCOUNT_BASE64 belongs to a different Firebase project; ignoring it');
      return null;
    }
    return { projectId: parsed.project_id, clientEmail: parsed.client_email, privateKey: parsed.private_key };
  } catch {
    // Never log the value.
    logger.error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not valid base64 service-account JSON; ignoring it');
    return null;
  }
}
let overrideVerifier: FirebaseTokenVerifier | null = null;

/** Initialises the Admin app once; later calls reuse it (no duplicate initialisation). */
function getAdminApp(): App {
  if (app) return app;
  const name = 'btech-platform-admin';
  const existing = getApps().find((a) => a.name === name);
  if (existing) {
    app = getApp(name);
    return app;
  }
  const options: Parameters<typeof initializeApp>[0] = { projectId: config.firebaseProjectId };
  const serviceAccount = readServiceAccountFromEnv();
  if (serviceAccount) {
    options.credential = cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    options.credential = applicationDefault();
  }
  app = initializeApp(options, name);
  return app;
}

export function isFirebaseAuthEnabled(): boolean {
  return config.authProvider === 'firebase' || overrideVerifier !== null;
}

/** Test hook: replaces the Admin SDK verifier (used with locally signed synthetic tokens). */
export function setFirebaseTokenVerifier(verifier: FirebaseTokenVerifier | null): void {
  overrideVerifier = verifier;
}

const NETWORK_CODES = new Set(['app/network-error', 'auth/internal-error', 'app/network-timeout']);

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  if (overrideVerifier) return overrideVerifier(idToken);
  if (config.authProvider !== 'firebase') {
    throw new AuthenticationError('Firebase authentication is not enabled on this server');
  }
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ? decoded.email.toLowerCase() : null,
      email_verified: decoded.email_verified === true,
      name: (decoded as any).name || null,
      phone_number: decoded.phone_number || null,
      sign_in_provider: decoded.firebase?.sign_in_provider || null,
    };
  } catch (err: any) {
    const code: string = err?.code || err?.errorInfo?.code || '';
    if (NETWORK_CODES.has(code) || /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch/i.test(String(err?.message))) {
      // Never log the token itself.
      logger.error(`Firebase token verification unavailable (${code || 'network'})`);
      throw new FirebaseUnavailableError();
    }
    throw new AuthenticationError('Invalid or expired Firebase ID token');
  }
}

/** Cheap structural check so we only try Firebase verification on RS256 Firebase-shaped JWTs. */
export function looksLikeFirebaseIdToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return header?.alg === 'RS256';
  } catch {
    return false;
  }
}
