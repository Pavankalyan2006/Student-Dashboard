import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
const KEY = 'btech.theme';

function readPreference(): ThemePreference {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

const systemDark = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  return pref === 'system' ? (systemDark() ? 'dark' : 'light') : pref;
}

/** Puts the theme on <html>. Colours ease across only when the student switches, never on load. */
export function applyTheme(pref: ThemePreference, animate = false) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const dark = resolveTheme(pref) === 'dark';
  if (animate) {
    root.classList.add('theme-switching');
    window.setTimeout(() => root.classList.remove('theme-switching'), 420);
  }
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#070B16' : '#F6F7FB');
}

interface ThemeState {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const preference = typeof window === 'undefined' ? 'system' : readPreference();
  if (typeof window !== 'undefined') {
    applyTheme(preference);
    // Follow the operating system while the student has not picked a theme.
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
      if (get().preference === 'system') {
        applyTheme('system', true);
        set({ resolved: resolveTheme('system') });
      }
    });
  }
  return {
    preference,
    resolved: resolveTheme(preference),
    setPreference: (p) => {
      try {
        window.localStorage.setItem(KEY, p);
      } catch {
        /* storage unavailable: the choice lasts for this visit */
      }
      applyTheme(p, true);
      set({ preference: p, resolved: resolveTheme(p) });
    },
    toggle: () => get().setPreference(get().resolved === 'dark' ? 'light' : 'dark'),
  };
});
