import { apiClient } from '../../../api/client';

export type SkillCategory =
  | 'PROGRAMMING'
  | 'DATA'
  | 'AI_ML'
  | 'WEB'
  | 'DATABASE'
  | 'CLOUD'
  | 'DEVOPS'
  | 'SECURITY'
  | 'SOFTWARE_ENGINEERING'
  | 'COMMUNICATION'
  | 'APTITUDE'
  | 'DOMAIN';

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SkillConfidence =
  | 'VERIFIED'
  | 'STRONG_EVIDENCE'
  | 'DEVELOPING_EVIDENCE'
  | 'LIMITED_EVIDENCE'
  | 'NOT_ASSESSED';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  source: string;
  evidence_count: number;
  proficiency: SkillProficiency;
  confidence: SkillConfidence;
  last_updated_at: string;
}

export interface SkillEvidence {
  id: string;
  student_skill_id: string;
  student_id: string;
  skill_id: string;
  source_type: string;
  source_id: string;
  description: string;
  score?: number;
  created_at: string;
}

export interface SkillAssessment {
  id: string;
  student_id: string;
  title: string;
  skill_id: string;
  difficulty: string;
  question_count: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  score?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface SkillGapItem {
  skill: string;
  evidence_state: SkillConfidence;
  evidence_count?: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_learning_resource?: {
    title: string;
    type: string;
    reference_id?: string;
  };
  recommended_project?: string;
  recommended_practice?: string;
}

export interface SkillGapAnalysisResult {
  target_role: string;
  current_strengths: SkillGapItem[];
  skills_to_develop: SkillGapItem[];
  coverage_percentage: number;
  disclaimer: string;
}

export const skillsApi = {
  async listSkills(category?: string): Promise<Skill[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient.get<Skill[]>(`/skills${q}`);
  },

  async getSkill(id: string): Promise<Skill> {
    return apiClient.get<Skill>(`/skills/${id}`);
  },

  async getProfile(): Promise<StudentSkill[]> {
    return apiClient.get<StudentSkill[]>('/skills/profile');
  },

  async declareSkill(skillId: string, proficiency: SkillProficiency = 'INTERMEDIATE'): Promise<StudentSkill> {
    return apiClient.post<StudentSkill>('/skills/declare', {
      skill_id: skillId,
      proficiency,
    });
  },

  async getEvidence(skillId?: string): Promise<SkillEvidence[]> {
    const q = skillId ? `?skill_id=${encodeURIComponent(skillId)}` : '';
    return apiClient.get<SkillEvidence[]>(`/skills/evidence${q}`);
  },

  async getSkillGaps(roleId?: string): Promise<SkillGapAnalysisResult> {
    const q = roleId ? `?role_id=${encodeURIComponent(roleId)}` : '';
    return apiClient.get<SkillGapAnalysisResult>(`/skills/gaps${q}`);
  },

  async listAssessments(): Promise<SkillAssessment[]> {
    return apiClient.get<SkillAssessment[]>('/skills/assessments');
  },

  async startAssessment(
    skillId: string,
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'INTERMEDIATE',
    questionCount: number = 5
  ): Promise<{ assessment: SkillAssessment; questions: any[]; attemptId: string }> {
    return apiClient.post<{ assessment: SkillAssessment; questions: any[]; attemptId: string }>(
      '/skills/assessments',
      {
        skill_id: skillId,
        difficulty,
        question_count: questionCount,
      }
    );
  },

  async getAssessment(id: string): Promise<SkillAssessment> {
    return apiClient.get<SkillAssessment>(`/skills/assessments/${id}`);
  },

  async submitAnswer(
    assessmentId: string,
    questionId: string,
    selectedOption?: number,
    answerText?: string,
    code?: string
  ): Promise<any> {
    return apiClient.post<any>(`/skills/assessments/${assessmentId}/submit`, {
      question_id: questionId,
      selected_option: selectedOption,
      answer_text: answerText,
      code,
    });
  },

  async completeAssessment(assessmentId: string): Promise<{ assessment: SkillAssessment; attemptResult: any; evidence: any }> {
    return apiClient.post<{ assessment: SkillAssessment; attemptResult: any; evidence: any }>(
      `/skills/assessments/${assessmentId}/complete`,
      {}
    );
  },
};
