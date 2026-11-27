import * as React from 'react';
import { ChevronDown, ChevronsLeft, ChevronsRight, Settings, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useUiStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { NexoraLogo } from '../brand/Nexora';
import { footerSignature, initialsFor, registeredStudentName } from '../layout/studentName';
import { NAV_SECTIONS, findActiveNavItem, findSectionForItem, navItemByHref, type NavItem, type NavSection } from './navConfig';
import { useWorkspacePrefs } from '../../store/workspacePrefsStore';

export type { NavItem, NavSection } from './navConfig';
export { NAV_SECTIONS } from './navConfig';

const GROUPS_KEY = 'btech.nav.closedGroups';
const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

function readClosedGroups(): Set<string> {
  try {
    const raw = window.localStorage.getItem(GROUPS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Arrow-key movement between sidebar links (Up/Down, Home/End). Tab still moves through them in order. */
function handleNavKeys(e: React.KeyboardEvent<HTMLElement>) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-nav-link], [data-nav-group]'));
  const i = links.indexOf(document.activeElement as HTMLElement);
  if (i === -1) return;
  e.preventDefault();
  const next =
    e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : e.key === 'ArrowDown' ? Math.min(links.length - 1, i + 1) : Math.max(0, i - 1);
  links[next]?.focus();
}

export function Sidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();
  const { student, isAuthenticated } = useAuth();
  const [closedGroups, setClosedGroups] = React.useState<Set<string>>(() =>
    typeof window === 'undefined' ? new Set() : readClosedGroups()
  );

  const activeItem = findActiveNavItem(currentPath);
  const activeSection = findSectionForItem(activeItem);
  const railMode = sidebarCollapsed && !mobileDrawerOpen;
  const studentName = registeredStudentName(student, isAuthenticated);
  const academicLine = [student?.branch, student?.semester ? `Semester ${student.semester}` : null].filter(Boolean).join(' · ');
  const [avatarFailed, setAvatarFailed] = React.useState(false);
  React.useEffect(() => setAvatarFailed(false), [student?.avatar_url]);
  const pinnedHrefs = useWorkspacePrefs((s) => s.pinned);
  const pinnedSection: NavSection | null = React.useMemo(() => {
    const items = pinnedHrefs.map(navItemByHref).filter((i): i is NavItem => Boolean(i));
    return items.length ? { id: 'pinned', title: 'Pinned', icon: Star, items } : null;
  }, [pinnedHrefs]);

  // Close the mobile drawer with Escape.
  React.useEffect(() => {
    if (!mobileDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileDrawerOpen, setMobileDrawerOpen]);

  const toggleGroup = (id: string) => {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(GROUPS_KEY, JSON.stringify([...next]));
      } catch {
        /* storage unavailable: grouping still works for this session */
      }
      return next;
    });
  };

  const handleItemClick = (href: string) => {
    onNavigate(href);
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };

  return (
    <TooltipProvider delayDuration={150}>
      {/* Mobile drawer overlay */}
      <div
        aria-hidden="true"
        onClick={() => setMobileDrawerOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-[#080B16]/60 backdrop-blur-[3px] transition-opacity duration-200 lg:hidden',
          mobileDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          'sidebar-surface fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] text-[#9CA8C2]',
          'transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[272px]',
          mobileDrawerOpen ? 'w-[288px] max-w-[86vw] translate-x-0 shadow-2xl' : 'w-[288px] -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className={cn('flex h-16 shrink-0 items-center justify-between gap-2 px-4', railMode && 'lg:justify-center lg:px-0')}>
          <button
            type="button"
            onClick={() => handleItemClick('/dashboard')}
            className="press flex min-w-0 items-center rounded-lg text-left"
            aria-label="NEXORA AI home"
          >
            <NexoraLogo tone="dark" tagline compact={railMode} markClassName="h-9 w-9" />
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg p-1.5 text-[#7F8BAA] hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Personalised student card */}
        {studentName && (
          <div className={cn('px-3 pb-2', railMode && 'lg:px-2')}>
            <button
              type="button"
              onClick={() => handleItemClick('/profile')}
              title={railMode ? footerSignature(student, isAuthenticated) : undefined}
              data-testid="sidebar-student"
              className={cn(
                'press group flex w-full min-w-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-left transition-colors hover:border-white/[0.1] hover:bg-white/[0.05]',
                railMode && 'lg:justify-center lg:border-transparent lg:bg-transparent lg:p-1.5'
              )}
            >
              <span className="relative shrink-0">
                {student?.avatar_url && !avatarFailed ? (
                  <img
                    src={student.avatar_url}
                    alt=""
                    onError={() => setAvatarFailed(true)}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7865F5] to-[#37C9E8] text-[12px] font-bold text-white ring-2 ring-white/10">
                    {initialsFor(studentName)}
                  </span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0A0E1B] bg-[#36D399]" aria-hidden="true" />
              </span>
              {!railMode && (
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-[13px] font-semibold text-white">{studentName}</span>
                  <span className="truncate text-[11px] text-[#7F8BAA]">{academicLine || 'View profile'}</span>
                </span>
              )}
            </button>
          </div>
        )}

        <div className="mx-4 h-px bg-white/[0.06]" />

        {/* Groups */}
        <nav
          className="sidebar-scroll flex-1 overflow-y-auto overscroll-contain px-3 py-3"
          aria-label="Modules"
          onKeyDown={handleNavKeys}
        >
          {pinnedSection && (
            // Shortcuts the student pinned from the top bar. The page stays highlighted in its own group only.
            <SidebarGroup
              section={pinnedSection}
              railMode={railMode}
              open={!closedGroups.has('pinned')}
              onToggle={() => toggleGroup('pinned')}
              onItemClick={handleItemClick}
            />
          )}
          {NAV_SECTIONS.filter((s) => s.id !== 'settings').map((section) => (
            <SidebarGroup
              key={section.id}
              section={section}
              railMode={railMode}
              open={!closedGroups.has(section.id) || section === activeSection}
              onToggle={() => toggleGroup(section.id)}
              activeHref={activeItem?.href}
              onItemClick={handleItemClick}
            />
          ))}
        </nav>

        {/* Footer: settings + collapse control */}
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div className={cn('flex items-center gap-1.5', railMode ? 'lg:flex-col' : 'justify-between')}>
            <SidebarLink
              item={{ name: 'Settings', href: '/profile/settings', icon: Settings }}
              active={activeItem?.href === '/profile/settings'}
              railMode={railMode}
              onClick={() => handleItemClick('/profile/settings')}
              className={railMode ? undefined : 'flex-1'}
            />
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar ([)' : 'Collapse sidebar ([)'}
              className="press hidden shrink-0 rounded-lg p-2 text-[#7F8BAA] transition-colors hover:bg-white/5 hover:text-white lg:inline-flex"
            >
              {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function SidebarGroup({
  section,
  railMode,
  open,
  onToggle,
  activeHref,
  onItemClick,
}: {
  section: NavSection;
  railMode: boolean;
  open: boolean;
  onToggle: () => void;
  activeHref?: string;
  onItemClick: (href: string) => void;
}) {
  const listId = `nav-group-${section.id}`;
  const showItems = railMode || open;
  const hasActive = section.items.some((i) => i.href === activeHref);

  const list = (
    <ul id={listId} className="space-y-0.5 pb-1">
      {section.items.map((item) => (
        <li key={item.href}>
          <SidebarLink item={item} active={item.href === activeHref} railMode={railMode} onClick={() => onItemClick(item.href)} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cn('mb-1', railMode && 'lg:mb-2 lg:border-b lg:border-white/[0.05] lg:pb-2 lg:last:border-b-0')}>
      {!railMode && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={listId}
          data-nav-group
          className={cn(
            'group flex w-full items-center justify-between rounded-md px-3 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors',
            hasActive ? 'text-[#B4A7F7]' : 'text-[#6F7B97] hover:text-[#C3CADD]'
          )}
        >
          <span>{section.title}</span>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', !open && '-rotate-90')} />
        </button>
      )}
      {railMode ? (
        list
      ) : (
        <AnimatePresence initial={false}>
          {showItems && (
            <motion.div
              key="items"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {list}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function SidebarLink({
  item,
  active,
  railMode,
  onClick,
  className,
}: {
  item: NavItem;
  active: boolean;
  railMode: boolean;
  onClick: () => void;
  className?: string;
}) {
  const Icon = item.icon;
  const link = (
    <a
      href={item.href}
      data-nav-link
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick();
      }}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/navlink relative flex items-center gap-3 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors duration-150',
        active ? 'text-white' : 'text-[#9CA8C2] hover:bg-white/[0.04] hover:text-white',
        railMode && 'lg:justify-center lg:px-0 lg:py-2.5',
        className
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#7865F5]/[0.22] via-[#7865F5]/[0.08] to-transparent ring-1 ring-inset ring-[#9B78FF]/[0.18]"
          transition={SPRING}
        >
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#9B78FF] to-[#37C9E8] shadow-[0_0_10px_rgb(155_120_255_/_0.6)]" />
        </motion.span>
      )}
      <Icon
        className={cn(
          'relative h-[18px] w-[18px] shrink-0 transition-[color,transform] duration-200 group-hover/navlink:translate-x-0.5 motion-reduce:transform-none',
          active ? 'text-[#B4A7F7]' : item.isAi ? 'text-[#9B78FF]/80' : 'text-[#6F7B97] group-hover/navlink:text-[#C3CADD]'
        )}
      />
      <span className={cn('relative flex-1 truncate', railMode && 'lg:sr-only')}>{item.name}</span>
      {item.badge && !railMode && (
        <span className="relative rounded-md bg-[#7865F5]/15 px-1.5 py-px text-[10px] font-semibold text-[#C7B2FB] ring-1 ring-inset ring-[#9B78FF]/25">
          {item.badge}
        </span>
      )}
    </a>
  );

  if (!railMode) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        {item.name}
      </TooltipContent>
    </Tooltip>
  );
}
