import { db } from '../db/database';
import { StorageService } from '../storage/storage';
import { DocumentParserRegistry } from '../parsers';
import { DocumentChunkingService } from './chunker';
import { VectorStore } from '../rag/vectorStore';
import { EmbeddingService } from '../rag/embeddings';
import { DocumentProcessingStatus } from '../models/types';
import { logger } from '../core/logging';
import { NotFoundError, ValidationError } from '../core/exceptions';

/** File types whose text can be recognised in the browser (scanned PDFs and photos of pages). */
export const OCR_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
export const OCR_MAX_PAGES = 200;
export const OCR_MAX_PAGE_CHARS = 30_000;

export class DocumentProcessingService {
  /**
   * Enqueues and initiates asynchronous background processing of an uploaded document.
   */
  public static async processDocumentAsync(documentId: string, studentId: string): Promise<void> {
    // On serverless hosting (Vercel) the function is frozen as soon as the response is sent, so
    // background work may never finish and its results would not be saved with the request.
    // There the upload request waits for processing instead (callers await this method).
    if (process.env.VERCEL || process.env.PROCESS_DOCUMENTS_INLINE === 'true') {
      try {
        await this.runProcessingPipeline(documentId, studentId);
      } catch (err: any) {
        logger.error(`Document processing failed for ${documentId}`, err);
      }
      return;
    }
    // Long-running server: non-blocking trigger
    setImmediate(async () => {
      try {
        await this.runProcessingPipeline(documentId, studentId);
      } catch (err: any) {
        logger.error(`Background document processing failed for ${documentId}`, err);
      }
    });
  }

