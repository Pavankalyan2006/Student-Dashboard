import * as React from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import { GlobalSearch } from '../navigation/GlobalSearch';
import { useUiStore } from '../../store/uiStore';
import { Toaster } from 'sonner';
import { cn } from '../../lib/utils';

export interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function AppShell({ currentPath, onNavigate, children }: AppShellProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#101828]">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      {/* App navigation is not printed: the resume preview prints (and saves as PDF) through the browser. */}
      <div className="print:hidden">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      </div>

      {/* Main Workspace Frame */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]',
          'print:pl-0'
        )}
      >
        {/* Topbar Navigation */}
        <Topbar currentPath={currentPath} onNavigate={onNavigate} />

        {/* Page Viewport Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 print:p-0">
          {children}
        </main>
      </div>

      {/* Global Search Dialog (Ctrl+K) */}
      <GlobalSearch onNavigate={onNavigate} />

      {/* Global Toast Notification System */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
}
