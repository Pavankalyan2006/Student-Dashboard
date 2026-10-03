import { apiClient } from '../../../api/client';
import {
  PlacementReadiness,
  PlacementTopic,
  PlacementQuestion,
  InterviewQuestion,
  PlacementCompany,
  CompanyPreparationProfile,
  PlacementRole,
  PlacementPlan,
  PlacementPlanTask,
  MockInterviewSession,
  MockInterviewQuestion,
  MockInterviewAnswer,
  MockInterviewFeedback,
  CreateMockInterviewRequest,
  SubmitInterviewAnswerRequest,
  CreatePlacementPlanRequest,
  StarFormatResponse,
  WeakPlacementTopic,
} from '../types/placement';

export const placementsApi = {
  // Readiness & Progress
  async getReadiness(): Promise<PlacementReadiness> {
    return apiClient.get<PlacementReadiness>('/placements/readiness');
  },

  async getRecommendations(): Promise<{
    weak_areas: WeakPlacementTopic[];
    recommended_quizzes: { id: string; title: string; topic: string }[];
    recommended_dsa: { id: string; title: string; difficulty: string }[];
    recommended_coding: { id: string; title: string }[];
    recommended_courses: { id: string; title: string; lesson_id?: string; lesson_title?: string }[];
  }> {
    return apiClient.get('/placements/recommendations');
  },

  // Topics
  async getTopics(category?: string): Promise<PlacementTopic[]> {
    const query = category ? `?category=${category}` : '';
    return apiClient.get<PlacementTopic[]>(`/placements/topics${query}`);
  },

  async getTopicById(id: string): Promise<PlacementTopic> {
    return apiClient.get<PlacementTopic>(`/placements/topics/${id}`);
  },

  // Questions
  async getQuestions(topicId?: string, category?: string): Promise<PlacementQuestion[]> {
    const params = new URLSearchParams();
    if (topicId) params.append('topic_id', topicId);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<PlacementQuestion[]>(`/placements/questions${query}`);
  },

  async practiceQuestion(questionId: string, answer: string | number): Promise<{ is_correct: boolean; explanation: string; correct_answer: string | number }> {
    return apiClient.post<{ is_correct: boolean; explanation: string; correct_answer: string | number }>(
      `/placements/questions/${questionId}/practice`,
      { answer }
    );
  },

  async getInterviewQuestions(category?: string, topicId?: string): Promise<InterviewQuestion[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (topicId) params.append('topic_id', topicId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<InterviewQuestion[]>(`/placements/interview-questions${query}`);
  },

  // Companies & Roles
  async getCompanies(): Promise<PlacementCompany[]> {
    return apiClient.get<PlacementCompany[]>('/placements/companies');
  },

  async getCompanyById(id: string): Promise<PlacementCompany> {
    return apiClient.get<PlacementCompany>(`/placements/companies/${id}`);
  },

  async getCompanyProfile(companyId: string, roleId?: string): Promise<CompanyPreparationProfile> {
    const query = roleId ? `?role_id=${roleId}` : '';
    return apiClient.get<CompanyPreparationProfile>(`/placements/companies/${companyId}/profile${query}`);
  },

  async getRoles(): Promise<PlacementRole[]> {
    return apiClient.get<PlacementRole[]>('/placements/roles');
  },

  async getRoleById(id: string): Promise<PlacementRole> {
    return apiClient.get<PlacementRole>(`/placements/roles/${id}`);
  },

  // Plans
  async getPlans(): Promise<PlacementPlan[]> {
    return apiClient.get<PlacementPlan[]>('/placements/plans');
  },

  async createPlan(data: CreatePlacementPlanRequest): Promise<{ plan: PlacementPlan; tasks: PlacementPlanTask[] }> {
    return apiClient.post<{ plan: PlacementPlan; tasks: PlacementPlanTask[] }>('/placements/plans', data);
  },

  async getPlanById(id: string): Promise<PlacementPlan> {
    return apiClient.get<PlacementPlan>(`/placements/plans/${id}`);
  },

  async getPlanTasks(id: string): Promise<PlacementPlanTask[]> {
    return apiClient.get<PlacementPlanTask[]>(`/placements/plans/${id}/tasks`);
  },

  async updatePlanTask(planId: string, taskId: string, updates: Partial<PlacementPlanTask>): Promise<PlacementPlanTask> {
    return apiClient.patch<PlacementPlanTask>(`/placements/plans/${planId}/tasks/${taskId}`, updates);
  },

  async updatePlan(planId: string, updates: Partial<PlacementPlan>): Promise<PlacementPlan> {
    return apiClient.patch<PlacementPlan>(`/placements/plans/${planId}`, updates);
  },

  async deletePlan(planId: string): Promise<void> {
    await apiClient.delete(`/placements/plans/${planId}`);
  },

  // Mock Interviews
  async getInterviews(): Promise<MockInterviewSession[]> {
    return apiClient.get<MockInterviewSession[]>('/placements/interviews');
  },

  async createInterview(data: CreateMockInterviewRequest): Promise<{ session: MockInterviewSession; initial_question: MockInterviewQuestion }> {
    return apiClient.post<{ session: MockInterviewSession; initial_question: MockInterviewQuestion }>('/placements/interviews', data);
  },

  async getInterviewSession(sessionId: string): Promise<{ session: MockInterviewSession; questions: MockInterviewQuestion[]; answers: MockInterviewAnswer[] }> {
    return apiClient.get<{ session: MockInterviewSession; questions: MockInterviewQuestion[]; answers: MockInterviewAnswer[] }>(`/placements/interviews/${sessionId}`);
  },

  async startInterview(sessionId: string): Promise<MockInterviewSession> {
    return apiClient.post<MockInterviewSession>(`/placements/interviews/${sessionId}/start`);
  },

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answerText: string,
    durationSeconds?: number
  ): Promise<{ answer: MockInterviewAnswer; next_question: MockInterviewQuestion | null; is_completed: boolean }> {
    return apiClient.post<{ answer: MockInterviewAnswer; next_question: MockInterviewQuestion | null; is_completed: boolean }>(
      `/placements/interviews/${sessionId}/answers`,
      { question_id: questionId, answer_text: answerText, duration_seconds: durationSeconds }
    );
  },

  async completeInterview(sessionId: string): Promise<{ session: MockInterviewSession; feedback: MockInterviewFeedback }> {
    return apiClient.post<{ session: MockInterviewSession; feedback: MockInterviewFeedback }>(`/placements/interviews/${sessionId}/complete`);
  },

  async abandonInterview(sessionId: string): Promise<MockInterviewSession> {
    return apiClient.post<MockInterviewSession>(`/placements/interviews/${sessionId}/abandon`);
  },

  async getInterviewFeedback(sessionId: string): Promise<MockInterviewFeedback> {
    return apiClient.get<MockInterviewFeedback>(`/placements/interviews/${sessionId}/feedback`);
  },

  // AI Placement Coach & STAR Re-formatter
  async askCoach(question: string, context?: { roleId?: string; companyId?: string; topicId?: string }): Promise<{ response: string; recommendations?: string[] }> {
    return apiClient.post<{ response: string; recommendations?: string[] }>('/placements/coach/ask', { question, context });
  },

  async improveWithStar(rawAnswer: string): Promise<StarFormatResponse> {
    return apiClient.post<StarFormatResponse>('/placements/star/improve', { raw_answer: rawAnswer });
  },

  async exportNotes(title: string, content: string, category: string): Promise<any> {
    return apiClient.post<any>('/placements/notes/export', { title, content, category });
  },

  async getInterviewSessions(): Promise<MockInterviewSession[]> {
    return this.getInterviews();
  },

  async getWeakTopics(): Promise<WeakPlacementTopic[]> {
    const readiness = await this.getReadiness();
    return readiness.weak_areas;
  },

  async updateTaskStatus(planId: string, taskId: string, status: 'PENDING' | 'COMPLETED'): Promise<PlacementPlanTask> {
    return this.updatePlanTask(planId, taskId, { status });
  },
};
