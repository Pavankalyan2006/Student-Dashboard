import { DocumentChunk, DocumentPage } from '../models/types';

export interface ChunkOptions {
  maxCharacters?: number;
  overlapCharacters?: number;
  maxTokens?: number;
  tokenOverlap?: number;
}

export class DocumentChunkingService {
  /**
   * Splits document pages into overlapping, page-preserving chunks for vector search.
   */
  public static chunkPages(
    documentId: string,
    pages: Array<Pick<DocumentPage, 'page_number' | 'text'> & { id?: string; metadata?: any }>,
    options: ChunkOptions = {}
  ): DocumentChunk[] {
    const maxChars = options.maxCharacters || (options.maxTokens ? options.maxTokens * 4 : 1200);
    const overlapChars = options.overlapCharacters || (options.tokenOverlap ? options.tokenOverlap * 4 : 150);
    const chunks: DocumentChunk[] = [];
    let globalChunkIndex = 0;

    for (const page of pages) {
      const pageText = page.text.trim();
      if (!pageText) continue;
      const pageId = page.id || `page_${documentId}_${page.page_number}`;

      // Extract primary section / heading for the page
      const currentHeading = page.metadata?.headings?.[0] || `Page ${page.page_number}`;

      // If page fits comfortably within a single chunk
      if (pageText.length <= maxChars) {
        chunks.push({
          id: `chk_${documentId}_p${page.page_number}_c0`,
          document_id: documentId,
          page_id: pageId,
          chunk_index: globalChunkIndex++,
          content: pageText,
          token_count: Math.ceil(pageText.length / 4),
          metadata: {
            document_id: documentId,
            page_number: page.page_number,
            chunk_index: globalChunkIndex - 1,
            section: currentHeading,
            heading: currentHeading,
            source_type: 'document',
          },
          created_at: new Date().toISOString(),
        });
        continue;
      }

      // Split page text into paragraphs or sentences
      const paragraphs = pageText.split(/\n\s*\n/);
      let currentChunkText = '';
      let subIndex = 0;

      for (const para of paragraphs) {
        if (currentChunkText.length + para.length > maxChars && currentChunkText.trim().length > 0) {
          chunks.push({
            id: `chk_${documentId}_p${page.page_number}_c${subIndex++}`,
            document_id: documentId,
            page_id: pageId,
            chunk_index: globalChunkIndex++,
            content: currentChunkText.trim(),
            token_count: Math.ceil(currentChunkText.trim().length / 4),
            metadata: {
              document_id: documentId,
              page_number: page.page_number,
              chunk_index: globalChunkIndex - 1,
              section: currentHeading,
              heading: currentHeading,
              source_type: 'document',
            },
            created_at: new Date().toISOString(),
          });

          // Carry over overlap from the end of currentChunkText
          const overlap = currentChunkText.slice(-overlapChars);
          currentChunkText = overlap + '\n' + para;
        } else {
          currentChunkText += (currentChunkText ? '\n\n' : '') + para;
        }
      }

      if (currentChunkText.trim().length > 0) {
        chunks.push({
          id: `chk_${documentId}_p${page.page_number}_c${subIndex}`,
          document_id: documentId,
          page_id: pageId,
          chunk_index: globalChunkIndex++,
          content: currentChunkText.trim(),
          token_count: Math.ceil(currentChunkText.trim().length / 4),
          metadata: {
            document_id: documentId,
            page_number: page.page_number,
            chunk_index: globalChunkIndex - 1,
            section: currentHeading,
            heading: currentHeading,
            source_type: 'document',
          },
          created_at: new Date().toISOString(),
        });
      }
    }

    return chunks;
  }
}
