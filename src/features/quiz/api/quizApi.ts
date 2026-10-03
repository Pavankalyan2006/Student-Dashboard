import { apiClient } from '../../../api/client';
import {
  Quiz,
  QuizDeliveryQuestion,
  QuizAttempt,
  QuizProgress,
  QuizResult,
  QuizReviewResult,
  TopicPerformance,
  GenerateQuizRequest,
} from '../types/quiz';

export const quizApi = {
  getQuizzes: async (params?: {
    topic?: string;
    course_id?: string;
    difficulty?: string;
    source_type?: string;
    status?: string;
  }): Promise<Quiz[]> => {
    const q = new URLSearchParams();
    if (params?.topic) q.set('topic', params.topic);
    if (params?.course_id) q.set('course_id', params.course_id);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.source_type) q.set('source_type', params.source_type);
    if (params?.status) q.set('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<Quiz[]>(`/quiz${queryStr}`);
  },

  getQuiz: async (quizId: string): Promise<Quiz> => {
    return apiClient.get<Quiz>(`/quiz/${quizId}`);
  },

  createQuiz: async (data: Partial<Quiz> & { questions?: any[] }): Promise<Quiz> => {
    return apiClient.post<Quiz>('/quiz', data);
  },

  generateQuiz: async (
    data: GenerateQuizRequest
  ): Promise<{ quiz: Quiz; questions: QuizDeliveryQuestion[] }> => {
    return apiClient.post<{ quiz: Quiz; questions: QuizDeliveryQuestion[] }>('/quiz/generate', data);
  },

  deleteQuiz: async (quizId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/quiz/${quizId}`);
  },

  startQuiz: async (
    quizId: string
  ): Promise<{
    attempt: QuizAttempt;
    quiz: Quiz;
    questions: QuizDeliveryQuestion[];
    resumed: boolean;
  }> => {
    return apiClient.post(`/quiz/${quizId}/start`);
  },

  getQuizQuestions: async (quizId: string): Promise<QuizDeliveryQuestion[]> => {
    return apiClient.get<QuizDeliveryQuestion[]>(`/quiz/${quizId}/questions`);
  },

  getAttempts: async (quizId?: string): Promise<(QuizAttempt & { quiz_title?: string; quiz_difficulty?: string; source_type?: string })[]> => {
    const queryStr = quizId ? `?quiz_id=${quizId}` : '';
    return apiClient.get(`/quiz/attempts${queryStr}`);
  },

  getAttempt: async (attemptId: string): Promise<QuizAttempt & { quiz?: Quiz }> => {
    return apiClient.get(`/quiz/attempts/${attemptId}`);
  },

  saveAnswers: async (
    attemptId: string,
    answers: Record<string, string | string[]>,
    flaggedQuestions?: string[],
    currentIndex?: number
  ): Promise<{ success: boolean; saved_at: string; time_remaining_seconds?: number }> => {
    return apiClient.patch(`/quiz/attempts/${attemptId}/answers`, {
      answers,
      flagged_questions: flaggedQuestions,
      current_index: currentIndex,
    });
  },

  submitAttempt: async (
    attemptId: string,
    answers?: Record<string, string | string[]>
  ): Promise<QuizResult> => {
    return apiClient.post(`/quiz/attempts/${attemptId}/submit`, { answers });
  },

  abandonAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    return apiClient.post(`/quiz/attempts/${attemptId}/abandon`);
  },

  getAttemptReview: async (attemptId: string): Promise<QuizReviewResult> => {
    return apiClient.get<QuizReviewResult>(`/quiz/attempts/${attemptId}/review`);
  },

  retryQuiz: async (
    quizId: string,
    attemptId: string
  ): Promise<{ quiz: Quiz; questions: QuizDeliveryQuestion[] }> => {
    return apiClient.post(`/quiz/${quizId}/retry`, { attempt_id: attemptId });
  },

  getQuizProgress: async (): Promise<QuizProgress> => {
    return apiClient.get<QuizProgress>('/quiz/progress');
  },

  getProgress: async (): Promise<QuizProgress> => {
    return apiClient.get<QuizProgress>('/quiz/progress');
  },

  getTopicPerformance: async (topicId: string): Promise<TopicPerformance> => {
    return apiClient.get<TopicPerformance>(`/quiz/topics/${topicId}/performance`);
  },

  explainAnswer: async (
    questionId: string,
    studentAnswer: any,
    userQuery?: string
  ): Promise<{
    explanation: string;
    concept_summary: string;
    why_correct: string;
    why_wrong: string;
    similar_example?: string;
  }> => {
    return apiClient.post('/quiz/explain-answer', {
      question_id: questionId,
      student_answer: studentAnswer,
      user_query: userQuery,
    });
  },
};
