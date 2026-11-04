// src/features/knowledge-base/components/KnowledgeDashboardHeader.tsx
// Visual header with KPI metric cards, storage quota monitor, and quick action buttons

import React from 'react';
import {
  FolderPlus,
  UploadCloud,
  HelpCircle,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Link,
} from 'lucide-react';
import { KnowledgeDashboardStats } from '../types/knowledgeBaseTypes';

interface KnowledgeDashboardHeaderProps {
  stats: KnowledgeDashboardStats | null;
  loading: boolean;
  onOpenCreateCollection: () => void;
  onOpenUpload: () => void;
  onOpenAddResource?: () => void;
  onOpenAskAi: () => void;
  onOpenGenerateMaterial: () => void;
}

export const KnowledgeDashboardHeader: React.FC<KnowledgeDashboardHeaderProps> = ({
  stats,
  loading,
  onOpenCreateCollection,
  onOpenUpload,
  onOpenAddResource,
  onOpenAskAi,
  onOpenGenerateMaterial,
}) => {
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const usedBytes = stats?.storage_used_bytes || 0;
  const limitBytes = stats?.storage_limit_bytes || 500 * 1024 * 1024;
  const percentUsed = Math.min(100, Math.round((usedBytes / limitBytes) * 100));

  const isStorageNearLimit = percentUsed >= 80;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Title & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Knowledge Base & Library</h1>
              <p className="text-sm text-slate-400">
                Organize academic resources, perform semantic vector searches, and generate AI-grounded study decks
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenCreateCollection}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/80 transition shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>New Collection</span>
          </button>

          {onOpenAddResource && (
            <button
              onClick={onOpenAddResource}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700/80 transition shadow-sm"
            >
              <Link className="w-4 h-4 text-emerald-400" />
              <span>Add Resource</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/30"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={onOpenAskAi}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-medium transition shadow-lg shadow-emerald-600/25"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={onOpenGenerateMaterial}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium transition shadow-lg shadow-purple-600/25"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Deck</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 relative z-10">
        {/* Total Documents */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Documents</span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {loading ? '...' : stats?.total_documents ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats?.indexed_documents ?? 0} indexed & ready
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Collections */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Collections</span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {loading ? '...' : stats?.total_collections ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Subject & semester folders</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Indexing Status */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Vector Index</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              {loading ? '...' : stats?.indexed_documents ?? 0}
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats?.pending_documents ? `${stats.pending_documents} processing` : 'Vector search active'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* AI QA Questions */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI Queries</span>
            <div className="text-2xl font-bold text-cyan-400 mt-0.5">
              {loading ? '...' : stats?.total_questions_asked ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Grounded page citations</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Storage Quota */}
        <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Storage Quota</span>
            <span className="text-xs font-semibold text-slate-300">
              {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
            </span>
          </div>

          <div className="w-full bg-slate-700/80 rounded-full h-2 my-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isStorageNearLimit
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{percentUsed}% capacity used</span>
            {isStorageNearLimit && (
              <span className="text-amber-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3 h-3" /> Near limit
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
