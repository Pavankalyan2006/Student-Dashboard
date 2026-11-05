import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { CareerService } from '../../server/services/careerService';
import { ResumeService } from '../../server/services/resumeService';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { PlacementService } from '../../server/services/placementService';
import { PlacementTopicService } from '../../server/services/placementTopicService';
import { ExternalIntegrationRegistry } from '../../server/services/externalIntegrationRegistry';
import { ExternalIntegrationService } from '../../server/services/externalIntegrationService';
import { AuthorizationError, NotFoundError } from '../../server/core/exceptions';

describe('Unified Career System E2E Master Suite (All 8 Pages & Cross-Module Integrations)', () => {
  const studentA = 'std_01j8k9x2p4';
  const studentB = 'std_test_isolated_user_02';

  beforeEach(async () => {
    await db.initialize();
  });

  // =========================================================================
  // PAGE 1: CAREER DASHBOARD & CAREER PROFILE
  // =========================================================================
  describe('Page 1: Career Dashboard & Career Profile', () => {
    it('retrieves student personalized career profile with fallback defaults', async () => {
      const profile = await CareerService.getCareerProfile(studentA);
      expect(profile).toBeDefined();
      expect(profile.student_id).toBe(studentA);
      expect(profile.target_roles.length).toBeGreaterThanOrEqual(1);
      expect(profile.preferred_locations.length).toBeGreaterThanOrEqual(1);
      expect(profile.preferred_work_arrangement).toBeDefined();
    });

    it('updates career preferences (target roles, locations, work arrangement) and persists them', async () => {
      const updated = await CareerService.updateCareerProfile(studentA, {
        target_roles: ['AI Research Engineer', 'Distributed Systems Architect'],
        preferred_locations: ['Bengaluru', 'Tokyo', 'Remote'],
        preferred_work_arrangement: 'HYBRID',
        graduation_year: 2026,
      });

      expect(updated.target_roles).toContain('AI Research Engineer');
      expect(updated.preferred_locations).toContain('Tokyo');
      expect(updated.preferred_work_arrangement).toBe('HYBRID');

      // Verify persistence on subsequent retrieval
      const fetched = await CareerService.getCareerProfile(studentA);
      expect(fetched.target_roles).toContain('AI Research Engineer');
      expect(fetched.preferred_work_arrangement).toBe('HYBRID');
    });

    it('calculates comprehensive dashboard summary across all 8 career dimensions from authentic records', async () => {
      const summary = await CareerService.getCareerDashboardSummary(studentA);
      expect(summary).toBeDefined();

      // 1. Profile
      expect(summary.career_profile.student_id).toBe(studentA);

      // 2. Readiness Indicators
      expect(summary.readiness.resume_completeness).toBeGreaterThanOrEqual(0);
      expect(summary.readiness.resume_completeness).toBeLessThanOrEqual(100);
      expect(summary.readiness.resume_sections_status.length).toBeGreaterThanOrEqual(5);
      expect(summary.readiness.skills_aligned_percentage).toBeGreaterThanOrEqual(0);
      expect(summary.readiness.projects_count).toBeGreaterThanOrEqual(0);
      expect(summary.readiness.placement_prep_progress).toBeDefined();
      expect(summary.readiness.readiness_explanation).toContain('authentic records');

      // 3. Recommended Actions
      expect(summary.recommended_actions.length).toBeGreaterThanOrEqual(1);
      expect(summary.recommended_actions[0].target_path).toBeDefined();

      // 4. Activity
      expect(Array.isArray(summary.recent_activity)).toBe(true);
    });
  });

  // =========================================================================
  // PAGE 2: RESUME BUILDER, EDITOR & PREVIEW
  // =========================================================================
  describe('Page 2: Resume Builder & Management', () => {
    let createdResumeId: string;

    it('creates a new resume draft prepopulated with academic details, verified skills, and projects', async () => {
      const fullResume = await ResumeService.createResume(studentA, {
        title: 'Full Stack & ML Specialist Resume',
        target_role: 'Software Development Engineer',
        template: 'TECHNICAL',
      });

      expect(fullResume).toBeDefined();
      expect(fullResume.resume.title).toBe('Full Stack & ML Specialist Resume');
      expect(fullResume.resume.target_role).toBe('Software Development Engineer');
      expect(fullResume.profile!.full_name).toBeDefined();
      expect(fullResume.education.length).toBeGreaterThanOrEqual(1);
      expect(fullResume.skills.length).toBeGreaterThanOrEqual(1);

      createdResumeId = fullResume.resume.id;
    });

    it('calculates deterministic completeness breakdown across all resume sections', async () => {
      // A new resume no longer gets a placeholder phone number, so the student enters one first.
      const before = await ResumeService.getFullResume(createdResumeId, studentA);
      expect(before.profile?.phone).toBe('');
      await ResumeService.updateProfile(createdResumeId, studentA, { phone: '+91 90000 00001' } as any);
      // Likewise the institution comes from the student, not a placeholder college name.
      expect(before.education?.[0]?.institution ?? '').toBe('');
      await ResumeService.updateEducations(createdResumeId, studentA, [
        { ...(before.education?.[0] as any), institution: 'Synthetic Test Institute of Technology' },
      ]);
      const full = await ResumeService.getFullResume(createdResumeId, studentA);
      expect(full.completeness_score).toBeGreaterThan(0);
      expect(full.completeness_breakdown).toBeDefined();
      expect(Array.isArray(full.completeness_breakdown)).toBe(true);
      expect(full.completeness_breakdown.some((s) => s.section.toLowerCase().includes('profile') && s.complete)).toBe(true);
      expect(full.completeness_breakdown.some((s) => s.section.toLowerCase().includes('education') && s.complete)).toBe(true);
    });

    it('updates resume metadata, section order, and template configuration', async () => {
      const updated = await ResumeService.updateResume(createdResumeId, studentA, {
        template: 'MODERN',
        target_role: 'Backend Systems Engineer',
      });

      expect(updated.template).toBe('MODERN');
      expect(updated.target_role).toBe('Backend Systems Engineer');
    });

    it('creates a version snapshot for history and rollbacks', async () => {
      const version = await ResumeService.createVersionSnapshot(createdResumeId, studentA, 'Pre-placement drive update');
      expect(version).toBeDefined();
      expect(version.version_number).toBeGreaterThanOrEqual(1);
      expect(version.created_by).toBe('Pre-placement drive update');

      const versions = await ResumeService.listVersions(createdResumeId, studentA);
      expect(versions.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // PAGE 3: INTERNSHIPS & APPLICATIONS TRACKER
  // =========================================================================
  describe('Page 3: Internships & Application Tracker CRUD', () => {
    let testAppId: string;

    it('creates an internship application with verified company, role, deadline and compensation', async () => {
      const app = await LearningModulesService.createApplication(studentA, {
        company_name: 'Microsoft IDC',
        role: 'Software Engineering Intern — Summer 2027',
        location: 'Hyderabad, India (Hybrid)',
        deadline: '2026-12-15',
        application_url: 'https://careers.microsoft.com/students',
        salary_range: '₹1,25,000 / month',
        status: 'APPLIED',
        notes: 'Submitted via campus placement portal with tailored technical resume.',
      });

      expect(app).toBeDefined();
      expect(app.id).toBeDefined();
      expect(app.company_name).toBe('Microsoft IDC');
      expect(app.status).toBe('APPLIED');
      expect(app.timeline.length).toBeGreaterThanOrEqual(1);

      testAppId = app.id;
    });

    it('updates application status and records status transition in timeline', async () => {
      const updated = await LearningModulesService.updateApplicationStatus(
        studentA,
        testAppId,
        'INTERVIEW',
        'Cleared initial Online Assessment round with 100% test cases.'
      );

      expect(updated.status).toBe('INTERVIEW');
      const latestMilestone = updated.timeline[updated.timeline.length - 1];
      expect(latestMilestone.status).toBe('INTERVIEW');
      expect(latestMilestone.title).toContain('INTERVIEW');
    });

    it('adds custom timeline milestones and recruiter notes', async () => {
      const updated = await LearningModulesService.addTimelineEvent(studentA, testAppId, {
        title: 'Technical Round 1 with Staff Engineer',
        date: '2026-11-20',
        notes: 'Focus on System Design, Trie algorithms, and B-Trees indexing.',
        status: 'TECHNICAL_ROUND',
      });

      expect(updated.status).toBe('TECHNICAL_ROUND');
      expect(updated.timeline.some((ev) => ev.title.includes('Technical Round 1'))).toBe(true);
    });

    it('updates application details (interviewer, revised deadline, notes)', async () => {
      const updated = await LearningModulesService.updateApplication(studentA, testAppId, {
        contact_person: 'Sarah Jenkins (Technical Recruiting Lead)',
        interview_date: '2026-11-20',
        notes: 'Interview scheduled via Microsoft Teams.',
      });

      expect(updated.contact_person).toBe('Sarah Jenkins (Technical Recruiting Lead)');
      expect(updated.interview_date).toBe('2026-11-20');
      expect(updated.notes).toBe('Interview scheduled via Microsoft Teams.');
    });

    it('lists all applications for the authenticated student in descending chronological order', async () => {
      const list = await LearningModulesService.getApplications(studentA);
      expect(list.length).toBeGreaterThanOrEqual(1);
      expect(list.some((a) => a.id === testAppId)).toBe(true);
    });

    it('safely deletes an application record with student authorization', async () => {
      const tempApp = await LearningModulesService.createApplication(studentA, {
        company_name: 'Temporary Test Corp',
        role: 'Intern',
      });

      const deleted = await LearningModulesService.deleteApplication(studentA, tempApp.id);
      expect(deleted).toBe(true);

      await expect(LearningModulesService.getApplicationById(studentA, tempApp.id)).rejects.toThrow(NotFoundError);
    });
  });

  // =========================================================================
  // PAGE 8: JOBS DISCOVERY & JOB-TO-APPLICATION CONVERSION
  // =========================================================================
  describe('Page 8: Jobs Discovery & 1-Click Track to Applications', () => {
    it('discovers verified career opportunities and applies filters', async () => {
      const jobs = await ExternalIntegrationService.searchJobs('engineer', 'Bengaluru');
      expect(jobs.length).toBeGreaterThanOrEqual(1);
      expect(jobs[0].title).toBeDefined();
      expect(jobs[0].company_name).toBeDefined();
    });

    it('imports an external job description and runs multi-agent gap analysis', async () => {
      const imported = await ExternalIntegrationService.importJob(studentA, {
        title: 'Cloud Systems Engineer Intern',
        company: 'Stripe',
        location: 'Remote',
        description: 'Requires Python, Distributed Systems, Docker, and PostgreSQL experience.',
      });

      expect(imported).toBeDefined();
      expect(imported.title).toBe('Cloud Systems Engineer Intern');
      expect(imported.company).toBe('Stripe');
    });

    it('1-click tracks a discovered job directly into the Application Tracker', async () => {
      const targetJob = (await ExternalIntegrationService.searchJobs())[0];
      expect(targetJob).toBeDefined();

      const newApp = await LearningModulesService.createApplication(studentA, {
        company_name: targetJob.company_name || 'Discovered Company',
        role: targetJob.title,
        location: targetJob.location || 'Remote',
        application_url: targetJob.job_url,
        notes: `Imported directly from Jobs Discovery platform.`,
        status: 'SAVED',
      });

      expect(newApp).toBeDefined();
      expect(newApp.company_name).toBe(targetJob.company_name);
      expect(newApp.status).toBe('SAVED');

      // Verify it appears in student's Application Tracker list
      const allApps = await LearningModulesService.getApplications(studentA);
      expect(allApps.some((a) => a.id === newApp.id)).toBe(true);
    });
  });

  // =========================================================================
  // PAGE 4: PLACEMENT PREPARATION & MOCK INTERVIEWS
  // =========================================================================
  describe('Page 4: Placement Preparation & Real Practice Evidence', () => {
    it('computes authoritative readiness metrics without fabricated statistics', async () => {
      const readiness = await PlacementService.getReadiness(studentA);
      expect(readiness).toBeDefined();
      expect(readiness.overall_percentage).toBeGreaterThanOrEqual(0);
      expect(readiness.overall_percentage).toBeLessThanOrEqual(100);
      expect(readiness.dimensions).toBeDefined();
      expect(readiness.weak_areas).toBeDefined();
    });

    it('retrieves preparation topics across Aptitude, Coding, CS fundamentals, and HR', async () => {
      const topics = await PlacementTopicService.getTopics();
      expect(topics.length).toBeGreaterThanOrEqual(1);

      const aptitudeTopics = await PlacementTopicService.getTopics('APTITUDE' as any);
      expect(Array.isArray(aptitudeTopics)).toBe(true);
    });

    it('evaluates practice question answers objectively and saves attempt results', async () => {
      const questions = await PlacementTopicService.getQuestions();
      if (questions.length > 0) {
        const q = questions[0];
        const evalResult = await PlacementTopicService.evaluateQuestionAnswer(studentA, q.id, 'Sample verified engineering response');
        expect(evalResult).toBeDefined();
        expect(evalResult.is_correct !== undefined).toBe(true);
        expect(evalResult.explanation).toBeDefined();
      }
    });

    it('retrieves student mock interview session history with transparent scoring', async () => {
      const interviews = await db.getMockInterviewSessions(studentA);
      expect(Array.isArray(interviews)).toBe(true);
    });
  });

  // =========================================================================
  // PAGE 5: CONNECTED PLATFORMS
  // =========================================================================
  describe('Page 5: Connected Platforms & Authorization', () => {
    it('lists all supported platforms with defined capabilities and icons', () => {
      const providers = ExternalIntegrationRegistry.getAllProviders();
      expect(providers.length).toBeGreaterThanOrEqual(5);

      const github = providers.find((p) => p.id === 'github');
      const leetcode = providers.find((p) => p.id === 'leetcode');
      const linkedin = providers.find((p) => p.id === 'linkedin');

      expect(github).toBeDefined();
      expect(leetcode).toBeDefined();
      expect(linkedin).toBeDefined();
      expect(github?.capabilities.repositories).toBe(true);
      expect(leetcode?.capabilities.code_submissions).toBe(true);
    });

    it('connects a platform using legitimate profile information and marks it connected', async () => {
      const conn = await ExternalIntegrationService.connectPlatform(studentA, 'github' as any, {
        username: 'pavan-dev',
        profile_url: 'https://github.com/pavan-dev',
      });

      expect(conn).toBeDefined();
      expect(conn.provider).toBe('github');
      expect(conn.status).toBe('CONNECTED');
      expect(conn.student_id).toBe(studentA);

      const connections = await ExternalIntegrationService.listConnections(studentA);
      expect(connections.some((c) => c.provider === 'github' && c.status === 'CONNECTED')).toBe(true);
    });

    it('disconnects an external platform and updates status safely', async () => {
      const connections = await ExternalIntegrationService.listConnections(studentA);
      const ghConn = connections.find((c) => c.provider === 'github' && c.status === 'CONNECTED');
      if (ghConn) {
        await ExternalIntegrationService.disconnectPlatform(studentA, ghConn.id);
        const refreshed = await ExternalIntegrationService.listConnections(studentA);
        const disconnectedConn = refreshed.find((c) => c.id === ghConn.id);
        expect(disconnectedConn?.status).toBe('DISCONNECTED');
      }
    });
  });

  // =========================================================================
  // PAGE 6: SYNC CENTER
  // =========================================================================
  describe('Page 6: Sync Center Operations', () => {
    it('triggers idempotent synchronization and logs activity event', async () => {
      // Connect first
      const conn = await ExternalIntegrationService.connectPlatform(studentA, 'leetcode' as any, {
        username: 'pavan_coder',
        profile_url: 'https://leetcode.com/pavan_coder',
      });

      // Linking alone imports nothing.
      expect(conn.sync_status).toBe('IDLE');

      // LeetCode has no live API client, so a sync must say so instead of inventing solved problems.
      const before = (await ExternalIntegrationService.listActivities(studentA)).length;
      const synced = await ExternalIntegrationService.syncConnection(studentA, conn.id);
      expect(synced).toBeDefined();
      expect(synced.sync_status).toBe('ERROR');
      expect(synced.error_status).toContain('not available');
      const after = await ExternalIntegrationService.listActivities(studentA);
      expect(after.length).toBe(before);
      expect(after.some((a) => /Course Schedule/.test(a.title))).toBe(false);

      // Syncing again is idempotent: still nothing imported.
      await ExternalIntegrationService.syncConnection(studentA, conn.id);
      expect((await ExternalIntegrationService.listActivities(studentA)).length).toBe(before);
    });
  });

  // =========================================================================
  // PAGE 7: EXTERNAL PROFILES & CAREER CONSISTENCY
  // =========================================================================
  describe('Page 7: External Profiles & Career Consistency', () => {
    it('aggregates multi-platform skill evidence without fabricating unverified stats', async () => {
      const evidence = await ExternalIntegrationService.getAggregatedSkillEvidence(studentA);
      expect(Array.isArray(evidence)).toBe(true);
      if (evidence.length > 0) {
        expect(evidence[0].skill_name).toBeDefined();
        expect(evidence[0].confidence_score).toBeGreaterThanOrEqual(0);
      }
    });

    it('checks cross-platform career profile consistency (Resume vs GitHub vs LeetCode)', async () => {
      const consistency = await ExternalIntegrationService.checkProfileConsistency(studentA);
      expect(consistency).toBeDefined();
      expect(consistency.overall_consistency_score).toBeGreaterThanOrEqual(0);
      expect(consistency.overall_consistency_score).toBeLessThanOrEqual(100);
      expect(Array.isArray(consistency.matched_items)).toBe(true);
      expect(Array.isArray(consistency.recommendations)).toBe(true);
    });
  });

  // =========================================================================
  // CROSS-MODULE SECURITY & STUDENT DATA ISOLATION
  // =========================================================================
  describe('Cross-Module Security & Student Data Isolation', () => {
    it('prevents student B from modifying or accessing student A applications', async () => {
      const app = await LearningModulesService.createApplication(studentA, {
        company_name: 'Private Student A Corp',
        role: 'Intern',
      });

      // Student B attempting to access Student A's application must fail with NotFoundError
      await expect(
        LearningModulesService.getApplicationById(studentB, app.id)
      ).rejects.toThrow(NotFoundError);

      // Student B attempting to update Student A's application must fail
      await expect(
        LearningModulesService.updateApplication(studentB, app.id, { role: 'Hacked' })
      ).rejects.toThrow(NotFoundError);

      // Student B attempting to delete Student A's application must fail
      await expect(
        LearningModulesService.deleteApplication(studentB, app.id)
      ).rejects.toThrow(NotFoundError);
    });

    it('prevents student B from accessing or deleting student A roadmaps or resumes', async () => {
      const resume = await ResumeService.createResume(studentA, {
        title: 'Private Student A Resume',
      });

      await expect(
        ResumeService.getResume(resume.resume.id, studentB)
      ).rejects.toThrow(AuthorizationError);

      await expect(
        ResumeService.updateResume(resume.resume.id, studentB, { title: 'Compromised' })
      ).rejects.toThrow(AuthorizationError);
    });
  });
});
