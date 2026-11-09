// Git practice lab API. Every command runs in the simulated repository engine; nothing executes on the host.
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { GitLabService } from '../../services/gitLabService';

export const gitLabRouter = Router();

const send = (res: Response, fn: () => any, okStatus = 200) => {
  Promise.resolve()
    .then(fn)
    .then((data) => res.status(okStatus).json({ success: true, data }))
    .catch((err: any) => res.status(err.statusCode || 500).json({ success: false, message: err.message, code: err.code }));
};
const sid = (req: Request) => req.user!.userId;

gitLabRouter.get('/lessons', requireAuth, (req, res) => send(res, () => GitLabService.listLessons(sid(req))));
gitLabRouter.get('/lessons/:id', requireAuth, (req, res) => send(res, () => GitLabService.getLesson(sid(req), req.params.id)));
gitLabRouter.post('/lessons/:id/complete', requireAuth, (req, res) => send(res, () => GitLabService.completeLesson(sid(req), req.params.id)));
gitLabRouter.get('/exercises', requireAuth, (req, res) => send(res, () => GitLabService.listExercises(sid(req))));
gitLabRouter.get('/exercises/:id', requireAuth, (req, res) => send(res, () => GitLabService.getExercise(sid(req), req.params.id)));
gitLabRouter.post('/exercises/:id/reset', requireAuth, (req, res) => send(res, () => GitLabService.startExercise(sid(req), req.params.id)));
gitLabRouter.post('/exercises/:id/commands', requireAuth, (req, res) => send(res, () => GitLabService.runExerciseCommand(sid(req), req.params.id, req.body?.command)));
gitLabRouter.post('/exercises/:id/hint', requireAuth, (req, res) => send(res, () => GitLabService.requestHint(sid(req), req.params.id)));
gitLabRouter.get('/exercises/:id/solution', requireAuth, (req, res) => send(res, () => GitLabService.getSolution(sid(req), req.params.id)));
gitLabRouter.get('/sandbox', requireAuth, (req, res) => send(res, () => GitLabService.getSandbox(sid(req))));
gitLabRouter.post('/sandbox/commands', requireAuth, (req, res) => send(res, () => GitLabService.runSandboxCommand(sid(req), req.body?.command)));
gitLabRouter.post('/sandbox/reset', requireAuth, (req, res) => send(res, () => GitLabService.resetSandbox(sid(req))));
gitLabRouter.get('/progress', requireAuth, (req, res) => send(res, () => GitLabService.getProgress(sid(req))));
