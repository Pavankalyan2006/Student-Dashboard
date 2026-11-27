import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { cn } from '../../lib/utils';

/** Sun / moon switch. Click to flip; the choice is remembered on this device. */
export function ThemeToggle({ className, tone = 'default' }: { className?: string; tone?: 'default' | 'onDark' }) {
  const resolved = useThemeStore((s) => s.resolved);
  const toggle = useThemeStore((s) => s.toggle);
  const dark = resolved === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      data-testid="theme-toggle"
      className={cn(
        'relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border transition-colors',
        tone === 'onDark'
          ? 'border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ y: 14, rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
          exit={{ y: -14, rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="flex"
        >
          {dark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
