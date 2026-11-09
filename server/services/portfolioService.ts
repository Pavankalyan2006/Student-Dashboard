import { db } from '../db/database';
import { PortfolioItem } from '../models/communityProfileProgressTypes';

export class PortfolioService {
  public static async getStudentPortfolio(studentId: string): Promise<any> {
    const student = await db.getStudentById(studentId);
    const skills = await db.getStudentSkills(studentId);
    const projects = await db.getProjects(studentId);
    const research = await db.getResearchProjects(studentId);
    const certificates = await db.getCertificates(studentId);
    const achievements = await db.getStudentAchievements(studentId);
    const portfolioItems = await db.getPortfolioItems(studentId);

    return {
      student_id: studentId,
      student_name: student?.name || 'Student',
      skills: skills || [],
      projects: projects || [],
      research: research || [],
      certifications: certificates || [],
      achievements: achievements || [],
      github: await (async () => {
        const conn = await db.getGitHubConnection(studentId);
        const connected = !!(conn && conn.is_connected);
        return { connected, username: connected ? conn!.username : null, repos_count: connected ? (await db.getGitHubRepositories(studentId)).length : 0 };
      })(),
      resume: await (async () => {
        const resumes = await db.getResumes(studentId);
        const last = resumes.map((r: any) => r.updated_at).filter(Boolean).sort().at(-1) || null;
        return { versions_count: resumes.length, last_updated: last };
      })(),
      portfolio_items: portfolioItems || [],
    };
  }

  public static async addPortfolioItem(
    studentId: string,
    data: {
      title: string;
      category: string;
      entity_id?: string;
      description?: string;
      url?: string;
      visibility?: 'PRIVATE' | 'PLATFORM_ONLY' | 'COMMUNITY' | 'PUBLIC';
    }
  ): Promise<PortfolioItem> {
    return db.addPortfolioItem(studentId, data);
  }

  public static async updateItemVisibility(
    studentId: string,
    itemId: string,
    visibility: 'PRIVATE' | 'PLATFORM_ONLY' | 'COMMUNITY' | 'PUBLIC'
  ): Promise<PortfolioItem> {
    return db.updatePortfolioItem(itemId, studentId, { visibility });
  }

  public static async getPortfolioItems(
    studentId: string,
    requesterId?: string
  ): Promise<PortfolioItem[]> {
    const items = await db.getPortfolioItems(studentId);
    if (!requesterId || requesterId === studentId) {
      return items;
    }

    // Filter by visibility for external viewers
    return items.filter((i) => i.visibility === 'COMMUNITY' || i.visibility === 'PUBLIC');
  }

  public static async updatePortfolioItem(
    itemId: string,
    studentId: string,
    updates: Partial<PortfolioItem>
  ): Promise<PortfolioItem> {
    return db.updatePortfolioItem(itemId, studentId, updates);
  }
}
