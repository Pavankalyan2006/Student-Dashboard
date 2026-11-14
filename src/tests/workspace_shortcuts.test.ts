import { describe, it, expect, beforeEach } from 'vitest';
import { searchNavPages, ALL_NAV_ITEMS, navItemByHref } from '../components/navigation/navConfig';
import {
  MAX_PINNED,
  MAX_RECENT,
  prefsKey,
  sanitizePrefs,
  withPinToggled,
  withVisit,
  useWorkspacePrefs,
} from '../store/workspacePrefsStore';
import { GO_TO_SHORTCUTS, isTypingTarget } from '../components/navigation/KeyboardShortcuts';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  };
  useWorkspacePrefs.setState({ studentId: null, pinned: [], recent: [] });
});

describe('Command palette page search', () => {
  it('finds pages by name, ranking names that start with the query first', () => {
    const r = searchNavPages('flash');
    expect(r[0].item.href).toBe('/flashcards');
    expect(searchNavPages('notes').map((m) => m.item.href)).toContain('/notes');
  });

  it('matches group names and URL words, and returns nothing for an empty query', () => {
    expect(searchNavPages('career').some((m) => m.item.href === '/career/jobs')).toBe(true);
    expect(searchNavPages('   ')).toEqual([]);
    expect(searchNavPages('zzzz-no-such-page')).toEqual([]);
  });

  it('only returns real sidebar destinations', () => {
    const hrefs = new Set(ALL_NAV_ITEMS.map((i) => i.href));
    for (const q of ['a', 'e', 'lab', 'pro']) for (const m of searchNavPages(q, 50)) expect(hrefs.has(m.item.href)).toBe(true);
  });
});

describe('Pinned and recent pages', () => {
  it('records visits most-recent first, folding sub-pages into their sidebar page', () => {
    let r: string[] = [];
    r = withVisit(r, '/notes');
    r = withVisit(r, '/community/questions/abc123');
    r = withVisit(r, '/notes');
    expect(r).toEqual(['/notes', '/community/questions']);
  });

  it('ignores pages that are not in the sidebar and caps the list', () => {
    expect(withVisit([], '/login')).toEqual([]);
    let r: string[] = [];
    for (const i of ALL_NAV_ITEMS) r = withVisit(r, i.href);
    expect(r.length).toBe(MAX_RECENT);
  });

  it('toggles pins and refuses unknown pages', () => {
    expect(withPinToggled([], '/courses')).toEqual(['/courses']);
    expect(withPinToggled(['/courses'], '/courses')).toEqual([]);
    expect(withPinToggled([], '/not-a-page')).toEqual([]);
    let p: string[] = [];
    for (const i of ALL_NAV_ITEMS) p = withPinToggled(p, i.href);
    expect(p.length).toBe(MAX_PINNED);
  });

  it('drops stored values that are not sidebar pages', () => {
    expect(sanitizePrefs({ pinned: ['/courses', '/evil', 3, '/courses'], recent: 'x' })).toEqual({ pinned: ['/courses'], recent: [] });
    expect(sanitizePrefs(null)).toEqual({ pinned: [], recent: [] });
  });

  it('keeps each student\'s shortcuts separate', () => {
    const s = useWorkspacePrefs.getState();
    s.load('student-a');
    useWorkspacePrefs.getState().togglePin('/courses');
    useWorkspacePrefs.getState().recordVisit('/notes');
    expect(JSON.parse(store.get(prefsKey('student-a'))!)).toEqual({ pinned: ['/courses'], recent: ['/notes'] });

    useWorkspacePrefs.getState().load('student-b');
    expect(useWorkspacePrefs.getState().pinned).toEqual([]);
    expect(useWorkspacePrefs.getState().recent).toEqual([]);

    useWorkspacePrefs.getState().load('student-a');
    expect(useWorkspacePrefs.getState().pinned).toEqual(['/courses']);
  });

  it('stores nothing when signed out', () => {
    useWorkspacePrefs.getState().load(null);
    useWorkspacePrefs.getState().togglePin('/courses');
    expect(store.size).toBe(0);
  });
});

describe('Keyboard shortcuts', () => {
  it('every "go to" shortcut targets a sidebar page and keys are unique', () => {
    for (const s of GO_TO_SHORTCUTS) expect(navItemByHref(s.href), s.href).toBeTruthy();
    expect(new Set(GO_TO_SHORTCUTS.map((s) => s.key)).size).toBe(GO_TO_SHORTCUTS.length);
  });

  it('does not fire while typing in a field', () => {
    const field = { closest: (sel: string) => (sel.includes('input') ? {} : null) };
    expect(isTypingTarget(field as any)).toBe(true);
    expect(isTypingTarget({ closest: () => null } as any)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
