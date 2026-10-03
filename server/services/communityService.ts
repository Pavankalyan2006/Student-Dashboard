import { db } from '../db/database';
import {
  CommunityTopic,
  CommunityQuestion,
  CommunityAnswer,
  CommunityDiscussion,
  CommunityResource,
  CommunityProjectShowcase,
} from '../models/communityProfileProgressTypes';
import { NotFoundError } from '../core/exceptions';

export class CommunityService {
  // Topics
  public static async getTopics(): Promise<CommunityTopic[]> {
    return db.getCommunityTopics();
  }

  public static async getTopic(topicId: string): Promise<CommunityTopic> {
    const topic = await db.getCommunityTopicById(topicId);
    if (!topic) {
      throw new NotFoundError(`Topic '${topicId}' not found`);
    }
    return topic;
  }

  public static async followTopic(studentId: string, topicId: string): Promise<any> {
    await db.followTopic(studentId, topicId);
    return {
      id: `tf_${Date.now()}`,
      student_id: studentId,
      topic_id: topicId,
      created_at: new Date().toISOString(),
    };
  }

  public static async unfollowTopic(studentId: string, topicId: string): Promise<boolean> {
    return db.unfollowTopic(studentId, topicId);
  }

  public static async getFollowedTopics(studentId: string): Promise<any[]> {
    const ids = await db.getFollowedTopics(studentId);
    const topics = await db.getCommunityTopics();
    const followed = topics.filter((t) => ids.includes(t.id));
    if (followed.length > 0) return followed;
    return ids.map((id) => ({ id, name: id }));
  }

  // Questions
  public static async getQuestions(filters?: { topicId?: string; tag?: string; search?: string }): Promise<CommunityQuestion[]> {
    return db.getCommunityQuestions(filters);
  }

  public static async getQuestion(questionId: string): Promise<CommunityQuestion> {
    const q = await db.getCommunityQuestionById(questionId);
    if (!q) {
      throw new NotFoundError(`Question '${questionId}' not found`);
    }
    return q;
  }

  public static async getQuestionById(questionId: string): Promise<CommunityQuestion> {
    return this.getQuestion(questionId);
  }

  public static async createQuestion(studentId: string, data: Partial<CommunityQuestion>): Promise<CommunityQuestion> {
    return db.createCommunityQuestion(studentId, data);
  }

  public static async updateQuestion(
    arg1: string,
    arg2: string,
    updates: Partial<CommunityQuestion>
  ): Promise<CommunityQuestion> {
    const questionId = arg1.startsWith('std_') ? arg2 : arg1;
    const studentId = arg1.startsWith('std_') ? arg1 : arg2;
    return db.updateCommunityQuestion(questionId, studentId, updates);
  }

  public static async deleteQuestion(questionId: string, studentId: string): Promise<boolean> {
    return db.deleteCommunityQuestion(questionId, studentId);
  }

  public static async upvoteQuestion(questionId: string): Promise<CommunityQuestion> {
    return db.upvoteCommunityQuestion(questionId);
  }

  // Answers
  public static async getAnswers(questionId: string): Promise<CommunityAnswer[]> {
    return db.getCommunityAnswers(questionId);
  }

  public static async createAnswer(
    studentId: string,
    questionId: string,
    data: Partial<CommunityAnswer>
  ): Promise<CommunityAnswer> {
    return db.createCommunityAnswer(studentId, questionId, data);
  }

  public static async addAnswer(
    studentId: string,
    questionId: string,
    data: Partial<CommunityAnswer>
  ): Promise<CommunityAnswer> {
    return this.createAnswer(studentId, questionId, data);
  }

  public static async updateAnswer(
    answerId: string,
    studentId: string,
    updates: Partial<CommunityAnswer>
  ): Promise<CommunityAnswer> {
    return db.updateCommunityAnswer(answerId, studentId, updates);
  }

  public static async deleteAnswer(answerId: string, studentId: string): Promise<boolean> {
    return db.deleteCommunityAnswer(answerId, studentId);
  }

