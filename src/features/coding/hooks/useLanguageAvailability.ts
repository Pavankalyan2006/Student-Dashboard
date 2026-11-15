import { useEffect, useState } from 'react';
import { codingApi } from '../api/codingApi';
import { BROWSER_LANGUAGES, browserSandboxSupported } from '../../../lib/browserSandbox';

export type RunPlace = 'server' | 'browser' | 'none';
export interface LanguageAvailability {
  available: boolean;
  detail?: string;
  /** Where Run executes this language: the server sandbox, the browser sandbox, or nowhere. */
  runs: RunPlace;
}

let cache: Promise<Record<string, LanguageAvailability>> | null = null;

/** True when the server has no sandbox but this browser can run the language itself. */
export function runsInBrowser(l: { id: string; available?: boolean; availability_detail?: string }): boolean {
  return (
    l.available === false &&
    l.availability_detail === 'sandbox_unavailable' &&
    (BROWSER_LANGUAGES as readonly string[]).includes(l.id) &&
    browserSandboxSupported()
  );
}

/** Which languages can run, and where. The server is asked once per page load. */
export function loadLanguageAvailability(): Promise<Record<string, LanguageAvailability>> {
  if (!cache) {
    cache = codingApi
      .getLanguages()
      .then((list: any[]) => {
        const map: Record<string, LanguageAvailability> = {};
        for (const l of Array.isArray(list) ? list : []) {
          const server = l.available !== false;
          const browser = runsInBrowser(l);
          map[l.id] = { available: server || browser, detail: l.availability_detail, runs: server ? 'server' : browser ? 'browser' : 'none' };
        }
        return map;
      })
      .catch(() => {
        cache = null;
        return {};
      });
  }
  return cache;
}

export function useLanguageAvailability(): Record<string, LanguageAvailability> {
  const [map, setMap] = useState<Record<string, LanguageAvailability>>({});
  useEffect(() => {
    let alive = true;
    loadLanguageAvailability().then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  return map;
}
