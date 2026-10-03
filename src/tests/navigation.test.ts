import { describe, it, expect } from 'vitest';
import { NAV_SECTIONS } from '../components/navigation/Sidebar';
import { MODULE_REGISTRY } from '../pages/ModulePlaceholderPage';

describe('Navigation & Shell Route Foundation', () => {
  it('contains all required B.Tech platform sidebar sections', () => {
    const titles = NAV_SECTIONS.map((s) => s.title);
    expect(titles).toContain('HOME');
    expect(titles).toContain('AI');
    expect(titles).toContain('LEARN');
    expect(titles).toContain('BUILD');
    expect(titles).toContain('CAREER');
    expect(titles).toContain('RESEARCH');
    expect(titles).toContain('COMMUNITY');
    expect(titles).toContain('STUDENT');
    expect(titles).toContain('SETTINGS');
  });

  it('maps all primary student routes in the sidebar', () => {
    const allHrefs = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
    expect(allHrefs).toContain('/dashboard');
    expect(allHrefs).toContain('/ai-agent');
    expect(allHrefs).toContain('/courses');
    expect(allHrefs).toContain('/notes');
    expect(allHrefs).toContain('/documents');
    expect(allHrefs).toContain('/quiz');
    expect(allHrefs).toContain('/dsa');
    expect(allHrefs).toContain('/coding');
    expect(allHrefs).toContain('/projects');
    expect(allHrefs).toContain('/placement');
  });

  it('provides rich placeholder configurations for all future roadmap modules', () => {
    expect(MODULE_REGISTRY['/courses'].phaseNumber).toBe(4);
    expect(MODULE_REGISTRY['/dsa'].phaseNumber).toBe(8);
    expect(MODULE_REGISTRY['/placement'].phaseNumber).toBe(11);
  });
});
