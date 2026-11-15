import { DocumentParser, ParsedDocumentResult } from './base';

/**
 * Photos and scanned page images. The server cannot read text in an image (there is no OCR on the server),
 * so the image is kept with one empty page and nothing is indexed. The student can have the text recognised
 * in their browser, which is saved through DocumentProcessingService.indexRecognisedText.
 */
export class ImageParser implements DocumentParser {
  public canParse(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase().replace('.', '');
    return ['image/png', 'image/jpeg', 'image/webp'].includes(mimeType) || ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  }

  public async parse(_data: Buffer | string, options?: { filename?: string }): Promise<ParsedDocumentResult> {
    const filename = options?.filename || 'Image';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');
    return {
      title,
      pageCount: 1,
      pages: [{ pageNumber: 1, text: '', headings: [], metadata: { word_count: 0, is_scanned: true, extractable: false } }],
      metadata: { format: 'image', source: filename, is_scanned: true },
    };
  }
}
