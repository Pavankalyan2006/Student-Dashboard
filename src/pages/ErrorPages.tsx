import * as React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFoundPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-4">
        <HelpCircle className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">404 — Page Not Found</h1>
      <p className="text-xs text-slate-600 max-w-sm mb-6 leading-relaxed">
        The academic module or resource you requested could not be located in the current workspace.
      </p>
      <Button variant="primary" size="sm" onClick={() => onNavigate('/dashboard')} className="gap-2">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </Button>
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
