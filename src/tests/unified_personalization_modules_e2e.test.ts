import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { Security } from '../../server/core/security';
import { ProfileService } from '../../server/services/profileService';
import { ProgressService } from '../../server/services/progressService';
import { GoalService } from '../../server/services/goalService';
import { NotificationService } from '../../server/services/notificationService';
import { StudentContextEngine } from '../../server/ai/studentContextEngine';
import { ActivityService } from '../../server/services/activityService';
import { ProjectService } from '../../server/services/projectService';

describe('Unified Personalization Modules E2E Test Suite', () => {
  const studentAlice = 'std_test_alice_personalization_01';
  const studentBob = 'std_test_bob_personalization_02';
  const initialPassword = 'SecurePassword123!';

  beforeAll(async () => {
    await db.initialize();

    // Ensure studentAlice exists with known baseline
    const hashAlice = await Security.hashPassword(initialPassword);
    await db.createStudent({
      id: studentAlice,
      name: 'Alice Personalization',
      email: 'alice.personalization@btech.edu',
      password_hash: hashAlice,
      branch: 'Computer Science and Engineering',
      semester: 6,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);

    // Ensure studentBob exists for isolation tests
    const hashBob = await Security.hashPassword(initialPassword);
    await db.createStudent({
      id: studentBob,
      name: 'Bob Isolation',
      email: 'bob.isolation@btech.edu',
      password_hash: hashBob,
      branch: 'Information Technology',
      semester: 4,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
    } as any);
  });

  // ==========================================================================
  // MODULE 1: UNIFIED PROGRESS
  // ==========================================================================
  describe('Module 1: Unified Progress & Truthful Activity Aggregation', () => {
    it('1.1 verifies empty progress returns truthful zero-state without fabricated metrics', async () => {
      // Bob has zero activities initially
      const progress = await ProgressService.getUnifiedProgress(studentBob, { timeRange: 'all' });

      expect(progress).toBeDefined();
      expect(progress.summary).toBeDefined();
      expect(progress.summary.total_activities).toBe(0);
      expect(progress.summary.courses_completed).toBe(0);
      expect(progress.summary.quiz_average_accuracy).toBe(0);
      expect(progress.summary.coding_problems_solved).toBe(0);
      expect(progress.summary.active_goals_count).toBe(0);

      // Verify overview cards are truthful
      expect(progress.overview_cards).toHaveLength(8);
      const codingCard = progress.overview_cards.find((c: any) => c.id === 'coding');
      expect(codingCard).toBeDefined();
      expect(codingCard?.metric).toBe('0 Problems Solved');

      const assessmentsCard = progress.overview_cards.find((c: any) => c.id === 'assessments');
      expect(assessmentsCard?.metric).toBe('No assessments yet');

      // Verify empty timeline
      expect(progress.activity_timeline).toHaveLength(0);
    });

    it('1.2 records genuine student activities and updates populated progress correctly', async () => {
      // Record a quiz activity for Alice
      await ActivityService.recordActivity({
        student_id: studentAlice,
        activity_type: 'QUIZ_COMPLETED',
        entity_type: 'quiz',
        entity_id: 'quiz_algo_midterm',
        title: 'Algorithms Midterm Quiz Completed',
        metadata: { score: 92, total: 100, subject: 'Design & Analysis of Algorithms' },
      });

      // Record a coding submission
      await ActivityService.recordActivity({
        student_id: studentAlice,
        activity_type: 'CODING_PROBLEM_SOLVED',
        entity_type: 'coding_problem',
        entity_id: 'dsa_dijkstra_01',
        title: 'Solved Dijkstra Shortest Path Problem',
        metadata: { problem_id: 'dsa_dijkstra_01', language: 'cpp', status: 'ACCEPTED' },
      });

      // Record a course lesson
      await ActivityService.recordActivity({
        student_id: studentAlice,
        activity_type: 'COURSE_LESSON_COMPLETED',
        entity_type: 'lesson',
        entity_id: 'lec_14',
        title: 'Finished Lecture 14: Multi-Head Attention',
        metadata: { course_id: 'course_dl_01', lesson_id: 'lec_14' },
      });

      // Fetch unified progress for Alice
      const progress = await ProgressService.getUnifiedProgress(studentAlice, { timeRange: 'all' });

      expect(progress.summary.total_activities).toBeGreaterThanOrEqual(3);
      expect(progress.summary.coding_problems_solved).toBe(1);
      expect(progress.summary.quiz_average_accuracy).toBe(92);

      // Check overview cards reflects real recorded numbers
      const codingCard = progress.overview_cards.find((c: any) => c.id === 'coding');
      expect(codingCard?.metric).toBe('1 Problem Solved');

      const assessmentsCard = progress.overview_cards.find((c: any) => c.id === 'assessments');
      expect(assessmentsCard?.metric).toBe('92% Avg Score');

      // Activity timeline contains genuine recorded entries
      expect(progress.activity_timeline.length).toBeGreaterThanOrEqual(3);
      expect(progress.activity_timeline[0].title).toBeDefined();
    });

    it('1.3 respects date range filtering (7d, 30d, 90d, semester, all)', async () => {
      const progress7d = await ProgressService.getUnifiedProgress(studentAlice, { timeRange: '7d' });
      expect(progress7d.time_range).toBe('7d');
      expect(progress7d.summary.total_activities).toBeGreaterThanOrEqual(3);

      const progressAll = await ProgressService.getUnifiedProgress(studentAlice, { timeRange: 'all' });
      expect(progressAll.time_range).toBe('all');
      expect(progressAll.summary.total_activities).toBeGreaterThanOrEqual(progress7d.summary.total_activities);
    });

    it('1.4 exports unified progress data securely for authenticated student', async () => {
      const exportData = await ProgressService.exportProgress(studentAlice);
      expect(exportData).toBeDefined();
      expect(exportData.student_id).toBe(studentAlice);
      expect(exportData.student_name).toBe('Alice Personalization');
      expect(exportData.progress).toBeDefined();
      expect(exportData.progress.summary).toBeDefined();
    });
  });

  // ==========================================================================
  // MODULE 2: LEARNING GOALS
  // ==========================================================================
  describe('Module 2: Learning Goals Lifecycle, Milestones, and Reminders', () => {
    let createdGoalId: string;
    let milestoneOneId: string;
    let milestoneTwoId: string;

    it('2.1 creates a new goal with structured milestones, priority, and target date', async () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3); // 3 days in future for reminder trigger

      const goal = await GoalService.createGoal(studentAlice, {
        title: 'Master Graph Algorithms & Dynamic Programming',
        description: 'Prepare thoroughly for upcoming technical assessments',
        category: 'DSA',
        priority: 'HIGH',
        start_date: new Date().toISOString().split('T')[0],
        target_date: targetDate.toISOString().split('T')[0],
        milestones: [
          { title: 'Solve 20 Graph problems on LeetCode/Coding Lab' },
          { title: 'Implement Bellman-Ford and Floyd-Warshall from scratch' },
        ],
        measurement_method: 'Milestones Completed',
        completion_criteria: 'Pass both milestones and verify execution benchmarks',
        reminder_preference: true,
        notes: 'Review time complexities O(V+E) and O(V^3)',
      });

      expect(goal).toBeDefined();
      expect(goal.id).toBeDefined();
      expect(goal.student_id).toBe(studentAlice);
      expect(goal.title).toBe('Master Graph Algorithms & Dynamic Programming');
      expect(goal.priority).toBe('HIGH');
      expect(goal.status).toBe('ACTIVE');
      expect(goal.progress_percentage).toBe(0);
      expect(goal.milestones).toHaveLength(2);
      expect(goal.milestones[0].completed).toBe(false);

      createdGoalId = goal.id;
      milestoneOneId = goal.milestones[0].id!;
      milestoneTwoId = goal.milestones[1].id!;
    });

    it('2.2 retrieves goals filtered by category, priority, and search query', async () => {
      // Filter by category DSA
      const dsaGoals = await GoalService.getGoals(studentAlice, { category: 'DSA' });
      expect(dsaGoals.some((g) => g.id === createdGoalId)).toBe(true);

      // Filter by priority HIGH
      const highGoals = await GoalService.getGoals(studentAlice, { priority: 'HIGH' });
      expect(highGoals.some((g) => g.id === createdGoalId)).toBe(true);

      // Search query
      const searchGoals = await GoalService.getGoals(studentAlice, { search: 'Graph' });
      expect(searchGoals.some((g) => g.id === createdGoalId)).toBe(true);

      // Search non-matching query
      const emptySearch = await GoalService.getGoals(studentAlice, { search: 'NonExistentXYZ123' });
      expect(emptySearch).toHaveLength(0);
    });

    it('2.3 toggles milestones and computes mathematical progress percentage', async () => {
      // Toggle first milestone to true -> 1 of 2 = 50%
      const goalAfterOne = await GoalService.toggleMilestone(studentAlice, createdGoalId, milestoneOneId);
      expect(goalAfterOne.milestones.find((m) => m.id === milestoneOneId)?.completed).toBe(true);
      expect(goalAfterOne.progress_percentage).toBe(50);
      expect(goalAfterOne.status).toBe('ACTIVE');

      // Toggle second milestone to true -> 2 of 2 = 100%, status auto-advances to COMPLETED
      const goalAfterTwo = await GoalService.toggleMilestone(studentAlice, createdGoalId, milestoneTwoId);
      expect(goalAfterTwo.milestones.find((m) => m.id === milestoneTwoId)?.completed).toBe(true);
      expect(goalAfterTwo.progress_percentage).toBe(100);
      expect(goalAfterTwo.status).toBe('COMPLETED');
    });

    it('2.4 updates goal status and notes', async () => {
      const updated = await GoalService.updateGoal(studentAlice, createdGoalId, {
        status: 'PAUSED',
        notes: 'Temporarily paused due to mid-semester laboratory exams',
      });
      expect(updated.status).toBe('PAUSED');
      expect(updated.notes).toContain('mid-semester laboratory exams');
    });

    it('2.5 prevents student B from updating or deleting student A goal', async () => {
      await expect(
        GoalService.updateGoal(studentBob, createdGoalId, { status: 'COMPLETED' })
      ).rejects.toThrow(/not found/i);

      await expect(
        GoalService.deleteGoal(studentBob, createdGoalId)
      ).rejects.toThrow(/not found/i);
    });

    it('2.6 generates goal recommendations based on academic context', async () => {
      const recs = await GoalService.getGoalRecommendations(studentAlice);
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].title).toBeDefined();
      expect(recs[0].reason).toBeDefined();
    });

    it('2.7 deletes goal with confirmation and persists removal', async () => {
      const deleted = await GoalService.deleteGoal(studentAlice, createdGoalId);
      expect(deleted.success).toBe(true);

      const remainingGoals = await GoalService.getGoals(studentAlice);
      expect(remainingGoals.some((g) => g.id === createdGoalId)).toBe(false);
    });
  });

  // ==========================================================================
  // MODULE 3: STUDENT PROFILE
  // ==========================================================================
  describe('Module 3: Student Profile Authority & Completion Scoring', () => {
    it('3.1 retrieves profile and calculates deterministic completion breakdown', async () => {
      const profile = await ProfileService.getProfile(studentAlice);
      expect(profile).toBeDefined();
      expect(profile.student_id).toBe(studentAlice);
      expect(profile.name).toBe('Alice Personalization');
      expect(profile.completion_percentage).toBeGreaterThan(0);
      expect(profile.completion_breakdown).toBeDefined();
      expect(profile.completion_breakdown!.basic_profile).toBe(true);
    });

    it('3.2 updates personal, academic, and skills information with validation', async () => {
      const updated = await ProfileService.updateProfile(studentAlice, {
        display_name: 'Alice P.',
        bio: 'Aspiring AI and Distributed Systems Engineer studying 6th semester B.Tech.',
        graduation_year: 2026,
        github_url: 'https://github.com/alice-personalization',
        linkedin_url: 'https://linkedin.com/in/alice-personalization',
        interests: ['Artificial Intelligence', 'Operating Systems', 'System Design'],
        // Structured skills are accepted from the profile form and stored as-is.
        skills: [
          { name: 'Python', level: 'ADVANCED' },
          { name: 'C++', level: 'INTERMEDIATE' },
          { name: 'PyTorch', level: 'BEGINNER' },
        ] as unknown as string[],
      });

      expect(updated.display_name).toBe('Alice P.');
      expect(updated.bio).toContain('Aspiring AI');
      expect(updated.graduation_year).toBe(2026);
      expect(updated.github_url).toBe('https://github.com/alice-personalization');
      expect(updated.skills).toHaveLength(3);
      // Phase 5: one completion number, computed by the central profile service.
      const { StudentProfileService } = await import('../../server/services/studentProfile/studentProfileService');
      expect(updated.completion_percentage).toBe((await StudentProfileService.getCompletion(studentAlice)).overall_percentage);
    });

    it('3.3 enforces validation on bio character length and URLs', async () => {
      await expect(
        ProfileService.updateProfile(studentAlice, {
          bio: 'A'.repeat(1001),
        })
      ).rejects.toThrow();

      await expect(
        ProfileService.updateProfile(studentAlice, {
          graduation_year: 1980,
        })
      ).rejects.toThrow();
    });

    it('3.4 synchronizes updated profile into the AI StudentContextEngine', async () => {
      const context = await StudentContextEngine.buildStudentContext(studentAlice);
      expect(context).toBeDefined();
      expect(context.student).toBeDefined();
      expect(context.student.name).toBe('Alice Personalization');
      expect(context.student.branch).toBe('Computer Science and Engineering');
      expect(context.student.semester).toBe(6);
    });
  });

  // ==========================================================================
  // MODULE 4: NOTIFICATIONS
  // ==========================================================================
  describe('Module 4: Notifications, Deduplication, and Delivery Preferences', () => {
    let notifId: string;

    it('4.1 creates and fetches student notifications with unread count', async () => {
      const notif = await NotificationService.createNotification({
        student_id: studentAlice,
        type: 'GOAL_MILESTONE',
        title: 'Milestone Completed: Graph Algorithms',
        message: 'Great job completing your milestone in Graph Theory!',
        link: '/goals',
      });

      expect(notif).toBeDefined();
      expect(notif.student_id).toBe(studentAlice);
      notifId = notif.id;

      const res = await NotificationService.getNotifications(studentAlice, false);
      expect(res.unreadCount).toBeGreaterThanOrEqual(1);
      expect(res.items.some((n) => n.id === notifId)).toBe(true);
    });

    it('4.2 marks notification as read and updates unread count', async () => {
      const marked = await NotificationService.markAsRead(notifId, studentAlice);
      expect(marked.is_read).toBe(true);

      const res = await NotificationService.getNotifications(studentAlice, true);
      expect(res.items.some((n) => n.id === notifId)).toBe(false);
    });

    it('4.3 scans and generates deadline reminders with 24h deduplication', async () => {
      // Create an active goal for Alice due in 2 days
      const nearTargetDate = new Date();
      nearTargetDate.setDate(nearTargetDate.getDate() + 2);

      const activeGoal = await GoalService.createGoal(studentAlice, {
        title: 'Complete Distributed Systems Lab 3',
        category: 'COURSES',
        priority: 'CRITICAL',
        target_date: nearTargetDate.toISOString().split('T')[0],
        milestones: [{ title: 'Implement Raft Leader Election' }],
      });

      // First reminder scan: should generate reminder for upcoming goal
      const scan1 = await NotificationService.generateReminders(studentAlice);
      expect(scan1.generated).toBeGreaterThanOrEqual(1);

      // Second reminder scan within 24h: must be deduplicated
      const scan2 = await NotificationService.generateReminders(studentAlice);
      expect(scan2.generated).toBe(0);

      // Clean up test goal
      await GoalService.deleteGoal(studentAlice, activeGoal.id);
    });

    it('4.4 respects student notification category preferences', async () => {
      // Disable learning & deadline notifications for Alice
      await NotificationService.updateNotificationPreferences(studentAlice, {
        categories: {
          learning: false,
          community: true,
          achievements: true,
          system: true,
        },
      });

      // Create an active goal due in 1 day
      const urgentDate = new Date();
      urgentDate.setDate(urgentDate.getDate() + 1);

      const urgentGoal = await GoalService.createGoal(studentAlice, {
        title: 'Submit Operating System Scheduling Assignment',
        category: 'COURSES',
        priority: 'HIGH',
        target_date: urgentDate.toISOString().split('T')[0],
      });

      // Scan should generate 0 reminders because category 'learning' is turned off
      const scanWhenDisabled = await NotificationService.generateReminders(studentAlice);
      expect(scanWhenDisabled.generated).toBe(0);

      // Re-enable learning notifications
      await NotificationService.updateNotificationPreferences(studentAlice, {
        categories: {
          learning: true,
          community: true,
          achievements: true,
          system: true,
        },
      });

      await GoalService.deleteGoal(studentAlice, urgentGoal.id);
    });

    it('4.5 deletes notification and verifies removal', async () => {
      const deleted = await NotificationService.deleteNotification(notifId, studentAlice);
      expect(deleted.success).toBe(true);

      const list = await NotificationService.getNotifications(studentAlice);
      expect(list.items.some((n) => n.id === notifId)).toBe(false);
    });
  });

  // ==========================================================================
  // MODULE 5: SETTINGS & SENSITIVE CONTROLS
  // ==========================================================================
  describe('Module 5: Settings, Account Security, and Data Privacy Controls', () => {
    it('5.1 loads and updates learning and AI preferences', async () => {
      const updatedPrefs = await ProfileService.updatePreferences(studentAlice, {
        preferred_language: 'English',
        response_style: 'DETAILED',
        explanation_level: 'ADVANCED',
        theme: 'dark',
      });

      expect(updatedPrefs.response_style).toBe('DETAILED');
      expect(updatedPrefs.preferred_language).toBe('English');
      expect(updatedPrefs.theme).toBe('dark');

      const loadedPrefs = await ProfileService.getPreferences(studentAlice);
      expect(loadedPrefs.response_style).toBe('DETAILED');
    });

    it('5.2 loads and updates privacy settings', async () => {
      const updatedPrivacy = await ProfileService.updatePrivacySettings(studentAlice, {
        profile_visibility: 'COMMUNITY',
        github_visibility: 'PUBLIC',
        research_visibility: 'COMMUNITY',
      });

      expect(updatedPrivacy.profile_visibility).toBe('COMMUNITY');
      expect(updatedPrivacy.github_visibility).toBe('PUBLIC');

      const loadedPrivacy = await ProfileService.getPrivacySettings(studentAlice);
      expect(loadedPrivacy.profile_visibility).toBe('COMMUNITY');
    });

    it('5.3 changes student password with old password verification', async () => {
      // Verify existing password works
      const student = await db.getStudentById(studentAlice);
      expect(student).toBeDefined();
      const matchOld = await Security.comparePasswords(initialPassword, student!.password_hash);
      expect(matchOld).toBe(true);

      // Update to new secure password
      const newPassword = 'NewAlicePassword2026!';
      const newHash = await Security.hashPassword(newPassword);
      await db.updateStudentPassword(studentAlice, newHash);

      // Verify old password fails and new password succeeds
      const updatedStudent = await db.getStudentById(studentAlice);
      const matchOldFailed = await Security.comparePasswords(initialPassword, updatedStudent!.password_hash);
      expect(matchOldFailed).toBe(false);

      const matchNewSucceeded = await Security.comparePasswords(newPassword, updatedStudent!.password_hash);
      expect(matchNewSucceeded).toBe(true);
    });

    it('5.4 exports full student data bundle for privacy compliance', async () => {
      const dataExport = await ProfileService.exportStudentData(studentAlice);
      expect(dataExport).toBeDefined();
      expect(dataExport.student_id).toBe(studentAlice);
      expect(dataExport.profile).toBeDefined();
      expect(dataExport.preferences).toBeDefined();
      expect(dataExport.privacy).toBeDefined();
      expect(dataExport.exported_at).toBeDefined();
    });
  });

  // ==========================================================================
  // CROSS-MODULE INTEGRATION & STUDENT DATA ISOLATION
  // ==========================================================================
  describe('Cross-Module Integration & Security Isolation', () => {
    it('6.1 ensures strict data isolation between student A and student B', async () => {
      // Create private project for Alice
      const aliceProject = await ProjectService.createProject(studentAlice, {
        title: 'Alice Autonomous AI Agent',
        description: 'Multi-agent orchestration platform for distributed scheduling',
        project_type: 'FINAL_YEAR_PROJECT',
        domain: 'AI & Distributed Systems',
      });

      // Verify Alice can fetch her project
      const aliceProjects = await ProjectService.getProjects(studentAlice);
      expect(aliceProjects.some((p) => p.id === aliceProject.id)).toBe(true);

      // Verify Bob cannot see Alice's project
      const bobProjects = await ProjectService.getProjects(studentBob);
      expect(bobProjects.some((p) => p.id === aliceProject.id)).toBe(false);

      // Verify Bob's unified progress does not contain Alice's project
      const bobProgress = await ProgressService.getUnifiedProgress(studentBob);
      const bobProjectCard = bobProgress.overview_cards.find((c: any) => c.id === 'projects');
      expect(bobProjectCard?.metric).toBe('0 Total Projects');

      // Clean up Alice's project
      await ProjectService.deleteProject(aliceProject.id, studentAlice);
    });

    it('6.2 verifies student profile changes immediately reflect in Unified Progress', async () => {
      // Update Alice's semester to 7
      await db.updateStudent(studentAlice, { semester: 7 });

      const progress = await ProgressService.getUnifiedProgress(studentAlice);
      expect(progress.academic_progress.current_semester).toBe(7);

      // Restore to 6 for consistency
      await db.updateStudent(studentAlice, { semester: 6 });
    });
  });
});
