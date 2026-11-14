import * as React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { useUiStore } from '../../store/uiStore';

/** "g" then a letter jumps to a page. Every target is a sidebar destination. */
export const GO_TO_SHORTCUTS: { key: string; href: string; label: string }[] = [
  { key: 'd', href: '/dashboard', label: 'Dashboard' },
  { key: 'c', href: '/courses', label: 'Courses' },
  { key: 'n', href: '/notes', label: 'Notes' },
  { key: 'f', href: '/flashcards', label: 'Flashcards' },
  { key: 's', href: '/study-planner', label: 'Study Planner' },
  { key: 'p', href: '/progress', label: 'Unified Progress' },
  { key: 'a', href: '/ai-agent', label: 'AI Tutor' },
  { key: 'j', href: '/career/jobs', label: 'Jobs' },
];

/** True when the key press belongs to a text field, so shortcuts must not fire. */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.closest !== 'function') return false;
  return Boolean(el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], .monaco-editor, [role=textbox]'));
}

const Key = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex min-w-[22px] items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.08)]">
    {children}
  </kbd>
);

export function KeyboardShortcuts({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const { setGlobalSearchOpen, toggleSidebar } = useUiStore();
  const pendingG = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector('[role=dialog]') && !open) return; // another dialog owns the keyboard
      if (e.key === '?') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (open) return;
      if (e.key === '/') {
        e.preventDefault();
        setGlobalSearchOpen(true);
        return;
      }
      if (e.key === '[') {
        toggleSidebar();
        return;
      }
      if (pendingG.current !== null) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const hit = GO_TO_SHORTCUTS.find((s) => s.key === e.key.toLowerCase());
        if (hit) {
          e.preventDefault();
          onNavigate(hit.href);
        }
        return;
      }
      if (e.key === 'g') pendingG.current = window.setTimeout(() => (pendingG.current = null), 1200);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onNavigate, setGlobalSearchOpen, toggleSidebar]);

  const general: { keys: string[]; label: string }[] = [
    { keys: ['Ctrl', 'K'], label: 'Search pages and content' },
    { keys: ['/'], label: 'Search pages and content' },
    { keys: ['['], label: 'Collapse or expand the sidebar' },
    { keys: ['?'], label: 'Show this list' },
    { keys: ['Esc'], label: 'Close a dialog or the menu' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg" data-testid="shortcuts-dialog">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Shortcuts work anywhere outside a text field.</DialogDescription>
        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">General</h3>
            <ul className="space-y-2">
              {general.map((s) => (
                <li key={s.label + s.keys.join()} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>{s.label}</span>
                  <span className="flex shrink-0 gap-1">{s.keys.map((k) => <Key key={k}>{k}</Key>)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Go to</h3>
            <ul className="space-y-2">
              {GO_TO_SHORTCUTS.map((s) => (
                <li key={s.key} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>{s.label}</span>
                  <span className="flex shrink-0 gap-1"><Key>g</Key><Key>{s.key}</Key></span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
