import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trophy, Plus, ExternalLink, ShieldCheck, UserRound, Users, CalendarClock, RefreshCw, Trash2, Copy, LogOut, ClipboardList, Send, Medal, AlertTriangle } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { cn } from '../../../lib/utils';

const KINDS = ['HACKATHON', 'CODING_CONTEST', 'INNOVATION_CHALLENGE', 'RESEARCH_COMPETITION', 'TECHNICAL_EVENT', 'PROJECT_SHOWCASE'] as const;
const STATUSES = ['INTERESTED', 'REGISTERED', 'PARTICIPATED', 'WITHDRAWN'] as const;
const OUTCOMES = ['WINNER', 'RUNNER_UP', 'FINALIST', 'HONORABLE_MENTION', 'RANKED', 'PARTICIPATED', 'NOT_SELECTED'] as const;
const TASK_STATUSES = ['TODO', 'DOING', 'DONE'] as const;
type Kind = (typeof KINDS)[number];
type PStatus = (typeof STATUSES)[number];

interface Contest { id: number; name: string; start: string; duration_minutes: number; url: string }
interface MyEvent {
  id: string; title: string; kind: Kind; organiser: string; source_url: string; source_host: string; mode?: string; location?: string;
  registration_deadline?: string; start_date?: string; end_date?: string; notes: string; checked_at: string;
}
interface Feed {
  verified: { available: boolean; source: { name: string; url: string }; contests: Contest[]; fetched_at: string | null; message?: string };
  my_events: MyEvent[];
  tracked_refs: { ref: string; status: PStatus }[];
  deadlines: { ref: string; title: string; what: string; date: string; source: string }[];
  note: string;
}
interface Participation {
  ref: string; status: PStatus; team_id?: string;
  event: { title: string; kind: Kind; url: string; source: string; start?: string };
  submission?: { title: string; description: string; repo_url?: string; demo_url?: string; submitted_at: string };
  result?: { outcome: (typeof OUTCOMES)[number]; rank?: number; note: string; proof_url?: string; recorded_at: string };
  updated_at: string;
}
interface PartList { items: Participation[]; summary: { tracked: number; participated: number; submissions: number; results_recorded: number; wins: number }; note: string }
interface Team {
  id: string; name: string; is_owner: boolean; join_code: string | null; event: { title: string; url: string } | null;
  project: { title: string; description: string; repo_url?: string; demo_url?: string };
  members: { key: string; display_name: string; role: 'OWNER' | 'MEMBER'; is_me: boolean }[];
  tasks: { id: string; title: string; status: (typeof TASK_STATUSES)[number]; assignee: string | null; due_date?: string }[];
  max_members: number;
}

