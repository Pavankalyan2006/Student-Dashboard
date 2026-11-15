// Code Review Intelligence. Every route needs sign-in and works only on the signed-in student's own reviews,
// saved code and connected repositories (req.user from the verified session).
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { CodeReviewService } from '../../services/codeReviewService';

export const codeReviewRouter = Router();
codeReviewRouter.use('/code-review', requireAuth);

const me = (req: Request) => req.user!.userId;
const handle = (fn: (req: Request) => unknown, fallback: string) => async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 500;
    res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
  }
};

// GET /api/v1/code-review/me — review history (summaries).
codeReviewRouter.get('/code-review/me', handle((req) => CodeReviewService.list(me(req)), 'Your reviews could not be loaded.'));

// POST /api/v1/code-review/me  { title?, files?: [{name, content, language?}] | saved_code_id | github: {repo_id, path}, ai? }
codeReviewRouter.post('/code-review/me', handle((req) => CodeReviewService.create(me(req), req.body), 'The review could not be run.'));

// GET /api/v1/code-review/me/:reviewId
codeReviewRouter.get('/code-review/me/:reviewId', handle((req) => CodeReviewService.get(me(req), String(req.params.reviewId)), 'That review could not be loaded.'));

// PATCH /api/v1/code-review/me/:reviewId/findings/:findingId  { status: accepted|rejected|modified|open, note? }
codeReviewRouter.patch(
  '/code-review/me/:reviewId/findings/:findingId',
  handle((req) => CodeReviewService.decide(me(req), String(req.params.reviewId), String(req.params.findingId), req.body), 'That finding could not be updated.')
);

// DELETE /api/v1/code-review/me/:reviewId
codeReviewRouter.delete('/code-review/me/:reviewId', handle((req) => CodeReviewService.remove(me(req), String(req.params.reviewId)), 'That review could not be removed.'));
