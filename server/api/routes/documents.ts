import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { DocumentService } from '../../services/documents';
import { DocumentAIService } from '../../services/documentAi';
import { DocumentSummaryService } from '../../services/documentSummary';
import { DocumentRetrievalService } from '../../rag/retriever';
import { StorageService } from '../../storage/storage';
import { ValidationError } from '../../core/exceptions';
import { eventBus } from '../../events/eventBus';
import { DocumentCategory } from '../../models/types';

export const documentsRouter = Router();

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Lecture Notes',
  'Study Materials',
  'Textbooks and References',
  'Assignments',
  'Laboratory Manuals',
  'Lab Reports',
  'Project Reports',
  'Research Papers',
  'Presentations',
  'Question Papers',
  'Exam Preparation',
  'Certificates',
  'Resumes',
  'Internship Documents',
  'Placement Materials',
  'Programming Resources',
  'Course Materials',
  'Other Documents',
];

// GET /api/v1/documents/categories - List available academic categories
documentsRouter.get('/documents/categories', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: DOCUMENT_CATEGORIES,
  });
});

// GET /api/v1/documents/stats - Real storage stats and document counts
documentsRouter.get('/documents/stats', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const stats = await DocumentService.getStorageStats(studentId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/folders - List student folders
documentsRouter.get('/documents/folders', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const folders = await DocumentService.listFolders(studentId);
    res.json({
      success: true,
      data: folders,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/folders - Create new folder
documentsRouter.post('/documents/folders', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { name, description, color, parent_id } = req.body;
    const folder = await DocumentService.createFolder(studentId, {
      name,
      description,
      color,
      parent_id,
    });
    res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/folders/:folderId - Get single folder
documentsRouter.get('/documents/folders/:folderId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { folderId } = req.params;
    const folder = await DocumentService.getFolder(folderId, studentId);
    res.json({
      success: true,
      data: folder,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/documents/folders/:folderId - Update folder
documentsRouter.patch('/documents/folders/:folderId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { folderId } = req.params;
    const { name, description, color } = req.body;
    const folder = await DocumentService.updateFolder(folderId, studentId, {
      name,
      description,
      color,
    });
    res.json({
      success: true,
      data: folder,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/documents/folders/:folderId - Delete folder
documentsRouter.delete('/documents/folders/:folderId', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { folderId } = req.params;
    const actionOnDocuments = req.query.actionOnDocuments === 'delete' ? 'delete' : 'unfile';
    const result = await DocumentService.deleteFolder(folderId, studentId, actionOnDocuments);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents - List documents with filtering, search, and pagination
documentsRouter.get('/documents', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { search, filter, sort, page, limit, category, folder_id, file_type } = req.query;

    const result = await DocumentService.listDocuments(studentId, {
      search: search as string,
      filter: filter as any,
      sort: sort as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      category: category as any,
      folder_id: folder_id as string,
      file_type: file_type as string,
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
    const originalName = req.body.originalName || req.body.original_filename;
    const mimeType = req.body.mimeType || req.body.mime_type;
    const sizeBytes = req.body.sizeBytes !== undefined ? req.body.sizeBytes : req.body.size_bytes;
    const contentBase64 = req.body.contentBase64 || req.body.file_data_base64;
    const title = req.body.title;
    const courseId = req.body.courseId || req.body.course_id;
    const courseTitle = req.body.courseTitle || req.body.course_title;
    const subject = req.body.subject;
    const semester = req.body.semester ? Number(req.body.semester) : undefined;
    const academicYear = req.body.academicYear || req.body.academic_year;
    const topic = req.body.topic;
    const collectionId = req.body.collectionId || req.body.collection_id;
    const visibility = req.body.visibility;
    const tags = req.body.tags;
    const description = req.body.description;
    const category = req.body.category;
    const folderId = req.body.folderId || req.body.folder_id;
    const notes = req.body.notes;

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
      subject,
      semester,
      academicYear,
      topic,
      collectionId,
      visibility,
      tags: Array.isArray(tags) ? tags : undefined,
      description,
      category,
      folderId,
      notes,
    });

    await eventBus.publish(
      'DOCUMENT_UPLOADED',
      {
        document_id: document.id,
        title: document.title,
        mime_type: document.mime_type,
        size_bytes: document.file_size,
      },
      {
        student_id: studentId,
        resource_type: 'Document',
        resource_id: document.id,
        source: 'DocumentsRouter',
      }
    );

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/ai-fetch - Semantically search and fetch documents using Gemini
documentsRouter.post('/documents/ai-fetch', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new ValidationError('Search query is required');
    }

    const result = await DocumentService.aiFetchDocuments(studentId, query.trim());
    res.json({
      success: true,
      data: result,
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
    const { title, description, is_favorite, metadata, category, folder_id, folderId } = req.body;

    const updated = await DocumentService.updateDocument(documentId, studentId, {
      title,
      description,
      is_favorite,
      metadata,
      category,
      folder_id: folder_id !== undefined ? folder_id : folderId,
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

// GET /api/v1/documents/:documentId/download - Download original uploaded document file
documentsRouter.get('/documents/:documentId/download', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const role = req.user!.role;
    const { documentId } = req.params;

    const doc = await DocumentService.getDocument(documentId, studentId, role);
    const { record, data } = await StorageService.download(doc.storage_key, studentId, role);

    const safeFilename = (record.original_name || doc.original_filename || 'document.pdf').replace(
      /[^\w.-]/g,
      '_'
    );
    res.setHeader('Content-Type', record.mime_type || doc.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    if (data.startsWith('data:')) {
      const base64Data = data.split(',')[1] || '';
      return res.send(Buffer.from(base64Data, 'base64'));
    }
    return res.send(Buffer.from(data, 'base64'));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/version - Upload a newer version of the document
documentsRouter.post('/documents/:documentId/version', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const role = req.user!.role;
    const { documentId } = req.params;

    const originalName = req.body.originalName || req.body.original_filename;
    const mimeType = req.body.mimeType || req.body.mime_type;
    const sizeBytes = req.body.sizeBytes !== undefined ? req.body.sizeBytes : req.body.size_bytes;
    const contentBase64 = req.body.contentBase64 || req.body.file_data_base64;
    const changeNotes = req.body.changeNotes || req.body.change_notes;

    if (!originalName || !mimeType || sizeBytes === undefined) {
      throw new ValidationError('originalName, mimeType, and sizeBytes are required');
    }

    const updated = await DocumentService.uploadNewVersion(
      documentId,
      studentId,
      {
        originalName,
        mimeType,
        sizeBytes: Number(sizeBytes),
        contentBase64,
        changeNotes,
      },
      role
    );

    res.status(201).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/move - Move document to folder or unfiled
documentsRouter.post('/documents/:documentId/move', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { folder_id, folderId } = req.body;
    const targetFolderId = folder_id !== undefined ? folder_id : folderId;

    const updated = await DocumentService.moveDocument(documentId, targetFolderId, studentId);
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/versions - Get document version history
documentsRouter.get('/documents/:documentId/versions', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;

    const versions = await DocumentService.getDocumentVersions(documentId, studentId);
    res.json({
      success: true,
      data: versions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId/versions/:versionNumber/download - Download a previous version
documentsRouter.get('/documents/:documentId/versions/:versionNumber/download', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const role = req.user!.role;
    const { documentId, versionNumber } = req.params;

    const versions = await DocumentService.getDocumentVersions(documentId, studentId);
    const targetVersion = versions.find((v) => v.version_number === Number(versionNumber));
    if (!targetVersion) {
      throw new ValidationError(`Version ${versionNumber} not found`);
    }

    const { record, data } = await StorageService.download(targetVersion.storage_key, studentId, role);
    const safeFilename = (targetVersion.original_filename || 'document').replace(/[^\w.-]/g, '_');
    res.setHeader('Content-Type', targetVersion.mime_type || record.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    if (data.startsWith('data:')) {
      const base64Data = data.split(',')[1] || '';
      return res.send(Buffer.from(base64Data, 'base64'));
    }
    return res.send(Buffer.from(data, 'base64'));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/versions/:versionNumber/restore - Restore a previous version
documentsRouter.post('/documents/:documentId/versions/:versionNumber/restore', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId, versionNumber } = req.params;

    const restored = await DocumentService.restoreVersion(documentId, Number(versionNumber), studentId);
    res.json({
      success: true,
      data: restored,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/index-knowledge - Index document in Knowledge Base / RAG pipeline
documentsRouter.post('/documents/:documentId/index-knowledge', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;

    const result = await DocumentService.indexDocumentInKnowledgeBase(documentId, studentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents/:documentId/link-lab - Link document as reference lab manual
documentsRouter.post('/documents/:documentId/link-lab', requireAuth, async (req, res, next) => {
  try {
    const studentId = req.user!.userId;
    const { documentId } = req.params;
    const { labId, labTitle } = req.body;

    if (!labId) {
      throw new ValidationError('labId is required');
    }

    const updated = await DocumentService.linkDocumentToLab(documentId, studentId, labId, labTitle);
    res.json({
      success: true,
      data: updated,
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
