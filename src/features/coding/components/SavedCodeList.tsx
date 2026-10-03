import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { codingApi } from '../api/codingApi';
import { SavedCode } from '../types/coding';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Code2,
  Calendar,
  Search,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedCodeListProps {
  onClose?: () => void;
}

export const SavedCodeList: React.FC<SavedCodeListProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const setSourceCode = useCodingEditorStore((s) => s.setSourceCode);
  const setLanguage = useCodingEditorStore((s) => s.setLanguage);
  const setActiveSavedCodeId = useCodingEditorStore((s) => s.setActiveSavedCodeId);

  const [search, setSearch] = useState('');

  const { data: savedList = [], isLoading } = useQuery({
    queryKey: ['coding-saved-list'],
    queryFn: () => codingApi.getSavedCodeList(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => codingApi.deleteSavedCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coding-saved-list'] });
      toast.success('Saved snippet deleted');
    },
    onError: (err: any) => {
      toast.error(`Delete failed: ${err.message}`);
    },
  });

  const handleLoad = (item: SavedCode) => {
    setLanguage(item.language);
    setSourceCode(item.source_code);
    setActiveSavedCodeId(item.id);
    toast.success(`Loaded "${item.title}" into editor`);
    if (onClose) onClose();
  };

  const filtered = savedList.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.language.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Saved Code Snippets</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tag, or language..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center p-6 text-slate-400 text-xs">Loading saved snippets...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-8 text-slate-400 text-xs">
            <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p>No saved code snippets found.</p>
            <p className="text-[11px] text-slate-500 mt-1">Click the "Save" button in the editor toolbar to store code.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-xs group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="uppercase font-mono font-bold text-blue-600 dark:text-blue-400">
                      {item.language}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLoad(item)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-[11px] font-semibold transition-colors"
                    title="Load into Editor"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${item.title}"?`)) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete snippet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {item.description}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
