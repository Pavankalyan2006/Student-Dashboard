import * as React from 'react';
import { HelpCircle, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useUiStore } from '../store/uiStore';
import { Button } from '../components/ui/button';

export function NotFoundPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const setGlobalSearchOpen = useUiStore((s) => s.setGlobalSearchOpen);
  return (
    <div className="relative flex min-h-[64vh] flex-col items-center justify-center overflow-hidden p-6 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500/15 to-violet-500/15 blur-3xl" />
      <motion.p
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="text-gradient relative font-display text-[96px] font-extrabold leading-none tracking-tighter sm:text-[128px]"
      >
        404
      </motion.p>
      <h1 className="relative mt-2 font-display text-2xl font-bold text-slate-900">This page wandered off</h1>
      <p className="relative mb-7 mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
        The academic module or resource you requested could not be located in the current workspace.
      </p>
      <div className="relative flex flex-wrap justify-center gap-2.5">
        <Button variant="primary" onClick={() => onNavigate('/dashboard')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Button>
        <Button variant="outline" onClick={() => setGlobalSearchOpen(true)} className="gap-2">
          <Search className="h-4 w-4" />
          <span>Search the workspace</span>
        </Button>
      </div>
    </div>
  );
}

export function ForbiddenPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
        <HelpCircle className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">403 — Access Restricted</h1>
      <p className="text-xs text-slate-600 max-w-sm mb-6 leading-relaxed">
        You do not have the required permissions to access this administrative section.
      </p>
      <Button variant="primary" size="sm" onClick={() => onNavigate('/dashboard')} className="gap-2">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </Button>
    </div>
  );
}
