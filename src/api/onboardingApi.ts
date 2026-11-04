import { apiClient } from './client';
import {
  OnboardingStatus,
  OnboardingStepId,
  EducationProfile,
  SemesterSyllabusData,
  AcademicSubject,
  AcademicDate,
  LearningPreferences,
  StudentSkillsAssessment,
  SkillSelfAssessment,
  AcademicHistory,
  CareerGoals,
  PortfolioProject,
  StudyConstraints,
  ProfileCompletion,
  StudentIntelligenceContext,
  StudentMemoryEntry,
  StudentRecommendation,
  StudentAIPersona,
} from '../../server/models/onboardingTypes';

function extractData<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
    return res.data as T;
  }
  return res as T;
}

export const onboardingApi = {
  // Onboarding workflow
  getStatus: async (): Promise<OnboardingStatus> => {
    const res = await apiClient.get<any>('/students/me/onboarding');
    return extractData<OnboardingStatus>(res);
  },

  updateStep: async (step_id: OnboardingStepId, completed: boolean, skipped: boolean = false): Promise<OnboardingStatus> => {
    const res = await apiClient.put<any>('/students/me/onboarding', {
      step_id,
      completed,
      skipped,
    });
    return extractData<OnboardingStatus>(res);
  },

  completeOnboarding: async (): Promise<OnboardingStatus> => {
    const res = await apiClient.post<any>('/students/me/onboarding/complete');
    return extractData<OnboardingStatus>(res);
  },

  // Education Profile
  getEducation: async (): Promise<EducationProfile | null> => {
    const res = await apiClient.get<any>('/students/me/education');
    return extractData<EducationProfile | null>(res);
  },

  saveEducation: async (data: Partial<EducationProfile>): Promise<EducationProfile> => {
    const res = await apiClient.put<any>('/students/me/education', data);
    return extractData<EducationProfile>(res);
  },

  // Semester & Syllabus
  getSemesterSyllabus: async (): Promise<SemesterSyllabusData | null> => {
    const res = await apiClient.get<any>('/students/me/semester-syllabus');
    return extractData<SemesterSyllabusData | null>(res);
  },

  saveSemesterSyllabus: async (data: Partial<SemesterSyllabusData>): Promise<SemesterSyllabusData> => {
    const res = await apiClient.put<any>('/students/me/semester-syllabus', data);
    return extractData<SemesterSyllabusData>(res);
  },

  // Learning Preferences
  getPreferences: async (): Promise<LearningPreferences | null> => {
    const res = await apiClient.get<any>('/students/me/preferences');
    return extractData<LearningPreferences | null>(res);
  },

  savePreferences: async (data: Partial<LearningPreferences>): Promise<LearningPreferences> => {
    const res = await apiClient.put<any>('/students/me/preferences', data);
    return extractData<LearningPreferences>(res);
  },

  // Skills Assessment
  getSkills: async (): Promise<StudentSkillsAssessment | null> => {
    const res = await apiClient.get<any>('/students/me/skills-assessment');
    return extractData<StudentSkillsAssessment | null>(res);
  },

  saveSkills: async (data: Partial<StudentSkillsAssessment>): Promise<StudentSkillsAssessment> => {
    const res = await apiClient.put<any>('/students/me/skills-assessment', data);
    return extractData<StudentSkillsAssessment>(res);
  },

  // Academic History
  getAcademicHistory: async (): Promise<AcademicHistory | null> => {
    const res = await apiClient.get<any>('/students/me/academic-history');
    return extractData<AcademicHistory | null>(res);
  },

  saveAcademicHistory: async (data: Partial<AcademicHistory>): Promise<AcademicHistory> => {
    const res = await apiClient.put<any>('/students/me/academic-history', data);
    return extractData<AcademicHistory>(res);
  },

  // Career Goals
  getCareerGoals: async (): Promise<CareerGoals | null> => {
    const res = await apiClient.get<any>('/students/me/career-goals');
    return extractData<CareerGoals | null>(res);
  },

  saveCareerGoals: async (data: Partial<CareerGoals>): Promise<CareerGoals> => {
    const res = await apiClient.put<any>('/students/me/career-goals', data);
    return extractData<CareerGoals>(res);
  },

  // Portfolio Projects
  getProjects: async (): Promise<PortfolioProject[]> => {
    const res = await apiClient.get<any>('/students/me/portfolio-projects');
    return extractData<PortfolioProject[]>(res);
  },

  addProject: async (project: Partial<PortfolioProject>): Promise<PortfolioProject> => {
    const res = await apiClient.post<any>('/students/me/portfolio-projects', project);
    return extractData<PortfolioProject>(res);
  },

  updateProject: async (id: string, project: Partial<PortfolioProject>): Promise<PortfolioProject> => {
    const res = await apiClient.patch<any>(`/students/me/portfolio-projects/${id}`, project);
    return extractData<PortfolioProject>(res);
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/me/portfolio-projects/${id}`);
  },

  // Study Constraints
  getStudyConstraints: async (): Promise<StudyConstraints | null> => {
    const res = await apiClient.get<any>('/students/me/study-constraints');
    return extractData<StudyConstraints | null>(res);
  },

  saveStudyConstraints: async (data: Partial<StudyConstraints>): Promise<StudyConstraints> => {
    const res = await apiClient.put<any>('/students/me/study-constraints', data);
    return extractData<StudyConstraints>(res);
  },

  // Profile Completion
  getProfileCompletion: async (): Promise<ProfileCompletion> => {
    const res = await apiClient.get<any>('/students/me/profile/completion');
    return extractData<ProfileCompletion>(res);
  },

  // Unified Intelligence Context
  getIntelligenceContext: async (): Promise<StudentIntelligenceContext> => {
    const res = await apiClient.get<any>('/students/me/intelligence-context');
    return extractData<StudentIntelligenceContext>(res);
  },

  // Student Memory
  getMemories: async (): Promise<StudentMemoryEntry[]> => {
    const res = await apiClient.get<any>('/students/me/memory');
    return extractData<StudentMemoryEntry[]>(res);
  },

  deleteMemory: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/me/memory/${id}`);
  },

  clearMemories: async (): Promise<void> => {
    await apiClient.delete('/students/me/memory');
  },

  // Recommendations
  getRecommendations: async (): Promise<StudentRecommendation[]> => {
    const res = await apiClient.get<any>('/students/me/recommendations');
    return extractData<StudentRecommendation[]>(res);
  },

  dismissRecommendation: async (id: string): Promise<void> => {
    await apiClient.patch(`/students/me/recommendations/${id}/dismiss`);
  },

  // Student AI Companion Persona
  getAIPersona: async (): Promise<StudentAIPersona> => {
    const res = await apiClient.get<any>('/students/me/ai-persona');
    return extractData<StudentAIPersona>(res);
  },

  saveAIPersona: async (data: Partial<StudentAIPersona>): Promise<StudentAIPersona> => {
    const res = await apiClient.put<any>('/students/me/ai-persona', data);
    return extractData<StudentAIPersona>(res);
  },

  regenerateAIPersona: async (options?: Partial<StudentAIPersona>): Promise<StudentAIPersona> => {
    const res = await apiClient.post<any>('/students/me/ai-persona/regenerate', options || {});
    return extractData<StudentAIPersona>(res);
  },
};
