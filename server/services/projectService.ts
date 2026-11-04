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
  public static async createProject(
    studentId: string,
    data: CreateProjectRequest
  ): Promise<Project> {
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
      description: data.description || `A ${data.project_type} focused on ${data.domain}.`,
      project_type: data.project_type,
      domain: data.domain,
      problem_statement: data.problem_statement || '',
      objectives: data.objectives || [],
      target_users: data.target_users || 'Students, engineers, and domain researchers',
      expected_outcome: data.expected_outcome || '',
      status: 'PLANNING',
      progress_percentage: 0,
      tags: [data.domain, data.project_type],
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
    const updated: Project = {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
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
