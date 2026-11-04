// server/parsers/codeAndData.ts
// Intelligent parser for programming source code files and structured tabular CSV/TSV datasets

import { DocumentParser, ParsedDocumentResult, ParsedPage } from './base';

export class CodeAndDataParser implements DocumentParser {
  private static readonly SUPPORTED_EXTS = new Set([
    'csv',
    'tsv',
    'py',
    'java',
    'cpp',
    'c',
    'h',
    'hpp',
    'ts',
    'js',
    'jsx',
    'tsx',
    'sql',
    'json',
    'html',
    'css',
    'sh',
  ]);

  public canParse(mimeType: string, extension: string): boolean {
    const ext = (extension || '').toLowerCase().replace('.', '');
    if (CodeAndDataParser.SUPPORTED_EXTS.has(ext)) {
      return true;
    }
    const mime = (mimeType || '').toLowerCase();
    return (
      mime === 'text/csv' ||
      mime === 'text/tab-separated-values' ||
      mime === 'application/json' ||
      mime.includes('python') ||
      mime.includes('javascript') ||
      mime.includes('typescript') ||
      mime.includes('x-c') ||
      mime.includes('x-java') ||
      mime.includes('sql')
    );
  }

  public async parse(
    bufferOrText: Buffer | string,
    options?: { filename?: string }
  ): Promise<ParsedDocumentResult> {
    const filename = options?.filename || 'code_file.txt';
    const ext = filename.split('.').pop()?.toLowerCase() || 'txt';
    const title = filename.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');

    let rawText = '';
    if (typeof bufferOrText === 'string') {
      if (bufferOrText.startsWith('data:')) {
        const base64Part = bufferOrText.split(',')[1] || '';
        rawText = Buffer.from(base64Part, 'base64').toString('utf-8');
      } else {
        rawText = bufferOrText;
      }
    } else {
      rawText = bufferOrText.toString('utf-8');
    }

    if (ext === 'csv' || ext === 'tsv') {
      return this.parseCsv(rawText, title, ext);
    }

    return this.parseCode(rawText, title, ext, filename);
  }

  /**
   * Parse CSV/TSV data into tabular structured pages
   */
  private parseCsv(rawText: string, title: string, ext: string): ParsedDocumentResult {
    const delimiter = ext === 'tsv' ? '\t' : ',';
    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length === 0) {
      return {
        title,
        pageCount: 1,
        pages: [{ pageNumber: 1, text: `Empty dataset: ${title}`, headings: ['Empty Dataset'] }],
      };
    }

    // Header extraction
    const rawHeaders = this.parseCsvLine(lines[0], delimiter);
    const headers = rawHeaders.map((h, i) => h.trim() || `Column_${i + 1}`);

    const pages: ParsedPage[] = [];
    const rowsPerPage = 25;
    const maxRows = Math.min(lines.length - 1, 1500); // Guard against huge CSV DoS

    let pageNumber = 1;
    for (let i = 1; i <= maxRows; i += rowsPerPage) {
      const chunkRows = lines.slice(i, i + rowsPerPage);
      const parsedRows = chunkRows.map((r) => this.parseCsvLine(r, delimiter));

      // Build readable Markdown table
      let tableMd = `### Dataset: ${title} (Rows ${i} - ${Math.min(i + rowsPerPage - 1, maxRows)})\n\n`;
      tableMd += `| ${headers.join(' | ')} |\n`;
      tableMd += `| ${headers.map(() => '---').join(' | ')} |\n`;

      for (const row of parsedRows) {
        const padded = headers.map((_, colIdx) => {
          const val = row[colIdx] || '';
          return val.replace(/\|/g, '\\|').trim().slice(0, 100);
        });
        tableMd += `| ${padded.join(' | ')} |\n`;
      }

      pages.push({
        pageNumber,
        text: tableMd,
        headings: [`${title} - Table Segment ${pageNumber}`, ...headers.slice(0, 5)],
        metadata: {
          row_start: i,
          row_end: Math.min(i + rowsPerPage - 1, maxRows),
          total_rows: maxRows,
          columns: headers,
        },
      });

      pageNumber++;
    }

    return {
      title,
      pageCount: pages.length,
      pages,
      language: 'csv',
      metadata: { total_rows: maxRows, columns_count: headers.length, columns: headers },
    };
  }

  /**
   * Parse programming source code into semantic pages with function/class headings
   */
  private parseCode(
    rawText: string,
    title: string,
    ext: string,
    filename: string
  ): ParsedDocumentResult {
    const lines = rawText.split(/\r?\n/);
    const linesPerPage = 60;
    const pages: ParsedPage[] = [];

    // Detect function and class signatures
    const signaturePatterns: Record<string, RegExp[]> = {
      py: [/^\s*(def|class)\s+([a-zA-Z0-9_]+)/],
      java: [/^\s*(public|protected|private|static|\s)+[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/, /^\s*(public|protected|private|\s)*(class|interface|enum)\s+([a-zA-Z0-9_]+)/],
      ts: [/^\s*(export\s+)?(function|class|interface|type)\s+([a-zA-Z0-9_]+)/, /^\s*(export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*)?\(/],
      js: [/^\s*(export\s+)?(function|class)\s+([a-zA-Z0-9_]+)/, /^\s*(export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*)?\(/],
      cpp: [/^\s*(class|struct)\s+([a-zA-Z0-9_]+)/, /^\s*[\w:*&<>]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{?/],
      c: [/^\s*(struct|union)\s+([a-zA-Z0-9_]+)/, /^\s*[\w:*&]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{?/],
      sql: [/^\s*CREATE\s+(TABLE|VIEW|PROCEDURE|FUNCTION|INDEX)\s+([a-zA-Z0-9_.]+)/i, /^\s*(SELECT|INSERT|UPDATE|DELETE|WITH)\s+/i],
    };

    const activeRegexes = signaturePatterns[ext] || [
      /^\s*(function|class|def|struct)\s+([a-zA-Z0-9_]+)/,
    ];

    let pageNumber = 1;
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const slice = lines.slice(i, i + linesPerPage);
      const headings: string[] = [];

      for (const line of slice) {
        for (const rgx of activeRegexes) {
          const match = line.match(rgx);
          if (match) {
            const sig = line.trim().slice(0, 60);
            if (!headings.includes(sig)) {
              headings.push(sig);
            }
          }
        }
      }

      if (headings.length === 0) {
        headings.push(`${title} (Lines ${i + 1}-${Math.min(i + linesPerPage, lines.length)})`);
      }

      const text = [
        `### Source File: \`${filename}\` (Lines ${i + 1} - ${Math.min(i + linesPerPage, lines.length)})`,
        `\`\`\`${ext}`,
        slice.join('\n'),
        '```',
      ].join('\n');

      pages.push({
        pageNumber,
        text,
        headings,
        metadata: {
          line_start: i + 1,
          line_end: Math.min(i + linesPerPage, lines.length),
          total_lines: lines.length,
          language: ext,
        },
      });

      pageNumber++;
    }

    return {
      title,
      pageCount: pages.length,
      pages,
      language: ext,
      metadata: { total_lines: lines.length, filename },
    };
  }

  private parseCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }
}
