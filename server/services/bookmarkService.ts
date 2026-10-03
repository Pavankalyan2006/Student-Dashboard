import { db } from '../db/database';
import { UnifiedBookmark } from '../models/communityProfileProgressTypes';

export class BookmarkService {
  public static async getBookmarks(studentId: string, category?: string): Promise<UnifiedBookmark[]> {
    return db.getBookmarks(studentId, category);
  }

  public static async addBookmark(
    studentId: string,
    data: Partial<UnifiedBookmark>
  ): Promise<UnifiedBookmark> {
    return db.addBookmark(studentId, data);
  }

  public static async createBookmark(
    studentId: string,
    data: Partial<UnifiedBookmark>
  ): Promise<UnifiedBookmark> {
    return this.addBookmark(studentId, data);
  }

  public static async searchBookmarks(
    studentId: string,
    query: string
  ): Promise<UnifiedBookmark[]> {
    const list = await this.getBookmarks(studentId);
    const q = query.toLowerCase();
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.personal_note && b.personal_note.toLowerCase().includes(q)) ||
        (b.personal_label && b.personal_label.toLowerCase().includes(q))
    );
  }

  public static async removeBookmark(arg1: string, arg2: string): Promise<boolean> {
    const bookmarkId = arg1.startsWith('std_') ? arg2 : arg1;
    const studentId = arg1.startsWith('std_') ? arg1 : arg2;
    return db.removeBookmark(bookmarkId, studentId);
  }

  public static async deleteBookmark(arg1: string, arg2: string): Promise<boolean> {
    return this.removeBookmark(arg1, arg2);
  }
}
