import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { Security } from '../../server/core/security';
import { OnboardingService, ONBOARDING_STEPS } from '../../server/services/onboardingService';
import { StudentContextEngine } from '../../server/ai/studentContextEngine';
import { semesterCommandCenterService } from '../../server/services/semesterCommandCenterService';
import { DashboardService } from '../../server/services/dashboard';

describe('15-Page Comprehensive Student Registration & Onboarding System Suite', () => {
  const testStudent = {
    id: 'std_test_15_step_onboarding_001',
    name: 'Kavya R. Sharma',
    email: 'kavya.sharma.cse@btech.edu',
    password: 'Password123!',
    branch: 'Computer Science & Engineering (CSE)',
    semester: 6,
    institution: 'National Institute of Technology (NIT) Karnataka',
  };

  beforeAll(async () => {
    await db.initialize();

    // Ensure test student exists
    const existing = await db.getStudentById(testStudent.id);
    if (!existing) {
      await db.createStudent({
        id: testStudent.id,
        name: testStudent.name,
        email: testStudent.email,
        password_hash: await Security.hashPassword(testStudent.password),
        branch: testStudent.branch,
        semester: testStudent.semester,
        role: 'STUDENT',
        is_active: true,
        status: 'ACTIVE',
      } as any);
    }
  });

  // ==========================================================================
  // 1. STEP STRUCTURE & INITIALIZATION
  // ==========================================================================
  it('1. initializes 15 distinct onboarding steps with correct step IDs and labels', async () => {
    expect(ONBOARDING_STEPS.length).toBe(15);
    expect(ONBOARDING_STEPS[0].id).toBe('ACCOUNT_IDENTITY');
    expect(ONBOARDING_STEPS[1].id).toBe('PERSONAL_PROFILE');
    expect(ONBOARDING_STEPS[2].id).toBe('EDUCATION_BACKGROUND');
    expect(ONBOARDING_STEPS[3].id).toBe('SEMESTER_SYLLABUS');
    expect(ONBOARDING_STEPS[4].id).toBe('TECHNICAL_SKILLS');
    expect(ONBOARDING_STEPS[5].id).toBe('INTERESTS_TOPICS');
    expect(ONBOARDING_STEPS[6].id).toBe('CAREER_GOALS');
    expect(ONBOARDING_STEPS[7].id).toBe('LEARNING_GOALS');
    expect(ONBOARDING_STEPS[8].id).toBe('AI_PREFERENCES');
    expect(ONBOARDING_STEPS[9].id).toBe('STUDY_SCHEDULE');
    expect(ONBOARDING_STEPS[10].id).toBe('COURSE_MATERIALS');
    expect(ONBOARDING_STEPS[11].id).toBe('PROJECT_PORTFOLIO');
    expect(ONBOARDING_STEPS[12].id).toBe('APPLICATIONS_LINKS');
    expect(ONBOARDING_STEPS[13].id).toBe('RESEARCH_COMMUNITY');
    expect(ONBOARDING_STEPS[14].id).toBe('FINAL_REVIEW');

    const status = await OnboardingService.getOnboardingStatus(testStudent.id);
    expect(status.steps.length).toBe(15);
    expect(status.is_complete).toBe(false);
  });

  // ==========================================================================
  // 2. FORM 1: ACCOUNT REGISTRATION & IDENTITY
  // ==========================================================================
  it('2. completes Form 1 (Account Identity, Credentials, Pronunciation & Consent)', async () => {
    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'ACCOUNT_IDENTITY', true, false);
    expect(updated.current_step).toBe('PERSONAL_PROFILE');

    const step1 = updated.steps.find((s) => s.step_id === 'ACCOUNT_IDENTITY');
    expect(step1?.completed).toBe(true);
    expect(step1?.skipped).toBe(false);
  });

  // ==========================================================================
  // 3. FORM 2: PERSONAL & GENERAL PROFILE
  // ==========================================================================
  it('3. completes Form 2 (Location, Time Zone, Languages & Accessibility)', async () => {
    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'PERSONAL_PROFILE', true, false);
    expect(updated.current_step).toBe('EDUCATION_BACKGROUND');

    const step2 = updated.steps.find((s) => s.step_id === 'PERSONAL_PROFILE');
    expect(step2?.completed).toBe(true);
  });

  // ==========================================================================
  // 4. FORM 3: EDUCATION AND ACADEMIC BACKGROUND
  // ==========================================================================
  it('4. completes Form 3 (Degree, Branch, Institution, CGPA & Cohort Dates)', async () => {
    const edu = await OnboardingService.saveEducationProfile(testStudent.id, {
      degree: 'B.Tech',
      branch: testStudent.branch,
      specialization: 'Cloud Computing & Distributed Systems',
      institution: testStudent.institution,
      university: 'Autonomous Institute affiliated to VTU',
      current_year: 3,
      current_semester: 6,
      admission_year: 2023,
      expected_graduation_year: 2027,
      study_mode: 'FULL_TIME',
      education_status: 'Full-time Regular',
      current_cgpa: 8.85,
      cgpa_scale: 10.0,
      current_subjects: [
        'Database Management Systems',
        'Operating Systems & Kernels',
        'Computer Networks & Protocols',
        'Distributed Systems',
      ],
    });

    expect(edu.degree).toBe('B.Tech');
    expect(edu.institution).toBe(testStudent.institution);
    expect(edu.current_cgpa).toBe(8.85);
    expect(edu.cgpa_scale).toBe(10.0);

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'EDUCATION_BACKGROUND', true, false);
    expect(updated.current_step).toBe('SEMESTER_SYLLABUS');
  });

  // ==========================================================================
  // 5. FORM 4: SEMESTER, SUBJECTS, AND SYLLABUS
  // ==========================================================================
  it('5. completes Form 4 (Subjects, Credits, Syllabus Regulation & Exam Dates)', async () => {
    const sem = await OnboardingService.saveSemesterSyllabus(testStudent.id, {
      academic_year: '2025-2026',
      semester_number: 6,
      semester_start_date: '2026-01-15',
      semester_end_date: '2026-05-30',
      syllabus_reference: 'NITK Autonomous B.Tech Scheme R22',
      subjects: [
        {
          id: 'sub_cs301',
          name: 'Database Management Systems',
          code: 'CS301',
          credits: 4,
          subject_type: 'THEORY',
          syllabus_units: [
            { unit_number: 1, title: 'Relational Model & Algebra', topics: ['Tuple Calculus', 'SQL DDL/DML'] },
            { unit_number: 2, title: 'Indexing & Transactions', topics: ['B+ Trees', 'ACID Properties'] },
          ],
        },
        {
          id: 'sub_cs302',
          name: 'Operating Systems & Kernels',
          code: 'CS302',
          credits: 4,
          subject_type: 'THEORY',
          syllabus_units: [
            { unit_number: 1, title: 'Processes & Concurrency', topics: ['Process Scheduling', 'Deadlocks'] },
          ],
        },
      ],
      academic_dates: [
        { id: 'mid1', label: 'Mid-Semester Exam 1', date: '2026-04-10', type: 'INTERNAL_EXAM' },
        { id: 'final', label: 'End Semester Final Exam', date: '2026-05-25', type: 'END_SEMESTER' },
      ],
    });

    expect(sem.subjects.length).toBe(2);
    expect(sem.academic_dates.length).toBe(2);
    expect(sem.syllabus_reference).toContain('NITK');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'SEMESTER_SYLLABUS', true, false);
    expect(updated.current_step).toBe('TECHNICAL_SKILLS');
  });

  // ==========================================================================
  // 6. FORM 5: TECHNICAL SKILLS AND PROFICIENCY
  // ==========================================================================
  it('6. completes Form 5 (Skills Self-Assessment, Levels, and Certifications)', async () => {
    const skills = await OnboardingService.saveSkillsAssessment(testStudent.id, {
      skills: [
        { skill_name: 'Python', skill_category: 'Languages', self_reported_level: 'ADVANCED', is_custom: false },
        { skill_name: 'Go (Golang)', skill_category: 'Languages', self_reported_level: 'INTERMEDIATE', is_custom: false },
        { skill_name: 'Data Structures & Algorithms', skill_category: 'CS Fundamentals', self_reported_level: 'ADVANCED', is_custom: false },
        { skill_name: 'Distributed Systems', skill_category: 'CS Fundamentals', self_reported_level: 'INTERMEDIATE', is_custom: false },
      ],
      additional_skills: ['Docker', 'Kubernetes'],
      certifications: ['AWS Certified Cloud Practitioner'],
      practical_experience: 'Built 2 microservices in Go and solved 200+ LeetCode problems',
      skills_to_improve: ['Dynamic Programming', 'Distributed Consensus'],
    });

    expect(skills.skills.length).toBe(4);
    expect(skills.skills[0].self_reported_level).toBe('ADVANCED');
    expect(skills.certifications).toContain('AWS Certified Cloud Practitioner');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'TECHNICAL_SKILLS', true, false);
    expect(updated.current_step).toBe('INTERESTS_TOPICS');
  });

  // ==========================================================================
  // 7. FORM 6: INTERESTS, LEARNING TOPICS, AND KNOWLEDGE AREAS
  // ==========================================================================
  it('7. completes Form 6 (Domains of Interest, AI/ML Focus & Lab Preferences)', async () => {
    const prefs = await OnboardingService.saveLearningPreferences(testStudent.id, {
      topics_of_interest: ['Distributed Systems', 'Cloud Infrastructure', 'AI & Machine Learning'],
      favorite_subjects: ['Operating Systems', 'Database Management Systems'],
      preferred_content_format: ['Interactive Code Sandboxes', 'Deep Technical Breakdowns'],
    });

    expect(prefs.topics_of_interest).toContain('Distributed Systems');
    expect(prefs.favorite_subjects).toContain('Operating Systems');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'INTERESTS_TOPICS', true, false);
    expect(updated.current_step).toBe('CAREER_GOALS');
  });

  // ==========================================================================
  // 8. FORM 7: CAREER GOALS AND TARGET ROLES
  // ==========================================================================
  it('8. completes Form 7 (Target Roles, Dream Companies, Work Mode & Timeline)', async () => {
    const goals = await OnboardingService.saveCareerGoals(testStudent.id, {
      target_job_role: 'Software Development Engineer (SDE)',
      career_directions: ['SOFTWARE_DEVELOPMENT', 'FULLSTACK_DEVELOPMENT', 'AI_ML'],
      target_companies: ['Google', 'Microsoft', 'Atlassian', 'Uber'],
      preferred_industry: 'Cloud Infrastructure / Distributed Systems',
      preferred_location: 'Bengaluru / Remote',
      work_mode_preference: 'HYBRID',
      employment_type_preference: 'BOTH',
      placement_timeline: 'Summer 2026 Internship & 2027 Full-Time',
      desired_technical_skills: ['DSA & Problem Solving', 'System Design', 'Core CS Fundamentals'],
      entrepreneurship_interest: true,
      long_term_goal: 'Principal Architect or Tech Co-founder',
    });

    expect(goals.target_job_role).toBe('Software Development Engineer (SDE)');
    expect(goals.target_companies).toContain('Google');
    expect(goals.work_mode_preference).toBe('HYBRID');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'CAREER_GOALS', true, false);
    expect(updated.current_step).toBe('LEARNING_GOALS');
  });

  // ==========================================================================
  // 9. FORM 8: LEARNING GOALS AND PERSONAL DEVELOPMENT
  // ==========================================================================
  it('9. completes Form 8 (Milestones, Short-Term Goals & Success Metrics)', async () => {
    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'LEARNING_GOALS', true, false);
    expect(updated.current_step).toBe('AI_PREFERENCES');
  });

  // ==========================================================================
  // 10. FORM 9: LEARNING PREFERENCES AND AI PERSONALIZATION
  // ==========================================================================
  it('10. completes Form 9 (Explanation Style, Depth, Language & Adaptive Difficulty)', async () => {
    const prefs = await OnboardingService.saveLearningPreferences(testStudent.id, {
      learning_style: 'HANDS_ON',
      explanation_depth: 'DEEP_DIVE',
      preferred_explanation_language: 'English',
      practical_coding_preference: true,
      visual_preference: true,
      step_by_step_preference: true,
      difficulty_level: 'ADAPTIVE',
      theory_practice_balance: '70% Practical Hands-on / 30% Theory',
      ai_response_length: 'BALANCED',
    });

    expect(prefs.learning_style).toBe('HANDS_ON');
    expect(prefs.explanation_depth).toBe('DEEP_DIVE');
    expect(prefs.practical_coding_preference).toBe(true);

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'AI_PREFERENCES', true, false);
    expect(updated.current_step).toBe('STUDY_SCHEDULE');
  });

  // ==========================================================================
  // 11. FORM 10: STUDY SCHEDULE AND AVAILABILITY
  // ==========================================================================
  it('11. completes Form 10 (Daily Hours, Available Days, Pomodoro & Reminder Settings)', async () => {
    const constraints = await OnboardingService.saveStudyConstraints(testStudent.id, {
      daily_study_hours: 3.0,
      weekly_study_hours: 21.0,
      available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      preferred_session_duration: 45,
      break_preference: '10 min break every 45 min',
      study_reminders_enabled: true,
      deadline_reminders_enabled: true,
      exam_period_hours: 6.0,
      budget_preference: 'FREE_ONLY',
      preferred_free_resources: ['MIT OCW', 'NPTEL', 'GitHub Docs'],
    });

    expect(constraints.daily_study_hours).toBe(3.0);
    expect(constraints.preferred_session_duration).toBe(45);
    expect(constraints.study_reminders_enabled).toBe(true);

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'STUDY_SCHEDULE', true, false);
    expect(updated.current_step).toBe('COURSE_MATERIALS');
  });

  // ==========================================================================
  // 12. FORM 11: COURSES, STUDY MATERIALS, AND DOCUMENT PREFERENCES
  // ==========================================================================
  it('12. completes Form 11 (Note Formats, Flashcards, Quiz Difficulty & Citation Styles)', async () => {
    const prefs = await OnboardingService.saveLearningPreferences(testStudent.id, {
      note_format_preference: 'Summary + Key Takeaways + Code Syntax',
      flashcard_format_preference: 'Front/Back Concept Q&A with Memory Hints',
      quiz_difficulty_preference: 'Tier-1 Placement & GATE level difficulty',
      document_summary_length: 'In-depth Chapter Breakdown',
      citation_style_preference: 'IEEE',
      difficult_topics: ['Compiler Design', 'Distributed Systems'],
    });

    expect(prefs.note_format_preference).toContain('Key Takeaways');
    expect(prefs.citation_style_preference).toBe('IEEE');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'COURSE_MATERIALS', true, false);
    expect(updated.current_step).toBe('PROJECT_PORTFOLIO');
  });

  // ==========================================================================
  // 13. FORM 12: PROJECT PORTFOLIO AND PRACTICAL EXPERIENCE
  // ==========================================================================
  it('13. completes Form 12 (Portfolio Projects, Technologies, and Repositories)', async () => {
    const proj = await OnboardingService.addPortfolioProject(testStudent.id, {
      title: 'Distributed In-Memory Key-Value Store',
      description: 'LSM-tree storage engine with Raft consensus protocol in Go.',
      technologies: ['Go', 'Raft', 'gRPC', 'Docker'],
      status: 'COMPLETED',
      repository_url: 'https://github.com/kavya-sharma/distributed-kv',
      demo_url: 'https://kv-demo.dev',
      skills_demonstrated: ['Distributed Systems', 'Go Concurrency'],
    });

    expect(proj.title).toBe('Distributed In-Memory Key-Value Store');
    expect(proj.student_id).toBe(testStudent.id);

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'PROJECT_PORTFOLIO', true, false);
    expect(updated.current_step).toBe('APPLICATIONS_LINKS');
  });

  // ==========================================================================
  // 14. FORM 13: CAREER APPLICATIONS AND EXTERNAL PROFILE LINKS
  // ==========================================================================
  it('14. completes Form 13 (External Profile URLs & Internship Application Tracker)', async () => {
    const goals = await OnboardingService.saveCareerGoals(testStudent.id, {
      github_url: 'https://github.com/kavya-sharma',
      linkedin_url: 'https://linkedin.com/in/kavya-sharma',
      leetcode_url: 'https://leetcode.com/u/kavya_sharma',
      hackerrank_url: 'https://hackerrank.com/kavya_sharma',
      codechef_url: 'https://codechef.com/users/kavya_sharma',
      portfolio_urls: ['https://kavya-sharma.dev'],
    });

    expect(goals.github_url).toBe('https://github.com/kavya-sharma');
    expect(goals.leetcode_url).toBe('https://leetcode.com/u/kavya_sharma');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'APPLICATIONS_LINKS', true, false);
    expect(updated.current_step).toBe('RESEARCH_COMMUNITY');
  });

  // ==========================================================================
  // 15. FORM 14: RESEARCH, KNOWLEDGE BASE, AND COMMUNITY INTERESTS
  // ==========================================================================
  it('15. completes Form 14 (Research Topics, Scholarly Sources & Community Discussions)', async () => {
    const goals = await OnboardingService.saveCareerGoals(testStudent.id, {
      research_topics: ['Multi-Agent LLM Systems', 'Graph Neural Networks in Distributed Caching'],
      scholarly_sources: ['arXiv.org', 'IEEE Xplore', 'ACM Digital Library'],
      community_interests: ['Doubts & Algorithmic Q&A', 'Open Source Project Collabs', 'Interview Experience Reviews'],
    });

    expect(goals.research_topics?.length).toBe(2);
    expect(goals.scholarly_sources).toContain('arXiv.org');

    const updated = await OnboardingService.updateOnboardingStep(testStudent.id, 'RESEARCH_COMMUNITY', true, false);
    expect(updated.current_step).toBe('FINAL_REVIEW');
  });

  // ==========================================================================
  // 16. FORM 15: REVIEW, PRIVACY, NOTIFICATIONS, AND COMPLETION
  // ==========================================================================
  it('16. completes Form 15 (Review, Notification Preferences, Consent & Final Activation)', async () => {
    await OnboardingService.saveCareerGoals(testStudent.id, {
      notification_preferences: {
        study_reminders: true,
        revision_reminders: true,
        deadline_reminders: true,
        goal_reminders: true,
        community_notifications: false,
      },
    });

    const completed = await OnboardingService.completeOnboarding(testStudent.id);
    expect(completed.is_complete).toBe(true);
    expect(completed.completed_at).not.toBeNull();
    expect(completed.current_step).toBe('FINAL_REVIEW');

    const finalStep = completed.steps.find((s) => s.step_id === 'FINAL_REVIEW');
    expect(finalStep?.completed).toBe(true);
  });

  // ==========================================================================
  // 17. SKIP CAPABILITY & RESUME FUNCTIONALITY
  // ==========================================================================
  it('17. supports skipping optional sections and resuming onboarding cleanly', async () => {
    const skipStudentId = 'std_test_skip_and_resume_002';
    await db.createStudent({
      id: skipStudentId,
      name: 'Priya Test',
      email: `${skipStudentId}@btech.edu`,
      password_hash: await Security.hashPassword('Password123!'),
      branch: 'AI/ML',
      semester: 4,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    // Skip optional technical skills
    const updated = await OnboardingService.updateOnboardingStep(skipStudentId, 'TECHNICAL_SKILLS', false, true);
    const skillStep = updated.steps.find((s) => s.step_id === 'TECHNICAL_SKILLS');
    expect(skillStep?.skipped).toBe(true);
    expect(skillStep?.completed).toBe(false);

    // Retrieve status as if browser refreshed or session resumed
    const resumed = await OnboardingService.getOnboardingStatus(skipStudentId);
    expect(resumed.student_id).toBe(skipStudentId);
    const resumedSkill = resumed.steps.find((s) => s.step_id === 'TECHNICAL_SKILLS');
    expect(resumedSkill?.skipped).toBe(true);
  });

  // ==========================================================================
  // 18. SYNCHRONIZATION INTO DOWNSTREAM PLATFORM MODULES
  // ==========================================================================
  it('18. synchronizes verified registration inputs into downstream platform modules without inventing fake activity', async () => {
    // 1. Unified Intelligence Context
    const context = await OnboardingService.buildIntelligenceContext(testStudent.id);
    expect(context.student_id).toBe(testStudent.id);
    expect(context.education?.branch).toBe(testStudent.branch);
    expect(context.education?.current_semester).toBe(6);
    expect(context.career_goals?.target_job_role).toBe('Software Development Engineer (SDE)');
    expect(context.preferences?.learning_style).toBe('HANDS_ON');
    expect(context.study_constraints?.daily_study_hours).toBe(3.0);

    // 2. AI Tutor Formatted Prompt Context
    const promptCtx = await StudentContextEngine.buildContext(testStudent.id, { domain: 'GENERAL' });
    const formatted = StudentContextEngine.formatPromptContext(promptCtx);
    expect(formatted).toContain('Computer Science & Engineering (CSE)');
    expect(formatted).toContain('Software Development Engineer (SDE)');

    // 3. Semester Command Center
    const semesterCenter = semesterCommandCenterService.getOverview(testStudent.id);
    expect(semesterCenter.config.semester_number).toBe(6);
    expect(semesterCenter.subjects.length).toBeGreaterThanOrEqual(1);

    // 4. Student Dashboard
    const dashboard = await DashboardService.getStudentDashboard(testStudent.id);
    expect(dashboard.student.name).toBe(testStudent.name);
    expect(dashboard.student.semester).toBe(6);
  });
});
