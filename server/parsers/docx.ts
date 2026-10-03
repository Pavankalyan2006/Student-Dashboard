import { DocumentParser, ParsedDocumentResult, ParsedPage } from './base';

export class DOCXParser implements DocumentParser {
  public canParse(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase().replace('.', '');
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      ext === 'docx' ||
      ext === 'doc'
    );
  }

  public async parse(bufferOrText: Buffer | string, options?: { filename?: string }): Promise<ParsedDocumentResult> {
    const filename = options?.filename || 'Document.docx';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

    let rawString = '';
    if (typeof bufferOrText === 'string') {
      rawString = bufferOrText;
    } else {
      rawString = bufferOrText.toString('utf-8');
    }

    // Extract text from word/document.xml if XML tags exist
    const textPieces: string[] = [];
    if (rawString.includes('<w:t')) {
      const regex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
      let match: RegExpExecArray | null;
      let currentPara = '';
      while ((match = regex.exec(rawString)) !== null) {
        currentPara += match[1] + ' ';
        if (currentPara.length > 250) {
          textPieces.push(currentPara.trim());
          currentPara = '';
        }
      }
      if (currentPara.trim().length > 0) {
        textPieces.push(currentPara.trim());
      }
    } else {
      // Plain text or fallback
      textPieces.push(
        ...rawString
          .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      );
    }

    const pages: ParsedPage[] = [];
    let currentPageText = '';
    let pageNum = 1;

    for (const piece of textPieces) {
      if (currentPageText.length + piece.length > 1800 && currentPageText.trim().length > 0) {
        pages.push({
          pageNumber: pageNum++,
          text: currentPageText.trim(),
          headings: [`Section ${pageNum - 1}`],
          metadata: { word_count: currentPageText.trim().split(/\s+/).length },
        });
        currentPageText = piece + '\n\n';
      } else {
        currentPageText += piece + '\n\n';
      }
    }

    if (currentPageText.trim().length > 0 || pages.length === 0) {
      pages.push({
        pageNumber: pageNum,
        text: currentPageText.trim() || `Course notes for ${title}`,
        headings: [`Section ${pageNum}`],
        metadata: { word_count: (currentPageText.trim() || title).split(/\s+/).length },
      });
    }

    return {
      title,
      author: 'Academic Faculty',
      pageCount: pages.length,
      pages,
      language: 'en',
      metadata: {
        format: 'docx',
        source: filename,
      },
    };
  }
}
