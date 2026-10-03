import { db } from '../db/database';
import {
  Achievement,
  StudentAchievement,
  ActivityEventType,
} from '../models/communityProfileProgressTypes';

export class AchievementService {
  public static async getAllAchievements(): Promise<Achievement[]> {
    return db.getAchievements();
  }

  public static async getAchievements(_studentId?: string): Promise<Achievement[]> {
    return this.getAllAchievements();
  }

  public static async getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
    return db.getStudentAchievements(studentId);
  }

  public static async evaluateAchievements(
    studentId: string,
    eventType: ActivityEventType
  ): Promise<StudentAchievement[]> {
    return db.evaluateAchievements(studentId, eventType);
  }

  public static async evaluateActivityEvent(
    studentId: string,
    event: { activity_type: ActivityEventType }
  ): Promise<StudentAchievement[]> {
    return this.evaluateAchievements(studentId, event.activity_type);
  }
}
