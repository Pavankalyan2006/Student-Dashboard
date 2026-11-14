import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { OnboardingService } from '../../server/services/onboardingService';
import { StudentContextEngine } from '../../server/ai/studentContextEngine';
import { ToolRegistry } from '../../server/ai/tools';
import { AgentRegistry } from '../../server/ai/orchestration/registry';
import { EventBus } from '../../server/events/eventBus';
import { db } from '../../server/db/database';

describe('Student Profile, Onboarding & Multi-Agent Intelligence Suite', () => {
  const testStudentId = 'std_test_onboarding_001';
  const testOtherStudentId = 'std_test_other_002';

  beforeAll(async () => {
    const existing = await db.getStudentById(testStudentId);
    if (!existing) {
      await db.createStudent({
        id: testStudentId,
        name: 'Pavan Test Student',
        email: `${testStudentId}@btech.edu`,
        password: 'Password123!',
        branch: 'CSE',
        semester: 6,
        role: 'STUDENT',
      } as any);
    }
  });

  beforeEach(async () => {
    // Reset memories for test student
    await OnboardingService.clearStudentMemories(testStudentId);
  });

  describe('1. Onboarding Workflow & Step Progression', () => {
    it('initializes default 15-step onboarding status for new student', async () => {
      const status = await OnboardingService.getOnboardingStatus(testStudentId);
      expect(status.student_id).toBe(testStudentId);
      expect(status.is_complete).toBe(false);
      expect(status.steps.length).toBe(15);
      expect(status.steps[0].step_id).toBe('ACCOUNT_IDENTITY');
      expect(status.steps[14].step_id).toBe('FINAL_REVIEW');
    });

    it('advances current step on step completion', async () => {
      const updated = await OnboardingService.updateOnboardingStep(testStudentId, 'ACCOUNT_IDENTITY', true, false);
      expect(updated.current_step).toBe('PERSONAL_PROFILE');
      const basicStep = updated.steps.find((s) => s.step_id === 'ACCOUNT_IDENTITY');
      expect(basicStep?.completed).toBe(true);
    });

    it('supports skipping optional steps without failing workflow', async () => {
      const updated = await OnboardingService.updateOnboardingStep(testStudentId, 'APPLICATIONS_LINKS', false, true);
      const histStep = updated.steps.find((s) => s.step_id === 'APPLICATIONS_LINKS');
      expect(histStep?.skipped).toBe(true);
      expect(histStep?.completed).toBe(false);
    });

    it('completes onboarding and records completion timestamp', async () => {
      const completed = await OnboardingService.completeOnboarding(testStudentId);
      expect(completed.is_complete).toBe(true);
      expect(completed.completed_at).not.toBeNull();
      const finalStep = completed.steps.find((s) => s.step_id === 'FINAL_REVIEW');
      expect(finalStep?.completed).toBe(true);
    });
  });

  describe('2. Education & Semester Syllabus Persistence', () => {
    it('persists educational background and curriculum subjects', async () => {
      const edu = await OnboardingService.saveEducationProfile(testStudentId, {
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        specialization: 'Artificial Intelligence',
        institution: 'National Institute of Technology',
        current_year: 3,
        current_semester: 6,
        study_mode: 'FULL_TIME',
        current_subjects: ['Operating Systems', 'Computer Networks', 'Machine Learning'],
      });

      expect(edu.degree).toBe('B.Tech');
      expect(edu.branch).toBe('Computer Science & Engineering');
      expect(edu.current_subjects.length).toBe(3);

      const retrieved = await OnboardingService.getEducationProfile(testStudentId);
      expect(retrieved?.institution).toBe('National Institute of Technology');
      expect(retrieved?.current_semester).toBe(6);
    });

    it('persists semester subjects, credits, and confirmed examination dates', async () => {
      const syllabus = await OnboardingService.saveSemesterSyllabus(testStudentId, {
        academic_year: '2025-2026',
        semester_number: 6,
        subjects: [
          {
            id: 'sub_os',
            name: 'Operating Systems',
            code: 'CS301',
            credits: 4,
            subject_type: 'THEORY',
            syllabus_units: [
              { unit_number: 1, title: 'Processes & Threads', topics: ['Process Scheduling', 'Deadlocks'] },
            ],
          },
        ],
        academic_dates: [
          { id: 'date_mid1', label: 'Mid-Semester Exam 1', date: '2026-04-10', type: 'INTERNAL_EXAM' },
        ],
      });

      expect(syllabus.subjects.length).toBe(1);
      expect(syllabus.subjects[0].code).toBe('CS301');
      expect(syllabus.academic_dates.length).toBe(1);
      expect(syllabus.academic_dates[0].type).toBe('INTERNAL_EXAM');

      const retrieved = await OnboardingService.getSemesterSyllabus(testStudentId);
      expect(retrieved?.subjects[0].name).toBe('Operating Systems');
    });
  });

  describe('3. Learning Preferences & Skills Assessment', () => {
    it('persists granular learning modality and pace preferences', async () => {
      const prefs = await OnboardingService.saveLearningPreferences(testStudentId, {
        learning_style: 'HANDS_ON',
        explanation_depth: 'DEEP_DIVE',
        preferred_explanation_language: 'English',
        favorite_subjects: ['Machine Learning', 'Data Structures'],
        difficult_topics: ['Dynamic Programming', 'SQL Normalization'],
        weekday_study_hours: 3.5,
        weekend_study_hours: 6,
        practical_coding_preference: true,
      });

      expect(prefs.learning_style).toBe('HANDS_ON');
      expect(prefs.explanation_depth).toBe('DEEP_DIVE');
      expect(prefs.difficult_topics).toContain('Dynamic Programming');
      expect(prefs.weekday_study_hours).toBe(3.5);
    });

    it('persists self-reported skills separately from demonstrated platform metrics', async () => {
      const skills = await OnboardingService.saveSkillsAssessment(testStudentId, {
        skills: [
          { skill_name: 'Python', skill_category: 'Languages', self_reported_level: 'ADVANCED', is_custom: false },
          { skill_name: 'Data Structures & Algorithms', skill_category: 'CS Fundamentals', self_reported_level: 'INTERMEDIATE', is_custom: false },
        ],
        additional_skills: ['Docker'],
      });

      expect(skills.skills.length).toBe(2);
      expect(skills.skills[0].self_reported_level).toBe('ADVANCED');
    });
  });

  describe('4. Career Targets & Portfolio Projects', () => {
    it('saves multi-directional career ambitions and target company roles', async () => {
      const goals = await OnboardingService.saveCareerGoals(testStudentId, {
        career_directions: ['FULLSTACK_DEVELOPMENT', 'AI_ML'],
        target_job_role: 'Full Stack AI Engineer',
        target_companies: ['Google', 'Microsoft', 'Postman'],
        desired_technical_skills: ['Distributed Systems', 'LLM Agent Frameworks'],
        github_url: 'https://github.com/test-student',
      });

      expect(goals.career_directions).toContain('AI_ML');
      expect(goals.target_job_role).toBe('Full Stack AI Engineer');
      expect(goals.target_companies?.length).toBe(3);
    });

    it('manages student portfolio projects with CRUD operations', async () => {
      const proj = await OnboardingService.addPortfolioProject(testStudentId, {
        title: 'Distributed KV Store',
        description: 'Raft consensus key-value storage engine in Go.',
        technologies: ['Go', 'Raft', 'gRPC'],
        status: 'IN_PROGRESS',
        skills_demonstrated: ['Distributed Systems', 'Concurrency'],
      });

      expect(proj.title).toBe('Distributed KV Store');
      expect(proj.student_id).toBe(testStudentId);

      const projects = await OnboardingService.getPortfolioProjects(testStudentId);
      expect(projects.length).toBeGreaterThanOrEqual(1);

      // Update project
      const updated = await OnboardingService.updatePortfolioProject(testStudentId, proj.id, {
        status: 'COMPLETED',
      });
      expect(updated.status).toBe('COMPLETED');

      // Delete project
      await OnboardingService.deletePortfolioProject(testStudentId, proj.id);
      const remaining = await OnboardingService.getPortfolioProjects(testStudentId);
      expect(remaining.find((p) => p.id === proj.id)).toBeUndefined();
    });
  });

  describe('5. Profile Completion Calculation', () => {
    it('calculates profile completion score accurately with section breakdowns', async () => {
      const completion = await OnboardingService.getProfileCompletion(testStudentId);
      expect(completion.student_id).toBe(testStudentId);
      expect(completion.overall_percentage).toBeGreaterThan(0);
      expect(completion.overall_percentage).toBeLessThanOrEqual(100);
      expect(completion.sections.length).toBe(9);

      const eduSection = completion.sections.find((s) => s.section === 'EDUCATION');
      expect(eduSection?.completed).toBe(true);
      expect(eduSection?.completion_percentage).toBe(100);
    });
  });

  describe('6. Student Intelligence Engine Context Assembly', () => {
    it('assembles unified, verified intelligence context without hardcoding', async () => {
      const context = await OnboardingService.buildIntelligenceContext(testStudentId);
      expect(context.student_id).toBe(testStudentId);
      expect(context.education).not.toBeNull();
      expect(context.education?.branch).toBe('Computer Science & Engineering');
      expect(context.career_goals).not.toBeNull();
      expect(context.career_goals?.target_job_role).toBe('Full Stack AI Engineer');
      expect(context.preferences).not.toBeNull();
      expect(context.preferences?.learning_style).toBe('HANDS_ON');
    });

    it('generates formatted markdown prompt context for AI Tutor', async () => {
      // Create student in db if not exists
      const existing = await db.getStudentById(testStudentId);
      if (!existing) {
        await db.createStudent({
          name: 'Pavan Test Student',
          email: `${testStudentId}@btech.edu`,
          password_hash: 'Password123!',
          branch: 'CSE',
          semester: 6,
          role: 'STUDENT',
        } as any);
      }

      const promptContext = await StudentContextEngine.buildContext(testStudentId, { domain: 'GENERAL' });
      const formatted = StudentContextEngine.formatPromptContext(promptContext);

      expect(formatted).toContain('### Verified Student Context:');
      expect(formatted).toContain('Computer Science & Engineering');
      expect(formatted).toContain('HANDS_ON');
      expect(formatted).toContain('Full Stack AI Engineer');
    });
  });

  describe('7. Persistent Student Memory Isolation', () => {
    it('adds, retrieves, and isolates student-specific memory records', async () => {
      const mem1 = await OnboardingService.addStudentMemory(
        testStudentId,
        'LEARNING_INSIGHT',
        'weak_topic_sql_joins',
        'Student scored 45% on relational JOIN quiz. Remedial exercises recommended.',
        'PLATFORM_DERIVED',
        0.95
      );

      expect(mem1.student_id).toBe(testStudentId);
      expect(mem1.key).toBe('weak_topic_sql_joins');

      const memories = await OnboardingService.getStudentMemories(testStudentId);
      expect(memories.length).toBe(1);

      // Verify cross-student isolation: other student cannot access this memory
      const otherMemories = await OnboardingService.getStudentMemories(testOtherStudentId);
      expect(otherMemories.find((m) => m.id === mem1.id)).toBeUndefined();

      // Delete specific memory
      await OnboardingService.deleteStudentMemory(testStudentId, mem1.id);
      const afterDelete = await OnboardingService.getStudentMemories(testStudentId);
      expect(afterDelete.length).toBe(0);
    });
  });

  describe('8. Multi-Agent Tools & Registry Permissions', () => {
    it('registers get_student_context, get_semester_subjects, and get_student_recommendations in ToolRegistry', () => {
      const toolContext = ToolRegistry.getTool('get_student_context');
      expect(toolContext).toBeDefined();
      expect(toolContext?.permissions).toContain('STUDENT');

      const toolSubjects = ToolRegistry.getTool('get_semester_subjects');
      expect(toolSubjects).toBeDefined();

      const toolRecs = ToolRegistry.getTool('get_student_recommendations');
      expect(toolRecs).toBeDefined();
    });

    it('executes get_student_context tool with real student identity', async () => {
      const tool = ToolRegistry.getTool('get_student_context');
      expect(tool).toBeDefined();

      const result = await tool!.handler({ domain: 'GENERAL' }, { studentId: testStudentId, role: 'STUDENT' });
      expect(result).toBeDefined();
      expect(result.career.targetRole).toBe('Full Stack AI Engineer');
      // Tool results go to the AI provider: no account id, name or persona text.
      expect(result.student.id).toBeUndefined();
      expect(result.student.name).toBeUndefined();
      expect(result.aiPersona).toBeUndefined();
      expect(JSON.stringify(result)).not.toContain(testStudentId);
    });

    it('verifies LearningAgent has permission for student context tools in AgentRegistry', () => {
      const agent = AgentRegistry.getAgent('LearningAgent');
      expect(agent).toBeDefined();
      expect(agent?.allowedTools).toContain('get_student_context');
      expect(agent?.allowedTools).toContain('get_student_recommendations');
    });
  });

  describe('9. Evidence-Backed Recommendation Engine', () => {
    it('generates personalized recommendations containing supporting evidence and transparent rationale', async () => {
      const recs = await OnboardingService.generateRecommendations(testStudentId);
      expect(recs.length).toBeGreaterThan(0);

      const firstRec = recs[0];
      expect(firstRec.title).toBeDefined();
      expect(firstRec.description).toBeDefined();
      expect(firstRec.reason).toBeDefined();
      expect(firstRec.evidence.length).toBeGreaterThan(0);
      expect(firstRec.target_page).toBeDefined();
      expect(firstRec.status).toBe('ACTIVE');

      // Dismiss recommendation
      await OnboardingService.dismissRecommendation(testStudentId, firstRec.id);
      const afterDismiss = await OnboardingService.getRecommendations(testStudentId);
      const dismissedItem = afterDismiss.find((r) => r.id === firstRec.id);
      expect(dismissedItem?.status).toBe('DISMISSED');
    });
  });

  describe('10. Event-Driven Updates Architecture', () => {
    it('publishes and subscribes to ONBOARDING_COMPLETED and PROFILE_UPDATED events', async () => {
      const eventBus = EventBus.getInstance();
      let eventReceived = false;
      let receivedPayload: any = null;

      const unsubscribe = eventBus.subscribe('ONBOARDING_COMPLETED', (event) => {
        eventReceived = true;
        receivedPayload = event.payload;
      });

      await OnboardingService.completeOnboarding(testStudentId);

      expect(eventReceived).toBe(true);
      expect(receivedPayload?.studentId).toBe(testStudentId);

      unsubscribe();
    });
  });
});
