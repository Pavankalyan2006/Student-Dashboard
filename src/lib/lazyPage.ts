import * as React from 'react';

const RELOAD_FLAG = 'btech.chunk-reload';

/**
 * Loads a page only when it is first opened, so the first visit downloads one page instead of all of them.
 * After a new deploy, an open tab may ask for a page file that no longer exists; in that case the tab
 * reloads once to pick up the new version instead of showing an error.
 */
export function lazyPage<T extends React.ComponentType<any>>(load: () => Promise<Record<string, unknown>>, name: string) {
  return React.lazy(async () => {
    try {
      const mod = await load();
      sessionStorage.removeItem(RELOAD_FLAG);
      return { default: mod[name] as T };
    } catch (err) {
      if (typeof window !== 'undefined' && !sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw err;
    }
  });
}
