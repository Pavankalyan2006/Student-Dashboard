import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ContextService } from '../../services/contextService';
import { db } from '../../db/database';
import { logger } from '../../core/logging';

export const contextRouter = Router();

// Resolve multi-source context items with provenance
contextRouter.post('/resolve', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }
    const resolved = await ContextService.resolveContextItems(studentId, items);
    res.json({ success: true, data: resolved });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Build unified multi-source prompt with provenance citations
contextRouter.post('/build-prompt', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { prompt, items } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'prompt string is required' });
    }
    const result = await ContextService.buildMultiSourcePrompt(studentId, prompt, items || []);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});

// Provide selectable platform context options for "Add Context" modal
contextRouter.get('/options', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;

    const [courses, docs, notes, projects, researchProjects, repos] = await Promise.all([
      db.getCourses(),
      db.getDocuments(studentId),
      db.getNotes(studentId),
      db.getProjects(studentId),
      db.getResearchProjects(studentId),
      db.getGitHubRepositories(studentId),
    ]);

    const options = [
      ...((courses as any).items || courses).map((c: any) => ({
        type: 'COURSE',
        reference_id: c.id,
        title: c.title,
        subtitle: `${c.level} · ${c.modules_count || c.modules?.length || 0} Modules`,
      })),
      ...docs.map((d: any) => ({
        type: 'DOCUMENT',
        reference_id: d.id,
        title: d.title || d.original_filename,
        subtitle: `Document · ${d.page_count} pages`,
      })),
      ...notes.map((n: any) => ({
        type: 'NOTE',
        reference_id: n.id,
        title: n.title,
        subtitle: `Note · ${(n.tags || []).slice(0, 2).join(', ')}`,
      })),
      ...projects.map((p: any) => ({
        type: 'PROJECT',
        reference_id: p.id,
        title: p.title,
        subtitle: `Project · ${p.domain}`,
      })),
      ...researchProjects.map((rp: any) => ({
        type: 'RESEARCH_PROJECT',
        reference_id: rp.id,
        title: rp.title,
        subtitle: `Research · ${rp.domain} (${rp.research_type})`,
      })),
      ...repos.map((r: any) => ({
        type: 'GITHUB_REPO',
        reference_id: r.id,
        title: r.full_name,
        subtitle: `GitHub Repo · ${r.language}`,
      })),
    ];

    res.json({ success: true, data: options });
  } catch (err: any) {
    res.status(err.statusCode || err.statusCode || err.status || 500).json({ success: false, message: err.message });
  }
});
