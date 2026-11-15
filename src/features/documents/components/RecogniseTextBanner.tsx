import * as React from 'react';
import { ScanText, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import { documentsApi } from '../api/documentsApi';
import { recogniseFile, OCR_MAX_PAGES, OCR_NOTE } from '../../../lib/ocr';
import type { Document } from '../types/document';

const OCR_TYPES = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];

/** True for a processed scan or image that has no text to search, so its text can be recognised. */
export function needsRecognition(doc: Document): boolean {
  const ext = String(doc.file_extension || '').toLowerCase().replace(/^\./, '');
  const indexed = (doc as any).content_indexed ?? doc.metadata?.content_indexed;
  return doc.status === 'READY' && indexed === false && OCR_TYPES.includes(ext);
}

/**
 * Shown on a scanned PDF or a photo with no text: recognises the text in the student's browser (Tesseract),
 * then saves it so the document can be searched, cited and summarised. The confidence is shown afterwards.
 */
export function RecogniseTextBanner({ document, onDone }: { document: Document; onDone: () => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [fraction, setFraction] = React.useState(0);

  const run = async () => {
    setBusy(true);
    try {
      setNote('Downloading the file…');
      const blob = await documentsApi.getFileBlob(document.id);
      const file = new File([blob], document.original_filename || `document.${document.file_extension}`, { type: document.mime_type || blob.type });
      const r = await recogniseFile(file, {
        onProgress: (n, f) => {
          setNote(n);
          setFraction(f);
        },
      });
      if (!r.pages.some((p) => p.text.trim())) {
        toast.error('No text could be recognised in this file. It may be a photo without printed text, or too blurred to read.');
        return;
      }
      setNote('Saving the recognised text…');
      await documentsApi.saveRecognisedText(document.id, { pages: r.pages, page_count: r.page_count });
      toast.success(
        `Recognised ${r.pages.length} page${r.pages.length === 1 ? '' : 's'} (confidence ${r.confidence}%).${r.truncated ? ` Only the first ${OCR_MAX_PAGES} pages were read.` : ''} Check the text against the original.`
      );
      qc.invalidateQueries({ queryKey: ['document-pages', document.id] });
      qc.invalidateQueries({ queryKey: ['documents'] });
      onDone();
    } catch (e: any) {
      toast.error(e?.message || 'The text could not be recognised.');
    } finally {
      setBusy(false);
      setNote('');
      setFraction(0);
    }
  };

  return (
    <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center gap-3 text-xs text-amber-900" data-testid="recognise-text-banner">
      <ScanText className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">
        {busy ? (
          <span role="status">
            {note} {fraction > 0 && fraction < 1 ? `${Math.round(fraction * 100)}%` : ''}
          </span>
        ) : (
          <>No text was found in this file, so it cannot be searched or used for answers. It may be a scan. You can have its text recognised in your browser.</>
        )}
      </span>
      <span title={OCR_NOTE} className="inline-flex items-center gap-1 text-amber-800">
        <Info className="h-3.5 w-3.5" /> Runs on your device
      </span>
      <Button size="sm" onClick={run} disabled={busy} className="h-7 text-xs gap-1.5">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanText className="h-3.5 w-3.5" />}
        {busy ? 'Recognising…' : 'Recognise text'}
      </Button>
    </div>
  );
}

/** A small note for documents whose text came from OCR, with the confidence. */
export function RecognisedTextNote({ document }: { document: Document }) {
  if (document.metadata?.text_source !== 'ocr') return null;
  return (
    <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-[11px] text-slate-600" data-testid="recognised-text-note">
      <ScanText className="h-3.5 w-3.5 shrink-0" />
      <span>
        The text of this document was recognised from a scan in your browser (confidence {document.metadata?.ocr_confidence ?? '?'}%). It can contain mistakes, so check quotes against the original.
      </span>
    </div>
  );
}
