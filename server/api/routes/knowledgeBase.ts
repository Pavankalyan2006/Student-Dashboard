// server/api/routes/knowledgeBase.ts
// Express REST Router for AI Knowledge Base & Document Repository

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { KnowledgeBaseService } from '../../services/knowledgeBaseService';
import { db } from '../../db/database';
import { logger } from '../../core/logging';

export const knowledgeBaseRouter = Router();

// ==========================================
// 1. Dashboard & Aggregate Stats
// ==========================================
knowledgeBaseRouter.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const stats = await KnowledgeBaseService.getDashboardStats(studentId);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    logger.error('Failed to get knowledge base dashboard stats', err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. Collections Management
// ==========================================
knowledgeBaseRouter.get('/collections', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const collections = await KnowledgeBaseService.getCollections(studentId);
    res.json({ success: true, data: collections });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/collections', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const collection = await KnowledgeBaseService.createCollection(studentId, req.body);
    res.status(201).json({ success: true, data: collection });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.get('/collections/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const details = await KnowledgeBaseService.getCollectionById(studentId, req.params.id);
    res.json({ success: true, data: details });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.patch('/collections/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updated = await KnowledgeBaseService.updateCollection(studentId, req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.delete('/collections/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deleteDocs = req.query.deleteDocuments === 'true';
    await KnowledgeBaseService.deleteCollection(studentId, req.params.id, deleteDocs);
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/collections/:id/documents', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ success: false, message: 'documentId is required' });
    }
    const collection = await KnowledgeBaseService.assignDocumentToCollection(studentId, req.params.id, documentId);
    res.json({ success: true, data: collection });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.delete(
  '/collections/:id/documents/:documentId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.user!.userId;
      const collection = await KnowledgeBaseService.removeDocumentFromCollection(
        studentId,
        req.params.id,
        req.params.documentId
      );
      res.json({ success: true, data: collection });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
);

// ==========================================
// 3. Search & AI QA
// ==========================================
knowledgeBaseRouter.post('/search', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const results = await KnowledgeBaseService.searchKnowledge(studentId, req.body);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/ask', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const answer = await KnowledgeBaseService.askQuestion(studentId, req.body);
    res.json({ success: true, data: answer });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.get('/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const questions = await db.getKnowledgeQuestions(studentId, limit);
    res.json({ success: true, data: questions });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. Study Material Generator & Materials
// ==========================================
knowledgeBaseRouter.post('/materials/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const material = await KnowledgeBaseService.generateStudyMaterial(studentId, req.body);
    res.status(201).json({ success: true, data: material });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.get('/materials', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const documentId = req.query.documentId as string | undefined;
    const materials = await KnowledgeBaseService.getStudyMaterials(studentId, documentId);
    res.json({ success: true, data: materials });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/materials/:id/save-to-notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const note = await KnowledgeBaseService.saveMaterialToNotes(studentId, req.params.id);
    res.status(201).json({ success: true, data: note, message: 'Saved to Notes successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/materials/:id/save-to-flashcards', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const deck = await KnowledgeBaseService.saveMaterialToFlashcards(studentId, req.params.id);
    res.status(201).json({ success: true, data: deck, message: 'Saved to Flashcards successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/materials/:id/save-to-quiz', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const result = await KnowledgeBaseService.saveMaterialToQuiz(studentId, req.params.id);
    res.status(201).json({ success: true, data: result, message: 'Practice Quiz created successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. Document Re-indexing
// ==========================================
knowledgeBaseRouter.post('/documents/:id/reindex', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const doc = await KnowledgeBaseService.reindexDocument(studentId, req.params.id);
    res.json({ success: true, data: doc });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. Bookmarks
// ==========================================
knowledgeBaseRouter.get('/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const documentId = req.query.documentId as string | undefined;
    const bookmarks = await KnowledgeBaseService.getBookmarks(studentId, documentId);
    res.json({ success: true, data: bookmarks });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/bookmarks', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const bookmark = await KnowledgeBaseService.createBookmark(studentId, req.body);
    res.status(201).json({ success: true, data: bookmark });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.delete('/bookmarks/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await KnowledgeBaseService.deleteBookmark(studentId, req.params.id);
    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 7. Notes
// ==========================================
knowledgeBaseRouter.get('/notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const documentId = req.query.documentId as string | undefined;
    const notes = await KnowledgeBaseService.getNotes(studentId, documentId);
    res.json({ success: true, data: notes });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const note = await KnowledgeBaseService.createNote(studentId, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.delete('/notes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await KnowledgeBaseService.deleteNote(studentId, req.params.id);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. External Learning Resources
// ==========================================
knowledgeBaseRouter.get('/resources', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const collectionId = req.query.collectionId as string | undefined;
    const resources = await KnowledgeBaseService.getResources(studentId, collectionId);
    res.json({ success: true, data: resources });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.post('/resources', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const resource = await KnowledgeBaseService.createResource(studentId, req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});

knowledgeBaseRouter.delete('/resources/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    await KnowledgeBaseService.deleteResource(studentId, req.params.id);
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
