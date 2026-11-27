// src/features/knowledge-base/components/KnowledgeResourcesTab.tsx
// Management view for external reference links, research papers, videos, and GitHub repos

import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Trash2,
  Video,
  FileCode,
  FileText,
  Link,
  Folder,
  X,
} from 'lucide-react';
import { KnowledgeResource, KnowledgeCollection } from '../types/knowledgeBaseTypes';

interface KnowledgeResourcesTabProps {
  resources: KnowledgeResource[];
  collections: KnowledgeCollection[];
  onCreateResource: (data: {
    collection_id?: string;
    title: string;
    description?: string;
    url: string;
    type: 'LINK' | 'VIDEO' | 'PAPER' | 'CODE_REPO';
  }) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
}

export const KnowledgeResourcesTab: React.FC<KnowledgeResourcesTabProps> = ({
  resources,
  collections,
  onCreateResource,
  onDeleteResource,
}) => {
  const [filterCollectionId, setFilterCollectionId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'LINK' | 'VIDEO' | 'PAPER' | 'CODE_REPO'>('LINK');
  const [collectionId, setCollectionId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const filteredResources = resources.filter((r) =>
    filterCollectionId ? r.collection_id === filterCollectionId : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setLoading(true);
    try {
      await onCreateResource({
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        type,
        collection_id: collectionId || undefined,
      });
      setTitle('');
      setDescription('');
      setUrl('');
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'CODE_REPO':
        return <FileCode className="w-4 h-4 text-emerald-600" />;
      case 'PAPER':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      default:
        return <Link className="w-4 h-4 text-cyan-600" />;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <select
            value={filterCollectionId}
            onChange={(e) => setFilterCollectionId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Collections ({collections.length})</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add External Resource</span>
        </button>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
          <Link className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900">No external resources added</p>
          <p className="text-xs text-slate-500 mt-1">
            Bookmark relevant YouTube lecture series, arXiv research papers, and GitHub code repositories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredResources.map((res) => {
            const col = collections.find((c) => c.id === res.collection_id);
            return (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-200 flex items-center justify-between gap-4 transition shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(res.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1 truncate"
                      >
                        <span>{res.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      {col && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded text-slate-900"
                          style={{ backgroundColor: col.color || '#6957E8' }}
                        >
                          {col.name}
                        </span>
                      )}
                    </div>
                    {res.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{res.description}</p>
                    )}
                    <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                      {res.url}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteResource(res.id)}
                  title="Delete resource"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-50 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add External Reference Resource</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MIT 6.006 Lecture 1 on YouTube"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Resource Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LINK">Documentation / Article</option>
                    <option value="VIDEO">Video / Lecture</option>
                    <option value="PAPER">Research Paper</option>
                    <option value="CODE_REPO">Code Repository</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Attach to Collection
                  </label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (General)</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this resource valuable?..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                >
                  {loading ? 'Adding...' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
