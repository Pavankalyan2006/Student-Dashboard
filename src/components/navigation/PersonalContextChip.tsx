import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BrainCircuit, PencilLine, Bot } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { findActiveNavItem } from './navConfig';

interface AiContextSummary {
  module: string;
  lines: string[];
}

/**
 * Shows the student what the AI assistant knows about them on this page: the same lines every AI
 * feature here receives, built from their own profile and activity. Lets them correct it in one click.
 */
export function PersonalContextChip({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const page = (findActiveNavItem(currentPath)?.href ?? currentPath.split(/[?#]/)[0]) || '/';
  const { data, isLoading, isError } = useQuery({
    // 'profile-context' is invalidated whenever the profile is saved, so this follows edits immediately.
    queryKey: ['profile-context', 'ai-summary', page],
    queryFn: () => apiClient.get<AiContextSummary>(`/profile/me/ai-context?page=${encodeURIComponent(page)}`),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  if (!isAuthenticated) return null;
  const lines = data?.lines ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="personal-context-chip"
          aria-label="What the AI assistant knows about you"
          className="hidden items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[12px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 xl:inline-flex"
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          Personalised
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="border-b border-slate-100 p-3.5">
          <p className="text-[13px] font-semibold text-slate-900">Your AI assistant on this page knows</p>
          <p className="mt-0.5 text-[11px] text-slate-500">From your profile and activity. Every AI answer here uses it; nothing else is assumed.</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-3.5" data-testid="personal-context-lines">
          {isLoading ? (
            <p className="text-xs text-slate-500">Loading…</p>
          ) : isError ? (
            <p className="text-xs text-red-600">Could not load your context.</p>
          ) : lines.length === 0 ? (
            <p className="text-xs text-slate-600">Nothing yet. Add your subjects, skills and goals to your profile so answers fit you.</p>
          ) : (
            <ul className="space-y-1.5">
              {lines.map((l) => {
                const i = l.indexOf(':');
                return (
                  <li key={l} className="text-xs leading-relaxed text-slate-700">
                    {i > 0 ? (
                      <>
                        <span className="font-semibold text-slate-900">{l.slice(0, i)}:</span>
                        {l.slice(i + 1)}
                      </>
                    ) : (
                      l
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="p-1">
          <DropdownMenuItem onSelect={() => onNavigate('/profile/edit')}>
            <PencilLine className="mr-2 h-3.5 w-3.5" /> Update my profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onNavigate('/ai-agent')}>
            <Bot className="mr-2 h-3.5 w-3.5" /> Ask my AI tutor
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
