import { DocumentChunk } from '../models/types';
import { EmbeddingService } from './embeddings';

export interface VectorRecord {
  chunkId: string;
  documentId: string;
  studentId: string;
  pageNumber: number;
  content: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface VectorSearchResult {
  chunkId: string;
  documentId: string;
  pageNumber: number;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export class VectorStore {
  // Map of chunkId -> VectorRecord
  private static store: Map<string, VectorRecord> = new Map();

  /**
   * Adds or updates a vector record in the store.
   */
  public static async addChunk(
    chunk: DocumentChunk,
    studentId: string,
    vector?: number[]
  ): Promise<void> {
    const chunkVector = vector || (await EmbeddingService.embed(chunk.content));

    this.store.set(chunk.id, {
      chunkId: chunk.id,
      documentId: chunk.document_id,
      studentId,
      pageNumber: chunk.metadata.page_number,
      content: chunk.content,
      vector: chunkVector,
      metadata: chunk.metadata,
    });
  }

  /**
   * Batch adds chunks to the store.
   */
  public static async addChunks(
    chunks: DocumentChunk[],
    studentId: string
  ): Promise<void> {
    for (const chunk of chunks) {
      await this.addChunk(chunk, studentId);
    }
  }

  /**
   * Searches for top-k chunks similar to the query vector.
   * Supports filtering by documentId, studentId, and page numbers.
   */
  public static async search(
    queryVector: number[],
    options: {
      studentId: string;
      documentId?: string;
      documentIds?: string[];
      pageNumbers?: number[];
      topK?: number;
      minScore?: number;
    }
  ): Promise<VectorSearchResult[]> {
    const topK = options.topK || 5;
    const minScore = options.minScore || 0.1;
    const results: VectorSearchResult[] = [];

    for (const record of this.store.values()) {
      // 1. Mandatory Student isolation check
      if (record.studentId !== options.studentId) {
        continue;
      }

      // 2. Document filter
      if (options.documentId && record.documentId !== options.documentId) {
        continue;
      }
      if (options.documentIds && options.documentIds.length > 0 && !options.documentIds.includes(record.documentId)) {
        continue;
      }

      // 3. Page filter (e.g. current page or selected pages)
      if (options.pageNumbers && options.pageNumbers.length > 0) {
        if (!options.pageNumbers.includes(record.pageNumber)) {
          continue;
        }
      }

      // 4. Compute cosine similarity
      const score = EmbeddingService.cosineSimilarity(queryVector, record.vector);
      if (score >= minScore) {
        results.push({
          chunkId: record.chunkId,
          documentId: record.documentId,
          pageNumber: record.pageNumber,
          content: record.content,
          score,
          metadata: record.metadata,
        });
      }
    }

    // Sort descending by similarity score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Adds an individual vector record directly into the store.
   */
  public static addVector(data: {
    id: string;
    vector: number[];
    documentId: string;
    pageNumber: number;
    content: string;
    studentId: string;
    metadata?: Record<string, any>;
  }): void {
    this.store.set(data.id, {
      chunkId: data.id,
      documentId: data.documentId,
      studentId: data.studentId,
      pageNumber: data.pageNumber,
      content: data.content,
      vector: data.vector,
      metadata: data.metadata || {},
    });
  }

  /**
   * Retrieves all chunk records associated with a document.
   */
  public static getChunksByDocument(documentId: string): VectorRecord[] {
    const results: VectorRecord[] = [];
    for (const record of this.store.values()) {
      if (record.documentId === documentId) {
        results.push(record);
      }
    }
    return results;
  }

  /**
   * Deletes all vector records for a specific document.
   */
  public static deleteDocumentVectors(documentId: string, studentId: string): void {
    for (const [key, record] of this.store.entries()) {
      if (record.documentId === documentId && record.studentId === studentId) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clears the entire store (for testing).
   */
  public static clear(): void {
    this.store.clear();
  }

  /**
   * Returns count of indexed chunks.
   */
  public static size(): number {
    return this.store.size;
  }
}

