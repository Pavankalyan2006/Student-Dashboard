import * as React from 'react';
import { useFolders } from '../hooks/useFolders';
import { FolderPlus, X, Folder } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COLOR_OPTIONS = [
  { label: 'Blue', value: '#6957E8' },
  { label: 'Indigo', value: '#6957E8' },
  { label: 'Purple', value: '#9333EA' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#C66C12' },
  { label: 'Rose', value: '#D63535' },
  { label: 'Slate', value: '#475569' },
];

export function CreateFolderModal({ isOpen, onClose, onSuccess }: CreateFolderModalProps) {
  const { createFolder, isCreating } = useFolders();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('#6957E8');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createFolder({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      setName('');
      setDescription('');
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create New Folder</h3>
              <p className="text-[11px] text-slate-500">Organize your academic study materials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Software Testing, Semester 4, AI & ML"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="e.g. Unit tests, lab reports, and assignment references"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Folder Color Accent
            </label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isCreating}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isCreating || !name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>{isCreating ? 'Creating...' : 'Create Folder'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
