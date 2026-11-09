// Phase 5: privacy-respecting Firebase Analytics.
//
// Analytics loads only when Firebase is configured, the browser supports it, a measurement id is
// set, and the student has opted in (Settings > Privacy, stored locally). Only a fixed list of
// product events is sent, with whitelisted, non-personal parameters. No names, emails, passwords,
// OTPs, profile details or document content are ever sent.
import { firebaseConfig, getFirebaseApp, isFirebaseConfigured } from './firebase';

export const ANALYTICS_EVENTS = [
  'registration_completed',
  'login_completed',
  'onboarding_completed',
  'course_enrolled',
  'lesson_completed',
  'quiz_completed',
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const ALLOWED_PARAMS = new Set(['method', 'step_count', 'course_id', 'lesson_id', 'quiz_id', 'score_band']);
const CONSENT_KEY = 'analytics_consent';

let analyticsPromise: Promise<any | null> | null = null;

export function getAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

export function setAnalyticsConsent(granted: boolean): void {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  } catch {}
  if (!granted) analyticsPromise = null;
}

async function loadAnalytics(): Promise<any | null> {
  if (!isFirebaseConfigured() || !firebaseConfig.measurementId || !getAnalyticsConsent()) return null;
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const mod = await import('firebase/analytics');
      if (!(await mod.isSupported())) return null;
      return mod.getAnalytics(getFirebaseApp());
    })().catch(() => null);
  }
  return analyticsPromise;
}

/** Drops any parameter not on the allow-list, and any value that looks like an email. */
export function sanitizeAnalyticsParams(params: Record<string, unknown> = {}): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (!ALLOWED_PARAMS.has(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string' && v.length <= 64 && !v.includes('@')) out[k] = v;
  }
  return out;
}

export async function trackEvent(name: AnalyticsEvent, params?: Record<string, unknown>): Promise<void> {
  if (!(ANALYTICS_EVENTS as readonly string[]).includes(name)) return;
  try {
    const analytics = await loadAnalytics();
    if (!analytics) return;
    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, name, sanitizeAnalyticsParams(params));
  } catch {
    // Analytics must never break the product flow.
  }
}
