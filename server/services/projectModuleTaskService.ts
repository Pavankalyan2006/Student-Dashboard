import { db } from '../db/database';
import { ProjectModule, ProjectTask, ProjectMilestone, ProjectTaskStatus } from '../models/projectTypes';
import { ProjectService } from './projectService';

export class ProjectModuleTaskService {
  /**
   * Modules CRUD
   */
  public static async getModules(projectId: string, studentId: string): Promise<ProjectModule[]> {
    await ProjectService.getProject(projectId, studentId);
    const modules = await db.getProjectModules(projectId);
    return modules.sort((a, b) => a.order_index - b.order_index);
  }

  public static async createModule(
    projectId: string,
    studentId: string,
    data: Omit<ProjectModule, 'id' | 'project_id' | 'created_at' | 'updated_at'>
  ): Promise<ProjectModule> {
    await ProjectService.getProject(projectId, studentId);
    const existing = await db.getProjectModules(projectId);
    const now = new Date().toISOString();

    const newModule: ProjectModule = {
      ...data,
      id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      order_index: data.order_index || existing.length + 1,
      created_at: now,
      updated_at: now,
    };

    await db.saveProjectModule(newModule);
    await ProjectService.logActivity(projectId, studentId, 'MODULE_CREATED', `Module "${newModule.name}" added.`);
    await ProjectService.calculateProgress(projectId, studentId);
    return newModule;
  }

