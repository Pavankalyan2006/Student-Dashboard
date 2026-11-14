import * as React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BrandMark } from './BrandMark';
import { footerSignature, registeredStudentName } from './studentName';

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Progress', href: '/progress' },
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/profile/settings' },
  { label: 'How it works', href: '/how-it-works' },
];

/**
 * App footer. Shows who the workspace is for, using the signed-in student's registered name
 * from the backend record (see studentName.ts). No development phase or build label is shown.
 */
export function AppFooter({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { student, isAuthenticated } = useAuth();
  const hasName = Boolean(registeredStudentName(student, isAuthenticated));
  const signature = footerSignature(student, isAuthenticated);

  return (
    <footer className="print:hidden mt-auto border-t border-slate-200/80 bg-white/60">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandMark className="h-6 w-6 rounded-md" />
          <span className="font-semibold text-slate-700">B.Tech AI Platform</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span
            data-testid="footer-student-name"
            className={hasName ? 'min-w-0 truncate font-medium text-slate-700' : 'min-w-0 truncate'}
            title={signature}
          >
            {signature}
          </span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(l.href);
              }}
              className="hover:text-slate-900"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
