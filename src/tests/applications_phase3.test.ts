import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { LearningModulesService } from '../../server/services/learningModulesService';

// Phase 3: the tracker records only what the student enters; any skill comparison comes from the pasted job description.
describe('Phase 3 application tracker', () => {
  const sid = 'std_p3_apps_a';
  beforeAll(async () => {
    await db.initialize();
    (db as any).studentSkills.set(sid, [
      { id: 'ss1', student_id: sid, skill_id: 'sk_py', skill_name: 'Python', category: 'PROGRAMMING', source: 'PROJECT', evidence_count: 2, proficiency: 'INTERMEDIATE', confidence: 'MEDIUM', last_updated_at: '' },
      { id: 'ss2', student_id: sid, skill_id: 'sk_sql', skill_name: 'SQL', category: 'DATABASE', source: 'STUDENT_DECLARED', evidence_count: 0, proficiency: 'BEGINNER', confidence: 'LOW', last_updated_at: '' },
    ]);
  });

  it('a new application has no invented location, deadline, notes or skill analysis', async () => {
    const a = await LearningModulesService.createApplication(sid, { company_name: 'Example Co', role: 'Backend Intern' });
    expect(a.location).toBe('');
    expect(a.deadline).toBeUndefined();
    expect(a.notes).toBe('');
    expect(a.jd_analysis).toBeUndefined();
    expect(a.status).toBe('APPLIED');
  });

  it('a pasted job description is compared with the profile skills and their evidence', async () => {
    const a = await LearningModulesService.createApplication(sid, { company_name: 'Example Co', role: 'Data Intern', job_description: 'We use Python, SQL and Docker daily.' } as any);
    const byName = Object.fromEntries(a.jd_analysis!.required_skills.map((r) => [r.name, r.evidence_status]));
    expect(byName.Python).toBe('EVIDENCE_AVAILABLE');
    expect(byName.SQL).toBe('DEVELOPING');
    expect(byName.Docker).toBe('NOT_YET_ASSESSED');
    expect(a.jd_analysis!.readiness_percent).toBe(Math.round((1 / a.jd_analysis!.required_skills.length) * 100));
    expect(a.jd_analysis!.recommended_preparation.join(' ')).toContain('Docker');
  });

  it('a job description that names no known skill gets no analysis', async () => {
    const a = await LearningModulesService.createApplication(sid, { company_name: 'X', role: 'Y', job_description: 'Great team, good snacks.' } as any);
    expect(a.jd_analysis).toBeUndefined();
  });

  it('rejects unsafe links, bad dates and unknown statuses', async () => {
    await expect(LearningModulesService.createApplication(sid, { company_name: 'X', role: 'Y', application_url: 'javascript:alert(1)' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(LearningModulesService.createApplication(sid, { company_name: 'X', role: 'Y', deadline: 'next week' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(LearningModulesService.createApplication(sid, { company_name: 'X', role: 'Y', status: 'HIRED' as any })).rejects.toMatchObject({ statusCode: 400 });
    const a = await LearningModulesService.createApplication(sid, { company_name: 'X', role: 'Y', status: 'SAVED' });
    await expect(LearningModulesService.updateApplicationStatus(sid, a.id, 'DONE')).rejects.toMatchObject({ statusCode: 400 });
    await expect(LearningModulesService.addTimelineEvent(sid, a.id, { title: '' })).rejects.toMatchObject({ statusCode: 400 });
    await expect(LearningModulesService.updateApplication(sid, a.id, { company_name: '' })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('status changes are recorded on the timeline and other students cannot see or change the application', async () => {
    const a = await LearningModulesService.createApplication(sid, { company_name: 'X', role: 'Y', status: 'SAVED' });
    expect(a.timeline[0].title).toBe('Saved to tracker');
    const u = await LearningModulesService.updateApplicationStatus(sid, a.id, 'APPLIED', 'applied on the portal');
    expect(u.timeline.at(-1)!.status).toBe('APPLIED');
    await expect(LearningModulesService.getApplicationById('std_p3_apps_b', a.id)).rejects.toMatchObject({ statusCode: 404 });
    await expect(LearningModulesService.updateApplication('std_p3_apps_b', a.id, { notes: 'x' })).rejects.toMatchObject({ statusCode: 404 });
    await expect(LearningModulesService.deleteApplication('std_p3_apps_b', a.id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
