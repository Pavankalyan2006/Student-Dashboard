// CORS policy for the API and the production static build.
//
// Phase 6 (P6-003): a production build is served by this same server, and the browser sends an
// Origin header with the module script request (`<script type="module" crossorigin>`). Same-origin
// requests were rejected unless the host was in CORS_ORIGINS, so any pilot host other than
// localhost:3000 showed a blank page. A request whose Origin host equals the Host it was sent to
// is same-origin and always allowed; cross-origin requests still need the allowlist.
import type { CorsOptions } from 'cors';

export function isSameOrigin(origin: string, host: string | undefined): boolean {
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Returns null when the request may proceed, or an Error when its origin is refused. */
export function corsDecision(
  origin: string | undefined,
  host: string | undefined,
  allowedOrigins: string[],
  production: boolean
): Error | null {
  if (!origin) return null; // no Origin: curl, server-to-server, same-origin GET navigations
  if (!production || allowedOrigins.includes(origin) || isSameOrigin(origin, host)) return null;
  return new Error('CORS origin rejected by security policy');
}

export const CORS_BASE_OPTIONS: CorsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};
