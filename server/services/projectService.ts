import { ValidationError } from '../core/exceptions';
import { db } from '../db/database';
import {
  Project,
  CreateProjectRequest,
  ProjectProgressSummary,
  ProjectTechnology,
  ProjectRequirement,
  ProjectRisk,
  ProjectActivity,
} from '../models/projectTypes';
import { logger } from '../core/logging';

export class ProjectService {
  /**
   * List projects belonging to a student with optional domain/type/status filters
   */
  public static async getProjects(studentId: string): Promise<Project[]> {
    return this.listProjects(studentId);
  }

  public static async listProjects(
    studentId: string,
    filters?: {
      domain?: string;
      status?: string;
      project_type?: string;
      search?: string;
    }
  ): Promise<Project[]> {
    const projects = await db.getProjects(studentId);
    if (!filters) return projects;

    return projects.filter((p) => {
      if (filters.domain && p.domain.toLowerCase() !== filters.domain.toLowerCase()) {
        return false;
      }
      if (filters.status && p.status !== filters.status) {
        return false;
      }
      if (filters.project_type && p.project_type !== filters.project_type) {
        return false;
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesDomain = p.domain.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesDomain) return false;
      }
      return true;
    });
  }

  /**
   * Get a single project verifying student ownership
   */
  public static async getProject(projectId: string, studentId: string): Promise<Project> {
    const project = await db.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID '${projectId}' not found`);
    }
    if (project.student_id !== studentId) {
      throw new Error('Forbidden: You do not have permission to access this project');
    }
    return project;
  }

  /**
   * Create a new project with slug generation and optional starter modules/technologies
   */
  private static readonly STATUSES = ['DRAFT', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
  private static readonly TYPES = ['MINI_PROJECT', 'MAJOR_PROJECT', 'FINAL_YEAR_PROJECT', 'RESEARCH_PROJECT', 'PERSONAL_PROJECT', 'OPEN_SOURCE_PROJECT'];

  /**
   * Validates the fields a student may set on a project. Ownership, id, slug, progress and timestamps are
   * server-controlled and are never taken from the request (a PATCH could previously set student_id).
   */
  private static cleanFields(data: any, isCreate: boolean): Partial<Project> {
    const out: any = {};
    const str = (k: string, max: number) => {
      if (data[k] === undefined) return;
      if (data[k] !== null && typeof data[k] !== 'string') throw new ValidationError(`${k} must be text`);
      const v = (data[k] || '').trim();
      if (v.length > max) throw new ValidationError(`${k} is too long (${max} characters at most)`);
      out[k] = v;
    };
    str('title', 150); str('description', 5000); str('domain', 100); str('problem_statement', 5000);
    str('target_users', 500); str('expected_outcome', 2000);
    if (isCreate && !out.title) throw new ValidationError('A project title is required');
    if (!isCreate && data.title !== undefined && !out.title) throw new ValidationError('A project title cannot be empty');
    if (data.project_type !== undefined) {
      if (!this.TYPES.includes(data.project_type)) throw new ValidationError(`project_type must be one of ${this.TYPES.join(', ')}`);
      out.project_type = data.project_type;
    }
    if (data.status !== undefined) {
      if (!this.STATUSES.includes(data.status)) throw new ValidationError(`status must be one of ${this.STATUSES.join(', ')}`);
      out.status = data.status;
    }
    for (const k of ['repository_url', 'demo_url', 'documentation_url']) {
      if (data[k] === undefined) continue;
      const v = String(data[k] || '').trim();
      if (v && !/^https?:\/\/[^\s/$.?#][^\s]*$/i.test(v)) throw new ValidationError(`${k} must be an http(s) URL`);
      if (v.length > 500) throw new ValidationError(`${k} is too long`);
      out[k] = v || undefined;
    }
    for (const k of ['start_date', 'target_end_date']) {
      if (data[k] === undefined) continue;
      const v = String(data[k] || '').trim();
      if (v && Number.isNaN(Date.parse(v))) throw new ValidationError(`${k} must be a date`);
      out[k] = v || undefined;
    }
    if (out.start_date && out.target_end_date && Date.parse(out.target_end_date) < Date.parse(out.start_date)) {
      throw new ValidationError('target_end_date cannot be before start_date');
    }
    for (const k of ['objectives', 'tags', 'team_members']) {
      if (data[k] === undefined) continue;
      if (!Array.isArray(data[k])) throw new ValidationError(`${k} must be a list`);
      out[k] = data[k].map((x: any) => String(x ?? '').trim()).filter(Boolean).slice(0, 50).map((x: string) => x.slice(0, 300));
    }
    return out;
  }

  public static async createProject(
    studentId: string,
    data: CreateProjectRequest
  ): Promise<Project> {
    const clean = this.cleanFields(data || {}, true) as any;
    data = { ...data, ...clean };
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const now = new Date().toISOString();

    const newProject: Project = {
      id,
      student_id: studentId,
      title: data.title,
      slug,
      description: clean.description || '',
      project_type: (clean.project_type || 'PERSONAL_PROJECT') as any,
      domain: clean.domain || '',
      problem_statement: data.problem_statement || '',
      objectives: data.objectives || [],
      target_users: clean.target_users || '',
      expected_outcome: data.expected_outcome || '',
      status: (clean.status || 'PLANNING') as any,
      progress_percentage: 0,
      tags: clean.tags || [clean.domain, clean.project_type].filter(Boolean),
      repository_url: clean.repository_url,
      demo_url: clean.demo_url,
      documentation_url: clean.documentation_url,
      start_date: clean.start_date,
      target_end_date: clean.target_end_date,
      team_members: clean.team_members || [],
      created_at: now,
      updated_at: now,
    };

    await db.saveProject(newProject);

    // Seed default starter technologies if provided
    if (data.technologies && data.technologies.length > 0) {
      for (const tech of data.technologies) {
        await db.saveProjectTechnology({
          id: `tech_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          project_id: id,
          category: tech.category,
          technology: tech.technology,
          reason: tech.reason,
          is_required: tech.is_required !== false,
        });
      }
    }

    // Seed default starter modules if provided
    if (data.modules && data.modules.length > 0) {
      for (let i = 0; i < data.modules.length; i++) {
        const mod = data.modules[i];
        await db.saveProjectModule({
          id: `mod_${Date.now()}_${i + 1}`,
          project_id: id,
          name: mod.name,
          description: mod.description,
          purpose: mod.purpose || mod.description,
          priority: mod.priority || 'MEDIUM',
          status: 'TODO',
          order_index: i + 1,
          created_at: now,
          updated_at: now,
        });
      }
    }

    // Log creation activity
    await this.logActivity(id, studentId, 'PROJECT_CREATED', `Project "${data.title}" created.`);

    return newProject;
  }

  /**
   * Update project fields with authorization check
   */
  public static async updateProject(
    projectId: string,
    studentId: string,
    updates: Partial<Project>
  ): Promise<Project> {
    const project = await this.getProject(projectId, studentId);
    const clean = this.cleanFields(updates || {}, false);
    const updated: Project = {
      ...project,
      ...clean,
      updated_at: new Date().toISOString(),
    };
    if (clean.status === 'COMPLETED' && project.status !== 'COMPLETED') updated.completed_at = updated.updated_at;
    if (clean.status && clean.status !== 'COMPLETED') updated.completed_at = undefined;
    if (clean.title && clean.title !== project.title) {
      updated.slug = clean.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (clean.status && clean.status !== project.status) {
      await this.logActivity(projectId, studentId, 'STATUS_CHANGED', `Status changed from ${project.status} to ${clean.status}.`);
    }
    await db.saveProject(updated);
    return updated;
  }

  /**
   * Delete a project and associated entities with ownership verification
   */
  public static async deleteProject(projectId: string, studentId: string): Promise<boolean> {
    await this.getProject(projectId, studentId);
    await db.deleteProject(projectId);
    return true;
  }

  /**
   * Authoritative backend calculation of project progress
   * Formula: 60% task completion + 30% milestone completion + 10% module completion
   */
  public static async calculateProgress(
    projectId: string,
    studentId: string
  ): Promise<ProjectProgressSummary> {
    await this.getProject(projectId, studentId);

    const tasks = await db.getProjectTasks(projectId);
    const milestones = await db.getProjectMilestones(projectId);
    const modules = await db.getProjectModules(projectId);
    const documents = await db.getProjectDocuments(projectId);

    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'DONE').length;

    const milestonesTotal = milestones.length;
    const milestonesCompleted = milestones.filter((m) => m.status === 'COMPLETED').length;

    const modulesTotal = modules.length;
    const modulesCompleted = modules.filter((m) => m.status === 'COMPLETED').length;

    let overallPercentage = 0;
    if (tasksTotal > 0 || milestonesTotal > 0 || modulesTotal > 0) {
      const taskScore = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 60 : 0;
      const milestoneScore = milestonesTotal > 0 ? (milestonesCompleted / milestonesTotal) * 30 : 0;
      const moduleScore = modulesTotal > 0 ? (modulesCompleted / modulesTotal) * 10 : 0;
      
      const normalizer =
        (tasksTotal > 0 ? 60 : 0) +
        (milestonesTotal > 0 ? 30 : 0) +
        (modulesTotal > 0 ? 10 : 0);

      overallPercentage = normalizer > 0 ? Math.round(((taskScore + milestoneScore + moduleScore) / normalizer) * 100) : 0;
    }

    // Persist calculated progress to project model
    const project = await db.getProjectById(projectId);
    if (project && project.progress_percentage !== overallPercentage) {
      await db.saveProject({
        ...project,
        progress_percentage: overallPercentage,
        updated_at: new Date().toISOString(),
      });
    }

    const activities = await db.getProjectActivities(projectId);
    const lastActivity = activities.length > 0 ? activities[0].created_at : new Date().toISOString();

    return {
      overall_percentage: overallPercentage,
      tasks_total: tasksTotal,
      tasks_completed: tasksCompleted,
      modules_total: modulesTotal,
      modules_completed: modulesCompleted,
      milestones_total: milestonesTotal,
      milestones_completed: milestonesCompleted,
      documents_total: documents.length,
      last_activity_at: lastActivity,
    };
  }

  /**
   * Log an activity event for a project
   */
  public static async logActivity(
    projectId: string,
    studentId: string,
    type: ProjectActivity['activity_type'],
    message: string,
    metadata?: Record<string, any>
  ): Promise<ProjectActivity> {
    const activity: ProjectActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      student_id: studentId,
      activity_type: type,
      message,
      metadata,
      created_at: new Date().toISOString(),
    };
    await db.saveProjectActivity(activity);
    return activity;
  }

  /**
   * Technologies Management
   */
  public static async getTechnologies(projectId: string, studentId: string): Promise<ProjectTechnology[]> {
    await this.getProject(projectId, studentId);
    return db.getProjectTechnologies(projectId);
  }

  public static async addTechnology(
    projectId: string,
    studentId: string,
    tech: Omit<ProjectTechnology, 'id' | 'project_id'>
  ): Promise<ProjectTechnology> {
    await this.getProject(projectId, studentId);
    const newTech: ProjectTechnology = {
      ...tech,
      id: `tech_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
    };
    await db.saveProjectTechnology(newTech);
    await this.logActivity(projectId, studentId, 'TECH_UPDATED', `Added technology "${tech.technology}" (${tech.category}).`);
    return newTech;
  }

  public static async removeTechnology(
    projectId: string,
    studentId: string,
    techId: string
  ): Promise<boolean> {
    await this.getProject(projectId, studentId);
    await db.deleteProjectTechnology(projectId, techId);
    return true;
  }

  /**
   * Requirements Management
   */
  public static async getRequirements(projectId: string, studentId: string): Promise<ProjectRequirement[]> {
    await this.getProject(projectId, studentId);
    return db.getProjectRequirements(projectId);
  }

  public static async addRequirement(
    projectId: string,
    studentId: string,
    req: Omit<ProjectRequirement, 'id' | 'project_id' | 'created_at'>
  ): Promise<ProjectRequirement> {
    await this.getProject(projectId, studentId);
    const newReq: ProjectRequirement = {
      ...req,
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      created_at: new Date().toISOString(),
    };
    await db.saveProjectRequirement(newReq);
    return newReq;
  }

  /**
   * Risks Management
   */
  public static async getRisks(projectId: string, studentId: string): Promise<ProjectRisk[]> {
    await this.getProject(projectId, studentId);
    return db.getProjectRisks(projectId);
  }

  public static async addRisk(
    projectId: string,
    studentId: string,
    risk: Omit<ProjectRisk, 'id' | 'project_id' | 'created_at'>
  ): Promise<ProjectRisk> {
    await this.getProject(projectId, studentId);
    const newRisk: ProjectRisk = {
      ...risk,
      id: `risk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: projectId,
      created_at: new Date().toISOString(),
    };
    await db.saveProjectRisk(newRisk);
    return newRisk;
  }
}
