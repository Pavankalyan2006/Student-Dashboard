// Hackathon and Competition Hub.
//
// Where the events come from:
// - Verified: upcoming programming contests read from the Codeforces public API, with the source and the time
//   the list was fetched. Nothing is added to or changed in that list.
// - Added by the student: events they found elsewhere. Each one needs the web address it came from, and is shown
//   as "added by you" with the date the student last checked it on that page. The hub never fills in dates,
//   eligibility, prizes or other details for them.
//
// Participation, submissions and results are the student's own record. Results are labelled as self-reported.
// Teams are shared by a join code. A member is shown to the team only by the display name they chose when they
// created or joined it, never by their account name or email.
import { randomBytes } from 'crypto';
import { ValidationError, NotFoundError, AppError } from '../core/exceptions';
import { upcomingContests, type ContestFeed } from './deadlineService';

export const EVENT_KINDS = ['HACKATHON', 'CODING_CONTEST', 'INNOVATION_CHALLENGE', 'RESEARCH_COMPETITION', 'TECHNICAL_EVENT', 'PROJECT_SHOWCASE'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];
export const EVENT_MODES = ['ONLINE', 'OFFLINE', 'HYBRID'] as const;
export const PARTICIPATION_STATUSES = ['INTERESTED', 'REGISTERED', 'PARTICIPATED', 'WITHDRAWN'] as const;
export type ParticipationStatus = (typeof PARTICIPATION_STATUSES)[number];
export const RESULT_OUTCOMES = ['WINNER', 'RUNNER_UP', 'FINALIST', 'HONORABLE_MENTION', 'RANKED', 'PARTICIPATED', 'NOT_SELECTED'] as const;
export const TASK_STATUSES = ['TODO', 'DOING', 'DONE'] as const;

export const HUB_LIMITS = { events: 100, participations: 200, teamsPerStudent: 20, members: 8, tasks: 100 };

export interface StudentEvent {
  id: string;
  student_id: string;
  title: string;
  kind: EventKind;
  organiser: string;
  source_url: string;
  mode?: (typeof EVENT_MODES)[number];
  location?: string;
  registration_deadline?: string; // YYYY-MM-DD, as the student copied it from the source
  start_date?: string;
  end_date?: string;
  notes: string;
  checked_at: string; // when the student last checked the details on the source page
  created_at: string;
  updated_at: string;
}

/** What the student keeps about one event: their status, the team they used, what they submitted and the result. */
export interface Participation {
  ref: string; // "cf:<contest id>" or "ev:<own event id>"
  student_id: string;
  event: { title: string; kind: EventKind; url: string; source: string; start?: string };
  status: ParticipationStatus;
  team_id?: string;
  submission?: { title: string; description: string; repo_url?: string; demo_url?: string; submitted_at: string };
  result?: { outcome: (typeof RESULT_OUTCOMES)[number]; rank?: number; note: string; proof_url?: string; recorded_at: string };
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  student_id: string;
  display_name: string;
  role: 'OWNER' | 'MEMBER';
  joined_at: string;
}

export interface TeamTask {
  id: string;
  title: string;
  status: (typeof TASK_STATUSES)[number];
  assignee_id?: string;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  join_code: string;
  event?: { title: string; url: string };
  project: { title: string; description: string; repo_url?: string; demo_url?: string };
  members: TeamMember[];
  tasks: TeamTask[];
  created_at: string;
  updated_at: string;
}

export const competitionStores: {
  events: Map<string, StudentEvent[]>; // by student id
  participations: Map<string, Participation[]>; // by student id
  teams: Map<string, Team>; // by team id
} = { events: new Map(), participations: new Map(), teams: new Map() };

