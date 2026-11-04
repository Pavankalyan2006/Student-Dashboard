import { DocumentParser, ParsedDocumentResult } from './base';
import { PDFParser } from './pdf';
import { DOCXParser } from './docx';
import { PPTXParser } from './pptx';
import { TXTParser } from './txt';
import { CodeAndDataParser } from './codeAndData';
import { ValidationError } from '../core/exceptions';

export class DocumentParserRegistry {
  private static parsers: DocumentParser[] = [
    new PDFParser(),
    new DOCXParser(),
    new PPTXParser(),
    new CodeAndDataParser(),
    new TXTParser(),
  ];

  public static getParser(mimeTypeOrExt: string, extension: string = ''): DocumentParser {
    const rawExt = extension || (mimeTypeOrExt.includes('/') ? '' : mimeTypeOrExt);
    const ext = (rawExt || '').toLowerCase().replace('.', '');
    const mime = (mimeTypeOrExt.includes('/') ? mimeTypeOrExt : '').toLowerCase();

    for (const parser of this.parsers) {
      if (parser.canParse(mime, ext)) {
        return parser;
      }
    }
    // Fallback to TXT parser if text-like or unknown
    if (mime.startsWith('text/') || ext === 'txt' || ext === 'md' || ext === 'json') {
      return new TXTParser();
    }
    throw new ValidationError(`Unsupported document format: ${mimeTypeOrExt} (.${ext})`);
  }

  public static async parse(
    bufferOrText: Buffer | string,
    mimeType: string,
    extension: string,
    options?: { filename?: string }
  ): Promise<ParsedDocumentResult> {
    const parser = this.getParser(mimeType, extension);
    return parser.parse(bufferOrText, options);
  }
}

export * from './base';
export * from './pdf';
export * from './docx';
export * from './pptx';
export * from './txt';
export * from './codeAndData';
