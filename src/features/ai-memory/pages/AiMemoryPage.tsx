import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BrainCircuit, Trash2, Plus, PencilLine, MessagesSquare, ShieldCheck, Bot, Target } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { conversationApi } from '../../ai-agent/api/conversationApi';
import { cn } from '../../../lib/utils';

interface MemoryNote {
  id: string;
  text: string;
  created_at: string;
}
interface MemorySettings {
  personalize: boolean;
  use_activity: boolean;
  notes: MemoryNote[];
  updated_at: string | null;
}
interface ContextSummary {
  module: string;
  lines: string[];
  personalize: boolean;
  use_activity: boolean;
}

const KEY = ['ai-memory', 'me'];
const MAX_NOTE = 200;

function Toggle({ checked, onChange, label, description, disabled, testId }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string; disabled?: boolean; testId: string }) {
  return (
    <label className={cn('flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4', disabled && 'opacity-60')}>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        data-testid={testId}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300', checked ? 'bg-blue-600' : 'bg-slate-300')}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>
  );
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * One place to see and control what the AI assistant knows: the exact context every AI answer receives,
 * switches for personalisation, notes the student asks it to remember, and their saved conversations.
 */
export function AiMemoryPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const qc = useQueryClient();
  const [draft, setDraft] = React.useState('');
  const memory = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<MemorySettings>('/ai-memory/me') });
  const context = useQuery({
    queryKey: ['profile-context', 'ai-summary', '/ai-memory'],
    queryFn: () => apiClient.get<ContextSummary>('/profile/me/ai-context?page=/ai-agent'),
  });
  const conversations = useQuery({ queryKey: ['ai-memory', 'conversations'], queryFn: () => conversationApi.getConversations() });

  const onSaved = (data: MemorySettings) => {
    qc.setQueryData(KEY, data);
    // Every "Personalised" chip and this page's preview read the same summary.
    qc.invalidateQueries({ queryKey: ['profile-context'] });
  };
  const onError = (e: any) => toast.error(e?.message || 'Could not save.');
  const settings = useMutation({ mutationFn: (body: Partial<MemorySettings>) => apiClient.patch<MemorySettings>('/ai-memory/me', body), onSuccess: onSaved, onError });
  const addNote = useMutation({
    mutationFn: (text: string) => apiClient.post<MemorySettings>('/ai-memory/me/notes', { text }),
    onSuccess: (d) => {
      onSaved(d);
      setDraft('');
      toast.success('The assistant will remember that.');
    },
    onError,
  });
  const removeNote = useMutation({ mutationFn: (id: string) => apiClient.delete<MemorySettings>(`/ai-memory/me/notes/${encodeURIComponent(id)}`), onSuccess: onSaved, onError });
  const clearNotes = useMutation({ mutationFn: () => apiClient.delete<MemorySettings>('/ai-memory/me/notes'), onSuccess: onSaved, onError });
  const deleteConversation = useMutation({
    mutationFn: (id: string) => conversationApi.deleteConversation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-memory', 'conversations'] });
      qc.invalidateQueries({ queryKey: ['ai-conversations'] });
      toast.success('Conversation deleted');
    },
    onError,
  });

  if (memory.isLoading) return <PageContainer><LoadingState message="Loading your AI memory…" /></PageContainer>;
  if (memory.isError || !memory.data) return <PageContainer><ErrorState message="Your AI memory could not be loaded." onRetry={() => memory.refetch()} /></PageContainer>;
  const m = memory.data;
  const lines = context.data?.lines ?? [];
  const convs = (conversations.data ?? []).slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.trim().length >= 3) addNote.mutate(draft.trim());
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="AI Memory"
        description="See exactly what your AI assistant knows about you, decide what it may use, and tell it things to remember. Every AI feature on the platform follows these settings."
        icon={<BrainCircuit className="h-6 w-6" />}
        actions={<Button variant="outline" className="gap-2" onClick={() => onNavigate('/ai-agent')}><Bot className="h-4 w-4" /> Open AI Tutor</Button>}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Toggle
          testId="ai-memory-personalize"
          label="Personalise AI answers"
          description="Answers use your profile, subjects, goals and the notes below. Turn off to get general answers with nothing about you sent."
          checked={m.personalize}
          disabled={settings.isPending}
          onChange={(v) => settings.mutate({ personalize: v })}
        />
        <Toggle
          testId="ai-memory-activity"
          label="Use my recent activity"
          description="Adds your current course, recent topics and weak areas from your own quiz and practice results."
          checked={m.use_activity}
          disabled={settings.isPending || !m.personalize}
          onChange={(v) => settings.mutate({ use_activity: v })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <PageSection className="min-w-0 lg:col-span-3" title="What the AI receives" description="The exact lines added to every AI request you make. Your name, email, college and marks are never included.">
          <div className="rounded-2xl border border-slate-200 bg-white p-5" data-testid="ai-memory-context">
            {!m.personalize ? (
              <p className="flex items-center gap-2 text-sm text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Personalisation is off. AI answers receive nothing about you.</p>
            ) : context.isLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : context.isError ? (
              <p className="text-sm text-rose-600">Could not load what the assistant knows.</p>
            ) : lines.length === 0 ? (
              <p className="text-sm text-slate-600">Nothing yet. Add your subjects, skills and goals to your profile, or a note below.</p>
            ) : (
              <ul className="space-y-2">
                {lines.map((l) => {
                  const i = l.indexOf(':');
                  return (
                    <li key={l} className="text-sm leading-relaxed text-slate-700">
                      {i > 0 ? (<><span className="font-semibold text-slate-900">{l.slice(0, i)}:</span>{l.slice(i + 1)}</>) : l}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNavigate('/profile/edit')}><PencilLine className="h-3.5 w-3.5" /> Edit profile and preferences</Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNavigate('/goals')}><Target className="h-3.5 w-3.5" /> Learning goals</Button>
            </div>
          </div>
        </PageSection>

        <PageSection
          className="min-w-0 lg:col-span-2"
          title="Things to remember"
          description={`Up to 20 short notes, ${MAX_NOTE} characters each.`}
          actions={m.notes.length > 0 ? <Button size="sm" variant="ghost" disabled={clearNotes.isPending} onClick={() => clearNotes.mutate()} data-testid="ai-memory-clear">Forget all</Button> : undefined}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <form onSubmit={submit} className="space-y-2">
              <label htmlFor="ai-note" className="sr-only">Something for the assistant to remember</label>
              <textarea
                id="ai-note"
                data-testid="ai-memory-input"
                value={draft}
                maxLength={MAX_NOTE}
                rows={2}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="For example: I understand best with diagrams, or my lab exam is in C"
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">Emails, phone numbers and links are removed.</span>
                <Button type="submit" size="sm" className="gap-1" disabled={draft.trim().length < 3 || addNote.isPending || m.notes.length >= 20} data-testid="ai-memory-add"><Plus className="h-4 w-4" /> Remember</Button>
              </div>
            </form>
            <ul className="mt-4 space-y-2" data-testid="ai-memory-notes">
              {m.notes.length === 0 && <li className="text-sm text-slate-500">No notes yet.</li>}
              {m.notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-800">{n.text}</span>
                  <button className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Forget: ${n.text}`} onClick={() => removeNote.mutate(n.id)}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        </PageSection>
      </div>

      <PageSection title="Conversation history" description="Your saved AI Tutor conversations. Deleting one removes it for good.">
        <div className="rounded-2xl border border-slate-200 bg-white" data-testid="ai-memory-conversations">
          {conversations.isLoading ? (
            <p className="p-5 text-sm text-slate-500">Loading…</p>
          ) : conversations.isError ? (
            <p className="p-5 text-sm text-rose-600">Could not load your conversations.</p>
          ) : convs.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">No conversations yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {convs.slice(0, 30).map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                  <MessagesSquare className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{c.title || 'Untitled conversation'}</span>
                    <span className="text-xs text-slate-500">Last active {fmt(c.updated_at)}{typeof c.message_count === 'number' ? ` · ${c.message_count} messages` : ''}</span>
                  </span>
                  <button className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete conversation ${c.title}`} disabled={deleteConversation.isPending} onClick={() => deleteConversation.mutate(c.id)}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageSection>
    </PageContainer>
  );
}

export default AiMemoryPage;