const now = () => new Date().toISOString();
const newId = (p: string) => `${p}_${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
// Join codes avoid look-alike characters (0/O, 1/I/L) so they can be read out loud.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newJoinCode(): string {
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

function text(v: unknown, field: string, max: number, required = false): string {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ValidationError(`${field} is required.`);
    return '';
  }
  if (typeof v !== 'string') throw new ValidationError(`${field} must be text.`);
  const t = v.replace(/\s+/g, ' ').trim();
  if (required && !t) throw new ValidationError(`${field} is required.`);
  if (t.length > max) throw new ValidationError(`${field} must be at most ${max} characters.`);
  return t;
}

function longText(v: unknown, field: string, max: number): string {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') throw new ValidationError(`${field} must be text.`);
  const t = v.trim();
  if (t.length > max) throw new ValidationError(`${field} must be at most ${max} characters.`);
  return t;
}

/** Only http(s) links, so a javascript: or data: address can never be stored and clicked. */
export function webUrl(v: unknown, field: string, required = false): string | undefined {
  if (v === undefined || v === null || v === '') {
    if (required) throw new ValidationError(`${field} is required: add the web page where you found it.`);
    return undefined;
  }
  if (typeof v !== 'string' || v.length > 2000) throw new ValidationError(`${field} must be a web address.`);
  let u: URL;
  try {
    u = new URL(v.trim());
  } catch {
    throw new ValidationError(`${field} must be a web address (https://...).`);
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new ValidationError(`${field} must start with http:// or https://.`);
  return u.toString();
}

function date(v: unknown, field: string): string | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) throw new ValidationError(`${field} must be a date (YYYY-MM-DD).`);
  return v;
}

