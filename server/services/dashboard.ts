import { db } from '../db/database';
import { DashboardData, TodayPlanTask } from '../models/types';
import { NotFoundError, AuthenticationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class DashboardService {
  /**
   * Retrieves the comprehensive dashboard for the authenticated student.
   * Student identity is strictly isolated and validated server-side.
   */
  public static async getStudentDashboard(userId: string): Promise<DashboardData> {
    if (!userId) {
      throw new AuthenticationError('Valid student identity required');
    }

    const student = await db.getStudentById(userId);
    if (!student) {
      throw new NotFoundError('Student account not found');
    }

    logger.info(`Fetching dashboard command center for student ${userId}`, {
      userId,
      context: { branch: student.branch, semester: student.semester },
    });

    return db.getStudentDashboardData(userId);
  }

  /**
   * Toggles completion status of a daily learning plan task.
   */
  public static async toggleTodayTask(userId: string, taskId: string): Promise<TodayPlanTask> {
    return db.toggleTodayTask(userId, taskId);
  }
}
