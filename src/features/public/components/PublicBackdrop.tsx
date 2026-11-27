import * as React from 'react';
import { useThemeStore } from '../../../store/themeStore';
import { cn } from '../../../lib/utils';

export type BackdropVariant = 'home' | 'about' | 'how';

const PALETTES: Record<BackdropVariant, { glows: [string, string, string]; nodes: string[] }> = {
  home: { glows: ['120 101 245', '55 201 232', '155 120 255'], nodes: ['#9B78FF', '#37C9E8', '#7865F5'] },
  about: { glows: ['155 120 255', '245 185 66', '120 101 245'], nodes: ['#9B78FF', '#F5B942', '#B4A7F7'] },
  how: { glows: ['55 201 232', '54 211 153', '120 101 245'], nodes: ['#37C9E8', '#36D399', '#7865F5'] },
};

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
}

/**
 * The public site's living background: soft aurora light, a fine grid and a neural network of drifting
 * nodes that lean towards the pointer and link up near it. Drawn on one canvas behind the page.
 * It pauses when the tab is hidden and stays still for students who prefer reduced motion.
 */
export function PublicBackdrop({ variant = 'home', className }: { variant?: BackdropVariant; className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dark = useThemeStore((s) => s.resolved) === 'dark';
  const palette = PALETTES[variant];

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf = 0;

    const seed = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, Math.max(28, (w * h) / 18000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8,
        c: palette.nodes[i % palette.nodes.length],
      }));
    };

    const lineRGB = dark ? '180 167 247' : '105 87 232';
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const LINK = 130;
      for (const n of nodes) {
        if (!reduced) {
          // Lean gently towards the pointer, then drift on.
          if (pointer.active) {
            const dx = pointer.x - n.x;
            const dy = pointer.y - n.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 220 * 220) {
              n.vx += dx * 0.00003;
              n.vy += dy * 0.00003;
            }
          }
          n.vx *= 0.995;
          n.vy *= 0.995;
          n.vx += (Math.random() - 0.5) * 0.01;
          n.vy += (Math.random() - 0.5) * 0.01;
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            const near = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - a.x, pointer.y - a.y) / 240) : 0;
            const alpha = (1 - d / LINK) * ((dark ? 0.16 : 0.12) + near * 0.35);
            ctx.strokeStyle = `rgb(${lineRGB} / ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const near = pointer.active ? Math.max(0, 1 - Math.hypot(pointer.x - n.x, pointer.y - n.y) / 200) : 0;
        ctx.globalAlpha = (dark ? 0.55 : 0.45) + near * 0.45;
        ctx.fillStyle = n.c;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + near * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      draw();
      raf = window.requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => {
      window.cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = window.requestAnimationFrame(loop);
    };

    seed();
    if (reduced) draw();
    else raf = window.requestAnimationFrame(loop);
    window.addEventListener('resize', seed);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', seed);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dark, palette]);

  const [g1, g2, g3] = palette.glows;
  const glowA = dark ? 0.22 : 0.14;
  return (
    <div aria-hidden="true" className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}>
      <div
        className="absolute inset-0 animate-drift"
        style={{
          backgroundImage: `radial-gradient(900px 600px at 15% -10%, rgb(${g1} / ${glowA}), transparent 60%), radial-gradient(800px 560px at 95% 10%, rgb(${g2} / ${glowA * 0.8}), transparent 60%), radial-gradient(1000px 700px at 50% 120%, rgb(${g3} / ${glowA * 0.7}), transparent 65%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${dark ? 'rgb(255 255 255 / 0.035)' : 'rgb(24 32 51 / 0.045)'} 1px, transparent 1px), linear-gradient(90deg, ${dark ? 'rgb(255 255 255 / 0.035)' : 'rgb(24 32 51 / 0.045)'} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 75%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}

/** Pointer-tracking spotlight for cards: sets --mx/--my so a radial highlight follows the cursor. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const onPointerMove = React.useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
  return { ref, onPointerMove };
}
