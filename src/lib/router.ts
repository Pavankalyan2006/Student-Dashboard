import * as React from 'react';

/**
 * Universal client-side router utility that seamlessly coordinates
 * with App.tsx popstate events and window.history without requiring
 * external router providers.
 */
export function navigateTo(path: string) {
  if (typeof window !== 'undefined') {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  }
}

export function useNavigate() {
  return React.useCallback((path: string | number) => {
    if (typeof path === 'number') {
      window.history.go(path);
      return;
    }
    navigateTo(path);
  }, []);
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const params: Record<string, string> = {};

  // Research project ID: /research/:researchId(/...)
  const researchMatch = pathname.match(/^\/research\/([^/]+)/);
  if (researchMatch && researchMatch[1] !== 'create') {
    params.researchId = researchMatch[1];
  }

  // GitHub repo ID: /github/repo/:repoId(/...)
  const repoMatch = pathname.match(/^\/github\/repo\/([^/]+)/);
  if (repoMatch) {
    params.repoId = repoMatch[1];
  }

  // Document ID: /documents/:documentId(/...)
  const docMatch = pathname.match(/^\/documents\/([^/]+)/);
  if (docMatch && docMatch[1] !== 'upload') {
    params.documentId = docMatch[1];
  }

  // Course ID: /courses/:courseId(/...)
  const courseMatch = pathname.match(/^\/courses\/([^/]+)/);
  if (courseMatch) {
    params.courseId = courseMatch[1];
  }

  // Note ID: /notes/:noteId(/...)
  const noteMatch = pathname.match(/^\/notes\/([^/]+)/);
  if (noteMatch) {
    params.noteId = noteMatch[1];
  }

  // Placement role or topic ID
  const placementMatch = pathname.match(/^\/placements\/topic\/([^/]+)/);
  if (placementMatch) {
    params.topicId = placementMatch[1];
  }

  return params as T;
}

export function useLocation() {
  const [loc, setLoc] = React.useState(() => ({
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    key: 'default',
  }));

  React.useEffect(() => {
    const handlePopState = () => {
      setLoc({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        key: Date.now().toString(),
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return loc;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const location = useLocation();
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);

  const setSearchParams = React.useCallback((next: URLSearchParams | Record<string, string>) => {
    const qs = next instanceof URLSearchParams ? next.toString() : new URLSearchParams(next).toString();
    const newPath = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    navigateTo(newPath);
  }, []);

  return [searchParams, setSearchParams];
}
