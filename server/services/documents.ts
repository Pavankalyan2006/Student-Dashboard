import { db } from '../db/database';
import { StorageService } from '../storage/storage';
import { DocumentProcessingService } from '../processing/processor';
import { VectorStore } from '../rag/vectorStore';
import { NotesService } from './notes';
import {
  Document,
  DocumentPage,
  DocumentChunk,
  DocumentCardData,
  PaginatedResult,
} from '../models/types';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export interface ListDocumentsParams {
  search?: string;
  filter?: 'all' | 'pdf' | 'document' | 'recent' | 'favorites' | 'processing' | 'ready' | 'failed';
  sort?: 'recent_upload' | 'recent_open' | 'name' | 'size' | 'status';
  page?: number;
  limit?: number;
}

export interface UploadDocumentInput {
  title?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  contentBase64?: string;
  courseId?: string;
  courseTitle?: string;
  tags?: string[];
  description?: string;
}

export class DocumentService {
  /**
   * Retrieves a paginated and filtered list of documents owned by the student.
   */
  public static async listDocuments(
    studentId: string,
    params: ListDocumentsParams = {}
  ): Promise<PaginatedResult<DocumentCardData>> {
    return db.getStudentDocuments(studentId, params);
  }

  /**
   * Retrieves a single document by ID, strictly verifying student ownership.
   */
  public static async getDocument(
    documentId: string,
    studentId: string,
    role: string = 'STUDENT'
  ): Promise<Document> {
    const doc = await db.getDocumentById(documentId, studentId);
    if (!doc) {
      throw new NotFoundError('Document not found');
    }

    if (role !== 'SUPER_ADMIN' && doc.student_id !== studentId) {
      throw new AuthorizationError('You do not have permission to access this document');
    }

    // Touch last_opened_at
    await db.updateDocument(documentId, studentId, {
      last_opened_at: new Date().toISOString(),
    });

    return doc;
  }

  /**
   * Handles authenticated document upload, secure storage, record creation, and kicks off async processing.
   */
  public static async uploadDocument(
    studentId: string,
    input: UploadDocumentInput
  ): Promise<Document> {
    const { originalName, mimeType, sizeBytes, contentBase64 } = input;

    if (!originalName || !mimeType || sizeBytes === undefined) {
      throw new ValidationError('Missing required file metadata (originalName, mimeType, sizeBytes)');
    }

    // 1. File size check (max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (sizeBytes > MAX_SIZE) {
      throw new ValidationError('File size exceeds the 25MB maximum limit');
    }

