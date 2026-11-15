import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Workflow, Bot, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, PauseCircle, ChevronDown } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { cn } from '../../../lib/utils';

interface StudentAgent {
  id: string;
  name: string;
  purpose: string;
  enabled: boolean;
  available: boolean;
  members: { name: string; description: string; platform_enabled: boolean }[];
  tools: string[];
}
interface ToolInfo {
  name: string;
  description: string;
  category: 'READ_ONLY' | 'AI_GENERATION' | 'MUTATION' | 'EXTERNAL_ACTION';
  asks_first: boolean;
}
interface WorkflowInfo {
  id: string;
  type: string;
  status: string;
  agents: string[];
  steps: { agent: string; title: string; status: string }[];
  started_at: string;
  duration_ms?: number;
}
interface AgentsView {
  core: string[];
  agents: StudentAgent[];
  tools: ToolInfo[];
  workflows: WorkflowInfo[];
}
interface ActivityEntry {
  id: string;
  at: string;
  tool: string;
  agent?: string;
  category: ToolInfo['category'];
  status: 'ok' | 'failed' | 'blocked';
  needs_approval: boolean;
  approved: boolean;
  duration_ms: number;
  error?: string;
}

const CATEGORY: Record<ToolInfo['category'], string> = {
  READ_ONLY: 'Reads your data',
  AI_GENERATION: 'Writes with AI',
  MUTATION: 'Changes your data',
  EXTERNAL_ACTION: 'Acts outside the platform',
};
const KEY = ['agents', 'me'];
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const readable = (s: string) => s.replace(/Agent$/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
const words = (s: string) => s.toLowerCase().replace(/_/g, ' ');

function Switch({ checked, label, onChange, disabled }: { checked: boolean; label: string; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50', checked ? 'bg-blue-600' : 'bg-slate-300')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

/**
 * The AI Agent Control Center: the seven specialist agents the AI Tutor delegates to, a switch for each, the
 * tools they may use (and which ones wait for the student's approval), and a log of what actually ran.
 */
export function AgentControlCenterPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState<string | null>(null);
  const view = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<AgentsView>('/agents/me') });
  const activity = useQuery({ queryKey: ['agents', 'activity'], queryFn: () => apiClient.get<ActivityEntry[]>('/agents/me/activity?limit=50') });
  const toggle = useMutation({
    mutationFn: (v: { id: string; enabled: boolean }) => apiClient.patch<StudentAgent[]>(`/agents/me/${encodeURIComponent(v.id)}`, { enabled: v.enabled }),
    onSuccess: (agents, v) => {
      qc.setQueryData<AgentsView>(KEY, (old) => (old ? { ...old, agents } : old));
      toast.success(v.enabled ? 'Agent switched on' : 'Agent switched off. The AI Tutor will not use it for you.');
    },
    onError: (e: any) => toast.error(e?.message || 'That agent could not be updated.'),
  });

  if (view.isLoading) return <PageContainer><LoadingState message="Loading your agents…" /></PageContainer>;
  if (view.isError || !view.data) return <PageContainer><ErrorState message="Your agents could not be loaded." onRetry={() => view.refetch()} /></PageContainer>;
  const v = view.data;
  const log = activity.data ?? [];
  const toolsByName = new Map(v.tools.map((t) => [t.name, t]));
  const asksFirst = v.tools.filter((t) => t.asks_first);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personal Intelligence"
        title="AI Agent Control Center"
        description="Your AI Tutor hands parts of each request to specialist agents. Choose which ones may work for you, see the tools they can use, and check what actually ran."
        icon={<Workflow className="h-6 w-6" />}
        actions={<Button variant="outline" className="gap-2" onClick={() => onNavigate('/ai-agent')}><Bot className="h-4 w-4" /> Open AI Tutor</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Agents on" value={`${v.agents.filter((a) => a.enabled).length}/${v.agents.length}`} hint="The core tutor is always on" className="min-w-0" />
        <MetricCard label="Tutor requests" value={v.workflows.length} hint="Most recent 20" tone="info" className="min-w-0" />
        <MetricCard label="Tool calls logged" value={log.length} hint={`${log.filter((l) => l.status === 'failed').length} failed`} tone="neutral" className="min-w-0" />
        <MetricCard label="Waited for approval" value={log.filter((l) => l.status === 'blocked').length} hint={`${asksFirst.length} tools ask you first`} tone="warning" className="min-w-0" />
      </div>

      <PageSection className="min-w-0" title="Specialist agents" description="Switching an agent off removes it from your AI Tutor requests. If no agent is left for a request, the core tutor answers.">
        <ul className="grid gap-3 md:grid-cols-2">
          {v.agents.map((a) => {
            const isOpen = open === a.id;
            return (
              <li key={a.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4" data-testid={`agent-${a.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{a.name}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{a.purpose}</p>
                    {!a.available && <p className="mt-1 text-xs text-amber-700">Turned off for the whole platform by an administrator.</p>}
                  </div>
                  <Switch checked={a.enabled} label={`${a.name} on`} disabled={toggle.isPending} onChange={(enabled) => toggle.mutate({ id: a.id, enabled })} />
                </div>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)} className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} /> {a.members.length} parts and {a.tools.length} tools
                </button>
                {isOpen && (
                  <div className="mt-2 space-y-2 text-xs">
                    <p className="text-slate-600">{a.members.map((m) => readable(m.name)).join(', ')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.tools.map((name) => {
                        const t = toolsByName.get(name);
                        return (
                          <span key={name} title={t?.description} className={cn('rounded-full px-2 py-0.5 ring-1', t?.asks_first ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-slate-50 text-slate-700 ring-slate-200')}>
                            {words(name)}{t?.asks_first ? ' · asks you first' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection className="min-w-0" title="Tools that ask you first" description="These change or delete your data, run code or act outside the platform. They run only after you approve them on a page; an agent cannot run them on its own.">
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {asksFirst.map((t) => (
              <li key={t.name} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span className="min-w-0"><span className="block font-medium text-slate-900">{words(t.name)}</span><span className="block text-xs text-slate-500">{CATEGORY[t.category]}</span></span>
              </li>
            ))}
          </ul>
        </PageSection>

        <PageSection className="min-w-0" title="Recent tutor requests" description="Which agents each request was handed to, and how each step went.">
          {v.workflows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">No requests yet. Ask the AI Tutor something to see the agents it uses.</p>
          ) : (
            <ul className="space-y-2">
              {v.workflows.slice(0, 8).map((w) => (
                <li key={w.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{words(w.type)}</span>
                    <span className="text-xs text-slate-500">{when(w.started_at)}{w.duration_ms ? ` · ${(w.duration_ms / 1000).toFixed(1)} s` : ''}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{w.agents.map(readable).join(' → ') || 'Core tutor'}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{w.status.toLowerCase()}</p>
                </li>
              ))}
            </ul>
          )}
        </PageSection>
      </div>

      <PageSection className="min-w-0" title="Tool log" description="Every tool run for you, by an agent or from a page. Parameters and results are not stored.">
        {activity.isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : activity.isError ? (
          <p className="text-sm text-rose-600">The log could not be loaded.</p>
        ) : log.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Nothing has run yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] text-left text-sm" data-testid="agent-log">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr><th className="px-4 py-2 font-medium">When</th><th className="px-4 py-2 font-medium">Tool</th><th className="px-4 py-2 font-medium">By</th><th className="px-4 py-2 font-medium">Result</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {log.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500">{when(l.at)}</td>
                    <td className="px-4 py-2"><span className="font-medium text-slate-900">{words(l.tool)}</span><span className="block text-[11px] text-slate-500">{CATEGORY[l.category]}</span></td>
                    <td className="px-4 py-2 text-xs text-slate-600">{l.agent ? readable(l.agent) : 'You, from a page'}</td>
                    <td className="px-4 py-2 text-xs">
                      {l.status === 'ok' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Done{l.approved ? ', approved by you' : ''} · {l.duration_ms} ms</span>
                      ) : l.status === 'blocked' ? (
                        <span className="inline-flex items-center gap-1 text-amber-700"><PauseCircle className="h-3.5 w-3.5" /> Stopped: needs your approval</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700" title={l.error}><XCircle className="h-3.5 w-3.5" /> Failed{l.error ? `: ${l.error.slice(0, 60)}` : ''}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Agents never change your marks, profile or records without your approval.</p>
      </PageSection>
    </PageContainer>
  );
}

export default AgentControlCenterPage;
