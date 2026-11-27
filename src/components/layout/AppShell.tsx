import * as React from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import { GlobalSearch } from '../navigation/GlobalSearch';
import { useUiStore } from '../../store/uiStore';
import { Toaster } from 'sonner';
import { cn } from '../../lib/utils';
import { AppFooter } from './AppFooter';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspacePrefs } from '../../store/workspacePrefsStore';
import { KeyboardShortcuts } from '../navigation/KeyboardShortcuts';
import { BackToTop, ScrollProgress, motion, EASE_OUT } from '../motion';
import { useThemeStore } from '../../store/themeStore';

export interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function AppShell({ currentPath, onNavigate, children }: AppShellProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const theme = useThemeStore((s) => s.resolved);
  const routeKey = currentPath.split(/[?#]/)[0];
  const { student } = useAuth();
  const loadPrefs = useWorkspacePrefs((s) => s.load);
  const recordVisit = useWorkspacePrefs((s) => s.recordVisit);
  const prefsOwner = useWorkspacePrefs((s) => s.studentId);
  const studentId = student?.id ? String(student.id) : null;

  // Pinned and recent pages belong to the signed-in student; switch them when the student changes.
  React.useEffect(() => {
    loadPrefs(studentId);
  }, [studentId, loadPrefs]);
  React.useEffect(() => {
    if (studentId && prefsOwner === studentId) recordVisit(routeKey);
  }, [routeKey, studentId, prefsOwner, recordVisit]);

  return (
    <div className="app-canvas min-h-screen text-slate-900">
      <ScrollProgress />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* App navigation is not printed: the resume preview prints (and saves as PDF) through the browser. */}
      <div className="print:hidden">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      </div>

      <div
        className={cn(
          'flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[272px]',
          'print:pl-0'
        )}
      >
        <Topbar currentPath={currentPath} onNavigate={onNavigate} />

        <motion.main
          id="main-content"
          key={routeKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 print:max-w-none print:p-0"
        >
          {children}
        </motion.main>

        <AppFooter onNavigate={onNavigate} />
      </div>

      {/* Global Search Dialog (Ctrl+K) */}
      <GlobalSearch onNavigate={onNavigate} />
      <KeyboardShortcuts onNavigate={onNavigate} />
      {/* The research workspace has its own floating button in the same corner. */}
      {!routeKey.startsWith('/research/') && <BackToTop />}

      <Toaster
        position="top-right"
        theme={theme}
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'rounded-xl border border-slate-200 shadow-lg font-sans',
            title: 'text-[13px] font-semibold text-slate-900',
            description: 'text-xs text-slate-600',
          },
        }}
      />
    </div>
  );
}
