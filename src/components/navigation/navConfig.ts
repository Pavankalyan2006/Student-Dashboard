import type * as React from 'react';
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
  Github,
  GitBranch,
  Briefcase,
  Mic,
  FileUser,
  Compass,
  GraduationCap,
  Users,
  TrendingUp,
  Award,
  Settings,
  User,
  Target,
  Timer,
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
  CalendarRange,
  ListChecks,
  Microscope,
  Search,
  Sparkles,
  Wrench,
  UsersRound,
  UserRound,
  BriefcaseBusiness,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isAi?: boolean;
  /** Other routes that should mark this item active (aliases and sub-pages under a different prefix). */
  match?: string[];
}

export interface NavSection {
  /** Stable key, also used to remember whether the group is expanded. */
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

/**
 * Student navigation, grouped by what the student is trying to do.
 * Every href is a real route in App.tsx; nothing here is a placeholder.
 * The retired pilot feedback page is intentionally absent.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    icon: LayoutDashboard,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Semester Command Center', href: '/semester-command-center', icon: CalendarRange, match: ['/semester'] },
      { name: 'Unified Progress', href: '/progress', icon: TrendingUp },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  {
    id: 'learn',
    title: 'Learn',
    icon: BookOpen,
    items: [
      { name: 'AI Tutor', href: '/ai-agent', icon: Bot, isAi: true, badge: 'AI', match: ['/ai-tutor'] },
      { name: 'Courses', href: '/courses', icon: BookOpen, match: ['/course'] },
      { name: 'Notes', href: '/notes', icon: FileText },
      { name: 'Documents', href: '/documents', icon: Files },
      { name: 'Doubt Solver', href: '/doubts', icon: HelpCircle, isAi: true },
      { name: 'Flashcards', href: '/flashcards', icon: Layers },
      { name: 'Study Planner', href: '/study-planner', icon: Calendar },
      { name: 'Language Learning', href: '/languages', icon: Languages },
    ],
  },
  {
    id: 'practice',
    title: 'Practice',
    icon: Code2,
    items: [
      { name: 'Coding Lab', href: '/coding', icon: Code2, match: ['/coding-lab', '/sandbox'] },
      { name: 'DSA Lab', href: '/dsa', icon: Binary, match: ['/dsa-lab'] },
      { name: 'SQL Lab', href: '/sql-lab', icon: Database },
      { name: 'Git Lab', href: '/git', icon: GitBranch, match: ['/git-lab'] },
      { name: 'System Design Lab', href: '/system-design', icon: Network },
    ],
  },
  {
    id: 'ai-labs',
    title: 'AI Labs',
    icon: Sparkles,
    items: [
      { name: 'AI/ML Lab', href: '/ml-lab', icon: Cpu, isAi: true },
      { name: 'Knowledge Base', href: '/knowledge', icon: Brain, isAi: true, badge: 'RAG' },
      { name: 'Lab Assistant', href: '/labs', icon: FlaskConical },
    ],
  },
  {
    id: 'assessments',
    title: 'Assessments',
    icon: ListChecks,
    items: [
      { name: 'Quiz', href: '/quiz', icon: ListChecks },
      { name: 'Exam Preparation', href: '/exams', icon: GraduationCap },
      { name: 'GATE Exam Preparation', href: '/assessment/gate-preparation', icon: BookOpenCheck, match: ['/gate'] },
      {
        name: 'Mock Interviews',
        href: '/mock-interviews',
        icon: Mic,
        isAi: true,
        match: ['/interviews', '/interview', '/mock-interview'],
      },
    ],
  },
  {
    id: 'career',
    title: 'Career',
    icon: BriefcaseBusiness,
    items: [
      { name: 'Career', href: '/career', icon: Compass },
      { name: 'Jobs Discovery', href: '/career/jobs', icon: Search, match: ['/jobs'] },
      { name: 'Resume', href: '/resume', icon: FileUser },
      { name: 'Internships / Applications', href: '/applications', icon: Briefcase },
      { name: 'Placement Preparation', href: '/placement', icon: Award, match: ['/placements'] },
    ],
  },
  {
    id: 'research',
    title: 'Projects & Research',
    icon: Microscope,
    items: [
      { name: 'Projects', href: '/projects', icon: Hammer },
      { name: 'Research', href: '/research', icon: Microscope },
      { name: 'GitHub', href: '/github', icon: Github },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    icon: UsersRound,
    items: [
      { name: 'Community Hub', href: '/community', icon: Users },
      { name: 'Q&A Forum', href: '/community/questions', icon: HelpCircle },
      { name: 'Discussions', href: '/community/discussions', icon: MessageSquare },
      { name: 'Shared Resources', href: '/community/resources', icon: Share2 },
    ],
  },
  {
    id: 'workspace',
    title: 'Personal Workspace',
    icon: UserRound,
    items: [
      { name: 'Student Profile', href: '/profile', icon: User },
      { name: 'Learning Goals', href: '/goals', icon: Target },
      { name: 'Focus Timer', href: '/focus', icon: Timer, match: ['/focus-timer'] },
      { name: 'Connected Platforms', href: '/integrations', icon: Link2 },
      { name: 'External Profiles', href: '/profile/external', icon: ExternalLink },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Wrench,
    items: [{ name: 'Settings', href: '/profile/settings', icon: Settings, match: ['/settings'] }],
  },
];

/** Every nav item, flattened. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + '/');
}

/**
 * Picks the single nav item for a path: the longest matching href or alias wins, so
 * /community/questions highlights "Q&A Forum" and not also "Community Hub".
 */
export function findActiveNavItem(path: string): NavItem | undefined {
  const clean = (path.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';
  const target = clean === '/' ? '/dashboard' : clean;
  let best: { item: NavItem; len: number } | undefined;
  for (const item of ALL_NAV_ITEMS) {
    for (const prefix of [item.href, ...(item.match ?? [])]) {
      if (matchesPrefix(target, prefix) && (!best || prefix.length > best.len)) {
        best = { item, len: prefix.length };
      }
    }
  }
  return best?.item;
}

export function findSectionForItem(item: NavItem | undefined): NavSection | undefined {
  if (!item) return undefined;
  return NAV_SECTIONS.find((s) => s.items.includes(item));
}

export interface NavPageMatch {
  item: NavItem;
  section: NavSection;
  score: number;
}

/**
 * Finds sidebar pages for the command palette. Matches the page name, its group name and the words in
 * its URL; a name that starts with the query ranks first. Pure and synchronous, so it needs no request.
 */
export function searchNavPages(query: string, limit = 6): NavPageMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: NavPageMatch[] = [];
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      const name = item.name.toLowerCase();
      const words = `${name} ${section.title.toLowerCase()} ${item.href.replace(/[/-]/g, ' ')}`;
      let score = 0;
      if (name.startsWith(q)) score = 3;
      else if (name.split(/\s+/).some((w) => w.startsWith(q))) score = 2;
      else if (words.includes(q)) score = 1;
      if (score) out.push({ item, section, score });
    }
  }
  return out.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).slice(0, limit);
}

/** The nav item whose href is exactly this path, if any. */
export function navItemByHref(href: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find((i) => i.href === href);
}
