import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { GlobalSearchService } from '../../services/globalSearchService';

export const searchRouter = Router();

// GET /api/v1/search?q=&type=&page=&limit=
searchRouter.get('/search', requireAuth, async (req, res, next) => {
  try {
    const q = (req.query.q as string) || '';
    const type = String(req.query.type || 'all');
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    // Phase 7: live search across the student's own records and the shared catalogue.
    const result = await GlobalSearchService.search(req.user!.userId, q, type, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