  public static async updateModule(
    projectId: string,
    studentId: string,
    moduleId: string,
    updates: Partial<ProjectModule>
  ): Promise<ProjectModule> {
    await ProjectService.getProject(projectId, studentId);
    const modules = await db.getProjectModules(projectId);
    const target = modules.find((m) => m.id === moduleId);
    if (!target) {
      throw new Error(`Module with ID '${moduleId}' not found in project`);
    }

    const updated: ProjectModule = {
      ...target,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await db.saveProjectModule(updated);
    await ProjectService.calculateProgress(projectId, studentId);
    return updated;
  }

  public static async deleteModule(
    projectId: string,
    studentId: string,
    moduleId: string
  ): Promise<boolean> {
    await ProjectService.getProject(projectId, studentId);
    await db.deleteProjectModule(projectId, moduleId);
    await ProjectService.calculateProgress(projectId, studentId);
    return true;
  }

  /**
   * Tasks CRUD with Dependency Cycle Validation
   */
  public static async getTasks(
    projectId: string,
    studentId: string,
    moduleId?: string
  ): Promise<ProjectTask[]> {
    await ProjectService.getProject(projectId, studentId);
    let tasks = await db.getProjectTasks(projectId);
    if (moduleId) {
      tasks = tasks.filter((t) => t.module_id === moduleId);
    }
    return tasks.sort((a, b) => a.order_index - b.order_index);
  }

  public static async createTask(
    projectId: string,
    studentId: string,
    data: Omit<ProjectTask, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'status'> & {
      status?: ProjectTaskStatus;
    }
  ): Promise<ProjectTask> {
    await ProjectService.getProject(projectId, studentId);
    const existing = await db.getProjectTasks(projectId);

    // Validate dependency if specified
    if (data.depends_on_task_id) {
      const depExists = existing.some((t) => t.id === data.depends_on_task_id);
      if (!depExists) {
        throw new Error(`Dependency task with ID '${data.depends_on_task_id}' does not exist.`);
      }
    }

    const now = new Date().toISOString();
    const newTask: ProjectTask = {
      ...data,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      order_index: data.order_index || existing.length + 1,
      status: data.status || 'TODO',
      created_at: now,
      updated_at: now,
      completed_at: data.status === 'DONE' ? now : undefined,
    };

    await db.saveProjectTask(newTask);
    await ProjectService.logActivity(projectId, studentId, 'TASK_CREATED', `Task "${newTask.title}" added.`);
    await ProjectService.calculateProgress(projectId, studentId);
    return newTask;
  }

  public static async updateTask(
    projectId: string,
    studentId: string,
    taskId: string,
    updates: Partial<ProjectTask>
  ): Promise<ProjectTask> {
    await ProjectService.getProject(projectId, studentId);
    const tasks = await db.getProjectTasks(projectId);
    const target = tasks.find((t) => t.id === taskId);
    if (!target) {
      throw new Error(`Task with ID '${taskId}' not found in project`);
    }

    // Check dependency loop if updating dependency
    if (updates.depends_on_task_id) {
      if (updates.depends_on_task_id === taskId) {
        throw new Error('Circular dependency error: A task cannot depend on itself.');
      }
      this.validateNoCyclicDependency(taskId, updates.depends_on_task_id, tasks);
    }

    const now = new Date().toISOString();
    const willBeDone = updates.status === 'DONE' && target.status !== 'DONE';
    const wasDone = target.status === 'DONE' && updates.status && updates.status !== 'DONE';

    const updated: ProjectTask = {
      ...target,
      ...updates,
      updated_at: now,
      completed_at: willBeDone ? now : wasDone ? undefined : target.completed_at,
    };

    await db.saveProjectTask(updated);

    if (willBeDone) {
      await ProjectService.logActivity(projectId, studentId, 'TASK_COMPLETED', `Task "${updated.title}" completed!`);
    }

    await ProjectService.calculateProgress(projectId, studentId);
    return updated;
  }

  public static async deleteTask(
    projectId: string,
    studentId: string,
    taskId: string
  ): Promise<boolean> {
    await ProjectService.getProject(projectId, studentId);
    await db.deleteProjectTask(projectId, taskId);
    await ProjectService.calculateProgress(projectId, studentId);
    return true;
  }

  /**
   * Milestones CRUD
   */
  public static async getMilestones(projectId: string, studentId: string): Promise<ProjectMilestone[]> {
    await ProjectService.getProject(projectId, studentId);
    const milestones = await db.getProjectMilestones(projectId);
    return milestones.sort((a, b) => a.order_index - b.order_index);
  }

  public static async createMilestone(
    projectId: string,
    studentId: string,
    data: Omit<ProjectMilestone, 'id' | 'project_id' | 'created_at'>
  ): Promise<ProjectMilestone> {
    await ProjectService.getProject(projectId, studentId);
    const existing = await db.getProjectMilestones(projectId);
    const now = new Date().toISOString();

    const newMilestone: ProjectMilestone = {
      ...data,
      id: `mile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      order_index: data.order_index || existing.length + 1,
      status: data.status || 'UPCOMING',
      created_at: now,
      completed_at: data.status === 'COMPLETED' ? now : undefined,
    };

    await db.saveProjectMilestone(newMilestone);
    await ProjectService.calculateProgress(projectId, studentId);
    return newMilestone;
  }

  public static async updateMilestone(
    projectId: string,
    studentId: string,
    milestoneId: string,
    updates: Partial<ProjectMilestone>
  ): Promise<ProjectMilestone> {
    await ProjectService.getProject(projectId, studentId);
    const milestones = await db.getProjectMilestones(projectId);
    const target = milestones.find((m) => m.id === milestoneId);
    if (!target) {
      throw new Error(`Milestone with ID '${milestoneId}' not found in project`);
    }

    const now = new Date().toISOString();
    const willBeDone = updates.status === 'COMPLETED' && target.status !== 'COMPLETED';

    const updated: ProjectMilestone = {
      ...target,
      ...updates,
      completed_at: willBeDone ? now : updates.status && updates.status !== 'COMPLETED' ? undefined : target.completed_at,
    };

    await db.saveProjectMilestone(updated);

    if (willBeDone) {
      await ProjectService.logActivity(projectId, studentId, 'MILESTONE_COMPLETED', `Milestone "${updated.title}" reached!`);
    }

    await ProjectService.calculateProgress(projectId, studentId);
    return updated;
  }

  public static async deleteMilestone(
    projectId: string,
    studentId: string,
    milestoneId: string
  ): Promise<boolean> {
    await ProjectService.getProject(projectId, studentId);
    await db.deleteProjectMilestone(projectId, milestoneId);
    await ProjectService.calculateProgress(projectId, studentId);
    return true;
  }

  /**
   * Helper: Cycle detection DFS
   */
  private static validateNoCyclicDependency(
    currentTaskId: string,
    targetDependencyId: string,
    allTasks: ProjectTask[]
  ): void {
    const visited = new Set<string>();
    let curr: string | undefined = targetDependencyId;

    while (curr) {
      if (curr === currentTaskId) {
        throw new Error('Circular dependency detected in project task hierarchy.');
      }
      if (visited.has(curr)) break;
      visited.add(curr);

      const parentTask = allTasks.find((t) => t.id === curr);
      curr = parentTask?.depends_on_task_id;
    }
  }
}
