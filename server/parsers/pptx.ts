import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');
import { DocumentParser, ParsedDocumentResult, ParsedPage } from './base';

export class PPTXParser implements DocumentParser {
  public canParse(mimeType: string, extension: string): boolean {
    const ext = extension.toLowerCase().replace('.', '');
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mimeType === 'application/vnd.ms-powerpoint' ||
      ext === 'pptx' ||
      ext === 'ppt'
    );
  }

  public async parse(bufferOrText: Buffer | string, options?: { filename?: string }): Promise<ParsedDocumentResult> {
    const filename = options?.filename || 'Lecture_Slides.pptx';
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

    try {
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      const slideEntries = zipEntries
        .filter((e: any) => e.entryName.startsWith('ppt/slides/slide') && e.entryName.endsWith('.xml'))
        .sort((a: any, b: any) => {
          const numA = parseInt(a.entryName.replace(/[^0-9]/g, '') || '0', 10);
          const numB = parseInt(b.entryName.replace(/[^0-9]/g, '') || '0', 10);
          return numA - numB;
        });

      slideEntries.forEach((entry: any, idx: number) => {
        const xml = entry.getData().toString('utf-8');
        const textPieces: string[] = [];
        const regex = /<a:t>([\s\S]*?)<\/a:t>/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(xml)) !== null) {
          if (match[1].trim()) textPieces.push(match[1].trim());
        }
        const slideText = textPieces.join('\n');
        const heading = textPieces[0] || `Slide ${idx + 1}`;

        pages.push({
          pageNumber: idx + 1,
          text: `## Slide ${idx + 1}: ${heading}\n\n${slideText}`,
          headings: [heading],
          metadata: { word_count: slideText.split(/\s+/).length },
        });
      });
    } catch (e) {
      // Fallback
    }

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        text: `Slide content for ${title}`,
        headings: ['Overview'],
        metadata: { word_count: 4 },
      });
    }

    return {
      title,
      pageCount: pages.length,
      pages,
      language: 'en',
      metadata: {
        format: 'pptx',
        source: filename,
      },
    };
  }
}
