import { apiClient } from '../../../api/client';
import {
  Project,
  ProjectProgressSummary,
  ProjectModule,
  ProjectTask,
  ProjectTaskStatus,
  ProjectMilestone,
  ProjectArchitecture,
  ProjectTechnology,
  ProjectDocument,
  ProjectRequirement,
  ProjectRisk,
  ProjectActivity,
  ProjectIdea,
  CreateProjectRequest,
  GenerateProjectIdeasRequest,
  GenerateDocumentationRequest,
  GeneratePlanRequest,
} from '../types/project';

export const projectsApi = {
  // Projects
  async getProjects(filters?: { domain?: string; status?: string; project_type?: string; search?: string }): Promise<Project[]> {
    const params = new URLSearchParams();
    if (filters?.domain) params.append('domain', filters.domain);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.project_type) params.append('project_type', filters.project_type);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Project[]>(`/projects${query}`);
  },

  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${projectId}`);
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${projectId}`, updates);
  },

  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  },

  async getProjectProgress(projectId: string): Promise<ProjectProgressSummary> {
    return apiClient.get<ProjectProgressSummary>(`/projects/${projectId}/progress`);
  },

  async getProjectActivity(projectId: string): Promise<ProjectActivity[]> {
    return apiClient.get<ProjectActivity[]>(`/projects/${projectId}/activity`);
  },

  // Modules
  async getModules(projectId: string): Promise<ProjectModule[]> {
    return apiClient.get<ProjectModule[]>(`/projects/${projectId}/modules`);
  },

  async createModule(projectId: string, data: Omit<ProjectModule, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<ProjectModule> {
    return apiClient.post<ProjectModule>(`/projects/${projectId}/modules`, data);
  },

  async updateModule(projectId: string, moduleId: string, updates: Partial<ProjectModule>): Promise<ProjectModule> {
    return apiClient.patch<ProjectModule>(`/projects/${projectId}/modules/${moduleId}`, updates);
  },

  async deleteModule(projectId: string, moduleId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/modules/${moduleId}`);
  },

  // Tasks
  async getTasks(projectId: string, moduleId?: string): Promise<ProjectTask[]> {
    const query = moduleId ? `?module_id=${moduleId}` : '';
    return apiClient.get<ProjectTask[]>(`/projects/${projectId}/tasks${query}`);
  },

  async createTask(projectId: string, data: Omit<ProjectTask, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'status'> & { status?: ProjectTaskStatus }): Promise<ProjectTask> {
    return apiClient.post<ProjectTask>(`/projects/${projectId}/tasks`, data);
  },

  async updateTask(projectId: string, taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
    return apiClient.patch<ProjectTask>(`/projects/${projectId}/tasks/${taskId}`, updates);
  },

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  // Milestones
  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return apiClient.get<ProjectMilestone[]>(`/projects/${projectId}/milestones`);
  },

  async createMilestone(projectId: string, data: Omit<ProjectMilestone, 'id' | 'project_id' | 'created_at'>): Promise<ProjectMilestone> {
    return apiClient.post<ProjectMilestone>(`/projects/${projectId}/milestones`, data);
  },

  async updateMilestone(projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    return apiClient.patch<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, updates);
  },

  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`);
  },

  // Architecture
  async getArchitecture(projectId: string): Promise<ProjectArchitecture> {
    return apiClient.get<ProjectArchitecture>(`/projects/${projectId}/architecture`);
  },

  async saveArchitecture(projectId: string, data: Partial<ProjectArchitecture>): Promise<ProjectArchitecture> {
    return apiClient.put<ProjectArchitecture>(`/projects/${projectId}/architecture`, data);
  },

  // Technologies
  async getTechnologies(projectId: string): Promise<ProjectTechnology[]> {
    return apiClient.get<ProjectTechnology[]>(`/projects/${projectId}/technologies`);
  },

  async addTechnology(projectId: string, data: Omit<ProjectTechnology, 'id' | 'project_id'>): Promise<ProjectTechnology> {
    return apiClient.post<ProjectTechnology>(`/projects/${projectId}/technologies`, data);
  },

  async removeTechnology(projectId: string, techId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/technologies/${techId}`);
  },

  // Documentation
  async getDocuments(projectId: string): Promise<ProjectDocument[]> {
    return apiClient.get<ProjectDocument[]>(`/projects/${projectId}/documentation`);
  },

  async getDocument(projectId: string, docId: string): Promise<ProjectDocument> {
    return apiClient.get<ProjectDocument>(`/projects/${projectId}/documentation/${docId}`);
  },

  async saveDocument(projectId: string, data: Partial<ProjectDocument>): Promise<ProjectDocument> {
    return apiClient.post<ProjectDocument>(`/projects/${projectId}/documentation`, data);
  },

  async deleteDocument(projectId: string, docId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/documentation/${docId}`);
  },

  async generateDocument(projectId: string, req: GenerateDocumentationRequest): Promise<ProjectDocument> {
    return apiClient.post<ProjectDocument>(`/projects/${projectId}/documentation/generate`, req);
  },

  // Requirements & Risks
  async getRequirements(projectId: string): Promise<ProjectRequirement[]> {
    return apiClient.get<ProjectRequirement[]>(`/projects/${projectId}/requirements`);
  },

  async addRequirement(projectId: string, data: Omit<ProjectRequirement, 'id' | 'project_id' | 'created_at'>): Promise<ProjectRequirement> {
    return apiClient.post<ProjectRequirement>(`/projects/${projectId}/requirements`, data);
  },

  async getRisks(projectId: string): Promise<ProjectRisk[]> {
    return apiClient.get<ProjectRisk[]>(`/projects/${projectId}/risks`);
  },

  async addRisk(projectId: string, data: Omit<ProjectRisk, 'id' | 'project_id' | 'created_at'>): Promise<ProjectRisk> {
    return apiClient.post<ProjectRisk>(`/projects/${projectId}/risks`, data);
  },

  // AI Generators
  async generateProjectIdeas(req: GenerateProjectIdeasRequest): Promise<ProjectIdea[]> {
    return apiClient.post<ProjectIdea[]>('/projects/generate-ideas', req);
  },

  async generatePlan(projectId: string, req?: GeneratePlanRequest): Promise<any> {
    return apiClient.post<any>(`/projects/${projectId}/generate-plan`, req || {});
  },

  async applyPlan(projectId: string, plan: any): Promise<any> {
    return apiClient.post<any>(`/projects/${projectId}/apply-plan`, plan);
  },

  async generateArchitecture(projectId: string): Promise<ProjectArchitecture> {
    return apiClient.post<ProjectArchitecture>(`/projects/${projectId}/generate-architecture`, {});
  },

  async analyzeScope(projectId: string): Promise<any> {
    return apiClient.post<any>(`/projects/${projectId}/analyze-scope`, {});
  },

  async analyzeRisks(projectId: string): Promise<any> {
    return apiClient.post<any>(`/projects/${projectId}/analyze-risks`, {});
  },

  async suggestTechnologies(projectId: string): Promise<any> {
    return apiClient.post<any>(`/projects/${projectId}/suggest-technologies`, {});
  },

  async askProjectAI(projectId: string, question: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<{ response: string; references?: any[] }> {
    return apiClient.post<{ response: string; references?: any[] }>(`/projects/${projectId}/ask-ai`, {
      question,
      history,
    });
  },

  async generateNotes(projectId: string, noteType: string = 'ARCHITECTURE'): Promise<any> {
    return apiClient.post<any>(`/projects/${projectId}/generate-notes`, {
      note_type: noteType,
    });
  },
};
