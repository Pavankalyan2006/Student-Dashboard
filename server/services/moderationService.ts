import { db } from '../db/database';
import { CommunityReport } from '../models/communityProfileProgressTypes';
import { NotFoundError } from '../core/exceptions';

export class ModerationService {
  public static async reportContent(
    reporterId: string,
    data: Partial<CommunityReport>
  ): Promise<CommunityReport> {
    return db.createCommunityReport(reporterId, data);
  }

  public static async submitReport(
    reporterId: string,
    data: Partial<CommunityReport>
  ): Promise<CommunityReport> {
    return this.reportContent(reporterId, data);
  }

  public static async getReports(): Promise<CommunityReport[]> {
    return db.getCommunityReports();
  }

  public static async updateReportStatus(
    reportId: string,
    status: 'RESOLVED' | 'DISMISSED'
  ): Promise<CommunityReport> {
    const reports = await db.getCommunityReports();
    const rep = reports.find((r) => r.id === reportId);
    if (!rep) {
      throw new NotFoundError(`Report '${reportId}' not found`);
    }
    rep.status = status;
    return rep;
  }
}
