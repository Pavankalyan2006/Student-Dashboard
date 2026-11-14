/**
 * Routes that were retired from the student app. Old bookmarks and links are sent to their replacement
 * instead of a dead page. The pilot feedback page is gone, but its API and any submitted records are kept.
 */
export const RETIRED_ROUTES: Record<string, string> = {
  '/pilot-feedback': '/dashboard',
  '/feedback': '/dashboard',
};

/** Maps a retired path (with optional query) to its replacement; other paths are returned unchanged. */
export function resolveRetiredRoute(fullPath: string): string {
  const [pathname] = fullPath.split(/[?#]/);
  const target = RETIRED_ROUTES[pathname.replace(/\/+$/, '') || '/'];
  return target ?? fullPath;
}
