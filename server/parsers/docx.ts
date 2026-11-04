import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');
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
    let currentPageText = '';
    let currentPageHeadings: string[] = [];
    let pageNum = 1;

    const pushPage = () => {
      if (currentPageText.trim()) {
        pages.push({
          pageNumber: pageNum++,
          text: currentPageText.trim(),
          headings: currentPageHeadings.length > 0 ? currentPageHeadings.slice(0, 5) : [`Section ${pageNum - 1}`],
          metadata: { word_count: currentPageText.trim().split(/\s+/).length },
        });
        currentPageText = '';
        currentPageHeadings = [];
      }
    };

    // Extract with AdmZip from word/document.xml
    try {
      const zip = new AdmZip(buffer);
      const docXmlEntry = zip.getEntry('word/document.xml');
      if (docXmlEntry) {
        const xml = docXmlEntry.getData().toString('utf-8');

        // Parse paragraphs and tables in structural document order
        const blockRegex = /<(w:p|w:tbl)[^>]*>([\s\S]*?)<\/\1>/g;
        let match: RegExpExecArray | null;

        while ((match = blockRegex.exec(xml)) !== null) {
          const tag = match[1];
          const content = match[2];

          // Check for Word page break
          const hasPageBreak = /<w:br[^>]*w:type="page"|<w:lastRenderedPageBreak/i.test(content);

          if (tag === 'w:p') {
            const styleMatch = content.match(/<w:pStyle[^>]*w:val="([^"]+)"/i);
            const style = styleMatch ? styleMatch[1].toLowerCase() : '';

            // Extract text tokens
            const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
            let tMatch: RegExpExecArray | null;
            let pText = '';
            while ((tMatch = tRegex.exec(content)) !== null) {
              pText += tMatch[1];
            }
            pText = pText.trim();

            if (pText) {
              let formatted = pText;
              if (style.includes('heading1') || style.includes('title')) {
                formatted = `# ${pText}`;
                currentPageHeadings.push(pText);
              } else if (style.includes('heading2')) {
                formatted = `## ${pText}`;
                currentPageHeadings.push(pText);
              } else if (style.includes('heading3')) {
                formatted = `### ${pText}`;
              } else if (content.includes('<w:numPr>')) {
                formatted = `- ${pText}`;
              }

              // Normal A4 page threshold: ~3200 characters without breaking mid-paragraph
              if (currentPageText.length + formatted.length > 3200 && currentPageText.trim().length > 0) {
                pushPage();
              }

              currentPageText += formatted + '\n\n';
            }
          } else if (tag === 'w:tbl') {
            // Parse table rows and cells into Markdown table
            const rowRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/g;
            let rMatch: RegExpExecArray | null;
            const rows: string[][] = [];

            while ((rMatch = rowRegex.exec(content)) !== null) {
              const rowContent = rMatch[1];
              const cellRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
              let cMatch: RegExpExecArray | null;
              const cells: string[] = [];

              while ((cMatch = cellRegex.exec(rowContent)) !== null) {
                const cellContent = cMatch[1];
                const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
                let ctMatch: RegExpExecArray | null;
                let cellText = '';
                while ((ctMatch = tRegex.exec(cellContent)) !== null) {
                  cellText += ctMatch[1];
                }
                cells.push(cellText.trim().replace(/\|/g, '\\|') || '-');
              }
              if (cells.length > 0) {
                rows.push(cells);
              }
            }

            if (rows.length > 0) {
              let tableMd = '\n';
              const headers = rows[0];
              tableMd += '| ' + headers.join(' | ') + ' |\n';
              tableMd += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
              for (let r = 1; r < rows.length; r++) {
                tableMd += '| ' + rows[r].join(' | ') + ' |\n';
              }
              tableMd += '\n';

              if (currentPageText.length + tableMd.length > 3200 && currentPageText.trim().length > 0) {
                pushPage();
              }
              currentPageText += tableMd;
            }
          }

          if (hasPageBreak) {
            pushPage();
          }
        }
      }
    } catch (zipErr) {
      // Fallback
    }

    pushPage();

    if (pages.length === 0) {
      const raw = buffer.toString('utf-8');
      const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      const paras = clean.split(/\n\s*\n/).map((s) => s.trim()).filter((s) => s.length > 10);
      const text = paras.join('\n\n') || `Study notes for ${title}`;
      pages.push({
        pageNumber: 1,
        text,
        headings: [title],
        metadata: { word_count: text.split(/\s+/).length },
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
