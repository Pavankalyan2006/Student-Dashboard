import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Presentation, Copy, RefreshCw, PencilLine, Link2, Printer } from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { ShowcaseView, type ShowcaseData } from '../components/ShowcaseView';

type Section = 'skills' | 'projects' | 'certificates' | 'achievements' | 'github';
interface Settings {
  enabled: boolean;
  slug: string | null;
  show_name: boolean;
  headline: string;
  sections: Record<Section, boolean>;
}

const KEY = ['showcase', 'me'];
const LABELS: Record<Section, string> = { skills: 'Skills', projects: 'Projects', certificates: 'Certificates', achievements: 'Achievements', github: 'Featured GitHub repositories' };

/** The student's portfolio built from their real projects, certificates, achievements and repositories, with opt-in sharing. */
export function ShowcasePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<{ settings: Settings; view: ShowcaseData }>('/showcase/me') });
  const [headline, setHeadline] = React.useState<string | null>(null);

  const onSaved = (settings: Settings) => qc.setQueryData(KEY, (old: any) => (old ? { ...old, settings } : old));
  const onError = (e: any) => toast.error(e?.message || 'Could not save.');
  const save = useMutation({ mutationFn: (body: Partial<Settings>) => apiClient.put<Settings>('/showcase/me', body), onSuccess: onSaved, onError });
  const rotate = useMutation({
    mutationFn: () => apiClient.post<Settings>('/showcase/me/new-link'),
    onSuccess: (s) => {
      onSaved(s);
      toast.success('New link made. The old link no longer works.');
    },
    onError,
  });

  if (query.isLoading) return <PageContainer><LoadingState message="Building your showcase…" /></PageContainer>;
  if (query.isError || !query.data) return <PageContainer><ErrorState message="Your showcase could not be loaded." onRetry={() => query.refetch()} /></PageContainer>;
  const { settings, view } = query.data;
  const link = settings.slug ? `${window.location.origin}/showcase/${settings.slug}` : '';
  const preview: ShowcaseData = { ...view, name: settings.show_name ? view.name : null, headline: headline ?? settings.headline };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed. Select the link and copy it.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Portfolio Showcase"
        description="Your projects, certificates, achievements and featured repositories on one page. Share it with recruiters by link, or keep it private."
        icon={<Presentation className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print or save as PDF</Button>
            <Button variant="outline" className="gap-2" onClick={() => onNavigate('/projects')}><PencilLine className="h-4 w-4" /> Add projects</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="min-w-0 space-y-4 lg:order-2 print:hidden">
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4" data-testid="showcase-settings">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-900">Share by link</span>
              <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={settings.enabled} disabled={save.isPending} onChange={(e) => save.mutate({ enabled: e.target.checked })} data-testid="showcase-share" />
            </label>
            {settings.enabled && link ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                  <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate text-xs text-slate-700" data-testid="showcase-link">{link}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={copy}><Copy className="h-3.5 w-3.5" /> Copy</Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => rotate.mutate()} disabled={rotate.isPending}><RefreshCw className="h-3.5 w-3.5" /> New link</Button>
                </div>
                <p className="text-[11px] text-slate-500">Anyone with the link can see the sections ticked below. Your email, phone and college are never shown.</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Off. Only you can see this page.</p>
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-sm font-semibold text-slate-900" htmlFor="sc-headline">Headline</label>
            <input
              id="sc-headline"
              maxLength={140}
              value={headline ?? settings.headline}
              onChange={(e) => setHeadline(e.target.value)}
              onBlur={() => headline !== null && headline !== settings.headline && save.mutate({ headline })}
              placeholder="For example: Final-year CSE student building backend systems"
              className="h-9 w-full rounded-lg border border-slate-200 px-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={settings.show_name} onChange={(e) => save.mutate({ show_name: e.target.checked })} /> Show my name
            </label>
            <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Sections on the shared page</p>
            {(Object.keys(LABELS) as Section[]).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={settings.sections[k]} onChange={(e) => save.mutate({ sections: { ...settings.sections, [k]: e.target.checked } })} /> {LABELS[k]}
              </label>
            ))}
          </div>
        </aside>

        <div className="min-w-0 lg:order-1 lg:col-span-2" data-testid="showcase-preview">
          <ShowcaseView data={preview} sections={settings.sections} />
        </div>
      </div>
    </PageContainer>
  );
}

export default ShowcasePage;
