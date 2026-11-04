import crypto from 'crypto';
import { db } from '../db/database';
import { StorageService } from '../storage/storage';
import { DocumentProcessingService } from '../processing/processor';
import { VectorStore } from '../rag/vectorStore';
import { NotesService } from './notes';
import { EmbeddingService } from '../rag/embeddings';
import { AIService } from '../ai/service';
import { DocumentSummaryService } from './documentSummary';
import {
  Document,
  DocumentPage,
  DocumentChunk,
  DocumentCardData,
  DocumentProcessingStatus,
  DocumentFolder,
  DocumentCategory,
  DocumentVersion,
  DocumentStorageStats,
  PaginatedResult,
} from '../models/types';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export interface ListDocumentsParams {
  search?: string;
  filter?: 'all' | 'pdf' | 'document' | 'recent' | 'favorites' | 'processing' | 'ready' | 'failed';
  sort?: 'recent_upload' | 'recent_open' | 'name' | 'size' | 'status';
  category?: string;
  folder_id?: string;
  file_type?: string;
  page?: number;
  limit?: number;
}

export interface UploadDocumentInput {
  title?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  contentBase64?: string;
  category?: DocumentCategory | string;
  folderId?: string;
  courseId?: string;
  courseTitle?: string;
  subject?: string;
  semester?: number;
  academicYear?: string;
  topic?: string;
  collectionId?: string;
  visibility?: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  tags?: string[];
  description?: string;
  notes?: string;
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

