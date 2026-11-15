import { createRequire } from 'module';
import { DocumentParser, ParsedDocumentResult, ParsedPage } from './base';

const require = createRequire(import.meta.url);
let pdfParsePkg: any;
try {
  pdfParsePkg = require('pdf-parse');
  // pdf.js loads its worker from a file next to the package. Serverless bundles (Vercel) do not ship that
  // file, so parsing failed there and every PDF looked like a scan. Give pdf.js the worker as data instead.
  try {
    const worker = require('pdf-parse/worker');
    if (pdfParsePkg?.PDFParse?.setWorker && typeof worker?.getData === 'function') pdfParsePkg.PDFParse.setWorker(worker.getData());
  } catch {
    // The worker file next to the package is used instead.
  }
} catch (e) {
  // Ignore load error
}

export class PDFParser implements DocumentParser {
  public canParse(mimeType: string, extension: string): boolean {
    const ext = (extension || '').toLowerCase().replace('.', '');
    return mimeType === 'application/pdf' || ext === 'pdf';
  }

  public async parse(bufferOrText: Buffer | string, options?: { filename?: string }): Promise<ParsedDocumentResult> {
    const filename = options?.filename || 'Document.pdf';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');

    let buffer: Buffer;
    if (typeof bufferOrText === 'string') {
      if (bufferOrText.startsWith('data:')) {
        const base64Data = bufferOrText.split(',')[1] || '';
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        buffer = Buffer.from(bufferOrText, 'base64');
      }
    } else {
      buffer = bufferOrText;
    }

    const pages: ParsedPage[] = [];

    // 1. Try modern pdf-parse library
    try {
      if (pdfParsePkg) {
        if (typeof pdfParsePkg === 'function') {
          const res = await pdfParsePkg(buffer);
          const fullText = res.text || '';
          const rawPages = fullText.split('\f').filter((p: string) => p.trim().length > 0);
          if (rawPages.length > 0) {
            rawPages.forEach((pText: string, idx: number) => {
              const trimmed = pText.trim();
              const heading = trimmed.split('\n')[0]?.trim().slice(0, 60) || `Page ${idx + 1}`;
              pages.push({
                pageNumber: idx + 1,
                text: trimmed,
                headings: [heading],
                metadata: { word_count: trimmed.split(/\s+/).length },
              });
            });
          }
        } else if (pdfParsePkg.PDFParse) {
          const uint8 = new Uint8Array(buffer);
          const parser = new pdfParsePkg.PDFParse(uint8);
          await parser.load();
          const res = await parser.getText();
          if (res && res.pages && res.pages.length > 0) {
            res.pages.forEach((p: any, idx: number) => {
              const text = (p.text || '').trim();
              if (text) {
                const heading = text.split('\n')[0]?.trim().slice(0, 60) || `Page ${idx + 1}`;
                pages.push({
                  pageNumber: p.num || idx + 1,
                  text,
                  headings: [heading],
                  metadata: { word_count: text.split(/\s+/).length },
                });
              }
            });
          } else if (res && res.text) {
            const rawPages = (res.text as string).split('\f').filter((p) => p.trim().length > 0);
            rawPages.forEach((pText, idx) => {
              const text = pText.trim();
              pages.push({
                pageNumber: idx + 1,
                text,
                headings: [text.split('\n')[0]?.trim().slice(0, 60) || `Page ${idx + 1}`],
                metadata: { word_count: text.split(/\s+/).length },
              });
            });
          }
        }
      }
    } catch (parseErr) {
      // Continue to fallback
    }

    // 2. Fallback stream extractor for uncompressed or Flate streams
    if (pages.length === 0) {
      try {
        const raw = buffer.toString('binary');
        const textPieces: string[] = [];
        const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
        let match: RegExpExecArray | null;
        while ((match = streamRegex.exec(raw)) !== null) {
          const streamContent = match[1];
          const tjRegex = /\(([^)]+)\)\s*Tj/g;
          let tjMatch: RegExpExecArray | null;
          while ((tjMatch = tjRegex.exec(streamContent)) !== null) {
            if (tjMatch[1].trim()) {
              textPieces.push(tjMatch[1].trim());
            }
          }
        }
        if (textPieces.length > 0) {
          const combined = textPieces.join(' ');
          pages.push({
            pageNumber: 1,
            text: combined,
            headings: [textPieces[0].slice(0, 60)],
            metadata: { word_count: combined.split(/\s+/).length },
          });
        }
      } catch {
        // Fallback
      }
    }

    // 3. Fallback for scanned or image-only documents
    let isScanned = false;
    if (pages.length === 0) {
      isScanned = true;
      pages.push({
        pageNumber: 1,
        // No text was found. The page is left empty so nothing is indexed or answered from it; the notice is metadata.
        text: '',
        headings: ['Scanned Document Notice'],
        metadata: { word_count: 0, is_scanned: true, extractable: false, notice: `No digital text was found in ${title}. It may be a scan; text recognition (OCR) is not set up here.` },
      });
    }

    return {
      title,
      pageCount: pages.length,
      pages,
      language: 'en',
      metadata: {
        format: 'pdf',
        source: filename,
        is_scanned: isScanned,
      },
    };
  }
}
