// src/tests/jobs_discovery_master.test.ts
// Master test suite for Multi-Source Jobs Discovery Platform (Government + Private)

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { JobAggregationService } from '../../server/services/jobAggregationService';
import { JobAiService } from '../../server/services/jobAiService';
import { GOVERNMENT_SUBCATEGORIES, PRIVATE_SUBCATEGORIES, VERIFIED_SEED_JOB_LISTINGS } from '../../server/db/jobsCatalog';

describe('Multi-Source Jobs Discovery Master Suite', () => {
  const studentId = 'std_test_jobs_01';

  beforeEach(async () => {
    await db.initialize();
  });

  it('1. catalogs contain comprehensive government and private subcategories', () => {
    expect(GOVERNMENT_SUBCATEGORIES.length).toBeGreaterThanOrEqual(15);
    expect(PRIVATE_SUBCATEGORIES.length).toBeGreaterThanOrEqual(20);

    const hasIsroOrResearch = GOVERNMENT_SUBCATEGORIES.some((c) => c.key === 'RESEARCH_SCIENTIFIC');
    const hasPsu = GOVERNMENT_SUBCATEGORIES.some((c) => c.key === 'PSU');
    const hasBanking = GOVERNMENT_SUBCATEGORIES.some((c) => c.key === 'BANKING');
    const hasSoftware = PRIVATE_SUBCATEGORIES.some((c) => c.key === 'SOFTWARE_DEVELOPMENT');
    const hasFullStack = PRIVATE_SUBCATEGORIES.some((c) => c.key === 'FULLSTACK_DEVELOPMENT');

    expect(hasIsroOrResearch).toBe(true);
    expect(hasPsu).toBe(true);
    expect(hasBanking).toBe(true);
    expect(hasSoftware).toBe(true);
    expect(hasFullStack).toBe(true);
  });

  it('2. verifies seed listings point to authentic sources and official PDFs', async () => {
    const isro = VERIFIED_SEED_JOB_LISTINGS.find((j) => j.id.includes('isro'));
    expect(isro).toBeDefined();
    expect(isro?.category).toBe('GOVERNMENT');
    expect(isro?.official_notification_pdf_url).toContain('.pdf');
    expect(isro?.notification_number).toBeDefined();
    expect(isro?.application_url.startsWith('https://')).toBe(true);
    expect(isro?.verification_status).toBe('OFFICIAL_GOVERNMENT_SOURCE');
  });

  it('3. returns filtered listings by category (GOVERNMENT)', async () => {
    const { jobs, total } = await db.getJobListings({ category: 'GOVERNMENT' });
    expect(total).toBeGreaterThan(0);
    expect(jobs.every((j) => j.category === 'GOVERNMENT')).toBe(true);
  });

  it('4. returns filtered listings by category (PRIVATE)', async () => {
    const { jobs, total } = await db.getJobListings({ category: 'PRIVATE' });
    expect(total).toBeGreaterThan(0);
    expect(jobs.every((j) => j.category === 'PRIVATE')).toBe(true);
  });

  it('5. returns freshers friendly jobs filter correctly', async () => {
    const { jobs } = await db.getJobListings({ freshers_only: true });
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((j) => j.is_freshers_friendly || j.experience_min === 0)).toBe(true);
  });

  it('6. returns remote opportunities filter correctly', async () => {
    const { jobs } = await db.getJobListings({ remote_only: true });
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs.every((j) => j.remote_eligible || j.work_arrangement === 'REMOTE')).toBe(true);
  });

  it('7. searches listings across title, organization, skills, and notification number', async () => {
    const { jobs: isroSearch } = await db.getJobListings({ query: 'ISRO' });
    expect(isroSearch.length).toBeGreaterThan(0);
    expect(isroSearch[0].organization).toContain('ISRO');

    const { jobs: gateSearch } = await db.getJobListings({ query: 'GATE' });
    expect(gateSearch.length).toBeGreaterThan(0);
  });

  it('8. normalizes raw payloads with valid https protocols', () => {
    const normalized = JobAggregationService.normalizeJob({
      title: 'DevOps Engineer',
      organization: 'Acme Cloud',
      source_id: 'test_src',
      source_name: 'Test Source',
      source_type: 'EMPLOYER_ATS',
      source_url: 'acme.com/jobs/1',
      category: 'PRIVATE',
      subcategory: 'DEVOPS_SRE',
      location: 'Hyderabad',
      description: 'Deploy Kubernetes clusters and manage CI/CD.',
    });

    expect(normalized.id).toBeDefined();
    expect(normalized.application_url.startsWith('https://')).toBe(true);
    expect(normalized.status).toBe('ACTIVE');
    expect(normalized.verification_status).toBe('AUTHORIZED_JOB_PROVIDER');
  });

  it('9. prevents duplicate listings during batch saves', async () => {
    const initialJobs = await db.getJobListings();
    const countBefore = initialJobs.total;

    // Re-saving same verified seeds should report duplicates and not inflate count
    const batchRes = await db.saveJobListingsBatch(VERIFIED_SEED_JOB_LISTINGS);
    expect(batchRes.duplicates).toBeGreaterThan(0);

    const countAfter = (await db.getJobListings()).total;
    expect(countAfter).toBe(countBefore);
  });

  it('10. explains student profile match transparently without fabricated scores', async () => {
    const isro = VERIFIED_SEED_JOB_LISTINGS.find((j) => j.id.includes('isro'))!;
    const match = await JobAiService.explainMatch(isro, {
      student_id: studentId,
      branch: 'Computer Science & Engineering',
      semester: 6,
      skills: ['Data Structures & Algorithms', 'C/C++', 'Operating Systems', 'Computer Networks'],
    });

    expect(match.job_id).toBe(isro.id);
    expect(match.student_id).toBe(studentId);
    expect(match.matched_skills.length).toBeGreaterThan(0);
    expect(match.match_percentage).toBeGreaterThanOrEqual(40);
    expect(match.match_percentage).toBeLessThanOrEqual(100);
    expect(match.is_eligible_qualification).toBe(true);
    expect(match.recommendation_reasons.length).toBeGreaterThan(0);
  });

  it('11. manages student saved jobs bookmarks', async () => {
    const jobId = VERIFIED_SEED_JOB_LISTINGS[0].id;

    // Save job
    const saved = await db.saveStudentJob(studentId, jobId, 'Target exam for May 2026', true);
    expect(saved.job_id).toBe(jobId);
    expect(saved.notes).toBe('Target exam for May 2026');

    // Retrieve saved
    const savedList = await db.getStudentSavedJobs(studentId);
    expect(savedList.some((s) => s.job_id === jobId)).toBe(true);
    expect(savedList.find((s) => s.job_id === jobId)?.job?.title).toBeDefined();

    // Delete saved
    const deleted = await db.deleteStudentSavedJob(studentId, jobId);
    expect(deleted).toBe(true);
    const savedAfter = await db.getStudentSavedJobs(studentId);
    expect(savedAfter.some((s) => s.job_id === jobId)).toBe(false);
  });

  it('12. manages student job alerts', async () => {
    const alert = await db.saveStudentJobAlert({
      id: 'alert_test_01',
      student_id: studentId,
      title: 'ISRO and Research Alerts',
      category: 'GOVERNMENT',
      subcategories: ['RESEARCH_SCIENTIFIC', 'PSU'],
      keywords: ['ISRO', 'Scientist'],
      locations: ['Bengaluru'],
      remote_only: false,
      freshers_only: true,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    expect(alert.id).toBe('alert_test_01');

    const alerts = await db.getStudentJobAlerts(studentId);
    expect(alerts.length).toBe(1);
    expect(alerts[0].keywords).toContain('ISRO');

    const deleted = await db.deleteStudentJobAlert(studentId, 'alert_test_01');
    expect(deleted).toBe(true);
    expect((await db.getStudentJobAlerts(studentId)).length).toBe(0);
  });

  it('13. calculates real dashboard statistics without faking', async () => {
    const stats = await db.getJobsDashboardStats(studentId);
    expect(stats.total_jobs).toBeGreaterThan(0);
    expect(stats.government_jobs).toBeGreaterThan(0);
    expect(stats.private_jobs).toBeGreaterThan(0);
    expect(stats.government_jobs + stats.private_jobs).toBe(stats.total_jobs);
    expect(stats.active_sources_count).toBeGreaterThan(0);
  });

  it('14. expands search queries deterministically or via AI', async () => {
    const expandedSde = await JobAiService.expandSearchQuery('sde');
    expect(expandedSde.some((t) => t.toLowerCase().includes('software') || t.toLowerCase().includes('backend'))).toBe(true);

    const expandedPsu = await JobAiService.expandSearchQuery('psu');
    expect(expandedPsu.some((t) => t.toLowerCase().includes('iocl') || t.toLowerCase().includes('gate'))).toBe(true);
  });

  it('15. analyzes external pasted job descriptions with fallback', async () => {
    const analysis = await JobAiService.analyzeJobDescription({
      title: 'Full Stack Engineer',
      organization: 'Stripe',
      raw_text: 'We are hiring a Full Stack Engineer proficient in React, TypeScript, and Go to build developer billing portals. Minimum B.Tech with 0-2 years experience.',
    });

    expect(analysis.summary).toBeDefined();
    expect(analysis.category).toBe('PRIVATE');
    expect(analysis.extracted_skills.length).toBeGreaterThan(0);
    expect(analysis.preparation_checklist.length).toBeGreaterThan(0);
  });
});
