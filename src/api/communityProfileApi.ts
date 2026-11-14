import { apiClient } from './client';
import {
  StudentProfileData,
  StudentPrivacySetting,
  StudentPreference,
  NotificationPreference,
  StudentActivity,
  LearningStreakData,
  LearningGoal,
  UnifiedBookmark,
  Achievement,
  StudentAchievement,
  Certificate,
  CertificateVerification,
  CommunityTopic,
  CommunityQuestion,
  CommunityAnswer,
  CommunityDiscussion,
  CommunityResource,
  CommunityProjectShowcase,
  CommunityReport,
  PortfolioItem,
  UnifiedPortfolioSummary,
  UnifiedLearningProgress,
  SubsystemProgressOverview,
  LearningInsight,
  ResourceRecommendation,
} from '../../server/models/communityProfileProgressTypes';

export const communityProfileApi = {
  // ----------------- Profile -----------------
  async getProfile(): Promise<StudentProfileData> {
    return apiClient.request<StudentProfileData>('/profile');
  },

  async updateProfile(updates: Partial<StudentProfileData>): Promise<StudentProfileData> {
    return apiClient.request<StudentProfileData>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getActivity(filters?: { type?: string; startDate?: string; endDate?: string }): Promise<StudentActivity[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    const qs = params.toString();
    // The endpoint returns { activities, streak }; older builds returned a bare array.
    const res = await apiClient.request<StudentActivity[] | { activities?: StudentActivity[] }>(
      `/profile/activity${qs ? `?${qs}` : ''}`
    );
    return Array.isArray(res) ? res : res?.activities || [];
  },

  async getActivityStreakDays(): Promise<number> {
    const res = await apiClient.request<{ streak?: { current_streak_days?: number; current_streak?: number } }>('/profile/activity');
    return Number(res?.streak?.current_streak_days ?? res?.streak?.current_streak ?? 0) || 0;
  },

  async getStreak(): Promise<LearningStreakData> {
    const progress = await this.getProgress();
    return progress.streak;
  },

  async getAchievements(): Promise<(Achievement & { is_earned: boolean; earned_at?: string })[]> {
    // The API returns { all, earned }; the page needs one list with each badge marked earned or not.
    const data = await apiClient.request<any>('/profile/achievements');
    if (Array.isArray(data)) return data;
    const earned = new Map<string, any>((data?.earned || []).map((e: any) => [e.achievement_id, e]));
    return (data?.all || []).map((a: any) => ({
      ...a,
      is_earned: earned.has(a.id),
      earned_at: earned.get(a.id)?.earned_at,
    }));
  },

  async getCertificates(): Promise<Certificate[]> {
    return apiClient.request<Certificate[]>('/profile/certificates');
  },

  async verifyCertificate(certificateId: string): Promise<CertificateVerification> {
    return apiClient.request<CertificateVerification>(`/verify/certificate/${certificateId}`);
  },

  async getBookmarks(category?: string, search?: string): Promise<UnifiedBookmark[]> {
    const params = new URLSearchParams();
    if (category && category !== 'ALL') params.set('category', category);
    if (search) params.set('search', search);
    const qs = params.toString();
    return apiClient.request<UnifiedBookmark[]>(`/profile/bookmarks${qs ? `?${qs}` : ''}`);
  },

  async addBookmark(data: Partial<UnifiedBookmark>): Promise<UnifiedBookmark> {
    return apiClient.request<UnifiedBookmark>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteBookmark(bookmarkId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
  },

  async getPrivacy(): Promise<StudentPrivacySetting> {
    return apiClient.request<StudentPrivacySetting>('/profile/privacy');
  },

  async updatePrivacy(updates: Partial<StudentPrivacySetting>): Promise<StudentPrivacySetting> {
    return apiClient.request<StudentPrivacySetting>('/profile/privacy', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getPreferences(): Promise<StudentPreference> {
    return apiClient.request<StudentPreference>('/profile/preferences');
  },

  async updatePreferences(updates: Partial<StudentPreference>): Promise<StudentPreference> {
    return apiClient.request<StudentPreference>('/profile/preferences', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // ----------------- Progress -----------------
  async getProgress(filters?: { timeRange?: string; subject?: string }): Promise<UnifiedLearningProgress> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.set('timeRange', filters.timeRange);
    if (filters?.subject) params.set('subject', filters.subject);
    const qs = params.toString();
    return apiClient.request<UnifiedLearningProgress>(`/progress${qs ? `?${qs}` : ''}`);
  },

  async exportProgress(): Promise<any> {
    return apiClient.request<any>('/progress/export');
  },

  async getSubsystemProgress(subsystem: string): Promise<SubsystemProgressOverview> {
    return apiClient.request<SubsystemProgressOverview>(`/progress/${subsystem}`);
  },

  // ----------------- Goals -----------------
  async getGoals(
    filters?: string | { status?: string; category?: string; priority?: string; search?: string }
  ): Promise<LearningGoal[]> {
    const params = new URLSearchParams();
    if (typeof filters === 'string') {
      if (filters && filters !== 'ALL') params.set('status', filters);
    } else if (filters) {
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
      if (filters.priority && filters.priority !== 'ALL') params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
    }
    const qs = params.toString();
    return apiClient.request<LearningGoal[]>(`/goals${qs ? `?${qs}` : ''}`);
  },

  async getGoal(goalId: string): Promise<LearningGoal> {
    return apiClient.request<LearningGoal>(`/goals/${goalId}`);
  },

  async createGoal(data: Partial<LearningGoal>): Promise<LearningGoal> {
    return apiClient.request<LearningGoal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGoal(goalId: string, updates: Partial<LearningGoal>): Promise<LearningGoal> {
    return apiClient.request<LearningGoal>(`/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteGoal(goalId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  },

  async toggleMilestone(goalId: string, milestoneId: string): Promise<LearningGoal> {
    return apiClient.request<LearningGoal>(`/goals/${goalId}/milestones/${milestoneId}/toggle`, {
      method: 'POST',
    });
  },

  async getGoalRecommendations(goalId: string): Promise<ResourceRecommendation[]> {
    return apiClient.request<ResourceRecommendation[]>(`/goals/${goalId}/recommendations`);
  },

  // ----------------- Community -----------------
  async getTopics(): Promise<CommunityTopic[]> {
    return apiClient.request<CommunityTopic[]>('/community/topics');
  },

  async getTopic(topicId: string): Promise<CommunityTopic> {
    return apiClient.request<CommunityTopic>(`/community/topics/${topicId}`);
  },

  async followTopic(topicId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/community/topics/${topicId}/follow`, {
      method: 'POST',
    });
  },

  async unfollowTopic(topicId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/community/topics/${topicId}/follow`, {
      method: 'DELETE',
    });
  },

  async getFollowedTopics(): Promise<string[]> {
    return apiClient.request<string[]>('/community/followed-topics');
  },

  async getQuestions(filters?: { topicId?: string; tag?: string; search?: string }): Promise<CommunityQuestion[]> {
    const params = new URLSearchParams();
    if (filters?.topicId) params.set('topicId', filters.topicId);
    if (filters?.tag) params.set('tag', filters.tag);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return apiClient.request<CommunityQuestion[]>(`/community/questions${qs ? `?${qs}` : ''}`);
  },

  async getQuestion(questionId: string): Promise<CommunityQuestion> {
    return apiClient.request<CommunityQuestion>(`/community/questions/${questionId}`);
  },

  async createQuestion(data: Partial<CommunityQuestion>): Promise<CommunityQuestion> {
    return apiClient.request<CommunityQuestion>('/community/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateQuestion(questionId: string, updates: Partial<CommunityQuestion>): Promise<CommunityQuestion> {
    return apiClient.request<CommunityQuestion>(`/community/questions/${questionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteQuestion(questionId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/community/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  async getAnswers(questionId: string): Promise<CommunityAnswer[]> {
    return apiClient.request<CommunityAnswer[]>(`/community/questions/${questionId}/answers`);
  },

  async createAnswer(questionId: string, data: Partial<CommunityAnswer>): Promise<CommunityAnswer> {
    return apiClient.request<CommunityAnswer>(`/community/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAnswer(answerId: string, updates: Partial<CommunityAnswer>): Promise<CommunityAnswer> {
    return apiClient.request<CommunityAnswer>(`/community/answers/${answerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteAnswer(answerId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/community/answers/${answerId}`, {
      method: 'DELETE',
    });
  },

  async acceptAnswer(questionId: string, answerId: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/community/questions/${questionId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ answer_id: answerId }),
    });
  },

  async getDiscussions(category?: string): Promise<CommunityDiscussion[]> {
    const qs = category && category !== 'ALL' ? `?category=${category}` : '';
    return apiClient.request<CommunityDiscussion[]>(`/community/discussions${qs}`);
  },

  async getDiscussion(discussionId: string): Promise<CommunityDiscussion> {
    return apiClient.request<CommunityDiscussion>(`/community/discussions/${discussionId}`);
  },

  async createDiscussion(data: Partial<CommunityDiscussion>): Promise<CommunityDiscussion> {
    return apiClient.request<CommunityDiscussion>('/community/discussions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addDiscussionReply(discussionId: string, content: string): Promise<any> {
    return apiClient.request<any>(`/community/discussions/${discussionId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async getResources(topicId?: string): Promise<CommunityResource[]> {
    const qs = topicId ? `?topic_id=${topicId}` : '';
    return apiClient.request<CommunityResource[]>(`/community/resources${qs}`);
  },

  async createResource(data: Partial<CommunityResource>): Promise<CommunityResource> {
    return apiClient.request<CommunityResource>('/community/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProjects(): Promise<CommunityProjectShowcase[]> {
    return apiClient.request<CommunityProjectShowcase[]>('/community/projects');
  },

  async createProjectShowcase(data: Partial<CommunityProjectShowcase>): Promise<CommunityProjectShowcase> {
    return apiClient.request<CommunityProjectShowcase>('/community/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createReport(data: Partial<CommunityReport>): Promise<CommunityReport> {
    return apiClient.request<CommunityReport>('/community/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async upvoteQuestion(questionId: string): Promise<CommunityQuestion> {
    return apiClient.request<CommunityQuestion>(`/community/questions/${questionId}/upvote`, {
      method: 'POST',
    });
  },

  async upvoteAnswer(questionId: string, answerId: string): Promise<CommunityAnswer> {
    return apiClient.request<CommunityAnswer>(`/community/questions/${questionId}/answers/${answerId}/upvote`, {
      method: 'POST',
    });
  },

  async upvoteDiscussion(discussionId: string): Promise<CommunityDiscussion> {
    return apiClient.request<CommunityDiscussion>(`/community/discussions/${discussionId}/upvote`, {
      method: 'POST',
    });
  },

  async upvoteResource(resourceId: string): Promise<CommunityResource> {
    return apiClient.request<CommunityResource>(`/community/resources/${resourceId}/upvote`, {
      method: 'POST',
    });
  },

  async upvoteProject(projectId: string): Promise<CommunityProjectShowcase> {
    return apiClient.request<CommunityProjectShowcase>(`/community/projects/${projectId}/upvote`, {
      method: 'POST',
    });
  },

  async getAiAssistance(data: { title: string; description: string; topic_id?: string }): Promise<{
    clarity_feedback: string;
    suggested_tags: string[];
    suggested_resources: string[];
    summary: string;
  }> {
    return apiClient.request('/community/ai-assist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ----------------- Notifications -----------------
  async getNotifications(filters?: { unreadOnly?: boolean; category?: string }): Promise<{ items: any[]; unreadCount: number; total: number }> {
    const params = new URLSearchParams();
    if (filters?.unreadOnly) params.set('unreadOnly', 'true');
    if (filters?.category && filters.category !== 'ALL') params.set('category', filters.category);
    const qs = params.toString();
    return apiClient.request(`/notifications${qs ? `?${qs}` : ''}`);
  },

  async markNotificationRead(id: string): Promise<any> {
    return apiClient.request(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<any> {
    return apiClient.request('/notifications/read-all', {
      method: 'POST',
    });
  },

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return apiClient.request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  async generateReminders(): Promise<{ generated_count: number; items: any[] }> {
    return apiClient.request<{ generated_count: number; items: any[] }>('/notifications/generate-reminders', {
      method: 'POST',
    });
  },

  async getNotificationPreferences(): Promise<NotificationPreference> {
    return apiClient.request<NotificationPreference>('/notifications/preferences');
  },

  async updateNotificationPreferences(updates: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return apiClient.request<NotificationPreference>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // ----------------- Security & Export -----------------
  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  async exportStudentData(): Promise<any> {
    return apiClient.request<any>('/profile/export');
  },

  // ----------------- Portfolio -----------------
  async getPortfolio(): Promise<UnifiedPortfolioSummary> {
    return apiClient.request<UnifiedPortfolioSummary>('/portfolio');
  },

  async updatePortfolioItem(itemId: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem> {
    return apiClient.request<PortfolioItem>(`/portfolio/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // ----------------- Insights & Recommendations -----------------
  async getInsights(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<{
    period: string;
    summary: string;
    metrics: Record<string, number>;
    insights: LearningInsight[];
  }> {
    return apiClient.request(`/learning/insights?period=${period}`);
  },

  async getRecommendations(): Promise<ResourceRecommendation[]> {
    return apiClient.request<ResourceRecommendation[]>('/learning/recommendations');
  },
};
