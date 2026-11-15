/**
 * Text recognition (OCR) in the student's browser, for scanned PDFs and photos of pages.
 *
 * PDF pages are drawn with pdf.js and read with Tesseract (WebAssembly). The Tesseract worker, its engine
 * and the English model are served from this site (`/vendor/tesseract/`), so nothing is sent anywhere
 * to be recognised. The recognised text is always shown to the student, with its confidence, because
 * OCR makes mistakes.
 */

export interface OcrPage {
  page_number: number;
  text: string;
  /** Tesseract's mean word confidence for the page, 0 to 100. */
  confidence: number;
}

export interface OcrResult {
  pages: OcrPage[];
  /** Pages in the file; more than pages.length when the file was longer than the limit. */
  page_count: number;
  truncated: boolean;
  /** Mean confidence over pages that had text, 0 to 100. */
  confidence: number;
  ms: number;
}

export interface OcrOptions {
  maxPages?: number;
  onProgress?: (note: string, fraction: number) => void;
  signal?: AbortSignal;
}

export const OCR_MAX_PAGES = 40;
/** Below this many characters per page on average, a PDF is treated as a scan. */
export const SCAN_CHARS_PER_PAGE = 20;
const IMAGE_EXT = /\.(png|jpe?g|webp|bmp|gif)$/i;

export const isImageFile = (f: { name: string; type?: string }) => IMAGE_EXT.test(f.name) || /^image\//.test(f.type || '');
export const isPdfFile = (f: { name: string; type?: string }) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf';

const vendor = () => `${window.location.origin}/vendor/tesseract`;

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

async function openPdf(data: ArrayBuffer) {
  const pdfjs = await loadPdfJs();
  // pdf.js takes ownership of the buffer it is given, so it gets a copy.
  return pdfjs.getDocument({ data: new Uint8Array(data.slice(0)), isEvalSupported: false }).promise;
}

/** Counts the selectable text in a PDF, to tell a scan from a PDF that already has text. */
export async function pdfTextStats(data: ArrayBuffer): Promise<{ page_count: number; chars: number; scanned: boolean }> {
  const doc = await openPdf(data);
  let chars = 0;
  const n = Math.min(doc.numPages, OCR_MAX_PAGES);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items as any[]) chars += String(item.str || '').replace(/\s+/g, '').length;
  }
  await doc.destroy();
  return { page_count: doc.numPages, chars, scanned: chars < SCAN_CHARS_PER_PAGE * Math.max(1, n) };
}

async function createOcrWorker(onProgress?: OcrOptions['onProgress']) {
  const { createWorker, OEM } = await import('tesseract.js');
  onProgress?.('Loading the text recogniser…', 0);
  return createWorker('eng', OEM.LSTM_ONLY, {
    workerPath: `${vendor()}/worker.min.js`,
    corePath: `${vendor()}/core`,
    langPath: `${vendor()}/lang`,
    workerBlobURL: false,
    gzip: true,
  });
}

const tidy = (s: string) =>
  s
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

async function renderPdfPage(doc: any, n: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 });
  // About 2000 px across is enough for Tesseract to read printed text, without using too much memory.
  const scale = Math.max(1, Math.min(3, 2000 / base.width));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}

/** Recognises the text of a scanned PDF or an image, page by page. */
export async function recogniseFile(file: Blob & { name?: string; type?: string }, opts: OcrOptions = {}): Promise<OcrResult> {
  const started = performance.now();
  const name = file.name || '';
  const pdf = isPdfFile({ name, type: file.type });
  if (!pdf && !isImageFile({ name, type: file.type })) throw new Error('Text can be recognised in PDFs and images (PNG, JPG, WebP).');
  const maxPages = opts.maxPages ?? OCR_MAX_PAGES;
  const worker = await createOcrWorker(opts.onProgress);
  const pages: OcrPage[] = [];
  let pageCount = 1;
  try {
    if (pdf) {
      const doc = await openPdf(await file.arrayBuffer());
      pageCount = doc.numPages;
      const n = Math.min(pageCount, maxPages);
      for (let i = 1; i <= n; i++) {
        if (opts.signal?.aborted) throw new DOMException('Stopped', 'AbortError');
        opts.onProgress?.(`Reading page ${i} of ${n}…`, (i - 1) / n);
        const canvas = await renderPdfPage(doc, i);
        const { data } = await worker.recognize(canvas);
        pages.push({ page_number: i, text: tidy(data.text || ''), confidence: Math.round(data.confidence || 0) });
        canvas.width = canvas.height = 0;
      }
      await doc.destroy();
    } else {
      opts.onProgress?.('Reading the image…', 0);
      const { data } = await worker.recognize(file);
      pages.push({ page_number: 1, text: tidy(data.text || ''), confidence: Math.round(data.confidence || 0) });
    }
  } finally {
    await worker.terminate().catch(() => undefined);
  }
  opts.onProgress?.('Done', 1);
  const withText = pages.filter((p) => p.text);
  return {
    pages,
    page_count: pageCount,
    truncated: pageCount > pages.length,
    confidence: withText.length ? Math.round(withText.reduce((s, p) => s + p.confidence, 0) / withText.length) : 0,
    ms: Math.round(performance.now() - started),
  };
}

/** Joins recognised pages into one text, with a blank line between pages. */
export const joinPages = (pages: OcrPage[]) => pages.map((p) => p.text).filter(Boolean).join('\n\n');

export const OCR_NOTE =
  'Text recognition runs in your browser; the file is not sent anywhere to be read. It makes mistakes, especially with handwriting, formulas and poor scans, so check the text.';
