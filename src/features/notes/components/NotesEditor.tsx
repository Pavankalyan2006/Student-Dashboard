import * as React from 'react';
import {
  Save,
  Eye,
  Edit3,
  Columns,
  Code,
  Sigma,
  Heading,
  Bold,
  List,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { Note } from '../types/notes';
import { useUpdateNote } from '../hooks/useNotes';
import { Button } from '../../../components/ui/button';
import { NoteViewer } from './NoteViewer';

interface NotesEditorProps {
  note: Note;
  onClose: () => void;
}

export function NotesEditor({ note, onClose }: NotesEditorProps) {
  const [title, setTitle] = React.useState(note.title);
  const [content, setContent] = React.useState(note.content);
  const [tagsInput, setTagsInput] = React.useState(note.tags.join(', '));
  const [changeSummary, setChangeSummary] = React.useState('Updated note content');
  const [viewMode, setViewMode] = React.useState<'split' | 'edit' | 'preview'>('split');

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const updateMutation = useUpdateNote(note.id);

  const insertSnippet = (before: string, after = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = before + (selectedText || 'text') + after;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + (selectedText ? selectedText.length : 4));
    }, 10);
  };

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    updateMutation.mutate(
      {
        updates: {
          title,
          content,
          tags,
        },
        changeSummary,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Editor Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[280px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-base font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none px-1 py-0.5 transition"
            placeholder="Note Title"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-600 font-medium">Tags:</span>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="DBMS, Gate, Exam..."
              className="text-[11px] text-slate-700 bg-white border border-slate-300 rounded px-2 py-0.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-white">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'edit' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Edit Only"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Split View"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Preview Only"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-600"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending || !title.trim() || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Version'}
          </Button>
        </div>
      </div>

      {/* Formatting Toolbar (shown when in edit or split mode) */}
      {viewMode !== 'preview' && (
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-1 overflow-x-auto text-xs text-slate-600">
          <button
            type="button"
            onClick={() => insertSnippet('### ', '')}
            className="p-1 hover:bg-slate-100 rounded flex items-center gap-1"
            title="Heading"
          >
            <Heading className="h-3.5 w-3.5" />
            <span className="text-[11px]">H3</span>
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('**', '**')}
            className="p-1 hover:bg-slate-100 rounded flex items-center gap-1"
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet('$', '$')}
            className="p-1 hover:bg-blue-50 text-blue-600 rounded flex items-center gap-1 font-mono text-xs font-semibold"
            title="Inline KaTeX Formula"
          >
            <Sigma className="h-3.5 w-3.5" />
            $math$
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('\n$$\n', '\n$$\n')}
            className="p-1 hover:bg-blue-50 text-blue-600 rounded flex items-center gap-1 font-mono text-[11px] font-semibold"
            title="Block Formula"
          >
            $$Block$$
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => insertSnippet('\n```cpp\n', '\n```\n')}
            className="p-1 hover:bg-slate-100 rounded flex items-center gap-1"
            title="Code Block"
          >
            <Code className="h-3.5 w-3.5" />
            <span>Code</span>
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('- ', '')}
            className="p-1 hover:bg-slate-100 rounded flex items-center gap-1"
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet(
                '\n| Property | Value | Notes |\n|---|---|---|\n| Item 1 | Value 1 | Details |\n| Item 2 | Value 2 | Details |\n'
              )
            }
            className="p-1 hover:bg-slate-100 rounded flex items-center gap-1"
            title="Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 grid overflow-hidden min-h-[450px]" style={{ gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr' }}>
        {viewMode !== 'preview' && (
          <div className="p-4 border-r border-slate-200 flex flex-col h-full bg-[#FAFAFA]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 p-3 text-xs font-mono leading-relaxed bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              placeholder="Write academic notes in Markdown with KaTeX math notation ($...$, $$...$$)..."
            />
          </div>
        )}

        {viewMode !== 'edit' && (
          <div className="p-6 overflow-y-auto h-full bg-white">
            <NoteViewer content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
