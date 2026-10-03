import React from 'react';
import { useContextStore } from '../store/contextStore';
import { Plus, X, BookOpen, GitBranch, FileCode, FolderGit2, GraduationCap, FileText, Award } from 'lucide-react';
import { ContextType } from '../types';

const getContextIcon = (type: ContextType) => {
  switch (type) {
    case 'RESEARCH_PAPER':
    case 'RESEARCH_PROJECT':
      return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
    case 'GITHUB_REPO':
      return <FolderGit2 className="w-3.5 h-3.5 text-slate-700" />;
    case 'GITHUB_FILE':
      return <FileCode className="w-3.5 h-3.5 text-emerald-600" />;
    case 'COURSE':
    case 'LESSON':
      return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
    case 'DOCUMENT':
      return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    default:
      return <Award className="w-3.5 h-3.5 text-purple-600" />;
  }
};

export const ContextChipsBar: React.FC = () => {
  const { selectedContexts, removeContext, setSelectorOpen, clearContexts } = useContextStore();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border-b border-slate-200 text-xs">
      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mr-1">
        Active Context:
      </span>

      {selectedContexts.map((ctx) => (
        <span
          key={ctx.id}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-800 shadow-2xs hover:border-slate-400 transition-colors"
        >
          {getContextIcon(ctx.type)}
          <span className="font-medium max-w-[150px] truncate" title={ctx.title}>
            {ctx.title}
          </span>
          <button
            onClick={() => removeContext(ctx.id)}
            className="text-slate-400 hover:text-rose-500 rounded-full transition-colors ml-0.5"
            title="Remove context"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={() => setSelectorOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add Context
      </button>

      {selectedContexts.length > 0 && (
        <button
          onClick={clearContexts}
          className="text-slate-400 hover:text-slate-600 text-[11px] underline ml-auto cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
  );
};
