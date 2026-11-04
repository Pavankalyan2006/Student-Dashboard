// src/features/knowledge-base/components/KnowledgeCollectionsGrid.tsx
// Visual card grid for subject and semester collections

import React from 'react';
import {
  Folder,
  FileText,
  Bookmark,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { KnowledgeCollection } from '../types/knowledgeBaseTypes';

interface KnowledgeCollectionsGridProps {
  collections: KnowledgeCollection[];
  selectedCollectionId?: string | null;
  onSelectCollection: (col: KnowledgeCollection) => void;
  onEditCollection: (col: KnowledgeCollection) => void;
  onDeleteCollection: (col: KnowledgeCollection) => void;
  onCreateCollection: () => void;
}

export const KnowledgeCollectionsGrid: React.FC<KnowledgeCollectionsGridProps> = ({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onEditCollection,
  onDeleteCollection,
  onCreateCollection,
}) => {
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'COURSEWORK':
        return 'Coursework';
      case 'TEXTBOOK':
        return 'Textbook';
      case 'RESEARCH_PAPER':
        return 'Research Paper';
      case 'LAB_MANUAL':
        return 'Lab Manual';
      case 'LECTURE_NOTES':
        return 'Lecture Notes';
      case 'EXAM_PAPER':
        return 'Exam Papers';
      case 'GATE_EXAM':
        return 'GATE Prep';
      case 'INTERVIEW_PREP':
        return 'Interview Prep';
      case 'PROJECT_DOCS':
        return 'Project Docs';
      default:
        return 'Study Notes';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Collections & Folders</h2>
          <p className="text-xs text-slate-400">
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'} organized by subject and semester
          </p>
        </div>
        <button
          onClick={onCreateCollection}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const isSelected = selectedCollectionId === col.id;
          return (
            <div
              key={col.id}
              className={`group relative rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/80 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
              onClick={() => onSelectCollection(col)}
            >
              <div>
                {/* Header: Icon, Category Badge & Actions */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: col.color || '#3B82F6' }}
                    >
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                        {getCategoryLabel(col.category)}
                      </span>
                      {col.semester && (
                        <span className="ml-1.5 text-[10px] font-medium text-indigo-400">
                          Sem {col.semester}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Context menu actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditCollection(col)}
                      title="Edit Collection"
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCollection(col)}
                      title="Delete Collection"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Collection Name & Description */}
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-1 mb-1">
                  {col.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                  {col.description || (col.subject ? `Curated notes and resources for ${col.subject}` : 'Academic repository')}
                </p>

                {/* Tags */}
                {col.tags && col.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {col.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50"
                      >
                        #{tag}
                      </span>
                    ))}
                    {col.tags.length > 3 && (
                      <span className="text-[10px] text-slate-500">+{col.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    {col.document_count || 0} {col.document_count === 1 ? 'doc' : 'docs'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {formatBytes(col.total_size_bytes || 0)}
                  </span>
                </div>

                <div className="text-[11px] text-indigo-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
