import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { BookmarkService } from '../../services/bookmarkService';

export const bookmarksRouter = Router();

// GET /api/v1/bookmarks
bookmarksRouter.get('/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const category = req.query.category as string;
    const bookmarks = await BookmarkService.getBookmarks(studentId, category);
    res.json({ success: true, data: bookmarks });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/bookmarks
bookmarksRouter.post('/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const bookmark = await BookmarkService.addBookmark(studentId, req.body);
    res.status(201).json({ success: true, data: bookmark });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/bookmarks/:id
bookmarksRouter.delete('/bookmarks/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await BookmarkService.removeBookmark(req.params.id, studentId);
    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
