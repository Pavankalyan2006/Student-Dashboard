import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { NAV_SECTIONS, ALL_NAV_ITEMS, findActiveNavItem, findSectionForItem } from '../components/navigation/navConfig';
import { buildBreadcrumbs } from '../components/navigation/Topbar';
import { MODULE_REGISTRY } from '../pages/ModulePlaceholderPage';

const appSource = readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf8');

describe('Navigation & shell', () => {
  it('groups modules into the redesign categories', () => {
    expect(NAV_SECTIONS.map((s) => s.title)).toEqual([
      'Home',
      'Academics',
      'AI Workspace',
      'Learn',
      'Code Labs',
      'Labs & Experiments',
      'Assessments',
      'Projects & Research',
      'Career',
      'Community',
      'You',
      'Settings',
    ]);
  });

  it('keeps every primary student module in the sidebar', () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    for (const href of [
      '/dashboard', '/semester-command-center', '/ai-agent', '/courses', '/notes', '/documents', '/doubts',
      '/flashcards', '/study-planner', '/languages', '/coding', '/dsa', '/sql-lab', '/ml-lab', '/system-design',
      '/git', '/labs', '/quiz', '/exams', '/mock-interviews', '/assessment/gate-preparation', '/projects', '/github',
      '/research', '/knowledge', '/career', '/resume', '/applications', '/placement', '/integrations',
      '/profile/external', '/career/jobs', '/community', '/community/questions', '/community/discussions',
      '/community/resources', '/progress', '/goals', '/profile', '/notifications', '/profile/settings',
    ]) {
      expect(hrefs).toContain(href);
    }
  });

  it('lists each destination once (no duplicate Mock Interviews entries)', () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(ALL_NAV_ITEMS.filter((i) => i.name === 'Mock Interviews')).toHaveLength(1);
  });

  it('points every nav item at a route that App.tsx actually renders', () => {
    for (const item of ALL_NAV_ITEMS) {
      expect(appSource.includes(`'${item.href}'`), `${item.href} has no route`).toBe(true);
    }
  });

  it('keeps GATE in Assessments and Placement Preparation in Career', () => {
    const assessments = NAV_SECTIONS.find((s) => s.id === 'assessments')!;
    expect(assessments.items.map((i) => i.href)).toContain('/assessment/gate-preparation');
    expect(assessments.items.map((i) => i.name)).not.toContain('Placement Preparation');
    const career = NAV_SECTIONS.find((s) => s.id === 'career')!;
    expect(career.items.map((i) => i.href)).toContain('/placement');
  });

  it('highlights exactly one item, preferring the most specific route', () => {
    expect(findActiveNavItem('/community/questions')?.name).toBe('Q&A Forum');
    expect(findActiveNavItem('/community')?.name).toBe('Community Hub');
    expect(findActiveNavItem('/community/topics/abc')?.name).toBe('Community Hub');
    expect(findActiveNavItem('/profile/settings')?.name).toBe('Settings');
    expect(findActiveNavItem('/profile/external')?.name).toBe('External Profiles');
    expect(findActiveNavItem('/profile/edit')?.name).toBe('Student Profile');
    expect(findActiveNavItem('/career/jobs')?.name).toBe('Jobs Discovery');
    expect(findActiveNavItem('/interviews/setup')?.name).toBe('Mock Interviews');
    expect(findActiveNavItem('/semester/subjects')?.name).toBe('Semester Command Center');
    expect(findActiveNavItem('/')?.name).toBe('Dashboard');
    expect(findSectionForItem(findActiveNavItem('/sql-lab'))?.title).toBe('Code Labs');
    expect(findActiveNavItem('/viva')?.href).toBe('/labs');
    expect(findActiveNavItem('/sandbox')?.href).toBe('/coding');
  });

  it('builds readable breadcrumbs from the nav structure', () => {
    expect(buildBreadcrumbs('/dashboard').map((c) => c.label)).toEqual(['Home', 'Dashboard']);
    expect(buildBreadcrumbs('/community/questions').map((c) => c.label)).toEqual(['Community', 'Q&A Forum']);
    const deep = buildBreadcrumbs('/courses/course_ab12cd34ef/learn');
    expect(deep.map((c) => c.label)).toEqual(['Learn', 'Courses', 'Learn']);
    expect(deep[1].href).toBe('/courses');
  });

  it('keeps module registry data for remaining placeholder routes', () => {
    expect(MODULE_REGISTRY['/courses'].phaseNumber).toBe(4);
    expect(MODULE_REGISTRY['/assessment/gate-preparation'].phaseNumber).toBe(15);
  });
});
