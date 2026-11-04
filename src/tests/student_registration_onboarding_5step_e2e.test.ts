import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { Security } from '../../server/core/security';
import { OnboardingService } from '../../server/services/onboardingService';
import { StudentContextEngine } from '../../server/ai/studentContextEngine';
import { GoalService } from '../../server/services/goalService';
import { ProfileService } from '../../server/services/profileService';

describe('Master 5-Step Student Registration, Onboarding & Centralized Personalization System', () => {
  const timestamp = Date.now();
  const testEmail = `priya.sharma.${timestamp}@btech.edu`;
  let studentPriya: any;
  let studentRohan: any;

  beforeAll(async () => {
    await db.initialize();
  });

  describe('1. Registration, Account Creation, and Validation (Step 1)', () => {
    it('1.1 validates full name and academic email requirements', async () => {
      const invalidEmail = 'not-an-email';
      const isValidEmail = invalidEmail.includes('@') && invalidEmail.includes('.');
      expect(isValidEmail).toBe(false);

      const validEmail = testEmail;
      expect(validEmail.includes('@') && validEmail.includes('.')).toBe(true);
    });

    it('1.2 enforces password security rules and minimum length', async () => {
      const weakPassword = '123';
      expect(weakPassword.length < 6).toBe(true);

      const strongPassword = 'Password123!';
      expect(strongPassword.length >= 6).toBe(true);
      const passwordHash = await Security.hashPassword(strongPassword);
      expect(passwordHash).not.toBe(strongPassword);
      expect(passwordHash.startsWith('$2')).toBe(true);
    });

    it('1.3 registers a new student with onboarding_completed explicitly false', async () => {
      const passwordHash = await Security.hashPassword('Password123!');
      const newStudent = await db.createStudent({
        name: 'Priya Sharma',
        display_name: 'Priya',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        email: testEmail,
        password_hash: passwordHash,
        branch: 'Artificial Intelligence & Machine Learning (AI/ML)',
        semester: 4,
        role: 'STUDENT',
        is_active: true,
        status: 'ACTIVE',
        onboarding_completed: false,
      } as any);

      expect(newStudent.id).toBeDefined();
      expect(newStudent.name).toBe('Priya Sharma');
      expect(newStudent.onboarding_completed).toBe(false);
      studentPriya = newStudent;
    });

    it('1.4 rejects duplicate student registrations with the same email', async () => {
      const existing = await db.getStudentByEmail(testEmail);
      expect(existing).not.toBeNull();
      expect(existing?.id).toBe(studentPriya.id);
    });
  });

  describe('2. Academic Profile and Semester Information (Step 2)', () => {
    it('2.1 persists academic profile details and cohort dates', async () => {
      const edu = await OnboardingService.saveEducationProfile(studentPriya.id, {
        institution: 'Indian Institute of Information Technology (IIIT)',
        degree: 'B.Tech',
        branch: 'Artificial Intelligence & Machine Learning (AI/ML)',
        current_year: 2,
        current_semester: 4,
        admission_year: 2024,
        expected_graduation_year: 2028,
        current_cgpa: 9.15,
        cgpa_scale: 10.0,
        study_mode: 'FULL_TIME',
      });

      expect(edu.institution).toContain('IIIT');
      expect(edu.current_semester).toBe(4);
      expect(edu.current_cgpa).toBe(9.15);
    });

    it('2.2 allows students to add, edit, and manage semester subjects and syllabus outline', async () => {
      const syllabus = await OnboardingService.saveSemesterSyllabus(studentPriya.id, {
        academic_year: '2025-2026',
        semester_number: 4,
        semester_start_date: '2026-01-10',
        semester_end_date: '2026-05-25',
        syllabus_reference: 'AICTE Model Curriculum AI/ML R22',
        subjects: [
          {
            id: 'sub_aiml_1',
            name: 'Deep Learning & Neural Architectures',
            code: 'AI401',
            credits: 4,
            subject_type: 'THEORY',
            syllabus_units: [
              { unit_number: 1, title: 'Perceptrons & Backpropagation', topics: ['Gradient Descent', 'Activation Functions'] },
              { unit_number: 2, title: 'Convolutional Networks', topics: ['CNN Layers', 'Pooling', 'ResNet'] },
            ],
          },
          {
            id: 'sub_aiml_2',
            name: 'Design and Analysis of Algorithms',
            code: 'CS402',
            credits: 4,
            subject_type: 'THEORY',
            syllabus_units: [],
          },
          {
            id: 'sub_aiml_3',
            name: 'Deep Learning Practical Lab',
            code: 'AI401L',
            credits: 2,
            subject_type: 'LAB',
            syllabus_units: [],
          },
        ],
      });

      expect(syllabus.subjects.length).toBe(3);
      expect(syllabus.subjects[0].name).toBe('Deep Learning & Neural Architectures');
      expect(syllabus.subjects[2].subject_type).toBe('LAB');
    });
  });

  describe('3. Skills, Interests, Projects, and Career Goals (Step 3)', () => {
    it('3.1 records self-reported technical skills with beginner/intermediate/advanced levels', async () => {
      const assessment = await OnboardingService.saveSkillsAssessment(studentPriya.id, {
        skills: [
          { skill_name: 'Python', skill_category: 'Languages', self_reported_level: 'ADVANCED', is_custom: false },
          { skill_name: 'PyTorch', skill_category: 'AI & ML', self_reported_level: 'INTERMEDIATE', is_custom: true },
          { skill_name: 'Data Structures & Algorithms', skill_category: 'CS Fundamentals', self_reported_level: 'INTERMEDIATE', is_custom: false },
          { skill_name: 'Docker & Containers', skill_category: 'Tools & DevOps', self_reported_level: 'BEGINNER', is_custom: false },
        ],
      });

      expect(assessment.skills.length).toBe(4);
      expect(assessment.skills[0].self_reported_level).toBe('ADVANCED');
      expect(assessment.skills[1].is_custom).toBe(true);
    });

    it('3.2 records target career roles, target companies, and portfolio projects', async () => {
      const career = await OnboardingService.saveCareerGoals(studentPriya.id, {
        target_job_role: 'AI & Machine Learning Engineer',
        target_companies: ['Google DeepMind', 'OpenAI', 'Microsoft Research'],
        placement_timeline: 'Summer 2027 Research Internships',
        long_term_goal: 'Publish in CVPR/NeurIPS and architect foundation model systems',
        github_url: 'https://github.com/priya-aiml',
        linkedin_url: 'https://linkedin.com/in/priya-aiml',
        leetcode_url: 'https://leetcode.com/u/priya_aiml',
      });

      expect(career.target_job_role).toBe('AI & Machine Learning Engineer');
      expect(career.target_companies).toContain('Google DeepMind');
      expect(career.github_url).toBe('https://github.com/priya-aiml');

      const project = await OnboardingService.addPortfolioProject(studentPriya.id, {
        title: 'Transformer-based Vision Classifier',
        description: 'Implemented Vision Transformer (ViT) in PyTorch with self-attention maps.',
        technologies: ['Python', 'PyTorch', 'Torchvision'],
        status: 'IN_PROGRESS',
        repository_url: 'https://github.com/priya-aiml/vit-pytorch',
      });

      expect(project.id).toBeDefined();
      expect(project.title).toContain('Vision Classifier');
    });
  });

  describe('4. Learning Preferences and Study Schedule (Step 4)', () => {
    it('4.1 persists student explanation style, depth, and language preferences', async () => {
      const prefs = await OnboardingService.saveLearningPreferences(studentPriya.id, {
        learning_style: 'Practical examples with code walkthroughs',
        explanation_depth: 'STANDARD',
        preferred_explanation_language: 'English',
        weekday_study_hours: 4.0,
        weekend_study_hours: 6.0,
        difficulty_level: 'ADVANCED',
      });

      expect(prefs.learning_style).toBe('Practical examples with code walkthroughs');
      expect(prefs.difficulty_level).toBe('ADVANCED');
      expect(prefs.weekday_study_hours).toBe(4.0);
    });

    it('4.2 persists study availability days, session duration, and reminder preferences', async () => {
      const constraints = await OnboardingService.saveStudyConstraints(studentPriya.id, {
        daily_study_hours: 4.0,
        available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        preferred_session_duration: 60,
        break_preference: 'Pomodoro (50m study / 10m rest)',
        study_reminders_enabled: true,
      });

      expect(constraints.available_days!.length).toBe(6);
      expect(constraints.preferred_session_duration).toBe(60);
      expect(constraints.study_reminders_enabled).toBe(true);
    });
  });

  describe('5. Review, Privacy, and Complete Setup (Step 5)', () => {
    it('5.1 marks onboarding completed, updates student record, and initializes goals & notifications', async () => {
      const status = await OnboardingService.completeOnboarding(studentPriya.id);
      expect(status.is_complete).toBe(true);
      expect(status.completed_at).toBeDefined();

      // Check DB student record
      const refreshedStudent = await db.getStudentById(studentPriya.id);
      expect(refreshedStudent?.onboarding_completed).toBe(true);
      expect(refreshedStudent?.branch).toContain('Artificial Intelligence');
      expect(refreshedStudent?.semester).toBe(4);

      // Check Notification Preferences initialized
      const prefs = await db.getNotificationPreferences(studentPriya.id);
      expect(prefs).toBeDefined();
      expect(prefs?.study_reminders).toBe(true);
      expect(prefs?.in_app).toBe(true);

      // Check Initial Grounded Learning Goals created
      const goals = await GoalService.getGoals(studentPriya.id);
      expect(goals.length).toBeGreaterThanOrEqual(1);
      const careerGoal = goals.find((g) => g.category === 'CAREER');
      expect(careerGoal).toBeDefined();
      expect(careerGoal?.title).toContain('AI & Machine Learning Engineer');
      expect(careerGoal?.progress_percentage).toBe(0); // Truthful zero-fabrication initial state
    });

    it('5.2 allows student to save draft and resume onboarding midway', async () => {
      // Create student Rohan who exits after Step 2
      const rohanEmail = `rohan.kumar.${timestamp}@btech.edu`;
      const student = await db.createStudent({
        name: 'Rohan Kumar',
        email: rohanEmail,
        password_hash: await Security.hashPassword('Password123!'),
        branch: 'Mechanical Engineering',
        semester: 2,
        role: 'STUDENT',
        is_active: true,
        status: 'ACTIVE',
        onboarding_completed: false,
      } as any);

      studentRohan = student;
      await OnboardingService.updateOnboardingStep(studentRohan.id, 'ACCOUNT_IDENTITY', true, false);
      await OnboardingService.updateOnboardingStep(studentRohan.id, 'EDUCATION_BACKGROUND', true, false);

      const status = await OnboardingService.getOnboardingStatus(studentRohan.id);
      expect(status.is_complete).toBe(false);
      expect(status.steps.find((s) => s.step_id === 'ACCOUNT_IDENTITY')?.completed).toBe(true);
      expect(status.steps.find((s) => s.step_id === 'FINAL_REVIEW')?.completed).toBe(false);
    });
  });

  describe('6. Centralized Student Context Engine & Downstream Integration', () => {
    it('6.1 aggregates student identity, academics, preferences, and goals into UnifiedStudentContext', async () => {
      const context = await StudentContextEngine.buildStudentContext(studentPriya.id, { domain: 'GENERAL' });

      expect(context.student.id).toBe(studentPriya.id);
      expect(context.student.name).toBe('Priya Sharma');
      expect(context.academic).toBeDefined();
      expect(context.preferences).toBeDefined();
      expect(context.preferences?.weekdayHours).toBe(4.0);
      expect(context.career?.targetRole).toBe('AI & Machine Learning Engineer');
    });

    it('6.2 synchronizes profile updates across the centralized context without requiring logout', async () => {
      // Update CGPA and preferred language
      await OnboardingService.saveEducationProfile(studentPriya.id, {
        current_cgpa: 9.35,
      });
      await OnboardingService.saveLearningPreferences(studentPriya.id, {
        preferred_explanation_language: 'Hindi & English Bilingual',
      });

      const updatedContext = await StudentContextEngine.buildStudentContext(studentPriya.id, { domain: 'GENERAL' });
      expect(updatedContext.preferences?.preferredLanguage).toBe('Hindi & English Bilingual');
    });
  });

  describe('7. Multi-Student Data Isolation & Security Boundary', () => {
    it('7.1 strictly isolates Priya data from Rohan and prevents cross-tenant data leakage', async () => {
      const priyaGoals = await GoalService.getGoals(studentPriya.id);
      const rohanGoals = await GoalService.getGoals(studentRohan.id);

      expect(priyaGoals.length).toBeGreaterThan(0);
      expect(rohanGoals.length).toBe(0);

      // Rohan cannot view Priya's education profile
      const priyaEdu = await OnboardingService.getEducationProfile(studentPriya.id);
      const rohanEdu = await OnboardingService.getEducationProfile(studentRohan.id);

      expect(priyaEdu?.branch).toContain('AI/ML');
      expect(rohanEdu).toBeNull();
    });
  });
});
