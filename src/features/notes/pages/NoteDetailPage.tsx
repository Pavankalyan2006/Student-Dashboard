import * as React from 'react';
import {
  ArrowLeft,
  Edit3,
  Star,
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  Share2,
  Trash2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useNote, useToggleFavoriteNote, useDeleteNote } from '../hooks/useNotes';
import { NoteViewer } from '../components/NoteViewer';
import { NotesEditor } from '../components/NotesEditor';
import { NoteAIActions } from '../components/NoteAIActions';
import { Button } from '../../../components/ui/button';
import { LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { toast } from 'sonner';

interface NoteDetailPageProps {
  noteId: string;
  onNavigate: (path: string) => void;
}

export function NoteDetailPage({ noteId, onNavigate }: NoteDetailPageProps) {
  const { data: note, isLoading, isError, error, refetch } = useNote(noteId);
  const toggleFavoriteMutation = useToggleFavoriteNote();
  const deleteMutation = useDeleteNote();

  const [isEditing, setIsEditing] = React.useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = React.useState(true);

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingState message="Opening academic note and formula renderer..." />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <ErrorState
          title="Note not found"
          message={(error as any)?.message || 'The requested note could not be retrieved.'}
          onRetry={() => refetch()}
        />
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={() => onNavigate('/notes')}>
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(note.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const readingTime = Math.max(1, Math.ceil(note.content.split(/\s+/).length / 200));

  // Extract headings from content for Table of Contents
  const headings = note.content
    .split('\n')
    .filter((line) => line.startsWith('### '))
    .map((line) => {
      const text = line.replace(/^###\s+/, '').trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return { text, id };
    });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(note.id, {
        onSuccess: () => {
          onNavigate('/notes');
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/notes')}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Notes</span>
            </Button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium text-slate-900">{note.note_type.replace('_NOTES', '')}</span>
              <span>·</span>
              <span>{note.level}</span>
              <span>·</span>
              <span className="font-mono text-[11px]">{readingTime} min read</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleFavoriteMutation.mutate(note.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-50 transition"
              title={note.is_favorite ? 'Favorited' : 'Add to favorites'}
            >
              <Star
                className={`h-4 w-4 ${
                  note.is_favorite ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                }`}
              />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/quiz/create?noteId=${note.id}&topic=${encodeURIComponent(note.title)}&source_type=NOTES`)}
              className="h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1.5"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Generate Quiz</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 text-xs text-slate-700 flex items-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditing ? 'View Mode' : 'Edit Note'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className={`h-8 text-xs flex items-center gap-1.5 ${
                isAiPanelOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">AI Study Assistant</span>
            </Button>

            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete Note"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: 3-column layout */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {isEditing ? (
          <NotesEditor note={note} onClose={() => setIsEditing(false)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Outline & Metadata (3 cols on desktop) */}
            <div className="lg:col-span-3 space-y-4 hidden lg:block sticky top-20">
              {/* Table of contents */}
              {headings.length > 0 && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                    Table of Contents
                  </h4>
                  <nav className="space-y-1 text-xs">
                    {headings.map((h, i) => (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        className="block py-1 px-1.5 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition truncate"
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Note Metadata Details */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Academic Context
                </h4>
                <div>
                  <span className="text-slate-400 block text-[10px]">SOURCE</span>
                  <span className="font-medium text-slate-900">
                    {note.source_title || (note.source_type === 'topic' ? 'Topic Input' : 'Curriculum Course')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">VERSION</span>
                  <span className="font-mono text-slate-700">v{note.version} (immutable history)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">UPDATED</span>
                  <span className="text-slate-700">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">TAGS</span>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((t) => (
                      <span key={t} className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Note Reading View (6 cols if AI open, 9 if collapsed) */}
            <div className={isAiPanelOpen ? 'lg:col-span-6' : 'lg:col-span-9'}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-10">
                {/* Note Header */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{note.source_title || 'Engineering Notes'}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
                    {note.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {note.description}
                  </p>
                </div>

                {/* Markdown & Formula Reader */}
                <NoteViewer content={note.content} onNavigate={onNavigate} />
              </div>
            </div>

            {/* Right Column: AI Learning Agent & Study Tools (3 cols) */}
            {isAiPanelOpen && (
              <div className="lg:col-span-3 sticky top-20">
                <NoteAIActions note={note} onNavigate={onNavigate} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
