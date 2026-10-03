import * as React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Cpu,
  GitBranch,
  Activity,
  ShieldAlert,
  Server,
  Settings,
  MessageSquareWarning,
  ArrowLeft,
  Search,
  Bell,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Content', href: '/admin/content', icon: BookOpen },
  { name: 'AI & Models', href: '/admin/ai', icon: Cpu },
  { name: 'Integrations', href: '/admin/integrations', icon: GitBranch },
  { name: 'Background Jobs', href: '/admin/jobs', icon: Activity },
  { name: 'Community Reports', href: '/admin/community', icon: MessageSquareWarning },
  { name: 'Security & Limits', href: '/admin/security', icon: ShieldAlert },
  { name: 'System & Health', href: '/admin/system', icon: Server },
  { name: 'Feature Flags', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ currentPath, onNavigate, children }: AdminLayoutProps) {
  const { student, isSuperAdmin } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const normalizedPath = currentPath.split('?')[0];

  // Active check helper
  const isActive = (href: string) => {
    if (href === '/admin/dashboard' && (normalizedPath === '/admin' || normalizedPath === '/admin/dashboard')) {
      return true;
    }
    return normalizedPath === href || normalizedPath.startsWith(`${href}/`);
  };

  const handleNav = (href: string) => {
    onNavigate(href);
    setMobileMenuOpen(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#060D1E] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0D1836] border border-rose-900/50 rounded-2xl p-8 text-center shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-400 mb-4">
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied: Super Admin Restricted</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The Super Admin platform management plane is strictly limited to verified platform administrators.
            Least-privilege isolation is enforced on both client and server boundaries.
          </p>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Student Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070E20] text-slate-100 flex flex-col font-sans">
      {/* Admin Topbar */}
      <header className="h-16 border-b border-[#1A284D] bg-[#0A132C]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#132247]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">B.Tech AI Platform</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Control Center & System Observability</p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Health indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-[11px] text-emerald-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Healthy · 12ms</span>
          </div>

          {/* Switch to Student Portal */}
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14234B] hover:bg-[#1C3168] border border-[#243973] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            title="Switch back to student learning mode"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline">Student View</span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1A284D]">
            <img
              src={student?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'}
              alt={student?.name || 'Super Admin'}
              className="h-8 w-8 rounded-full bg-[#14234B] border border-amber-500/40"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">{student?.name || 'Administrator'}</p>
              <p className="text-[10px] text-amber-400/90 mt-0.5 leading-none">SUPER_ADMIN</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('/login');
            }}
            title="Log out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-[#1A284D] bg-[#0A132C]/60 shrink-0">
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <div className="px-3 pb-2 pt-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none">
              Platform Administration
            </div>
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNav(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer',
                    active
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 shadow-sm shadow-amber-950/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121F42]'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-amber-400' : 'text-slate-400')} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#1A284D] bg-[#081024]">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Production v1.0.0
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">FastAPI + Vite</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#070E20]/95 backdrop-blur-md">
            <div className="p-4 border-b border-[#1A284D] flex items-center justify-between">
              <span className="font-bold text-sm text-amber-400">Admin Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-1 overflow-y-auto flex-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNav(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left',
                      active
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121F42]'
                    )}
                  >
                    <Icon className="h-5 w-5 text-amber-400" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070E20]">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
