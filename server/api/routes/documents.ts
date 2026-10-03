import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { DocumentService } from '../../services/documents';
import { DocumentAIService } from '../../services/documentAi';
import { DocumentSummaryService } from '../../services/documentSummary';
import { DocumentRetrievalService } from '../../rag/retriever';
import { StorageService } from '../../storage/storage';
import { ValidationError } from '../../core/exceptions';

export const documentsRouter = Router();

// GET /api/v1/documents - List documents with filtering, search, and pagination
documentsRouter.get('/documents', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { search, filter, sort, page, limit } = req.query;

    const result = await DocumentService.listDocuments(studentId, {
      search: search as string,
      filter: filter as any,
      sort: sort as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents - Upload document
documentsRouter.post('/documents', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const {
      title,
      originalName,
      mimeType,
      sizeBytes,
      contentBase64,
      courseId,
      courseTitle,
      tags,
      description,
    } = req.body;

    if (!originalName || !mimeType || sizeBytes === undefined) {
      throw new ValidationError('originalName, mimeType, and sizeBytes are required');
    }

    const document = await DocumentService.uploadDocument(studentId, {
      title,
      originalName,
      mimeType,
      sizeBytes: Number(sizeBytes),
      contentBase64,
      courseId,
      courseTitle,
      tags: Array.isArray(tags) ? tags : undefined,
      description,
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId - Get document metadata
documentsRouter.get('/documents/:documentId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const role = req.user!.role;
    const { documentId } = req.params;

    const document = await DocumentService.getDocument(documentId, studentId, role);
    res.json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/documents/:documentId - Update document metadata
documentsRouter.patch('/documents/:documentId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { title, description, is_favorite, metadata } = req.body;

    const updated = await DocumentService.updateDocument(documentId, studentId, {
      title,
      description,
      is_favorite,
      metadata,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/documents/:documentId - Delete document
documentsRouter.delete('/documents/:documentId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const role = req.user!.role;
    const { documentId } = req.params;

    const result = await DocumentService.deleteDocument(documentId, studentId, role);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/status - Check processing status
documentsRouter.get('/documents/:documentId/status', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;

    const doc = await DocumentService.getDocument(documentId, studentId);
    res.json({
      success: true,
      data: {
        id: doc.id,
        status: doc.status,
        page_count: doc.page_count,
        processing_started_at: doc.processing_started_at,
        processing_completed_at: doc.processing_completed_at,
        processing_error: doc.processing_error,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/pages - List all pages
documentsRouter.get('/documents/:documentId/pages', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;

    const pages = await DocumentService.getDocumentPages(documentId, studentId);
    res.json({
      success: true,
      data: pages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/pages/:pageNumber - Get single page
documentsRouter.get('/documents/:documentId/pages/:pageNumber', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId, pageNumber } = req.params;

    const page = await DocumentService.getDocumentPage(documentId, Number(pageNumber), studentId);
    res.json({
      success: true,
      data: page,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/search - Search inside document content
documentsRouter.get('/documents/:documentId/search', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { q, pageNumbers } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ValidationError('Search query parameter "q" is required');
    }

    let parsedPages: number[] | undefined;
    if (pageNumbers) {
      parsedPages = String(pageNumbers)
        .split(',')
        .map((p) => Number(p.trim()))
        .filter((n) => !isNaN(n));
    }

    const matches = await DocumentRetrievalService.retrieve({
      studentId,
      documentId,
      query: q,
      pageNumbers: parsedPages,
      topK: 10,
    });

    res.json({
      success: true,
      data: matches,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/chat - Grounded AI Q&A
documentsRouter.post('/documents/:documentId/chat', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { question, current_page, selected_pages, conversation_id } = req.body;

    if (!question || typeof question !== 'string') {
      throw new ValidationError('Field "question" is required');
    }

    const response = await DocumentAIService.askDocument(documentId, studentId, {
      question,
      current_page: current_page ? Number(current_page) : undefined,
      selected_pages: Array.isArray(selected_pages) ? selected_pages.map(Number) : undefined,
      conversation_id,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/summary - Get summary
documentsRouter.get('/documents/:documentId/summary', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { level } = req.query;

    const summary = await DocumentSummaryService.getOrGenerateSummary(documentId, studentId, {
      summaryLevel: (level as any) || 'standard',
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/summary - Generate or regenerate summary
documentsRouter.post('/documents/:documentId/summary', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { level, start_page, end_page, force_regenerate } = req.body;

    const pageRange =
      start_page && end_page
        ? { startPage: Number(start_page), endPage: Number(end_page) }
        : undefined;

    const summary = await DocumentSummaryService.getOrGenerateSummary(documentId, studentId, {
      summaryLevel: level || 'standard',
      pageRange,
      forceRegenerate: Boolean(force_regenerate),
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/notes - Generate notes into Phase 5 Notes module
documentsRouter.post('/documents/:documentId/notes', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { start_page, end_page, note_type, level } = req.body;

    const pageRange =
      start_page && end_page
        ? { startPage: Number(start_page), endPage: Number(end_page) }
        : undefined;

    const note = await DocumentService.generateNotesFromDocument(documentId, studentId, {
      pageRange,
      noteType: note_type,
      level,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/retry-processing - Retry failed processing
documentsRouter.post('/documents/:documentId/retry-processing', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;

    const result = await DocumentService.retryProcessing(documentId, studentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/favorite - Toggle favorite
documentsRouter.post('/documents/:documentId/favorite', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;

    const result = await DocumentService.toggleFavorite(documentId, studentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/file - Download or stream raw document data
documentsRouter.get('/documents/:documentId/file', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const role = req.user!.role;
    const { documentId } = req.params;

    const doc = await DocumentService.getDocument(documentId, studentId, role);
    const { data } = await StorageService.download(doc.storage_key, studentId, role);

    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(doc.original_filename)}"`
    );
    res.send(data);
  } catch (err) {
    next(err);
  }
});
