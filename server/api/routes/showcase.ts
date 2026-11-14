import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ShowcaseService } from '../../services/showcaseService';

export const showcaseRouter = Router();

const fail = (res: Response, err: any, fallback: string) => {
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
};

// GET /api/v1/showcase/me — sharing settings and the full preview of the student's own showcase.
showcaseRouter.get('/showcase/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.user!.userId;
    res.json({ success: true, data: { settings: ShowcaseService.get(id), view: await ShowcaseService.build(id, false) } });
  } catch (err) {
    fail(res, err, 'Your showcase could not be loaded.');
  }
});

// PUT /api/v1/showcase/me  { enabled?, show_name?, headline?, sections? }
showcaseRouter.put('/showcase/me', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: ShowcaseService.update(req.user!.userId, req.body) });
  } catch (err) {
    fail(res, err, 'Your showcase settings could not be saved.');
  }
});

// POST /api/v1/showcase/me/new-link — replaces the share link; the old one stops working.
showcaseRouter.post('/showcase/me/new-link', requireAuth, (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: ShowcaseService.rotate(req.user!.userId) });
  } catch (err) {
    fail(res, err, 'A new link could not be made.');
  }
});

// GET /api/v1/showcase/public/:slug — no sign-in; only what the owner chose to share, only while sharing is on.
showcaseRouter.get('/showcase/public/:slug', async (req: Request, res: Response) => {
  try {
    const owner = ShowcaseService.ownerOf(String(req.params.slug));
    if (!owner) return res.status(404).json({ success: false, message: 'This showcase is not shared.' });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.json({ success: true, data: await ShowcaseService.build(owner, true) });
  } catch (err) {
    fail(res, err, 'This showcase could not be loaded.');
  }
});
