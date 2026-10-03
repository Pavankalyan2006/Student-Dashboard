import { DocumentParser, ParsedDocumentResult, ParsedPage } from './base';

export class TXTParser implements DocumentParser {
  public canParse(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase().replace('.', '');
    return mimeType === 'text/plain' || ext === 'txt' || ext === 'md';
  }

  public async parse(bufferOrText: Buffer | string, options?: { filename?: string }): Promise<ParsedDocumentResult> {
    const rawText = typeof bufferOrText === 'string'
      ? bufferOrText
      : bufferOrText.toString('utf-8');

    const filename = options?.filename || 'Document.txt';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

    // Normalize newlines
    const normalized = rawText.replace(/\r\n/g, '\n');

    // Check if explicitly has page breaks (\f or ---PAGE---)
    let rawPages: string[] = [];
    if (normalized.includes('\f')) {
      rawPages = normalized.split('\f');
    } else if (normalized.includes('---PAGE---')) {
      rawPages = normalized.split('---PAGE---');
    } else {
      // Chunk into logical pages of approx 400 words or 2200 characters preserving paragraph breaks
      const paragraphs = normalized.split(/\n\s*\n/);
      let currentPageText = '';
      for (const para of paragraphs) {
        if (currentPageText.length + para.length > 2200 && currentPageText.trim().length > 0) {
          rawPages.push(currentPageText.trim());
          currentPageText = para + '\n\n';
        } else {
          currentPageText += para + '\n\n';
        }
      }
      if (currentPageText.trim().length > 0) {
        rawPages.push(currentPageText.trim());
      }
    }

    if (rawPages.length === 0) {
      rawPages = [normalized.trim() || 'No content.'];
    }

    const pages: ParsedPage[] = rawPages.map((pageContent, idx) => {
      const pageNum = idx + 1;
      const lines = pageContent.split('\n');
      const headings: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.startsWith('#') ||
          /^(Chapter|Unit|Section|Module)\s+\d+/i.test(trimmed) ||
          (trimmed.length > 3 && trimmed.length < 60 && trimmed === trimmed.toUpperCase() && !trimmed.includes('.'))
        ) {
          headings.push(trimmed.replace(/^#+\s*/, ''));
        }
      }

      return {
        pageNumber: pageNum,
        text: pageContent.trim(),
        headings: headings.slice(0, 5),
        metadata: {
          word_count: pageContent.trim().split(/\s+/).filter(Boolean).length,
        },
      };
    });

    return {
      title,
      author: 'Author / Contributor',
      pageCount: pages.length,
      pages,
      language: 'en',
      metadata: {
        format: 'text',
        source: filename,
      },
    };
  }
}
