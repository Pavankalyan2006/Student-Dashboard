import { db } from '../db/database';
import {
  PlacementTopic,
  PlacementQuestion,
  InterviewQuestion,
  PlacementCategory,
} from '../models/placementTypes';
import { NotFoundError } from '../core/exceptions';
import { logger } from '../core/logging';

export class PlacementTopicService {
  public static async getTopics(category?: PlacementCategory): Promise<PlacementTopic[]> {
    return db.getPlacementTopics(category);
  }

  public static async getTopicById(id: string): Promise<PlacementTopic> {
    const topic = await db.getPlacementTopicById(id);
    if (!topic) {
      throw new NotFoundError(`Placement topic '${id}' not found`);
    }
    return topic;
  }

  public static async getTopicBySlug(slug: string): Promise<PlacementTopic> {
    const topic = await db.getPlacementTopicBySlug(slug);
    if (!topic) {
      throw new NotFoundError(`Placement topic with slug '${slug}' not found`);
    }
    return topic;
  }

  public static async getQuestions(topicId?: string, category?: PlacementCategory): Promise<PlacementQuestion[]> {
    return db.getPlacementQuestions(topicId, category);
  }

  public static async getQuestionById(id: string): Promise<PlacementQuestion> {
    const question = await db.getPlacementQuestionById(id);
    if (!question) {
      throw new NotFoundError(`Placement question '${id}' not found`);
    }
    return question;
  }

  public static async getInterviewQuestions(
    category?: PlacementCategory,
    topicId?: string
  ): Promise<InterviewQuestion[]> {
    return db.getInterviewQuestions(category, topicId);
  }

  public static async evaluateQuestionAnswer(
    studentId: string,
    questionId: string,
    submittedAnswer: string | number
  ): Promise<{ is_correct: boolean; explanation: string; correct_answer: string | number }> {
    const question = await this.getQuestionById(questionId);
    const isCorrect =
      String(submittedAnswer).trim().toLowerCase() ===
      String(question.correct_answer).trim().toLowerCase();

    // Persist practice attempt for accurate progress tracking
    await db.recordPlacementPractice({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      student_id: studentId,
      question_id: question.id,
      topic_id: question.topic_id,
      category: question.category,
      submitted_answer: submittedAnswer,
      is_correct: isCorrect,
      explanation: question.explanation,
      correct_answer: question.correct_answer,
      created_at: new Date().toISOString(),
    });

    logger.info(`Student ${studentId} practiced placement question ${questionId}: correct=${isCorrect}`);

    return {
      is_correct: isCorrect,
      explanation: question.explanation,
      correct_answer: question.correct_answer,
    };
  }

  public static async getTopicDetails(id: string): Promise<{
    topic: PlacementTopic;
    concepts: any[];
    interview_questions: InterviewQuestion[];
    practice_questions: PlacementQuestion[];
  }> {
    const topic = await this.getTopicById(id);
    const interview_questions = await this.getInterviewQuestions(topic.category, topic.id);
    const practice_questions = await this.getQuestions(topic.id);
    return {
      topic,
      concepts: topic.concepts || [],
      interview_questions,
      practice_questions,
    };
  }

  public static async evaluatePracticeAnswer(
    questionId: string,
    submittedAnswer: string | number,
    studentId: string = 'std_demo'
  ) {
    return this.evaluateQuestionAnswer(studentId, questionId, submittedAnswer);
  }
}
