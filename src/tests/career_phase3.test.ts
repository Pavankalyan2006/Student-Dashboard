import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { CareerService, skillMatches } from '../../server/services/careerService';

describe('Phase 3 career fixes', () => {
  beforeAll(async () => {
    await db.initialize();
  });

  it('skill matching uses whole words and alternatives, not substrings', () => {
    expect(skillMatches('Docker & CI/CD', ['C'])).toBe(false);
    expect(skillMatches('Node.js / Python / Java / Go', ['Python'])).toBe(true);
    expect(skillMatches('Node.js / Python / Java / Go', ['node.js'])).toBe(true);
    expect(skillMatches('DBMS & SQL', ['SQL'])).toBe(true);
    expect(skillMatches('PostgreSQL / MongoDB', ['SQL'])).toBe(false);
  });

  it('every role recommends courses that exist in the catalogue', async () => {
    for (const role of await CareerService.listRoles()) {
      for (const id of role.recommended_courses) expect(await db.getCourseById(id), `${role.name}: ${id}`).toBeTruthy();
      for (const p of role.recommended_projects) expect(p).not.toMatch(/^prj_/);
    }
  });

  it('roadmaps differ by role and link only to courses that exist', async () => {
    const roles = await CareerService.listRoles();
    const a = await CareerService.generateRoadmap('std_p3_career', roles[0].id);
    const b = await CareerService.generateRoadmap('std_p3_career', roles[1].id);
    expect(a.steps.map((s) => s.title)).not.toEqual(b.steps.map((s) => s.title));
    for (const s of [...a.steps, ...b.steps]) {
      if (s.source_type === 'COURSE') expect(await db.getCourseById(s.source_id!)).toBeTruthy();
      expect(String(s.url)).not.toMatch(/seed/);
    }
  });

  it('a student with no target role gets no invented alignment or topic counts', async () => {
    const sum = await CareerService.getCareerDashboardSummary('std_p3_career_empty');
    expect(sum.readiness.skills_aligned_percentage).toBeNull();
    expect(sum.readiness.placement_prep_progress.topics_practiced).toBeNull();
    expect(sum.readiness.placement_prep_progress.active_sprint_title).toBeNull();
  });
});
