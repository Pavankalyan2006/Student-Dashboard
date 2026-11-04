import { describe, it, expect } from 'vitest';
import { Security } from '../../server/core/security';

describe('Authentication & Security Foundation', () => {
  it('hashes passwords securely using bcrypt', async () => {
    const plain = 'SecretPassword123!';
    const hash = await Security.hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true);

    const match = await Security.comparePassword(plain, hash);
    expect(match).toBe(true);

    const failMatch = await Security.comparePassword('WrongPassword', hash);
    expect(failMatch).toBe(false);
  });

  it('generates and verifies JWT tokens with correct claims', () => {
    const payload = {
      userId: 'std_01j8k9x2p4',
      email: 'student@btech.edu',
      role: 'STUDENT' as const,
      name: 'Pavan Kalyan V.',
    };

    const token = Security.generateAccessToken(payload);
    expect(typeof token).toBe('string');

    const verified = Security.verifyAccessToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
    expect(verified.role).toBe('STUDENT');
  });

  it('rejects invalid or tampered tokens', () => {
    expect(() => {
      Security.verifyAccessToken('invalid.jwt.token');
    }).toThrow();
  });

  describe('Student Registration & Unique Curriculum Personalization Flow', () => {
    it('creates a student with complete academic profile and automatically initializes curriculum syllabus', async () => {
      const { db } = await import('../../server/db/database');
      const { OnboardingService } = await import('../../server/services/onboardingService');
      const { DashboardService } = await import('../../server/services/dashboard');
      const { semesterCommandCenterService } = await import('../../server/services/semesterCommandCenterService');
      const { LearningModulesService } = await import('../../server/services/learningModulesService');

      await db.initialize();

      // Student 1: AI & Machine Learning student
      const aiStudent = await db.createStudent({
        id: 'std_test_aiml_student',
        name: 'Rohan Sharma',
        email: 'rohan.aiml@btech.edu',
        password_hash: await Security.hashPassword('Password123!'),
        branch: 'Artificial Intelligence & Machine Learning (AI/ML)',
        semester: 5,
        role: 'STUDENT',
        is_active: true,
        status: 'ACTIVE',
      } as any);

      await OnboardingService.saveEducationProfile(aiStudent.id, {
        degree: 'B.Tech',
        branch: 'Artificial Intelligence & Machine Learning (AI/ML)',
        institution: 'NIT Warangal',
        current_year: 3,
        current_semester: 5,
        admission_year: 2023,
        expected_graduation_year: 2027,
        study_mode: 'FULL_TIME',
      });

      await OnboardingService.saveCareerGoals(aiStudent.id, {
        target_job_role: 'AI & Machine Learning Engineer',
        career_directions: ['AI_ML'],
      });

      // 1. Verify that curriculum syllabus is automatically populated with AI/ML subjects
      const aiSyllabus = OnboardingService.getSemesterSyllabusSync(aiStudent.id);
      expect(aiSyllabus).not.toBeNull();
      expect(aiSyllabus?.subjects.length).toBeGreaterThanOrEqual(3);
      expect(aiSyllabus?.subjects.some((s) => s.name.includes('Machine Learning') || s.name.includes('Deep Learning'))).toBe(true);

      // 2. Verify that Dashboard data dynamically reflects AI/ML subjects and target role
      const aiDashboard = await DashboardService.getStudentDashboard(aiStudent.id);
      expect(aiDashboard.student.branch).toBe('Artificial Intelligence & Machine Learning (AI/ML)');
      expect(aiDashboard.student.semester).toBe(5);
      expect(aiDashboard.course_progress.some((c) => c.name.includes('Machine Learning') || c.name.includes('Deep Learning'))).toBe(true);
      expect(aiDashboard.today_plan.length).toBeGreaterThan(0);
      expect(aiDashboard.student.focus_topic).toContain('AI & Machine Learning Engineer');

      // 3. Verify that Semester Command Center reflects the AI/ML curriculum
      const aiCommandCenter = semesterCommandCenterService.getOverview(aiStudent.id);
      expect(aiCommandCenter.subjects.some((s) => s.name.includes('Machine Learning') || s.name.includes('Deep Learning'))).toBe(true);

      // 4. Verify that Study Planner dynamically seeds tasks tailored to AI/ML
      const aiStudyPlans = await LearningModulesService.getStudyPlans(aiStudent.id);
      expect(aiStudyPlans.length).toBeGreaterThan(0);
      expect(aiStudyPlans[0].tasks.some((t) => t.subject.includes('Machine Learning') || t.subject.includes('Deep Learning') || t.title.includes('Machine Learning'))).toBe(true);
    }, 15000);

    it('ensures distinct students with different branches receive unique curriculums and dashboard responses', async () => {
      const { db } = await import('../../server/db/database');
      const { OnboardingService } = await import('../../server/services/onboardingService');
      const { DashboardService } = await import('../../server/services/dashboard');

      await db.initialize();

      // Student 2: Electronics & Communication student
      const eceStudent = await db.createStudent({
        id: 'std_test_ece_student',
        name: 'Pooja Reddy',
        email: 'pooja.ece@btech.edu',
        password_hash: await Security.hashPassword('Password123!'),
        branch: 'Electronics & Communication Engineering (ECE)',
        semester: 4,
        role: 'STUDENT',
        is_active: true,
        status: 'ACTIVE',
      } as any);

      await OnboardingService.saveEducationProfile(eceStudent.id, {
        degree: 'B.Tech',
        branch: 'Electronics & Communication Engineering (ECE)',
        institution: 'IIT Madras',
        current_year: 2,
        current_semester: 4,
        admission_year: 2024,
        expected_graduation_year: 2028,
        study_mode: 'FULL_TIME',
      });

      const eceSyllabus = OnboardingService.getSemesterSyllabusSync(eceStudent.id);
      expect(eceSyllabus).not.toBeNull();
      expect(eceSyllabus?.subjects.some((s) => s.name.includes('Signals') || s.name.includes('Digital') || s.name.includes('Microprocessor'))).toBe(true);

      const eceDashboard = await DashboardService.getStudentDashboard(eceStudent.id);
      expect(eceDashboard.student.branch).toBe('Electronics & Communication Engineering (ECE)');
      expect(eceDashboard.student.semester).toBe(4);
      expect(eceDashboard.course_progress.some((c) => c.name.includes('Signals') || c.name.includes('Digital') || c.name.includes('Microprocessor'))).toBe(true);
    }, 15000);
  });
});
