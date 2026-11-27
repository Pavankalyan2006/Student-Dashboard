import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { ThemeToggle } from '../../../components/navigation/ThemeToggle';
import { NexoraLogo, NexoraMark } from '../../../components/brand/Nexora';
import { ScrollProgress } from '../../../components/motion';
import { PublicBackdrop, type BackdropVariant } from './PublicBackdrop';
import { cn } from '../../../lib/utils';

interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
  /** Which colour mood the living background uses. Defaults to the page's own. */
  backdrop?: BackdropVariant;
}

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'How it works', path: '/how-it-works' },
];

function variantFor(path: string): BackdropVariant {
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/how-it-works')) return 'how';
  return 'home';
}

/** A link styled as a button that still opens in a new tab with Ctrl/Cmd-click. */
function NavAnchor({
  href,
  onNavigate,
  className,
  children,
  onClick,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; onNavigate: (p: string) => void }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate(href);
      }}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

export function PublicLayout({ currentPath, onNavigate, children, backdrop }: PublicLayoutProps) {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const active = currentPath === '/home' ? '/' : currentPath;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const go = (p: string) => {
    setMobileMenuOpen(false);
    onNavigate(p);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--surface-0)] font-sans text-slate-900">
      <PublicBackdrop variant={backdrop ?? variantFor(active)} />
      <ScrollProgress />

      <header
        className={cn(
          'sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
          scrolled ? 'glass-bar shadow-[0_8px_30px_-20px_rgb(8_11_22_/_0.5)]' : 'border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavAnchor href="/" onNavigate={go} className="group flex items-center rounded-lg" aria-label="NEXORA AI home">
            <NexoraLogo
              tone="auto"
              tagline="Learn Smarter. Build Faster. Achieve More."
              markClassName="h-9 w-9 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
            />
          </NavAnchor>

          <nav aria-label="Site" className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/50 p-1 backdrop-blur md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.path;
              return (
                <NavAnchor
                  key={link.path}
                  href={link.path}
                  onNavigate={go}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="public-nav-pill"
                      className="absolute inset-0 rounded-full bg-brand-gradient shadow-[0_6px_16px_-8px_rgb(120_101_245_/_0.9)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </NavAnchor>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <ThemeToggle />
            {isAuthenticated ? (
              <button type="button" onClick={() => go('/dashboard')} className="press inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgb(120_101_245_/_0.9)] hover:brightness-110">
                Open my workspace <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button type="button" onClick={() => go('/login')} className="press rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900">
                  Sign in
                </button>
                <button type="button" onClick={() => go('/register')} className="press inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_20px_-10px_rgb(120_101_245_/_0.9)] hover:brightness-110">
                  Start free <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="glass-panel overflow-hidden border-x-0 md:hidden"
            >
              <nav aria-label="Site" className="flex flex-col gap-1 px-4 pb-4 pt-2">
                {NAV_LINKS.map((link) => (
                  <NavAnchor
                    key={link.path}
                    href={link.path}
                    onNavigate={go}
                    className={cn(
                      'rounded-xl px-3 py-2.5 text-[15px] font-medium',
                      active === link.path ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {link.label}
                  </NavAnchor>
                ))}
                <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3">
                  {isAuthenticated ? (
                    <button type="button" onClick={() => go('/dashboard')} className="rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-white">
                      Open my workspace
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => go('/register')} className="rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-white">
                        Start free
                      </button>
                      <button type="button" onClick={() => go('/login')} className="rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800">
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 border-t border-slate-200/70 bg-white/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="space-y-4">
              <NexoraLogo tone="auto" tagline />
              <p className="max-w-xs text-sm leading-relaxed text-slate-600">
                A personal AI learning companion for B.Tech students: your syllabus, your labs, your plans and your career, in one calm workspace.
              </p>
            </div>
            <FooterColumn
              title="Explore"
              links={[
                ['Home', '/'],
                ['About NEXORA', '/about'],
                ['How it works', '/how-it-works'],
              ]}
              onNavigate={go}
            />
            <FooterColumn
              title="Get going"
              links={
                isAuthenticated
                  ? [['Open my workspace', '/dashboard']]
                  : [
                      ['Create your account', '/register'],
                      ['Sign in', '/login'],
                    ]
              }
              onNavigate={go}
            />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Our promises</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li>Student-only. No faculty views.</li>
                <li>Your data stays yours.</li>
                <li>Honest numbers, never invented ones.</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span className="flex items-center gap-2">
              <NexoraMark className="h-5 w-5" /> © {new Date().getFullYear()} NEXORA AI
            </span>
            <span>Learn Smarter. Build Faster. Achieve More.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links, onNavigate }: { title: string; links: [string, string][]; onNavigate: (p: string) => void }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <NavAnchor href={href} onNavigate={onNavigate} className="group inline-flex items-center gap-1 text-sm text-slate-700 hover:text-blue-700">
              {label}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </NavAnchor>
          </li>
        ))}
      </ul>
    </div>
  );
}
