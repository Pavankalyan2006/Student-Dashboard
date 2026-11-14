import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { ALL_NAV_ITEMS } from '../components/navigation/navConfig';
import { resolveRetiredRoute, RETIRED_ROUTES } from '../lib/retiredRoutes';
import { footerSignature, registeredStudentName, initialsFor } from '../components/layout/studentName';

const src = (p: string) => readFileSync(path.resolve(__dirname, '..', p), 'utf8');

describe('Pilot feedback page is retired from the student app', () => {
  it('is not in navigation', () => {
    expect(ALL_NAV_ITEMS.some((i) => /feedback/i.test(i.href) || /feedback/i.test(i.name))).toBe(false);
  });

  it('has no page component or route left in the app', () => {
    expect(existsSync(path.resolve(__dirname, '../features/feedback/pages/PilotFeedbackPage.tsx'))).toBe(false);
    expect(src('App.tsx')).not.toMatch(/PilotFeedbackPage/);
    expect(src('features/profile/pages/ProfileSettingsPage.tsx')).not.toMatch(/pilot-feedback/);
  });

  it('sends old links to the dashboard instead of a dead page', () => {
    expect(resolveRetiredRoute('/pilot-feedback')).toBe('/dashboard');
    expect(resolveRetiredRoute('/pilot-feedback/')).toBe('/dashboard');
    expect(resolveRetiredRoute('/pilot-feedback?x=1')).toBe('/dashboard');
    expect(resolveRetiredRoute('/feedback')).toBe('/dashboard');
    expect(resolveRetiredRoute('/courses?tab=mine')).toBe('/courses?tab=mine');
    expect(Object.values(RETIRED_ROUTES).every((t) => ALL_NAV_ITEMS.some((i) => i.href === t))).toBe(true);
  });
});

describe('Footer shows the signed-in student, never a phase label', () => {
  it('uses the registered name of the authenticated student', () => {
    expect(footerSignature({ id: 'std_1', name: 'Pavan Kalyan' }, true)).toBe('Designed for Pavan Kalyan');
    expect(footerSignature({ id: 'std_1', name: '  Asha   Rao ' }, true)).toBe('Designed for Asha Rao');
    expect(registeredStudentName({ id: 'std_1', full_name: 'Meera N' }, true)).toBe('Meera N');
  });

  it('falls back to a neutral line when signed out or the name is missing', () => {
    expect(footerSignature({ id: 'std_1', name: 'Pavan Kalyan' }, false)).toBe('Your personal learning workspace');
    expect(footerSignature(null, true)).toBe('Your personal learning workspace');
    expect(footerSignature({ id: 'std_1', name: '' }, true)).toBe('Your personal learning workspace');
    expect(footerSignature({ name: 'No Id' }, true)).toBe('Your personal learning workspace');
  });

  it('reflects a profile name change immediately (pure function of the auth record)', () => {
    const student = { id: 'std_1', name: 'Old Name' };
    expect(footerSignature(student, true)).toBe('Designed for Old Name');
    student.name = 'New Name';
    expect(footerSignature(student, true)).toBe('Designed for New Name');
  });

  it('makes initials from first and last name', () => {
    expect(initialsFor('Pavan Kalyan')).toBe('PK');
    expect(initialsFor('Asha')).toBe('AS');
    expect(initialsFor(undefined)).toBe('ST');
  });

  it('removes the old phase label and internal status labels from the shell', () => {
    for (const f of [
      'components/navigation/Sidebar.tsx',
      'components/layout/AppShell.tsx',
      'components/layout/AppFooter.tsx',
      'components/layout/PageComponents.tsx',
      'pages/ModulePlaceholderPage.tsx',
    ]) {
      const s = src(f);
      expect(s, f).not.toMatch(/Phase 1 Foundation/);
      expect(s, f).not.toMatch(/foundation_verified|Schema verified|Scheduled for Phase/);
    }
    expect(src('components/layout/AppShell.tsx')).toMatch(/<AppFooter/);
    // The footer reads the name from the auth store (backend record), not from storage.
    const footer = src('components/layout/AppFooter.tsx') + src('components/layout/studentName.ts');
    expect(footer).toMatch(/useAuth\(\)/);
    expect(footer).not.toMatch(/localStorage\.getItem|sessionStorage\.getItem/);
  });
});
