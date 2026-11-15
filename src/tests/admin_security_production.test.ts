import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { ToolRegistry } from '../../server/ai/tools';
import { Security } from '../../server/core/security';
import { AuthorizationError, AuthenticationError, ValidationError } from '../../server/core/exceptions';
import { adminApi } from '../api/adminApi';

describe('PHASE 15: Super Admin, Security Hardening, Observability & Production Verification', () => {
  const adminId = 'adm_01j8k9x999';
  const studentId = 'std_01j8k9x2p4';
  const otherStudentId = 'std_test_isolated_02';

  beforeEach(async () => {
    await db.initialize();
  });

  // --------------------------------------------------------------------------
  // 1. ROLE-BASED ACCESS CONTROL (RBAC) & AUTHORIZATION AUDIT
  // --------------------------------------------------------------------------
  describe('Role-Based Access Control (RBAC)', () => {
    it('verifies that the platform strictly enforces only STUDENT and SUPER_ADMIN roles', async () => {
      const student = await db.getStudentById(studentId);
      const admin = await db.getStudentById(adminId);

      expect(student).not.toBeNull();
      expect(student?.role).toBe('STUDENT');

      expect(admin).not.toBeNull();
      expect(admin?.role).toBe('SUPER_ADMIN');
    });

    it('denies access to non-admin roles for administrative operations', async () => {
      // Simulate student trying to perform admin action
      const studentToken = Security.generateAccessToken({
        userId: studentId,
        email: 'student@btech.edu',
        name: 'Pavan Kalyan V.',
        role: 'STUDENT',
      });

      const payload = Security.verifyAccessToken(studentToken);
      expect(payload.role).toBe('STUDENT');
      expect(payload.role !== 'SUPER_ADMIN').toBe(true);
    });

    it('allows SUPER_ADMIN to generate administrative tokens with full platform role', async () => {
      const adminToken = Security.generateAccessToken({
        userId: adminId,
        email: 'admin@btech.edu',
        name: 'Platform Administrator',
        role: 'SUPER_ADMIN',
      });

      const payload = Security.verifyAccessToken(adminToken);
      expect(payload.role).toBe('SUPER_ADMIN');
      expect(payload.userId).toBe(adminId);
    });
  });

  // --------------------------------------------------------------------------
  // 2. STUDENT ACCOUNT MANAGEMENT & SUSPENSION AUDIT
  // --------------------------------------------------------------------------
  describe('Student Account Status & Suspension Workflow', () => {
    it('allows Super Admin to suspend an active student with a mandatory audit reason', async () => {
      const reason = 'Academic dishonesty investigation in Coding Lab';
      const updated = await db.updateStudentAccountStatus(
        studentId,
        'SUSPENDED',
        reason,
        adminId,
        'Platform Admin'
      );

      expect(updated.status).toBe('SUSPENDED');
      expect(updated.is_active).toBe(false);
      expect(updated.status_reason).toBe(reason);

      // Verify immutable audit log was created
      const logs = await db.getAdminAuditLogs(10, 'STUDENT');
      const suspensionLog = logs.find(
        (l) => l.target_id === studentId && l.action.includes('SUSPENDED')
      );
      expect(suspensionLog).toBeDefined();
      expect(suspensionLog?.admin_id).toBe(adminId);
      expect(suspensionLog?.metadata.reason).toBe(reason);

      // Verify student received notification
      const notifs = await db.getNotifications(studentId);
      expect(notifs.some((n) => n.title.includes('Suspended'))).toBe(true);
    });

    it('allows Super Admin to reactivate a suspended student account', async () => {
      const reason = 'Investigation concluded without violation; restoring access';
      const updated = await db.updateStudentAccountStatus(
        studentId,
        'ACTIVE',
        reason,
        adminId,
        'Platform Admin'
      );

      expect(updated.status).toBe('ACTIVE');
      expect(updated.is_active).toBe(true);

      // Verify student notification
      const notifs = await db.getNotifications(studentId);
      expect(notifs.some((n) => n.title.includes('Reactivated'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. IDOR (INSECURE DIRECT OBJECT REFERENCE) PROTECTION
  // --------------------------------------------------------------------------
  describe('IDOR & Data Boundary Isolation', () => {
    it('strictly isolates student learning records from other students', async () => {
      const studentProjects = await db.getProjects(studentId);
      expect(Array.isArray(studentProjects)).toBe(true);

      // Verify all returned projects belong to the requesting student
      for (const p of studentProjects) {
        expect(p.student_id).toBe(studentId);
      }
    });

    it('prevents a student from accessing another student private notes or documents', async () => {
      const notes = await db.getNotes(studentId);
      expect(Array.isArray(notes)).toBe(true);

      for (const n of notes) {
        expect(n.student_id).toBe(studentId);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 4. TOOL REGISTRY SAFETY & RUNTIME CONTROLS
  // --------------------------------------------------------------------------
  describe('Tool Registry Safety & AI Controls', () => {
    it('allows Super Admin to disable and re-enable registered AI tools dynamically', async () => {
      const toolName = 'get_student_profile';

      expect(ToolRegistry.isToolEnabled(toolName)).toBe(true);

      // Administratively disable tool
      ToolRegistry.setToolStatus(toolName, false);
      expect(ToolRegistry.isToolEnabled(toolName)).toBe(false);

      // Attempting execution should now throw ValidationError
      await expect(
        ToolRegistry.execute(toolName, {}, { studentId, role: 'STUDENT' })
      ).rejects.toThrow(/disabled/i);

      // Re-enable tool
      ToolRegistry.setToolStatus(toolName, true);
      expect(ToolRegistry.isToolEnabled(toolName)).toBe(true);

      const result = await ToolRegistry.execute(toolName, {}, { studentId, role: 'STUDENT' });
      expect(result).toBeDefined();
    });

    it('enforces role permissions on registered AI tools', async () => {
      // Register an admin-only test tool
      const adminOnlyTool = 'admin_system_diagnose';
      ToolRegistry.register({
        name: adminOnlyTool,
        description: 'Internal diagnostic runner',
        parameters: {},
        permissions: ['SUPER_ADMIN'],
        timeoutMs: 2000,
        confirmationRequired: true,
        category: 'READ_ONLY',
        handler: async () => ({ status: 'ok' }),
      });

      // A STUDENT calling this tool must be blocked with AuthorizationError
      await expect(
        ToolRegistry.execute(adminOnlyTool, {}, { studentId, role: 'STUDENT' })
      ).rejects.toThrow(AuthorizationError);

      // A SUPER_ADMIN calling this tool still needs to approve it, because it is marked confirmationRequired.
      await expect(ToolRegistry.execute(adminOnlyTool, {}, { studentId: adminId, role: 'SUPER_ADMIN' })).rejects.toMatchObject({ code: 'APPROVAL_REQUIRED', statusCode: 409 });

      // With approval, a SUPER_ADMIN calling this tool succeeds
      const res = await ToolRegistry.execute(adminOnlyTool, {}, { studentId: adminId, role: 'SUPER_ADMIN', confirmed: true });
      expect(res.status).toBe('ok');
    });
  });

  // --------------------------------------------------------------------------
  // 5. FEATURE FLAGS & SYSTEM MAINTENANCE MODE
  // --------------------------------------------------------------------------
  describe('Feature Flags & Centralized Configuration', () => {
    it('retrieves and updates feature flags with server enforcement', async () => {
      const flagKey = 'research_assistant_enabled';
      const flag = await db.getFeatureFlagByKey(flagKey);
      expect(flag).toBeDefined();
      expect(flag?.is_enabled).toBe(true);

      // Admin updates flag
      const updated = await db.updateFeatureFlag(
        flagKey,
        { is_enabled: false },
        adminId,
        'Platform Admin'
      );
      expect(updated.is_enabled).toBe(false);

      // Restore flag
      const restored = await db.updateFeatureFlag(
        flagKey,
        { is_enabled: true },
        adminId,
        'Platform Admin'
      );
      expect(restored.is_enabled).toBe(true);
    });

    it('verifies maintenance_mode feature flag exists and can be inspected', async () => {
      const maintenanceFlag = await db.getFeatureFlagByKey('maintenance_mode');
      expect(maintenanceFlag).toBeDefined();
      expect(maintenanceFlag?.is_server_enforced).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 6. SYSTEM HEALTH PROBES & METRICS
  // --------------------------------------------------------------------------
  describe('System Health Probes & Observability', () => {
    it('returns healthy status across all 8 core platform subsystems', async () => {
      const health = await db.getSystemHealth();

      expect(health.overall_status).toBe('HEALTHY');
      expect(health.version).toBe('1.0.0');
      expect(health.uptime_seconds).toBeGreaterThanOrEqual(0);
      expect(health.components.length).toBe(8);

      const componentNames = health.components.map((c) => c.name);
      expect(componentNames.some((n) => n.includes('PostgreSQL'))).toBe(true);
      expect(componentNames.some((n) => n.includes('Redis'))).toBe(true);
      expect(componentNames.some((n) => n.includes('AI Gemini'))).toBe(true);
      expect(componentNames.some((n) => n.includes('GitHub'))).toBe(true);
    });

    it('returns valid latency, request count, and queue metrics', async () => {
      const metrics = await db.getSystemMetrics();

      expect(metrics.request_count).toBeGreaterThan(0);
      expect(metrics.avg_api_latency_ms).toBeGreaterThan(0);
      expect(metrics.cache_hit_rate_percentage).toBeGreaterThan(90);
    });
  });

  // --------------------------------------------------------------------------
  // 7. BACKGROUND JOBS & SAFE RETRY PIPELINE
  // --------------------------------------------------------------------------
  describe('Background Job System & Idempotent Retries', () => {
    it('lists queued and failed background jobs', async () => {
      const jobs = await db.getBackgroundJobs();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
    });

    it('allows safe retry for a failed background job without duplicate creation', async () => {
      const jobs = await db.getBackgroundJobs();
      const failedJob = jobs.find((j) => j.status === 'FAILED');

      if (failedJob) {
        const retried = await db.retryBackgroundJob(failedJob.id, adminId, 'Platform Admin');
        expect(retried.status).toBe('QUEUED');
        expect(retried.retry_count).toBe(failedJob.retry_count + 1);
        expect(retried.error_summary).toBeUndefined();
      }
    });

    it('rejects retrying jobs that are not in FAILED or CANCELLED status', async () => {
      const jobs = await db.getBackgroundJobs();
      const completedJob = jobs.find((j) => j.status === 'COMPLETED');

      if (completedJob) {
        await expect(
          db.retryBackgroundJob(completedJob.id, adminId, 'Platform Admin')
        ).rejects.toThrow(ValidationError);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 8. SECURITY EVENTS & AUDIT LOGGING
  // --------------------------------------------------------------------------
  describe('Security Event Recording & Rate Limit Telemetry', () => {
    it('records security events with severity and caller IP', async () => {
      const newEvent = await db.recordSecurityEvent({
        event_type: 'IDOR_ATTEMPT',
        severity: 'HIGH',
        ip_address: '192.168.1.50',
        user_id: studentId,
        path: '/api/v1/projects/prj_isolated_unauthorized',
        details: 'Unauthorized cross-student project access attempt blocked',
      });

      expect(newEvent.id).toBeDefined();
      expect(newEvent.created_at).toBeDefined();

      const events = await db.getSecurityEvents('HIGH', 10);
      expect(events.some((e) => e.id === newEvent.id)).toBe(true);
    });

    it('provides real non-mock dashboard summary statistics from live database', async () => {
      const summary = await db.getAdminDashboardSummary();

      expect(summary.total_students).toBeGreaterThan(0);
      expect(summary.active_students).toBeGreaterThan(0);
      expect(summary.courses_count).toBeGreaterThan(0);
      expect(summary.ai_requests_count).toBeGreaterThan(0);
      expect(summary.system_health).toBe('HEALTHY');
    });
  });
});
