import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { ResearchService } from '../../services/researchService';
import { ResearchProviderService } from '../../services/researchProviderService';
import { PaperAnalysisService } from '../../services/paperAnalysisService';
import { LiteratureReviewService } from '../../services/literatureReviewService';
import { ResearchCitationService } from '../../services/researchCitationService';
import { ResearchExportService } from '../../services/researchExportService';
import { logger } from '../../core/logging';

export const researchRouter = Router();

// ==========================================
// 1. Projects
// ==========================================

researchRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const projects = await ResearchService.listProjects(studentId);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    logger.error('Failed to list research projects', { error: err.message });
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.get('/projects', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const projects = await ResearchService.listProjects(studentId);
    res.json({ success: true, data: projects });
  } catch (err: any) {
    logger.error('Failed to list research projects', { error: err.message });
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await ResearchService.createProject(studentId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    logger.error('Failed to create research project', { error: err.message });
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

// Single Paper endpoints (Placed before /:id parameter to avoid collision)
researchRouter.get('/papers/:paper_id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const paper = await ResearchService.getPaper(req.params.paper_id, studentId);
    res.json({ success: true, data: paper });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

researchRouter.post('/papers/:paper_id/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const analysis = await PaperAnalysisService.analyzePaper(req.params.paper_id, studentId);
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/papers/:paper_id/summarize', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { mode } = req.body; // 'simple' | 'technical'
    const summary = await PaperAnalysisService.summarizePaper(req.params.paper_id, studentId, mode || 'simple');
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/papers/compare', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { paper_ids } = req.body;
    if (!Array.isArray(paper_ids) || paper_ids.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 paper IDs required for comparison matrix' });
    }
    const comparison = await PaperAnalysisService.comparePapers(paper_ids, studentId);
    res.json({ success: true, data: comparison });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// Question deletion & updates
researchRouter.delete('/questions/:question_id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const projectId = req.query.project_id as string;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'project_id query param is required' });
    }
    const deleted = await ResearchService.deleteQuestion(projectId, req.params.question_id, studentId);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// Single Project CRUD
researchRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const project = await ResearchService.getProject(req.params.id, studentId);
    res.json({ success: true, data: project });
  } catch (err: any) {
    res.status(err.status || 404).json({ success: false, message: err.message });
  }
});

researchRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await ResearchService.updateProject(req.params.id, studentId, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

researchRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleted = await ResearchService.deleteProject(req.params.id, studentId);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Papers in Project
// ==========================================

researchRouter.get('/:id/papers', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const papers = await ResearchService.listPapers(req.params.id, studentId);
    res.json({ success: true, data: papers });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/papers/search', requireAuth, async (req: Request, res: Response) => {
  try {
    const { query, author, year_min, year_max, domain, venue } = req.body;
    const results = await ResearchProviderService.searchPapers({
      query: query || '',
      author,
      year_min,
      year_max,
      domain,
      venue,
      limit: 20,
    });
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/papers/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { document_id, paper } = req.body;

    if (document_id) {
      // Import existing uploaded document from Phase 6 Document AI
      const savedPaper = await ResearchService.importPaperFromDocument(req.params.id, studentId, document_id);
      return res.status(201).json({ success: true, data: savedPaper });
    }

    if (paper) {
      // Save discovered paper or metadata
      const savedPaper = await ResearchService.savePaper(req.params.id, studentId, paper);
      return res.status(201).json({ success: true, data: savedPaper });
    }

    return res.status(400).json({ success: false, message: 'Either document_id or paper object must be provided' });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. Questions, Gaps & Ideas
// ==========================================

researchRouter.get('/:id/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const questions = await ResearchService.listQuestions(req.params.id, studentId);
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const question = await ResearchService.addQuestion(req.params.id, studentId, req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

researchRouter.get('/:id/gaps', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const gaps = await ResearchService.listGaps(req.params.id, studentId);
    res.json({ success: true, data: gaps });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/gaps/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const gaps = await PaperAnalysisService.identifyResearchGaps(req.params.id, studentId);
    res.json({ success: true, data: gaps });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/gaps', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const gap = await ResearchService.addGap(req.params.id, studentId, req.body);
    res.status(201).json({ success: true, data: gap });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

researchRouter.get('/:id/ideas', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const ideas = await ResearchService.listIdeas(req.params.id, studentId);
    res.json({ success: true, data: ideas });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/ideas/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const ideas = await PaperAnalysisService.generateResearchIdeas(req.params.id, studentId);
    res.json({ success: true, data: ideas });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/ideas', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const idea = await ResearchService.addIdea(req.params.id, studentId, req.body);
    res.status(201).json({ success: true, data: idea });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Methodology
// ==========================================

researchRouter.get('/:id/methodology', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const methodology = await ResearchService.getMethodology(req.params.id, studentId);
    res.json({ success: true, data: methodology });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.patch('/:id/methodology', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const methodology = await ResearchService.saveMethodology(req.params.id, studentId, req.body);
    res.json({ success: true, data: methodology });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. Literature Review
// ==========================================

researchRouter.get('/:id/literature-review', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const review = await ResearchService.getLiteratureReview(req.params.id, studentId);
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/literature-review/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { organization } = req.body; // 'thematic' | 'chronological' | 'methodological'
    const review = await LiteratureReviewService.generateReview(
      req.params.id,
      studentId,
      organization || 'thematic'
    );
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.patch('/:id/literature-review', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const review = await ResearchService.saveLiteratureReview(req.params.id, studentId, req.body);
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. Citations & Bibliography
// ==========================================

researchRouter.get('/:id/citations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const citations = await ResearchService.listCitations(req.params.id, studentId);
    res.json({ success: true, data: citations });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.post('/:id/citations', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { paper_id, citation_style } = req.body;
    const citation = await ResearchCitationService.generateCitation(
      paper_id,
      studentId,
      citation_style || 'APA',
      req.params.id
    );
    res.status(201).json({ success: true, data: citation });
  } catch (err: any) {
    res.status(err.status || 400).json({ success: false, message: err.message });
  }
});

researchRouter.get('/:id/citations/bibliography', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const style = (req.query.style as any) || 'APA';
    const bibliography = await ResearchCitationService.generateBibliography(req.params.id, studentId, style);
    res.json({ success: true, data: { style, bibliography } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. Evidence Matrix & Export
// ==========================================

researchRouter.get('/:id/evidence-matrix', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const matrix = await ResearchService.getEvidenceMatrix(req.params.id, studentId);
    res.json({ success: true, data: matrix });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

researchRouter.get('/:id/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const format = (req.query.format as string) || 'markdown';
    const type = (req.query.type as string) || 'proposal'; // 'proposal' | 'evidence_matrix' | 'bibtex'

    if (type === 'bibtex') {
      const bibtex = await ResearchCitationService.generateBibTeX(req.params.id, studentId);
      res.setHeader('Content-Type', 'text/plain');
      return res.send(bibtex);
    }

    if (type === 'evidence_matrix') {
      const markdown = await ResearchExportService.exportEvidenceMatrix(req.params.id, studentId);
      return res.json({ success: true, data: { content: markdown, format } });
    }

    const markdown = await ResearchExportService.exportResearchProposal(req.params.id, studentId);
    res.json({ success: true, data: { content: markdown, format } });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
