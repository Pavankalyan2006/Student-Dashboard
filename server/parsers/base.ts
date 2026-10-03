export interface ParsedPage {
  pageNumber: number;
  text: string;
  headings?: string[];
  tables?: Array<{ headers: string[]; rows: string[][] }>;
  metadata?: Record<string, any>;
}

export interface ParsedDocumentResult {
  title: string;
  author?: string;
  pageCount: number;
  pages: ParsedPage[];
  language?: string;
  metadata?: Record<string, any>;
}

export interface DocumentParser {
  canParse(mimeType: string, extension: string): boolean;
  parse(bufferOrText: Buffer | string, options?: { filename?: string }): Promise<ParsedDocumentResult>;
}
