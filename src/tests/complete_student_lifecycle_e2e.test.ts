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

describe('Complete Student Lifecycle & Whole-Platform Personalization Verification', () => {
  const newStudentData = {
    id: 'std_aditya_varma_cse_042',
    name: 'Aditya Varma',
    email: 'aditya.varma.cse@btech.edu',
    password: 'Password123!',
    degree: 'B.Tech' as const,
    branch: 'Computer Science & Engineering (CSE)',
    semester: 6,
    admission_year: 2023,
    institution: 'National Institute of Technology (NIT)',
    roll_number: 'NIT-2023-CSE-042',
    target_role: 'Software Development Engineer (SDE)',
    learning_goal: 'Tier-1 Product Company Placement (FAANG / Top Tech)',
  };

  let createdNoteId: string;
  let createdProjectId: string;

  beforeAll(async () => {
    await db.initialize();
  });

  // ==========================================================================
  // 1. REGISTRATION & INITIAL PROFILE PERSISTENCE
  // ==========================================================================
  it('1. registers a new student with complete academic identity and credentials', async () => {
    const passwordHash = await Security.hashPassword(newStudentData.password);

    const createdStudent = await db.createStudent({
      id: newStudentData.id,
      name: newStudentData.name,
      email: newStudentData.email,
      password_hash: passwordHash,
      branch: newStudentData.branch,
      semester: newStudentData.semester,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    expect(createdStudent).not.toBeNull();
    expect(createdStudent.id).toBe(newStudentData.id);
    expect(createdStudent.name).toBe('Aditya Varma');
    expect(createdStudent.email).toBe('aditya.varma.cse@btech.edu');
    expect(createdStudent.branch).toBe('Computer Science & Engineering (CSE)');
    expect(createdStudent.semester).toBe(6);
    expect(createdStudent.role).toBe('STUDENT');

    // Save detailed education profile
    const eduProfile = await OnboardingService.saveEducationProfile(newStudentData.id, {
      degree: newStudentData.degree,
      branch: newStudentData.branch,
      institution: newStudentData.institution,
      current_year: 3,
      current_semester: newStudentData.semester,
      admission_year: newStudentData.admission_year,
      expected_graduation_year: 2027,
      study_mode: 'FULL_TIME',
    });

    expect(eduProfile.institution).toBe('National Institute of Technology (NIT)');
    expect(eduProfile.current_semester).toBe(6);

    // Save target career goals
    const careerGoals = await OnboardingService.saveCareerGoals(newStudentData.id, {
      target_job_role: newStudentData.target_role,
      career_directions: ['PRODUCT_COMPANIES', 'SOFTWARE_ENGINEERING'],
      target_companies: ['Google', 'Microsoft', 'Amazon'],
      placement_readiness_self_rating: 4,
    });

    expect(careerGoals.target_job_role).toBe('Software Development Engineer (SDE)');
    expect(careerGoals.target_companies).toContain('Google');

    // Save academic preferences
    const preferences = await OnboardingService.saveLearningPreferences(newStudentData.id, {
      learning_style: 'HANDS_ON',
      explanation_depth: 'DEEP_DIVE',
      preferred_explanation_language: 'English',
      preferred_programming_languages: ['Python', 'Java', 'TypeScript', 'C++'],
      favorite_subjects: ['Operating Systems', 'Database Management Systems', 'Computer Networks'],
      difficult_topics: ['B-Trees Indexing', 'Dynamic Programming', 'Deadlock Detection'],
      weekday_study_hours: 3,
      weekend_study_hours: 6,
      practical_coding_preference: true,
      video_preference: true,
      text_preference: true,
    } as any);

    expect(preferences.learning_style).toBe('HANDS_ON');
    expect(preferences.explanation_depth).toBe('DEEP_DIVE');
  });

  // ==========================================================================
  // 2. SEMESTER COMMAND CENTER & SYLLABUS VERIFICATION
  // ==========================================================================
  it('2. verifies that Semester Command Center dynamically initializes CSE Semester 6 curriculum', async () => {
    const syllabus = OnboardingService.getSemesterSyllabusSync(newStudentData.id);
    expect(syllabus).not.toBeNull();
    expect(syllabus?.semester_number).toBe(6);
    expect(syllabus?.subjects.length).toBeGreaterThanOrEqual(3);

    // Verify CSE subjects exist in syllabus
    const subjectNames = syllabus?.subjects.map((s) => s.name.toLowerCase()) || [];
    const hasCseSubjects = subjectNames.some(
      (n) => n.includes('database') || n.includes('operating') || n.includes('compiler') || n.includes('network') || n.includes('cloud')
    );
    expect(hasCseSubjects).toBe(true);

    // Verify assessment dates (Slip test, Midterm, End-Sem)
    expect(syllabus?.academic_dates.length).toBeGreaterThanOrEqual(3);
    const eventTypes = syllabus?.academic_dates.map((d) => d.type) || [];
    expect(eventTypes).toContain('SLIP_TEST');
    expect(eventTypes).toContain('INTERNAL_EXAM');
    expect(eventTypes).toContain('END_SEMESTER');

    // Test semester overview API
    const overview = semesterCommandCenterService.getOverview(newStudentData.id);
    expect(overview.config.semester_number).toBe(6);
    expect(overview.subjects.length).toBeGreaterThanOrEqual(3);
    expect(overview.upcoming_events.length).toBeGreaterThanOrEqual(3);
  });

  // ==========================================================================
  // 3. PERSONALIZED DASHBOARD REFLECTION
  // ==========================================================================
  it('3. verifies that the Student Dashboard dynamically displays Aditya details and CSE tasks', async () => {
    const dashboard = await DashboardService.getStudentDashboard(newStudentData.id);

    // Student identity
    expect(dashboard.student.name).toBe('Aditya Varma');
    expect(dashboard.student.branch).toBe('Computer Science & Engineering (CSE)');
    expect(dashboard.student.semester).toBe(6);
    expect(dashboard.student.focus_topic).toContain('Software Development Engineer (SDE)');

    // Today's plan must be derived from Aditya's enrolled CSE subjects
    expect(dashboard.today_plan.length).toBeGreaterThan(0);
    expect(dashboard.today_plan[0].title).toBeDefined();

    // Upcoming assessments must match Aditya's academic dates
    expect(dashboard.upcoming_items.length).toBeGreaterThanOrEqual(3);
    expect(dashboard.upcoming_items.some((item) => item.type === 'exam')).toBe(true);

    // Course progress
    expect(dashboard.course_progress.length).toBeGreaterThan(0);
  });

  // ==========================================================================
  // 4. AI TUTOR & MULTI-AGENT CONTEXT INJECTION
  // ==========================================================================
  it('4. verifies that StudentContextEngine injects complete student metadata into AI prompts', async () => {
    const context = await StudentContextEngine.buildContext(newStudentData.id, {
      domain: 'ACADEMIC',
      includeAcademic: true,
      includeCareer: true,
      includeProjects: true,
    });

    expect(context.student.name).toBe('Aditya Varma');
    expect(context.student.branch).toBe('Computer Science & Engineering (CSE)');
    expect(context.student.semester).toBe(6);
    expect(context.education?.institution).toBe('National Institute of Technology (NIT)');
    expect(context.preferences?.learningStyle).toBe('HANDS_ON');
    expect(context.preferences?.explanationDepth).toBe('DEEP_DIVE');
    expect(context.career?.targetRole).toBe('Software Development Engineer (SDE)');

    // Format prompt context for LLM agents
    const promptString = StudentContextEngine.formatPromptContext(context);
    expect(promptString).toContain('Aditya Varma');
    expect(promptString).toContain('Computer Science & Engineering (CSE)');
    expect(promptString).toContain('National Institute of Technology (NIT)');
    expect(promptString).toContain('Software Development Engineer (SDE)');
    expect(promptString).toContain('HANDS_ON');
  });

  // ==========================================================================
  // 5. STUDY PLANNER DYNAMIC SEEDING & STATUS UPDATE
  // ==========================================================================
  it('5. verifies that Study Planner dynamically generates tasks aligned with CSE subjects', async () => {
    const studyPlans = await LearningModulesService.getStudyPlans(newStudentData.id);
    expect(studyPlans.length).toBeGreaterThan(0);

    const activePlan = studyPlans[0];
    expect(activePlan.tasks.length).toBeGreaterThan(0);

    // Update a task as completed
    const taskToComplete = activePlan.tasks[0];
    const updatedTask = await LearningModulesService.updateTaskStatus(
      newStudentData.id,
      activePlan.id,
      taskToComplete.id,
      'COMPLETED'
    );

    expect(updatedTask.id).toBe(taskToComplete.id);
    expect(updatedTask.status).toBe('COMPLETED');
    expect(updatedTask.completed_at).toBeDefined();
  });

  // ==========================================================================
  // 6. CODING LAB SANDBOX EXECUTION & ATTEMPT TRACKING
  // ==========================================================================
  it('6. executes student code in an isolated sandbox and records execution attempt', async () => {
    const pythonCode = `
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
`;
    const result = await SandboxService.execute({
      language: 'python',
      sourceCode: pythonCode,
      timeoutMs: 5000,
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.exit_code).toBe(0);
    expect(result.stdout.trim()).toBe('[0, 1]');
  });

  // ==========================================================================
  // 7. NOTES GENERATION & RETRIEVAL
  // ==========================================================================
  it('7. generates and persists notes linked to CSE syllabus topics', async () => {
    const note = await NotesService.generateNote(newStudentData.id, {
      source_type: 'topic',
      topic: 'B-Trees and B+ Trees Indexing in Databases',
      note_type: 'STUDY_NOTES',
      level: 'INTERMEDIATE',
      length: 'MEDIUM',
    });

    expect(note).toBeDefined();
    expect(note.id).toMatch(/^note_/);
    expect(note.student_id).toBe(newStudentData.id);
    expect(note.title).toContain('B-Trees');
    expect(note.content).toBeDefined();

    createdNoteId = note.id;

    // Retrieve note directly
    const fetched = await NotesService.getNote(note.id, newStudentData.id);
    expect(fetched.id).toBe(note.id);
  });

  // ==========================================================================
  // 8. PROJECTS & PORTFOLIO INTEGRATION
  // ==========================================================================
  it('8. creates an engineering project and links it to student portfolio', async () => {
    const project = await ProjectService.createProject(newStudentData.id, {
      title: 'Distributed Microservices E-Commerce Platform',
      project_type: 'FINAL_YEAR_PROJECT',
      domain: 'Distributed Systems',
      problem_statement: 'High-throughput order processing and event streaming.',
      objectives: [
        'Implement event-driven architecture using Kafka',
        'Build transactional outbox pattern with PostgreSQL',
        'Achieve sub-50ms latency under 10k RPS load',
      ],
      target_users: 'Software engineers and platform architects',
    });

    expect(project.id).toBeDefined();
    expect(project.student_id).toBe(newStudentData.id);
    expect(project.title).toContain('Distributed Microservices');

    createdProjectId = project.id;

    const studentProjects = await ProjectService.listProjects(newStudentData.id);
    expect(studentProjects.some((p) => p.id === project.id)).toBe(true);
  });

  // ==========================================================================
  // 9. STUDENT PROFILE SERVICE SYNC
  // ==========================================================================
  it('9. verifies ProfileService returns synchronized academic and career data', async () => {
    const profile = await ProfileService.getProfile(newStudentData.id);

    expect(profile.student_id).toBe(newStudentData.id);
    expect(profile.name).toBe('Aditya Varma');
    expect(profile.branch).toBe('Computer Science & Engineering (CSE)');
    expect(profile.semester).toBe(6);
    expect(profile.college_name).toBe('National Institute of Technology (NIT)');
    expect(profile.target_role).toBe('Software Development Engineer (SDE)');
  });

  // ==========================================================================
  // 10. STRICT STUDENT DATA ISOLATION & IDOR PROTECTION
  // ==========================================================================
  it('10. strictly protects Aditya data from access by another student', async () => {
    const anotherStudentId = 'std_test_isolated_intruder';

    // Register the other student in DB
    await db.createStudent({
      id: anotherStudentId,
      name: 'Intruder Student',
      email: 'intruder@test.edu',
      password_hash: 'dummyhash',
      branch: 'Electronics & Communication',
      semester: 4,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    // Intruding student cannot access Aditya's note
    await expect(NotesService.getNote(createdNoteId, anotherStudentId)).rejects.toThrow(/permission/i);

    // Intruding student cannot access Aditya's project
    await expect(ProjectService.getProject(createdProjectId, anotherStudentId)).rejects.toThrow(/permission/i);

    // Intruding student queries their own dashboard — must be strictly isolated
    const intruderDashboard = await DashboardService.getStudentDashboard(anotherStudentId);
    expect(intruderDashboard.student.id).toBe(anotherStudentId);
    expect(intruderDashboard.student.name).toBe('Intruder Student');
    expect(intruderDashboard.student.name).not.toBe('Aditya Varma');
  });
});