  /**
   * Executes the full document parsing, chunking, embedding, and vector indexing pipeline.
   */
  public static async runProcessingPipeline(documentId: string, studentId: string): Promise<void> {
    const document = await db.getDocumentById(documentId, studentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    try {
      logger.info(`Starting processing pipeline for document: ${document.title} (${documentId})`, {
        userId: studentId,
        context: { documentId, filename: document.original_filename },
      });

      // 1. Stage: PROCESSING
      await this.updateStatus(documentId, studentId, 'PROCESSING');

      // 2. Retrieve file blob from StorageService
      const { data } = await StorageService.download(document.storage_key, studentId, 'STUDENT');

      // 3. Stage: EXTRACTING
      await this.updateStatus(documentId, studentId, 'EXTRACTING');
      const parsed = await DocumentParserRegistry.parse(
        data,
        document.mime_type,
        document.file_extension,
        { filename: document.original_filename }
      );

      // A scan has no text of its own. If the student already had its text recognised (OCR) in their
      // browser, those pages are kept rather than replaced by empty ones.
      const previous = (document as any).metadata?.text_source === 'ocr' && !parsed.pages.some((p) => p.text.trim()) ? await db.getDocumentPages(documentId, studentId) : [];
      const pagesToSave = previous.length
        ? previous.map((p) => ({ page_number: p.page_number, text: p.text, metadata: p.metadata }))
        : parsed.pages.map((p) => ({
            page_number: p.pageNumber,
            text: p.text,
            metadata: {
              headings: p.headings || [],
              ...p.metadata,
            },
          }));
      const { pages: createdPages, chunks } = await this.indexPages(documentId, studentId, pagesToSave, {
        page_count: parsed.pageCount,
        author: parsed.author || document.author,
      });

      // 6. Stage: READY
      // READY means processing finished; content_indexed says whether any text was found to search.
      // Images and scanned PDFs have no text of their own; the student can have it recognised (OCR) in
      // their browser, which is saved through indexRecognisedText.
      await db.updateDocument(documentId, studentId, {
        status: 'READY',
        processing_completed_at: new Date().toISOString(),
        processing_error: undefined,
        content_indexed: chunks.length > 0,
        metadata: { ...((await db.getDocumentById(documentId, studentId))?.metadata || {}), indexed_chunks: chunks.length, indexed_at: new Date().toISOString() },
      } as any);

      // Add student notification
      await db.createNotification({
        student_id: studentId,
        title: 'Document Ready for AI Learning',
        message: chunks.length > 0
          ? `"${document.title}" (${createdPages.length} pages) has been parsed and indexed. You can now read, search, and chat with AI.`
          : `"${document.title}" was stored, but no text could be extracted from it, so it cannot be searched or used for answers.`,
        type: 'ai',
        link: `/documents/${documentId}`,
      });

      logger.info(`Document ${documentId} processed successfully and marked READY`, {
        userId: studentId,
        context: { pages: createdPages.length, chunks: chunks.length },
      });
    } catch (err: any) {
      const sanitizedError = err.message || 'An error occurred during document parsing and vector indexing.';
      logger.error(`Document processing failed for ${documentId}: ${sanitizedError}`, err);

      await db.updateDocument(documentId, studentId, {
        status: 'FAILED',
        processing_error: sanitizedError,
      });

      await db.createNotification({
        student_id: studentId,
        title: 'Document Processing Failed',
        message: `Failed to process "${document.title}". You can retry processing from the document action menu.`,
        type: 'warning',
        link: `/documents`,
      });
    }
  }

  /** Saves pages, then splits them into chunks and indexes them for search (replacing older vectors). */
  private static async indexPages(
    documentId: string,
    studentId: string,
    pages: Array<{ page_number: number; text: string; metadata?: any }>,
    extra: { page_count?: number; author?: string } = {}
  ) {
    const createdPages = await db.createDocumentPages(documentId, studentId, pages);
    await db.updateDocument(documentId, studentId, {
      page_count: extra.page_count || createdPages.length,
      ...(extra.author ? { author: extra.author } : {}),
    });

    await this.updateStatus(documentId, studentId, 'CHUNKING');
    const chunks = DocumentChunkingService.chunkPages(documentId, createdPages);
    await db.createDocumentChunks(documentId, studentId, chunks);

    await this.updateStatus(documentId, studentId, 'EMBEDDING');
    // Reprocessing replaces the document's vectors instead of adding stale copies next to new ones.
    VectorStore.deleteDocumentVectors(documentId, studentId);
    for (const chunk of chunks) {
      const vector = await EmbeddingService.embed(chunk.content);
      await VectorStore.addChunk(chunk, studentId, vector);
    }
    return { pages: createdPages, chunks };
  }

  /**
   * Stores text that the student's browser recognised (OCR) in a scanned PDF or an image, and indexes it
   * so the document can be searched, cited and used for answers. Only for files with no text of their own:
   * text that came from the file itself is never replaced. Each page keeps its OCR confidence.
   */
  public static async indexRecognisedText(documentId: string, studentId: string, body: any) {
    const document = await db.getDocumentById(documentId, studentId);
    if (!document) throw new NotFoundError('Document not found');
    const ext = String(document.file_extension || '').toLowerCase().replace(/^\./, '');
    if (!OCR_EXTENSIONS.includes(ext)) throw new ValidationError('Text recognition is only for scanned PDFs and images.');
    const meta: any = (document as any).metadata || {};
    if (document.content_indexed && meta.text_source !== 'ocr') {
      throw new ValidationError('This document already has text of its own, so recognised text is not needed.');
    }
    if (['QUEUED', 'PROCESSING', 'EXTRACTING', 'CHUNKING', 'EMBEDDING'].includes(String(document.status))) {
      throw new ValidationError('The document is still being processed. Try again when it is ready.');
    }
    const raw = Array.isArray(body?.pages) ? body.pages : null;
    if (!raw || !raw.length) throw new ValidationError('Send the recognised pages.');
    if (raw.length > OCR_MAX_PAGES) throw new ValidationError(`Up to ${OCR_MAX_PAGES} pages can be recognised.`);
    const seen = new Set<number>();
    const pages = raw.map((p: any) => {
      const n = Number(p?.page_number);
      if (!Number.isInteger(n) || n < 1 || n > 10_000 || seen.has(n)) throw new ValidationError('Each page needs its own page number.');
      seen.add(n);
      const text = String(p?.text ?? '').replace(/\u0000/g, '').slice(0, OCR_MAX_PAGE_CHARS);
      const confidence = Math.max(0, Math.min(100, Math.round(Number(p?.confidence) || 0)));
      return {
        page_number: n,
        text,
        metadata: { headings: [], word_count: text.split(/\s+/).filter(Boolean).length, text_source: 'ocr', ocr_confidence: confidence },
      };
    });
    pages.sort((a: any, b: any) => a.page_number - b.page_number);
    const withText = pages.filter((p: any) => p.text.trim());
    if (!withText.length) throw new ValidationError('No text was recognised, so there is nothing to save.');
    const confidence = Math.round(withText.reduce((s: number, p: any) => s + p.metadata.ocr_confidence, 0) / withText.length);

    await this.updateStatus(documentId, studentId, 'PROCESSING');
    const { pages: created, chunks } = await this.indexPages(documentId, studentId, pages, {
      page_count: Math.max(Number(body?.page_count) || 0, document.page_count || 0, pages[pages.length - 1].page_number),
    });
    const now = new Date().toISOString();
    await db.updateDocument(documentId, studentId, {
      status: 'READY',
      processing_completed_at: now,
      processing_error: undefined,
      content_indexed: chunks.length > 0,
      metadata: {
        ...meta,
        text_source: 'ocr',
        ocr_engine: 'Tesseract (in the browser)',
        ocr_confidence: confidence,
        ocr_pages: created.length,
        ocr_at: now,
        indexed_chunks: chunks.length,
        indexed_at: now,
      },
    } as any);
    logger.info(`Document ${documentId}: recognised text saved`, { userId: studentId, context: { pages: created.length, chunks: chunks.length, confidence } });
    return db.getDocumentById(documentId, studentId);
  }

  private static async updateStatus(
    documentId: string,
    studentId: string,
    status: DocumentProcessingStatus
  ): Promise<void> {
    await db.updateDocument(documentId, studentId, {
      status,
      processing_started_at: status === 'PROCESSING' ? new Date().toISOString() : undefined,
    });
  }
}
