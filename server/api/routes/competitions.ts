// Hackathon and Competition Hub. Every route needs sign-in, and works only on the signed-in student's own events,
// participation records and the teams they belong to (req.user from the verified session).
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { CompetitionHubService as Hub } from '../../services/competitionHubService';

export const competitionsRouter = Router();
competitionsRouter.use('/competitions', requireAuth);

const me = (req: Request) => req.user!.userId;
const p = (req: Request, k: string) => String(req.params[k]);
const handle = (fn: (req: Request) => unknown, fallback: string, created = false) => async (req: Request, res: Response) => {
  try {
    res.status(created ? 201 : 200).json({ success: true, data: await fn(req) });
  } catch (err: any) {
    const status = err?.statusCode || err?.status || 500;
    res.status(status).json({ success: false, code: err?.code, message: status < 500 || status === 503 ? err.message : fallback });
  }
};

// Discovery: verified contests (Codeforces API) and the student's own events, with upcoming dates.
competitionsRouter.get('/competitions/feed', handle((req) => Hub.feed(me(req)), 'Events could not be loaded.'));

// Events the student adds. A source link is required.
competitionsRouter.post('/competitions/events', handle((req) => Hub.addEvent(me(req), req.body), 'The event could not be saved.', true));
competitionsRouter.patch('/competitions/events/:id', handle((req) => Hub.updateEvent(me(req), p(req, 'id'), req.body), 'The event could not be updated.'));
competitionsRouter.post('/competitions/events/:id/recheck', handle((req) => Hub.recheckEvent(me(req), p(req, 'id')), 'The event could not be updated.'));
competitionsRouter.delete('/competitions/events/:id', handle((req) => Hub.removeEvent(me(req), p(req, 'id')), 'The event could not be removed.'));

// Participation history. :ref is "cf:<contest id>" or "ev:<event id>".
competitionsRouter.get('/competitions/participation', handle((req) => Hub.participation(me(req)), 'Your participation could not be loaded.'));
competitionsRouter.put('/competitions/participation/:ref', handle((req) => Hub.track(me(req), p(req, 'ref'), req.body), 'The event could not be tracked.'));
competitionsRouter.put('/competitions/participation/:ref/submission', handle((req) => Hub.submit(me(req), p(req, 'ref'), req.body), 'The submission could not be saved.'));
competitionsRouter.put('/competitions/participation/:ref/result', handle((req) => Hub.recordResult(me(req), p(req, 'ref'), req.body?.clear ? null : req.body), 'The result could not be saved.'));
competitionsRouter.delete('/competitions/participation/:ref', handle((req) => Hub.untrack(me(req), p(req, 'ref')), 'The event could not be removed.'));

// Teams.
competitionsRouter.get('/competitions/teams', handle((req) => Hub.teams(me(req)), 'Your teams could not be loaded.'));
competitionsRouter.post('/competitions/teams', handle((req) => Hub.createTeam(me(req), req.body), 'The team could not be created.', true));
competitionsRouter.post('/competitions/teams/join', handle((req) => Hub.joinTeam(me(req), req.body), 'The team could not be joined.'));
competitionsRouter.get('/competitions/teams/:id', handle((req) => Hub.team(me(req), p(req, 'id')), 'The team could not be loaded.'));
competitionsRouter.patch('/competitions/teams/:id', handle((req) => Hub.updateTeam(me(req), p(req, 'id'), req.body), 'The team could not be updated.'));
competitionsRouter.post('/competitions/teams/:id/code', handle((req) => Hub.rotateCode(me(req), p(req, 'id')), 'The join code could not be changed.'));
competitionsRouter.post('/competitions/teams/:id/leave', handle((req) => Hub.leaveTeam(me(req), p(req, 'id')), 'You could not leave the team.'));
competitionsRouter.delete('/competitions/teams/:id/members/:member', handle((req) => Hub.removeMember(me(req), p(req, 'id'), p(req, 'member')), 'The member could not be removed.'));
competitionsRouter.post('/competitions/teams/:id/tasks', handle((req) => Hub.addTask(me(req), p(req, 'id'), req.body), 'The task could not be added.', true));
competitionsRouter.patch('/competitions/teams/:id/tasks/:taskId', handle((req) => Hub.updateTask(me(req), p(req, 'id'), p(req, 'taskId'), req.body), 'The task could not be updated.'));
competitionsRouter.delete('/competitions/teams/:id/tasks/:taskId', handle((req) => Hub.removeTask(me(req), p(req, 'id'), p(req, 'taskId')), 'The task could not be removed.'));