    // 1. File size check (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (sizeBytes > MAX_SIZE) {
      throw new ValidationError('File size exceeds the 50MB maximum limit');
    }

    // 2. Validate extension across all supported academic formats
    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const allowedExts = [
      'pdf',
      'docx',
      'doc',
      'pptx',
      'ppt',
      'xlsx',
      'xls',
      'txt',
      'md',
      'csv',
      'tsv',
      'png',
      'jpg',
      'jpeg',
      'webp',
      'py',
      'java',
      'cpp',
      'c',
      'h',
      'hpp',
      'ts',
      'js',
      'jsx',
      'tsx',
      'sql',
      'json',
    ];
    if (!allowedExts.includes(ext)) {
      throw new ValidationError(
        `Unsupported document format (.${ext}). Supported formats: PDF, DOCX, PPTX, XLSX, TXT, MD, CSV, PNG, JPG, WEBP, and Source Code (.py, .java, .cpp, .ts, .sql, etc.)`
      );
    }

    // 3. Prevent duplicate uploads using content hash & metadata
    const contentHash = crypto
      .createHash('sha256')
      .update(contentBase64 || `${originalName}_${sizeBytes}`)
      .digest('hex');

    const existingDocs = await db.getStudentDocuments(studentId, { limit: 1000 });
    const duplicate = existingDocs.items.find(
      (d) =>
        (d.metadata?.content_hash && d.metadata.content_hash === contentHash) ||
        (d.original_filename === originalName && d.file_size === sizeBytes && d.status !== 'FAILED')
    );

    if (duplicate) {
      logger.info(
        `Duplicate document detected for student ${studentId}: ${originalName} matches existing document ${duplicate.id}`
      );
      // If folderId or collectionId provided, ensure it is assigned
      if (input.folderId) {
        await db.moveDocumentToFolder(duplicate.id, input.folderId, studentId).catch(() => null);
      }
      if (input.collectionId) {
        try {
          const col = await db.getKnowledgeCollectionById(input.collectionId, studentId);
          if (col && !col.document_ids.includes(duplicate.id)) {
            col.document_ids.push(duplicate.id);
            await db.saveKnowledgeCollection(col);
          }
        } catch {
          // ignore
        }
      }
      const existingDoc = await db.getDocumentById(duplicate.id, studentId);
      return existingDoc || (duplicate as any);
    }

    // 4. Store file blob securely via StorageService
    const storageRecord = await StorageService.upload({
      studentId,
      originalName,
      mimeType,
      sizeBytes,
      category: 'document',
      dataBuffer: contentBase64,
    });

    const title = input.title?.trim() || originalName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

    // 5. Create Document record in database with rich academic metadata
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
      category: input.category || 'Other Documents',
      folder_id: input.folderId,
      metadata: {
        course_id: input.courseId,
        course_title: input.courseTitle,
        subject: input.subject,
        semester: input.semester,
        academic_year: input.academicYear,
        topic: input.topic,
        category: input.category || 'Other Documents',
        folder_id: input.folderId,
        collection_id: input.collectionId,
        visibility: input.visibility || 'PRIVATE',
        tags: input.tags || [],
        notes: input.notes,
        content_hash: contentHash,
        current_version: 1,
        versions: [],
      },
      is_favorite: false,
    });

    // If collectionId specified, link in collection
    if (input.collectionId) {
      try {
        const col = await db.getKnowledgeCollectionById(input.collectionId, studentId);
        if (col && !col.document_ids.includes(document.id)) {
          col.document_ids.push(document.id);
          col.updated_at = new Date().toISOString();
          await db.saveKnowledgeCollection(col);
        }
      } catch {
        // ignore
      }
    }

    logger.info(`Document created with ID ${document.id} for student ${studentId}`, {
      userId: studentId,
      context: { documentId: document.id, title },
    });

    // 6. Asynchronously trigger processing job
    DocumentProcessingService.processDocumentAsync(document.id, studentId);

    return document;
  }

  /**
   * Replaces a document with a newer version while preserving history.
   */
  public static async uploadNewVersion(
    documentId: string,
    studentId: string,
    input: {
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      contentBase64?: string;
      changeNotes?: string;
    },
    role: string = 'STUDENT'
  ): Promise<Document> {
    const existing = await this.getDocument(documentId, studentId, role);

    // 1. Upload new blob to StorageService
    const newStorageRecord = await StorageService.upload({
      studentId,
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      category: 'document',
      dataBuffer: input.contentBase64,
    });

    const newHash = crypto
      .createHash('sha256')
      .update(input.contentBase64 || `${input.originalName}_${input.sizeBytes}`)
      .digest('hex');

    const currentVersion = Number(existing.metadata?.current_version || 1);
    const prevVersions = Array.isArray(existing.metadata?.versions)
      ? [...existing.metadata.versions]
      : [];

    // Push previous version snapshot
    prevVersions.push({
      version_number: currentVersion,
      storage_key: existing.storage_key,
      file_hash: existing.metadata?.content_hash || '',
      file_size: existing.file_size,
      original_filename: existing.original_filename,
      mime_type: existing.mime_type,
      uploaded_at: existing.updated_at || existing.created_at,
      change_notes: existing.metadata?.last_change_notes || `Initial version ${currentVersion}`,
      uploader_student_id: studentId,
    });

    const newExt = input.originalName.split('.').pop()?.toLowerCase() || existing.file_extension;

    // Invalidate existing vectors for re-indexing
    VectorStore.deleteDocumentVectors(documentId, studentId);

    // Update document record
    const updated = await db.updateDocument(documentId, studentId, {
      original_filename: input.originalName,
      mime_type: input.mimeType,
      file_extension: newExt,
      file_size: input.sizeBytes,
      storage_key: newStorageRecord.id,
      status: 'QUEUED',
      current_version: currentVersion + 1,
      version_count: prevVersions.length + 1,
      processing_error: undefined,
      metadata: {
        ...(existing.metadata || {}),
        content_hash: newHash,
        current_version: currentVersion + 1,
        versions: prevVersions,
        last_change_notes: input.changeNotes || `Version ${currentVersion + 1}`,
        last_version_updated_at: new Date().toISOString(),
      },
    });

    // Re-run background processing pipeline
    DocumentProcessingService.processDocumentAsync(documentId, studentId);

    logger.info(`Uploaded version ${currentVersion + 1} for document ${documentId}`, {
      userId: studentId,
      context: { documentId, newVersion: currentVersion + 1 },
    });

    return updated;
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

    if (note && !(note as any).source_document_id) {
      (note as any).source_document_id = doc.id;
    }

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

  /**
   * Semantically queries student documents using Gemini and VectorStore,
   * returning matching documents, relevance scores, and grounded synthesis.
   */
  public static async aiFetchDocuments(
    studentId: string,
    query: string
  ): Promise<{
    query: string;
    answer: string;
    matching_documents: Array<DocumentCardData & { relevance_score: number; match_snippet: string }>;
    citations: Array<{ document_id: string; document_title: string; page_number: number; quoted_text: string }>;
  }> {
    const docsResult = await db.getStudentDocuments(studentId, { limit: 100 });
    const allDocs = docsResult.items;

    if (allDocs.length === 0) {
      return {
        query,
        answer: "You haven't uploaded any study documents yet. Upload a PDF, Word document, or lecture notes to get started.",
        matching_documents: [],
        citations: [],
      };
    }

    const docMap = new Map<string, DocumentCardData>();
    for (const d of allDocs) {
      docMap.set(d.id, d);
    }

    // 1. Semantic vector search across all student's indexed chunks
    const queryVector = await EmbeddingService.embed(query);
    const searchResults = await VectorStore.search(queryVector, {
      studentId,
      topK: 8,
      minScore: 0.1,
    });

    const docScoreMap = new Map<string, { score: number; snippet: string; pages: number[] }>();

    for (const res of searchResults) {
      const existing = docScoreMap.get(res.documentId);
      if (!existing || res.score > existing.score) {
        docScoreMap.set(res.documentId, {
          score: res.score,
          snippet: res.content.slice(0, 180),
          pages: existing ? Array.from(new Set([...existing.pages, res.pageNumber])) : [res.pageNumber],
        });
      } else {
        existing.pages = Array.from(new Set([...existing.pages, res.pageNumber]));
      }
    }

    // Keyword fallback / boost
    const qLower = query.toLowerCase();
    for (const d of allDocs) {
      const inTitle = d.title.toLowerCase().includes(qLower);
      const inDesc = (d.description || '').toLowerCase().includes(qLower);
      if ((inTitle || inDesc) && !docScoreMap.has(d.id)) {
        docScoreMap.set(d.id, {
          score: inTitle ? 0.85 : 0.65,
          snippet: d.description || d.title,
          pages: [1],
        });
      }
    }

    // Order matching documents
    const matchingDocs: Array<DocumentCardData & { relevance_score: number; match_snippet: string }> = [];
    for (const [docId, meta] of docScoreMap.entries()) {
      const doc = docMap.get(docId);
      if (doc) {
        matchingDocs.push({
          ...doc,
          relevance_score: Math.round(meta.score * 100),
          match_snippet: meta.snippet,
        });
      }
    }
    matchingDocs.sort((a, b) => b.relevance_score - a.relevance_score);

    // 2. Synthesize with Gemini
    const citations: Array<{ document_id: string; document_title: string; page_number: number; quoted_text: string }> = [];
    const contextSnippets: string[] = [];

    for (const res of searchResults.slice(0, 5)) {
      const d = docMap.get(res.documentId);
      if (d) {
        contextSnippets.push(`[Document: "${d.title}", Page ${res.pageNumber}]: ${res.content.slice(0, 300)}`);
        citations.push({
          document_id: d.id,
          document_title: d.title,
          page_number: res.pageNumber,
          quoted_text: res.content.slice(0, 120),
        });
      }
    }

    let answer = '';
    if (contextSnippets.length > 0) {
      try {
        const aiRes = await AIService.generate([
          {
            role: 'system',
            content: 'You are an academic learning assistant. Answer the student inquiry using ONLY the provided verified document excerpts. Mention which document and page discusses each point. Keep the response concise, authoritative, and helpful.',
          },
          {
            role: 'user',
            content: `Student Inquiry: "${query}"\n\nVerified Document Excerpts:\n${contextSnippets.join('\n\n')}`,
          },
        ]);
        answer = aiRes.text.trim();
      } catch (err) {
        answer = `Based on your uploaded documents, relevant information was found in **${matchingDocs[0]?.title || 'your study materials'}**:\n\n${matchingDocs[0]?.match_snippet || 'Review the matched pages.'}`;
      }
    } else if (matchingDocs.length > 0) {
      answer = `Found ${matchingDocs.length} matching document(s) for "${query}": **${matchingDocs.map((d) => d.title).join(', ')}**.`;
    } else {
      answer = `No direct matches found for "${query}" in your uploaded study documents. Try a broader search term or upload the relevant syllabus material.`;
    }

    return {
      query,
      answer,
      matching_documents: matchingDocs,
      citations,
    };
  }

  /**
   * ----------------- Folder Management -----------------
   */
  public static async listFolders(studentId: string): Promise<DocumentFolder[]> {
    return db.getStudentFolders(studentId);
  }

  public static async getFolder(folderId: string, studentId: string): Promise<DocumentFolder> {
    const folder = await db.getFolderById(folderId, studentId);
    if (!folder) {
      throw new NotFoundError(`Folder '${folderId}' not found`);
    }
    return folder;
  }

  public static async createFolder(
    studentId: string,
    data: {
      name: string;
      description?: string;
      parent_folder_id?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<DocumentFolder> {
    return db.createFolder(studentId, data);
  }

  public static async updateFolder(
    folderId: string,
    studentId: string,
    updates: Partial<DocumentFolder>
  ): Promise<DocumentFolder> {
    return db.updateFolder(folderId, studentId, updates);
  }

  public static async deleteFolder(
    folderId: string,
    studentId: string,
    actionOnDocuments: 'unfile' | 'delete' = 'unfile'
  ): Promise<boolean> {
    return db.deleteFolder(folderId, studentId, actionOnDocuments);
  }

  public static async moveDocument(
    documentId: string,
    folderId: string | null,
    studentId: string
  ): Promise<Document> {
    return db.moveDocumentToFolder(documentId, folderId, studentId);
  }

  /**
   * ----------------- Version Management -----------------
   */
  public static async getDocumentVersions(
    documentId: string,
    studentId: string
  ): Promise<DocumentVersion[]> {
    return db.getDocumentVersions(documentId, studentId);
  }

  public static async restoreVersion(
    documentId: string,
    versionNumber: number,
    studentId: string
  ): Promise<Document> {
    const doc = await db.restoreDocumentVersion(documentId, versionNumber, studentId);
    // Invalidate existing vectors and re-process restored version
    VectorStore.deleteDocumentVectors(documentId, studentId);
    DocumentProcessingService.processDocumentAsync(documentId, studentId);
    return doc;
  }

  /**
   * ----------------- Storage Quota & Real Stats -----------------
   */
  public static async getStorageStats(studentId: string): Promise<DocumentStorageStats> {
    return db.getStorageStats(studentId);
  }

  /**
   * ----------------- Knowledge Base & RAG Indexing -----------------
   */
  public static async indexDocumentInKnowledgeBase(
    documentId: string,
    studentId: string
  ): Promise<{ success: boolean; status: string; chunks_indexed: number }> {
    const doc = await this.getDocument(documentId, studentId);

    // Get pages
    const pages = await db.getDocumentPages(documentId, studentId);
    if (pages.length === 0) {
      // Trigger processing pipeline
      await DocumentProcessingService.processDocumentAsync(documentId, studentId);
    }

    const chunks = await db.getDocumentChunks(documentId, studentId);

    // Ensure chunks are embedded in VectorStore
    for (const chunk of chunks) {
      try {
        const embedding = await EmbeddingService.embed(chunk.content);
        VectorStore.addVector({
          id: chunk.id,
          vector: embedding,
          documentId: doc.id,
          pageNumber: chunk.metadata?.page_number || 1,
          content: chunk.content,
          studentId,
        });
      } catch {
        // Continue indexing
      }
    }

    await db.updateDocument(documentId, studentId, {
      status: 'READY',
      content_indexed: true,
      metadata: {
        ...(doc.metadata || {}),
        content_indexed: true,
        indexed_at: new Date().toISOString(),
      },
    });

    logger.info(`Document ${documentId} indexed into Knowledge Base for student ${studentId}`, {
      userId: studentId,
      context: { documentId, chunksCount: chunks.length },
    });

    return {
      success: true,
      indexed: true,
      status: 'READY',
      chunks_indexed: chunks.length,
      message: 'Document successfully indexed into Knowledge Base',
    };
  }

  /**
   * ----------------- Document Metadata Updating -----------------
   */
  public static async updateDocument(
    documentId: string,
    studentId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    return db.updateDocument(documentId, studentId, updates);
  }

  /**
   * ----------------- Document Summary Helper -----------------
   */
  public static async getSummary(
    documentId: string,
    studentId: string,
    level: string = 'standard'
  ) {
    return DocumentSummaryService.getOrGenerateSummary(documentId, studentId, {
      summaryLevel: level as any,
    });
  }

  /**
   * ----------------- Lab Assistant Integration -----------------
   */
  public static async linkDocumentToLab(
    documentId: string,
    arg2: string,
    arg3: string,
    arg4?: string
  ): Promise<Document> {
    let studentId: string;
    let labId: string;
    let labTitle: string | undefined;

    if (arg2.startsWith('std_')) {
      studentId = arg2;
      labId = arg3;
      labTitle = arg4;
    } else {
      labId = arg2;
      studentId = arg3;
      labTitle = arg4;
    }

    const doc = await this.getDocument(documentId, studentId);

    const updated = await db.updateDocument(documentId, studentId, {
      metadata: {
        ...(doc.metadata || {}),
        lab_experiment_id: labId,
        associated_lab_id: labId,
        associated_lab_title: labTitle,
        linked_to_lab_at: new Date().toISOString(),
      },
    });

    logger.info(`Linked document ${documentId} to lab ${labId} for student ${studentId}`);
    return updated;
  }
}

