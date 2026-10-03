import { apiClient } from '../../../api/client';

export interface CareerRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  skills: string[];
  technical_topics: string[];
  recommended_courses: string[];
  recommended_projects: string[];
  recommended_tools: string[];
  interview_topics: string[];
  coding_topics: string[];
  typical_learning_path: string[];
  source_metadata?: {
    source_name: string;
    last_reviewed: string;
    disclaimer: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CareerRoadmapStep {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  order_index: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  estimated_effort?: string;
  source_type?: string;
  source_id?: string;
  url?: string;
  action_label?: string;
}

export interface CareerRoadmap {
  id: string;
  student_id: string;
  role_id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  created_at: string;
  updated_at: string;
  steps: CareerRoadmapStep[];
}

export interface PotentiallyRelevantRole {
  role_id: string;
  role_name: string;
  match_percentage: number;
  match_reasons: string[];
  top_matching_skills: string[];
  skills_to_develop: string[];
}

export interface CareerRecommendationResult {
  potentially_relevant_roles: PotentiallyRelevantRole[];
  skills_to_develop: string[];
  recommended_projects: string[];
  recommended_courses: string[];
  explanation: string;
  disclaimer: string;
}

export const careerApi = {
  async listRoles(): Promise<CareerRole[]> {
    return apiClient.get<CareerRole[]>('/career/roles');
  },

  async getRole(id: string): Promise<CareerRole> {
    return apiClient.get<CareerRole>(`/career/roles/${id}`);
  },

  async compareRoles(roleIds: string[]): Promise<any> {
    return apiClient.post<any>('/career/compare', { role_ids: roleIds });
  },

  async getRecommendations(): Promise<CareerRecommendationResult> {
    return apiClient.get<CareerRecommendationResult>('/career/recommendations');
  },

  async listRoadmaps(): Promise<CareerRoadmap[]> {
    return apiClient.get<CareerRoadmap[]>('/career/roadmaps');
  },

  async generateRoadmap(roleId: string, title?: string): Promise<CareerRoadmap> {
    return apiClient.post<CareerRoadmap>('/career/roadmaps', { role_id: roleId, title });
  },

  async getRoadmap(id: string): Promise<CareerRoadmap> {
    return apiClient.get<CareerRoadmap>(`/career/roadmaps/${id}`);
  },

  async updateStepStatus(
    roadmapId: string,
    stepId: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<CareerRoadmap> {
    return apiClient.patch<CareerRoadmap>(`/career/roadmaps/${roadmapId}/steps/${stepId}`, { status });
  },

  async deleteRoadmap(id: string): Promise<boolean> {
    const res = await apiClient.delete<{ deleted: boolean }>(`/career/roadmaps/${id}`);
    return res?.deleted ?? true;
  },
};
