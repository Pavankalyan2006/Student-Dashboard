// Personal Intelligence: Knowledge Graph, Daily Briefing, My AI Brain and the AI Agent Control Center.
// Every route needs sign-in and works only on the signed-in student's own records (req.user from the
// verified session; no route takes a student id from the client).
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { db } from '../../db/database';
import { knowledgeMapFor } from '../../services/knowledgeMapService';
import { BriefingService } from '../../services/briefingService';
import { todayFor } from '../../services/deadlineService';
import { AiBrainService } from '../../services/aiBrainService';
import { AgentActivityService } from '../../services/agentActivityService';
import { studentAgentById, studentAgentView, CORE_AGENTS } from '../../ai/orchestration/studentAgents';
import { ToolRegistry } from '../../ai/tools';

export const personalIntelligenceRouter = Router();
for (const p of ['/knowledge-graph', '/briefing', '/ai-brain', '/agents']) personalIntelligenceRouter.use(p, requireAuth);

const me = (req: Request) => req.user!.userId;
const fail = (res: Response, err: any, fallback: string) => {
  const status = err?.statusCode || err?.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? err.message : fallback });
};
const handle = (fn: (req: Request) => unknown, fallback: string) => async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (err) {
    fail(res, err, fallback);
  }
};
/** The student's "today", from their UTC offset in minutes (?tz= or body.tz). */
const today = (req: Request) => {
  const tz = Number(req.query.tz ?? req.body?.tz);
  return todayFor(Date.now(), Number.isFinite(tz) && Math.abs(tz) <= 14 * 60 ? tz : 0);
};

// ---------- Knowledge Graph ----------

// GET /api/v1/knowledge-graph/me — syllabus topics linked to the student's own practice, mistakes, notes and decks.
personalIntelligenceRouter.get('/knowledge-graph/me', handle((req) => knowledgeMapFor(me(req)), 'Your Knowledge Graph could not be built.'));

// ---------- Daily Briefing ----------

// GET /api/v1/briefing/me?tz=330
personalIntelligenceRouter.get('/briefing/me', handle((req) => BriefingService.forStudent(me(req), today(req)), 'Your briefing could not be loaded.'));

// POST /api/v1/briefing/me/items/:itemId  { action: 'done' | 'dismissed' | 'postponed', until?, tz? }
personalIntelligenceRouter.post(
  '/briefing/me/items/:itemId',
  handle((req) => BriefingService.act(me(req), String(req.params.itemId), String(req.body?.action || ''), today(req), req.body?.until), 'That item could not be updated.')
);

// POST /api/v1/briefing/me/items/:itemId/plan  { title?, minutes?, date?, tz? } — add to the study plan.
personalIntelligenceRouter.post(
  '/briefing/me/items/:itemId/plan',
  handle((req) => BriefingService.addToPlan(me(req), String(req.params.itemId), today(req), req.body || {}), 'That item could not be added to your plan.')
);

// DELETE /api/v1/briefing/me/items/:itemId — bring a handled item back.
personalIntelligenceRouter.delete('/briefing/me/items/:itemId', handle((req) => BriefingService.undo(me(req), String(req.params.itemId)), 'That item could not be restored.'));

// ---------- My AI Brain ----------

personalIntelligenceRouter.get('/ai-brain/me', handle((req) => AiBrainService.overview(me(req)), 'Your AI Brain could not be loaded.'));

// POST /api/v1/ai-brain/me/ask  { question } — answered from the student's own records, with numbered sources.
personalIntelligenceRouter.post('/ai-brain/me/ask', handle((req) => AiBrainService.ask(me(req), req.body?.question), 'Your question could not be answered.'));

// GET /api/v1/ai-brain/me/export — everything the AI features keep about the student, as JSON.
personalIntelligenceRouter.get('/ai-brain/me/export', async (req: Request, res: Response) => {
  try {
    const data = await AiBrainService.exportData(me(req));
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'attachment; filename="my-ai-data.json"');
    res.json(data);
  } catch (err) {
    fail(res, err, 'Your data could not be exported.');
  }
});

// ---------- AI Agent Control Center ----------

const toolView = () =>
  ToolRegistry.getAll().map((t: any) => ({ name: t.name, description: t.description, category: t.category, asks_first: !!t.confirmationRequired }));

// GET /api/v1/agents/me — the seven specialists, the student's switches, tools and recent requests.
personalIntelligenceRouter.get(
  '/agents/me',
  handle(async (req) => {
    const studentId = me(req);
    const workflows = ((await db.getAgentWorkflows(studentId, 20).catch(() => [])) as any[]).filter((w) => w.student_id === studentId);
    return {
      core: CORE_AGENTS,
      agents: studentAgentView(studentId),
      tools: toolView(),
      workflows: workflows.map((w) => ({
        id: w.id,
        type: w.workflow_type,
        status: w.status,
        agents: w.agents_involved || [],
        steps: (w.tasks || []).map((t: any) => ({ agent: t.agent, title: t.title, status: t.status })),
        started_at: w.started_at,
        completed_at: w.completed_at,
        duration_ms: w.duration_ms,
      })),
    };
  }, 'Your agents could not be loaded.')
);

// PATCH /api/v1/agents/me/:agentId  { enabled: boolean }
personalIntelligenceRouter.patch(
  '/agents/me/:agentId',
  handle((req) => {
    const id = String(req.params.agentId);
    if (!studentAgentById(id)) throw Object.assign(new Error('There is no agent with that name.'), { statusCode: 404 });
    if (typeof req.body?.enabled !== 'boolean') throw Object.assign(new Error('Send enabled: true or false.'), { statusCode: 400 });
    AgentActivityService.setEnabled(me(req), id, req.body.enabled);
    return studentAgentView(me(req));
  }, 'That agent could not be updated.')
);

// GET /api/v1/agents/me/activity?limit=50 — the student's own tool-call log.
personalIntelligenceRouter.get('/agents/me/activity', handle((req) => AgentActivityService.list(me(req), Number(req.query.limit) || 50), 'Your agent log could not be loaded.'));
