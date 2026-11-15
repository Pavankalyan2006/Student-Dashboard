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
  /** Whether real activity backs this step (computed by the server; a self-marked tick does not count). */
  evidence?: { verified: boolean; detail: string };
}

export interface CareerRoadmap {
  id: string;
  student_id: string;
  role_id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'IN_PROGRESS';
  created_at: string;
  updated_at: string;
  steps: CareerRoadmapStep[];
  verified_progress?: { done: number; total: number; percent: number };
  self_marked_done?: number;
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

export interface CareerProfileData {
  student_id: string;
  target_roles: string[];
  preferred_industries: string[];
  preferred_locations: string[];
  preferred_work_arrangement: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'FLEXIBLE';
  graduation_year?: number;
  technical_skills: string[];
  career_goals: string[];
  updated_at: string;
}

export interface CareerDashboardSummary {
  career_profile: CareerProfileData;
  readiness: {
    resume_completeness: number;
    resume_sections_status: { section: string; complete: boolean; details?: string }[];
    skills_aligned_percentage: number | null;
    target_role_name?: string | null;
    matching_skills: string[];
    skills_to_develop: string[];
    projects_count: number;
    projects_available: { id: string; title: string; domain?: string }[];
    placement_prep_progress: {
      topics_practiced: number | null;
      total_topics: number | null;
      mock_interviews_count: number;
      latest_mock_score?: number;
      active_sprint_title?: string | null;
    };
    applications_in_progress: number;
    upcoming_deadlines: {
      id: string;
      title: string;
      company: string;
      date: string;
      type: 'DEADLINE' | 'INTERVIEW' | 'ASSESSMENT';
    }[];
    readiness_explanation: string;
  };
  recommended_actions: {
    id: string;
    title: string;
    description: string;
    action_label: string;
    target_path: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'RESUME' | 'PLACEMENT' | 'JOBS' | 'APPLICATIONS' | 'PLATFORMS' | 'SKILLS';
  }[];
  recent_activity: {
    id: string;
    title: string;
    subtitle: string;
    timestamp: string;
    category: 'APPLICATION' | 'RESUME' | 'INTERVIEW' | 'INTEGRATION' | 'PROFILE';
    url?: string;
  }[];
}

export const careerApi = {
  async getDashboardSummary(): Promise<CareerDashboardSummary> {
    return apiClient.get<CareerDashboardSummary>('/career/dashboard-summary');
  },

  async getProfile(): Promise<CareerProfileData> {
    return apiClient.get<CareerProfileData>('/career/profile');
  },

  async updateProfile(data: Partial<CareerProfileData>): Promise<CareerProfileData> {
    return apiClient.patch<CareerProfileData>('/career/profile', data);
  },

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