const label = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const input = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none';
const fmtDate = (iso?: string | null) => (iso ? new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const fmtDateTime = (iso?: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const enc = encodeURIComponent;
const err = (fallback: string) => (e: any) => toast.error(e?.message || fallback);

/**
 * Hackathon and Competition Hub. Verified contests come from the Codeforces API; any other event is one the student
 * added, with the page it came from. Nothing here invents dates, eligibility or prizes.
 */
export function CompetitionHubPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [tab, setTab] = React.useState<'discover' | 'mine' | 'teams'>('discover');
  const feed = useQuery({ queryKey: ['competitions', 'feed'], queryFn: () => apiClient.get<Feed>('/competitions/feed') });
  const parts = useQuery({ queryKey: ['competitions', 'participation'], queryFn: () => apiClient.get<PartList>('/competitions/participation') });
  const teams = useQuery({ queryKey: ['competitions', 'teams'], queryFn: () => apiClient.get<Team[]>('/competitions/teams') });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Career"
        title="Competition Hub"
        description="Find contests, track the hackathons you enter, work with your team and keep your results."
        icon={<Trophy />}
        actions={
          <Button variant="outline" size="sm" onClick={() => onNavigate('/portfolio')}>
            <Medal className="h-4 w-4" /> Show results on my portfolio
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Tracked events" value={parts.data?.summary.tracked ?? 0} icon={<ClipboardList />} />
        <MetricCard label="Participated" value={parts.data?.summary.participated ?? 0} icon={<Send />} tone="info" />
        <MetricCard label="Results recorded" value={parts.data?.summary.results_recorded ?? 0} icon={<Medal />} tone="success" />
        <MetricCard label="My teams" value={teams.data?.length ?? 0} icon={<Users />} tone="violet" />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1" role="tablist">
        {([['discover', 'Discover'], ['mine', 'My participation'], ['teams', 'Teams']] as const).map(([id, name]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn('whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium', tab === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === 'discover' && <Discover feed={feed} />}
      {tab === 'mine' && <MyParticipation parts={parts} teams={teams.data || []} />}
      {tab === 'teams' && <Teams teams={teams} parts={parts.data?.items || []} />}
    </PageContainer>
  );
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['competitions'] });
}

// ---------------------------------------------------------------- Discover

function Discover({ feed }: { feed: ReturnType<typeof useQuery<Feed>> }) {
  const refresh = useInvalidate();
  const [kind, setKind] = React.useState<'ALL' | Kind>('ALL');
  const [adding, setAdding] = React.useState(false);
  const track = useMutation({
    mutationFn: ({ ref, status }: { ref: string; status: PStatus }) => apiClient.put(`/competitions/participation/${enc(ref)}`, { status }),
    onSuccess: () => {
      refresh();
      toast.success('Added to My participation');
    },
    onError: err('The event could not be tracked.'),
  });
  const recheck = useMutation({ mutationFn: (id: string) => apiClient.post(`/competitions/events/${enc(id)}/recheck`), onSuccess: refresh, onError: err('Could not update.') });
  const remove = useMutation({ mutationFn: (id: string) => apiClient.delete(`/competitions/events/${enc(id)}`), onSuccess: refresh, onError: err('Could not remove.') });

  if (feed.isLoading) return <LoadingState message="Loading events…" />;
  if (feed.isError || !feed.data) return <ErrorState title="Events could not be loaded" message={(feed.error as any)?.message || 'Try again.'} onRetry={() => feed.refetch()} />;
  const f = feed.data;
  const status = (ref: string) => f.tracked_refs.find((t) => t.ref === ref)?.status;
  const showContests = kind === 'ALL' || kind === 'CODING_CONTEST';
  const mine = f.my_events.filter((e) => kind === 'ALL' || e.kind === kind);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Filter by kind" className={cn(input, 'w-auto')} value={kind} onChange={(e) => setKind(e.target.value as any)}>
          <option value="ALL">All kinds</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>{label(k)}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" /> Add an event you found
        </Button>
      </div>

      {adding && <EventForm onDone={() => setAdding(false)} />}

      {f.deadlines.length > 0 && (
        <PageSection title="Coming up" description="Dates from the contest feed and from the events you added.">
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white" data-testid="hub-deadlines">
            {f.deadlines.map((d) => (
              <li key={`${d.ref}-${d.what}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-slate-800"><CalendarClock className="h-4 w-4 text-slate-400" /> {d.what}: <b>{d.title}</b></span>
                <span className="text-xs text-slate-500">{d.date.length === 10 ? fmtDate(d.date) : fmtDateTime(d.date)} · {d.source}</span>
              </li>
            ))}
          </ul>
        </PageSection>
      )}

      {showContests && (
        <PageSection
          title="Verified coding contests"
          description={f.verified.available ? `From the ${f.verified.source.name}, fetched ${fmtDateTime(f.verified.fetched_at)}.` : undefined}
        >
          {!f.verified.available ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" data-testid="contests-unavailable">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {f.verified.message}
            </div>
          ) : f.verified.contests.length === 0 ? (
            <EmptyState title="No upcoming contests listed" description="Codeforces has no upcoming rounds in its list right now." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2" data-testid="verified-contests">
              {f.verified.contests.map((c) => {
                const ref = `cf:${c.id}`;
                const st = status(ref);
                return (
                  <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <a href={c.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-slate-900 hover:underline">{c.name}</a>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
                    </div>
                    <p className="text-xs text-slate-500">Starts {fmtDateTime(c.start)} · {c.duration_minutes} min · Codeforces</p>
                    <TrackButtons current={st} onTrack={(s) => track.mutate({ ref, status: s })} busy={track.isPending} />
                  </div>
                );
              })}
            </div>
          )}
        </PageSection>
      )}

      <PageSection title="Events you added" description="Shown as you entered them, with the page they came from. Check the details there before you rely on them.">
        {mine.length === 0 ? (
          <EmptyState title="No events added yet" description="Found a hackathon or challenge? Add it with its web page so you can track it here." icon={<Trophy />} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2" data-testid="my-events">
            {mine.map((e) => {
              const ref = `ev:${e.id}`;
              const stale = Date.now() - new Date(e.checked_at).getTime() > 14 * 86_400_000;
              return (
                <div key={e.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{e.title}</p>
                      <p className="text-xs text-slate-500">{label(e.kind)}{e.organiser ? ` · ${e.organiser}` : ''}{e.mode ? ` · ${label(e.mode)}` : ''}{e.location ? ` · ${e.location}` : ''}</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"><UserRound className="h-3 w-3" /> Added by you</span>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div><dt className="text-slate-400">Registration</dt><dd className="text-slate-700">{fmtDate(e.registration_deadline) || 'Not entered'}</dd></div>
                    <div><dt className="text-slate-400">Starts</dt><dd className="text-slate-700">{fmtDate(e.start_date) || 'Not entered'}</dd></div>
                    <div><dt className="text-slate-400">Ends</dt><dd className="text-slate-700">{fmtDate(e.end_date) || 'Not entered'}</dd></div>
                  </dl>
                  {e.notes && <p className="line-clamp-3 text-xs text-slate-600">{e.notes}</p>}
                  <p className={cn('text-[11px]', stale ? 'text-amber-700' : 'text-slate-500')}>
                    Source: <a className="underline" href={e.source_url} target="_blank" rel="noreferrer noopener">{e.source_host || 'link'} <ExternalLink className="inline h-3 w-3" /></a> · you last checked it {fmtDate(e.checked_at)}
                    {stale ? '. It may have changed since.' : ''}
                  </p>
                  <TrackButtons current={status(ref)} onTrack={(s) => track.mutate({ ref, status: s })} busy={track.isPending} />
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => recheck.mutate(e.id)}><RefreshCw className="h-3.5 w-3.5" /> I checked it again</Button>
                    <Button size="sm" variant="outline" onClick={() => remove.mutate(e.id)}><Trash2 className="h-3.5 w-3.5" /> Remove</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageSection>

      <p className="text-xs text-slate-500">{f.note} Other hackathon platforms do not offer a public listing API that this app is set up to use, so they are not listed automatically.</p>
    </div>
  );
}

function TrackButtons({ current, onTrack, busy }: { current?: PStatus; onTrack: (s: PStatus) => void; busy: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {current ? <span className="text-xs font-medium text-emerald-700">Tracking: {label(current)}</span> : null}
      {(['INTERESTED', 'REGISTERED'] as const).filter((s) => s !== current).map((s) => (
        <Button key={s} size="sm" variant={current ? 'outline' : 'primary'} disabled={busy} onClick={() => onTrack(s)}>
          {s === 'INTERESTED' ? 'Interested' : 'I registered'}
        </Button>
      ))}
    </div>
  );
}

function EventForm({ onDone }: { onDone: () => void }) {
  const refresh = useInvalidate();
  const [v, setV] = React.useState({ title: '', kind: 'HACKATHON', organiser: '', source_url: '', mode: '', location: '', registration_deadline: '', start_date: '', end_date: '', notes: '' });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });
  const save = useMutation({
    mutationFn: () => apiClient.post('/competitions/events', { ...v, mode: v.mode || undefined }),
    onSuccess: () => {
      refresh();
      toast.success('Event added');
      onDone();
    },
    onError: err('The event could not be saved.'),
  });
  return (
    <form
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      data-testid="event-form"
    >
      <label className="text-xs font-medium text-slate-600 sm:col-span-2">Title<input className={input} value={v.title} onChange={set('title')} required maxLength={160} /></label>
      <label className="text-xs font-medium text-slate-600">Kind
        <select className={input} value={v.kind} onChange={set('kind')}>{KINDS.map((k) => <option key={k} value={k}>{label(k)}</option>)}</select>
      </label>
      <label className="text-xs font-medium text-slate-600">Organiser<input className={input} value={v.organiser} onChange={set('organiser')} maxLength={160} /></label>
      <label className="text-xs font-medium text-slate-600 sm:col-span-2">Web page where you found it (required)<input className={input} type="url" placeholder="https://" value={v.source_url} onChange={set('source_url')} required /></label>
      <label className="text-xs font-medium text-slate-600">Mode
        <select className={input} value={v.mode} onChange={set('mode')}><option value="">Not stated</option><option value="ONLINE">Online</option><option value="OFFLINE">In person</option><option value="HYBRID">Hybrid</option></select>
      </label>
      <label className="text-xs font-medium text-slate-600">Location<input className={input} value={v.location} onChange={set('location')} maxLength={160} /></label>
      <label className="text-xs font-medium text-slate-600">Registration closes<input className={input} type="date" value={v.registration_deadline} onChange={set('registration_deadline')} /></label>
      <label className="text-xs font-medium text-slate-600">Starts<input className={input} type="date" value={v.start_date} onChange={set('start_date')} /></label>
      <label className="text-xs font-medium text-slate-600">Ends<input className={input} type="date" value={v.end_date} onChange={set('end_date')} /></label>
      <label className="text-xs font-medium text-slate-600 sm:col-span-2">Notes (eligibility, prizes, team size, as stated on the page)
        <textarea className={cn(input, 'h-20 py-2')} value={v.notes} onChange={set('notes')} maxLength={4000} />
      </label>
      <p className="text-[11px] text-slate-500 sm:col-span-2">Copy the dates as the source page states them. Leave a field empty if the page does not say.</p>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={save.isPending}>Save event</Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- My participation

function MyParticipation({ parts, teams }: { parts: ReturnType<typeof useQuery<PartList>>; teams: Team[] }) {
  const [open, setOpen] = React.useState<string | null>(null);
  if (parts.isLoading) return <LoadingState message="Loading your participation…" />;
  if (parts.isError || !parts.data) return <ErrorState title="Could not load your participation" message={(parts.error as any)?.message || 'Try again.'} onRetry={() => parts.refetch()} />;
  if (parts.data.items.length === 0) return <EmptyState title="Nothing tracked yet" description="Mark a contest or an event you added as Interested or Registered, and it appears here." icon={<ClipboardList />} />;
  return (
    <div className="space-y-3" data-testid="participation-list">
      <p className="text-xs text-slate-500">{parts.data.note}</p>
      {parts.data.items.map((p) => (
        <PartCard key={p.ref} p={p} teams={teams} open={open === p.ref} onToggle={() => setOpen(open === p.ref ? null : p.ref)} />
      ))}
    </div>
  );
}

function PartCard({ p, teams, open, onToggle }: { p: Participation; teams: Team[]; open: boolean; onToggle: () => void }) {
  const refresh = useInvalidate();
  const path = `/competitions/participation/${enc(p.ref)}`;
  const upd = useMutation({ mutationFn: (body: any) => apiClient.put(path, body), onSuccess: refresh, onError: err('Could not update.') });
  const del = useMutation({ mutationFn: () => apiClient.delete(path), onSuccess: refresh, onError: err('Could not remove.') });
  const [sub, setSub] = React.useState({ title: p.submission?.title || '', description: p.submission?.description || '', repo_url: p.submission?.repo_url || '', demo_url: p.submission?.demo_url || '' });
  const [res, setRes] = React.useState({ outcome: p.result?.outcome || 'PARTICIPATED', rank: p.result?.rank ? String(p.result.rank) : '', note: p.result?.note || '', proof_url: p.result?.proof_url || '' });
  const saveSub = useMutation({ mutationFn: () => apiClient.put(`${path}/submission`, sub), onSuccess: () => { refresh(); toast.success('Submission saved'); }, onError: err('Could not save the submission.') });
  const saveRes = useMutation({ mutationFn: () => apiClient.put(`${path}/result`, { ...res, rank: res.rank || undefined }), onSuccess: () => { refresh(); toast.success('Result saved'); }, onError: err('Could not save the result.') });
  const team = teams.find((t) => t.id === p.team_id);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div className="min-w-0">
          <a href={p.event.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-slate-900 hover:underline">{p.event.title}</a>
          <p className="text-xs text-slate-500">{label(p.event.kind)}{p.event.start ? ` · ${fmtDate(p.event.start)}` : ''} · {p.event.source}{team ? ` · Team: ${team.name}` : ''}</p>
          {p.result && <p className="mt-1 text-xs font-medium text-emerald-700">Result (self-reported): {label(p.result.outcome)}{p.result.rank ? `, rank ${p.result.rank}` : ''}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <select aria-label="Status" className={cn(input, 'h-8 w-auto')} value={p.status} onChange={(e) => upd.mutate({ status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <select aria-label="Team" className={cn(input, 'h-8 w-auto')} value={p.team_id || ''} onChange={(e) => upd.mutate({ status: p.status, team_id: e.target.value || null })}>
            <option value="">No team</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={onToggle}>{open ? 'Close' : 'Submission and result'}</Button>
          <Button size="sm" variant="outline" aria-label="Stop tracking" onClick={() => del.mutate()}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
      {open && (
        <div className="grid gap-4 border-t border-slate-100 p-4 md:grid-cols-2">
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); saveSub.mutate(); }}>
            <p className="text-sm font-semibold text-slate-800">Project submission</p>
            <input className={input} placeholder="Project title" value={sub.title} onChange={(e) => setSub({ ...sub, title: e.target.value })} required maxLength={160} />
            <textarea className={cn(input, 'h-20 py-2')} placeholder="What you built" value={sub.description} onChange={(e) => setSub({ ...sub, description: e.target.value })} maxLength={4000} />
            <input className={input} type="url" placeholder="Repository link (https://)" value={sub.repo_url} onChange={(e) => setSub({ ...sub, repo_url: e.target.value })} />
            <input className={input} type="url" placeholder="Demo link (https://)" value={sub.demo_url} onChange={(e) => setSub({ ...sub, demo_url: e.target.value })} />
            <Button type="submit" size="sm" disabled={saveSub.isPending}>Save submission</Button>
            {p.submission && <p className="text-[11px] text-slate-500">Saved {fmtDateTime(p.submission.submitted_at)}</p>}
          </form>
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); saveRes.mutate(); }}>
            <p className="text-sm font-semibold text-slate-800">Result</p>
            <select className={input} value={res.outcome} onChange={(e) => setRes({ ...res, outcome: e.target.value as any })}>
              {OUTCOMES.map((o) => <option key={o} value={o}>{label(o)}</option>)}
            </select>
            <input className={input} type="number" min={1} placeholder="Rank (optional)" value={res.rank} onChange={(e) => setRes({ ...res, rank: e.target.value })} />
            <input className={input} placeholder="Note (optional)" value={res.note} onChange={(e) => setRes({ ...res, note: e.target.value })} maxLength={300} />
            <input className={input} type="url" placeholder="Proof: results page or certificate (https://)" value={res.proof_url} onChange={(e) => setRes({ ...res, proof_url: e.target.value })} />
            <Button type="submit" size="sm" disabled={saveRes.isPending}>Save result</Button>
            <p className="text-[11px] text-slate-500">Results are shown as self-reported. A proof link lets others check them.</p>
          </form>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Teams

function Teams({ teams, parts }: { teams: ReturnType<typeof useQuery<Team[]>>; parts: Participation[] }) {
  const refresh = useInvalidate();
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [create, setCreate] = React.useState({ name: '', display_name: '', event_ref: '' });
  const [join, setJoin] = React.useState({ code: '', display_name: '' });
  const make = useMutation({
    mutationFn: () => apiClient.post<Team>('/competitions/teams', { ...create, event_ref: create.event_ref || undefined }),
    onSuccess: (t) => { refresh(); setOpenId(t.id); setCreate({ name: '', display_name: '', event_ref: '' }); toast.success('Team created. Share the join code with your teammates.'); },
    onError: err('The team could not be created.'),
  });
  const doJoin = useMutation({
    mutationFn: () => apiClient.post<Team>('/competitions/teams/join', join),
    onSuccess: (t) => { refresh(); setOpenId(t.id); setJoin({ code: '', display_name: '' }); toast.success(`Joined ${t.name}`); },
    onError: err('The team could not be joined.'),
  });

  if (teams.isLoading) return <LoadingState message="Loading your teams…" />;
  if (teams.isError || !teams.data) return <ErrorState title="Could not load your teams" message={(teams.error as any)?.message || 'Try again.'} onRetry={() => teams.refetch()} />;
  const open = teams.data.find((t) => t.id === openId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <form className="space-y-2 rounded-xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); make.mutate(); }} data-testid="create-team">
          <p className="text-sm font-semibold text-slate-800">Create a team</p>
          <input className={input} placeholder="Team name" value={create.name} onChange={(e) => setCreate({ ...create, name: e.target.value })} required maxLength={80} />
          <input className={input} placeholder="Your name in this team" value={create.display_name} onChange={(e) => setCreate({ ...create, display_name: e.target.value })} required maxLength={40} />
          <select className={input} value={create.event_ref} onChange={(e) => setCreate({ ...create, event_ref: e.target.value })} aria-label="Event">
            <option value="">No event yet</option>
            {parts.map((p) => <option key={p.ref} value={p.ref}>{p.event.title}</option>)}
          </select>
          <Button type="submit" size="sm" disabled={make.isPending}><Plus className="h-4 w-4" /> Create team</Button>
        </form>
        <form className="space-y-2 rounded-xl border border-slate-200 bg-white p-4" onSubmit={(e) => { e.preventDefault(); doJoin.mutate(); }} data-testid="join-team">
          <p className="text-sm font-semibold text-slate-800">Join with a code</p>
          <input className={cn(input, 'font-mono uppercase tracking-widest')} placeholder="Join code" value={join.code} onChange={(e) => setJoin({ ...join, code: e.target.value })} required maxLength={20} />
          <input className={input} placeholder="Your name in this team" value={join.display_name} onChange={(e) => setJoin({ ...join, display_name: e.target.value })} required maxLength={40} />
          <Button type="submit" size="sm" disabled={doJoin.isPending}><Users className="h-4 w-4" /> Join team</Button>
          <p className="text-[11px] text-slate-500">Teammates see only the name you enter here, not your account name or email.</p>
        </form>
      </div>

      {teams.data.length === 0 ? (
        <EmptyState title="You are not in a team yet" description="Create one and share its join code, or join with a code from a teammate." icon={<Users />} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {teams.data.map((t) => (
            <button key={t.id} onClick={() => setOpenId(t.id)} className={cn('rounded-lg border px-3 py-2 text-left text-sm', openId === t.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
              <span className="font-semibold">{t.name}</span>
              <span className="ml-2 text-xs opacity-70">{t.members.length} member{t.members.length === 1 ? '' : 's'} · {t.tasks.filter((k) => k.status !== 'DONE').length} open tasks</span>
            </button>
          ))}
        </div>
      )}

      {open && <TeamDetail team={open} onClosed={() => setOpenId(null)} />}
    </div>
  );
}

function TeamDetail({ team, onClosed }: { team: Team; onClosed: () => void }) {
  const refresh = useInvalidate();
  const base = `/competitions/teams/${enc(team.id)}`;
  const [task, setTask] = React.useState({ title: '', assignee: '', due_date: '' });
  const [proj, setProj] = React.useState(team.project);
  React.useEffect(() => setProj(team.project), [team.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const addTask = useMutation({ mutationFn: () => apiClient.post(`${base}/tasks`, { ...task, assignee: task.assignee || undefined, due_date: task.due_date || undefined }), onSuccess: () => { refresh(); setTask({ title: '', assignee: '', due_date: '' }); }, onError: err('The task could not be added.') });
  const updTask = useMutation({ mutationFn: ({ id, body }: { id: string; body: any }) => apiClient.patch(`${base}/tasks/${enc(id)}`, body), onSuccess: refresh, onError: err('Could not update the task.') });
  const delTask = useMutation({ mutationFn: (id: string) => apiClient.delete(`${base}/tasks/${enc(id)}`), onSuccess: refresh, onError: err('Could not remove the task.') });
  const saveProj = useMutation({ mutationFn: () => apiClient.patch(base, { project: proj }), onSuccess: () => { refresh(); toast.success('Project saved'); }, onError: err('Could not save the project.') });
  const rotate = useMutation({ mutationFn: () => apiClient.post(`${base}/code`), onSuccess: () => { refresh(); toast.success('New join code made. The old one no longer works.'); }, onError: err('Could not change the code.') });
  const leave = useMutation({ mutationFn: () => apiClient.post(`${base}/leave`), onSuccess: () => { refresh(); onClosed(); toast.success('You left the team'); }, onError: err('Could not leave the team.') });
  const kick = useMutation({ mutationFn: (key: string) => apiClient.delete(`${base}/members/${enc(key)}`), onSuccess: refresh, onError: err('Could not remove the member.') });
  const nameOf = (key: string | null) => team.members.find((m) => m.key === key)?.display_name || 'Unassigned';

  return (
    <div className="grid gap-4 lg:grid-cols-3" data-testid="team-detail">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{team.name}</p>
          {team.event && <a className="text-xs text-blue-700 underline" href={team.event.url} target="_blank" rel="noreferrer noopener">{team.event.title}</a>}
        </div>
        {team.join_code && (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">Join code (only you, the owner, see it)</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="font-mono text-base tracking-widest text-slate-900" data-testid="join-code">{team.join_code}</code>
              <Button size="sm" variant="outline" aria-label="Copy code" onClick={() => navigator.clipboard?.writeText(team.join_code!).then(() => toast.success('Copied'))}><Copy className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" onClick={() => rotate.mutate()}>New code</Button>
            </div>
          </div>
        )}
        <div>
          <p className="mb-1 text-sm font-semibold text-slate-800">Members ({team.members.length}/{team.max_members})</p>
          <ul className="space-y-1 text-sm">
            {team.members.map((m) => (
              <li key={m.key} className="flex items-center justify-between gap-2">
                <span>{m.display_name}{m.is_me ? ' (you)' : ''} {m.role === 'OWNER' && <span className="text-[11px] text-slate-500">owner</span>}</span>
                {team.is_owner && !m.is_me && <button className="text-xs text-rose-600 hover:underline" onClick={() => kick.mutate(m.key)}>Remove</button>}
              </li>
            ))}
          </ul>
        </div>
        <Button size="sm" variant="outline" onClick={() => leave.mutate()}><LogOut className="h-3.5 w-3.5" /> Leave team</Button>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
        <p className="text-sm font-semibold text-slate-800">Tasks</p>
        <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); addTask.mutate(); }}>
          <input className={cn(input, 'min-w-[12rem] flex-1')} placeholder="New task" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} required maxLength={200} />
          <select className={cn(input, 'w-auto')} aria-label="Assignee" value={task.assignee} onChange={(e) => setTask({ ...task, assignee: e.target.value })}>
            <option value="">Unassigned</option>
            {team.members.map((m) => <option key={m.key} value={m.key}>{m.display_name}</option>)}
          </select>
          <input className={cn(input, 'w-auto')} type="date" aria-label="Due date" value={task.due_date} onChange={(e) => setTask({ ...task, due_date: e.target.value })} />
          <Button type="submit" size="sm" disabled={addTask.isPending}>Add</Button>
        </form>
        <div className="grid gap-3 md:grid-cols-3" data-testid="task-board">
          {TASK_STATUSES.map((s) => (
            <div key={s} className="rounded-lg bg-slate-50 p-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{s === 'TODO' ? 'To do' : s === 'DOING' ? 'Doing' : 'Done'}</p>
              <div className="space-y-2">
                {team.tasks.filter((k) => k.status === s).map((k) => (
                  <div key={k.id} className="rounded-md border border-slate-200 bg-white p-2 text-sm">
                    <p className={cn('text-slate-800', s === 'DONE' && 'line-through opacity-60')}>{k.title}</p>
                    <p className="text-[11px] text-slate-500">{nameOf(k.assignee)}{k.due_date ? ` · due ${fmtDate(k.due_date)}` : ''}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <select aria-label="Move task" className="h-7 rounded border border-slate-200 bg-white text-xs" value={k.status} onChange={(e) => updTask.mutate({ id: k.id, body: { status: e.target.value } })}>
                        {TASK_STATUSES.map((x) => <option key={x} value={x}>{x === 'TODO' ? 'To do' : x === 'DOING' ? 'Doing' : 'Done'}</option>)}
                      </select>
                      <button aria-label="Remove task" className="ml-auto text-slate-400 hover:text-rose-600" onClick={() => delTask.mutate(k.id)}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <form className="grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); saveProj.mutate(); }}>
          <p className="text-sm font-semibold text-slate-800 sm:col-span-2">Team project</p>
          <input className={input} placeholder="Project title" value={proj.title} onChange={(e) => setProj({ ...proj, title: e.target.value })} maxLength={160} />
          <input className={input} type="url" placeholder="Repository link (https://)" value={proj.repo_url || ''} onChange={(e) => setProj({ ...proj, repo_url: e.target.value })} />
          <textarea className={cn(input, 'h-20 py-2 sm:col-span-2')} placeholder="What the team is building" value={proj.description} onChange={(e) => setProj({ ...proj, description: e.target.value })} maxLength={4000} />
          <input className={input} type="url" placeholder="Demo link (https://)" value={proj.demo_url || ''} onChange={(e) => setProj({ ...proj, demo_url: e.target.value })} />
          <div><Button type="submit" size="sm" disabled={saveProj.isPending}>Save project</Button></div>
        </form>
      </div>
    </div>
  );
}

export default CompetitionHubPage;
