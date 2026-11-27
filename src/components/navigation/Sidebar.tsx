import * as React from 'react';
import { ChevronDown, ChevronsLeft, ChevronsRight, Star, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUiStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { BrandMark } from '../layout/BrandMark';
import { footerSignature, initialsFor, registeredStudentName } from '../layout/studentName';
import { NAV_SECTIONS, findActiveNavItem, findSectionForItem, navItemByHref, type NavItem, type NavSection } from './navConfig';
import { useWorkspacePrefs } from '../../store/workspacePrefsStore';
import { motion } from 'motion/react';

export type { NavItem, NavSection } from './navConfig';
export { NAV_SECTIONS } from './navConfig';

const GROUPS_KEY = 'btech.nav.closedGroups';

function readClosedGroups(): Set<string> {
  try {
    const raw = window.localStorage.getItem(GROUPS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
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
          'fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        aria-label="Main navigation"
        className={cn(
          'sidebar-surface fixed inset-y-0 left-0 z-50 flex flex-col text-[#A3ADC6] border-r border-white/[0.06]',
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
            className="flex min-w-0 items-center gap-3 rounded-lg text-left"
            aria-label="B.Tech AI Platform home"
          >
            <BrandMark className="h-9 w-9" />
            {!railMode && (
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-display text-[15px] font-bold tracking-tight text-white truncate">B.Tech AI Platform</span>
                <span className="text-[11px] font-medium text-[#7F8BB0] truncate">Intelligent learning workspace</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="rounded-lg p-1.5 text-[#7F8BB0] hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-4 h-px bg-white/[0.06]" />

        {/* Groups */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-label="Modules">
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
          {NAV_SECTIONS.map((section) => (
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

        {/* Footer: who the workspace belongs to + collapse control */}
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div className={cn('flex items-center gap-2', railMode ? 'lg:flex-col' : 'justify-between')}>
            {studentName && (
              <button
                type="button"
                onClick={() => handleItemClick('/profile')}
                className={cn(
                  'flex min-w-0 items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-white/5',
                  !railMode && 'flex-1'
                )}
                title={railMode ? footerSignature(student, isAuthenticated) : undefined}
                data-testid="sidebar-student"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[11px] font-bold text-white ring-1 ring-white/10">
                  {initialsFor(studentName)}
                </span>
                {!railMode && (
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-semibold text-white">{studentName}</span>
                    <span className="truncate text-[11px] text-[#7F8BB0]">View profile</span>
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden shrink-0 rounded-lg p-2 text-[#7F8BB0] transition-colors hover:bg-white/5 hover:text-white lg:inline-flex"
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

  return (
    <div className={cn('mb-1', railMode && 'lg:mb-2 lg:border-b lg:border-white/[0.05] lg:pb-2 lg:last:border-b-0')}>
      {!railMode && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={listId}
          className="group flex w-full items-center justify-between rounded-md px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7F8BB0] hover:text-[#C3CAE0]"
        >
          <span>{section.title}</span>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', !open && '-rotate-90')} />
        </button>
      )}
      <ul id={listId} className={cn('space-y-0.5', !showItems && 'hidden')}>
        {section.items.map((item) => (
          <li key={item.href}>
            <SidebarLink item={item} active={item.href === activeHref} railMode={railMode} onClick={() => onItemClick(item.href)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarLink({ item, active, railMode, onClick }: { item: NavItem; active: boolean; railMode: boolean; onClick: () => void }) {
  const Icon = item.icon;
  const link = (
    <a
      href={item.href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick();
      }}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/navlink relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150',
        active ? 'text-white' : 'text-[#A3ADC6] hover:bg-white/[0.04] hover:text-white',
        railMode && 'lg:justify-center lg:px-0 lg:py-2.5'
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/[0.16] to-transparent ring-1 ring-inset ring-white/[0.06]"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        >
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400" />
        </motion.span>
      )}
      <Icon
        className={cn(
          'relative h-[18px] w-[18px] shrink-0 transition-[color,transform] duration-200 group-hover/navlink:translate-x-0.5 motion-reduce:transform-none',
          active ? 'text-blue-300' : item.isAi ? 'text-violet-300/80' : 'text-[#7F8BB0]'
        )}
      />
      <span className={cn('relative flex-1 truncate', railMode && 'lg:sr-only')}>{item.name}</span>
      {item.badge && !railMode && (
        <span className="relative rounded-md bg-violet-500/15 px-1.5 py-px text-[10px] font-semibold text-violet-200 ring-1 ring-inset ring-violet-400/20">
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
