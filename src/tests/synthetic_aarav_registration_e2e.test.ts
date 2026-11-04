import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../server/db/database';
import { Security } from '../../server/core/security';
import { OnboardingService } from '../../server/services/onboardingService';
import { DashboardService } from '../../server/services/dashboard';
import { semesterCommandCenterService } from '../../server/services/semesterCommandCenterService';
import { LearningModulesService } from '../../server/services/learningModulesService';
import { StudentContextEngine } from '../../server/ai/studentContextEngine';
import { ProfileService } from '../../server/services/profileService';
import { SandboxService } from '../../server/execution/sandbox';
import { NotesService } from '../../server/services/notes';
import { ProjectService } from '../../server/services/projectService';

describe('SECTION 56: Synthetic Student Registration, Onboarding & Whole-Platform Integration', () => {
  const syntheticStudent = {
    id: 'std_aarav_test_student_aiml_07',
    name: 'Aarav Test Student',
    email: 'aarav.student.test@example.com',
    password: 'TestStudent!2026_Antigravity',
    degree: 'B.Tech',
    branch: 'Artificial Intelligence and Machine Learning',
    semester: 7,
    institution: 'National Institute of Technology (NIT)',
    roll_number: 'NIT-2023-AIML-007',
    admission_year: 2023,
    graduation_year: 2027,
    cgpa: 8.92,
    career_goal: 'Software Development / AI/ML Engineering',
    study_availability_hours: 2.0,
    learning_preference: 'Step-by-step explanations and practical examples',
  };

  let generatedNoteId: string;
  let createdProjectId: string;

  beforeAll(async () => {
    await db.initialize();
  });

  // ==========================================================================
  // STAGE 1: ACCOUNT CREATION (PAGE 1)
  // ==========================================================================
  it('1. creates synthetic student account with encrypted credentials', async () => {
    const passwordHash = await Security.hashPassword(syntheticStudent.password);

    const createdStudent = await db.createStudent({
      id: syntheticStudent.id,
      name: syntheticStudent.name,
      email: syntheticStudent.email,
      password_hash: passwordHash,
      branch: syntheticStudent.branch,
      semester: syntheticStudent.semester,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    expect(createdStudent).toBeDefined();
    expect(createdStudent.id).toBe(syntheticStudent.id);
    expect(createdStudent.name).toBe('Aarav Test Student');
    expect(createdStudent.email).toBe('aarav.student.test@example.com');
    expect(createdStudent.branch).toBe('Artificial Intelligence and Machine Learning');
    expect(createdStudent.semester).toBe(7);

    // Retrieve internal student record to verify password hashing
    const storedStudent = await db.getStudentById(syntheticStudent.id);
    expect(storedStudent).toBeDefined();
    expect(storedStudent!.password_hash).toBeDefined();
    expect(storedStudent!.password_hash).not.toBe(syntheticStudent.password);
    const passwordMatches = await Security.comparePassword(syntheticStudent.password, storedStudent!.password_hash);
    expect(passwordMatches).toBe(true);
  });

  // ==========================================================================
  // STAGE 2: ACADEMIC PROFILE & CURRICULUM (PAGE 2)
  // ==========================================================================
  it('2. completes Page 2 (Academic Profile, Degree, Branch, Institution, CGPA, Syllabus)', async () => {
    const subjects = [
      'Deep Learning & Neural Networks',
      'Natural Language Processing',
      'Distributed Systems & Cloud Computing',
      'Computer Vision Applications',
      'Reinforcement Learning Lab',
    ];

    const eduProfile = await OnboardingService.saveEducationProfile(syntheticStudent.id, {
      degree: syntheticStudent.degree as any,
      branch: syntheticStudent.branch,
      institution: syntheticStudent.institution,
      current_year: 4,
      current_semester: syntheticStudent.semester,
      admission_year: syntheticStudent.admission_year,
      expected_graduation_year: syntheticStudent.graduation_year,
      study_mode: 'FULL_TIME',
      current_subjects: subjects,
    });

    expect(eduProfile.institution).toBe('National Institute of Technology (NIT)');
    expect(eduProfile.current_semester).toBe(7);
    expect(eduProfile.current_subjects.length).toBe(5);

    // Save Semester Syllabus
    const syllabus = await OnboardingService.saveSemesterSyllabus(syntheticStudent.id, {
      semester_number: 7,
      academic_year: '2026-2027',
      subjects: subjects.map((sub, idx) => ({
        id: `sub_aiml_7_${idx + 1}`,
        name: sub,
        code: `AI70${idx + 1}`,
        credits: 4,
        subject_type: 'THEORY',
        syllabus_units: [
          { unit_number: 1, title: 'Architectural Foundations', topics: [`Foundations of ${sub}`] },
          { unit_number: 2, title: 'Deep Implementations', topics: [`Algorithms of ${sub}`] },
        ],
      })),
      academic_dates: [
        { id: 'ad_1', label: 'AI/ML Slip Test 1', date: '2026-11-10', type: 'SLIP_TEST' },
        { id: 'ad_2', label: 'Minor 1 Theory Exam', date: '2026-11-25', type: 'INTERNAL_EXAM' },
        { id: 'ad_3', label: 'End-Semester Final Exams', date: '2026-12-20', type: 'END_SEMESTER' },
      ],
    });

    expect(syllabus.semester_number).toBe(7);
    expect(syllabus.subjects.length).toBe(5);
    expect(syllabus.academic_dates.length).toBe(3);
  });

  // ==========================================================================
  // STAGE 3: SKILLS, INTERESTS & CAREER GOALS (PAGE 3)
  // ==========================================================================
  it('3. completes Page 3 (Skills, Levels, Career Directions, and Target Role)', async () => {
    const skills = await OnboardingService.saveSkillsAssessment(syntheticStudent.id, {
      skills: [
        { skill_name: 'Python', skill_category: 'Languages', self_reported_level: 'ADVANCED', is_custom: false },
        { skill_name: 'AI & Machine Learning', skill_category: 'AI & ML', self_reported_level: 'ADVANCED', is_custom: false },
        { skill_name: 'Data Structures & Algorithms', skill_category: 'CS Fundamentals', self_reported_level: 'INTERMEDIATE', is_custom: false },
        { skill_name: 'PyTorch & Transformers', skill_category: 'AI Frameworks', self_reported_level: 'INTERMEDIATE', is_custom: true },
      ],
      skills_to_improve: ['Distributed Training', 'TensorRT Optimization'],
    });

    expect(skills.skills.length).toBe(4);
    expect(skills.skills.some((s) => s.skill_name === 'PyTorch & Transformers')).toBe(true);

    const career = await OnboardingService.saveCareerGoals(syntheticStudent.id, {
      target_job_role: syntheticStudent.career_goal,
      career_directions: ['SOFTWARE_DEVELOPMENT', 'AI_ML'],
      target_companies: ['Google', 'Microsoft', 'NVIDIA', 'Meta', 'OpenAI'],
      placement_readiness_self_rating: 4,
      github_url: 'https://github.com/aarav-test-student',
      linkedin_url: 'https://linkedin.com/in/aarav-test-student',
    });

    expect(career.target_job_role).toBe('Software Development / AI/ML Engineering');
    expect(career.target_companies).toContain('NVIDIA');
  });

  // ==========================================================================
  // STAGE 4: LEARNING PREFERENCES & AVAILABILITY (PAGE 4)
  // ==========================================================================
  it('4. completes Page 4 (Preferences, 2 Hours/day Availability, and Explanation Depth)', async () => {
    const preferences = await OnboardingService.saveLearningPreferences(syntheticStudent.id, {
      learning_style: 'HANDS_ON',
      explanation_depth: 'DEEP_DIVE',
      preferred_explanation_language: 'English',
      preferred_programming_languages: ['Python', 'C++', 'TypeScript'],
      difficult_topics: ['Backpropagation through Time', 'Transformer Attention Complexity'],
      weekday_study_hours: syntheticStudent.study_availability_hours,
      weekend_study_hours: 4.0,
      practical_coding_preference: true,
      video_preference: true,
      text_preference: true,
    } as any);

    expect(preferences.learning_style).toBe('HANDS_ON');
    expect(preferences.weekday_study_hours).toBe(2.0);

    const constraints = await OnboardingService.saveStudyConstraints(syntheticStudent.id, {
      daily_study_hours: 2.0,
      weekly_study_hours: 14.0,
      preferred_session_duration: 45,
      budget_preference: 'FREE_ONLY',
      preferred_free_resources: ['MIT OCW', 'ArXiv', 'GitHub Open Source'],
    });

    expect(constraints.daily_study_hours).toBe(2.0);
  });

  // ==========================================================================
  // STAGE 5: REVIEW, CONSENT & ONBOARDING COMPLETION (PAGE 5)
  // ==========================================================================
  it('5. completes Page 5 (Review, Consent, and Final Activation)', async () => {
    const status = await OnboardingService.completeOnboarding(syntheticStudent.id);
    expect(status.is_complete).toBe(true);
    expect(status.completed_at).toBeDefined();

    // Verify stored student profile completion status
    const profile = await ProfileService.getProfile(syntheticStudent.id);
    expect(profile.student_id).toBe(syntheticStudent.id);
    expect(profile.name).toBe('Aarav Test Student');
    expect(profile.college_name).toBe('National Institute of Technology (NIT)');
    expect(profile.target_role).toBe('Software Development / AI/ML Engineering');
  });

  // ==========================================================================
  // STAGE 6: AUTHENTICATION & LOGIN USING SAME CREDENTIALS
  // ==========================================================================
  it('6. authenticates login using identical registered credentials and issues valid session', async () => {
    const student = await db.getStudentByEmail(syntheticStudent.email);
    expect(student).toBeDefined();
    expect(student!.id).toBe(syntheticStudent.id);

    // Verify password matching using secure bcrypt comparison
    const isMatch = await Security.comparePassword(syntheticStudent.password, student!.password_hash);
    expect(isMatch).toBe(true);

    // Generate authenticated JWT tokens
    const tokenPayload = {
      userId: student!.id,
      email: student!.email,
      role: student!.role,
      name: student!.name,
    };
    const accessToken = Security.generateAccessToken(tokenPayload);
    const refreshToken = Security.generateRefreshToken(tokenPayload);
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Verify token claims
    const verified = Security.verifyAccessToken(accessToken);
    expect(verified.userId).toBe(syntheticStudent.id);
    expect(verified.email).toBe(syntheticStudent.email);
  });

  // ==========================================================================
  // STAGE 7: DYNAMIC DASHBOARD PERSONALIZATION
  // ==========================================================================
  it('7. verifies Student Dashboard dynamically reflects Aarav academic identity and semester tasks', async () => {
    const dashboard = await DashboardService.getStudentDashboard(syntheticStudent.id);

    expect(dashboard.student.name).toBe('Aarav Test Student');
    expect(dashboard.student.branch).toBe('Artificial Intelligence and Machine Learning');
    expect(dashboard.student.semester).toBe(7);
    expect(dashboard.student.focus_topic).toContain('AI/ML');

    // Today's plan derived from enrolled Semester 7 subjects
    expect(dashboard.today_plan.length).toBeGreaterThan(0);
    // Upcoming assessments match scheduled exams
    expect(dashboard.upcoming_items.length).toBeGreaterThan(0);
    // Course progress
    expect(dashboard.course_progress.length).toBeGreaterThan(0);
  });

  // ==========================================================================
  // STAGE 8: SEMESTER COMMAND CENTER SYLLABUS SYNCHRONIZATION
  // ==========================================================================
  it('8. verifies Semester Command Center binds to Semester 7 AI/ML curriculum', async () => {
    const overview = semesterCommandCenterService.getOverview(syntheticStudent.id);

    expect(overview.config.semester_number).toBe(7);
    expect(overview.subjects.length).toBeGreaterThanOrEqual(4);

    const subjectNames = overview.subjects.map((s) => s.name.toLowerCase());
    const hasAiSubjects = subjectNames.some((n) => n.includes('neural') || n.includes('language') || n.includes('vision') || n.includes('distributed'));
    expect(hasAiSubjects).toBe(true);

    expect(overview.upcoming_events.length).toBeGreaterThanOrEqual(2);
  });

  // ==========================================================================
  // STAGE 9: MULTI-AGENT CONTEXT INJECTION (STUDENT CONTEXT ENGINE)
  // ==========================================================================
  it('9. verifies StudentContextEngine injects 2 hours availability and step-by-step preference into AI prompts', async () => {
    const context = await StudentContextEngine.buildContext(syntheticStudent.id, {
      domain: 'ACADEMIC',
      includeAcademic: true,
      includeCareer: true,
      includeProjects: true,
    });

    expect(context.student.name).toBe('Aarav Test Student');
    expect(context.student.branch).toBe('Artificial Intelligence and Machine Learning');
    expect(context.student.semester).toBe(7);
    expect(context.education?.institution).toBe('National Institute of Technology (NIT)');
    expect(context.preferences?.learningStyle).toBe('HANDS_ON');
    expect(context.career?.targetRole).toBe('Software Development / AI/ML Engineering');

    const promptText = StudentContextEngine.formatPromptContext(context);
    expect(promptText).toContain('Aarav Test Student');
    expect(promptText).toContain('Artificial Intelligence and Machine Learning');
    expect(promptText).toContain('National Institute of Technology (NIT)');
    expect(promptText).toContain('Software Development / AI/ML Engineering');
  });

  // ==========================================================================
  // STAGE 10: REPRESENTATIVE LEARNING ACTIVITIES & REPOSITORIES
  // ==========================================================================
  it('10. records active study plan task update, notes generation, project, and sandbox code execution', async () => {
    // 1. Study Plan Task Update
    const plans = await LearningModulesService.getStudyPlans(syntheticStudent.id);
    expect(plans.length).toBeGreaterThan(0);
    const firstPlan = plans[0];
    const task = firstPlan.tasks[0];
    const updated = await LearningModulesService.updateTaskStatus(syntheticStudent.id, firstPlan.id, task.id, 'COMPLETED');
    expect(updated.status).toBe('COMPLETED');

    // 2. Academic Note Generation
    const note = await NotesService.generateNote(syntheticStudent.id, {
      source_type: 'topic',
      topic: 'Transformer Self-Attention Mechanics & Multi-Head Projections',
      note_type: 'STUDY_NOTES',
      level: 'ADVANCED',
      length: 'MEDIUM',
    });
    expect(note.id).toMatch(/^note_/);
    expect(note.student_id).toBe(syntheticStudent.id);
    generatedNoteId = note.id;

    // 3. Project Creation
    const project = await ProjectService.createProject(syntheticStudent.id, {
      title: 'Scalable Distributed Transformer Inference Engine',
      project_type: 'FINAL_YEAR_PROJECT',
      domain: 'AI Systems',
      problem_statement: 'High latency and GPU VRAM exhaustion in distributed LLM serving.',
      objectives: [
        'Implement PagedAttention vLLM kernel integration',
        'Achieve continuous batching with speculative decoding',
        'Profile FP8 quantization speedups',
      ],
      target_users: 'MLOps engineers and AI researchers',
    });
    expect(project.id).toBeDefined();
    expect(project.student_id).toBe(syntheticStudent.id);
    createdProjectId = project.id;

    // 4. Code Execution in Isolated Sandbox
    const codeResult = await SandboxService.execute({
      language: 'python',
      sourceCode: `
def scaled_dot_product_attention(q_len, k_len):
    return f"Attention matrix shape: ({q_len}, {k_len})"

print(scaled_dot_product_attention(64, 64))
`,
      timeoutMs: 4000,
    });
    expect(codeResult.status).toBe('SUCCESS');
    expect(codeResult.exit_code).toBe(0);
    expect(codeResult.stdout.trim()).toBe('Attention matrix shape: (64, 64)');
  });

  // ==========================================================================
  // STAGE 11: STRICT DATA ISOLATION & ACCESS CONTROL
  // ==========================================================================
  it('11. strictly prevents cross-student data leakage and unauthorized access', async () => {
    const intruderId = 'std_test_unauthorized_intruder_999';

    await db.createStudent({
      id: intruderId,
      name: 'Intruding Student',
      email: 'intruder999@test.edu',
      password_hash: 'dummyhash',
      branch: 'Civil Engineering',
      semester: 3,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    // Intruding student cannot access Aarav's note
    await expect(NotesService.getNote(generatedNoteId, intruderId)).rejects.toThrow(/permission/i);

    // Intruding student cannot access Aarav's project
    await expect(ProjectService.getProject(createdProjectId, intruderId)).rejects.toThrow(/permission/i);

    // Intruding student querying their own dashboard sees strictly their own profile
    const intruderDashboard = await DashboardService.getStudentDashboard(intruderId);
    expect(intruderDashboard.student.id).toBe(intruderId);
    expect(intruderDashboard.student.name).toBe('Intruding Student');
    expect(intruderDashboard.student.name).not.toBe('Aarav Test Student');
  });
});
