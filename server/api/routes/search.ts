import { Router } from 'express';
import { db } from '../../db/database';
import { SearchCategory } from '../../models/types';
import { requireAuth } from '../../middleware/auth';

export const searchRouter = Router();

// GET /api/v1/search?q=&type=&page=&limit=
searchRouter.get('/search', requireAuth, async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const type = (req.query.type as SearchCategory | 'all') || 'all';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    const result = await db.search(q, type, page, limit, req.user!.userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
