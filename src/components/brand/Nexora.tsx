import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * NEXORA AI brand system.
 *
 * The symbol is a geometric "N" drawn as a small neural graph: its four corners and the centre of the
 * diagonal are nodes, and a faint edge joins the two upper nodes so the letter reads as a connected network.
 * - NexoraMark variant="tile": white symbol on the brand-gradient tile (sidebar, favicon, app icon).
 * - NexoraMark variant="glyph": gradient-stroked symbol with no tile, for use on any surface.
 * - NexoraLogo: symbol + wordmark; tone adapts to light, dark or "auto" (follows the theme).
 * - NexoraLoader: the symbol drawing itself, for loading states.
 */

const N_PATH = 'M9.5 22.5V9.5L22.5 22.5V9.5';
const NODES: [number, number, number][] = [
  [9.5, 22.5, 1.9],
  [9.5, 9.5, 1.9],
  [16, 16, 1.55],
  [22.5, 22.5, 1.9],
  [22.5, 9.5, 1.9],
];

export function NexoraMark({
  className,
  variant = 'tile',
  title,
}: {
  className?: string;
  variant?: 'tile' | 'glyph';
  /** Accessible name; when omitted the mark is decorative. */
  title?: string;
}) {
  const id = React.useId().replace(/:/g, '');
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };

  if (variant === 'glyph') {
    return (
      <svg viewBox="0 0 32 32" className={cn('shrink-0', className)} fill="none" {...a11y}>
        <defs>
          <linearGradient id={`ng-${id}`} x1="6" y1="6" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7865F5" />
            <stop offset="0.55" stopColor="#9B78FF" />
            <stop offset="1" stopColor="#37C9E8" />
          </linearGradient>
        </defs>
        <path d="M9.5 9.5H22.5" stroke={`url(#ng-${id})`} strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="1.5 2.2" />
        <path d={N_PATH} stroke={`url(#ng-${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {NODES.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={`url(#ng-${id})`} />
        ))}
      </svg>
    );
  }

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[30%] shadow-[0_8px_20px_-8px_rgb(120_101_245_/_0.65)] ring-1 ring-inset ring-white/20',
        className
      )}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`nt-${id}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6957E8" />
            <stop offset="0.6" stopColor="#8B72F5" />
            <stop offset="1" stopColor="#37C9E8" />
          </linearGradient>
          <radialGradient id={`nh-${id}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(8 4) rotate(50) scale(26)">
            <stop stopColor="#fff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="32" height="32" fill={`url(#nt-${id})`} />
        <rect width="32" height="32" fill={`url(#nh-${id})`} />
        <path d="M9.5 9.5H22.5" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.1" strokeDasharray="1.5 2.2" />
        <path d={N_PATH} stroke="#fff" strokeWidth="2.9" strokeLinecap="round" strokeLinejoin="round" />
        {NODES.map(([cx, cy, r], i) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={i === 2 ? '#37C9E8' : '#fff'} stroke={i === 2 ? '#fff' : 'none'} strokeWidth="0.9" />
        ))}
      </svg>
    </span>
  );
}

export function NexoraLogo({
  className,
  markClassName,
  tone = 'auto',
  tagline = false,
  compact = false,
}: {
  className?: string;
  markClassName?: string;
  /** "light" = dark text for light surfaces, "dark" = white text for dark surfaces, "auto" follows the theme. */
  tone?: 'light' | 'dark' | 'auto';
  tagline?: boolean | string;
  /** Icon only (collapsed sidebar). */
  compact?: boolean;
}) {
  const ink = tone === 'dark' ? 'text-white' : tone === 'light' ? 'text-[#182033]' : 'text-slate-900';
  const sub = tone === 'dark' ? 'text-[#9CA8C2]' : tone === 'light' ? 'text-[#647089]' : 'text-slate-500';
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <NexoraMark className={cn('h-9 w-9', markClassName)} title={compact ? 'NEXORA AI' : undefined} />
      {!compact && (
        <span className="flex min-w-0 flex-col leading-none">
          <span className={cn('font-display text-[16px] font-extrabold tracking-[0.08em]', ink)}>
            NEXORA
            <span className="ml-1 bg-gradient-to-r from-[#8B72F5] to-[#37C9E8] bg-clip-text tracking-[0.04em] text-transparent">AI</span>
          </span>
          {tagline && (
            <span className={cn('mt-1 truncate text-[10.5px] font-medium tracking-wide', sub)}>
              {typeof tagline === 'string' ? tagline : 'Learn Smarter. Build Faster.'}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** The mark drawing itself. Use for route and app loading states. */
export function NexoraLoader({ label, className, size = 'md' }: { label?: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const id = React.useId().replace(/:/g, '');
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <svg viewBox="0 0 32 32" className={dim} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`nl-${id}`} x1="6" y1="6" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7865F5" />
            <stop offset="0.55" stopColor="#9B78FF" />
            <stop offset="1" stopColor="#37C9E8" />
          </linearGradient>
        </defs>
        <path d={N_PATH} stroke="currentColor" className="text-slate-200" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={N_PATH} className="nexora-loader-path" stroke={`url(#nl-${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {[NODES[1], NODES[0], NODES[4], NODES[3]].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} className="nexora-loader-node" cx={cx} cy={cy} r={r} fill={`url(#nl-${id})`} />
        ))}
      </svg>
      {label ? <p className="text-xs font-medium text-slate-500">{label}</p> : <span className="sr-only">Loading</span>}
    </div>
  );
}

/** AI "thinking" indicator: three breathing dots. */
export function AiThinking({ className, label = 'Thinking' }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-violet-500', className)} role="status" aria-label={label}>
      <span className="ai-thinking inline-flex items-center gap-1" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

export const BRAND = {
  name: 'NEXORA AI',
  tagline: 'Learn Smarter. Build Faster. Achieve More.',
  description:
    'A personalized AI-powered learning ecosystem for B.Tech students: tutoring, labs, academic planning, projects, research and career preparation in one workspace.',
} as const;
