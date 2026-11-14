import { create } from 'zustand';
import { ALL_NAV_ITEMS, findActiveNavItem } from '../components/navigation/navConfig';

/**
 * Per-student workspace shortcuts: pages the student pinned to the top of the sidebar, and the pages they
 * opened most recently (shown in the command palette). Stored in this browser under the student's id, so
 * two students on one machine never see each other's shortcuts. Only real sidebar destinations are kept.
 */
export const MAX_PINNED = 8;
export const MAX_RECENT = 6;

interface Prefs {
  pinned: string[];
  recent: string[];
}

const EMPTY: Prefs = { pinned: [], recent: [] };
const VALID = new Set(ALL_NAV_ITEMS.map((i) => i.href));

export const prefsKey = (studentId: string) => `btech.workspace.${studentId}`;

export function sanitizePrefs(raw: unknown): Prefs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Prefs>;
  const clean = (list: unknown, max: number) =>
    Array.isArray(list) ? [...new Set(list.filter((h): h is string => typeof h === 'string' && VALID.has(h)))].slice(0, max) : [];
  return { pinned: clean(r.pinned, MAX_PINNED), recent: clean(r.recent, MAX_RECENT) };
}

function read(studentId: string | null): Prefs {
  if (!studentId) return EMPTY;
  try {
    return sanitizePrefs(JSON.parse(window.localStorage.getItem(prefsKey(studentId)) || 'null'));
  } catch {
    return EMPTY;
  }
}

function write(studentId: string | null, prefs: Prefs) {
  if (!studentId) return;
  try {
    window.localStorage.setItem(prefsKey(studentId), JSON.stringify(prefs));
  } catch {
    /* storage unavailable: shortcuts last for this session only */
  }
}

/** Adds a visit to the front of the recent list (sub-pages count as their sidebar page). */
export function withVisit(recent: string[], path: string): string[] {
  const item = findActiveNavItem(path);
  if (!item) return recent;
  return [item.href, ...recent.filter((h) => h !== item.href)].slice(0, MAX_RECENT);
}

export function withPinToggled(pinned: string[], href: string): string[] {
  if (!VALID.has(href)) return pinned;
  if (pinned.includes(href)) return pinned.filter((h) => h !== href);
  return [...pinned, href].slice(-MAX_PINNED);
}

interface WorkspacePrefsState extends Prefs {
  studentId: string | null;
  load: (studentId: string | null) => void;
  recordVisit: (path: string) => void;
  togglePin: (href: string) => void;
  clearRecent: () => void;
}

export const useWorkspacePrefs = create<WorkspacePrefsState>((set, get) => ({
  ...EMPTY,
  studentId: null,
  load: (studentId) => {
    if (studentId === get().studentId) return;
    set({ studentId, ...read(studentId) });
  },
  recordVisit: (path) => {
    const { studentId, pinned, recent } = get();
    const next = withVisit(recent, path);
    if (next === recent || next.join() === recent.join()) return;
    set({ recent: next });
    write(studentId, { pinned, recent: next });
  },
  togglePin: (href) => {
    const { studentId, pinned, recent } = get();
    const next = withPinToggled(pinned, href);
    set({ pinned: next });
    write(studentId, { pinned: next, recent });
  },
  clearRecent: () => {
    const { studentId, pinned } = get();
    set({ recent: [] });
    write(studentId, { pinned, recent: [] });
  },
}));
