import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { ShowcaseView, type ShowcaseData } from '../components/ShowcaseView';

/** The page behind a student's share link. No sign-in; shows only what the student chose to share. */
export function PublicShowcasePage({ slug, onNavigate }: { slug: string; onNavigate: (path: string) => void }) {
  const query = useQuery({ queryKey: ['showcase', 'public', slug], queryFn: () => apiClient.get<ShowcaseData>(`/showcase/public/${encodeURIComponent(slug)}`), retry: false });

  React.useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
  React.useEffect(() => {
    if (query.data) document.title = query.data.name ? `${query.data.name} · Portfolio` : 'Student portfolio';
  }, [query.data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {query.isLoading ? (
          <p className="text-center text-sm text-slate-500">Loading…</p>
        ) : query.isError || !query.data ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center" data-testid="showcase-unavailable">
            <h1 className="text-lg font-semibold text-slate-900">This portfolio is not shared</h1>
            <p className="mt-1 text-sm text-slate-600">The link may have been turned off or replaced by its owner.</p>
          </div>
        ) : (
          <main>
            <h1 className="sr-only">{query.data.name ? `${query.data.name}'s portfolio` : 'Student portfolio'}</h1>
            <ShowcaseView data={query.data} />
          </main>
        )}
        <button onClick={() => onNavigate('/')} className="mx-auto mt-10 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
          <GraduationCap className="h-4 w-4" /> Made with the B.Tech Learning Platform
        </button>
      </div>
    </div>
  );
}

export default PublicShowcasePage;
