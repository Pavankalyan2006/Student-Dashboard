import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Original NEXORA AI illustrations, drawn in SVG so they follow the theme and stay crisp.
 * They use currentColor-free brand hues at low opacity, so they read on light and dark cards alike.
 */

/** Empty-state art: an orbit of connected nodes around a soft core, with the slot for an icon in the middle. */
export function EmptyOrbit({ className, children }: { className?: string; children?: React.ReactNode }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <div className={cn('relative flex h-24 w-24 items-center justify-center', className)}>
      <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id={`eo-core-${id}`} cx="48" cy="48" r="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B72F5" stopOpacity="0.22" />
            <stop offset="1" stopColor="#8B72F5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`eo-ring-${id}`} x1="10" y1="10" x2="86" y2="86" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7865F5" stopOpacity="0.55" />
            <stop offset="1" stopColor="#37C9E8" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="30" fill={`url(#eo-core-${id})`} />
        <circle cx="48" cy="48" r="38" stroke={`url(#eo-ring-${id})`} strokeWidth="1" strokeDasharray="2 4" />
        <circle cx="48" cy="48" r="26" stroke={`url(#eo-ring-${id})`} strokeOpacity="0.5" strokeWidth="0.8" />
        <g className="origin-center motion-safe:animate-[spin_28s_linear_infinite]" style={{ transformOrigin: '48px 48px' }}>
          <path d="M48 10L81 29M81 29L81 67M15 67L48 86" stroke="#8B72F5" strokeOpacity="0.28" strokeWidth="0.8" />
          <circle cx="48" cy="10" r="3" fill="#7865F5" />
          <circle cx="81" cy="29" r="2.4" fill="#37C9E8" />
          <circle cx="81" cy="67" r="2" fill="#9B78FF" />
          <circle cx="48" cy="86" r="2.6" fill="#37C9E8" fillOpacity="0.8" />
          <circle cx="15" cy="67" r="2.2" fill="#7865F5" fillOpacity="0.8" />
          <circle cx="15" cy="29" r="1.6" fill="#9B78FF" fillOpacity="0.7" />
        </g>
      </svg>
      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm [&_svg]:h-5 [&_svg]:w-5">
        {children}
      </span>
    </div>
  );
}

/** Decorative constellation for dark hero banners. Purely visual; hidden from assistive tech. */
export function HeroConstellation({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 220" className={cn('pointer-events-none', className)} fill="none" aria-hidden="true">
      <g stroke="#B4A7F7" strokeOpacity="0.22" strokeWidth="1">
        <path d="M30 170L110 120L190 150L260 70L340 110L400 40" />
        <path d="M110 120L150 50L260 70M190 150L240 200L340 110M150 50L60 60L30 170" />
      </g>
      <g>
        {[
          [30, 170, 3],
          [110, 120, 4],
          [190, 150, 3.2],
          [260, 70, 5],
          [340, 110, 3.6],
          [400, 40, 3],
          [150, 50, 3],
          [240, 200, 2.6],
          [60, 60, 2.4],
        ].map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={i % 3 === 0 ? '#37C9E8' : i % 3 === 1 ? '#9B78FF' : '#F4F5FF'}
            fillOpacity={i % 3 === 2 ? 0.7 : 0.9}
            className="motion-safe:animate-pulse"
            style={{ animationDelay: `${i * 0.35}s`, animationDuration: '3.6s' }}
          />
        ))}
      </g>
    </svg>
  );
}

/** Small learning illustration (open book + code bracket + spark) for onboarding and welcome states. */
export function LearnBuildArt({ className }: { className?: string }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 160 120" className={cn('pointer-events-none', className)} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`lb-${id}`} x1="20" y1="20" x2="140" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7865F5" />
          <stop offset="0.6" stopColor="#9B78FF" />
          <stop offset="1" stopColor="#37C9E8" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="104" rx="56" ry="8" fill="#7865F5" fillOpacity="0.1" />
      <path d="M24 34c18-6 34-6 52 4v58c-18-10-34-10-52-4z" fill="#7865F5" fillOpacity="0.12" stroke={`url(#lb-${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M136 34c-18-6-34-6-52 4v58c18-10 34-10 52-4z" fill="#37C9E8" fillOpacity="0.1" stroke={`url(#lb-${id})`} strokeWidth="2" strokeLinejoin="round" />
      <path d="M36 50h26M36 60h20M36 70h24" stroke="#7865F5" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      <path d="M102 52l-8 10 8 10M116 52l8 10-8 10" stroke="#37C9E8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80 6l2.6 6.4L89 15l-6.4 2.6L80 24l-2.6-6.4L71 15l6.4-2.6z" fill={`url(#lb-${id})`} />
    </svg>
  );
}
