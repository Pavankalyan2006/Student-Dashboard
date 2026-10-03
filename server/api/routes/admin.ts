import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../db/database';
import { requireAuth, requireRole } from '../../middleware/auth';
import { ToolRegistry } from '../../ai/tools';
import { ValidationError, NotFoundError } from '../../core/exceptions';
import { StudentAccountStatus } from '../../models/adminSecurityTypes';
import { ProgressService } from '../../services/progressService';

export const adminRouter = Router();

// ============================================================================
// STRICT SUPER ADMIN AUTHORIZATION GUARD
// Every route below this line requires authenticated SUPER_ADMIN role.
// ============================================================================
adminRouter.use(requireAuth);
adminRouter.use(requireRole('SUPER_ADMIN'));

// ----------------------------------------------------------------------------
// 1. DASHBOARD
// ----------------------------------------------------------------------------
adminRouter.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await db.getAdminDashboardSummary();
    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 2. STUDENTS MANAGEMENT
// ----------------------------------------------------------------------------
adminRouter.get('/students', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search = '',
      status = '',
      branch = '',
      semester = '',
      page = '1',
      limit = '20',
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    let students = await db.getAllStudents();

    // Filter by search (name or email)
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      students = students.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }

    // Filter by account status
    if (status && typeof status === 'string') {
      students = students.filter((s) => {
        const studentStatus = s.status || (s.is_active ? 'ACTIVE' : 'SUSPENDED');
        return studentStatus === status;
      });
    }

    // Filter by branch
    if (branch && typeof branch === 'string') {
      students = students.filter((s) =>
        s.branch.toLowerCase().includes(branch.toLowerCase())
      );
    }

    // Filter by semester
    if (semester && typeof semester === 'string') {
      const semNum = parseInt(semester, 10);
      if (!isNaN(semNum)) {
        students = students.filter((s) => s.semester === semNum);
      }
    }

    // Sorting
    students.sort((a: any, b: any) => {
      const fieldA = a[sort as string] ?? '';
      const fieldB = b[sort as string] ?? '';
      if (order === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      }
      return fieldA < fieldB ? 1 : -1;
    });

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const total = students.length;
    const paginated = students.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/students/:studentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await db.getStudentById(req.params.studentId);
    if (!student) {
      throw new NotFoundError(`Student with ID ${req.params.studentId} not found`);
    }

    const safeStudent = db.toSafeStudent(student);
    const profile = await db.getStudentProfile(student.id);
    const progress = await ProgressService.getUnifiedProgress(student.id);
    const projects = await db.getProjects(student.id);
    const certificates = await db.getCertificates(student.id);
    const goals = await db.getStudentGoals(student.id);

    res.json({
      success: true,
      data: {
        student: safeStudent,
        academic_profile: profile,
        progress_summary: {
          courses_completed: progress.courses_completed || 0,
          dsa_solved: progress.overall_indicators.dsa_problems_solved,
          coding_submissions: progress.overall_indicators.coding_problems_solved,
          streak_days: progress.streak.current_streak,
        },
        counts: {
          projects: projects.length,
          certificates: certificates.length,
          goals: goals.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/students/:studentId/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;
    if (!status || !['ACTIVE', 'SUSPENDED', 'PENDING', 'DISABLED'].includes(status)) {
      throw new ValidationError("Invalid or missing 'status'. Must be ACTIVE, SUSPENDED, PENDING, or DISABLED.");
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new ValidationError("Administrative 'reason' is required for all student status modifications.");
    }

    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Platform Super Admin';

    const updated = await db.updateStudentAccountStatus(
      req.params.studentId,
      status as StudentAccountStatus,
      reason.trim(),
      req.user!.userId,
      adminName,
      req.ip || '127.0.0.1'
    );

    res.json({
      success: true,
      data: db.toSafeStudent(updated),
      message: `Student account status updated to ${status}.`,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 3. AUDIT LOGS
// ----------------------------------------------------------------------------
adminRouter.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const targetType = req.query.targetType as string | undefined;
    const logs = await db.getAdminAuditLogs(limit, targetType);
    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 4. AI MANAGEMENT (PROVIDERS, MODELS, USAGE, TOOLS)
// ----------------------------------------------------------------------------
adminRouter.get('/ai/providers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await db.getAIProviders();
    res.json({
      success: true,
      data: providers,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/ai/providers/:providerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateAIProvider(
      req.params.providerId,
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/ai/models', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const models = await db.getAIModels();
    res.json({
      success: true,
      data: models,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/ai/models/:modelId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateAIModel(
      req.params.modelId,
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/ai/usage', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await db.getAIUsageAnalytics();
    res.json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/ai/tools', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tools = ToolRegistry.getAll();
    res.json({
      success: true,
      data: tools,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/ai/tools/:toolName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { is_enabled } = req.body;
    if (typeof is_enabled !== 'boolean') {
      throw new ValidationError("Body parameter 'is_enabled' must be boolean");
    }

    const tool = ToolRegistry.getTool(req.params.toolName);
    if (!tool) {
      throw new NotFoundError(`Tool '${req.params.toolName}' not found`);
    }

    ToolRegistry.setToolStatus(req.params.toolName, is_enabled);

    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';

    await db.createAdminAuditLog({
      admin_id: req.user!.userId,
      admin_name: adminName,
      action: is_enabled ? 'ENABLE_AI_TOOL' : 'DISABLE_AI_TOOL',
      target_type: 'AI_TOOL',
      target_id: req.params.toolName,
      metadata: { is_enabled },
      ip_hash: req.ip || '127.0.0.1',
      user_agent: 'BTechAdminPortal/1.0',
    });

    res.json({
      success: true,
      message: `Tool '${req.params.toolName}' ${is_enabled ? 'enabled' : 'disabled'} successfully`,
      data: ToolRegistry.get(req.params.toolName),
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 5. INTEGRATIONS ADMIN (GITHUB, RESEARCH, STORAGE)
// ----------------------------------------------------------------------------
adminRouter.get('/integrations/github', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await db.getGitHubAdminStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/integrations/github', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateGitHubAdminStatus(
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/integrations/research', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await db.getResearchProviders();
    res.json({
      success: true,
      data: providers,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/integrations/research/:providerId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateResearchProvider(
      req.params.providerId,
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/integrations/storage', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await db.getStorageAdminMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 6. BACKGROUND JOBS
// ----------------------------------------------------------------------------
adminRouter.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type } = req.query;
    const jobs = await db.getBackgroundJobs(
      status as string | undefined,
      type as string | undefined
    );
    res.json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/jobs/:jobId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await db.getBackgroundJobById(req.params.jobId);
    if (!job) {
      throw new NotFoundError(`Background job '${req.params.jobId}' not found`);
    }
    res.json({
      success: true,
      data: job,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/jobs/:jobId/retry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const retriedJob = await db.retryBackgroundJob(
      req.params.jobId,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: retriedJob,
      message: `Job ${req.params.jobId} safely queued for re-execution.`,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 7. SYSTEM MONITORING & LOGS
// ----------------------------------------------------------------------------
adminRouter.get('/system/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const health = await db.getSystemHealth();
    res.json({
      success: true,
      data: health,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/system/metrics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await db.getSystemMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/system/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const level = req.query.level as string | undefined;
    const logs = await db.getStructuredLogs(limit, level);
    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 8. SECURITY & RATE LIMITS
// ----------------------------------------------------------------------------
adminRouter.get('/security/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const severity = req.query.severity as string | undefined;
    const events = await db.getSecurityEvents(severity, limit);
    res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/security/rate-limits', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await db.getRateLimitConfigs();
    res.json({
      success: true,
      data: configs,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/security/rate-limits/:ruleId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateRateLimitConfig(
      req.params.ruleId,
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 9. COMMUNITY REPORTS MODERATION
// ----------------------------------------------------------------------------
adminRouter.get('/community/reports', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await db.getCommunityReports();
    res.json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/community/reports/:reportId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, moderation_notes = '' } = req.body;
    if (!['REVIEWING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      throw new ValidationError("Status must be 'REVIEWING', 'RESOLVED', or 'DISMISSED'");
    }

    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';

    const updated = await db.updateCommunityReportStatus(
      req.params.reportId,
      status,
      moderation_notes,
      req.user!.userId,
      adminName
    );

    res.json({
      success: true,
      data: updated,
      message: `Report ${req.params.reportId} marked as ${status}.`,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 10. PLATFORM SETTINGS & FEATURE FLAGS
// ----------------------------------------------------------------------------
adminRouter.get('/settings/features', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await db.getFeatureFlags();
    res.json({
      success: true,
      data: flags,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/settings/flags', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await db.getFeatureFlags();
    res.json({
      success: true,
      data: flags,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/settings/features/:flagKey', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateFeatureFlag(
      req.params.flagKey,
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/settings/flags/:flagKey', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    const updated = await db.updateFeatureFlag(
      req.params.flagKey,
      req.body,
      req.user!.userId,
      adminName
    );
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 11. CONTENT MANAGEMENT (COURSES)
// ----------------------------------------------------------------------------
adminRouter.get('/content/courses', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await db.getAllCourses();
    res.json({
      success: true,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/content/courses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, code, branch, semester, difficulty, estimated_hours } = req.body;
    if (!title || !code) {
      throw new ValidationError("Both 'title' and 'code' are required to create a course");
    }

    const course = await db.createCourse({
      title,
      description: description || '',
      code,
      branch: branch || 'Computer Science & Engineering',
      semester: semester || 6,
      difficulty: difficulty || 'INTERMEDIATE',
      estimated_hours: estimated_hours || 45,
    });

    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    await db.createAdminAuditLog({
      admin_id: req.user!.userId,
      admin_name: adminName,
      action: 'CREATE_COURSE',
      target_type: 'CONTENT',
      target_id: course.id,
      metadata: { code, title },
      ip_hash: req.ip || '127.0.0.1',
      user_agent: 'BTechAdminPortal/1.0',
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------------
// 12. MULTI-AGENT AI ORCHESTRATION MONITORING & FEATURE FLAGS
// ----------------------------------------------------------------------------

// GET /api/v1/admin/ai/agents - List all 28 specialized agents with metrics
adminRouter.get('/ai/agents', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { AgentRegistry } = await import('../../ai/orchestration/registry');
    const agents = AgentRegistry.getAll();
    const metrics = AgentRegistry.getMetrics();

    const enriched = agents.map((agent) => {
      const metric = metrics.find((m) => m.agentName === agent.name);
      return {
        ...agent,
        metric: metric || {
          totalRequests: 0,
          successCount: 0,
          failureCount: 0,
          successRate: 100,
          averageDurationMs: 0,
          toolCallsCount: 0,
        },
      };
    });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/ai/agents/:name/toggle - Toggle feature flag for specialized agent
adminRouter.post('/ai/agents/:name/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;
    const { AgentRegistry } = await import('../../ai/orchestration/registry');
    const { AgentName } = await import('../../ai/orchestration/types');

    if (typeof enabled !== 'boolean') {
      throw new ValidationError("Parameter 'enabled' must be a boolean");
    }

    const success = AgentRegistry.setEnabled(name as any, enabled);
    if (!success) {
      throw new NotFoundError(`Agent '${name}' not found`);
    }

    const admin = await db.getStudentById(req.user!.userId);
    const adminName = admin ? admin.name : 'Super Admin';
    await db.createAdminAuditLog({
      admin_id: req.user!.userId,
      admin_name: adminName,
      action: enabled ? 'ENABLE_AGENT' : 'DISABLE_AGENT',
      target_type: 'SYSTEM',
      target_id: name,
      metadata: { enabled },
      ip_hash: req.ip || '127.0.0.1',
      user_agent: 'BTechAdminPortal/1.0',
    });

    res.json({
      success: true,
      data: {
        agentName: name,
        enabled,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/ai/workflows - Multi-agent workflow execution observability
adminRouter.get('/ai/workflows', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const workflows = await db.getAgentWorkflows(undefined, limit);

    const total = workflows.length;
    const completed = workflows.filter((w) => w.status === 'COMPLETED').length;
    const failed = workflows.filter((w) => w.status === 'FAILED').length;
    const active = workflows.filter((w) => w.status === 'PROCESSING' || w.status === 'QUEUED').length;

    const totalDuration = workflows.reduce((acc, w) => acc + (w.total_duration_ms || 0), 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          total,
          completed,
          failed,
          active,
          averageDurationMs: avgDuration,
        },
        workflows,
      },
    });
  } catch (err) {
    next(err);
  }
});

