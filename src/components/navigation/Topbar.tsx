import * as React from 'react';
import { Menu, Search, ChevronRight } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { AskAIButton } from './AskAIButton';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';

export interface TopbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Topbar({ currentPath, onNavigate }: TopbarProps) {
  const { setMobileDrawerOpen, setGlobalSearchOpen } = useUiStore();

  // Generate breadcrumb titles from currentPath
  const getBreadcrumbs = () => {
    if (currentPath === '/' || currentPath === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard' }];
    }

    const segments = currentPath.split('/').filter(Boolean);
    const crumbs = [{ label: 'Workspace', href: '/dashboard' }];

    let accPath = '';
    segments.forEach((seg) => {
      accPath += `/${seg}`;
      const formatted = seg
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      crumbs.push({ label: formatted, href: accPath });
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E4E7EC] bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left zone: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-[#667085]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                {isLast ? (
                  <span className="font-semibold text-[#101828] truncate">{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => onNavigate(crumb.href)}
                    className="hover:text-[#101828] transition-colors truncate cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center zone: Global Search Input Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-[#E4E7EC] bg-slate-50/70 text-xs text-[#667085] hover:bg-white hover:border-slate-300 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search courses, documents, projects...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-[#E4E7EC] bg-white px-1.5 py-0.5 text-[10px] font-mono text-[#667085] shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right zone: Mobile Search Icon + Ask AI + Notification Bell + Profile Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Mobile search trigger */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
          aria-label="Open search dialog"
        >
          <Search className="h-4 w-4" />
        </button>

        <AskAIButton onClick={() => onNavigate('/ai-agent')} />

        <NotificationBell onNavigate={onNavigate} />

        <ProfileMenu onNavigate={onNavigate} />
      </div>
    </header>
  );
}
