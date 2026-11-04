import * as React from 'react';
import {
  Sparkles,
  BookOpen,
  Code2,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  Menu,
  X,
  Compass,
  Cpu,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';

interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function PublicLayout({ currentPath, onNavigate, children }: PublicLayoutProps) {
  const { isAuthenticated, student } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#101828] font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E4E7EC] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-[#101828]">
                  B.Tech AI Learning
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200/60 uppercase tracking-wider">
                  Student Platform
                </span>
              </div>
              <p className="text-[11px] text-[#667085] hidden sm:block">
                Academic & Practical Engineering OS
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] font-semibold'
                      : 'text-[#475467] hover:text-[#101828] hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => onNavigate('/dashboard')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('/login')}
                  className="text-[#475467] hover:text-[#101828] text-xs font-semibold px-3 py-2 cursor-pointer"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => onNavigate('/register')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#475467] hover:text-[#101828] hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4E7EC] bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(link.path);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPath === link.path
                      ? 'bg-blue-50 text-[#2563EB] font-bold'
                      : 'text-[#475467] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/dashboard');
                  }}
                  className="w-full bg-[#2563EB] text-white text-sm font-semibold justify-center"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/login');
                    }}
                    className="w-full justify-center text-sm font-semibold"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/register');
                    }}
                    className="w-full bg-[#2563EB] text-white text-sm font-semibold justify-center"
                  >
                    Get Started (Sign Up)
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="bg-[#0B1530] text-white border-t border-slate-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Platform Identity */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">B.Tech AI Learning Platform</h3>
                  <p className="text-xs text-slate-400">Student-Centric Engineering Operating System</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Engineered specifically for undergraduate B.Tech students. Unifying university syllabus
                mastery, isolated coding & SQL sandboxes, AI tutoring, spaced revision, and tier-1 placement preparation.
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Strict Student Isolation • Zero Mock Data • Real Persistence</span>
              </div>
            </div>

            {/* Academic Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic OS</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <button onClick={() => onNavigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
                    Personalized Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/semester-command-center')} className="hover:text-white transition-colors cursor-pointer">
                    Semester Command Center
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/ai-tutor')} className="hover:text-white transition-colors cursor-pointer">
                    AI Tutor & Doubt Solver
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/courses')} className="hover:text-white transition-colors cursor-pointer">
                    Courses & Lessons
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/notes')} className="hover:text-white transition-colors cursor-pointer">
                    AI Notes & Flashcards
                  </button>
                </li>
              </ul>
            </div>

            {/* Practical Laboratories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Practical Labs</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <button onClick={() => onNavigate('/coding')} className="hover:text-white transition-colors cursor-pointer">
                    Coding Practice Lab
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/dsa')} className="hover:text-white transition-colors cursor-pointer">
                    DSA Algorithm Lab
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/sql-lab')} className="hover:text-white transition-colors cursor-pointer">
                    SQL Sandboxed Lab
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/ml-lab')} className="hover:text-white transition-colors cursor-pointer">
                    AI / ML Laboratory
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/system-design')} className="hover:text-white transition-colors cursor-pointer">
                    System Design Lab
                  </button>
                </li>
              </ul>
            </div>

            {/* Career & Community */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Career & Community</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <button onClick={() => onNavigate('/placements')} className="hover:text-white transition-colors cursor-pointer">
                    Placement Preparation
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/resume')} className="hover:text-white transition-colors cursor-pointer">
                    AI Resume Builder
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/mock-interviews')} className="hover:text-white transition-colors cursor-pointer">
                    Mock Interview Simulator
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/projects')} className="hover:text-white transition-colors cursor-pointer">
                    Engineering Projects
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('/community')} className="hover:text-white transition-colors cursor-pointer">
                    Student Community Hub
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} B.Tech AI Learning Platform. All rights reserved. Dedicated to engineering student excellence.</p>
            <div className="flex items-center gap-6">
              <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">About</button>
              <button onClick={() => onNavigate('/how-it-works')} className="hover:text-white transition-colors">How It Works</button>
              <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">Student Sign In</button>
              <button onClick={() => onNavigate('/register')} className="hover:text-white transition-colors">Register</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
