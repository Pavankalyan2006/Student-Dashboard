import * as React from 'react';
import { Menu, Search, ChevronRight, Star } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { AskAIButton } from './AskAIButton';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';
import { findActiveNavItem, findSectionForItem } from './navConfig';
import { useWorkspacePrefs } from '../../store/workspacePrefsStore';
import { cn } from '../../lib/utils';

export interface TopbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface Crumb {
  label: string;
  href?: string;
}

/** Readable label for a URL segment; ids and long hashes are shortened rather than shown raw. */
function labelForSegment(seg: string): string {
  const decoded = decodeURIComponent(seg);
  if (/^[0-9a-f-]{16,}$/i.test(decoded) || /^[a-z]+_[A-Za-z0-9]{6,}$/.test(decoded)) return 'Details';
  return decoded
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function buildBreadcrumbs(currentPath: string): Crumb[] {
  const path = (currentPath.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/dashboard') return [{ label: 'Overview' }, { label: 'Dashboard' }];

  const item = findActiveNavItem(path);
  const section = findSectionForItem(item);
  if (!item || !section) {
    const segs = path.split('/').filter(Boolean);
    return [{ label: 'Workspace', href: '/dashboard' }, ...segs.map((s) => ({ label: labelForSegment(s) }))];
  }

  const crumbs: Crumb[] = [{ label: section.title }];
  const isItemRoot = path === item.href || (item.match ?? []).includes(path);
  crumbs.push(isItemRoot ? { label: item.name } : { label: item.name, href: item.href });
  if (!isItemRoot) {
    const base = [item.href, ...(item.match ?? [])].find((p) => path.startsWith(p + '/')) ?? item.href;
    const rest = path.slice(base.length).split('/').filter(Boolean);
    const last = rest[rest.length - 1];
    if (last) crumbs.push({ label: labelForSegment(last) });
  }
  return crumbs;
}

export function Topbar({ currentPath, onNavigate }: TopbarProps) {
  const { setMobileDrawerOpen, setGlobalSearchOpen } = useUiStore();
  const breadcrumbs = buildBreadcrumbs(currentPath);
  const title = breadcrumbs[breadcrumbs.length - 1]?.label ?? 'Dashboard';
  const navItem = findActiveNavItem(currentPath);
  const pinned = useWorkspacePrefs((s) => (navItem ? s.pinned.includes(navItem.href) : false));
  const canPin = useWorkspacePrefs((s) => Boolean(s.studentId));
  const togglePin = useWorkspacePrefs((s) => s.togglePin);

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-16 w-full items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 sm:px-6 lg:px-8">
      {/* Left: drawer trigger + location */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="-ml-1.5 rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
            {breadcrumbs.slice(0, -1).map((crumb, idx) => (
              <React.Fragment key={`${crumb.label}-${idx}`}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden="true" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(crumb.href!);
                    }}
                    className="truncate hover:text-slate-900"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="truncate">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
          <div className="flex min-w-0 items-center gap-1">
            <p className="truncate font-display text-[15px] font-semibold leading-tight tracking-tight text-slate-900" aria-current="page">
              {title}
            </p>
            {navItem && canPin && (
              <button
                type="button"
                onClick={() => togglePin(navItem.href)}
                aria-pressed={pinned}
                aria-label={pinned ? `Unpin ${navItem.name} from the sidebar` : `Pin ${navItem.name} to the sidebar`}
                title={pinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                data-testid="pin-page"
                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-amber-500"
              >
                <Star className={cn('h-3.5 w-3.5', pinned && 'fill-amber-400 text-amber-500')} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Center: global search */}
      <div className="hidden w-full max-w-sm md:block lg:max-w-md">
        <button
          type="button"
          onClick={() => setGlobalSearchOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-500 transition-colors hover:border-slate-300 hover:bg-white"
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="flex-1 truncate text-left">Search courses, notes, documents…</span>
          <kbd className="hidden items-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 lg:inline-flex">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <button
          type="button"
          onClick={() => setGlobalSearchOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Search"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        <AskAIButton onClick={() => onNavigate('/ai-agent')} />
        <NotificationBell onNavigate={onNavigate} />
        <span className="mx-0.5 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
        <ProfileMenu onNavigate={onNavigate} />
      </div>
    </header>
  );
}
