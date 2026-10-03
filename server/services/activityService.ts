import { db } from '../db/database';
import {
  StudentActivity,
  ActivityEventType,
  LearningStreakData,
} from '../models/communityProfileProgressTypes';

export class ActivityService {
  /**
   * Records a validated learning activity and evaluates deterministic achievements
   */
  public static async recordActivity(
    studentIdOrPayload: string | {
      student_id: string;
      activity_type: ActivityEventType;
      entity_type: string;
      entity_id: string;
      title: string;
      metadata?: Record<string, any>;
    },
    activityType?: ActivityEventType,
    entityType?: string,
    entityId?: string,
    title?: string,
    metadata?: Record<string, any>
  ): Promise<StudentActivity> {
    if (typeof studentIdOrPayload === 'string') {
      return db.recordActivity(studentIdOrPayload, {
        activity_type: activityType!,
        entity_type: entityType!,
        entity_id: entityId!,
        title: title!,
        metadata,
      });
    }

    return db.recordActivity(studentIdOrPayload.student_id, {
      activity_type: studentIdOrPayload.activity_type,
      entity_type: studentIdOrPayload.entity_type,
      entity_id: studentIdOrPayload.entity_id,
      title: studentIdOrPayload.title,
      metadata: studentIdOrPayload.metadata,
    });
  }

  /**
   * Retrieves student chronological learning history
   */
  public static async getActivities(
    studentId: string,
    filters: { type?: string; startDate?: string; endDate?: string } = {}
  ): Promise<StudentActivity[]> {
    return db.getStudentActivities(studentId, filters);
  }

  public static async getActivityHistory(
    studentId: string,
    filters: any = {}
  ): Promise<StudentActivity[]> {
    return this.getActivities(studentId, filters);
  }

  /**
   * Computes deterministic learning streak based on qualifying activities
   */
  public static async getStreak(studentId: string): Promise<LearningStreakData> {
    return db.getLearningStreak(studentId);
  }

  public static async getLearningStreak(studentId: string): Promise<LearningStreakData> {
    return this.getStreak(studentId);
  }
}
