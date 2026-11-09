import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { ResumeService } from '../../server/services/resumeService';
import { ResumeAnalysisService } from '../../server/services/resumeAnalysisService';
import { ResumeTailoringService } from '../../server/services/resumeTailoringService';
import { CareerService } from '../../server/services/careerService';

// Phase 3: resume analysis numbers must come from counts on the resume, never from baseline constants.
describe('Phase 3 resume fixes', () => {
  const sid = 'std_01j8k9x2p4'; // seeded synthetic student
  beforeAll(async () => {
    await db.initialize();
  });

  it('a new resume does not get an invented target role', async () => {
    const created = await ResumeService.createResume(sid, { title: 'P3 blank' });
    // Either the student's own onboarding goal or empty; never the old hardcoded "Software Engineer" default.
    expect(created.resume.target_role).not.toBe('Software Engineer');
    expect(created.resume.summary).toBe('');
  });

  it('without a catalogue target role, keyword and role checks are null and not scored', async () => {
    const { resume } = await ResumeService.createResume(sid, { title: 'P3 no role' });
    await ResumeService.updateResume(resume.id, sid, { target_role: '' });
    const a = await ResumeAnalysisService.analyzeResume(resume.id, sid);
    expect(a.keyword_coverage.coverage_percentage).toBeNull();
    expect(a.keyword_coverage.found_keywords).toEqual([]);
    expect(a.role_alignment.alignment_percentage).toBeNull();
    expect(a.scoring_explanation).toContain('not scored');
    expect(a.scoring_explanation).not.toMatch(/Keywords for/);
    expect(a.disclaimer).toContain('not an ATS score');
  });

  it('keyword coverage is measured against the target role skills, and the total equals the listed parts', async () => {
    const role = (await CareerService.listRoles()).find((r) => r.slug === 'backend-developer')!;
    const { resume } = await ResumeService.createResume(sid, { title: 'P3 backend', target_role: role.name });
    await ResumeService.updateSkills(resume.id, sid, [{ skill: 'Python', category: 'LANGUAGE', proficiency: 'INTERMEDIATE', source: 'MANUAL' } as any]);
    const a = await ResumeAnalysisService.analyzeResume(resume.id, sid);
    expect(a.role_alignment.target_role).toBe(role.name);
    expect(a.keyword_coverage.found_keywords.length + a.keyword_coverage.missing_keywords.length).toBe(role.skills.length);
    expect(a.keyword_coverage.found_keywords.some((k) => k.includes('Python'))).toBe(true);
    const expectedAlign = Math.round((1 / role.skills.length) * 100);
    expect(a.role_alignment.alignment_percentage).toBe(expectedAlign);
    // Re-add the parts from the explanation and check they produce the score.
    const parts = [...a.scoring_explanation.matchAll(/(\d+)\/(\d+)(?= \+| \()/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const got = parts.reduce((s, p) => s + p[0], 0);
    const max = parts.reduce((s, p) => s + p[1], 0);
    expect(max).toBe(100);
    expect(a.calculated_score).toBe(Math.round((got / max) * 100));
  });

  it('weak phrasing is flagged without rewriting it into a stronger claim', async () => {
    const { resume } = await ResumeService.createResume(sid, { title: 'P3 bullets' });
    await ResumeService.updateProjects(resume.id, sid, [
      { title: 'Notes app', technologies: ['React'], highlighted_features: ['responsible for the login page', 'Built offline sync with IndexedDB'] } as any,
    ]);
    const a = await ResumeAnalysisService.analyzeResume(resume.id, sid);
    expect(a.weak_bullet_phrasings).toHaveLength(1);
    expect(a.weak_bullet_phrasings[0].current).toBe('responsible for the login page');
    expect(a.weak_bullet_phrasings[0].suggestion).toBe('');
    expect(JSON.stringify(a)).not.toContain('Engineered');
  });

  it('tailoring does not template-rewrite the summary and is owner-checked', async () => {
    const { resume } = await ResumeService.createResume(sid, { title: 'P3 tailor' });
    const t = await ResumeTailoringService.tailorResume(resume.id, sid, 'Python and SQL backend role', 'Backend Engineer', 'Acme');
    expect(t.suggested_wording).toEqual([]);
    await expect(ResumeTailoringService.tailorResume(resume.id, 'std_someone_else', 'Python', 'X', 'Y')).rejects.toBeTruthy();
    await expect(ResumeAnalysisService.analyzeResume(resume.id, 'std_someone_else')).rejects.toBeTruthy();
  });
});