  public static async acceptAnswer(
    arg1: string,
    arg2: string,
    arg3: string
  ): Promise<any> {
    const studentId = arg1.startsWith('std_') ? arg1 : arg3;
    const questionId = arg1.startsWith('std_') ? arg2 : arg1;
    const answerId = arg1.startsWith('std_') ? arg3 : arg2;
    await db.acceptAnswer(questionId, answerId, studentId);
    return { is_accepted: true, question_id: questionId, answer_id: answerId };
  }

  public static async upvoteAnswer(questionId: string, answerId: string): Promise<CommunityAnswer> {
    return db.upvoteCommunityAnswer(questionId, answerId);
  }

  // Discussions
  public static async getDiscussions(category?: string): Promise<CommunityDiscussion[]> {
    return db.getCommunityDiscussions(category);
  }

  public static async getDiscussion(id: string): Promise<CommunityDiscussion> {
    const d = await db.getCommunityDiscussionById(id);
    if (!d) {
      throw new NotFoundError(`Discussion '${id}' not found`);
    }
    return d;
  }

  public static async createDiscussion(
    studentId: string,
    data: Partial<CommunityDiscussion>
  ): Promise<CommunityDiscussion> {
    return db.createCommunityDiscussion(studentId, data);
  }

  public static async addDiscussionReply(
    studentId: string,
    discussionId: string,
    content: string
  ): Promise<any> {
    return db.addCommunityDiscussionReply(studentId, discussionId, content);
  }

  public static async upvoteDiscussion(discussionId: string): Promise<CommunityDiscussion> {
    return db.upvoteCommunityDiscussion(discussionId);
  }

  // Resources
  public static async getResources(topicId?: string): Promise<CommunityResource[]> {
    return db.getCommunityResources(topicId);
  }

  public static async createResource(
    studentId: string,
    data: Partial<CommunityResource>
  ): Promise<CommunityResource> {
    return db.createCommunityResource(studentId, data);
  }

  public static async upvoteResource(resourceId: string): Promise<CommunityResource> {
    return db.upvoteCommunityResource(resourceId);
  }

  // Projects
  public static async getProjects(): Promise<CommunityProjectShowcase[]> {
    return db.getCommunityProjects();
  }

  public static async getPublicProjectShowcases(): Promise<(CommunityProjectShowcase & { is_public: boolean })[]> {
    const list = await db.getCommunityProjects();
    return list.map((p) => ({ ...p, is_public: true }));
  }

  public static async createProject(
    studentId: string,
    data: Partial<CommunityProjectShowcase>
  ): Promise<CommunityProjectShowcase> {
    return db.createCommunityProject(studentId, data);
  }

  public static async upvoteProject(projectId: string): Promise<CommunityProjectShowcase> {
    return db.upvoteCommunityProject(projectId);
  }

  // AI Question Assistance (Advisory only; student reviews and submits)
  public static async assistQuestion(
    title: string,
    description: string
  ): Promise<{
    clarity_feedback: string;
    suggested_tags: string[];
    potential_duplicates: { id: string; title: string }[];
  }> {
    const existing = await db.getCommunityQuestions();
    const cleanTitle = title.toLowerCase();

    const duplicates = existing
      .filter((q) => {
        const words = cleanTitle.split(' ').filter((w) => w.length > 4);
        return words.some((w) => q.title.toLowerCase().includes(w));
      })
      .slice(0, 3)
      .map((q) => ({ id: q.id, title: q.title }));

    const suggestedTags: string[] = [];
    if (/attention|transformer|neural|model/i.test(title + description)) suggestedTags.push('AI/ML', 'Transformers');
    if (/tree|graph|dp|sort|array|linked/i.test(title + description)) suggestedTags.push('DSA', 'Algorithms');
    if (/process|thread|memory|kernel|lock/i.test(title + description)) suggestedTags.push('OS', 'Concurrency');
    if (/sql|acid|table|transaction|bcnf/i.test(title + description)) suggestedTags.push('DBMS', 'SQL');
    if (suggestedTags.length === 0) suggestedTags.push('General', 'Engineering');

    return {
      clarity_feedback:
        description.length < 50
          ? 'Consider adding specific technical context, expected vs actual behavior, and code snippets or formulas.'
          : 'Question contains good technical detail and clear focus.',
      suggested_tags: suggestedTags,
      potential_duplicates: duplicates,
    };
  }
}
