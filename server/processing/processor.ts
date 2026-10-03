import { db } from '../db/database';
import { StorageService } from '../storage/storage';
import { DocumentParserRegistry } from '../parsers';
import { DocumentChunkingService } from './chunker';
import { VectorStore } from '../rag/vectorStore';
import { EmbeddingService } from '../rag/embeddings';
import { DocumentProcessingStatus } from '../models/types';
import { logger } from '../core/logging';

export class DocumentProcessingService {
  /**
   * Enqueues and initiates asynchronous background processing of an uploaded document.
   */
  public static async processDocumentAsync(documentId: string, studentId: string): Promise<void> {
    // Non-blocking trigger
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

      // Save extracted pages to database
      const createdPages = await db.createDocumentPages(
        documentId,
        studentId,
        parsed.pages.map((p) => ({
          page_number: p.pageNumber,
          text: p.text,
          metadata: {
            headings: p.headings || [],
            ...p.metadata,
          },
        }))
      );

      // Update document page count and author if discovered
      await db.updateDocument(documentId, studentId, {
        page_count: parsed.pageCount || createdPages.length,
        author: parsed.author || document.author,
      });

      // 4. Stage: CHUNKING
      await this.updateStatus(documentId, studentId, 'CHUNKING');
      const chunks = DocumentChunkingService.chunkPages(documentId, createdPages);
      await db.createDocumentChunks(documentId, studentId, chunks);

      // 5. Stage: EMBEDDING
      await this.updateStatus(documentId, studentId, 'EMBEDDING');
      for (const chunk of chunks) {
        const vector = await EmbeddingService.embed(chunk.content);
        await VectorStore.addChunk(chunk, studentId, vector);
      }

      // 6. Stage: READY
      await db.updateDocument(documentId, studentId, {
        status: 'READY',
        processing_completed_at: new Date().toISOString(),
        processing_error: undefined,
      });

      // Add student notification
      await db.createNotification({
        student_id: studentId,
        title: 'Document Ready for AI Learning',
        message: `"${document.title}" (${createdPages.length} pages) has been parsed and indexed. You can now read, search, and chat with AI.`,
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
