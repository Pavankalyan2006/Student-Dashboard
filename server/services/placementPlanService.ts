import { db } from '../db/database';
import {
  PlacementPlan,
  PlacementPlanTask,
  CreatePlacementPlanRequest,
} from '../models/placementTypes';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class PlacementPlanService {
  public static async getPlans(studentId: string): Promise<PlacementPlan[]> {
    return db.getPlacementPlans(studentId);
  }

  public static async getPlanById(planId: string, studentId: string): Promise<PlacementPlan> {
    const plan = await db.getPlacementPlanById(planId);
    if (!plan) {
      throw new NotFoundError(`Placement plan '${planId}' not found`);
    }
    if (plan.student_id !== studentId) {
      throw new AuthorizationError('You do not have permission to access this placement plan');
    }
    return plan;
  }

  public static async getPlanTasks(planId: string, studentId: string): Promise<PlacementPlanTask[]> {
    // Ownership check via getPlanById
    await this.getPlanById(planId, studentId);
    return db.getPlacementPlanTasks(planId, studentId);
  }

  public static async createPlan(
    studentId: string,
    req: CreatePlacementPlanRequest
  ): Promise<{ plan: PlacementPlan; tasks: PlacementPlanTask[] }> {
    if (!req || typeof req.target_role_id !== 'string' || !req.target_role_id) throw new ValidationError('target_role_id is required');
    const role = await db.getPlacementRoleById(req.target_role_id);
    if (!role) throw new NotFoundError(`Placement role '${req.target_role_id}' not found`);
    const roleName = role.name;
    const company = req.target_company_id ? await db.getPlacementCompanyById(req.target_company_id) : null;
    if (req.target_company_id && !company) throw new NotFoundError(`Company '${req.target_company_id}' not found`);

    const weeks = Math.max(1, Math.min(12, req.duration_weeks || 4));
    const now = new Date();
    const targetDate = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const title = company
      ? `${weeks}-Week ${company.name} ${roleName} Placement Sprint`
      : `${weeks}-Week ${roleName} Placement Preparation Plan`;

    const newPlan: PlacementPlan = {
      id: planId,
      student_id: studentId,
      title,
      target_role_id: req.target_role_id,
      target_company_id: req.target_company_id,
      duration_weeks: weeks,
      start_date: now.toISOString(),
      target_date: targetDate.toISOString(),
      status: 'ACTIVE',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    await db.savePlacementPlan(newPlan);

    // Generate structured weekly tasks
    const tasks: PlacementPlanTask[] = [];

    // Week 1: Aptitude & Core Data Structures
    tasks.push({
      id: `ptask_${Date.now()}_1`,
      plan_id: planId,
      student_id: studentId,
      title: 'Quantitative Aptitude: Percentages & Ratios',
      description: 'Review percentage multiplier methods and solve 15 practice questions.',
      category: 'APTITUDE',
      scheduled_week: 1,
      scheduled_date: new Date(now.getTime() + 1 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      source_type: 'TOPIC',
      source_id: 'top_place_apt_01',
      created_at: now.toISOString(),
    });

    tasks.push({
      id: `ptask_${Date.now()}_2`,
      plan_id: planId,
      student_id: studentId,
      title: 'DSA: Two Pointers & Sliding Window Practice',
      description: 'Practice fundamental array manipulation problems in the DSA Lab.',
      category: 'DSA',
      scheduled_week: 1,
      scheduled_date: new Date(now.getTime() + 3 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      source_type: 'DSA',
      source_id: 'two_pointers',
      created_at: now.toISOString(),
    });

    tasks.push({
      id: `ptask_${Date.now()}_3`,
      plan_id: planId,
      student_id: studentId,
      title: 'DBMS: Transactions & Isolation Levels',
      description: 'Study ACID properties, write-ahead logging, and read anomalies in DBMS topic.',
      category: 'DBMS',
      scheduled_week: 1,
      scheduled_date: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      source_type: 'TOPIC',
      source_id: 'top_place_tech_dbms_01',
      created_at: now.toISOString(),
    });

    // Week 2: Systems, OOP & First Technical Mock
    if (weeks >= 2) {
      tasks.push({
        id: `ptask_${Date.now()}_4`,
        plan_id: planId,
        student_id: studentId,
        title: 'Operating Systems: Deadlocks & Process Synchronization',
        description: 'Understand the 4 Coffman conditions and mutex vs semaphore mechanics.',
        category: 'OPERATING_SYSTEMS',
        scheduled_week: 2,
        scheduled_date: new Date(now.getTime() + 8 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        source_type: 'TOPIC',
        source_id: 'top_place_tech_os_01',
        created_at: now.toISOString(),
      });

      tasks.push({
        id: `ptask_${Date.now()}_5`,
        plan_id: planId,
        student_id: studentId,
        title: 'Technical Diagnostic Mock Interview',
        description: 'Complete a 30-minute AI technical mock interview to benchmark knowledge gaps.',
        category: 'PROJECT_INTERVIEW',
        scheduled_week: 2,
        scheduled_date: new Date(now.getTime() + 11 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        source_type: 'MOCK_INTERVIEW',
        created_at: now.toISOString(),
      });
    }

    // Week 3: Project Defense & Advanced Coding
    if (weeks >= 3) {
      tasks.push({
        id: `ptask_${Date.now()}_6`,
        plan_id: planId,
        student_id: studentId,
        title: 'Project Architecture & Technical Defense Review',
        description: 'Rehearse database schemas, latency bottlenecks, and trade-offs of your built project.',
        category: 'PROJECT_INTERVIEW',
        scheduled_week: 3,
        scheduled_date: new Date(now.getTime() + 15 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        source_type: 'PROJECT',
        created_at: now.toISOString(),
      });

      tasks.push({
        id: `ptask_${Date.now()}_7`,
        plan_id: planId,
        student_id: studentId,
        title: 'Computer Networks: TCP/IP & TLS Protocol Deep Dive',
        description: 'Master the 3-way handshake, sliding window, and browser request lifecycle.',
        category: 'COMPUTER_NETWORKS',
        scheduled_week: 3,
        scheduled_date: new Date(now.getTime() + 18 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        source_type: 'TOPIC',
        source_id: 'top_place_tech_cn_01',
        created_at: now.toISOString(),
      });
    }

    // Week 4: HR STAR Method & Full Company Simulation
    if (weeks >= 4) {
      tasks.push({
        id: `ptask_${Date.now()}_8`,
        plan_id: planId,
        student_id: studentId,
        title: 'HR & Behavioral: STAR Method Stories Formulation',
        description: 'Prepare structured Situation-Task-Action-Result narratives for leadership and conflict.',
        category: 'HR',
        scheduled_week: 4,
        scheduled_date: new Date(now.getTime() + 22 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        source_type: 'TOPIC',
        source_id: 'top_place_hr_01',
        created_at: now.toISOString(),
      });

      tasks.push({
        id: `ptask_${Date.now()}_9`,
        plan_id: planId,
        student_id: studentId,
        title: 'Final Full Placement Mock Interview Simulation',
        description: 'Take an end-to-end simulated technical + HR interview round.',
        category: 'BEHAVIORAL',
        scheduled_week: 4,
        scheduled_date: new Date(now.getTime() + 26 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        source_type: 'MOCK_INTERVIEW',
        created_at: now.toISOString(),
      });
    }

    for (const t of tasks) {
      await db.savePlacementPlanTask(t);
    }

    logger.info(`Created placement plan ${planId} with ${tasks.length} tasks for student ${studentId}`);
    return { plan: newPlan, tasks };
  }

  public static async updatePlanTask(
    planId: string,
    studentId: string,
    taskId: string,
    updates: Partial<PlacementPlanTask>
  ): Promise<PlacementPlanTask> {
    await this.getPlanById(planId, studentId);
    const tasks = await db.getPlacementPlanTasks(planId, studentId);
    const target = tasks.find((t) => t.id === taskId);
    if (!target) {
      throw new NotFoundError(`Task '${taskId}' not found in plan '${planId}'`);
    }

    const updated: PlacementPlanTask = {
      ...target,
      ...updates,
      completed_at: updates.status === 'COMPLETED' ? new Date().toISOString() : target.completed_at,
    };

    await db.savePlacementPlanTask(updated);
    return updated;
  }

  public static async updatePlan(
    planId: string,
    studentId: string,
    updates: Partial<PlacementPlan>
  ): Promise<PlacementPlan> {
    const plan = await this.getPlanById(planId, studentId);
    const updated: PlacementPlan = {
      ...plan,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await db.savePlacementPlan(updated);
    logger.info(`Updated placement plan ${planId} for student ${studentId}`);
    return updated;
  }

  public static async deletePlan(planId: string, studentId: string): Promise<boolean> {
    await this.getPlanById(planId, studentId);
    return db.deletePlacementPlan(planId, studentId);
  }
}
