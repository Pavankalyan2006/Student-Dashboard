import { describe, it, expect } from 'vitest';
import { NAV_SECTIONS } from '../components/navigation/Sidebar';
import { MODULE_REGISTRY } from '../pages/ModulePlaceholderPage';

describe('Navigation & Shell Route Foundation', () => {
  it('contains all required B.Tech platform sidebar sections', () => {
    const titles = NAV_SECTIONS.map((s) => s.title);
    expect(titles).toContain('LEARNING');
    expect(titles).toContain('PRACTICE LABS');
    expect(titles).toContain('ASSESSMENT');
    expect(titles).toContain('PROJECT & RESEARCH');
    expect(titles).toContain('CAREER & EXTERNAL PLATFORMS');
    expect(titles).toContain('COMMUNITY');
    expect(titles).toContain('PROFILE');
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
    expect(allHrefs).toContain('/assessment/gate-preparation');
  });

  it('replaces Placement Preparation with GATE Exam Preparation in ASSESSMENT while preserving it in CAREER', () => {
    const assessmentSection = NAV_SECTIONS.find((s) => s.title === 'ASSESSMENT');
    expect(assessmentSection).toBeDefined();
    const assessmentItemNames = assessmentSection!.items.map((i) => i.name);
    const assessmentItemHrefs = assessmentSection!.items.map((i) => i.href);

    expect(assessmentItemNames).toContain('GATE Exam Preparation');
    expect(assessmentItemHrefs).toContain('/assessment/gate-preparation');
    expect(assessmentItemNames).not.toContain('Placement Preparation');

    const careerSection = NAV_SECTIONS.find((s) => s.title === 'CAREER & EXTERNAL PLATFORMS');
    expect(careerSection).toBeDefined();
    const careerItemNames = careerSection!.items.map((i) => i.name);
    const careerItemHrefs = careerSection!.items.map((i) => i.href);

    expect(careerItemNames).toContain('Placement Preparation');
    expect(careerItemHrefs).toContain('/placement');
  });

  it('provides rich placeholder configurations for all future roadmap modules', () => {
    expect(MODULE_REGISTRY['/courses'].phaseNumber).toBe(4);
    expect(MODULE_REGISTRY['/dsa'].phaseNumber).toBe(8);
    expect(MODULE_REGISTRY['/placement'].phaseNumber).toBe(11);
    expect(MODULE_REGISTRY['/assessment/gate-preparation'].phaseNumber).toBe(15);
  });
});
