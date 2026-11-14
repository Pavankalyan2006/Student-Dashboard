import * as React from 'react';
import { Link as LinkIcon, FileText, FileCheck, ExternalLink, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { coursesApi } from '../api/coursesApi';
import { apiClient } from '../../../api/client';
import { toast } from 'sonner';

interface LinkResourceModalProps {
  courseId: string;
  chapters?: Array<{ id: string; title: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResourceAdded?: () => void;
}

export function LinkResourceModal({
  courseId,
  chapters = [],
  open,
  onOpenChange,
  onResourceAdded,
}: LinkResourceModalProps) {
  const [sourceType, setSourceType] = React.useState<'DOCUMENT' | 'NOTES' | 'LINK' | 'CODE'>('DOCUMENT');
  const [selectedChapterId, setSelectedChapterId] = React.useState<string>('');

  // Document selection
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = React.useState<string>('');

  // Note selection
  const [notes, setNotes] = React.useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string>('');

  // Custom link
  const [customTitle, setCustomTitle] = React.useState('');
  const [customUrl, setCustomUrl] = React.useState('');

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docsRes, notesRes] = await Promise.all([
        apiClient.get('/documents?limit=30').catch(() => ({ data: { items: [] } })),
        apiClient.get('/notes?limit=30').catch(() => ({ data: { items: [] } })),
      ]);
      setDocuments(docsRes.data?.items || docsRes.data || []);
      setNotes(notesRes.data?.items || notesRes.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (sourceType === 'DOCUMENT') {
        const doc = documents.find((d) => d.id === selectedDocId);
        if (!doc) {
          toast.error('Please select a document');
          setIsSubmitting(false);
          return;
        }

        await coursesApi.addResource(courseId, {
          title: doc.title || doc.filename,
          type: 'DOCUMENT',
          url: `/documents/${doc.id}`,
          document_id: doc.id,
          chapter_id: selectedChapterId || undefined,
          size_bytes: doc.file_size,
        });
      } else if (sourceType === 'NOTES') {
        const note = notes.find((n) => n.id === selectedNoteId);
        if (!note) {
          toast.error('Please select a note');
          setIsSubmitting(false);
          return;
        }

        await coursesApi.addResource(courseId, {
          title: note.title,
          type: 'NOTES',
          url: `/notes/${note.id}`,
          note_id: note.id,
          chapter_id: selectedChapterId || undefined,
        });
      } else {
        if (!customTitle.trim() || !customUrl.trim()) {
          toast.error('Please provide both title and URL');
          setIsSubmitting(false);
          return;
        }

        await coursesApi.addResource(courseId, {
          title: customTitle.trim(),
          type: sourceType,
          url: customUrl.trim(),
          chapter_id: selectedChapterId || undefined,
        });
      }

      toast.success('Resource linked to course!');
      onResourceAdded?.();
      onOpenChange(false);
      reset();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to link resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setSelectedDocId('');
    setSelectedNoteId('');
    setCustomTitle('');
    setCustomUrl('');
    setSelectedChapterId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <LinkIcon className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Link Learning Resource
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Attach lecture notes, uploaded textbooks, or web references.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          {/* Source Type Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setSourceType('DOCUMENT')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'DOCUMENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Document
            </button>
            <button
              type="button"
              onClick={() => setSourceType('NOTES')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'NOTES'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Note
            </button>
            <button
              type="button"
              onClick={() => setSourceType('LINK')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                sourceType === 'LINK'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              External Link
            </button>
          </div>

          {/* Associate Chapter (optional) */}
          {chapters.length > 0 && (
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Attach to Chapter (Optional)</label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="">Course Level (All Chapters)</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional inputs */}
          {sourceType === 'DOCUMENT' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Select Document from Library</label>
              {documents.length === 0 ? (
                <p className="p-3 bg-slate-50 border rounded-lg text-slate-500">
                  No uploaded documents found. Upload PDFs in the Documents page.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2 bg-slate-50">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-2 rounded-md border text-xs cursor-pointer flex items-center justify-between ${
                        selectedDocId === doc.id
                          ? 'bg-blue-50 border-blue-300 font-semibold text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{doc.title || doc.filename}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {doc.status || 'READY'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sourceType === 'NOTES' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Select Note</label>
              {notes.length === 0 ? (
                <p className="p-3 bg-slate-50 border rounded-lg text-slate-500">
                  No notes found. Create revision notes in the Notes page.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2 bg-slate-50">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-2 rounded-md border text-xs cursor-pointer flex items-center justify-between ${
                        selectedNoteId === note.id
                          ? 'bg-indigo-50 border-indigo-300 font-semibold text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{note.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {note.note_type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {sourceType === 'LINK' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Resource Title *</label>
                <Input
                  placeholder="e.g. Official Documentation & Specifications"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL / Link *</label>
                <Input
                  placeholder="https://..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Linking...' : 'Link Resource'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
