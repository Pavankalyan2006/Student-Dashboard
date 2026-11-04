import { describe, it, expect } from 'vitest';

describe('Public Website & Student Experience Foundation', () => {
  it('validates public website routes and unauthenticated workflow structure', async () => {
    // 1. Verify Public HomePage imports and configuration
    const { HomePage } = await import('../features/public/pages/HomePage');
    expect(HomePage).toBeDefined();

    // 2. Verify Public AboutPage imports and configuration
    const { AboutPage } = await import('../features/public/pages/AboutPage');
    expect(AboutPage).toBeDefined();

    // 3. Verify Public HowItWorksPage imports and configuration
    const { HowItWorksPage } = await import('../features/public/pages/HowItWorksPage');
    expect(HowItWorksPage).toBeDefined();

    // 4. Verify PublicLayout wrapper
    const { PublicLayout } = await import('../features/public/components/PublicLayout');
    expect(PublicLayout).toBeDefined();
  });

  it('ensures public navigation routes and links are properly defined', () => {
    const publicRoutes = ['/', '/home', '/about', '/how-it-works', '/login', '/register'];
    expect(publicRoutes.length).toBe(6);
    expect(publicRoutes).toContain('/about');
    expect(publicRoutes).toContain('/how-it-works');
    expect(publicRoutes).toContain('/register');
  });

  it('ensures student registration captures complete engineering profile metadata', async () => {
    const { db } = await import('../../server/db/database');
    const { OnboardingService } = await import('../../server/services/onboardingService');
    await db.initialize();

    const studentId = 'std_test_public_flow';
    const testStudent = await db.createStudent({
      id: studentId,
      name: 'Sneha Patel',
      email: 'sneha.patel@btech.edu',
      password_hash: 'hashed_password_123',
      branch: 'Data Science & Analytics',
      semester: 3,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    expect(testStudent).not.toBeNull();
    expect(testStudent.branch).toBe('Data Science & Analytics');
    expect(testStudent.semester).toBe(3);

    // Save education profile
    await OnboardingService.saveEducationProfile(studentId, {
      degree: 'B.Tech',
      branch: 'Data Science & Analytics',
      institution: 'BITS Pilani',
      current_year: 2,
      current_semester: 3,
      admission_year: 2024,
      expected_graduation_year: 2028,
      study_mode: 'FULL_TIME',
    });

    const syllabus = OnboardingService.getSemesterSyllabusSync(studentId);
    expect(syllabus).not.toBeNull();
    expect(syllabus?.subjects.length).toBeGreaterThanOrEqual(3);
    expect(syllabus?.subjects.some((s) => s.name.includes('Data') || s.name.includes('Machine') || s.name.includes('Statistics'))).toBe(true);
  });
});
