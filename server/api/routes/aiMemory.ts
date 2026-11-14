import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { AiMemoryService } from '../../services/aiMemoryService';

export const aiMemoryRouter = Router();
aiMemoryRouter.use('/ai-memory', requireAuth);

const me = (req: Request) => req.user!.userId;
const fail = (res: Response, err: any, fallback: string) => {
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
};
const handle = (fn: (req: Request) => unknown, fallback: string) => (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: fn(req) });
  } catch (err) {
    fail(res, err, fallback);
  }
};

// GET /api/v1/ai-memory/me — the student's AI personalisation switches and remembered notes.
aiMemoryRouter.get('/ai-memory/me', handle((req) => AiMemoryService.get(me(req)), 'Your AI memory could not be loaded.'));

// PATCH /api/v1/ai-memory/me  { personalize?: boolean, use_activity?: boolean }
aiMemoryRouter.patch('/ai-memory/me', handle((req) => AiMemoryService.updateSettings(me(req), req.body), 'Your AI settings could not be saved.'));

// POST /api/v1/ai-memory/me/notes  { text }
aiMemoryRouter.post('/ai-memory/me/notes', handle((req) => AiMemoryService.addNote(me(req), req.body?.text), 'The note could not be saved.'));

// DELETE /api/v1/ai-memory/me/notes/:noteId
aiMemoryRouter.delete('/ai-memory/me/notes/:noteId', handle((req) => AiMemoryService.removeNote(me(req), String(req.params.noteId)), 'The note could not be removed.'));

// DELETE /api/v1/ai-memory/me/notes — forget every note.
aiMemoryRouter.delete('/ai-memory/me/notes', handle((req) => AiMemoryService.clearNotes(me(req)), 'Your notes could not be cleared.'));
