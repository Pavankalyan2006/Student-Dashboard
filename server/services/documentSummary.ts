import { parseLooseJson } from '../ai/modelOutput';
import { db } from '../db/database';
import { AIService } from '../ai/service';
import { DocumentSummary, DocumentSummaryLevel } from '../models/types';
import { NotFoundError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';

export interface GenerateSummaryOptions {
  summaryLevel?: DocumentSummaryLevel;
  pageRange?: { startPage: number; endPage: number };
  forceRegenerate?: boolean;
}

const EXTRACTIVE_TITLE_SUFFIX = 'Extractive Summary (AI unavailable)';

export class DocumentSummaryService {
  /**
   * Generates or retrieves a cached structured summary of a document or specific page range.
   */
  public static async getOrGenerateSummary(
    documentId: string,
    studentId: string,
    options: GenerateSummaryOptions = {}
  ): Promise<DocumentSummary> {
    const document = await db.getDocumentById(documentId, studentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }

    const summaryLevel: DocumentSummaryLevel = options.summaryLevel || 'standard';
    const pageRange = options.pageRange;

    // 1. Check cache if not forcing regeneration
    if (!options.forceRegenerate) {
      const cached = await db.getDocumentSummary(documentId, studentId, summaryLevel, pageRange);
      if (cached && !cached.title.endsWith(EXTRACTIVE_TITLE_SUFFIX)) {
        logger.info(`Returning cached summary for document ${documentId}`, {
          userId: studentId,
          context: { level: summaryLevel },
        });
        return cached;
      }
    }

    // 2. Fetch pages to summarize
    let pages = await db.getDocumentPages(documentId, studentId);
    if (pageRange) {
      pages = pages.filter(
        (p) => p.page_number >= pageRange.startPage && p.page_number <= pageRange.endPage
      );
    }

    if (pages.length === 0) {
      const doc = await db.getDocumentById(documentId, studentId);
      if (doc) {
        pages = [
          {
            id: `page_${documentId}_1`,
            document_id: documentId,
            page_number: 1,
            text: `${doc.title}\n\n${doc.description || ''}`,
            metadata: { word_count: 20, has_tables: false },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      } else {
        throw new NotFoundError('No pages found to summarize in the specified range');
      }
    }

    // 3. Hierarchical summarization if document has many pages
    let combinedContent = '';
    if (pages.length > 8) {
      // Chunk pages in groups of 4 to avoid exceeding context window
      const sectionSummaries: string[] = [];
      for (let i = 0; i < pages.length; i += 4) {
        const slice = pages.slice(i, i + 4);
        const sliceText = slice.map((p) => `[Page ${p.page_number}]\n${p.text}`).join('\n\n');
        sectionSummaries.push(sliceText.slice(0, 3000));
      }
      combinedContent = sectionSummaries.join('\n\n--- SECTION BREAK ---\n\n');
    } else {
      combinedContent = pages.map((p) => `[Page ${p.page_number}]\n${p.text}`).join('\n\n');
    }

    // 4. Construct prompt based on summary level
    const promptInstructions = `You are a high-level academic B.Tech study assistant.
Generate an authoritative, structured curriculum summary based STRICTLY on the provided document excerpts.

SUMMARY LEVEL: ${summaryLevel.toUpperCase()}
DOCUMENT TITLE: ${document.title}
PAGE RANGE: ${pageRange ? `Pages ${pageRange.startPage} to ${pageRange.endPage}` : `All ${pages.length} pages`}

DOCUMENT EXCERPTS:
${combinedContent}

Return valid JSON conforming to this schema:
{
  "title": "${document.title} - ${summaryLevel.toUpperCase()} Summary",
  "overview": "Comprehensive 2-4 sentence executive overview of the technical content.",
  "main_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "key_concepts": ["Concept explanation 1", "Concept explanation 2"],
  "important_points": ["Critical invariant 1", "Asymptotic bound 2"],
  "summary": "Detailed technical synthesis of the curriculum material.",
  "exam_points": ["High-yield exam question 1", "Key differentiation 2"],
  "definitions": [
    {"term": "Term Name", "definition": "Precise academic definition"}
  ],
  "formulas": [
    {"name": "Formula Name", "formula": "$$formula$$", "explanation": "Variable definitions"}
  ],
  "conclusion": "Final wrap-up summary."
}`;

    let summaryData: any = null;
    try {
      const response = await AIService.generate([
        { role: 'system', content: 'You are an expert engineering document summarizer. Respond ONLY with valid JSON conforming strictly to the requested schema. Do not enclose in markdown ticks or add preamble.' },
        { role: 'user', content: promptInstructions },
      ]);

      let raw = response.text.trim();
      if (raw.startsWith('```json')) {
        raw = raw.replace(/^\`\`\`json\s*/i, '').replace(/\s*\`\`\`$/, '');
      } else if (raw.startsWith('```')) {
        raw = raw.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
      }

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaryData = parseLooseJson(jsonMatch[0]);
      }
    } catch (err) {
      logger.warn('AI summary parsing error, generating educational structured fallback', {
        error: { message: String(err) },
      });
    }

    if (!summaryData) {
      // No model output: an extractive summary built only from the document's own headings and
      // sentences. Fields that need a model stay empty instead of holding generic study advice
      // or an invented formula. The title says so, and it is not reused as a cache hit.
      const pageHeadings = pages.flatMap((p) => p.metadata?.headings || []).filter(Boolean);
      const topHeadings = Array.from(new Set(pageHeadings)).slice(0, 5);
      const sampleSentences = pages
        .flatMap((p) => (p.text || '').split(/[.\n]+/))
        .map((s) => s.trim())
        .filter((s) => s.length > 25 && s.length < 180);
      const overviewText = sampleSentences.length ? `${sampleSentences.slice(0, 3).join('. ')}.` : '';

      summaryData = {
        title: `${document.title} - ${EXTRACTIVE_TITLE_SUFFIX}`,
        overview: overviewText
          ? overviewText.slice(0, 400)
          : 'AI summaries are unavailable and no readable text was found in this document to extract.',
        main_topics: topHeadings,
        key_concepts: sampleSentences.slice(2, 6),
        important_points: [],
        summary: overviewText,
        exam_points: [],
        definitions: [],
        formulas: [],
        conclusion: '',
      };
    }

    // 5. Store in database
    const summary: DocumentSummary = await db.createDocumentSummary({
      document_id: documentId,
      student_id: studentId,
      summary_level: summaryLevel,
      title: summaryData.title || `${document.title} Summary`,
      overview: summaryData.overview || '',
      main_topics: summaryData.main_topics || [],
      key_concepts: summaryData.key_concepts || [],
      important_points: summaryData.important_points || [],
      summary: summaryData.summary || '',
      exam_points: summaryData.exam_points || [],
      definitions: summaryData.definitions || [],
      formulas: summaryData.formulas || [],
      conclusion: summaryData.conclusion || '',
      page_range: pageRange ? { start_page: pageRange.startPage, end_page: pageRange.endPage } : undefined,
    });

    return summary;
  }

  /**
   * Generates a structured summary of the document.
   */
  public static async generateSummary(
    documentId: string,
    studentId: string,
    options: {
      level?: DocumentSummaryLevel;
      page_range?: { startPage: number; endPage: number };
      force_regenerate?: boolean;
    } = {}
  ): Promise<DocumentSummary> {
    return this.getOrGenerateSummary(documentId, studentId, {
      summaryLevel: options.level,
      pageRange: options.page_range,
      forceRegenerate: options.force_regenerate,
    });
  }

  /**
   * Retrieves a cached summary for a document.
   */
  public static async getSummary(
    documentId: string,
    studentId: string,
    level: DocumentSummaryLevel = 'standard'
  ): Promise<DocumentSummary | null> {
    const document = await db.getDocumentById(documentId, studentId);
    if (!document) {
      throw new NotFoundError('Document not found');
    }
    return db.getDocumentSummary(documentId, studentId, level);
  }
}

