import * as React from 'react';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  FileText,
  Files,
  HelpCircle,
  Binary,
  Code2,
  Hammer,
  FolderGit2,
  Github,
  Briefcase,
  Mic,
  FileUser,
  Compass,
  GraduationCap,
  Users,
  TrendingUp,
  Bookmark,
  Award,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  User,
  Target,
  MessageSquare,
  Share2,
  Bell,
  Calendar,
  Layers,
  Database,
  Cpu,
  Network,
  FlaskConical,
  Brain,
  Link2,
  ExternalLink,
  BookOpenCheck,
  Languages,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUiStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isAi?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'LEARNING',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Semester Command Center', href: '/semester-command-center', icon: GraduationCap, badge: 'Command' },
      { name: 'AI Tutor', href: '/ai-agent', icon: Bot, isAi: true, badge: 'Agent' },
      { name: 'Courses', href: '/courses', icon: BookOpen },
      { name: 'Notes', href: '/notes', icon: FileText },
      { name: 'Documents', href: '/documents', icon: Files },
      { name: 'Doubt Solver', href: '/doubts', icon: HelpCircle, badge: 'AI' },
      { name: 'Flashcards', href: '/flashcards', icon: Layers, badge: 'Spaced' },
      { name: 'Study Planner', href: '/study-planner', icon: Calendar, badge: 'AI' },
      { name: 'Language Learning', href: '/languages', icon: Languages, badge: '150+' },
    ],
  },
  {
    title: 'PRACTICE LABS',
    items: [
      { name: 'Coding Lab', href: '/coding', icon: Code2 },
      { name: 'DSA Lab', href: '/dsa', icon: Binary },
      { name: 'SQL Lab', href: '/sql-lab', icon: Database, badge: 'Sandbox' },
      { name: 'AI/ML Lab', href: '/ml-lab', icon: Cpu, badge: 'ML' },
      { name: 'System Design Lab', href: '/system-design', icon: Network },
      { name: 'Lab Assistant', href: '/labs', icon: FlaskConical, badge: 'Viva' },
    ],
  },
  {
    title: 'ASSESSMENT',
    items: [
      { name: 'Quiz', href: '/quiz', icon: HelpCircle },
      { name: 'Exam Preparation', href: '/exams', icon: GraduationCap, badge: 'Prep' },
      { name: 'Mock Interviews', href: '/interviews', icon: Mic },
      { name: 'GATE Exam Preparation', href: '/assessment/gate-preparation', icon: BookOpenCheck, badge: 'GATE' },
    ],
  },
  {
    title: 'PROJECT & RESEARCH',
    items: [
      { name: 'Projects', href: '/projects', icon: Hammer },
      { name: 'GitHub', href: '/github', icon: Github, badge: 'Git' },
      { name: 'Research', href: '/research', icon: GraduationCap, badge: 'AI' },
      { name: 'Knowledge Base', href: '/knowledge', icon: Brain, badge: 'RAG' },
    ],
  },
  {
    title: 'CAREER & EXTERNAL PLATFORMS',
    items: [
      { name: 'Career', href: '/career', icon: Compass },
      { name: 'Resume', href: '/resume', icon: FileUser },
      { name: 'Mock Interviews', href: '/mock-interviews', icon: Mic, badge: 'AI' },
      { name: 'Internships / Applications', href: '/applications', icon: Briefcase, badge: 'Tracker' },
      { name: 'Placement Preparation', href: '/placement', icon: Award },
      { name: 'Connected Platforms', href: '/integrations', icon: Link2, badge: 'Sync' },
      { name: 'External Profiles', href: '/profile/external', icon: ExternalLink, badge: 'Verified' },
      { name: 'Jobs Discovery', href: '/career/jobs', icon: Briefcase, badge: 'AI' },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { name: 'Community Hub', href: '/community', icon: Users },
      { name: 'Q&A Forum', href: '/community/questions', icon: HelpCircle },
      { name: 'Discussions', href: '/community/discussions', icon: MessageSquare },
      { name: 'Shared Resources', href: '/community/resources', icon: Share2 },
    ],
  },
  {
    title: 'PROFILE',
    items: [
      { name: 'Unified Progress', href: '/progress', icon: TrendingUp },
      { name: 'Learning Goals', href: '/goals', icon: Target },
      { name: 'Student Profile', href: '/profile', icon: User },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Settings', href: '/profile/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const { sidebarCollapsed, toggleSidebar, mobileDrawerOpen, setMobileDrawerOpen } = useUiStore();

  const handleItemClick = (href: string) => {
    onNavigate(href);
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0B1530] text-[#94A3B8] transition-all duration-300 ease-in-out border-r border-[#1E2E55]',
          // Desktop sizing
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          // Mobile drawer sizing & translation
          mobileDrawerOpen
            ? 'w-[280px] translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#1E2E55] bg-[#081024]">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleItemClick('/dashboard')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            {(!sidebarCollapsed || mobileDrawerOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-white truncate">
                  B.Tech AI Platform
                </span>
                <span className="text-[11px] font-medium text-[#4F46E5] truncate">
                  Learning Workspace
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden cursor-pointer"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 sidebar-scroll">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {(!sidebarCollapsed || mobileDrawerOpen) && (
                <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  {section.title}
                </h4>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href));

                  return (
                    <button
                      key={item.href}
                      onClick={() => handleItemClick(item.href)}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left',
                        isActive
                          ? 'bg-[#1C2E5D] text-white shadow-xs font-semibold'
                          : 'text-[#94A3B8] hover:bg-[#132247] hover:text-white',
                        sidebarCollapsed && !mobileDrawerOpen ? 'justify-center px-0' : ''
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-[#38BDF8]' : item.isAi ? 'text-[#818CF8]' : 'text-slate-400'
                        )}
                      />
                      {(!sidebarCollapsed || mobileDrawerOpen) && (
                        <span className="truncate flex-1">{item.name}</span>
                      )}
                      {(!sidebarCollapsed || mobileDrawerOpen) && item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                            item.isAi ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60' : 'bg-slate-800 text-slate-300'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Collapse toggle for desktop */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-[#1E2E55] bg-[#081024]">
          {(!sidebarCollapsed) && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="truncate">Phase 1 Foundation</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2E55] transition-colors cursor-pointer',
              sidebarCollapsed ? 'mx-auto' : ''
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
