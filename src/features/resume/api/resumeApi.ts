import { apiClient } from '../../../api/client';
import {
  Resume,
  FullResumeData,
  ResumeProfile,
  ResumeEducation,
  ResumeSkill,
  ResumeProject,
  ResumeExperience,
  ResumeCertification,
  ResumeAchievement,
  ResumeVersion,
  ResumeAnalysisResult,
  ResumeTailoringResult,
  CustomTemplateConfig,
} from '../types/resumeTypes';

export const resumeApi = {
  async listResumes(): Promise<Resume[]> {
    return apiClient.get<Resume[]>('/resumes');
  },

  async uploadTemplate(
    id: string,
    data: {
      filename: string;
      mimeType?: string;
      contentBase64?: string;
      rawText?: string;
    }
  ): Promise<{ templateConfig: CustomTemplateConfig; fullResume: FullResumeData }> {
    return apiClient.post<{ templateConfig: CustomTemplateConfig; fullResume: FullResumeData }>(
      `/resumes/${id}/upload-template`,
      data
    );
  },

  async getFullResume(id: string): Promise<FullResumeData> {
    return apiClient.get<FullResumeData>(`/resumes/${id}`);
  },

  async createResume(data: {
    title?: string;
    template?: string;
    target_role?: string;
    target_industry?: string;
    summary?: string;
  }): Promise<FullResumeData> {
    return apiClient.post<FullResumeData>('/resumes', data);
  },

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    return apiClient.patch<Resume>(`/resumes/${id}`, updates);
  },

  async deleteResume(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ deleted: boolean }>(`/resumes/${id}`);
    return res?.deleted ?? true;
  },

  async updateProfile(id: string, profile: Partial<ResumeProfile>): Promise<ResumeProfile> {
    return apiClient.put<ResumeProfile>(`/resumes/${id}/profile`, profile);
  },

  async updateEducation(id: string, education: ResumeEducation[]): Promise<ResumeEducation[]> {
    return apiClient.put<ResumeEducation[]>(`/resumes/${id}/education`, { education });
  },

  async updateSkills(id: string, skills: ResumeSkill[]): Promise<ResumeSkill[]> {
    return apiClient.put<ResumeSkill[]>(`/resumes/${id}/skills`, { skills });
  },

  async updateProjects(id: string, projects: ResumeProject[]): Promise<ResumeProject[]> {
    return apiClient.put<ResumeProject[]>(`/resumes/${id}/projects`, { projects });
  },

  async importProject(id: string, projectId: string): Promise<ResumeProject> {
    return apiClient.post<ResumeProject>(`/resumes/${id}/projects/import`, { project_id: projectId });
  },

  async updateExperience(id: string, experience: ResumeExperience[]): Promise<ResumeExperience[]> {
    return apiClient.put<ResumeExperience[]>(`/resumes/${id}/experience`, { experience });
  },

  async updateCertifications(id: string, certifications: ResumeCertification[]): Promise<ResumeCertification[]> {
    return apiClient.put<ResumeCertification[]>(`/resumes/${id}/certifications`, { certifications });
  },

  async updateAchievements(id: string, achievements: ResumeAchievement[]): Promise<ResumeAchievement[]> {
    return apiClient.put<ResumeAchievement[]>(`/resumes/${id}/achievements`, { achievements });
  },

  async updateSectionOrder(id: string, order: string[]): Promise<string[]> {
    return apiClient.put<string[]>(`/resumes/${id}/sections`, { section_order: order });
  },

  async listVersions(id: string): Promise<ResumeVersion[]> {
    return apiClient.get<ResumeVersion[]>(`/resumes/${id}/versions`);
  },

  async createVersion(id: string, createdBy?: string): Promise<ResumeVersion> {
    return apiClient.post<ResumeVersion>(`/resumes/${id}/versions`, { created_by: createdBy });
  },

  async restoreVersion(id: string, versionNumber: number): Promise<FullResumeData> {
    return apiClient.post<FullResumeData>(`/resumes/${id}/versions/${versionNumber}/restore`, {});
  },

  async analyzeResume(id: string): Promise<ResumeAnalysisResult> {
    return apiClient.get<ResumeAnalysisResult>(`/resumes/${id}/analyze`);
  },

  async tailorResume(
    id: string,
    data: { job_description: string; job_title?: string; company?: string }
  ): Promise<ResumeTailoringResult> {
    return apiClient.post<ResumeTailoringResult>(`/resumes/${id}/tailor`, data);
  },

  async generateAISummary(
    id: string,
    data: { target_role?: string; target_industry?: string }
  ): Promise<{ summary: string; rationale: string }> {
    return apiClient.post<{ summary: string; rationale: string }>(`/resumes/${id}/ai/summary`, data);
  },

  async generateAIBullet(
    id: string,
    data: { project_title?: string; task: string; technology?: string; outcome?: string }
  ): Promise<{ bullet: string; formula_breakdown: string }> {
    return apiClient.post<{ bullet: string; formula_breakdown: string }>(`/resumes/${id}/ai/bullet`, data);
  },

  async improveWording(
    id: string,
    data: { current_text: string; improvement_type?: string; target_role?: string }
  ): Promise<{ current: string; suggested: string; reason: string }> {
    return apiClient.post<{ current: string; suggested: string; reason: string }>(`/resumes/${id}/ai/improve`, data);
  },
};

