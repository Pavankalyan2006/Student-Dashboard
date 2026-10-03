import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contextApi } from '../api/contextApi';
import { useContextStore } from '../store/contextStore';
import { ContextType } from '../types';
import { Search, X, Check, BookOpen, FolderGit2, GraduationCap, FileText, Bookmark, Layers } from 'lucide-react';

export const ContextSelectorModal: React.FC = () => {
  const { isSelectorOpen, setSelectorOpen, addContext, selectedContexts } = useContextStore();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: options = [], isLoading } = useQuery({
    queryKey: ['context-options'],
    queryFn: () => contextApi.listAvailableContextOptions(),
    enabled: isSelectorOpen,
  });

  if (!isSelectorOpen) return null;

  const filteredOptions = options.filter((opt) => {
    const matchesFilter = filterType === 'ALL' || opt.type === filterType;
    const matchesQuery =
      opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleSelect = (opt: any) => {
    addContext({
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: opt.type as ContextType,
      reference_id: opt.reference_id,
      title: opt.title,
      subtitle: opt.subtitle,
    });
  };

  const isAlreadySelected = (refId: string) => {
    return selectedContexts.some((c) => c.reference_id === refId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Context to AI Agent</h2>
            <p className="text-xs text-slate-500">
              Select student materials to ground AI reasoning with verified provenance.
            </p>
          </div>
          <button
            onClick={() => setSelectorOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search across courses, papers, repositories, and documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['ALL', 'RESEARCH_PROJECT', 'GITHUB_REPO', 'COURSE', 'DOCUMENT', 'PROJECT'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterType === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t === 'ALL' ? 'All Sources' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Options List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading available context...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No items found matching criteria.</div>
          ) : (
            filteredOptions.map((opt) => {
              const selected = isAlreadySelected(opt.reference_id);
              return (
                <div
                  key={`${opt.type}-${opt.reference_id}`}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 font-medium uppercase text-[10px]">
                        {opt.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{opt.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{opt.subtitle}</p>
                  </div>

                  <button
                    onClick={() => handleSelect(opt)}
                    disabled={selected}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selected
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-xs'
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{selectedContexts.length} context items currently active</span>
          <button
            onClick={() => setSelectorOpen(false)}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