    // 2. Validate extension
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'md'];
    if (!allowedExts.includes(ext)) {
      throw new ValidationError(
        `Unsupported document format (.${ext}). Supported formats: PDF, DOCX, PPTX, TXT`
      );
    }

    // 3. Store file blob securely via StorageService
    const storageRecord = await StorageService.upload({
      studentId,
      originalName,
      mimeType,
      sizeBytes,
      category: 'document',
      dataBuffer: contentBase64,
    });

    const title = input.title?.trim() || originalName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

    // 4. Create Document record in database
    const document = await db.createDocument({
      student_id: studentId,
      title,
      original_filename: originalName,
      mime_type: mimeType,
      file_extension: ext,
      file_size: sizeBytes,
      storage_key: storageRecord.id,
      status: 'QUEUED',
      page_count: 0,
      description: input.description || `Uploaded study document ${originalName}`,
      author: 'Unknown',
      language: 'en',
      metadata: {
        course_id: input.courseId,
        course_title: input.courseTitle,
        tags: input.tags || [],
      },
      is_favorite: false,
    });

    logger.info(`Document created with ID ${document.id} for student ${studentId}`, {
      userId: studentId,
      context: { documentId: document.id, title },
    });

    // 5. Asynchronously trigger processing job
    DocumentProcessingService.processDocumentAsync(document.id, studentId);

    return document;
  }

  /**
   * Updates document metadata (rename, tags, favorite).
   */
  public static async updateDocument(
    documentId: string,
    studentId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    const doc = await this.getDocument(documentId, studentId);

    const updated = await db.updateDocument(documentId, studentId, {
      title: updates.title !== undefined ? updates.title.trim() : undefined,
      description: updates.description,
      is_favorite: updates.is_favorite,
      metadata: updates.metadata ? { ...doc.metadata, ...updates.metadata } : undefined,
    });

    return updated;
  }

  /**
   * Toggles bookmark / favorite status for a document.
   */
  public static async toggleFavorite(
    documentId: string,
    studentId: string
  ): Promise<{ is_favorite: boolean }> {
    const doc = await this.getDocument(documentId, studentId);
    const newFav = !doc.is_favorite;
    await db.updateDocument(documentId, studentId, { is_favorite: newFav });
    return { is_favorite: newFav };
  }

  /**
   * Retrieves pages for a document with pagination.
   */
  public static async getDocumentPages(
    documentId: string,
    studentId: string
  ): Promise<DocumentPage[]> {
    await this.getDocument(documentId, studentId);
    return db.getDocumentPages(documentId, studentId);
  }

  /**
   * Retrieves a single page by number.
   */
  public static async getDocumentPage(
    documentId: string,
    pageNumber: number,
    studentId: string
  ): Promise<DocumentPage> {
    await this.getDocument(documentId, studentId);
    const page = await db.getDocumentPage(documentId, pageNumber, studentId);
    if (!page) {
      throw new NotFoundError(`Page ${pageNumber} not found for document ${documentId}`);
    }
    return page;
  }

  /**
   * Retries processing for a failed document.
   */
  public static async retryProcessing(
    documentId: string,
    studentId: string
  ): Promise<{ success: boolean; status: string }> {
    const doc = await this.getDocument(documentId, studentId);
    await db.updateDocument(documentId, studentId, {
      status: 'QUEUED',
      processing_error: undefined,
    });

    DocumentProcessingService.processDocumentAsync(documentId, studentId);
    return { success: true, status: 'QUEUED' };
  }

  /**
   * Deletes a document with all pages, chunks, vectors, summaries, and storage blobs.
   */
  public static async deleteDocument(
    documentId: string,
    studentId: string,
    role: string = 'STUDENT'
  ): Promise<{ id: string; deleted: boolean }> {
    const doc = await this.getDocument(documentId, studentId, role);

    // 1. Delete vector records
    VectorStore.deleteDocumentVectors(documentId, studentId);

    // 2. Delete storage blob
    try {
      await StorageService.delete(doc.storage_key, studentId, role);
    } catch {
      // Storage file might already be removed
    }

    // 3. Delete database records (cascades pages, chunks, summaries)
    await db.deleteDocument(documentId, studentId);

    logger.info(`Document ${documentId} deleted by student ${studentId}`, {
      userId: studentId,
      context: { documentId },
    });

    return { id: documentId, deleted: true };
  }

  /**
   * Generates Notes using the existing Phase 5 NotesService,
   * retaining document source metadata and page ranges.
   */
  public static async generateNotesFromDocument(
    documentId: string,
    studentId: string,
    options: {
      pageRange?: { startPage: number; endPage: number };
      noteType?: any;
      level?: any;
    } = {}
  ): Promise<any> {
    const doc = await this.getDocument(documentId, studentId);
    const pages = await db.getDocumentPages(documentId, studentId);

    let selectedPages = pages;
    if (options.pageRange) {
      selectedPages = pages.filter(
        (p) => p.page_number >= options.pageRange!.startPage && p.page_number <= options.pageRange!.endPage
      );
    }

    const pageRangeDesc = options.pageRange
      ? `Pages ${options.pageRange.startPage}–${options.pageRange.endPage}`
      : `All ${pages.length} pages`;

    const contentSnippet = selectedPages.map((p) => `[Page ${p.page_number}]\n${p.text}`).join('\n\n');

    // Call existing NotesService
    const note = await NotesService.generateNote(studentId, {
      topic: `${doc.title} (${pageRangeDesc})`,
      source_type: 'document',
      document_id: doc.id,
      selected_content: contentSnippet.slice(0, 4000),
      note_type: options.noteType || 'STUDY_NOTES',
      level: options.level || 'INTERMEDIATE',
      tags: [doc.title, 'Document Notes', doc.file_extension.toUpperCase()],
      metadata: {
        page_range: options.pageRange ? `${options.pageRange.startPage}-${options.pageRange.endPage}` : undefined,
      },
    });

    return note;
  }

  /**
   * Alias for generateNotesFromDocument supporting specific page numbers array.
   */
  public static async generateNoteFromDocument(
    documentId: string,
    studentId: string,
    options: {
      title?: string;
      note_type?: any;
      page_numbers?: number[];
      pageRange?: { startPage: number; endPage: number };
    } = {}
  ): Promise<any> {
    let range = options.pageRange;
    if (!range && options.page_numbers && options.page_numbers.length > 0) {
      range = {
        startPage: Math.min(...options.page_numbers),
        endPage: Math.max(...options.page_numbers),
      };
    }
    return this.generateNotesFromDocument(documentId, studentId, {
      pageRange: range,
      noteType: options.note_type,
    });
  }

  /**
   * Programmatic document creation for test setup and service integration.
   */
  public static async createDocument(
    studentId: string,
    metadata: {
      filename?: string;
      originalName?: string;
      mimeType: string;
      sizeBytes: number;
      courseId?: string;
      courseTitle?: string;
      tags?: string[];
      description?: string;
      title?: string;
    },
    fileBuffer?: Buffer
  ): Promise<Document> {
    const rawName = metadata.filename || metadata.originalName || 'untitled.pdf';
    // Sanitize filename to prevent path traversal
    const cleanName = rawName.replace(/\.\./g, '').replace(/[\/\\]+/g, '_').trim();
    const ext = cleanName.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt', 'md'];

    if (!allowedExts.includes(ext)) {
      throw new ValidationError(`Unsupported document type (.${ext}). Supported formats: PDF, DOCX, PPTX, TXT`);
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (metadata.sizeBytes > MAX_SIZE) {
      throw new ValidationError(`File size exceeds maximum allowed size (100MB)`);
    }

    const title = metadata.title || cleanName;
    const storageKey = `storage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Store record in storage records
    const storageRecord = await db.createStorageRecord({
      student_id: studentId,
      original_name: cleanName,
      stored_name: `${storageKey}_${cleanName}`,
      mime_type: metadata.mimeType,
      size_bytes: metadata.sizeBytes,
      category: 'document',
    });

    const doc = await db.createDocument({
      student_id: studentId,
      title,
      original_filename: cleanName,
      mime_type: metadata.mimeType,
      file_extension: ext,
      file_size: metadata.sizeBytes,
      storage_key: storageRecord.id,
      status: 'READY',
      page_count: 5,
      description: metadata.description || `Uploaded ${cleanName}`,
      metadata: {
        course_id: metadata.courseId,
        course_title: metadata.courseTitle,
        tags: metadata.tags || [],
      },
    });

    // Create pages and chunks for this newly created doc
    const sampleText = fileBuffer ? fileBuffer.toString('utf-8') : 'Academic textbook curriculum content.';
    await db.createDocumentPages(doc.id, studentId, [
      { page_number: 1, text: `${title}\n\n${sampleText}` },
    ]);

    return doc;
  }
}