function oneOf<T extends readonly string[]>(v: unknown, list: T, field: string): T[number] {
  if (!list.includes(v as string)) throw new ValidationError(`${field} must be one of ${list.join(', ')}.`);
  return v as T[number];
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Events coming up first, then undated ones, then past ones. Pure, for tests. */
export function sortEvents(events: StudentEvent[], today: string): StudentEvent[] {
  const key = (e: StudentEvent) => e.registration_deadline || e.start_date || '';
  const bucket = (e: StudentEvent) => {
    const k = e.end_date || key(e);
    if (!k) return 1;
    return k >= today ? 0 : 2;
  };
  return [...events].sort((a, b) => bucket(a) - bucket(b) || key(a).localeCompare(key(b)) || a.title.localeCompare(b.title));
}

export interface HubDeadline {
  ref: string;
  title: string;
  what: 'Registration closes' | 'Starts' | 'Ends';
  date: string;
  source: string;
}

/** The dates the student should know about, taken only from the contest feed and the details they entered. */
export function upcomingDeadlines(events: StudentEvent[], contests: ContestFeed['contests'], parts: Participation[], todayIso: string): HubDeadline[] {
  const today = todayIso.slice(0, 10);
  const tracked = new Map(parts.filter((p) => p.status !== 'WITHDRAWN').map((p) => [p.ref, p]));
  const out: HubDeadline[] = [];
  for (const e of events) {
    const ref = `ev:${e.id}`;
    const src = `Added by you from ${hostOf(e.source_url) || 'the source'}`;
    if (e.registration_deadline && e.registration_deadline >= today) out.push({ ref, title: e.title, what: 'Registration closes', date: e.registration_deadline, source: src });
    if (e.start_date && e.start_date >= today) out.push({ ref, title: e.title, what: 'Starts', date: e.start_date, source: src });
    else if (e.end_date && e.end_date >= today && tracked.has(ref)) out.push({ ref, title: e.title, what: 'Ends', date: e.end_date, source: src });
  }
  for (const c of contests) {
    const ref = `cf:${c.id}`;
    if (tracked.has(ref) && c.start >= todayIso) out.push({ ref, title: c.name, what: 'Starts', date: c.start, source: 'Codeforces API' });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 20);
}

function myEvents(studentId: string): StudentEvent[] {
  return competitionStores.events.get(studentId) || [];
}
function myParts(studentId: string): Participation[] {
  return competitionStores.participations.get(studentId) || [];
}

function cleanEvent(input: any, cur?: StudentEvent): Omit<StudentEvent, 'id' | 'student_id' | 'created_at' | 'updated_at' | 'checked_at'> {
  if (!input || typeof input !== 'object') throw new ValidationError('Send the event as an object.');
  const has = (k: string) => input[k] !== undefined;
  const ev = {
    title: has('title') || !cur ? text(input.title, 'Title', 160, true) : cur.title,
    kind: has('kind') || !cur ? oneOf(input.kind, EVENT_KINDS, 'Kind') : cur.kind,
    organiser: has('organiser') ? text(input.organiser, 'Organiser', 160) : cur?.organiser || '',
    source_url: has('source_url') || !cur ? webUrl(input.source_url, 'Source link', true)! : cur.source_url,
    mode: has('mode') ? (input.mode ? oneOf(input.mode, EVENT_MODES, 'Mode') : undefined) : cur?.mode,
    location: has('location') ? text(input.location, 'Location', 160) || undefined : cur?.location,
    registration_deadline: has('registration_deadline') ? date(input.registration_deadline, 'Registration deadline') : cur?.registration_deadline,
    start_date: has('start_date') ? date(input.start_date, 'Start date') : cur?.start_date,
    end_date: has('end_date') ? date(input.end_date, 'End date') : cur?.end_date,
    notes: has('notes') ? longText(input.notes, 'Notes', 4000) : cur?.notes || '',
  };
  if (ev.start_date && ev.end_date && ev.end_date < ev.start_date) throw new ValidationError('End date must be on or after the start date.');
  return ev;
}

function teamFor(studentId: string, teamId: string): Team {
  const t = competitionStores.teams.get(teamId);
  // Not a member reads the same as not existing, so team ids cannot be probed.
  if (!t || !t.members.some((m) => m.student_id === studentId)) throw new NotFoundError('Team not found.');
  return t;
}

function saveTeam(t: Team) {
  t.updated_at = now();
  competitionStores.teams.set(t.id, { ...t, members: [...t.members], tasks: [...t.tasks] });
}

/** What a member may see: no account ids of other members except as opaque member keys, and the code only for the owner. */
function teamView(t: Team, studentId: string) {
  const isOwner = t.owner_id === studentId;
  const key = (id: string) => (id === studentId ? 'me' : `m${t.members.findIndex((m) => m.student_id === id) + 1}`);
  return {
    id: t.id,
    name: t.name,
    is_owner: isOwner,
    join_code: isOwner ? t.join_code : null,
    event: t.event || null,
    project: t.project,
    members: t.members.map((m) => ({ key: key(m.student_id), display_name: m.display_name, role: m.role, joined_at: m.joined_at, is_me: m.student_id === studentId })),
    tasks: t.tasks.map((k) => ({ ...k, assignee: k.assignee_id ? key(k.assignee_id) : null, assignee_id: undefined, created_by: key(k.created_by) })),
    max_members: HUB_LIMITS.members,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
}

function memberIdFromKey(t: Team, studentId: string, key: unknown): string | undefined {
  if (key === undefined || key === null || key === '') return undefined;
  if (key === 'me') return studentId;
  const m = typeof key === 'string' ? /^m(\d+)$/.exec(key) : null;
  const member = m ? t.members[Number(m[1]) - 1] : undefined;
  if (!member) throw new ValidationError('Assign the task to a member of this team.');
  return member.student_id;
}

export class CompetitionHubService {
  /** Verified contests plus the student's own events, tracked items and upcoming dates. */
  static async feed(studentId: string, fetchImpl?: typeof fetch) {
    const contests = await upcomingContests(fetchImpl);
    const today = now();
    const events = sortEvents(myEvents(studentId), today.slice(0, 10));
    const parts = myParts(studentId);
    return {
      verified: contests,
      my_events: events.map((e) => ({ ...e, source_host: hostOf(e.source_url) })),
      tracked_refs: parts.map((p) => ({ ref: p.ref, status: p.status })),
      deadlines: upcomingDeadlines(events, contests.contests, parts, today),
      note: 'Contests marked Verified come from the Codeforces API at the time shown. Events you add are shown as you entered them; check the details on their source page.',
    };
  }

  static addEvent(studentId: string, input: any): StudentEvent {
    const list = myEvents(studentId);
    if (list.length >= HUB_LIMITS.events) throw new ValidationError(`You can keep up to ${HUB_LIMITS.events} events. Remove one first.`);
    const t = now();
    const ev: StudentEvent = { id: newId('ev'), student_id: studentId, ...cleanEvent(input), checked_at: t, created_at: t, updated_at: t };
    competitionStores.events.set(studentId, [ev, ...list]);
    return ev;
  }

  static updateEvent(studentId: string, eventId: string, input: any): StudentEvent {
    const list = myEvents(studentId);
    const cur = list.find((e) => e.id === eventId);
    if (!cur) throw new NotFoundError('Event not found.');
    const next: StudentEvent = { ...cur, ...cleanEvent(input, cur), updated_at: now() };
    // Changing what the event says counts as checking it again.
    next.checked_at = next.updated_at;
    competitionStores.events.set(studentId, list.map((e) => (e.id === eventId ? next : e)));
    this.refreshSnapshot(studentId, `ev:${eventId}`, next);
    return next;
  }

  /** The student confirms they looked at the source page again and the details still hold. */
  static recheckEvent(studentId: string, eventId: string): StudentEvent {
    const list = myEvents(studentId);
    const cur = list.find((e) => e.id === eventId);
    if (!cur) throw new NotFoundError('Event not found.');
    const next = { ...cur, checked_at: now() };
    competitionStores.events.set(studentId, list.map((e) => (e.id === eventId ? next : e)));
    return next;
  }

  static removeEvent(studentId: string, eventId: string): { removed: true } {
    const list = myEvents(studentId);
    if (!list.some((e) => e.id === eventId)) throw new NotFoundError('Event not found.');
    competitionStores.events.set(studentId, list.filter((e) => e.id !== eventId));
    // The participation record stays, with its snapshot, so history is not lost.
    return { removed: true };
  }

  private static refreshSnapshot(studentId: string, ref: string, ev: StudentEvent) {
    const parts = myParts(studentId);
    if (!parts.some((p) => p.ref === ref)) return;
    competitionStores.participations.set(
      studentId,
      parts.map((p) => (p.ref === ref ? { ...p, event: { ...p.event, title: ev.title, kind: ev.kind, url: ev.source_url, start: ev.start_date } } : p))
    );
  }

  /** Resolves an event reference to a snapshot, only from the verified feed or the student's own events. */
  private static async resolveRef(studentId: string, ref: string, fetchImpl?: typeof fetch): Promise<Participation['event']> {
    const m = /^(cf|ev):([\w-]{1,60})$/.exec(ref);
    if (!m) throw new ValidationError('Unknown event.');
    if (m[1] === 'ev') {
      const ev = myEvents(studentId).find((e) => e.id === m[2]);
      if (!ev) throw new NotFoundError('Event not found.');
      return { title: ev.title, kind: ev.kind, url: ev.source_url, source: `Added by you from ${hostOf(ev.source_url)}`, start: ev.start_date };
    }
    const feed = await upcomingContests(fetchImpl);
    const c = feed.contests.find((x) => String(x.id) === m[2]);
    if (!c) {
      if (!feed.available) throw new AppError('Codeforces could not be reached to confirm this contest. Try again in a few minutes.', 503, 'SOURCE_UNAVAILABLE');
      throw new NotFoundError('That contest is not in the current Codeforces list.');
    }
    return { title: c.name, kind: 'CODING_CONTEST', url: c.url, source: `Codeforces API, fetched ${feed.fetched_at}`, start: c.start };
  }

  static participation(studentId: string) {
    const parts = [...myParts(studentId)].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const results = parts.filter((p) => p.result);
    return {
      items: parts,
      summary: {
        tracked: parts.length,
        participated: parts.filter((p) => p.status === 'PARTICIPATED').length,
        submissions: parts.filter((p) => p.submission).length,
        results_recorded: results.length,
        wins: results.filter((p) => p.result!.outcome === 'WINNER').length,
      },
      note: 'Results are what you recorded. Add a proof link (a results page or certificate) so others can check them.',
    };
  }

  static async track(studentId: string, ref: string, input: any, fetchImpl?: typeof fetch): Promise<Participation> {
    const status = oneOf(input?.status ?? 'INTERESTED', PARTICIPATION_STATUSES, 'Status');
    const parts = myParts(studentId);
    const cur = parts.find((p) => p.ref === ref);
    let teamId = cur?.team_id;
    if (input?.team_id !== undefined) {
      teamId = input.team_id ? teamFor(studentId, String(input.team_id)).id : undefined;
    }
    const t = now();
    if (cur) {
      const next = { ...cur, status, team_id: teamId, updated_at: t };
      competitionStores.participations.set(studentId, parts.map((p) => (p.ref === ref ? next : p)));
      return next;
    }
    if (parts.length >= HUB_LIMITS.participations) throw new ValidationError('You are tracking the most events allowed. Remove an old one first.');
    const event = await this.resolveRef(studentId, ref, fetchImpl);
    const next: Participation = { ref, student_id: studentId, event, status, team_id: teamId, created_at: t, updated_at: t };
    competitionStores.participations.set(studentId, [next, ...parts]);
    return next;
  }

  private static patchPart(studentId: string, ref: string, fn: (p: Participation) => Participation): Participation {
    const parts = myParts(studentId);
    const cur = parts.find((p) => p.ref === ref);
    if (!cur) throw new NotFoundError('Track this event first.');
    const next = { ...fn(cur), updated_at: now() };
    competitionStores.participations.set(studentId, parts.map((p) => (p.ref === ref ? next : p)));
    return next;
  }

  static submit(studentId: string, ref: string, input: any): Participation {
    const submission = {
      title: text(input?.title, 'Submission title', 160, true),
      description: longText(input?.description, 'Description', 4000),
      repo_url: webUrl(input?.repo_url, 'Repository link'),
      demo_url: webUrl(input?.demo_url, 'Demo link'),
      submitted_at: now(),
    };
    return this.patchPart(studentId, ref, (p) => ({ ...p, submission, status: p.status === 'WITHDRAWN' ? p.status : 'PARTICIPATED' }));
  }

  static recordResult(studentId: string, ref: string, input: any): Participation {
    if (input === null) return this.patchPart(studentId, ref, (p) => ({ ...p, result: undefined }));
    const outcome = oneOf(input?.outcome, RESULT_OUTCOMES, 'Outcome');
    let rank: number | undefined;
    if (input?.rank !== undefined && input.rank !== null && input.rank !== '') {
      rank = Number(input.rank);
      if (!Number.isInteger(rank) || rank < 1 || rank > 1_000_000) throw new ValidationError('Rank must be a whole number from 1.');
    }
    const result = { outcome, rank, note: text(input?.note, 'Note', 300), proof_url: webUrl(input?.proof_url, 'Proof link'), recorded_at: now() };
    return this.patchPart(studentId, ref, (p) => ({ ...p, result, status: p.status === 'WITHDRAWN' ? p.status : 'PARTICIPATED' }));
  }

  static untrack(studentId: string, ref: string): { removed: true } {
    const parts = myParts(studentId);
    if (!parts.some((p) => p.ref === ref)) throw new NotFoundError('Not tracked.');
    competitionStores.participations.set(studentId, parts.filter((p) => p.ref !== ref));
    return { removed: true };
  }

  /** Results the student recorded, for the portfolio. */
  static results(studentId: string) {
    return myParts(studentId)
      .filter((p) => p.result && p.result.outcome !== 'NOT_SELECTED')
      .map((p) => ({ event: p.event.title, kind: p.event.kind, outcome: p.result!.outcome, rank: p.result!.rank, proof_url: p.result!.proof_url, date: (p.event.start || p.result!.recorded_at).slice(0, 10), project: p.submission?.title }));
  }

  // ---------- Teams ----------

  static teams(studentId: string) {
    return Array.from(competitionStores.teams.values())
      .filter((t) => t.members.some((m) => m.student_id === studentId))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((t) => teamView(t, studentId));
  }

  static team(studentId: string, teamId: string) {
    return teamView(teamFor(studentId, teamId), studentId);
  }

  static async createTeam(studentId: string, input: any, fetchImpl?: typeof fetch) {
    if (this.teams(studentId).length >= HUB_LIMITS.teamsPerStudent) throw new ValidationError(`You can be in up to ${HUB_LIMITS.teamsPerStudent} teams.`);
    const t = now();
    let event: Team['event'];
    if (input?.event_ref) {
      const snap = await this.resolveRef(studentId, String(input.event_ref), fetchImpl);
      event = { title: snap.title, url: snap.url };
    }
    let code = newJoinCode();
    while (Array.from(competitionStores.teams.values()).some((x) => x.join_code === code)) code = newJoinCode();
    const team: Team = {
      id: newId('team'),
      name: text(input?.name, 'Team name', 80, true),
      owner_id: studentId,
      join_code: code,
      event,
      project: { title: text(input?.project_title, 'Project title', 160), description: '', repo_url: undefined, demo_url: undefined },
      members: [{ student_id: studentId, display_name: text(input?.display_name, 'Your name in this team', 40, true), role: 'OWNER', joined_at: t }],
      tasks: [],
      created_at: t,
      updated_at: t,
    };
    competitionStores.teams.set(team.id, team);
    if (input?.event_ref) {
      // Link the team to the student's own participation record for that event.
      await this.track(studentId, String(input.event_ref), { status: myParts(studentId).find((p) => p.ref === input.event_ref)?.status || 'INTERESTED', team_id: team.id }, fetchImpl);
    }
    return teamView(team, studentId);
  }

  static joinTeam(studentId: string, input: any) {
    const code = text(input?.code, 'Join code', 20, true).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const team = Array.from(competitionStores.teams.values()).find((t) => t.join_code === code);
    if (!team) throw new NotFoundError('No team has that join code. Check it with the team owner.');
    if (team.members.some((m) => m.student_id === studentId)) return teamView(team, studentId);
    if (team.members.length >= HUB_LIMITS.members) throw new ValidationError(`This team is full (${HUB_LIMITS.members} members).`);
    if (this.teams(studentId).length >= HUB_LIMITS.teamsPerStudent) throw new ValidationError(`You can be in up to ${HUB_LIMITS.teamsPerStudent} teams.`);
    const display_name = text(input?.display_name, 'Your name in this team', 40, true);
    team.members = [...team.members, { student_id: studentId, display_name, role: 'MEMBER', joined_at: now() }];
    saveTeam(team);
    return teamView(competitionStores.teams.get(team.id)!, studentId);
  }

  static updateTeam(studentId: string, teamId: string, input: any) {
    const t = teamFor(studentId, teamId);
    const isOwner = t.owner_id === studentId;
    if (input?.name !== undefined) {
      if (!isOwner) throw new AppError('Only the team owner can rename the team.', 403, 'FORBIDDEN');
      t.name = text(input.name, 'Team name', 80, true);
    }
    // Any member can keep the shared project details up to date.
    if (input?.project !== undefined) {
      const p = input.project || {};
      t.project = {
        title: p.title !== undefined ? text(p.title, 'Project title', 160) : t.project.title,
        description: p.description !== undefined ? longText(p.description, 'Project description', 4000) : t.project.description,
        repo_url: p.repo_url !== undefined ? webUrl(p.repo_url, 'Repository link') : t.project.repo_url,
        demo_url: p.demo_url !== undefined ? webUrl(p.demo_url, 'Demo link') : t.project.demo_url,
      };
    }
    if (input?.display_name !== undefined) {
      const dn = text(input.display_name, 'Your name in this team', 40, true);
      t.members = t.members.map((m) => (m.student_id === studentId ? { ...m, display_name: dn } : m));
    }
    saveTeam(t);
    return teamView(competitionStores.teams.get(t.id)!, studentId);
  }

  static rotateCode(studentId: string, teamId: string) {
    const t = teamFor(studentId, teamId);
    if (t.owner_id !== studentId) throw new AppError('Only the team owner can change the join code.', 403, 'FORBIDDEN');
    t.join_code = newJoinCode();
    saveTeam(t);
    return teamView(competitionStores.teams.get(t.id)!, studentId);
  }

  /** A member leaves. When the owner leaves, the longest-standing member becomes owner; an empty team is deleted. */
  static leaveTeam(studentId: string, teamId: string) {
    const t = teamFor(studentId, teamId);
    const rest = t.members.filter((m) => m.student_id !== studentId);
    if (rest.length === 0) {
      competitionStores.teams.delete(t.id);
    } else {
      if (t.owner_id === studentId) {
        t.owner_id = rest[0].student_id;
        rest[0] = { ...rest[0], role: 'OWNER' };
        t.join_code = newJoinCode(); // the old owner knew the code
      }
      t.members = rest;
      t.tasks = t.tasks.map((k) => (k.assignee_id === studentId ? { ...k, assignee_id: undefined } : k));
      saveTeam(t);
    }
    this.unlinkTeam(studentId, teamId);
    return { left: true };
  }

  static removeMember(studentId: string, teamId: string, memberKey: string) {
    const t = teamFor(studentId, teamId);
    if (t.owner_id !== studentId) throw new AppError('Only the team owner can remove members.', 403, 'FORBIDDEN');
    const target = memberIdFromKey(t, studentId, memberKey);
    if (!target || target === studentId) throw new ValidationError('To leave your own team, use Leave team.');
    t.members = t.members.filter((m) => m.student_id !== target);
    t.tasks = t.tasks.map((k) => (k.assignee_id === target ? { ...k, assignee_id: undefined } : k));
    t.join_code = newJoinCode(); // so the removed member cannot simply rejoin
    saveTeam(t);
    this.unlinkTeam(target, teamId);
    return teamView(competitionStores.teams.get(t.id)!, studentId);
  }

  private static unlinkTeam(studentId: string, teamId: string) {
    const parts = myParts(studentId);
    if (parts.some((p) => p.team_id === teamId)) {
      competitionStores.participations.set(studentId, parts.map((p) => (p.team_id === teamId ? { ...p, team_id: undefined } : p)));
    }
  }

  static addTask(studentId: string, teamId: string, input: any) {
    const t = teamFor(studentId, teamId);
    if (t.tasks.length >= HUB_LIMITS.tasks) throw new ValidationError(`A team can have up to ${HUB_LIMITS.tasks} tasks.`);
    const ts = now();
    t.tasks = [
      ...t.tasks,
      {
        id: newId('task'),
        title: text(input?.title, 'Task', 200, true),
        status: input?.status ? oneOf(input.status, TASK_STATUSES, 'Status') : 'TODO',
        assignee_id: memberIdFromKey(t, studentId, input?.assignee),
        due_date: date(input?.due_date, 'Due date'),
        created_by: studentId,
        created_at: ts,
        updated_at: ts,
      },
    ];
    saveTeam(t);
    return teamView(competitionStores.teams.get(t.id)!, studentId);
  }

  static updateTask(studentId: string, teamId: string, taskId: string, input: any) {
    const t = teamFor(studentId, teamId);
    const cur = t.tasks.find((k) => k.id === taskId);
    if (!cur) throw new NotFoundError('Task not found.');
    const next: TeamTask = {
      ...cur,
      title: input?.title !== undefined ? text(input.title, 'Task', 200, true) : cur.title,
      status: input?.status !== undefined ? oneOf(input.status, TASK_STATUSES, 'Status') : cur.status,
      assignee_id: input?.assignee !== undefined ? memberIdFromKey(t, studentId, input.assignee) : cur.assignee_id,
      due_date: input?.due_date !== undefined ? date(input.due_date, 'Due date') : cur.due_date,
      updated_at: now(),
    };
    t.tasks = t.tasks.map((k) => (k.id === taskId ? next : k));
    saveTeam(t);
    return teamView(competitionStores.teams.get(t.id)!, studentId);
  }

  static removeTask(studentId: string, teamId: string, taskId: string) {
    const t = teamFor(studentId, teamId);
    if (!t.tasks.some((k) => k.id === taskId)) throw new NotFoundError('Task not found.');
    t.tasks = t.tasks.filter((k) => k.id !== taskId);
    saveTeam(t);
    return teamView(competitionStores.teams.get(t.id)!, studentId);
  }
}
